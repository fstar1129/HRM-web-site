app.controller('permissionsController', ['$scope', '$rootScope', '$timeout','cookie','hrmAPIservice', function ($scope, $rootScope, $timeout, cookie, hrmAPIservice) {
    var userData = cookie.checkLoggedIn();
    cookie.getPermissions();

    $scope.userrole = 0;
    $scope.permissions = {};
    $scope.permissions.read = [];
    $scope.permissions.write = [];
    $scope.permissions.delete = [];

    hrmAPIservice.getPermissionData().then(function(response) {
        $scope.roles = response.data.roles;
        $scope.modules = response.data.modules;
    });

    $scope.updatePermissions = function() {
        $scope.permissions.read = [];
        $scope.permissions.write = [];
        $scope.permissions.delete = [];
        hrmAPIservice.getPermissions($scope.userrole).then(function(response) {
            angular.forEach(response.data, function(obj, key) {
               
                $scope.permissions.read[obj.module] = (obj.read > 0) ? 1 : 0;
                $scope.permissions.write[obj.module] = (obj.write > 0) ? 1 : 0;
                $scope.permissions.delete[obj.module] = (obj.delete > 0) ? 1 : 0;
            });
        });
    }

    $scope.savePermissions = function() {
        hrmAPIservice.savePermissions($scope.userrole, $scope.permissions).then(function(response) {
            $scope.showMessage      = 1;
            $scope.success          = 1;
            $scope.userMessage      = "The permissions have been updated successfully";
            $timeout(function() {
                $timeout(function() {
                    $scope.userMessage      = "";
                    $scope.showMessage      = 0;
                }, 1000);
            }, 3000);

        });
    }

}]);
