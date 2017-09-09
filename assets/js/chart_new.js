

/**************************************************
 *												  *
 * 	CHART										  *
 *												  *
 **************************************************/


var chartBuilt = false,
	limit = 20 // data limit
	;


/**************************************************
 *												  *
 * 	INIT CHART									  *
 *												  *
 **************************************************/

// svg properties
var margin = { top: 0, right: 0, bottom: 0, left: 0 },
	width = 200 - margin.left - margin.right,
    height = 20 - margin.top - margin.bottom,
    barW = 1.5, barHV = 8;

// create table
var table = d3.select('#chart').append('table').attr('class','tableText');
var thead = table.append('thead');
var	tbody = table.append('tbody');

// select header row
var theadtr = thead.append('tr');

// select th
theadtr.selectAll('th')
	.data(['Tract','Region','Estimate','Error']).enter()
	.append('th')
	.text(function (d) { return d; });

// select last th, add svg
theadtr.append('th').attr('class','svgHeader')
	.append("svg").attr("height",20);


/**************************************************
 *												  *
 * 	UPDATE CHART								  *
 *												  *
 **************************************************/


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

/**
 * 	Build / Update HTML table inside the SVG chart
 */
function updateChart() {
	if (!chartBuilt) buildChart();


	// transitions über alles! (IOW, reusable by the selects below)
	var t = d3.transition().duration(600);

	// select all columns by class, (re)bind the data
	d3.selectAll(".tid")
		.data(currentScenario)
		.classed("button_sliding_bg_left",true)
		.attr("current_source",current.data)
		.attr("row",function(d,i) { return i; })
		.attr("title",function(d,i) { return d.TID; })
		.text(function(d) { return d.TID.substring(4); });
	d3.selectAll(".rid")
		.data(currentScenario)
		.classed("button_sliding_bg_right",true)
		.attr("current_source",current.data)
		.attr("row",function(d,i) { return i; })
		.text(function(d) { return d.RID; });
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




		// remove rows not needed
	rows.exit().remove(); 	

}


// resize elements of graph based on window size
d3.select(window).on('resize', resize); 
// Update graph using new width and height
function resize() {
	console.log("resize() called ");
	var dw = d3.select('.svgHeader').node().getBoundingClientRect().width;
	var dw2 = $(".svgCell").width();
	console.log(dw);
	console.log(dw2);

width = dw;
d3.selectAll('svg').attr("width", dw);

//d3.select('#chart tbody td.svgCell').node().getBoundingClientRect().width = dw;
//d3.select('#chart tbody td.svgCell svg').attr("width", dw);


}
