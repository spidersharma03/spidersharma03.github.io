/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


Collision2D_Simulation = function(N)
{
    this.contacts = [];
    this.bodies = [];
    this.constraints = [];
    this.gravity = -10;
    this.momentum = new THREE.Vector2();
    this.com = new THREE.Vector2();
    this.e = 1.0;
    this.numIterations = 0;
    this.numBodies = N;
    this.solverMethod = 0;
};

var Collision2D_Simulation = new Collision2D_Simulation(20);

Collision2D_Simulation.init = function()
{
    // Create and push contacts
    for( var i=0; i<this.numBodies; i++)
    {
        for( var j=i+1; j<this.numBodies; j++)
        {
            var contact = new Collision2D_Simulation.Contact();
            contact.body1 = this.bodies[i];
            contact.body2 = this.bodies[j];
            this.contacts.push(contact);
        }
    }
};

Collision2D_Simulation.getMomentum = function() {
    for( var i=0; i<this.numBodies; i++)
    {
        var body = this.bodies[i];
        this.momentum.x += body.velocity.x * body.mass;
        this.momentum.y += body.velocity.y * body.mass;
    }
};

Collision2D_Simulation.getCom = function() {
    var totalMass = 0;
    for( var i=0; i<this.numBodies; i++)
    {
        var body = this.bodies[i];
        this.com.x += body.position.x * body.mass;
        this.com.y += body.position.y * body.mass;
        totalMass += body.mass;
    }
    this.com.x /= totalMass;
    this.com.y /= totalMass;
    return this.com;
};

Collision2D_Simulation.addContact = function(contact)
{
    this.contacts.push(contact);
};

Collision2D_Simulation.removeContact = function(contact)
{
    // remove the contact from list of contacts
};

Collision2D_Simulation.addConstraint = function(constraint)
{
    this.constraints.push(constraint);
};

Collision2D_Simulation.removeConstraint = function(constraint)
{
    // remove the constraint from list of constraints
};

Collision2D_Simulation.addBody = function(body)
{
    this.bodies.push(body);
},


Collision2D_Simulation.Contact = function()
{
    this.body1 = null;
    this.body2 = null;
    this.position = new THREE.Vector2();
    this.normal   = new THREE.Vector2();
    this.active   = false;
    this.penetration = 0;
};

Collision2D_Simulation.PhysicalBody = function(r)
{
    this.position = new THREE.Vector2();
    this.velocity = new THREE.Vector2();
    this.mass   = 1.0;
    this.massInv   = 1/this.mass;
    this.radius = r;
};

// Integrator
Collision2D_Simulation.integrate = function(dt)
{
    for( var i=0; i<this.bodies.length; i++ )
    {
        var body = this.bodies[i];
        //body.velocity.y += this.gravity * dt;
         
        body.position.x += body.velocity.x * dt;
        body.position.y += body.velocity.y * dt;
    }
};

Collision2D_Simulation.processContacts = function()
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

Collision2D_Simulation.checkAndActivateContacts = function()
{
    var bResult = true;
    for( var i=0; i<this.bodies.length; i++ )
    {
        for( var j=i+1; j<this.bodies.length; j++ ) 
        {
            var body_i = this.bodies[i];        
            var body_j = this.bodies[j];

            var collisionDepth = body_i.isColliding(body_j);
            if(  collisionDepth <= 0 ) {
                // Contact Normal points towards body_j
                var nx = body_j.position.x - body_i.position.x;
                var ny = body_j.position.y - body_i.position.y;
                var len = Math.sqrt(nx*nx + ny*ny);
                nx /= len; ny /= len;
                this.contacts[i+j-1].body1 = body_i;
                this.contacts[i+j-1].body2 = body_j;
                
                this.contacts[i+j-1].normal.x = nx;
                this.contacts[i+j-1].normal.y = ny;
                this.contacts[i+j-1].penetration = collisionDepth;
                // Activate Contact if the bodies are not seperating
                var v1 = body_i.velocity;
                var v2 = body_j.velocity;
                var rel_v_dx = v2.x - v1.x;                
                var rel_v_dy = v2.y - v1.y;

                var vDotN = rel_v_dx * nx + rel_v_dy * ny;
                //var eps = Math.sqrt(2*this.gravity*0.01);
                //if( vDotN < 0 && vDotN <  eps ) 
                if( vDotN < 0 && Math.abs(vDotN) > 0.01 ) // bodies are reaching 
                {
                    this.contacts[i+j-1].active = true;
                    bResult = false;
                }
                else
                    this.contacts[i+j-1].active = false;
            }
        }
    }
    return bResult;
};

// Update
Collision2D_Simulation.updateSimulation = function(dt)
{

    this.checkAndActivateContacts();

    //this.satisfyConstraints();

    this.processContacts();
    
    //this.satisfyConstraints();
    
    this.integrate(dt);

};
// Contacts
Collision2D_Simulation.Contact.prototype = {
    
    constructor : Collision2D_Simulation.Contact,
    
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
Collision2D_Simulation.PhysicalBody.prototype = 
{
    
    constructor : Collision2D_Simulation.PhysicalBody,
    
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
