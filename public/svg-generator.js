var d3 = require('d3');
var jsdom = require('jsdom');
var fs = require('fs');

var htmlStub = '<html><head> \
	<link rel="stylesheet" type="text/css" href="style.css"> \
	<script src="https://cdnjs.cloudflare.com/ajax/libs/d3/3.5.5/d3.min.js" charset="utf-8"></script> \
	</head><body><div id="dataviz-container"></div></body> \
	<script src="interaction.js" charset="utf-8"></script> \
	</html>'

// here we combine our htmlStub with D3
jsdom.env({
	features : { QuerySelector : true }
	, html : htmlStub
	, done : function(errors, window) {
	// this callback function pre-renders the dataviz inside the html document, then export result into a static html file
 
		var el = window.document.querySelector('#dataviz-container')
		  , body = window.document.querySelector('body')
	
		var width = 1200,
		    height = 800;

		var colorScale = d3.scale.category20c()
		    
		var svg = d3.select(el)
			.append("svg")
				.attr("height", height)
				.attr("width", width);
				
		svg.selectAll("circle")
			.data(d3.range(100000).map(Object))
			  .enter().append("circle")
			  .attr("r", 10)
			  .attr("cx", function(d,i) { return Math.random()*1000 })
			  .attr("cy", function(d,i) { return Math.random()*1000 })
			  .style("fill", function(d, i) { return colorScale(i); });

		// Save result to an html file
		fs.writeFile('./views/d3_graph.html', window.document.documentElement.innerHTML, function(err) {
			if(err) {
				console.log('error saving document', err)
			} else {
				console.log('d3_graph.html was saved!')
			}
		})
	} // end jsDom done callback
})
