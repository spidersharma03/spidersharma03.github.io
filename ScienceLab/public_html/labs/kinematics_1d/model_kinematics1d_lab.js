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
    this.states = [];
    this.states.push(this.UniformVelocityState);
    this.states.push(this.UniformAccelerationState);
    this.states.push(this.UniformDecelerationState);
    
    this.bRecordGraphData = true;
    this.bRecordGraphDataEveryFrame = true;
    this.NumFramesToSkipForDataRecord = 1;
    this.NumFramesToSkipForTimeSnap = 60;
    this.time = 0;
    this.timeRecordCounter = 0;
    this.timeSnapRecordCounter = 0;
    this.timeSnapPosition = new THREE.Vector3(0,0,0);
    this.pauseSimulation = true;
    this.graphObserver = null;
    this.textViewObserver = null;
    this.view3dObserver = null;
}

Model_Kinematics1D_Lab.prototype = {
    constructor : Model_Kinematics1D_Lab,
    
    UniformVelocityState : {name: "",position:0, velocity:1, acceleration:0},
    UniformAccelerationState : {name: "", position:0, velocity:0, acceleration:1},
    UniformDecelerationState : {name: "", position:0, velocity:0, acceleration:-1},
    
    getAsJSON: function() {
        function replacer(key, value) {
            if( key === "mathInput" || key === "state" || key === "graphInput")
                return undefined;
            if(key === "tags") {
                var tagArray = [];
                for (var tagname in value) {
                    var tagObject = value[tagname];
                    tagArray.push(tagObject);
                }
                var res = JSON.stringify(tagArray);
                return JSON.parse(res);
            }
            return value;
        }

        var res = JSON.stringify(this.tracks, replacer);
        var out = JSON.parse(res);
        return out;
    },
    
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
                this.textViewObserver.addTextView(track.body.id, tagname, tagObject.value, pos, tagObject.color);
            }
        }
    },
    
    resetSimulation: function(time) {
        this.pauseSimulation = true;
        this.time = 0;
        for(var i=0; i<this.timesnap_objects.length; i++) {
            this.view3dObserver.removeObject3D(this.timesnap_objects[i]);
        }
        this.timesnap_objects = [];
        for( var i=0; i<this.tracks.length; i++) {
            this.tracks[i].resetState();          
        }
        if( this.graphObserver) {
            this.annotations = [];
            this.graphObserver.clearData();
        }
        this.syncViews();
    },
    
    playSimulation: function(bPlay) {
        this.pauseSimulation = !bPlay;
    },
    
    simulate : function(dt) {
        if(this.pauseSimulation)
            return;
        
        for( var i=0; i<this.tracks.length; i++) {
            this.tracks[i].advanceBody(this.time, dt);
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
            this.textViewObserver.addTextView(simBody.id, taginfo1.name, taginfo1.value, {x:0,y:0}, "blue");
            this.textViewObserver.addTextView(simBody.id, taginfo2.name, taginfo2.value, {x:0,y:0}, "blue");
            this.textViewObserver.addTextView(simBody.id, taginfo3.name, taginfo3.value, {x:0,y:0}, "blue");
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
                    var value_ = tagObject.text;
                    
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
                    this.textViewObserver.updateTextView(body.id, tagname, value_, projectedPos);
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
                    var value_ = tagObject.text + tagObject.value;
                    
                    var object3d = this.view3dObserver.getObject3D(body);
                    var projectedPos = this.view3dObserver.projectToScreenSpace(object3d);
                    if(tagOffset) {
                        projectedPos.x += tagOffset.x;
                        projectedPos.y -= tagOffset.y;
                    }
                    this.textViewObserver.updateTextView(body.id, tagname, value_, projectedPos);
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
                    var time = this.time;
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
    },
    
    setGraphInput: function(graphInput) {
        this.tracks[0].setGraphInput(graphInput);
    },
    
    setMathInput: function(mathInput) {
        this.tracks[0].setMathInput(mathInput);        
    }
};

Model_Kinematics1D_Lab.StraightTrack = function(trackParams) {
    if( trackParams ) {
        this.type = trackParams.type;
    } else {
        this.state = null;
        this.type = Model_Kinematics1D_Lab.StraightTrack.STRAIGHT_TRACK;
        this.length = 30;
        this.mathInput = false;
        this.graphInput = false;
        this.isFinite = true;
        this.isElasticAtEndPoints = false;
        this.body = new Kinematics_Body();
        this.graphInput = null;
        this.mathInput = null;
    }
};

Model_Kinematics1D_Lab.StraightTrack.STRAIGHT_TRACK = 0;
Model_Kinematics1D_Lab.StraightTrack.INCLINED_TRACK = 1;
Model_Kinematics1D_Lab.StraightTrack.CURVED_TRACK = 2;

Model_Kinematics1D_Lab.StraightTrack.prototype = {
    constructor : Model_Kinematics1D_Lab.Track,
    
    resetState: function() {
        this.setBodyState(this.state);
    },
    
    setBodyState: function(state) {
        this.state = state;
        this.body.setState(state.position, state.velocity, state.acceleration);
    },
    
    setGraphInput: function(graphInput) {
        this.graphInput = graphInput;
    },
    
    setMathInput: function(mathInput) {
        this.mathInput = mathInput;
    },
    
    advanceBody : function(time, dt) {
        // Check If the acceleration is governed by a spline or math equation
        if(this.mathInput) {
            this.body.acceleration.x = this.mathInput.Value(time);
        }
        if(this.graphInput) {
            this.body.acceleration.x = this.graphInput.Value(time);
        }
        // Update 
        this.body.velocity.x += this.body.acceleration.x * dt;
        this.body.position.x += this.body.velocity.x * dt;
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
