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
    this.timesnap_objects = [];
    this.annotations = [];

    this.bRecordGraphData = true;
    this.bRecordGraphDataEveryFrame = true;
    this.NumFramesToSkipForDataRecord = 1;
    this.NumFramesToSkipForTimeSnap = 60;
    this.time = 0;
    this.timeRecordCounter = 0;
    this.timeSnapRecordCounter = 0;
    this.timeSnapPosition = new THREE.Vector3(0,0,0);
    this.pauseSimulation = false;
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
                var tagObject = track.body.tags[tagname];
                this.textViewObserver.addTextView(tagname, tagObject.value, pos, tagObject.color);
            }
        }
    },
    
    simulate : function(dt) {
        if(this.pauseSimulation)
            return;
        
        for( var i=0; i<this.tracks.length; i++) {
            this.tracks[i].advanceBody(dt);
        }
        this.syncViews();
        
        this.recordGraphData();
        
        if(this.timeRecordCounter === 0)
                this.updateGraphData();

        if(this.timeSnapRecordCounter === 0)
            this.timeSnap();
        
        this.time += dt;        
        this.timeRecordCounter++;
        this.timeSnapRecordCounter++;
        if(this.timeRecordCounter > this.NumFramesToSkipForDataRecord)
            this.timeRecordCounter = 0;
        if(this.timeSnapRecordCounter > this.NumFramesToSkipForTimeSnap)
            this.timeSnapRecordCounter = 0;
    },
    getPosition : function() {
        
    },
    
    timeSnap : function() {
        for( var i=0; i<this.tracks.length; i++) {
            var body = this.tracks[i].body;
            if(body.velocity.x === 0){
                continue;
            }
            var object3d = this.view3dObserver.getObject3D(body);
            this.timeSnapPosition.copy(object3d.position);
            this.timeSnapPosition.y += 1.5;
            var simBody = new SimulationBody();
            this.timesnap_objects.push(simBody);
            this.view3dObserver.addObject3D(simBody, this.timeSnapPosition, 0.25);
            this.annotations.push( {
                series: 'v',
                x: this.time,
                icon: '../../img/sprite.png',
                width: 15,
                height: 15,
                tickHeight: 14,
                text: this.time
            } );
            this.graphObserver._graph.setAnnotations(this.annotations);
            return;
            //this.view3dObserver.addSpriteToScene(this.timeSnapPosition, 0.25);
            var taginfo1 = simBody.addTag({name:  "[a] = ", value:body.acceleration.x.toPrecision(3), offset:{x:0, y:80}});
            var taginfo2 = simBody.addTag({name:  "[v] = ", value:body.velocity.x.toPrecision(3), offset:{x:0, y:60}});
            var taginfo3 = simBody.addTag({name:  "[x] = ", value:body.position.x.toPrecision(3), offset:{x:0, y:40}});
            this.textViewObserver.addTextView(taginfo1.name, taginfo1.value, {x:0,y:0}, "blue");
            this.textViewObserver.addTextView(taginfo2.name, taginfo2.value, {x:0,y:0}, "blue");
            this.textViewObserver.addTextView(taginfo3.name, taginfo3.value, {x:0,y:0}, "blue");
        }
    },
    sync3DView: function() {
        if(this.view3dObserver) {
            for( var i=0; i<this.tracks.length; i++) {
                var body = this.tracks[i].body;
                this.view3dObserver.updateObject3D(body);
            }
        }
    },
    
    syncText2DView: function() {
        if(this.textViewObserver) {
            // Update tags related to all the bodies
            for( var i=0; i<this.tracks.length; i++) {
                var body = this.tracks[i].body;
                for (var tagname in track.body.tags) {
                    var tagObject = track.body.tags[tagname];
                    if(!tagObject.dirty)
                        continue;
                    var tagAttribute = tagObject.attribute;
                    var tagOffset = tagObject.offset;
                    var value_ = tagname;
                    
                    var object3d = this.view3dObserver.getObject3D(body);
                    var projectedPos = this.view3dObserver.projectToScreenSpace(object3d);
                    if(tagOffset) {
                        projectedPos.x += tagOffset.x;
                        projectedPos.y -= tagOffset.y;
                    }
                    body.updateTag(tagname, "value", value_);

                    if(tagAttribute === PhysicalBody.POSITION_ATTRIBUTE) {
                        value_ = value_ + track.body.position.x.toPrecision(3);
                        tagObject.dirty = true;
                    }
                    if(tagAttribute === PhysicalBody.VELOCITY_ATTRIBUTE) {
                        value_ = value_ + track.body.velocity.x.toPrecision(3);
                        tagObject.dirty = true;
                    }
                    if(tagAttribute === PhysicalBody.ACCELERATION_ATTRIBUTE) {
                        value_ = value_ + track.body.acceleration.x.toPrecision(3);
                        tagObject.dirty = true;
                    }
                    this.textViewObserver.updateTextView(tagname, value_, projectedPos);
                }
            }
            // Update the position of time snap tags, which should follow the corresponding sprites.
            for( var i=0; i<this.timesnap_objects.length; i++) {
                var body = this.timesnap_objects[i];
                for (var tagname in body.tags) {
                    var tagObject = body.tags[tagname];
                    if(!tagObject.dirty)
                        continue;
                    var tagOffset = tagObject.offset;
                    var value_ = tagname + tagObject.value;
                    
                    var object3d = this.view3dObserver.getObject3D(body);
                    var projectedPos = this.view3dObserver.projectToScreenSpace(object3d);
                    if(tagOffset) {
                        projectedPos.x += tagOffset.x;
                        projectedPos.y -= tagOffset.y;
                    }
                    this.textViewObserver.updateTextView(tagname, value_, projectedPos);
                }
            }
        }
    },
    
    syncViews : function() {
        this.sync3DView();
        this.syncText2DView();
    },
    
    updateGraphData: function() {
        if(this.time > 5)
            return;
        this.graphObserver.updateData();
    },
    
    recordGraphData : function() {
        if(this.time > 5)
            return;
        if( this.bRecordGraphData ) {
            for( var i=0; i<this.tracks.length; i++) {
                var body = this.tracks[i].body;
                if(this.graphObserver) {
                    this.graphObserver.recordData([this.time, body.position.x, body.velocity.x, body.acceleration.x]);
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
        this.length = 30;
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
