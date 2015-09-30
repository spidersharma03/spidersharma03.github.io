/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

function CustomKinematicsGraphOperations(graph) {
    this.graph = graph;
    this.dygraph = null;
    this.areaProbeData = {x1: 0, y1:0, x2: 1, y2: 0};
    this.chordProbeData = {x1: 0, y1:[0,0,0], x2: 1, y2: [0,0,0]};
    this.graphTypeArray = [0, 1, 2];
    this.labelHtml = "";
    this.graphYLabels = ["Position", "Velocity", "Acceleration"];
    this.canvas = null;
    this.probeType = 0;
    this.underlayBindCallback = this.underlayCallback.bind(this);
    this.highlightBindCallback = this.highlightCallback.bind(this);
    this.unhighlightBindCallback = this.unhighlightCallback.bind(this);
    this.pointClickBindCallback = this.pointClickCallback.bind(this);
    this.zoomBindCallback = this.zoomCallback.bind(this);
    graph.updateOptions({underlayCallback: this.underlayBindCallback,
        highlightCallback: this.highlightBindCallback,
        unhighlightCallback: this.unhighlightBindCallback,
        pointClickCallback: this.pointClickBindCallback,
        zoomCallback : this.zoomBindCallback
    }
    );
}

CustomKinematicsGraphOperations.prototype.zoomCallback = function(minDate, maxDate, yRanges) {
};

CustomKinematicsGraphOperations.prototype.changeGraphType = function(graphType) {
    this.graphTypeArray = [];
    if(graphType === 3) {
        this.graphTypeArray = [0, 1, 2];
        this.graph.updateOptions({ylabel:'Position/Velocity/Acceleration'});
    }
    else {
        this.graphTypeArray.push(graphType);
        var yLabel = this.graphYLabels[graphType];
        this.graph.updateOptions({ylabel:yLabel});
    }
    if(this.probeType === 3) { // Chord probe
        var hairlines = this.graph.hairlines.get();
        this.calculateAverageValues(hairlines);
    }
};

CustomKinematicsGraphOperations.prototype.changeProbeType = function (probeType) {
    this.probeType = probeType;
    this.graph.hairlines.set([]); // clear any hairlines for area and chord probe
    this.graph.updateOptions({}); // refresh graph
    if(this.probeType === 2) { // Area probe
            var hairlines = this.graph.hairlines.get();
            var x1 = this.areaProbeData.x1;
            var x2 = this.areaProbeData.x2;
            hairlines.push({xval:x1, interpolated : true});
            hairlines.push({xval:x2, interpolated : true});
            this.graph.hairlines.set(hairlines);
     }
    if(this.probeType === 3) { // Chord probe
            var hairlines = this.graph.hairlines.get();
            var x1 = this.chordProbeData.x1;
            var x2 = this.chordProbeData.x2;
            hairlines.push({xval:x1, interpolated : true});
            hairlines.push({xval:x2, interpolated : true});
            this.graph.hairlines.set(hairlines);
            this.calculateAverageValues(hairlines);
     }
};

CustomKinematicsGraphOperations.prototype.underlayCallback = function (canvas, area, g) {
    this.canvas = canvas;
    this.dygraph = g;
    this.graph.labelDiv.innerHTML = this.labelHtml;
    if(this.probeType === 3) {
      this.drawLinesForChord(this.canvas);
    }
};

CustomKinematicsGraphOperations.prototype.drawLinesForChord = function(canvas) {
    for( var i=0; i<this.graphTypeArray.length; i++) {    
        var seriesIndex = this.graphTypeArray[i];
        var x1 = this.chordProbeData.x1;
        var y1 = this.chordProbeData.y1[seriesIndex];
        var x2 = this.chordProbeData.x2;
        var y2 = this.chordProbeData.y2[seriesIndex];
        var point1 = this.graph._graph.toDomCoords(x1, y1);
        var point2 = this.graph._graph.toDomCoords(x2, y2);
        var c = Dygraph.toRGB_(this.dygraph.getColors()[seriesIndex]);
        //c.r = Math.floor(255 - 0.5 * (255 - c.r));
        //c.g = Math.floor(255 - 0.5 * (255 - c.g));
        //c.b = Math.floor(255 - 0.5 * (255 - c.b));
        var color = 'rgb(' + c.r + ',' + c.g + ',' + c.b + ')';
        canvas.strokeStyle = color;
        canvas.lineWidth = 1.0;
        
        if( point1 !== undefined) {
            canvas.beginPath();
            canvas.moveTo(point1[0], point1[1]);
            canvas.lineTo(point1[0] - 1000, point1[1]);
            canvas.closePath();
            canvas.stroke();

            canvas.beginPath();
            canvas.moveTo(point1[0], point1[1]);
            canvas.lineTo(point1[0], point1[1] + 1000);
            canvas.closePath();
            canvas.stroke();

            canvas.beginPath();
            canvas.moveTo(point2[0], point2[1]);
            canvas.lineTo(point2[0], point2[1] + 1000);
            canvas.closePath();
            canvas.stroke();

            canvas.beginPath();
            canvas.moveTo(point2[0], point2[1]);
            canvas.lineTo(point2[0] - 1000, point2[1]);
            canvas.closePath();
            canvas.stroke();  
        }
    }
};

CustomKinematicsGraphOperations.prototype.highlightCallback = function (event, x, points, row, seriesName) {
    this.graph.updateOptions({});
    if (this.probeType === 0)
        this.showValues(event, x, points, row, seriesName);
    if (this.probeType === 1)
        this.calculateTangents(event, x, points, row, seriesName);
};

CustomKinematicsGraphOperations.prototype.showValues = function (event, x, points, row, seriesName) {
    var ctx = this.canvas;
    var time = x.toFixed(2), pos, vel, acc;
    for (var i = 0; i < this.graphTypeArray.length; i++) {
        var seriesIndex = this.graphTypeArray[i];
        var x_ = this.dygraph.toDomCoords(x, points[i].yval)[0];
        var y_ = this.dygraph.toDomCoords(x, points[i].yval)[1];
        if (seriesIndex === 0)
            pos = points[i].yval.toFixed(2);
        if (seriesIndex === 1)
            vel = points[i].yval.toFixed(2);
        if (seriesIndex === 2)
            acc = points[i].yval.toFixed(2);

        var c = Dygraph.toRGB_(this.dygraph.getColors()[seriesIndex]);
//        c.r = Math.floor(255 - 0.5 * (255 - c.r));
//        c.g = Math.floor(255 - 0.5 * (255 - c.g));
//        c.b = Math.floor(255 - 0.5 * (255 - c.b));
        var color = 'rgb(' + c.r + ',' + c.g + ',' + c.b + ')';
        ctx.strokeStyle = color;
        ctx.beginPath();
        ctx.arc(x_, y_, 3, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.stroke();
        //ctx.fill();
    }
    this.labelHtml = "<span>time = " + time + "</span><br>";
    if(pos !== undefined)
        this.labelHtml += "<span>x ~ " + pos + "</span><br>";
    if(vel !== undefined)
        this.labelHtml += "<span>v ~ " + vel + "</span><br>";
    if(acc !== undefined)
        this.labelHtml += "<span>a ~ " + acc + "</span><br>";
};

CustomKinematicsGraphOperations.prototype.calculateTangents = function (event, x, points, row, seriesName) {
    var ctx = this.canvas;
    var nRows = this.dygraph.numRows();
    var lowerIndex = row === 0 ? row : row - 1;
    var upperIndex = row === (nRows - 1) ? row : row + 1;
    var time = x.toFixed(2), dxdt, dvdt, dadt;
    for (var i = 0; i < this.graphTypeArray.length; i++) {
        var seriesIndex = this.graphTypeArray[i];
        var val1 = this.dygraph.getValue(lowerIndex, seriesIndex+1);
        var val2 = this.dygraph.getValue(upperIndex, seriesIndex+1);
        var t1 = this.dygraph.getValue(lowerIndex, 0);
        var t2 = this.dygraph.getValue(upperIndex, 0);
        var x_ = this.dygraph.toDomCoords(x, points[i].yval)[0];
        var y_ = this.dygraph.toDomCoords(x, points[i].yval)[1];
        //var slope = this.dygraph.getValue(row, 2);
        var slope = (val2 - val1) / (t2 - t1);
        if (seriesIndex === 0)
            dxdt = slope.toFixed(2);
        if (seriesIndex === 1)
            dvdt = slope.toFixed(2);
        if (seriesIndex === 2)
            dadt = slope.toFixed(2);
        var c = points[i].yval - slope * x;
        var x1 = x + 100;
        var x2 = x - 100;
        var y1 = slope * x1 + c;
        var y2 = slope * x2 + c;
        var linestart = this.dygraph.toDomCoords(x1, y1);
        var lineend = this.dygraph.toDomCoords(x2, y2);
        ctx.fillStyle = "#FFFF00";
        ctx.beginPath();
        ctx.arc(x_, y_, 3, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.stroke();
        ctx.fill();

        var c = Dygraph.toRGB_(this.dygraph.getColors()[seriesIndex]);
        c.r = Math.floor(255 - 0.5 * (255 - c.r));
        c.g = Math.floor(255 - 0.5 * (255 - c.g));
        c.b = Math.floor(255 - 0.5 * (255 - c.b));
        var color = 'rgb(' + c.r + ',' + c.g + ',' + c.b + ')';
        ctx.save();
        ctx.installPattern([10, 5]);
        ctx.strokeStyle = color;
        ctx.lineWidth = 2.0;
        ctx.beginPath();
        ctx.moveTo(linestart[0], linestart[1]);
        ctx.lineTo(lineend[0], lineend[1]);
        ctx.closePath();
        ctx.stroke();
        ctx.restore();
        ctx.uninstallPattern();
    }
    this.labelHtml = "<span>time = " + time + "</span><br>"
    if(dxdt !== undefined)
        this.labelHtml += "<span>dx/dt ~ " + dxdt + "</span><br>";
    if(dvdt !== undefined)
        this.labelHtml += "<span>dv/dt ~ " + dvdt + "</span><br>";
    if(dadt !== undefined)
        this.labelHtml += "<span>da/dt ~ " + dadt + "</span><br>";
    this.graph.labelDiv.innerHTML = this.labelHtml;
};

CustomKinematicsGraphOperations.prototype.hairlineProbeChanges = function() {
    var hairlines = this.get();
    if (document.modelGraph.customGraphOperations.probeType === 2)
        document.modelGraph.customGraphOperations.calculateAreas(hairlines);
    if (document.modelGraph.customGraphOperations.probeType === 3)
        document.modelGraph.customGraphOperations.calculateAverageValues(hairlines);
};

CustomKinematicsGraphOperations.prototype.calculateAreas = function (hl) {
    var sum = 0, sum_lower = 0, sum_upper = 0;
    var area = [0, 0, 0];
    if (hl.length > 1) {
        var end = hl[0].xval;
        var start = hl[1].xval;
        if (start > end) {
            var temp = start;
            start = end;
            end = temp;
        }
        var nRows = document.modelGraph._graph.numRows();
        for (var i = 0; i < nRows - 1; i++) {
            var t1 = document.modelGraph._graph.getValue(i, 0);
            if (t1 < start)
                continue;
            var t2 = document.modelGraph._graph.getValue(i + 1, 0);
            if (t2 > end)
                continue;
            for(var j=0; j<this.graphTypeArray.length; j++) {
                var seriesIndex = this.graphTypeArray[j];
                var val1 = document.modelGraph._graph.getValue(i, seriesIndex+1);
                var val2 = document.modelGraph._graph.getValue(i + 1, seriesIndex+1);
                var avg = (val1 + val2) * 0.5;
                area[seriesIndex] += avg * (t2 - t1);
                //sum_lower += val1 * (t2 - t1);
                //sum_upper += val2 * (t2 - t1);
            }
        }
        this.areaProbeData.x1 = start;
        this.areaProbeData.x2 = end;
    }
    this.labelHtml ="";
    if(area[0] > 0)
        this.labelHtml += "<span>Ax = " + area[0].toFixed(2) + "</span><br>";
    if(area[1] > 0)
        this.labelHtml += "<span>Av = " + area[1].toFixed(2) + "</span><br>";
    if(area[2] > 0)
        this.labelHtml += "<span>Aa = " + area[2].toFixed(2) + "</span><br>";
    this.graph.labelDiv.innerHTML = this.labelHtml;
};

CustomKinematicsGraphOperations.prototype.calculateAverageValues = function(hl) {
    var nRows = this.graph._graph.numRows();
    var deltax, deltav, deltaa, deltat;
    if (hl.length > 1) {
        var x1 = hl[0].xval;
        var x2 = hl[1].xval;
        deltat = Math.abs(x2 - x1);
        var y1 = [0,0,0], y2 = [0,0,0];
        // Find the corresponding row for each hairline
        for( var i=0; i<nRows; i++ ) {
            var val = this.graph._graph.getValue(i,0);
            var diff = Math.abs(val - x1);
            
                if( diff < 1e-2) {
                    for(var j=0; j<this.graphTypeArray.length; j++) {
                        var seriesIndex = this.graphTypeArray[j];
                        y1[seriesIndex] = this.graph._graph.getValue(i,seriesIndex+1);
                    }
                }
            
            diff = Math.abs(val - x2);
            if( diff < 1e-2) {
                    for(var j=0; j<this.graphTypeArray.length; j++) {
                        var seriesIndex = this.graphTypeArray[j];
                        y2[seriesIndex] = this.graph._graph.getValue(i,seriesIndex+1);
                    }
            }
        }
        // 
        this.chordProbeData.x1 = x1;
        this.chordProbeData.x2 = x2;
        this.chordProbeData.y1[0] = y1[0];
        this.chordProbeData.y2[0] = y2[0];
        this.chordProbeData.y1[1] = y1[1];
        this.chordProbeData.y2[1] = y2[1];
        this.chordProbeData.y1[2] = y1[2];
        this.chordProbeData.y2[2] = y2[2];
        deltax = Math.abs(y2[0] - y1[0]);
        deltav = Math.abs(y2[1] - y1[1]);
        deltaa = Math.abs(y2[2] - y1[2]);
//        var c = Dygraph.toRGB_(this.dygraph.getColors()[0]);
//        c.r = Math.floor(255 - 0.5 * (255 - c.r));
//        c.g = Math.floor(255 - 0.5 * (255 - c.g));
//        c.b = Math.floor(255 - 0.5 * (255 - c.b));
//        var color = 'rgb(' + c.r + ',' + c.g + ',' + c.b + ')';
    }
    this.labelHtml = "<span>delt = " + deltat.toFixed(2) + "</span><br>";
    if(deltax > 0)
        this.labelHtml += "<span>delx ~ " + deltax.toFixed(2) + "</span><br>";
    if(deltav > 0)
        this.labelHtml += "<span>delv ~ " + deltav.toFixed(2) + "</span><br>";
    if(deltaa > 0)
        this.labelHtml += "<span>dela ~ " + deltaa.toFixed(2) + "</span><br>";
    this.graph.labelDiv.innerHTML = this.labelHtml;
    this.graph.updateOptions({});
};

CustomKinematicsGraphOperations.prototype.unhighlightCallback = function (event) {
    //this.labelHtml = "";
    this.graph.updateOptions({});
};

CustomKinematicsGraphOperations.prototype.pointClickCallback = function (event, point) {

};