app.controller('hrmsitedataController', ['$scope', '$rootScope', 'cookie','uiGridConstants', 'hrmAPIservice', function ($scope, $rootScope, cookie, uiGridConstants, hrmAPIservice) {
    var userData = cookie.checkLoggedIn();
    cookie.getPermissions();

    $scope.pageTitle = "";
    $scope.formEnabled = 0;
    $scope.sd = {};

    $scope.gridOptionsComplex = {
      enableFiltering: true,
      showGridFooter: false,
      showColumnFooter: false,
      onRegisterApi: function onRegisterApi(registeredApi) {
          gridApi = registeredApi;
      },
      columnDefs: [
        { name: 'id', visible: false },
        { name: 'type', width: '20%' },
        { name: 'display_text', width: '60%', cellClass: 'center' },
        { name: 'action', enableFiltering: false, width: '20%',  cellClass: 'center',
            cellTemplate: '<div class="ui-grid-cell-contents"><i class="fa fa-edit fa-2x" ng-click="grid.appScope.editData(row.entity)"></i>&nbsp;&nbsp;&nbsp;<i class="fa fa-trash-o fa-2x text-danger" ng-click="grid.appScope.deleteData(row.entity)"></i></div>'
        }
      ]
    };

    $scope.deleteData = function(sdDetail) {
        var answer = confirm("Delete " + sdDetail.display_text + '? Are you sure?');
        if (answer) {
            hrmAPIservice.delete(sdDetail, userData, 'sitedata').then(function(response) {
                $scope.gridOptionsComplex.data = response.data.sitedata;
            });
        }
    }


    $scope.newData = function() {
        $scope.sdform.$setPristine();
        $scope.sd.id = 0;
        $scope.formEnabled = 1;
    }

    $scope.clearForm = function() {
        $scope.sd = {};
        $scope.sd.id = 0;
        $scope.formEnabled = 0;
    }

    var setDate = function(date) {
        var a = date.split('-');
        var d = new Date(a[0], a[1]-1, a[2]);
        return d;
    }

    $scope.editData = function(sdDetail) {
        hrmAPIservice.get(sdDetail.id, 'sitedata').then(function(response) {
            $scope.sd = response.data;
            $scope.formEnabled = 1;
        });
    };

    $scope.getSiteData = function() {
        hrmAPIservice.getSiteData(userData, 0).then(function(response) {
            $scope.gridOptionsComplex.data = response.data.sitedata;

            // HACK for now
            var exclude = ['datatype','sitelocation','supplier','position','level','department','entitle', 'supplier'];        
            $scope.typeList = response.data.datatype.filter(function(type) {
                return exclude.indexOf(type) === -1;
            });        
        });
    }

    $scope.saveData = function() {
        hrmAPIservice.saveData($scope.sd, {}).then(function(response) {
            $scope.getSiteData();
            $scope.sd = {};
            $scope.formEnabled = 0;
        });
    }
    
    $scope.getSiteData();

}]);
