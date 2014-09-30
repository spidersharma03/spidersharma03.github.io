/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


SimplePendulumn = function()
{
    this.origin = new THREE.Vector2();
    this.position = new THREE.Vector2();
    this.length = 1.8;
    this.time = 0.0;
    this.maxTheta = 15;
    this.phase = 0.0;
};

SimplePendulumn.prototype = {
    constructor: SimplePendulumn,
    
    setLength : function(length)
    {
        this.length = length;
    },
    
    setOrigin : function(origin)
    {
        this.origin.x = origin.x;
        this.origin.y = origin.y;
    },
    
    update : function(dt)
    {
        var theta = this.maxTheta * Math.sin(this.time*3 + this.phase*Math.PI/180) * 3.14/180;
        this.position.x = this.origin.x + this.length * Math.sin(theta);
        this.position.y = this.origin.y + -this.length * Math.cos(theta);
        this.time += dt;
    }
};
