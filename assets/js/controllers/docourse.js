app.controller("docourseController", ["$scope", "$rootScope", "cookie", "hrmAPIservice", "$routeParams", function($scope, $rootScope, cookie, hrmAPIservice, $routeParams) {
   
    var userData = cookie.checkLoggedIn();
    cookie.getPermissions();
    $scope.pageTitle = "Course";
    $scope.course = {};  
    $scope.answer = {};  
    $scope.course.step = 1;
    $scope.question_id = 0;
    $scope.questionIndex = 0;   
    

    var courseId = $routeParams.courseid;
    var employeeId = $routeParams.employeeid;
    
    $scope.CloseCourse = function() {
        location.href = "#/trainingcourselist";  
    }
    
    $scope.findCurrentQuestion = function() {
        $scope.questionIndex = 0;
        return;
        var n = 0;
        
        while (n < $scope.course.questions.length) {
            if ($scope.course.questions[n].isAnswered > 0) {
                $scope.questionIndex++;
            }
            n++;
        }        
    }

    hrmAPIservice.getCourseById(courseId, employeeId).then(function(response) {
        $scope.course.coursetitle = response.data.course.course_name;
        $scope.course.coursedescription = response.data.course.course_description;

        $scope.course.learnersname = response.data.employee.user.firstname + ' ' + response.data.employee.user.lastname;
        $scope.course.hoursleft = response.data.course.TimeLeft;
        $scope.course.tradingname = response.data.course.department;   // CHANGE       
        $scope.course.questions = response.data.course.questions;
        
        $scope.findCurrentQuestion();               
        $scope.question_id = $scope.course.questions[$scope.questionIndex].question_id;

    });

    $scope.courseproceed = function() {
        $scope.course.step = 2;
        hrmAPIservice.startCourse(courseId, employeeId).then(function(response) {
            
        });
    }

    $scope.back = function() {
        $scope.course.step--;
    }    
    
    $scope.next = function() {
        $scope.course.step++;
    }
    
    $scope.submitAnswer = function(questionId) {             
        var answerId = $scope.answer[questionId];
        if (answerId == 0) {
            return;
        } 
        
        hrmAPIservice.submitAnswer(courseId, employeeId, questionId, answerId).then(function(response) {
            $scope.questionIndex++;
            if ($scope.questionIndex >= $scope.course.questions.length) {
                $scope.result = response.data;
                $scope.course.step = 'complete';                
            } else {
                $scope.question_id = $scope.course.questions[$scope.questionIndex].question_id; 
            }
            $('.question_' + questionId + ' video').remove();
        });        
    }

}]);
