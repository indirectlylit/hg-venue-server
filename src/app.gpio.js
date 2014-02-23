
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

// physical pin 24
var OUTPUT_PIN = 10;

var eventEmitter = new events.EventEmitter();
var generateWave = false;
var waveState = 0;


//// EXPORTS

module.exports = eventEmitter;

module.exports.outputSquareWave = function(state, callback) {
  generateWave = state;
  app_settings.set('output_square_wave', state, callback);
};



//// MODULE LOGIC

// set the pin to be an output
childProcess.exec('gpio mode '+OUTPUT_PIN+' out', function(err, std_out, std_err) {
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
    childProcess.exec('gpio write '+OUTPUT_PIN+' '+waveState, function(err, std_out, std_err) {
      if (!err) {
        // return current state and the time it took to change the state in microseconds
        eventEmitter.emit('edge', waveState, process.hrtime(t_0)[1]/1e3);
      }
    });
  }, 2000);
});



