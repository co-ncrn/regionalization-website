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
	numberTracts = 0
	;





// 1. load msas
// 2. create MSA menu
// 3. check for current page
// 4. create Scenarios menu




/**
 *	Initialize page, get data
 */
$(function() {
	init();
});
function init(){
	console.log("init()");

	// get _metadata for menus
	d3.json(Site.rootDir + "data/msas.json", function(error, json) {
		if (error) return console.warn(error); // handle error
		msas = json; // update MSAs

		if (Site.debug) console.log(" -> msas loaded");
		if (Site.debug) $("#rawDataOutput").val("all MSAs: \n" + JSON.stringify(msas));


		// Table.resize(); // get initial table size
		// setTimeout(Table.resize, 1000); // and do it again once data is set

		// add listeners
		Menu.addListeners();
		Page.addListeners();

		// create MSA menu
		Menu.newMsaMenu(msas);

		// create map
		Mns.createMap();

		// create chart
		Chart.createChart();

		// check url to see if we should display a page
		Page.initCheckUrlForScenario();
	});
}






/**
 *	Controls all changes to data displayed
 */
function dataChange(origin, newLocation, tractOrRegion, estimateOrMargin) {
	if (!prop(origin)) return; // origin required
	if (Site.debug) console.log("\ndataChange()", origin);
	if (Site.debug) console.log(" -> Page.location ", Page.location);
	if (Site.debug) console.log(" -> newLocation =", newLocation);

	// what should we update?
	let action = "",
		updateMSA = false,
		updateScenario = false,
		updateData = false;

	// if page is loading for first time
	if (origin == "load"){
		// if there is an msa
		if (prop(newLocation) && newLocation.msa){
			// .. and data
			if (prop(newLocation.scenario) && prop(newLocation.data)){
				// update everything
				action = "update everything";
				updateMSA = true;
				updateScenario = true;
				updateData = true;
			} else {
				// else updata msa only
				action = "update only msa";
				updateMSA = true;
			}
		}
	}
	// if the change came from the form, map, or table
	else {
		// if new msa
		if (prop(newLocation.msa ) && newLocation.msa != Page.location.msa){
			updateMSA = true;
		}
		// if new scenario
		if (prop(newLocation.scenario) && newLocation.scenario != Page.location.scenario){
			updateScenario = true;
		}
		// if new data
		if (prop(newLocation.data) && newLocation.data != Page.location.data){
			updateScenario = true;
		}


		//
		// } else {
		// 	// else update msa only
		// 	action = "update only msa";
		// 	updateMSA = true;
		// 	// use current scenario and data with new msa
		// 	newLocation.scenario = Page.location.scenario;
		// 	newLocation.data = Page.location.data;
		// }
	}
	console.log(" -> action = "+action, updateMSA, updateScenario, updateData);



	// save location
	//if (Site.debug) console.log(" -> Page.location ", Page.location);
	// Page.location.msa = newLocation.msa;
	// Page.location.scenario = newLocation.scenario;
	// Page.location.data = newLocation.data;
	Page.setLocation(newLocation);
	//if (Site.debug) console.log(" -> Page.location ", Page.location, " -> AFTER SAVING");



	// menu updated, ...
	if ((updateScenario || updateData) || (updateMSA && prop(Page.location.scenario))) {
		Data.getScenario(newLocation); // do this before any map work
	}
	// if any change
	if ((updateMSA || updateScenario || updateData)) {
		// update title
		Page.updateTitle();
		// update URL
		if (origin != "load"){
			console.log(" -> Page.updateUrl('add')",newLocation);
			Page.updateUrl('add',newLocation);
		}
	}
	// if new msa
	if (updateMSA){
		// update scenario menu
		Menu.newScenarioMenu(Page.location.msa);
		// if map is loaded
		if (origin != "load")
			// zoom to MSA on map
			Mns.zoomToMSAonMap(Page.location.msa,"dataChange");
	}



	// if new msa or scenario
	if (updateMSA && updateScenario){
		// load msa tracts topojson
		Mns.loadTractLayerData(Page.location.msa);
	}
	// else only the scenario has changed
	else if (!updateMSA && updateScenario) {
		// update scenario menu
		//Menu.newScenarioMenu(Page.location);
	}
	// if origin is anything but "menu"
	if (origin != "menu" && updateMSA) {
		// then update selected MSA in dropdown
		Menu.setMsaMenu(Page.location.msa);
	}


return;



	// // 1. HANDLE INCOMING
	// // user clicks msa on map || user selects scenario dropdown while msa selected
	//
	// // a. compare against msa
	// if (prop(newLocation.msa) && newLocation.msa != Page.location.msa) {
	// 	Page.location.msa = newLocation.msa;
	// 	updateMSA = true;
	// }
	// // b. compare against scenario
	// if ((prop(newLocation.scenario) && newLocation.scenario != Page.location.scenario) || (newLocation.msa != Page.location.msa)) {
	// 	Page.location.scenario = newLocation.scenario;
	// 	updateScenario = true;
	// }
	// // c. compare against Page.location data
	// if (prop(newLocation.data) && newLocation.data != Page.location.data) {
	// 	Page.location.data = newLocation.data;
	// 	updateData = true;
	// }



	// 2. HANDLE CHANGES







	if (updateData || tractOrRegion != "" || estimateOrMargin != "") {
		// if data or tractOrRegion changes then update scales
		//		updateChartScales();
	}


	if (Site.debug) console.log(" -> Page.location2 ", JSON.stringify(Page.location));
}











/**
 *	Update Debugger
 */
function updateDebug() {
	var str = "Debugging: " + Page.location.msa + ":" + Page.location.scenario + ":" + Page.location.data +
		"; numberTracts=" + numberTracts +
		//"; numberChartTIDs="+ d3.selectAll(".tid").size() +
		"; tractOrRegion=" + tractOrRegion +
		"; estimateOrMargin=" + estimateOrMargin;
	//$(".debug").html(str);
	console.log("updateDebug() ->", str);
}






function optionHTML(val, text) {
	var option = "";
	option += "<option value='" + val + "'>" + text + "</option>";
	return option;
}








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
