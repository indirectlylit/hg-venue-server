// Devon Rueckner
// The Human Grid
// All Rights Reserved

/*
    Configuration
*/

var TIME_WINDOW = 3;      // x-axis (seconds)
var POWER_DOMAIN = 1600;  // y-axis (watts)
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
var bikeData = {
  0:[],
  1:[],
  2:[],
  3:[]
};   // object of lists, where each key is an address
var bikeAddrs = [0, 1, 2, 3];  // list of the keys in bikeData
var shuntData = {
  'in' : [],
  'out': [],
  'volts': []
};


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


function average(arr) {
  total = 0;
  for (var i = 0; i < arr.length; i++) {
    total += arr[i];
  }
  return total / arr.length;
}


/*
    Data Stream
*/


var StreamHandler = (function(){

  var sock = new SockJS(window.location.protocol+'//'+window.location.hostname+':8081/data');

  var offset;
  var inv_elem = $("#inverter_val");
  var tiers_elem = $("#tiers_val");
  var shunts_elem = $("#shunts_val");
  var volts_elem = $("#value_volts");
  var in_elem = $("#value_in");
  var out_elem = $("#value_out");

  sock.onmessage = function(e) {
    /*
    Handle each incoming message.
    Limit the size to max_data.
    */
    var d = jQuery.parseJSON(e.data);
    d.timestamp = Date.parse(d.timestamp);

    if (!offset) {
      // account for clock skew between devices
      offset = Date.now() - d.timestamp;
    }

    // also pretend it's slightly in the future to prevent incoming data flicker
    d.timestamp += offset + 1000;

    if (d['machine'] == "shunt") {
      shuntData['in'].push(d['data']['p1']);
      shuntData['out'].push(d['data']['p2']);
      shuntData['volts'].push(d['data']['v']);
      purge(shuntData['in']);
      purge(shuntData['out']);
      purge(shuntData['volts']);

      in_elem.text(Math.floor(average(shuntData['in'])) + " watts");
      out_elem.text(Math.floor(average(shuntData['out'])) + " watts");
      volts_elem.text(average(shuntData['volts']).toFixed(1) + " volts");

      inv_elem.text(d['data']['inverter'] ? 'On' : 'Off');
      tiers_elem.text(d['data']['tiers']);
      shunts_elem.text(d['data']['shunts']);

    }

  };

})();


