

// Devon Rueckner
// The Human Grid
// All Rights Reserved



var fs = require("fs");

var dataLog = fs.createWriteStream("./data.log");
var errLog = fs.createWriteStream("./errors.log");


var webServer = require("./webServer");


function handleIncomingData(message, address) {
  var isodate = new Date().toISOString();
  var data = {};

  try {
    data = JSON.parse(message);
  } catch(e) {
    err = isodate + "\t" + address + "\t" + message + '\n';
    console.log("Not JSON:\t"+err);
    errLog.write(err);
    return;
  }

  data['timestamp'] = isodate;
  data['address'] = address;

  var line = JSON.stringify(data);
  dataLog.write(line + '\n');

  console.log('[' + address + ']\t' + line);

  webServer.writeToWebSockets(line);
}



var udpServer = require("./udpServer").udpServer;

udpServer.on("message", function (msg, rinfo) {
  handleIncomingData(msg, rinfo.address);
});


var serialServer = require("./serialServer").serialServer;

serialServer.on("data", function(data) {
  handleIncomingData(data.toString(), "serial port");
});

