/*jshint esversion: 6 */



var Axes = (function() {
	// private




	/*
	 *	Create axes and labels
	 *	@param {Array} data - the array of objects
	 *	@param {Function} yScale - returns a scale
	 *	@param {Function} xScale - returns a scale
	 *	@param {Float} err - "tMar" or "regionError" from above
	 *	@param {Float} est - "tractEst" or "regionEst" from above
	 */
	function create(data, yScale, xScale, err, est) {
		console.log("create_axes()", data, yScale, xScale, err, est)

		// keep tick labels from overlapping
		var ticks = 5;
		if (parseFloat(data[0]['value'][est]) > 1000) ticks = 4;


		//************ TOP AXIS (NUMBERS) ************

		// set X/Y axes functions
		var xAxis = d3.axisTop()
			.scale(xScale)
			.ticks(ticks)
			.tickSizeInner(-height)
			.tickSizeOuter(0)
			.tickPadding(10);
		// add X axis properties
		d3.select(".thSVG svg").append("g")
			.attr("class", "x axis")
			.attr("transform", "translate(" + 0 + "," + (25) + ")");
		// update axis
		d3.select(".x.axis").transition().duration(500).call(xAxis);



		//************ BACKGROUND TICKS ************

		var xAxisTicks = d3.axisTop()
			.scale(xScale)
			.ticks(ticks)
			.tickSizeInner(-height)
			.tickSizeOuter(1000) // hide outer ticks way off screen
			.tickPadding(10);
		//xAxisTicks.selectAll("text").remove();

		d3.selectAll(".svgCell svg")
			.attr("class", "x3 axis3 ")
		//.attr("transform", "translate(" + 0 + ","+ 0 +")")
		;
		d3.selectAll(".x3.axis3")
			.transition().duration(500)
			.call(xAxisTicks);

	}


	return {
		create: function(data, yScale, xScale, err, est) {
			create(data, yScale, xScale, err, est)
		}
	}

})();
