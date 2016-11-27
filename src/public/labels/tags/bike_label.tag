
<!--#########################-->
<!--#######   HTML   ########-->

<vs-bike-label>
  <div>
    <h3>Bike # {app.state.currentUID}</h3>
    <div class="input-wrapper">
      <input name="input" value={app.state.currentLabels[0]} onkeyup={setLocalState}>
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
      return [this.input.value];
    };

    this.setLocalState = function() {
      app.state.currentLabels = this.newLabels();
    };

    this.save = function(e) {
      app.ctrl.updateLabels();
    };

  </script>

</vs-bike-label>
