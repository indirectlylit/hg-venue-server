

/**
 * UDP Listener
 *
 * Devon Rueckner
 * The Human Grid
 * All rights reserved
 */


var app_logger = require("./app.logger");

var dgram = require("dgram");
var udpServer = dgram.createSocket("udp4");

udpServer.on("listening", function () {
  var address = udpServer.address();
  app_logger.info("udpServer listening " + address.address + ":" + address.port);
});

udpServer.bind(7777);

module.exports = udpServer;

