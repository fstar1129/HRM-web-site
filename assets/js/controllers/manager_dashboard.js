app.controller('managerController', ['$scope', 'hrmAPIservice', '$rootScope', 'cookie', function ($scope, hrmAPIservice, $rootScope, cookie) {
    var userData = cookie.checkLoggedIn();
    cookie.getPermissions();
    $scope.txt = '';
    $scope.init = function(){
    
    var perm = cookie.getCookie("permissions");
    // console.log('pppp',perm['23'].r);
    if(perm['23'] == null){
        $scope.txt = '';
    }
    else{
        if(perm['23'].r == '1'){
            $scope.txt = '';
        }
        else
        $scope.txt = '';
    }
  
}
}]);