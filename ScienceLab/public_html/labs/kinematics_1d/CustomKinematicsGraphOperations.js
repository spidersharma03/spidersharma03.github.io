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
        zoomCallback : this.zoomBindCallback,
        annotationDblClickHandler: this.annotationDblClickCallBack.bind(this)
    }
    );
    this.selectedAnnotation = null;
    this.editAnnotation = false;  
    this.areaTrapezoid = {};
    this.offsetAreas1 = [{}, {}, {}];
    this.offsetAreas2 = [{}, {}, {}];
    this.labelAnnotations = [];
    this.labelDivClickedCallBack = undefined;
}

CustomKinematicsGraphOperations.prototype.setAnnotationEditable = function(bEditable) {
    this.editAnnotation = bEditable;
},
        
CustomKinematicsGraphOperations.prototype.annotationDblClickCallBack = function(ann, point, dg, event) {
    if(!this.editAnnotation)
        return;
    for(var i=0; i<this.labelAnnotations.length; i++) {
        if((this.labelAnnotations[i].xval === ann.xval) && (this.labelAnnotations[i].series === ann.series)) {
            this.selectedAnnotation = this.labelAnnotations[i];     
            break;
        }
    }
    if(this.labelDivClickedCallBack !== undefined)
        this.labelDivClickedCallBack(this.selectedAnnotation);
    
    this.showLabelEditor(event);
},

CustomKinematicsGraphOperations.prototype.changeAnnotation = function(annData) {
    if(this.selectedAnnotation !== null) {
        this.selectedAnnotation.div.text = annData.text;
        this.selectedAnnotation.div.style.maxWidth = "300px";
        this.selectedAnnotation.div.innerHTML = "";
        this.selectedAnnotation.showX = annData.showX;
        this.selectedAnnotation.showV = annData.showV;
        this.selectedAnnotation.showA = annData.showA;
        if(annData.text.length > 0)
            this.selectedAnnotation.div.innerHTML = annData.text + "<br>";
        if(annData.showX)
            this.selectedAnnotation.div.innerHTML += "x: " + this.selectedAnnotation.posVal.toFixed(3);
        if(annData.showV)
            this.selectedAnnotation.div.innerHTML += " v: " + this.selectedAnnotation.velVal.toFixed(3);
        if(annData.showA)
            this.selectedAnnotation.div.innerHTML += " a: " + this.selectedAnnotation.accVal.toFixed(3);
        MathJax.Hub.Queue(["Typeset",MathJax.Hub,this.selectedAnnotation.div]);
        this.hideLabelEditor();
    }
};

CustomKinematicsGraphOperations.prototype.removeAnnotation = function() {
    if(this.selectedAnnotation !== null) {
        var annotations = this.labelAnnotations;//this.graph._graph.annotations();
        var index = -1;
        for( var i=0; i<annotations.length; i++) {
            var ann = annotations[i];
            if((ann.xval === this.selectedAnnotation.xval) && (ann.series === this.selectedAnnotation.series)){
                index = i;
                break;
            }
        }
        this.selectedAnnotation = null;
        annotations.splice(index,1);
        this.graph._graph.setAnnotations(annotations);
        this.hideLabelEditor();
    }
},

CustomKinematicsGraphOperations.prototype.zoomCallback = function(minDate, maxDate, yRanges) {
    if(this.probeType === 2) {
        var hairlines = this.graph.hairlines.get();
        this.calculateAreas(hairlines);
        this.transformOffsetAreasToDomCoords();
        this.graph._graph.updateOptions({});
    }
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
    if(this.probeType === 2) { // Chord probe
        var hairlines = this.graph.hairlines.get();
        this.calculateAreas(hairlines);
    }
};

CustomKinematicsGraphOperations.prototype.changeProbeType = function (probeType) {
    this.probeType = probeType;
    this.graph.hairlines.set([]); // clear any hairlines for area and chord probe
    if(this.probeType === 0 || this.probeType === 1) {
        this.graph.updateOptions({
            series:{
                'x':{ fillGraph:false },
                'v':{ fillGraph:false },
                'a':{ fillGraph:false }
                }
            }
        ); // refresh graph        
    }
    if(this.probeType === 2) { // Area probe
            var hairlines = this.graph.hairlines.get();
            var x1 = this.areaProbeData.x1;
            var x2 = this.areaProbeData.x2;
            hairlines.push({xval:x1, interpolated : true});
            hairlines.push({xval:x2, interpolated : true});
            this.graph.hairlines.set(hairlines);
            this.calculateAreas(hairlines);
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
    if(this.probeType === 2) {
        for(var i=0; i<this.offsetAreas1.length; i++)
            this.fillTrapezoidArea(this.offsetAreas1[i]);
        for(var i=0; i<this.offsetAreas2.length; i++)
            this.fillTrapezoidArea(this.offsetAreas2[i]);
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
            canvas.installPattern([10, 5]);
            
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
            canvas.uninstallPattern();
            
            canvas.lineWidth = 2.0;
            canvas.beginPath();
            canvas.moveTo(point1[0], point1[1]);
            canvas.lineTo(point2[0], point2[1]);
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
    var time = x.toFixed(3), pos, vel, acc;
    for (var i = 0; i < this.graphTypeArray.length; i++) {
        var seriesIndex = this.graphTypeArray[i];
        var x_ = this.dygraph.toDomCoords(x, points[i].yval)[0];
        var y_ = this.dygraph.toDomCoords(x, points[i].yval)[1];
        if (seriesIndex === 0)
            pos = points[i].yval.toFixed(3);
        if (seriesIndex === 1)
            vel = points[i].yval.toFixed(3);
        if (seriesIndex === 2)
            acc = points[i].yval.toFixed(3);

        var c = Dygraph.toRGB_(this.dygraph.getColors()[seriesIndex]);
        c.r = Math.floor(255 - 0.5 * (255 - c.r));
        c.g = Math.floor(255 - 0.5 * (255 - c.g));
        c.b = Math.floor(255 - 0.5 * (255 - c.b));
        var color = 'rgb(' + c.r + ',' + c.g + ',' + c.b + ')';
        ctx.strokeStyle = color;
        ctx.beginPath();
        ctx.arc(x_, y_, 3, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
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
    var time = x.toFixed(3), dxdt, dvdt, dadt;
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
            dxdt = slope.toFixed(3);
        if (seriesIndex === 1)
            dvdt = slope.toFixed(3);
        if (seriesIndex === 2)
            dadt = slope.toFixed(3);
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
    var startIndex=0, endIndex=0;
    var area = [0, 0, 0];
    if (hl.length > 1) {
        var end = hl[0].xval;
        var start = hl[1].xval;
        if (start > end) {
            var temp = start;
            start = end;
            end = temp;
        }
        var nRows = this.graph._graph.numRows();
        for (var i = 0; i < nRows - 1; i++) {
            var t1 = this.graph._graph.getValue(i, 0);
            var t2 = this.graph._graph.getValue(i + 1, 0);
            if(t1 < start && t2 > start) {
                var diff1 = t2 - start;
                for(var j=0; j<this.graphTypeArray.length; j++) {
                    var trapezoid = {};
                    var seriesIndex = this.graphTypeArray[j];
                    var val1 = this.graph._graph.getValue(i, seriesIndex+1);
                    var val2 = this.graph._graph.getValue(i + 1, seriesIndex+1);
                    var avg = (val1 + val2) * 0.5;
                    area[seriesIndex] += avg * diff1;
                    trapezoid.x0 = start; trapezoid.y0 = 0;
                    trapezoid.x1 = start + diff1; trapezoid.y1 = 0;
                    trapezoid.x2 = start + diff1; trapezoid.y2 = val2;
                    var t = (start - t1)/(t2 - t1);
                    trapezoid.x3 = start; trapezoid.y3 = val1 * (1-t) + val2 * t;
                    this.offsetAreas1[j] = trapezoid;
                }
            }
            if(t1 < end && t2 > end) {
                var diff2 = end - t1;
                for(var j=0; j<this.graphTypeArray.length; j++) {
                    var trapezoid = {};
                    var seriesIndex = this.graphTypeArray[j];
                    var val1 = this.graph._graph.getValue(i, seriesIndex+1);
                    var val2 = this.graph._graph.getValue(i + 1, seriesIndex+1);
                    var avg = (val1 + val2) * 0.5;
                    area[seriesIndex] += avg * diff2;
                    trapezoid.x0 = t1; trapezoid.y0 = 0;
                    trapezoid.x1 = t1 + diff2; trapezoid.y1 = 0;
                    var t = (end - t1)/(t2 - t1);
                    trapezoid.x2 = t1 + diff2; trapezoid.y2 = val1 * (1-t) + val2 * t;
                    trapezoid.x3 = t1; trapezoid.y3 = val1;
                    this.offsetAreas2[j] = trapezoid;
                }
            }
            if (t1 < start) {
                startIndex = i+1;
                continue;
            }
            if (t2 > end) {
                continue;
            } else {
                endIndex = i + 1;
            }
            for(var j=0; j<this.graphTypeArray.length; j++) {
                var seriesIndex = this.graphTypeArray[j];
                var val1 = this.graph._graph.getValue(i, seriesIndex+1);
                var val2 = this.graph._graph.getValue(i + 1, seriesIndex+1);
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
    if(this.graphTypeArray[0] === 0)
        this.labelHtml += "<span>Ax = " + area[0].toFixed(3) + "</span><br>";
    if(this.graphTypeArray[0] === 1 || this.graphTypeArray[1] === 1)
        this.labelHtml += "<span>Av = " + area[1].toFixed(3) + "</span><br>";
    if(this.graphTypeArray[0] === 2 || this.graphTypeArray[2] === 2)
        this.labelHtml += "<span>Aa = " + area[2].toFixed(3) + "</span><br>";
    this.graph.labelDiv.innerHTML = this.labelHtml;
    var fillLength = endIndex - startIndex + 1;
    this.transformOffsetAreasToDomCoords();
    this.graph.updateOptions({
         series:{
             'x': {
                        strokeWidth: 1.0,
                        fillGraph: true,
                        fillAlpha:0.15,
                        fillStartIndex:startIndex,
                        fillLength:fillLength
                    },
              'v': {
                        strokeWidth: 1.0,
                        fillGraph: true,
                        fillAlpha:0.15,
                        fillStartIndex:startIndex,
                        fillLength:fillLength
                    },
              'a': {
                        strokeWidth: 1.0,
                        fillGraph: true,
                        fillAlpha:0.15,
                        fillStartIndex:startIndex,
                        fillLength:fillLength
                    }       
                }
    });
    //this.graph.updateOptions({});
};

CustomKinematicsGraphOperations.prototype.transformOffsetAreasToDomCoords = function() {
    var colors = this.graph._graph.getColors();
    for( var i=0; i<this.offsetAreas1.length; i++) {
        var trapezoid = this.offsetAreas1[i];
        var coords = this.graph._graph.toDomCoords(trapezoid.x0, trapezoid.y0);
        trapezoid.x0 = coords[0]; trapezoid.y0 = coords[1];
        coords = this.graph._graph.toDomCoords(trapezoid.x1, trapezoid.y1);
        trapezoid.x1 = coords[0]; trapezoid.y1 = coords[1];
        coords = this.graph._graph.toDomCoords(trapezoid.x2, trapezoid.y2);
        trapezoid.x2 = coords[0]; trapezoid.y2 = coords[1];
        coords = this.graph._graph.toDomCoords(trapezoid.x3, trapezoid.y3);
        trapezoid.x3 = coords[0]; trapezoid.y3 = coords[1];
        this.areaTrapezoid = trapezoid;
        var rgb = Dygraph.toRGB_(colors[i]);
        var color =
            'rgba(' + rgb.r + ',' + rgb.g + ',' + rgb.b + ',' + 0.15 + ')';
        trapezoid.color = color;
    }
    for( var i=0; i<this.offsetAreas2.length; i++) {
        var trapezoid = this.offsetAreas2[i];
        var coords = this.graph._graph.toDomCoords(trapezoid.x0, trapezoid.y0);
        trapezoid.x0 = coords[0]; trapezoid.y0 = coords[1];
        coords = this.graph._graph.toDomCoords(trapezoid.x1, trapezoid.y1);
        trapezoid.x1 = coords[0]; trapezoid.y1 = coords[1];
        coords = this.graph._graph.toDomCoords(trapezoid.x2, trapezoid.y2);
        trapezoid.x2 = coords[0]; trapezoid.y2 = coords[1];
        coords = this.graph._graph.toDomCoords(trapezoid.x3, trapezoid.y3);
        trapezoid.x3 = coords[0]; trapezoid.y3 = coords[1];
        this.areaTrapezoid = trapezoid;
        var rgb = Dygraph.toRGB_(colors[i]);
        var color =
            'rgba(' + rgb.r + ',' + rgb.g + ',' + rgb.b + ',' + 0.15 + ')';
        trapezoid.color = color;
    }
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
        for( var i=0; i<nRows-1; i++ ) {
            var val1 = this.graph._graph.getValue(i,0);
            var val2 = this.graph._graph.getValue(i+1,0);
            
            if( x1 > val1 && x1 < val2) {
                for(var j=0; j<this.graphTypeArray.length; j++) {
                    var seriesIndex = this.graphTypeArray[j];
                    var v1 = this.graph._graph.getValue(i,seriesIndex+1);
                    var v2 = this.graph._graph.getValue(i+1,seriesIndex+1);
                    var t = (x1 - val1)/(val2 - val1);
                    y1[seriesIndex] = v1*(1-t) + v2*t;
                }
            }
            
            if( x2 > val1 && x2 < val2) {
                    for(var j=0; j<this.graphTypeArray.length; j++) {
                        var seriesIndex = this.graphTypeArray[j];
                        var v1 = this.graph._graph.getValue(i,seriesIndex+1);
                        var v2 = this.graph._graph.getValue(i+1,seriesIndex+1);
                        var t = (x2 - val1)/(val2 - val1);
                        y2[seriesIndex] = v1*(1-t) + v2*t;
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
    this.labelHtml = "<span>delt = " + deltat.toFixed(3) + "</span><br>";
    if(this.graphTypeArray[0] === 0)
        this.labelHtml += "<span>delx ~ " + deltax.toFixed(3) + "</span><br>";
    if(this.graphTypeArray[0] === 1 || this.graphTypeArray[1] === 1)
        this.labelHtml += "<span>delv ~ " + deltav.toFixed(3) + "</span><br>";
    if(this.graphTypeArray[0] === 2 || this.graphTypeArray[2] === 2)
        this.labelHtml += "<span>dela ~ " + deltaa.toFixed(3) + "</span><br>";
    this.graph.labelDiv.innerHTML = this.labelHtml;
    this.graph.updateOptions({
            series:{
                'x':{ fillGraph:false },
                'v':{ fillGraph:false },
                'a':{ fillGraph:false }
                }
            }
        ); 
};

CustomKinematicsGraphOperations.prototype.unhighlightCallback = function (event) {
    //this.labelHtml = "";
    this.graph.updateOptions({});
};

CustomKinematicsGraphOperations.prototype.pointClickCallback = function (event, point) {
    if(!this.editAnnotation)
        return;
    var g = this.graph._graph;
    // Check if the point is already annotated.
          if (point.annotation) return;
          // If not, add one.
          var ann = {
            series: point.name,
            xval: point.xval,
            shortText: "num",
            tickHeight:20
            //width:100,
            //height:30
          };
          var xoord = g.toDomXCoord(ann.xval);
          var row = g.findClosestRow(xoord);
          ann.showX = false;
          ann.showV = false;
          ann.showA = false;          
          ann.posVal = g.getValue(row, 1);
          ann.velVal = g.getValue(row, 2);
          ann.accVal = g.getValue(row, 3);
          ann.text = 'time = ' + ann.xval.toFixed(3);
          ann.div = this.createAnnotationDiv('Label');
          var anns = this.labelAnnotations;
          anns.push(ann);
          g.setAnnotations(anns);
};

CustomKinematicsGraphOperations.prototype.hideLabelEditor = function() {
    var div = document.getElementById("GraphLabelEditor");
    div.style.visibility = 'hidden';
};

CustomKinematicsGraphOperations.prototype.showLabelEditor = function(event) {
        var graphPos = Dygraph.findPos(this.graph._graph.graphDiv);
        var canvasx = Dygraph.pageX(event) - graphPos.x;
        var canvasy = Dygraph.pageY(event) - graphPos.y;
        var div = document.getElementById("GraphLabelEditor");
        var graphDiv = document.getElementById("graphDiv");
//        function getPos(el) {
//            for (var lx=0, ly=0;
//                 el !== null;
//                 lx += el.offsetLeft, ly += el.offsetTop, el = el.offsetParent);
//            return {x: lx,y: ly};
//          }
//        var pos = getPos(graphDiv);
        var x = Dygraph.pageX(event);//canvasx + pos.x;
        var y = Dygraph.pageY(event);//canvasy + pos.y;
        div.style.visibility = 'visible';
        div.style.left = x - div.offsetWidth/2 + 'px';
        div.style.top = y - div.offsetHeight/2 + 'px';
        div.style.display = 'inline';
        div.style.zIndex = 1000;
        document.body.appendChild(div);
        //$scope.labelData.position = {x:x, y:y};
    };
    
CustomKinematicsGraphOperations.prototype.createAnnotationDiv = function(text, posVal, velVal, accVal) {
    var newdiv = document.createElement('div');
    newdiv.text = text;
    if(text.length > 0)
        newdiv.innerHTML = text + "<br>";
    if(posVal !== undefined)
        newdiv.innerHTML += "x:" + posVal.toFixed(3);
    if(velVal !== undefined)
        newdiv.innerHTML += " v:" + velVal.toFixed(3);
    if(accVal !== undefined)
        newdiv.innerHTML += " a:" + accVal.toFixed(3);
    newdiv.style.visibility = 'visible';
    newdiv.style.display = 'inline';
    newdiv.style.zIndex = 1000;
    newdiv.style.position = 'absolute';
    newdiv.style.cursor = 'move';
    newdiv.style.borderRadius = '5px';
    newdiv.style.background = 'rgba(240,240,240,0.5)';
    newdiv.style.border = "1px solid #888888";
    //newdiv.onclick = this.labelDivClickedCallBack;
    //document.body.appendChild(newdiv);
    //$scope.labelDivs.push(newdiv);
    MathJax.Hub.Queue(["Typeset",MathJax.Hub,newdiv]);
    //newdiv.style.fontWeight = 'bolder';
    //newdiv.style.left = $scope.labelData.position.x - newdiv.offsetWidth/2 + 'px';
    //newdiv.style.top = $scope.labelData.position.y - newdiv.offsetHeight/2 + 'px';
    return newdiv;
};

CustomKinematicsGraphOperations.prototype.initAnnotationsFromJsonData = function(jsonData) {
    if(jsonData === undefined)
        return;
    var anns = this.labelAnnotations;
    for(var i=0; i<jsonData.length; i++) {
        var annData = jsonData[i];
        var ann = {xval:annData.x, series:annData.series, tickHeight:20, text:annData.x.toFixed(3)};
        ann.posVal = annData.posVal;
        ann.velVal = annData.velVal;
        ann.accVal = annData.accVal;
        ann.div = this.createAnnotationDiv(annData.text, annData.posVal, annData.velVal, annData.accVal);
        anns.push(ann);
    }
    this.graph._graph.setAnnotations(anns);
};

CustomKinematicsGraphOperations.prototype.fillTrapezoidArea = function(trapezoid) {
    var ctx = this.canvas;
    ctx.fillStyle = trapezoid.color;  
    ctx.beginPath();
    ctx.moveTo(trapezoid.x0, trapezoid.y0);
    ctx.lineTo(trapezoid.x1, trapezoid.y1);
    ctx.lineTo(trapezoid.x2, trapezoid.y2);
    ctx.lineTo(trapezoid.x3, trapezoid.y3);
    //ctx.lineTo(trapezoid.x0, trapezoid.y0);
    ctx.fill();
};

CustomKinematicsGraphOperations.prototype.fillGraph = function(fillOptions) {
    this.graph.updateOptions({
         series:{
             'x': {
                        strokeWidth: 1.0,
                        fillGraph: true,
                        fillAlpha:0.15,
                        fillStartIndex:50,
                        fillLength:200
                    },
              'v': {
                        strokeWidth: 1.0,
                        fillGraph: true,
                        fillAlpha:0.15,
                        fillStartIndex:0,
                        fillLength:300
                    },
              'a': {
                        strokeWidth: 1.0,
                        fillGraph: true,
                        fillAlpha:0.15,
                        fillStartIndex:100,
                        fillLength:250
                    }       
                }
    });
    
  var g = this.graph._graph;
  var setNames = g.getLabels().slice(1);  // remove x-axis

  // getLabels() includes names for invisible series, which are not included in
  // allSeriesPoints. We remove those to make the two match.
  // TODO(danvk): provide a simpler way to get this information.
  for (var i = setNames.length; i >= 0; i--) {
    if (!g.visibility()[i]) setNames.splice(i, 1);
  }

  var anySeriesFilled = (function() {
    for (var i = 0; i < setNames.length; i++) {
      if (g.getBooleanOption("fillGraph", setNames[i])) return true;
    }
    return false;
  })();

  if (!anySeriesFilled) return;

  var area = g.getArea();
  var sets = g.plotter_.layout.points;
  var setCount = sets.length;

  var fillAlpha = g.getNumericOption('fillAlpha');
  var stackedGraph = g.getBooleanOption("stackedGraph");
  var colors = g.getColors();

  // For stacked graphs, track the baseline for filling.
  //
  // The filled areas below graph lines are trapezoids with two
  // vertical edges. The top edge is the line segment being drawn, and
  // the baseline is the bottom edge. Each baseline corresponds to the
  // top line segment from the previous stacked line. In the case of
  // step plots, the trapezoids are rectangles.
  var baseline = {};
  var currBaseline;
  var prevStepPlot;  // for different line drawing modes (line/step) per series

  // Helper function to trace a line back along the baseline.
  var traceBackPath = function(ctx, baselineX, baselineY, pathBack) {
    ctx.lineTo(baselineX, baselineY);
    if (stackedGraph) {
      for (var i = pathBack.length - 1; i >= 0; i--) {
        var pt = pathBack[i];
        ctx.lineTo(pt[0], pt[1]);
      }
    }
  };

  // process sets in reverse order (needed for stacked graphs)
  for (var setIdx = setCount - 1; setIdx >= 0; setIdx--) {
    var ctx = this.canvas;
    var setName = setNames[setIdx];
    if (!g.getBooleanOption('fillGraph', setName)) continue;
    var fillStartIndex = g.getNumericOption('fillStartIndex', setName);
    var fillLength = g.getNumericOption('fillLength', setName);
    if(fillStartIndex === -1)
        fillStartIndex = e.start;
    if(fillLength === -1)
        fillLength = e.end;
    var stepPlot = g.getBooleanOption('stepPlot', setName);
    var color = colors[setIdx];
    var axis = g.axisPropertiesForSeries(setName);
    var axisY = 1.0 + axis.minyval * axis.yscale;
    if (axisY < 0.0) axisY = 0.0;
    else if (axisY > 1.0) axisY = 1.0;
    axisY = area.h * axisY + area.y;

    var points = sets[setIdx];
    var xoord = g.toDomXCoord(points[0].x);
    var row = g.findClosestRow(xoord);
    var iter = Dygraph.createIterator(points, fillStartIndex-row, fillLength,
        DygraphCanvasRenderer._getIteratorPredicate(
            g.getBooleanOption("connectSeparatedPoints", setName)));

    // setup graphics context
    var prevX = NaN;
    var prevYs = [-1, -1];
    var newYs;
    // should be same color as the lines but only 15% opaque.
    var rgb = Dygraph.toRGB_(color);
    var err_color =
        'rgba(' + rgb.r + ',' + rgb.g + ',' + rgb.b + ',' + fillAlpha + ')';
    ctx.fillStyle = err_color;
    ctx.beginPath();
    var last_x, is_first = true;

    // If the point density is high enough, dropping segments on their way to
    // the canvas justifies the overhead of doing so.
    if (points.length > 2 * g.width_ || Dygraph.FORCE_FAST_PROXY) {
      ctx = DygraphCanvasRenderer._fastCanvasProxy(ctx);
    }

    // For filled charts, we draw points from left to right, then back along
    // the x-axis to complete a shape for filling.
    // For stacked plots, this "back path" is a more complex shape. This array
    // stores the [x, y] values needed to trace that shape.
    var pathBack = [];

    // TODO(danvk): there are a lot of options at play in this loop.
    //     The logic would be much clearer if some (e.g. stackGraph and
    //     stepPlot) were split off into separate sub-plotters.
    var point;
    while (iter.hasNext) {
      point = iter.next();
      if (!Dygraph.isOK(point.y) && !stepPlot) {
        traceBackPath(ctx, prevX, prevYs[1], pathBack);
        pathBack = [];
        prevX = NaN;
        if (point.y_stacked !== null && !isNaN(point.y_stacked)) {
          baseline[point.canvasx] = area.h * point.y_stacked + area.y;
        }
        continue;
      }
      if (stackedGraph) {
        if (!is_first && last_x == point.xval) {
          continue;
        } else {
          is_first = false;
          last_x = point.xval;
        }

        currBaseline = baseline[point.canvasx];
        var lastY;
        if (currBaseline === undefined) {
          lastY = axisY;
        } else {
          if(prevStepPlot) {
            lastY = currBaseline[0];
          } else {
            lastY = currBaseline;
          }
        }
        newYs = [ point.canvasy, lastY ];

        if (stepPlot) {
          // Step plots must keep track of the top and bottom of
          // the baseline at each point.
          if (prevYs[0] === -1) {
            baseline[point.canvasx] = [ point.canvasy, axisY ];
          } else {
            baseline[point.canvasx] = [ point.canvasy, prevYs[0] ];
          }
        } else {
          baseline[point.canvasx] = point.canvasy;
        }

      } else {
        if (isNaN(point.canvasy) && stepPlot) {
          newYs = [ area.y + area.h, axisY ];
        } else {
          newYs = [ point.canvasy, axisY ];
        }
      }
      if (!isNaN(prevX)) {
        // Move to top fill point
        if (stepPlot) {
          ctx.lineTo(point.canvasx, prevYs[0]);
          ctx.lineTo(point.canvasx, newYs[0]);
        } else {
          ctx.lineTo(point.canvasx, newYs[0]);
        }

        // Record the baseline for the reverse path.
        if (stackedGraph) {
          pathBack.push([prevX, prevYs[1]]);
          if (prevStepPlot && currBaseline) {
            // Draw to the bottom of the baseline
            pathBack.push([point.canvasx, currBaseline[1]]);
          } else {
            pathBack.push([point.canvasx, newYs[1]]);
          }
        }
      } else {
        ctx.moveTo(point.canvasx, newYs[1]);
        ctx.lineTo(point.canvasx, newYs[0]);
      }
      prevYs = newYs;
      prevX = point.canvasx;
    }
    prevStepPlot = stepPlot;
    if (newYs && point) {
      traceBackPath(ctx, point.canvasx, newYs[1], pathBack);
      pathBack = [];
    }
    ctx.fill();
  }
};
