app.controller("TrainDashboardController", ["$scope", "$rootScope", "cookie", "hrmAPIservice", "$routeParams",  function($scope, $rootScope, cookie, hrmAPIservice, $routeParams) {
    var userData = cookie.checkLoggedIn(), courseCategory = [];
    cookie.getPermissions();

    console.log(userData);

    $scope.pageTitle = "Dashboard";
    $scope.alloc_courses = [];
    $scope.showModal = false;

    // Sort function.
    $scope.sort = function(keyname){
        $scope.sortKey = keyname;   //set the sortKey to the param passed
        $scope.reverse = !$scope.reverse; //if true make it false and vice versa
    };

    hrmAPIservice.getAllocCourseData(userData.id).then(function(response) {
        console.log('Get Alloc Course Data: ', response.data.alloc_courses);
        var alloc_courses = response.data.alloc_courses;
        filterAllocCourseData(alloc_courses);
    });

    function filterAllocCourseData(alloc_courses) {
        var courses = [];
        for(var i = 0; i < alloc_courses.length; i++) {
            var item = alloc_courses[i];
            var status = item.status;

            //Completed.
            if(status == 1) {
                item["course_status"] = "Completed";
                item["status_class"] = "green";
                var completed_date = new Date(item["completed_date"]);
                var day = completed_date.getDate()
                var month = completed_date.getMonth() + 1
                var year = completed_date.getFullYear()
                var completed_string = day + "/" + month + "/" + year;

                item["days_remain"] = completed_string;
            }
            else if(status == 0) {
                var alloc_date = item["alloc_date"];
                var expire_hours = item["expire_hours"];

                var date1 = new Date(alloc_date);
                var date1 = dateAdd(date1, expire_hours, 'hours');
                var date2 = new Date();

                var timeDiff = date1.getTime() - date2.getTime();
                var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));

                item["days_remain"] = diffDays;

                if(diffDays >= 0) {
                    item["course_status"] = "Pending";
                    item["status_class"] = "blue";
                }
                else {
                    item["course_status"] = "Overdue";
                    item["status_class"] = "red";
                }

            }

            courses[i] = item;
        }
        $scope.alloc_courses = courses;
    }

    $scope.allocCourse = function() {
        console.log("allocCourse");
        location.href = "#/alloc_course";
    }

    function dateAdd(original, increment, unit) {

        // Return undefiend if first argument isn't a Date object
        if (!(original instanceof Date)) {
            return(undefined);
        }

        switch(unit) {
            case 'seconds':
                // Add number of secodns to current date (ms*1000)
                var newDate = new Date(original);
                newDate.setTime(original.getTime() + (increment*1000));
                return newDate;
                break;
            case 'minutes':
                // Add number of minutes to current date (ms*1000*60)
                var newDate = new Date(original);
                newDate.setTime(original.getTime() + (increment*1000*60));
                return newDate;
                break;
            case 'hours':
                // Add number of hours to current date (ms*1000*60*60)
                var newDate = new Date(original);
                newDate.setTime(original.getTime() + (increment*1000*60*60));
                return newDate;
                break;
            case 'days':
                // Add number of days to current date
                var newDate = new Date(original);
                newDate.setDate(original.getDate() + increment);
                return newDate;
                break;
            case 'weeks':
                // Add number of weeks to current date
                var newDate = new Date(original);
                newDate.setDate(original.getDate() + (increment*7));
                return newDate;
                break;
            case 'months':
                // Get current date
                var oldDate = original.getDate();

                // Increment months (handles year rollover)
                var newDate = new Date(original);
                newDate.setMonth(original.getMonth() + increment);

                // If new day and old day aren't equal, set new day to last day of last month
                // (handles edge case when adding month to Jan 31st for example. Now goes to Feb 28th)
                if (newDate.getDate() != oldDate) {
                    newDate.setDate(0);
                }

                // Handle leap years
                // If old date was Feb 29 (leap year) and new year isn't leap year, set new date to Feb 28
                if (original.getDate() == 29 && !isLeapYear(newDate.getFullYear())) {
                    newDate.setMonth(1);
                    newDate.setDate(28);
                }

                return newDate;
                break;
            case 'years':
                // Increment years
                var newDate = new Date(original);
                newDate.setFullYear(original.getFullYear() + increment);

                // Handle leap years
                // If old date was Feb 29 (leap year) and new year isn't leap year, set new date to Feb 28
                if (original.getDate() == 29 && !isLeapYear(newDate.getFullYear())) {
                    newDate.setMonth(1);
                    newDate.setDate(28);
                }

                return newDate;
                break;
            // Defaults to milliseconds
            default:
                var newDate = new Date(original);
                newDate.setTime(original.getTime() + increment);
                return newDate;
        }
    };

    function isLeapYear(year) {
        return (((year % 4 === 0) && (year % 100 !== 0)) || (year % 400 === 0));
    }

    // Remove Course.
    $scope.removeAllocCourse = function(course) {
        $scope.showModal = true;
        selectedCourse = course;
    };

    $scope.remove = function() {
        $scope.showModal = false;
        if(selectedCourse != null) {
            hrmAPIservice.delAllocCourse(selectedCourse.id, userData.id).then(function(response) {
                var alloc_courses = response.data.alloc_courses;
                filterAllocCourseData(alloc_courses);
            });
        }
    };

    $scope.cancel = function() {
        $scope.showModal = false;
    };

    $scope.editAllocCourse = function(course) {
        location.href = "#/edit_alloc_course/" + course.id;
    };

}]);

