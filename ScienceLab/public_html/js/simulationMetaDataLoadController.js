/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

controllers.controller('simulationMetaDataLoadController', function ($scope, $http, $route, sharedProperties) {
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
        var query = new Parse.Query(SimulationMetaData);
        query.descending("updatedAt");
        query.limit(10);
        query.find({
            success: function (results) {
                // Do something with the returned Parse.Object values
                for (var i = 0; i < results.length; i++) {
                    var object = results[i];
                    var username = object.get("userdisplayname");
                    var userid = object.get("userid");
                    var simname = object.get("simname");
                    var simtitle = object.get("simtitle");
                    var edited = object.get("edited");
                    var simKey = object.get("simkey");
                    var createdOrEdited = (edited === true) ? "Edited" : "Created";
                    var timeDiff = $scope.findTimeDifference(object.get("updatedAt"));
                    $scope.recentActivity.push({simKey:simKey,createdOrEdited:createdOrEdited, userid:userid, username:username, simtitle:simtitle, simname:simname, createdAt:timeDiff});
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
        sharedProperties.addPropertyValue("simTitle", $scope.recentActivity[index].simtitle);
        sharedProperties.addPropertyValue("createdAt", $scope.recentActivity[index].createdAt);
        sharedProperties.addPropertyValue("userid", $scope.recentActivity[index].userid);
        sharedProperties.setPropertyName('SceneLoadFromServer');
        sharedProperties.addPropertyValue("simKey", $scope.recentActivity[index].simKey);
        sharedProperties.addPropertyValue('SceneLoadType', 'SceneLoadFromServer');
    };
    
    $scope.loadSimulationMetaData();
}
);


