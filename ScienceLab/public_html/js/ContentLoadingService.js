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
        url: 'json/subjects' + '.json'
      });
    };
    
    contentApi.getSubCategories = function(category) {
      return $http({
        method: 'get', 
        url: 'json/' + category + '_sub.json'
      });
    };
    
    contentApi.getTopics = function(subcategory) {
      return $http({
        method: 'get', 
        url: 'json/' + subcategory + '_topics.json'
      });
    };
    
    contentApi.getSubTopics = function(topic) {
      return $http({
        method: 'get', 
        url: 'json/' + topic + '_subtopic.json'
      });
    };
    
    return contentApi;
  });