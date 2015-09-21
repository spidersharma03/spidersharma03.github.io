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
      var v4Active = false;
      var v4Canvas = null;
      var clickedPoint = null;
      
      function initSplineStuff() {
          var numPoints = 10;
          var numSplines = numPoints - 1;
          $scope.numDivisionsbetweenPoints = 10;
          $scope.splines = [];
          for ( var i = 0 ; i < numSplines ; i++){
              $scope.splines[i] = new CubicSpline();
          }
          var numTotalPoints = $scope.numDivisionsbetweenPoints * numSplines;
          $scope.sparsePoints = [];
          $scope.sparsePoints.push(0.5);
          var graphData = [];
          graphData.push([0.0,0.5,0.5]);
          for( var i=1; i<=numTotalPoints; i++) {
              var t = i/(numTotalPoints-1);
              var rand = (Math.random())*0.5;
              var val = (i%$scope.numDivisionsbetweenPoints) === 0 ? rand : null;
              if(val !== null) {
                  $scope.sparsePoints.push(val);
              }
              graphData.push([t,val,0.5]);
          }
          $scope.data = graphData;
          
          CalculateCubicSplineData($scope.sparsePoints);
          updateDensePointsInGraphData();
      }
      
      function updateDensePointsInGraphData() {
          var count = 0;
          for(var i=0; i<$scope.splines.length; i++) {
            var currentSpline = $scope.splines[i];
            for(var j=0; j<$scope.numDivisionsbetweenPoints; j++) {
                var t = j/($scope.numDivisionsbetweenPoints-1);
                var interpolatedVal = currentSpline.Value(t);
                var vals = $scope.data[count++];
                vals[2] = interpolatedVal;
            }
          }
          for(var i=0; i<$scope.data.length; i++) {
          }
          derivativeTest();
      }
      
      function derivativeTest() {
          for(var i=0; i<$scope.splines.length-1; i++) {
                var currentSpline = $scope.splines[i];
                var nextSpline = $scope.splines[i+1];
                var currentVal = currentSpline.Value(1);
                var nextVal = nextSpline.Value(0);
                var currentFirstDerivative = currentSpline.FirstDerivative(1);
                var nextFirstDerivative = currentSpline.FirstDerivative(0);
                var currentSecondDerivative = currentSpline.SecondDerivative(1);
                var nextSecondDerivative = currentSpline.SecondDerivative(0);
          }
      }
      
      function CalculateCubicSplineData(data) {            
            var D = [], y = [], rhs = [];
            for ( var i = 0 ; i < data.length ; i ++){
                y[i] = data[i];
            }
            for ( var i = 1 ; i < data.length - 1   ; i++){
                rhs[i] = 3 * ( y[i+1] - y[i-1] );
            }
            rhs[0] = 3 * ( y[1] - y[0]);
            rhs[data.length-1] = 3 * ( y[data.length-1] - y[data.length-2]);
            
            CubicSplineInterpolator.tridia_sl(rhs, D);
            CubicSplineInterpolator.findSplineCoeff($scope.splines, D, y);
      }
      
      function downV4(event, g, context) {
          context.initializeMouseDown(event, g, context);
          v4Active = true;
          moveV4(event, g, context); // in case the mouse went down on a data point.
        }
      
      function mouseMotion(event, g, context) {
          if(clickedPoint !== null) {
              var graphPos = Dygraph.findPos(g.graphDiv);
              var canvasx = Dygraph.pageX(event) - graphPos.x;
              var canvasy = Dygraph.pageY(event) - graphPos.y;
              var vals = $scope.data[clickedPoint];
              var newvals = g.toDataCoords(canvasx, canvasy);
               vals[1] = newvals[1];
               var index = Math.floor(clickedPoint/$scope.numDivisionsbetweenPoints);
               $scope.sparsePoints[index] = newvals[1];
               CalculateCubicSplineData($scope.sparsePoints);
               updateDensePointsInGraphData();
               $scope.graph.updateOptions({ 'file': $scope.data });
          }
      }
      
      function moveV4(event, g, context) {
          var RANGE = 7;
          if (v4Active) {
            var graphPos = Dygraph.findPos(g.graphDiv);
            var canvasx = Dygraph.pageX(event) - graphPos.x;
            var canvasy = Dygraph.pageY(event) - graphPos.y;

            var rows = g.numRows();
            for (var row = 0; row < rows; row++) {
              var date = g.getValue(row, 0);
              var x = g.toDomCoords(date, null)[0];
              var diff = Math.abs(canvasx - x);
              if (diff < RANGE) {
                for (var col = 1; col < 2; col++) {
                  var vals =  g.getValue(row, col);
                  if (vals == null) { 
                      continue; 
                  }
                  var y = g.toDomCoords(null, vals)[1];
                  var diff2 = Math.abs(canvasy - y);
                  if (diff2 < RANGE) {
                      clickedPoint = row;
                      return;
                  }
                }
              }
            }
          }
        }

      function upV4(event, g, context) {
          if (v4Active) {
            v4Active = false;
            clickedPoint = null;
          }
        }
        
      function drawV4(x, y) {
            var ctx = v4Canvas;

            ctx.strokeStyle = "#000000";
            ctx.fillStyle = "#FFFF00";
            ctx.beginPath();
            ctx.arc(x,y,5,0,Math.PI*2,true);
            ctx.closePath();
            ctx.stroke();
            ctx.fill();
          }

      initSplineStuff();
      
      $scope.graph = new Dygraph(div,
        $scope.data,
        {
             dateWindow:[-0.1,1.1],
             valueRange:[0,1],
             labels:['x', 'A', 'B'],
             series:{
                 'A':{
                     strokeWidth:0.0,
                     drawPoints:true,
                     pointSize:4,
                     highlightCircleSize:6   
                 },
                 'B':{
                     highlightCircleSize:3,
                     drawPoints:true,
                 }
             },
             legend: 'never',
             animatedZooms: true,
             drawGrid:false,
             interactionModel:{
                'mousedown' : downV4,
                'mousemove' : mouseMotion,
                'mouseup' : upV4,
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