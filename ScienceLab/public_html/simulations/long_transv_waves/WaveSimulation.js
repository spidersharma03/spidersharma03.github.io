/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

Spring = function(length, body1, body2) {
    this.length = length;
    this.k = 30.0;
    this.body1 = body1;
    this.body2 = body2;
};

WaveSimulation = function(N)
{
    this.springs = [];
    this.contacts = [];
    this.bodies = [];
    this.constraints = [];
    this.gravity = -10;
    this.e = 10.0;
    this.numIterations = 0;
    this.numPendulumns = N;
    this.solverMethod = 0;
    this.length = 15.0;
    this.height = 3.0;
    this.pivots = [];
    this.sphereRadius = 0.03;
    this.time = 0;
    this.tempVector = new THREE.Vector3();
};

var WaveSimulation = new WaveSimulation(60);

WaveSimulation.init = function()
{
    // Create Spheres
    var x = this.length/2+0.5;
    for( var i=0; i<this.numPendulumns; i++)
    {
        // Create body
        var sphereBody = new WaveSimulation.PhysicalBody(this.sphereRadius,1);
        sphereBody.position.x = 0;
        sphereBody.position.y = x;
        sphereBody.position.z = 0;
        WaveSimulation.addBody(sphereBody);
        // Create Constraints
        //this.pivots[i] = new THREE.Vector3(x,this.height,0);
        //var constraint = new WaveSimulation.Constraint(sphereBody, this.pivots[i]);
        //WaveSimulation.addConstraint(constraint);
        x -= this.sphereRadius*3.4;
    }
    // Create and push contacts
    for( var i=0; i<this.numPendulumns-1; i++)
    {
        var contact = new WaveSimulation.Contact();
        contact.body1 = this.bodies[i];
        contact.body2 = this.bodies[i+1];
        this.contacts.push(contact);
    }
    // Initialize Springs
    for( var i=0; i<this.numPendulumns-1; i++) {
        var p1 = this.bodies[i].position;
        var p2 = this.bodies[i+1].position;
        var dx = p1.x - p2.x; var dy = p1.y - p2.y; var dz = p1.z - p2.z;
        var d = Math.sqrt(dx*dx + dy*dy + dz*dz);
        this.springs.push(new Spring(d, this.bodies[i], this.bodies[i+1]));
    }
    this.bodies[0].mass = 0;
    this.bodies[0].massInv = 0;
    //this.bodies[59].mass = 0;
    //this.bodies[59].massInv = 0;
};

WaveSimulation.addContact = function(contact)
{
    this.contacts.push(contact);
};

WaveSimulation.removeContact = function(contact)
{
    // remove the contact from list of contacts
};

WaveSimulation.addConstraint = function(constraint)
{
    this.constraints.push(constraint);
};

WaveSimulation.removeConstraint = function(constraint)
{
    // remove the constraint from list of constraints
};

WaveSimulation.addBody = function(body)
{
    this.bodies.push(body);
},


WaveSimulation.Contact = function()
{
    this.body1 = null;
    this.body2 = null;
    this.position = new THREE.Vector3();
    this.normal   = new THREE.Vector3();
    this.active   = false;
    this.penetration = 0;
};

WaveSimulation.PhysicalBody = function(r, mass)
{
    this.position = new THREE.Vector3(0,0,0);
    this.velocity = new THREE.Vector3(0,0,0);
    this.mass   = mass;
    if(this.mass === 0)
     this.massInv   = 0;
    else
     this.massInv   = 1/this.mass;    
    this.radius = r;
    this.force = new THREE.Vector3(0,0,0);
    this.static = false;
};

WaveSimulation.Constraint = function(body,pivot)
{
    this.body = body;
    this.pivotPoint = new THREE.Vector3(pivot.x, pivot.y, pivot.z);
    var dx = body.position.x - pivot.x;
    var dy = body.position.y - pivot.y;
    this.restLength = Math.sqrt(dx*dx+dy*dy);
};

// Satisfy Constraints
WaveSimulation.satisfyConstraints = function()
{
    for( var i=0; i<this.constraints.length; i++ )
    {
        var constraint = this.constraints[i];
        constraint.apply();
    }
};

// Integrator
WaveSimulation.integrate = function(dt)
{
    for( var i=0; i<this.bodies.length; i++ )
    {
        var body = this.bodies[i];
        
        if( body.mass !== 0 )
            body.velocity.y += this.gravity * dt;
        //console.log(body.force.x);
//        body.velocity.x += body.force.x * body.massInv * dt;
//        body.velocity.y += body.force.y * body.massInv * dt;
//        body.velocity.z += body.force.z * body.massInv * dt;
        
        body.position.x += body.velocity.x * dt;
        body.position.y += body.velocity.y * dt;
        body.position.z += body.velocity.z * dt;
    }
};

WaveSimulation.processContacts = function()
{
    return;
    this.numIterations = 0;
    while(true)
    {
        this.numIterations++;

        for( var i=0; i<this.contacts.length; i++ )
        {
            var contact = this.contacts[i];
            if( contact.active )
            {
                var body1 = contact.body1;                
                var body2 = contact.body2;
                var veldx = body2.velocity.x - body1.velocity.x;
                var veldy = body2.velocity.y - body1.velocity.y;
                var vDotN = veldx * contact.normal.x + veldy * contact.normal.y;
                var contactImpulse = (1+this.e) * vDotN / ( body1.massInv + body2.massInv );
                // Apply Contact Impulse
                body1.velocity.x += contactImpulse * body1.massInv * contact.normal.x;
                body1.velocity.y += contactImpulse * body1.massInv * contact.normal.y;
                var vMag = body1.velocity.length();
                if( vMag < 0.2 )
                {
                    body1.velocity.x = 0;
                    body1.velocity.y = 0;
                }
                body2.velocity.x -= contactImpulse * body2.massInv * contact.normal.x;
                body2.velocity.y -= contactImpulse * body2.massInv * contact.normal.y;
                if( body2.velocity.length() < 0.2 )
                {
                    body2.velocity.x = 0;
                    body2.velocity.y = 0;
                }
                // Resolve penetration
                var posImpulse = 0.5*contact.penetration/( body1.massInv + body2.massInv );
                body1.position.x += posImpulse * contact.normal.x * body1.massInv;
                body1.position.y += posImpulse * contact.normal.y * body1.massInv;
                body2.position.x -= posImpulse * contact.normal.x * body2.massInv;
                body2.position.y -= posImpulse * contact.normal.y * body2.massInv;
            }
        }
        // Check and Activate contacts as necessary, if there are no more active contacts, exit
        var bAllProcessed = this.checkAndActivateContacts();
        if( bAllProcessed )
            break;
    }
};

WaveSimulation.checkAndActivateContacts = function()
{
    var bResult = true;
    for( var i=0; i<this.bodies.length-1; i++ )
    {
        var body_i = this.bodies[i];        
        var body_j = this.bodies[i+1];
        
        var collisionDepth = body_i.isColliding(body_j);
        if(  collisionDepth <= 0 )
        {
            // Contact Normal points towards body_j
            var nx = body_j.position.x - body_i.position.x;
            var ny = body_j.position.y - body_i.position.y;
            var len = Math.sqrt(nx*nx + ny*ny);
            nx /= len; ny /= len;
            this.contacts[i].normal.x = nx;
            this.contacts[i].normal.y = ny;
            this.contacts[i].penetration = collisionDepth;
            // Activate Contact if the bodies are not seperating
            var v1 = body_i.velocity;
            var v2 = body_j.velocity;
            var rel_v_dx = v2.x - v1.x;                
            var rel_v_dy = v2.y - v1.y;
            
            var vDotN = rel_v_dx * nx + rel_v_dy * ny;
            //var eps = Math.sqrt(2*this.gravity*0.01);
            //if( vDotN < 0 && vDotN <  eps ) 
            if( vDotN < 0 && Math.abs(vDotN) > 0.1 ) // bodies are reaching 
            {
                this.contacts[i].active = true;
                bResult = false;
            }
            else
                this.contacts[i].active = false;
        }
    }
    return bResult;
};

WaveSimulation.updateSpringForces = function() {
    for(var j=0; j<this.numPendulumns; j++ ) {
     for( var i=0; i<this.springs.length; i++ ) {
         var body1 = this.springs[i].body1;
         var body2 = this.springs[i].body2;
         var p1 = body1.position;
         var p2 = body2.position;
         var dx = p2.x - p1.x; var dy = p2.y - p1.y; var dz = p2.z - p1.z;
         var error = Math.sqrt(dx*dx + dy*dy + dz*dz) - this.springs[i].length;
         /*var forceMagnitude = this.springs[i].k * (this.springs[i].length - d);
         dx /= d; dy /= d; dz /= d;
         body1.force.x += dx*forceMagnitude;
         body1.force.y +=  dy*forceMagnitude;
         body1.force.z +=  dz*forceMagnitude;
         
         body2.force.x -= dx*forceMagnitude;
         body2.force.y -=  dy*forceMagnitude;
         body2.force.z -=  dz*forceMagnitude;*/
        
        // Direction of Constraint impulse
        this.tempVector.x = dx; this.tempVector.y = dy; this.tempVector.z = dz;
        
        var v1 = body1.velocity;
        var v2 = body2.velocity;
        var vDotN = (v2.x - v1.x) * this.tempVector.x + (v2.y - v1.y) * this.tempVector.y + (v2.z - v1.z) * this.tempVector.z;
        this.tempVector.normalize();
        this.tempVector.multiplyScalar(vDotN + error);
        this.tempVector.multiplyScalar(body1.massInv + body2.massInv);
        
        if(error > 0 ) {
            body1.velocity.x += this.tempVector.x * body1.massInv;
            body1.velocity.y += this.tempVector.y * body1.massInv;
            body1.velocity.z += this.tempVector.z * body1.massInv;

            body2.velocity.x -= this.tempVector.x * body2.massInv;
            body2.velocity.y -= this.tempVector.y * body2.massInv;
            body2.velocity.z -= this.tempVector.z * body2.massInv;
        }
     }
 }
};
// Update
WaveSimulation.updateSimulation = function(dt)
{
    for( var i=0; i<this.bodies.length; i++ ) {
        this.bodies[i].force.set(0,0,0);
    }
    this.bodies[1].velocity.x += -5*Math.sin(this.time*15);
    this.time += dt;
    
    //this.checkAndActivateContacts();

    //this.processContacts();
    
    //this.satisfyConstraints();
    
    this.updateSpringForces();
    
    this.integrate(dt);
};
// Contacts
WaveSimulation.Contact.prototype = {
    
    constructor : WaveSimulation.Contact,
    
    isSeperating : function()
    {
        //var bRes = this.body1.isColliding(this.body2);
        //return bRes === false;
    },
    
    getRelativeSpeed : function()
    {
        var relativeVelocity = new THREE.Vector3();
        relativeVelocity.x = this.body1.velocity.x - this.body2.velocity.x ;
        relativeVelocity.y = this.body1.velocity.y - this.body2.velocity.y ;
        return relativeVelocity.length();
    }
};

// Constraints
WaveSimulation.Constraint.prototype = {
    
    constructor : WaveSimulation.Constraint,
    
    tempVector : new THREE.Vector3(),
    
    apply : function()
    {
        // Satisfy the constraints
        var dx = this.body.position.x - this.pivotPoint.x;
        var dy = this.body.position.y - this.pivotPoint.y;
        var dz = this.body.position.z - this.pivotPoint.z;
        var error = this.restLength - Math.sqrt(dx*dx+dy*dy+dz*dz);
        // Direction of Constraint impulse
        this.tempVector.x = dx; this.tempVector.y = dy; this.tempVector.z = dz;
        this.tempVector.normalize();
        
        var vel = this.body.velocity;
        var vDotN = vel.x * this.tempVector.x + vel.y * this.tempVector.y + vel.z * this.tempVector.z;
        
        this.tempVector.multiplyScalar(-vDotN + error);
        
        this.body.velocity.x += this.tempVector.x;
        this.body.velocity.y += this.tempVector.y;
        this.body.velocity.z += this.tempVector.z;
    }
};

// PhysicalBody
WaveSimulation.PhysicalBody.prototype = 
{
    
    constructor : WaveSimulation.PhysicalBody,
    
    isColliding : function(otherBody)
    {
        var dx = this.position.x - otherBody.position.x;
        var dy = this.position.y - otherBody.position.y;
        var d = Math.sqrt(dx*dx + dy*dy);
        var this_r = this.radius;
        var other_r = otherBody.radius;
        var r = this_r + other_r;
        var overlap = d - r;
        return overlap;
    }
};
