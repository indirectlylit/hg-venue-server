
/**
 * Serial Port Listener
 *
 * Devon Rueckner
 * The Human Grid
 * All rights reserved
 */


//// EXTERNAL MODULES

var _ = require('lodash');
var events = require('events');
var os = require('os');
var serialport = require("serialport");


//// LOCAL FUNCTIONS

function createSerialPort(name) {
  var port = new serialport.SerialPort("/dev/" + name,
    {baudrate: SERIAL_RATE, parser: serialport.parsers.readline("\n")},
    false
  );
  port.on("close", function (data) {
    serial_active = false;
    console.log("\n----\nClosed SerialPort at "+Date.now()+"\n----\n");
  });
  port.on("data", function (data) {
    eventEmitter.emit("data", data);
  });
  return port;
}

function attemptLogging() {
  if (!serial_active) {
    serialPort.open(function (error) {
      if (error) {
        serial_active = false;
        return;
      }
      serial_active = true;
      console.log("\n----\nOpened SerialPort at "+Date.now()+"\n----\n");
    });
  }
}

//// LOCAL VARIABLES

var SERIAL_RATE = 57600;

var serial_active = false;
var eventEmitter = new events.EventEmitter();

var portName = os.arch() === "arm" ? "ttyAMA0" : "ttyUSB0";
var serialPort = createSerialPort(portName);


//// MODULE LOGIC

setInterval(attemptLogging, 1000);


//// EXPORTS

// emits 'message' events
module.exports = eventEmitter;
