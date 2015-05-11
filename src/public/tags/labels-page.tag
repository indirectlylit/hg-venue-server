
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
          <li each={sensors}>{id}</li>
        </ul>
      </div>
      <div class="tabPane {active: this.activeTab == this.TAB_AC}">
        AC
        <ul>
          <li each={sensors}>{id}</li>
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

    this.on('update', function() {
      console.log(app.state);
      // self.tabs = [
      //   {
      //     kind: 'bikes',
      //     sensors: _.map(labels.bikes, mapInput),
      //   },
      //   {
      //     kind: 'ac',
      //     sensors: _.map(labels.ac, mapInput),
      //   },
      // ];
    })


  </script>

</vs-labels-page>
