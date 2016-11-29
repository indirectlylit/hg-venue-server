
<!--#########################-->
<!--#######   HTML   ########-->

<vs-bike-label>

  <div class="panel panel-default">
    <div class="panel-heading">
      <h3 class="panel-title inline">Bike # {app.state.currentUID}</h3>
      <button type="button" class="btn btn-default btn-xs clear-btn" onclick={app.ctrl.clearFields}>
        Clear Fields
      </button>
    </div>
    <form class="panel-body" onsubmit={app.ctrl.updateLabels} onreset={app.ctrl.cancelUpdate}>
      <div class="input-wrapper">
        <input name="input" value={app.state.currentLabels[0]} onkeyup={setLocalState}>
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
      return [this.input.value];
    };

    this.setLocalState = function() {
      app.state.currentLabels = this.newLabels();
    };

  </script>

</vs-bike-label>
