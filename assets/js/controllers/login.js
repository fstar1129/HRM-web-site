app.controller('loginController', ['$scope','$rootScope', 'hrmAPIservice','$timeout','$location', 'cookie', function ($scope, $rootScope, hrmAPIservice, $timeout, $location,cookie) {
    $scope.showMessage = 0;
    $scope.showHeader = 0;
    $scope.perms = {};
    $scope.login = {};
    $scope.showHeader = 0;
    $scope.isLoggedin = 0;
    
    $scope.setCookie = function(name, data) {
        var d = new Date();
        d.setTime(d.getTime() + (1 * 24 * 60 * 60 * 1000));
        var expires = "expires="+d.toUTCString();
        document.cookie = name + "=" + data + ";" + expires + ";path=/";        
    }

    $scope.doLogin = function() {   
        hrmAPIservice.doLogin($scope.login.email, $scope.login.password).then(function(response) {
            //console.log("Login API: ", response);
            $scope.showMessage = 1;
            $scope.success = response.data.success;
            console.log(response.data);
            if (response.data.success == 0 || angular.isUndefined(response.data.success)) {
                $scope.login.userMessage = response.data.message;
                $scope.login.success = response.data.success;
                return false;
            }
            $scope.login.userMessage = "Success! Logging in..";
            $scope.login.success = 1;
            $scope.setCookie('userdata', response.data.userdetail.id);
            
            cookie.setCookie('user', response.data.userdetail);
            cookie.setCookie('permissions', response.data.permissions);

            $timeout(function() {
                $timeout(function() {
                    var userData = response.data.userdetail;
                    hrmAPIservice.getRoles().then(function(res) {
                        $scope.roles = res.data;
                        // console.log('test',userData);
                        for(var i = 0;i<$scope.roles.length;i++){
                            if($scope.roles[i].id == userData.usertype_id){
                                $location.path($scope.roles[i].value.toLowerCase());
                            }
                        }
                        
                      });
                }, 300);
            }, 1000);
        });
        return;
    }

}]);
