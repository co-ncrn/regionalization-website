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
	numberTracts = 0;





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

function init() {
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
	if (origin == "load") {
		// if there is an msa
		if (prop(newLocation) && newLocation.msa) {
			// .. and data
			if (prop(newLocation.scenario) && prop(newLocation.data)) {
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
		if (prop(newLocation.msa) && newLocation.msa != Page.location.msa) {
			updateMSA = true;
		}
		// if new scenario
		if (prop(newLocation.scenario) && newLocation.scenario != Page.location.scenario) {
			updateScenario = true;
		}
		// if new data
		if (prop(newLocation.data) && newLocation.data != Page.location.data) {
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
	console.log(" -> action = " + action, updateMSA, updateScenario, updateData);

	// save location
	Page.setLocation(newLocation);



	// menu updated, ...
	if ((updateScenario || updateData) || (updateMSA && prop(Page.location.scenario))) {
		Data.getScenario(newLocation); // do this before any map work
	}

	// if new msa
	if (updateMSA) {
		// update scenario menu
		Menu.newScenarioMenu(Page.location.msa);
		// if map is loaded
		if (origin != "load"){
			// zoom to MSA on map
			Mns.zoomToMSAonMap(Page.location.msa, "dataChange");
		}
	}



	// if new msa or scenario
	if (updateMSA && updateScenario) {
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



	if (updateData || tractOrRegion != "" || estimateOrMargin != "") {
		// if data or tractOrRegion changes then update scales
		Chart.updateChartScales();
	}


	// non-essential

	// if any change
	if ((updateMSA || updateScenario || updateData)) {
		// update title
		Page.updateTitle();
		// update URL
		if (origin != "load") {
			console.log(" -> Page.updateUrl('add')", newLocation);
			Page.updateUrl('add', newLocation);
		}
	}


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
