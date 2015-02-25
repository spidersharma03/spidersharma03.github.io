/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

ProjectileBody = function() {
    this.position = new THREE.Vector2();
    this.velocity = new THREE.Vector2();
    this.angularSpeed = 0.0;
    this.angle = 0.0;
    this.e = 0.5;
};

ProjectileSystem = function() {
    this.ProjectileBodies = [];
    this.g = 10.0;
    this.groundPosition = 0.0;
};

ProjectileSystem.prototype = {
    constructor: ProjectileSystem,
    
    addProjectile : function(projectileBody) {
        this.ProjectileBodies.push(projectileBody);
    },
    
    collisionWithGround: function() {
        for( var i=0; i<this.ProjectileBodies.length; i++ ) {
            var body = this.ProjectileBodies[i];
            if(body.position.y < this.groundPosition) {
                body.velocity.y *= -this.e;
                body.velocity.x *= this.e;
            }
        }
    },
    
    update : function(dt) {
        for( var i=0; i<this.ProjectileBodies.length; i++ ) {
            var body = this.ProjectileBodies[i];
            body.velocity.y += this.g * dt;
            body.position.x += body.velocity.x * dt;
            body.position.y += body.velocity.y * dt;
            this.angle += this.angularSpeed * dt;
        }
        this.collisionWithGround();
    }
};