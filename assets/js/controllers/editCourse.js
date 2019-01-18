app.controller("EditCourseController", ["$scope", "$rootScope", "cookie", "hrmAPIservice", "$routeParams","$location",  function($scope, $rootScope, cookie, hrmAPIservice, $routeParams, $location) {
    var userData = cookie.checkLoggedIn(), courseCategory = [];
    cookie.getPermissions();

    $scope.pageTitle = "";
    $scope.course_id = $routeParams.id;
    $scope.course = {};
    var questionMax = 30;
    var answerMax = 5;
    
    $scope.fileuploadMessage = '';
    
    $scope.isAdmin = (userData['usertype_id'] == 17) ? true : false;

    $scope.questionNumbers = [];
    $scope.answerNumbers = [];
    
    $scope.showSave = 0;
    $scope.selectedTab = 0;    

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
    });
    
    // Get Course Data by selected ID.
    hrmAPIservice.getCourse($scope.course_id, userData).then(function(response) {
        if (response.data.course.course_id == -1) {
            $location.path("/trainingcourses");
            return;
        }
        
        
        var course = response.data.course;
        var auto_inactive_time = course["auto_inactive_time"];
        course["auto_inactive_time"] = new Date(auto_inactive_time);

        $scope.course = course;
        $scope.course.question_count = $scope.course.questions.length;
        if($scope.course.questions != null && $scope.course.questions.length > 0) {
            for(var i = 0; i < $scope.course.questions.length; i++) { 
                $scope.course.questions[i].answer_count = $scope.course.questions[i].answers.length;
            }
            
        }
    });
    
    $scope.removeFile = function(type, qid) {
        if (type == 'video') {
            $('#media_video' + qid).remove();
            var el = '<video width="100%" height="400" controls="" id="media_video'+qid+'"><source id="media_video_'+qid+'" src=""></video>';
            $(el).insertBefore("#video" + qid);
            $("#video" + qid).val('');            
        } else if (type == 'pdf') {
            $('#media_pdf' + qid).remove();
            var el = '<object width="100%" height="400" frameborder="0" scrolling="no" id="media_pdf'+qid+'" src="" data=""></object>';
            $(el).insertBefore("#pdf" + qid);
            $("#pdf" + qid).val('');            
        }
        hrmAPIservice.removeMedia(type, qid).then(function(response) {
            
        });        
        
    }
    
    
    $scope.uploadFile = function(type,fid) {
        $scope.fileuploadMessage = 'Uploading, please wait till completed.';
        var fld = type + fid;
        
        var formData = new FormData();
        if (angular.isDefined($('#' + fld))) {
            var isFile = (angular.isDefined($('#' + fld)[0].files[0])) ? true : false;
        } else {
            var isFile = false;
        }
        if (!isFile) {
            $scope.fileuploadMessage = 'No file selected..';
            return;
        }
        
        formData.append('fileToUpload', $('#' + fld)[0].files[0]);
        formData.append('type', type);
        var message = ''
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
   
        hrmAPIservice.saveCourse($scope.course).then(function(response) {
            if (response.data.success == 0) {
                goBack();
            } else {
                //$scope.userdata = userData;
                $location.path("/trainingcourses");
                //document.getElementById("courseForm").submit();
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

    // Update Question Numbers of Course.
    $scope.updateQuestionNumber = function() {
        if($scope.course.questions == null) {
            $scope.course.questions = [];
            for(var i = 0; i < $scope.course.question_count; i++) {
                $scope.course.questions[i] = {"question_id": i + "_new", "name": "Question " + (i + 1)};
            }
        }
        else {
            if($scope.course.questions.length >= $scope.course.question_count) {
                var removeCount = $scope.course.questions.length - $scope.course.question_count;
                $scope.course.questions.splice($scope.course.question_count, removeCount);
            }
            else {
                for(var i = $scope.course.questions.length; i < $scope.course.question_count; i++) {
                    $scope.course.questions[i] = {"question_id": i + "_new", "name": "Question " + (i + 1)};
                }
            }
        }
    }

    // Update Answers numbers of Question.
    $scope.updateAnswerNumber = function(question) {
        if(question.answers == null) {
            question.answers = [];
            for(var i = 0; i < question.answer_count; i++) {
                question.answers[i] = {"answer_id": i + "_new", "title": ""};
            }
        }
        else {
            if(question.answers.length >= question.answer_count) {
                var removeCount = question.answers.length - question.answer_count;
                question.answers.splice(question.answer_count, removeCount);
            }
            else {
                for(var i = question.answers.length; i < question.answer_count; i++) {
                    question.answers[i] = {"answer_id": i + "_new", "title": ""};
                }
            }
        }
    }
    
    $scope.initQuestion = function() {
        $scope.fileuploadMessage = '';
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
        var question_index = obj.getAttribute('id').replace('video', '');

        var videoId = 'media_video' + question_index;
        var video = document.getElementById('media_video'+question_index);
        var source = document.getElementById('media_video_' + question_index);

        document.getElementById(videoId).src = fileUrl;
    }

    $scope.changedPDF = function(obj) {
        if (!$scope.checkMediaType(obj, ".pdf")) {
            return;
        }        
        var fileUrl = window.URL.createObjectURL(obj.files[0]);
        var question_index = obj.getAttribute('id').replace('pdf', '');;

        var tagId = 'media_pdf' + question_index;
        var iframe = document.getElementById(tagId);
        iframe.setAttribute('src', fileUrl);
        iframe.setAttribute('data', fileUrl);
        console.log(fileUrl);
    }

    $scope.changedPPT = function(obj) {
        var fileUrl = window.URL.createObjectURL(obj.files[0]);
        var question_index = obj.getAttribute('id').replace('ppt', '');;

        var tagId = 'media_ppt' + question_index;
        var iframe = document.getElementById(tagId);
        iframe.setAttribute('src', fileUrl);
        console.log(fileUrl);
    }

    $scope.changedImage = function(obj) {
        var fileUrl = window.URL.createObjectURL(obj.files[0]);
        var index = obj.getAttribute('id').replace('image', '');


        var items = index.split('-');
        var image_index = items[0];
        var question_index = items[1];

        var tagId = 'image_view' + image_index + "-" + question_index;

        var image = document.getElementById(tagId);
        image.setAttribute('src', fileUrl);

        var removeTagId = 'remove_image' + image_index + "-" + question_index;
        var removeBtn = document.getElementById(removeTagId);
        removeBtn.setAttribute('class', 'close remove-image-button show');

    }

    $scope.removeImage = function(question, index) {
        var question_id = question['question_id'];

        // Image Viewer.
        var tagId = 'image_view' + index + '-' + question_id;
        var image = document.getElementById(tagId);
        image.setAttribute('src', '');

        // Remove Button.
        var removeTagId = 'remove_image' + index + '-' + question_id;
        var removeBtn = document.getElementById(removeTagId);
        removeBtn.setAttribute('class', 'close remove-image-button');

        // Input.
        var inputTagId = 'image' + index + '-' + question_id;
        var input = document.getElementById(inputTagId);
        input.value = "";

        var array_images = question.image.split(',');
        if(index == 0) {
            if(array_images != null && array_images.length >= 1) {
                array_images[0] = '';
            }
        }
        else if(index == 1) {
            if(array_images != null && array_images.length >= 2) {
                array_images[1] = '';
            }
        }
        else if(index == 2) {
            if(array_images != null && array_images.length >= 3) {
                array_images[2] = '';
            }
        }

        question.image = array_images.join(',');
    }

    function goBack() {
        location.href = "#/trainingcourses";
    }

}]);