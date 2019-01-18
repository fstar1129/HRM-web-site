app.controller('hrmusersController', ['$scope', '$rootScope', 'cookie','uiGridConstants', 'hrmAPIservice', function ($scope, $rootScope, cookie, uiGridConstants, hrmAPIservice) {
    var userData = cookie.checkLoggedIn();
    cookie.getPermissions();

    $scope.pageTitle = "User Details";
    $scope.formEnabled = 0;
    $scope.users = {};
    $scope.user = {};
    $scope.orig = {};

    $scope.gridOptionsComplex = {
      enableFiltering: true,
      showGridFooter: false,
      showColumnFooter: false,
      onRegisterApi: function onRegisterApi(registeredApi) {
          gridApi = registeredApi;
      },
      columnDefs: [
        { name: 'id', visible: false },
        { name: 'name', width: '20%' },
        { name: 'telephone', width: '10%', cellClass: 'center' },
        { name: 'email', width: '15%', enableFiltering: true, cellClass: 'center' },
        { name: 'StateName', width: '15%', cellClass: 'center' },
        { name: 'gender', filter: { term: '' }, width: '10%', enableCellEdit: false,
            cellClass: function(grid, row, col, rowRenderIndex, colRenderIndex) {
                if (grid.getCellValue(row,col) === 'Male') {
                    return 'center blue';
                } else if (grid.getCellValue(row,col) === 'Female') {
                    return 'center green';
                }
            }
        },
        { name: 'status', width: '20%', enableFiltering: false, cellClass: 'center',
            cellTemplate : '<button class="btn btn-sm" ng-class="{\'btn-success\': row.entity.active == 1, \'btn-default\': row.entity.active == 0 }" style="margin-right: 0; border-top-right-radius: 0; border-bottom-right-radius: 0; " ng-click="grid.appScope.activateUser(row.entity,1)">Active</button><button class="btn btn-sm btn-default" ng-class="{\'btn-success\': row.entity.active == 0, \'btn-default\': row.entity.active == 1 }" ng-click="grid.appScope.activateUser(row.entity,0)" style="border-top-left-radius: 0; border-bottom-left-radius: 0;">Inactive</button></a>'
        },
        { name: 'action', enableFiltering: false, width: '10%',  cellClass: 'center',
            cellTemplate: '<div class="ui-grid-cell-contents"><i class="fa fa-edit fa-2x" ng-click="grid.appScope.editUser(row.entity)"></i><i class="fa fa-trash-o fa-2x text-danger" ng-click="grid.appScope.deleteUser(row.entity)"></i></div>'
        }
      ]
    };

    $scope.deleteUser = function(user) {
        var answer = confirm("Delete user " + user.firstname + ' ' + user.lastname + '? Are you sure?');
        if (answer) {
            hrmAPIservice.delete(user, userData, 'user').then(function(response) {
                hrmAPIservice.getUserData(userData, 1).then(function(response) {
                    $scope.gridOptionsComplex.data = response.data.users;
                });
            });
        }
    }


    $scope.newUser = function() {  alert('sdfs');
        $scope.orig = {};
        $scope.userform.$setPristine();
        $scope.user.id = 0;
        $scope.user.account_id = 0;
        $scope.user.added_by = userData.id;
        $scope.user.update_by = 0;
        $scope.formEnabled = 1;
    }

    $scope.clearForm = function() {
        $scope.user = {};
        $scope.formEnabled = 0;
    }

    var setDate = function(date) {
        if (date == "0000-00-00" || !date) {
            return "";
        }
        var a = date.split('-');
        var d = new Date(a[0], a[1]-1, a[2]);
        return d;
    }

    $scope.editUser = function(userDetail) {
        $scope.orig = {};
        hrmAPIservice.get(userDetail.id, 'user').then(function(response) {
            $scope.user = response.data.user;
            $scope.orig = angular.copy(response.data.user);
            $scope.formEnabled = 1;
            $scope.user.dob = setDate($scope.user.dob);
            $scope.user.update_by = userData.id;
        });
    };

    $scope.activateUser = function(row, status) {
        hrmAPIservice.activateUser(row.id, status).then(function(response) {
            hrmAPIservice.getUserData(userData, 1).then(function(response) {
                $scope.gridOptionsComplex.data = response.data.users;
            });
        });
    }

    hrmAPIservice.getUserData(userData, 1).then(function(response) {
        $scope.gridOptionsComplex.data = response.data.users;
        $scope.countryList = response.data.countries;
        $scope.stateList = response.data.states;
        $scope.personList = response.data.persontype;
        $scope.roleList = response.data.roles;
    });

    function findDiff(original, edited) {
        var diff = {}
        for(var key in original) {
            if (original[key] !== edited[key]) {
                diff[key] = edited[key];
            }
        }
        return diff;
    }

    $scope.saveUser = function() {
        hrmAPIservice.saveUser($scope.user, userData, 1).then(function(response) {
            if (response.data.success == 0) {
                $scope.showMessage = 1;
                $scope.success = response.data.success;
                $scope.userMessage = response.data.message;
            } else {
                $scope.gridOptionsComplex.data = response.data.users;
                $scope.user = {};
                $scope.formEnabled = 0;
            }
        });
    }

}]);
