/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

MomentumConservationSimulation = function(N, pathRadius)
{
    this.contacts = [];
    this.constraints = [];
    this.bodies = [];
    this.gravity = -10;
    this.e = 1.0;
    this.numIterations = 0;
    this.numPendulumns = N;
    this.solverMethod = 0;
    this.constraintPathRadius = pathRadius;
    this.pivotPoint = new THREE.Vector2(0,this.constraintPathRadius);
    this.tempVector = new THREE.Vector2(0,0);
};

var MomentumConservationSimulation = new MomentumConservationSimulation(2);

MomentumConservationSimulation.init = function()
{
    // Initialize body positions
//    this.bodies[0].position.x = 0;
//    this.bodies[0].position.x = 0;
//    this.bodies[0].position.x = 0;
//    
//    this.bodies[0].position.x = 0;
//    this.bodies[0].position.x = 0;
//    this.bodies[0].position.x = 0;

    // Create and push contacts
    for( var i=0; i<this.numPendulumns-1; i++)
    {
        var contact = new MomentumConservationSimulation.Contact();
        contact.body1 = this.bodies[i];
        contact.body2 = this.bodies[i+1];
        this.contacts.push(contact);
    }
};

MomentumConservationSimulation.addConstraint = function(constraint)
{
    this.constraints.push(constraint);
};

MomentumConservationSimulation.addContact = function(contact)
{
    this.contacts.push(contact);
};

MomentumConservationSimulation.removeContact = function(contact)
{
    // remove the contact from list of contacts
};


MomentumConservationSimulation.addBody = function(body)
{
    this.bodies.push(body);
},

MomentumConservationSimulation.applyConstraint = function()
{
    for(var c=0; c<this.constraints.length; c++ ) {
        for(var b=0; b<this.bodies.length; b++ )
            this.constraints[c].satisfy(this.bodies[b]);
    }
},

MomentumConservationSimulation.Contact = function()
{
    this.body1 = null;
    this.body2 = null;
    this.position = new THREE.Vector2();
    this.normal   = new THREE.Vector2();
    this.active   = false;
    this.penetration = 0;
};

MomentumConservationSimulation.PhysicalBody = function(mass, radius)
{
    this.position = new THREE.Vector2();
    this.velocity = new THREE.Vector2();
    this.rotation = 0.0;
    this.angularSpeed = 0.0;
    this.mass   = mass;
    this.massInv   = 1/this.mass;
    this.radius = radius;
    this.generalizedAngularSpeed = 0.0;
    this.generalizedAngle = 0.0;
};

// Integrator
MomentumConservationSimulation.integrate = function(dt)
{
    for( var i=0; i<this.bodies.length; i++ )
    {
        var body = this.bodies[i];
        body.velocity.y += this.gravity * dt;
        var dvx = body.velocity.x; var dvy = body.velocity.y;
        var sign = dvx > 0 ? 1 : -1;
        var speed = Math.sqrt(dvx*dvx + dvy*dvy) * sign;
        body.angularSpeed =  body.radius * speed;
        body.rotation += body.angularSpeed * dt;
        //body.position.x += body.velocity.x * dt;
        //body.position.y += body.velocity.y * dt;
    }
};

MomentumConservationSimulation.processContacts = function()
{
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
                    //body1.velocity.x = 0;
                    //body1.velocity.y = 0;
                }
                body2.velocity.x -= contactImpulse * body2.massInv * contact.normal.x;
                body2.velocity.y -= contactImpulse * body2.massInv * contact.normal.y;
                if( body2.velocity.length() < 0.2 )
                {
                    //body2.velocity.x = 0;
                    //body2.velocity.y = 0;
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

MomentumConservationSimulation.checkAndActivateContacts = function()
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
            if( vDotN < 0 && Math.abs(vDotN) > 0.001 ) // bodies are reaching 
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

// Update
MomentumConservationSimulation.updateSimulation = function(dt)
{

    this.checkAndActivateContacts();

    this.processContacts();
    
    this.applyConstraint();
    
    this.integrate(dt);

};
// Contacts
MomentumConservationSimulation.Contact.prototype = {
    
    constructor : MomentumConservationSimulation.Contact,
    
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

// PhysicalBody
MomentumConservationSimulation.PhysicalBody.prototype = 
{
    
    constructor : MomentumConservationSimulation.PhysicalBody,
    
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

CircularTrackConstraint = function(radius, angle, length) {
    this.radius = radius;
    this.angle = angle > Math.PI/2 ? Math.PI/2 : angle;
    this.angle = this.angle < 0 ? -this.angle : angle;
    this.length = length;
    this.position = new THREE.Vector2(0,0);
    this.tempVector = new THREE.Vector2(0,0);
};

CircularTrackConstraint.prototype.satisfy = function(body) {
    var xLocal = body.position.x - this.position.x;
    var yLocal = body.position.y - this.position.y;
    var abs_xLocal = Math.abs(xLocal);
    var x = this.length/2;
    if(xLocal < -this.length/2)
       x = -this.length/2;
    var y = this.radius;
    var g = -10.0;
    var dt = 0.016;
    // Curved Sections
    if(abs_xLocal > this.length/2 ) {
        var dx = body.position.x - x; var dy = body.position.y - y;
        var d = Math.sqrt(dx*dx + dy*dy);// Distance from Circle centre to body centre
        var diff = d + body.radius - this.radius;
        if(diff < 1e-6) { // Free fall
            body.velocity.y += g * dt;
            body.position.y += body.velocity.y * dt;
            var theta = Math.atan2((body.position.y - this.radius), (body.position.x-x)) + Math.PI/2;
            body.generalizedAngle = theta;
            //console.log("free fall");
        }
        else { // move on the circular track  
            var f = 2.0/5.0;
            var sinTheta = (body.position.x-x)/(this.radius - body.radius);
            sinTheta = sinTheta > 1 ? 1 : sinTheta;
            sinTheta = sinTheta < -1 ? -1 : sinTheta;
            var denom = (1.0+f)*(this.radius - body.radius);
            body.generalizedAngularSpeed += g/denom * sinTheta * dt; 
            body.generalizedAngularSpeed /= ( 1.0 + 0.0);
            body.generalizedAngle += body.generalizedAngularSpeed * dt;

            var cosTheta = Math.sqrt(1.0 - sinTheta * sinTheta);
            
            body.position.x = x + (this.radius - body.radius + 0.01) * Math.sin(body.generalizedAngle);//Math.sin(body.generalizedAngle);
            body.position.y = y - (this.radius - body.radius + 0.01) * Math.cos(body.generalizedAngle);//Math.cos(body.generalizedAngle);
            body.velocity.x = body.generalizedAngularSpeed * cosTheta * this.radius;
            body.velocity.y = body.generalizedAngularSpeed * sinTheta * this.radius;
            //body.angularSpeed += 1/(1+f)*g*sinTheta * dt;
            //console.log(d);
        }
    }
    // Linear Section
    if(xLocal <= this.length/2 && xLocal >= -this.length/2) {
        if(body.position.y > body.radius) {
            body.velocity.y += g * dt;
            body.position.y += body.velocity.y * dt;
        } else {
            body.velocity.y = 0.0;
            body.position.y = body.radius;
            //console.log(body.velocity.x);
            body.position.x += body.velocity.x * dt;
            body.generalizedAngularSpeed = body.velocity.x/this.radius;
        }
    }
    
};