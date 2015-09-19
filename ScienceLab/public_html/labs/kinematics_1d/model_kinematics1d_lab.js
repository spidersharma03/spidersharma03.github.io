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

Kinematics_Body.prototype.updateTagsOffsets = function() {
    
};

function Model_Kinematics1D_Lab(labParams) {
    this.tracks = [];
    this.bodies = [];
    this.bRecordGraphData = true;
    this.bRecordGraphDataEveryFrame = true;
    this.NumFramesToSkipForDataRecord = 1;
    this.time = 0;
    this.timeRecordCounter = 0;
    this.graphObserver = null;
    this.textViewObserver = null;
    this.view3dObserver = null;
}

Model_Kinematics1D_Lab.prototype = {
    constructor : Model_Kinematics1D_Lab,
    
    addTrack : function(track) {
        this.tracks.push(track);
        this.bodies.push(track.body);
        if(this.view3dObserver) {
            this.view3dObserver.addObject3D(track.body);
        }
        if(this.textViewObserver) {
            for (var tagname in track.body.tags) {
                var object3d = this.view3dObserver.getObject3D(track.body);
                var pos = this.view3dObserver.projectToScreenSpace(object3d);
                //pos.x = 100;
                //pos.y = 100;
                var tagObject = track.body.tags[tagname];
                this.textViewObserver.addTextView(tagname, tagObject.value, pos, tagObject.color);
            }
        }
    },
    
    simulate : function(dt) {
        for( var i=0; i<this.tracks.length; i++) {
            this.tracks[i].advanceBody(dt);
        }
        this.syncViews();
        if(this.timeRecordCounter === 0)
            this.recordGraphData();
        this.time += dt;
        this.timeRecordCounter++;
        if(this.timeRecordCounter > this.NumFramesToSkipForDataRecord)
            this.timeRecordCounter = 0;
    },
    getPosition : function() {
        
    },
    syncViews : function() {
        for( var i=0; i<this.tracks.length; i++) {
            var body = this.tracks[i].body;
            this.view3dObserver.updateObject3D(body);
        }
        if(this.textViewObserver) {
        for( var i=0; i<this.tracks.length; i++) {
            var body = this.tracks[i].body;
            for (var tagname in track.body.tags) {
                var object3d = this.view3dObserver.getObject3D(body);
                var projectedPos = this.view3dObserver.projectToScreenSpace(object3d);
                var tagObject = track.body.tags[tagname];
                var tagAttribute = tagObject.attribute;
                var tagOffset = tagObject.offset;
                var value_ = tagname;
                if(tagOffset) {
                    projectedPos.x += tagOffset.x;
                    projectedPos.y -= tagOffset.y;
                }
                if(tagAttribute === PhysicalBody.POSITION_ATTRIBUTE) {
                    value_ = value_ + track.body.position.x.toPrecision(3);
                }
                if(tagAttribute === PhysicalBody.VELOCITY_ATTRIBUTE) {
                    value_ = value_ + track.body.velocity.x.toPrecision(3);
                }
                if(tagAttribute === PhysicalBody.ACCELERATION_ATTRIBUTE) {
                    value_ = value_ + track.body.acceleration.x.toPrecision(3);
                }
                this.textViewObserver.updateTextView(tagname, value_, projectedPos);
            }
        }
        }
    },
    
    recordGraphData : function() {
        if(this.time > 3)
            return;
        if( this.bRecordGraphData ) {
            for( var i=0; i<this.tracks.length; i++) {
                var body = this.tracks[i].body;
                if(this.graphObserver) {
                    this.graphObserver.addData([this.time, body.position.x, body.velocity.x, body.acceleration.x]);
                }
            }
        }
    },
    
    addGraphObserver : function(graphObserver) {
        this.graphObserver = graphObserver;
    },
    
    addTextViewObserver: function(textViewObserver) {
        this.textViewObserver = textViewObserver;
    },
    
    addView3dObserver: function(textViewObserver) {
        this.view3dObserver = textViewObserver;
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
