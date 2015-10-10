/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

controllers.controller('loginPageLoadController', function ($scope, $http, $route) {
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
            if(currentUser) {
                $scope.logged_in = true;
                $scope.currentUserName = "Welcome " + currentUser.get("username"); 
            }
            //$scope.loadSimulationMetaData();
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

