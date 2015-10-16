/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

function SplineGraph(div) {
    this.testPoints = [[1,1], [2,2], [3,3], [4,2], [5,1]]
    this.testSpline = new BSpline(this.testPoints, 3, true);
    var n = 100;
    for( var i=0; i<n; i++) {
        var t = i/(n-1);
        var interpolatedVal = this.testSpline.calcAt(t);
        console.log("x = " + interpolatedVal[0] + "  y = " + interpolatedVal[1])
    }
    
    this.data = [];
    this.numPoints = 5;
    this.bSpline = null;
    this.numDivisionsbetweenPoints = 10;
    this.sparsePoints = [];
    this.v4Active = false;
    this.clickedPoint = null;
    
    this.timeWindow = 7;
    this.curveType = SplineGraph.X_T;
    this.scaleFactor = 5.0;
    
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
            this.sparsePoints[index][1] = newvals[1];
            this.updateDensePointsInGraphData();
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

SplineGraph.prototype.getPersistentDataAsJSON = function() {
    var res = JSON.stringify({points: this.sparsePoints, type:this.curveType});
    var out = JSON.parse(res);
    return out;
};

SplineGraph.prototype.initSplineStuff = function () {
    var numTotalPoints = this.numDivisionsbetweenPoints * (this.numPoints-1);
    this.sparsePoints.push([0.0,0.0]);
    this.data.push([0.0, 0.0, 0.0]);
    var count = 1;
    for (var i = 1; i <= numTotalPoints; i++) {
        var t = i / (numTotalPoints);
        var rand = t*t;
        var val = (i % this.numDivisionsbetweenPoints) === 0 ? rand : null;
        if (val !== null) {
            this.sparsePoints.push([t,val]);
        }
        this.data.push([t, val, 0.5]);
    }
    this.bSpline = new BSpline(this.sparsePoints, 3, true);
    this.updateDensePointsInGraphData();
};

SplineGraph.prototype.updateDensePointsInGraphData = function () {
    var nPoints = (this.numPoints-1) * this.numDivisionsbetweenPoints;
    var dt = 1/nPoints;
    var t = 0;
    for (var i = 0; i <= nPoints; i++) {
        var interpolatedVal = this.bSpline.calcAt(t);
        var vals = this.data[i];
        //vals[0] = interpolatedVal[0];
        vals[2] = interpolatedVal[1];
        t += dt;
    }
};

SplineGraph.prototype.setType = function(type) {
    this.curveType = type;
};

SplineGraph.prototype.Value = function(t) {
    if(t > this.timeWindow)
        return 1;
    // Find the spline index
    var t_ = t/this.timeWindow;
    return this.bSpline.calcAt(t_);
};

SplineGraph.prototype.Velocity = function(t) {
    if(t > this.timeWindow)
        return 0;
    // Find the spline index
    var deltaT = this.timeWindow/this.numSplines;
    var tval = t/deltaT;
    var index = Math.floor(tval);
    var spline = this.splines[index];
    if(spline) {
       var val = spline.FirstDerivative(tval - index) * this.scaleFactor;
       return val;
    } else {
        return 0;
    }
}; 

SplineGraph.prototype.Acceleration = function(t) {
    if(t > this.timeWindow)
        return 0;
    // Find the spline index
    var deltaT = this.timeWindow/this.numSplines;
    var tval = t/deltaT;
    var index = Math.floor(tval);
    var spline = this.splines[index];
    if(spline) {
       var val = spline.SecondDerivative(tval - index) * this.scaleFactor;
       return val;
    } else {
        return 0;
    }   
}; 