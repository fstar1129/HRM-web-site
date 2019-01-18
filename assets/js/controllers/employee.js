'use strict'; // for $_FILES['name']['tmp_name']

//file-model directive used
app.factory('fileService', function() {
    var files = [];
    return files;
})
app.directive('fileModel', ['$parse', 'fileService', function($parse, fileService){
    return{
        restrict: 'A',
        link: function(scope, element) {
            element.bind('change', function(){
                scope.$apply(function(){
                    if (element[0].files != undefined) {
                        fileService.push(element[0].files[0]);
                    }
                });
            });
        }
    }
}]);
app.factory('fileService2', function() {
    var files = [];
    return files;
})
app.directive('fileModel2', ['$parse', 'fileService2', function($parse, fileService2){
    return{
        restrict: 'A',
        link: function(scope, element) {
            element.bind('change', function(){
                scope.$apply(function(){
                    if (element[0].files != undefined) {
                        fileService2.push(element[0].files[0]);
                    }
                });
            });
        }
    }
}]);
app.directive('price', [function () {
    return {
        require: 'ngModel',
        link: function (scope, element, attrs, ngModel) {
            attrs.$set('ngTrim', "false");

            var formatter = function(str, isNum) {
                str = String( Number(str || 0) / (isNum?1:100) );
                str = (str=='0'?'0.0':str).split('.');
                str[1] = str[1] || '0';
                return str[0].replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1,') + '.' + (str[1].length==1?str[1]+'0':str[1]);
            }
            var updateView = function(val) {
                scope.$applyAsync(function () {
                    ngModel.$setViewValue(val || '');
                    ngModel.$render();
                });
            }
            var parseNumber = function(val) {
                var modelString = formatter(ngModel.$modelValue, true);
                var sign = {
                    pos: /[+]/.test(val),
                    neg: /[-]/.test(val)
                }
                sign.has = sign.pos || sign.neg;
                sign.both = sign.pos && sign.neg;

                if (!val || sign.has && val.length==1 || ngModel.$modelValue && Number(val)===0) {
                    var newVal = (!val || ngModel.$modelValue && Number()===0?'':val);
                    if (ngModel.$modelValue !== newVal)
                        updateView(newVal);

                    return '';
                }
                else {
                    var valString = String(val || '');
                    var newSign = (sign.both && ngModel.$modelValue>=0 || !sign.both && sign.neg?'-':'');
                    var newVal = valString.replace(/[^0-9]/g,'');
                    var viewVal = newSign + formatter(angular.copy(newVal));

                    if (modelString !== valString)
                        updateView(viewVal);

                    return (Number(newSign + newVal) / 100) || 0;
                }
            }
            var formatNumber = function(val) {
                if (val) {
                    var str = String(val).split('.');
                    str[1] = str[1] || '0';
                    val = str[0] + '.' + (str[1].length==1?str[1]+'0':str[1]);
                }
                return parseNumber(val);
            }

            ngModel.$parsers.push(parseNumber);
            ngModel.$formatters.push(formatNumber);
        }
    };
}]);
app.directive('ddTextCollapse', ['$compile', function($compile) {

    return {
        restrict: 'A',
        scope: true,
        link: function(scope, element, attrs) {

            // start collapsed
            scope.collapsed = false;

            // create the function to toggle the collapse
            scope.toggle = function() {
                scope.collapsed = !scope.collapsed;
            };

            // wait for changes on the text
            attrs.$observe('ddTextCollapseText', function(text) {

                // get the length from the attributes
                var maxLength = scope.$eval(attrs.ddTextCollapseMaxLength);

                if (text.length > maxLength) {
                    // split the text in two parts, the first always showing
                    var firstPart = String(text).substring(0, maxLength);
                    var secondPart = String(text).substring(maxLength, text.length);

                    // create some new html elements to hold the separate info
                    var firstSpan = $compile('<span>' + firstPart + '</span>')(scope);
                    var secondSpan = $compile('<span ng-if="collapsed">' + secondPart + '</span>')(scope);
                    var moreIndicatorSpan = $compile('<span ng-if="!collapsed">... </span>')(scope);
                    var lineBreak = $compile('<br ng-if="collapsed">')(scope);
                    var toggleButton = $compile('<span class="collapse-text-toggle" ng-click="toggle()">{{collapsed ? "less" : "more"}}</span>')(scope);

                    // remove the current contents of the element
                    // and add the new ones we created
                    element.empty();
                    element.append(firstSpan);
                    element.append(secondSpan);
                    element.append(moreIndicatorSpan);
                    element.append(lineBreak);
                    element.append(toggleButton);
                }
                else {
                    element.empty();
                    element.append(text);
                }
            });
        }
    };
}]);
app.controller('employeeController', [
    '$scope',
    '$rootScope',
    '$window',
    'cookie',
    'uiGridConstants',
    'hrmAPIservice',
    '$interval',
    'fileService',
    'fileService2',
    function ($scope, $rootScope, $window, cookie, uiGridConstants, hrmAPIservice, $interval, fileService, fileService2) {

        //Employee Notes Tag
        $scope.update_id = 0;               //log update id
        $scope.hr_issue_cha = 0;             //employee notes
        $scope.hr_action_cha = 0;
        $scope.add_or_edit = 1; // add edit flag if 1 , add if not, edit default is add
        $scope.en = {};
        $scope.count_flag = false; //timer start and stop flag
        var timestamp = 0;         //timer count variable             
        var stop;                   //$interval variable  
        var hr_issue_note = '';
        var hr_action_note = '';  
        $scope.is_notes_page = false;           //Employee Notes page loading falg
        $scope.all_logs = [];                   //log list
        $scope.is_flag = false;                 //check if exist flag
        $scope.flags = {};                      //flag at present only one
        $scope.selectedEmpDetail = {};    
        $scope.fileLength = 0;                  //flag at present only one
        //employee notes json data to store in database
        $scope.employee_notes_data = {
            hr_issue: '',
            flag_id: 0,
            hr_action: '',
            hr_issue_note: '',
            hr_action_note: '',
            tagged_employee_id: 0,
            tagged_employee_name: '',
            upload_file_path: '',
            hour: '',
            min: '',
            mark_c: false,
            entered_employee_id: 0,
            entered_employee_name: '',
            timer: '',
            updated_time: '',
        };

        
        $scope.noteFormEnabled == false;
        $scope.downloadable_file = '';


        //Lisence and Qualification Tag
        $scope.is_lq_page = false;
        $scope.LQFormEnabled == false;
        $scope.lq_downloadable_file = '';
        $scope.lq_data = {
            license_name: '',
            license_type: '',
            license_number: '',
            license_issuer: '',
            rto: '',
            cost: '',
            state: '',
            upload_file_path: '',
            entered_employee_id: 0,
            entered_employee_name: '',
            date_from: '',
            date_expire: '',
            employee_id: 0,
            employee_firstname : '',
            employee_lastname: '',
            account_id: 0,
        };
        $scope.add_or_edit = 1;
        $scope.fileLength2 = 0;
        $scope.lq_update_id = 0;




        
        //$scope.ctrl.states        = loadAll();
        $scope.en.selectedItem  = null;
        $scope.en.searchText    = null;
        $scope.tagged_employee = "";
        $scope.all_employees = [];                 //all employees' list
            

        var userData = cookie.checkLoggedIn();
        $scope.account_id = userData.firstname + " " + userData.lastname;
        cookie.getPermissions();
        //console.log($rootScope.perms.employeenotes);
        //if undefined
        if(!angular.isDefined($rootScope.perms.employeenotes)){
            $scope.employee_notes_read = 0;
            $scope.employee_notes_write = 0;
            $scope.employee_notes_delete = 0;
        }else{
            $scope.employee_notes_read = ($rootScope.perms.employeenotes.read > 0) ? true : false; //employee notes permission
            $scope.employee_notes_write = ($rootScope.perms.employeenotes.write > 0) ? true : false; //employee notes permission
            $scope.employee_notes_delete = ($rootScope.perms.employeenotes.delete > 0) ? true : false; //employee notes permission
        }
        //if undefined
        if(!angular.isDefined($rootScope.perms.license)){
            $scope.license_read = 0;
            $scope.license_write = 0;
            $scope.license_delete = 0;
        }else{
            $scope.license_read = ($rootScope.perms.license.read > 0) ? true : false; //license permission
            $scope.license_write = ($rootScope.perms.license.write > 0) ? true : false; //license permission
            $scope.license_delete = ($rootScope.perms.license.delete > 0) ? true : false; //license permission
        }
        // $scope.field_status = ($scope.employee_notes_write == false || $scope.formEnabled == 0);
        $scope.pageTitle = "Employees Details";
        $scope.formEnabled = 0;
        $scope.employees = {};
        $scope.emp = {};
        $scope.empwork = {};
        $scope.ew = {};
        

        //issue textarea change event
        $scope.hrIssueConChange = function(){  
            if($scope.empwork.hr_issue_con.length > 3000){
                $scope.empwork.hr_issue_con = hr_issue_note;
                return
            }
            hr_issue_note = $scope.empwork.hr_issue_con;
            $scope.hr_issue_cha = $scope.empwork.hr_issue_con.length;
        }
        
        //format date function
        $scope.formatDate = function(date_string){
            var d = date_string.split(" ");
            var dd = d[0].split("-");
            var d1 = d[1] + " " + dd[2] + "-" + dd[1] + "-" + dd[0];
            return d1;
        }
        //action textarea change event
        $scope.hrActionConChange = function(){
            if($scope.empwork.hr_action_con.length > 3000){
                $scope.empwork.hr_action_con = hr_action_note;
                return
            }
            hr_action_note = $scope.empwork.hr_action_con;
            $scope.hr_action_cha = $scope.empwork.hr_action_con.length;
        }

        //start timer
        $scope.startCount = function(){
            
            // $scope.formEnabled = 0;
            if(!$scope.count_flag){
                stop = $interval(function() {
                    $scope.empwork.timer = (parseInt(timestamp / (60 * 60)) < 10 ? "0" + parseInt(timestamp / (60 * 60)) : parseInt(timestamp / (60 * 60))) + ":" + (parseInt(timestamp / (60)) < 10 ? "0" + parseInt(timestamp / (60)) : parseInt(timestamp / (60))) + ":" + (parseInt(timestamp % (60)) < 10 ? "0" + parseInt(timestamp % (60)) : parseInt(timestamp % (60)));
                    timestamp ++;
                }, 1000);
                $scope.count_flag = true;
            }
        }

        //personal detail page loading event
        $scope.startPersonalDetailPage = function(){
            $scope.is_notes_page = false;
            $scope.noteFormEnabled = false;
            $scope.is_lq_page = false;
            $scope.LQFormEnabled = false;
        }
        //work detail page loading event
        $scope.startWorkDetailPage = function(){
            $scope.is_notes_page = false;
            $scope.noteFormEnabled = false;
            $scope.is_lq_page = false;
            $scope.LQFormEnabled = false;
        }
        //select event after searching 
        $scope.selectTaggedEmployee = function() {
            $scope.employee_notes_data.tagged_employee_id = $scope.en.tagged_employee.value;
            $scope.employee_notes_data.tagged_employee_name = $scope.en.tagged_employee.display;
        }
        //tag entry button click event
        $scope.tagEntry = function(){
            if($scope.employee_notes_data.tagged_employee_id == ''){
                alert('Select valid employee!');
                return;
            }
            alert("Done. A reference to this call log will be tagged to "+ $scope.employee_notes_data.tagged_employee_name + " human resource file.");
        }


        //used new api to get employee notes history list
        


        //used new api to get Employees' list
        hrmAPIservice
        .getOnlyEmployeeList(userData)
        .then(function(response){
            //console.log(response.data);
            $scope.all_employees = response.data.employees.map(function(usr){
                return {
                    value: usr.id,
                    display: usr.firstname + " " + usr.lastname
                }
            });
        });

        //table sort function
        $scope.sort = function(keyname){
            $scope.sortKey = keyname;   //set the sortKey to the param passed
            $scope.reverse = !$scope.reverse; //if true make it false and vice versa
        };
        //search for keyword on tagged employee search form
        $scope.en.querySearch = function(query) {
            if(query != null && query.length > 0) {
                return $scope.all_employees.filter(function(user) {
                   return user.display.toLowerCase().indexOf(query.toLowerCase()) > -1;
                });
            }
        }
        //save employee notes
        $scope.startEmployeeNotesPage = function(){
            $scope.is_lq_page = false;
            $scope.LQFormEnabled = false;
            $scope.is_notes_page = true;
            $scope.noteFormEnabled = $scope.formEnabled == true? true: false;
            if($scope.employee_notes_write && $scope.noteFormEnabled == 1)
                $scope.startCount();
        }
        $scope.startLQPage = function(){
            $scope.is_notes_page = false;
            $scope.noteFormEnabled = false;
            $scope.is_lq_page = true;
            $scope.LQFormEnabled = $scope.formEnabled == true? true: false;
        }
        $scope.gridOptionsComplex = {
            enableFiltering: true,
            showGridFooter: false,
            showColumnFooter: false,
            onRegisterApi: function onRegisterApi(registeredApi) {
                $scope.gridApi = registeredApi;
            },
            columnDefs: [
                {
                    name: 'id',
                    visible: false
                }, {
                    name: 'name',
                    width: '20%'
                }, {
                    name: 'telephone',
                    width: '10%',
                    cellClass: 'center'
                }, {
                    name: 'email',
                    width: '20%',
                    enableFiltering: true,
                    cellClass: 'center'
                }, {
                    name: 'StateName',
                    displayName: 'Site Location',
                    width: '20%',
                    cellClass: 'center'
                }, 
                {
                    name: 'status',
                    width: '20%',
                    enableFiltering: false,
                    cellClass: 'center',
                    cellTemplate: '<button class="btn btn-sm" ng-class="{\'btn-success\': row.entity.active == 1, ' +
                            '\'btn-default\': row.entity.active == 0 }" style="margin-right: 0; border-top-ri' +
                            'ght-radius: 0; border-bottom-right-radius: 0; " ng-click="grid.appScope.activate' +
                            'Employee(row.entity,1)">Active</button><button class="btn btn-sm btn-default" ng' +
                            '-class="{\'btn-success\': row.entity.active == 0, \'btn-default\': row.entity.ac' +
                            'tive == 1 }" ng-click="grid.appScope.activateEmployee(row.entity,0)" style="bord' +
                            'er-top-left-radius: 0; border-bottom-left-radius: 0;">Inactive</button></a>'
                }, {
                    name: 'action',
                    enableFiltering: false,
                    width: '10%',
                    cellClass: 'center',
                    cellTemplate: '<div class="ui-grid-cell-contents"><i class="fa fa-edit fa-2x" ng-click="grid.ap' +
                            'pScope.editEmployee(row.entity)"></i><i class="fa fa-trash-o fa-2x text-danger" ' +
                            'ng-click="grid.appScope.deleteEmployee(row.entity)"></i></div>'
                }
            ]
        };

        $scope.deleteEmployee = function (empDetail) {
            var answer = confirm("Delete employee " + empDetail.firstname + ' ' + empDetail.lastname + '? Are you sure?');
            if (answer) {
                hrmAPIservice
                    .delete(empDetail, userData, 'employee')
                    .then(function (response) {
                        $scope.gridOptionsComplex.data = response.data.employees;
                    });
            }
        }

        $scope.selectSite = function () {
            //console.log('selectSite', $scope.site_location);
            $scope.empwork.site_location = $scope.site_location.value;
        }

        $scope.querySearch = function (query) {
            if (query != null && query.length > 0) {
                return $scope
                    .allsites
                    .filter(function(location) {
                        return location
                            .display
                            .toLowerCase()
                            .indexOf(query.toLowerCase()) > -1;
                    });
            }
        }

        $scope.newEmployee = function () {
            
            $scope.showMessage = 0;
            $scope
                .empform
                .$setPristine();
            $scope.emp = {};
            $scope.empwork = {};
            $scope.emp.id = 0;
            $scope.emp.account_id = userData.account_id;
            $scope.emp.added_by = userData.id;
            $scope.emp.update_by = 0;
            $scope.formEnabled = 1;
        }

        $scope.clearForm = function () {
            $scope.emp = {};
            $scope.empwork = {};
            $scope.site_location = '';
            $scope.formEnabled = 0;
            $scope.en.tagged_employee = null;
            angular.element(document.querySelector('#file_name')).val("");
            $scope.fileLength = fileService.length; 
            $scope.fileLength2 = fileService2.length;
            $scope.empwork.hour = '';
            $scope.empwork.min = '';
        }

        var setDate = function (date) {
            if (typeof date === 'undefined' || date === null) {
                return new Date();
            }

            var a = date.split('-');
            var d = new Date(a[0], a[1] - 1, a[2]);

            return d;
        }
        $scope.formatDate1 = function(date){
            var d = date.split("-");
            return d[2] + "-" + d[1] + "-" + d[0];
        }
        $scope.editEmployee = function (empDetail) {
            timestamp = 0;
            $scope.startCount();
            $scope.selectedEmpDetail = empDetail;
            $scope.showMessage = 0;
            $scope.en.tagged_employee = null;
            $scope.en.searchText = '';
            angular.element(document.querySelector('#file_name')).val("");
            angular.element(document.querySelector('#file_name1')).val("");
            $scope.downloadable_file = '';
            $scope.lq_downloadable_file = '';
            $scope.fileLength = fileService.length;
            $scope.fileLength2 = fileService2.length;
            hrmAPIservice
            .getLogHistory(userData, $scope.selectedEmpDetail.id)
            .then(function(response){
                
                $scope.all_logs = response.data.logs.map(function(log){
                    return{
                        log_id: log.id,
                        subscriber: log.entered_employee_name,
                        hr_issue: log.hr_issue,
                        hr_action: log.hr_action,
                        hr_issue_note: log.hr_issue_note,
                        hr_action_note: log.hr_action_note,
                        mark_c: log.mark_c,
                        updated_time: $scope.formatDate(log.updated_time),
                        downloadable_file: log.upload_file_path,
                        flag_id: log.flag_id,
                        tagged_employee_name: log.tagged_employee_name,
                        tagged_employee_id: log.tagged_employee_id,
                        account_id: log.account_id,
                        hour: log.hour,
                        min: log.min,
                        timer: log.timer,
                        // hr_issue_note_short: log.hr_issue_note.length > 60 ? log.hr_issue_note.slice(0, 60) : '',
                        // hr_action_note_short: log.hr_action_note.length > 60 ? log.hr_action_note.slice(0, 60) : ''
                    }
                });
                //console.log($scope.all_logs);
            });
            hrmAPIservice
            .getLQ(userData, $scope.selectedEmpDetail.id)
            .then(function(response){
                $scope.all_LQs = response.data.logs.map(function(log){
                    return{
                        log_id: log.id,
                        subscriber: log.entered_employee_name,
                        license_name: log.license_name,
                        license_type: log.license_type,
                        license_number: log.license_number,
                        license_issuer: log.license_issuer,
                        rto: log.rto,
                        downloadable_file: log.upload_file_path,
                        account_id: log.account_id,
                        date_from: (log.date_from),
                        date_expire: (log.date_expire),
                        cost: log.cost,
                        state: log.state
                    }
                });
            });
            hrmAPIservice
                .get(empDetail.id, 'employee')
                .then(function (response) {
                    $scope.emp = response.data.emp;
                    $scope.emp.dob = setDate($scope.emp.dob);
                    $scope.emp.visaexpiry = setDate($scope.emp.visaexpiry);
                    
                    $scope.flags = response.data.flags;
                    if($scope.flags.length <= 0){
                        $scope.is_flag = false;
                    }
                    else{
                        $scope.is_flag = true;
                    }

                    $scope.empwork = response.data.empwork;
                    $scope.empwork.start_date = setDate($scope.empwork.start_date);
                    if($scope.empwork.end_date === null){
                        $scope.empwork.end_date = null;    
                    }else {
                        $scope.empwork.end_date = setDate($scope.empwork.end_date);
                    }
                    
                    $scope.site_location = {
                        value: response.data.empwork.site_location,
                        display: response.data.empwork.site_location_name
                    };
                    $scope.empwork.date_from = new Date();
                    $scope.empwork.date_expire = new Date();    
                    $scope.empwork.emp_name = $scope.emp.firstname + " " + $scope.emp.lastname;
                    $scope.formEnabled = 1;
                    $scope.emp.update_by = userData.id;  
                    $scope.noteFormEnabled = 1;
                    $scope.LQFormEnabled = 1;
                    if($scope.employee_notes_write && $scope.noteFormEnabled == 1 && $scope.is_notes_page == true)
                        $scope.startCount();
                });
                $scope.add_or_edit = 1;
                $scope.lq_add_or_edit = 1;
        };

        

        $scope.activateEmployee = function (row, status) {
            hrmAPIservice
                .activateEmployee(row.id, status)
                .then(function (response) {
                    hrmAPIservice
                        .getEmployeeData(userData)
                        .then(function (response) {
                            $scope.gridOptionsComplex.data = response.data.employees;
                        });
                });
        }
        

        hrmAPIservice
            .getEmployeeData(userData)
            .then(function (response) {
                $scope.gridOptionsComplex.data = response.data.employees;
                $scope.countryList = response.data.countries;
                $scope.stateList = response.data.states;
                $scope.personList = response.data.persontype;

                $scope.positionList = response.data.positions;
                $scope.levelList = response.data.levels;
                $scope.departmentList = response.data.departments;
                $scope.siteLocationList = response.data.sitelocation;
                $scope.emptypeList = response.data.emptype;


                $scope.hr_issue_list = response.data.hr_issue;
                $scope.hr_action_list = response.data.hr_action;
                $scope.license_name_list = response.data.license_name;
                $scope.license_type_list = response.data.license_type;
                $scope.flag_list = response.data.flag;
                
                

                $scope.allsites = $scope
                    .siteLocationList
                    .map(function (site) {
                        return {value: site.id, display: site.display_text};
                    });

                

            });

        //save employee log
        $scope.saveEmployeeNotes = function(){
            
            //check that any employee that can be added or edited is chosen
            if($scope.emp.id == '' || $scope.emp.id == null){
                alert("Can't add log! Choose an employee.");
                return
            }
            //console.log($rootScope.perms.employeenotes);
            //check permission
            if($rootScope.perms.employeenotes.write <= 0){
                alert("You don't have an access to write");
                return
            }
            
            if($scope.is_notes_page){
                //validation
                if($scope.empwork.hr_issue == '' || $scope.empwork.hr_issue == null){
                    alert("Select HR Issue!");
                    return
                }
                    
                if($scope.empwork.hr_issue_con == '' || $scope.empwork.hr_issue_con == null){
                    alert("Enter HR issue note");
                    return
                }
                
                if($scope.empwork.hr_action == '' || $scope.empwork.hr_action == null){
                    alert("Select HR Action!");
                    return
                }

                if($scope.empwork.hr_action_con == '' || $scope.empwork.hr_action_con == null){
                    alert("Enter HR action note");
                    return
                }
                if(($scope.empwork.hour == '' || !angular.isDefined($scope.empwork.hour)) && ($scope.empwork.min == '' || !angular.isDefined($scope.empwork.min))){
                    alert("HRM Form Validation Error:\nPlease allocate how much time is attributed to this call log");
                    return
                }
                //check if add or edit.
                //if add, go ahead.
                if($scope.add_or_edit){

                        //if file is selected
                        if($scope.fileLength < fileService.length){
                            
                            var file = fileService[fileService.length - 1];
                            
                            var uploadUrl = "assets/php/upload.php";
                            hrmAPIservice.uploadFileToUrl(file, uploadUrl).then(function(response){
                                
                                alert(response.data.msg);
                                if(!response.data.status){
                                    return
                                }else{
                                    
                                    $scope.employee_notes_data.hr_issue = $scope.empwork.hr_issue;
                                    $scope.employee_notes_data.flag_id = $scope.empwork.flag;
                                    $scope.employee_notes_data.hr_action = $scope.empwork.hr_action;
                                    $scope.employee_notes_data.hr_issue_note = $scope.empwork.hr_issue_con;
                                    $scope.employee_notes_data.hr_action_note = $scope.empwork.hr_action_con;
                                    $scope.employee_notes_data.upload_file_path = "assets/php/uploads/" + file.name;
                                    $scope.employee_notes_data.entered_employee_id = userData.id;
                                    $scope.employee_notes_data.entered_employee_name = userData.firstname + " " + userData.lastname;
                                    $scope.employee_notes_data.hour = $scope.empwork.hour;
                                    $scope.employee_notes_data.min = $scope.empwork.min;
                                    $scope.employee_notes_data.mark_c = $scope.empwork.mark_c;
                                    $scope.employee_notes_data.timer = $scope.empwork.timer;
                                    $scope.employee_notes_data.updated_time = '';
                                    $scope.employee_notes_data.employee_id = $scope.emp.id;
                                    $scope.employee_notes_data.employee_firstname = $scope.emp.firstname;
                                    $scope.employee_notes_data.employee_lastname = $scope.emp.lastname;
                                    $scope.employee_notes_data.account_id = userData.account_id;
                                    //save
                                    var employee_notes = Object.assign({}, $scope.employee_notes_data);
                                    hrmAPIservice.saveEmployeeNotes(employee_notes).then(function(response){
                                        if(response.status == "200"){
                                            $scope.success = 1;
                                            $scope.userMessage = "Employee Notes have been saved successfully!";
                                            $scope.showMessage = 1;
                                            
        
                                            hrmAPIservice
                                            .getLogHistory(userData, $scope.selectedEmpDetail.id)
                                            .then(function(response){
                                                
                                                $scope.all_logs = response.data.logs.map(function(log){
                                                    return{
                                                        log_id: log.id,
                                                        subscriber: log.entered_employee_name,
                                                        hr_issue: log.hr_issue,
                                                        hr_action: log.hr_action,
                                                        hr_issue_note: log.hr_issue_note,
                                                        hr_action_note: log.hr_action_note,
                                                        mark_c: log.mark_c,
                                                        updated_time: $scope.formatDate(log.updated_time),
                                                        downloadable_file: log.upload_file_path,
                                                        flag_id: log.flag_id,
                                                        tagged_employee_name: log.tagged_employee_name,
                                                        tagged_employee_id: log.tagged_employee_id,
                                                        account_id: log.account_id,
                                                        hour: log.hour,
                                                        min: log.min,
                                                        timer: log.timer
                                                    }
                                                });
                                                //format forms and variables to submit
                                                $scope.empwork.hr_issue = '';
                                                $scope.empwork.hr_issue_con = '';
                                                $scope.empwork.hr_action_con = '';
                                                $scope.empwork.hr_action = '';
                                                $scope.empwork.mark_c = false;
                                                $scope.empwork.hour = '';
                                                $scope.empwork.min = '';
                                                $scope.empwork.flag = '';
                                                $scope.employee_notes_data.tagged_employee_id = '';
                                                $scope.employee_notes_data.tagged_employee_name = '';
                                                $scope.en.tagged_employee = null;
                                                $scope.en.searchText = "";
                                                angular.element(document.querySelector('#file_name')).val("");
                                                $scope.fileLength = fileService.length;
                                                //download button disable
                                                $scope.downloadable_file = '';
                                                //fileService = [];
                                                //console.log(file.name);
                                                
                                            });
                                            //$interval.cancel(stop);
                                            timestamp = 0;
                                            hrmAPIservice
                                            .get($scope.selectedEmpDetail.id, 'employee')
                                            .then(function (response) {
                                                $scope.emp = response.data.emp;
                                                $scope.emp.dob = setDate($scope.emp.dob);
                                                $scope.emp.visaexpiry = setDate($scope.emp.visaexpiry);
                                                
                                                $scope.flags = response.data.flags;
                                                if(!$scope.flags){
                                                    $scope.is_flag = false;
                                                }
                                                else{
                                                    $scope.is_flag = true;
                                                }

                                                $scope.empwork = response.data.empwork;
                                                $scope.empwork.start_date = setDate($scope.empwork.start_date);
                                                if($scope.empwork.end_date === null){
                                                    $scope.empwork.end_date = null;    
                                                }else {
                                                    $scope.empwork.end_date = setDate($scope.empwork.end_date);
                                                }
                                                
                                                $scope.site_location = {
                                                    value: response.data.empwork.site_location,
                                                    display: response.data.empwork.site_location_name
                                                };
                                                
                                                $scope.formEnabled = 1;
                                                $scope.emp.update_by = userData.id;
                                                
                                                
                                            });




                                        }
                                    })
        
        
        
                                    
                                }
                                
                            });
                            
                        }else{
                            
                            $scope.employee_notes_data.hr_issue = $scope.empwork.hr_issue;
                            $scope.employee_notes_data.flag_id = $scope.empwork.flag;
                            $scope.employee_notes_data.hr_action = $scope.empwork.hr_action;
                            $scope.employee_notes_data.hr_issue_note = $scope.empwork.hr_issue_con;
                            $scope.employee_notes_data.hr_action_note = $scope.empwork.hr_action_con;
                            $scope.employee_notes_data.entered_employee_id = userData.id;
                            $scope.employee_notes_data.entered_employee_name = userData.firstname + " " + userData.lastname;
                            $scope.employee_notes_data.hour = $scope.empwork.hour;
                            $scope.employee_notes_data.min = $scope.empwork.min;
                            $scope.employee_notes_data.mark_c = $scope.empwork.mark_c;
                            $scope.employee_notes_data.timer = $scope.empwork.timer;
                            $scope.employee_notes_data.updated_time = '';
                            $scope.employee_notes_data.employee_id = $scope.emp.id;
                            $scope.employee_notes_data.employee_firstname = $scope.emp.firstname;
                            $scope.employee_notes_data.employee_lastname = $scope.emp.lastname;
                            $scope.employee_notes_data.account_id = userData.account_id;
                            $scope.employee_notes_data.upload_file_path = "";

                            //save
                            var employee_notes = Object.assign({}, $scope.employee_notes_data);
                            hrmAPIservice.saveEmployeeNotes(employee_notes).then(function(response){
                                //console.log("here");
                                if(response.status == "200"){
                                    $scope.success = 1;
                                    $scope.userMessage = "Employee Notes have been saved successfully!";
                                    $scope.showMessage = 1;
                                    
                                    //console.log(response.data);
                                    hrmAPIservice
                                    .getLogHistory(userData, $scope.selectedEmpDetail.id)
                                    .then(function(response){
                                        
                                        $scope.all_logs = response.data.logs.map(function(log){
                                            return{
                                                log_id: log.id,
                                                subscriber: log.entered_employee_name,
                                                hr_issue: log.hr_issue,
                                                hr_action: log.hr_action,
                                                hr_issue_note: log.hr_issue_note,
                                                hr_action_note: log.hr_action_note,
                                                mark_c: log.mark_c,
                                                updated_time: $scope.formatDate(log.updated_time),
                                                downloadable_file: log.upload_file_path,
                                                tagged_employee_name: log.tagged_employee_name,
                                                tagged_employee_id: log.tagged_employee_id,
                                                flag_id: log.flag_id,
                                                account_id: log.account_id,
                                                hour: log.hour,
                                                min: log.min,
                                                timer: log.timer
                                            }
                                        });
                                        //format forms and variables to submit
                                        $scope.empwork.hr_issue = '';
                                        $scope.empwork.hr_issue_con = '';
                                        $scope.empwork.hr_action_con = '';
                                        $scope.empwork.hr_action = '';
                                        $scope.empwork.mark_c = false;
                                        $scope.empwork.hour = '';
                                        $scope.empwork.min = '';
                                        $scope.empwork.flag = '';
                                        $scope.employee_notes_data.tagged_employee_id = '';
                                        $scope.employee_notes_data.tagged_employee_name = '';
                                        $scope.en.tagged_employee = null;
                                        $scope.en.searchText = "";
                                        //angular.element(document.querySelector('#file_name')).val("");
                                        //fileService = [];
                                        //console.log(file);
                                        $scope.fileLength = fileService.length;
                                        //download button disable
                                        $scope.downloadable_file = '';
                                    });
                                    //$interval.cancel(stop);
                                    timestamp = 0;
                                    hrmAPIservice
                                    .get($scope.selectedEmpDetail.id, 'employee')
                                    .then(function (response) {
                                        $scope.emp = response.data.emp;
                                        $scope.emp.dob = setDate($scope.emp.dob);
                                        $scope.emp.visaexpiry = setDate($scope.emp.visaexpiry);
                                        
                                        $scope.flags = response.data.flags;
                                        if(!$scope.flags){
                                            $scope.is_flag = false;
                                        }
                                        else{
                                            $scope.is_flag = true;
                                        }

                                        $scope.empwork = response.data.empwork;
                                        $scope.empwork.start_date = setDate($scope.empwork.start_date);
                                        if($scope.empwork.end_date === null){
                                            $scope.empwork.end_date = null;    
                                        }else {
                                            $scope.empwork.end_date = setDate($scope.empwork.end_date);
                                        }
                                        
                                        $scope.site_location = {
                                            value: response.data.empwork.site_location,
                                            display: response.data.empwork.site_location_name
                                        };
                                        
                                        $scope.formEnabled = 1;
                                        $scope.emp.update_by = userData.id;
                                        
                                        
                                    });         
                                }
                            })
        
                            
                        }
                    }
                
                    else{//if edit, go ahead
                        if($scope.fileLength < fileService.length){
                            
                            var file = fileService[fileService.length - 1];
                            
                            var uploadUrl = "assets/php/upload.php";
                            hrmAPIservice.uploadFileToUrl(file, uploadUrl).then(function(response){
                                
                                alert(response.data.msg);
                                if(!response.data.status){
                                    return
                                }else{
                                    
                                    $scope.employee_notes_data.hr_issue = $scope.empwork.hr_issue;
                                    $scope.employee_notes_data.flag_id = $scope.empwork.flag;
                                    $scope.employee_notes_data.hr_action = $scope.empwork.hr_action;
                                    $scope.employee_notes_data.hr_issue_note = $scope.empwork.hr_issue_con;
                                    $scope.employee_notes_data.hr_action_note = $scope.empwork.hr_action_con;
                                    $scope.employee_notes_data.upload_file_path = "assets/php/uploads/" + file.name;
                                    $scope.employee_notes_data.entered_employee_id = userData.id;
                                    $scope.employee_notes_data.entered_employee_name = userData.firstname + " " + userData.lastname;
                                    $scope.employee_notes_data.hour = $scope.empwork.hour;
                                    $scope.employee_notes_data.min = $scope.empwork.min;
                                    $scope.employee_notes_data.mark_c = $scope.empwork.mark_c;
                                    $scope.employee_notes_data.timer = $scope.empwork.timer;
                                    $scope.employee_notes_data.updated_time = '';
                                    $scope.employee_notes_data.employee_id = $scope.emp.id;
                                    $scope.employee_notes_data.employee_firstname = $scope.emp.firstname;
                                    $scope.employee_notes_data.employee_lastname = $scope.emp.lastname;
                                    $scope.employee_notes_data.account_id = userData.account_id;
                                    //save
                                    var employee_notes = Object.assign({}, $scope.employee_notes_data);
                                    hrmAPIservice.updateEmployeeNotes(employee_notes, $scope.update_id).then(function(response){
                                        if(response.status == "200"){
                                            $scope.success = 1;
                                            $scope.userMessage = "Employee Notes have been edited successfully!";
                                            $scope.showMessage = 1;
                                            
        
                                            hrmAPIservice
                                            .getLogHistory(userData, $scope.selectedEmpDetail.id)
                                            .then(function(response){
                                                
                                                $scope.all_logs = response.data.logs.map(function(log){
                                                    return{
                                                        log_id: log.id,
                                                        subscriber: log.entered_employee_name,
                                                        hr_issue: log.hr_issue,
                                                        hr_action: log.hr_action,
                                                        hr_issue_note: log.hr_issue_note,
                                                        hr_action_note: log.hr_action_note,
                                                        mark_c: log.mark_c,
                                                        updated_time: $scope.formatDate(log.updated_time),
                                                        downloadable_file: log.upload_file_path,
                                                        tagged_employee_name: log.tagged_employee_name,
                                                        tagged_employee_id: log.tagged_employee_id,
                                                        flag_id: log.flag_id,
                                                        account_id: log.account_id,
                                                        hour: log.hour,
                                                        min: log.min,
                                                        timer: log.timer
                                                    }
                                                });
                                                $scope.empwork.hr_issue = '';
                                                $scope.empwork.hr_issue_con = '';
                                                $scope.empwork.hr_action_con = '';
                                                $scope.empwork.hr_action = '';
                                                $scope.empwork.mark_c = false;
                                                $scope.empwork.hour = '';
                                                $scope.empwork.min = '';
                                                $scope.empwork.flag = '';
                                                $scope.employee_notes_data.tagged_employee_id = '';
                                                $scope.employee_notes_data.tagged_employee_name = '';
                                                $scope.en.tagged_employee = null;
                                                $scope.en.searchText = "";
                                                angular.element(document.querySelector('#file_name')).val("");
                                                $scope.fileLength = fileService.length;
                                                //download button disable
                                                $scope.downloadable_file = '';
                                                
                                            });
                                            hrmAPIservice
                                            .get($scope.selectedEmpDetail.id, 'employee')
                                            .then(function (response) {
                                                $scope.emp = response.data.emp;
                                                $scope.emp.dob = setDate($scope.emp.dob);
                                                $scope.emp.visaexpiry = setDate($scope.emp.visaexpiry);
                                                
                                                $scope.flags = response.data.flags;
                                                if(!$scope.flags){
                                                    $scope.is_flag = false;
                                                }
                                                else{
                                                    $scope.is_flag = true;
                                                }

                                                $scope.empwork = response.data.empwork;
                                                $scope.empwork.start_date = setDate($scope.empwork.start_date);
                                                if($scope.empwork.end_date === null){
                                                    $scope.empwork.end_date = null;    
                                                }else {
                                                    $scope.empwork.end_date = setDate($scope.empwork.end_date);
                                                }
                                                
                                                $scope.site_location = {
                                                    value: response.data.empwork.site_location,
                                                    display: response.data.empwork.site_location_name
                                                };
                                                
                                                $scope.formEnabled = 1;
                                                $scope.emp.update_by = userData.id;
                                                
                                                
                                            });
                                            timestamp = 0;
                                        }
                                    });    
                                }
                                
                            });
                            
                        }else{
                            $scope.employee_notes_data.hr_issue = $scope.empwork.hr_issue;
                            $scope.employee_notes_data.flag_id = $scope.empwork.flag;
                            $scope.employee_notes_data.hr_action = $scope.empwork.hr_action;
                            $scope.employee_notes_data.hr_issue_note = $scope.empwork.hr_issue_con;
                            $scope.employee_notes_data.hr_action_note = $scope.empwork.hr_action_con;
                            $scope.employee_notes_data.entered_employee_id = userData.id;
                            $scope.employee_notes_data.entered_employee_name = userData.firstname + " " + userData.lastname;
                            $scope.employee_notes_data.hour = $scope.empwork.hour;
                            $scope.employee_notes_data.min = $scope.empwork.min;
                            $scope.employee_notes_data.mark_c = $scope.empwork.mark_c;
                            $scope.employee_notes_data.timer = $scope.empwork.timer;
                            $scope.employee_notes_data.updated_time = '';
                            $scope.employee_notes_data.employee_id = $scope.emp.id;
                            $scope.employee_notes_data.employee_firstname = $scope.emp.firstname;
                            $scope.employee_notes_data.employee_lastname = $scope.emp.lastname;
                            $scope.employee_notes_data.account_id = userData.account_id;
                            $scope.employee_notes_data.upload_file_path = $scope.downloadable_file;
                            //save
                            var employee_notes = Object.assign({}, $scope.employee_notes_data);
                            hrmAPIservice.updateEmployeeNotes(employee_notes, $scope.update_id).then(function(response){
                                //console.log(response.data);
                                if(response.status == "200"){
                                    $scope.success = 1;
                                    $scope.userMessage = "Employee Notes have been edited successfully!";
                                    $scope.showMessage = 1;
                                    
                                    //console.log("start refresh");
                                    hrmAPIservice
                                    .getLogHistory(userData, $scope.selectedEmpDetail.id)
                                    .then(function(response){
                                        
                                        $scope.all_logs = response.data.logs.map(function(log){
                                            return{
                                                log_id: log.id,
                                                subscriber: log.entered_employee_name,
                                                hr_issue: log.hr_issue,
                                                hr_action: log.hr_action,
                                                hr_issue_note: log.hr_issue_note,
                                                hr_action_note: log.hr_action_note,
                                                mark_c: log.mark_c,
                                                updated_time: $scope.formatDate(log.updated_time),
                                                downloadable_file: log.upload_file_path,
                                                tagged_employee_name: log.tagged_employee_name,
                                                tagged_employee_id: log.tagged_employee_id,
                                                flag_id: log.flag_id,
                                                account_id: log.account_id,
                                                hour: log.hour,
                                                min: log.min,
                                                timer: log.timer
                                            }
                                        });
                                        $scope.empwork.hr_issue = '';
                                        $scope.empwork.hr_issue_con = '';
                                        $scope.empwork.hr_action_con = '';
                                        $scope.empwork.hr_action = '';
                                        $scope.empwork.mark_c = false;
                                        $scope.empwork.hour = '';
                                        $scope.empwork.min = '';
                                        $scope.empwork.flag = '';
                                        $scope.employee_notes_data.tagged_employee_id = '';
                                        $scope.employee_notes_data.tagged_employee_name = '';
                                        $scope.en.tagged_employee = null;
                                        $scope.en.searchText = "";
                                        $scope.fileLength = fileService.length;
                                        //download button disable
                                        $scope.downloadable_file = '';
                                    });
                                    hrmAPIservice
                                    .get($scope.selectedEmpDetail.id, 'employee')
                                    .then(function (response) {
                                        $scope.emp = response.data.emp;
                                        $scope.emp.dob = setDate($scope.emp.dob);
                                        $scope.emp.visaexpiry = setDate($scope.emp.visaexpiry);
                                        
                                        $scope.flags = response.data.flags;
                                        if(!$scope.flags){
                                            $scope.is_flag = false;
                                        }
                                        else{
                                            $scope.is_flag = true;
                                        }

                                        $scope.empwork = response.data.empwork;
                                        $scope.empwork.start_date = setDate($scope.empwork.start_date);
                                        if($scope.empwork.end_date === null){
                                            $scope.empwork.end_date = null;    
                                        }else {
                                            $scope.empwork.end_date = setDate($scope.empwork.end_date);
                                        }
                                        
                                        $scope.site_location = {
                                            value: response.data.empwork.site_location,
                                            display: response.data.empwork.site_location_name
                                        };
                                        
                                        $scope.formEnabled = 1;
                                        $scope.emp.update_by = userData.id;
                                        
                                        
                                    });
                                    timestamp = 0;
                                }
                            });
        
                            
                        }
                    }
                }
        }
        //save employee license
        $scope.saveLQ = function(){
            
            //check that any employee that can be added or edited is chosen
            if($scope.emp.id == '' || $scope.emp.id == null){
                alert("Can't add license! Choose an employee.");
                return
            }
            //console.log($rootScope.perms.employeenotes);
            //check permission
            if($rootScope.perms.license.write <= 0){
                alert("You don't have an access to write");
                return
            }
            
            if($scope.is_lq_page){
                //validation
                if($scope.empwork.license_name == '' || $scope.empwork.license_name == null){
                    alert("Select License/Qualification Name.");
                    return
                }
                    
                if($scope.empwork.license_type == '' || $scope.empwork.license_type == null){
                    alert("Select Type, Class or Condition.");
                    return
                }
                
                if($scope.empwork.license_number == '' || $scope.empwork.license_number == null){
                    alert("Enter License/Qualification Number.");
                    return
                }

                if($scope.empwork.license_issuer == '' || $scope.empwork.license_issuer == null){
                    alert("Enter License/Qualification Issuer");
                    return
                }
                if($scope.empwork.rto == '' || $scope.empwork.rto == null){
                    alert("Enter RTO");
                    return
                }
                if($scope.empwork.cost == '' || $scope.empwork.cost == null){
                    alert("Enter Cost");
                    return
                }
                if($scope.emp.state == '' || $scope.emp.state == null){
                    alert("Select State.");
                    return
                }
                if($scope.empwork.date_from == '' || $scope.empwork.date_from == null){
                    alert("Enter Start Date of License/Qualification");
                    return
                }
                if($scope.empwork.date_expire == '' || $scope.empwork.date_expire == null){
                    alert("Enter End Date of License/Qualification");
                    return
                }
                //check if add or edit.
                //if add, go ahead.
                if($scope.lq_add_or_edit){
                        
                        //if file is selected
                        if($scope.fileLength2 < fileService2.length){
                            
                            var file = fileService2[fileService2.length - 1];
                            
                            var uploadUrl = "assets/php/upload.php";
                            hrmAPIservice.uploadFileToUrl(file, uploadUrl).then(function(response){
                                
                                alert(response.data.msg);
                                if(!response.data.status){
                                    return
                                }else{
                                    
                                    $scope.lq_data.license_name = $scope.empwork.license_name;
                                    $scope.lq_data.license_type = $scope.empwork.license_type;
                                    $scope.lq_data.license_number = $scope.empwork.license_number;
                                    $scope.lq_data.license_issuer = $scope.empwork.license_issuer;
                                    $scope.lq_data.rto = $scope.empwork.rto;
                                    $scope.lq_data.cost = $scope.empwork.cost;
                                    $scope.lq_data.state = $scope.emp.state;
                                    $scope.lq_data.upload_file_path = "assets/php/uploads/" + file.name;
                                    $scope.lq_data.entered_employee_id = userData.id;
                                    $scope.lq_data.entered_employee_name = userData.firstname + " " + userData.lastname;
                                    $scope.lq_data.date_from = $scope.localTimeToUtc($scope.empwork.date_from);
                                    $scope.lq_data.date_expire = $scope.localTimeToUtc($scope.empwork.date_expire);
                                    
                                    
                                    // $scope.employee_notes_data.updated_time = '';
                                    $scope.lq_data.employee_id = $scope.emp.id;
                                    $scope.lq_data.employee_firstname = $scope.emp.firstname;
                                    $scope.lq_data.employee_lastname = $scope.emp.lastname;
                                    $scope.lq_data.account_id = userData.account_id;
                                    //save
                                    var lq = Object.assign({}, $scope.lq_data);
                                    hrmAPIservice.saveLQ(lq).then(function(response){
                                        console.log(response);
                                        if(response.status == "200"){
                                            $scope.success = 1;
                                            $scope.userMessage = "Employee Notes have been saved successfully!";
                                            $scope.showMessage = 1;
                                            
        
                                            hrmAPIservice
                                            .getLQ(userData, $scope.selectedEmpDetail.id)
                                            .then(function(response){
                                                
                                                $scope.all_LQs = response.data.logs.map(function(log){
                                                    return{
                                                        log_id: log.id,
                                                        subscriber: log.entered_employee_name,
                                                        license_name: log.license_name,
                                                        license_type: log.license_type,
                                                        license_number: log.license_number,
                                                        license_issuer: log.license_issuer,
                                                        rto: log.rto,
                                                        downloadable_file: log.upload_file_path,
                                                        account_id: log.account_id,
                                                        date_from: (log.date_from),
                                                        date_expire: (log.date_expire),
                                                        cost: log.cost,
                                                        state: log.state
                                                    }
                                                });
                                                //format forms and variables to submit
                                                $scope.empwork.license_name = '';
                                                $scope.empwork.license_type = '';
                                                $scope.empwork.license_number = '';
                                                $scope.empwork.license_issuer = '';
                                                $scope.empwork.rto = '';
                                                $scope.empwork.cost = '';
                                                $scope.emp.state = '';
                                                $scope.empwork.date_from = '';
                                                $scope.empwork.date_expire = '';
                                                angular.element(document.querySelector('#file_name1')).val("");
                                                $scope.fileLength2 = fileService2.length;
                                                //download button disable
                                                $scope.lq_downloadable_file = '';
                                                //fileService = [];
                                                //console.log(file.name);
                                                
                                            });
                                            
                                        }
                                    })
        
        
        
                                    
                                }
                                
                            });
                            
                        }else{
                            $scope.lq_data.license_name = $scope.empwork.license_name;
                            $scope.lq_data.license_type = $scope.empwork.license_type;
                            $scope.lq_data.license_number = $scope.empwork.license_number;
                            $scope.lq_data.license_issuer = $scope.empwork.license_issuer;
                            $scope.lq_data.rto = $scope.empwork.rto;
                            $scope.lq_data.cost = $scope.empwork.cost;
                            $scope.lq_data.state = $scope.emp.state;
                            //$scope.lq_data.upload_file_path = "assets/php/uploads/" + file.name;
                            $scope.lq_data.entered_employee_id = userData.id;
                            $scope.lq_data.entered_employee_name = userData.firstname + " " + userData.lastname;
                            $scope.lq_data.date_from = $scope.localTimeToUtc($scope.empwork.date_from);
                            $scope.lq_data.date_expire = $scope.localTimeToUtc($scope.empwork.date_expire);
                            $scope.lq_data.upload_file_path = "";
                            
                            $scope.lq_data.employee_id = $scope.emp.id;
                            $scope.lq_data.employee_firstname = $scope.emp.firstname;
                            $scope.lq_data.employee_lastname = $scope.emp.lastname;
                            $scope.lq_data.account_id = userData.account_id;
                            //save
                            var lq = Object.assign({}, $scope.lq_data);
                            hrmAPIservice.saveLQ(lq).then(function(response){
                                console.log(response);
                                if(response.status == "200"){
                                    $scope.success = 1;
                                    $scope.userMessage = "Employee Notes have been saved successfully!";
                                    $scope.showMessage = 1;
                                    

                                    hrmAPIservice
                                    .getLQ(userData, $scope.selectedEmpDetail.id)
                                    .then(function(response){
                                        
                                        $scope.all_LQs = response.data.logs.map(function(log){
                                            return{
                                                log_id: log.id,
                                                subscriber: log.entered_employee_name,
                                                license_name: log.license_name,
                                                license_type: log.license_type,
                                                license_number: log.license_number,
                                                license_issuer: log.license_issuer,
                                                rto: log.rto,
                                                downloadable_file: log.upload_file_path,
                                                account_id: log.account_id,
                                                date_from: (log.date_from),
                                                date_expire: (log.date_expire),
                                                cost: log.cost,
                                                state: log.state
                                            }
                                        });
                                        //format forms and variables to submit
                                        $scope.empwork.license_name = '';
                                        $scope.empwork.license_type = '';
                                        $scope.empwork.license_number = '';
                                        $scope.empwork.license_issuer = '';
                                        $scope.empwork.rto = '';
                                        $scope.empwork.cost = '';
                                        $scope.emp.state = '';
                                        $scope.empwork.date_from = '';
                                        $scope.empwork.date_expire = '';
                                        angular.element(document.querySelector('#file_name1')).val("");
                                        $scope.fileLength2 = fileService2.length;
                                        //download button disable
                                        $scope.lq_downloadable_file = '';
                                        //fileService = [];
                                    
                                    });
                                    
                                }
                            })

                            
                        }
                    }
                
                    else{//if edit, go ahead
                        if($scope.fileLength2 < fileService2.length){
                            
                            var file = fileService2[fileService2.length - 1];
                            
                            var uploadUrl = "assets/php/upload.php";
                            hrmAPIservice.uploadFileToUrl(file, uploadUrl).then(function(response){
                                
                                alert(response.data.msg);
                                if(!response.data.status){
                                    return
                                }else{
                                    
                                    $scope.lq_data.license_name = $scope.empwork.license_name;
                                    $scope.lq_data.license_type = $scope.empwork.license_type;
                                    $scope.lq_data.license_number = $scope.empwork.license_number;
                                    $scope.lq_data.license_issuer = $scope.empwork.license_issuer;
                                    $scope.lq_data.rto = $scope.empwork.rto;
                                    $scope.lq_data.cost = $scope.empwork.cost;
                                    $scope.lq_data.state = $scope.emp.state;
                                    $scope.lq_data.upload_file_path = "assets/php/uploads/" + file.name;
                                    $scope.lq_data.entered_employee_id = userData.id;
                                    $scope.lq_data.entered_employee_name = userData.firstname + " " + userData.lastname;
                                    $scope.lq_data.date_from = $scope.localTimeToUtc($scope.empwork.date_from);
                                    $scope.lq_data.date_expire = $scope.localTimeToUtc($scope.empwork.date_expire);
                                    
                                    
                                    // $scope.employee_notes_data.updated_time = '';
                                    $scope.lq_data.employee_id = $scope.emp.id;
                                    $scope.lq_data.employee_firstname = $scope.emp.firstname;
                                    $scope.lq_data.employee_lastname = $scope.emp.lastname;
                                    $scope.lq_data.account_id = userData.account_id;
                                    //save
                                    var lq = Object.assign({}, $scope.lq_data);
                                    hrmAPIservice.updateLQ(lq, $scope.lq_update_id).then(function(response){
                                        //console.log(response);
                                        if(response.status == "200"){
                                            $scope.success = 1;
                                            $scope.userMessage = "Employee Notes have been edited successfully!";
                                            $scope.showMessage = 1;
                                            
        
                                            hrmAPIservice
                                            .getLQ(userData, $scope.selectedEmpDetail.id)
                                            .then(function(response){
                                                
                                                $scope.all_LQs = response.data.logs.map(function(log){
                                                    return{
                                                        log_id: log.id,
                                                        subscriber: log.entered_employee_name,
                                                        license_name: log.license_name,
                                                        license_type: log.license_type,
                                                        license_number: log.license_number,
                                                        license_issuer: log.license_issuer,
                                                        rto: log.rto,
                                                        downloadable_file: log.upload_file_path,
                                                        account_id: log.account_id,
                                                        date_from: log.date_from,
                                                        date_expire: log.date_expire,
                                                        cost: log.cost,
                                                        state: log.state
                                                    }
                                                });
                                                //format forms and variables to submit
                                                $scope.empwork.license_name = '';
                                                $scope.empwork.license_type = '';
                                                $scope.empwork.license_number = '';
                                                $scope.empwork.license_issuer = '';
                                                $scope.empwork.rto = '';
                                                $scope.empwork.cost = '';
                                                $scope.emp.state = '';
                                                $scope.empwork.date_from = '';
                                                $scope.empwork.date_expire = '';
                                                angular.element(document.querySelector('#file_name1')).val("");
                                                $scope.fileLength2 = fileService2.length;
                                                //download button disable
                                                $scope.lq_downloadable_file = '';
                                                //fileService = [];
                                                //console.log(file.name);
                                                
                                            });
                                            
                                        }
                                    })
        
        
        
                                    
                                }
                                
                            });
                            
                        }else{
                            $scope.lq_data.license_name = $scope.empwork.license_name;
                            $scope.lq_data.license_type = $scope.empwork.license_type;
                            $scope.lq_data.license_number = $scope.empwork.license_number;
                            $scope.lq_data.license_issuer = $scope.empwork.license_issuer;
                            $scope.lq_data.rto = $scope.empwork.rto;
                            $scope.lq_data.cost = $scope.empwork.cost;
                            $scope.lq_data.state = $scope.emp.state;
                            $scope.lq_data.upload_file_path = $scope.lq_downloadable_file;
                            $scope.lq_data.entered_employee_id = userData.id;
                            $scope.lq_data.entered_employee_name = userData.firstname + " " + userData.lastname;
                            $scope.lq_data.date_from = $scope.localTimeToUtc($scope.empwork.date_from);
                            $scope.lq_data.date_expire = $scope.localTimeToUtc($scope.empwork.date_expire);
                            
                            
                            // $scope.employee_notes_data.updated_time = '';
                            $scope.lq_data.employee_id = $scope.emp.id;
                            $scope.lq_data.employee_firstname = $scope.emp.firstname;
                            $scope.lq_data.employee_lastname = $scope.emp.lastname;
                            $scope.lq_data.account_id = userData.account_id;
                            //save
                            var lq = Object.assign({}, $scope.lq_data);
                            hrmAPIservice.updateLQ(lq, $scope.lq_update_id).then(function(response){
                                console.log(response);
                                if(response.status == "200"){
                                    $scope.success = 1;
                                    $scope.userMessage = "Employee Notes have been edited successfully!";
                                    $scope.showMessage = 1;
                                    

                                    hrmAPIservice
                                    .getLQ(userData, $scope.selectedEmpDetail.id)
                                    .then(function(response){
                                        
                                        $scope.all_LQs = response.data.logs.map(function(log){
                                            return{
                                                log_id: log.id,
                                                subscriber: log.entered_employee_name,
                                                license_name: log.license_name,
                                                license_type: log.license_type,
                                                license_number: log.license_number,
                                                license_issuer: log.license_issuer,
                                                rto: log.rto,
                                                downloadable_file: log.upload_file_path,
                                                account_id: log.account_id,
                                                date_from: log.date_from,
                                                date_expire: log.date_expire,
                                                cost: log.cost,
                                                state: log.state
                                            }
                                        });
                                        //format forms and variables to submit
                                        $scope.empwork.license_name = '';
                                        $scope.empwork.license_type = '';
                                        $scope.empwork.license_number = '';
                                        $scope.empwork.license_issuer = '';
                                        $scope.empwork.rto = '';
                                        $scope.empwork.cost = '';
                                        $scope.emp.state = '';
                                        $scope.empwork.date_from = '';
                                        $scope.empwork.date_expire = '';
                                        angular.element(document.querySelector('#file_name1')).val("");
                                        $scope.fileLength2 = fileService2.length;
                                        //download button disable
                                        $scope.lq_downloadable_file = '';
                                        //fileService = [];
                                    
                                    });
                                    
                                }
                            })

                            
                        }
                    }
                }
        }
        //newly added
        $scope.viewLog = function(log){
            $interval.cancel(stop);
            $scope.count_flag = false;
            $scope.update_id = log.log_id;
            $scope.empwork.hr_issue = log.hr_issue;
            $scope.empwork.hr_action = log.hr_action;
            $scope.empwork.hr_issue_con = log.hr_issue_note;
            $scope.empwork.hr_action_con = log.hr_action_note;
            $scope.empwork.flag = log.flag_id > 0 ? $scope.flag_list[log.flag_id - 1].id : '';
            $scope.add_or_edit = 0;
            $scope.en.tagged_employee = log.tagged_employee_name;
           // angular.element(document.querySelector('#file_name')).val("");
           angular.element(document.querySelector('#file_name')).val(log.downloadable_file.split("/")[log.downloadable_file.split("/").length - 1]);
            $scope.empwork.hour = log.hour;
            $scope.empwork.min = log.min;
            $scope.empwork.timer = log.timer;
            $scope.empwork.mark_c = log.mark_c;
            $scope.employee_notes_data.tagged_employee_id = log.tagged_employee_id;
            $scope.employee_notes_data.tagged_employee_name = log.tagged_employee_name;
            $scope.fileLength = fileService.length;
            $scope.noteFormEnabled = false;
            $scope.hr_issue_cha = log.hr_issue_note.length;
            $scope.hr_action_cha = log.hr_action_note.length;
            $scope.downloadable_file = log.downloadable_file;
        }
        //newly added
        $scope.viewLicense = function(log){
            
            $scope.lq_update_id = log.log_id;
            $scope.empwork.license_name = log.license_name;
            $scope.empwork.license_type = log.license_type;
            $scope.empwork.license_number = log.license_number;
            $scope.empwork.license_issuer = log.license_issuer;
            $scope.lq_add_or_edit = 0;
            // angular.element(document.querySelector('#file_name1')).val("");
            angular.element(document.querySelector('#file_name1')).val(log.downloadable_file.split("/")[log.downloadable_file.split("/").length - 1]);
            $scope.empwork.rto = log.rto;
            $scope.empwork.cost = log.cost;
            $scope.empwork.date_from = setDate(log.date_from);
            $scope.empwork.date_expire = setDate(log.date_expire);
            $scope.emp.state = log.state;
            $scope.fileLength2 = fileService2.length;
            $scope.LQFormEnabled = false;
            $scope.lq_downloadable_file = log.downloadable_file;
        }
        //newly added
        $scope.editLog = function(log){
            timestamp = 0;
            $scope.update_id = log.log_id;
            $scope.empwork.hr_issue = log.hr_issue;
            $scope.empwork.hr_action = log.hr_action;
            $scope.empwork.hr_issue_con = log.hr_issue_note;
            $scope.empwork.hr_action_con = log.hr_action_note;
            $scope.empwork.flag = log.flag_id > 0 ? $scope.flag_list[log.flag_id - 1].id : '';
            $scope.add_or_edit = 0;
            $scope.en.tagged_employee = log.tagged_employee_name;
            // angular.element(document.querySelector('#file_name')).val("");
            angular.element(document.querySelector('#file_name')).val(log.downloadable_file.split("/")[log.downloadable_file.split("/").length - 1]);
            $scope.empwork.hour = log.hour;
            $scope.empwork.min = log.min;
            // $scope.empwork.timer = log.timer;
            $scope.empwork.mark_c = log.mark_c;
            $scope.employee_notes_data.tagged_employee_id = log.tagged_employee_id;
            $scope.employee_notes_data.tagged_employee_name = log.tagged_employee_name;
            $scope.fileLength = fileService.length;
            $scope.noteFormEnabled = 1;
            $scope.startCount();
            $scope.hr_issue_cha = log.hr_issue_note.length;
            $scope.hr_action_cha = log.hr_action_note.length;
            $scope.downloadable_file = log.downloadable_file;
        }
        //newly added
        $scope.editLicense = function(log){
            $scope.lq_update_id = log.log_id;
            $scope.empwork.license_name = log.license_name;
            $scope.empwork.license_type = log.license_type;
            $scope.empwork.license_number = log.license_number;
            $scope.empwork.license_issuer = log.license_issuer;
            $scope.lq_add_or_edit = 0;
            angular.element(document.querySelector('#file_name1')).val(log.downloadable_file.split("/")[log.downloadable_file.split("/").length - 1]);
            $scope.empwork.rto = log.rto;
            $scope.empwork.cost = log.cost;
            $scope.empwork.date_from = setDate(log.date_from);
            $scope.empwork.date_expire = setDate(log.date_expire);
            $scope.emp.state = log.state;
            $scope.fileLength2 = fileService2.length;
            $scope.LQFormEnabled = 1;
            $scope.lq_downloadable_file = log.downloadable_file;
        }
        //newly added
        $scope.removeLog = function(log){
            hrmAPIservice.removeLog(log.log_id).then(function(response){
                if(response.data.success == 200){
                    hrmAPIservice
                    .getLogHistory(userData, $scope.selectedEmpDetail.id)
                    .then(function(response){
                        
                        $scope.all_logs = response.data.logs.map(function(log){
                            return{
                                log_id: log.id,
                                subscriber: log.entered_employee_name,
                                hr_issue: log.hr_issue,
                                hr_action: log.hr_action,
                                hr_issue_note: log.hr_issue_note,
                                hr_action_note: log.hr_action_note,
                                mark_c: log.mark_c,
                                updated_time: $scope.formatDate(log.updated_time),
                                downloadable_file: log.upload_file_path,
                                flag_id: log.flag_id,
                                tagged_employee_name: log.tagged_employee_name,
                                tagged_employee_id: log.tagged_employee_id,
                                account_id: log.account_id,
                                hour: log.hour,
                                min: log.min,
                                timer: log.timer
                            }
                        });
                        //alert("Sucessfully removed!");
                    });
                }
                else{
                    //alert("Failed!");
                }
                
            });
        }
        //newly added
        $scope.removeLicense = function(log){
            hrmAPIservice.removeLQ(log.log_id).then(function(response){
                if(response.data.success == 200){
                    hrmAPIservice
                    .getLQ(userData, $scope.selectedEmpDetail.id)
                    .then(function(response){
                        
                        $scope.all_LQs = response.data.logs.map(function(log){
                            return{
                                log_id: log.id,
                                subscriber: log.entered_employee_name,
                                license_name: log.license_name,
                                license_type: log.license_type,
                                license_number: log.license_number,
                                license_issuer: log.license_issuer,
                                rto: log.rto,
                                downloadable_file: log.upload_file_path,
                                account_id: log.account_id,
                                date_from: log.date_from,
                                date_expire: log.date_expire,
                                cost: log.cost,
                                state: log.state
                            }
                        });
                        //alert("Sucessfully removed!");
                    });
                }
                else{
                    //alert("Failed!");
                }
                
            });
        }
        //newly added
        $scope.removeConf = function(log){
            hrmAPIservice.removeConf(log.log_id).then(function(response){
                console.log(response.data);
                if(response.data.success == 200){
                    hrmAPIservice
                    .getLogHistory(userData, $scope.selectedEmpDetail.id)
                    .then(function(response){
                        
                        $scope.all_logs = response.data.logs.map(function(log){
                            return{
                                log_id: log.id,
                                subscriber: log.entered_employee_name,
                                hr_issue: log.hr_issue,
                                hr_action: log.hr_action,
                                hr_issue_note: log.hr_issue_note,
                                hr_action_note: log.hr_action_note,
                                mark_c: log.mark_c,
                                updated_time: $scope.formatDate(log.updated_time),
                                downloadable_file: log.upload_file_path,
                                flag_id: log.flag_id,
                                tagged_employee_name: log.tagged_employee_name,
                                tagged_employee_id: log.tagged_employee_id,
                                account_id: log.account_id,
                                hour: log.hour,
                                min: log.min,
                                timer: log.timer,
                                // status: log.hr_issue_note.length > 60 ? false : true,
                                // hr_issue_note_short: log.hr_issue_note.length > 60 ? log.hr_issue_note.slice(0, 60) : '',
                                // hr_action_note_short: log.hr_action_note.length > 60 ? log.hr_action_note.slice(0, 60) : ''

                            }
                        });
                        //alert("Sucessfully removed!");
                    });
                }
                else{
                    //alert("Failed!");
                }
                
            });
        }

        //event of click view 
        $scope.viewNote = function(log){
            $scope.tb = {
                mdSelected: 2
            };
            $scope.noteFormEnabled = 1;
            $scope.update_id = log.id;
            $scope.empwork.hr_issue = log.hr_issue;
            $scope.empwork.hr_action = log.hr_action;
            $scope.empwork.hr_issue_con = log.hr_issue_note;
            $scope.empwork.hr_action_con = log.hr_action_note;
            $scope.empwork.flag = log.flag_id > 0 ? $scope.flag_list[log.flag_id - 1].id : '';
            $scope.add_or_edit = 0;
            $scope.en.tagged_employee = log.tagged_employee_name;
            angular.element(document.querySelector('#file_name')).val(log.upload_file_path.split("/")[log.upload_file_path.split("/").length - 1]);
            $scope.empwork.hour = log.hour;
            $scope.empwork.min = log.min;
            $scope.empwork.timer = log.timer;
            $scope.empwork.mark_c = log.mark_c;
            $scope.employee_notes_data.tagged_employee_id = log.tagged_employee_id;
            $scope.employee_notes_data.tagged_employee_name = log.tagged_employee_name;
            $scope.fileLength = fileService.length;
            $scope.is_notes_page = true;
            $scope.is_lq_page = false;
            $scope.LQFormEnabled = false;
            timestamp = 0;
            $scope.startCount();
        }

        $scope.removeFlag = function(flags){
            if(!confirm("You are about to remove this employee flag, select OK if you wish to proceed or cancel")){
                return
            }
            console.log(flags.id);
            hrmAPIservice.updateFlag(flags.id).then(function(response){
                hrmAPIservice
                .get($scope.selectedEmpDetail.id, 'employee')
                .then(function (response) {
                    $scope.emp = response.data.emp;
                    $scope.emp.dob = setDate($scope.emp.dob);
                    $scope.emp.visaexpiry = setDate($scope.emp.visaexpiry);
                    
                    $scope.flags = response.data.flags;
                    if(!$scope.flags){
                        $scope.is_flag = false;
                    }
                    else{
                        $scope.is_flag = true;
                    }

                    $scope.empwork = response.data.empwork;
                    $scope.empwork.start_date = setDate($scope.empwork.start_date);
                    if($scope.empwork.end_date === null){
                        $scope.empwork.end_date = null;    
                    }else {
                        $scope.empwork.end_date = setDate($scope.empwork.end_date);
                    }
                    
                    $scope.site_location = {
                        value: response.data.empwork.site_location,
                        display: response.data.empwork.site_location_name
                    };
                    
                    $scope.formEnabled = 1;
                    $scope.emp.update_by = userData.id;
                     
                    
                });
                //alert("Successfully removed!");
            });
        }
        
        $scope.saveEmployee = function () {
            
            console.log($scope.emp);
            console.log($scope.empwork);
            console.log($scope.site_location);
            $scope.empwork.site_location = $scope.site_location.value;

            var cloned_emp = Object.assign({}, $scope.emp);
            var cloned_empwork = Object.assign({}, $scope.empwork);

            cloned_emp.dob = $scope.localTimeToUtc(cloned_emp.dob);
            cloned_emp.visaexpiry = $scope.localTimeToUtc(cloned_emp.visaexpiry);

            cloned_empwork.start_date = $scope.localTimeToUtc(cloned_empwork.start_date);
            cloned_empwork.end_date = $scope.localTimeToUtc(cloned_empwork.end_date);

            delete cloned_empwork.workdate_added;

            console.log(cloned_emp);
            console.log(cloned_empwork);

            hrmAPIservice
                .saveEmployee(cloned_emp, cloned_empwork, userData)
                .then(function (response) {
                    console.log(response);
                    $scope.gridOptionsComplex.data = response.data.employees;

                    $scope.success = 1;
                    $scope.showMessage = 1;
                    $scope.userMessage = "Employee details have been saved successfully!";

                    $scope.emp = {};
                    $scope.empwork = {};
                    $scope.formEnabled = 0;
                    $scope.site_location = '';
                });
        }

        $scope.localTimeToUtc = function (localTime) {
            if(!localTime){
                return null;
            }
            var now_utc = Date.UTC(localTime.getFullYear(), localTime.getMonth(), localTime.getDate(), 0, 0, 0);
            return new Date(now_utc);
        }
        // hrmAPIservice.get(1, 'employee').then(function(response) { $scope.formEnabled
        // = 1;  $scope.emp = response.data.employee; });

    }
]);
