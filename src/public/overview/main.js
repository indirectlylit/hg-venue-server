
// Devon Rueckner
// The Human Grid
// All Rights Reserved


views = {
  bikes: function() {
    var rows = _(app.state.networkStats)
      .where({'kind': app.KIND.BIKE})
      .map(function(stats, i){
        var power_out = stats.avg_v * stats.avg_c_out[0];

        // TEMPORARY - zero below some threshold
        power_out = power_out < 5 ? 0 : power_out;

        var row = {
          power_out: power_out.toFixed(0),
          power_out_pct: 100.0 * (power_out / app.maxGraph),
        };
        if (app.state.labels.bikes[stats.uid] && app.state.labels.bikes[stats.uid][0]) {
          row.unlabeled = false;
          row.label = app.state.labels.bikes[stats.uid][0];
        }
        else {
          row.unlabeled = true;
          row.label = '# '+stats.uid;
        }
        return row;
      })
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
    _.forEach(acStats, function(stats){
      for (var i=0; i<stats.avg_c_out.length; i++) {
        var power_out = stats.avg_v * stats.avg_c_out[i];

        // TEMPORARY - zero below some threshold
        power_out = power_out < 5 ? 0 : power_out;

        var row = {
          power: power_out.toFixed(0),
          power_pct: 100.0 * (power_out / app.maxGraph),
        };
        if (app.state.labels.ac[stats.uid] && app.state.labels.ac[stats.uid][i]) {
          row.unlabeled = false;
          row.label = app.state.labels.ac[stats.uid][i];
        }
        else {
          row.unlabeled = true;
          row.label = ['#', stats.uid, '-', String.fromCharCode('A'.charCodeAt(0)+i)].join(' ');
        }
        if (!row.unlabeled) {
          rows.push(row);
        }
      }
    });
    return { 'rows': _.sortByOrder(rows, [
        'unlabeled',
        function (i) { return i.label.toLowerCase(); }
      ])
    };
  },
  ctrl: function() {
    var ctx =  {
      'inv' : '',
      'tiers' : '',
      'shunts' : '',
      'power_in' : '',
      'power_out' : '',
      'power_in_pct' : 0,
      'power_out_pct' : 0,
      'tierInfo': [],
    };

    // Make sure we have data from the charge controller
    var chargeControllerStats = _.find(app.state.networkStats, {kind: app.KIND.CTRL});
    if (chargeControllerStats) {
      var power_in = chargeControllerStats.avg_c_in * chargeControllerStats.avg_v;
      var power_out = chargeControllerStats.avg_c_out[0] * chargeControllerStats.avg_v;
      ctx.inv = chargeControllerStats.inv ? 'On' : 'Off';
      ctx.tiers = chargeControllerStats.tiers;
      ctx.shunts = chargeControllerStats.shunts;
      ctx.power_in = power_in.toFixed(0);
      ctx.power_out = power_out.toFixed(0);
      ctx.power_in_pct = 100.0 * (power_in / app.maxGraph);
      ctx.power_out_pct = 100.0 * (power_out / app.maxGraph);
    }

    // there should be 0 or 1 of these
    var tierStats = _.find(app.state.networkStats, {kind: app.KIND.TIERS});
    if (tierStats) {
      ctx.tierInfo = _(tierStats.avg_c_out)
        .map(function(avg_c_out, i){
          var power = tierStats.avg_v * avg_c_out;
          return {
            power: power.toFixed(0),
            power_pct: 100.0 * (power / app.maxGraph),
            label_disp: "Tier " + (i + 1),
          };
        })
        .value()
    }

    return ctx;
  },
};


app.Constants = {};
app.Constants.maxGraph = 1600; // watts
app.Constants.MachineKinds = {
  AC: "4-ac",
  BIKE: "bike",
};

app.state = {};
app.state.network = {};
app.state.labels = {};

app.websocket.on('stats.network', function (stats) {
  app.state.network = stats;
});

app.websocket.on('stats.labels', function (stats) {
  app.state.labels = stats;
});

app.websocket.start();



