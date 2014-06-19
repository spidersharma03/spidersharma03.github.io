/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


'use strict';

var _contentLoadingService = angular.module('contentLoadingService', []);

_contentLoadingService.factory('contentLoadingServiceAPI', function($http) {

    var contentApi = {};

    contentApi.getSubjectCategories = function(subject) {
      return $http({
        method: 'get', 
        url: 'json/' + subject + '.json'
      });
    };
    
    contentApi.getSubCategories = function(category) {
      return $http({
        method: 'get', 
        url: 'json/' + category + '.json'
      });
    };
    
    contentApi.getTopics = function(subcategory) {
      return $http({
        method: 'get', 
        url: 'json/' + subcategory + '.json'
      });
    };
    
    return contentApi;
  });