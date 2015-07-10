var plot = function(data){

	var names = _.keys(data)

	function hourlyPlot() {
		var data2 = []
		_.each(_.range(24), function(i) {
			data2[i] = _.map(names, function(name){
				return { name:name, value:+data[name]['hourly'][i] }
			})
		})

		var margin = {top: 20, right: 30, bottom: 30, left: 80},
	    width = 1000 - margin.left - margin.right,
	    height = 500 - margin.top - margin.bottom;

		var x0 = d3.scale.ordinal()
		    .rangeRoundBands([0, width+margin.left+margin.right-300], .1);

		var x1 = d3.scale.ordinal()

		var y = d3.scale.linear()
	    	.range([height, 0]);

	    var color = d3.scale.ordinal()
	    				.range([d3.rgb(72,131,189), d3.rgb(246,140,39)])

	    var xAxis = d3.svg.axis()
		    .scale(x0)
	    	.orient("bottom");

		var yAxis = d3.svg.axis()
		    .scale(y)
		    .orient("left")
		    .tickFormat(d3.format(" .02"));

		var svg = d3.select("#dailyAnalysis")
			.append("svg")
				.attr("width", width+margin.left+margin.right)
				.attr("height", height+margin.top+margin.bottom+30)
				.append("g")
					.attr("transform", "translate(" + margin.left + "," + margin.top + ")")
		var maxY = []
		
		_.each(_.range(names.length), function(i){
			maxY[i] = []
		})

		for(var i=0;i<data2.length;i++) {
			for(var j=0;j<data2[i].length;j++) {
				maxY[j].push(data2[i][j].value)
			}
		}
		var sumY = []
		maxY = _.max(_.map(maxY, function(d) { sumY.push(d3.sum(d)); return _.max(d)/d3.sum(d) }))

		x0.domain(_.range(24))
		x1.domain(names).rangeRoundBands([0,x0.rangeBand()])
		y.domain([0, maxY+.02])

		svg.append("g")
				.attr("class", "x axis")
				.attr("transform", "translate(0, "+height+")")
				.call(xAxis)
			.append("text")
				.attr("y", 6)
				.attr("dy", ".71em")
				.attr("transform", "translate("+width/2+",20)")
				.style("text-anchor", "end")
				.text("Hour of Day")
		
		svg.append("g")
				.attr("class", "y axis")
				.call(yAxis)
			.append("text")
				.attr("transform",  "translate(1,"+height/3+") rotate(-90)")
				.attr("y", 6)
				.attr("dy", ".71em")
				.style("text-anchor", "end")
				.text("Fraction of Messages");

		var hour = svg.selectAll(".hour")
						.data(data2)
						.enter().append("g")
						.attr("class","g")
						.attr("transform", function(d, i) { return "translate("+x0(i)+",0)"})

		hour.selectAll("rect")
			.data(function(d){return d})
			.enter().append("rect")
			.attr("width", x1.rangeBand)
			.attr("x", function(d) {return x1(d.name) })
			.attr("y", function(d, i) {return y((d.value/sumY[i])) })
			.attr("height", function(d, i) { return height - y(d.value/sumY[i]); })
	      .style("fill", function(d) { return color(d.name); })
	      .on("mouseover", function(d){
	      		this.style.fill = color(d.name).brighter(1)
	      		this.style.stroke = "black"
	      	})
	      .on("mouseout", function(d){
	      		this.style.fill = color(d.name)
	      		this.style.stroke = "none"
	      	})

	    var legend = svg.selectAll(".legend")
	      .data(names.slice().reverse())
	    .enter().append("g")
	      .attr("class", "legend")
	      .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

	  legend.append("rect")
	      .attr("x", width-160)
	      .attr("width", 18)
	      .attr("height", 18)
	      .style("fill", color);

	  legend.append("text")
	      .attr("x", width - 140)
	      .attr("y", 9)
	      .attr("dy", ".35em")
	      .style("text-anchor", "start")
	      .text(function(d) { return d; });
	}

	function dailyPlot() {
		
		var data1 = []
		var dataLength = data[names[0]]['daily'].length
		
		_.each(_.range(dataLength), function(i) {
			data1[i] = _.map(names, function(name){
				return { name:name, value:+data[name]['daily'][i] }
			})
		})

		var margin = {top: 20, right: 30, bottom: 30, left: 80},
	    width = 1000 - margin.left - margin.right,
	    height = 500 - margin.top - margin.bottom;

		var x0 = d3.scale.ordinal()
		    .rangeRoundBands([0, width+margin.left+margin.right-300], .1);

		var x1 = d3.scale.ordinal()

		var y = d3.scale.linear()
	    	.range([height, 0]);

	    var color = d3.scale.ordinal()
	    				.range([d3.rgb(72,131,189), d3.rgb(246,140,39)])

	    var xAxis = d3.svg.axis()
		    .scale(x0)
	    	.orient("bottom")

		var yAxis = d3.svg.axis()
		    .scale(y)
		    .orient("left")
		    .tickFormat(d3.format(" .02"));

		var svg = d3.select("#monthlyAnalysis")
			.append("svg")
				.attr("width", width+margin.left+margin.right)
				.attr("height", height+margin.top+margin.bottom+30)
				.append("g")
					.attr("transform", "translate(" + margin.left + "," + margin.top + ")")
		
		var maxY = []
		_.each(_.range(0,names.length), function(i){
			maxY[i] = []
		})
		
		for(var i=0;i<data1.length;i++) {
			for(var j=0;j<data1[i].length;j++) {
				maxY[j].push(data1[i][j].value)
			}
		}
		var sumY = []
		maxY = _.max(_.map(maxY, function(d) {sumY.push(d3.sum(d));return _.max(d)/d3.sum(d)}))

		x0.domain(_.range(dataLength))
		x1.domain(names).rangeRoundBands([0,x0.rangeBand()])
		y.domain([0, maxY+.02])
		xAxis.tickValues(x0.domain().filter(function(d, i){return !(i%10)||(i==dataLength-1)}))
		
		svg.append("g")
				.attr("class", "x axis")
				.attr("transform", "translate(0, "+height+")")
				.call(xAxis)
			.append("text")
				.attr("y", 6)
				.attr("dy", ".71em")
				.attr("transform", "translate("+width/2+",20)")
				.style("text-anchor", "end")
				.text("Day")
		
		svg.append("g")
				.attr("class", "y axis")
				.call(yAxis)
			.append("text")
				.attr("transform",  "translate(1,"+height/3+") rotate(-90)")
				.attr("y", 6)
				.attr("dy", ".71em")
				.style("text-anchor", "end")
				.text("Fraction of Messages");

		var line = d3.svg.line()
					.interpolate("basis")
					.x(function(d) { return x0(d.index) })
					.y(function(d) { console.log(d);return y(d.points) });
		// console.log(data)
		var day = svg.selectAll(".day")
						.data(data1)
						.enter().append("g")
						.attr("class","g")
						.attr("transform", function(d, i) { return "translate("+x0(i)+",0)"})

		// day.append("path")
		// 	.attr("class", "line")
		// 	.attr("d", function(d, i){var points=_.map(d.daily, function(val){return val/sumY[i]});return line({points:points,index:_.range(dataLength)}) })
		// // 	.attr("class", "line")
		// // 	.attr("d", function(d) { console.log(d);return line(d.values); })
		// 	.style("stroke", function(d) { return "black"; });

		// svg.append("g")
		day.selectAll("rect")
			.data(function(d){return d})
			.enter().append("rect")
			.attr("width", x1.rangeBand)
			.attr("x", function(d) {return x1(d.name) })
			.attr("y", function(d, i) {return y((d.value/sumY[i])) })
			.attr("height", function(d, i) { return height - y(d.value/sumY[i]); })
	      .style("fill", function(d) { return color(d.name); })
	      .on("mouseover", function(d){
	      		this.style.fill = color(d.name).brighter(1)
	      		this.style.stroke = "black"
	      	})
	      .on("mouseout", function(d){
	      		this.style.fill = color(d.name)
	      		this.style.stroke = "none"
	      	})

	    var legend = svg.selectAll(".legend")
	      .data(names.slice().reverse())
	    .enter().append("g")
	      .attr("class", "legend")
	      .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

	  	legend.append("rect")
	      .attr("x", width-160)
	      .attr("width", 18)
	      .attr("height", 18)
	      .style("fill", color);

	  	legend.append("text")
	      .attr("x", width - 140)
	      .attr("y", 9)
	      .attr("dy", ".35em")
	      .style("text-anchor", "start")
	      .text(function(d) { return d; });
	}

	hourlyPlot()
	dailyPlot()
}