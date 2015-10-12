/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

function TestScript() {
    this.name = "Hello There";
}

TestScript.prototype = {
    constructor: TestScript,
    
    print: function() {
        console.log(this.name);
    }
};
