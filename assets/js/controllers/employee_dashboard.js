app.controller('employee_dashboardController', ['$scope', 'hrmAPIservice', '$rootScope', 'cookie', function ($scope, hrmAPIservice, $rootScope, cookie) {
    var userData = cookie.checkLoggedIn();
    cookie.getPermissions();
    $scope.txt = '';
    $scope.init = function(){
    
    var perm = cookie.getCookie("permissions");
    // console.log('pppp',perm['23'].r);
    if(perm['25'] == null){
        $scope.txt = '';
    }
    else{
        if(perm['25'].r == '1'){
            $scope.txt = '';
        }
        else
        $scope.txt = '';
    }
}
}]);