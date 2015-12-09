function generateBubbleChart (bubbleData) {
    $('#svg-bubble').html('');

    var diameter = 250,
    height = 450,
    format = d3.format(",d"),
    color = d3.scale.category20c();

    var bubble = d3.layout.pack()
    .sort(null)
    .size([diameter, diameter])
    .padding(1.5);

    var svg = d3.select("#svg-bubble")
    .attr("width", diameter)
    .attr("height", height)
    .attr("class", "bubble");


    var bubbleResults = {
        displayName: "root",
        children: bubbleData
    }

    var node = svg.selectAll(".node")
    .data(bubble.nodes(classes(bubbleResults))
      .filter(function(d) { return !d.children; }))
    .enter().append("g")
    .attr("class", "node")
    .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })
    .on("click", function(d){
        console.log(d);
        var newFilterList = [];
        for (var i = 0; i < d.factors.length; i++) {
            newFilterList.push({
                name: d.factors[i].name,
                type: 'multi-select',
                values: [d.factors[i].value]
            });
        }

        console.log(newFilterList);
        getResults(newFilterList);

        showSuccessMessage('Dashboard reloaded based on your chosen bubble!','#bubble-alert')
    });

    node.append("title")
    .text(function(d) { return d.className + ": " + format(d.value); });

    node.append("circle")
    .attr("r", function(d) { return d.r; })
    .style("fill", function(d) { return color(d.packageName); });

    node.append("text")
    .attr("dy", ".3em")
    .style("text-anchor", "middle")
    .text(function(d) { return d.className.substring(0, d.r / 3); });

// Returns a flattened hierarchy containing all leaf nodes under the root.
function classes(root) {
  var classes = [];

  function recurse(name, node) {
    if (node.children) node.children.forEach(function(child) { recurse(node.displayName, child); });
    else classes.push({
        packageName: name, 
        className: node.displayName, 
        value: node.value,
        factors: node.factors
    });
}

recurse(null, root);
return {children: classes};
}

d3.select(self.frameElement).style("height", diameter + "px");
}

function generateCalendarView (parentId,svgId,transformedDataTotal) {
    if(transformedDataTotal) {
        var convertedData = [];
        var maxVal = 0;

        transformedDataTotal.forEach(function (d) {
            convertedData.push({
                date: moment(d.date,'D/M/YY').format('DD-MM-YYYY'),
                value: d.value
            });

            if(d.value > maxVal) {
                maxVal = d.value;
            }
        });

        $(svgId).css('height',0);
        $(svgId).html('');
        $(parentId).html('');

        var width = 450,
        height = 80,
    cellSize = 8; // cell size

    var percent = d3.format(".1%"),
    format = d3.time.format("%d-%m-%Y");

    console.log(d3.max(convertedData));
    var color = d3.scale.quantize()
    .domain([0, maxVal])
    .range(d3.range(11).map(function(d) { return "q" + d + "-11"; }));

    //defines a function to be used to append the title to the tooltip.  you can set how you want it to display here.
    var maketip = function (d,datad) {
        var tip = '<p class="tip1">' + datad + '</p> <p class="tip3">'+ d +'</p>';
        return tip;}

        var svg = d3.select(parentId).selectAll("svg")
        .data(d3.range(2012, 2015))
        .enter().append("svg")
        .attr("width", width+50)
        .attr("height", height)
        .attr("class", "RdYlGn")
        .append("g")
        .attr("transform", "translate(" + ((width - cellSize * 53) / 2) + "," + (height - cellSize * 7 - 1) + ")");

        svg.append("text")
        .attr("transform", "translate(-6," + cellSize * 3.5 + ")rotate(-90)")
        .style("text-anchor", "middle")
        .text(function(d) { return d; });

        var rect = svg.selectAll(".day")
        .data(function(d) { return d3.time.days(new Date(d, 0, 1), new Date(d + 1, 0, 1)); })
        .enter().append("rect")
        .attr("class", "day")
        .attr("width", cellSize)
        .attr("height", cellSize)
        .attr("x", function(d) { return d3.time.weekOfYear(d) * cellSize; })
        .attr("y", function(d) { return d.getDay() * cellSize; })
        .datum(format);

        rect.append("title")
        .text(function(d) { return d; });

        svg.selectAll(".month")
        .data(function(d) { return d3.time.months(new Date(d, 0, 1), new Date(d + 1, 0, 1)); })
        .enter().append("path")
        .attr("class", "month")
        .attr("d", monthPath);

        //  Tooltip Object
        var tooltip = d3.select("body")
        .append("div").attr("id", "tooltip")
        .style("position", "absolute")
        .style("z-index", "10")
        .style("visibility", "hidden")
        .text("a simple tooltip");

        var data = d3.nest()
        .key(function(d) { return d.date; })
        .rollup(function(d) { 
            return d[0].value; 
        })
        .map(convertedData);

        rect.filter(function(d) { return d in data; })
        .attr("class", function(d) { return "day " + color(data[d]); })
        .select("title");

    //  Tooltip
    rect.on("mouseover", mouseover);
    rect.on("mouseout", mouseout);
}
function mouseover(d) {
    tooltip.style("visibility", "visible");
    var percent_data = (data[d] !== undefined) ? data[d] : 0;
    var purchase_text = d + ": " + percent_data;

    tooltip.transition()        
    .duration(200)      
    .style("opacity", .9);      
    tooltip.html(maketip(d,percent_data)) 
    .style("left", (d3.event.pageX)+30 + "px")     
    .style("top", (d3.event.pageY) + "px"); 
}
function mouseout (d) {
    tooltip.transition()        
    .duration(500)      
    .style("opacity", 0); 
    var $tooltip = $("#tooltip");
    $tooltip.empty();
}

function monthPath(t0) {
  var t1 = new Date(t0.getFullYear(), t0.getMonth() + 1, 0),
  d0 = t0.getDay(), w0 = d3.time.weekOfYear(t0),
  d1 = t1.getDay(), w1 = d3.time.weekOfYear(t1);
  return "M" + (w0 + 1) * cellSize + "," + d0 * cellSize
  + "H" + w0 * cellSize + "V" + 7 * cellSize
  + "H" + w1 * cellSize + "V" + (d1 + 1) * cellSize
  + "H" + (w1 + 1) * cellSize + "V" + 0
  + "H" + (w0 + 1) * cellSize + "Z";
}

d3.select(self.frameElement).style("height", "2910px");
}

function generateTimeSeries (mode,svgId,transformedDataTotal,transformedDataTotal2) {
    // d3 settings
    var margin = {top: 20, right: 80, bottom: 80, left: 50},
    width = 440 - margin.left - margin.right,
    height = 320 - margin.top - margin.bottom,
    radius = Math.min(width, height) / 2;

    var donutWidth = 75;
    var legendRectSize = 18;
    var legendSpacing = 4;

    var x = d3.time.scale()
    .range([0, width]);

    var xBar = d3.time.scale()
    .range([0, width]);

    var y = d3.scale.linear()
    .range([height, 0]);

    var color = d3.scale.category10();

    var arc = d3.svg.arc()
    .outerRadius(radius - donutWidth)
    .innerRadius(radius);

    var pie = d3.layout.pie()
    .sort(null)
    .value(function(d) { return d.value; });

    var d3Format = d3.time.format("%d-%m-%Y");

    if(mode == "hour") {
        d3Format = d3.time.format("%H:00");    
    }

    var format = "DD-MM-YYYY";

    if(mode == "hour") {
        format = 'HH:00';
    }

    var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom")
    .tickFormat(d3Format)
    .ticks(d3.time.days, (transformedDataTotal.length/23 + 1));
    if(mode == "hour") {
        xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom")
        .tickFormat(d3Format)
        .ticks(d3.time.hours, 1);    
    }

    var xBarAxis = d3.svg.axis()
    .scale(xBar)
    .orient("bottom")
    .tickFormat(d3Format)
    .ticks(d3.time.days, 1);
    if(mode == "hour") {
        xBarAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom")
        .tickFormat(d3Format)
        .ticks(d3.time.hours, 1);    
    }

    var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left");

    var line = d3.svg.line()
    .interpolate("linear")
    .x(function(d) { return x(d.date); })
    .y(function(d) { return y(d.value); });

    // Hardcoded data for testing,to be removed
    /*
    transformedDataTotal = [
    {
        date: "00:00",
        value: 5
    },
    {
        date: "01:00",
        value: 6
    },
    {
        date: "02:00",
        value: 3
    },
    {
        date: "03:00",
        value: 7
    },
    {
        date: "04:00",
        value: 20
    },
    {
        date: "05:00",
        value: 60
    },
    {
        date: "06:00",
        value: 150
    },
    {
        date: "07:00",
        value: 200
    },
    {
        date: "08:00",
        value: 250
    },
    {
        date: "09:00",
        value: 400
    },
    {
        date: "10:00",
        value: 450
    },
    {
        date: "11:00",
        value: 180
    },
    {
        date: "12:00",
        value: 800
    },
    {
        date: "13:00",
        value: 1200
    },
    {
        date: "14:00",
        value: 700
    },
    {
        date: "15:00",
        value: 450
    },
    {
        date: "16:00",
        value: 600
    },
    {
        date: "17:00",
        value: 750
    },
    {
        date: "18:00",
        value: 1200
    },
    {
        date: "19:00",
        value: 1500
    },
    {
        date: "20:00",
        value: 1100
    },
    {
        date: "21:00",
        value: 800
    },
    {
        date: "22:00",
        value: 600
    },
    {
        date: "23:00",
        value: 542
    }
    ]

    if(mode == 'day') {
        transformedDataTotal = [
        {
            date: "1/1/2014",
            value: 5
        },
        {
            date: "2/1/2014",
            value: 6
        },
        {
            date: "3/1/2014",
            value: 3
        },
        {
            date: "4/1/2014",
            value: 7
        },
        {
            date: "5/1/2014",
            value: 20
        },
        {
            date: "6/1/2014",
            value: 60
        },
        {
            date: "7/1/2014",
            value: 150
        },
        {
            date: "8/1/2014",
            value: 200
        },
        {
            date: "9/1/2014",
            value: 250
        },
        {
            date: "10/1/2014",
            value: 400
        },
        {
            date: "11/1/2014",
            value: 450
        },
        {
            date: "12/1/2014",
            value: 180
        },
        {
            date: "13/1/2014",
            value: 800
        }
        ]
    }
    */

    // Clear the old time series
    $(svgId).html('');

    for (var i = 0; i < transformedDataTotal.length; i++) {
        transformedDataTotal[i].date = moment(transformedDataTotal[i].date,format);
    }

    var outputs = [
    {
        name: "Original",
        values: transformedDataTotal
    }
    ];

    if(transformedDataTotal2) {
        for (var i = 0; i < transformedDataTotal2.length; i++) {
            transformedDataTotal2[i].date = moment(transformedDataTotal2[i].date,format);
        }

        outputs.push({
            name: "Compared",
            values: transformedDataTotal2
        });
    }

    var svg = d3.select(svgId)
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    x.domain(d3.extent(transformedDataTotal, function(d) { 
        return d.date; 
    }));

    xBar.domain(d3.extent(transformedDataTotal, function(d) { 
        return d.date; 
    }));

    y.domain([
      d3.min(outputs, function(c) { return 0; }),
                  //d3.min(outputs, function(c) { return d3.min(c.values, function(v) { return v.value; }); }),
                  d3.max(outputs, function(c) { return d3.max(c.values, function(v) { return v.value; }); })
                  ]);

    svg.append("g")
    .attr("class", "x axis")
        //.attr("transform", "translate(0," + height + ")")
        .call(xAxis)
        .selectAll("text")  
        .style("text-anchor", "end")
        .attr("dx", "-2.2em")
        .attr("dy", "-6.15em")
        .attr("transform", function(d) {
            return "rotate(-60)" 
        });

        svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("Accidents");

        var thegraph = svg.selectAll(".thegraph")
        .data(outputs);

        //append a g tag for each line and set of tooltip circles and give it a unique ID based on the column name of the data     
        var thegraphEnter=thegraph.enter().append("g")
        .attr("clip-path", "url(#clip)")
        .attr("class", "thegraph")
        .attr('id',function(d){ return d.name+"-line"; })
        .style("stroke-width",2.5)
        .on("mouseover", function (d) {                                  
            d3.select(this)                          //on mouseover of each line, give it a nice thick stroke
            .style("stroke-width",'6px');
            
            var selectthegraphs = $('.thegraph').not(this);     //select all the rest of the lines, except the one you are hovering on and drop their opacity
            d3.selectAll(selectthegraphs)
            .style("opacity",0.2);
            
            var getname = document.getElementById(d.name);    //use get element cause the ID names have spaces in them
            var selectlegend = $('.legend').not(getname);    //grab all the legend items that match the line you are on, except the one you are hovering on

            d3.selectAll(selectlegend)    // drop opacity on other legend names
            .style("opacity",.2);

            d3.select(getname)
                .attr("class", "legend-select");  //change the class on the legend name that corresponds to hovered line to be bolder           
            })
        .on("mouseout", function(d) {        //undo everything on the mouseout
            d3.select(this)
            .style("stroke-width",'2.5px');
            
            var selectthegraphs = $('.thegraph').not(this);
            d3.selectAll(selectthegraphs)
            .style("opacity",1);
            
            var getname = document.getElementById(d.name);
            var getname2= $('.legend[fakeclass="fakelegend"]')
            var selectlegend = $('.legend').not(getname2).not(getname);

            d3.selectAll(selectlegend)
            .style("opacity",1);
            
            d3.select(getname)
            .attr("class", "legend");           
        });

    //actually append the line to the graph
    thegraphEnter.append("path")
    .attr("class", "line")
    .style("stroke", function(d) { return color(d.name); })
    .attr("d", line);

    //then append some 'nearly' invisible circles at each data point  
    thegraph.selectAll("circle")
    .data( function(d) {return(d.values);} )
    .enter()
    .append("circle")
    .attr("class","tipcircle")
    .attr("cx", function(d,i){return x(d.date)})
    .attr("cy",function(d,i){return y(d.value)})
    .attr("r",3)
            //.style('opacity', 1e-6)//1e-6
            .attr ("title", maketip);

        //append the legend
        var legend = svg.selectAll('.legend')
        .data(outputs);

        var legendEnter=legend
        .enter()
        .append('g')
        .attr('class', 'legend')
        .attr('id',function(d){ return d.name; })
        .on('click', function (d) {                           //onclick function to toggle off the lines            
            if($(this).css("opacity") == 1){                  //uses the opacity of the item clicked on to determine whether to turn the line on or off         

                var elemented = document.getElementById(this.id +"-line");   //grab the line that has the same ID as this point along w/ "-line"  use get element cause ID has spaces
                d3.select(elemented)
                .transition()
                .duration(1000)
                .style("opacity",0)
                .style("display",'none');

                d3.select(this)
                .attr('fakeclass', 'fakelegend')
                .transition()
                .duration(1000)
                .style ("opacity", .2);
            } else {

                var elemented = document.getElementById(this.id +"-line");
                d3.select(elemented)
                .style("display", "block")
                .transition()
                .duration(1000)
                .style("opacity",1);

                d3.select(this)
                .attr('fakeclass','legend')
                .transition()
                .duration(1000)
                .style ("opacity", 1);}
            });

    //make an empty variable to stash the last values into so i can sort the legend
    var lastvalues=[];

    //defines a function to be used to append the title to the tooltip.  you can set how you want it to display here.
    var maketip = function (d) {
        var tip = '<p class="tip1">' + d.value + '</p> <p class="tip3">'+ d.date.format(format) +'</p>';
        return tip;}

    // set the type of number here, n is a number with a comma, .2% will get you a percent, .2f will get you 2 decimal points
    var NumbType = d3.format(".2f");

    //create a scale to pass the legend items through
    var legendscale= d3.scale.ordinal()
    .domain(lastvalues)
    .range([0,30,60,90,120,150,180,210]);

    //actually add the circles to the created legend container
    legendEnter.append('circle')
    .attr('cx', width +20)
    .attr('cy', function(d){
        if(d.values.length > 0) {
            return legendscale(d.values[d.values.length-1].value);
        } else {
            return legendscale(0);
        }
    })
    .attr('r', 7)
    .style('fill', function(d) { 
        return color(d.name);
    });

    //add the legend text
    legendEnter.append('text')
    .attr('x', width+35)
    .attr('y', function(d){
        if(d.values.length > 0) {
            return legendscale(d.values[d.values.length-1].value);
        } else {
            return legendscale(0);
        }
    })
    .text(function(d){ return d.name; });

    // set variable for updating visualization
    var thegraphUpdate = d3.transition(thegraph);
    
    // change values of path and then the circles to those of the new series
    thegraphUpdate.select("path")
    .attr("d", function(d, i) {       

            //must be a better place to put this, but this works for now
            if(d.values.length > 0) {
                lastvalues[i]=d.values[d.values.length-1].value;
            } else {
                lastvalues[i]=0;
            }         
            lastvalues.sort(function (a,b){return b-a});
            legendscale.domain(lastvalues);

            return line(d.values); });

    thegraphUpdate.selectAll("circle")
    .attr ("title", maketip)
    .attr("cy",function(d,i){return y(d.value)})
    .attr("cx", function(d,i){return x(d.date)});


      // and now for legend items
      var legendUpdate=d3.transition(legend);
      
      legendUpdate.select("circle")
      .attr('cy', function(d, i){  
        if(d.values.length > 0) {
            return legendscale(d.values[d.values.length-1].value);
        } else {
            return legendscale(0);
        }
    });

      legendUpdate.select("text")
      .attr('y',  function (d) {
        if(d.values.length > 0) {
            return legendscale(d.values[d.values.length-1].value);
        } else {
            return legendscale(0);
        }
    });


     // update the axes,   
     d3.transition(svg).select(".y.axis")
     .call(yAxis);   

     d3.transition(svg).select(".x.axis")
     .attr("transform", "translate(0," + height + ")")
     .call(xAxis);

    //make my tooltips work
    $('circle').tipsy({opacity:.9, gravity:'n', html:true});
}