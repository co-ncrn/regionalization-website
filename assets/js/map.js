



/* MAP
*********************************************************************************************************/


// map namespace 
var mns = new function() {



	var msaLayer = {},		// the map layer for all MSAs
		msaLayerIndex = {}	// index of all MSA features for quick lookup
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

	var msaStyle = {
		"color": "#3690c0",
		"weight": 1,
		"opacity": 0.65
	};




	/**
	 *	Load the MSA layer - Loads a topojson and adds it to the map
	 */
	function loadMSALayer(src,type,layerId){
		log("loadMSALayer()",src,type,layerId);
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
	loadMSALayer("data/cb_2013_us_cbsa_500k_m1s_mapshaper-quantized.topojson");









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
		//log(feature.properties.avgroomsE)
		return {
		    fillColor: getColor(currentData),
		    weight: 1,
		    opacity: 1,
		    color: 'red',
		    fillOpacity: 0.7
		};
	}

	// highlight an MSA on the map
	function highlightFeature(e) {
	    var layer = e.target;

	    // show info
		//info.update(layer.feature.properties);
		updateFeatures(layer.feature.properties);

	    layer.setStyle({
	        fillOpacity: 0.4
	    });

	    if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
	        layer.bringToFront();
	    }
	}

	var currentLayer = null;
	var layers = {};
	var tractLayer;


	// turn off highlight
	function resetTractHighlight(e) {
		//log(layers);
		log(e.target.options);
		var _msa = e.target.options.msa;
	    layers[_msa].resetStyle(e.target);
	}
	// zoom to an tract
	function zoomToTractFeature(e) {
	    map.fitBounds(e.target.getBounds());
	}
	// set event functions for tracts
	function onEachTractFeature(feature, layer) {
	    layer.on({
	        mouseover: highlightFeature,
	        mouseout: resetTractHighlight,
	        click: zoomToTractFeature
	    });
	}



	/**
	 *	Load geojson|topojson file and display in a tract layer
	 *	@param String src The url to remote file
	 */
	this.loadTractLayer = function(msa,src) {
		log("loadTractLayer()",msa,src);

		if (currentLayer != null && layers[currentLayer]) 
			map.removeLayer(layers[currentLayer]);
		currentLayer = msa;
		// get geojson|topojson file
		d3.json(src, function(error, data) {
			if (error) throw error;
			log("d3.json",error,data);
			// if topojson convert to geojson
			data = ifTopoReturnGeo(data);
			//log(data);
			// add to tract layer and map
			//tractLayer = L.geoJson(data, {
			layers[msa] = L.geoJson(data, {
				msa: msa, // store the msa for reference later
				style: style,
			    //onEachFeature: onEachTractFeature
			});
			layers[msa].addTo(map);
		});
	}
	//loadTractLayer(10180,"data/10180_tract.topojson"); 





	/* MAP - FUNCTIONS
	*********************************************************************************************************/


	/**
	 *	Temp: Place markers over the centroids of all MSAs
	 */
	function addTempMSAmarkers(){
		// array to hold markers
		var markerArray = [];
		// loop through each MSA
		for (var key in msas) {
			if (!msas.hasOwnProperty(key)) continue;
			// current marker
		    var o = msas[key][0];
		    //log(o);
		    // push new marker to array
		    markerArray.push(L.marker([o.lat,o.lng]));
		}
		// create feature group and add to map
		var group = L.featureGroup(markerArray).addTo(map);
		//map.fitBounds(group.getBounds());
		//log(markerArray.length)
	}


	/**
	 *	Set events, etc. for each MSA feature
	 */
	function onEachMSAFeature(feature, layer) {

		// create a reference in msaLayerIndex for later use
		msaLayerIndex[layer.feature.properties.GEOID] = {
			"bounds": layer.getBounds()
		}

	    layer.on({
	        //mouseover: highlightFeature,
	        //mouseout: resetHighlight,
	        click: msaFeatureClicked
	    });
	}
	/**
	 *	When a user clicks on an MSA feature in the map
	 */
	function msaFeatureClicked(e) {
		var layer = e.target;
		log("\nmsaFeatureClicked() -> layer:",layer);

		// if this is an actual MSA feature 
		if (layer.feature.properties){
			//log("layer.feature.properties",layer.feature.properties);

			// and there is a GEOID (MSA)
			if (layer.feature.properties.GEOID)
				// update the MSA across the interface
				//updateMSA(layer.feature.properties.GEOID,"map");
				dataChange("map",layer.feature.properties.GEOID);

			/*
			if (layer.feature.properties.GEOID == 16740)
				loadTractLayer("16740","../../data/geojson/16740_tract3-clean-quantized-1e6.topojson");
			else if (layer.feature.properties.GEOID == 25860)
				loadTractLayer("25860","../../data/geojson/25860_tract_clean-quantized.topojson");
		*/
		} 
	}
	/**
	 *	Zoom and fit the map to the MSA bounds
	 */
	this.zoomToMSAonMap = function(msa) {
	//function zoomToMSAonMap(msa){
		log("zoomToMSAonMap()", msa, msas[msa][0]);
		map.fitBounds(msaLayerIndex[msa].bounds);
	}


	/**
	 *	Consider a geojson|topojson object and return geojson (converting if needed)
	 *	@param Object data A geojson|topojson object
	 *	@returns Object data A geojson object
	 */
	function ifTopoReturnGeo(data){
		log("ifTopoReturnGeo()", data);
		// treat as geojson unless we determine it is topojson file
		if ( data.hasOwnProperty("type") && data.type == "Topology" && data.hasOwnProperty("objects") ){
			// get object keys
			var keys = Object.keys(data.objects);
			// use first key as layer id
			var layerId = keys[0];
			// convert to geojson
			data = topojson.feature(data, data.objects[layerId]);
		}
		return data;
	}



}