

/**************************************************************************
 *																		  *
 * 	CHART				 												  *
 *																		  *
 **************************************************************************/

var chartBuilt = false,
	limit = 20, // data limit
	svgHeight = 20, // height for all svg elements
	CHART_DEBUG = true
	;


var margin

// resize elements
d3.select(window).on('resize', setSize); 
function setSize() {
	// get sizes
	var sizes = {
		"chartContainer": $("#chart-container").width(),
		"chart": $("#chart").width(),
		"table": $("table").width(),
		"thSVG": $(".thSVG").width(),
		"svgCell": $(".svgCell").width(),
	}

	//if (CHART_DEBUG) console.log("setSize() sizes = ",sizes);

$("table").width(sizes.chartContainer);
$(".thSVG").width(sizes.chartContainer * .7);

	//d3.select('table').attr("width", sizes.chartContainer);
	//d3.select('thSVG').attr("width", sizes.thSVG);



	// svg properties
	margin = { top: 0, right: 10, bottom: 0, left: 10 },
		width = sizes.thSVG - margin.left - margin.right,
	    height = svgHeight - margin.top - margin.bottom,
	    svgStroke = 1.5, barHV = 8;
}
setSize();





/**************************************************************************
 *																		  *
 * 	INIT CHART				 											  *
 *																		  *
 **************************************************************************/



// references to table
var table = d3.select('#chart table');
var theadtr = table.select('thead tr');
var	tbody = table.select('tbody');


// add svg to thSVG for xAxis
theadtr.select('.thSVG').append("svg").attr("height",svgHeight);




/**************************************************************************
 *																		  *
 * 	UPDATE CHART				 										  *
 *																		  *
 **************************************************************************/


var rows, yScale, xScale, xMin, xMax, xExtent;

/**
 * 	Build HTML table inside the SVG chart. Update comes later.
 */
function buildChart() {
	if (CHART_DEBUG) console.log("updateChart() -> currentScenarioArray = ",currentScenarioArray);


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
		.attr('class','svgCell')
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
	svg.append('path'); //?
	svg.selectAll('path')		
		.attr('d',tri)
	    .attr("class", "svgTri")
		.attr('fill', "black");

	// set chartBuilt true
	chartBuilt = true;
}


var accent,blues,extent;
function updateColorScales(){
	//accent = d3.scaleOrdinal(d3.schemeAccent);
	//blues = d3.scaleOrdinal(d3.schemeBlues[9]);

	//extent = d3.extent(currentScenarioArray, function(d) { return d.properties.pop_max; })

	extent = d3.extent(currentScenarioArray.map(function (item) {
		//console.log("tractOrRegion = ",tractOrRegion,item.value[tractOrRegion+"Est"]);
		return (item.value[tractOrRegion+"Est"]);
	}))
	//console.log("updateColorScales() --> extent = ",extent)

	// find midpoint between extents, use parseFloats so strings don't concat
	extentMiddle = parseFloat(extent[0]) + ((parseFloat(extent[1]) - parseFloat(extent[0]))/2); 

	blues = d3.scaleQuantile()
		.domain([extent[0], extent[1]])
		.range(d3.schemeBlues[9])
	;
}


//d3.scaleQuantile()
//	.domain([extent[0], extent[1]])
//	.range(colorbrewer.Greens[9]);




/**
 * 	Reformat Tract ID with periods to make it more readable
 *	reference: https://www.census.gov/geo/reference/geoidentifiers.html
 *	So... 18105000901 => 18.105.000901 [state.county.tract]
 */
function reformatTID(str){
	str = 		  str.substr(0, 2) + // state 
			"." + str.substr(2, 3) + // county 
			"." + str.substr(5);
	return str;
}



/**
 * 	Build / Update HTML table inside the SVG chart
 */
function updateChart() {
	if (!chartBuilt) buildChart();

	if (CHART_DEBUG) console.log("updateChart() --> currentScenario = ",currentScenario)
	if (CHART_DEBUG) console.log("updateChart() --> currentScenarioArray = ",currentScenarioArray)

	updateColorScales();
	updateChartScales();



	// select all columns by class, (re)bind the data
	d3.selectAll(".tid")
		.data(currentScenarioArray)
		.classed("button_sliding_bg_left",true)
		.attr("current_source",current.data)
		.attr("row",function(d,i) { return i; })
		.attr("title",function(d,i) { return reformatTID(d.value.TID); })
		.text(function(d) { return reformatTID(d.value.TID).substring(7); /* remove "state.county." */ })
		.attr("style", function (d) { 
				//console.log(".tid --> ",d.value[tractOrRegion+"Est"],blues(d.value[tractOrRegion+"Est"])); /**/ 

				var c = "#ffffffff"; // default (white)
				if (tractOrRegion == "t"){
					c = d3.color( blues(d.value["tEst"]) ); // create color
					c.opacity = 0.5; // set opacity
				}
				return "background: "+ c; // set bg color
			}) 
		;
	d3.selectAll(".rid")
		.data(currentScenarioArray)
		.classed("button_sliding_bg_right",true)
		.attr("current_source",current.data)
		.attr("row",function(d,i) { return i; })
		.text(function(d) { return d.value.RID; })
		.attr("style", function (d) { 
				//console.log(".rid --> ",d.value[tractOrRegion+"Est"],blues(d.value[tractOrRegion+"Est"])); /**/ 
				
				var c = "#ffffffff"; // default (white)
				if (tractOrRegion == "r"){
					var c = d3.color( blues(d.value["rEst"]) ); // create color
					c.opacity = 0.5; // set opacity
				}
				return "background: "+ c; // set bg color
			}) 
		;
	d3.selectAll(".est")
		.data(currentScenarioArray)
		.attr("row",function(d,i) { return i; })
		.text(function(d) { return d.value[tractOrRegion+"Est"]; });
	d3.selectAll(".err")
		.data(currentScenarioArray)
		.attr("row",function(d,i) { return i; })
		.text(function(d) { return d.value[tractOrRegion+"Mar"]; });


	d3.selectAll(".svgCell")
		.data(currentScenarioArray)
		.attr("row",function(d,i) { return i; })


	// transitions über alles! (used by the selects below)
	var t = d3.transition().duration(600);

	// select svgs by class, rebind data, and set transitions
	d3.selectAll(".svgBarHorz")
		.data(currentScenarioArray).transition(t)
			.attr("x", function(d,i){ return xScale( d.value[tractOrRegion+"MarMin"] )}) 
			.attr("y", height/2 ) 
			.attr("width", function(d,i){ return xScale( d.value[tractOrRegion+"MarMax"] ) - xScale( d.value[tractOrRegion+"MarMin"] ) }) 
			.attr("height", svgStroke);
	d3.selectAll(".svgBarVertLeft")
		.data(currentScenarioArray).transition(t)
			.attr("x", function(d,i){ return xScale( d.value[tractOrRegion+"MarMin"] )}) 
			.attr("y", 7 ) 
			.attr("width", svgStroke) 
			.attr("height", barHV);	
	d3.selectAll(".svgBarVertRight")
		.data(currentScenarioArray).transition(t)
			.attr("x", function(d,i){ return xScale( d.value[tractOrRegion+"MarMax"] )}) 
			.attr("y", 7 ) 
			.attr("width", svgStroke) 
			.attr("height", barHV);		
	d3.selectAll(".svgTri")
		.data(currentScenarioArray).transition(t)
			.attr('transform',function(d,i){ 
				return "translate("+ xScale( d.value[tractOrRegion+"Est"] ) +","+ barHV*2 +") "; 
			});


	// set all map colors
	mns.setAllTractColors(currentScenarioArray);





	//************ INTERACTION ************


		
	function selectRow(r){
		//d3.selectAll("td.tid").classed("highlight", true);
	}

	d3.selectAll(".tid")
	    .on("mouseover", selectTID)
	    .on("mouseout", resetTID);
	d3.selectAll(".rid")
	    .on("mouseover", selectRID)
	    .on("mouseout", resetRID);



	function highlightTractOrRegionHeader(){
		if (tractOrRegion == "t"){
			d3.select(".thTID").style("background",blues(extentMiddle));
			d3.select(".thRID").style("background","rgba(0,0,0,.05)");
		} else {
			d3.select(".thTID").style("background","rgba(0,0,0,.05)");
			d3.select(".thRID").style("background",blues(extentMiddle));
		}
	}

	function selectTID(d,i){
		//console.log("selectTID() --> tractOrRegion = ",tractOrRegion);

		// switch to display tract data in boxplot
		if (tractOrRegion == "r"){
			tractOrRegion = "t";	// change to tracts
			mns.updateMap(); 		// update map
			updateChart();			// update chart
			// update classes
			d3.selectAll(".tid").classed("highlight", true);	
			d3.selectAll(".rid").classed("highlight", false);
			// update classes on map popup
			d3.selectAll("td.t").classed("bold", true);	
			d3.selectAll("td.r").classed("bold", false);
		}
		// (always) highlight tract on map after map update
		mns.highlightTractFromChart("g"+d.value.TID); 

		highlightTractOrRegionHeader();
	}
	function resetTID(d){
		mns.resetTractStyleFromChart("g"+d.value.TID) 
	}

	function selectRID(d,i){
		//console.log("selectRID() --> tractOrRegion = ",tractOrRegion);

		// switch to display region data in boxplot
		if (tractOrRegion == "t"){
			tractOrRegion = "r";	// change to tracts
			mns.updateMap(); 		// update map
			updateChart();			// update chart
			d3.selectAll("td.tid").classed("highlight", false);
			d3.selectAll("td.rid").classed("highlight", true);
			// update classes on map popup
			d3.selectAll("td.t").classed("bold", false);	
			d3.selectAll("td.r").classed("bold", true);
		}
		// (always) highlight tract on map after map update
		mns.highlightTractFromChart("g"+d.value.TID); 

		highlightTractOrRegionHeader();
	}
	function resetRID(d){
		mns.resetTractStyleFromChart("g"+d.value.TID) 
	}







		// remove rows not needed
	rows.exit().remove(); 	



	updateDebug();

	create_axes(currentScenarioArray,yScale,xScale,tractOrRegion+"Mar",tractOrRegion+"Est");
}

/**
 * 	Build / Update HTML table inside the SVG chart
 */
function updateChartScales() {

	if (CHART_DEBUG) console.log("updateChartScales()")

	//************ SCALES ************

	// Y-SCALE: based on number of data
	yScale = d3.scaleLinear()
		.domain([0,currentScenarioArray.length])
		.range([margin.top,height-margin.bottom]);

	// X-SCALE: using tract MOE min/max to show difference
	xMin = d3.min(currentScenarioArray, function(d) { return parseFloat(d.value[tractOrRegion+"MarMin"]); });
	xMax = d3.max(currentScenarioArray, function(d) { return parseFloat(d.value[tractOrRegion+"MarMax"]); });
	xExtent = [xMin,xMax];
	//if (CHART_DEBUG) console.log(xExtent);
	xScale = d3.scaleLinear()
		.domain(xExtent).nice()
		.range([margin.left,width-margin.right]);
}








/* 
 *	Create axes and labels
 *	@param {Array} data - the array of objects
 *	@param {Function} yScale - returns a scale
 *	@param {Function} xScale - returns a scale
 *	@param {Float} err - "tMar" or "regionError" from above
 *	@param {Float} est - "tractEst" or "regionEst" from above
 */
function create_axes(data,yScale,xScale,err,est){

	// keep tick labels from overlapping
	var ticks = 5;
	if (parseFloat(data[0]['value'][est]) > 1000) ticks = 4;


	//************ TOP AXIS (NUMBERS) ************

	// set X/Y axes functions
	var xAxis = d3.axisTop()
		.scale(xScale)
		.ticks(ticks)		
		.tickSizeInner(-height)
		.tickSizeOuter(1000)
		.tickPadding(10)
	;
	// add X axis properties
	d3.select(".thSVG svg").append("g")	
		.attr("class", "x axis")
		.attr("transform", "translate(" + 0 + ","+ (25) +")")
	;
	// update axis	
	d3.select(".x.axis").transition().duration(500).call(xAxis); 



	//************ BACKGROUND TICKS ************

	var xAxisTicks = d3.axisTop()
		.scale(xScale)
		.ticks(ticks)		
		.tickSizeInner(-height)
		.tickSizeOuter(0)
		.tickPadding(10)
		.tickFormat(function (d) { return ''; });
	;
//xAxisTicks.selectAll("text").remove();

	d3.selectAll(".svgCell svg")	
		.attr("class", "x3 axis3 ")
		//.attr("transform", "translate(" + 0 + ","+ 0 +")")
	;
	d3.selectAll(".x3.axis3")
		.transition().duration(500)
		.call(xAxisTicks); 



}










