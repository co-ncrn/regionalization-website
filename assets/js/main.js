
/**
 *	Main.js - last file to load, starts everything
 *	@author Owen Mundy
 */



var msas = {}, 											// all the MSAs
	current = { "msa":"", "scenario":"", "data":"" }	// current scenario path
	currentScenario = {},							// current scenario data, once loaded
	currentScenarioTIDs = {},	
	currentScenarioArray = [],	
	tractOrRegion = "t",
	websiteName = "ACS Regionalization",
	MAIN_DEBUG = false
	;



$(document).ready(function(){

	// define chosen() options
	$("#msa_select_box").chosen({
		search_contains: true, // start search anywhere in the word
		disable_search_threshold: 10,
		no_results_text: "Oops, nothing found!",
		width: "95%"
	});
	$("#scenario_select_box").chosen({
		search_contains: true,
		disable_search_threshold: 10,
		no_results_text: "Oops, nothing found!",
		width: "95%"
	});
	// on chosen() change events
	$('#msa_select_box').on('change', function(evt, params) {
		dataChange("menu",params.selected,current.scenario,current.data);
	});
	$('#scenario_select_box').on('change', function(evt, params) {
		if (MAIN_DEBUG) console.log("params.selected",params.selected);
		// split the params from the dropdown
		var p = params.selected.split("-");
		if (p.length == 2){
			//if (MAIN_DEBUG) console.log( p.toString())
			dataChange("menu",current.msa,p[0],p[1]);
		} 
	});
	init();
});


/**
 *	Initialize page, get data
 */
function init(){
	
	// get _metadata for menus, etc.
	//d3.json(api_url+ "_metadata", function(error, json) { // from API
	d3.json(rootDir + "data/msas.json", function(error, json) { // flat JSON file
		if (error) return console.warn(error);	// handle error
		msas = json; 							// update MSAs
		if (MAIN_DEBUG) console.log("init() --> msas = ",msas);
		$("#output").val( "all MSAs: \n"+ JSON.stringify(msas) );
		createMSAMenu(msas); 			// create MSA menu
	});	
}





/**
 *	Controls all changes to data displayed
 */
function dataChange(origin,msa,scenario,data,tractOrRegion){
	if (!prop(origin)) return; // origin required
	if (MAIN_DEBUG) console.log("\n\ndataChange()",origin,msa,scenario,data);
	if (MAIN_DEBUG) console.log(" --> current data ", JSON.stringify(current) +" --> current URL ", JSON.stringify(getUrlPath()) );

	// should we update?
	var updateMSA, updateScenario, updateData;


	// 1. HANDLE INCOMING
	// user clicks msa on map || user selects scenario dropdown while msa selected

	// a. compare against current msa
	if (prop(msa) && msa != current.msa){
		current.msa = msa;
		updateMSA = true;
	}
	// b. compare against current scenario
	if ( (prop(scenario) && scenario != current.scenario) || (msa != current.msa) ){
		current.scenario = scenario;
		updateScenario = true;
	}
	// c. compare against current data
	if (prop(data) && data != current.data){
		current.data = data;
		updateData = true;
	}



	// 2. HANDLE CHANGES

	if (updateMSA || updateScenario){
		//updateTitle();								// update title
	}
	// menu updated, ...
	if ((updateScenario || updateData) || (updateMSA && prop(current.scenario))){
		getScenarioData(); // do this before any map work
	}
	if (updateMSA){
		// if origin is anything but "menu" 
		if (origin != "menu") 
			// then update selected MSA in dropdown
			$("#msa_select_box").val(msa).trigger('chosen:updated'); 
		// update scenario menu
		updateScenarioMenu(msa); 
		// load msa tracts topojson
		mns.loadTractLayerData(current.msa, rootDir + "data/tracts/topojson_quantized_1e6/"+ current.msa +"_tract.topojson");
	}
	if (updateScenario){
		// update scenario menu
		updateScenarioMenu(msa,scenario,data); 		
	}
	if (updateMSA || updateScenario || updateData){
		// if origin is anything but "load" then update URL bar 
		if (origin != "load") updateUrl('add');		
	}

	if (updateData || tractOrRegion != ""){
		// if data or tractOrRegion changes then update scales
		updateChartScales();
	}


	if (MAIN_DEBUG) console.log(" --> current data ", JSON.stringify(current) +" --> current URL ", JSON.stringify(getUrlPath()) );
}


/**
 *	Checks to see if there is a current page to load
 */
//console.log("getUrlPath()",JSON.stringify(getUrlPath()) )
function checkForCurrentPage(){
	var path = getUrlPath();
	if (MAIN_DEBUG) console.log(" --> checkForCurrentPage() path = ",JSON.stringify(path) )

	if (path.msa && path.scenario && path.data){
		dataChange("load",path.msa,path.scenario,path.data);
	}
	// only the msa is set
	else if (path.msa) {
		dataChange("load",path.msa);
	}
}




/**
 *	update URL - Be careful, because as you do the root of the site changes
 */
function updateUrl(change){

	// bind to StateChange Event
	History.Adapter.bind(window,'statechange',function(){ 
		var State = History.getState();
	});

	var url = "";

	if (prop(current.msa))
		url += ""+ current.msa;
	if (prop(current.scenario)) 
		url += "/"+ current.scenario;
	if (prop(current.data)) 
		url += "/"+ current.data;

	// change state
	if (change == 'add'){
		// data
		History.replaceState({state:1}, websiteName +" - "+ url, rootDir + url);
	} else {
		// default
		History.replaceState({state:0}, websiteName + "", rootDir);
	}
	
}
/**
 *	if user clicks back/forward button then check the page again
 */
window.onpopstate = function(event) {    
    if(event && event.state) {
        //location.reload(); 
        checkForCurrentPage();
    }
}




/**
 *	Return the params from the current URL
 */
function getUrlPath() {
    var fullpath = window.location.href, //window.location.pathname,
    	page = [],
    	location = {};
 
 	// split on domain (the working directory OR domain name)
    if (fullpath.indexOf(domain) != -1) {
    	// get everything after domain
        page = fullpath.split(domain)[1];
        // remove any trailing slashes
        page = page.replace(/\/$/, "").trim();
        // if data there
        if (page != ""){
        	// then there must be msa (and/or scenario and data)
	        if (page.indexOf("/") != -1) {
	        	// split on /
	        	var pages = page.split("/");
	        	// set vars
	        	if (pages[0]) location.msa = pages[0].trim();
	        	if (pages[1]) location.scenario = pages[1].trim();
	        	if (pages[2]) location.data = pages[2].trim();
	        }
	        else {
				location.msa = page.trim();
	        }
        } 
    }
	if (MAIN_DEBUG) console.log(" --> getUrlPath()",domain,fullpath,page,location);
    return location;
}











/**************************************************************************
 *																		  *
 * 	MENU				 												  *
 *																		  *
 **************************************************************************/

/**
 *	Build the MSA menu when the page loads
 */
function createMSAMenu(json){
	if (MAIN_DEBUG) console.log("--> createMSAMenu()")
	// default empty value in select menus
	var msa_options = "<option val=''></option>";	
	// loop through msas
	for (var key in json) {
	    if (!json.hasOwnProperty(key)) continue;	// skip loop if the property is from prototype
	   	//if (MAIN_DEBUG) console.log(key,data[key])
	    // add MSAs to select options
		msa_options += optionHTML(key, key +" - "+ json[key][0].description);
	}
	$("#msa_select_box").append( msa_options ).trigger('chosen:updated'); // update select

	//addTempMSAmarkers(); // temp
	checkForCurrentPage(); // now that the MSA menu is set, should we display a page based on url?
}






/**
 *	Update Title
 */
function updateTitle(){
	$("h1").html( current.msa +":"+ current.scenario +":"+ current.data)
}


var currentData = null;



/**
 *	Build the scenario menu based on MSA selection
 */
function updateScenarioMenu(msa,scenario,data){
	if (MAIN_DEBUG) console.log(" --> updateScenarioMenu()", msa);

	$("#output").val( msa +": \n"+ JSON.stringify(msas[msa]) ); // testing

	//if (MAIN_DEBUG) console.log(msas[msa][0])
	currentData = msas[msa][0];

	// use msa to update the scenario box
	var scenario_options = "<option val=''></option>";

	// for each scenario
	for (var i = 0; i <  msas[msa].length; i++) {
		//if (MAIN_DEBUG) console.log( msas[msa][i]);

		var scenario = msas[msa][i].scenario;

		// add optiongroup with scenario
		scenario_options += "<optgroup label='"+ dataDict[ scenario ] +"'>";

		// for each data type
		for (var j = 0; j <  msas[msa][i].data.length; j++) {
			//if (MAIN_DEBUG) console.log( msas[msa][i].data[j]);

			var data = msas[msa][i].data[j];

			// add scenario
			scenario_options += optionHTML(scenario +"-"+ data, dataDict[data]);
		}
		scenario_options += "</optgroup>";
	}

	// update options
	$("#scenario_select_box").append( scenario_options ).trigger('chosen:updated');

 	// if scenario/data then set it
	if (prop(scenario) ){
		//if (MAIN_DEBUG) console.log("scenario",current.scenario +"-"+ current.data);
		$("#scenario_select_box").val(current.scenario +"-"+ current.data).trigger('chosen:updated');
	} 
	// otherwise open it for input
	else {
		$('#scenario_select_box').trigger('chosen:open');
	}

	
}
function optionHTML(val,text){
	var option = "";
	option += "<option value='"+ val +"'>"+ text +"</option>";
	return option;
}







/**
 *	Get data from server
 */
function getScenarioData(){
	var url = rootDir + "/data/scenarios/" + current.msa +"_"+ current.scenario +"_"+ current.data +".json";
	if (MAIN_DEBUG) console.log("getScenarioData()", url);
	d3.json(url, function(error, json) {
		if (error) return console.warn(error);		// handle error
		console.log("getScenarioData() --> json = ",json);


// DO I NEED THIS?
//		data = remove_rows(data,"inf"); 		// remove rows with "inf" (infinity)

		// data has arrived
		// currentScenario = cleanData(json.response);			// DELETE
		currentScenario = json;
		currentScenarioArray = d3.entries(currentScenario); 

		updateChart(); // update chart
		if (mns.tractLayer)
			mns.updateMap(); // update map
		
		// testing
		$("#output").val( JSON.stringify(json).replace("},","},\n") );
	});
}


/**
 *	Get data from server
 */
function getScenarioDataAPI(){
	var url = api_url + current.msa +"/"+ current.scenario +"/"+ current.data;
	if (MAIN_DEBUG) console.log("getScenarioData()", url);
	d3.json(url, function(error, json) {
		if (error) return console.warn(error);		// handle error
		if (MAIN_DEBUG) console.log(json.response);

		currentScenario = cleanData(json.response);			// clean data

		updateChart();								// update chart
		
		// testing
		$("#output").val( JSON.stringify(current) +": \n"+ JSON.stringify(json.response) );
	});
}



/**
 *	Clean data from API (need to eventually make these changes permanent in DB)
 */
function cleanData(data){
	if (MAIN_DEBUG) console.log("cleanData() -> current = ",current);
/*
	// data fixing
	data.forEach(function(row,i) {
		if (MAIN_DEBUG) console.log("i=",i," // row = ",row);

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
	data.forEach(function(row,i) {
		//currentScenarioTIDs[ row.TID ] = row;
		console.log("cleanData() --> row = ",row);
	});
	//if (MAIN_DEBUG) 
		console.log("cleanData() --> currentScenarioTIDs = ",currentScenarioTIDs);


	return data;
}
/**
 *	Round decimal according to size
 */
function roundDecimal(num){

	var decimal = 1000;
	
	if (num > 1000) {		var decimal = 1;
	} else if (num > 100){ 	var decimal = 10;
	} else if (num > 10){	var decimal = 10;
	} else if (num > 1){	var decimal = 1000;
	} else if (num > .1){ 	var decimal = 1000;
	} else if (num > .01){ 	var decimal = 1000;
	}
	num = Math.round(num * decimal) / decimal;
	return num;
}





