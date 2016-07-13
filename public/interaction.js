// add your interations here
d3.selectAll("circle")
	.on("mouseenter", function() { 
  		d3.select(this)
		  .remove()
	});

