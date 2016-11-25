var panelHeadingTemplate = '\
  <div class="panel-heading" :class="{\'disconnected-header\': !showAsConnected}">\
    <h3 class="panel-title inline">{{ title }}</h3>\
    <div class="connection-state">\
      <span v-if="number">× {{ number }}</span>\
      <span v-if="!showAsConnected" class="glyphicon glyphicon-ban-circle"></span>\
    </div>\
  </div>\
';

Vue.component('panel-heading', {
  props: {
    title: {
      type: String,
      required: true
    },
    connected: {
      type: Boolean,
      default: false
    },
    number: {
      type: Number,
      required: false
    },
  },
  computed: {
    showAsConnected: function() {
      return this.connected || this.number;
    },
  },
  template: panelHeadingTemplate,
});


var onoffIcon = '\
  <span v-if="on" class="glyphicon glyphicon-ok state-icon"></span>\
  <span v-else class="glyphicon glyphicon-remove state-icon"></span>\
';

Vue.component('onoff-icon', {
  props: {
    on: {
      type: Boolean,
      default: false,
    },
  },
  template: onoffIcon,
});


var barChart = '\
  <div class="bar">\
    <span class="bar-indicator"\
      :class="[type]"\
      :style="barStyle"\
    ></span>\
  </div>\
';

Vue.component('bar-chart', {
  props: {
    type: {
      type: String,
    },
    percent: {
      type: Number,
      default: 0,
    },
  },
  template: barChart,
  computed: {
    barStyle: function() {
      return { transform: 'scaleX(' + this.percent + ')' };
    },
  },
});


