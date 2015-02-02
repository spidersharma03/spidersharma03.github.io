/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
'use strict';

/*
 * This module is responsible for all the routing.
 */
var mainApp = angular.module('mainApp', ['ngRoute', 'DataLoadControllers', 'ContentLoadingService']).config(['$routeProvider',
  function($routeProvider) {
    $routeProvider.
      when('/Home', {
        templateUrl: 'partials/homePage.html',
        controller: 'homePageLoadController'
      }).
      when('/Mission', {
        templateUrl: 'partials/mission.html',
        controller: ''
      }).
      when('/Simulation/:simulationPageName/:simulationName', {
        templateUrl: 'partials/SimulationPage.html',
        controller: 'SimulationDataLoadController'
      }).
      when('/:subjectID', {         // this is for loading subject.( ex: physics,mathematics etc)
         templateUrl: 'partials/SubjectPage.html',
         controller: 'SubjectsLoadController'
      }).
      when('/:subjectID/:subjectCategory', {  // this is for loading sub category in a subject.( ex mechanics,optics in physics)
         templateUrl: 'partials/SubjectCategoryPage.html',
         controller: 'TopicsLoadController'
      }).
      when('/:subjectID/:subjectCategory/:Topic', { // this is for loading topics in a category.( ex kinematics, oscillations in mechanics)
         templateUrl: 'partials/TopicsPage.html',
         controller: 'SubTopicsLoadController'
      }).
      when('/:subjectID/:subjectCategory/:Topic/:SubTopic', { // this is for loading topics in a category.( ex kinematics, oscillations in mechanics)
         templateUrl: 'partials/TopicsPage.html',
         controller: 'SubTopicsDataLoadController'
      }).
      otherwise({  
        redirectTo: '/Home'
      });
  }]);
 
//
mainApp.controller('homePageLoadController', function ($scope, $http) {
//  $http.get('json/physics_sub.json').success(function(data) {
//    $scope.subjects = data;
//  });

});