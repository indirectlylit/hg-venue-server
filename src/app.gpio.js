
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


//// INTERNAL VARIABLES

// physical pin 24
var OUTPUT_PIN = 10;

var eventEmitter = new events.EventEmitter();
var generateWave = false;
var waveState = 0;


//// EXPORTS

module.exports = eventEmitter;

module.exports.outputSquareWave = function(state) {
  generateWave = state;
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
    waveState = waveState === 0 ? 1 : 0;
    childProcess.exec('gpio write '+OUTPUT_PIN+' '+waveState, function(err, std_out, std_err) {
      if (!err) {
        eventEmitter.emit('edge', waveState);
      }
    });
  }, 2000);
});



