
/**
 * Write a square wave using the wiringPi GPIO utility:
 *
 *   http://wiringpi.com/the-gpio-utility/
 *
 * Devon Rueckner
 * The Human Grid
 * All rights reserved
 */


//// EXTERNAL MODULES

var childProcess = require('child_process');
var events = require('events');
var os = require('os');


//// INTERNAL MODULES

var app_settings = require("./app.settings");


//// LOCAL VARIABLES

// pins: https://projects.drogon.net/raspberry-pi/wiringpi/pins/
var HEADER_PIN_MAP = {
  1   :     null,   // 3.3v
  2   :     null,   // 5v
  3   :     8,      // SDA0
  4   :     null,   // 5v
  5   :     9,      // SCL0
  6   :     null,   // 0v
  7   :     7,      // GPIO7
  8   :     15,     // TxD
  9   :     null,   // 0v
  10  :     16,     // RxD
  11  :     0,      // GPIO0
  12  :     1,      // GPIO1
  13  :     2,      // GPIO2
  14  :     null,   // 0v
  15  :     3,      // GPIO3
  16  :     4,      // GPIO4
  17  :     null,   // 3.3v
  18  :     5,      // GPIO5
  19  :     12,     // MOSI
  20  :     null,   // 0v
  21  :     13,     // MISO
  22  :     6,      // GPIO6
  23  :     14,     // SCLK
  24  :     10,     // CE0
  25  :     null,   // 0v
  26  :     11,     // CE1
};

var pin = 22;

var eventEmitter = new events.EventEmitter();
var generateWave = app_settings.get('output_square_wave');
var waveState = 0;
var wavePeriod = 4000;


//// LOCAL FUNCTIONS

var outputSquareWave = function(state, callback) {
  generateWave = state;
  app_settings.set('output_square_wave', state, callback);
};

var getWaveInfo = function() {
  return {
    period: wavePeriod / 1000.0,
    pin: pin,
    on: generateWave
  };
};


//// MODULE LOGIC

// set the pin to be an output
childProcess.exec('gpio mode '+HEADER_PIN_MAP[pin]+' out', function(err, std_out, std_err) {
  if (err) {
    console.log("Could not set GPIO pin to Output");
    return;
  }
  // once the pin mode is set, set up a square wave
  setInterval(function() {
    if (!generateWave) {
      return;
    }
    var t_0 = process.hrtime();
    waveState = waveState === 0 ? 1 : 0;
    childProcess.exec('gpio write '+HEADER_PIN_MAP[pin]+' '+waveState, function(err, std_out, std_err) {
      if (!err) {
        // return current state and the time it took to change the state in microseconds
        eventEmitter.emit('edge', waveState, process.hrtime(t_0)[1]/1e3);
      }
    });
  }, wavePeriod/2);
});


//// EXPORTS

// emits 'edge' events
module.exports = eventEmitter;

module.exports.outputSquareWave = outputSquareWave;
module.exports.getWaveInfo = getWaveInfo;


