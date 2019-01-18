app.controller('solutionController', ['$scope', '$rootScope', 'cookie','$anchorScroll','$routeParams', function ($scope, $rootScope, cookie, $anchorScroll, $routeParams) {
    var userData = cookie.checkLoggedIn(true);
    $rootScope.showHeader = 0;

    if (angular.isDefined($routeParams.anchor)) {
        $anchorScroll($routeParams.anchor);
    }




}]);
