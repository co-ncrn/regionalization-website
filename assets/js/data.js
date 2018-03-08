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
			console.log(" -> json returned = ", json);


			// DO I STILL NEED THIS?
			// remove rows with "inf" (infinity)
			//data = remove_rows(data,"inf");

			console.log(" -> currentScenarioArray = ", currentScenarioArray);
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

	// make sure scenario exists in this msa (e.g. no 16020/gen/white)
	function msaScenarioAndDataExists(location){
		//console.log("!!!!!!!!!!!!!!!!!!!!",location,msas[location.msa]);
		let found = false;
		for (let i=0,l=msas[location.msa].length; i<l; i++){
			//console.log(" --------> ","msas[location.msa][i].scenario",msas[location.msa][i].scenario);
			if (msas[location.msa][i].scenario == location.scenario)
				found = true;
			// check data too
			//console.log(" --------> ","msas[location.msa][i].data",msas[location.msa][i].data);
			if (msas[location.msa][i].data.indexOf(location.data) >= 0)
				found = true;
			if (found == true) break;
		}
		return found;
	}

	return {
		getScenario: function(location,callback){
			getScenario(location,callback);
		},
		msaScenarioAndDataExists: function(location){
			return msaScenarioAndDataExists(location);
		}
	};

})();
