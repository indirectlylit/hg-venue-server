
<!--#########################-->
<!--#######   HTML   ########-->

<vs-ac-label>
  <div>
    {uid}
  </div>
  <div>
    <div>
      A: <input value={labels[0]} data-receptacle="0" onkeyup={change}>
    <div>
    <div>
      B: <input value={labels[1]} data-receptacle="1" onkeyup={change}>
    <div>
    <div>
      C: <input value={labels[2]} data-receptacle="2" onkeyup={change}>
    <div>
    <div>
      D: <input value={labels[3]} data-receptacle="3" onkeyup={change}>
    <div>
  </div>



<!--###########################-->
<!--#######   STYLES   ########-->

  <style>

    vs-ac-label {
    }

  </style>


<!--############################-->
<!--#######   SCRIPTS   ########-->

  <script>

    this.labels = opts.labels
    this.uid = opts.uid

    this.change = _.debounce(function(e) {
        console.log(">>", e);
        var newLabels = this.labels;
        newLabels[Math.abs(e.target.dataset.receptacle)] = e.target.value;
        app.ctrl.updateLabels(this.uid, newLabels);
      },
      500
    );

  </script>

</vs-ac-label>
