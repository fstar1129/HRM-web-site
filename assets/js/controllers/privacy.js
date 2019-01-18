app.controller('privacyController', ['$scope', '$rootScope', 'cookie', function ($scope, $rootScope, cookie) {
    var userData = cookie.checkLoggedIn(true);

}]);
