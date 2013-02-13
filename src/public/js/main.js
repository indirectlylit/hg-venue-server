// Devon Rueckner
// The Human Grid
// All Rights Reserved

/*
    Configuration
*/

var TIME_WINDOW = 3;      // x-axis (seconds)
var POWER_DOMAIN = 1000;  // y-axis (watts)
var FRAME_PERIOD = 25;    // how often to try and repaint (ms)



/*
    Polyfills and Utilities
*/

// Date.now()
if (!Date.now) {
  Date.now = function now() {
    return +(new Date());
  };
}


/*
    Global Variables
*/

var max_data = 50;
var bikeData = {};   // object of lists, where each key is an address
var bikeAddrs = [];  // list of the keys in bikeData
var shuntData = [];  // list data


/*
    Global Helpers
*/

function last_n(d_arr, n) {
  return d_arr.slice(d_arr.length-Math.min(n, d_arr.length));
}

function purge(data) {
  var outOfRange = function(d) {
    return d.t < Date.now()-1000*(TIME_WINDOW+0.5);
  };
  while(data.length !== 0 && outOfRange(data[0]))
    data.shift();
}




/*
    Metrics Tracking
*/

var MetricsTracker = (function(){
  var MetricsTracker = {};

  var rateElement = $("#datarate");
  var lastUpdateTime = Date.now();

  var MIN_REFRESH_INTERVAL = 50;
  var MAX_REFRESH_INTERVAL = 500;

  var getDataRate = function(){
    /*
    Calculate the average rate that we're receiving
    data from the stream
    */
    var samples = last_n(shuntData, 10).map(
        function(x){ return x.t; }
      );
    var rateSum = 0;
    samples.forEach(
        function(e, i, a) {
          if (!i) return;
          rateSum += e-samples[i-1];
        }
      );
    return (1000.0 * samples.length / rateSum).toFixed(1);
  };

  MetricsTracker.update = function(){
    if (shuntData.length < 2)
      return;

    var now = Date.now();

    if (now - lastUpdateTime < MIN_REFRESH_INTERVAL)
      return;

    var t0 = shuntData[shuntData.length - 1].t;

    if (now - t0 > 750)
      rateElement.text("no data");
    else
      rateElement.text(getDataRate() + " fps");

    lastUpdateTime = now;
  };

  setTimeout(
      function(){
        if (Date.now() - lastUpdateTime > MAX_REFRESH_INTERVAL)
          MetricsTracker.update();
        setTimeout(arguments.callee, MAX_REFRESH_INTERVAL);
      },
      MAX_REFRESH_INTERVAL
    );

  return MetricsTracker;
})();



/*
    Graphing
*/

var Graph = (function(){
  Graph = {};
  var margin = {top: 6, right: 6, bottom: 20, left: 40};
  var valueElement = $("#value");
  var svgElement = $("#graph");
  function width(){return svgElement.width()-margin.right-margin.left;}
  function height(){return 200-margin.top-margin.bottom;}

  var xScale = d3.scale.linear();
  var yScale = d3.scale.linear()
      .domain([0, POWER_DOMAIN])
      .range([height(), 0]);

  var svg = d3.select("#graph").append("svg")
      .attr("class", "chart")
    .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
      .attr("height", height() + margin.top + margin.bottom);

  var clipPathRect = svg.append("defs").append("clipPath")
      .attr("id", "clip")
    .append("rect")
      .attr("height", height());

  var yAxis = d3.svg.axis()
      .scale(yScale)
      .tickValues(d3.range(0, 5000, 200))
      .orient("left");

  var yAxisElement = svg.append("g")
      .attr("class", "y axis")
      .attr("transform", "translate(0.5,0.5)") // align to pixels
      .call(yAxis);

  var xAxis = d3.svg.axis()
      .tickValues([-TIME_WINDOW, 0])
      .tickFormat(d3.format("f"))
      .orient("bottom");

  var xAxisElement = svg.append("g")
      .attr("transform", "translate(0.5," + (0.5 + height()) + ")")
      .attr("class", "x axis");

  var area = d3.svg.area()
      .interpolate("basis")
      .x(function(d, i) { return xScale(d.t); })
      .y0(height())
      .y1(function(d, i) { return yScale(d.p); });

  var pathContainer = svg.append("g")
      .attr("clip-path", "url(#clip)");

  var dataPath = pathContainer.append("path")
      .data([shuntData])
      .attr("class", "area")
      .attr("d", area);

  var line = d3.svg.line()
      .x(function(d, i) { return i ? 0 : width(); })
      .y(function(d, i) { return yScale(d); });

  var avgs = [0, 0];
  var avgPath = pathContainer.append("path")
      .data([avgs])
      .attr("class", "line")
      .attr("d", line);

  Graph.sizeGraph = function() {
    svg.attr("width", width() + margin.left + margin.right);
    xScale.range([0, width()]);
    clipPathRect.attr("width", width());
    xAxisElement.call(xAxis.scale(xScale.domain([-TIME_WINDOW, 0])));
  };


  Graph.redraw = function() {

    if (shuntData.length === 0)
      return;

    var powervals = shuntData.map(function(d){return d.p;});
    var mean = d3.mean(powervals);
    avgs[0] = avgs[1] = mean;
    valueElement.text(d3.round(mean));

    var now = Date.now();
    xScale.domain([now-TIME_WINDOW*1000, now]);
    yScale.domain([0, Math.max(POWER_DOMAIN, d3.max(powervals))]);
    yAxisElement.call(yAxis);
    dataPath.attr("d", area);
    avgPath.attr("d", line);
  };

  Graph.sizeGraph();
  $(window).resize(Graph.sizeGraph);

  setTimeout(
      function(){
        Graph.redraw();
        setTimeout(arguments.callee, FRAME_PERIOD);
      },
      FRAME_PERIOD
    );

  return Graph;

})();


/*
    Data Stream
*/


var StreamHandler = (function(){

  var sock = new SockJS('http://127.0.0.1:8081/data');

  sock.onmessage = function(e) {
    /*
    Handle each incoming message.
    Limit the size to max_data.
    */
    var d = jQuery.parseJSON(e.data);
    // pretend it's slightly in the future to prevent incoming data flicker
    d.timestamp = Date.parse(d.timestamp)+500;

    // // assuming clocks are synchronized, this is the delay from client to server:
    // d.arrival_time = Date.now();
    // console.log(d.timestamp - d.arrival_time);

    if (d['machine'] == "bike") {
      var addr = d['address'];
      if (bikeData[addr] === undefined) {
        bikeData[addr] = [];
        bikeAddrs.push(addr);
      }
      dataPoint = {
        't' : d['timestamp'],
        'p' : d['data']['p2']
      };
      bikeData[addr].push(dataPoint);
      purge(bikeData[addr]);
    }

    else if (d['machine'] == "shunt") {
      dataPoint = {
        't' : d['timestamp'],
        'p' : d['data']['p1']
      };
      shuntData.push(dataPoint);
      purge(shuntData);
    }

//    MetricsTracker.update();

  };

})();


