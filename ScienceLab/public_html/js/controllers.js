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
    contentLoadingServiceAPI.getSubCategories($scope.subjectID.toLowerCase()).success(function(data) {
    $scope.subjectData = data;
  });
});

// Loads the data for a given subject category( physics/mechanics, mathematics/linear algebra, etc...)
controllers.controller('TopicsLoadController', function ($scope, $routeParams, contentLoadingServiceAPI) {
    $scope.subjectID = $routeParams.subjectID;
    $scope.subjectCategory = $routeParams.subjectCategory;
    contentLoadingServiceAPI.getTopics($scope.subjectID.toLowerCase(), $scope.subjectCategory.toLowerCase()).success(function(data) {
    $scope.subjectCategoryData = data;
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
    var options = sharedProperties.getProperty();
    $scope.publishOptions = options;
    $scope.publishOptions.graphTypeMultiChoice = false;
    $scope.data = {
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
    
    $scope.initGUI = function() {
        $scope.OnKinematicsTabClick($scope.publishOptions.selectedInputType);
        // Check for graph
        if($scope.publishOptions.selectedViewType !== "View3D") {
            var counter = 0;
            for( var i=0; i<$scope.publishOptions.type_time_Selected.length; i++) {
                if($scope.publishOptions.type_time_Selected[i] === true)
                    counter++;
            }
            if(counter > 1)
                $scope.publishOptions.graphTypeMultiChoice = true;
            else
                $scope.publishOptions.graphTypeMultiChoice = false;
            $scope.data.selectedGraphType = 0;
            $scope.selectedGraphTypeChanged();
            $scope.$apply();
        }
    };
    
    $scope.positionValueChanged = function() {
        var iframe = document.getElementById('IFrame');
        if(iframe.contentWindow.lab !== undefined) {
             var model = iframe.contentWindow.lab.tracks[0].body;
             model.position.x = Number($scope.data.positionValue);
             iframe.contentWindow.lab.syncViews();
        }
    };
    
    $scope.velocityValueChanged = function() {
        var iframe = document.getElementById('IFrame');
        if(iframe.contentWindow.lab !== undefined) {
             var model = iframe.contentWindow.lab.tracks[0].body;
             model.velocity.x = Number($scope.data.velocityValue);
             iframe.contentWindow.lab.syncViews();
        }
    };
    
    $scope.accelerationValueChanged = function() {
        var iframe = document.getElementById('IFrame');
        if(iframe.contentWindow.lab !== undefined) {
             var model = iframe.contentWindow.lab.tracks[0].body;
             model.acceleration.x = Number($scope.data.accelerationValue);
             iframe.contentWindow.lab.syncViews();
        }
    };
    
    $scope.selectedStateTypeChanged = function() {
        var iframe = document.getElementById('IFrame');
        if(iframe.contentWindow.lab !== undefined) {
            var selectedStateNumber = Number($scope.data.selectedStateType);
            if(selectedStateNumber === 3) { // User defined
                $scope.data.positionValue = 0;
                $scope.data.velocityValue = 1;
                $scope.data.accelerationValue = 0;
            }
            else {
                var state = iframe.contentWindow.lab.states[selectedStateNumber];
                iframe.contentWindow.lab.tracks[0].setBodyState(state);
                $scope.data.positionValue = state.position;
                $scope.data.velocityValue = state.velocity;
                $scope.data.accelerationValue = state.acceleration;
            }
            iframe.contentWindow.lab.syncViews();
        }
    };
    
    $scope.OnResetPressed = function() {
        var iframe = document.getElementById('IFrame');
        if(iframe.contentWindow.lab !== undefined) {
            iframe.contentWindow.lab.resetSimulation();
            $scope.data.playPauseButtonState = "Play";
        }
    },
    
    $scope.OnPlayPauseButtonPressed = function() {
        var iframe = document.getElementById('IFrame');
        if( $scope.data.playPauseButtonState === "Play") {
            if(iframe.contentWindow.lab !== undefined) {
                iframe.contentWindow.lab.playSimulation(true);
            }
            $scope.data.playPauseButtonState = "Pause";
        } else {
            if(iframe.contentWindow.lab !== undefined) {
                iframe.contentWindow.lab.playSimulation(false);
            }
            $scope.data.playPauseButtonState = "Play";
        }
    };
    
    $scope.OnNameChanged = function() {
        var iframe = document.getElementById('IFrame');
        if(iframe.contentWindow.lab !== undefined) {
            var model = iframe.contentWindow.lab.tracks[0].body;
            model.updateTag("textTag", "text", $scope.data.nameTag);
            iframe.contentWindow.lab.syncText2DView();
        }
    };
    
    $scope.OnAccelerationArrowVisibilityChanged = function() {
        var iframe = document.getElementById('IFrame');
        if(iframe.contentWindow.lab !== undefined) {
            var model = iframe.contentWindow.lab.tracks[0].body;
            iframe.contentWindow.kinematics3DView.setAccelerationArrowVisibility(model, $scope.data.accelerationArrowVisibility);
        }
    };
    
    $scope.OnVelocityArrowVisibilityChanged = function() {
        var iframe = document.getElementById('IFrame');
        if(iframe.contentWindow.lab !== undefined) {
            var model = iframe.contentWindow.lab.tracks[0].body;
            iframe.contentWindow.kinematics3DView.setVelocityArrowVisibility(model, $scope.data.velocityArrowVisibility);
        }
    };
    
    $scope.OnPositionTextVisibilityChanged = function() {
        var iframe = document.getElementById('IFrame');
        if(iframe.contentWindow.lab !== undefined) {
            var model = iframe.contentWindow.lab.tracks[0].body;
            iframe.contentWindow.textViewObserver.setVisible(model.id, "positionTag",$scope.data.positionTextVisibility);
        }
    };
    
    $scope.OnVelocityTextVisibilityChanged = function() {
        var iframe = document.getElementById('IFrame');
        if(iframe.contentWindow.lab !== undefined) {
            var model = iframe.contentWindow.lab.tracks[0].body;
            iframe.contentWindow.textViewObserver.setVisible(model.id, "velocityTag",$scope.data.velocityTextVisibility);
        }
    };
    
    $scope.OnAccelerationTextVisibilityChanged = function() {
        var iframe = document.getElementById('IFrame');
        if(iframe.contentWindow.lab !== undefined) {
            var model = iframe.contentWindow.lab.tracks[0].body;
            iframe.contentWindow.textViewObserver.setVisible(model.id, "accelerationTag",$scope.data.accelerationTextVisibility);
        }
    };
    
    $scope.selectedSplineGraphInputTypeChanged = function() {
        $scope.splineGraph.curveType = Number($scope.data.selectedSplineGraphInputType);
    };
    
    $scope.selectedProbeTypeChanged = function(){
        var selectedProbeType = Number($scope.data.selectedProbeType);
        $scope.modelGraph.customGraphOperations.changeProbeType(selectedProbeType);
    };
    
    $scope.selectedGraphTypeChanged = function(){
        var selectedType = Number($scope.data.selectedGraphType);
        $scope.modelGraph.customGraphOperations.changeGraphType(selectedType);
        if(selectedType === 3) {
           for(var i=0; i<$scope.publishOptions.type_time_Selected.length; i++) {
                $scope.modelGraph.setSeriesVisibility(i, $scope.publishOptions.type_time_Selected[i]);
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
        $scope.data.mathExpressionSyntaxError = !$scope.mathInput.setExpression($scope.data.mathExpression);
    };
    
    $scope.OnKinematicsTabClick = function(tabName) {
        $scope.KinematicsTabName = tabName;
        var iframe = document.getElementById('IFrame');
        var lab = iframe.contentWindow.lab;
            
        if(tabName === "Graph") {
            var parentdiv = document.getElementById("content");
            //var w = parentdiv.offsetWidth;
            $scope.splineGraph.graph.resize(400,200);
            if(lab !== undefined) {
                lab.setGraphInput($scope.splineGraph);
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
    };
    
    window.onSimFrameLoad = function()
    {
      $scope.KinematicsTabName = "Kinematics";
      $scope.$apply();
      var div = document.getElementById('Kinematics_Input_Graph');
      var splineGraph = new SplineGraph(div); 
      $scope.splineGraph = splineGraph;
      $scope.mathInput = new MathInput();  
      $scope.initGUI();
    };
    window.onGraphFrameLoad = function()
    {
            var iframe = document.getElementById('IFrameGraph');
            var innerDocGraph = iframe.contentDocument || iframe.contentWindow.document;
            var iframe = document.getElementById('IFrame');
            var innerDocSim = iframe.contentDocument || iframe.contentWindow.document;
            innerDocSim.modelGraph = innerDocGraph.modelGraph;
            $scope.modelGraph = innerDocSim.modelGraph;
    };
});