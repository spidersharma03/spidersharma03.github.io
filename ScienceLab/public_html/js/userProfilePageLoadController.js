/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

controllers.controller('userProfilePageLoadController', function ($scope, $http, $route, sharedProperties) {
    $scope.recentActivity = [];
    
    $scope.findTimeDifference = function(oldDate) {
        var currentDate = new Date();
        var yearDiff = currentDate.getFullYear() - oldDate.getFullYear();
        var dayDiff;
        if(yearDiff === 0)
            dayDiff = currentDate.getDay() - oldDate.getDay();
        else
            return (yearDiff > 1) ? yearDiff + " Years ago" : dayDiff + " Year ago";

        var hourDiff;
        
        if(dayDiff === 0)
             hourDiff = currentDate.getHours() - oldDate.getHours();
        else{
            return (dayDiff > 1) ? dayDiff + " Days ago" : dayDiff + " Day ago";
        }
        var minDiff;
        if(hourDiff === 0)
             minDiff = currentDate.getMinutes() - oldDate.getMinutes();
        else {
            return (hourDiff > 1) ? hourDiff + " Hours ago" : hourDiff + " Hour ago";
        }

        return (minDiff > 1) ? minDiff + " Minutes ago" : minDiff + " Minute ago";
    };
    
    $scope.loadSimulationMetaData = function () {
        var SimulationMetaData = Parse.Object.extend("SimulationMetaData");
        var currentUser = Parse.User.current();
        var currentUserEmail = currentUser.get("email");
        var query = new Parse.Query(SimulationMetaData);
        query.equalTo("userid", currentUserEmail);
        query.descending("updatedAt");
        query.limit(10);
        query.find({
            success: function (results) {
                for (var i = 0; i < results.length; i++) {
                    var object = results[i];
                    var username = object.get("username");
                    var userid = object.get("userid");
                    var simname = object.get("simname");
                    var simtitle = object.get("simtitle");
                    var edited = object.get("edited");
                    var simKey = object.get("simkey");
                    var createdOrEdited = (edited === true) ? "Edited" : "Created";
                    var timeDiff = $scope.findTimeDifference(object.get("updatedAt"));
                    $scope.recentActivity.push({simKey:simKey,createdOrEdited: createdOrEdited,userid:userid, username:username, simtitle:simtitle, simname:simname, createdAt:timeDiff});
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
        sharedProperties.addPropertyValue("simKey", $scope.recentActivity[index].simKey);
        sharedProperties.addPropertyValue("userid", $scope.recentActivity[index].userid);
        sharedProperties.addPropertyValue("simTitle", $scope.recentActivity[index].simtitle);
        sharedProperties.setPropertyName('SceneLoadFromServer');
    };
    
    $scope.OnEditPressed = function(index) {
        sharedProperties.setPropertyName("SceneEdit");
        sharedProperties.addPropertyValue("createdAt", $scope.recentActivity[index].createdAt);
        sharedProperties.addPropertyValue("simKey", $scope.recentActivity[index].simKey);
        sharedProperties.addPropertyValue("userid", $scope.recentActivity[index].userid);
        sharedProperties.addPropertyValue("simTitle", $scope.recentActivity[index].simtitle);
        sharedProperties.addPropertyValue('SceneLoadType', 'SceneEdit');
    };
    
    $scope.OnDeletePressed = function(index) {
        var r = confirm("Are you sure, you want to delete the scene?");
        if (r === false) {
            return;
        } 
        var Simulation = Parse.Object.extend("Simulation");
        var query = new Parse.Query(Simulation);
        var simKey = $scope.recentActivity[index].simKey;
        var userid = $scope.recentActivity[index].userid;
        query.equalTo("userid", userid);
        query.equalTo("simkey", simKey);
        query.find({
            success: function (results) {
                if(results.length === 0)
                    return;
                results[0].destroy({
                    success: function(myObject) {
                        alert("Deleted Scene");
                    },
                    error: function(myObject, error) {
                        alert("Deletion Failed");
                    }
              });
            },
            error: function (error) {
                alert("Error: " + error.code + " " + error.message);
            }
        });
        
        var SimulationMetaData = Parse.Object.extend("SimulationMetaData");
        var query = new Parse.Query(SimulationMetaData);
        var date = $scope.recentActivity[index].createdAt;
        var userid = $scope.recentActivity[index].userid;
        query.greaterThanOrEqualTo("createdAt", date);
        query.equalTo("userid", userid);
        query.limit(1);
        query.find({
            success: function (results) {
                if(results.length === 0)
                    return;
                results[0].destroy({
                    success: function(myObject) {
                        alert("Deleted Scene MetaData");
                        $route.reload();
                    },
                    error: function(myObject, error) {
                        alert("Deletion Failed");
                    }
              });
                $scope.$apply();
            },
            error: function (error) {
                alert("Error: " + error.code + " " + error.message);
            }
        });
    };
    
    $scope.loadSimulationMetaData();
}
);


