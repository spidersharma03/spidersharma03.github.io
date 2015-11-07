/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

function Model_Graph(parentdiv, options, numSeries) {
    this.series_data = [];
    this.numSeries = numSeries;
    this.customGraphOperations = null;
    var array = [];
    for(var i=0; i<numSeries; i++){
        array.push(0);
    }
    this.series_data.push(array);
    this._graph = new Dygraph(parentdiv, this.series_data, options);
}

Model_Graph.prototype = {
  constructor : Model_Graph,
  
  getGraphContext: function() {
      return this._graph;
  },
  
  addSeriesData: function(seriesData) {
      this.series_data.push(seriesData);
      this._graph.updateOptions({ 'file': this.series_data });
  },
  
  updateData: function() {  
      // Update Label Annotations  
      if(this.customGraphOperations !== null) {
          var numRows = this._graph.numRows();
          var max_timeVal = this._graph.getValue(numRows-1, 0);
          var annotations = this.customGraphOperations.labelAnnotations;
          for(var i=0; i<annotations.length; i++) {
              var ann = annotations[i];
              if(ann.xval <= max_timeVal) {
                  var xoord = this._graph.toDomXCoord(ann.xval);
                  var row = this._graph.findClosestRow(xoord);
                  ann.posVal = this._graph.getValue(row, 1);
                  ann.velVal = this._graph.getValue(row, 2);
                  ann.accVal = this._graph.getValue(row, 3);
                  ann.div.innerHTML = "";
                  if(ann.div.text.length > 0)
                      ann.div.innerHTML = ann.div.text + "<br>";
                  if(ann.showX)
                      ann.div.innerHTML += "x: " + ann.posVal.toFixed(3);
                  if(ann.showV)
                      ann.div.innerHTML += " v: " + ann.velVal.toFixed(3);
                  if(ann.showA)
                      ann.div.innerHTML += " a: " + ann.accVal.toFixed(3);
                  }
            }
      }
      // Update graph
      if(this.series_data.length !== 0)
        this._graph.updateOptions({ 'file': this.series_data });
      
  },
  
  updateOptions: function(options) {
      this._graph.updateOptions(options);
  },
  
  recordData: function(data) {
      if(this.numSeries !== data.length) {
          console.log("ERROR::model_graph.js::Mismatch between data length and number of series specified for this graph");
          return;
      }
      this.series_data.push(data);
  },
  
  setLabelX: function(label) {
      var labeldata = {xlabel : label};
      this.updateOptions(labeldata);
  },
  
   setLabelY: function(label) {
      var labeldata = {ylabel : label};
      this.updateOptions(labeldata);
  },
  
  setSeriesVisibility: function(number, value) {
      this._graph.setVisibility(number, value);
  },
  
  clearData: function() {
      if(this.series_data.length === 0)
          return;
      this.series_data = [];
      this._graph.updateOptions({ 'file': this.series_data });
  }
  
};