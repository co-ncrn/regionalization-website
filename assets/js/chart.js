/*jshint esversion: 6 */



/*  CHART
******************************************************************************/

var limit = 20, // data limit for testing
	svgHeight = 20, // height for all svg elements
	loaded = false,
	CHART_DEBUG = true;


var margin, sizes, svgRatio = 0.67;








// resize chart elements based on browser size
d3.select(window).on('resize', Table.resize);









/**************************************************************************
 *																		  *
 * 	INIT CHART				 											  *
 *																		  *
 **************************************************************************/



// references to table
var table = d3.select('#chart table');
var theadtr = table.select('thead tr');
var tbody = table.select('tbody');


// add svg to thSVG for xAxis
theadtr.select('.thSVG').append("svg").attr("height", svgHeight);




/**************************************************************************
 *																		  *
 * 	UPDATE CHART				 										  *
 *																		  *
 **************************************************************************/


var rows, yScale, xScale, xMin, xMax, xExtent;

/**
 * 	Build HTML table inside the SVG chart. Update comes later.
 */
function enterChart() {
	//if (CHART_DEBUG) console.log("enterChart() -> currentScenarioArray = ",currentScenarioArray);


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

var accent, blues, reds, estExtent, marExtent;

function updateColorScales() {
	//accent = d3.scaleOrdinal(d3.schemeAccent);
	//blues = d3.scaleOrdinal(d3.schemeBlues[9]);

	//estExtent = d3.extent(currentScenarioArray, function(d) { return d.properties.pop_max; })

	estExtent = d3.extent(currentScenarioArray.map(function(item) {
		//console.log("tractOrRegion = ",tractOrRegion,item.value[tractOrRegion+"Est"]);
		return (item.value[tractOrRegion + "Est"]);
	}))

	marExtent = d3.extent(currentScenarioArray.map(function(item) {
		//console.log("tractOrRegion = ",tractOrRegion,item.value[tractOrRegion+"Est"]);
		return (item.value[tractOrRegion + "Mar"]);
	}))
	//console.log("updateColorScales() -> estExtent = ",estExtent,"marExtent = ",marExtent)

	// find midpoint between estExtents, use parseFloats so strings don't concat
	estExtentMiddle = parseFloat(estExtent[0]) + ((parseFloat(estExtent[1]) - parseFloat(estExtent[0])) / 2);
	marExtentMiddle = parseFloat(marExtent[0]) + ((parseFloat(marExtent[1]) - parseFloat(marExtent[0])) / 2);

	// a scale for the estimates
	blues = d3.scaleQuantile()
		.domain([estExtent[0], estExtent[1]])
		.range(d3.schemeBlues[9]);
	/*
	reds = d3.scaleQuantile()
		.domain([marExtent[0], marExtent[1]])
		.range(d3.schemeReds[9])
	;
	*/
}


//d3.scaleQuantile()
//	.domain([extent[0], extent[1]])
//	.range(colorbrewer.Greens[9]);




/**
 * 	Reformat Tract ID with periods to make it more readable
 *	reference: https://www.census.gov/geo/reference/geoidentifiers.html
 *	So... 18105000901 => 18.105.000901 [state.county.tract]
 */
function reformatTID(str) {
	str = str.substr(0, 2) + // state
		"." + str.substr(2, 3) + // county
		"." + str.substr(5);
	return str;
}



/**
 * 	Build / Update HTML table inside the SVG chart
 */
function updateChart() {
	console.log("currentScenarioArray1", currentScenarioArray);
	enterChart();

	//if (CHART_DEBUG) console.log("updateChart() -> currentScenario = ",currentScenario)
	//if (CHART_DEBUG) console.log("updateChart() -> currentScenarioArray = ",currentScenarioArray)

	updateColorScales();
	updateChartScales();

	// update class on each row
	var rows = tbody.selectAll('tr')
		.data(currentScenarioArray)
		.attr("class", function(d, i) {
			return "g" + d.value.TID; // need "g" because numbers can't be a class
		});


	// select all columns by class, (re)bind the data
	d3.selectAll(".tid")
		.data(currentScenarioArray)
		.classed("button_sliding_bg_left", true)
		.attr("current_source", current.data)
		.attr("row", function(d, i) {
			return i;
		})
		.attr("title", function(d, i) {
			return reformatTID(d.value.TID);
		})
		.text(function(d, i) {
			return /* i; */ reformatTID(d.value.TID).substring(7); /* remove "state.county." */
		})
		.attr("style", function(d) {
			//console.log(".tid -> ",d.value[tractOrRegion+"Est"],blues(d.value[tractOrRegion+"Est"])); /**/

			saveOriginalRowColor("g" + d.value.TID);
			var c = getOriginalRowColor("g" + d.value.TID); // default (white)
			if (tractOrRegion == "t") {
				c = d3.color(blues(d.value["tEst"])); // create color
				c.opacity = 0.5; // set opacity
			}
			return "background: " + c; // set bg color
		});
	d3.selectAll(".rid")
		.data(currentScenarioArray)
		.classed("button_sliding_bg_right", true)
		.attr("current_source", current.data)
		.attr("row", function(d, i) {
			return i;
		})
		.text(function(d) {
			return d.value.RID;
		})
		.attr("style", function(d) {
			//console.log(".rid -> ",d.value[tractOrRegion+"Est"],blues(d.value[tractOrRegion+"Est"])); /**/

			var c = getOriginalRowColor("g" + d.value.TID); // default (white)
			if (tractOrRegion == "r") {
				var c = d3.color(blues(d.value["rEst"])); // create color
				c.opacity = 0.5; // set opacity
			}
			return "background: " + c; // set bg color
		});
	d3.selectAll(".est")
		.data(currentScenarioArray)
		.attr("row", function(d, i) {
			return i;
		})
		.text(function(d) {
			return padFloat(d.value[tractOrRegion + "Est"]);
		});
	d3.selectAll(".err")
		.data(currentScenarioArray)
		.attr("row", function(d, i) {
			return i;
		})
		.text(function(d) {
			return "±" + padFloat(d.value[tractOrRegion + "Mar"]);
		})
		.attr("style", function(d) {
			return "color: " + CVColorScale(d.value[tractOrRegion + "CV"]); // set bg color
		});


	d3.selectAll(".svgCell")
		.data(currentScenarioArray)
		.attr("row", function(d, i) {
			return i;
		})


	// transitions über alles! (used by the selects below)
	var t = d3.transition().duration(600);

	// select svgs by class, rebind data, and set transitions
	d3.selectAll(".svgBarHorz")
		.data(currentScenarioArray).transition(t)
		.attr("x", function(d, i) {
			return xScale(d.value[tractOrRegion + "MarMin"])
		})
		.attr("y", height / 2)
		.attr("width", function(d, i) {
			return xScale(d.value[tractOrRegion + "MarMax"]) - xScale(d.value[tractOrRegion + "MarMin"])
		})
		.attr("height", svgStroke);
	d3.selectAll(".svgBarVertLeft")
		.data(currentScenarioArray).transition(t)
		.attr("x", function(d, i) {
			return xScale(d.value[tractOrRegion + "MarMin"])
		})
		.attr("y", 7)
		.attr("width", svgStroke)
		.attr("height", barHV);
	d3.selectAll(".svgBarVertRight")
		.data(currentScenarioArray).transition(t)
		.attr("x", function(d, i) {
			return xScale(d.value[tractOrRegion + "MarMax"])
		})
		.attr("y", 7)
		.attr("width", svgStroke)
		.attr("height", barHV);
	d3.selectAll(".svgTri")
		.data(currentScenarioArray).transition(t)
		.attr('transform', function(d, i) {
			return "translate(" + xScale(d.value[tractOrRegion + "Est"]) + "," + barHV * 2 + ") ";
		});


	// set all map colors
	console.log("currentScenarioArray2", currentScenarioArray);
	mns.setAllTractColors(currentScenarioArray);





	//************ INTERACTION ************

	function selectRow(r) {
		//d3.selectAll("td.tid").classed("highlight", true);
	}

	d3.selectAll("tr")
		.on("mouseover", selectTIDorRID)
		.on("mouseout", resetTIDorRID);
	d3.selectAll(".tid")
		.on("mouseover", selectTID)
		.on("mouseout", resetTID);
	d3.selectAll(".rid")
		.on("mouseover", selectRID)
		.on("mouseout", resetRID);
	d3.selectAll(".est")
		.on("mouseover", selectEST)
	//.on("mouseout", resetEST)
	;
	d3.selectAll(".err")
		.on("mouseover", selectMAR)
	//.on("mouseout", resetEST)
	;




	//************ FINAL ************

	// remove rows not needed
	rows.exit().remove();



	updateDebug(); //testing
	mns.updateMap(); // update map after chart to give topojson time to load
	highlightHeaders(); // update headers

	console.log("currentScenarioArray3", currentScenarioArray);
	Axes.create(currentScenarioArray, yScale, xScale, tractOrRegion + "Mar", tractOrRegion + "Est");
}


/**
 * Set the header styles based on current state(s)
 * @return {[type]} [description]
 */
function highlightHeaders() {

	var activeClass = "btn-primary",
		inactiveClass = "btn-secondary";

	if (tractOrRegion == "t") {
		$('.thTID button').removeClass(inactiveClass).addClass(activeClass);
		$('.thRID button').removeClass(activeClass).addClass(inactiveClass);
	} else {
		$('.thTID button').removeClass(activeClass).addClass(inactiveClass);
		$('.thRID button').removeClass(inactiveClass).addClass(activeClass);
	}
	if (estimateOrMargin == "e") {
		$('.thEST button').removeClass(inactiveClass).addClass(activeClass);
		$('.thMAR button').removeClass(activeClass).addClass(inactiveClass);
	} else {
		$('.thEST button').removeClass(activeClass).addClass(inactiveClass);
		$('.thMAR button').removeClass(inactiveClass).addClass(activeClass);
	}
}
$('.thTID button').on('click', function() {
	selectTID();
});
$('.thRID button').on('click', function() {
	selectRID();
});
$('.thEST button').on('click', function() {
	toggleEstimateOrMargin("e");
});
$('.thMAR button').on('click', function() {
	toggleEstimateOrMargin("m");
});

function toggleEstimateOrMargin(state) {
	if (state == estimateOrMargin) return; // if same, exit
	estimateOrMargin = state; // update
	console.log("estimateOrMargin", estimateOrMargin)
	mns.updateMap();
	updateChart();
	highlightHeaders();
}

function selectEST() {
	console.log("selectEST() -> estimateOrMargin=", estimateOrMargin);
	if (estimateOrMargin == "e") return; // if same, exit
	toggleEstimateOrMargin("e");
}

function selectMAR() {
	console.log("selectMAR() -> estimateOrMargin=", estimateOrMargin);
	if (estimateOrMargin == "m") return; // if same, exit
	toggleEstimateOrMargin("m");
}




function saveOriginalRowColor(_tid) {
	var _row = d3.select("." + _tid); // reference
	_row.attr("original-bg-color", _row.style("background")); // save current bg color
}

function getOriginalRowColor(_tid) {
	var _row = d3.select("." + _tid); // reference
	return _row.attr("original-bg-color"); // return original bg color
}


function highlightTractOnChart(properties) {
	var _row = d3.select("." + properties.TID); // reference
	saveOriginalRowColor(properties.TID);
	if (prop(properties.TID))
		_row.style("background", "rgba(0,0,0,.1)");
}

function removeHighlightTractOnChart(properties) {
	var _row = d3.select("." + properties.TID); // reference
	if (prop(properties.TID))
		_row.style("background", getOriginalRowColor(properties.TID)); // set it to saved bg color
}
/**
 * Change selection on chart/map to show TRACTS
 */
function selectTID(d) {
	//console.log("selectTID() -> d,i",d,i);

	// switch to display tract data in boxplot
	if (tractOrRegion == "r") {
		tractOrRegion = "t"; // change to tracts
		// update classes
		d3.selectAll(".tid").classed("highlight", true);
		d3.selectAll(".rid").classed("highlight", false);
		// update classes on map popup
		d3.selectAll(".t").style("font-weight", "bold");
		d3.selectAll(".r").style("font-weight", "normal");
		selectTIDorRID(d);
	}

}

function resetTID(d) {
	if (prop(d))
		mns.resetTractStyleFromChart("g" + d.value.TID)
}
/**
 * Change selection on chart/map to show REGIONS
 */
function selectRID(d) {
	//console.log("selectRID() -> tractOrRegion = ",tractOrRegion);

	// switch to display region data in boxplot
	if (tractOrRegion == "t") {
		tractOrRegion = "r"; // change to tracts

		d3.selectAll("td.tid").classed("highlight", false);
		d3.selectAll("td.rid").classed("highlight", true);
		// update classes on map popup
		d3.selectAll(".t").style("font-weight", "bold");
		d3.selectAll(".r").style("font-weight", "normal");
		selectTIDorRID(d);
	}
}

function resetRID(d) {
	if (prop(d))
		mns.resetTractStyleFromChart("g" + d.value.TID)
}

/**
 * Change selection on chart/map to show TRACTS / REGIONS
 */
function selectTIDorRID(d) {
	mns.updateMap(); // update map
	updateChart(); // update chart
	// (always) highlight tract on map after map update
	if (prop(d))
		mns.highlightTractFromChart("g" + d.value.TID);
	highlightHeaders();
}

function resetTIDorRID(d) {
	if (prop(d))
		mns.resetTractStyleFromChart("g" + d.value.TID)
}






/**
 * 	Build / Update HTML table inside the SVG chart
 */
function updateChartScales() {

	//if (CHART_DEBUG) console.log("updateChartScales()")

	//************ SCALES ************

	// Y-SCALE: based on number of data
	yScale = d3.scaleLinear()
		.domain([0, currentScenarioArray.length])
		.range([margin.top, height - margin.bottom]);

	// X-SCALE: using tract MOE min/max to show difference
	xMin = d3.min(currentScenarioArray, function(d) {
		return parseFloat(d.value[tractOrRegion + "MarMin"]);
	});
	xMax = d3.max(currentScenarioArray, function(d) {
		return parseFloat(d.value[tractOrRegion + "MarMax"]);
	});
	xExtent = [xMin, xMax];
	//if (CHART_DEBUG) console.log(xExtent);
	xScale = d3.scaleLinear()
		.domain(xExtent).nice()
		.range([margin.left, width - margin.right]);
}
