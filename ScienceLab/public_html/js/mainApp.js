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
    function ($routeProvider) {
        $routeProvider.
                when('/Home', {
                    templateUrl: 'partials/homePage.html',
                    controller: 'loginPageLoadController'
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
                    templateUrl: 'partials/labPage.html',
                    controller: 'Kinematics1dLabController'
                }).
                when('/PublishedView', {
                    templateUrl: 'labs/kinematics_1d/preview/labPage.html'
                            //controller: 'Kinematics1dLabController'
                }).
                when('/Profile', {
                    templateUrl: 'partials/userProfilePage.html',
                    controller: 'userProfilePageLoadController'
                }).
                when('/Question/:simulationPageName/:simulationName', {
                    templateUrl: 'partials/QuestionPage.html',
                    controller: 'QuestionDataLoadController'
                }).
                when('/:subjectID', {// this is for loading subject.( ex: physics,mathematics etc)
                    templateUrl: 'partials/SubjectPage.html',
                    controller: 'SubjectsLoadController'
                }).
                when('/:subjectID/:subjectCategory', {// this is for loading sub category in a subject.( ex mechanics,optics in physics)
                    templateUrl: 'partials/SubjectCategoryPage.html',
                    controller: 'TopicsLoadController'
                }).
                when('/:subjectID/:subjectCategory/:Topic', {// this is for loading topics in a category.( ex kinematics, oscillations in mechanics)
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
mainApp.controller('homePageLoadController', function ($scope, $http, $route, sharedProperties) {
    $scope.logged_in = false;
    $scope.login_emptyEmail = false;
    $scope.login_emptyPassword = false;
    $scope.login_invalidUserOrPassword = false;

    $scope.register_emptyName = false;
    $scope.register_emptyEmail = false;
    $scope.register_emptyPassword = false;
    $scope.register_InvalidEmail = false;

    $scope.loadSimulationMetaData = function () {

    };

    $scope.OnLabMenuPressed = function () {
        sharedProperties.addPropertyValue('SceneLoadType', 'SceneLoadNew');
    };
    
    if (typeof Parse !== 'undefined') {
        Parse.initialize("PgyTYm43FjxpiZxtN0GrtTxQjH7wCbHkt2ThVOz9", "HFcHZI8e1v62Avmbd4LvpELWDoLL0IecD3ZbvGVB");
        var currentUser = Parse.User.current();
        if (currentUser) {
            $scope.logged_in = true;
            $scope.currentUserName = "Welcome " + currentUser.get("username");

            var Simulation = Parse.Object.extend("Simulation");
            var query = new Parse.Query(Simulation);
            var currentUserEmail = currentUser.get("email");
            query.equalTo("userid", currentUserEmail);
            query.find({
                success: function (results) {
                    // Do something with the returned Parse.Object values
                    for (var i = 0; i < results.length; i++) {
                        var object = results[i];
                        var userId = object.get("userid");
                        var labInfo = object.get("LabInfo");
                    }
                },
                error: function (error) {
                    alert("Error: " + error.code + " " + error.message);
                }
            });
        }
    }
    $scope.logInPressed = function () {
        $scope.login_invalidUserOrPassword = false;
    };

    $scope.registerPressed = function () {
        $scope.register_emptyName = false;
        $scope.register_emptyEmail = false;
        $scope.register_emptyPassword = false;
        $scope.register_InvalidEmail = false;
        $('#LoginModal').modal('hide');
        $('#RegisterModal').modal('show');
    };
    $scope.signInPressed = function () {
        $scope.emptyPassword = false;
        $scope.emptyEmail = false;
        $('#LoginModal').modal('show');
        $('#RegisterModal').modal('hide');
    };
    $scope.logOutPressed = function () {
        Parse.User.logOut();
        $scope.logged_in = false;
        //$scope.$apply();
    };

    $scope.registerEvent = function () {
        var nameField = document.getElementById("register_name").value;
        var emailField = document.getElementById("register_email").value;
        var pwField = document.getElementById("register_password").value;
        if (nameField.length === 0) {
            $scope.register_emptyName = false;
            $scope.register_emptyEmail = true;
            $scope.register_emptyPassword = false;
            $scope.register_InvalidEmail = false;
            $('#register_name').focus();
            return;
        }
        if (nameField.length !== 0 && emailField.length === 0) {
            $scope.register_emptyName = false;
            $scope.register_emptyEmail = true;
            $scope.register_emptyPassword = false;
            $scope.register_InvalidEmail = false;
            $('#register_email').focus();
            return;
        }
        if (emailField.length !== 0 && pwField.length === 0) {
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
                success: function (user) {
                    // registered successfully, 
                    $('#RegisterModal').modal('hide');
                },
                error: function (user, error) {
                    // Show the error message somewhere and let the user try again.
                    alert("Error: " + error.code + " " + error.message);
                }
            });

        } else {
            $scope.register_InvalidEmail = true;
        }
        $scope.register_emptyName = false;
        $scope.register_emptyEmail = false;
        $scope.register_emptyPassword = false;
    };

    $scope.fbloginEvent = function () {
        window.fbAsyncInit = function () {
            Parse.FacebookUtils.init({// this line replaces FB.init({
                appId: '1464553603854000', // Facebook App ID
                status: true, // check Facebook Login status
                cookie: true, // enable cookies to allow Parse to access the session
                xfbml: true, // initialize Facebook social plugins on the page
                version: 'v2.4' // point to the latest Facebook Graph API version
            });
            alert("Facebook Entered!");
            Parse.FacebookUtils.logIn(null, {
                success: function (user) {
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
                error: function (user, error) {
                    alert("User cancelled the Facebook login or did not fully authorize.");
                }
            });
            // Run code after the Facebook SDK is loaded.
        };

        (function (d, s, id) {
            var js, fjs = d.getElementsByTagName(s)[0];
            if (d.getElementById(id)) {
                return;
            }
            js = d.createElement(s);
            js.id = id;
            js.src = "//connect.facebook.net/en_US/sdk.js";
            fjs.parentNode.insertBefore(js, fjs);
        }(document, 'script', 'facebook-jssdk'));
    };

    $scope.loginEvent = function () {
        var usernameField = document.getElementById("username").value;
        var pwField = document.getElementById("password").value;
        if (usernameField.length === 0) {
            $scope.emptyPassword = false;
            $scope.emptyEmail = true;
            $('#email').focus();
            return;
        }
        if (usernameField.length !== 0 && pwField.length === 0) {
            $scope.emptyEmail = false;
            $scope.emptyPassword = true;
            $('#password').focus();
            return;
        }
        if (typeof Parse !== 'undefined') {
            Parse.User.logIn(usernameField, pwField, {
                success: function (user) {
                    // Do stuff after successful login.
                    $('#LoginModal').modal('hide');
                    $scope.logged_in = true;
                    $scope.currentUserName = "Welcome " + user.get("username");
                    $scope.$apply();
                    $route.reload();
                },
                error: function (user, error) {
                    // The login failed.
                    $scope.login_invalidUserOrPassword = true;
                    $scope.$apply();
                }
            });
        }
    };

    if ($scope.logged_in) {
    }
});

mainApp.directive('iframeSetDimentionsOnload', [function () {
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                element.on('load', function () {
                    var iFrameHeight = element[0].contentWindow.document.body.scrollHeight + 'px';
//               element[0].contentWindow.onWindowResize();
                    var iFrameWidth = '100%';
                    return;
                    element.css('width', iFrameWidth);
                    element.css('height', iFrameHeight);
                });
            }
        };
    }]);


mainApp.directive('splinegraph', function () {
    var directive = {};
    directive.restrict = 'E'; /* restrict this directive to elements */
//    directive.templateUrl = "labs/common/Scene_GraphView.html";
    directive.compile = function (element, attributes) {
        // do one-time configuration of element.
        var linkFunction = function ($scope, element, atttributes) {
            var div = document.getElementById('Kinematics_Input_Graph');
            var splineGraph = new SplineGraph(div, $scope.uiDataValues.graphInputData);
            $scope.setSplineGraph(splineGraph);
            if ($scope.publishDataValues.selectedInputType === "Graph") {
                $scope.lab.setGraphInput(splineGraph);
                $scope.$parent.splineGraph.graph.resize(400, 200);
            }
        }

        return linkFunction;
    };
    return directive;
});

mainApp.directive('markdowneditor', function () {
    var directive = {};
    directive.restrict = 'E'; /* restrict this directive to elements */
    directive.templateUrl = "labs/common/MarkDownEditor.html";
    directive.compile = function (element, attributes) {
        MathJax.Hub.Config({
            showProcessingMessages: false,
            tex2jax: { inlineMath: [['$','$'],['\\(','\\)']] },
            TeX: { equationNumbers: {autoNumber: "AMS"} }
          });
         marked.setOptions({
                renderer: new marked.Renderer(),
                gfm: true,
                tables: true,
                breaks: false,
                pedantic: false,
                sanitize: false, // IMPORTANT, because we do MathJax before markdown,
                //            however we do escaping in 'CreatePreview'.
                smartLists: true,
                smartypants: false
            });
        // do one-time configuration of element.
        var linkFunction = function ($scope, element, atttributes) {
           

            var Preview = {
                delay: 50, // delay after keystroke before updating

                preview: null, // filled in by Init below
                buffer: null, // filled in by Init below

                timeout: null, // store setTimout id
                mjRunning: false, // true when MathJax is processing
                oldText: null, // used to check if an update is needed

                //
                //  Get the preview and buffer DIV's
                //
                Init: function () {
                    this.preview = document.getElementById("marked-mathjax-preview");
                    this.buffer = document.getElementById("marked-mathjax-preview-buffer");
                    this.textarea = document.getElementById("marked-mathjax-input");
                    if( $scope.mode === 'Edit') {
                        $('#marked-mathjax-preview').removeClass('col-md-12');
                        $('#marked-mathjax-preview').addClass('col-md-6');
                        $('#marked-mathjax-preview-buffer').removeClass('col-md-12');
                        $('#marked-mathjax-preview-buffer').addClass('col-md-6');
                    }
                    else {
                        $('#marked-mathjax-preview').removeClass('col-md-6');
                        $('#marked-mathjax-preview').addClass('col-md-12');
                        $('#marked-mathjax-preview-buffer').removeClass('col-md-6');
                        $('#marked-mathjax-preview-buffer').addClass('col-md-12');
                    }
                },
                //
                //  Switch the buffer and preview, and display the right one.
                //  (We use visibility:hidden rather than display:none since
                //  the results of running MathJax are more accurate that way.)
                //
                SwapBuffers: function () {
                    var buffer = this.preview;
                    var preview = this.buffer;
                    this.buffer = buffer;
                    this.preview = preview;
                    buffer.style.display = "none";
                    buffer.style.position = "absolute";
                    preview.style.position = "";
                    preview.style.display = "";
                },
                //
                //  This gets called when a key is pressed in the textarea.
                //  We check if there is already a pending update and clear it if so.
                //  Then set up an update to occur after a small delay (so if more keys
                //    are pressed, the update won't occur until after there has been 
                //    a pause in the typing).
                //  The callback function is set up below, after the Preview object is set up.
                //
                Update: function () {
                    if (this.timeout) {
                        clearTimeout(this.timeout)
                    }
                    this.timeout = setTimeout(this.callback, this.delay);
                },
                //
                //  Creates the preview and runs MathJax on it.
                //  If MathJax is already trying to render the code, return
                //  If the text hasn't changed, return
                //  Otherwise, indicate that MathJax is running, and start the
                //    typesetting.  After it is done, call PreviewDone.
                //  
                CreatePreview: function () {
                    Preview.timeout = null;
                    if (this.mjRunning)
                        return;
                    var text = $scope.uiDataValues.inputText;
                    if (text === this.oldtext)
                        return;
                    text = this.Escape(text);                       //Escape tags before doing stuff
                    this.buffer.innerHTML = this.oldtext = text;
                    this.mjRunning = true;
                    MathJax.Hub.Queue(
                            ["Typeset", MathJax.Hub, this.buffer],
                            ["PreviewDone", this],
                            ["resetEquationNumbers", MathJax.InputJax.TeX]
                            );
                },
                //
                //  Indicate that MathJax is no longer running,
                //  do markdown over MathJax's result, 
                //  and swap the buffers to show the results.
                //
                PreviewDone: function () {
                    this.mjRunning = false;
                    var text = this.buffer.innerHTML;
                    // replace occurrences of &gt; at the beginning of a new line
                    // with > again, so Markdown blockquotes are handled correctly
                    text = text.replace(/^&gt;/mg, '>');
                    this.buffer.innerHTML = marked(text);
                    this.SwapBuffers();
                },
                Escape: function (html, encode) {
                    return html
                            .replace(!encode ? /&(?!#?\w+;)/g : /&/g, '&amp;')
                            .replace(/</g, '&lt;')
                            .replace(/>/g, '&gt;')
                            .replace(/"/g, '&quot;')
                            .replace(/'/g, '&#39;');
                },
                // The idea here is to perform fast updates. See http://stackoverflow.com/questions/11228558/let-pagedown-and-mathjax-work-together/21563171?noredirect=1#comment46869312_21563171
                // But our implementation is a bit buggy: flickering, bad rendering when someone types very fast.
                //
                // If you want to enable such buggy fast updates, you should 
                // add something like  onkeypress="Preview.UpdateKeyPress(event)" to textarea's attributes.
                UpdateKeyPress: function (event) {
                    if (event.keyCode < 16 || event.keyCode > 47) {
                        this.preview.innerHTML = '<p>' + marked(this.textarea.value) + '</p>';
                        this.buffer.innerHTML = '<p>' + marked(this.textarea.value) + '</p>';
                    }
                    this.Update();
                }

            };

//
//  Cache a callback to the CreatePreview action
//
            Preview.callback = MathJax.Callback(["CreatePreview", Preview]);
            Preview.callback.autoReset = true;  // make sure it can run more than once
            $scope.OnMarkDownEditorKeyUp = function () {
                Preview.Update();
            };

            $scope.Preview = Preview;
            $scope.$parent.Preview = Preview;
            Preview.Init();
            Preview.Update();
        };

        return linkFunction;
    };
    return directive;
});

mainApp.directive('graph', function () {
    var directive = {};
    directive.restrict = 'E'; /* restrict this directive to elements */
    directive.templateUrl = "labs/common/Scene_GraphView.html";
    directive.compile = function (element, attributes) {
        // do one-time configuration of element.
        var linkFunction = function ($scope, element, atttributes) {
            //$scope.$apply();
            var hairlines = new Dygraph.Plugins.Hairlines({
                divFiller: function (div, data) {
                    if (data.points.length === 0)
                        return;
                    var time = data.points[0].xval;
                    $('.hairline-legend', div).html("<span>t = " + time.toFixed(3) + "</span>")
                    return;
                    if (hairlines.type > 1) {
                        return;
                    }
                    var newpoints = [];
                    if (hairlines.type !== 3) {
                        newpoints.push(data.points[hairlines.type]);
                    }
                    else {
                        newpoints = data.points;
                    }
                    var html = Dygraph.Plugins.Legend.generateLegendHTML(
                            data.dygraph, data.hairline.xval, newpoints, 10);
                    $('.hairline-legend', div).html(html);
                    $(div).data({xval: data.hairline.xval});
                }
            });

            hairlines.type = 3;

            var options = {
                labels: ['t', 'x', 'v', 'a'],
                xlabel: 'Time',
                dateWindow: [0, 5],
//                valueRange:[0,15],
                ylabel: '  Position/Velocity/Acceleration',
                legend: 'follow',
                series: {
                    'x': {
                        strokeWidth: 1.0
                    },
                    'v': {
                    },
                    'a': {
                    }
                },
                yAxisLabelWidth: 20,
                axes: {
                    x: {
                        valueFormatter: function (val) {
                            return val.toFixed(3);
                        },
                        pixelsPerLabel: 25,
                        gridLinePattern: [4, 4]
                    },
                    y: {
                        pixelsPerLabel: 25,
                        gridLinePattern: [4, 4]
                    }
                },
                title: 'Kinematics',
                // Set the plug-ins in the options.
                plugins: [
                    hairlines
                ]
            };

            var div = document.getElementById("graphDiv");
            var modelGraph = new Model_Graph(div, options, 4);
            $scope.$parent.modelGraph = modelGraph;
            $scope.lab.addGraphObserver(modelGraph);
            modelGraph.hairlines = hairlines;
            modelGraph.labelDiv = document.getElementById("labels");
            var customGraphOperations = new CustomKinematicsGraphOperations(modelGraph);
            customGraphOperations.changeProbeType(0);
            modelGraph.customGraphOperations = customGraphOperations;
            if ($scope.$parent.onGraphInitialized) {
                $scope.$parent.onGraphInitialized();
            }
            $(hairlines).on('hairlineCreated', function (e) {
                var hl = this.get();
                if (hl.length > 2) {
                    hl.pop();
                    this.set(hl);
                }
            });

//            $(hairlines).on('hairlineMoved', customGraphOperations.hairlineProbeChanges);
            $(hairlines).on('hairlineMoved', function () {
                var hairlines = this.get();
                if ($scope.modelGraph.customGraphOperations.probeType === 2)
                    $scope.modelGraph.customGraphOperations.calculateAreas(hairlines);
                if ($scope.modelGraph.customGraphOperations.probeType === 3)
                    $scope.modelGraph.customGraphOperations.calculateAverageValues(hairlines);
            }
            );
        };

        return linkFunction;
    };
    return directive;
});

mainApp.directive('view3d', function () {
    var directive = {};
    directive.restrict = 'E'; /* restrict this directive to elements */

    directive.compile = function (element, attributes) {
        // do one-time configuration of element.
        var linkFunction = function ($scope, element, atttributes) {
            var div = element[0].parentNode;
            var lab;
            var jsonData = $scope.uiDataValues.labJSONData;
            var kinematics3DView = new Kinematics3DView(div, lab);
            $scope.$parent.kinematics3DView = kinematics3DView;
            var textViewObserver = new TextViewObserver(div);
            $scope.$parent.textViewObserver = textViewObserver;

            if (jsonData !== undefined) {
                lab = new Model_Kinematics1D_Lab(kinematics3DView, textViewObserver, jsonData);
                lab.addGraphObserver($scope.modelGraph);
                $scope.$parent.lab = lab;
                $scope.publishDataValues.lab = lab;
            }
            else
                lab = new Model_Kinematics1D_Lab(kinematics3DView, textViewObserver);

            kinematics3DView.kinematics_lab = lab;

            var requestAnimationFramecallBackId;
            var dt = 0.016;
            var textViewObserver;
            createModelAndView();
            if ($scope.$parent.onLabInitialized) {
                $scope.$parent.onLabInitialized();
            }

            $scope.$on('$destroy', function () {
                cancelAnimationFrame(requestAnimationFramecallBackId);
            });

            animate();
            function createModelAndView() {
                $scope.publishDataValues.lab = lab;
                $scope.$parent.lab = lab;
                lab.syncViews(); // first frame sync                
            }

            function syncSimulation()
            {
                // Update the lab
                lab.simulate(dt);
                updateTimeProgress();
                if(lab.isSimulationOver()) {
                    $('#PlayPauseButton').removeClass('fa-pause');
                    $('#PlayPauseButton').addClass('fa-play');
                }
            }

            function updateTimeProgress() {
                var timePrecent = lab.time / lab.timeWindow * 100;
                var timePercentString = timePrecent.toString() + "%";
                $("#TimeProgressBar").css("width", timePercentString);
            }

            function animate() {
                requestAnimationFramecallBackId = requestAnimationFrame(animate);
                //controls.update();
                syncSimulation();
                render();
            }

            function render() {
                kinematics3DView.render();
            }
        };
        return linkFunction;
    };
    return directive;
});


mainApp.directive('popover', function () {
    var directive = {};
    directive.restrict = 'E'; /* restrict this directive to elements */

    directive.compile = function (element, attributes) {
        // do one-time configuration of element.
        var linkFunction = function ($scope, $compile, element, atttributes) {
            //$scope.uiDataValues.InputTypeButtonState = !$scope.uiDataValues.InputTypeButtonState;
            var button = document.getElementById("PopOverButton");
            var newdiv = document.getElementById("MathInputDiv");
            //$scope.splineGraph.graph.resize(400,200);
            newdiv.style.zIndex = "1000";
            newdiv.style.visibility = 'visible';
            newdiv.style.position = 'absolute';
            newdiv.style.overflow = 'hidden';
            function getPos(el) {
                for (var lx = 0, ly = 0;
                        el !== null;
                        lx += el.offsetLeft, ly += el.offsetTop, el = el.offsetParent)
                    ;
                return {x: lx, y: ly};
            }
            newdiv.style.left = getPos(button).x - 200 + 'px';
            newdiv.style.top = getPos(button).y + button.offsetHeight * 2 + 'px';
            newdiv.style.display = 'inline';
            newdiv.style.backgroundColor = 'rgba(255,255,255,0.5)';
            newdiv.style.borderRadius = '10px';
        };
        return linkFunction;
    };
    return directive;
});