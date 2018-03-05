var Chart = (function() {
	"use strict";

	var limit = 20, // data limit for testing
		svgHeight = 20, // height for all svg elements
		loaded = false,
		CHART_DEBUG = true;

	var margin,
		sizes,
		svgRatio = 0.67;

	// table
	var table,theadtr,tbody,
		rows, yScale, xScale, xMin, xMax, xExtent;
	// color
	var accent, blues, reds, estExtent, marExtent;

	function createChart(){
		if (CHART_DEBUG) console.log("createChart()");
		// references to table
		table = d3.select('#chart table');
		theadtr = table.select('thead tr');
		tbody = table.select('tbody');
		// add svg to thSVG for xAxis
		theadtr.select('.thSVG').append("svg").attr("height", svgHeight);
	}


	/**
	 * 	Build HTML table inside the SVG chart. Update comes later.
	 */
	function enterChart() {
		if (CHART_DEBUG) console.log("enterChart() -> currentScenarioArray = ",currentScenarioArray);


		//************ INIT TABLE ************

		// set the update selection:
		rows = tbody.selectAll('tr')
			.data(currentScenarioArray);

		// set the enter selection:
		var rowsEnter = rows.enter()
			.append('tr');

		// add a td for each column
		rowsEnter.append('td').attr("class", "tid");
		rowsEnter.append('td').attr("class", "rid");
		rowsEnter.append('td').attr("class", "est");
		rowsEnter.append('td').attr("class", "err");



		//************ INIT SVG BOXPLOT ************

		// append svg cell
		var svg = rowsEnter.append('td')
			.attr('class', 'svgCell')
			.append('svg')
			.attr("width", width)
			.attr("height", height);

		// append horizontal bar to svg
		svg.append('rect').attr("class", "svgBar svgBarHorz");
		svg.append('rect').attr("class", "svgBar svgBarVertLeft");
		svg.append('rect').attr("class", "svgBar svgBarVertRight");

		// append triangle to svg
		var tri = d3.symbol()
			.type(d3.symbolTriangle)
			.size(15);
		svg.append('path')
			.attr('d', tri)
			.attr("class", "svgTri")
			.attr('fill', "black");

	}

	function CVColorScale(cv) {
		var color, percent = cv * 100;
		// High Reliability: Small CVs, less than or equal to 12 percent, are flagged green to indicate
		// that the sampling error is small relative to the estimate and the estimate is reasonably reliable.
		if (percent <= 12)
			color = "#5f9a1c";
		// Medium Reliability: Estimates with CVs between 12 and 40 are flagged yellow—use with caution.
		else if (percent <= 40)
			color = "#ff9900";
		// Low Reliability: Large CVs, over 40 percent, are flagged red to indicate that the sampling error
		// is large relative to the estimate. The estimate is considered very unreliable.
		else if (percent > 40)
			color = "#ff0000";
		else
			color = "#000";

		//console.log("CV = ",cv,"percent = ",percent,"color = ",color)
		return color;
	}






	return {
		createChart:createChart
	};

}());
