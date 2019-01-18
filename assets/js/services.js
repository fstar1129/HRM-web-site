app.service('hrmAPIservice', function($http) {

       var hrmAPI = {};

       hrmAPI.doLogin = function(usr, pw) {
           return $http({
               method: 'POST',
               data: { username: usr, password: pw },
               url: 'auth/login'
           });
       };

       hrmAPI.forgotPassword = function(email) {
           return $http({
               method: 'POST',
               data: { email: email },
               url: 'auth/forgotpassword'
           });
       };

       hrmAPI.resetPassword = function(u,p) {
           return $http({
               method: 'POST',
               data: { username: u, password: p },
               url: 'auth/resetpassword'
           });
       };

       hrmAPI.getEmailFromHash = function(hash) {
           return $http({
               method: 'POST',
               data: { hash: hash },
               url: 'auth/getemailfromhash'
           });
       };

       hrmAPI.getPermissionData = function() {
           return $http({
               method: 'POST',
               data: { },
               url: 'auth/getpermissiondata'
           });
       };

       hrmAPI.savePermissions = function(role, modules) {
           return $http({
               method: 'POST',
               data: { role: role, modules: modules },
               url: 'auth/savepermissions'
           });
       };

       hrmAPI.getPermissions = function(role) {
           return $http({
               method: 'GET',
               data: { },
               url: 'auth/getpermissions/' + role
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

       hrmAPI.getEmployeeData = function(userData) {
           return $http({
               method: 'POST',
               data: { action: 'getEmployeeData', currUser: userData },
               url: 'assets/php/ajax.php'
           });
       };

       hrmAPI.getUserData = function(userData, isAdmin) {
           isAdmin = (angular.isDefined(isAdmin)) ? isAdmin : 0
           return $http({
               method: 'POST',
               data: { currUser: userData, 'admin' : isAdmin },
               url: 'user/getdata'
           });
       };

       hrmAPI.saveEmployee = function(emp, empwork, userData) {
           return $http({
               method: 'POST',
               data: { action: 'saveEmployee', emp: emp, empwork: empwork, currUser: userData },
               url: 'assets/php/ajax.php'
           });
       };

    /*   hrmAPI.deleteEmployee = function(empDetail, userData) {
           return $http({
               method: 'POST',
               data: { action: 'deleteEmployee', empDetail: empDetail, currUser: userData },
               url: 'assets/php/ajax.php'
           });
       };
*/
       hrmAPI.delete = function(detail, userData, type) {
           return $http({
               method: 'POST',
               data: { typeDetail: detail, currUser: userData, type: type },
               url: 'delete'
           });
       };

       hrmAPI.get = function(id, type) {
           return $http({
               method: 'GET',
               data: { },
               url: 'get/' + type + '/' + id
           });
       };



       hrmAPI.saveUser = function(user, userData, newaccount) {
           return $http({
               method: 'POST',
               data: { user: user, userData: userData, newaccount: newaccount },
               url: 'user/save'
           });
       };

       hrmAPI.releaseLock = function(userId) {
           return $http({
               method: 'POST',
               data: { action: 'releaseLock', userId: userId },
               url: 'assets/php/ajax.php'
           });
       };

       hrmAPI.activateEmployee = function(employeeId, status) {
           return $http({
               method: 'POST',
               data: { action: 'activateEmployee', employeeId: employeeId, status: status },
               url: 'assets/php/ajax.php'
           });
       };

       hrmAPI.activateUser = function(userId, status) {
           return $http({
               method: 'POST',
               data: { userId: userId, status: status },
               url: 'user/activateuser'
           });
       };




       return hrmAPI;
   });

app.service('cookie', function($rootScope, $location, $cookies, $route) {    

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
