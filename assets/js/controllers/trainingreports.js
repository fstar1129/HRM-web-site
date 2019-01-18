app.controller('trainingreportsController', ['$scope', '$rootScope', 'cookie','uiGridConstants', 'hrmAPIservice', function ($scope, $rootScope, cookie, uiGridConstants, hrmAPIservice) {
    var userData = cookie.checkLoggedIn();
    cookie.getPermissions();
    $scope.pageTitle = "Training Report";
    $scope.userId = '';
        var barTipOption = {
            maintainAspectRatio: true,
            scales: {
                yAxes: [
                    {
                        ticks: {
                            beginAtZero: true
                        }
                    }
                ]
            },
            legend: {
                display: true,
                labels: {
                    fontColor: 'rgb(0, 0, 0)'
                }
            }
        };
        var pieTipOption = {
            maintainAspectRatio: true,
            legend: {
                display: true,
                position: 'top',
                fullWidth: true,
                labels: {
                    fontColor: 'rgb(0, 0, 0)',
                    fontSize: 10,
                    boxWidth: 20
                }
            }
        };
        $scope.totalBarLabels = [];
        $scope.totalBarData = [];
        $scope.totalBarColors = [];
        $scope.blueColor = {
            backgroundColor: 'rgba(54, 162, 235, 0.2)',
            pointBackgroundColor: 'rgba(54, 162, 235, 1)'
        };
        $scope.redColor = {
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            pointBackgroundColor: 'rgba(255,99,132,1)'
        };

        $scope.departmentBarLabels = [];
        $scope.departmentBarData = [];
        $scope.departmentBarColors = [];

        $scope.LocationBarData = [];
        $scope.LocationBarLabels = [];

        $scope.departmentPieHeight = '150px';
        $scope.departmentPieData = [];
        $scope.departmentPieLabels = [];
        $scope.departmentPieOptions = pieTipOption;

        $scope.daysoverduePieHeight = '150px';
        $scope.daysoverduePieData = [];
        $scope.daysoverduePieLabels = [];
        $scope.daysoverduePieOptions = pieTipOption;

        $scope.locationPieHeight = '150px';
        $scope.locationPieData = [];
        $scope.locationPieLabels = [];
        $scope.locationPieOptions = pieTipOption;



        $scope.allscoresBarData = [];
        $scope.allscoresBarLabels = [];
        $scope.allscoresBarSeries = [];
        $scope.allscoresBarColors = [];

        $scope.compensationBarData = [];
        $scope.compensationBarLabels = [];
        $scope.compensationBarSeries = [];
        $scope.compensationBarColors = [];

        $scope.departmentCompensationHeight = '150px';
        $scope.departmentCompensationData = [];
        $scope.departmentCompensationLabels = [];
        $scope.departmentCompensationBarSeries = ['Salary', 'Bonus', 'Overtime', 'Commission'];
        $scope.departmentCompensationOptions = {
            maintainAspectRatio: false,
            scales: {
                xAxes: [
                    {
                        stacked: true
                    }
                ],
                yAxes: [
                    {
                        stacked: true
                    }
                ]

            },
            legend: {
                display: true,
                labels: {
                    fontColor: 'rgb(0, 0, 0)'
                }
            }
        };
        $scope.departmentCompensationColors = [
            {
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                pointBackgroundColor: 'rgba(255,99,132,1)'
            }, {
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                pointBackgroundColor: 'rgba(75, 192, 192, 1)'
            }, {
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                pointBackgroundColor: 'rgba(54, 162, 235, 1)'
            }, {
                backgroundColor: 'rgba(153, 102, 255, 0.2)',
                pointBackgroundColor: 'rgba(153, 102, 255, 1)'
            }
        ];

        $scope.locationCompensationHeight = '150px';
        $scope.locationCompensationData = [];
        $scope.locationCompensationLabels = [];
        $scope.locationCompensationBarSeries = ['Salary', 'Bonus', 'Overtime', 'Commission'];
        $scope.locationCompensationOptions = barTipOption;
        $scope.locationCompensationOptions.maintainAspectRatio = false;

        $scope.selected_site_location = '';

        $scope.daysoverduedetailData = [];
        $scope.daysoverduedetailLabels = [];
        $scope.daysoverduedetailSeries = [];
        $scope.daysoverduedetailColors = [];

        $scope.baseSalaryData = [];
        $scope.baseSalaryLabels = [];

        $scope.summaryItems = [
            'Total Salaries',
            'Total Bonuses',
            'Total Overtimes',
            'Total Commissions',
            'Total Compensations',
            'Total Employees',
            'Average Salary',
            'Total Sick Days',
            'Average Sick Days per Emp'
        ];
        $scope.baseSalarySeries = [];

        $scope.employeePropsLeft = [
            'Hire Date',
            'Location',
            'Term. Date',
            'Empl.Type',
            'Year',
            'Base Salary',
            'Bonus'
        ];
        $scope.employeePropsRight = [
            'Overtime',
            'Commission',
            'Total Comp.',
            'Department',
            'Annual Leave',
            'Sick Days',
            'Perform Score'
        ];
        $scope.employee = [];

        $scope.currentYear = null;
        $scope.currentLocation = null;
        $scope.currentDepartment = null;
        $scope.currentEmployee = null;

        $scope.userCountForYear = [];
        $scope.isAllowed = false;
        $scope.isYearListExist = false;
        $scope.gridOptionsComplexDprt = {
            enableFiltering: true,
            showGridFooter: false,
            showColumnFooter: false,
            onRegisterApi: function onRegisterApi(registeredApi) {
                gridApi = registeredApi;
            },
            columnDefs: [
                {
                    field: 'department',
                    width: '100%',
                    cellClass: 'center',
            cellTemplate: '<a ng-click="grid.appScope.sendDprtReq(row.entity)" class="ListItems">{{row.entity.department}}</a>'
                }
            ]
        };
        $scope.gridOptionsComplexLtn = {
            enableFiltering: true,
            showGridFooter: false,
            showColumnFooter: false,
            onRegisterApi: function onRegisterApi(registeredApi) {
                gridApi = registeredApi;
            },
            columnDefs: [
                {
                    field: 'location',
                    width: '100%',
                    cellClass: 'center',
            cellTemplate: '<a ng-click="grid.appScope.sendLctnReq(row.entity)" class="ListItems">{{row.entity.location}}</a>'
                }
            ]
        };
        $scope.gridOptionsComplexEply = {
            enableFiltering: true,
            showGridFooter: false,
            showColumnFooter: false,
            onRegisterApi: function onRegisterApi(registeredApi) {
                gridApi = registeredApi;
            },
            columnDefs: [
                {
                    field: 'employee',
                    width: '100%',
                    cellClass: 'center',
            cellTemplate: '<a ng-click="grid.appScope.sendEmployee(row.entity.id)" class="ListItems">{{row.entity.employee}}</a>'
        },  
            ]
        };
        $scope.isEmployeeListExist = true;
        $scope.isDepartmentListExist = true;
        $scope.isLocationListExist = true;




    $scope.gridOptionsComplex = {
        enableFiltering: true,
        showGridFooter: false,
        showColumnFooter: false,
        paginationPageSizes: [10, 20, 30],
        paginationPageSize: 10,
        onRegisterApi: function onRegisterApi(registeredApi) {
            gridApi = registeredApi;
        },
        height: '400px',
        columnDefs: [
          { name: 'id', cellClass: 'center',width : '10%', enableCellEdit: false},
          { name: 'employee_name', displayName: 'Employee', width: '25%', enableCellEdit: false },
          { name: 'site_location', displayName: 'Site Location', width: '25%', enableFiltering: true, cellClass: 'center',enableCellEdit: false},
          { name: 'average_score', displayName: 'Score', width: '15%', enableFiltering: true, cellClass: 'center',enableCellEdit: false},
          { name: 'department', displayName: 'Department', width: '25%', enableFiltering: true, cellClass: 'center',enableCellEdit: false}
        ]
    };
    
    $scope.calcAverageScore = function(scores){
        var scoreList = scores.split(",");
        var average_score = 0;
        scoreList.forEach(function(value, index){
            if(value != ""){    
                average_score += value / 1; 
            }
        });
        return average_score;
    }
    hrmAPIservice.getReviewReports(userData).then(function(response) {
        console.log(response.data);
        $scope.gridOptionsComplex.data = response.data.review_reports.map(function(review){
            return{
                id: review.id,
                employee_name: review.employee_name,
                site_location: review.site_location,
                average_score: $scope.calcAverageScore(review.scores),
                department: review.department_name,
            }
        });
    });
    $scope.init = function () {

        $scope.userId = cookie
            .getCookie('user')
            .account_id;

        var perm = cookie.getCookie("permissions");
        if (perm['24'] == null) {
            $scope.isAllowed = false;
        } else {
            if (perm['24'].r == '1') {
                $scope.isAllowed = true;
            } else 
                $scope.isAllowed = false;
            }
        
        var temp = [];
        for (var i = 0; i < 9; i++) {
            temp.push($scope.blueColor);
        }

        $scope.baseSalaryColors = temp;
        hrmAPIservice
            .send('department_list/' + $scope.userId)
            .then(function (response) {
                if (response.data.res == null) {
                    return;
                }
                $scope.departments = response.data.res;
                $scope.gridOptionsComplexDprt.data = $scope.departments;
                $scope.department_length = ($scope.gridOptionsComplexDprt.data.length * 31) + 71;
                if ($scope.department_length >= 377) {
                    $scope.department_length = 'noNeed';
                }

                $scope.currentDepartment = $scope.departments[0].department;

                $scope.sendDprtReq($scope.departments[0]);

            });

        hrmAPIservice
            .send('location_list/' + $scope.userId)
            .then(function (response) {
                if (response.data.res == null) {
                    return;
                }
                $scope.locations = response.data.res;
                $scope.gridOptionsComplexLtn.data = $scope.locations;
                $scope.location_length = ($scope.gridOptionsComplexLtn.data.length * 31) + 71;
                if ($scope.location_length >= 377) {
                    $scope.location_length = 'noNeed';
                }
                $scope.currentLocation = $scope.locations[0].location;
                $scope.sendLctnReq($scope.locations[0]);
                // console.log("response ", response.data.res);
            });

        hrmAPIservice
            .send('year_list/' + $scope.userId)
            .then(function (response) {
                if (response.data.res == null) {
                    $scope.isYearListExist = false;
                    return;
                }
                $scope.isYearListExist = true;
                var temp = response.data.res,
                    temp_data = [];

                for (var i = parseInt(temp[0].year); i <= parseInt(temp[temp.length - 1].year); i++) {
                    temp_data.push(i);
                }
                $scope.years = temp_data;
                $scope.Option = $scope.years[0];
                var years = [],
                    colors = [],
                    dColors = [];
                for (var i = 0; i < $scope.years.length; i++) {
                    years[i] = $scope.years[i];
                    colors.push($scope.blueColor);
                    dColors.push($scope.redColor);
                }
                $scope.totalBarLabels = years;
                $scope.totalBarColors = colors;
                $scope.locationBarColors = colors;
                $scope.departmentBarColors = dColors;
                $scope.currentYear = $scope.years[0];
                $scope.Option = new Date().getFullYear();
                $scope.sendYrReq(new Date().getFullYear());
                hrmAPIservice
                    .send('employee_list/' + $scope.userId)
                    .then(function (response) {
                        if (response.data.res == null) {
                            //  console.log('response null',temp_data);
                            return;
                        }
                        $scope.employees = response.data.res;
                        $scope.gridOptionsComplexEply.data = $scope.employees;
                        $scope.employees_length = ($scope.gridOptionsComplexEply.data.length * 31) + 71;
                        if ($scope.employees_length >= 377) {
                            $scope.employees_length = 'noNeed';
                        }
                        $scope.sendEmployee($scope.employees[0].id);

                        hrmAPIservice.send("total_salary_count/" + $scope.years[0] + '/' + $scope.userId)
                            .then(function (response) {
                                if (response.data.res == null) {
                                    //alert('There is no record that matches.');
                                    temp = [];
                                    temp['Total Employees'] = '0';
                                    temp['Average Salary'] = '0';
                                    temp['Average Sick Days per Emp'] = '0';
                                    return;
                                }
                                var temp = response.data.res.total_data,
                                    temp_employees = [];
                                temp_employees = $scope.userCountForYear[0].count == null
                                    ? 0
                                    : $scope.userCountForYear[0].count;
                                temp['Total Employees'] = temp_employees.length;
                                temp['Average Salary'] = temp['Total Salaries'] / temp['Total Employees'];
                                temp['Average Sick Days per Emp'] = temp['Total Sick Days'] / temp['Total Employees'];

                                temp["Average Salary"] = parseFloat(temp["Average Salary"]).toFixed(2);
                                temp["Average Sick Days per Emp"] = parseFloat(temp["Average Sick Days per Emp"]).toFixed(2);
                                temp["Total Bonuses"] = parseFloat(temp["Total Bonuses"]).toFixed(2);
                                temp["Total Commissions"] = parseFloat(temp["Total Commissions"]).toFixed(2);
                                temp["Total Compensations"] = parseFloat(temp["Total Compensations"]).toFixed(2);
                                temp["Total Overtimes"] = parseFloat(temp["Total Overtimes"]).toFixed(2);
                                temp["Total Salaries"] = parseFloat(temp["Total Salaries"]).toFixed(2);
                                temp["Total Sick Days"] = parseFloat(temp["Total Sick Days"]).toFixed(2);

                                $scope.summary = temp;
                            });
                    });

            });

        hrmAPIservice
            .send('userCount/' + $scope.userId)
            .then(function (response) {
                if (response.data.res == null) {
                    //  console.log('response null',temp_data);
                    return;
                }
                var temp = response.data.res,
                    temp_data = [],
                    temp_year = [],
                    j = 0;

                for (var i = parseInt(temp[0].year); i <= parseInt(temp[temp.length - 1].year); i++) {
                    temp_year.push(i);
                    if (parseInt(temp[j].year) == i) {
                        temp_data.push(temp[j].count);
                        j++;
                    } else {
                        temp_data.push(0);
                    }
                }

                $scope.userCountForYear = response.data.res;
                $scope.totalBarData = temp_data;

            });

        hrmAPIservice
            .send("days_overdue/" + $scope.userId)
            .then(function (response) {
                
                if (response.data.pieData == null) {
                    $scope.daysoverduePieData = [];
                    $scope.daysoverduePieLabels = [];
                    return;
                }
                var PieData = response.data.pieData;
                
                var legendHeight = Math.round(PieData.label.length / 1.8) * 30;
                legendHeight = legendHeight > 50 ? legendHeight : 50;

                $scope.daysoverduePieData = PieData.data;
                $scope.daysoverduePieLabels = PieData.label;
                $scope.daysoverduePieHeight = 257 + 'px';
            });

    }

    $scope.GoBack = function () {
        $location.path('/');
    }
    $scope.sendDprtReq = function (param) {
        $scope.currentDepartment = param.department;
        hrmAPIservice
            .send("department/" + param.id + '/' + $scope.userId)
            .then(function (response) {
                if (response.data.res == null) {
                    return;
                }
                var temp = response.data.res,
                    temp_data = [],
                    temp_year = [],
                    j = 0;

                for (var i = parseInt(temp[0].year); i <= parseInt(temp[temp.length - 1].year); i++) {
                    temp_year.push(i);
                    if (parseInt(temp[j].year) == i) {
                        temp_data.push(temp[j].count);
                        j++;
                    } else {
                        temp_data.push(0);
                    }
                }
                $scope.departmentBarLabels = temp_year;
                $scope.departmentBarData = temp_data;
                // console.log("response total", response.data.res);
            });
        return;
    }

    $scope.sendLctnReq = function (param) {
        $scope.currentLocation = param.location;
        hrmAPIservice
            .send("location/" + param.id + '/' + $scope.userId)
            .then(function (response) {
                if (response.data.res == null) {
                    return;
                }
                var temp = response.data.res,
                    temp_data = [],
                    temp_year = [],
                    j = 0;

                for (var i = parseInt(temp[0].year); i <= parseInt(temp[temp.length - 1].year); i++) {
                    temp_year.push(i);
                    if (parseInt(temp[j].year) == i) {
                        temp_data.push(temp[j].count);
                        j++;
                    } else {
                        temp_data.push(0);
                    }
                }
                $scope.LocationBarLabels = temp_year;
                $scope.LocationBarData = temp_data;
                // console.log("response total", response.data.res);
            });
        return;

    }

    $scope.sendYrReq = function (param) {
        if ($scope.currentEmployee != null) {
            hrmAPIservice
                .send("selectedEply/" + $scope.currentEmployee + "/" + param + '/' + $scope.userId)
                .then(function (response) {
                    if (response.data.res == null) {
                        //alert('There is no record that matches.');
                        $scope.employeeName = null;
                        $scope.employee = [];
                        return;
                    }
                    var temp = response.data.res.employee_data;
                    temp['Name'] = temp['firstname'] + ' ' + temp['lastname'];
                    temp['Base Salary'] = temp['annual_rate'];

                    temp["Annual Leave"] = parseFloat(temp["Annual Leave"]).toFixed(2);
                    temp["Base Salary"] = parseFloat(temp["Base Salary"]).toFixed(2);
                    temp["Bonus"] = parseFloat(temp["Bonus"]).toFixed(2);
                    temp["Commission"] = parseFloat(temp["Commission"]).toFixed(2);
                    temp["Overtime"] = parseFloat(temp["Overtime"]).toFixed(2);
                    temp["Sick Days"] = parseFloat(temp["Sick Days"]).toFixed(2);
                    temp["Total Comp."] = parseFloat(temp["Total Comp."]).toFixed(2);

                    $scope.employee = temp;
                    $scope.employeeName = $scope.employee['Name'];
                    delete $scope.employee.Name;
                    //console.log("response ", response.data.res);
                });

        }
        $scope.currentYear = param;
        // console.log("param ", param);
        // hrmAPIservice
        //     .send("department_count/" + param + '/' + $scope.userId)
        //     .then(function (response) {
        //         if (response.data.res == null) {
        //             $scope.departmentPieData = [];
        //             $scope.departmentPieLabels = [];
        //             return;
        //         }
        //         //  console.log('response',response.data.res);
        //         var PieData = PieCommon_calc(response.data.res);
        //         var legendHeight = Math.round(PieData.label.length / 2.4) * 30;
        //         legendHeight = legendHeight > 50 ? legendHeight : 50;

        //         $scope.departmentPieData = PieData.data;
        //         $scope.departmentPieLabels = PieData.label;
        //         $scope.departmentPieHeight = legendHeight + 120 + 'px';
        //     });
        // hrmAPIservice
        //     .send("location_count/" + param + '/' + $scope.userId)
        //     .then(function (response) {
        //         if (response.data.res == null) {
        //             $scope.locationPieData = [];
        //             $scope.locationPieLabels = [];
        //             return;
        //         }
        //         var PieData = PieCommon_calc(response.data.res);
        //         var legendHeight = Math.round(PieData.label.length / 1.8) * 30;
        //         legendHeight = legendHeight > 50 ? legendHeight : 50;

        //         $scope.locationPieData = PieData.data;
        //         $scope.locationPieLabels = PieData.label;
        //         $scope.locationPieHeight = legendHeight + 120 + 'px';
        //     });
        hrmAPIservice
            .send("department_compensation_count/" + param + '/' + $scope.userId)
            .then(function (response) {
                if (response.data.res == null) {
                    $scope.departmentCompensationData = [];
                    $scope.departmentCompensationLabels = [];
                    return;
                }
                var label = [],
                    data = [];
                data[0] = [];
                data[1] = [];
                data[2] = [];
                data[3] = [];
                var temp = response.data.res;
                for (var i = 0; i < temp.length; i++) {
                    label.push(temp[i].name);
                    data[0].push(temp[i].salary);
                    data[1].push(temp[i].bonus);
                    data[2].push(temp[i].overtime);
                    data[3].push(temp[i].commission);
                }
                $scope.departmentCompensationData = data;
                $scope.departmentCompensationLabels = label;
                $scope.departmentCompensationHeight = (25 * temp.length ) > 150 ? (25 * temp.length ) : 150;
                $scope.departmentCompensationHeight += 'px';
            });
        hrmAPIservice
            .send("location_compensation_count/" + param + '/' + $scope.userId)
            .then(function (response) {
                if (response.data.res == null) {
                    $scope.locationCompensationData = [];
                    $scope.locationCompensationLabels = [];
                    return;
                }
                var label = [],
                    data = [];
                data[0] = [];
                data[1] = [];
                data[2] = [];
                data[3] = [];
                var temp = response.data.res;
                for (var i = 0; i < temp.length; i++) {
                    label.push(temp[i].name);
                    data[0].push(temp[i].salary);
                    data[1].push(temp[i].bonus);
                    data[2].push(temp[i].overtime);
                    data[3].push(temp[i].commission);
                }
                
                $scope.locationCompensationData = data;
                $scope.locationCompensationLabels = label;
                $scope.locationCompensationHeight = (43 * temp.length) > 150 ? (43 * temp.length) : 150;
                $scope.locationCompensationHeight += 'px';
            });
        hrmAPIservice
            .send("base_salary_count/" + param + '/' + $scope.userId)
            .then(function (response) {
                if (response.data.res == null) {
                    $scope.baseSalaryData = [];
                    return;
                }
                $scope.baseSalaryLabels = response.data.res.label;
                $scope.baseSalaryData = response.data.res.data;
                //      console.log("response ",response.data.res);
            });
        hrmAPIservice
            .send("total_salary_count/" + param + '/' + $scope.userId)
            .then(function (response) {
                if (response.data.res == null) {
                    //alert('There is no record that matches.');
                    temp = [];
                    temp['Total Employees'] = '0';
                    temp['Average Salary'] = '0';
                    temp['Average Sick Days per Emp'] = '0';
                    return;
                }
                var temp = response.data.res.total_data,
                    temp_employees = [];
                for (var i = 0; i < $scope.userCountForYear.length; i++) {
                    if ($scope.userCountForYear[i].year == param) {
                        temp['Total Employees'] = $scope.userCountForYear[i].count;
                        break;
                    }
                }
                if (temp['Total Employees'] == null) {
                    temp['Total Employees'] = 0;
                }
                temp['Average Salary'] = temp['Total Salaries'] == null
                    ? 0
                    : temp['Total Salaries'] / temp['Total Employees'];
                temp['Average Sick Days per Emp'] = temp['Total Sick Days'] == null
                    ? 0
                    : temp['Total Sick Days'] / temp['Total Employees'];
                
                temp["Average Salary"] = parseFloat(temp["Average Salary"]).toFixed(2);
                temp["Average Sick Days per Emp"] = parseFloat(temp["Average Sick Days per Emp"]).toFixed(2);
                temp["Total Bonuses"] = parseFloat(temp["Total Bonuses"]).toFixed(2);
                temp["Total Commissions"] = parseFloat(temp["Total Commissions"]).toFixed(2);
                temp["Total Compensations"] = parseFloat(temp["Total Compensations"]).toFixed(2);
                temp["Total Overtimes"] = parseFloat(temp["Total Overtimes"]).toFixed(2);
                temp["Total Salaries"] = parseFloat(temp["Total Salaries"]).toFixed(2);
                temp["Total Sick Days"] = parseFloat(temp["Total Sick Days"]).toFixed(2);

                $scope.summary = temp;
            });
            //newly added
            hrmAPIservice
                .send("all_scores/" + $scope.currentEmployee + "/" + param + '/' + $scope.userId)
                .then(function (response) {
                    console.log($scope.currentYear);
                   
                    var temp_label = response.data.names,
                        temp_data = response.data.scores,
                        j = 0,
                        color = [];
                    $scope.allscoresBarLabels = temp_label;
                    $scope.allscoresBarData = temp_data;
                    $scope.allscoresBarColors = color;
                    $scope.employee_location = response.data.site_location;
                    if (temp_label.length == 0) {
                        return;
                    }
                    for (var i = 0; i <= temp_label.length; i++) {
                        color.push($scope.blueColor);
                    }
                    $scope.allscoresBarLabels = temp_label;
                    $scope.allscoresBarData = temp_data;
                    $scope.allscoresBarColors = color;
                    $scope.employee_location = response.data.site_location;
                });
            hrmAPIservice
                .send("all_scores_by_position/" + $scope.currentEmployee + "/" + param + '/' + $scope.userId)
                .then(function (response) {
                    console.log(response.data);
                   
                    var temp_label = response.data.names,
                        temp_data = response.data.scores,
                        j = 0,
                        color = [];
                    $scope.allscoresbyposBarLabels = temp_label;
                    $scope.allscoresbyposBarData = temp_data;
                    $scope.allscoresbyposBarColors = color;
                    $scope.employee_location = response.data.site_location;
                    $scope.position = response.data.position;
                    if (temp_label.length == 0) {
                        return;
                    }
                    for (var i = 0; i <= temp_label.length; i++) {
                        color.push($scope.blueColor);
                    }
                    $scope.allscoresbyposBarLabels = temp_label;
                    $scope.allscoresbyposBarData = temp_data;
                    $scope.allscoresbyposBarColors = color;
                    $scope.employee_location = response.data.site_location;
                    $scope.position = response.data.position;
                });
        return;
    }
    $scope.sendEmployee = function (param) {
        $scope.currentEmployee = param;
        if ($scope.currentYear != null) {
            hrmAPIservice
                .send("selectedEply/" + param + "/" + $scope.currentYear + '/' + $scope.userId)
                .then(function (response) {
                    if (response.data.res == null) {
                        //alert('There is no record that matches.');
                        $scope.employee = [];
                        $scope.employeeName = null;
                        return;
                    }
                    var temp = response.data.res.employee_data;
                    temp['Name'] = temp['firstname'] + ' ' + temp['lastname'];
                    temp['Base Salary'] = temp['annual_rate'];

                    temp["Annual Leave"] = parseFloat(temp["Annual Leave"]).toFixed(2);
                    temp["Base Salary"] = parseFloat(temp["Base Salary"]).toFixed(2);
                    temp["Bonus"] = parseFloat(temp["Bonus"]).toFixed(2);
                    temp["Commission"] = parseFloat(temp["Commission"]).toFixed(2);
                    temp["Overtime"] = parseFloat(temp["Overtime"]).toFixed(2);
                    temp["Sick Days"] = parseFloat(temp["Sick Days"]).toFixed(2);
                    temp["Total Comp."] = parseFloat(temp["Total Comp."]).toFixed(2);

                    $scope.employee = temp;
                    $scope.employeeName = $scope.employee['Name'];
                    delete $scope.employee.Name;
                    //console.log("response ", response.data.res);          
                });
                //newly added
                hrmAPIservice
                .send("all_scores/" + param + "/" + $scope.currentYear + '/' + $scope.userId)
                .then(function (response) {
                    console.log(response.data);

                    var temp_label = response.data.names,
                        temp_data = response.data.scores,
                        j = 0,
                        color = [];
                    $scope.allscoresBarLabels = temp_label;
                    $scope.allscoresBarData = temp_data;
                    $scope.allscoresBarColors = color;
                    $scope.employee_location = response.data.site_location;
                    if (temp_label.length == 0) {
                        return;
                    }
                    for (var i = 0; i <= temp_label.length; i++) {
                        color.push($scope.blueColor);
                    }
                    $scope.allscoresBarLabels = temp_label;
                    $scope.allscoresBarData = temp_data;
                    $scope.allscoresBarColors = color;
                    $scope.employee_location = response.data.site_location;
                });
                hrmAPIservice
                .send("all_scores_by_position/" + param + "/" + $scope.currentYear + '/' + $scope.userId)
                .then(function (response) {
                    console.log(response.data);
                   
                    var temp_label = response.data.names,
                        temp_data = response.data.scores,
                        j = 0,
                        color = [];
                    $scope.allscoresbyposBarLabels = temp_label;
                    $scope.allscoresbyposBarData = temp_data;
                    $scope.allscoresbyposBarColors = color;
                    $scope.employee_location = response.data.site_location;
                    $scope.position = response.data.position;
                    if (temp_label.length == 0) {
                        return;
                    }
                    for (var i = 0; i <= temp_label.length; i++) {
                        color.push($scope.blueColor);
                    }
                    $scope.allscoresbyposBarLabels = temp_label;
                    $scope.allscoresbyposBarData = temp_data;
                    $scope.allscoresbyposBarColors = color;
                    $scope.employee_location = response.data.site_location;
                    $scope.position = response.data.position;
                });
        }
        return;
    }

    function PieCommon_calc(get) {
        if (get == null) {
            return "{'data':'','label':''}";
        }
        var pieData = {};
        var labels = [],
            counts = [];
        var temp = 0,
            j = 0,
            temp_label;

        for (var i = 0; i < get.length; i++) {
            if (labels.length == 0) {
                labels.push(get[i].name);
                temp_label = get[i].name;
                temp++;
                if (i == get.length - 1) {
                    counts.push(temp);
                }
            } else {
                if (get[i].name == temp_label) {
                    temp++;
                    if (i == get.length - 1) {
                        counts.push(temp);
                    }
                } else {
                    labels.push(get[i].name);
                    counts.push(temp);
                    temp_label = get[i].name;
                    temp = 1;
                    if (i == get.length - 1) {
                        counts.push(temp);
                    }
                }
            }
        }
        pieData['data'] = counts;
        pieData['label'] = labels;
        return pieData;
    }
    $scope.chartClick = function (elems, event) {
        var datasetIndex = elems[0]._index;
        var param = $scope.daysoverduePieLabels[datasetIndex];
        $scope.selected_site_location = param;
        hrmAPIservice
        .send("days_overdue_detail/" + param + '/' + $scope.userId)
        .then(function (response) {
            console.log(response.data);
            
            if (response.data.pieData == null) {
                $scope.daysoverduedetailData = [];
                $scope.daysoverduedetailLabels = [];
                return;
            }
            var PieData = response.data.pieData;

            $scope.daysoverduedetailData = PieData.data;
            $scope.daysoverduedetailLabels = PieData.label;
        });
    };
}]);
