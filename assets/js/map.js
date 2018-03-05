

var Mns = (function() {
	"use strict";

	// private
	var map,
		msaLayer = {}, // the map layer for all MSAs
		msaIndex = {}, // index of all MSA features for quick lookup

		tractLayer = {}, // reference to Topojson layer created by Leaflet
		tractTIDindex = {}, // reference to tracts by TID
		tractRIDindex = {}, // reference to tracts by RID

		lastMSAFeature = null,
		hideLastMSAFeatureTimeOut = null,
		MAP_DEBUG = true,
		self = this
		;

	var msaStyle = {
		"color": "#3690c0",
		"weight": 1,
		"opacity": 0.55
	};

	/**
	 *	Create map
	 */
	function createMap() {
		// create Leaflet map
		map = L.map('map', {
			minZoom: 5,
			maxZoom: 15,
			zoomControl: true
		}).setView([35.243, -80.395], 7);

		var attribution = 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
			'<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
			'Imagery © <a href="http://mapbox.com">Mapbox</a>';

		// add base map
		L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
			id: 'mapbox.light', // testing: 'mapbox.streets'
			opacity: 0.7,
			attribution: attribution,
			accessToken: 'pk.eyJ1Ijoib3dlbm11bmR5IiwiYSI6ImNpd3o4M3dvejAxMHkyeW1neTQxMzlxamkifQ.mRigBfiIBYYqOMAftwkvbQ'
		}).addTo(map);

		// add buttons to map
		L.easyButton('fa-arrows-alt fa-lg', function(btn, map) {
			toggle_fullscreen();
		}).addTo(map);

		// finally, load the MSA layer: from https://www.census.gov/geo/maps-data/data/cbf/cbf_msa.html
		loadMSALayer(Site.rootDir + "data/cb_2013_us_cbsa_500k_m1s_mapshaper-quantized.topojson");
	}

	/**
	 *	Load the MSA topojson and add it to the map
	 */
	function loadMSALayer(src) {
		//console.log("loadMSALayer()",src);
		d3.json(src, function(error, data) {
			if (error) return console.warn(error);

			msaLayer = new L.TopoJSON(data, {
				style: msaStyle,
				onEachFeature: onEachMSAFeature
			});
			// add layer to map
			msaLayer.addTo(map);
			// if an msa is set then zoom to it
			if (prop(Page.location.msa)) zoomToMSAonMap(Page.location.msa);
		});
	}

	/**
	 *	Zoom to the msa
	 */
	function zoomToMSAonMap(msa) {
		if (MAP_DEBUG) console.log(" -> zoomToMSAonMap()",/*arguments.callee.caller.toString(), */Page.location, msa, msas[msa][0]);

		try {
			if (MAP_DEBUG) console.log(" -> zoomToMSAonMap() msaIndex[msa] = ", msaIndex[msa], msaIndex[msa].bounds);
			if (map && prop(msaIndex[msa].bounds))
				map.fitBounds(msaIndex[msa].bounds);
		} catch(err) {
			// pass
			console.log("msas not loaded");
		}
	}

	/**
	 *	Set events, etc. for each MSA feature
	 */
	function onEachMSAFeature(feature, layer) {
		//console.log("onEachMSAFeature() feature = ",feature, " layer = ",layer)

		// reference to bounds of each MSA
		msaIndex[layer.feature.properties.GEOID] = {
			"bounds": layer.getBounds(),
			"msa":layer.feature.properties.GEOID
		};

		// store reference to feature
		if (feature.properties.GEOID == Page.location.msa){
			lastMSAFeature = layer;
			console.log(" -> store reference to feature",feature.properties.GEOID,Page.location.msa,lastMSAFeature);
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
		if (_msa == Page.location.msa) return;

		// show info
		//info.update(layer.feature.properties);

		// if msa is not set then don't do this
		if (prop(Page.location.msa) && Page.location.msa != parseInt(_msa)){
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
	    if (prop(e) && prop(e.feature) && e.feature.properties.GEOID == Page.location.msa) return;

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
			dataChange("map",{"msa":layer.feature.properties.GEOID, "scenario": Page.location.scenario, "data":Page.location.data});

		}
	}

	return {
		createMap: createMap,
		loadMSALayer: function(src){
			loadMSALayer(src);
		}
	};

}());


$(function() {


});
