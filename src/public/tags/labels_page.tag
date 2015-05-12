
<!--#########################-->
<!--#######   HTML   ########-->

<vs-labels-page>
  <div>
    <div class="header">
      Press a sensor button to select and label it.
      <hr>
    </div>
    <div>
      <vs-bike-label each={bikeSensors} uid={uid} label={labels[0]} class={hidden: !parent.isCurrent(uid)} />
      <vs-ac-label each={acSensors} uid={uid} labels={labels} class={hidden: !parent.isCurrent(uid)} />
    </div>
  </div>



<!--###########################-->
<!--#######   STYLES   ########-->

  <style>
    vs-labels-page .header {
      text-align: center;
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
