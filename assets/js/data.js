var Data = (function() {
	"use strict";

	/**
	 *	Get data from server
	 */
	function getScenario(location,callback) {

		let url = Site.rootDir +"data/scenarios/"+ location.msa +"_"+ location.scenario +"_"+ location.data +".json";
		if (Site.debug) console.log("Data.getScenario()", url, location);

		d3.json(url, function(error, json) {
			if (error) return console.error(error, json); // handle error
			console.log(" -> Data.getScenario() json = ", json);





			// DO I STILL NEED THIS?
			// remove rows with "inf" (infinity)
			//data = remove_rows(data,"inf");

			console.log(" -> currentScenarioArray, json", currentScenarioArray);
			currentScenario = json;
			currentScenarioArray = d3.entries(currentScenario);
			numberTracts = currentScenarioArray.length;



			// testing
			if (Site.debug)
				$("#rawDataOutput").val(JSON.stringify(json).replace("},", "},\n"));

			// set color scale
			Color.updateScale();
			// update chart (and eventually map, from chart.js)
			Chart.updateChart();

			//callback();
		});
	}

	// make sure this is a scenario in this msa (e.g. no 16020/gen/white)
	function msaScenarioExists(location){
		//console.log("!!!!!!!!!!!!!!!!!!!!",msas[location.msa]);
		let found = false;
		for (let i=0,l=msas[location.msa]; i<l; i++)
			if (msas[location.msa][i].scenario == location.scenario)
				found = true;
		return found;
	}


	return {
		getScenario: function(location,callback){
			getScenario(location,callback);
		},
		msaScenarioExists: function(location){
			return msaScenarioExists(location);
		}
	};

})();
