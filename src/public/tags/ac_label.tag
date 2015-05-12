
<!--#########################-->
<!--#######   HTML   ########-->

<vs-ac-label>
  <h3>
    AC # {uid}
  </h3>
  <div>
    <div>
      <label>A:</label><input value={labels[0]} data-receptacle="0" onkeyup={change}>
    <div>
    <div>
      <label>B:</label><input value={labels[1]} data-receptacle="1" onkeyup={change}>
    <div>
    <div>
      <label>C:</label><input value={labels[2]} data-receptacle="2" onkeyup={change}>
    <div>
    <div>
      <label>D:</label><input value={labels[3]} data-receptacle="3" onkeyup={change}>
    <div>
  </div>



<!--###########################-->
<!--#######   STYLES   ########-->

  <style>

  </style>


<!--############################-->
<!--#######   SCRIPTS   ########-->

  <script>

    this.labels = opts.labels
    this.uid = opts.uid

    this.change = _.debounce(function(e) {
        var newLabels = this.labels;
        newLabels[Math.abs(e.target.dataset.receptacle)] = e.target.value;
        app.ctrl.updateLabels(this.uid, newLabels);
      },
      500
    );

  </script>

</vs-ac-label>
