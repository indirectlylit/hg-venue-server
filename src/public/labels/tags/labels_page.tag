
<!--#########################-->
<!--#######   HTML   ########-->

<vs-labels-page>

  <div class="container">
    <div class="row top-info">
      Press a sensor button to select and label it.
    </div>
    <div class="row" if={showEditor()}>
      <div class="col-md-3"></div>
      <div class="col-md-6">
        <vs-bike-label if={app.state.currentKind == app.kinds.bike} />
        <vs-ac-label if={app.state.currentKind == app.kinds.ac} />
      </div>
      <div class="col-md-3"></div>
    </div>
    <div class="row" if={!showEditor()}>
      <div class="col-md-6">
        <div class="panel panel-default">
          <div class="panel-heading"><h3 class="panel-title inline">Bikes</h3></div>
          <div class="panel-body">
            <div each={bikeSensors}>
              # {uid}: {labels[0]}
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-6">
        <div class="panel panel-default">
          <div class="panel-heading"><h3 class="panel-title inline">AC Sensors</h3></div>
          <div class="panel-body">
            <div each={acSensors} class="ac-group">
              <div>
                # {uid}
              </div>
              <div>
                <label>A:</label>{labels[0]}
              </div>
              <div>
                <label>B:</label>{labels[1]}
              </div>
              <div>
                <label>C:</label>{labels[2]}
              </div>
              <div>
                <label>D:</label>{labels[3]}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>



<!--###########################-->
<!--#######   STYLES   ########-->

  <style>

    .top-info {
      text-align: center;
      margin-bottom: 16px;
    }

    .header {
      text-align: center;
    }

    .ac-group {
      margin-top: 8px;
    }

    .label-controls {
      text-align: right;
    }

    .input-wrapper {
      text-align: center;
      margin: 8px 0;
    }

    .input-wrapper label {
      margin: 0 8px;
      color: grey;
    }

    .input-wrapper input {
      width: 85%;
      color: white;
      background-color: black;
      border: none;
      border-radius: 3px;
      padding-left: 8px;
      padding-right: 8px;
    }

  </style>


<!--############################-->
<!--#######   SCRIPTS   ########-->

  <script>

    //////////////////////
    //// data updates ////

    this.bikeSensors = [];
    this.acSensors = [];
    this.currentUid = null;

    this.showEditor = function() {
      return app.state.currentUID !== undefined;
    };

    this.on('update', function() {
      var updateLabels = function(target, all_labels) {
        _.forEach(all_labels, function(labels, uid) {
          var exists = false;
          _.forEach(target, function(s) {
            if (s.uid == uid) {
              s.labels = labels
              exists = true;
            }
          });
          if (!exists) {
            target.push({
              'uid': uid,
              'labels': labels,
            });
          }
        });
      };

      updateLabels(this.bikeSensors, app.state.labels[app.kinds.bike]);
      updateLabels(this.acSensors, app.state.labels[app.kinds.ac]);
    });


  </script>

</vs-labels-page>
