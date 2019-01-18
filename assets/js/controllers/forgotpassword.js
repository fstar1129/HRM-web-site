app.controller('forgotpasswordController', ['$scope', 'hrmAPIservice', function ($scope, hrmAPIservice) {
    $scope.userMessage = "";
    $scope.showMessage = 0;
    $scope.showHeader = 0;
    $scope.isLoggedin = 0;

    $scope.doChangePassword = function() {
        $scope.userMessage = "";
        hrmAPIservice.forgotPassword($scope.email).then(function(response) {
            $scope.showMessage = 1;
            $scope.success = response.data.success;
            $scope.userMessage = response.data.message;
        });
    }

    $scope.GoBack = function() {
        $location.path('/');
    }
}]);
