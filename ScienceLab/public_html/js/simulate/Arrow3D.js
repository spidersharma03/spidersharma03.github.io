/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

function Arrow3D(length, material) {
    this.radius = 1/10;
    this.length = length;
    this.orientation = 1;
    this.origin = new THREE.Vector3();
    this.rootNode = new THREE.Object3D();
    this.offsetNode = new THREE.Object3D();
    this.cylNode = new THREE.Object3D();
    this.coneNode = new THREE.Object3D();
    this.cylinderGeometry = new THREE.CylinderGeometry(this.radius, this.radius, 1, 20, 2);
    this.coneGeometry = new THREE.CylinderGeometry(0, 0.2, 1/2, 20, 2);
    this.cylinderMesh = new THREE.Mesh(this.cylinderGeometry, material);
    this.coneMesh = new THREE.Mesh(this.coneGeometry, material);
    this.cylNode.add(this.cylinderMesh);
    this.coneNode.add(this.coneMesh);
    this.offsetNode.add(this.coneNode);
    this.offsetNode.add(this.cylNode);
    this.rootNode.add(this.offsetNode);
    this.setLength(this.length);
}

Arrow3D.TAIL = 1;
Arrow3D.HEAD = 2;

Arrow3D.prototype = {
    constructor: Arrow3D,
    
    setLength: function(length) {
        this.length = length;
        this.cylNode.scale.y = this.length;
        this.coneNode.position.y = this.length/2;
    },
    
    setRadius: function(radius) {
        this.radius = radius;
        this.cylNode.scale.x = this.radius;
        this.cylNode.scale.z = this.radius;
        this.coneNode.scale.x = this.radius;
        this.coneNode.scale.z = this.radius;
    },
    
    setPosition: function(px, py, pz, positionAt) {
        this.rootNode.position.x = px;
        this.rootNode.position.y = py;
        this.rootNode.position.z = pz;
        this.origin.x = px;
        this.origin.y = py;
        this.origin.z = pz;
        if( positionAt === Arrow3D.TAIL) { // Tail
            this.offsetNode.position.y = this.length/2;
        }
        if( positionAt === Arrow3D.HEAD) { // Pointer
            this.offsetNode.position.y = this.length/2;
        }
    },
    
    setOrientation: function(m) {
        this.rootNode.applyMatrix(m);
        this.rootNode.position.copy(this.origin);
    },
    
    setOrientationAxis: function(orientation) {
        this.orientation = orientation;
        if(orientation === 0) {
           this.rootNode.rotation.x = 0; 
           this.rootNode.rotation.y = 0; 
           this.rootNode.rotation.z = -Math.PI/2; 
        }
        if(orientation === 1) {
           this.rootNode.rotation.x = 0; 
           this.rootNode.rotation.y = 0; 
           this.rootNode.rotation.z = Math.PI/2; 
        }
        if(orientation === 2) {
           this.rootNode.rotation.x = 0; 
           this.rootNode.rotation.y = 0; 
           this.rootNode.rotation.z = 0;  
        }
        if(orientation === 3) {
           this.rootNode.rotation.x = 0; 
           this.rootNode.rotation.y = 0; 
           this.rootNode.rotation.z = 0; 
        }
        if(orientation === 4) {
           this.rootNode.rotation.x = Math.PI/2; 
           this.rootNode.rotation.y = 0; 
           this.rootNode.rotation.z = 0;  
        }
        if(orientation === 5) {
           this.rootNode.rotation.x = -Math.PI/2; 
           this.rootNode.rotation.y = 0; 
           this.rootNode.rotation.z = 0; 
        }
    }
    ,
    getRootNode: function() {
        return this.rootNode;
    }
};