/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

controllers.controller('userProfilePageLoadController', function ($scope, $http, $route, sharedProperties) {
    $scope.recentActivity = [];
    $scope.loadSimulationMetaData = function () {
        var SimulationMetaData = Parse.Object.extend("SimulationMetaData");
        var currentUser = Parse.User.current();
        var currentUserEmail = currentUser.get("email");
        var query = new Parse.Query(SimulationMetaData);
        query.equalTo("userid", currentUserEmail);
        query.limit(10);
        query.find({
            success: function (results) {
                // Do something with the returned Parse.Object values
                for (var i = 0; i < results.length; i++) {
                    var object = results[i];
                    var username = object.get("username");
                    var userid = object.get("userid");
                    var simname = object.get("simname");
                    var simtitle = object.get("simtitle");
                    var createdAt = object.get("createdAt");
                    var edited = object.get("edited");
                    var createdOrEdited = (edited === true) ? "Edited" : "Created";
                    $scope.recentActivity.push({createdOrEdited: createdOrEdited,userid:userid, username:username, simtitle:simtitle, simname:simname, createdAt:createdAt});
                }
                $scope.$apply();
            },
            error: function (error) {
                alert("Error: " + error.code + " " + error.message);
            }
        });
    };
    
    $scope.OnSimulationClicked = function(index) {
        sharedProperties.setProperty($scope.recentActivity[index].createdAt);
        sharedProperties.addPropertyValue("createdAt", $scope.recentActivity[index].createdAt);
        sharedProperties.addPropertyValue("userid", $scope.recentActivity[index].userid);
        sharedProperties.setPropertyName('SceneLoadFromServer');
    };
    
    $scope.OnEditPressed = function(index) {
        sharedProperties.setPropertyName("SceneEdit");
        sharedProperties.addPropertyValue("createdAt", $scope.recentActivity[index].createdAt);
        sharedProperties.addPropertyValue("userid", $scope.recentActivity[index].userid);
    };
    
    $scope.OnDeletePressed = function(index) {
    };
    
    $scope.loadSimulationMetaData();
}
);


