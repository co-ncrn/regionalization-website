



/**************************************************************************
 *																		  *
 * 	INIT MAP															  *
 *																		  *
 **************************************************************************/

// Map NameSpace
var mns = new function() {



	var msaLayer = {},		// the map layer for all MSAs
		msaIndex = {},		// index of all MSA features for quick lookup

		tractLayer = {},	// reference to Topojson layer created by Leaflet
		tractTIDindex = {},	// reference to tracts by TID
		tractRIDindex = {}, // reference to tracts by RID

		lastMSAFeature = null,
		hideLastMSAFeatureTimeOut = null,
		MAP_DEBUG = false
		;


	// create Leaflet map
	var map = L.map('map', {
	    minZoom: 5,
	    maxZoom: 15,
	    zoomControl: true
	}).setView([35.243,-80.395], 7);

	var attribution = 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
			'<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
			'Imagery © <a href="http://mapbox.com">Mapbox</a>';

	L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
	    id: 'mapbox.light', // testing: 'mapbox.streets'
	    opacity: 0.7,
	    attribution: attribution,
	    accessToken: 'pk.eyJ1Ijoib3dlbm11bmR5IiwiYSI6ImNpd3o4M3dvejAxMHkyeW1neTQxMzlxamkifQ.mRigBfiIBYYqOMAftwkvbQ'
	}).addTo(map);


	L.easyButton('fa-arrows-alt fa-lg', function(btn, map){
		toggle_fullscreen();
	}).addTo(map);




/**************************************************************************
 *																		  *
 * 	MSAs															  	  *
 *																		  *
 **************************************************************************/

	/**
	 *	Load the MSA topojson and add it to the map
	 */
	function loadMSALayer(src) {
		//console.log("loadMSALayer()",src);

		d3.json(src, function(error, data) {		// use D3 to load JSON
			if (error) return console.warn(error);	// return if error

			msaLayer = new L.TopoJSON(data, {
				style: msaStyle,
			    onEachFeature: onEachMSAFeature
			});
			msaLayer.addTo(map);					// add layer to map
			if (prop(current.msa)) zoomToMSAonMap(current.msa); // if an msa is set then zoom to it
		});
	}
	// https://www.census.gov/geo/maps-data/data/cbf/cbf_msa.html
	loadMSALayer(Site.rootDir+"data/cb_2013_us_cbsa_500k_m1s_mapshaper-quantized.topojson");

	/**
	 *	Set events, etc. for each MSA feature
	 */
	function onEachMSAFeature(feature, layer) {
	    //console.log("onEachMSAFeature() feature = ",feature, " layer = ",layer)

		// reference to bounds of each MSA
		msaIndex[layer.feature.properties.GEOID] = {
			"bounds": layer.getBounds(),
			"msa":layer.feature.properties.GEOID
		}

		// store reference to feature
		if (feature.properties.GEOID == current.msa){
			lastMSAFeature = layer;
			console.log("store reference to feature",feature.properties.GEOID,current.msa,lastMSAFeature)
		}

		// add popup
		var popupHTML = '<h6 class="text-center">'+ feature.properties.NAME +'</h6>'+
						'<table>'+
						'<tr><td class="key">MSA Name:</td><td class="val">'+ feature.properties.NAME +'</td></tr>'+
						'<tr><td class="key">MSA/GEOID:</td><td class="val">'+ feature.properties.GEOID +'</td></tr>'+
						'</table>';
		layer.bindPopup(popupHTML,{closeButton: false, autoPan: false});

	    layer.on({
	        mouseover: 	highlightMSAFromMap,
	        mouseout: 	resetMSAStyle,
	        //mousemove: 	moveMSAPopup,
	        click: 		msaFeatureClicked
	    });
	}
	// highlight an MSA on the map
	function highlightMSAFromMap(e) {
	    var layer = e.target;
	    var _msa = msaIndex[layer.feature.properties.GEOID].msa;
	    //console.log("highlightMSAFromMap() layer = ",layer, " // msa = ",_msa)

	    // don't do anything if this is the current msa
	    if (_msa == current.msa) return;

	    // show info
		//info.update(layer.feature.properties);

		// if msa is not set then don't do this
		if (prop(current.msa) && current.msa != parseInt(_msa)){
		    layer.setStyle({
		        fillOpacity: 0.4
		    });
		}

		//layer.openPopup(); // centers popup
		var popup = e.target.getPopup(); // instead, set popup
	    popup.setLatLng(e.latlng).openOn(map); // at position of mouse

	    // track recently clicked layer
	    lastMSAFeature = layer;

	    if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
	        layer.bringToFront();
	    }
	}
	// reset msa style
	function resetMSAStyle(e) {
	    // don't do anything if this is the current msa
	    if (prop(e) && prop(e.feature) && e.feature.properties.GEOID == current.msa) return;

		console.log("resetMSAStyle() -> ",lastMSAFeature,"e",e);


		if (prop(e)){
			msaLayer.resetStyle(e.target);
			e.target.closePopup();
		}
		else if (lastMSAFeature != null) {
			msaLayer.resetStyle(lastMSAFeature);
			lastMSAFeature.closePopup();
		}
	}
	// hide an msa feature
	function hideLastMSAFeature(){
		console.log("hideLastMSAFeature() -> ",lastMSAFeature)
		if (prop(lastMSAFeature)) {
			//clearTimeout(hideLastMSAFeatureTimeOut);
			lastMSAFeature.setStyle({
		        fillOpacity: 0
		    });
		}
		else {
			hideLastMSAFeatureTimeOut = setTimeout(hideLastMSAFeature, 1000); // check again in a second
		}



	}
	// follow mouse with popup
	function moveMSAPopup(e){
		 //e.target.closePopup();
	    var popup = e.target.getPopup();
	    popup.setLatLng(e.latlng).openOn(map);
	}

	/**
	 *	When a user clicks on an MSA feature in the map
	 */
	function msaFeatureClicked(e) {
		var layer = e.target;
		if (MAP_DEBUG) console.log("\n\n### msaFeatureClicked() -> layer:",layer);

		// if this is an actual MSA feature && there is a GEOID (MSA)
		if (layer.feature.properties && layer.feature.properties.GEOID){
			//if (MAP_DEBUG) console.log("layer.feature.properties",layer.feature.properties);

		    // track recently clicked msa layer
		    lastMSAFeature = layer;

			// reset any previous msas selected
			resetMSAStyle();

			// update the MSA across the interface
			dataChange("map",Page.createNewLocation(layer.feature.properties.GEOID));

		}
	}
	/**
	 *	Zoom and fit the map to the MSA bounds
	 */
	var zoomToMSAonMap = function(msa) {
		//if (MAP_DEBUG) console.log(" -> zoomToMSAonMap()",arguments.callee.caller.toString(), current, msa, msas[msa][0]);
		//if (MAP_DEBUG) console.log(" -> zoomToMSAonMap() msaIndex[msa] = ", msaIndex[msa]);
		try {
			if (map && prop(msaIndex[msa].bounds))
				map.fitBounds(msaIndex[msa].bounds);
		} catch(err) {
			// pass
			console.log("msas not loaded")
		}
	}









/**************************************************************************
 *																		  *
 * 	TRACTS									  							  *
 *																		  *
 **************************************************************************/


	/**
	 *	Load geojson|topojson file
	 *	@param Int msa The msa to load
	 *	@param String src The url to remote file
	 */
	this.loadTractLayerData = function(msa,src) {
		if (MAP_DEBUG) console.log("loadTractLayerData()",msa,src);

		d3.json(src, function(error, data) {		// use D3 to load JSON
			if (error) return console.warn(error);	// return if error
			if (MAP_DEBUG) console.log(" -> d3.json",error,data); // testing
			if (tractLayer != null)
				map.removeLayer(tractLayer)			// remove current layer from map
			tractTIDindex = {};						// reset TID references
			tractRIDindex = {};						// reset RID references

//console.log("currentScenarioTIDs = ",currentScenarioTIDs)

			tractLayer = new L.TopoJSON(data, {		// create new tractLayer, add data
				msa: msa, 							// for reference later
				style: initialTractStyle,
			    onEachFeature: onEachTractFeature
			});
			tractLayer.addTo(map);					// add layer to map
			zoomToMSAonMap(msa);					// zoom to MSA displayed on map
			resetMSAStyle();						// make sure the MSA is not visible
			//restyleTractLayer()

			hideLastMSAFeature()
			console.log("lastMSAFeature",lastMSAFeature);

			// bring to front
		    if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
		        tractLayer.bringToFront();
		    }


		});
	}

	this.updateMap = function(){
		//console.log("updateMap()");
		if (!prop(tractLayer.eachLayer)) return;

		tractLayer.eachLayer(function (layer) {
			if (MAP_DEBUG) console.log("updateMap() -> eachLayer()",layer.feature, layer);

			// reset properties, popup, events for each tract feature
			onEachTractFeature(layer.feature, layer)

			// reset layer style based on new data
			if (prop(layer.feature))
				layer.setStyle( initialTractStyle(layer.feature) )
		});
	}

	/**
	 *	Set properties, popup, events for each tract feature
	 */
	function onEachTractFeature(feature, layer) {
		//if (MAP_DEBUG) console.log(" -> onEachTractFeature() feature, layer", feature, layer)

		// add references to TID, RID to call it from the chart later
		tractTIDindex[feature.properties.TID] = layer;
		tractRIDindex[feature.properties.RID] = layer;

		// get the data for the feature
		var tractData = currentScenario[cleanTID(feature.properties.TID)];
		// if no data, return
		if (!prop(tractData)) return;

		// add popup
		var popupHTML = '<table class="">'+
						'<thead>'+
							'<tr><th class="key"></th><th class="val">Tract</th><th class="val">Region</th></tr>'+
						'</thead>'+
						'<tbody>'+
							'<tr><td class="key">ID</td><td class="val">'+ tractData.TID +'</td><td class="val">'+ tractData.RID +'</td></tr>'+
							'<tr><td class="key">Estimate</td><td class="val t">'+ tractData.tEst +'</td><td class="val r">'+ tractData.rEst +'</td></tr>'+
							'<tr><td class="key">Margin of Error</td><td class="val">±'+ padFloat(tractData.tMar) +'</td><td class="val">±'+ padFloat(tractData.rMar) +'</td></tr>'+
							'<tr><td class="key">CV</td><td class="val">'+ padFloat(tractData.tCV) +'</td><td class="val">'+ padFloat(tractData.rCV) +'</td></tr>'+
						'</tbody>'+
						'</table>';
		layer.bindPopup(popupHTML,{closeButton: false, autoPan: false});


		//console.log("onEachTractFeature()",feature,layer);
	    layer.on({
	        mouseover: highlightTractFromMap,
	        mouseout: resetTractStyleFromMap,
	       // mousemove: moveTractPopup,
	        click: zoomToTractFeature
	    });
	}
	// highlight tract
	function highlightTractFromMap(e) {
		// reference to layer feature
	    var layer = e.target;

	    //if (MAP_DEBUG) console.log(" -> highlightTractFromMap() layer = ",layer)
	    //if (MAP_DEBUG) console.log(" -> highlightTractFromMap() layer.feature = ",layer.feature)

	    // slightly shift fill
	    layer.setStyle(tractHighlightStyle);

	   	//layer.openPopup(); // centers popup
		var popup = e.target.getPopup(); // instead, set popup
	    popup.setLatLng(e.latlng).openOn(map); // at position of mouse

	    highlightTractOnChart(layer.feature.properties);

	    if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
	        layer.bringToFront();
	    }
	}
	// reset tract
	function resetTractStyleFromMap(e) {
		var layer = e.target;
		//if (MAP_DEBUG) console.log("resetTractStyleFromMap()", layer.options);
	    tractLayer.resetStyle(layer);
	    layer.closePopup();

	    removeHighlightTractOnChart(layer.feature.properties); // reset any tract styles
	}
	// zoom to an tract
	function zoomToTractFeature(e) {
	    map.fitBounds(e.target.getBounds());
	}


	// follow mouse with popup
	function moveTractPopup(e){
		 //e.target.closePopup();
	    var popup = e.target.getPopup();
	    popup.setLatLng(e.latlng).openOn(map);
	}





	// highlight tract
	this.highlightTractFromChart = function(tid) {
		if (!prop(tractTIDindex[tid])) return; // map hasn't loaded yet
		var layer = tractTIDindex[tid];
	    //console.log("highlightTractFromChart() tid = ",tid, "layer = ",layer);
	    //var style = testStyle(tid);
		layer.setStyle(tractHighlightStyle);
	  	layer.openPopup();

	   	if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
	        layer.bringToFront();
	    }
	}
	// reset tract style to original
	this.resetTractStyleFromChart = function(tid) {
		if (!prop(tractTIDindex[tid])) return; // map hasn't loaded yet
		var layer = tractTIDindex[tid];
	    tractLayer.resetStyle(layer);
	  	layer.closePopup();
	}





	// initial set tractStyles to build choropleth map
	this.setAllTractColors = function(data){
	//	console.log("setAllTractColors()",data);


		// update the color scale for the map

	}
	// sets scales for tractStyles
	this.setTractStyleScale = function(data){
		console.log("setTractStyleScale()",data);

	}


/**************************************************************************
 *																		  *
 * 	MAP	STYLES					 										  *
 *																		  *
 **************************************************************************/

 	var msaStyle = {
		"color": "#3690c0",
		"weight": 1,
		"opacity": 0.55
	};
	/**/
 	var tractStyle = {
		"color": "#3690c0",
		"weight": 1,
		"opacity": 0.75
	};
	var tractHighlightStyle = {
	    //fillOpacity: 0.4,
	    opacity: 1,
	    weight: 2,
	//	color: "#990000" // stroke color
	}

	/**
	 *	Set initial tract style on load, hover
	 */
	function initialTractStyle(data) {

		var id, _tid, _rid, d, estOrMar;
		_tid = cleanTID(data.properties.TID);
		_rid = data.properties.RID;
		if (MAP_DEBUG) console.log("initialTractStyle() -> _tid = ", _tid, " // _rid = ", _rid, " // data = ", data);

/*
		if (tractOrRegion == "t")
			id = _tid;
		else if (tractOrRegion == "r")
			id = _rid;
*/



		// set default style
		var defaultStyle = {
	        //fillColor: "#000000",
	        weight: 1,
	        opacity: .5,
	        color: 'white',
	        fillOpacity: 0.7
	    };


		if ( prop(currentScenario) && currentScenario[_tid] ){
			//if (MAP_DEBUG) console.log("initialTractStyle() -> setting style based on data");

			// determine whether to store tract / region AND estimate / margin
			if (estimateOrMargin == "e")
				defaultStyle.fillColor = blues( currentScenario[_tid][tractOrRegion+"Est"] );
			else if (estimateOrMargin == "m"){
				var num = currentScenario[_tid][tractOrRegion+"CV"]; // color by CV, but display MOE
				defaultStyle.fillColor = CVColorScale(num);
			}

/*
			// use TID (without "g") or RID as a reference with currentScenario to get estimate
			if (tractOrRegion == "t")
				d = currentScenario[_tid].tEst;
			else if (tractOrRegion == "r")
				d = currentScenario[_tid].rEst;

			// update style color
			defaultStyle.fillColor = blues(d);
*/
	    } // if no TID, currentScenario, or data found
	    else {
			if (MAP_DEBUG) console.log("initialTractStyle() -> NO DATA, RETURNING DEFAULT STYLE, layer = ",layer);
			// no changes to default style
		}
		// return a style object
		return defaultStyle;
	}





	function testStyle(tid) {
	    return {
	        fillColor: "#000000",
	        weight: 2,
	        opacity: 1,
	        color: 'white',
	        dashArray: '3',
	        fillOpacity: 0.7
	    };
	}


	function getColorOrange(d) {
		return d > 8 ? '#800026' :
		       d > 7 ? '#BD0026' :
		       d > 6 ? '#E31A1C' :
		       d > 5 ? '#FC4E2A' :
		       d > 4 ? '#FD8D3C' :
		       d > 3 ? '#FEB24C' :
		       d > 2 ? '#FED976' :
		               '#FFEDA0';
	}
	function getColor(d) {
		return d > 8 ? '#034e7b' :
		       d > 7 ? '#034e7b' :
		       d > 6 ? '#0570b0' :
		       d > 5 ? '#3690c0' :
		       d > 4 ? '#74a9cf' :
		       d > 3 ? '#a6bddb' :
		       d > 2 ? '#d0d1e6' :
		               '#f1eef6';
	}

	function style(feature) {
		//if (MAP_DEBUG) console.log("feature = ",feature)
		return {
		    fillColor: getColor(currentDataForMapColor),
		    weight: 1,
		    opacity: 1,
		    color: 'red',
		    fillOpacity: 0.7
		};
	}




/**************************************************************************
 *																		  *
 * 	MAP	FUNCTIONS				 										  *
 *																		  *
 **************************************************************************/


	/**
	 *	TopoJSON extends GeoJSON class
	 */
	L.TopoJSON = L.GeoJSON.extend({
		// update addData function to check for "Typology"
		addData: function(jsonData) {
			// handle as TopoJSON
			if (jsonData.type === "Topology") {
				for (key in jsonData.objects) {
					geojson = topojson.feature(jsonData, jsonData.objects[key]);
					L.GeoJSON.prototype.addData.call(this, geojson);
				}
			}
			// handle as regular GeoJSON
			else {
				L.GeoJSON.prototype.addData.call(this, jsonData);
			}
		}
	});


 	/**
	 *	Temporary: List all features on the map	(only for testing, takes too long to cycle through them)
	 */
 	function selectMapFeature(tid){
		console.log("selectMapFeature() -> ",tid)
 		map.eachLayer(function (layer) {
			console.log("selectMapFeature() -> ",layer.feature)
			if (layer.feature && layer.feature.properties.TID){
				console.log("selectMapFeature() -> ",layer.feature.properties.tid)
				layer.setStyle({
			        fillOpacity: 0.8
			    });
			}
		});
 	}

	/**
	 *	Temporary: Place markers over the centroids of all MSAs
	 */
	function addTempMSAmarkers(){
		// array to hold markers
		var markerArray = [];
		// loop through each MSA
		for (var key in msas) {
			if (!msas.hasOwnProperty(key)) continue;
			// current marker
		    var o = msas[key][0];
		    //if (MAP_DEBUG) console.log(o);
		    // push new marker to array
		    markerArray.push(L.marker([o.lat,o.lng]));
		}
		// create feature group and add to map
		var group = L.featureGroup(markerArray).addTo(map);
		//map.fitBounds(group.getBounds());
		//if (MAP_DEBUG) console.log(markerArray.length)
	}





}
