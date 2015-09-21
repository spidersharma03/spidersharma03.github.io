/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
'use strict';

/*
 * This module is responsible for all the routing.
 */
var mainApp = angular.module('mainApp', ['ngRoute', 'DataLoadControllers', 'ContentLoadingService', 'ContentSharingService']).config(['$routeProvider',
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
      when('/Question/:simulationPageName/:simulationName', {
        templateUrl: 'partials/QuestionPage.html',
        controller: 'QuestionDataLoadController'
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
//      when('/:subjectID/:subjectCategory/:Topic/:SubTopic', { // this is for loading topics in a category.( ex kinematics, oscillations in mechanics)
//         templateUrl: 'partials/TopicsPage.html',
//         controller: 'SubTopicsDataLoadController'
//      }).
      otherwise({  
        redirectTo: '/Home'
      });
  }]);
 
//
mainApp.controller('homePageLoadController', function ($scope, $http, $route) {
        $scope.logged_in = false;
        $scope.login_emptyEmail = false;
        $scope.login_emptyPassword = false;
        $scope.login_invalidUserOrPassword = false;
        
        $scope.register_emptyName = false;
        $scope.register_emptyEmail = false;
        $scope.register_emptyPassword = false;
        $scope.register_InvalidEmail = false;
        if (typeof Parse !== 'undefined') {
             Parse.initialize("PgyTYm43FjxpiZxtN0GrtTxQjH7wCbHkt2ThVOz9", "HFcHZI8e1v62Avmbd4LvpELWDoLL0IecD3ZbvGVB");        
            var currentUser = Parse.User.current();
            if( currentUser ) {
                $scope.logged_in = true;
                $scope.currentUserName = "Welcome " + currentUser.get("username");
            }
        }
        $scope.logInPressed = function() {
           $scope.login_invalidUserOrPassword = false; 
        };
        
        $scope.registerPressed = function() {
            $scope.register_emptyName = false;
            $scope.register_emptyEmail = false;
            $scope.register_emptyPassword = false;
            $scope.register_InvalidEmail = false;
            $('#LoginModal').modal('hide');
            $('#RegisterModal').modal('show');
        };
        $scope.signInPressed = function() {
            $scope.emptyPassword = false;
            $scope.emptyEmail = false;
            $('#LoginModal').modal('show');
            $('#RegisterModal').modal('hide');
        };
        $scope.logOutPressed = function() {
            Parse.User.logOut();
            $scope.logged_in = false;
            //$scope.$apply();
        };
        
        $scope.registerEvent = function() {
            return;
            var nameField = document.getElementById("register_name").value;
            var emailField = document.getElementById("register_email").value;
            var pwField = document.getElementById("register_password").value;
             if(nameField.length === 0) {
                 $scope.register_emptyName = false;
                 $scope.register_emptyEmail = true;
                 $scope.register_emptyPassword = false;
                 $scope.register_InvalidEmail = false;
                 $('#register_name').focus();
                 return;
            }
            if(nameField.length !== 0 && emailField.length === 0) {
                 $scope.register_emptyName = false;
                 $scope.register_emptyEmail = true;
                 $scope.register_emptyPassword = false;
                 $scope.register_InvalidEmail = false;
                 $('#register_email').focus();
                 return;
            }
            if( emailField.length !== 0 && pwField.length === 0) {
                 $scope.register_emptyName = false;
                 $scope.register_emptyEmail = false;
                 $scope.register_emptyPassword = true;
                 $scope.register_InvalidEmail = false;
                 $('#register_password').focus();
                 return;
            }
            if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(emailField))  
            {  
                $scope.register_InvalidEmail = false;
                // email is valid, proceed
                var user = new Parse.User();
                user.set("username", nameField);
                user.set("password", pwField);
                user.set("email", emailField);

                user.signUp(null, {
                  success: function(user) {
                     // registered successfully, 
                     $('#RegisterModal').modal('hide');
                  },
                  error: function(user, error) {
                    // Show the error message somewhere and let the user try again.
                    alert("Error: " + error.code + " " + error.message);
                  }
                });
                
            }else {
               $scope.register_InvalidEmail = true;
            }
            $scope.register_emptyName = false;
            $scope.register_emptyEmail = false;
            $scope.register_emptyPassword = false;
        };
        
        $scope.fbloginEvent = function() {
              window.fbAsyncInit = function() {
                Parse.FacebookUtils.init({ // this line replaces FB.init({
                  appId      : '1464553603854000', // Facebook App ID
                  status     : true,  // check Facebook Login status
                  cookie     : true,  // enable cookies to allow Parse to access the session
                  xfbml      : true,  // initialize Facebook social plugins on the page
                  version    : 'v2.4' // point to the latest Facebook Graph API version
                });
                alert("Facebook Entered!"); 
                Parse.FacebookUtils.logIn(null, {
                success: function(user) {
                   alert("Facebook Entered!" + user); 
                  if (!user.existed()) {
                      $('#LoginModal').modal('hide');
                      $scope.logged_in = true;
                      $scope.$apply();
                      alert("User signed up and logged in through Facebook!");
                  } else {
                     $('#LoginModal').modal('hide');
                     $scope.logged_in = true;
                     $scope.$apply();
                     alert("User logged in through Facebook!");
                  }
                },
                error: function(user, error) {
                  alert("User cancelled the Facebook login or did not fully authorize.");
                }
              });
                    // Run code after the Facebook SDK is loaded.
              };

                (function(d, s, id){
              var js, fjs = d.getElementsByTagName(s)[0];
              if (d.getElementById(id)) {return;}
              js = d.createElement(s); js.id = id;
              js.src = "//connect.facebook.net/en_US/sdk.js";
              fjs.parentNode.insertBefore(js, fjs);
            }(document, 'script', 'facebook-jssdk'));
        }
        
        $scope.loginEvent = function() {
            var usernameField = document.getElementById("username").value;
            var pwField = document.getElementById("password").value;
            if(usernameField.length === 0) {
                 $scope.emptyPassword = false;
                 $scope.emptyEmail = true;
                 $('#email').focus();
                 return;
            }
            if( usernameField.length !== 0 && pwField.length === 0) {
                 $scope.emptyEmail = false;
                 $scope.emptyPassword = true;
                 $('#password').focus();
                 return;
            }
            if (typeof Parse !== 'undefined') {
                Parse.User.logIn(usernameField, pwField, {
                success: function(user) {
                  // Do stuff after successful login.
                  $('#LoginModal').modal('hide');
                  $scope.logged_in = true;
                  $scope.currentUserName = "Welcome " + user.get("username");
                  $scope.$apply();
                  $route.reload();
                },
                error: function(user, error) {
                  // The login failed.
                  $scope.login_invalidUserOrPassword = true;
                  $scope.$apply();
                }
            });
            }
        };
        
        if($scope.logged_in) {
        }        
});

mainApp.controller('TestController', function($scope){
    
    $scope.OnKinematicsTabClick = function(tabName) {
        $scope.KinematicsTabName = tabName;
        if(tabName === "Graph") {
            var parentdiv = document.getElementById("content");
            var w = parentdiv.offsetWidth;
            $scope.graph.resize(w,100);
        }
    };
    
    window.onSimFrameLoad = function()
    {
        $scope.KinematicsTabName = "Kinematics";
        $scope.$apply();
        var div = document.getElementById('Kinematics_Input_Graph');
        
        $scope.graphMouseDown = function(event, g, context) {
           var l = 0;
           var graphPos = Dygraph.findPos(g.graphDiv);
           var canvasx = Dygraph.pageX(event) - graphPos.x;
           var canvasy = Dygraph.pageY(event) - graphPos.y;
           var coord = $scope.graph.eventToDomCoords(event);
           var x = $scope.graph.toDataXCoord(coord[0]);
           var y = $scope.graph.toDataXCoord(coord[1]);
           l++;
        };
        
        $scope.graph = new Dygraph(div,
                 // For possible data formats, see http://dygraphs.com/data.html
                 // The x-values could also be dates, e.g. "2012/03/15"
                 "X,Y\n" +
                 "0,0.0\n" +
                 "0.1,0.1\n" +
                 "0.2,0.2\n" +
                 "0.3,0.3\n" +
                 "0.4,0.4\n" +
                 "0.5,0.5\n" +
                 "0.6,0.6\n" +
                 "0.7,0.7\n" +
                 "0.8,0.8\n" +
                 "0.9,0.9\n" +
                 "1.0,1.0\n",
                 {
                     dateWindow:[0,1.5],
                     legend: 'always',
                     animatedZooms: true,
                     drawGrid:false,
//                     interactionModel:{
//                        'mousedown':$scope.graphMouseDown
//                     },
                     underlayCallback: function(canvas, area, g) {
                        var coords = g.toDomCoords(0.1, 0);
                        //var left = bottom_left[0];
                        //var right = top_right[0];
                        var splitX = coords[0];
                        var splitY = coords[1];

                // The drawing area doesn't start at (0, 0), it starts at (area.x, area.y).
                // That's why we subtract them from splitX and splitY. This gives us the
                // actual distance from the upper-left hand corder of the graph itself.
                        var leftSideWidth = splitX - area.x;
                        var rightSideWidth = area.w - leftSideWidth;
                        var topHeight = splitY - area.y;
                        var bottomHeight = area.h - topHeight;

                        canvas.fillStyle = 'lightblue';
                        canvas.fillRect(area.x, area.y, leftSideWidth, topHeight/2);
                
                        canvas.beginPath();
                        canvas.arc(area.x + leftSideWidth, area.y + topHeight/2, 5, 0, 2 * Math.PI);
                        canvas.fillStyle = "red";
                        canvas.fill();
                      }
                 });
    };
    window.onGraphFrameLoad = function()
    {
            var iframe = document.getElementById('IFrameGraph');
            var innerDocGraph = iframe.contentDocument || iframe.contentWindow.document;
            var iframe = document.getElementById('IFrame');
            var innerDocSim = iframe.contentDocument || iframe.contentWindow.document;
            innerDocSim.modelGraph = innerDocGraph.modelGraph;
    };
});

mainApp.directive('iframeSetDimentionsOnload', [function(){
return {
    restrict: 'A',
    link: function(scope, element, attrs){
        element.on('load', function(){
               var iFrameHeight = element[0].contentWindow.document.body.scrollHeight + 'px';
//               element[0].contentWindow.onWindowResize();
               var iFrameWidth = '100%';
               return;
               element.css('width', iFrameWidth);
               element.css('height', iFrameHeight);
        });
    }
};}]);

mainApp.directive('graph', function() {
    var directive = {};
    directive.restrict = 'E'; /* restrict this directive to elements */

    directive.compile = function(element, attributes) {
        // do one-time configuration of element.
        var linkFunction = function($rootScope, $scope, element, atttributes) {            
            //$scope.$apply();
        };
        return linkFunction;
    };
    return directive;
}); 