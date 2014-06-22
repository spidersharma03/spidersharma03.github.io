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


controllers.controller('SubjectsLoadController', function ($scope, $routeParams, contentLoadingServiceAPI) {
    $scope.subject = $routeParams.subject;
    contentLoadingServiceAPI.getSubCategories("physics").success(function(data) {
    $scope.physics_subs = data;
  });
});

controllers.controller('TopicsLoadController', function ($scope, $routeParams, contentLoadingServiceAPI) {
    $scope.subCategory = $routeParams.subCategory;
    contentLoadingServiceAPI.getTopics($scope.subCategory).success(function(data) {
    $scope.physics_subs = data;
  });
});

controllers.controller('SubTopicsLoadController', function ($scope, $routeParams, contentLoadingServiceAPI) {
    $scope.Topic = $routeParams.Topic;
    contentLoadingServiceAPI.getSubTopics($scope.Topic).success(function(data) {
    $scope.physics_subs = data;
  });
});