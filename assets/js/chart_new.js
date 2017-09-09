



/**************************************************
 *												  *
 * 	INIT CHART									  *
 *												  *
 **************************************************/

// svg properties
var margin = { top: 0, right: 0, bottom: 0, left: 0 },
	width = 300 - margin.left - margin.right,
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
	.data(['Tracts','Regions','Estimate','Error']).enter()
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


/**
 * 	Build / Update HTML table inside the SVG chart
 */
function updateChartTable() {

	console.log("updateChartTable() -> currentScenario = ",currentScenario);




	// set the update selection:
	var rows = tbody.selectAll('tr')
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

	// select all columns by class, (re)bind the data
	d3.selectAll(".tid")
		.data(currentScenario)
		.classed("button_sliding_bg_left",true)
		.attr("current_source",current.data)
		.attr("row",function(d,i) { return i; })
		.text(function(d) { return d.TID; });
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


	// remove rows not needed
	rows.exit().remove(); 
}


/**
 * 	Build / Update SVG boxplot
 */
function updateChartBoxPlot() {

}


function updateChart(){
	//console.log(" --> updateChart() current data ", JSON.stringify(currentScenario) );

	updateChartTable();
	updateChartBoxPlot();
}

