/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
var ShapeSphere = 0;
var ShapePlane = 1;
var ShapeCylinder = 2;
var ShapeCone = 3;
var ShapeCapsule = 4;
var ShapeCube = 5;
var ShapePolyTope = 6;

function CollisionShape() {
    this.shapeType = -1;
    this.offsetTransform = new THREE.Matrix4();
}

function Contact() {
    this.point = new THREE.Vector3(); // world space
    this.depth = 0;
    this.normalImpulseMag = 0;
    this.frictionalImpulseMag = [];
    this.frictionalImpulseMag[0] = 0;
    this.frictionalImpulseMag[1] = 0;
    this.body1 = null;
    this.body2 = null;
}

function RigidBody() {
    this.quaternion = new THREE.Quaternion();
    this.position = new THREE.Vector3();
    this.shapes = [];
}

RigidBody.prototype = {
    constructor : RigidBody,
    
    addShape: function(shape) {
       this.shapes.push(shape); 
    }
};

function RigidBodySimulation() {
    this.gravity = -9.8;
    this.timeStep = 0.016;
    this.bodies = [];
    this.contacts = [];
}

RigidBodySimulation.prototype = {
    constructor: RigidBodySimulation,
    
    addBody: function(body) {
        this.bodies.push(body);
    },
    
    simulate: function() {
        
    }
};