app.controller("coursedetailController", ["$scope", "$rootScope", "cookie", "hrmAPIservice", "$routeParams", "$location", function($scope, $rootScope, cookie, hrmAPIservice, $routeParams, $location) {
    var userData = cookie.checkLoggedIn();
    var courseCategory = [];
    cookie.getPermissions();
    
    $scope.course_id = (angular.isUndefined($routeParams.id)) ? 0 : $routeParams.id;
    
    $scope.pageTitle = "";
    $scope.course = {
        course_id: 0,
        course_type: 'Multiple Choice',
        status: 1,
        user_id: userData.id,
        time_limit: 0,
        is_randomized: 0,
        display_error_message: 0,
        reorder: 0,
        is_comeback: 0,
        try_again: 0,
        is_global: 0,
        correct_only: 0,
        question_count: 1,
        is_auto_inactive: 0,
        questions: {}
    };
    
    $scope.showSave = 0;
    $scope.selectedTab = 0;
    $scope.submitInProgress = 0;
    
    $scope.isAdmin = (userData['usertype_id'] == 17) ? true : false;
    $scope.course_save_message = '';

    var questionMax = 30;
    var answerMax = 5;

    $scope.questionNumbers = [];
    $scope.answerNumbers = [];

    $scope.status = {
        isCustomHeaderOpen: false,
        isFirstOpen: true,
        isFirstDisabled: false
    };

    // Setting question and answer numbers.
    for(var i = 0; i < questionMax; i++) {
        $scope.questionNumbers[i] = i + 1;
    }

    for(var i = 0; i < answerMax; i++) {
        $scope.answerNumbers[i] = i + 1;
    }

    // Get Course Category List.
    hrmAPIservice.getCourseCategory().then(function(response) { 
        response.data.course_category.forEach(function(element, index){
            var temp = '{ "value" : "' + response.data.course_category[index].course_category_name + '", "label" : "' + response.data.course_category[index].course_category_name + '", "id" : "' + response.data.course_category[index].course_category_id + '" }' ;
            var temp_1 = '{ "value" : "' + response.data.course_category[index].course_category_id + '", "label" : "' + response.data.course_category[index].course_category_name + '" }';
            courseCategory.push(JSON.parse(temp));
        });
        $scope.course_category = courseCategory;

        // Set the first value.
        if($scope.course_category.length > 0) {
            $scope.course.course_category_id = $scope.course_category[0]['id'];
        }
    });
    
    
    $scope.addQuestion = function(index) {
        if (angular.isUndefined($scope.course.questions)) {
            $scope.course.questions = [];
        } else {
            if ($scope.course.questions == null) {
                $scope.course.questions = [];
            }
        }
        
        if (!angular.isArray($scope.course.questions)) {
            $scope.course.questions = [];
        }
        
        var i = $scope.course.questions.length;
        $scope.course.questions.push({index: i, name: "Question " + (i + 1)});
        
        //$scope.course.questions[i] = {index: i, name: "Question " + (i + 1)};
    }      
    
    
    // Update Question Numbers of Course. 
    $scope.updateQuestionNumber = function() {

        if (angular.isUndefined($scope.course.questions) || $scope.course.questions == null) {
            $scope.course.questions = [];
        }
        
        if($scope.course.questions.length == 0) {
            $scope.course.questions = [];
            for(var i = 0; i < $scope.course.question_count; i++) {
                $scope.course.questions[i] = {"index": i, "name": "Question " + (i + 1)};
            }
        } else {
            if($scope.course.questions.length > $scope.course.question_count) {
                var removeCount = $scope.course.questions.length - $scope.course.question_count;
                $scope.course.questions.splice($scope.course.question_count, removeCount);
            } else { 
                for(var i = 0; i < $scope.course.question_count; i++) {
                    $scope.course.questions[i] = {"index": i, "name": "Question " + (i + 1)};
                }
            }
        }

    } 
    
    
    // Update Answers numbers of Question.
   /* $scope.updateAnswerNumber = function(questionIndex) {
        
        if (angular.isUndefined($scope.course.questions[questionIndex].answers)) {
            $scope.course.questions[questionIndex].answers = [];
        } else {
            if ($scope.course.questions[questionIndex].answers == null) {
                $scope.course.questions[questionIndex].answers = [];
            }
        }
        
        var answerList = angular.copy($scope.course.questions[questionIndex].answers);
        $scope.course.questions[questionIndex].answers = [];
        
        for (var i=0; i<$scope.course.questions[questionIndex].answer_count; i++) {
            if (angular.isDefined(answerList[i])) {
                $scope.course.questions[questionIndex].answers[i] = angular.copy(answerList[i]);
            } else {
                $scope.course.questions[questionIndex].answers[i] = angular.copy({"index": i, "title": ""});
            }
            
        }
        
        
        
        
        console.log($scope.course.questions[questionIndex].answers);
        console.log(answerList);
        return;
        
        //course.questions[question.index].answer_count
        
        for(var i = 0; i < question.answer_count; i++) {
            question.answers[i] = {"index": i, "title": ""};
        }
        
        
        
        
        return;

        if(question.answers == null) {
            question.answers = [];
            for(var i = 0; i < question.answer_count; i++) {
                question.answers[i] = {"index": i, "title": ""};
            }
        }
        else {
            if(question.answers.length >= question.answer_count) {
                var removeCount = question.answers.length - question.answer_count;
                question.answers.splice(question.answer_count, removeCount);
            }
            else {
                for(var i = question.answers.length - 1; i < question.answer_count; i++) {
                    question.answers[i] = {"index": i, "title": ""};
                }
            }
        }
        
    }     */
    
    $scope.addAnswer = function(index) {
        if (angular.isUndefined($scope.course.questions[index].answers)) {
            $scope.course.questions[index].answers = [];
        } else {
            if ($scope.course.questions[index].answers == null) {
                $scope.course.questions[index].answers = [];
            }
        }
        
        var i = $scope.course.questions[index].answers.length;
        $scope.course.questions[index].answers.push({index: i, title: ''});
    }  
    
    $scope.initQuestion = () => {
        $scope.fileuploadMessage = '';
    }    
    
    $scope.uploadImage = function(index) {
        
        $scope.fileuploadMessage = 'Uploading, please wait till completed.';
        var formData = new FormData();
        var isFile = (angular.isDefined($('#imagemedia' + index)[0].files[0])) ? true : false;
        if (!isFile) {
            $scope.fileuploadMessage = 'No file selected..';
            return;
        }
        
        formData.append('fileToUpload', $('#imagemedia' + index)[0].files[0]);
        formData.append('type', 'image');
        var message = '';
        $.ajax({
               url : 'course/savefile',
               type : 'POST',
               data : formData,
               processData: false,  // tell jQuery not to process the data
               contentType: false,  // tell jQuery not to set contentType
               dataType: 'json',
               async: false,
               success : function(data) {
                    if (data.filename) {
                        message = 'Done!';
                        $scope.course.questions[index].image = data.filename;
                        $scope.course.questions[index].image_href = data.href;
                        
                        //$("#uploadedfile_" + fid).val(data.filename);                        
                    } else {
                        message = 'File was not able to be uploaded';
                    }
               },
               complete: function(data) {
                   //$scope.fileuploadMessage = 'File upload successful';
               }
        }); 
        
        $scope.fileuploadMessage = message;
    }      
    
    $scope.removeImage = function(index) {       
        hrmAPIservice.removeFile($scope.course.questions, index, userData).then(function(response) {
            $scope.course.questions[index].image = '';
            $scope.course.questions[index].image_href = '';
        });        
    }
        
    
    
    $scope.uploadVideo = function(index) {
        $scope.videoUploadMessage = 'Uploading, please wait till completed.';
        var formData = new FormData();
        var isFile = (angular.isDefined($('#videomedia')[0].files[0])) ? true : false;
        if (!isFile) {
            $scope.videoUploadMessage = 'No file selected..';
            return;
        }
        
        formData.append('fileToUpload', $('#videomedia')[0].files[0]);
        formData.append('type', 'video');
        $.ajax({
               url : 'course/savefile',
               type : 'POST',
               data : formData,
               processData: false,  // tell jQuery not to process the data
               contentType: false,  // tell jQuery not to set contentType
               dataType: 'json',
               async: false,
               success : function(data) {
                    if (data.filename) {
                        $scope.videoUploadMessage = 'Done!';
                        $scope.course.questions[index].video = data.filename;
                        $scope.course.questions[index].video_href = data.href;                      
                    } else {
                        $scope.videoUploadMessage = 'File was not able to be uploaded';
                    }
               },
               complete: function(data) {
                   //$scope.fileuploadMessage = 'File upload successful';
               }
        }); 
        
    }      
    
    $scope.removeVideo = function(index) {       
        hrmAPIservice.removeFile($scope.course.questions, index, userData).then(function(response) {
            $scope.course.questions[index].video = '';
            $scope.course.questions[index].video_href = '';
        });        
    }


    
    
    
    $scope.uploadPdf = function(index) {
        $scope.pdfUploadMessage = 'Uploading, please wait till completed.';
        var formData = new FormData();
        var isFile = (angular.isDefined($('#pdfmedia')[0].files[0])) ? true : false;
        if (!isFile) {
            $scope.pdfUploadMessage = 'No file selected..';
            return;
        }
        
        formData.append('fileToUpload', $('#pdfmedia')[0].files[0]);
        formData.append('type', 'pdf');
        $.ajax({
               url : 'course/savefile',
               type : 'POST',
               data : formData,
               processData: false,  // tell jQuery not to process the data
               contentType: false,  // tell jQuery not to set contentType
               dataType: 'json',
               async: false,
               success : function(data) {
                    if (data.filename) {
                        $scope.pdfUploadMessage = 'Done!';
                        $scope.course.questions[index].pdf = data.filename;
                        $scope.course.questions[index].pdf_href = data.href;                       
                    } else {
                        $scope.pdfUploadMessage = 'File was not able to be uploaded';
                    } 
               },
               complete: function(data) {
                   $scope.fileuploadMessage = 'File upload successful';
               }
        }); 
        
    }      
    
    $scope.removePdf = function(index) {       
        hrmAPIservice.removeFile($scope.course.questions, index, userData).then(function(response) {
            $scope.course.questions[index].pdf = '';
            $scope.course.questions[index].pdf_href = '';
        });        
    }    
    
    
        
    $scope.uploadFilex = function(type,fid) {
        $scope.fileuploadMessage = 'Uploading, please wait till completed.';
        var fld = type + fid;
        var formData = new FormData();
        var isFile = (angular.isDefined($('#' + fld)[0].files[0])) ? true : false;
        if (!isFile) {
            $scope.fileuploadMessage = 'No file selected..';
            return;
        }
        
        formData.append('fileToUpload', $('#' + fld)[0].files[0]);
        formData.append('type', type);
        var message = '';
        $.ajax({
               url : 'course/addCoursefile',
               type : 'POST',
               data : formData,
               processData: false,  // tell jQuery not to process the data
               contentType: false,  // tell jQuery not to set contentType
               dataType: 'json',
               async: false,
               success : function(data) {
                    if (data.filename) {
                        message = 'Done!';
                        $("#uploadedfile_" + fid).val(data.filename);                        
                    } else {
                        message = 'File was not able to be uploaded';
                    }
               },
               complete: function(data) {
                   //$scope.fileuploadMessage = 'File upload successful';
               }
        }); 
        
        $scope.fileuploadMessage = message;
    }   
    
    
    // Save Course.
    $scope.saveCourse = function() {
        
        hrmAPIservice.saveCourse($scope.course, userData).then(function(response) {
            if (response.data.success == 1) {
                $location.path("/trainingcourses");
            }
        });
    };    
    
    $scope.nextTab = function() {
        $scope.selectedTab++;
        if ($scope.selectedTab > 1) {
            $scope.showSave = 1;
        }
    }
    
    if ($scope.course_id > 0) {
        $scope.course = {};
        $scope.course.questions = [];
        hrmAPIservice.getCourseDetail($scope.course_id, userData).then(function(response) {            
            $scope.course = response.data.detail;
            $scope.course.questions = [];

            $scope.course.questions = angular.copy(response.data.questions);
            $scope.course.question_count = $scope.course.questions.length;       
        });
    }




}]);