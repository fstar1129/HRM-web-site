app.controller('AddHrmUserController', ['$scope', '$rootScope', 'cookie', 'hrmAPIservice', function ($scope, $rootScope, cookie, hrmAPIservice) {
    var userData = cookie.checkLoggedIn();
    cookie.getPermissions();

    $scope.pageTitle = "New User";
    $scope.formEnabled = 0;
    $scope.user = {
        gender: "M"
    };
    $scope.stateList = {
        availableOptions: [],
        selectedOption: {}
    };

    $scope.roleList = {
        availableOptions: [],
        selectedOption: {}
    };

    hrmAPIservice.getUserGlobalData().then(function(response) {
        console.log("Get User Data: ", response);
        $scope.stateList.availableOptions = response.data.states;
        $scope.roleList.availableOptions = response.data.roles;
    });

    $scope.save = function() {
        console.log("save");
        console.log("valid: ", $scope.user_form.$valid);
        console.log("user: ", $scope.user);

        if($scope.user_form.$valid) {

            $scope.user.state = $scope.stateList.selectedOption.id;
            $scope.user.usertype_id = $scope.roleList.selectedOption.id;

            hrmAPIservice.saveUser($scope.user, userData, 1).then(function(response) {
                console.log("Save User: ", response);
                if (response.data.success == 0) {
                    alert(response.data.message);
                } else {
                    goBack();
                }
            });
        }
        else {
            console.log($scope.stateList.selectedOption);
            console.log($scope.roleList.selectedOption);
        }
    }

    $scope.cancel = function() {
        goBack();
    }

    function goBack() {
        location.href = "#/hrmusers";
    }

}]);
