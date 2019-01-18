app.controller('hazardoussubstanceController', ['$scope', '$rootScope', 'cookie','uiGridConstants', 'hrmAPIservice', function ($scope, $rootScope, cookie, uiGridConstants, hrmAPIservice) {
    var userData = cookie.checkLoggedIn();
    cookie.getPermissions();

    $scope.pageTitle = "";
    $scope.formEnabled = 0;
    $scope.hs = {};
    
    $scope.doChangeSiteLocation = function(typedthings) {
        if(typedthings != null && typedthings.length > 0) {
            hrmAPIservice.searchData(typedthings, 'sitelocation', userData.account_id).then(function(response) {
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
    
    $scope.doChangeManager = function(typedthings) {
        if(typedthings != null && typedthings.length > 0) {
            hrmAPIservice.searchEmployee(typedthings, userData).then(function(response) {
                var users = response.data.employees;
                $scope.user_list = users;

                var names = [];
                for(var i = 0; i < $scope.user_list.length; i++) {
                    //var username = users[i].username;
                    var firstname = users[i].firstname;
                    var lastname = users[i].lastname;

                    names[i] = firstname + " " + lastname;// + " (" + username + ")";
                }

                $scope.manager_list = names;
            });
        }
    }

    $scope.doSelectedManager = function(suggestion) {
        var array = suggestion.split("(");
        var name = array[0];
        var username = array[1];

        $scope.course_supervior = name;
        username = username.replace(")", "");

        for(var i = 0; i < $scope.user_list.length; i++) {
            var user = $scope.user_list[i];
            if(user.username == username) {
                $scope.hs.manager_id = user.id;
                break;
            }
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
        { name: 'common_name', width: '25%' },
        { name: 'site_location', width: '25%', enableFiltering: true, cellClass: 'center' },
        { name: 'safety_sheet_location', width: '15%', enableFiltering: true, cellClass: 'center' },
        { name: 'SDS_Available', width: '15%', enableFiltering: true, cellClass: 'center', displayName: 'SDS Available', headerCellClass: 'center' },
        { name: 'Expiration', width: '10%', enableFiltering: false, cellClass: 'center', headerCellClass: 'center' },
        { name: 'action', enableFiltering: false, width: '10%',  cellClass: 'center', enableSorting: false,headerCellClass: 'center',
            cellTemplate: '<div class="ui-grid-cell-contents"><i class="fa fa-edit fa-2x" ng-click="grid.appScope.editHS(row.entity)"></i>&nbsp;&nbsp;<i class="fa fa-trash-o fa-2x text-danger" ng-click="grid.appScope.deleteHS(row.entity)"></i></div>'
        }
      ]
    };

    $scope.deleteHS = function(hsDetail) {
        var answer = confirm("Delete " + hsDetail.common_name + '? Are you sure?');
        if (answer) {
            hrmAPIservice.delete(hsDetail, userData, 'hs').then(function(response) {
                $scope.gridOptionsComplex.data = response.data.records;
            });
        }
    }


    $scope.newHS = function() {
        $scope.showMessage = 0;
        $scope.hazardoussubstanceform.$setPristine();
        $scope.hs = {};
        $scope.hs.id = 0;
        $scope.hs.account_id = userData.account_id;
        $scope.hs.created_by = userData.id;
        $scope.hs.updated_by = 0;
        $scope.hs.expiry_date = new Date();        
        $scope.formEnabled = 1;
    }

    $scope.clearForm = function() {
        $scope.hs = {};
        $scope.site_name = '';
        $scope.formEnabled = 0;
    }

    var setDate = function(date) {
        var a = date.split('-');
        var d = new Date(a[0], a[1]-1, a[2]);
        return d;
    }

    $scope.editHS = function(hsDetail) {
        $scope.showMessage = 0;
        hrmAPIservice.get(hsDetail.id, 'hs').then(function(response) {
            $scope.hs = response.data;
            $scope.hs.expiry_date = setDate($scope.hs.expiry_date);
            $scope.formEnabled = 1;
            $scope.hs.updated_by = userData.id;
        });
    };

    hrmAPIservice.getHSData(userData).then(function(response) {
        $scope.gridOptionsComplex.data = response.data.records;
        $scope.managerList = response.data.managers;
        $scope.locationList = response.data.locations;
        $scope.supplierList = response.data.suppliers;
    });

    $scope.saveHS = function() {
        hrmAPIservice.saveHS($scope.hs, userData).then(function(response) {
            $scope.gridOptionsComplex.data = response.data.records;
            
            $scope.success = 1;
            $scope.showMessage = 1;
            $scope.userMessage = "Hazardous Substance details have been saved successfully!"; 
            
            $scope.hs = {};
            $scope.site_name = '';
            $scope.formEnabled = 0;
        });
    }
    
 

}]);
