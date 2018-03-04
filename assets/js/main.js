/*jshint esversion: 6 */
/**
 *	Main.js - last file to load, starts everything
 *	@author Owen Mundy
 */



var msas = {}, // all the MSAs
	current = {
		"msa": "",
		"scenario": "",
		"data": ""
	}, // current scenario path
	currentScenario = {}, // current scenario data, once loaded
	currentScenarioTIDs = {},
	currentScenarioArray = [],
	tractOrRegion = "t",
	estimateOrMargin = "e",
	numberTracks = 0;









$(function() {
	init();
});


/**
 *	Initialize page, get data
 */
function init() {
	console.log("init()")

	Menu.addListeners();


	// Table.resize(); // get initial table size
	// setTimeout(Table.resize, 1000); // and do it again once data is set



	// get _metadata for menus, etc.
	//d3.json(Site.dataDir+ "_metadata", function(error, json) { // from API
	d3.json(Site.rootDir + "data/msas.json", function(error, json) { // flat JSON file
		if (error) return console.warn(error); // handle error
		msas = json; // update MSAs
		if (Site.debug) console.log("init() -> d3.json -> msas = ", msas);
		if (Site.debug) $("#rawDataOutput").val("all MSAs: \n" + JSON.stringify(msas));
		Menu.createMSA(msas); // create MSA menu
	});
}





/**
 *	Controls all changes to data displayed
 */
function dataChange(origin, msa, scenario, data, tractOrRegion, estimateOrMargin) {
	if (!prop(origin)) return; // origin required
	if (Site.debug) console.log("\n\ndataChange()", origin, msa, scenario, data);
	if (Site.debug) console.log(" -> current data ", JSON.stringify(current) + " -> current URL ", JSON.stringify(Page.getScenarioFromUrl()));

	// should we update?
	var updateMSA, updateScenario, updateData;


	// 1. HANDLE INCOMING
	// user clicks msa on map || user selects scenario dropdown while msa selected

	// a. compare against current msa
	if (prop(msa) && msa != current.msa) {
		current.msa = msa;
		updateMSA = true;
	}
	// b. compare against current scenario
	if ((prop(scenario) && scenario != current.scenario) || (msa != current.msa)) {
		current.scenario = scenario;
		updateScenario = true;
	}
	// c. compare against current data
	if (prop(data) && data != current.data) {
		current.data = data;
		updateData = true;
	}



	// 2. HANDLE CHANGES

	if (updateMSA || updateScenario) {
		//updateTitle();								// update title
	}
	// menu updated, ...
	if ((updateScenario || updateData) || (updateMSA && prop(current.scenario))) {
		console.log("about to call getScenarioData()")
		getScenarioData(); // do this before any map work
	}
	if (updateMSA) {
		// if origin is anything but "menu"
		if (origin != "menu")
			// then update selected MSA in dropdown
			$("#msa_select_box").val(msa).trigger('chosen:updated');
		// update scenario menu
		updateScenarioMenu(msa);
		// load msa tracts topojson
		mns.loadTractLayerData(current.msa, Site.rootDir + "data/tracts/topojson_quantized_1e6/" + current.msa + "_tract.topojson");
	}
	if (updateScenario) {
		// update scenario menu
		updateScenarioMenu(msa, scenario, data);
	}
	if (updateMSA || updateScenario || updateData) {
		// if origin is anything but "load" then update URL bar
		if (origin != "load") Page.updateUrl('add');
	}

	if (updateData || tractOrRegion != "" || estimateOrMargin != "") {
		// if data or tractOrRegion changes then update scales
		updateChartScales();
	}


	if (Site.debug) console.log(" -> current data ", JSON.stringify(current) + " -> current URL ", JSON.stringify(Page.getScenarioFromUrl()));
}














/**************************************************************************
 *																		  *
 * 	MENU				 												  *
 *																		  *
 **************************************************************************/





/**
 *	Update Title
 */
function updateTitle() {
	$("h1").html(current.msa + ":" + current.scenario + ":" + current.data)
}

/**
 *	Update Debugger
 */
function updateDebug() {
	var str = "Debugging: " + current.msa + ":" + current.scenario + ":" + current.data +
		"; numberTracks=" + numberTracks +
		//"; numberChartTIDs="+ d3.selectAll(".tid").size() +
		"; tractOrRegion=" + tractOrRegion +
		"; estimateOrMargin=" + estimateOrMargin;
	//$(".debug").html(str);
	console.log("updateDebug() ->", str);
}


var currentData = null;



/**
 *	Build the scenario menu based on MSA selection
 */
function updateScenarioMenu(msa, scenario, data) {
	if (Site.debug) console.log(" -> updateScenarioMenu()", msa);

	if (Site.debug) $("#rawDataOutput").val(msa + ": \n" + JSON.stringify(msas[msa])); // testing

	//if (Site.debug) console.log(msas[msa][0])
	currentData = msas[msa][0];

	// use msa to update the scenario box
	var scenario_options = "<option val=''></option>";

	// for each scenario
	for (var i = 0; i < msas[msa].length; i++) {
		//if (Site.debug) console.log( msas[msa][i]);

		var scenario = msas[msa][i].scenario;

		// add optiongroup with scenario
		scenario_options += "<optgroup label='" + dataDict[scenario] + "'>";

		// for each data type
		for (var j = 0; j < msas[msa][i].data.length; j++) {
			//if (Site.debug) console.log( msas[msa][i].data[j]);

			var data = msas[msa][i].data[j];

			// add scenario
			scenario_options += optionHTML(scenario + "-" + data, dataDict[data]);
		}
		scenario_options += "</optgroup>";
	}

	// update options
	$("#scenario_select_box").append(scenario_options).trigger('chosen:updated');

	// if scenario/data then set it
	if (prop(scenario)) {
		//if (Site.debug) console.log("scenario",current.scenario +"-"+ current.data);
		$("#scenario_select_box").val(current.scenario + "-" + current.data).trigger('chosen:updated');
	}
	// otherwise open it for input
	else {
		$('#scenario_select_box').trigger('chosen:open');
	}


}

function optionHTML(val, text) {
	var option = "";
	option += "<option value='" + val + "'>" + text + "</option>";
	return option;
}







/**
 *	Get data from server
 */
function getScenarioData() {
	var url = Site.rootDir + "/data/scenarios/" + current.msa + "_" + current.scenario + "_" + current.data + ".json";
	if (Site.debug) console.log("getScenarioData()", url);
	d3.json(url, function(error, json) {
		if (error) return console.error(error); // handle error
		console.log("!!!!!!!!!!!!!!getScenarioData() -> json = ", json);





		// DO I STILL NEED THIS?
		//		data = remove_rows(data,"inf"); 		// remove rows with "inf" (infinity)

		// data has arrived
		// currentScenario = cleanData(json.response);			// DELETE

		console.log("currentScenarioArray, json", currentScenarioArray)
		currentScenario = json;
		currentScenarioArray = d3.entries(currentScenario);
		numberTracks = currentScenarioArray.length;

		updateChart(); // update chart (and eventually map, from chart.js)

		// testing
		if (Site.debug) $("#rawDataOutput").val(JSON.stringify(json).replace("},", "},\n"));
	});
}


// /**
//  *	Get data from server
//  */
// function getScenarioDataAPI(){
// 	var url = Site.dataDir + current.msa +"/"+ current.scenario +"/"+ current.data;
// 	if (Site.debug) console.log("getScenarioData()", url);
// 	d3.json(url, function(error, json) {
// 		if (error) return console.warn(error);		// handle error
// 		if (Site.debug) console.log(json.response);
//
// 		currentScenario = cleanData(json.response);			// clean data
//
// 		updateChart();								// update chart
//
// 		// testing
// 		if (Site.debug) $("#rawDataOutput").val( JSON.stringify(current) +": \n"+ JSON.stringify(json.response) );
// 	});
// }


/**
 *	Pad floating point values to be four numbers long
 */
function padFloat(num) {
	var str = "" + num;
	// confirm num is float
	if (str.indexOf(".") !== 1) return str;
	// pad float depending on length
	if (str.length <= 3) {
		str = str + "000";
	} else if (str.length <= 4) {
		str = str + "00";
	} else if (str.length <= 5) {
		str = str + "0";
	}
	return str;
}


/**
 *	Clean data from API (need to eventually make these changes permanent in DB)
 */
function cleanData(data) {
	if (Site.debug) console.log("cleanData() -> current = ", current);
	/*
		// data fixing
		data.forEach(function(row,i) {
			if (Site.debug) console.log("i=",i," // row = ",row);

			// now on server
			// remove g from TID
			//data[i].TID = data[i].TID.replace("g","");



			// store names in row so easier to reference
			data[i].tractError = parseFloat(row[ "t_"+ current.data + "M" ]);
			data[i].tractEstimate = parseFloat(row[ "t_"+ current.data + "E" ]);
			data[i].regionError = parseFloat(row[ "r_"+ current.data + "M" ]);
			data[i].regionEstimate = parseFloat(row[ "r_"+ current.data + "E" ]);


			// round errors, estimates
			data[i].tractError = roundDecimal(data[i].tractError);
			data[i].regionError = roundDecimal(data[i].regionError);
			data[i].tractEstimate = roundDecimal(data[i].tractEstimate);
			data[i].regionEstimate = roundDecimal(data[i].regionEstimate);

			// create TRACT scale (a min / max for each TRACT)
			// this will be the scale for the axis as well so the change will be obvious
			data[i].tractErrorMin = data[i].tractEstimate - data[i].tractError;
			data[i].tractErrorMax = data[i].tractEstimate + data[i].tractError;

			// create REGION scale (a min / max for each REGION)
			data[i].regionErrorMin = data[i].regionEstimate - data[i].regionError;
			data[i].regionErrorMax = data[i].regionEstimate + data[i].regionError;

			// round min, max
			data[i].tractErrorMin = roundDecimal(data[i].tractErrorMin);
			data[i].tractErrorMax = roundDecimal(data[i].tractErrorMax);
			data[i].regionErrorMin = roundDecimal(data[i].regionErrorMin);
			data[i].regionErrorMax = roundDecimal(data[i].regionErrorMax);

		});


	*/
	// save them by TID
	//	currentScenarioTIDs = {};
	data.forEach(function(row, i) {
		//currentScenarioTIDs[ row.TID ] = row;
		console.log("cleanData() -> row = ", row);
	});
	//if (Site.debug)
	console.log("cleanData() -> currentScenarioTIDs = ", currentScenarioTIDs);


	return data;
}
/**
 *	Round decimal according to size
 */
function roundDecimal(num) {

	var decimal = 1000;

	if (num > 1000) {
		decimal = 1;
	} else if (num > 100) {
		decimal = 10;
	} else if (num > 10) {
		decimal = 10;
	} else if (num > 1) {
		decimal = 1000;
	} else if (num > 0.1) {
		decimal = 1000;
	} else if (num > 0.01) {
		decimal = 1000;
	}
	num = Math.round(num * decimal) / decimal;
	return num;
}






//$('#toggle_fullscreen').on('click',
var toggle_fullscreen = function() {
	// if already full screen; exit
	if (
		document.fullscreenElement ||
		document.webkitFullscreenElement ||
		document.mozFullScreenElement ||
		document.msFullscreenElement
	) {
		if (document.exitFullscreen) {
			document.exitFullscreen();
		} else if (document.mozCancelFullScreen) {
			document.mozCancelFullScreen();
		} else if (document.webkitExitFullscreen) {
			document.webkitExitFullscreen();
		} else if (document.msExitFullscreen) {
			document.msExitFullscreen();
		}
	}
	// else go fullscreen
	else {
		element = $('#presentation').get(0);
		if (element.requestFullscreen) {
			element.requestFullscreen();
		} else if (element.mozRequestFullScreen) {
			element.mozRequestFullScreen();
		} else if (element.webkitRequestFullscreen) {
			element.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
		} else if (element.msRequestFullscreen) {
			element.msRequestFullscreen();
		}
	}
};


loaded = true;
