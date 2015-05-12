
<!--#########################-->
<!--#######   HTML   ########-->

<vs-labels-page>
  <div>
    <ul class="tabHeader">
      <li class="tabLabel {active: this.activeTab == this.TAB_BIKE}" onclick="{toggleTab}" data-tab="{this.TAB_BIKE}">
        Bikes
      </li>
      <li class="tabLabel {active: this.activeTab == this.TAB_AC}" onclick="{toggleTab}" data-tab="{this.TAB_AC}">
        AC
      </li>
    </ul>
    <div class="tabContent">
      <div class="tabPane {active: this.activeTab == this.TAB_BIKE}">
        BIKES
        <ul>
          <li riot-tag="vs-bike-label" each={bikeSensors} uid={uid} label={labels[0]} />
        </ul>
      </div>
      <div class="tabPane {active: this.activeTab == this.TAB_AC}">
        AC
        <ul>
          <li riot-tag="vs-ac-label" each={acSensors} uid={uid} labels={labels} />
        </ul>
      </div>
    </div>
  </div>



<!--###########################-->
<!--#######   STYLES   ########-->

  <style>

    vs-labels-page .tabHeader {
      display: block;
      padding: 0;
    }
    vs-labels-page .tabLabel {
      display: inline-block;
      cursor: pointer;
      margin: 10px;
      width: 100px;
      text-align: center;
    }
    vs-labels-page .tabLabel.active {
      color: white;
    }
    vs-labels-page .tabPane {
      /*display: none;*/
    }
    vs-labels-page .tabPane.active {
      display: block;
    }
    vs-labels-page ul {
      list-style: none;
    }
  </style>


<!--############################-->
<!--#######   SCRIPTS   ########-->

  <script>

    //////////////////////
    //// tab handling ////

    this.TAB_BIKE = 'bikes'
    this.TAB_AC = 'ac'

    this.activeTab = this.TAB_BIKE;

    toggleTab(e) {
      this.activeTab = e.target.dataset.tab;
      return true;
    }


    //////////////////////
    //// data updates ////

    this.bikeSensors = [];
    this.acSensors = [];

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
