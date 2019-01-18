app.controller('usersController', ['$scope', '$rootScope', 'cookie','hrmAPIservice', function ($scope, $rootScope, cookie, hrmAPIservice) {
    var userData = cookie.checkLoggedIn();
    cookie.getPermissions();
    $scope.user = {};
    $scope.showMessage = 0;
    $scope.formEnabled = 0;
    $scope.clear = {};
    
    $scope.newUser = function() {
        //alert("a");
        $scope.userform.$setPristine();
        $scope.user.id = 0;
        $scope.user.account_id = userData.account_id;
        $scope.user.added_by = userData.id;
        $scope.user.update_by = 0;
        $scope.formEnabled = 1;
    }  
    
    $scope.editUser = function(user) { 
        $scope.showMessage = 0;
        hrmAPIservice.getUserById(user.id).then(function(response) {           
            $scope.user = response.data.user;
            $scope.formEnabled = 1;
        });
    };    
    
    $scope.activateUser = function(row, status) {
        hrmAPIservice.activateUser(row.id, status).then(function(response) {
            hrmAPIservice.getUsers(userData).then(function(response) {
                $scope.gridOptionsComplex.data = response.data;
                $scope.user.update_by = userData.id;
            });
        });
    }    

    hrmAPIservice.getRoles().then(function(response) {
        var roles = [];
        for(var i = 0; i < response.data.length; i++) {
            var item = response.data[i];
            if(item.value != "Administrator") {
                roles[roles.length] = item;
            }
        }

        $scope.userroles = roles;
    });

    $scope.saveUser = function() {
        $scope.user.account_id = userData.account_id;
        $scope.user.added_by = userData.id;
        //console.log($scope.user);
        hrmAPIservice.saveChildUser($scope.user, userData).then(function(response) {
            console.log("Save user: ", response);

            $scope.showMessage = 1;
            $scope.success = response.data.success;
            $scope.userMessage = response.data.message;
            $scope.formEnabled = 0;
            $scope.user = {};
            
            //$scope.userform.$setPristine();
            //$scope.formName.$setUntouched();
        });
    };
    
    $scope.clearForm = function() {
        $scope.user = angular.copy($scope.clear);
        $scope.user_form.$valid = false;
    } 
    
    $scope.deleteUser = function(userDetail) {
        var answer = confirm("Delete user " + userDetail.firstname + ' ' + userDetail.lastname + '? Are you sure?');
        if (answer) {
            hrmAPIservice.delete(userDetail, userData, 'user').then(function(response) {
                $scope.gridOptionsComplex.data = response.data;
            });
        }
    }    
    
    
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
        { name: 'username', width: '10%', cellClass: 'center' },
        { name: 'email', width: '25%', enableFiltering: true, cellClass: 'center' },
        { name: 'UserRole', width: '15%', cellClass: 'center' },
        { name: 'status', width: '20%', enableFiltering: false, cellClass: 'center',
            cellTemplate : '<button class="btn btn-sm" ng-class="{\'btn-success\': row.entity.active == 1, \'btn-default\': row.entity.active == 0 }" style="margin-right: 0; border-top-right-radius: 0; border-bottom-right-radius: 0; " ng-click="grid.appScope.activateUser(row.entity,1)">Active</button><button class="btn btn-sm btn-default" ng-class="{\'btn-success\': row.entity.active == 0, \'btn-default\': row.entity.active == 1 }" ng-click="grid.appScope.activateUser(row.entity,0)" style="border-top-left-radius: 0; border-bottom-left-radius: 0;">Inactive</button></a>'
        },
        { name: 'action', enableFiltering: false, width: '10%',  cellClass: 'center',
            cellTemplate: '<div class="ui-grid-cell-contents"><i class="fa fa-edit fa-2x" ng-click="grid.appScope.editUser(row.entity)"></i><i class="fa fa-trash-o fa-2x text-danger" ng-click="grid.appScope.deleteUser(row.entity)"></i></div>'
        }
      ]
    };    
    
    hrmAPIservice.getUsers(userData,0).then(function(response) {
        $scope.gridOptionsComplex.data = response.data;
    });
    
    
    
}]);
