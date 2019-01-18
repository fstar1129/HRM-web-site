app.controller('sitedataController', [
    '$scope',
    '$rootScope',
    'cookie',
    'uiGridConstants',
    'hrmAPIservice',
    function ($scope, $rootScope, cookie, uiGridConstants, hrmAPIservice) {
        var userData = cookie.checkLoggedIn();
        cookie.getPermissions();
        if(!angular.isDefined($rootScope.perms.sitedata)){
            $scope.site_data_read = 0;
            $scope.site_data_write = 0;
            $scope.site_data_delete = 0;
        }else{
            $scope.site_data_read = ($rootScope.perms.sitedata.read > 0) ? true : false; //sitedata permission
            $scope.site_data_write = ($rootScope.perms.sitedata.write > 0) ? true : false; //sitedata permission
            $scope.site_data_delete = ($rootScope.perms.sitedata.delete > 0) ? true : false; //sitedata permission
        }
        console.log($scope.site_data_read);
        console.log($scope.site_data_write);
        console.log($scope.site_data_delete);



        $scope.pageTitle = "Site Data Administration";

        $scope.formEnabled = 0;
        $scope.sd = {};
        $scope.type_show = 1;
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
                }, {
                    name: 'type',
                    width: '20%'
                }, {
                    name: 'display_text',
                    width: '60%',
                    cellClass: 'center'
                }, {
                    name: 'action',
                    enableFiltering: false,
                    width: '20%',
                    cellClass: 'center',
                    cellTemplate: '<div class="ui-grid-cell-contents"><i class="fa fa-edit fa-2x" ng-click="grid.ap' +
                            'pScope.editData(row.entity)" ng-hide="grid.appScope.site_data_write == false"></i>&nbsp;&nbsp;&nbsp;<i class="fa fa-trash-o fa-2x' +
                            ' text-danger" ng-click="grid.appScope.deleteData(row.entity)" ng-hide="grid.appScope.site_data_delete == false"></i></div>'
                }
            ]
        };

        $scope.deleteData = function (sdDetail) {
            var answer = confirm("Delete " + sdDetail.display_text + '? Are you sure?');
            if (answer) {
                hrmAPIservice
                    .delete(sdDetail, userData, 'sitedata')
                    .then(function (response) {
                        $scope.gridOptionsComplex.data = response.data.sitedata;
                    });
            }
        }

        $scope.newData = function () {
            $scope.type_show = 1;
            $scope
                .sdform
                .$setPristine();
            $scope.sd.id = 0;
            $scope.sd.display_text = '';
            $scope.sd.type = '';
            $scope.formEnabled = 1;
        }
        $scope.addData = function () {
            $scope.type_show = 0;
            $scope
                .sdform
                .$setPristine();
            $scope.sd.id = 0;
            $scope.sd.display_text = '';
            $scope.sd.type = '';
            $scope.formEnabled = 1;
        }
        $scope.clearForm = function () {
            $scope.sd = {};
            $scope.sd.id = 0;
            $scope.formEnabled = 0;
        }

        var setDate = function (date) {
            var a = date.split('-');
            var d = new Date(a[0], a[1] - 1, a[2]);
            return d;
        }

        $scope.editData = function (sdDetail) {
            hrmAPIservice
                .get(sdDetail.id, 'sitedata')
                .then(function (response) {
                    $scope.sd = response.data;
                    $scope.formEnabled = 1;
                });
        };

        $scope.getSiteData = function() {
            hrmAPIservice
                .getSiteData(userData, userData.account_id)
                .then(function (response) {
                    $scope.gridOptionsComplex.data = response.data.sitedata;
                    console.log('site data', response.data.sitedata);
                    // HACK for now
                    var exclude = ['testfrequency', 'entitle', 'testresult', 'emptype'];
                    $scope.typeList = response
                        .data
                        .datatype
                        .filter(function (type) {
                            return exclude.indexOf(type) === -1;
                        });
                });
        }

        $scope.saveData = function () {
            console.log($scope.sd, userData);
            hrmAPIservice
                .saveData($scope.sd, userData)
                .then(function (response) {
                    $scope.getSiteData();
                    $scope.sd = {};
                    $scope.formEnabled = 0;

                });
        }

        $scope.saveAddData = function () {
            console.log($scope.sd, userData);
            hrmAPIservice
                .saveData($scope.sd, userData)
                .then(function (response) {
                    $scope.getSiteData();
                    $scope.sd = {};
                    $scope.formEnabled = 0;

                });
        }

        $scope.getSiteData();

    }
]);
