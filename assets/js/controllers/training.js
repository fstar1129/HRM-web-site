app.controller("trainingController", ["$scope", "$rootScope", "cookie", "hrmAPIservice", function($scope, $rootScope, cookie, hrmAPIservice) {
    var userData = cookie.checkLoggedIn(false);    
    var courseCategory = [];
    cookie.getPermissions();
    $scope.pageTitle = "";
    $scope.courses = [];
    $scope.showModal = false;

    var selectedCourse = null;

    hrmAPIservice.getCourseData(userData.id).then(function(response) {
        //console.log('Get Course Data: ', response.data.courses);
       var courses = response.data.courses;
       filterCourses(courses);
    });

    function filterCourses(courses) {
        for(var i = 0; i < courses.length; i++) {
            var course = courses[i];
            if(course.user_id == userData.id) {
                course["can_edit"] = true;
            }
            else {
                course["can_edit"] = false;
            }
        }
        $scope.courses = courses;
        //console.log($scope.courses);
    }
    // Sort function.
    $scope.sort = function(keyname){
        $scope.sortKey = keyname;   //set the sortKey to the param passed
        $scope.reverse = !$scope.reverse; //if true make it false and vice versa
    };


    // Active or Inactive Course.
    $scope.activateCourse = function(course, status) { 
        if (status == 0) {
            if (course.NumLearners > 0) {
                var response = confirm("Warning, there are " + course.NumLearners + " learners who currently have this course pending. Do you wish to continue?");
                if (!response) {
                    return;
                }
            }
        }
        hrmAPIservice.activateCourse(course.course_id, status).then(function(response) {
            course.status = status;
        })
    }

    // Remove Course.
    $scope.removeCourse = function(course) {
        $scope.showModal = true;
        selectedCourse = course;
        // confirm("Delete employee " + empDetail.firstname + " " + empDetail.lastname + "? Are you sure?") && )
    };

    $scope.remove = function() {
        $scope.showModal = false;
        if(selectedCourse != null) {
            hrmAPIservice.delCourse(selectedCourse.course_id, userData.id).then(function(response) {
                //console.log(response);
                var courses = response.data.courses;
                filterCourses(courses);
            });
        }
    };

    $scope.cancel = function() {
        $scope.showModal = false;
    };

    $scope.editCourse = function(course) {
        location.href = "#/edit_course/" + course.course_id;
    };

    $scope.newCourse = function() {
        console.log("new");
        location.href = "#/add_course";
    }

    /*
    $scope.gridOptionsComplex = {
        enableFiltering: true,
        showGridFooter: !1,
        showColumnFooter: !1,
        onRegisterApi: function(registeredApi) {
            gridApi = registeredApi
        },
        columnDefs: [{
            name: "id",
            visible: !1
        }, {
            name: "course_name",
            width: "20%"
        }, {
            name: "course_description",
            width: "10%",
            cellClass: "center"
        }, {
            name: "course_type",
            width: "15%",
            enableFiltering: !0,
            cellClass: "center"
        }, {
            name: "course_category_name",
            width: "15%",
            cellClass: "center",
            filter: {
                type: uiGridConstants.filter.SELECT, // <- move this to here
                selectOptions: courseCategory 
            }
        },  {
            name: "status",
            width: "20%",
            enableFiltering: !1,
            cellClass: "center",
            cellTemplate: '<button class="btn btn-sm" ng-class="{\'btn-success\': row.entity.status == 1, \'btn-default\': row.entity.status == 0 }" style="margin-right: 0; border-top-right-radius: 0; border-bottom-right-radius: 0; " ng-click="grid.appScope.activateCourse(row.entity,1)">Active</button><button class="btn btn-sm btn-default" ng-class="{\'btn-success\': row.entity.status == 0, \'btn-default\': row.entity.status == 1 }" ng-click="grid.appScope.activateCourse(row.entity,0)" style="border-top-left-radius: 0; border-bottom-left-radius: 0;">Inactive</button></a>'
        }, {
            name: "action",
            enableFiltering: !1,
            width: "10%",
            cellClass: "center",
            cellTemplate: '<div class="ui-grid-cell-contents"><i class="fa fa-edit fa-2x" ng-click="grid.appScope.editCourse(row.entity)"></i><i class="fa fa-trash-o fa-2x text-danger" ng-click="grid.appScope.delCourse(row.entity)"></i></div>'
        },
        { name: 'course_category_id', visible: false },
        { name: 'course_id', visible: false },
        
        ]
    }, $scope.deleteTraining = function(empDetail) {
        confirm("Delete employee " + empDetail.firstname + " " + empDetail.lastname + "? Are you sure?") && hrmAPIservice.delete(empDetail, userData, "employee").then(function(response) {
            $scope.gridOptionsComplex.data = response.data.employees
        })
    }, $scope.newCourse = function() {
        $scope.courseform.$setPristine(),  
        $scope.formEnabled = 1;
        $scope.course = {};
        $scope.course_type.type_1 = 'Multiple Choice' ;
        $scope.active_course.active = 'active' ;
        
    }, $scope.clearForm = function() {
        $scope.formEnabled = 0,
        $scope.course = {};
       
        $scope.course_type.type_1 = 'Multiple Choice' ;
        $scope.active_course.active = 'active' ;
    };
    var setDate = function(date) {
        var a = date.split("-");
        return new Date(a[0], a[1] - 1, a[2])
    };
    
    $scope.activateCourse = function(row, status) {
        hrmAPIservice.activateCourse(row.course_id, status).then(function(response) {
            hrmAPIservice.getCourseData().then(function(response) {
                $scope.gridOptionsComplex.data = response.data.courses;
            })
        })
    }, hrmAPIservice.getCourseData().then(function(response) {
            //console.log('response', response.data.courses);
            $scope.gridOptionsComplex.data = response.data.courses ;
            $scope.course_type = course_type ;
            $scope.active_course = active_course ;
            
    }), hrmAPIservice.getCourseCategory().then(function(response) {
            
            response.data.course_category.forEach(function(element, index){
                var temp = '{ "value" : "' + response.data.course_category[index].course_category_name + '", "label" : "' + response.data.course_category[index].course_category_name + '", "id" : "' + response.data.course_category[index].course_category_id + '" }' ;
                var temp_1 = '{ "value" : "' + response.data.course_category[index].course_category_id + '", "label" : "' + response.data.course_category[index].course_category_name + '" }';
                //console.log('temp', temp);
                courseCategory.push(JSON.parse(temp)); 
                
            });
            $scope.course_category = courseCategory; 
            //console.log($scope.course_category);
           
    }), 
    
    $scope.editCourse = function(courseDetail) {
        //console.log(courseDetail);
        if(typeof courseDetail !== 'undefined'){
            $scope.formEnabled = 1,
            $scope.course.category = courseDetail.course_category_id; 
            $scope.course.course_name = courseDetail.course_name;
            $scope.course.course_desc = courseDetail.course_description;
            $scope.course_type.type_1 = courseDetail.course_type;
            $scope.course.course_id = courseDetail.course_id;
           
            $scope.active_course.active = (courseDetail.status == '1' )? 'active' : 'inactive' ;    
             //$scope.course.status = ($scope.active_course == 'active')? 1 : 0;
        }
        
   
    };
    
    $scope.saveCourse = function() {
        var data = {}
        data['course_description'] = $scope.course.course_desc;
        data['course_name'] =  $scope.course.course_name;
        data['course_id'] =  $scope.course.course_id;
        data['course_category_id'] =  $scope.course.category;
        data['course_type'] =  $scope.course_type.type_1;
        
        $scope.course.status = ($scope.active_course.active == 'active')? 1 : 0;
        data['status'] =  $scope.course.status;
          
        //console.log('course_id', $scope.course.course_id);
        if(typeof $scope.course.course_id === 'undefined'){
           // alert('You can not update !');
            data = JSON.stringify(data);
             hrmAPIservice.saveCourse(data).then(function(response) {
                console.log(response);
                if (response.data.success == 0) {
                  
                } else {
              
                }
                
                $scope.gridOptionsComplex.data = response.data.courses;
                $scope.clearForm();
            });
          //  alert(data);
            
        }
        else{
            data = JSON.stringify(data);
           // alert(data);
            hrmAPIservice.saveCourse(data).then(function(response) {
                console.log(response);
                if (response.data.success == 0) {
                  
                } else {
              
                }
                
                $scope.gridOptionsComplex.data = response.data.courses;
                $scope.clearForm();
            });
        }
        
 
    }
    
    $scope.addCourse = function(courseId) {
        location.href = "#/addCourses/" + courseId;
    }
    
    $scope.delCourse = function(row) {
        var answer = confirm("Delete Course " + row.course_name +  '? Are you sure?');
        if (answer) {
            hrmAPIservice.delCourse(row.course_id).then(function(response) {
                $scope.gridOptionsComplex.data = response.data.courses;
            });
        }
    }
    */

}]);