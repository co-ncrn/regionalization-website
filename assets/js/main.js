
/**
 *	Select MSA script to test API
 *	@author Owen Mundy
 */


var domain = "regionalization-website/",				// will eventually be domain name
	msas = {}, 											// all the MSAs
	current = { "msa":"", "scenario":"", "data":"" },	// object to store current data reference
	api_url = "http://localhost/api/"					// api url
	//api_url = "http://207.38.84.184/api/"			// remote api url
	;


$(document).ready(function(){

	// define chosen() options
	$("#msa_select_box").chosen({
		disable_search_threshold: 10,
		no_results_text: "Oops, nothing found!",
		width: "95%"
	});
	$("#scenario_select_box").chosen({
		disable_search_threshold: 10,
		no_results_text: "Oops, nothing found!",
		width: "95%"
	});
	// on chosen() change events
	$('#msa_select_box').on('change', function(evt, params) {
		dataChange("menu",params.selected,current.scenario,current.data);
	});
	$('#scenario_select_box').on('change', function(evt, params) {
		if (parseScenario(params.selected))
			dataChange("menu",current.msa,current.scenario,current.data);
	});
	init(); // load data, map, page
});


/**
 *	Initialize page
 */
function init(){
	
	// get _metadata for menus, etc.
	d3.json(api_url+ "_metadata", function(error, json) {
		if (error) return console.warn(error);	// handle error
		msas = json.response; 					// update MSAs
		//console.log(data);
		$("#output").val( "all MSAs: \n"+ JSON.stringify(msas) );
		createMSAMenu(json.response); 			// create MSA menu
	});	
}





/**
 *	Controls all changes to data displayed
 */
function dataChange(origin,msa,scenario,data){
	if (!prop(origin)) return; // origin required
	console.log("dataChange()",origin,msa,scenario,data);
	console.log(" --> current data ", JSON.stringify(current) +" --> current URL ", JSON.stringify(getUrlPath()) );

	// should we update?
	var updateMSA, updateScenario, updateData;


	// 1. HANDLE INCOMING

	// a. compare against current msa
	if (prop(msa)){
		current.msa = msa;		// update current
		updateMSA = true;
	}
	// b. compare against current scenario
	if (prop(scenario) && scenario != current.scenario){
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
		mns.zoomToMSAonMap(msa);	// update MSA displayed on map
		updateTitle();			// update title
		if (origin != "load") updateURL(); 	// update URL bar 
	}
	if (updateMSA){
		if (origin != "menu") updateMSAMenu(msa); // update selected MSA in dropdown
		updateScenarioMenu(msa);	// update scenario menu
	}
	if (updateScenario){
	}
	if (updateMSA || updateScenario && updateData){
		mns.loadTractLayer(current.msa,"data/tracts/topojson_quantized_1e6/"+ current.msa +"_tract.topojson");
	}


	console.log(" --> current data ", JSON.stringify(current) +" --> current URL ", JSON.stringify(getUrlPath()) );
}

//console.log("getUrlPath()",JSON.stringify(getUrlPath()) )
function checkForCurrentPage(){
	var path = getUrlPath();
	console.log("checkForCurrentPage()",JSON.stringify(getUrlPath()) )

	if (path.msa && path.scenario && path.data){
		current.msa = path.msa;
		current.scenario = path.scenario;
		current.data = path.data;
		dataChange("load",current.msa,current.scenario,current.data);
	}
	else if (path.msa) {
		current.msa = path.msa;
		dataChange("load",current.msa);
	}
}













/**
 *	Update URL
 */
function updateURL(){
	//var state = {};

	var url = "";

	if (prop(current.msa)){
		url += ""+ current.msa;
		//state.msa = current.msa;
	}
	if (prop(current.scenario)) {
		url += "/"+ current.scenario;
		//state.scenario = current.scenario;
	}
	if (prop(current.data)) {
		url += "/"+ current.data;
		//state.data = current.data;
	}
	//console.log("url",url)

	// push the state to the browser
	window.history.pushState( null, 'TITLE New URL: '+url, url);
}
// if user clicks back/forward button then check the page again
window.onpopstate = function(event) {    
    if(event && event.state) {
        //location.reload(); 
        checkForCurrentPage();
    }
}













function getUrlPath() {
    var fullpath = window.location.pathname,
    	page = [],
    	location = {};
 
 	// split on domain (the working directory || domain name)
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
    return location;
}



/* MENU
*********************************************************************************************************/

/**
 *	Build the MSA menu when the page loads
 */
function createMSAMenu(json){
	// default empty value in select menus
	var msa_options = "<option val=''></option>";	
	// loop through msas
	for (var key in json) {
	    if (!json.hasOwnProperty(key)) continue;	// skip loop if the property is from prototype
	   	//console.log(key,data[key])
	    // add MSAs to select options
		msa_options += optionHTML(key, key +" - "+ json[key][0].description);
	}
	$("#msa_select_box").append( msa_options ).trigger('chosen:updated'); // update select

	//addTempMSAmarkers(); // temp
	checkForCurrentPage(); // now that the MSA menu is set, should we display a page based on url?
}

/**
 *	Update MSA - Propogates the MSA across the title, menu, chart, and map

function updateMSA(msa,origin){
	console.log("updateMSA()", msa, origin);

	
	//updateChart(msa);			// update d3 data
} */
/**
 *	Update MSA dropdown
 */
function updateMSAMenu(msa){
	console.log("updateMSAMenu()", msa);
	$("#msa_select_box").val(msa).trigger('chosen:updated');;
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
function updateScenarioMenu(msa){
	console.log("updateScenarioMenu()", msa, msas[msa]);

	$("#output").val( msa +": \n"+ JSON.stringify(msas[msa]) ); // testing

//	console.log(msas[msa][0])
	currentData = msas[msa][0];

	// use msa to update the scenario box
	var scenario_options = "<option val=''></option>";

	// for each scenario
	for (var i = 0; i <  msas[msa].length; i++) {
		//console.log( msas[msa][i]);

		var scenario = msas[msa][i].scenario;

		// add optiongroup with scenario
		scenario_options += "<optgroup label='"+ dataDict[ scenario ] +"'>";

		// for each data type
		for (var j = 0; j <  msas[msa][i].data.length; j++) {
			//console.log( msas[msa][i].data[j]);

			var data = msas[msa][i].data[j];



			// add scenario
			scenario_options += optionHTML(scenario +"-"+ data, dataDict[data]);
		}
		scenario_options += "</optgroup>";
	}

	// update options
	$("#scenario_select_box").append( scenario_options ).trigger('chosen:updated');
 	// trying to open it... :-P
	$('#scenario_select_box').trigger('chosen:open');

}
function optionHTML(val,text){
	var option = "";
	option += "<option value='"+ val +"'>"+ text +"</option>";
	return option;
}







/**
 *	Update Scenario and Data - Propogates across the title, menu, chart, and map
 */
function parseScenario(params){
	// split the params from the dropdown
	var p = params.split("-");
	if (p.length == 2){
		current.scenario = p[0];
		current.data = p[1];
		return current;
	} 
}
/**
 *	Get data from server
 */
function getData(){
	// 
	d3.json(api_url + current.msa +"/"+ current.scenario +"/"+ current.data, function(error, json) {
		if (error) return console.warn(error);		// handle error
		//console.log(data);
		$("#output").val( JSON.stringify(current) +": \n"+ JSON.stringify(json.response) );


	});
}








