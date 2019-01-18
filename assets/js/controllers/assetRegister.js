app.controller('assetregisterController', ['$scope', '$rootScope', 'cookie','uiGridConstants', 'hrmAPIservice', function ($scope, $rootScope, cookie, uiGridConstants, hrmAPIservice) {
    var userData = cookie.checkLoggedIn();
    cookie.getPermissions();

    $scope.pageTitle = "Asset Register";
    $scope.formEnabled = 0;
    $scope.hs = {};
    $scope.ar = {};
    
    $scope.doChangeSiteLocation = function(typedthings) {
        if(typedthings != null && typedthings.length > 0) {
            hrmAPIservice.searchData(typedthings, 'sitelocation').then(function(response) {
                var sites = response.data.data;
                $scope.site_list = sites;

                var names = [];
                for(var i = 0; i < $scope.site_list.length; i++) {
                    names[i] = sites[i].display_text;
                }

                $scope.site_location_list = names;
            });
        }
    }

    $scope.doSelectedSiteLocation = function(suggestion) {
        for(var i = 0; i < $scope.site_list.length; i++) {
            if($scope.site_list[i].display_text == suggestion) {  
                $scope.hs.site_location_id = $scope.site_list[i].id;
                break;
            }
        }
    }    
    
    $scope.doChangeSite = function(typedthings) {
        if ($scope.isLoading == 1) {
            $scope.isLoading = 0;
            return;
        }
        if(typedthings != null && typedthings.length > 0) {
            var sites = $scope.siteList;
            $scope.site_list = $scope.siteList;

            var names = [];
            var site;
            for(var i = 0; i < $scope.site_list.length; i++) {
                site = sites[i].display_text;
                if (site.indexOf(typedthings) >= 0) {
                    names[i] = site;
                }
            }
            $scope.site_list = names;
        }
    }

    $scope.doSelectedSite = function(suggestion) {
        for(let i=0; i<$scope.siteList.length; i++) {
            var site = $scope.siteList[i];
            if(site.display_text == suggestion) {
                $scope.ar.site_location_id = site.id;
                break;
            }
        }
    }    
    
    $scope.selectSupervisor = function() { 
        if (typeof $scope.who_inspected.value === 'undefined') {
            return;
        }
        $scope.ar.who_inspected_id = $scope.who_inspected.value;
        $scope.ar.who_inspected_table = $scope.who_inspected.table;
    }      
    
    $scope.querySearch = function(query) {
        if(query != null && query.length > 0) {
            return $scope.allusers.filter(function(user) {
               return user.display.toLowerCase().indexOf(query.toLowerCase()) > -1;
            });                        
        }
    }     
    
    $scope.gridOptionsComplex = {
        enableFiltering: true,
        showGridFooter: false,
        showColumnFooter: false,
        onRegisterApi: function onRegisterApi(registeredApi) {
            gridApi = registeredApi;
        },
        columnDefs: [
          { name: 'id', visible: false },
          { name: 'name', width: '20%', enableCellEdit: false },
          { name: 'manufacturer', width: '20%', enableFiltering: true, cellClass: 'center', enableCellEdit: false },
          { name: 'serial', width: '20%', enableFiltering: true, cellClass: 'center', enableCellEdit: false },
          { name: 'site_location', width: '15%', enableFiltering: true, cellClass: 'center', displayName: 'Site Location', headerCellClass: 'center', enableCellEdit: false },
          { name: 'department', width: '15%', enableFiltering: false, cellClass: 'center', headerCellClass: 'center', enableCellEdit: false },
          { name: 'action', enableFiltering: false, width: '10%',  cellClass: 'center', enableSorting: false,headerCellClass: 'center', enableCellEdit: false,
              cellTemplate: '<div class="ui-grid-cell-contents"><i class="fa fa-edit fa-2x" ng-click="grid.appScope.editAR(row.entity)"></i>&nbsp;&nbsp;<i class="fa fa-trash-o fa-2x text-danger" ng-click="grid.appScope.deleteAR(row.entity)"></i></div>'
          }
        ]
    };
    
    $scope.gridOptionsComplexHistory = {
        enableFiltering: true,
        showGridFooter: false,
        showColumnFooter: false,
        onRegisterApi: function onRegisterApi(registeredApi) {
            gridApi = registeredApi;
        },
        columnDefs: [
          { name: 'id', visible: false },
          { name: 'User', width: '12%', enableCellEdit: false },
          { name: 'Type', width: '12%', enableCellEdit: false },
          { name: 'Date', width: '12%', enableFiltering: true, cellClass: 'center', enableCellEdit: false},
          { name: 'whoInspected', width: '12%', enableFiltering: true, cellClass: 'center', enableCellEdit: false },
          { name: 'location', width: '12%', enableFiltering: true, cellClass: 'center', displayName: 'Location', headerCellClass: 'center', enableCellEdit: false },
          { name: 'comments', width: '30%', enableFiltering: false, cellClass: 'center', headerCellClass: 'center', enableCellEdit: false },
          { name: 'dateEntered', enableFiltering: false, width: '10%',  cellClass: 'center', enableSorting: true          }
        ]
    };    

    $scope.deleteAR = function(arDetail) {
        var answer = confirm("Delete " + arDetail.name + '? Are you sure?');
        if (answer) {
            hrmAPIservice.delete(arDetail, userData, 'ar').then(function(response) {
                $scope.gridOptionsComplex.data = response.data;
            });
        }
    }


    $scope.newAR = function() {
        $scope.ar = {};
        $scope.showMessage = 0;
        $scope.assetregisterform.$setPristine();        
        angular.forEach($scope.ar, function(value, key) {
            $scope.ar[key] = ''; 
        })        
        
        $scope.ar.id = 0;
        $scope.ar.account_id = userData.account_id;
        $scope.ar.created_by = userData.id;
        $scope.ar.updated_by = 0;
        $scope.ar.purchase_date = new Date();        
        $scope.formEnabled = 1;
        $scope.gridOptionsComplexHistory.data = {};
    }

    $scope.clearForm = function() {
        $scope.ar = {};
        $scope.formEnabled = 0;
    }
    
    $scope.clearFields = function(section) {
        delete $scope.ar['service_schedule_date'];        
        delete $scope.ar['inspected_date'];
        delete $scope.ar['test_result_id'];
        delete $scope.ar['next_test_date'];
        delete $scope.ar['test_frequency_id'];
        delete $scope.ar['service_provider'];
        delete $scope.ar['service_date'];
        delete $scope.ar['service_phone_number'];
        delete $scope.ar['service_address'];
        $('[name="who_inspected"]').val('');
    }

    const setDate = function(fld) {
        var date = $scope.ar[fld];
        if (date == null || !date) {
            return;
        }
        if ($scope.ar[fld]) {
            var d = new Date(date);
            $scope.ar[fld] = d;
        }
    }

    $scope.editAR = function(arDetail) {
        $scope.showMessage = 0;
        $scope.isLoading = 1;
        hrmAPIservice.get(arDetail.id, 'ar').then(function(response) {
            $scope.formEnabled = 1;
            $scope.ar = response.data[0];
            $scope.site_location_id = $scope.ar.site_location;
            
            setDate('purchase_date');
            setDate('service_schedule_date');
            setDate('inspected_date');
            setDate('next_test_date');
            setDate('service_date');
            
            $scope.ar.updated_by = userData.id;
/*
            var dat = response.data.records.map(function(item) {
                
                var d = new Date(item.date_created);
                var mth = d.getMonth + 1;
                
                var inspectedDate = '';
                if (item.inspected_date) {
                    var d1 = new Date(item.inspected_date);
                    var m = d1.getMonth + 1;   
                    inspectedDate = d1.getDate() + '/' + m + '/' + d1.getFullYear();
                }
                
                var type = '';
                switch (item.action) {
                    case 1: type = 'Test/Tag'; break;
                    case 2: type = 'Service/Repair'; break;
                    case 3: type = 'Schedule Service'; break;
                }
                
                return {
                    id: item.id, 
                    User: item.createdBy, 
                    Type: type,
                    Date: inspectedDate, 
                    whoInspected: item.WhoInspected, 
                    Location: item.site_location,
                    comments : item.additional_comments,
                    dateEntered: d.getDate() + '/' + mth + '/' + d.getFullYear()
                }
            });    
            
            $scope.gridOptionsComplexHistory.data = dat;
  */          
        });
    };

    hrmAPIservice.getARData(userData).then(function(response) {                  
        $scope.gridOptionsComplex.data = response.data.records;
        $scope.siteList = response.data.sites;
        $scope.testresultList = response.data.testresults;
        $scope.departmentList = response.data.departments;
        $scope.testfrequencyList = response.data.testfrequency;
        
        
         $scope.gridOptionsComplexHistory.data = {};
        
        
        $scope.allusers = response.data.users;
    });
    
    $scope.saveAR = function() {
        hrmAPIservice.saveAR($scope.ar, userData).then(function(response) {
            $scope.gridOptionsComplex.data = response.data;
            $scope.gridOptionsComplexHistory.data = {};
            
            $scope.success = 1;
            $scope.showMessage = 1;
            $scope.userMessage = "Asset details have been saved successfully!"; 
            
            $scope.ar = {};
            $scope.site_location_id = '';
            $scope.formEnabled = 0;
        });
    }
    
 

}]);
