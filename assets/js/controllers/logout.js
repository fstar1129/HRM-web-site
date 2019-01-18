app.controller('logoutController', ['cookie','$location','$rootScope', function (cookie, $location, $rootScope) {
    cookie.deleteCookie('user');
    cookie.deleteCookie('permissions');
    $rootScope.isLoggedin = 0;
    $location.path('/');
}]);
