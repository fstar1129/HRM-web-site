app.controller('contactusController', ['$scope', '$rootScope', 'cookie', function ($scope, $rootScope, cookie) {

    var userData = cookie.checkLoggedIn(true);
    $rootScope.showHeader = 0;

}]);
