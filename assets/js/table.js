/*jshint esversion: 6 */


let Table = (function() {
	// private


	function resize() {
		// get sizes
		sizes = {
			"chartContainer": $("#chart-container").width(),
			"chart": $("#chart").width(),
			"table": $("table").width(),
			"thSVG": $(".thSVG").width(),
			"svgCell": $(".svgCell").width(),
		}

		console.log("\nTable.resize() sizes = ", sizes);

		// expand table
		$("table").width(sizes.chartContainer);

		// resize headers to match data in colums
		$(".thTID").innerWidth($(".tid").width());
		$(".thRID").width($(".rid").width());
		$(".thEST").width($(".est").width());
		$(".thMAR").width($(".err").width());

		// resize SVG headers/cells
		$(".thSVG").width(sizes.chartContainer * svgRatio);
		$(".thSVG svg").width(sizes.chartContainer * svgRatio);
		$(".svgCell").width(sizes.chartContainer * svgRatio);
		$(".svgCell svg").width(sizes.chartContainer * svgRatio);

		// update SVG sizes in chart
		if (prop(loaded) && loaded == true) {
			console.log("currentScenarioArray0", currentScenarioArray);
			updateChart();
		}

		// set svg properties
		margin = {
				top: 0,
				right: 10,
				bottom: 0,
				left: 10
			},
			width = sizes.thSVG - margin.left - margin.right,
			height = svgHeight - margin.top - margin.bottom,
			svgStroke = 1.5, barHV = 8;
	}


	return {
		resize:resize
	}

})();
