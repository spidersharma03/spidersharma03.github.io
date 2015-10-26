/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

function MathInput(mathInputData) {
    this.mathExpression = null;
    this.code = null;
    this.scope = {t:0};
    this.type = 0; // x-t/v-t/a-t
    if(mathInputData !== undefined) {
        this.mathExpression = mathInputData.expression;
        this.setExpression(this.mathExpression);
        this.type = Number(mathInputData.type);
    }
}

MathInput.prototype = {
    constructor : MathInput,
    
    getPersistentDataAsJSON: function() {
        var res = JSON.stringify({expression: this.mathExpression, type:this.type});
        var out = JSON.parse(res);
        return out;
    },
    
    setExpression: function(expression) {
        this.mathExpression = expression;
        try{
            this.code = math.compile(this.mathExpression);
            var res = this.code.eval(this.scope);
            return this.isNumeric(res);
        }
        catch(err){
            return false;
        }
    },
    
    Value: function(t) {
       this.scope.t = t; 
       var result = this.code.eval(this.scope);
       if(this.isNumeric(result))
            return result;
       else
            return 0;
    },
    
    FirstDerivative: function(t) {
        var epsilon = 0.001;
        var t2 = t + epsilon;
        var t1 = t - epsilon;
        var d = this.Value(t2) - this.Value(t1);
        return d/epsilon * 0.5;
    },
    
    SecondDerivative: function(t) {
        var epsilon = 0.001;
        var t2 = t + epsilon;
        var t1 = t - epsilon;
        var d = this.Value(t2) + this.Value(t1) - 2*this.Value(t);
        return d/(epsilon * epsilon);
    },
    
    setType: function(type) {
        this.type = type;
    },
    
    isNumeric: function(val) {
        return !isNaN(parseFloat(val)) && isFinite(val);
    }
};
