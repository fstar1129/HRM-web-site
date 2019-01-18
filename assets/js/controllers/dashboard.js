app.controller('dashboardController', ['$scope', 'hrmAPIservice', '$rootScope', 'cookie', '$location', function ($scope, hrmAPIservice, $rootScope, cookie, $location) {
    var userData = cookie.checkLoggedIn();
    cookie.getPermissions();
    $scope.init = function(){
        hrmAPIservice.getRoles().then(function(response) {
            $scope.roles = response.data;
            // console.log('test',userData);
            for(var i = 0;i<$scope.roles.length;i++){
                if($scope.roles[i].id == userData.usertype_id){
                    $location.path('dashboard/'+$scope.roles[i].value.toLowerCase());
                }
            }
            
          });
    }
}]);

