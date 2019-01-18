app.controller("AddCourseController", ["$scope", "$rootScope", "cookie", "hrmAPIservice", "$routeParams", "$location", function($scope, $rootScope, cookie, hrmAPIservice, $routeParams, $location) {
    var userData = cookie.checkLoggedIn(), courseCategory = [];
    cookie.getPermissions();

    //console.log(userData);

    $scope.pageTitle = "";
    $scope.course = {
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
        is_auto_inactive: 0
    };
    
    $scope.showSave = 0;
    $scope.selectedTab = 0;
    
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
    
    $scope.initQuestion = function() {
        $scope.fileuploadMessage = '';
    }    
    
    $scope.uploadFile = function(type,fid) {
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
        $('.uploadedfile').each(function (index, el) { 
            var id = $(this).attr('id'); 
            var a = id.split('_');
            if ($(this).val() != '') {
                var file = $(this).val();
                $($scope.course.questions).each(function (i, o) {
                    if (o.question_id == a[1]) {
                        $scope.course.questions[i]['uploadedfile'] = file;       
                    }
                });                                
            }
        });         
        
        hrmAPIservice.addCourse($scope.course, userData).then(function(response) {
            if (response.data.success == 0) {
                goBack();
            } else {
                document.getElementById("courseForm").submit();
                //$scope.course_save_message = "Course has been successfully created and can now be allocated to staff";
                //$location.path("/trainingcourses");
            }
        });
    };    

    // Cancel Course.
    $scope.cancel = function() {
        goBack();
    };
    
    $scope.nextTab = function() {
        $scope.selectedTab++;
        if ($scope.selectedTab > 1) {
            $scope.showSave = 1;
        }
    }

    $scope.submit = function(event) {
        event.preventDefault();
        console.log("Submit");
    }

    // Update Question Numbers of Course.
    $scope.updateQuestionNumber = function() {
        if($scope.course.questions == null) {
            $scope.course.questions = [];
            for(var i = 0; i < $scope.course.question_count; i++) {
                $scope.course.questions[i] = {"index": i, "name": "Question " + (i + 1)};
            }
        }
        else {
            if($scope.course.questions.length >= $scope.course.question_count) {
                var removeCount = $scope.course.questions.length - $scope.course.question_count;
                $scope.course.questions.splice($scope.course.question_count, removeCount);
            }
            else {
                for(var i = $scope.course.questions.length - 1; i < $scope.course.question_count; i++) {
                    $scope.course.questions[i] = {"index": i, "name": "Question " + (i + 1)};
                }
            }
        }
    }

    // Update Answers numbers of Question.
    $scope.updateAnswerNumber = function(question) {
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
    }


    // Update Media Type of Question.
    $scope.changeMediaType = function(question) {
        console.log(question.media_type);

    }
    
    $scope.checkMediaType = function(obj, type) {
        if (!obj.value.endsWith(type)) {
            alert("You can only select files of type " + type);
            $('#' + obj.id).val('');
            return false;
        } else {
            return true;
        }
    }    

    $scope.changedVideo = function(obj) {
        if (!$scope.checkMediaType(obj, ".mp4")) {
            return;
        }        
        var fileUrl = window.URL.createObjectURL(obj.files[0]);
        var question_index = obj.getAttribute('id').replace('media_video_', '');

        var videoId = 'media_video' + question_index;
        var video = document.getElementById('media_video_'+question_index);
        var source = document.getElementById('media_video_' + question_index);

        document.getElementById(videoId).src = fileUrl;

    }

    $scope.changedPDF = function(obj) {
        if (!$scope.checkMediaType(obj, ".pdf")) {
            return;
        }        
        var fileUrl = window.URL.createObjectURL(obj.files[0]);
        var question_index = obj.getAttribute('id').replace('pdf', '');

        var tagId = 'media_pdf' + question_index;
        var iframe = document.getElementById(tagId);
        iframe.setAttribute('src', fileUrl);
        iframe.setAttribute('data', fileUrl);
       //console.log(fileUrl);
    }

    $scope.changedPPT = function(obj) {
        var fileUrl = window.URL.createObjectURL(obj.files[0]);
        var question_index = obj.getAttribute('id').replace('ppt', '');

        var tagId = 'media_ppt' + question_index;
        var iframe = document.getElementById(tagId);
        iframe.setAttribute('data', fileUrl);
        console.log(fileUrl);
    }

    $scope.changedImage = function(obj) {
        var fileUrl = window.URL.createObjectURL(obj.files[0]);
        var index = obj.getAttribute('id').replace('image', '');
        var items = index.split('_');
        var image_index = items[0];
        var question_index = items[1];

        var tagId = 'image_view' + index;
        var image = document.getElementById(tagId);
        image.setAttribute('src', fileUrl);

        var removeTagId = 'remove_image' + index;
        var removeBtn = document.getElementById(removeTagId);
        removeBtn.setAttribute('class', 'close remove-image-button show');

        // var question = $scope.course.questions[question_index];
        //
        // if(image_index == 0) {
        //     question.image1 = true;
        // } else if(image_index == 1) {
        //     question.image2 = true;
        // } else {
        //     question.image3 = true;
        // }
        //
        // console.log(question);
    }

    $scope.removeImage = function(question, index) {
        //console.log(question);
        //console.log(index);

        var question_index = question['index'];

        // Image Viewer.
        var tagId = 'image_view' + index + '_' + question_index;
        var image = document.getElementById(tagId);
        image.setAttribute('src', '');

        // Remove Button.
        var removeTagId = 'remove_image' + index + '_' + question_index;
        var removeBtn = document.getElementById(removeTagId);
        removeBtn.setAttribute('class', 'close remove-image-button');

        // Input.
        var inputTagId = 'image' + index + '_' + question_index;
        var input = document.getElementById(inputTagId);
        input.value = "";
    }

    function goBack() {
        location.href = "#/trainingcourses";
    }
}]);