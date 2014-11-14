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
    this.theta = 0.0;
    this.speed = 0.0;
    this.acceleration = 0.0;
    this.pe = 0.0; // Potential energy
    this.ke = 0.0; // Kinetic energy
    this.maxTheta = 15;
    this.phase = 0.0;
    this.g = 10.0;
    this.offset = 0;
    this.omega = Math.sqrt(this.g/this.length);
};

SimplePendulumn = function(length)
{
    this.origin = new THREE.Vector2();
    this.position = new THREE.Vector2();
    this.length = length;
    this.time = 0.0;
    this.theta = 0.0;
    this.speed = 0.0;
    this.acceleration = 0.0;
    this.pe = 0.0; // Potential energy
    this.ke = 0.0; // Kinetic energy
    this.maxTheta = 25;
    this.phase = 0.0;
    this.g = 10.0;
    this.offset = 0;
    this.omega = Math.sqrt(this.g/this.length);
};

SimplePendulumn.prototype = {
    constructor: SimplePendulumn,
    
    init : function(length)
    {
        this.origin = new THREE.Vector2();
        this.position = new THREE.Vector2();
        this.length = length;
        this.time = 0.0;
        this.maxTheta = 25;
        this.phase = 0.0;
        this.g = 10.0;
        this.offset = 0;
        this.omega = Math.sqrt(this.g/this.length);
    },
    
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
        var phase_ = this.time*this.omega;
        this.theta = this.maxTheta * Math.sin( phase_ + this.phase*Math.PI/180) * Math.PI/180;
        this.speed = this.maxTheta * this.length * this.omega * Math.cos( phase_ + this.phase*Math.PI/180) * Math.PI/180;
        this.acceleration = -this.maxTheta * this.length * this.omega * this.omega * Math.sin( phase_ + this.phase*Math.PI/180) * Math.PI/180;
        this.position.x = this.origin.x + this.length * Math.sin(this.theta);
        this.position.y = this.origin.y + -this.length * Math.cos(this.theta);
        this.updateEnergies(dt);
        this.time += dt;
    },
    
    updateEnergies : function(dt)
    {
        this.pe = this.g * this.length * ( 1.0 - Math.cos(this.theta)); // mgl(1-cos(theta))
        this.ke = 0.5 * this.speed * this.speed; // 1/2*m*v2
    }
};
