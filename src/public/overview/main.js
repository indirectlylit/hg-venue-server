
// Devon Rueckner
// The Human Grid
// All Rights Reserved


var MachineKinds = {
  AC: "4-ac",
  BIKE: "bike",
  INVERTER: "inv",
  CAPS_SHUNTS: "caps",
  AC_NETWORK: "acnet",
};

var wattageScale1k = d3.scaleLinear()
    .domain([0, 1000])
    .range([0, 1]);

var wattageScale4k = d3.scaleLinear()
    .domain([0, 4000])
    .range([0, 1]);

function celsiusToFahrenheit(c) {
  return 32 + c * 9 / 5;
}

function comparator(a, b) {
  if (!a.unlabeled && b.unlabeled) { return -1; }
  if (!b.unlabeled && a.unlabeled) { return 1; }
  if (a.label < b.label) { return -1; }
  if (b.label < a.label) { return 1; }
  return 0;
}


views = {
  bikes: function() {
    var rows = _(app.state.networkStats)
      .where({'kind': app.KIND.BIKE})
      .map()
      .sortByOrder([
        'unlabeled',
        function (i) {
          return i.label.toLowerCase(); }
      ])
      .value();

    return { 'rows': rows };
  },
  ac: function() {
    var acStats = _.where(app.state.networkStats, {'kind': app.KIND.AC});
    var rows = [];
  },
};


app.view = new Vue({
  el: '#root-view',
  created: function() {
    var that = this;
    app.websocket.on('stats.network', function (stats) {
      that.network = stats;
      that.connected = true;
    });
    app.websocket.on('connecting', function (msg) {
      that.connected = false;
    });
    app.websocket.on('error', function (msg) {
      that.connected = false;
    });
    app.websocket.on('close', function (msg) {
      that.connected = false;
    });
    app.websocket.on('open', function (msg) {
      that.connected = true;
    });
  },
  computed: {
    acNetBoxConnected: function() {
      return this.network[MachineKinds.AC_NETWORK].length === 1;
    },
    acNetBoxState: function() {
      if (!this.acNetBoxConnected) {
        return undefined;
      }
      var acbox = this.network[MachineKinds.AC_NETWORK][0];
      var state = {
        temperature: celsiusToFahrenheit(acbox.temp).toFixed(2),
        tiers: [],
      };
      for (var i = 0; i < acbox.numTiers; i++) {
        var on = i < acbox.tiersOn;
        state.tiers.push({
          number: i+1,
          on: on,
          error: on && !acbox.tierSense[i],
          watts: (acbox.v_ac * acbox.c_tiers[i]).toFixed(0),
        });
      }
      return state;
    },
    capsShuntsBoxConnected: function() {
      return this.network[MachineKinds.CAPS_SHUNTS].length === 1;
    },
    capsShuntsBoxState: function() {
      if (!this.capsShuntsBoxConnected) {
        return undefined;
      }
      var capbox = this.network[MachineKinds.CAPS_SHUNTS][0];
      return {
        voltage: capbox.v.toFixed(2),
        nShunts: Math.round(capbox.shunts * 10) / 10, // show decimal only if necessary
        temperature: celsiusToFahrenheit(capbox.temp).toFixed(2),
        wattsGenerated: (capbox.c_in * capbox.v).toFixed(0),
        wattsConsumed: ((capbox.c_out_fwd - capbox.c_out_rev) * capbox.v).toFixed(0),
        wattsShunted: (capbox.c_shunt * capbox.v).toFixed(0),
      };
    },
    inverterBoxConnected: function() {
      return this.network[MachineKinds.INVERTER].length === 1;
    },
    inverterBoxState: function() {
      if (!this.inverterBoxConnected) {
        return undefined;
      }
      var inverter = this.network[MachineKinds.INVERTER][0];
      var text = 'Off';
      if (inverter.inv) {
        text = inverter.soft ? 'On' : 'starting…';
      }
      return {
        on: inverter.inv && inverter.soft,
        text: text,
      };
    },
    numACDevices: function() {
      return this.network[MachineKinds.AC].length;
    },
    acSensors: function() {
      var acStats = this.network[MachineKinds.AC];
      var rows = [];
      _.forEach(acStats, function(stats){
        for (var i=0; i < stats.c_ckts.length; i++) {
          var power_out = stats.v * stats.c_ckts[i];
          // power_out = power_out < 5 ? 0 : power_out; // zero below some threshold
          var row = {
            watts: power_out.toFixed(0),
            device_id: stats.device_id,
          };
          if (stats.labels && stats.labels[i]) {
            row.unlabeled = false;
            row.label = stats.labels[i];
          } else {
            row.unlabeled = true;
            row.label = ['#', stats.device_id, '-', String.fromCharCode('A'.charCodeAt(0)+i)].join(' ');
          }
          rows.push(row);
        }
      });
      return rows.sort(comparator);
    },
    dcSensors: function() {
      return this.network[MachineKinds.BIKE].map(function (stats, i) {
        var power_out = stats.v * stats.c_out;
        // power_out = power_out < 5 ? 0 : power_out; // zero below some threshold
        var row = {
          watts: power_out.toFixed(0),
          device_id: stats.device_id,
        };
        if (stats.label) {
          row.unlabeled = false;
          row.label = stats.label;
        } else {
          row.unlabeled = true;
          row.label = '# ' + stats.device_id;
        }
        return row;
      }).sort(comparator);
    },
  },
  data: {
    connected: false,
    network: {
      "4-ac": [],
      "bike": [],
      "inv": [],
      "caps": [],
      "acnet": []
    },
  },
});


app.websocket.start();



