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

var data = "X,Y\n" +
                 "1,0\n" +
                 "2,2\n" +
                 "3,4\n" +
                 "4,6\n" +
                 "5,8\n" +
                 "6,10\n" +
                 "7,12\n" +
                 "8,14\n";
var options = {
                     // options go here. See http://dygraphs.com/options.html
                     legend: 'always',
                     animatedZooms: true,
                     title: 'dygraphs chart template'
                 };
                 
var modelGraph = new Model_Graph(document.getElementById("graphDiv"), data, options);