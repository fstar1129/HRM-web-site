app.controller('EditHrmUserController', ['$scope', '$rootScope', 'cookie','uiGridConstants', 'hrmAPIservice', "$routeParams", function ($scope, $rootScope, cookie, uiGridConstants, hrmAPIservice, $routeParams) {
    var userData = cookie.checkLoggedIn();
    cookie.getPermissions();

    $scope.pageTitle = "Edit User";
    $scope.user_id = $routeParams.id;

    $scope.user = {
    };
    $scope.stateList = {
        availableOptions: [],
        selectedOption: {}
    };

    $scope.roleList = {
        availableOptions: [],
        selectedOption: {}
    };
    
    $scope.doReleaseLockout = function() {
 
        hrmAPIservice.releaseLock($scope.user_id).then(function(response) { 
            $scope.userMessage = response.data.message;
        });
        
    }

    hrmAPIservice.getUserGlobalData().then(function(response) {
        $scope.stateList.availableOptions = response.data.states;
        $scope.roleList.availableOptions = response.data.roles;

        hrmAPIservice.getUserById($scope.user_id).then(function(response) {
            var user = response.data.user;
            user["password"] = user["public_password"];
            var dob = user["dob"];
            user["dob"] = new Date(dob);

            var state = user["state"];
            for(var i = 0; i < $scope.stateList.availableOptions.length; i++) {
                var item = $scope.stateList.availableOptions[i];
                if(state == item["id"]) {
                    $scope.stateList.selectedOption = item;
                    break;
                }
            }

            var usertype_id = user["usertype_id"];
            for(var i = 0; i < $scope.roleList.availableOptions.length; i++) {
                var item = $scope.roleList.availableOptions[i];
                if(usertype_id == item["id"]) {
                    $scope.roleList.selectedOption = item;
                    break;
                }
            }

            $scope.user = user;
            console.log($scope.user);
        });
    });

    $scope.save = function() {
        console.log("save");
        console.log("valid: ", $scope.user_form.$valid);
        console.log("user: ", $scope.user);

        if($scope.user_form.$valid) {

            $scope.user.state = $scope.stateList.selectedOption.id;
            $scope.user.usertype_id = $scope.roleList.selectedOption.id;

            hrmAPIservice.updateUser($scope.user, userData).then(function(response) {
                console.log("Update User: ", response);
                if (response.data.success == 0) {
                    alert(response.data.message);
                } else {
                    goBack();
                }
            });
        }
        else {

        }
    }

    $scope.cancel = function() {
        goBack();
    }

    function goBack() {
        location.href = "#/hrmusers";
    }

}]);
 