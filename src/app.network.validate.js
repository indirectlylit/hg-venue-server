
// Devon Rueckner
// The Human Grid
// All Rights Reserved



//// EXTERNAL MODULES

var _ = require('lodash');


//// INTERNALS

var INV_BOX_KEYS = [
  'i', 'inv', 'kind', 'ms', 'soft', 'v'
];

var CAP_BOX_KEYS = [
  'c_in', 'c_out_fwd', 'c_out_rev', 'c_shunt', 'error',
  'fan', 'i', 'kind', 'ms', 'shunts', 'temp', 'v'
];

var AC_BOX_KEYS = [
  'btn', 'c_t1', 'c_t2', 'c_t3', 'c_t4', 'error', 'fan',
  'i', 'kind', 'ms', 'reset', 'server', 'temp', 'tiers',
  'v_ac', 'v_dc', 'v_t1', 'v_t2', 'v_t3', 'v_t4'
];

function _checkKeys(expected, msg) {
  received = _.keys(msg);
  if (expected.length !== received.length) {
    throw new Error('Expected properties: ' + expected.toString() + '; received: ' + received.toString());
  }
  for (var i = 0; i < received.length; i++) {
    if (expected.indexOf(received[i]) === -1) {
      throw new Error('Unexpected property: ' + received[i]);
    }
  }
}


//// EXPORTS

// The Serial-to-Ethernet converter will append three bytes of
// error reporting data if it detects a checksum issue.
function checksumReport(msg) {
  var FLAG = msg.length-1;
  var RECEIVED = msg.length-2;
  var EXPECTED = msg.length-3;
  if (msg[FLAG] === '!') {
    var errorMsg = 'Serial-to-Ethernet checksum failure.' +
      ' Expected: 0x' + msg.charCodeAt(EXPECTED).toString(16) +
      ' Received: 0x' + msg.charCodeAt(RECEIVED).toString(16)
    throw new Error(errorMsg);
  }
}

function validateProps(msg) {
  if (msg.kind === 'inv') {
    _checkKeys(INV_BOX_KEYS, msg);
  } else if (msg.kind === 'caps') {
    _checkKeys(CAP_BOX_KEYS, msg);
  } else if (msg.kind === 'acnet') {
    _checkKeys(AC_BOX_KEYS, msg);
  }
}


module.exports = {
  checksumReport: checksumReport,
  validateProps: validateProps,
};
