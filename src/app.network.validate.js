
// Devon Rueckner
// The Human Grid
// All Rights Reserved



//// EXTERNAL MODULES

var _ = require('lodash');


//// INTERNALS

var INV_BOX_KEYS = [
  'i', 'inv', 'kind', 'ms', 'soft', 'uid', 'v'
];

var CAP_BOX_KEYS = [
  'c_in', 'c_out_fwd', 'c_out_rev', 'c_shunt', 'error',
  'fan', 'i', 'kind', 'ms', 'shunts', 'temp', 'uid', 'v'
];

var AC_BOX_KEYS = [
  'btn', 'c_t1', 'c_t2', 'c_t3', 'c_t4', 'error', 'fan',
  'i', 'kind', 'ms', 'reset', 'server', 'temp', 'tiers',
  'uid', 'v_ac', 'v_dc', 'v_t1', 'v_t2', 'v_t3', 'v_t4'
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


//// EXPORT

function validateMsg(msg) {
  if (msg.kind === 'inv') {
    _checkKeys(INV_BOX_KEYS, msg);
  } else if (msg.kind === 'caps') {
    _checkKeys(CAP_BOX_KEYS, msg);
  } else if (msg.kind === 'acnet') {
    _checkKeys(AC_BOX_KEYS, msg);
  }
}


module.exports = validateMsg;
