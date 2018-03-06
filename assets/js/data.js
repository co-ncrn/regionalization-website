/*jshint esversion: 6 */

var Data = (function() {
	// private



	/**
	 *	Get data from server
	 */
	function getScenario(location) {

		var url = Site.rootDir + "data/scenarios/" + location.msa + "_" + location.scenario + "_" + location.data + ".json";
		if (Site.debug) console.log("Data.getScenario()", url, location);

		d3.json(url, function(error, json) {
			if (error) return console.error(error); // handle error
			console.log(" -> Data.getScenario() -> json = ", json);


			// set color scale
			Color.setScale();


			// DO I STILL NEED THIS?
			//		data = remove_rows(data,"inf"); 		// remove rows with "inf" (infinity)

			// data has arrived
			// currentScenario = cleanData(json.response);			// DELETE

			console.log(" -> currentScenarioArray, json", currentScenarioArray)
			currentScenario = json;
			currentScenarioArray = d3.entries(currentScenario);
			numberTracks = currentScenarioArray.length;

		//	Chart.updateChart(); // update chart (and eventually map, from chart.js)

			// testing
			if (Site.debug) $("#rawDataOutput").val(JSON.stringify(json).replace("},", "},\n"));
		});
	}



	return {
		getScenario: function(location){
			getScenario(location);
		}
	}

})();
