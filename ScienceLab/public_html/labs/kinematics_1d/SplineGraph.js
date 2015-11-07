/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

function SplineGraph(div, graphInputData) {
    this.data = [];
    this.numPoints = 10;
    this.bSpline = null;
    this.numSplines = this.numPoints - 1;
    this.numDivisionsbetweenPoints = 10;
    this.splines = [];
    this.sparsePoints = [];
    this.v4Active = false;
    this.clickedPoint = null;
    
    this.timeWindow = 7;
    this.curveType = SplineGraph.X_T;
    this.scaleFactor = 5.0;
    this.linearInterpolation = false;
    this.graphChangeCallBack = null;
    if(graphInputData !== undefined) {
        for(var i=0; i<graphInputData.points.length; i++) {
            this.sparsePoints.push(graphInputData.points[i]);
        }
        this.numPoints = this.sparsePoints.length;
        this.timeWindow = graphInputData.timeWindow;
        this.curveType = graphInputData.type;
        this.scaleFactor = 5.0;
        this.linearInterpolation = graphInputData.linearInterpolation;
        this.numSplines = this.numPoints - 1;
    }
    
    this.initSplineStuff();
    function mouseMotion_(event, g, context) {
        if (this.clickedPoint !== null) {
            var graphPos = Dygraph.findPos(g.graphDiv);
            var canvasx = Dygraph.pageX(event) - graphPos.x;
            var canvasy = Dygraph.pageY(event) - graphPos.y;
            var vals = this.data[this.clickedPoint];
            var newvals = g.toDataCoords(canvasx, canvasy);
            vals[1] = newvals[1];
            var index = Math.floor(this.clickedPoint / this.numDivisionsbetweenPoints);
            this.sparsePoints[index] = newvals[1];
            this.CalculateCubicSplineData(this.sparsePoints);
            this.updateDensePointsInGraphData();
            this.graphChangeCallBack();
            g.updateOptions({'file': this.data});
        }
    };
    var mouseMotion = mouseMotion_.bind(this);
         
    function moveV4_(event, g, context) {
        var RANGE = 7;
        if (this.v4Active) {
            var graphPos = Dygraph.findPos(g.graphDiv);
            var canvasx = Dygraph.pageX(event) - graphPos.x;
            var canvasy = Dygraph.pageY(event) - graphPos.y;

            var rows = g.numRows();
            for (var row = 0; row < rows; row++) {
                var date = g.getValue(row, 0);
                var x = g.toDomCoords(date, null)[0];
                var diff = Math.abs(canvasx - x);
                if (diff < RANGE) {
                    for (var col = 1; col < 2; col++) {
                        var vals = g.getValue(row, col);
                        if (vals == null) {
                            continue;
                        }
                        var y = g.toDomCoords(null, vals)[1];
                        var diff2 = Math.abs(canvasy - y);
                        if (diff2 < RANGE) {
                            this.clickedPoint = row;
                            return;
                        }
                    }
                }
            }
        }
    };
    
    var moveV4 = moveV4_.bind(this);

    function downV4_(event, g, context) {
        context.initializeMouseDown(event, g, context);
        this.v4Active = true;
        moveV4(event, g, context);
    };

    var downV4 = downV4_.bind(this);

    function upV4_(event, g, context) {
        if (this.v4Active) {
            this.v4Active = false;
            this.clickedPoint = null;
        }
    };

    var upV4 = upV4_.bind(this);

    this.graph = new Dygraph(div,
            this.data,
            {
                dateWindow: [-0.1, 1.1],
                valueRange: [-0.1, 1.1],
                labels: ['x', 'A', 'B'],
                series: {
                    'A': {
                        strokeWidth: 0.0,
                        drawPoints: true,
                        pointSize: 4,
                        highlightCircleSize: 6
                    },
                    'B': {
                        highlightCircleSize: 3,
                        drawPoints: true
                    }
                },
                legend: 'never',
                animatedZooms: true,
                drawGrid: false,
                interactionModel: {
                    'mousedown': downV4,
                    'mousemove': mouseMotion,
                    'mouseup': upV4
                }
            });
}

SplineGraph.X_T = 0;
SplineGraph.V_T = 1;
SplineGraph.A_T = 2;

SplineGraph.prototype.reset = function() {
    this.updateDensePointsInGraphData();
    this.graph.updateOptions({'file': this.data});
};
       
SplineGraph.prototype.setLinearInterpolation = function(bLinear) {
    this.linearInterpolation = bLinear;
};

SplineGraph.prototype.getPersistentDataAsJSON = function() {
    var res = JSON.stringify({points: this.sparsePoints, type:this.curveType, timeWindow:this.timeWindow, linearInterpolation:this.linearInterpolation});
    var out = JSON.parse(res);
    return out;
};

SplineGraph.prototype.initSplineStuff = function () {
    for (var i = 0; i < this.numSplines; i++) {
        this.splines[i] = new CubicSpline();
    }
    var numTotalPoints = this.numDivisionsbetweenPoints * this.numSplines;
    var count = 0;
    for (var i = 0; i <= numTotalPoints; i++) {
        var t = i / (numTotalPoints);
        var val;
        if((i % this.numDivisionsbetweenPoints) === 0) {
            val = this.sparsePoints[count++];
        }else{
            val = null;
        }
        this.data.push([t, val, 0.5]);
    }
    this.CalculateCubicSplineData(this.sparsePoints);
    this.updateDensePointsInGraphData();
};

SplineGraph.prototype.CalculateCubicSplineData = function (data) {
    var D = [], y = [], rhs = [];
    for (var i = 0; i < data.length; i++) {
        y[i] = data[i];
    }
    for (var i = 1; i < data.length - 1; i++) {
        rhs[i] = 3 * (y[i + 1] - y[i - 1]);
    }
    rhs[0] = 3 * (y[1] - y[0]);
    rhs[data.length - 1] = 3 * (y[data.length - 1] - y[data.length - 2]);

    CubicSplineInterpolator.tridia_sl(rhs, D);
    CubicSplineInterpolator.findSplineCoeff(this.splines, D, y);
};

SplineGraph.prototype.updateDensePointsInGraphData = function () {
    var count = 0;
    for (var i = 0; i < this.splines.length; i++) {
        var currentSpline = this.splines[i];
        var p1 = this.sparsePoints[i];
        var p2 = this.sparsePoints[i+1];
        var n = this.numDivisionsbetweenPoints;
        if (i === this.splines.length - 1)
            n = this.numDivisionsbetweenPoints + 1;
        var interpolatedVal;
        for (var j = 0; j < n; j++) {
            var t = j / this.numDivisionsbetweenPoints;
            if(this.linearInterpolation)
                 interpolatedVal = p1 * (1-t) + p2 * t;
            else 
                 interpolatedVal = currentSpline.Value(t);
            var vals = this.data[count++];
            vals[2] = interpolatedVal;
        }
    }
};

SplineGraph.prototype.setType = function(type) {
    this.curveType = type;
};

SplineGraph.prototype.Value = function(t) {
    if(t > this.timeWindow){
        t = this.timeWindow;
    }
    // Find the spline index
    var deltaT = this.timeWindow/this.numSplines;
    var tval = t/deltaT;
    var index = Math.floor(tval);
    index = index >= this.numSplines ? this.numSplines-1 : index;
    var p1 = this.sparsePoints[index];
    var p2 = this.sparsePoints[index+1];
    var spline = this.splines[index];
    if(spline) {
        var t_ = tval - index;
       var val; 
       if(this.linearInterpolation) 
            val = (p1*(1-t_) + p2*t_) * this.scaleFactor;
       else 
            val = spline.Value(tval - index) * this.scaleFactor;
       return val;
    } else {
        return 0;
    }
};

SplineGraph.prototype.Velocity = function(t) {
    if(t > this.timeWindow){
        t = this.timeWindow;
    }
    // Find the spline index
    var deltaT = this.timeWindow/this.numSplines;
    var tval = t/deltaT;
    var index = Math.floor(tval);
    index = index >= this.numSplines ? this.numSplines-1 : index;
    var p1 = this.sparsePoints[index];
    var p2 = this.sparsePoints[index+1];
    var spline = this.splines[index];
    if(spline) {
       var val;
       if(this.linearInterpolation) 
            val = (-p1 + p2) * this.scaleFactor;
       else 
            val = spline.FirstDerivative(tval - index) * this.scaleFactor;
       return val;
    } else {
        return 0;
    }
}; 

SplineGraph.prototype.Acceleration = function(t) {
    if(t > this.timeWindow){
        t = this.timeWindow;
    }
    // Find the spline index
    var deltaT = this.timeWindow/this.numSplines;
    var tval = t/deltaT;
    var index = Math.floor(tval);
    index = index >= this.numSplines ? this.numSplines-1 : index;
    var spline = this.splines[index];
    if(spline) {
       var val;
       if(this.linearInterpolation) 
           val = 0;
       else    
         val = spline.SecondDerivative(tval - index) * this.scaleFactor;
       return val;
    } else {
        return 0;
    }   
}; 