



/**************************************************
 *												  *
 * 	MAP											  *
 *												  *
 **************************************************/

// Map NameSpace 
var mns = new function() {



	var msaLayer = {},		// the map layer for all MSAs
		msaLayerIndex = {},	// index of all MSA features for quick lookup
		
		tractLayer = {},// reference to Topojson layer created by Leaflet
		tractTIDs = {},	// reference to tracts by TID
		tractRIDs = {}, // reference to tracts by RID

		currentLayer = null,// current layer
		layers = {},
		MAP_DEBUG = true
		;




/**************************************************
 *												  *
 * 	INIT MAP									  *
 *												  *
 **************************************************/

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




/**************************************************
 *												  *
 * 	MSAs									  	  *
 *												  *
 **************************************************/

	/**
	 *	Load the MSA layer - Loads a topojson and adds it to the map
	 */
	function loadMSALayer(src){
		//if (MAP_DEBUG) console.log("loadMSALayer()",src);
		// get remote json
		d3.json(src, function(error, data) {
			// if topojson, convert to geojson
			data = ifTopoReturnGeo(data);
			// create msa geojson layer
			msaLayer = L.geoJson(data, {
				style: msaStyle,
			    onEachFeature: onEachMSAFeature
			}).addTo(map);
		});
	}
	//loadMSALayer("../../data/geojson/cbsareap010g.json");
	// https://www.census.gov/geo/maps-data/data/cbf/cbf_msa.html
	loadMSALayer(rootDir+"data/cb_2013_us_cbsa_500k_m1s_mapshaper-quantized.topojson");

	/**
	 *	Set events, etc. for each MSA feature
	 */
	function onEachMSAFeature(feature, layer) {

		// reference to bounds of each MSA 
		msaLayerIndex[layer.feature.properties.GEOID] = {
			"bounds": layer.getBounds()
		}

	    layer.on({
	        mouseover: highlightMSAFromMap,
	        mouseout: resetMSAStyleFromMap,
	        click: msaFeatureClicked
	    });
	}
	// highlight an MSA on the map
	function highlightMSAFromMap(e) {
	    var layer = e.target;
	    console.log("highlightMSAFromMap() layer = ",layer)

	    // show info
		//info.update(layer.feature.properties);

	    layer.setStyle({
	        fillOpacity: 0.4
	    });

	    if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
	        layer.bringToFront();
	    }
	}
	// reset tract
	function resetMSAStyleFromMap(e) {
		//if (MAP_DEBUG) console.log(layers);
		if (MAP_DEBUG) console.log(e.target.options);
	    msaLayer.resetStyle(e.target);
	}



/**************************************************
 *												  *
 * 	TRACTS									  	  *
 *												  *
 **************************************************/

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
	 *	Load geojson|topojson file and display in a tract layer
	 *	@param Int msa The msa to load
	 *	@param String src The url to remote file
	 */
	this.loadTractLayerData = function(msa,src) {
		if (MAP_DEBUG) console.log("loadTractLayerData()",msa,src);

		d3.json(src, function(error, data) {		// use D3 to load JSON
			if (error) return console.warn(error);	// return if error
			if (MAP_DEBUG) console.log(" --> d3.json",error,data); // testing
			if (tractLayer != null)
				map.removeLayer(tractLayer)			// remove current layer from map
			tractTIDs = {};							// reset TID references
			tractRIDs = {};							// reset RID references
			tractLayer = new L.TopoJSON(data, {		// create new tractLayer, add data
				msa: msa, 							// for reference later
				style: tractStyle,
			    onEachFeature: onEachTractFeature
			});
			tractLayer.addTo(map);					// add layer to map
			zoomToMSAonMap(msa);					// zoom to MSA displayed on map
		});
	}
	// set properties, events for tracts
	function onEachTractFeature(feature, layer) {
		//if (MAP_DEBUG) console.log(" --> onEachTractFeature() feature, layer", feature, layer)

		// add references to TID, RID to call it from the chart later
		tractTIDs[feature.properties.TID] = layer;
		tractRIDs[feature.properties.RID] = layer;

		//console.log("onEachTractFeature()",feature,layer);
	    layer.on({
	        mouseover: highlightTractFromMap,
	        mouseout: resetTractStyleFromMap,
	        click: zoomToTractFeature
	    });
	}
	// highlight tract
	function highlightTractFromMap(e) {
		// reference to layer feature
	    var layer = e.target;

	    //if (MAP_DEBUG) console.log(" --> highlightTractFromMap() layer = ",layer)
	    //if (MAP_DEBUG) console.log(" --> highlightTractFromMap() layer.feature = ",layer.feature)

	    // slightly shift fill
	    layer.setStyle({
	        fillOpacity: 0.4
	    });

	    if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
	        layer.bringToFront();
	    }
	}
	// reset tract
	function resetTractStyleFromMap(e) {
		//if (MAP_DEBUG) console.log(layers);
		if (MAP_DEBUG) console.log(e.target.options);
	    tractLayer.resetStyle(e.target);
	}
	// zoom to an tract
	function zoomToTractFeature(e) {
	    map.fitBounds(e.target.getBounds());
	}



	// highlight tract
	this.highlightTractFromChart = function(tid) {


		var layer = tractTIDs[tid];
	    //console.log("highlightTractFromChart() tid = ",tid, "layer = ",layer);
	    //var style = testStyle(tid);
		layer.setStyle({
	        fillOpacity: 0.5
	    });
	}
	// reset tract style to original
	this.resetTractStyleFromChart = function(tid) {
		var layer = tractTIDs[tid];
	    tractLayer.resetStyle(layer);
	}



/**************************************************
 *												  *
 * 	MAP	STYLES					 				  *
 *												  *
 **************************************************/

 	var msaStyle = {
		"color": "#3690c0",
		"weight": 1,
		"opacity": 0.55
	};
 	var tractStyle = {
		"color": "#3690c0",
		"weight": 1,
		"opacity": 0.75
	};


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
		    fillColor: getColor(currentData),
		    weight: 1,
		    opacity: 1,
		    color: 'red',
		    fillOpacity: 0.7
		};
	}

	


/**************************************************
 *												  *
 * 	MAP	FUNCTIONS				 				  *
 *												  *
 **************************************************/

 	/**
	 *	Temporary: List all features on the map	(only for testing, takes too long to cycle through them)
	 */
 	function selectMapFeature(tid){
		console.log("selectMapFeature() --> ",tid)
 		map.eachLayer(function (layer) {
			console.log("selectMapFeature() --> ",layer.feature)
			if (layer.feature && layer.feature.properties.TID){
				console.log("selectMapFeature() --> ",layer.feature.properties.tid)
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



	/**
	 *	When a user clicks on an MSA feature in the map
	 */
	function msaFeatureClicked(e) {
		var layer = e.target;
		if (MAP_DEBUG) console.log("\n\n### msaFeatureClicked() -> layer:",layer);

		// if this is an actual MSA feature 
		if (layer.feature.properties){
			//if (MAP_DEBUG) console.log("layer.feature.properties",layer.feature.properties);

			// and there is a GEOID (MSA)
			if (layer.feature.properties.GEOID)
				// update the MSA across the interface
				dataChange("map",layer.feature.properties.GEOID);
		} 
	}
	/**
	 *	Zoom and fit the map to the MSA bounds
	 */
	var zoomToMSAonMap = function(msa) {
		if (MAP_DEBUG) console.log(" --> zoomToMSAonMap()", msa, msas[msa][0]);
		if (MAP_DEBUG) console.log(" --> zoomToMSAonMap() msaLayerIndex[msa] = ", msaLayerIndex[msa]);
		try {
			if (map && prop(msaLayerIndex[msa].bounds))
				map.fitBounds(msaLayerIndex[msa].bounds);
		} catch(err) {
			// pass
			console.log("msas not loaded")
		}
	}


	/**
	 *	Consider a geojson|topojson object and return geojson (converting if needed)
	 *	@param Object data A geojson|topojson object
	 *	@returns Object data A geojson object
	 */
	function ifTopoReturnGeo(data){
		if (MAP_DEBUG) console.log(" --> ifTopoReturnGeo()", data);

		// treat as geojson unless we determine it is topojson file
		if ( data.hasOwnProperty("type") && data.type == "Topology" && data.hasOwnProperty("objects") ){
/*
			if (MAP_DEBUG) console.log(" --> ifTopoReturnGeo()","IT IS TOPOJSON", data);

			if (MAP_DEBUG) console.log(" --> ifTopoReturnGeo()","data.objects.tracts = ", JSON.stringify(data.objects.tracts ) );

			for (var prop in data.objects.tracts) {
				console.log(prop)
			}	

*/
			// get object keys
			var keys = Object.keys(data.objects);
//			if (MAP_DEBUG) console.log(" --> ifTopoReturnGeo()","data.objects", data.objects);
			// use first key as layer id
			var layerId = keys[0];
			// convert to geojson
			data = topojson.feature(data, data.objects[layerId]);
//			if (MAP_DEBUG) console.log(" --> ifTopoReturnGeo()","AFTER", data);
		}
		return data;
	}



}