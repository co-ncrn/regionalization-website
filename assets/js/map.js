



/* MAP
*********************************************************************************************************/

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
	    //console.log(o);
	    // push new marker to array
	    markerArray.push(L.marker([o.lat,o.lng]));
	}
	// create feature group and add to map
	var group = L.featureGroup(markerArray).addTo(map);
	//map.fitBounds(group.getBounds());
	//console.log(markerArray.length)
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
	console.log("\nmsaFeatureClicked() -> layer:",layer);

	// if this is an actual MSA feature 
	if (layer.feature.properties){
		//console.log("layer.feature.properties",layer.feature.properties);

		// and there is a GEOID (MSA)
		if (layer.feature.properties.GEOID)
			// update the MSA across the interface
			updateMSA(layer.feature.properties.GEOID,"map");


		/*
		if (layer.feature.properties.GEOID == 16740)
			loadTractLayer("16740","../../data/geojson/16740_tract3-clean-quantized-1e6.topojson");
		else if (layer.feature.properties.GEOID == 25860)
			loadTractLayer("25860","../../data/geojson/25860_tract_clean-quantized.topojson");
	*/
	} 
}
/**
 *	Zoom the map to the MSA bounds
 */
function zoomToMSAonMap(msa){
	console.log("zoomToMSAonMap()", msa, msas[msa][0]);
	map.fitBounds(msaLayerIndex[msa].bounds);
}


/**
 *	Consider a geojson|topojson object and return geojson (converting if needed)
 *	@param Object data A geojson|topojson object
 *	@returns Object data A geojson object
 */
function ifTopoReturnGeo(data){
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


