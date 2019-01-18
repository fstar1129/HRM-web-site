
app.controller('downloadController', [
    '$scope',
    '$routeParams',
    '$window',
    'hrmAPIservice',
    function ($scope, $routeParams, $window, hrmAPIservice) {
        $scope.filename = $routeParams.filename;
        $window.open("")
        hrmAPIservice.download($scope.filename).then(function(response){
            console.log(response.data);
            if(response.data.success){
                
                $window.close();
            }
        });
    }
]);
