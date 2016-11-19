
// Devon Rueckner
// The Human Grid
// All Rights Reserved


//// EXPORTS
MachineKinds = {
  AC: "4-ac",
  BIKE: "bike",
  INVERTER: "inv",
  CAPS_SHUNTS: "caps",
  AC_NETWORK: "acnet",
};

NumSensors = {};
NumSensors[MachineKinds.BIKE] = 1;
NumSensors[MachineKinds.AC] = 4;


module.exports = {
  MachineKinds: MachineKinds,
  NumSensors: NumSensors,
};


