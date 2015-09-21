/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
function CubicSpline() {
    this.a = 0;
    this.b = 0;
    this.c = 0;
    this.d = 0;
}

CubicSpline.prototype.Value = function(t) {
    if (t > 1 || t < 0)
        return 0;
    var y = this.a + this.b * t + this.c * t * t + this.d * t * t * t;
    return y;
};

CubicSpline.prototype.FirstDerivative = function(t) {
    if (t > 1 || t < 0)
        return 0;
    var y = this.b + 2.0 * this.c * t + 3.0 * this.d * t * t;
    return y;
};

CubicSpline.prototype.SecondDerivative = function(t) {
    if (t > 1 || t < 0)
        return 0;
    var y = 2.0 * this.c + 6.0 * this.d * t;
    return y;
};

function CubicSplineInterpolator() {

}

CubicSplineInterpolator.tridia_sl = function (lower, main, upper, rhs, sol) {
    this.solver(lower, upper, main, rhs, sol);
};

CubicSplineInterpolator.tridia_sl = function (rhs, sol) {
    var lower = [];
    var upper = [];
    var main = [];
    for (var i = 0; i < rhs.length - 1; i++) {
        lower[i] = 1.0;
        upper[i] = 1.0;
    }
    for (var i = 0; i < rhs.length; i++) {
        main[i] = 4.0;
    }

    main[0] = 2;
    main[rhs.length - 1] = 2;

    this.solver(lower, upper, main, rhs, sol);
};

CubicSplineInterpolator.solver = function (l, u, d, r, y) {
    var n = d.length;
    //gauss_elimination:do i=1,n-1
    for (var i = 0; i < n - 2; i++) {
        u[i] = u[i] / d[i];
        r[i] = r[i] / d[i];
        d[i] = d[i] / d[i];
        r[i + 1] = r[i] * l[i] - r[i + 1];
        d[i + 1] = l[i] * u[i] - d[i + 1];
        u[i + 1] = -u[i + 1];
        l[i] = l[i] * d[i] - l[i];
    }
    y[n - 1] = r[n - 1] / d[n - 1];
    //back_substitution:do i=n-1,1,-1
    for (var i = n - 2; i >= 0; i--) {
        y[i] = (r[i] - u[i] * y[i + 1]) / d[i];
    }
};

CubicSplineInterpolator.findSplineCoeff = function (splines, D, y) {
    for (var i = 0; i < y.length - 1; i++) {
        splines[i].a = y[i];
        splines[i].b = D[i];
        splines[i].c = 3 * (y[i + 1] - y[i]) - 2 * D[i] - D[i + 1];
        splines[i].d = 2 * (y[i] - y[i + 1]) + D[i] + D[i + 1];
    }
};

CubicSplineInterpolator.interpolate = function (spline, t) {
    if (t > 1 || t < 0)
        return 0;
    var y = spline.a + spline.b * t + spline.c * t * t + spline.d * t * t * t;
    return y;
};


