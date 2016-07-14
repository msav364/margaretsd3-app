var d3 = require('d3');
var jsdom = require('jsdom');
var fs = require('fs');

var htmlStub = '<html><head> \
	<link rel="stylesheet" type="text/css" href="style.css"> \
	<link href="https://fonts.googleapis.com/css?family=Roboto" rel="stylesheet"> \
	<script src="https://cdnjs.cloudflare.com/ajax/libs/d3/3.5.5/d3.min.js" charset="utf-8"></script> \
	</head> \
	<body><header><h1>EU Referendum Results</h1></header> \
	<div id="resultsMap"><div class="euref-result-container"><div class="euref-result"><div class="euref-result__close">X</div><p></p><div class="euref-result-minichart"><p></p></div></div></div><div id="areaText"><p class="areaName"></p><p>click for more</p></div></div> \
	</body> \
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
	
	var width = 960,
	    height = 1160;

	var svg = d3.select("#resultsMap").append("svg")
	    .attr("width", width)
	    .attr("height", height);
	
	queue()
	    .defer(d3.csv, "EU-referendum-result-data.csv")
	    .defer(d3.json, "constituencies.json")
	    .await(ready);

		function ready(error, referendum, uk) {
	  if (error) return console.warn(error);

	  //console.log(uk);
	  //console.log(topojson.feature(uk, uk.objects.constituencies).features);
	  //console.log(referendum)
  
	  var constituenciesFeatures = topojson.feature(uk, uk.objects.constituencies).features;
	  var projection = d3.geo.albers()
	    .center([2, 55.4])
	    .rotate([4.4, 0])
	    .parallels([50, 60])
		.scale(6000)
	    .translate([width / 2, height / 2]);
  
	  var path = d3.geo.path()
	  .projection(projection)
  	  
	  referendum.forEach(function(d){
		d.Pct_Leave = +d.Pct_Leave;
	  })
  
	  referendumData = d3.nest()
	  .key(function(d) { return d.Area_Code; })
	  .map(referendum);
  
	  //console.log(referendumData)
    
	  svg.selectAll(".euref-area")
	   .data(constituenciesFeatures)
	   .enter().append("path")
	   .attr("d", path)
	   .attr("class", function(d){
		   var thisClass = "euref-area ";
		   thisClass += referendumData[d.properties.CODE][0].Pct_Leave > 50 ? "euref-area--leave" : "euref-area--remain" ;
		   thisClass += (referendumData[d.properties.CODE][0].Pct_Leave > 48 && referendumData[d.properties.CODE][0].Pct_Leave < 52) ? " euref-area--marginal": "";
		   return thisClass;
	   })
	   .on("mouseenter", function(d) {
	            d3.select(this)
	            .style("stroke-width", 1.5)
	            .style("stroke-dasharray", 0)

	            coordinates = d3.mouse(svg.node())
	            d3.select("#areaText")
	            .style("left", (coordinates[0]+8) + "px")
	            .style("top", (coordinates[1]+8) + "px")
	            //.transition()
				//.duration(1000)
	            .style("opacity", .75)
			
				d3.select(".areaName")
	            .text(referendumData[d.properties.CODE][0].Area)
	        })
	   .on("mouseleave", function(d) { 

	            d3.select(this)
	            .style("stroke-width", .25)
	            .style("stroke-dasharray", 1)

	            d3.select("#areaText")
	            //.transition()
				//.duration(2000)
	            .style("opacity", 0);
			} )
		.on("click", function(d) { 
			var Pct_Leave = (referendumData[d.properties.CODE][0].Pct_Leave);
			var Pct_Remain = (referendumData[d.properties.CODE][0].Pct_Remain);
			var Electorate = d3.format(",")(referendumData[d.properties.CODE][0].Electorate);
			var Votes_Cast = d3.format(",")(referendumData[d.properties.CODE][0].Votes_Cast);
			var Pct_Turnout = (referendumData[d.properties.CODE][0].Pct_Turnout);
		
			var vote = Pct_Leave > 50 ? "leave" : "remain a member of";
			var majority = Pct_Leave > 50 ? (Pct_Leave - Pct_Remain) : (Pct_Remain - Pct_Leave);
		   d3.select(".euref-result")
		   .style("margin-left",0)
			.select("p")
		   .text(function() {
		   	return "More people in " + referendumData[d.properties.CODE][0].Area + " voted to " + vote +  " the EU - a " + majority.toFixed(2) + "% majority. "+ Pct_Leave + "% voted to leave; " + Pct_Remain + "% voted to remain."
		   });
		   d3.select(".euref-result-minichart")
		   .select("p")
		   .text(function() {
		   	return "A total of "+ Votes_Cast + " people voted, representing "+ Pct_Turnout +"% of the " + Electorate +" electorate."
		   })
		   d3.select(".euref-result__close")
		   .on("click",function(){
			   console.log('yes')
		   	d3.select(".euref-result")
			   .style("margin-left","-400px")
		   })
	   	 })
	 
	   var legend = svg.append("g")
	   .attr("class","legend")
	   .attr("transform","translate(10,20)")
   
	   legend.append("g")
	   .attr("class","legend-item-leave")
   
	   legend.select(".legend-item-leave").append("rect")
	   .attr("class","euref-area--leave")
	   .attr("width","20")
	   .attr("height","20")

	   legend.select(".legend-item-leave").append("text")
	   .text("Majority Leave")
	   .attr("transform","translate(30,15)")

	   legend.append("g")
	   .attr("class","legend-item-leave-marginal")
	   .attr("transform","translate(0,30)")
   
	   legend.select(".legend-item-leave-marginal").append("rect")
	   .attr("class","euref-area--leave euref-area--marginal")
	   .attr("width","20")
	   .attr("height","20")

	   legend.select(".legend-item-leave-marginal").append("text")
	   .text("Majority Leave (Marginal)")
	   .attr("transform","translate(30,15)")
   
	   legend.append("g")
	   .attr("class","legend-item-remain")
	   .attr("transform","translate(0,60)")
   
	   legend.select(".legend-item-remain").append("rect")
	   .attr("class","euref-area--remain")
	   .attr("width","20")
	   .attr("height","20")

	   legend.select(".legend-item-remain").append("text")
	   .text("Majority Remain")
	   .attr("transform","translate(30,15)")
  
	   legend.append("g")
	   .attr("class","legend-item-remain-marginal")
	   .attr("transform","translate(0,90)")
   
	   legend.select(".legend-item-remain-marginal").append("rect")
	   .attr("class","euref-area--remain euref-area--marginal")
	   .attr("width","20")
	   .attr("height","20")

	   legend.select(".legend-item-remain-marginal").append("text")
	   .text("Majority Remain Marginal")
	   .attr("transform","translate(30,15)")
		 
		// Save result to an html file
		fs.writeFile('./views/eureferendum-map.html', window.document.documentElement.innerHTML, function(err) {
			if(err) {
				console.log('error saving document', err)
			} else {
				console.log('eureferendum-map.html was saved!')
			}
		})
	} // end jsDom done callback
})
