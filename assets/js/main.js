
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
		updateMSA(params.selected,"menu");
	});
	$('#scenario_select_box').on('change', function(evt, params) {
		updateData(params);
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


function getPath() {
    var fullpath = window.location.pathname,
    	page = [],
    	location = {};
 
 	// split on domain (the working directory or domain name)
    if (fullpath.indexOf(domain) != -1) {
    	// get everything after domain
        page = fullpath.split(domain)[1];
        // remove any trailing slashes
        page = page.replace(/\/$/, "").trim();
        // if data there
        if (page != ""){
        	// then there must be msa + data
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
//console.log("getPath()",JSON.stringify(getPath()) )
function checkForCurrentPage(){
	var path = getPath();
	console.log("checkForCurrentPage()",JSON.stringify(getPath()) )
	if (path.msa) 
		if (path.scenario)
			if (path.data) 
				updateData(path.msa,path.scenario,path.data,"load");
		else updateScenario(path.msa,path.scenario,"load");
	else updateMSA(path.msa,"load");
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
 */
function updateMSA(msa,origin){
	console.log("updateMSA()", msa, origin);
	current.msa = msa;			// update current obj
	if (origin && origin != "menu")	
		updateMSAMenu(msa);		// update selected MSA in dropdown
	updateTitle(msa);			// update title
	if (origin && origin != "load")
		updateURL(msa);				// update URL bar 
	updateScenarioMenu(msa);	// update scenario menu
	//updateChart(msa);			// update d3 data
	zoomToMSAonMap(msa);		// update MSA displayed on map
}
/**
 *	Update MSA dropdown
 */
function updateMSAMenu(msa){
	console.log("updateMSAMenu()", msa);
	$("#msa_select_box").val(msa).trigger('chosen:updated');;
}




/**
 *	Update URL
 */
function updateURL(msa,scenario,data){
	//var state = {};

	var url = "";
	console.log(url)
	if (msa){
		url += ""+ msa;
		//state.msa = msa;
	}
	console.log(url)
	if (data) {
		url += "/"+ data;
		//state.data = data;
	}
	console.log(url)


	window.history.pushState( null, 'TITLE New URL: '+url, url);


}
/**
 *	Update Title
 */
function updateTitle(msa){
}





/**
 *	Build the scenario menu based on MSA selection
 */
function updateScenarioMenu(msa){
	console.log("updateScenarioMenu()", msa, msas[msa]);

	$("#output").val( msa +": \n"+ JSON.stringify(msas[msa]) ); // testing

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



function updateData(params){
	var p = params.selected.split("-");
	current.scenario = p[0];
	current.data = p[1];
	console.log("updateData() called", current);

	//if (!current || !current.msa || !current.scenario || !current.data)
	//	return false;

	// get data from server
	d3.json(api_url + current.msa +"/"+ current.scenario +"/"+ current.data, function(error, json) {
		if (error) return console.warn(error);		// handle error
		//console.log(data);
		$("#output").val( JSON.stringify(current) +": \n"+ JSON.stringify(json.response) );


	});

}











