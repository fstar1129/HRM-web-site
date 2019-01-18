app.controller('injuryregisterController', ['$scope', '$rootScope', 'cookie','uiGridConstants', 'hrmAPIservice', function ($scope, $rootScope, cookie, uiGridConstants, hrmAPIservice) {
    var userData = cookie.checkLoggedIn();
    cookie.getPermissions();

    $scope.pageTitle = "";
    $scope.formEnabled = 0;
    $scope.master = {};
    $scope.ir = {};

    $scope.hhList = [];
    $scope.mmList = [];
    $scope.severity_list = [
        {id: 0, display_text: "!!!!Kill or cause permanent disablility or ill health"},
        {id: 1, display_text: "!!!Long term illness or serious injury"},
        {id: 2, display_text: "!!Medical attention and several days off work"},
        {id: 3, display_text: "!First aid needed"}
    ];
    $scope.liklihood_list = [
        {id: 0, display_text: "++Very likely Could happen any time"},
        {id: 1, display_text: "+Likely Could happen any time"},
        {id: 2, display_text: "-Unlikely Could happen, but very rarely"},
        {id: 3, display_text: "--Very unlikely Could happen, but probably never will"}
    ];
    var item = {};
    for(var i=0; i<=23; i++) {
        var ival = (i < 10) ? '0'+i : i + '';
        $scope.hhList.push(ival);
    }
    
    for(var i=0; i<=59; i++) {
        var ival = (i < 10) ? '0'+i : i + '';
        $scope.mmList.push(ival);
    }    
    
    $scope.doSelectedEmployee = function() { 
        //alert($scope.ir.employee_id);
        //$scope.alloc_course.employee_id = $scope.cs.course_supervisor.value;
    }    
    
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
    
    $scope.locationSearch = function (query) {
        var list = [];
        if(query != null && query.length > 0) {
            for(var i=0; i<$scope.siteList.length; i++) {
                if ($scope.siteList[i].display_text.toLowerCase().indexOf(query.toLowerCase()) > -1) {
                    list.push({id: $scope.siteList[i].id, name: $scope.siteList[i].display_text});
                }
            }                    
        }
        return list;
    }    
    
  
  
    $scope.doChangeEmployee = function(typedthings) {
        $scope.employee_list = [];
        for (var i=0; i<$scope.employeeList.length; i++) {
            if (typedthings == '' || $scope.employeeList[i].firstname.indexOf(typedthings) > -1 || $scope.employeeList[i].lastname.indexOf(typedthings) > -1) {
                $scope.employee_list.push($scope.employeeList[i].firstname + " " + $scope.employeeList[i].lastname);
            }
        }
    }

    $scope.doSelectedEmployee = function(suggestion) {
        for(let i=0; i<$scope.employeeList.length; i++) {
            var emp = $scope.employeeList[i].firstname + " " + $scope.employeeList[i].lastname;
            if(emp == suggestion) {
                $scope.ir.employee_id = $scope.employeeList[i].id;
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
          { name: 'injuredName', width: '25%',enableCellEdit: false },
          { name: 'dateOfIncident', width: '15%', cellClass: 'center',enableCellEdit: false },
          { name: 'siteLocation', width: '25%', enableFiltering: true, cellClass: 'center',enableCellEdit: false},
          { name: 'natureOfInjury', width: '25%', enableFiltering: true, cellClass: 'center',enableCellEdit: false},
          { name: 'action', enableFiltering: false, width: '10%',  cellClass: 'center', enableCellEdit: false,
              cellTemplate: '<div class="ui-grid-cell-contents grid-center-cell"><span ng-click="grid.appScope.editInjury(row.entity)"><span class="glyphicon glyphicon-edit text-edit"></span></span>&nbsp;&nbsp;&nbsp;<span ng-click="grid.appScope.deleteInjury(row.entity)"><span class="glyphicon glyphicon-trash text-danger"></span></span></div>'
          }
        ]
    };
    
    $scope.deleteIR = function(irDetail) {
        var answer = confirm("Delete " + arDetail.name + '? Are you sure?');
        if (answer) {
            hrmAPIservice.delete(irDetail, userData, 'ir').then(function(response) {
                $scope.gridOptionsComplex.data = response.data;
            });
        }
    }
    
    $scope.editInjury = function(obj) {
        hrmAPIservice.getInjury(obj.id).then(function(response) {
            $scope.formEnabled = 1;
            $scope.ir = response.data;
            var itime = response.data.incident_time.split(':');           
            $scope.injury_hh = itime[0];
            $scope.injury_mm = itime[1];
            
            for(var i=0; i<$scope.employeeList.length; i++) {
                if($scope.employeeList[i].id == response.data.employee_id) {
                    $scope.employee = {id: $scope.employeeList[i].id, name: $scope.employeeList[i].firstname + " " + $scope.employeeList[i].lastname};
                    break;
                }
            }
            
            for(var i=0; i<$scope.siteList.length; i++) {
                if($scope.siteList[i].id == response.data.site_location_id) {
                    $scope.site_location = {id: $scope.siteList[i].id, name: $scope.siteList[i].display_text};
                    break;
                }
            }            

            setDate('incident_date');
            if (response.data.insurernotified_date && angular.isDefined(response.data.insurernotified_date)) {
                setDate('insurernotified_date');
            }
            if (response.data.safeworknotified_date && angular.isDefined(response.data.safeworknotified_date)) {
                setDate('safeworknotified_date');
            }  
            
        });       
    }


    $scope.newInjury = function() {
        $scope.ir = {};
        $scope.showMessage = 0;
        $scope.clearForm();
        $scope.ir.incident_date = new Date();
        $scope.ir.insurernotified_date = new Date();
        $scope.ir.safeworknotified_date = new Date();
        $scope.formEnabled = 1;
    }

    $scope.clearForm = function() {
        $scope.ir = angular.copy($scope.master);
        
        $scope.employee = null;
        $scope.site_location = null;
        $scope.employee_id = '';
        $scope.ir.employee_id = '';
        $scope.ir.natureofinjury_id = '';
        $scope.ir.mechanismofinjury_id = '';
        $scope.ir.location_id = '';
        $scope.ir.injuredbodypart_id = '';
        $scope.ir.insurer_notified = '0';
        $scope.ir.safework_notified = '0';
        $scope.injury_hh = '00';
        $scope.injury_mm = '00';
        
        $scope.ir.id = 0;
        $scope.ir.account_id = userData.account_id;
        $scope.ir.created_by = userData.id;
        $scope.ir.updated_by = 0;    
        $scope.formEnabled = 0;
    }

    const setDate = function(fld) {
        var date = $scope.ir[fld];
        if (date == null || !date) {
            return;
        }
        if ($scope.ir[fld]) {
            if (date == '0000-00-00') {
                $scope.ir[fld] = new Date(); 
                return;
            }
            var d = new Date(date);
            $scope.ir[fld] = d;
        }
    }

    hrmAPIservice.getIRData(userData).then(function(response) {                  
        $scope.gridOptionsComplex.data = response.data.injuries;
        $scope.employeeList = response.data.employees;
        $scope.locationList = response.data.locations;     
        $scope.siteList = response.data.sites; 
        $scope.natureList = response.data.nature;
        $scope.bodypartList = response.data.bodypart;
        $scope.mechanismList = response.data.mechanism;
        $scope.riskconsequencesList = response.data.rq;
        $scope.risklikelihoodList = response.data.rl;
        $scope.reminderfrequencyList = response.data.rf;
        $scope.remedialpriorityList = response.data.rp;
        
    });
    
    $scope.saveIR = function() {
        $scope.showMessage = 0;
        $scope.ir.employee_id = $scope.employee.id;
        $scope.ir.site_location_id = $scope.site_location.id;
        
        $scope.ir.incident_time = $scope.injury_hh + ":" + $scope.injury_mm;
        hrmAPIservice.saveIR($scope.ir, userData).then(function(response) {
            $scope.gridOptionsComplex.data = response.data.injuries;
            
            $scope.success = 1;
            $scope.showMessage = 1;
            $scope.userMessage = "Injury details have been saved successfully!"; 
            $scope.clearForm();
        });
    }
    $scope.calcFreq = function(){
        if(!($scope.ir.severity_id == '' || $scope.ir.likelihood_id == '')){
            switch($scope.ir.severity_id / 1 + $scope.ir.likelihood_id / 1){
                case 0: $scope.ir.email_frequency = "Email every 1 day"; break;
                case 1: $scope.ir.email_frequency = "Email every 1 day"; break;
                case 2: $scope.ir.email_frequency = "Email every 3 days"; break;
                case 3: $scope.ir.email_frequency = "Email every 7 days"; break;
                case 4: $scope.ir.email_frequency = "Email every 14 days"; break;
                case 5: $scope.ir.email_frequency = "Email every 21 days"; break;
                case 6: $scope.ir.email_frequency = "Email every 28 days"; break; 
                default: $scope.ir.email_frequency = "No email";
            }
        }else{
            $scope.ir.email_frequency = "No email";
        }
    }


}]);
