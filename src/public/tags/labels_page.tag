
<!--#########################-->
<!--#######   HTML   ########-->

<vs-labels-page>
  <div class="main">
    <div class="header">
      Press a sensor button to select and label it.
    </div>
    <hr>
    <div>
      <vs-bike-label each={bikeSensors} uid={uid} label={labels[0]} class={hidden: !parent.isCurrent(uid)} />
      <vs-ac-label each={acSensors} uid={uid} labels={labels} class={hidden: !parent.isCurrent(uid)} />
    </div>
    <hr>
    <h3>Bikes</h3>
    <div each={bikeSensors}>
      # {uid}: {label}
    </div>
    <hr>
    <h3>AC</h3>
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



<!--###########################-->
<!--#######   STYLES   ########-->

  <style>
    vs-labels-page .header {
      text-align: center;
    }

    vs-labels-page .ac-group {
      margin-top: 5px;
    }

    vs-labels-page label {
      width: 25px;
      color: grey;
    }

    vs-labels-page input {
      width: 85%;
      color: white;
      background-color: black;
      border: none;
      border-radius: 3px;
      padding-left: 5px;
      padding-right: 5px;
    }

    vs-labels-page .main {
      width: 100%;
      max-width: 500px;
      margin-left: auto;
      margin-right: auto;
      background-color: #272b30;
      border-radius: 5px;
      padding: 10px;
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

    this.isCurrent = function(uid) {
      return uid == app.state.currentLabel;
    }

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
      }

      updateLabels(this.bikeSensors, app.state.labels.bikes);
      updateLabels(this.acSensors, app.state.labels.ac);
    });


  </script>

</vs-labels-page>
