app.controller('remindersController', [
    '$scope',
    '$rootScope',
    'cookie',
    'uiGridConstants',
    'hrmAPIservice',
    function ($scope, $rootScope, cookie, uiGridConstants, hrmAPIservice) {
        
        var userData = cookie.checkLoggedIn();
        cookie.getPermissions();
        $scope.email_update_id = 0;
        $scope.pageTitle = "EMAIL REMINDER SETTINGS";
        $scope.formEnabled = 0;
        $scope.employees = {};
        $scope.emp = {};
        $scope.reminder = {};
        $scope.empwork = {};
        $scope.en = {};
        $scope.ew = {};
        $scope.emp_name1 = null;
        $scope.en.searchText = null;
        $scope.all_employees = [];
        $scope.add_or_edit = 1;    
        $scope.grid_data = [];    
        $scope.reminders = [];
        $scope.reminder1 = [];
        // $scope.frequency = ["1 day prior", "3 days prior", "7 days prior", "14 days prior", "28 days prior", "on date due", "every day after due date", "every 3 days after due date"];
        $scope.email_status = 0;
        $scope.days_prior_list = ["1 day before due date", "3 days before due date", "7 days before due date", "14 days before due date",
                                    "28 day before due date", "Day of due date", "Each day after due date", "Each 3 day after due date"];
        $scope.gridOptionsComplex = {
            enableFiltering: true,
            showGridFooter: false,
            showColumnFooter: false,
            onRegisterApi: function onRegisterApi(registeredApi) {
                gridApi = registeredApi;
            },
            columnDefs: [
                {
                    name: 'id',
                    visible: false
                },
                {
                    name: 'name',
                    displayName: 'E-mail Recipient',
                    width: '20%'
                }, {
                    name: 'email',
                    width: '15%',
                    cellClass: 'center'
                }, {
                    name: 'active_since',
                    displayName: 'Active since',
                    width: '10%',
                    enableFiltering: true,
                    cellClass: function(grid, row, col, rowRenderIndex, colRenderIndex) {
                        if (grid.getCellValue(row ,col).toLowerCase() === 'expired') {
                          return 'red';
                        }else return 'center';
                      }
                }, {
                    name: 'alerts_count',
                    displayName: 'Email Alerts',
                    width: '10%',
                    cellClass: 'center'
                }, {
                    name: 'email_name',
                    displayName: 'Email Name or Type',
                    width: '35%',
                    cellClass: 'center'
                }, {
                    name: 'action',
                    enableFiltering: false,
                    width: '10%',
                    cellClass: 'center',
                    cellTemplate: '<div class="ui-grid-cell-contents"><i class="fa fa-edit fa-2x" ng-click="grid.ap' +
                            'pScope.editReminder(row.entity)"></i><i class="fa fa-trash-o fa-2x text-danger" ' +
                            'ng-click="grid.appScope.deleteReminder(row.entity)"></i></div>'
                }
            ]
        };

        $scope.deleteReminder = function (reminder) {
            var answer = confirm("Delete " + reminder.email_name + ' for ' + reminder.name +'? Are you sure?');
            if (answer) {
                hrmAPIservice
                    .deleteReminder(reminder)
                    .then(function (response) {
                        console.log(response.data);
                        $scope.gridOptionsComplex.data = response.data.reminders.map(function(reminder){
                            return{
                                id: reminder.id,
                                name: reminder.employee_name,
                                email: reminder.reminder_email,
                                active_since: (reminder.active == 1 && reminder.alert_status == 1 && reminder.alert_expiry_status == 0) ? reminder.due_date : "Expired",
                                alerts_count: reminder.alerts_count,
                                email_name: reminder.email_name + " Reminder Email"
                            }
                        });
                    });
            }
        }
        $scope.removeReminder = function (reminder) {
            
                $scope.reminder1 = [];
                $scope.reminder.email_con = "";
                hrmAPIservice
                    .deleteReminder(reminder)
                    .then(function (response) {
                        console.log(response.data);
                        $scope.gridOptionsComplex.data = response.data.reminders.map(function(reminder){
                            return{
                                id: reminder.id,
                                name: reminder.employee_name,
                                email: reminder.reminder_email,
                                active_since: (reminder.active == 1 && reminder.alert_status == 1 && reminder.alert_expiry_status == 0) ? reminder.due_date : "Expired",
                                alerts_count: reminder.alerts_count,
                                email_name: reminder.email_name + " Reminder Email"
                            }
                        });
                        $scope.reminders = response.data.reminders;
                    });
            
        }
        $scope.viewEmail = function (email_con) {
            $scope.email_status = 0;
            $scope.reminder.email_con = email_con.split("<p></p>").join("\n");
            
            
        
        }
        $scope.editEmail = function (reminder) {
            $scope.email_status = 1;
            $scope.reminder.email_con = reminder.email_con.split("<p></p>").join("\n");
            $scope.email_update_id = reminder.id;
            
        
        }
        $scope.selectEmployee = function () {
            
            $scope.reminder.employee_id = $scope.en.emp_name1.value;
            hrmAPIservice
            .getPosition($scope.reminder.employee_id)
            .then(function(response){
                console.log(response.data);
                $scope.job_title = response.data.display_text;
            });
            // console.log('selectSite', $scope.reminder.employee_id);
            // $scope.reminder.reminder_email = $scope.gridOptionsComplex.data.filter((employee) => 
            //     {return employee.name == $scope.en.emp_name1.display;})[0].email;
            
        }

        $scope.en.querySearch = function (query) {
            if (query != null && query.length > 0) {
                return $scope
                    .all_employees
                    .filter(function(employee) {
                        return employee
                            .display
                            .toLowerCase()
                            .indexOf(query.toLowerCase()) > -1;
                    });
            }
        }

        $scope.selectEmailName = function () {
            
            $scope.reminder.email_name = $scope.ew.email_name.display;
            
            //console.log('selectSite', $scope.reminder.emp_name);
        }

        $scope.ew.queryEmailNameSearch = function (query) {
            if (query != null && query.length > 0) {
                return $scope
                    .all_email_names
                    .filter(function(email_name) {
                        return email_name
                            .display
                            .toLowerCase()
                            .indexOf(query.toLowerCase()) > -1;
                    });
            }
        }
        hrmAPIservice
        .getEmailNames()
        .then(function(response){
            //console.log(response.data);
            $scope.all_email_names = response.data.map(function(email_name){
                return {
                    value: email_name.id,
                    display: email_name.email_name
                }
            });
            //console.log($scope.all_email_names);
        });
        $scope.newReminder = function () {
            
            $scope.showMessage = 0;
            $scope.reminder = {};
            $scope.reminder.alert_from = new Date();
            $scope.reminder.alert_expiry = new Date($scope.reminder.alert_from.getFullYear() + 2, $scope.reminder.alert_from.getMonth(), $scope.reminder.alert_from.getDay());
            $scope.add_or_edit = 0;
            $scope.email_status = 0;
            $scope.job_title = "";
            $scope.ew.emailNameSearchText = '';
            $scope
                .remform
                .$setPristine();
            // $scope.emp = {};
            // $scope.empwork = {};
            
            // $scope.emp.account_id = userData.account_id;
            // $scope.emp.added_by = userData.id;
            // $scope.emp.update_by = 0;
            $scope.formEnabled = 1;
            hrmAPIservice
            .getOnlyEmployeeList(userData)
            .then(function(response){
                console.log(response.data);
                $scope.all_employees = response.data.employees.map(function(usr){
                    return {
                        value: usr.id,
                        display: usr.firstname + " " + usr.lastname,
                        email: usr.email
                    }
                
                });
                //console.log($scope.all_employees);
                $scope.en.searchText = ''; // async
            });
            
        }
        $scope.addText = function(text){return text + " Reminder Email";}
        $scope.clearForm = function () {
            $scope.emp = {};
            $scope.empwork = {};
            $scope.site_location = '';
            $scope.formEnabled = 0;
        }

        var setDate = function (date) {
            if (typeof date === 'undefined' || date === null) {
                return new Date();
            }

            var a = date.split('-');
            var d = new Date(a[0], a[1] - 1, a[2]);

            return d;
        }

        $scope.editReminder = function (reminder) {
            $scope.add_or_edit = 1;
            $scope.showMessage = 0;
            $scope.email_status = 0;
            $scope.reminder.email_con = "";
            hrmAPIservice
                .getSpecificReminder(reminder.id)
                .then(function (response) {
                    console.log(response.data);
                    // $scope.emp = response.data.emp;
                    // $scope.emp.dob = setDate($scope.emp.dob);
                    // $scope.emp.visaexpiry = setDate($scope.emp.visaexpiry);

                    $scope.emp_name = response.data.reminder.employee_name;
                    
                    $scope.reminder.reminder_email = response.data.reminder.reminder_email;
                    $scope.ew.emailNameSearchText = response.data.reminder.email_name + " Reminder Email";
                    $scope.reminder.email_name = response.data.reminder.email_name;
                    $scope.reminder.id = reminder.id;
                    $scope.reminder.alert_from = setDate(response.data.reminder.alert_from);
                    $scope.reminder.alert_expiry= setDate(response.data.reminder.alert_expiry);
                    
                    $scope.reminder1[0] = response.data.reminder;
                    hrmAPIservice
                    .getPosition(response.data.reminder.employee_id)
                    .then(function(response){
                        //console.log(response.data);
                        $scope.job_title = response.data.display_text;
                    });
                    $scope.reminders = response.data.reminders;
                    // console.log(response.data.reminders);
                    // if($scope.empwork.end_date === null){
                    //     $scope.empwork.end_date = null;    
                    // }else {
                    //     $scope.empwork.end_date = setDate($scope.empwork.end_date);
                    // }
                    
                    // $scope.site_location = {
                    //     value: response.data.empwork.site_location,
                    //     display: response.data.empwork.site_location_name
                    // };

                    $scope.formEnabled = 1;
                    // $scope.emp.update_by = userData.id;
                });
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
        .getAllReminders(userData.account_id)
        .then(function (response) {
            console.log(response.data);
            $scope.gridOptionsComplex.data = response.data.reminders.map(function(reminder){
                return{
                    id: reminder.id,
                    name: reminder.employee_name,
                    email: reminder.reminder_email,
                    active_since: (reminder.active == 1 && reminder.alert_status == 1 && reminder.alert_expiry_status == 0) ? reminder.due_date : "Expired",
                    alerts_count: reminder.alerts_count,
                    email_name: reminder.email_name + " Reminder Email"
                }
                
            });
            
        });
        
        $scope.saveReminder = function () {
            // console.log($scope.emp);
            //console.log($scope.reminder);
            // console.log($scope.site_location);
            // $scope.empwork.site_location = $scope.site_location.value;

            // var cloned_emp = Object.assign({}, $scope.emp);
            if($scope.add_or_edit == 0){
                var cloned_reminder = Object.assign({}, $scope.reminder);

                cloned_reminder.alert_from = $scope.localTimeToUtc($scope.reminder.alert_from);
                cloned_reminder.alert_expiry = $scope.localTimeToUtc($scope.reminder.alert_expiry);
                cloned_reminder.account_id = userData.account_id;
                // console.log("+++++++++");
                // console.log(cloned_reminder);

                hrmAPIservice
                .saveReminder(cloned_reminder)
                .then(function (response) {
                    $scope.reminders = response.data.reminders;
                    hrmAPIservice
                    .getAllReminders(userData.account_id)
                    .then(function (response) {
                        console.log(response.data);
                        $scope.gridOptionsComplex.data = response.data.reminders.map(function(reminder){
                            return{
                                id: reminder.id,
                                name: reminder.employee_name,
                                email: reminder.reminder_email,
                                active_since: (reminder.active == 1 && reminder.alert_status == 1 && reminder.alert_expiry_status == 0) ? reminder.due_date : "Expired",
                                alerts_count: reminder.alerts_count,
                                email_name: reminder.email_name + " Reminder Email"
                            }
                            
                        });
                        
                    });
                    
                    
                    
                    $scope.success = 1;
                    $scope.showMessage = 1;
                    $scope.userMessage = "Employee details have been saved successfully!";

                    $scope.reminder = {};
                    $scope.job_title = "";
                    // $scope.empwork = {};
                    $scope.formEnabled = 0;
                    $scope.en.searchText = '';
                    $scope.ew.emailNameSearchText = '';
                });
            }else{
                //console.log($scope.reminder);
                var cloned_reminder = Object.assign({}, $scope.reminder);

                cloned_reminder.alert_from = $scope.localTimeToUtc($scope.reminder.alert_from);
                cloned_reminder.alert_expiry = $scope.localTimeToUtc($scope.reminder.alert_expiry);
            
                // console.log(cloned_emp);
                console.log(cloned_reminder);

                hrmAPIservice
                .updateReminder(cloned_reminder)
                .then(function (response) {
                    hrmAPIservice
                    .getAllReminders(userData.account_id)
                    .then(function (response) {
                        console.log(response.data);
                        $scope.gridOptionsComplex.data = response.data.reminders.map(function(reminder){
                            return{
                                id: reminder.id,
                                name: reminder.employee_name,
                                email: reminder.reminder_email,
                                active_since: (reminder.active == 1 && reminder.alert_status == 1 && reminder.alert_expiry_status == 0) ? reminder.due_date : "Expired",
                                alerts_count: reminder.alerts_count,
                                email_name: reminder.email_name + " Reminder Email"
                            }
                            
                        });
                        
                    });
                    
                    
                    
                    $scope.success = 1;
                    $scope.showMessage = 1;
                    $scope.userMessage = "Employee details have been saved successfully!";

                    $scope.reminder = {};
                    $scope.job_title = "";
                    // $scope.empwork = {};
                    $scope.formEnabled = 0;
                    $scope.emp_name = '';
                    $scope.ew.emailNameSearchText = '';
                });
            }
            
        }
        $scope.saveEmail = function(){
            if($scope.reminder.email_con == '' || $scope.reminder.days_prior == ''){
                alert("Please select frequency option.");
                return;
            }
            hrmAPIservice
            .emailUpdate($scope.email_update_id, $scope.reminder.email_con, $scope.reminder.days_prior)
            .then(function(response){
                $scope.success = 1;
                $scope.showMessage = 1;
                $scope.userMessage = "Email and Frequency have been saved successfully!";
                $scope.email_update_id = 0;
                $scope.reminder.email_con = '';
                $scope.reminder.days_prior = '';
                $scope.reminder1[0] = response.data.reminder;
                $scope.email_status = 0;
            });
        }
        $scope.localTimeToUtc = function (localTime) {
            if(!localTime){
                return null;
            }
            var now_utc = Date.UTC(localTime.getFullYear(), localTime.getMonth(), localTime.getDate(), 0, 0, 0);
            return new Date(now_utc);
        }
        $scope.formatDate1 = function(date){
            var d = date.split("-");
            return d[2] + "-" + d[1] + "-" + d[0];
        }
        $scope.stopAlert = function(reminder_id){
            hrmAPIservice
            .stopAlert(reminder_id)
            .then(function(response){
                console.log(response.data);
                $scope.reminders = response.data.reminders;
            });
        }
        $scope.startAlert = function(reminder_id){
            hrmAPIservice
            .startAlert(reminder_id)
            .then(function(response){
                console.log(response.data);
                $scope.reminders = response.data.reminders;
            });
        }
        $scope.displayDaysPrior = function(reminder){
            if(reminder.days_prior != 0){
                if(reminder.days_prior == 1){
                    return "1 day prior";
                }else{
                    return reminder.days_prior + " days prior";
                }
            }else{
                if(reminder.period == 0){
                    return "on date due"
                }else if(reminder.period == 1){
                    return "every day after due date"
                }else{
                    return "every 3 days after due date"
                }
            }
        }
        // hrmAPIservice.get(1, 'employee').then(function(response) { $scope.formEnabled
        // = 1;  $scope.emp = response.data.employee; });

    }
]);
