app.controller('moreinfoController', ['$scope','$location', function ($scope, $location) {
    $scope.sitename = 'hr master';
    $scope.slogan = "the HR professionals' best kept secret";

    $scope.submitEmail = function() {
        if ($scope.email == "") {
            alert('Enter an email address or perish!');
            return;
        }
        alert('Your email address will be submitted once the functionality allows you to do such a thing.');
    }

    $scope.GoBack = function() {
        $location.path('/');
    }

}]);
