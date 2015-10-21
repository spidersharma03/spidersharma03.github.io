/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/*
 This module is used to load data from the json files, using the "contentLoadingSerivice".
 right now the service API uses http, later it can be replaced with a server. 
 */
'use strict';

var controllers = angular.module('DataLoadControllers', []);

// Loads the data for a given subject( physics, computer science, etc...)
controllers.controller('SubjectsLoadController', function ($scope, $routeParams, contentLoadingServiceAPI) {
    $scope.subjectID = $routeParams.subjectID;
    alert($scope.subjectID);
    contentLoadingServiceAPI.getSubCategories($scope.subjectID.toLowerCase()).success(function(data) {
    $scope.subjectData = data;
  });
});

// Loads the data for a given subject category( physics/mechanics, mathematics/linear algebra, etc...)
controllers.controller('TopicsLoadController', function ($scope, $routeParams, contentLoadingServiceAPI) {
    $scope.subjectID = $routeParams.subjectID;
    $scope.subjectCategory = $routeParams.subjectCategory;
    alert($scope.subjectID + " " + $scope.subjectCategory);
    contentLoadingServiceAPI.getTopics($scope.subjectID.toLowerCase(), $scope.subjectCategory.toLowerCase()).success(function(data) {
    $scope.subjectCategoryData = data;
    for(var i=0; i<data.sub_categories.length; i++) {
        alert(data.sub_categories[i].name);
    }
  });
});

// Loads the data for a given topic, inside a subject category(  physics/mechanics/oscillations, computer science/computer graphics/opengl, etc...)
controllers.controller('SubTopicsLoadController', function ($scope, $sce, $routeParams, contentLoadingServiceAPI, sharedProperties) {
    $scope.subjectID = $routeParams.subjectID;
    $scope.subjectCategory = $routeParams.subjectCategory;
    $scope.Topic = $routeParams.Topic;
    
    $scope.onQuestionViewClick = function(questionStructure) {
        sharedProperties.setProperty(questionStructure);
    };
    
    $scope.onSubViewClick = function(subView) {
        $scope.SubView = subView;
        if(subView === "questions") {
            contentLoadingServiceAPI.getSubTopicQuestions($scope.subjectID.toLowerCase(), $scope.subjectCategory.toLowerCase(),$scope.SubTopic.toLowerCase())
            .success(function(data) {
                $scope.QuestionList = data.questionlist;
        });
       }
    };
    
    $scope.trustSrc = function(src) {
        return $sce.trustAsResourceUrl(src);
    };

    $scope.onSubTopicClick = function(subTopicPage) {
        $scope.SubTopic = subTopicPage;
        contentLoadingServiceAPI.getSubTopics($scope.subjectID.toLowerCase(), $scope.subjectCategory.toLowerCase(),$scope.Topic.toLowerCase())
        .success(function(data) {
            $scope.categoryTopicsData = data;
            $scope.SubView = "simulation";
            var element = document.getElementById("tab-simulation");
            if(element)
               element.className = "active";
            element = document.getElementById("tab-video");
            if(element)
               element.className = "";
            element = document.getElementById("tab-questions");
            if(element)
               element.className = "";
           
            for(var i = 0; i < $scope.categoryTopicsData.topics.length; i++)
            {
                if($scope.categoryTopicsData.topics[i].pageLink === $scope.SubTopic) {
                    $scope.VideoList = $scope.categoryTopicsData.topics[i].videos;
                    $scope.SimulationList = $scope.categoryTopicsData.topics[i].simulations;
                    $scope.SimulationDisplayName = $scope.categoryTopicsData.topics[i].display_name;
                    $scope.SimulationFolderName = $scope.categoryTopicsData.topics[i].pageLink;
                    $scope.SimulationSceneName = $scope.categoryTopicsData.topics[i].scene_name;            
                    break;
                }
            }
    
        });
    };
    
    contentLoadingServiceAPI.getSubTopics($scope.subjectID.toLowerCase(), $scope.subjectCategory.toLowerCase(),$scope.Topic.toLowerCase())
    .success(function(data) {
    $scope.categoryTopicsData = data;
    $scope.SubTopic = $scope.categoryTopicsData.topics[0].pageLink;
    $scope.SubView = "simulation";
    $scope.VideoList = $scope.categoryTopicsData.topics[0].videos;
    $scope.SimulationList = $scope.categoryTopicsData.topics[0].simulations;
    $scope.SimulationDisplayName = $scope.categoryTopicsData.topics[0].display_name;
    $scope.SimulationFolderName = $scope.categoryTopicsData.topics[0].pageLink;
    $scope.SimulationSceneName = $scope.categoryTopicsData.topics[0].scene_name; 
  });
});

// Loads the data for a given topic, inside a subject category(  physics/mechanics/oscillations, computer science/computer graphics/opengl, etc...)
controllers.controller('SubTopicsDataLoadController', function ($scope, $routeParams, contentLoadingServiceAPI) {
    $scope.subjectID = $routeParams.subjectID;
    $scope.subjectCategory = $routeParams.subjectCategory;
    $scope.Topic = $routeParams.Topic;
    $scope.SubTopic = $routeParams.SubTopic;
    $scope.SubView = "simulation";
    $scope.onSubTopicClick = function(subTopicPage) {
        $scope.SubTopic = subTopicPage;
    };
    $scope.onSubViewClick = function(subView) {
        $scope.SubView = subView;
    };
    contentLoadingServiceAPI.getSubTopics($scope.subjectID.toLowerCase(), $scope.subjectCategory.toLowerCase(),$scope.Topic.toLowerCase())
    .success(function(data) {
    $scope.categoryTopicsData = data;
    for(var i = 0; i < $scope.categoryTopicsData.topics.length; i++)
    {
        if($scope.categoryTopicsData.topics[i].pageLink === $scope.SubTopic) {
            $scope.VideoList = $scope.categoryTopicsData.topics[i].videos;
            $scope.SimulationList = $scope.categoryTopicsData.topics[i].simulations;
            $scope.SimulationDisplayName = $scope.categoryTopicsData.topics[i].display_name;
            $scope.SimulationFolderName = $scope.categoryTopicsData.topics[i].pageLink;
            $scope.SimulationSceneName = $scope.categoryTopicsData.topics[i].scene_name;            
            break;
        }
    }
    
  });
});

// Loads the simulation data. this includes, the simulation name, gui html etc.
controllers.controller('SimulationDataLoadController', function ($scope, $routeParams, contentLoadingServiceAPI) {
    $scope.LinkName =  "simulations/" + $routeParams.simulationPageName + '/' + $routeParams.simulationName;
    $scope.guiName = "partials/" + $routeParams.simulationPageName + "/" + $routeParams.simulationName;
});

// Loads the question data.
controllers.controller('QuestionDataLoadController', function ($scope, $routeParams, contentLoadingServiceAPI, sharedProperties) {
    $scope.LinkName =  "simulations/" + $routeParams.simulationPageName + '/' + $routeParams.simulationName;
    $scope.guiName = "partials/" + $routeParams.simulationPageName + "/" + $routeParams.simulationName;
    $scope.currentQuestionStructure = sharedProperties.getProperty();
    $scope.currentQuestion = $scope.currentQuestionStructure.questions[0];
    $scope.questionType = $scope.currentQuestionStructure.questions[0].type;
    $scope.currentQuestionIndex = 0;
    $scope.selectedAnswer = -1;
    $scope.questionSolved = false;
    $scope.submitAnswer = function() {
        var correctAnswer = $scope.currentQuestion.correct_answer;
        if($scope.selectedAnswer === Number(correctAnswer-1) 
                && $scope.currentQuestionIndex < $scope.currentQuestion.options.length ){
               $scope.questionSolved = true;
       }
    };
    
    $scope.selectAnswer = function(value) {
        $scope.selectedAnswer = value;
        var correctAnswer = $scope.currentQuestion.correct_answer;
        if($scope.selectedAnswer !== Number(correctAnswer-1))
            $scope.questionSolved = false;
    };
    
    $scope.nextQuestion = function(value) {
            $scope.currentQuestionIndex++;
            $scope.questionSolved = false;
            $scope.currentQuestionIndex = $scope.currentQuestionIndex >= $scope.currentQuestionStructure.questions.length ? 0 : $scope.currentQuestionIndex;
            if($scope.currentQuestionIndex === 0)
                $scope.questionSolved = false;
            $scope.currentQuestion = $scope.currentQuestionStructure.questions[$scope.currentQuestionIndex];            
            $scope.questionType = $scope.currentQuestion.type;            
    };
});

controllers.controller('Kinematic1dViewController', function($scope, sharedProperties){
//    $('#PublishOptionsModel').modal('hide');
//    $('.modal-backdrop').remove();
    $scope.sceneLoaded = false;
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
       accelerationTextVisibility:true,
       
       labJSONData:null
    };
    
    $scope.onLabInitialized = function() {
        $scope.mathInput = new MathInput($scope.mathInputData);
        $scope.initGUI();
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
                var publishedOptions = result.get("PublishOptions");
                $scope.publishDataValues = publishedOptions;
                $scope.uiDataValues.labJSONData = labJSON;
                var mathInputData = result.get("MathInputJsonData");
                var graphInputData = result.get("GraphInputJsonData");
                if(mathInputData !== undefined) {
                    $scope.mathInputData = mathInputData;
                }
                if(graphInputData !== undefined) {
                    $scope.graphInputData = graphInputData;
                }
                $scope.$apply();
            },
            error: function (error) {
                alert("Error: " + error.code + " " + error.message);
            }
        });
    };
    
    if( sharedProperties.getPropertyName() === 'SceneLoadFromServer') {
        $scope.publishDataValues = {};
        $scope.publishDataValues.graphTypeMultiChoice = false;
        $scope.publishDataValues.selectedViewType = 'Both';
        $scope.publishDataValues.selectedInputType = 'Kinematics';
        $scope.loadSimulationDataFromServer();
    }
    else {
       $scope.publishDataValues = sharedProperties.getProperty();
       $scope.publishDataValues.graphTypeMultiChoice = false;
       //$scope.initGUI();
       $scope.sceneLoaded = true;
       $scope.uiDataValues = sharedProperties.getPropertyValue("uiDataValues");
    }
    
    $scope.initGUI = function() {
        if($scope.publishDataValues.selectedInputType === "Math") {
            if($scope.mathInputData !== undefined)
                $scope.uiDataValues.mathExpression = $scope.mathInputData.expression;
        }
        $scope.OnKinematicsTabClick($scope.publishDataValues.selectedInputType);
        // Check for graph
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
            $scope.uiDataValues.selectedGraphType = 0;
            $scope.selectedGraphTypeChanged();
            $scope.$apply();
        }
        var previewDiv = document.getElementById("PreviewDiv");
        previewDiv.innerHTML = $scope.publishDataValues.previewHTML;
        $scope.publishDataValues.previewText = previewDiv.innerHTML.length > 0;
        //$scope.$apply();
    };
    
    $scope.positionValueChanged = function() {
        var lab = $scope.publishDataValues.lab;
        if(lab !== undefined) {
             var model = lab.tracks[0].body;
             model.position.x = Number($scope.uiDataValues.positionValue);
             lab.syncViews();
        }
    };
    
    $scope.velocityValueChanged = function() {
        var lab = $scope.publishDataValues.lab;
        if(lab !== undefined) {
             var model = lab.tracks[0].body;
             model.velocity.x = Number($scope.uiDataValues.velocityValue);
             lab.syncViews();
        }
    };
    
    $scope.accelerationValueChanged = function() {
        var lab = $scope.publishDataValues.lab;
        if(lab !== undefined) {
             var model = lab.tracks[0].body;
             model.acceleration.x = Number($scope.uiDataValues.accelerationValue);
             lab.syncViews();
        }
    };
    
    $scope.selectedStateTypeChanged = function() {
        var lab = $scope.publishDataValues.lab;
        if(lab !== undefined) {
            var selectedStateNumber = Number($scope.uiDataValues.selectedStateType);
            if(selectedStateNumber === 3) { // User defined
                $scope.uiDataValues.positionValue = 0;
                $scope.uiDataValues.velocityValue = 1;
                $scope.uiDataValues.accelerationValue = 0;
            }
            else {
                var state = lab.states[selectedStateNumber];
                lab.tracks[0].setBodyState(state);
                $scope.uiDataValues.positionValue = state.position;
                $scope.uiDataValues.velocityValue = state.velocity;
                $scope.uiDataValues.accelerationValue = state.acceleration;
            }
            lab.syncViews();
        }
    };
    
    $scope.OnResetPressed = function() {
        var lab = $scope.publishDataValues.lab;
        if(lab !== undefined) {
            lab.resetSimulation();
            $scope.uiDataValues.playPauseButtonState = "Play";
        }
    },
    
    $scope.OnPlayPauseButtonPressed = function() {
        var lab = $scope.publishDataValues.lab;
        //var lab = $scope.lab;
        if( $scope.uiDataValues.playPauseButtonState === "Play") {
            if(lab !== undefined) {
                lab.playSimulation(true);
            }
            $scope.uiDataValues.playPauseButtonState = "Pause";
        } else {
            if(lab !== undefined) {
                lab.playSimulation(false);
            }
            $scope.uiDataValues.playPauseButtonState = "Play";
        }
    };
    
    $scope.OnNameChanged = function() {
        var lab = $scope.publishDataValues.lab;
        if(lab !== undefined) {
            var model = lab.tracks[0].body;
            model.updateTag("textTag", "text", $scope.uiDataValues.nameTag);
            lab.syncText2DView();
        }
    };
    
    $scope.OnAccelerationArrowVisibilityChanged = function() {
        var lab = $scope.publishDataValues.lab;
        if(lab !== undefined) {
            var model = lab.tracks[0].body;
            lab.view3dObserver.setAccelerationArrowVisibility(model, $scope.uiDataValues.accelerationArrowVisibility);
        }
    };
    
    $scope.OnVelocityArrowVisibilityChanged = function() {
        var lab = $scope.publishDataValues.lab;
        if(lab !== undefined) {
            var model = lab.tracks[0].body;
            lab.view3dObserver.setVelocityArrowVisibility(model, $scope.uiDataValues.velocityArrowVisibility);
        }
    };
    
    $scope.OnPositionTextVisibilityChanged = function() {
        var lab = $scope.publishDataValues.lab;
        if(lab !== undefined) {
            var model = lab.tracks[0].body;
            lab.textViewObserver.setVisible(model.id, "positionTag",$scope.uiDataValues.positionTextVisibility);
        }
    };
    
    $scope.OnVelocityTextVisibilityChanged = function() {
        var lab = $scope.publishDataValues.lab;
        if(lab !== undefined) {
            var model = lab.tracks[0].body;
            lab.textViewObserver.setVisible(model.id, "velocityTag",$scope.uiDataValues.velocityTextVisibility);
        }
    };
    
    $scope.OnAccelerationTextVisibilityChanged = function() {
        var lab = $scope.publishDataValues.lab;
        if(lab !== undefined) {
            var model = lab.tracks[0].body;
            lab.textViewObserver.setVisible(model.id, "accelerationTag",$scope.uiDataValues.accelerationTextVisibility);
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
           for(var i=0; i<$scope.publishDataValues.type_time_Selected.length; i++) {
                $scope.modelGraph.setSeriesVisibility(i, $scope.publishDataValues.type_time_Selected[i]);
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
            
        if(tabName === "Graph") {
            //var w = parentdiv.offsetWidth;
            $scope.splineGraph.graph.resize(400,200);
            if($scope.publishDataValues.lab !== undefined) {
                $scope.publishDataValues.lab.setGraphInput($scope.splineGraph);
            }
        }
        else if( tabName === "Kinematics") {
            if($scope.publishDataValues.lab !== undefined) {
                $scope.publishDataValues.lab.setGraphInput(null);
                $scope.publishDataValues.lab.setMathInput(null);
            }
        }
        else if( tabName === "Math") {
            if($scope.publishDataValues.lab !== undefined) {
                $scope.publishDataValues.lab.setGraphInput(null);
                $scope.publishDataValues.lab.setMathInput($scope.mathInput);
            }
        }
    };
    
    window.onSimFrameLoad = function()
    {
            $scope.KinematicsTabName = "Kinematics";
            $scope.$apply();
            var div = document.getElementById('Kinematics_Input_Graph');
            var splineGraph = new SplineGraph(div); 
            $scope.splineGraph = splineGraph;
            $scope.mathInput = new MathInput();  
            //$scope.initGUI();
            var iframe = document.getElementById('IFrame');
            var lab = iframe.contentWindow.lab;
            if($scope.uiDataValues.labJSONData !== undefined){
                lab.setLabParamsAsJSON($scope.uiDataValues.labJSONData);
            }
            lab.addGraphObserver($scope.modelGraph);
            $scope.$apply();
    };
    window.onGraphFrameLoad = function()
    {
            var iframe = document.getElementById('IFrameGraph');
            var innerDocGraph = iframe.contentDocument || iframe.contentWindow.document;
            var iframe = document.getElementById('IFrame');
            var div = document.getElementById('Kinematics_Input_Graph');
            var splineGraph = new SplineGraph(div); 
            $scope.splineGraph = splineGraph;
            $scope.mathInput = new MathInput(); 
            //var innerDocSim = iframe.contentDocument || iframe.contentWindow.document;
            //innerDocSim.modelGraph = innerDocGraph.modelGraph;
            $scope.modelGraph = innerDocGraph.modelGraph;
            $scope.graphFrameLoaded = true;
            $scope.$apply();
    };
});