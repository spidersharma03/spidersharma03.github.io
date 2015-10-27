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