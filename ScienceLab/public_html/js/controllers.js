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
controllers.controller('SubTopicsLoadController', function ($scope, $routeParams, contentLoadingServiceAPI) {
    $scope.subjectID = $routeParams.subjectID;
    $scope.subjectCategory = $routeParams.subjectCategory;
    $scope.Topic = $routeParams.Topic;
    contentLoadingServiceAPI.getSubTopics($scope.subjectID.toLowerCase(), $scope.subjectCategory.toLowerCase(),$scope.Topic.toLowerCase())
    .success(function(data) {
    $scope.categoryTopicsData = data;
  });
});