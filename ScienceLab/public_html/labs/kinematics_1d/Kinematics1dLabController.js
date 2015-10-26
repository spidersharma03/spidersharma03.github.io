/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

controllers.controller('Kinematics1dLabController', function($scope,sharedProperties){
    $scope.name = "Kinematics1dLabController";
    $scope.KinematicsTabName = 'Kinematics';
    $scope.mode = 'Edit';
    
    $scope.uiDataValues = {
       selectedSplineGraphInputType : "0",
       selectedGraphType : "3",
       selectedProbeType : "0",
       timeWindow: 5,
       InputTypeButtonState: false,
       // Math Data
       mathExpressionSyntaxError:false,
       mathInputData:{type:"0", expression:"t^2 + t"},
       // Graph Data
       graphInputData:{type:0, points:[0,0.1,0.2,0.3,0.4,0.5,0.6,0.7,0.8,0.9],
           linearInterpolation:false,
           timeWindow:5
       },
       // Simulation Data
       playPauseButtonState:"Play",
       // Object Data
       selectedStateType:"3",
       positionValue:0,
       velocityValue:0,
       accelerationValue:1,
       nameTag:"Kinematics Body",
       accelerationArrowVisibility:false,
       velocityArrowVisibility:false,
       positionTextVisibility:true,
       velocityTextVisibility:true,
       accelerationTextVisibility:true,
              
       selectedViewType:"Both",
       publishError:false, 
       publishErrorMessage:"",
       splineGraphWidth:0,
       selectedInputType:"Kinematics",
       selectedGraphOption:0,
       type_time_Selected:[true, false, false],
       type_probe_Selected:[true, false, false, false],
       
       selectedPublishOptionTabType:'View3D'
    };
    // Publish Options
    $scope.publishDataValues = {
       publishError:false, 
       publishErrorMessage:"",
       splineGraphWidth:0,
       selectedInputType:"Kinematics",
       selectedGraphOption:0,
       selectedViewType:"Both",
       type_time_Selected:[true, true, true],
       type_probe_Selected:[true, true, true, true],
       selectedSplineGraphInputType:"0",
       selectedGraphType: "0",
       timeWindow:5,
       // Math Publish Options
       mathPublishOptions:{ 
            type_time_Selected:[true, true, true],
            initialPositionValue:0,
            initialVelocityValue:0
       },
       
       // Graph Publish Options
       graphTypeMultiChoice:false,
       graphPublishOptions: {
            type_time_Selected:[true, true, true],
            initialPositionValue:0,
            initialVelocityValue:0
       }
    };
    
    $scope.OnMathTypeTimeChanged = function() {
        
    };
    
    $scope.OnInputTypeChanged = function(type) {
        $scope.uiDataValues.selectedInputType = type;
        var visibleDiv;
        if($scope.uiDataValues.selectedInputType === "Kinematics") {
              var kinematicsdiv  = document.getElementById("KinematicsInputDiv");
              var mathdiv  = document.getElementById("MathInputDiv");
              var graphdiv  = document.getElementById("GraphInputDiv");
              mathdiv.style.visibility = 'hidden';
              graphdiv.style.visibility = 'hidden';
              kinematicsdiv.style.visibility = 'visible';
              visibleDiv = kinematicsdiv;
        }
        if($scope.uiDataValues.selectedInputType === "Math") {
              var mathdiv  = document.getElementById("MathInputDiv");
              var kinematicsdiv  = document.getElementById("KinematicsInputDiv");
              var graphdiv  = document.getElementById("GraphInputDiv");
              kinematicsdiv.style.visibility = 'hidden';
              graphdiv.style.visibility = 'hidden';
              mathdiv.style.visibility = 'visible';
              visibleDiv = mathdiv;
        }
        if($scope.uiDataValues.selectedInputType === "Graph") {
              var graphdiv  = document.getElementById("GraphInputDiv");
              var mathdiv  = document.getElementById("MathInputDiv");
              var kinematicsdiv  = document.getElementById("KinematicsInputDiv");
              mathdiv.style.visibility = 'hidden';
              kinematicsdiv.style.visibility = 'hidden';
              graphdiv.style.visibility = 'visible';
              visibleDiv = graphdiv;
              $scope.splineGraph.graph.resize(400,200);
          }
          visibleDiv.style.zIndex = "1000";
          visibleDiv.style.visibility = 'visible';
          visibleDiv.style.position = 'absolute';
          visibleDiv.style.overflow = 'hidden';
          function getPos(el) {
            for (var lx=0, ly=0;
                 el !== null;
                 lx += el.offsetLeft, ly += el.offsetTop, el = el.offsetParent);
            return {x: lx,y: ly};
          }
          var button = document.getElementById("PopOverButton");
          visibleDiv.style.left = getPos(button).x - 200 + 'px';
          visibleDiv.style.top = getPos(button).y + button.offsetHeight*2 + 'px';
          visibleDiv.style.display = 'inline';
          visibleDiv.style.backgroundColor = 'rgba(255,255,255,0.5)';
          visibleDiv.style.borderRadius = '10px';
          if(!$scope.uiDataValues.InputTypeButtonState) {
            visibleDiv.style.visibility = 'hidden';
            return; 
          }
          $scope.OnKinematicsTabClick($scope.uiDataValues.selectedInputType);
    };
    
    $scope.OnPopOverClick = function() {
        $scope.uiDataValues.InputTypeButtonState = !$scope.uiDataValues.InputTypeButtonState;
        $scope.OnInputTypeChanged($scope.uiDataValues.selectedInputType);
        return;
        var button = document.getElementById("PopOverButton");
        var newdiv;
        if($scope.uiDataValues.selectedInputType === "Kinematics") {
              newdiv  = document.getElementById("KinematicsInputDiv");
              var mathdiv  = document.getElementById("MathInputDiv");
              var graphdiv  = document.getElementById("GraphInputDiv");
              mathdiv.style.visibility = 'hidden';
              graphdiv.style.visibility = 'hidden';
        }
        if($scope.uiDataValues.selectedInputType === "Math") {
              newdiv  = document.getElementById("MathInputDiv");
              var kinematicsdiv  = document.getElementById("KinematicsInputDiv");
              var graphdiv  = document.getElementById("GraphInputDiv");
              kinematicsdiv.style.visibility = 'hidden';
              graphdiv.style.visibility = 'hidden';
        }
        if($scope.uiDataValues.selectedInputType === "Graph") {
              newdiv  = document.getElementById("GraphInputDiv");
              var mathdiv  = document.getElementById("MathInputDiv");
              var graphdiv  = document.getElementById("GraphInputDiv");
              mathdiv.style.visibility = 'hidden';
              graphdiv.style.visibility = 'hidden';
          }
        $scope.splineGraph.graph.resize(400,200);
        
        if(!$scope.uiDataValues.InputTypeButtonState) {
            newdiv.style.visibility = 'hidden';
            return; 
        }
        newdiv.style.zIndex = "1000";
        newdiv.style.visibility = 'visible';
        newdiv.style.position = 'absolute';
        newdiv.style.overflow = 'hidden';
        function getPos(el) {
            for (var lx=0, ly=0;
                 el !== null;
                 lx += el.offsetLeft, ly += el.offsetTop, el = el.offsetParent);
            return {x: lx,y: ly};
        }
        newdiv.style.left = getPos(button).x - 200 + 'px';
        newdiv.style.top = getPos(button).y + button.offsetHeight*2 + 'px';
        newdiv.style.display = 'inline';
        newdiv.style.backgroundColor = 'rgba(255,255,255,0.5)';
        newdiv.style.borderRadius = '10px';
    };
    
    $scope.timeWindowChanged = function() {
        if($scope.lab !== undefined) {
            $scope.lab.setTimeWindow($scope.uiDataValues.timeWindow);
        } 
        if($scope.splineGraph !== undefined) {
            $scope.splineGraph.timeWindow = $scope.uiDataValues.timeWindow;
        }
    },
    
    $scope.InterpolationTypeChanged = function() {
        
    };
    
    $scope.onLabInitialized = function() {
        $scope.mathInput = new MathInput($scope.uiDataValues.mathInputData); 
        $scope.initGUI();
        if($scope.publishDataValues.selectedInputType === "Math") {
            $scope.lab.setMathInput($scope.mathInput);
        }
    };
    
    $scope.onGraphInitialized = function() {
        if($scope.publishDataValues.selectedViewType !== "View3D") {
                var counter = 0;
                for( var i=0; i<$scope.publishDataValues.type_time_Selected.length; i++) {
                    if($scope.publishDataValues.type_time_Selected[i] === true)
                        counter++;
                }
                if(counter > 1)
                    $scope.publishDataValues.graphTypeMultiChoice = true;
                else
                    $scope.publishDataValues.graphTypeMultiChoice = false;
                    $scope.uiDataValues.selectedGraphType = "0";
                    $scope.selectedGraphTypeChanged();
            }
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
                var mathInputData = result.get("MathInputJsonData");
                $scope.uiDataValues.mathInputData = mathInputData;
                var graphInputData = result.get("GraphInputJsonData");
                $scope.uiDataValues.graphInputData = graphInputData;
                
                var publishOptions = result.get("PublishOptions");
                $scope.uiDataValues.labJSONData = labJSON;
                $scope.publishDataValues = publishOptions;
                $scope.$apply();
            },
            error: function (error) {
                alert("Error: " + error.code + " " + error.message);
            }
        });
    };
    
    sharedProperties.addPropertyValue("uiDataValues", $scope.uiDataValues);
    sharedProperties.setProperty($scope.publishDataValues);
    if( sharedProperties.getPropertyName() === "SceneLoadFromServer"  || sharedProperties.getPropertyName() === "SceneEdit") {
        $scope.sceneLoaded = false;
        var name = sharedProperties.getPropertyName();
        if(name === 'SceneLoadFromServer')
            $scope.mode = 'View';
        if(name === 'SceneEdit')
            $scope.mode = 'Edit';
        $scope.loadSimulationDataFromServer();
    }
    else {
        $scope.sceneLoaded = true;
        sharedProperties.setPropertyName('ScenePreview');
    }
    
    $scope.initGUI = function() {
       $scope.uiDataValues.selectedGraphType = $scope.publishDataValues.selectedGraphType;
       $scope.uiDataValues.selectedProbeType = "0";
       
       $scope.uiDataValues.InputTypeButtonState = false;
       // Math Data
       if($scope.mathInput !== undefined) {
            $scope.uiDataValues.mathPublishOptions = {};
            $scope.uiDataValues.mathExpressionSyntaxError = false;
            $scope.uiDataValues.mathInputData = {type:$scope.mathInput.type.toString(), expression:$scope.mathInput.mathExpression};
        }
       // Graph Data
       if( $scope.splineGraph !== undefined ) {
            $scope.uiDataValues.selectedSplineGraphInputType = $scope.publishDataValues.selectedSplineGraphInputType;
            $scope.uiDataValues.graphInputData = {type:$scope.splineGraph.curveType, points:$scope.splineGraph.sparsePoints,
                linearInterpolation:false,
                timeWindow:$scope.publishDataValues.timeWindow
            };
        }
       // Simulation Data
       $scope.uiDataValues.playPauseButtonState = "Play";
       $scope.uiDataValues.timeWindow = 5;
       // Object Data
       if($scope.lab !== undefined) {
            var body = $scope.lab.tracks[0].body;
            $scope.uiDataValues.selectedStateType = "3";
            $scope.uiDataValues.positionValue = body.position.x;
            $scope.uiDataValues.velocityValue = body.velocity.x;
            $scope.uiDataValues.accelerationValue = body.acceleration.x;
            $scope.uiDataValues.nameTag = "Kinematics Body";
            $scope.uiDataValues.accelerationArrowVisibility = false;
            $scope.uiDataValues.velocityArrowVisibility = false;
            $scope.uiDataValues.positionTextVisibility = true;
            $scope.uiDataValues.velocityTextVisibility = true;
            $scope.uiDataValues.accelerationTextVisibility = true;
        }
       $scope.uiDataValues.selectedViewType = $scope.publishDataValues.selectedViewType;
       $scope.uiDataValues.publishError = false;
       $scope.uiDataValues.publishErrorMessage = "";
       $scope.uiDataValues.selectedInputType = $scope.publishDataValues.selectedInputType;
       $scope.uiDataValues.selectedGraphOption = $scope.publishDataValues.selectedGraphOption;
       $scope.uiDataValues.type_time_Selected = $scope.publishDataValues.type_time_Selected;
       $scope.uiDataValues.type_probe_Selected = $scope.publishDataValues.type_probe_Selected;       
    };
    
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
        if($scope.KinematicsTabName === "Math") {
            if($scope.uiDataValues.mathExpressionSyntaxError) {
                $scope.publishDataValues.publishError = true;
                $scope.publishDataValues.publishErrorMessage = "Correct your Math Input";
            }
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
    
    $scope.OnPublishOptionsTabClick = function(tab) {
        $scope.uiDataValues.selectedPublishOptionTabType = tab;
    };
    
    $scope.OnPublishOptionPressed = function() {
        $scope.publishErrorCheck();
    };
    
    $scope.OnResetPressed = function() {
        if($scope.lab !== undefined) {
            $scope.lab.resetSimulation();
            $('#PlayPauseButton').removeClass('fa-pause');
            $('#PlayPauseButton').addClass('fa-play');
            $scope.uiDataValues.playPauseButtonState = "Play";
        }
    },
    
    $scope.OnPlayPauseButtonPressed = function() {
        var lab = $scope.lab;
        if( $scope.uiDataValues.playPauseButtonState === "Play") {
            if( lab !== undefined) {
                lab.playSimulation(true);
            }
            $('#PlayPauseButton').removeClass('fa-play');
            $('#PlayPauseButton').addClass('fa-pause');
            $scope.uiDataValues.playPauseButtonState = "Pause";
        } else {
            if( lab !== undefined) {
                lab.playSimulation(false);
            }
            $('#PlayPauseButton').removeClass('fa-pause');
            $('#PlayPauseButton').addClass('fa-play');
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
        $scope.uiDataValues.mathExpressionSyntaxError = !$scope.mathInput.setExpression($scope.uiDataValues.mathInputData.expression);
        if(!$scope.uiDataValues.mathExpressionSyntaxError) {
            
        }
    };
    
    $scope.selectedMathInputTypeChanged = function() {
        $scope.mathInput.type  = Number($scope.uiDataValues.mathInputData.type);
    };
    
    $scope.setSplineGraph = function(splineGraph) {
        $scope.splineGraph = splineGraph;
    };
    
    $scope.OnKinematicsTabClick = function(tabName) {
        $scope.KinematicsTabName = tabName;
        var lab = $scope.lab;
            
        if(tabName === "Graph") {
            $scope.publishDataValues.selectedInputType = "Graph";
            //var parentdiv = document.getElementById("content");
            //var w = parentdiv.offsetWidth;
            //$scope.splineGraph.graph.resize(w,200);
            $scope.$parent.splineGraph;
            if(lab !== undefined) {
                lab.setGraphInput($scope.splineGraph);
                lab.setMathInput(null);
            }
        }
        else if( tabName === "Kinematics") {
            $scope.publishDataValues.selectedInputType = "Kinematics";
            if(lab !== undefined) {
                lab.setGraphInput(null);
                lab.setMathInput(null);
            }
        }
        else if( tabName === "Math") {
            $scope.publishDataValues.selectedInputType = "Math";
            if(lab !== undefined) {
                lab.setGraphInput(null);
                lab.setMathInput($scope.mathInput);
            }
        }
        $scope.publishErrorCheck();
    };
    
    $scope.OnPreviewPressed = function() {
        $('#PublishOptionsModel').modal('hide');
        //var iframe = document.getElementById("IFrameEditor");
        //var html = iframe.contentWindow.Preview.preview.innerHTML;
        $scope.publishDataValues.previewHTML = $scope.inputText;
        $scope.applyPublishOptions();
        $scope.mode = "Preview";
    };
    
    $scope.applyPublishOptions = function() {
        $scope.publishDataValues.selectedViewType = $scope.uiDataValues.selectedViewType;  
        $scope.publishDataValues.publishError = $scope.uiDataValues.publishError; 
        $scope.publishDataValues.publishErrorMessage = $scope.uiDataValues.publishErrorMessage;
        $scope.publishDataValues.splineGraphWidth = $scope.uiDataValues.splineGraphWidth;
        $scope.publishDataValues.selectedInputType = $scope.uiDataValues.selectedInputType;
        $scope.publishDataValues.selectedGraphOption = $scope.uiDataValues.selectedGraphOption;
        $scope.publishDataValues.type_time_Selected = $scope.uiDataValues.type_time_Selected;
        $scope.publishDataValues.type_probe_Selected = $scope.uiDataValues.type_probe_Selected;
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
            timeWindow:$scope.publishDataValues.timeWindow,
            selectedInputType:$scope.publishDataValues.selectedInputType,
            selectedGraphOption:$scope.publishDataValues.selectedGraphOption,
            selectedViewType:$scope.publishDataValues.selectedViewType,
            type_time_Selected:$scope.publishDataValues.type_time_Selected,
            type_probe_Selected:$scope.publishDataValues.type_probe_Selected,
            selectedSplineGraphInputType: $scope.publishDataValues.selectedSplineGraphInputType,
            selectedGraphType : $scope.publishDataValues.selectedGraphType,
            mathPublishOptions:$scope.publishDataValues.mathPublishOptions,
            graphPublishOptions:$scope.publishDataValues.graphPublishOptions
        };
        var string = JSON.stringify(publishOptions);
        var publishOptionsJSON = JSON.parse(string);
        simulation.set("PublishOptions", publishOptionsJSON);
        var mathInputJsonData;
        if($scope.KinematicsTabName === "Math")
               mathInputJsonData = $scope.mathInput.getPersistentDataAsJSON();
        var graphInputJsonData;   
        if($scope.KinematicsTabName === "Graph")
               graphInputJsonData = $scope.splineGraph.getPersistentDataAsJSON();
        if(mathInputJsonData !== undefined)   
            simulation.set("MathInputJsonData", mathInputJsonData);
        if(graphInputJsonData !== undefined)
            simulation.set("GraphInputJsonData", graphInputJsonData);
        
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
      var splineGraph = new SplineGraph(div, $scope.uiDataValues.graphInputData); 
      if($scope.publishDataValues.selectedInputType === "Graph") {
          $scope.lab.setGraphInput(splineGraph);
          $scope.splineGraph.graph.resize(400,200);
      }
      $scope.splineGraph = splineGraph;
      $scope.mathInput = new MathInput(); 
      var iframe = document.getElementById('IFrame');
      var lab = iframe.contentWindow.lab;
      lab.addGraphObserver($scope.modelGraph);
    };
    window.onGraphFrameLoad = function()
    {
        var div = document.getElementById('Kinematics_Input_Graph');
        var splineGraph = new SplineGraph(div, $scope.uiDataValues.graphInputData); 
        $scope.splineGraph = splineGraph;
        if($scope.publishDataValues.selectedInputType === "Graph") {
          $scope.lab.setGraphInput(splineGraph);
          $scope.splineGraph.graph.resize(400,200);
        }
        var iframe = document.getElementById('IFrameGraph');
        var innerDocGraph = iframe.contentDocument || iframe.contentWindow.document;
        $scope.modelGraph = innerDocGraph.modelGraph;
        $scope.lab.addGraphObserver($scope.modelGraph);
    };
});

