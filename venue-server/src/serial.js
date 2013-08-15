/*
  https://github.com/voodootikigod/node-serialport/blob/master/examples/logger.js

  Simple example that takes a command line provided serial port destination and
  routes the output to a file of the same name with .log appended to the port name.

  usage: node logger.js /dev/tty.usbserial <baudrate>
*/

var SerialPort = require("serialport");
var fs = require("fs");
var port = "/dev/ttyUSB0";
var baudrate = 57600;
var active = false;

function attemptLogging(port, baudrate) {
  if (!active) {
    active = true;

    var serialPort = new SerialPort.SerialPort(port, {
      baudrate: baudrate
    });

    console.log("\n----\nOpening SerialPort at "+Date.now()+"\n----\n");

    serialPort.on("data", function (data) {
     console.log(data.toString());
    });

    serialPort.on("close", function (data) {
      active = false;
      console.log("\n----\nClosing SerialPort at "+Date.now()+"\n----\n");
    });
  }
}

setInterval(function() {
  if (!active) {
    try {
      attemptLogging(port, baudrate);
    } catch (e) {
      console.log("ERROR");
      console.log(e);
      // Error means port is not available for listening.
      active = false;
    }
  }
}, 1000);

