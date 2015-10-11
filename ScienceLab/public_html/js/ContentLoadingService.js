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
    
    contentApi.getSubTopicQuestions = function(category, subcategory, subtopic) {
      return $http({
        method: 'get', 
        url: 'json/' + category + '/' + subcategory + '/'  + "questions" + '/'+ subtopic + '.json'
      });
    };
    
    return contentApi;
  });
  
  angular.module('ContentSharingService', [])
    .service('sharedProperties', function () {
        var property = '';
        var propertyName ='';
        var propertyKeyMap = [];
        return {
            getProperty: function () {
                return property;
            },
            setProperty: function(value) {
                property = value;
            },
            addPropertyValue: function(key, value) {
                propertyKeyMap[key] = value;
            },
            getPropertyValue: function(key) {
                return propertyKeyMap[key];
            },
            setPropertyName: function(name) {
                propertyName = name;
            },
            getPropertyName: function(name) {
                return propertyName;
            }
        };
    });