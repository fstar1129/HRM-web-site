angular.module('hrmasterApp.services', [])

    .factory('hrmAPIservice', function($http) {

       var hrmAPI = {};

       hrmAPI.doLogin = function(usr, pw) {
           return $http({
               method: 'POST',
               data: {action: 'doLogin', username: usr, password: pw},
               url: 'assets/php/ajax.php'
           });
       };

       hrmAPI.forgotPassword = function(email) {
           return $http({
               method: 'POST',
               data: { action: 'forgotPassword', email: email },
               url: 'assets/php/ajax.php'
           });
       };

       hrmAPI.resetPassword = function(u,p) {
           return $http({
               method: 'POST',
               data: { action: 'resetPassword', username: u, password: p },
               url: 'assets/php/ajax.php'
           });
       };

       hrmAPI.getEmailFromHash = function(hash) {
           return $http({
               method: 'POST',
               data: { action: 'getEmailFromHash', hash: hash },
               url: 'assets/php/ajax.php'
           });
       };


       hrmAPI.getPageContent = function(page_id) {
           return $http({
               method: 'POST',
               data: { action: 'getPageContent', state: 'NSW', pageId: page_id },
               url: 'assets/php/ajax.php'
           });
       };

       hrmAPI.getPermissionData = function() {
           return $http({
               method: 'POST',
               data: { action: 'getPermissionData' },
               url: 'assets/php/ajax.php'
           });
       };

       hrmAPI.savePermissions = function(role, modules) {
           return $http({
               method: 'POST',
               data: { action: 'savePermissions', role: role, modules: modules },
               url: 'assets/php/ajax.php'
           });
       };

       hrmAPI.getPermissions = function(role) {
           return $http({
               method: 'POST',
               data: { action: 'getPermissions', role: role },
               url: 'assets/php/ajax.php'
           });
       };

       hrmAPI.getRoles = function() {
           return $http({
               method: 'POST',
               data: { action: 'getRoles' },
               url: 'assets/php/ajax.php'
           });
       };

       hrmAPI.getEmployees = function() {
           return $http({
               method: 'POST',
               data: { action: 'getEmployees' },
               url: 'assets/php/ajax.php'
           });
       };

       hrmAPI.getEmployeeData = function() {
           return $http({
               method: 'POST',
               data: { action: 'getEmployeeData' },
               url: 'assets/php/ajax.php'
           });
       };

       hrmAPI.saveEmployee = function(emp, empwork) {
           return $http({
               method: 'POST',
               data: { action: 'saveEmployee', emp: emp, empwork: empwork },
               url: 'assets/php/ajax.php'
           });
       };

       hrmAPI.saveUser = function(user) {
           return $http({
               method: 'POST',
               data: { action: 'saveUser', user: user },
               url: 'assets/php/ajax.php'
           });
       };




       return hrmAPI;
    })

    .factory('cookie',  function($rootScope, $location, $cookies, $route) {

        var obj = {};

        obj.checkLoggedIn = function(returnStatus) {
            returnStatus = (angular.isDefined(returnStatus)) ? returnStatus : false;
            var userData = this.getCookie('user');
            if (userData === false) {
                $rootScope.isLoggedin = 0;
                if (!returnStatus) {
                    $location.path('/');
                    return;
                }
            }
            $rootScope.isLoggedin = 1;
            $rootScope.showHeader = 0;
            return userData;
        }

        obj.getPermissions = function() {
            var perms = this.getCookie('permissions');
            $rootScope.perms = {};

            var controller = $route.current.controller.replace("Controller", "");
            angular.forEach(perms, function(obj, key) {
                var cntl = obj.controller;
                $rootScope.perms[cntl] = {};
                $rootScope.perms[cntl]['read']    = (angular.isDefined(obj.read)) ? obj.read : 0;
                $rootScope.perms[cntl]['write']   = (angular.isDefined(obj.write)) ? obj.write : 0;
                $rootScope.perms[cntl]['delete']  = (angular.isDefined(obj.delete)) ? obj.delete : 0;

                if (controller == cntl) {
                    if ($rootScope.perms[cntl]['read'] == 0) {
                        $location.path('/');
                        return;
                    }
                }
            });
        }

        obj.setCookie = function(name, value, lengthHours) {
            lengthHours = .25;
            var d = new Date();

            var sessionHours = lengthHours * 60 * 60 * 1000;

            d.setTime(d.getTime() + sessionHours);
            var expires = d.toUTCString();
            $cookies.putObject(name, value, {'expires': expires});
        }

        obj.getCookie = function(name) {
            var cook = $cookies.getObject(name);
            return (angular.isDefined(cook)) ? cook : false;
        }

        obj.deleteCookie = function(name) {
            $cookies.remove(name);
        }

        obj.checkCookie = function(cookieName) {
            var callSearch = obj.getCookie(cookieName);
            return (callSearch == "") ? false : callSearch;
        }

        return obj;


    });
