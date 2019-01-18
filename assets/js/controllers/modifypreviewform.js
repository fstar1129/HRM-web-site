app.controller('modifypreviewformController', ['$scope', '$rootScope', 'cookie','uiGridConstants', 'hrmAPIservice', function ($scope, $rootScope, cookie, uiGridConstants, hrmAPIservice) {
    var userData = cookie.checkLoggedIn();
    cookie.getPermissions();
    var perms = $rootScope.perms;
    $scope.edit_option = 0;
    $scope.mdr = {};
    $scope.mdr.form_edit_option = 1;
    $scope.pageTitle = "Modify Performance Review Form";
    $scope.formEnabled = 0;
    $scope.master = {};
    
    
    
    $scope.empSearch = function(query) {
        var list = [];
        if(query != null && query.length > 0) {
            for(var i=0; i<$scope.employeeList.length; i++) {
                if ($scope.employeeList[i].firstname.toLowerCase().indexOf(query.toLowerCase()) > -1 || $scope.employeeList[i].lastname.toLowerCase().indexOf(query.toLowerCase()) > -1) {
                    var emp = $scope.employeeList[i].firstname + " " + $scope.employeeList[i].lastname;
                    list.push({id: $scope.employeeList[i].id, name: emp});
                }
            }                    
        }
        return list;
    }  
    
    $scope.mngrSearch = function (query) {
        var list = [];
        if(query != null && query.length > 0) {
            for(var i=0; i<$scope.managerList.length; i++) {
                if ($scope.managerList[i].firstname.toLowerCase().indexOf(query.toLowerCase()) > -1 || $scope.managerList[i].lastname.toLowerCase().indexOf(query.toLowerCase()) > -1) {
                    var emp = $scope.managerList[i].firstname + " " + $scope.managerList[i].lastname;
                    list.push({id: $scope.managerList[i].id, name: emp});
                }
            }                 
        }
        return list;
    }    
    
  
  
    $scope.doSelectedManager = function(suggestion) {
        if(!angular.isDefined(suggestion)) {
            return;
        }
        for(let i=0; i<$scope.managerList.length; i++) {
            
           if($scope.managerList[i].id == suggestion.id) {
                $scope.performance_form.manager_id = $scope.managerList[i].id;
                var emp = $scope.employeeList[i].firstname + " " + $scope.employeeList[i].lastname;
                $scope.performance_form.manager_name = emp;
                break;
            }
        }
    }    
    

    $scope.doSelectedEmployee = function(suggestion) {
        if(!angular.isDefined(suggestion)) {
            return;
        }
        for(let i=0; i<$scope.employeeList.length; i++) {
            if($scope.employeeList[i].id == suggestion.id) {
                $scope.performance_form.employee_id = $scope.employeeList[i].id;
                $scope.performance_form.start_date = $scope.formatDate($scope.employeeList[i].start_date);
                $scope.performance_form.site_location = $scope.employeeList[i].site_location;
                $scope.performance_form.position = $scope.employeeList[i].position;
                var emp = $scope.employeeList[i].firstname + " " + $scope.employeeList[i].lastname;
                $scope.performance_form.employee_name = emp;
                break;
            }
        }
        
    }    
    
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
          { name: 'employee_name', displayName: 'Employee', width: '15%', enableCellEdit: false },
          { name: 'manager_name', displayName: 'Manager', width: '15%', enableCellEdit: false },
          { name: 'assessment_date', displayName: 'Assessment Date', width: '15%', enableFiltering: true, cellClass: 'center',enableCellEdit: false},
          { name: 'start_date', displayName: 'Start Date', width: '15%', enableFiltering: true, cellClass: 'center',enableCellEdit: false},
          { name: 'site_location', displayName: 'Site Location', width: '20%', enableFiltering: true, cellClass: 'center',enableCellEdit: false},
          { name: 'frequency', displayName: 'Frequency', width: '10%', enableFiltering: true, cellClass: 'center',enableCellEdit: false},
          { name: 'action', enableFiltering: false, width: '10%',  cellClass: 'center', enableCellEdit: false,
              cellTemplate: '<div class="ui-grid-cell-contents grid-center-cell"><span ng-click="grid.appScope.editForm(row.entity)"><span class="glyphicon glyphicon-edit text-edit"></span></span>&nbsp;&nbsp;&nbsp;<span ng-click="grid.appScope.deleteForm(row.entity)"><span class="glyphicon glyphicon-trash text-danger"></span></span></div>'
          }
        ]
    };
    
    $scope.deleteForm = function(fDetail) {
        if(perms.modifypreviewform.delete == 0) return;
        var answer = confirm("Delete the form for " + fDetail.employee_name + '? Are you sure?');
        if (answer) {
            if(fDetail.form_status == "pending"){
                alert("You can not delete a form on pending! Please complete the form before removing it from the interface");
                return;
            }
            hrmAPIservice.deleteForm(fDetail, userData).then(function(response) {
                $scope.gridOptionsComplex.data = response.data.performance_forms.map(function(form){
                    return{
                        id: form.id,
                        form_status: form.form_status,
                        questions: form.questions,
                        manager_name: form.manager_name,
                        employee_name: form.employee_name,
                        assessment_date:$scope.formatDate(form.assessment_date), 
                        start_date: $scope.formatDate(form.start_date),
                        site_location: form.site_location,
                        frequency: form.frequency
                    }
                    
                });
            });
        }
    }
    
    $scope.editForm = function(obj) {
        $scope.formEnabled = 1;
        $scope.edit_option = 1;
        $scope.mdr.form_edit_option = 1;
        $scope.performance_form.specializedQuestionList = [];
        $scope.editing_form = obj;
        angular.forEach($scope.employeeList, function (value, key) {
            if(value.firstname + " " + value.lastname === obj.employee_name){
                $scope.performance_form.position = value.position;
                $scope.performance_form.start_date = $scope.formatDate(value.start_date);
                $scope.performance_form.site_location = value.site_location;
            }
        });    
        $scope.employee_name = {
            value: obj.employee_name,
            name: obj.employee_name
        };
        $scope.manager_name = {
            value: obj.manager_name,
            name: obj.manager_name
        };
        $scope.performance_form.employee_name =  $scope.editing_form.employee_name;
        $scope.performance_form.manager_name =  $scope.editing_form.manager_name;
        $scope.performance_form.id =  $scope.editing_form.id;
        $scope.performance_form.frequency = obj.frequency.split(" ")[0];
        $scope.questions = obj.questions.split(",");
        angular.forEach($scope.questions, function (value, key) {
            if(key < $scope.questions.length - 1) $scope.performance_form.specializedQuestionList.push({id : key + 1, question_text : value});
        });  
    }


    $scope.newForm = function() {
        $scope.performance_form = {};
        $scope.showMessage = 0;
        $scope.clearForm();
        $scope.edit_option = 0;
        $scope.formEnabled = 1;
        $scope.performance_form.specializedQuestionList = [];
    }

    $scope.clearForm = function() {
        $scope.performance_form = angular.copy($scope.master);
        
        $scope.employee_name = null;
        $scope.manager_name = null;
        $scope.frequency = '';
        $scope.formEnabled = 0;
        $scope.edit_option = 0;
    }

    hrmAPIservice.getPerformanceForms(userData.account_id).then(function(response) {
        console.log(response.data);
        $scope.gridOptionsComplex.data = response.data.performance_forms.map(function(form){
            return{
                id: form.id,
                form_status: form.form_status,
                questions: form.questions,
                manager_name: form.manager_name,
                employee_name: form.employee_name,
                assessment_date:$scope.formatDate(form.assessment_date), 
                start_date: $scope.formatDate(form.start_date),
                site_location: form.site_location,
                frequency: form.frequency
            }
        });
        $scope.employeeList = response.data.employees;
        $scope.managerList = response.data.employees;
        $scope.standardQuestionList = response.data.standard_questions;
    });
    
    $scope.saveForm = function() {
        if($scope.mdr.form_edit_option == 1 && $scope.edit_option == 1){
            $scope.showMessage = 0;
            $scope.performance_form.employee_name = $scope.employee_name.name;
            $scope.performance_form.manager_name = $scope.manager_name.name;
            for(let i=0; i<$scope.employeeList.length; i++) {
                var emp = $scope.employeeList[i].firstname + " " + $scope.employeeList[i].lastname;
                if($scope.performance_form.employee_name == emp) {
                    $scope.performance_form.employee_id = $scope.employeeList[i].id;
                    break;
                }
            }
            for(let i=0; i<$scope.employeeList.length; i++) {
                var emp = $scope.employeeList[i].firstname + " " + $scope.employeeList[i].lastname;
                if($scope.performance_form.manager_name == emp) {
                    $scope.performance_form.manager_id = $scope.employeeList[i].id;
                    break;
                }
            }
            hrmAPIservice.updateForm($scope.performance_form, userData).then(function(response) {
                console.log(response.data);
                $scope.gridOptionsComplex.data = response.data.performance_forms.map(function(form){
                    return{
                        id: form.id,
                        form_status: form.form_status,
                        questions: form.questions,
                        manager_name: form.manager_name,
                        employee_name: form.employee_name,
                        assessment_date:$scope.formatDate(form.assessment_date), 
                        start_date: $scope.formatDate(form.start_date),
                        site_location: form.site_location,
                        frequency: form.frequency
                    }
                });
                
                $scope.success = 1;
                $scope.showMessage = 1;
                $scope.userMessage = "Performance Review Form have been saved successfully!"; 
                $scope.clearForm();
            });
        }else{
            $scope.showMessage = 0;
            
            hrmAPIservice.saveForm($scope.performance_form, userData).then(function(response) {
                console.log(response.data);
                $scope.gridOptionsComplex.data = response.data.performance_forms.map(function(form){
                    return{
                        id: form.id,
                        form_status: form.form_status,
                        questions: form.questions,
                        manager_name: form.manager_name,
                        employee_name: form.employee_name,
                        assessment_date:$scope.formatDate(form.assessment_date), 
                        start_date: $scope.formatDate(form.start_date),
                        site_location: form.site_location,
                        frequency: form.frequency
                    }
                });
                
                $scope.success = 1;
                $scope.showMessage = 1;
                $scope.userMessage = "Performance Review Form have been saved successfully!"; 
                $scope.clearForm();
            });
        }
    }
    
    $scope.addQuestion = function(){
        $scope.performance_form.specializedQuestionList.push({id: $scope.performance_form.specializedQuestionList.length + 1, question_text: ""});
    }
    $scope.delQuestion = function(){
        $scope.performance_form.specializedQuestionList.pop();
    }
    $scope.formatDate = function(date){
        if(date == null) return '';
        var d = date.split("-");
        return d[2] + "-" + d[1] + "-" + d[0];
    }
    $scope.changeFormEditOption = function(){
        if($scope.mdr.form_edit_option == 1){
            angular.forEach($scope.employeeList, function (value, key) {
                if(value.firstname + " " + value.lastname === $scope.editing_form.employee_name){
                    $scope.performance_form.position = value.position;
                    $scope.performance_form.start_date = $scope.formatDate(value.start_date);
                    $scope.performance_form.site_location = value.site_location;
                }
            });    
            $scope.performance_form.employee_name =  $scope.editing_form.employee_name;
            $scope.performance_form.manager_name =  $scope.editing_form.manager_name;
            $scope.performance_form.id =  $scope.editing_form.id;
            $scope.employee_name = {
                value: $scope.editing_form.employee_name,
                name: $scope.editing_form.employee_name
            };
            $scope.manager_name = {
                value: $scope.editing_form.manager_name,
                name: $scope.editing_form.manager_name
            };

            $scope.performance_form.frequency = $scope.editing_form.frequency.split(" ")[0];
        }
        else{
            $scope.performance_form.position = "";
            $scope.performance_form.start_date = "";
            $scope.performance_form.site_location = "";
            $scope.cs.searchText = "";
            $scope.ew.searchText = "";
            $scope.performance_form.frequency = "";
        }
    }
}]);
