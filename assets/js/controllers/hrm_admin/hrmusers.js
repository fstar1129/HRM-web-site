app.controller('hrmusersController', ['$scope', '$rootScope', 'cookie','uiGridConstants', 'hrmAPIservice', function ($scope, $rootScope, cookie, uiGridConstants, hrmAPIservice) {
    var userData = cookie.checkLoggedIn();
    cookie.getPermissions();

    $scope.pageTitle = "User Details";
    $scope.users = [];
    $scope.roleList = [];

    hrmAPIservice.getUserData(userData, 1).then(function(response) {
        console.log("Get User Data: ", response);
        users = response.data.users;
        $scope.roleList = response.data.roles;

        filterUserList(users);
    });

    function filterUserList(users) {
        //Fitler Something for User list.
        for(var i = 0; i < users.length; i++) {
            var item = users[i];
            var usertype_id = item["usertype_id"];

            for(var j = 0; j < $scope.roleList.length; j++) {
                var role = $scope.roleList[j];
                if(role["id"] == usertype_id) {
                    item["role"] = role["display_text"];
                    break;
                }
            }
        }

        $scope.users = users;
    }

    // Sort function.
    $scope.sort = function(keyname){
        $scope.sortKey = keyname;   //set the sortKey to the param passed
        $scope.reverse = !$scope.reverse; //if true make it false and vice versa
    };

    $scope.deleteUser = function(user) {
        var answer = confirm("Delete user " + user.firstname + ' ' + user.lastname + '? Are you sure?');
        if (answer) {
            hrmAPIservice.delete(user, userData, 'user').then(function(response) {
                hrmAPIservice.getUserData(userData, 1).then(function(response) {
                    filterUserList(response.data.users);
                });
            });
        }
    }

    $scope.newUser = function() {
        location.href = "#/add_hrmuser";
    }


    $scope.editUser = function(user) {
        location.href = "#/edit_hrmuser/" + user.id;
    };

    $scope.activateUser = function(row, status) {
        hrmAPIservice.activateUser(row.id, status).then(function(response) {
            hrmAPIservice.getUserData(userData, 1).then(function(response) {
                filterUserList(response.data.users);
            });
        });
    }
}]);
