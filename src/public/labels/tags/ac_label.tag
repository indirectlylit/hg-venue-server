
<!--#########################-->
<!--#######   HTML   ########-->

<vs-ac-label>
  <h3>AC # {app.state.currentUID}</h3>
  <div>
    <div class="input-wrapper">
      <label>A:</label><input value={app.state.currentLabels[0]} name="input_0" onkeyup={setLocalState}>
    </div>
    <div class="input-wrapper">
      <label>B:</label><input value={app.state.currentLabels[1]} name="input_1" onkeyup={setLocalState}>
    </div>
    <div class="input-wrapper">
      <label>C:</label><input value={app.state.currentLabels[2]} name="input_2" onkeyup={setLocalState}>
    </div>
    <div class="input-wrapper">
      <label>D:</label><input value={app.state.currentLabels[3]} name="input_3" onkeyup={setLocalState}>
    </div>
  </div>
  <div class="label-controls">
    <button type="button" class="btn btn-default btn-sm" onclick={save}>
      <span class="glyphicon glyphicon-remove"></span> Save
    </button>
    <button type="button" class="btn btn-default btn-sm" onclick={app.ctrl.cancelUpdate}>
      <span class="glyphicon glyphicon-remove"></span> Cancel
    </button>
  </div>


<!--###########################-->
<!--#######   STYLES   ########-->

  <style></style>


<!--############################-->
<!--#######   SCRIPTS   ########-->

  <script>

    this.newLabels = function() {
      var newLabels = [];
      for (var i = 0; i < 4; i++) {
        newLabels.push(this['input_' + i].value);
      }
      return newLabels;
    };

    this.setLocalState = function() {
      app.state.currentLabels = this.newLabels();
    };

    this.save = function(e) {
      app.ctrl.updateLabels();
    };

  </script>

</vs-ac-label>
