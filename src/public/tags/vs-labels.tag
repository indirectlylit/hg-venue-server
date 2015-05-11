

<vs-labels-tab>

  <div>
    <ul>
      <li each={ sensors }>
        <div class="sensor-label">{ id }</div>
      </li>
    </ul>
    <form onsubmit={ add }>
      <input name="input" onkeyup={ edit }>
      <button disabled={ !text }>Add #{ items.length + 1 }</button>
    </form>
  </div>

  <style>
    vs-labels-tab ul {
      list-style: none;
    }
    vs-labels-tab .sensor-label {
      display: inline-block;
    }
  </style>

  <script>
    this.kind = opts.kind;
    this.sensors = opts.sensors;

    edit(e) {
      console.log("edit", e);
      this.text = e.target.value;
    }

  </script>

</vs-labels-tab>


<vs-labels-page>

  <div>
    <ul class="tabHeader">
      <li
        each = "{ tab, i in tabs }"
        class = "tabLabel { active: parent.isActiveTab(tab.kind) }"
        onclick = "{ parent.toggleTab }"
      >
        {tab.kind}
      </li>
    </ul>
    <div class="tabContent">
      <vs-labels-tab
        each = "{ tab, i in tabs }"
        class = "tabPane { active: parent.isActiveTab(tab.kind) }"
        sensors = "{ tab.sensors }"
        kind = "{ tab.kind }"
      />
    </div>
  </div>

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
      display: none;
    }
    vs-labels-page .tabPane.active {
      display: block;
    }
  </style>

  <script>

    // tabs

    this.activeTab = 'bikes';

    isActiveTab(tab) {
      return this.activeTab === tab;
    }

    toggleTab(e) {
      this.activeTab = e.item.tab.kind;
      return true;
    }


    // data updates

    var self = this

    app.websocket.on('network.labels', function (labels) {

      var mapInput = function(key, value) {
        return {
          id: key,
          labels: value,
        }
      };


      self.tabs = [
        {
          kind: 'bikes',
          sensors: _.map(labels.bikes, mapInput),
        },
        {
          kind: 'ac',
          sensors: _.map(labels.ac, mapInput),
        },
      ];

      self.update(app.state.labels);
    });


  </script>

</vs-labels-page>
