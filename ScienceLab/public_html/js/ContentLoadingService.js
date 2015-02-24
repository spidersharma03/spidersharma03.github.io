/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/*
 * This module is responsible for loading the data using $http service.
 */

'use strict';

var _contentLoadingService = angular.module('ContentLoadingService', []);

_contentLoadingService.factory('contentLoadingServiceAPI', function($http) {

    var contentApi = {};

    contentApi.getSubjects = function() {
      return $http({
        method: 'get',
        url: 'json/subjects' + '.json1'
      });
    };
    
    contentApi.getSubCategories = function(category) {
      return $http({
        method: 'get', 
        url: 'json/' + category + '/' + category + '.json'
      });
    };
    
    contentApi.getTopics = function(category, subcategory) {
      return $http({
        method: 'get', 
        url: 'json/' + category + '/' + subcategory + '/' + subcategory + '.json'
      });
    };
    
    contentApi.getSubTopics = function(category, subcategory, topic) {
      return $http({
        method: 'get', 
        url: 'json/' + category + '/' + subcategory + '/'  + topic + '.json'
      });
    };
    
    return contentApi;
  });