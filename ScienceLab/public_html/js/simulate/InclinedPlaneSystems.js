/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

function createMassGeometry(size) {
    var width = 1.0;
    var height = 1.4;
    var length = size;
    var geometryGroup = new THREE.Object3D();
    var geometry1 = new THREE.BoxGeometry(length, height, width);
    var mesh1 = new THREE.Mesh(geometry1, sphereMaterial);
    mesh1.castShadow = true;
    mesh1.receiveShadow = true;
    geometryGroup.add(mesh1);
    return geometryGroup;
};

InclinedPlaneSystem = function (inclinedBaseLength) {
    this.g = 10.0;
    this.inclinationAngle = 0.0;
    this.resultantAcceleration = 0.0;
    this.tension1 = 0.0; // tension in the vertical string
    this.tension2 = 0.0; // tension in the inclined string
    this.mu_static = 1.2; // coefficient of static friction
    this.mu_dynamic = 0.7; // coefficient of dynamic friction. always less than static coefficient
    this.body1 = new InclinedPlaneSystem.Body(1.0,1.0); // Mass on the Inclined plane
    this.body1.position.x = 1.0;
    this.body1.model = createMassGeometry(2.0);
    this.body2 = new InclinedPlaneSystem.Body(1.0,1.0); // Mass hanging vertically
    this.body2.position.y = 2.0;
    this.body2.model = createMassGeometry(1.0);
    this.body3 = new InclinedPlaneSystem.Pulley(0.0,1.0); // Pulley connecting both masses
    
    this.inclinedBaseLength = inclinedBaseLength;
    this.stringLength = this.inclinedBaseLength * 1.2;
    this.body3.position.x = this.inclinedBaseLength;
    this.setInclinationAngle(0);
};

InclinedPlaneSystem.prototype = {
    constructor: InclinedPlaneSystem,
    
    momentum: function() {
      var totalmomentum = 0.0;
      for( var i=0; i<this.bodies.length; i++) {
          var body = this.bodies[i];
          totalmomentum += body.velocity.x * body.mass;
      }
      return totalmomentum;
    },
    
    kineticEnergy: function() {
      var totalKE = 0.0;
      for( var i=0; i<this.bodies.length; i++) {
          var body = this.bodies[i];
          totalKE += body.velocity.x * body.velocity.x * body.mass * 0.5;
      }
      return totalKE;
    },
    
    potentialEnergy: function() {
      var totalPE = 0.0;
      for( var i=0; i<this.springs.length; i++) {
          var spring = this.springs[i];
          var dx = spring.length - spring.compressionFraction * spring.length; 
          totalPE += spring.k * dx * dx * 0.5;
      }
      return totalPE;
    },
    
    totalEnergy: function() {
      return this.potentialEnergy() + this.kineticEnergy();
    },
    
    setInclinationAngle : function(angle) {
        this.body3.position.x = this.inclinedBaseLength * Math.cos(angle);
        this.body3.position.y = this.inclinedBaseLength * Math.sin(angle);
        var d = this.body1.position.x * this.body1.position.x + this.body1.position.y * this.body1.position.y;
        d = Math.sqrt(d);
        this.body1.position.x = d * Math.cos(angle);
        this.body1.position.y = d * Math.sin(angle);
        var dx = this.body3.position.x - this.body1.position.x;
        var dy = this.body3.position.y - this.body1.position.y;
        var dr = Math.sqrt(dx*dx + dy*dy);
        this.body2.position.x = this.inclinedBaseLength;
        this.body2.position.y = this.body3.position.y - (this.stringLength - dr);
        
        this.body1.model.position.x = this.body1.position.x;
        this.body2.model.position.x = this.inclinedBaseLength/2;
        this.body2.model.position.y = this.body2.position.y;
    },
    
    simulate: function (dt) {
        var m1 = this.body1.mass;
        var m2 = this.body2.mass;
        var I = this.body3.moi;
        var R = this.body3.radius;
        var sinTheta = Math.sin(this.inclinationAngle);
        var cosTheta = Math.cos(this.inclinationAngle);
        var d1 = m1 - m2 * sinTheta;
        // Body on Inclined(Body1) can either go up or remain stationary
        if( d1 > 0.0) {
            var d2 = d1 - this.mu_static * m2 * cosTheta;
            if( d2 > 0.0) { // body will accelerate
                d2 = d1 - this.mu_dynamic * m2 * cosTheta; // when in motion, we need to take dynamic friction.
                this.resultantAcceleration = d2/(m1 + m2 + I/(R*R)); 
                this.tension1 = m1 * ( this.g - this.resultantAcceleration );
                this.tension2 = this.tension1 - ( I * this.resultantAcceleration/(R*R) );
            }
        }
        // Body on Inclined(Body1) can either go down or remain stationary
        else {
            var d2 = d1 + this.mu_static * m2 * cosTheta;
            if( d2 < 0.0) { // body will accelerate
                d2 = d1 + this.mu_dynamic * m2 * cosTheta; // when in motion, we need to take dynamic friction.
                this.resultantAcceleration = d2/(m1 + m2 + I/(R*R)) *  this.g; 
                this.tension1 = m1 * ( this.g - this.resultantAcceleration );
                this.tension2 = this.tension1 - ( I * this.resultantAcceleration/(R*R) );
            }
        }
        // Update Bodies
        this.body1.velocity.x += this.resultantAcceleration * dt;
        this.body2.velocity.y += this.resultantAcceleration * dt;
        this.body1.position.x += this.body1.velocity.x * dt;
        this.body2.position.y += this.body2.velocity.y * dt;
        this.body3.angularSpeed += this.resultantAcceleration/this.body3.radius * dt;
        this.body3.angle += this.body3.angularSpeed * dt;
        
        this.setInclinationAngle(0);
    }
};

InclinedPlaneSystem.Pulley = function (mass, radius) {
    this.radius = radius;
    this.mass = mass;
    this.moi = 0.5*mass*radius*radius;
    this.acceleration = new THREE.Vector2(0, 0);
    this.velocity = new THREE.Vector2(0, 0);
    this.position = new THREE.Vector2(0, 0);
    this.angularSpeed = 0.0;
};

InclinedPlaneSystem.Body = function (mass, size) {
    this.size = size;
    this.mass = mass;
    this.acceleration = new THREE.Vector2(0, 0);
    this.angle = 0.0;
    this.velocity = new THREE.Vector2(0, 0);
    this.position = new THREE.Vector2(0, 0);
    //this.model = createMassGeometry(size, leftSpringSize, rightSpringSize);
};