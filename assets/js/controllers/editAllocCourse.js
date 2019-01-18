app.controller("EditAllocCourseController", ["$scope", "$rootScope", "cookie", "hrmAPIservice", "$routeParams",  function($scope, $rootScope, cookie, hrmAPIservice, $routeParams) {
    var userData = cookie.checkLoggedIn(), courseCategory = [];
    cookie.getPermissions();

    $scope.loading = 1;
    $scope.pageTitle = "";
    $scope.course_keyword = "";
    $scope.alloc_course_id = $routeParams.id;
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

    $scope.expire_hours = {
        availableOptions: [
            {"value": '24', "title": '24 hours'},
            {"value": '48', "title": '48 hours'},
            {"value": '72', "title": '72 hours'},
            {"value": '120', "title": "5 days"},
            {"value": '168', "title": "7 days"},
            {"value": '336', "title": "14 days"},
            {"value": '504', "title": "21 days"},
            {"value": '672', "title": "28 days"},
        ],
        selectedOption: {value: '24', title: '24 hours'} //This sets the default value of the select in the ui
    };
    
    // Get Course List.
    /*hrmAPIservice.getCourseData(userData.id).then(function(response) {
        var courses = response.data.courses;
        $scope.course_list = courses;

    });*/    
    
    

    $scope.show_expire_date_field = true;
    $scope.alloc_date_type = 'enter_date';

    $scope.course_name_list = [];
    $scope.course_list = [];

    $scope.user_name_list = [];
    $scope.user_list = [];

    // Get Alloc Course Data by selected ID.
    hrmAPIservice.getAllocCourseById($scope.alloc_course_id).then(function(response) {
        $scope.alloc_course = response.data.alloc_course;

        $scope.course_name = $scope.alloc_course.course.course_name;
        $scope.enter_alloc_date = new Date($scope.alloc_course.alloc_date);
        $scope.course_supervior = $scope.alloc_course.supervisor_user.firstname + " " + $scope.alloc_course.supervisor_user.lastname;
        $scope.employee_name = $scope.alloc_course.employee_user.firstname + " " + $scope.alloc_course.employee_user.lastname;
        $scope.alloc_course.course_description =  $scope.alloc_course.course.course_description;

        for(i = 0; i < $scope.expire_hours.availableOptions.length; i++) {
            var item = $scope.expire_hours.availableOptions[i];
            if(item["value"] == $scope.alloc_course.expire_hours) {
                $scope.expire_hours.selectedOption = item;
                break;
            }
        }
    });

    $scope.doChangeCourseName = function(typedthings) {
        if ($scope.loading === 1) {
            $scope.loading = 0;
            return;
        }        
        
        if(typedthings != null && typedthings.length > 0) {
            hrmAPIservice.searchCourse(typedthings).then(function(response) {
                var courses = response.data.courses;
                $scope.course_list = courses;

                var names = [];
                for(var i = 0; i < $scope.course_list.length; i++) {
                    var course_name = courses[i].course_name;
                    var course_id = courses[i].course_id;
                    names[i] = course_name;
                }

                $scope.course_name_list = names;
            });
        }
    }

    $scope.doSelectedCourseName = function(suggestion){
        $scope.alloc_course.course_description = '';   
        for(let i=0; i<$scope.course_list.length; i++) {
            if ($scope.course_list[i].course_name == suggestion) {
                $scope.course_name = $scope.course_list[i].course_name;
                $scope.alloc_course.course_id = $scope.course_list[i].course_id;
                $scope.alloc_course.course_description = $scope.course_list[i].course_description;
                break;
            }
        }
    }

    $scope.doChangeCourseSuperior = function(typedthings) {
        if(typedthings != null && typedthings.length > 0) {
            hrmAPIservice.searchUser(typedthings).then(function(response) {
                var users = response.data.users;
                $scope.user_list = users;

                var names = [];
                for(var i = 0; i < $scope.user_list.length; i++) {
                    var username = users[i].username;
                    var firstname = users[i].firstname;
                    var lastname = users[i].lastname;

                    names[i] = firstname + " " + lastname + "(" + username + ")";
                }

                $scope.user_name_list = names;
            });
        }
    }

    $scope.doSelectedCourseSuperior = function(suggestion) {
        var array = suggestion.split("(");

        var name = array[0];
        var username = array[1];

        $scope.course_supervior = name;
        username = username.replace(")", "");

        for(var i = 0; i < $scope.user_list.length; i++) {
            var user = $scope.user_list[i];
            if(user.username == username) {
                $scope.alloc_course.course_supervisor = user.id;
                break;
            }
        }
    }

    $scope.doSelectedEmployee = function(suggestion) {
        var array = suggestion.split("(");

        var name = array[0];
        var username = array[1];

        $scope.employee_name = name;
        username = username.replace(")", "");

        for(var i = 0; i < $scope.user_list.length; i++) {
            var user = $scope.user_list[i];
            if(user.username == username) {
                $scope.alloc_course.employee_id = user.id;
                break;
            }
        }
    }

    $scope.changedEnterDate = function() {        
        $scope.show_expire_date_field = ($scope.alloc_date_type == 'enter_date') ? true : false;        
    };

    // Save Course.
    $scope.save = function() {
        if($scope.alloc_course.course_id == null || $scope.alloc_course.course_id == '') {
            alert("Please Choose Course.");
            return;
        }

        if($scope.alloc_course.course_supervisor == null || $scope.alloc_course.course_supervisor == '') {
            alert("Please Choose Course Supervisor.");
            return;
        }

        if($scope.alloc_course.employee_id == null || $scope.alloc_course.employee_id == '') {
            alert("Please Choose Employee.");
            return;
        }

        if($scope.alloc_date_type == 'now') {
            var date = new Date();
            var year = date.getFullYear();
            var month = date.getMonth() + 1;
            var day = date.getDate();
            var hours = date.getHours();
            var minutes = date.getMinutes();
            var seconds = date.getSeconds();

            var alloc_date = year + "-" + month + "-" + day + " " + hours + ":" + minutes + ":" + seconds;
            $scope.alloc_course.alloc_date = alloc_date;
        } else {
            $scope.alloc_course.alloc_date = $scope.enter_alloc_date;
        }

        $scope.alloc_course.expire_hours = $scope.expire_hours.selectedOption.value;

        hrmAPIservice.updateAllocCourse($scope.alloc_course).then(function(response) {
            goBack();
        });
    };

    // Cancel Course.
    $scope.cancel = function() {
        goBack();
    };

    function goBack() {
        location.href = "#/allocatetraining";
    }
}]);