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

function Model_Kinematics1D_Lab(kinematics3DView, textViewObserver, labParams) {
    this.textViewObserver = textViewObserver;
    this.view3dObserver = kinematics3DView;
    this.prevStartTime = 0;
    this.tracks = [];
    this.bodies = [];
    this.timesnap_objects = [];
    this.annotations = [];
    this.states = [];
    this.states.push(this.UniformVelocityState);
    this.states.push(this.UniformAccelerationState);
    this.states.push(this.UniformDecelerationState);
    
    this.IntervalDataRecord = [];
    this.currentInterval = {start:0, end:0};
    
    this.bRecordGraphData = true;
    this.bRecordGraphDataEveryFrame = true;
    this.NumFramesToSkipForDataRecord = 60;
    this.NumFramesToSkipForTimeSnap = 60;
    this.time = 0;
    this.timeRecordCounter = 0;
    this.timeSnapRecordCounter = 0;
    this.timeSnapPosition = new THREE.Vector3(0,0,0);
    this.pauseSimulation = true;
    this.graphObserver = null;
    this.timeWindow = 5;
    
    if( labParams !== undefined && labParams !== null) {
        var trackData = labParams[0];
        var track = new Model_Kinematics1D_Lab.StraightTrack();
        track.setBodyState(trackData.state);
        var body = track.body;
        body.position.x = (trackData.body.initialPosition);
        body.velocity.x = (trackData.body.initialVelocity);
        body.acceleration.copy(trackData.body.acceleration);
        body.initialPosition = trackData.body.initialPosition;
        body.initialVelocity = trackData.body.initialVelocity;
        body.addTag({name:"textTag", text:"Kinematics Body", offset:{x:0, y:40}, color:"red"});
        body.updateTag("textTag", "color", "green");
        body.addTag({name:"positionTag", text:"x = ", value:0, attribute:PhysicalBody.POSITION_ATTRIBUTE, offset:{x:15, y:20}});
        body.addTag({name:"velocityTag", text:"v = ", value:0, attribute:PhysicalBody.VELOCITY_ATTRIBUTE, offset:{x:15, y:10}});
        body.addTag({name:"accelerationTag", text:"a = ", value:0, attribute:PhysicalBody.ACCELERATION_ATTRIBUTE, offset:{x:15, y:0}});
        this.addTrack(track);
    } else {
        var track = new Model_Kinematics1D_Lab.StraightTrack();
        track.setBodyState(this.UniformAccelerationState);
        track.body.addTag({name:"textTag", text:"Kinematics Body", offset:{x:0, y:40}, color:"red"});
        track.body.updateTag("textTag", "color", "green");
        track.body.addTag({name:"positionTag", text:"x = ", value:0, attribute:PhysicalBody.POSITION_ATTRIBUTE, offset:{x:15, y:20}});
        track.body.addTag({name:"velocityTag", text:"v = ", value:0, attribute:PhysicalBody.VELOCITY_ATTRIBUTE, offset:{x:15, y:10}});
        track.body.addTag({name:"accelerationTag", text:"a = ", value:0, attribute:PhysicalBody.ACCELERATION_ATTRIBUTE, offset:{x:15, y:0}});
        this.addTrack(track);
    }
}

Model_Kinematics1D_Lab.prototype = {
    constructor : Model_Kinematics1D_Lab,
    
    UniformVelocityState : {name: "",position:0, velocity:1, acceleration:0},
    UniformAccelerationState : {name: "", position:0, velocity:0, acceleration:1},
    UniformDecelerationState : {name: "", position:0, velocity:0, acceleration:-1},
    
    setLabParamsAsJSON: function(jsonData) {
        for( var i=0; i<jsonData.length; i++) {
            var track = jsonData[i];
        }
    },
    
    getAsJSON: function() {
        function replacer(key, value) {
            if( key === "mathInput" || key === "states" || key === "graphInput")
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
    
    setTimeWindow: function(timeWindow) {
        this.timeWindow = timeWindow;
        if(this.graphObserver !== null ) {
            this.graphObserver.updateOptions({dateWindow:[0,this.timeWindow]});
        }
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
        this.timeRecordCounter = 0;
        this.timeSnapRecordCounter = 0;
        this.prevStartTime = 0;
        this.IntervalDataRecord = [];
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
    
    isSimulationOver: function() {
        return this.time >= this.timeWindow;
    },
    
    isPaused: function() {
        return this.pauseSimulation;
    },
    
    simulateFull: function() {
        this.playSimulation(true);
        while(!this.isSimulationOver()) {
            this.simulate(0.016);
        }
        this.playSimulation(false);
    },
    
    playSimulation: function(bPlay) {
        this.pauseSimulation = !bPlay;
        if(this.time === 0) {
            this.tracks[0].initializeState();
        }
        //this.manageTimeIntervalRecords(this.pauseSimulation);
    },
    
    manageTimeIntervalRecords: function(pauseSimulation) {
        // If played, create a new interval
        if(!this.pauseSimulation) {
            var newInterval = {start:this.time, end:this.time};
            this.prevStartTime = this.time;
            this.currentInterval = newInterval;
        } // Else push the previous interval 
        else {
            // check if the currentinterval should be pushed on top or not
            for(var i=0; i<this.IntervalDataRecord.length; i++) {
                var interval = this.IntervalDataRecord[i];
                
            }
            this.IntervalDataRecord.push(this.currentInterval);
        }
    },
    
    simulate : function(dt) {
        if(this.pauseSimulation)
            return;
        if(this.time > this.timeWindow) {
            this.playSimulation(false);
        }        
        this.syncViews();
        
        this.recordGraphData();
        
        if(this.timeRecordCounter === 0  && this.graphObserver !== null)
                this.updateGraphData();

        if(this.timeSnapRecordCounter === 0)
            this.timeSnap();
        
        this.time += dt;  
        for( var i=0; i<this.tracks.length; i++) {
            this.tracks[i].advanceBody(this.time, dt);
        }
        this.currentInterval.end = this.time;
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
                icon: 'img/sprite.png',
                width: 15,
                height: 15,
                tickHeight: 14,
                text: this.time
            } );
            //this.graphObserver._graph.setAnnotations(this.annotations);
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
                var track = this.tracks[i];
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
                    //projectedPos.x = 0;
                    //projectedPos.y = 0;
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
        this.graphObserver.updateData();
    },
    
    recordGraphData : function() {
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
    
    initializeState: function(time) {
        if(time === undefined)
            time = 0;
        this.body.position.x = this.body.initialPosition;
        this.body.velocity.x = this.body.initialVelocity;
        // Initialize state from corresponding input
        if(this.mathInput !== null) {
            //this.body.velocity.x = -2;
            //var a = this.mathInput.Value(time);
        }
    },
    
    resetState: function() {
        this.body.position.x = this.body.initialPosition;
        this.body.velocity.x = this.body.initialVelocity;
        //this.setBodyState(this.state);
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
            if(this.mathInput.type === 2) { // acceleration-time
                var a1 = this.mathInput.Value(time);
                var a2 = this.mathInput.Value(time+dt*0.5);
                this.body.acceleration.x = a1;
                var vtemp = this.body.velocity.x + a1 * dt * 0.5;
                this.body.velocity.x += a2 * dt;
                this.body.position.x += vtemp * dt;
            }
            else if(this.mathInput.type === 1) { // velocity-time
                this.body.acceleration.x = this.mathInput.FirstDerivative(time);
                this.body.velocity.x = this.mathInput.Value(time);
                this.body.position.x += this.body.velocity.x * dt;
            } else {
                this.body.acceleration.x = this.mathInput.SecondDerivative(time);
                this.body.velocity.x = this.mathInput.FirstDerivative(time);;
                this.body.position.x = this.mathInput.Value(time);;
            }
        }
        else if(this.graphInput) {
            if(this.graphInput.curveType === 2) { // acceleration-time
                var a1 = this.graphInput.Value(time);
                var a2 = this.graphInput.Value(time+dt*0.5);
                this.body.acceleration.x = a1;
                var vtemp = this.body.velocity.x + a1 * dt * 0.5;
                this.body.velocity.x += a2 * dt;
                this.body.position.x += vtemp * dt;
            }
            else if(this.graphInput.curveType === 1) { // velocity-time
                this.body.acceleration.x = this.graphInput.Velocity(time);
                this.body.velocity.x = this.graphInput.Value(time);
                this.body.position.x += this.body.velocity.x * dt;
            } else {
                this.body.acceleration.x = this.graphInput.Acceleration(time);
                this.body.velocity.x = this.graphInput.Velocity(time);;
                this.body.position.x = this.graphInput.Value(time);;
            }
        }
        else {
            this.body.velocity.x = this.body.initialVelocity + this.body.acceleration.x * time;
            this.body.position.x = this.body.initialPosition + this.body.initialVelocity * time + 0.5 * this.body.acceleration.x * time * time;
        }
        // Update 
        // Handle collision at end points for a finite track
        if( false ) {
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
