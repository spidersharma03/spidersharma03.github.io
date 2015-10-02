/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
function SimulationBody() {
    this.id = SimulationBody.STATIC_COUNT++; 
    this.type = "SIMULATIONBODY";
    this.tags = [];
}

SimulationBody.STATIC_COUNT = 0;

SimulationBody.prototype = {
    constructor : SimulationBody,
    
    addTag : function(tagInfo) {
        this.tags[tagInfo.name] = tagInfo;
        tagInfo.dirty = true;
        return tagInfo;
    },
    
    getTag : function(name) {
        return this.tags[name];
    },
    
    removeTag: function(name) {
        
    },
    
    updateTag : function(name, property, value) {
        var tagObject = this.tags[name];
        if(tagObject) {
            tagObject[property] = value;
            //tagObject.dirty = false;
        }
    }  
};

PhysicalBody.prototype = Object.create(SimulationBody.prototype);

function PhysicalBody(bodyParams) {
    SimulationBody.call(this);
    this.type = "PHYSICALBODY";
    this.position = new THREE.Vector3();
    this.velocity = new THREE.Vector3();
    this.acceleration = new THREE.Vector3();
    this.mass = 1.0;
    this.e = 0.0;
    this.mu_k = 0.0;
    this.mu_d = 0.0;
       
    if(bodyParams) {
        
    }
}

PhysicalBody.prototype.setState = function(position, velocity, acceleration) {
    this.position.x = position;
    this.velocity.x = velocity;
    this.acceleration.x = acceleration;
};

PhysicalBody.TagInfo = function() {
    this.name = "";
    this.value = "",
    this.attribute = -1;
    this.offset = {x:0, y:0};
    this.color = "red";
};

PhysicalBody.POSITION_ATTRIBUTE = 0;
PhysicalBody.VELOCITY_ATTRIBUTE = 1;
PhysicalBody.ACCELERATION_ATTRIBUTE = 2;