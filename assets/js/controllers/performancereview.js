app.controller('performancereviewController', ['$scope', '$rootScope', 'cookie','uiGridConstants', 'hrmAPIservice', function ($scope, $rootScope, cookie, uiGridConstants, hrmAPIservice) {
    var userData = cookie.checkLoggedIn();
    cookie.getPermissions();
    var perms = $rootScope.perms;
    $scope.edit_option = 0;
    $scope.p_forms_id = 0;
    $scope.pageTitle = "Performance Review";
    $scope.formEnabled = 0;
    $scope.master = {}; 
    
    $scope.gridOptionsComplex = {
        enableFiltering: true,
        showGridFooter: false,
        showColumnFooter: false,
        paginationPageSizes: [10, 20, 30],
        paginationPageSize: 10,
        onRegisterApi: function onRegisterApi(registeredApi) {
            gridApi = registeredApi;
        },
        columnDefs: [
          { name: 'id', visible: false },
          { name: 'p_forms_id', visible: false },
          { name: 'form_status', visible: false },
          { name: 'user_status', visible: false },
          { name: 'questions', visible: false },
          { name: 'scores', visible: false },
          { name: 'employee_name', displayName: 'Employee', width: '20%', enableCellEdit: false },
          { name: 'start_date', displayName: 'Start Date', width: '15%', enableFiltering: true, cellClass: 'center',enableCellEdit: false},
          { name: 'manager_name', displayName: 'Manager', width: '20%', enableCellEdit: false },
          { name: 'assessment_date', displayName: 'Date Reviewed', width: '15%', enableFiltering: true, cellClass: 'center',enableCellEdit: false},
          { name: 'days_before_review', displayName: 'Days Before Review', width: '20%', enableFiltering: true, cellClass: function(grid, row, col, rowRenderIndex, colRenderIndex) {
            if (grid.getCellValue(row ,col).substring(0, 1) == "-") {
              return 'red';
            } else if(grid.getCellValue(row ,col) / 1 < 8) {return 'yellow';}
            else {return 'green';}
          } ,enableCellEdit: false},
          { name: 'action', enableFiltering: false, width: '10%',  cellClass: 'center', enableCellEdit: false,
              cellTemplate: '<div class="ui-grid-cell-contents grid-center-cell"><span ng-click="grid.appScope.editForm(row.entity)"><span class="glyphicon glyphicon-edit text-edit"></span></span>&nbsp;&nbsp;&nbsp;<span ng-click="grid.appScope.deleteForm(row.entity)"><span class="glyphicon glyphicon-trash text-danger"></span></span></div>'
          }
        ]
    };
    $scope.calcDaysBeforeReview = function(assessment_date){
        var date1 = new Date(assessment_date);
        var date2 = new Date();
        var timeDiff = Math.abs(date2.getTime() - date1.getTime());
        var diffDays = "";
        var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
        if(diffDays == 0){
            return "today";
        }else if(date1 < date2 && diffDays == 1){
            diffDays *= -1;
            return diffDays += " day overdue";
        }else if(date1 < date2 && diffDays != 1){
            diffDays *= -1;
            return diffDays += " days overdue";
        }else if(date1 > date2 && diffDays == 1){
            return diffDays + " day overdue";
        }else if(date1 > date2 && diffDays != 1){
            return diffDays + " days overdue";
        }
    }
    $scope.calcDaysBeforeReviewNum = function(assessment_date){
        var date1 = new Date(assessment_date);
        var date2 = new Date();
        var timeDiff = Math.abs(date2.getTime() - date1.getTime());
        var diffDays = "";
        var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
        if(diffDays == 0){
            return 0;
        }else if(date1 < date2 && diffDays == 1){
            diffDays *= -1;
            return diffDays;
        }else if(date1 < date2 && diffDays != 1){
            diffDays *= -1;
            return diffDays;
        }else if(date1 > date2 && diffDays == 1){
            return diffDays;
        }else if(date1 > date2 && diffDays != 1){
            return diffDays;
        }
    }
    $scope.deleteForm = function(fDetail) {
        if(perms.performancereview.delete == 0) return;
        var answer = confirm("Delete the review for " + fDetail.employee_name + '? Are you sure?');
        if (answer) {
            if(fDetail.user_status == "pending"){
                alert("You can not delete a form on pending!");
                return;
            }
            hrmAPIservice.deleteFormReview(fDetail, userData).then(function(response) {
                $scope.displayGrid(response);
            });
        }
    }
    console.log(userData);
    $scope.editForm = function(obj) {
        $scope.formEnabled = 1;
        $scope.specializedQuestionList = [];
        $scope.scoreList = [];
        $scope.commentList = [];
        $scope.questions = obj.questions.split("~#");
        angular.forEach($scope.questions, function (value, key) {
            if(key < $scope.questions.length - 1) $scope.specializedQuestionList.push({id : key + 1, question_text : value});
        });  
        // if(obj.scores == ""){
            if(userData.firstname + ' ' + userData.lastname != obj.manager_name){
                $scope.edit_option = 0;
                return;
            }
            $scope.edit_option = obj.id; //review id
            $scope.p_forms_id = obj.p_forms_id; // form id
            return
        // }else{
        //     $scope.scores = obj.scores.split(",");
        //     angular.forEach($scope.scores, function (value, key) {
        //         if(key < $scope.scores.length - 1) $scope.scoreList.push({id : key + 1, score : value});
        //     });
        //     $scope.comments = obj.comments.split("~#");
        //     angular.forEach($scope.comments, function (value, key) {
        //         if(key < $scope.comments.length - 1) $scope.commentList.push({id : key + 1, comment : value});
        //     });
        // }
    }
    $scope.clearForm = function() {
        $scope.specializedQuestionList = angular.copy($scope.master);
        $scope.scoreList = angular.copy($scope.master);
        $scope.commentList = angular.copy($scope.master);
        $scope.formEnabled = 0;
        $scope.edit_option = 0;
    }
    $scope.displayGrid = function(response){
        
        $scope.gridOptionsComplex.data = response.data.form_reviews.filter(function(review){
            if(Math.ceil(review.frequency * 30 / 4) < $scope.calcDaysBeforeReviewNum(review.assessment_date)){
                console.log($scope.calcDaysBeforeReviewNum(review.assessment_date));
                return false;
            }
            return true;
        }).map(function(review){
            return{
                id: review.id,
                p_forms_id: review.p_forms_id,
                form_status: review.form_status,
                user_status: review.user_status,
                questions: review.questions,
                scores: review.scores,
                manager_name: review.manager_name,
                employee_name: review.employee_name,
                // assessment_date: review.form_status == "completed" ? "Completed" : $scope.formatDate(review.assessment_date), 
                assessment_date: $scope.formatDate(review.assessment_date), 
                start_date: $scope.formatDate(review.start_date),
                //days_before_review: review.form_status == "completed" ? "N/A" : $scope.calcDaysBeforeReview(review.assessment_date)
                days_before_review: $scope.calcDaysBeforeReview(review.assessment_date)
            }
        });
    }
    hrmAPIservice.getFormReviews(userData).then(function(response) {
        console.log(response.data);
        $scope.displayGrid(response);
        $scope.standardQuestionList = response.data.standard_questions;
    });
    $scope.saveFormReview = function() {
            
            $scope.showMessage = 0;
            $scope.scoreText = "";
            angular.forEach($scope.scoreList, function(value){
                
                $scope.scoreText += value.score;
                $scope.scoreText += ",";
            });
            $scope.commentText = "";
            for(var i = 0; i < $scope.standardQuestionList.length + $scope.specializedQuestionList.length; i++)
            {
                console.log($scope.commentList[i]);
                if($scope.commentList[i] == undefined){
                    $scope.commentText += "";
                    $scope.commentText += "~#";
                    continue;
                }
                $scope.commentText += $scope.commentList[i].comment;
                $scope.commentText += "~#";
            }
            console.log($scope.commentText);
            hrmAPIservice.saveFormReview($scope.scoreText, $scope.commentText, $scope.edit_option, $scope.p_forms_id, userData).then(function(response) {//edit_option is the form id to review
                
                $scope.displayGrid(response);
                
                $scope.success = 1;
                $scope.showMessage = 1;
                $scope.userMessage = "Performance Review have been saved successfully!"; 
                $scope.clearForm();
            });
        
    }
    

    $scope.formatDate = function(date){
        if(date == null) return '';
        var d = date.split("-");
        return d[2] + "-" + d[1] + "-" + d[0];
    }
    
}]);
