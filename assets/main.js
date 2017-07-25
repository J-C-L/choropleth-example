
/*  This visualization was made possible by modifying code provided by:

Scott Murray, Choropleth example from "Interactive Data Visualization for the Web"
https://github.com/alignedleft/d3-book/blob/master/chapter_12/05_choropleth.html

Malcolm Maclean, tooltips example tutorial
http://www.d3noob.org/2013/01/adding-tooltips-to-d3js-graph.html

Mike Bostock, Pie Chart Legend
http://bl.ocks.org/mbostock/3888852  */


//Width and height of map
var width = 960;
var height = 500;

// D3 Projection
var projection = d3.geo.albersUsa()
.translate([width/2, height/2])    // translate to center of screen
.scale([1000]);          // scale things down so see entire US

// Define path generator
var path = d3.geo.path()               // path generator that will convert GeoJSON to SVG paths
.projection(projection);  // tell path generator to use albersUsa projection


// Define linear scale for output
var color = d3.scale.linear()
.range(['rgb(237,248,251)','rgb(191,211,230)','rgb(158,188,218)','rgb(140,150,198)','rgb(136,86,167)','rgb(129,15,124)']);
//.range(["rgb(213,222,217)","rgb(69,173,168)","rgb(84,36,55)","rgb(217,91,67)"]);

// var legendText = ["Cities Lived", "States Lived", "States Visited", "Nada"];



//Create SVG element and append map to the SVG
var svg = d3.select("body")
.append("svg")
.attr("width", width)
.attr("height", height);

// Append Div for tooltip to SVG
var div = d3.select("body")
.append("div")
.attr("class", "tooltip")
.style("opacity", 0);




// Load in my states data!
d3.csv("USPopByState.csv", function(data) {
	// color.domain([0,1,2,3]); // setting the range of the input data


	//preparing data to be mapped to 6 colors
	//get array of the relevant data field
	var dataValues = data.map(function(val){
		return val.visited;
	});



	var dataMax = Math.max.apply(null, dataValues);
	var dataMin = Math.min.apply(null, dataValues);
	var dataRange = dataMax - dataMin;


	var colorDomainArray = [];
	for (var i = 0; i< 6; i++){
		value = dataMin + (dataRange/6)* i;
		colorDomainArray.push(value);
	}



	color.domain(colorDomainArray); // setting the range of the input data
	// color.domain([0,1,2,3]); // setting the range of the input data


	// Load GeoJSON data and merge with states data
	d3.json("us-states.json", function(json) {

		// Loop through each state data value in the .csv file
		for (var i = 0; i < data.length; i++) {

			// Grab State Name
			var dataState = data[i].state;

			// Grab data value
			var dataValue = data[i].visited;

			// Find the corresponding state inside the GeoJSON
			for (var j = 0; j < json.features.length; j++)  {
				var jsonState = json.features[j].properties.NAME;

				if (dataState == jsonState) {

					// Copy the data value into the JSON
					json.features[j].properties.visited = dataValue;

					// Stop looking through the JSON
					break;
				} // end of if statement
			} //end of loop through GeoJSON
		} // end of loop through my states data

		// Bind the data to the SVG and create one path per GeoJSON feature
		svg.selectAll("path")
		.data(json.features)
		.enter()
		.append("path")
		.attr("d", path)
		.style("stroke", "#fff")
		.style("stroke-width", "1")
		.style("fill", function(d) {
			// Get data value
			var value = d.properties.visited;
			if (value) {
				//If value exists…
				return color(value);
			} else {
				//If value is undefined…
				return "rgb(0,0,100)";
			}
		}) // ends fill function

		// 	// Modification of custom tooltip code provided by Malcolm Maclean, "D3 Tips and Tricks"
		// 	// http://www.d3noob.org/2013/01/adding-tooltips-to-d3js-graph.html
		.on("mouseover", function(d) {
			div.transition()
			.duration(200)
			.style("opacity", .9);

				console.log(d)
			div.text(d.properties.NAME + ": " +
			d3.format(",.0f")(d.properties.visited))
			.style("left", (d3.event.pageX) + "px")
			.style("top", (d3.event.pageY - 28) + "px");
		})
		// fade out tooltip on mouse out
		.on("mouseout", function(d) {
			div.transition()
			.duration(500)
			.style("opacity", 0);
		});



		// // Map the cities I have lived in!
		// d3.csv("cities-lived.csv", function(data) {
		//
		// svg.selectAll("circle")
		// 	.data(data)
		// 	.enter()
		// 	.append("circle")
		// 	.attr("cx", function(d) {
		// 		return projection([d.lon, d.lat])[0];
		// 	})
		// 	.attr("cy", function(d) {
		// 		return projection([d.lon, d.lat])[1];
		// 	})
		// 	.attr("r", function(d) {
		// 		return Math.sqrt(d.years) * 4;
		// 	})
		// 		.style("fill", "rgb(217,91,67)")
		// 		.style("opacity", 0.85)
		//
		// 	// Modification of custom tooltip code provided by Malcolm Maclean, "D3 Tips and Tricks"
		// 	// http://www.d3noob.org/2013/01/adding-tooltips-to-d3js-graph.html
		// 	.on("mouseover", function(d) {
		//     	div.transition()
		//       	   .duration(200)
		//            .style("opacity", .9);
		//            div.text(d.place)
		//            .style("left", (d3.event.pageX) + "px")
		//            .style("top", (d3.event.pageY - 28) + "px");
		// 	})
		//
		//     // fade out tooltip on mouse out
		//     .on("mouseout", function(d) {
		//         div.transition()
		//            .duration(500)
		//            .style("opacity", 0);
		//     });
		// });

		// Modified Legend Code from Mike Bostock: http://bl.ocks.org/mbostock/3888852



		var legend = d3.select("body").append("svg")
		.attr("class", "legend")
		.attr("width", 240)
		// .attr("width", 140)
		.attr("height", 200)
		.selectAll("g")
		.data(color.domain().slice().reverse())
		.enter()
		.append("g")
		.attr("transform", function(d, i) { return "translate(0," + i * 22 + ")"; });

		legend.append("rect")
		.attr("width", 18)
		.attr("height", 22)
		.style("fill", color);


		// // Get data values for the ranges to be displayed in the legned
		var legendValues = colorDomainArray.concat([dataMax]);



		// Could add in conditional formatting based on size of max values.
		// Values formatted with commas and given with no decimal places.
		var formattedLegendValues = legendValues.map(function(x){
			return d3.format(",.0f")(x);
		});
		// Values formatted in scientific notation
		// var formattedLegendValues = legendValues.map(function(x){
		// 	return d3.format(".1e")(x);
		// });



		console.log(formattedLegendValues);

		// Reverse array, since legened is constrcuted from top/max to bottom/min
		var legendText = formattedLegendValues.reverse();
		// var legendText = legendValues.reverse();

		//loop over indices to have access to pairs of consecutive data values to be displayed in the legned
		var legendIndex = [0,1,2,3,4,5]
		legend.append("text")
		.data(legendIndex)
		.attr("x", 24)
		.attr("y", 12)
		.attr("dy", ".35em")
		.text(function(d) {
			return legendText[d+1] + ' to ' + legendText[d]; });
		});
	});
