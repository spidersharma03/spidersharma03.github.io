/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
'use strict';

var mainApp = angular.module('mainApp', ['ngRoute']);
  
mainApp.config(['$routeProvider',
  function($routeProvider) {
    $routeProvider.
      when('/Home', {
        templateUrl: 'partials/homePage.html'
        //controller: 'AddOrderController'
      }).
      when('/Explore', {
         templateUrl: 'partials/homePage.html'
      }).
      when('/Physics', {
        templateUrl: 'partials/homePage.html',
        controller: 'AddOrderController'
      }).
      otherwise({
         templateUrl: 'partials/homePage.html'
  
        //redirectTo: '/Home'
      });
  }]);

 mainApp.controller('AddOrderController', function($scope) {
     
    $scope.message = 'This is Add new order screen';
     
});