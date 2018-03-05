var Color = (function() {
	"use strict";

	function blues(){
		return d3.scaleQuantile()
			.domain([estExtent[0], estExtent[1]])
			.range(d3.schemeBlues[9]);
	}
	function updateColorScales() {
		//accent = d3.scaleOrdinal(d3.schemeAccent);
		//blues = d3.scaleOrdinal(d3.schemeBlues[9]);

		//estExtent = d3.extent(currentScenarioArray, function(d) { return d.properties.pop_max; })

	var	estExtent = d3.extent(currentScenarioArray.map(function(item) {
			//console.log("tractOrRegion = ",tractOrRegion,item.value[tractOrRegion+"Est"]);
			return (item.value[tractOrRegion + "Est"]);
		}));

	var	marExtent = d3.extent(currentScenarioArray.map(function(item) {
			//console.log("tractOrRegion = ",tractOrRegion,item.value[tractOrRegion+"Est"]);
			return (item.value[tractOrRegion + "Mar"]);
		}));
		//console.log("updateColorScales() -> estExtent = ",estExtent,"marExtent = ",marExtent)

		// find midpoint between estExtents, use parseFloats so strings don't concat
	var	estExtentMiddle = parseFloat(estExtent[0]) + ((parseFloat(estExtent[1]) - parseFloat(estExtent[0])) / 2);
	var	marExtentMiddle = parseFloat(marExtent[0]) + ((parseFloat(marExtent[1]) - parseFloat(marExtent[0])) / 2);

		// // a scale for the estimates
		// blues = d3.scaleQuantile()
		return d3.scaleQuantile()
			.domain([estExtent[0], estExtent[1]])
			.range(d3.schemeBlues[9]);
		/*
		reds = d3.scaleQuantile()
			.domain([marExtent[0], marExtent[1]])
			.range(d3.schemeReds[9])
		;
		*/
	}

	return {
		blues:updateColorScales
	};

}());
