app.controller('hrmusersController', [
    '$scope',
    '$rootScope',
    'cookie',
    'uiGridConstants',
    'hrmAPIservice',
    function ($scope, $rootScope, cookie, uiGridConstants, hrmAPIservice) {
        var userData = cookie.checkLoggedIn();
        cookie.getPermissions();

        $scope.pageTitle = "User Details";
        $scope.users = [];
        $scope.roleList = [];
        $scope.formEnabled = 0;
        $scope.user = {};

        hrmAPIservice
            .getUserData(userData, 1)
            .then(function (response) {
                users = response.data.users;
                $scope.roleList = response.data.roles;

                // filterUserList(users);
            });

        function filterUserList(users) {
            //Fitler Something for User list.
            for (var i = 0; i < users.length; i++) {
                var item = users[i];
                var usertype_id = item["usertype_id"];

                for (var j = 0; j < $scope.roleList.length; j++) {
                    var role = $scope.roleList[j];
                    if (role["id"] == usertype_id) {
                        item["role"] = role["display_text"];
                        break;
                    }
                }
            }

            $scope.users = users;
        }

        $scope.gridOptionsComplex = {
            enableFiltering: true,
            showGridFooter: false,
            showColumnFooter: false,
            onRegisterApi: function onRegisterApi(registeredApi) {
                gridApi = registeredApi;
            },
            columnDefs: [
                {
                    name: 'id',
                    visible: false
                }, {
                    name: 'name',
                    width: '20%'
                }, {
                    name: 'username',
                    width: '10%',
                    cellClass: 'center'
                }, {
                    name: 'email',
                    width: '25%',
                    enableFiltering: true,
                    cellClass: 'center'
                }, {
                    name: 'UserRole',
                    width: '15%',
                    cellClass: 'center'
                }, {
                    name: 'status',
                    width: '20%',
                    enableFiltering: false,
                    cellClass: 'center',
                    cellTemplate: '<button class="btn btn-sm" ng-class="{\'btn-success\': row.entity.active == 1, ' +
                            '\'btn-default\': row.entity.active == 0 }" style="margin-right: 0; border-top-ri' +
                            'ght-radius: 0; border-bottom-right-radius: 0; " ng-click="grid.appScope.activate' +
                            'User(row.entity,1)">Active</button><button class="btn btn-sm btn-default" ng-cla' +
                            'ss="{\'btn-success\': row.entity.active == 0, \'btn-default\': row.entity.active' +
                            ' == 1 }" ng-click="grid.appScope.activateUser(row.entity,0)" style="border-top-l' +
                            'eft-radius: 0; border-bottom-left-radius: 0;">Inactive</button></a>'
                }, {
                    name: 'action',
                    enableFiltering: false,
                    width: '10%',
                    cellClass: 'center',
                    cellTemplate: '<div class="ui-grid-cell-contents"><i class="fa fa-edit fa-2x" ng-click="grid.ap' +
                            'pScope.editUser(row.entity)"></i><i class="fa fa-trash-o fa-2x text-danger" ng-c' +
                            'lick="grid.appScope.deleteUser(row.entity)"></i></div>'
                }
            ]
        };

        hrmAPIservice
            .getUsers(userData, 1)
            .then(function (response) {
                $scope.gridOptionsComplex.data = response.data;
            });

        // Sort function.
        $scope.sort = function (keyname) {
            $scope.sortKey = keyname; //set the sortKey to the param passed
            $scope.reverse = !$scope.reverse; //if true make it false and vice versa
        };

        hrmAPIservice
            .getRoles()
            .then(function (response) {
                var roles = [];
                for (var i = 0; i < response.data.length; i++) {
                    var item = response.data[i];
                    if (item.value != "Administrator") {
                        roles[roles.length] = item;
                    }
                }

                $scope.userroles = roles;
            });

        $scope.deleteUser = function (user) {
            var answer = confirm("Delete user " + user.firstname + ' ' + user.lastname + '? Are you sure?');
            if (answer) {
                hrmAPIservice
                    .delete(user, userData, 'user')
                    .then(function (response) {
                        $scope.gridOptionsComplex.data = response.data;
                    });
            }
        }

        $scope.newUser = function () {
            $scope.formEnabled = 1;
            $scope.user.state = '0';
        }

        $scope.editUser = function (user) {
            $scope.formEnabled = 1;
            $scope.user.state = '0';
            hrmAPIservice
                .get(user.id, 'user')
                .then(function (response) {
                    $scope.user = response.data.user.user;
                    var date = response
                        .data
                        .user
                        .user
                        .dob
                        .split('-');
                    var d = new Date(date[1] + '-' + date[0] + '-' + date[2]);
                    $scope.user.dob = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0);
                    $scope.user.password = '';
                });
        };

        $scope.activateUser = function (row, status) {
            hrmAPIservice
                .activateUser(row.id, status)
                .then(function (response) {
                    hrmAPIservice
                        .getUsers(userData)
                        .then(function (response) {
                            $scope.gridOptionsComplex.data = response.data;
                        });
                });
        };

        $scope.saveUser = function () {
            hrmAPIservice
                .saveUser($scope.user, userData, 1)
                .then(function (response) {
                    if (response.data.success == 0) {
                        $scope.showMessage = 1;
                        $scope.success = response.data.success;
                        $scope.userMessage = response.data.message;
                    } else {
                        $scope.gridOptionsComplex.data = response.data.users;
                        $scope.showMessage = 1;
                        $scope.success = response.data.success;
                        $scope.userMessage = response.data.message;
                        $scope.user = {};
                        $scope.formEnabled = 0;
                    }
                });
        }

        $scope.doReleaseLockout = function () {
            hrmAPIservice
                .releaseLock($scope.user.id)
                .then(function (response) {
                    $scope.showMessage = 1;
                    $scope.success = response.data.success;
                    $scope.userMessage = response.data.message;
                });
        }

    }
]);