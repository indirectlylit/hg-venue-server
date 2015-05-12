
<!--#########################-->
<!--#######   HTML   ########-->

<vs-bike-label>
  <li>
    <div>{uid}</div>
    <div>
      <input value={label} onkeyup={change}>
    <div>
  </li>



<!--###########################-->
<!--#######   STYLES   ########-->

  <style>

    vs-bike-label {
    }

  </style>


<!--############################-->
<!--#######   SCRIPTS   ########-->


  <script>

    this.label = opts.label
    this.uid = opts.uid

    this.change = _.debounce(function(e) {
        app.ctrl.updateLabels(this.uid, [e.target.value,]);
      },
      500
    );

  </script>

</vs-bike-label>
