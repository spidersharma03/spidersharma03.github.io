/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

controllers.controller('Kinematics1dLabController', function($scope,sharedProperties){
    $scope.name = "Kinematics1dLabController";
    $scope.KinematicsTabName = 'Kinematics';
    $scope.uiDataValues = {
       selectedSplineGraphInputType : 0,
       selectedGraphType : 3,
       selectedProbeType : 0,
       // Math expression
       mathExpression:"",
       mathExpressionSyntaxError:false,
       // Simulation Data
       playPauseButtonState:"Play",
       // Object Data
       selectedStateType:3,
       positionValue:0,
       velocityValue:0,
       accelerationValue:1,
       nameTag:"Kinematics Body",
       accelerationArrowVisibility:false,
       velocityArrowVisibility:false,
       positionTextVisibility:true,
       velocityTextVisibility:true,
       accelerationTextVisibility:true
    };
    // Publish Options
    $scope.publishDataValues = {
       publishError:false, 
       publishErrorMessage:"",
       splineGraphWidth:0,
       selectedInputType:"Kinematics",
       selectedGraphOption:0,
       selectedViewType:"View3D",
       type_time_Selected:[true, false, false],
       type_probe_Selected:[true, false, false, false],
       valueProbeSelected:true,
       tangentProbeSelected:false,
       areaProbeSelected:false,
       chordProbeSelected:false
    };
    
    $scope.loadSimulationDataFromServer = function(userName, simulationName) {
        var Simulation = Parse.Object.extend("Simulation");
        var query = new Parse.Query(Simulation);
        var date = sharedProperties.getPropertyValue("createdAt");
        var userid = sharedProperties.getPropertyValue("userid");
        query.greaterThanOrEqualTo("createdAt", date);
        query.equalTo("userid", userid);
        query.limit(1);
        query.find({
            success: function (results) {
                if(results.length === 0)
                    return;
                $scope.sceneLoaded = true;
                var result = results[0];
                var labJSON = result.get("SimulationData");
                $scope.uiDataValues.labJSONData = labJSON;
                $scope.$apply();
            },
            error: function (error) {
                alert("Error: " + error.code + " " + error.message);
            }
        });
    };
    sharedProperties.setProperty($scope.publishDataValues);
    if( sharedProperties.getPropertyName() === "SceneEdit" ) {
        $scope.sceneLoaded = false;
        $scope.loadSimulationDataFromServer();
    }
    else {
        $scope.sceneLoaded = true;
        sharedProperties.setPropertyName('ScenePreview');
    }
    
    $scope.selectedInputTypeChanged = function() {
        $scope.publishErrorCheck();
    };
    
    $scope.publishErrorCheck = function() {
        if( $scope.KinematicsTabName !== $scope.publishDataValues.selectedInputType) {
            $scope.publishDataValues.publishError = true;
            $scope.publishDataValues.publishErrorMessage = "Mismatch between selected Input Type";
        } else {
            $scope.publishDataValues.publishError = false;
        }
    };
    
    $scope.OnProbeChanged = function() {
        
    };
    
    $scope.positionValueChanged = function() {
        if($scope.lab !== undefined) {
             var model = $scope.lab.tracks[0].body;
             model.position.x = Number($scope.uiDataValues.positionValue);
             $scope.lab.syncViews();
        }
    };
    
    $scope.velocityValueChanged = function() {
        if($scope.lab !== undefined) {
             var model = $scope.lab.tracks[0].body;
             model.velocity.x = Number($scope.uiDataValues.velocityValue);
             $scope.lab.syncViews();
        }
    };
    
    $scope.accelerationValueChanged = function() {
        if($scope.lab !== undefined) {
             var model = $scope.lab.tracks[0].body;
             model.acceleration.x = Number($scope.uiDataValues.accelerationValue);
             $scope.lab.syncViews();
        }
    };
    
    $scope.selectedStateTypeChanged = function() {
        if($scope.lab !== undefined) {
            var selectedStateNumber = Number($scope.uiDataValues.selectedStateType);
            if(selectedStateNumber === 3) { // User defined
                $scope.uiDataValues.positionValue = 0;
                $scope.uiDataValues.velocityValue = 1;
                $scope.uiDataValues.accelerationValue = 0;
            }
            else {
                var state = $scope.lab.states[selectedStateNumber];
                $scope.lab.tracks[0].setBodyState(state);
                $scope.uiDataValues.positionValue = state.position;
                $scope.uiDataValues.velocityValue = state.velocity;
                $scope.uiDataValues.accelerationValue = state.acceleration;
            }
            $scope.lab.syncViews();
        }
    };
    
    $scope.OnResetPressed = function() {
        if($scope.lab !== undefined) {
            $scope.lab.resetSimulation();
            $scope.uiDataValues.playPauseButtonState = "Play";
        }
    },
    
    $scope.OnPlayPauseButtonPressed = function() {
        var lab = $scope.lab;
        if( $scope.uiDataValues.playPauseButtonState === "Play") {
            if( lab !== undefined) {
                lab.playSimulation(true);
            }
            $scope.uiDataValues.playPauseButtonState = "Pause";
        } else {
            if( lab !== undefined) {
                lab.playSimulation(false);
            }
            $scope.uiDataValues.playPauseButtonState = "Play";
        }
    };
    
    $scope.OnNameChanged = function() {
        if($scope.lab !== undefined) {
            var model = $scope.lab.tracks[0].body;
            model.updateTag("textTag", "text", $scope.uiDataValues.nameTag);
            $scope.lab.syncText2DView();
        }
    };
    
    $scope.OnAccelerationArrowVisibilityChanged = function() {
        if($scope.lab !== undefined) {
            var model = $scope.lab.tracks[0].body;
            $scope.kinematics3DView.setAccelerationArrowVisibility(model, $scope.uiDataValues.accelerationArrowVisibility);
        }
    };
    
    $scope.OnVelocityArrowVisibilityChanged = function() {
        if($scope.lab !== undefined) {
            var model = $scope.lab.tracks[0].body;
            $scope.kinematics3DView.setVelocityArrowVisibility(model, $scope.uiDataValues.velocityArrowVisibility);
        }
    };
    
    $scope.OnPositionTextVisibilityChanged = function() {
        if($scope.lab !== undefined) {
            var model = $scope.lab.tracks[0].body;
            $scope.textViewObserver.setVisible(model.id, "positionTag",$scope.uiDataValues.positionTextVisibility);
        }
    };
    
    $scope.OnVelocityTextVisibilityChanged = function() {
        if($scope.lab !== undefined) {
            var model = $scope.lab.tracks[0].body;
            $scope.textViewObserver.setVisible(model.id, "velocityTag",$scope.uiDataValues.velocityTextVisibility);
        }
    };
    
    $scope.OnAccelerationTextVisibilityChanged = function() {
        if($scope.lab !== undefined) {
            var model = $scope.lab.tracks[0].body;
            $scope.textViewObserver.setVisible(model.id, "accelerationTag",$scope.uiDataValues.accelerationTextVisibility);
        }
    };
    
    $scope.selectedSplineGraphInputTypeChanged = function() {
        $scope.splineGraph.curveType = Number($scope.uiDataValues.selectedSplineGraphInputType);
    };
    
    $scope.selectedProbeTypeChanged = function(){
        var selectedProbeType = Number($scope.uiDataValues.selectedProbeType);
        $scope.modelGraph.customGraphOperations.changeProbeType(selectedProbeType);
    };
    
    $scope.selectedGraphTypeChanged = function(){
        var selectedType = Number($scope.uiDataValues.selectedGraphType);
        $scope.modelGraph.customGraphOperations.changeGraphType(selectedType);
        if(selectedType === 3) {
           for(var i=0; i<3; i++) {
                $scope.modelGraph.setSeriesVisibility(i, true);
            }
        }
       else {
            for(var i=0; i<3; i++) {
                var bVisible = (i === selectedType) ? true : false;
                $scope.modelGraph.setSeriesVisibility(i, bVisible);
            }
        }
        $scope.modelGraph.hairlines.type = selectedType;
    };
    
    $scope.OnMathExpressionChanged = function() {
        $scope.uiDataValues.mathExpressionSyntaxError = !$scope.mathInput.setExpression($scope.uiDataValues.mathExpression);
    };
    
    $scope.OnKinematicsTabClick = function(tabName) {
        $scope.KinematicsTabName = tabName;
        var lab = $scope.lab;
            
        if(tabName === "Graph") {
            var parentdiv = document.getElementById("content");
            var w = parentdiv.offsetWidth;
            $scope.splineGraph.graph.resize(w,200);
            if(lab !== undefined) {
                lab.setGraphInput($scope.splineGraph);
                lab.setMathInput(null);
            }
        }
        else if( tabName === "Kinematics") {
            if(lab !== undefined) {
                lab.setGraphInput(null);
                lab.setMathInput(null);
            }
        }
        else if( tabName === "Math") {
            if(lab !== undefined) {
                lab.setGraphInput(null);
                lab.setMathInput($scope.mathInput);
            }
        }
        $scope.publishErrorCheck();
    };
    
    $scope.OnPreviewPressed = function() {
        $('#PublishOptionsModel').modal('hide');
        var iframe = document.getElementById("IFrameEditor");
        var html = iframe.contentWindow.Preview.preview.innerHTML;
        $scope.publishDataValues.previewHTML = html;
    };
    
    $scope.OnPublishPressed = function() {
        $('#PublishOptionsModel').modal('hide');
        
        
        var currentUser = Parse.User.current();
        if( currentUser ) {
            var currentUserEmail = currentUser.get("email");
            var Simulation = Parse.Object.extend("Simulation");
            var query = new Parse.Query(Simulation);
            var currentUserEmail = currentUser.get("email");
            query.equalTo("userid", currentUserEmail);
            var numSimsForCurrentUser = 0;
            query.find({
              success: function(results) {
                    numSimsForCurrentUser = results.length;
                    if( numSimsForCurrentUser > 1) {
                        alert("You have exceeded the limit to publish more!");
                        return;
                    }
                    if( sharedProperties.getPropertyName() === "SceneEdit") {
                        var Simulation = Parse.Object.extend("Simulation");
                        var query = new Parse.Query(Simulation);
                        var date = sharedProperties.getPropertyValue("createdAt");
                        var userid = sharedProperties.getPropertyValue("userid");
                        query.greaterThanOrEqualTo("createdAt", date);
                        query.equalTo("userid", userid);
                        query.limit(1);
                        query.find({
                        success: function (result) {
                            if(result.length === 0)
                                return;
                            var simulation = result[0];
                            $scope.publishSimulation(currentUser, simulation, true);
                        },
                        error: function (error) {
                            alert("Error: " + error.code + " " + error.message);
                        }
                    });
                    }
                    else {
                        var SimulationMetaData = Parse.Object.extend("SimulationMetaData");
                        var simulationMetaData = new SimulationMetaData();
                        var Simulation = Parse.Object.extend("Simulation");
                        var simulation = new Simulation();
                        $scope.publishSimulationMetaData(currentUser, simulationMetaData, false);
                        $scope.publishSimulation(currentUser, simulation, false);
                    }
              },
              error: function(error) {
                alert("Error: " + error.code + " " + error.message);
              }
            });
        }
    };
    
    $scope.publishSimulation = function(currentUser, simulation, edited) {
        if(currentUser === undefined)
            return;
        
        var currentUserEmail = currentUser.get("email");
        // Save Lab related Info
        simulation.set("userid", currentUserEmail);
        
        var labJson = $scope.lab.getAsJSON();
        simulation.set("edited", edited);
        simulation.set("SimulationData", labJson);
        var publishOptions = {
            selectedInputType:$scope.publishDataValues.selectedInputType,
            selectedGraphOption:$scope.publishDataValues.selectedGraphOption,
            selectedViewType:$scope.publishDataValues.selectedViewType,
            type_time_Selected:$scope.publishDataValues.type_time_Selected,
            type_probe_Selected:$scope.publishDataValues.type_probe_Selected
        };
        var string = JSON.stringify(publishOptions);
        var publishOptionsJSON = JSON.parse(string);
        simulation.set("PublishOptions", publishOptionsJSON);
        
        simulation.save(null, {
            success: function(simulation) {
              alert('Simulation saved: ' + simulation.id);
            },
            error: function(simulation, error) {
              alert('error in saving Simulation: ' + error.message);
            }
        });
    };

    $scope.publishSimulationMetaData = function(currentUser, simulationMetaData, edited) {
        if(currentUser === undefined)
            return;
        var currentUserEmail = currentUser.get("email");
        var currentUserName = currentUser.get("username");
        // Save SimulationMetaData
        simulationMetaData.set("simname", "Kinematics1d");
        simulationMetaData.set("simtitle", "Introduction to Velocity");
        simulationMetaData.set("userid", currentUserEmail);
        simulationMetaData.set("username", currentUserName);
        simulationMetaData.set("edited", edited);
        simulationMetaData.save(null, {
            success: function(simulationMetaData) {
              alert('SimulationMetaData saved: ' + simulationMetaData.id);
            },
            error: function(simulationMetaData, error) {
              alert('error in saving SimulationMetaData: ' + error.message);
            }
        });
    };

    window.onSimFrameLoad = function()
    {
      $scope.KinematicsTabName = "Kinematics";
      $scope.$apply();
      var div = document.getElementById('Kinematics_Input_Graph');
      var splineGraph = new SplineGraph(div); 
      $scope.splineGraph = splineGraph;
      $scope.mathInput = new MathInput(); 
      var iframe = document.getElementById('IFrame');
      var lab = iframe.contentWindow.lab;
      lab.addGraphObserver($scope.modelGraph);
    };
    window.onGraphFrameLoad = function()
    {
        var div = document.getElementById('Kinematics_Input_Graph');
        var splineGraph = new SplineGraph(div); 
        $scope.splineGraph = splineGraph;
        $scope.mathInput = new MathInput(); 
        var iframe = document.getElementById('IFrameGraph');
        var innerDocGraph = iframe.contentDocument || iframe.contentWindow.document;
        $scope.modelGraph = innerDocGraph.modelGraph;
        $scope.lab.addGraphObserver($scope.modelGraph);
    };
});

