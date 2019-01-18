app.controller("AllocCourseController", ["$scope", "$rootScope", "cookie", "hrmAPIservice", "$location",  function($scope, $rootScope, cookie, hrmAPIservice, $location) {
    var userData = cookie.checkLoggedIn(), courseCategory = [];
    cookie.getPermissions();


    // list of `state` value/display objects
    $scope.cs = {};
    //$scope.ctrl.states        = loadAll();
    $scope.cs.selectedItem  = null;
    $scope.cs.searchText    = null;



    $scope.pageTitle = "";
    $scope.course_keyword = "";
    $scope.alloc_course = {
        course_id: '',
        course_supervisor: '',
        course_description: '',
        employee_id: '',
        alloc_date: '',
        expire_hours: 0,
        is_sending_email: true,
        status: 0,
        user_id: userData.id,
    };
    
    $scope.course_supervisor = '';

    $scope.show_expire_date_field = false;
    $scope.alloc_date_type = 'now';

    // $scope.course_name_list = [];
    $scope.course_list = [];
    $scope.course = {};

    $scope.user_name_list = [];
    $scope.user_list = [];
    $scope.employee_list = [];
    $scope.allusers = [];
    $scope.employee = {};

    // Get Course List.
    hrmAPIservice.getCourseData(userData.id, true).then(function(response) {
        var courses = response.data.courses;
        $scope.course_list = courses;

        hrmAPIservice.getUsers(userData, 0).then(function(response) {
            //$scope.allusers = response.data;
            $scope.allusers = response.data.map(function(usr) {
                return {
                    value: usr.id,
                    display: usr.firstname + " " + usr.lastname
                };
            });
        });
    });
    
    $scope.selectEmployee = function() { 
        $scope.alloc_course.employee_id = $scope.cs.employee_name.value;
    }      
    
    $scope.selectSupervisor = function() { 
        $scope.alloc_course.course_supervisor = $scope.cs.course_supervisor.value;
    }      
    
    $scope.cs.querySearch = function(query) { 
        if(query != null && query.length > 0) {
            return $scope.allusers.filter(function(user) {
               return user.display.toLowerCase().indexOf(query.toLowerCase()) > -1;
            });                        
        }
    }
    
    $scope.cs.employeeSearch = function(query) {
        if(query != null && query.length > 0) {
            return $scope.allusers.filter(function(user) {
               return user.display.toLowerCase().indexOf(query.toLowerCase()) > -1;
            });                        
        }
    }   
    
    $scope.updateDescription = function() {
        $scope.alloc_course.course_description  = '';
        
        angular.forEach($scope.course_list, function(node) {          
            if ($scope.alloc_course.course_id == node.course_id) {
                $scope.alloc_course.course_description = node.course_description;
            }
        });        
    }
    
    $scope.expire_hours = {
        availableOptions: [
            {"value": '24', "title": '24 hours'},
            {"value": '48', "title": '48 hours'},
            {"value": '72', "title": '72 hours'},
            {"value": 120, "title": "5 days"},
            {"value": 168, "title": "7 days"},
            {"value": 336, "title": "14 days"},
            {"value": 504, "title": "21 days"},
            {"value": 672, "title": "28 days"},
        ],
        selectedOption: {value: '24', title: '24 hours'} //This sets the default value of the select in the ui
    };

    $scope.changedEnterDate = function() {
        alert($scope.alloc_date_type);
        if($scope.alloc_date_type == 'enter_date') {
            $scope.show_expire_date_field = true;
        }
        else {
            $scope.show_expire_date_field = false;
        }
    };

    // Save Course.
    $scope.save = function() {

        if($scope.course == null || $scope.course == '' || $scope.alloc_course.course_id == null) {
            alert("Please choose course");
            return;
        }

        if($scope.alloc_course.course_supervisor == null || $scope.alloc_course.course_supervisor == '') {
            alert("Please choose course supervisor");
            return;
        }

        if($scope.alloc_course.employee_id == null || $scope.alloc_course.employee_id == '' || $scope.alloc_course.employee_id == null) {
            alert("Please choose employee");
            return;
        }

        if($scope.alloc_date_type == 'now') {
            var date = new Date();
            var year = date.getFullYear();
            
            var m = date.getMonth() + 1;
            var month = (m > 9) ? m : '0' + m;
            var day = (date.getDate() > 9) ? date.getDate() : '0' + date.getDate();
            var hours = (date.getHours() > 9) ? date.getHours() : '0' + date.getHours();
            var minutes = (date.getMinutes() > 9) ? date.getMinutes() : '0' + date.getMinutes();
            var seconds = (date.getSeconds() > 9) ? date.getSeconds() : '0' + date.getSeconds();

            var alloc_date = year + "-" + month + "-" + day + " " + hours + ":" + minutes + ":" + seconds;
            $scope.alloc_course.alloc_date = alloc_date;
        }
        else {
            $scope.alloc_course.alloc_date = $scope.enter_alloc_date;
        }


        hrmAPIservice.allocCourse($scope.alloc_course).then(function(response) {
           goBack();
        });
    };

    // Cancel Course.
    $scope.cancel = function() {
        goBack();
    };

    function goBack() {
        $location.path("/allocatetraining");
    }
}]);