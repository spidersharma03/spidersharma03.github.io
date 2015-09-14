/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

function Kinematics_Body(bodyParams) {
    PhysicalBody.call(this, bodyParams);
    this.size = 1;
}
Kinematics_Body.prototype = Object.create(PhysicalBody.prototype);

function Model_Kinematics1D_Lab(labParams) {
    this.tracks = [];
}

Model_Kinematics1D_Lab.prototype = {
    constructor : Model_Kinematics1D_Lab,
    
    addTrack : function(track) {
        this.tracks.push(track);
    },
    
    simulate : function(dt) {
        for( var i=0; i<this.tracks.length; i++) {
            this.tracks[i].advanceBody(dt);
        }
    }
};

Model_Kinematics1D_Lab.StraightTrack = function(trackParams) {
    if( trackParams ) {
        this.type = trackParams.type;
    } else {
        this.type = Model_Kinematics1D_Lab.StraightTrack.STRAIGHT_TRACK;
        this.length = 20;
        this.mathInput = false;
        this.graphInput = false;
        this.isFinite = true;
        this.isElasticAtEndPoints = false;
        this.body = new Kinematics_Body();
    }
};

Model_Kinematics1D_Lab.StraightTrack.STRAIGHT_TRACK = 0;
Model_Kinematics1D_Lab.StraightTrack.INCLINED_TRACK = 1;
Model_Kinematics1D_Lab.StraightTrack.CURVED_TRACK = 2;

Model_Kinematics1D_Lab.StraightTrack.prototype = {
    constructor : Model_Kinematics1D_Lab.Track,
    
    advanceBody : function(dt) {
        // Check If the acceleration is governed by a spline or math equation
        if(this.mathInput) {
            
        }
        if(this.graphInput) {
            
        }
        // Update 
        this.body.velocity.x += this.body.acceleration.x * dt;
        this.body.velocity.y += this.body.acceleration.y * dt;
        this.body.velocity.z += this.body.acceleration.z * dt;
        
        this.body.position.x += this.body.velocity.x * dt;
        this.body.position.y += this.body.velocity.y * dt;
        this.body.position.z += this.body.velocity.z * dt;
        // Handle collision at end points for a finite track
        if( this.isFinite ) {
            var size = this.body.size;
            if(this.body.position.x + size/2 > this.length/2) {
                if( this.isElasticAtEndPoints ) {
                    this.body.velocity.x *= -1;
                } else {
                    this.body.acceleration.x = 0;
                    this.body.velocity.x = 0;
                    this.body.position.x = this.length/2 - size/2;
                }
            }
        }
    }
};
