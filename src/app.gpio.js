
/**
 * Write a square wave using the wiringPi GPIO utility:
 *
 *   http://wiringpi.com/the-gpio-utility/
 *
 * Devon Rueckner
 * The Human Grid
 * All rights reserved
 */


//// PIN CONFIGURATION

// note - these number refer to the Pi's header pins:
//  https://projects.drogon.net/raspberry-pi/wiringpi/pins/
var REFERENCE_SIGNAL      = 11; // (output) used for measuring latency
var SERVER_STATUS         = 12; // (output) whether the server is running
var NOT_SHUTDOWN_REQUEST  = 13; // (input) shutdown request, active low


//// EXTERNAL MODULES

var child_process = require('child_process');
var events = require('events');
var os = require('os');


//// INTERNAL MODULES

var app_settings = require("./app.settings");


//// GPIO ACCESS

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

var GPIO_BIN = "/usr/local/bin/gpio";

// initiate a command to the GPIO utility
var gpio = function(command, callback) {
  child_process.exec(GPIO_BIN + ' ' + command, function (err, std_out, std_err) {
    callback(err, std_out.trim());
  });
};

// state = "in", "out", "pwm", "clock", "up", "down", "tri"
var setPinMode = function(pin, state, callback) {
  gpio('mode '+HEADER_PIN_MAP[pin]+' '+state, function (err) {
    if (err) {
      err = "Could not set GPIO pin " + pin + " to " + state + ": " + err;
      console.log(err);
      callback(err);
      return;
    }
    callback(null);
  });
};

// state = true, false
var writePin = function(pin, state, callback) {
  state = state ? '1' : '0';
  gpio('write '+HEADER_PIN_MAP[pin]+' '+state, function (err) {
    if (err) {
      err = "Could not write a " + state + " to GPIO pin " + pin + ": " + err;
      console.log(err);
      callback(err);
      return;
    }
    callback(null);
  });
};

// returns true, false
var readPin = function(pin, callback) {
  gpio('read '+HEADER_PIN_MAP[pin], function (err, val) {
    if (err) {
      err = "Could not read GPIO pin " + pin + ": " + err;
      console.log(err);
      callback(err);
      return;
    }
    callback(null, val === '1');
  });
};



//// LOCAL VARIABLES

var eventEmitter = new events.EventEmitter();
var generateWave = app_settings.get('output_square_wave');
var waveState = false;
var wavePeriod = 4000;


//// LOCAL FUNCTIONS

var outputSquareWave = function(state, callback) {
  generateWave = state;
  app_settings.set('output_square_wave', state, callback);
};

var getWaveInfo = function() {
  return {
    period: wavePeriod / 1000.0,
    pin: REFERENCE_SIGNAL,
    on: generateWave
  };
};


//// MODULE LOGIC

// set the reference signal pin to be an output and set up a square wave
setPinMode(REFERENCE_SIGNAL, 'out', function (err, std_out, std_err) {
  if (err) return;
  // once the pin mode is set, set up a square wave
  setInterval(function() {
    if (!generateWave) return;
    var t_0 = process.hrtime();
    waveState = !waveState;
    writePin(REFERENCE_SIGNAL, waveState, function (err, std_out, std_err) {
      if (err) return;
      // return current state and the time it took to change the state in microseconds
      eventEmitter.emit('edge', waveState, process.hrtime(t_0)[1]/1e3);
    });
  }, wavePeriod/2);
});


// get ready to listen for shutdown commands
setPinMode(NOT_SHUTDOWN_REQUEST, 'in', function (err) {
  if (err) return;

  // default state of this input is to not shutdown
  setPinMode(NOT_SHUTDOWN_REQUEST, 'up', function (err) {
    if (err) return;

    // get the status pin mode ready
    setPinMode(SERVER_STATUS, 'out', function (err) {
      if (err) return;

      // begin polling for the shutdown signal every two seconds
      setInterval(function checkForShutdown() {
        readPin(NOT_SHUTDOWN_REQUEST, function (err, notShutdown) {
          if (err) return;

          // double-negative because pin is active-low
          if (!notShutdown) {
            eventEmitter.emit('shutdown');
          }
        });
      }, 2000);

      // indicate to the power controller that we're ready to receive shutdown signals
      writePin(SERVER_STATUS, true, function (){});
    });
  });
});


//// EXPORTS

// emits 'edge' and 'shutdown' events
module.exports = eventEmitter;

module.exports.outputSquareWave = outputSquareWave;
module.exports.getWaveInfo = getWaveInfo;


