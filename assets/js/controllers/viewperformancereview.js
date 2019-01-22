app.controller('viewperformancereviewController', ['$scope', '$rootScope', 'cookie','uiGridConstants', 'hrmAPIservice', function ($scope, $rootScope, cookie, uiGridConstants, hrmAPIservice) {
    var userData = cookie.checkLoggedIn();
    cookie.getPermissions();
    var perms = $rootScope.perms;
    $scope.edit_option = 0;
    $scope.pageTitle = "View Performance Review";
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
          { name: 'form_status', visible: false },
          { name: 'questions', visible: false },
          { name: 'scores', visible: false },
          { name: 'comments', visible: false },
          { name: 'manager_name', displayName: 'Manager Conducting Review', width: '25%', enableCellEdit: false },
          { name: 'review_date', displayName: 'Date of Entry', width: '30%', enableFiltering: true, cellClass: 'center',enableCellEdit: false},
          { name: 'assessment_date', displayName: 'Next Review Date', width: '30%', enableFiltering: true, cellClass: 'center',enableCellEdit: false},
          { name: 'action', enableFiltering: false, width: '15%',  cellClass: 'center', enableCellEdit: false,
              cellTemplate: '<div class="ui-grid-cell-contents grid-center-cell"><span ng-click="grid.appScope.editForm(row.entity)"><span class="glyphicon glyphicon-edit text-edit"></span></div>'
          }
        ]
    };
    
    
    $scope.editForm = function(obj) {
        $scope.formEnabled = 1;
        $scope.specializedQuestionList = [];
        $scope.scoreList = [];
        $scope.commentList = [];
        $scope.questions = obj.questions.split(",");
        angular.forEach($scope.questions, function (value, key) {
            if(key < $scope.questions.length - 1) $scope.specializedQuestionList.push({id : key + 1, question_text : value});
        });  
        if(obj.scores == ""){
            $scope.edit_option = obj.id;
            return
        }else{
            $scope.scores = obj.scores.split(",");
            angular.forEach($scope.scores, function (value, key) {
                if(key < $scope.scores.length - 1) $scope.scoreList.push({id : key + 1, score : value});
            });
            $scope.comments = obj.comments.split("~#");
            angular.forEach($scope.comments, function (value, key) {
                if(key < $scope.comments.length - 1) $scope.commentList.push({id : key + 1, comment : value});
            });
        }
    }

    hrmAPIservice.getFormReviewsForView(userData).then(function(response) {
        console.log(response.data);
        $scope.gridOptionsComplex.data = response.data.form_reviews.map(function(review){
            return{
                id: review.id,
                form_status: review.form_status,
                questions: review.questions,
                scores: review.scores.split("~#")[review.scores.split("~#").length - 1],
                comments: review.comments.split("!#")[review.comments.split("!#").length - 1],
                manager_name: review.manager_name,
                // assessment_date: review.form_status == "completed" ? "Completed" : $scope.formatDate(review.assessment_date), 
                assessment_date: $scope.formatDate(review.assessment_date), 
                review_date: $scope.formatDate(review.review_date)
            }
        });
        $scope.standardQuestionList = response.data.standard_questions;
    });
    
    

    $scope.formatDate = function(date){
        if(date == null) return '';
        var d = date.split("-");
        return d[2] + "-" + d[1] + "-" + d[0];
    }
    
}]);
