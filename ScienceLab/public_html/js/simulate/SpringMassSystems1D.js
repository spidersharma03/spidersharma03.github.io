/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

function createSpringGeometry(springLength) {
    var spiralRadius = 0.07;
    var springRadius = 0.01;
    // Make Geometry for Spring
    var helixPoints = [];
    var theta = 0;
    var phi = 0;
    for (var i = 0; i < 200; i++) {
        var x = spiralRadius * Math.cos(phi);
        var z = spiralRadius * Math.sin(phi);
        var y = theta;
        phi += Math.PI/5;
        theta += springLength / 200;
        helixPoints.push(new THREE.Vector3(x, y, z));
    }
    var helixSpline = new THREE.SplineCurve3(helixPoints);
    var extrudeSettings = {
        steps: 200,
        bevelEnabled: false,
        extrudePath: helixSpline
    };
    // Create
    var pts = [], count = 20;
    for (var i = 0; i < count; i++) {
        var a = 2 * i / count * Math.PI;
        pts.push(new THREE.Vector2(Math.cos(a) * springRadius, Math.sin(a) * springRadius));
    }
    var shape = new THREE.Shape(pts);

    var geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    var springMesh = new THREE.Mesh(geometry, sphereMaterial);
    return springMesh;
};

function createMassGeometry(size, leftSpringSize, rightSpringSize) {
    var width = 0.1;
    var height = 0.7;
    var length = size;
    var geometryGroup = new THREE.Object3D();
    var geometry1 = new THREE.BoxGeometry(length, height, width);
    var mesh1 = new THREE.Mesh(geometry1, sphereMaterial);
    mesh1.castShadow = true;
    mesh1.receiveShadow = true;
    geometryGroup.add(mesh1);
    var mesh2 = mesh1.clone();
    var mesh3 = mesh1.clone();
    geometryGroup.add(mesh2);
    mesh1.rotation.x = Math.PI / 6;
    mesh2.rotation.x = -Math.PI / 6;
    mesh1.position.z = -height / 4.0;
    mesh2.position.z = height / 4.0;
    mesh3.position.y += height * 0.9;
    geometryGroup.add(mesh3);
    // Create Spring Mesh
    var springMeshLeft, springMeshRight;
    var colliderMesh1, colliderMesh2;
    var springLength = rightSpringSize > 0.0 ? Math.abs(rightSpringSize) : Math.abs(leftSpringSize);
    if (rightSpringSize > 0.0 || leftSpringSize > 0.0) {
        springMeshRight = createSpringGeometry(springLength);
        springMeshRight.position.y = height * 0.9;
        springMeshRight.rotateZ(-Math.PI / 2);
        springMeshRight.castShadow = true;
        springMeshRight.receiveShadow = true;
        var radius = 0.07;
        var colliderGeometry = new THREE.CylinderGeometry(radius * 2, radius * 2, radius * 1.5, 20, 2);
        colliderMesh1 = new THREE.Mesh(colliderGeometry, sphereMaterial);
        colliderMesh1.rotation.z = Math.PI / 2;
        colliderMesh1.castShadow = true;
        colliderMesh1.receiveShadow = true;
    }
    if (rightSpringSize > 0.0) {
        springMeshRight.position.x = length / 2;
        colliderMesh1.position.x = springMeshRight.position.x;// + springLength;
        colliderMesh1.position.y = springMeshRight.position.y;
        geometryGroup.add(springMeshRight);
        geometryGroup.add(colliderMesh1);
    }
    if (leftSpringSize > 0.0) {
        springMeshLeft = springMeshRight.clone();
        springMeshLeft.rotateZ(-Math.PI);
        springMeshLeft.position.x = -length / 2;
        //springMeshLeft.position.y = springMeshRight.position.y;
        geometryGroup.add(springMeshLeft);
        colliderMesh2 = colliderMesh1.clone();
        colliderMesh2.position.x = springMeshLeft.position.x - springLength;
        colliderMesh2.position.y = springMeshRight.position.y;
        geometryGroup.add(colliderMesh2);
    }
    geometryGroup.springMeshLeft = springMeshLeft;
    geometryGroup.springMeshRight = springMeshRight;
    geometryGroup.colliderMeshLeft = colliderMesh2;
    geometryGroup.colliderMeshRight = colliderMesh1;
    return geometryGroup;
};

var collisionInfo = function () {
    this.overlap = 0.0;
    this.springCollision = false;
    this.keff = 0.0;
    this.body1 = undefined;
    this.body2 = undefined;
};

SpringMassSystems1D = function () {
    this.bodies = [];
    this.springs = [];
    this.collisionInfo = new collisionInfo();
};

SpringMassSystems1D.prototype = {
    constructor: SpringMassSystems1D,
    
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
    
    addBody: function (body) {
        this.bodies.push(body);
    },
    addSpring: function (spring) {
        this.springs.push(spring);
    },
    removeBody: function (body) {
    },
    
    isColliding: function (body1, body2)
    {
        var d = body1.position.x - body2.position.x;
        var d1 = body1.size / 2;
        var d2 = body2.size / 2;
        if(d < 0.0){
           if (body1.rightSpring)
              d1 += body1.rightSpring.length; 
           if (body2.leftSpring)
              d2 += body2.leftSpring.length;
        } else {
            if (body1.leftSpring)
              d1 += body1.leftSpring.length;
            if (body2.rightSpring)
              d2 += body2.rightSpring.length;
        }
        
        var overlap = Math.abs(d) - d1 - d2;
        this.collisionInfo.overlap = overlap;
        this.collisionInfo.springCollision = false;
        if (overlap < 0.0) {
            if (d < 0.0) {
                this.collisionInfo.body1 = body1;
                this.collisionInfo.body2 = body2;
                this.collisionInfo.springCollision = body1.rightSpring || body2.leftSpring ? true : false;
            }
            else {
                this.collisionInfo.body1 = body2;
                this.collisionInfo.body2 = body1;
                this.collisionInfo.springCollision = this.collisionInfo.body1.rightSpring || this.collisionInfo.body2.leftSpring ? true : false;
            }
        }
        if (this.collisionInfo.springCollision) {
            if (this.collisionInfo.body1.rightSpring && !this.collisionInfo.body2.leftSpring) {
                this.collisionInfo.keff = this.collisionInfo.body1.rightSpring.k;
                this.collisionInfo.body1.rightSpring.compressionFraction = Math.abs(this.collisionInfo.body1.rightSpring.length + overlap) / this.collisionInfo.body1.rightSpring.length;
            }
            else if (this.collisionInfo.body2.leftSpring && !this.collisionInfo.body1.rightSpring) {
                this.collisionInfo.keff = this.collisionInfo.body2.leftSpring.k;
                this.collisionInfo.body2.leftSpring.compressionFraction = Math.abs(this.collisionInfo.body2.leftSpring.length + overlap) / this.collisionInfo.body2.leftSpring.length;
            }
            else {
                this.collisionInfo.keff = this.collisionInfo.body1.rightSpring.k * this.collisionInfo.body2.leftSpring.k / (this.collisionInfo.body1.rightSpring.k + this.collisionInfo.body2.leftSpring.k);
                var overlap1 = this.collisionInfo.keff * 1.0/this.collisionInfo.body1.rightSpring.k * overlap;
                var overlap2 = this.collisionInfo.keff * 1.0/this.collisionInfo.body2.leftSpring.k * overlap;
                this.collisionInfo.body1.rightSpring.compressionFraction = Math.abs(this.collisionInfo.body1.rightSpring.length + overlap1) / this.collisionInfo.body1.rightSpring.length;
                this.collisionInfo.body2.leftSpring.compressionFraction = Math.abs(this.collisionInfo.body2.leftSpring.length + overlap2) / this.collisionInfo.body2.leftSpring.length;                
            }
        }
        return this.collisionInfo;
    },
    
    simulate: function (dt) {
        // Clear Internal forces
        for (var i = 0; i < this.bodies.length; i++) {
            this.bodies[i].internalforce.x = 0.0;
        }
        // Collision handling
        for (var i = 0; i < this.bodies.length; i++) {
            var body1 = this.bodies[i];
            for (var j = i; j < this.bodies.length; j++) {
                var body2 = this.bodies[j];
                if (body1 === body2)
                    continue;
                var cinfo = this.isColliding(body1, body2);
                if (cinfo && cinfo.overlap < 0) {
                    // Spring collisions
                    if (cinfo.springCollision) {
                        var restoringForce = cinfo.keff * cinfo.overlap;
                        cinfo.body1.internalforce.x += restoringForce;
                        cinfo.body2.internalforce.x -= restoringForce;
                    }
                    // Hard Collisions
                    else {
                        var dv = cinfo.body2.velocity.x - cinfo.body1.velocity.x;
                        var impulse = (1 + body1.e) * dv / (1.0 / cinfo.body1.mass + 1.0 / cinfo.body2.mass);
                        cinfo.body1.velocity.x += impulse / cinfo.body1.mass;
                        cinfo.body2.velocity.x -= impulse / cinfo.body2.mass;
                        // Resolve penetration
                        var posImpulse = cinfo.overlap / (1.0 / cinfo.body1.mass + 1.0 / cinfo.body2.mass);
                        cinfo.body1.position.x += posImpulse * 1.0 / cinfo.body1.mass;
                        cinfo.body2.position.x -= posImpulse * 1.0 / cinfo.body2.mass;
                    }
                }
            }
        }

        // Simulate Springs
        for (var i = 0; i < this.springs.length; i++) {
            var spring = this.springs[i];
            var body1 = spring.body1;
            var body2 = spring.body2;
            var d = body1.position.x - body2.position.x + body1.size;
            var delta = spring.length - Math.abs(d);
            var force = -spring.k * delta;
            var a1 = force/body1.mass;
            var a2 = -force/body2.mass;
            //var v_mid1 = body1.velocity.x;// + a1 * dt * 0.5;
            //var v_mid2 = body2.velocity.x;// + a2 * dt * 0.5;
            //var x1mid = body1.position.x + body1.velocity.x * dt * 0.5;
            //var x2mid = body2.position.x + body2.velocity.x * dt * 0.5;
            //d = x1mid - x2mid + body1.size;
            //delta = spring.length - Math.abs(d);
            //force = -spring.k * delta;
            //a1 = force/body1.mass;
            //a2 = -force/body2.mass;
            spring.compressionFraction = (spring.length - delta)/spring.length;
            //body1.internalforce.x += force;
            //body2.internalforce.x += -force;
            
            body1.velocity.x += a1 * dt;
            //body1.position.x += body1.velocity.x * dt;
            
            body2.velocity.x += a2 * dt;
            //body2.position.x += body2.velocity.x * dt;
        }
        
        for (var b = 0; b < this.bodies.length; b++) {
            var body = this.bodies[b];
            body.velocity.x += body.internalforce.x / body.mass * dt;
            body.position.x += body.velocity.x * dt;
        }
    }
};

SpringMassSystems1D.Body = function (mass, size, leftSpringSize, rightSpringSize) {
    this.size = size;
    this.mass = mass;
    this.internalforce = new THREE.Vector2(0, 0);
    this.acceleration = new THREE.Vector2(0, 0);
    this.velocity = new THREE.Vector2(0, 0);
    this.position = new THREE.Vector2(0, 0);
    this.e = 1.0;
    this.leftSpring = undefined;
    this.rightSpring = undefined;
    this.collisionInfo = new collisionInfo();
    this.model = createMassGeometry(size, leftSpringSize, rightSpringSize);
    if(leftSpringSize > 0.0)
        this.leftSpring = new SpringMassSystems1D.Spring(leftSpringSize, 20.0);
    if(rightSpringSize > 0.0)
        this.rightSpring = new SpringMassSystems1D.Spring(rightSpringSize, 20.0);
};

SpringMassSystems1D.Spring = function (length, k, body1, body2) {
    this.length = Math.abs(length);
    if(body1)
       this.length -=  body1.size;
    this.k = k;
    this.compressionFraction = 1.0; // currentLength/this.length
    this.body1 = body1;
    this.body2 = body2;
    this.model = createSpringGeometry(this.length);
    this.model.rotateZ(Math.PI/2);
};