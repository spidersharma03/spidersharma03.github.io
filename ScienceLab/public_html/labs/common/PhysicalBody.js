/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


function PhysicalBody(bodyParams) {
    this.position = new THREE.Vector3();
    this.velocity = new THREE.Vector3();
    this.acceleration = new THREE.Vector3();
    this.mass = 1.0;
    this.e = 0.0;
    this.mu_k = 0.0;
    this.mu_d = 0.0;
    this.views = [];
    
    this.id = PhysicalBody.STATIC_COUNT++;
    this.tagDirty = false;
    
    this.name = 'No Name';
    this.tags = [];
    this.fnCall = null;
    if(bodyParams) {
        
    }
}

PhysicalBody.TagInfo = function() {
    this.Name = "";
    this.value = "",
    this.attribute = -1;
    this.offset = {x:0, y:0};        
};

PhysicalBody.STATIC_COUNT = 0;
PhysicalBody.POSITION_ATTRIBUTE = 0;
PhysicalBody.VELOCITY_ATTRIBUTE = 1;
PhysicalBody.ACCELERATION_ATTRIBUTE = 2;

PhysicalBody.prototype = {
    constructor : PhysicalBody,
    
    addTag : function(tagInfo) {
        this.tags[tagInfo.Name] = tagInfo;
    },
    
    removeTag: function(name) {
        
    },
    
    updateTag : function(name, property, value) {
        var tagObject = this.tags[name];
        if(tagObject) {
            tagObject[property] = value;
            this.tagDirty = true;
        }
    }  
};