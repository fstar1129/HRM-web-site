app.controller("systemlogsController", ["$scope", "$rootScope", "cookie", "hrmAPIservice", "uiGridConstants", function($scope, $rootScope, cookie, hrmAPIservice, uiGridConstants) {
    var userData = cookie.checkLoggedIn(false);    
    var logCategory = [];
    cookie.getPermissions();
    $scope.pageTitle = "System Logs";
    $scope.logs = [];
    $scope.showModal = false;

    var selectedlog = null;

    $scope.gridOptionsComplex = {
        enableFiltering: true,
        showGridFooter: false,
        showColumnFooter: false,
        onRegisterApi: function onRegisterApi(registeredApi) {
            $scope.gridApi = registeredApi;
        },
        height: '400px',
        columnDefs: [
            {
                name: 'log_id',
                displayName: 'Id',
                width: '10%',
                cellClass: 'center'
            }, {
                name: 'who',
                displayName: 'Who',
                width: '20%',
                cellClass: 'center'
            }, {
                name: 'what',
                displayName: 'What',
                width: '50%',
                cellClass: 'center'
            }, {
                name: 'time',
                displayName: 'Time Added',
                width: '20%',
                enableFiltering: true,
                cellClass: 'center'
            }
        ]
    };
    $scope.formatDate = function(date_string){
        var d = date_string.split(" ");
        var dd = d[0].split("-");
        var d1 = d[1] + " " + dd[2] + "-" + dd[1] + "-" + dd[0];
        return d1;
    }
    hrmAPIservice.getSystemLogs(userData.account_id).then(function(response) {
       $scope.logs = response.data.logs.map(function(log){
        return{
            log_id: log.id,
            who: log.who,
            what: log.what,
            time: $scope.formatDate(log.time)
            }
        });
        $scope.gridOptionsComplex.data = $scope.logs;
    });
    // Sort function.
    $scope.sort = function(keyname){
        $scope.sortKey = keyname;   //set the sortKey to the param passed
        $scope.reverse = !$scope.reverse; //if true make it false and vice versa
    };


    // Active or Inactive log.

    /*
    $scope.gridOptionsComplex = {
        enableFiltering: true,
        showGridFooter: !1,
        showColumnFooter: !1,
        onRegisterApi: function(registeredApi) {
            gridApi = registeredApi
        },
        columnDefs: [{
            name: "id",
            visible: !1
        }, {
            name: "log_name",
            width: "20%"
        }, {
            name: "log_description",
            width: "10%",
            cellClass: "center"
        }, {
            name: "log_type",
            width: "15%",
            enableFiltering: !0,
            cellClass: "center"
        }, {
            name: "log_category_name",
            width: "15%",
            cellClass: "center",
            filter: {
                type: uiGridConstants.filter.SELECT, // <- move this to here
                selectOptions: logCategory 
            }
        },  {
            name: "status",
            width: "20%",
            enableFiltering: !1,
            cellClass: "center",
            cellTemplate: '<button class="btn btn-sm" ng-class="{\'btn-success\': row.entity.status == 1, \'btn-default\': row.entity.status == 0 }" style="margin-right: 0; border-top-right-radius: 0; border-bottom-right-radius: 0; " ng-click="grid.appScope.activatelog(row.entity,1)">Active</button><button class="btn btn-sm btn-default" ng-class="{\'btn-success\': row.entity.status == 0, \'btn-default\': row.entity.status == 1 }" ng-click="grid.appScope.activatelog(row.entity,0)" style="border-top-left-radius: 0; border-bottom-left-radius: 0;">Inactive</button></a>'
        }, {
            name: "action",
            enableFiltering: !1,
            width: "10%",
            cellClass: "center",
            cellTemplate: '<div class="ui-grid-cell-contents"><i class="fa fa-edit fa-2x" ng-click="grid.appScope.editlog(row.entity)"></i><i class="fa fa-trash-o fa-2x text-danger" ng-click="grid.appScope.dellog(row.entity)"></i></div>'
        },
        { name: 'log_category_id', visible: false },
        { name: 'log_id', visible: false },
        
        ]
    }, $scope.deleteTraining = function(empDetail) {
        confirm("Delete employee " + empDetail.firstname + " " + empDetail.lastname + "? Are you sure?") && hrmAPIservice.delete(empDetail, userData, "employee").then(function(response) {
            $scope.gridOptionsComplex.data = response.data.employees
        })
    }, $scope.newlog = function() {
        $scope.logform.$setPristine(),  
        $scope.formEnabled = 1;
        $scope.log = {};
        $scope.log_type.type_1 = 'Multiple Choice' ;
        $scope.active_log.active = 'active' ;
        
    }, $scope.clearForm = function() {
        $scope.formEnabled = 0,
        $scope.log = {};
       
        $scope.log_type.type_1 = 'Multiple Choice' ;
        $scope.active_log.active = 'active' ;
    };
    var setDate = function(date) {
        var a = date.split("-");
        return new Date(a[0], a[1] - 1, a[2])
    };
    
    $scope.activatelog = function(row, status) {
        hrmAPIservice.activatelog(row.log_id, status).then(function(response) {
            hrmAPIservice.getlogData().then(function(response) {
                $scope.gridOptionsComplex.data = response.data.logs;
            })
        })
    }, hrmAPIservice.getlogData().then(function(response) {
            //console.log('response', response.data.logs);
            $scope.gridOptionsComplex.data = response.data.logs ;
            $scope.log_type = log_type ;
            $scope.active_log = active_log ;
            
    }), hrmAPIservice.getlogCategory().then(function(response) {
            
            response.data.log_category.forEach(function(element, index){
                var temp = '{ "value" : "' + response.data.log_category[index].log_category_name + '", "label" : "' + response.data.log_category[index].log_category_name + '", "id" : "' + response.data.log_category[index].log_category_id + '" }' ;
                var temp_1 = '{ "value" : "' + response.data.log_category[index].log_category_id + '", "label" : "' + response.data.log_category[index].log_category_name + '" }';
                //console.log('temp', temp);
                logCategory.push(JSON.parse(temp)); 
                
            });
            $scope.log_category = logCategory; 
            //console.log($scope.log_category);
           
    }), 
    
    $scope.editlog = function(logDetail) {
        //console.log(logDetail);
        if(typeof logDetail !== 'undefined'){
            $scope.formEnabled = 1,
            $scope.log.category = logDetail.log_category_id; 
            $scope.log.log_name = logDetail.log_name;
            $scope.log.log_desc = logDetail.log_description;
            $scope.log_type.type_1 = logDetail.log_type;
            $scope.log.log_id = logDetail.log_id;
           
            $scope.active_log.active = (logDetail.status == '1' )? 'active' : 'inactive' ;    
             //$scope.log.status = ($scope.active_log == 'active')? 1 : 0;
        }
        
   
    };
    
    $scope.savelog = function() {
        var data = {}
        data['log_description'] = $scope.log.log_desc;
        data['log_name'] =  $scope.log.log_name;
        data['log_id'] =  $scope.log.log_id;
        data['log_category_id'] =  $scope.log.category;
        data['log_type'] =  $scope.log_type.type_1;
        
        $scope.log.status = ($scope.active_log.active == 'active')? 1 : 0;
        data['status'] =  $scope.log.status;
          
        //console.log('log_id', $scope.log.log_id);
        if(typeof $scope.log.log_id === 'undefined'){
           // alert('You can not update !');
            data = JSON.stringify(data);
             hrmAPIservice.savelog(data).then(function(response) {
                console.log(response);
                if (response.data.success == 0) {
                  
                } else {
              
                }
                
                $scope.gridOptionsComplex.data = response.data.logs;
                $scope.clearForm();
            });
          //  alert(data);
            
        }
        else{
            data = JSON.stringify(data);
           // alert(data);
            hrmAPIservice.savelog(data).then(function(response) {
                console.log(response);
                if (response.data.success == 0) {
                  
                } else {
              
                }
                
                $scope.gridOptionsComplex.data = response.data.logs;
                $scope.clearForm();
            });
        }
        
 
    }
    
    $scope.addlog = function(logId) {
        location.href = "#/addlogs/" + logId;
    }
    
    $scope.dellog = function(row) {
        var answer = confirm("Delete log " + row.log_name +  '? Are you sure?');
        if (answer) {
            hrmAPIservice.dellog(row.log_id).then(function(response) {
                $scope.gridOptionsComplex.data = response.data.logs;
            });
        }
    }
    */

}]);