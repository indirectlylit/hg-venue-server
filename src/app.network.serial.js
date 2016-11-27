
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


//// INTERNAL MODULES

var app_logger = require("./app.logger");


//// LOCAL FUNCTIONS

function createSerialPort(name) {
  var port = new serialport.SerialPort("/dev/" + name,
    {baudrate: SERIAL_RATE, parser: serialport.parsers.readline("\n")},
    false
  );
  port.on("close", function (data) {
    serial_active = false;
    app_logger.info("Closed SerialPort", portName, serialPort);
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
      app_logger.info("Opened SerialPort", portName, serialPort);
    });
  }
}

//// LOCAL VARIABLES

var SERIAL_RATE = 57600;

var serial_active = false;
var eventEmitter = new events.EventEmitter();

var portName = os.arch() === "arm" ? "ttyO4" : "ttyUSB0";
var serialPort = createSerialPort(portName);


//// MODULE LOGIC

setInterval(attemptLogging, 1000);


//// EXPORTS

// emits 'message' events
module.exports = eventEmitter;
