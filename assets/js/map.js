"use strict";

var Mns = (function() {
	// private
	var msaLayer = {}, // the map layer for all MSAs
		msaIndex = {}, // index of all MSA features for quick lookup

		tractLayer = {}, // reference to Topojson layer created by Leaflet
		tractTIDindex = {}, // reference to tracts by TID
		tractRIDindex = {}, // reference to tracts by RID

		lastMSAFeature = null,
		hideLastMSAFeatureTimeOut = null,
		MAP_DEBUG = true;


	/**
	 *	Create map
	 */
	function createMap() {
		// create Leaflet map
		this.map = L.map('map', {
			minZoom: 5,
			maxZoom: 15,
			zoomControl: true
		}).setView([35.243, -80.395], 7);

		var attribution = 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
			'<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
			'Imagery © <a href="http://mapbox.com">Mapbox</a>';

		L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
			id: 'mapbox.light', // testing: 'mapbox.streets'
			opacity: 0.7,
			attribution: attribution,
			accessToken: 'pk.eyJ1Ijoib3dlbm11bmR5IiwiYSI6ImNpd3o4M3dvejAxMHkyeW1neTQxMzlxamkifQ.mRigBfiIBYYqOMAftwkvbQ'
		}).addTo(this.map);


		L.easyButton('fa-arrows-alt fa-lg', function(btn, map) {
			toggle_fullscreen();
		}).addTo(this.map);
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
			msaLayer.addTo(this.map);
			// if an msa is set then zoom to it
			if (prop(Page.location.msa)) zoomToMSAonMap(Page.location.msa);
		});
	}



	return {
		createMap: createMap
	}

})();


$(function() {

	Mns.createMap();
});
