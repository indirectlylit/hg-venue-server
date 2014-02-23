
/**
 * Write a square wave using the wiringPi GPIO utility:
 *
 *   http://wiringpi.com/the-gpio-utility/
 *
 * Devon Rueckner
 * The Human Grid
 * All rights reserved
 */


var childProcess = require('child_process');
var events = require('events');
var os = require('os');

var eventEmitter = new events.EventEmitter();


// physical pin 24
OUTPUT_PIN = 10;

var ready = false;
childProcess.exec('gpio mode '+OUTPUT_PIN+' out', function(err, std_out, std_err) {
  if (!err) {
    ready = true;
  }
});


var generateWave = false;
var state = 0;



setInterval(function() {
  if (generateWave && ready) {
    state = state === 0 ? 1 : 0;
    childProcess.exec('gpio write '+OUTPUT_PIN+' '+state, function(err, std_out, std_err) {
      if (!err) {
        eventEmitter.emit('edge', state);
      }
    });
  }
}, 2000);


module.exports.outputSquareWave = function(state) {
  generateWave = state;
};

module.exports.wave = eventEmitter;
