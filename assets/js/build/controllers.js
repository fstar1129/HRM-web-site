var app = angular.module('hrmasterApp.controllers', ["ngRoute","ngSanitize", "ngCookies","ngMaterial",'ngAnimate','ui.grid', 'ui.grid.edit', 'ui.grid.resizeColumns', 'angularUtils.directives.dirPagination']);

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


app.controller('loadingController', ['$scope', function ($scope) {
    $scope.loadingMessage = $rootScope.loadingMessage;
}]);

app.controller('termsconditionsController', ['$scope', function ($scope) {
    $scope.mtaphone = "(02) 9016 9000";
}]);

app.controller('dashboardController', ['$scope', '$rootScope', 'cookie', function ($scope, $rootScope, cookie) {

    var userData = cookie.checkLoggedIn();
    cookie.getPermissions();

    $scope.GoBack = function() {
        $location.path('/');
    }
}]);

app.controller('employeeController', ['$scope', '$rootScope', 'cookie','uiGridConstants', 'hrmAPIservice', function ($scope, $rootScope, cookie, uiGridConstants, hrmAPIservice) {
    var userData = cookie.checkLoggedIn();
    cookie.getPermissions();

    $scope.pageTitle = "Employees Details";


    $scope.gridOptionsComplex = {
      enableFiltering: true,
      showGridFooter: false,
      showColumnFooter: false,
      columnDefs: [
        { name: 'name', width: 200 },
        { name: 'phone', width: 150, cellClass: 'center' },
        { name: 'email', width: 200, enableFiltering: true, cellClass: 'center' },
        { name: 'StateName', width: 182, cellClass: 'center' },
        { name: 'gender', filter: { term: '' }, width: 110, enableCellEdit: false,
            cellClass: function(grid, row, col, rowRenderIndex, colRenderIndex) {
                if (grid.getCellValue(row,col) === 'Male') {
                    return 'center blue';
                } else if (grid.getCellValue(row,col) === 'Female') {
                    return 'center green';
                }
            }
        },
        { name: 'status', width: 180, enableFiltering: false, cellClass: 'center'


        },
        { name: 'action', enableFiltering: false, width: 120, cellClass: 'center',
            cellTemplate: '<div class="ui-grid-cell-contents" title="TOOLTIP">{{grid.appScope.cumulative(grid, row)}} <i class="fa fa-edit fa-2x "></i><i class="fa fa-trash-o fa-2x text-danger" data-toggle="modal" data-target=".bs-example-modal-sm"></i></div>'
        }
      ]
    };

    hrmAPIservice.getEmployeeData().then(function(response) {
        $scope.gridOptionsComplex.data = response.data.employees;
        $scope.countryList = response.data.countries;
        $scope.stateList = response.data.states;
        $scope.personList = response.data.persontype;
    });

    $scope.saveEmployee = function() {
        hrmAPIservice.saveEmployee($scope.emp, $scope.empwork).then(function(response) {
            $scope.gridOptionsComplex.data = response.data.employees;
        });
    }

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
        hrmAPIservice.saveUser($scope.user).then(function(response) {
            $scope.showMessage = 1;
            $scope.success = response.data.success;
            $scope.userMessage = response.data.message;
        });
    };


}]);

app.controller('contactusController', ['$scope', '$rootScope', 'cookie', function ($scope, $rootScope, cookie) {

    var userData = cookie.checkLoggedIn(true);


}]);

app.controller('privacyController', ['$scope', '$rootScope', 'cookie', function ($scope, $rootScope, cookie) {
    var userData = cookie.checkLoggedIn(true);

}]);

app.controller('termsController', ['$scope', '$rootScope', 'cookie', function ($scope, $rootScope, cookie) {
    var userData = cookie.checkLoggedIn(true);
}]);

app.controller('trademarksController', ['$scope', '$rootScope', 'cookie', function ($scope, $rootScope, cookie) {
    var userData = cookie.checkLoggedIn(true);
}]);

app.controller('logoutController', ['cookie','$location','$rootScope', function (cookie, $location, $rootScope) {
    cookie.deleteCookie('user');
    cookie.deleteCookie('permissions');
    $rootScope.isLoggedin = 0;
    $location.path('/');
}]);


app.controller('permissionsController', ['$scope', '$rootScope', 'cookie','hrmAPIservice', function ($scope, $rootScope, cookie, hrmAPIservice) {
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
                $scope.permissions.read[obj.module] = obj.read;
                $scope.permissions.write[obj.module] = obj.write;
                $scope.permissions.delete[obj.module] = obj.delete;
            });
        });
    }

    $scope.savePermissions = function() {
        hrmAPIservice.savePermissions($scope.userrole, $scope.permissions).then(function(response) {
            $scope.showMessage      = 1;
            $scope.success          = 1;
            $scope.userMessage = "The permissions have been updated successfully";
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
            model: '=ngModel',
            'isRequired': '@'
        },
        template : `<div class="form-group row">
                        <label class="control-label col-sm-4">{{fldLabel}}</label>
                        <div class="col-sm-8">
                            <input type="text" class="form-control" ng-model="model" ng-required="{{isRequired}}" />
                            <span id="errormsg_lastname" style="display:none;" class="text-danger"></span>
                        </div>
                    </div>`,
        link: function(scope, element, attrs){

        }
    };
})
.directive("userMessage", function() {
    return {
        scope: { obj: '=' },
        template : '<div class="user-message">{{ obj.userMessage }}</div>'
    };
});
