/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

function CustomKinematicsGraphOperations(graph) {
    this.graph = graph;
    this.dygraph = null;
    this.canvas = null;
    this.underlayBindCallback = this.underlayCallback.bind(this);
    this.highlightBindCallback = this.highlightCallback.bind(this);
    this.unhighlightBindCallback = this.unhighlightCallback.bind(this);
    this.pointClickBindCallback = this.pointClickCallback.bind(this);
    graph.updateOptions({underlayCallback: this.underlayBindCallback, 
        highlightCallback: this.highlightBindCallback,
        unhighlightCallback: this.unhighlightBindCallback,
        pointClickCallback: this.pointClickBindCallback
        }
    );
}

CustomKinematicsGraphOperations.prototype.changeProbeType = function(probeType) {
    if(probeType === 0) {
        this.graph.updateOptions({underlayCallback: this.underlayBindCallback, 
        highlightCallback: undefined,
        unhighlightCallback: undefined,
        pointClickCallback: undefined
        });
    }
    if(probeType === 1) {
        this.graph.updateOptions({underlayCallback: this.underlayBindCallback, 
        highlightCallback: null,
        unhighlightCallback: null,
        pointClickCallback: null
        });
    }
};

CustomKinematicsGraphOperations.prototype.underlayCallback = function (canvas, area, g) {
    this.canvas = canvas;
    this.dygraph = g;
};

CustomKinematicsGraphOperations.prototype.highlightCallback = function (event, x, points, row, seriesName) {
    this.graph.updateOptions({});
    var ctx = this.canvas;
    var x_ = this.dygraph.toDomCoords(x, points[0].yval)[0];
    var y_ = this.dygraph.toDomCoords(x, points[0].yval)[1];
    var slope = this.dygraph.getValue(row, 2);
    var c = points[0].yval - slope * x;
    var x1 = x + 100;
    var x2 = x - 100;
    var y1 = slope * x1 + c;
    var y2 = slope * x2 + c;
    var linestart = this.dygraph.toDomCoords(x1, y1);
    var lineend = this.dygraph.toDomCoords(x2, y2);
    ctx.strokeStyle = "#000000";
    ctx.fillStyle = "#FFFF00";
    ctx.beginPath();
    ctx.arc(x_, y_, 3, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.stroke();
    ctx.fill();

    var c = Dygraph.toRGB_(this.dygraph.getColors()[0]);
    c.r = Math.floor(255 - 0.5 * (255 - c.r));
    c.g = Math.floor(255 - 0.5 * (255 - c.g));
    c.b = Math.floor(255 - 0.5 * (255 - c.b));
    var color = 'rgb(' + c.r + ',' + c.g + ',' + c.b + ')';
    ;
    ctx.save();
    ctx.installPattern([10, 5]);
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.0;
    ctx.beginPath();
    ctx.moveTo(linestart[0], linestart[1]);
    ctx.lineTo(lineend[0], lineend[1]);
    ctx.closePath();
    ctx.stroke();
    ctx.restore();
    ctx.uninstallPattern();
};

CustomKinematicsGraphOperations.prototype.unhighlightCallback = function(event) {
        this.graph.updateOptions({});
};

CustomKinematicsGraphOperations.prototype.pointClickCallback = function(event, point) {
    
};