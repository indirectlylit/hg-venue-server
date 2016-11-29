
<!--#########################-->
<!--#######   HTML   ########-->

<vs-ac-label>

  <div class="panel panel-default">
    <div class="panel-heading">
      <h3 class="panel-title inline">AC # {app.state.currentUID}</h3>
      <button type="button" class="btn btn-default btn-xs clear-btn" onclick={app.ctrl.clearFields}>
        Clear Fields
      </button>
    </div>
    <form class="panel-body" onsubmit={app.ctrl.updateLabels} onreset={app.ctrl.cancelUpdate}>
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
        <button type="submit" class="btn btn-default btn-sm">
          <span class="glyphicon glyphicon-remove"></span> Save
        </button>
        <button type="reset" class="btn btn-default btn-sm">
          <span class="glyphicon glyphicon-remove"></span> Cancel
        </button>
      </div>
    </form>
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

  </script>

</vs-ac-label>
