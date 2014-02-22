
/**
 * Serial Port Listener
 *
 * Devon Rueckner
 * The Human Grid
 * All rights reserved
 */


var serialport = require("serialport");

var SERIAL_PORT = "/dev/ttyUSB0";
var SERIAL_RATE = 57600;
var serial_active = false;

var serialPortObject = new serialport.SerialPort(SERIAL_PORT,
  {baudrate: SERIAL_RATE, parser: serialport.parsers.readline("\n")},
  false
);

serialPortObject.on("close", function(data) {
  serial_active = false;
  console.log("\n----\nClosed SerialPort at "+Date.now()+"\n----\n");
});

function attemptLogging() {
  serialPortObject.open(function(error) {
    if (error) {
      serial_active = false;
      return;
    }
    serial_active = true;
    console.log("\n----\nOpened SerialPort at "+Date.now()+"\n----\n");
  });
}

setInterval(function() {
  if (!serial_active) {
    attemptLogging();
  }
}, 1000);


exports.serialServer = serialPortObject;
