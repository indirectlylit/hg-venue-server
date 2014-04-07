
/**
 * Serial Port Listener
 *
 * Devon Rueckner
 * The Human Grid
 * All rights reserved
 */


var _ = require('lodash');
var events = require('events');
var serialport = require("serialport");

var SERIAL_PORTS = ["ttyAMA0", "ttyUSB0"];
var SERIAL_RATE = 57600;

// this logic may not work if a machine uses multiple ports
var serial_active = false;


var eventEmitter = new events.EventEmitter();

function createSerialPort(name) {
  var port = new serialport.SerialPort("/dev/" + name,
    {baudrate: SERIAL_RATE, parser: serialport.parsers.readline("\n")},
    false
  );
  port.on("close", function(data) {
    serial_active = false;
    console.log("\n----\nClosed SerialPort at "+Date.now()+"\n----\n");
  });
  port.on("data", function(data) {
    eventEmitter.emit("data", data);
  });
  return port;
}

var serialPorts = _.map(SERIAL_PORTS, createSerialPort);

function attemptLogging() {
  _.each(serialPorts, function(port){
    if (!serial_active) {
      port.open(function(error) {
        if (error) {
          serial_active = false;
          return;
        }
        serial_active = true;
        console.log("\n----\nOpened SerialPort at "+Date.now()+"\n----\n");
      });
    }
  });
}

setInterval(function() {
  if (!serial_active) {
    attemptLogging();
  }
}, 1000);


// emits 'message' events
module.exports = eventEmitter;
