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
    this.prevTime = 0;
    if(mathInputData !== undefined) {
        this.mathExpression = mathInputData.expression;
        this.setExpression(this.mathExpression);
        this.type = Number(mathInputData.type);
        this.timeRecordData = [{start:0, end:10, expression:this.mathExpression, code:this.code}];
    }
}

MathInput.prototype = {
    constructor : MathInput,
    
    getTimeRecord: function(t) {
       var currentRecord;
       for(var i=0; i<this.timeRecordData.length; i++) {
           var record = this.timeRecordData[i];
           if(t >= record.start && t < record.end) {
               currentRecord = record;
               break;
           }
       }
       if( currentRecord === undefined) {
           if( t < this.timeRecordData[0].start)
               currentRecord = this.timeRecordData[0];
           if( t > this.timeRecordData[this.timeRecordData.length-1].start)
               currentRecord = this.timeRecordData[this.timeRecordData.length-1];
       }
       return currentRecord;
    },
    
    addTimeRecord: function(time) {
        var index = -1;
        for(var i=0; i<this.timeRecordData.length; i++) {
            var record = this.timeRecordData[i];
            if( Number(time) <= record.end) {
                index = i;
                break;
            }
        }
        if(index !== -1) {
            var n = this.timeRecordData.length;
            this.timeRecordData.splice(index,n-index);
            var topRecord = this.timeRecordData[this.timeRecordData.length-1];
            if(topRecord !== undefined)
                this.prevTime = topRecord.end;
            else
                this.prevTime = 0;
        }        
        var min = this.prevTime;
        var max = Number(time);
        if(min > max) {
            min = Number(time);
            max = this.prevTime;
        }
        var code = math.compile(this.mathExpression);
        if(code === undefined )
            code = this.code;
        var newRecord = {start:min, end:max, expression:this.mathExpression, code:code};
        var topRecord = this.timeRecordData[this.timeRecordData.length-1];
        if(topRecord !== undefined) {
            var res = topRecord.expression.localeCompare(this.mathExpression);
            if(res === 0) { // same expression, modify the existing record
                topRecord.end = max;
            }
            else { // insert new
                if(min !== max)
                    this.timeRecordData.push(newRecord);
            }
        }
        else { // insert new
            if(min !== max)
                this.timeRecordData.push(newRecord);
        }
        this.prevTime = max;
        
//        for(var i=0; i<this.timeRecordData.length; i++) {
//            var record = this.timeRecordData[i];
//            console.log(record.start + " " + record.end + " " + record.expression);
//        }
    },
    
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
       var currentRecord;
       for(var i=0; i<this.timeRecordData.length; i++) {
           var record = this.timeRecordData[i];
           if(t >= record.start && t < record.end) {
               currentRecord = record;
               break;
           }
       }
       if( currentRecord === undefined) {
           if( t < this.timeRecordData[0].start)
               currentRecord = this.timeRecordData[0];
           if( t > this.timeRecordData[this.timeRecordData.length-1].start)
               currentRecord = this.timeRecordData[this.timeRecordData.length-1];
       }
       var code;
       if(currentRecord !== undefined)
             code = currentRecord.code;
       else
           code = this.code;
       
       var result = code.eval(this.scope);
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
