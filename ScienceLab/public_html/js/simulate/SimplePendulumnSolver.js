/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/*
 * This implementation is based on the paper by Mueller etc.
 * http://matthias-mueller-fischer.ch/publications/posBasedDyn.pdf
 */

SimplePendulumn = function(length, origin)
{
    this.origin = new THREE.Vector2();
    this.origin.x = origin.x;
    this.origin.y = origin.y;
    this.position = new THREE.Vector2();
    this.position.x = origin.x;
    this.position.y = origin.y - length;
    this.prevPosition = new THREE.Vector2();
    this.prevPosition.x = this.position.x;
    this.prevPosition.y = this.position.y;    
    
    this.angularSpeed = 2;
    this.angle = 0.0;
    this.velocity = new THREE.Vector2();
    this.tempVector = new THREE.Vector2();
    this.length = length;
    this.maxTheta = 15;
    this.offset = 0;
    this.damping = 0.0;
    this.g = -10;
};

SimplePendulumn.prototype = {
    constructor: SimplePendulumn,
    
    setOrigin : function(origin)
    {
        this.origin.x = origin.x;
        this.origin.y = origin.y;
    },
    
    update : function(dt)
    {
        this.angularSpeed += this.g/this.length * this.position.x/this.length * dt; 
        this.angularSpeed /= ( 1.0 + this.damping);
        this.angle += this.angularSpeed * dt;
        
        this.position.x = this.length * Math.sin(this.angle);
        this.position.y = this.length * Math.cos(this.angle);
        
        this.velocity.x = this.angularSpeed * this.position.x;
        this.velocity.y = this.angularSpeed * this.position.y;
        
        this.position.x = this.origin.x + this.position.x;
        this.position.y = this.origin.y - this.position.y;
    }
};
