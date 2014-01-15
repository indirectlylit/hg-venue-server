

/**
 * UDP Listener
 * 
 * Devon Rueckner
 * The Human Grid
 * All rights reserved
 */


var dgram = require("dgram");



var udpServer = dgram.createSocket("udp4");

udpServer.on("listening", function () {
  var address = udpServer.address();
  console.log("udpServer listening " + address.address + ":" + address.port);
});

udpServer.bind(7777);

exports.udpServer = udpServer;

