/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

function Model_Graph(parentdiv, options, numSeries) {
    this.series_data = [];
    this.numSeries = numSeries;
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
  }
  
};