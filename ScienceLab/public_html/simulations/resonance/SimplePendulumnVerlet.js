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
        this.updateVelocities(dt);
        this.dampVelocities(dt);
        
        this.position.x = this.position.x + this.velocity.x * dt;
        this.position.y = this.position.y + this.velocity.y * dt;
        
        this.projectConstraint();
        
        this.velocity.x = (this.position.x - this.prevPosition.x)/dt;
        this.velocity.y = (this.position.y - this.prevPosition.y)/dt;
        this.prevPosition.x = this.position.x;
        this.prevPosition.y = this.position.y;
    },
    
    updateVelocities : function(dt)
    {
        this.velocity.y += this.g * dt;
    },
    
    dampVelocities : function(dt)
    {
        // Implicit damping
        this.velocity.x /= ( 1.0 + this.damping * dt);
        this.velocity.y /= ( 1.0 + this.damping * dt);
    },
    
    projectConstraint : function()
    {
        // Satisfy the constraints
        var dx = this.position.x - this.origin.x;
        var dy = this.position.y - this.origin.y;
        var error = Math.sqrt(dx*dx + dy*dy) - this.length;
        
        // Direction of Constraint
        //if( error > 0.0 ) 
        {
            this.tempVector.x = dx; this.tempVector.y = dy;
            this.tempVector.normalize();
            this.position.x = this.origin.x + this.tempVector.x * this.length;
            this.position.y = this.origin.y + this.tempVector.y * this.length;
        }
    }
};
