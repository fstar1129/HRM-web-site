app.controller("trainingcourselistController", ["$scope", "$rootScope", "cookie", "hrmAPIservice", '$location', function($scope, $rootScope, cookie, hrmAPIservice, $location) {
   
    var userData = cookie.checkLoggedIn();
    cookie.getPermissions();
    $scope.pageTitle = "Training Courses";
    $scope.courses = [];
    $scope.showModal = false;


    hrmAPIservice.getCoursesByUser(userData.id).then(function(response) {
       $scope.gridOptionsComplex.data = response.data;
    });

    $scope.gridOptionsComplex = {
      enableFiltering: true,
      showGridFooter: false,
      showColumnFooter: false,
      onRegisterApi: function onRegisterApi(registeredApi) {
          gridApi = registeredApi;
      },
      columnDefs: [
        { name: 'id', visible: false },
        { name: 'course', width: '30%' },
        { name: 'CourseStatus', width: '20%', cellClass: 'center', enableCellEdit: false, 
            cellClass: function(grid, row, col, rowRenderIndex, colRenderIndex) { 
                if (grid.getCellValue(row,col) == 'Pending') {
                    return 'center pending';
                } else if (grid.getCellValue(row,col) == 'Overdue') {
                    return 'center expired';
                } else {
                    return 'center completed';
                }
            },
            cellTemplate : '<a href="javascript:void(0);" ng-click="grid.appScope.gotoCourse(row.entity,1)">{{ grid.getCellValue(row, col) }}</a>'
        },
        { name: 'DateStarted', width: '20%', enableFiltering: true, cellClass: 'center' },
        { name: 'DateCompleted', width: '20%', cellClass: 'center', enableCellEdit: false },
        { name: 'TimeLeft', filter: { term: '' }, width: '10%', enableCellEdit: false,  enableFiltering: true,
            cellClass: function(grid, row, col, rowRenderIndex, colRenderIndex) {
                if (grid.getCellValue(row,col) < 0) {
                    return 'center expired';
                } else {
                    return 'center';
                }
            }
        }
      ]
    };
    
    $scope.gotoCourse = function(courseObj) {
        if (courseObj.CourseStatus == 'Completed' || courseObj.CourseStatus == 'Overdue') {
            return;
        }                
        
        $location.path('/docourse/' + courseObj.course_id + '/' + courseObj.employee_id);
    }


}]);