app.controller('administratorController', ['$scope', 'hrmAPIservice', '$rootScope', 'cookie', function ($scope, hrmAPIservice, $rootScope, cookie) {
    var userData = cookie.checkLoggedIn();
    cookie.getPermissions();
    $scope.txt = '';
    $scope.init = function(){
    
    var perm = cookie.getCookie("permissions");
    if(perm['22'] == null){
        $scope.txt = '';
    }
    else{
        if(perm['22'].r == '1'){
            $scope.txt = '';
        }
        else
        $scope.txt = '';
    }
}
}]);