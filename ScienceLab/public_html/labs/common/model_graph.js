/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

function Model_Graph(parentdiv, data, options) {
    this.series_data = [];
    this.series_data.push(data);
    this._graph = new Dygraph(parentdiv, data, options);
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
  }
};
