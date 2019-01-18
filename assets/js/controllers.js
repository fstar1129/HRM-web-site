app.controller('contactusController', ['$scope', '$rootScope', 'cookie', function ($scope, $rootScope, cookie) {

    var userData = cookie.checkLoggedIn(true);


}]);

app.controller('dashboardController', ['$scope', '$rootScope', 'cookie', function ($scope, $rootScope, cookie) {

    var userData = cookie.checkLoggedIn();
    cookie.getPermissions();

    $scope.GoBack = function() {
        $location.path('/');
    }
}]);

app.run(function($rootScope) {
    $rootScope.typeOf = function(value) {
      return typeof value;
    };
})
.directive('stringToNumber', function() {
    return {
        require: 'ngModel',
        link: function(scope, element, attrs, ngModel) {
            ngModel.$parsers.push(function(value) {
                return '' + value;
            });
            ngModel.$formatters.push(function(value) {
                return parseFloat(value);
            });
        }
    };
})



.config(function($mdDateLocaleProvider) {
    $mdDateLocaleProvider.formatDate = function(date) {
        if (!date) {
            return "";
        }
        var d = new Date(date);
        var dd = (d.getDate() < 10) ? "0" + d.getDate() : d.getDate();
        var m = d.getMonth() + 1;
        var mm = (m < 10) ? "0" + m : m;
        return dd + "-" + mm + "-" + d.getFullYear();
    };
})
.directive("hrmContent", function() {
    return {
        template : '<div id="wrapper"><div class="content"><div class="content-inside" ng-view></div></div><footer ng-include="\'assets/templates/_footer.html\'"></footer></div>'
    };
})
.directive("empField", function() {
    return {
        retrict: 'A',
        scope: {
            'fldLabel': '@',
            'fldType': '@',
            model: '=ngModel',
            required: '=ngRequired'
        },
        template : `<div class="form-group row">
                        <label class="control-label col-sm-4">{{fldLabel}}</label>
                        <div class="col-sm-8">
                            <input type="{{fldType}}" class="form-control" ng-model="model" ng-required="required" />
                            <span style="display:none;" class="text-danger"></span>
                        </div>
                    </div>`,
        link: function(scope, element, attrs) {
            if (angular.isUndefined(scope.fldType)) {
                scope.fldType = 'text';
            }
        }
    };
})
.directive("userMessage", function() {
    return {
        scope: { obj: '=' },
        template : '<div class="user-message">{{ obj.userMessage }}</div>'
    };
});

app.controller('employeeController', ['$scope', '$rootScope', 'cookie','uiGridConstants', 'hrmAPIservice', function ($scope, $rootScope, cookie, uiGridConstants, hrmAPIservice) {
    var userData = cookie.checkLoggedIn();
    cookie.getPermissions();

    $scope.pageTitle = "Employees Details";
    $scope.formEnabled = 0;
    $scope.employees = {};
    $scope.emp = {};
    $scope.empwork = {};

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
            cellTemplate : '<button class="btn btn-sm" ng-class="{\'btn-success\': row.entity.active == 1, \'btn-default\': row.entity.active == 0 }" style="margin-right: 0; border-top-right-radius: 0; border-bottom-right-radius: 0; " ng-click="grid.appScope.activateEmployee(row.entity,1)">Active</button><button class="btn btn-sm btn-default" ng-class="{\'btn-success\': row.entity.active == 0, \'btn-default\': row.entity.active == 1 }" ng-click="grid.appScope.activateEmployee(row.entity,0)" style="border-top-left-radius: 0; border-bottom-left-radius: 0;">Inactive</button></a>'
        },
        { name: 'action', enableFiltering: false, width: '10%',  cellClass: 'center',
            cellTemplate: '<div class="ui-grid-cell-contents"><i class="fa fa-edit fa-2x" ng-click="grid.appScope.editEmployee(row.entity)"></i><i class="fa fa-trash-o fa-2x text-danger" ng-click="grid.appScope.deleteEmployee(row.entity)"></i></div>'
        }
      ]
    };

    $scope.deleteEmployee = function(empDetail) {
        var answer = confirm("Delete employee " + empDetail.firstname + ' ' + empDetail.lastname + '? Are you sure?');
        if (answer) {
            hrmAPIservice.delete(empDetail, userData, 'employee').then(function(response) {
                $scope.gridOptionsComplex.data = response.data.employees;
            });
        }
    }


    $scope.newEmployee = function() {
        $scope.empform.$setPristine();
        $scope.emp.id = 0;
        $scope.emp.account_id = userData.account_id;
        $scope.emp.added_by = userData.id;
        $scope.emp.update_by = 0;
        $scope.formEnabled = 1;
    }

    $scope.clearForm = function() {
        $scope.emp = {};
        $scope.empwork = {};
        $scope.formEnabled = 0;
    }

    var setDate = function(date) {
        var a = date.split('-');
        var d = new Date(a[0], a[1]-1, a[2]);
        return d;
    }

    $scope.editEmployee = function(empDetail) {
        hrmAPIservice.get(empDetail.id, 'employee').then(function(response) {
            $scope.emp = response.data.employee;
            $scope.emp.dob = setDate($scope.emp.dob);
            $scope.emp.visaexpiry = setDate($scope.emp.visaexpiry);
            $scope.empwork = response.data.employee;
            $scope.emp.start_date = setDate($scope.emp.start_date);
            $scope.emp.end_date = setDate($scope.emp.end_date);
            $scope.formEnabled = 1;
            $scope.emp.update_by = userData.id;
        });
    };

    $scope.activateEmployee = function(row, status) {
        hrmAPIservice.activateEmployee(row.id, status).then(function(response) {
            hrmAPIservice.getEmployeeData(userData).then(function(response) {
                $scope.gridOptionsComplex.data = response.data.employees;
            });
        });
    }

    hrmAPIservice.getEmployeeData(userData).then(function(response) {
        $scope.gridOptionsComplex.data = response.data.employees;
        $scope.countryList = response.data.countries;
        $scope.stateList = response.data.states;
        $scope.personList = response.data.persontype;
    });

    $scope.saveEmployee = function() {
        hrmAPIservice.saveEmployee($scope.emp, $scope.empwork, userData).then(function(response) {
            $scope.gridOptionsComplex.data = response.data.employees;
            $scope.emp = {};
            $scope.empwork = {};
            $scope.formEnabled = 0;
        });
    }

}]);

app.controller('forgotpasswordController', ['$scope', 'hrmAPIservice', function ($scope, hrmAPIservice) {
    $scope.userMessage = "";
    $scope.showMessage = 0;
    $scope.showHeader = 0;
    $scope.isLoggedin = 0;

    $scope.doChangePassword = function() {
        $scope.userMessage = "";
        hrmAPIservice.forgotPassword($scope.email).then(function(response) {
            $scope.showMessage = 1;
            $scope.success = response.data.success;
            $scope.userMessage = response.data.message;
        });
    }

    $scope.GoBack = function() {
        $location.path('/');
    }
}]);

app.controller('hrmusersController', ['$scope', '$rootScope', 'cookie','uiGridConstants', 'hrmAPIservice', function ($scope, $rootScope, cookie, uiGridConstants, hrmAPIservice) {
    var userData = cookie.checkLoggedIn();
    cookie.getPermissions();

    $scope.pageTitle = "User Details";
    $scope.formEnabled = 0;
    $scope.users = {};
    $scope.user = {};
    $scope.orig = {};
    var userdata = {};

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


    $scope.newUser = function() {
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
        var a = date.split('-');
        var d = new Date(a[0], a[1]-1, a[2]);
        return d;
    }

    $scope.editUser = function(userDetail) {
        $scope.orig = {};
        hrmAPIservice.get(userDetail.id, 'user').then(function(response) {
            userData = response.data.user;
            $scope.user = response.data.user;
            //$scope.orig = data;
            $scope.formEnabled = 1;
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

        angular.forEach($scope.userform, function(value, key) {
                                        if (key[0]=='$') {
                                            return;
                                        }
                                        console.log(key, value.$pristine);
                                    });


        //console.log($scope.user.tradingname);
        //console.log(userData.tradingname);


        //var keys = Object.keys($scope.orig);
    //    if (keys.length > 0) {
        //    console.log(findDiff($scope.orig, $scope.user));
    //    }

return;

        hrmAPIservice.saveUser($scope.user, userData).then(function(response) {
            $scope.gridOptionsComplex.data = response.data.users;
            $scope.user = {};
            $scope.formEnabled = 0;
        });
    }

}]);

app.controller('indexController', ['$scope', '$rootScope', '$location', function ($scope, $rootScope, $location) {
    $rootScope.showHeader = 1;
    $scope.sitename = 'hr master';
    $scope.slogan = "the HR professionals' best kept secret";

    $scope.showHeader = 1;
    $scope.isLoggedin = 0;

    $scope.MoreInfo = function() {
        $location.path('/moreinfo');
    }
    $scope.ForgotPassword = function() {
        $location.path('/forgotpassword');
    }

}]);

app.controller('loginController', ['$scope','$rootScope', 'hrmAPIservice','$timeout','$location', 'cookie', function ($scope, $rootScope, hrmAPIservice, $timeout, $location,cookie) {
    $scope.showMessage = 0;
    $scope.showHeader = 0;
    $scope.perms = {};
    $scope.login = {};
    $scope.showHeader = 0;
    $scope.isLoggedin = 0;

    $scope.doLogin = function() {
        hrmAPIservice.doLogin($scope.login.email, $scope.login.password).then(function(response) {
            $scope.showMessage = 1;
            $scope.success = response.data.success;
            if (response.data.success == 0 || angular.isUndefined(response.data.success)) {
                $scope.login.userMessage = response.data.message;
                $scope.login.success = response.data.success ;
                return;
            }
            $scope.login.userMessage = "Success! Logging in..";
            $scope.login.success = 1;
            cookie.setCookie('user', response.data.userdetail);
            cookie.setCookie('permissions', response.data.permissions);
            $timeout(function() {
                $timeout(function() {
                    $location.path('/dashboard');
                }, 300);
            }, 1000);
        });
    }

}]);

app.controller('logoutController', ['cookie','$location','$rootScope', function (cookie, $location, $rootScope) {
    cookie.deleteCookie('user');
    cookie.deleteCookie('permissions');
    $rootScope.isLoggedin = 0;
    $location.path('/');
}]);

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

app.controller('permissionsController', ['$scope', '$rootScope', '$timeout','cookie','hrmAPIservice', function ($scope, $rootScope, $timeout, cookie, hrmAPIservice) {
    var userData = cookie.checkLoggedIn();
    cookie.getPermissions();

    $scope.userrole = 0;
    $scope.permissions = {};
    $scope.permissions.read = [];
    $scope.permissions.write = [];
    $scope.permissions.delete = [];

    hrmAPIservice.getPermissionData().then(function(response) {
        $scope.roles = response.data.roles;
        $scope.modules = response.data.modules;
    });

    $scope.updatePermissions = function() {
        $scope.permissions.read = [];
        $scope.permissions.write = [];
        $scope.permissions.delete = [];
        hrmAPIservice.getPermissions($scope.userrole).then(function(response) {
            angular.forEach(response.data, function(obj, key) {
                $scope.permissions.read[obj.module] = (obj.read > 0) ? 1 : 0;
                $scope.permissions.write[obj.module] = (obj.write > 0) ? 1 : 0;
                $scope.permissions.delete[obj.module] = (obj.delete > 0) ? 1 : 0;
            });
        });
    }

    $scope.savePermissions = function() {
        hrmAPIservice.savePermissions($scope.userrole, $scope.permissions).then(function(response) {
            $scope.showMessage      = 1;
            $scope.success          = 1;
            $scope.userMessage      = "The permissions have been updated successfully";
            $timeout(function() {
                $timeout(function() {
                    $scope.userMessage      = "";
                    $scope.showMessage      = 0;
                }, 1000);
            }, 3000);

        });
    }

}]);

app.controller('privacyController', ['$scope', '$rootScope', 'cookie', function ($scope, $rootScope, cookie) {
    var userData = cookie.checkLoggedIn(true);

}]);

app.controller('resetpasswordController', ['$scope', 'hrmAPIservice','$routeParams',function ($scope, hrmAPIservice, $routeParams) {
    $scope.showMessage = 0;
    $scope.reset = {};
    $scope.showHeader = 0;
    $scope.isLoggedin = 0;

    $scope.reset.password = '';
    $scope.reset.confirmpassword = '';



    var hash = (angular.isDefined($routeParams.hash)) ? $routeParams.hash : '';

    hrmAPIservice.getEmailFromHash(hash).then(function(response) {
        if (response.success == 0) {
            $scope.userMessage = response.message;
            return;
        }
        $scope.reset.username = response.data.username;
    });

    $scope.doResetPassword = function() {
        if ($scope.reset.password !== $scope.reset.confirmpassword) {
            $scope.showMessage = 1;
            $scope.userMessage = "Confirm password does not match new password";
            return;
        }
        hrmAPIservice.resetPassword($scope.reset.username,$scope.reset.password).then(function(response) {
            $scope.showMessage = 1;
            $scope.userMessage = response.data.message;
        });
    }

    $scope.GoBack = function() {
        $location.path('/');
    }
}]);

app.controller('termsController', ['$scope', '$rootScope', 'cookie', function ($scope, $rootScope, cookie) {
    var userData = cookie.checkLoggedIn(true);
}]);

app.controller('trademarksController', ['$scope', '$rootScope', 'cookie', function ($scope, $rootScope, cookie) {
    var userData = cookie.checkLoggedIn(true);
}]);

app.controller('usersController', ['$scope', '$rootScope', 'cookie','hrmAPIservice', function ($scope, $rootScope, cookie, hrmAPIservice) {
    var userData = cookie.checkLoggedIn();
    cookie.getPermissions();
    $scope.user = {};
    $scope.showMessage = 0;

    hrmAPIservice.getRoles().then(function(response) {
        $scope.userroles = response.data;
    });

    $scope.saveUser = function() {
        hrmAPIservice.saveUser($scope.user, userData, 0).then(function(response) {
            $scope.showMessage = 1;
            $scope.success = response.data.success;
            $scope.userMessage = response.data.message;
        });
    };
}]);
