/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

Spring = function(body1, body2) {
    this.k = 100;
    this.damping = 0.1;
    this.body1 = body1;
    this.body2 = body2;
};

PhysicalBody = function(l, w, b, mass)
{
    this.position = new THREE.Vector3(0,0,0);
    this.angle = 0.0;
    this.angularSpeed = 0.0;
    this.length = l;
    this.width = w;
    this.breadth = b;
    this.moi = mass/12*(l*l + w*w);
    this.torque = 0;
};

TorisionWaveSimulation = function(N, positions)
{
    this.springs = [];
    this.bodies = [];
    this.numBodies = N;
    this.length = 15.0;
    this.height = 3.0;
    this.time = 0;
    this.bodyPositions = positions;
    this.tempVector = new THREE.Vector3();
};

TorisionWaveSimulation.prototype = {
constructor : TorisionWaveSimulation,    

init : function()
{
    for( var i=0; i<this.numBodies; i++) {
        // Create body
        var body;
        if(i<this.numBodies/2)
            body = new PhysicalBody(2,0.2,0.2,1);
        else
            body = new PhysicalBody(2,0.2,0.2,1);
        this.addBody(body);
        body.position.x = this.bodyPositions[i].x;
        body.position.y = this.bodyPositions[i].y;
        body.position.z = this.bodyPositions[i].z;
    }
    for( var i=0; i<this.numBodies-1; i++) {
        this.springs.push(new Spring(this.bodies[i], this.bodies[i+1]));
    }
    this.springs.push(new Spring(this.bodies[this.numBodies-1]));
    this.bodies[this.numBodies-1].angularSpeed = 50;
},

addBody : function(body)
{
    this.bodies.push(body);
},
// Integrator
integrate : function(dt)
{
    for( var i=0; i<this.bodies.length; i++ )
    {
        var body = this.bodies[i];
        body.angularSpeed += body.torque * 1.0/body.moi * dt;
        body.angle += body.angularSpeed * dt;
    }
},

updateSpringForces : function() {
    for( var i=0; i<this.springs.length; i++ ) {
        var body1 = this.springs[i].body1;
        var body2 = this.springs[i].body2;
        var a1 = 0, a2 = 0;
        if(body1)
           a1 = body1.angle;
        if(body2)
           a2 = body2.angle;
        var forceMagnitude = this.springs[i].k * (a1 - a2);
        var w1 = 0, w2 = 0;
        if(body1)
           w1 = body1.angularSpeed;
        if(body2)
           w2 = body2.angularSpeed;
        var dampingForce = this.springs[i].damping * (w1 - w2);
        if(body1)
           body1.torque -= forceMagnitude + dampingForce;         
        if(body2)
           body2.torque += forceMagnitude + dampingForce;         
    }
},
// Update
updateSimulation : function(dt)
{
    for( var i=0; i<this.bodies.length; i++ ) {
        this.bodies[i].torque = 0;
    }
    //this.bodies[this.numBodies-1].angularSpeed += -3.1*Math.sin(this.time*1);
    this.time += dt;
    
    this.updateSpringForces();
    
    this.integrate(dt);
}
};
