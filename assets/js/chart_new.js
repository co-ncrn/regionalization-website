

/**************************************************************************
 *																		  *
 * 	CHART				 												  *
 *																		  *
 **************************************************************************/

var chartBuilt = false,
	limit = 20 // data limit
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

	//console.log("setSize() sizes = ",sizes);

$("table").width(sizes.chartContainer);
$(".thSVG").width(sizes.chartContainer * .7);

	//d3.select('table').attr("width", sizes.chartContainer);
	//d3.select('thSVG').attr("width", sizes.thSVG);



	// svg properties
margin = { top: 0, right: 10, bottom: 0, left: 10 },
	width = sizes.thSVG - margin.left - margin.right,
    height = 20 - margin.top - margin.bottom,
    barW = 1.5, barHV = 8;
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


// add svg to thSVG
theadtr.select('.thSVG').append("svg").attr("height",20);




/**************************************************************************
 *																		  *
 * 	UPDATE CHART				 										  *
 *																		  *
 **************************************************************************/


var rows, yScale, xScale, xMin, xMax, xExtent;

/**
 * 	Build / Update HTML table inside the SVG chart
 */
function buildChart() {

	console.log("updateChart() -> currentScenario = ",currentScenario);



	//************ SCALES ************

	// Y-SCALE: based on number of data
	yScale = d3.scaleLinear()
		.domain([0,limit])
		.range([margin.top,height-margin.bottom]);

	// X-SCALE: using tract MOE min/max to show difference
	xMin = d3.min(currentScenario, function(d) { return parseFloat(d["tractErrorMin"]); });
	xMax = d3.max(currentScenario, function(d) { return parseFloat(d["tractErrorMax"]); });
	xExtent = [xMin,xMax];
	//console.log(xExtent);
	xScale = d3.scaleLinear()
		.domain(xExtent).nice()
		.range([margin.left,width-margin.right]);




	//************ TABLE ************

	// set the update selection:
	rows = tbody.selectAll('tr')
    	.data(currentScenario);

	// set the enter selection:
	var rowsEnter = rows.enter()
	    .append('tr');

	rowsEnter.append('td')
	    .attr("class", "tid")
	    //.text(function(d) { return d.TID; });
	rowsEnter.append('td')
	    .attr("class", "rid")
	    //.text(function(d) { return d.RID; });
	rowsEnter.append('td')
	    .attr("class", "est")
	    //.text(function(d) { return d["tractEstimate"]; });
	rowsEnter.append('td')
	    .attr("class", "err")
	    //.text(function(d) { return d["tractError"];; });




	//************ SVG ************

	// append svg cell
	var svg = rowsEnter.append('td')
		.attr('class','svgCell')
	    .append('svg')
	    .attr("width", width)
	    .attr("height", height);
 	
 	// append horizontal bar to svg
	svg.append('rect').attr("class", "svgBar svgBarHorz");
	svg.append('rect').attr("class", "svgBar svgBarVert1");
	svg.append('rect').attr("class", "svgBar svgBarVert2");

	// append triangle to svg
	var tri = d3.symbol()
        .type(d3.symbolTriangle)
        .size(15);
	svg.append('path'); //?
	svg.selectAll('path')		
		.attr('d',tri)
	    .attr("class", "svgTri")
		.attr('fill', "black");




	chartBuilt = true;
}


var accent,blues,extent;
function updateColorScales(){
	//accent = d3.scaleOrdinal(d3.schemeAccent);
	blues = d3.scaleOrdinal(d3.schemeBlues[9]);

	//extent = d3.extent(currentScenario, function(d) { return d.properties.pop_max; })

	extent = d3.extent(currentScenario.map(function (item) {
		return (item.tractEstimate);
	}))


	blues = d3.scaleOrdinal()
		.domain([extent[0], extent[1]])
		.range(d3.schemeBlues[9])
	;
}





//var extent = d3.extent(geojson.features, function(d) { return d.properties.pop_max; });


//d3.scaleQuantile()
//	.domain([extent[0], extent[1]])
//	.range(colorbrewer.Greens[9]);








/**
 * 	Build / Update HTML table inside the SVG chart
 */
function updateChart() {
	if (!chartBuilt) buildChart();


	updateColorScales();
	updateChartScales();

	// transitions über alles! (IOW, reusable by the selects below)
	var t = d3.transition().duration(600);

	// select all columns by class, (re)bind the data
	d3.selectAll(".tid")
		.data(currentScenario)
		.classed("button_sliding_bg_left",true)
		.attr("current_source",current.data)
		.attr("row",function(d,i) { return i; })
		.attr("title",function(d,i) { return d.TID; })
		.text(function(d) { return d.TID.substring(4); })
		.attr("style", function (d) { return "background: "+blues(d["tractEstimate"]) }) // set bg color
		;
	d3.selectAll(".rid")
		.data(currentScenario)
		.classed("button_sliding_bg_right",true)
		.attr("current_source",current.data)
		.attr("row",function(d,i) { return i; })
		.text(function(d) { return d.RID; })
		;
	d3.selectAll(".est")
		.data(currentScenario)
		.attr("row",function(d,i) { return i; })
		.text(function(d) { return d["tractEstimate"]; });
	d3.selectAll(".err")
		.data(currentScenario)
		.attr("row",function(d,i) { return i; })
		.text(function(d) { return d["tractError"]; });


	d3.selectAll(".svgCell")
		.data(currentScenario)
		.attr("row",function(d,i) { return i; })




	// select svgs by class, rebind data, and set transitions
	d3.selectAll(".svgBarHorz")
		.data(currentScenario).transition(t)
			.attr("x", function(d,i){ return xScale( d["tractErrorMin"] )}) 
			.attr("y", height/2 ) 
			.attr("width", function(d,i){ return xScale( d["tractErrorMax"] ) - xScale( d["tractErrorMin"] ) }) 
			.attr("height", barW);
	d3.selectAll(".svgBarVert1")
		.data(currentScenario).transition(t)
			.attr("x", function(d,i){ return xScale( d["tractErrorMin"] )}) 
			.attr("y", 7 ) 
			.attr("width", barW) 
			.attr("height", barHV);	
	d3.selectAll(".svgBarVert2")
		.data(currentScenario).transition(t)
			.attr("x", function(d,i){ return xScale( d["tractErrorMax"] )}) 
			.attr("y", 7 ) 
			.attr("width", barW) 
			.attr("height", barHV);		
	d3.selectAll(".svgTri")
		.data(currentScenario).transition(t)
			.attr('transform',function(d,i){ 
				return "translate("+ xScale( d["tractEstimate"] ) +","+ barHV*2 +") "; 
			});


	// set all map colors
	mns.setAllTractColors(currentScenario);



	//************ INTERACTION ************


	d3.selectAll(".tid")
	    .on("mouseover", selectTID)
	    .on("mouseout", resetTID);
	d3.selectAll(".rid")
	    .on("mouseover", selectRID);

		
	function selectRow(r){
		//d3.selectAll("td.tid").classed("highlight", true);
	}

	function selectTID(d,i){
		d3.selectAll(".tid").classed("highlight", true);
		d3.selectAll(".rid").classed("highlight", false);

		//console.log(d.TID)
		mns.highlightTractFromChart("g"+d.TID); // highlight tract on map


	//	var s = d3.select(this).attr("current_source");
	//	load_data(s,"tract",tabulate);
	}
	function selectRID(d,i){
		d3.selectAll("td.tid").classed("highlight", false);
		d3.selectAll("td.rid").classed("highlight", true);
	//	var s = d3.select(this).attr("current_source");
	//	load_data(s,"region",tabulate);
	}

	function resetTID(d){
		
		mns.resetTractStyleFromChart("g"+d.TID) 
	}







		// remove rows not needed
	rows.exit().remove(); 	

	create_axes(currentScenario,yScale,xScale,"tractError","tractEstimate");
}

/**
 * 	Build / Update HTML table inside the SVG chart
 */
function updateChartScales() {

	console.log("updateChartScales()")

	//************ SCALES ************

	// Y-SCALE: based on number of data
	yScale = d3.scaleLinear()
		.domain([0,limit])
		.range([margin.top,height-margin.bottom]);

	// X-SCALE: using tract MOE min/max to show difference
	xMin = d3.min(currentScenario, function(d) { return parseFloat(d["tractErrorMin"]); });
	xMax = d3.max(currentScenario, function(d) { return parseFloat(d["tractErrorMax"]); });
	xExtent = [xMin,xMax];
	//console.log(xExtent);
	xScale = d3.scaleLinear()
		.domain(xExtent).nice()
		.range([margin.left,width-margin.right]);
}


/* 
 *	Create axes and labels
 *	@param {Array} data - the array of objects
 *	@param {Function} yScale - returns a scale
 *	@param {Function} xScale - returns a scale
 *	@param {Float} err - "tractError" or "regionError" from above
 *	@param {Float} est - "tractEst" or "regionEst" from above
 */
function create_axes(data,yScale,xScale,err,est){

	// keep tick labels from overlapping
	var ticks = 5;
	if (parseFloat(data[0][est]) > 1000) ticks = 4;


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










