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
      when('/Physics', {
         templateUrl: 'partials/PhysicsPage.html',
         controller: 'SubjectsLoadController'
      }).
      when('/:subCategory', {
         templateUrl: 'partials/MechanicsPage.html',
         controller: 'TopicsLoadController'
      }).
      when('/:subCategory/:Topic', {
         templateUrl: 'partials/TopicsPage.html',
         controller: 'SubTopicsLoadController'
      }).
      otherwise({  
        redirectTo: '/Home'
      });
  }]);
 
//
mainApp.controller('homePageLoadController', function ($scope, $http) {
  $http.get('json/physics_sub.json').success(function(data) {
    $scope.subjects = data;
  });

});