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
      when('/Labs', {
        templateUrl: 'labs/kinematics_1d/preview/previewSimulationPage.html',
        controller: 'Kinematic1dViewController'
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
        return;
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
                
                var Simulation = Parse.Object.extend("Simulation");
                var query = new Parse.Query(Simulation);
                var currentUserEmail = currentUser.get("email");
                query.equalTo("UserId", currentUserEmail);
                query.find({
                  success: function(results) {
                    // Do something with the returned Parse.Object values
                    for (var i = 0; i < results.length; i++) {
                      var object = results[i];
                      var userId = object.get("UserId");
                      var labInfo = object.get("SceneInfo");
                    }
                  },
                  error: function(error) {
                    alert("Error: " + error.code + " " + error.message);
                  }
                });
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
        };
        
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

mainApp.controller('TestController', function($scope,sharedProperties){
    $scope.data = {
       selectedSplineGraphInputType : 0,
       selectedGraphType : 3,
       selectedProbeType : 0,
       
       // Math expression
       mathExpression:"",
       mathExpressionSyntaxError:false,
       // Simulation Data
       playPauseButtonState:"Play",
       
       // Object Data
       selectedStateType:3,
       
       positionValue:0,
       velocityValue:0,
       accelerationValue:1,
       nameTag:"Kinematics Body",
       accelerationArrowVisibility:false,
       velocityArrowVisibility:false,
       positionTextVisibility:true,
       velocityTextVisibility:true,
       accelerationTextVisibility:true
    };
    // Publish Options
    $scope.publishOptions = {
       publishError:false, 
       publishErrorMessage:"",
       splineGraphWidth:0,
       selectedInputType:"Kinematics",
       selectedGraphOption:0,
       selectedViewType:"View3D",
       type_time_Selected:[true, false, false],
       pos_time_Selected:true,
       vel_time_Selected:false,
       acc_time_Selected:false,
       valueProbeSelected:true,
       tangentProbeSelected:false,
       areaProbeSelected:false,
       chordProbeSelected:false
    };
    sharedProperties.setProperty($scope.publishOptions);
    
    $scope.selectedInputTypeChanged = function() {
        $scope.publishErrorCheck();
    };
    
    $scope.publishErrorCheck = function() {
        if( $scope.KinematicsTabName !== $scope.publishOptions.selectedInputType) {
            $scope.publishOptions.publishError = true;
            $scope.publishOptions.publishErrorMessage = "Mismatch between selected Input Type";
        } else {
            $scope.publishOptions.publishError = false;
        }
    };
    
    $scope.OnProbeChanged = function() {
        
    };
    
    $scope.positionValueChanged = function() {
        var iframe = document.getElementById('IFrame');
        if(iframe.contentWindow.lab !== undefined) {
             var model = iframe.contentWindow.lab.tracks[0].body;
             model.position.x = Number($scope.data.positionValue);
             iframe.contentWindow.lab.syncViews();
        }
    };
    
    $scope.velocityValueChanged = function() {
        var iframe = document.getElementById('IFrame');
        if(iframe.contentWindow.lab !== undefined) {
             var model = iframe.contentWindow.lab.tracks[0].body;
             model.velocity.x = Number($scope.data.velocityValue);
             iframe.contentWindow.lab.syncViews();
        }
    };
    
    $scope.accelerationValueChanged = function() {
        var iframe = document.getElementById('IFrame');
        if(iframe.contentWindow.lab !== undefined) {
             var model = iframe.contentWindow.lab.tracks[0].body;
             model.acceleration.x = Number($scope.data.accelerationValue);
             iframe.contentWindow.lab.syncViews();
        }
    };
    
    $scope.selectedStateTypeChanged = function() {
        var iframe = document.getElementById('IFrame');
        if(iframe.contentWindow.lab !== undefined) {
            var selectedStateNumber = Number($scope.data.selectedStateType);
            if(selectedStateNumber === 3) { // User defined
                $scope.data.positionValue = 0;
                $scope.data.velocityValue = 1;
                $scope.data.accelerationValue = 0;
            }
            else {
                var state = iframe.contentWindow.lab.states[selectedStateNumber];
                iframe.contentWindow.lab.tracks[0].setBodyState(state);
                $scope.data.positionValue = state.position;
                $scope.data.velocityValue = state.velocity;
                $scope.data.accelerationValue = state.acceleration;
            }
            iframe.contentWindow.lab.syncViews();
        }
    };
    
    $scope.OnResetPressed = function() {
        var iframe = document.getElementById('IFrame');
        if(iframe.contentWindow.lab !== undefined) {
            iframe.contentWindow.lab.resetSimulation();
            $scope.data.playPauseButtonState = "Play";
        }
    },
    
    $scope.OnPlayPauseButtonPressed = function() {
        var iframe = document.getElementById('IFrame');
        if( $scope.data.playPauseButtonState === "Play") {
            if(iframe.contentWindow.lab !== undefined) {
                iframe.contentWindow.lab.playSimulation(true);
            }
            $scope.data.playPauseButtonState = "Pause";
        } else {
            if(iframe.contentWindow.lab !== undefined) {
                iframe.contentWindow.lab.playSimulation(false);
            }
            $scope.data.playPauseButtonState = "Play";
        }
    };
    
    $scope.OnNameChanged = function() {
        var iframe = document.getElementById('IFrame');
        if(iframe.contentWindow.lab !== undefined) {
            var model = iframe.contentWindow.lab.tracks[0].body;
            model.updateTag("textTag", "text", $scope.data.nameTag);
            iframe.contentWindow.lab.syncText2DView();
        }
    };
    
    $scope.OnAccelerationArrowVisibilityChanged = function() {
        var iframe = document.getElementById('IFrame');
        if(iframe.contentWindow.lab !== undefined) {
            var model = iframe.contentWindow.lab.tracks[0].body;
            iframe.contentWindow.kinematics3DView.setAccelerationArrowVisibility(model, $scope.data.accelerationArrowVisibility);
        }
    };
    
    $scope.OnVelocityArrowVisibilityChanged = function() {
        var iframe = document.getElementById('IFrame');
        if(iframe.contentWindow.lab !== undefined) {
            var model = iframe.contentWindow.lab.tracks[0].body;
            iframe.contentWindow.kinematics3DView.setVelocityArrowVisibility(model, $scope.data.velocityArrowVisibility);
        }
    };
    
    $scope.OnPositionTextVisibilityChanged = function() {
        var iframe = document.getElementById('IFrame');
        if(iframe.contentWindow.lab !== undefined) {
            var model = iframe.contentWindow.lab.tracks[0].body;
            iframe.contentWindow.textViewObserver.setVisible(model.id, "positionTag",$scope.data.positionTextVisibility);
        }
    };
    
    $scope.OnVelocityTextVisibilityChanged = function() {
        var iframe = document.getElementById('IFrame');
        if(iframe.contentWindow.lab !== undefined) {
            var model = iframe.contentWindow.lab.tracks[0].body;
            iframe.contentWindow.textViewObserver.setVisible(model.id, "velocityTag",$scope.data.velocityTextVisibility);
        }
    };
    
    $scope.OnAccelerationTextVisibilityChanged = function() {
        var iframe = document.getElementById('IFrame');
        if(iframe.contentWindow.lab !== undefined) {
            var model = iframe.contentWindow.lab.tracks[0].body;
            iframe.contentWindow.textViewObserver.setVisible(model.id, "accelerationTag",$scope.data.accelerationTextVisibility);
        }
    };
    
    $scope.selectedSplineGraphInputTypeChanged = function() {
        $scope.splineGraph.curveType = Number($scope.data.selectedSplineGraphInputType);
    };
    
    $scope.selectedProbeTypeChanged = function(){
        var selectedProbeType = Number($scope.data.selectedProbeType);
        $scope.modelGraph.customGraphOperations.changeProbeType(selectedProbeType);
    };
    
    $scope.selectedGraphTypeChanged = function(){
        var selectedType = Number($scope.data.selectedGraphType);
        $scope.modelGraph.customGraphOperations.changeGraphType(selectedType);
        if(selectedType === 3) {
           for(var i=0; i<3; i++) {
                $scope.modelGraph.setSeriesVisibility(i, true);
            }
        }
       else {
            for(var i=0; i<3; i++) {
                var bVisible = (i === selectedType) ? true : false;
                $scope.modelGraph.setSeriesVisibility(i, bVisible);
            }
        }
        $scope.modelGraph.hairlines.type = selectedType;
    };
    
    $scope.OnMathExpressionChanged = function() {
        $scope.data.mathExpressionSyntaxError = !$scope.mathInput.setExpression($scope.data.mathExpression);
    };
    
    $scope.OnKinematicsTabClick = function(tabName) {
        $scope.KinematicsTabName = tabName;
        var iframe = document.getElementById('IFrame');
        var lab = iframe.contentWindow.lab;
            
        if(tabName === "Graph") {
            var parentdiv = document.getElementById("content");
            var w = parentdiv.offsetWidth;
            $scope.splineGraph.graph.resize(w,200);
            if(lab !== undefined) {
                lab.setGraphInput($scope.splineGraph);
            }
        }
        else if( tabName === "Kinematics") {
            if(lab !== undefined) {
                lab.setGraphInput(null);
            }
        }
        else if( tabName === "Math") {
            if(lab !== undefined) {
                lab.setGraphInput(null);
                lab.setMathInput($scope.mathInput);
            }
        }
        $scope.publishErrorCheck();
    };
    
    $scope.OnPreviewPressed = function() {
        $('#PublishOptionsModel').modal('hide');
        var iframe = document.getElementById("IFrameEditor");
        var html = iframe.contentWindow.Preview.preview.innerHTML;
        $scope.publishOptions.previewHTML = html;
    };
    
    $scope.OnPublishPressed = function() {
        $('#PublishOptionsModel').modal('hide');
        
        
        var currentUser = Parse.User.current();
        if( currentUser ) {
            var currentUserEmail = currentUser.get("email");
            var Simulation = Parse.Object.extend("Simulation");
            var query = new Parse.Query(Simulation);
            var currentUserEmail = currentUser.get("email");
            query.equalTo("UserId", currentUserEmail);
            var numSimsForCurrentUser = 0;
            query.find({
              success: function(results) {
                    numSimsForCurrentUser = results.length;
                    if( numSimsForCurrentUser > 1) {
                        alert("You have exceeded the limit to publish more!");
                        return;
                    }
                    $scope.publishSimulation(currentUser);
              },
              error: function(error) {
                alert("Error: " + error.code + " " + error.message);
              }
            });
        }
    };
    
    $scope.publishSimulation = function(currentUser) {
        var Simulation = Parse.Object.extend("Simulation");
        var simulation = new Simulation();
        var currentUserEmail = currentUser.get("email");
        simulation.set("UserId", currentUserEmail);
        
        var iframe = document.getElementById('IFrame');
        var lab = iframe.contentWindow.lab;
        var labJson = lab.getAsJSON();
        simulation.set("LabInfo", labJson);
        simulation.save(null, {
            success: function(simulation) {
              alert('New object created with objectId: ' + simulation.id);
            },
            error: function(simulation, error) {
              alert('Failed to create new object, with error code: ' + error.message);
            }
        });
    };
    
    window.onSimFrameLoad = function()
    {
      $scope.KinematicsTabName = "Kinematics";
      $scope.$apply();
      var div = document.getElementById('Kinematics_Input_Graph');
      var splineGraph = new SplineGraph(div); 
      $scope.splineGraph = splineGraph;
      $scope.mathInput = new MathInput(); 
    };
    window.onGraphFrameLoad = function()
    {
            var iframe = document.getElementById('IFrameGraph');
            var innerDocGraph = iframe.contentDocument || iframe.contentWindow.document;
            var iframe = document.getElementById('IFrame');
            var innerDocSim = iframe.contentDocument || iframe.contentWindow.document;
            innerDocSim.modelGraph = innerDocGraph.modelGraph;
            $scope.modelGraph = innerDocSim.modelGraph;
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