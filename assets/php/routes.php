<?php

//require('db.class.php');
require('transaction.class.php');
require('registers.class.php');
require('injuryregister.class.php');
require('course.class.php');
// Add route callbacks

$app->get('/roles', function ($request, $response) {
    $trans = new transaction();
    $data = $trans->getRoles();
    return $response->withStatus(200)->write($data);
});

$app->get('/department_list/{userId}', function ($request, $response) {
    $route = $request->getAttribute('route');
    $userId = $route->getArgument('userId');
    $trans = new transaction();
    $data = $trans->initialDataDprt($userId);
    return $response->withStatus(200)->write($data);
});

$app->get('/location_list/{userId}', function ($request, $response) {
    $route = $request->getAttribute('route');
    $userId = $route->getArgument('userId');
    $trans = new transaction();
    $data = $trans->initialDataLctn($userId);
    return $response->withStatus(200)->write($data);
});

$app->get('/year_list/{userId}', function ($request, $response) {
    $route = $request->getAttribute('route');
    $userId = $route->getArgument('userId');
    $trans = new transaction();
    $data = $trans->initialDataYr($userId);
    return $response->withStatus(200)->write($data);
});

$app->get('/employee_list/{userId}', function ($request, $response) {
    $route = $request->getAttribute('route');
    $userId = $route->getArgument('userId');
    $trans = new transaction();
    $data = $trans->initialDataEply($userId);
    return $response->withStatus(200)->write($data);
});

$app->get('/userCount/{userId}', function ($request, $response) {
    $route = $request->getAttribute('route');
    $userId = $route->getArgument('userId');
    $trans = new transaction();
    $data = $trans->initialDataUserCount($userId);
    return $response->withStatus(200)->write($data);
});


$app->get('/department/{param}/{userId}', function ($request, $response, $args) {
    $route = $request->getAttribute('route');
    $param = $route->getArgument('param');
    $userId = $route->getArgument('userId');
    $trans = new transaction();
    $data = $trans->departmentBarCalc($param,$userId);
    return $response->withStatus(200)->write($data);
});

$app->get('/location/{param}/{userId}', function ($request, $response, $args) {
    $route = $request->getAttribute('route');
    $param = $route->getArgument('param');
    $userId = $route->getArgument('userId');
    $trans = new transaction();
    $data = $trans->locationBarCalc($param,$userId);
    return $response->withStatus(200)->write($data);
});

$app->get('/department_count/{param}/{userId}', function ($request, $response, $args) {
    $route = $request->getAttribute('route');
    $param = $route->getArgument('param');
    $userId = $route->getArgument('userId');
    $trans = new transaction();
    $data = $trans->departmentPieCalc($param,$userId);
    return $response->withStatus(200)->write($data);
});

$app->get('/location_count/{param}/{userId}', function ($request, $response, $args) {
    $route = $request->getAttribute('route');
    $param = $route->getArgument('param');
    $userId = $route->getArgument('userId');
    $trans = new transaction();
    $data = $trans->locationPieCalc($param,$userId);
    return $response->withStatus(200)->write($data);
});

$app->get('/department_compensation_count/{param}/{userId}', function ($request, $response, $args) {
    $route = $request->getAttribute('route');
    $param = $route->getArgument('param');
    $userId = $route->getArgument('userId');
    $trans = new transaction();
    $data = $trans->departmentCompensationCalc($param,$userId);
    return $response->withStatus(200)->write($data);
});

$app->get('/location_compensation_count/{param}/{userId}', function ($request, $response, $args) {
    $route = $request->getAttribute('route');
    $param = $route->getArgument('param');
    $userId = $route->getArgument('userId');
    $trans = new transaction();
    $data = $trans->locationCompensationCalc($param,$userId);
    return $response->withStatus(200)->write($data);
});

$app->get('/base_salary_count/{param}/{userId}', function ($request, $response, $args) {
    $route = $request->getAttribute('route');
    $param = $route->getArgument('param');
    $userId = $route->getArgument('userId');
    $trans = new transaction();
    $data = $trans->baseSalaryCalc($param,$userId);
    return $response->withStatus(200)->write($data);
});

$app->get('/total_Compensation/{param}/{userId}', function ($request, $response, $args) {
    $route = $request->getAttribute('route');
    $param = $route->getArgument('param');
    $userId = $route->getArgument('userId');
    $trans = new transaction();
    $data = $trans->totalCompensationCalc($param,$userId);
    return $response->withStatus(200)->write($data);
});

$app->get('/selectedEply/{id}/{year}/{userId}', function ($request, $response, $args) {
    $route = $request->getAttribute('route');
    $id = $route->getArgument('id');
    $year = $route->getArgument('year');
    $userId = $route->getArgument('userId');
    $trans = new transaction();
    $data = $trans->selectedEmplyCalc($id,$year,$userId);
    return $response->withStatus(200)->write($data);
});

$app->get('/total_salary_count/{year}/{userId}', function ($request, $response) {
    $route = $request->getAttribute('route');
    $year = $route->getArgument('year');
    $userId = $route->getArgument('userId');
    $trans = new transaction();
    $data = $trans->totalSalaryCalc($year,$userId);
    return $response->withStatus(200)->write($data);
});
//newly added
$app->get('/all_scores/{id}/{year}/{userId}', function ($request, $response, $args) {
    $route = $request->getAttribute('route');
    $id = $route->getArgument('id');
    $year = $route->getArgument('year');
    $userId = $route->getArgument('userId');
    $trans = new transaction();
    $data = $trans->allScores($id,$year,$userId);
    return $response->withStatus(200)->write($data);
});
//newly added
$app->get('/all_scores_by_position/{id}/{year}/{userId}', function ($request, $response, $args) {
    $route = $request->getAttribute('route');
    $id = $route->getArgument('id');
    $year = $route->getArgument('year');
    $userId = $route->getArgument('userId');
    $trans = new transaction();
    $data = $trans->allScoresByPosition($id,$year,$userId);
    return $response->withStatus(200)->write($data);
});
//newly added
$app->get('/days_overdue/{userId}', function ($request, $response, $args) {
    $route = $request->getAttribute('route');
    $userId = $route->getArgument('userId');
    $trans = new transaction();
    $data = $trans->getDaysOverdueBySiteLocation($userId);
    return $response->withStatus(200)->write($data);
});
//newly added
$app->get('/days_overdue_detail/{param}/{userId}', function ($request, $response, $args) {
    $route = $request->getAttribute('route');
    $userId = $route->getArgument('userId');
    $param = $route->getArgument('param');
    $trans = new transaction();
    $data = $trans->getDaysOverdueDetail($param, $userId);
    return $response->withStatus(200)->write($data);
});
$app->post('/auth/login', function ($request, $response, $args) {
      //  return '{"userdetail":{"id":"1","account_id":"1","usertype_id":"19","username":"Hrm@st3r","password":"d447d095fd3b3449080b15dc27a230b4","public_password":"wfx5y7p82","tradingname":"HR Master","companyname":"HR Master","abn":"16377155715","firstname":"Admin","lastname":"Admin","address":"PO Box 676","suburb":"Engadine","state":"2","postcode":"2233","country":"0","title":"10","email":"david.berlusconi@outlook.com","telephone":"0404226524","gender":"M","dob":"1974-11-16","numEmployees":"1","active":"1","deleted":"0","expire_date":"2017-07-13 18:07:19","login_attempts":"0","total_logins":"653","last_login":"2018-07-10 08:54:19","can_next_login":"0","date_added":"2017-07-13 18:07:19","added_by":"1","date_updated":"2018-07-10 15:54:19","updated_by":"0"},"success":"1","permissions":{"33":{"r":"1","w":"1","d":"1","c":"sitedata"},"32":{"r":"1","w":"1","d":"1","c":"hazardoussubstance"},"31":{"r":"1","w":"1","d":"1","c":"worksafety"},"30":{"r":"1","w":"1","d":"1","c":""},"29":{"r":"1","w":"1","d":"1","c":"allocatecareerprogressionplan"},"28":{"r":"1","w":"1","d":"1","c":""},"27":{"r":"1","w":"1","d":"1","c":"allocatetraining"},"26":{"r":"1","w":"1","d":"1","c":"trainingcourses"},"25":{"r":"1","w":"1","d":"1","c":""},"24":{"r":"1","w":"1","d":"1","c":""},"23":{"r":"1","w":"1","d":"1","c":""},"22":{"r":"1","w":"1","d":"1","c":""},"21":{"r":"1","w":"1","d":"1","c":"administration"},"20":{"r":"1","w":"1","d":"1","c":""},"19":{"r":"1","w":"1","d":"1","c":"employeeprofile"},"18":{"r":"1","w":"1","d":"1","c":"trainingcourses"},"17":{"r":"1","w":"1","d":"1","c":"employeeprofile"},"16":{"r":"1","w":"1","d":"1","c":"therecruiter"},"15":{"r":"1","w":"1","d":"1","c":"users"},"14":{"r":"1","w":"1","d":"1","c":"useradmin"},"13":{"r":"1","w":"1","d":"1","c":"training"},"12":{"r":"1","w":"1","d":"1","c":""},"11":{"r":"1","w":"1","d":"1","c":"assessmentchecklist"},"10":{"r":"1","w":"1","d":"1","c":"category"},"9":{"r":"1","w":"1","d":"1","c":"employeeType"},"8":{"r":"1","w":"1","d":"1","c":"level"},"7":{"r":"1","w":"1","d":"1","c":"position"},"6":{"r":"1","w":"1","d":"1","c":"department"},"5":{"r":"1","w":"1","d":"1","c":"employees"},"4":{"r":"1","w":"1","d":"1","c":"employer"},"3":{"r":"1","w":"1","d":"1","c":"useradmin"},"2":{"r":"1","w":"1","d":"1","c":"permissions"},"1":{"r":"1","w":"1","d":"1","c":"dashboard"},"34":{"r":"1","w":"1","d":"1","c":"assetregister"}}}';
     $params = json_decode($request->getBody());  
     $trans = new transaction();
     $result = $trans->doLogin($params);
     return $response->withStatus(200)->write($result);
});

$app->post('/auth/forgotpassword', function ($request, $response, $args) {
    $params = json_decode($request->getBody());
    $trans = new transaction();
    $result = $trans->forgotPassword($params);
    return $response->withStatus(200)->write($result);
});

$app->post('/auth/resetpassword', function ($request, $response, $args) {
    $params = json_decode($request->getBody());
    $trans = new transaction();
    $result = $trans->resetPassword($params);
    return $response->withStatus(200)->write($result);
});

$app->post('/auth/getemailfromhash', function ($request, $response, $args) {
    $params = json_decode($request->getBody());
    $trans = new transaction();
    $result = $trans->getEmailFromHash($params);
    return $response->withStatus(200)->write($result);
});

$app->post('/auth/getpermissiondata', function ($request, $response, $args) {
    $trans = new transaction();
    $result = $trans->getPermissionData();
    return $response->withStatus(200)->write($result);
});

$app->post('/auth/savepermissions', function ($request, $response, $args) {
    $params = json_decode($request->getBody());
    $trans = new transaction();
    $result = $trans->savePermissions($params);
    return $response->withStatus(200)->write($result);
});

$app->get('/auth/getpermissions/{role}', function ($request, $response, $args) {
    
    $route = $request->getAttribute('route');
    $role = $route->getArgument('role');
    $trans = new transaction();
    $data = $trans->getPermissions($role);
    return $response->withStatus(200)->write($data);
});

$app->post('/employee/save', function ($request, $response, $args) {
    $params = json_decode($request->getBody());
    $trans = new transaction();
    $result = $trans->saveEmployee($params);
    return $response->withStatus(200)->write($result);
});



$app->post('/employee/getdata', function ($request, $response, $args) {  
    $params = json_decode($request->getBody());
    $trans = new transaction();
    $result = $trans->getEmployeeData($params);
    return $response->withStatus(200)->write($result);
});

$app->post('/employee/search', function ($request, $response, $args) {
    $params = json_decode($request->getBody());
    $trans = new transaction();
    $result = $trans->searchEmployee($params);
    return $response->withStatus(200)->write($result);
});

$app->post('/employeeuser/search', function ($request, $response, $args) {
    $params = json_decode($request->getBody());
    $trans = new transaction();
    $result = $trans->searchEmployeeUser($params);
    return $response->withStatus(200)->write($result);
});


$app->post('/user/getlist', function ($request, $response, $args) {
    $params = json_decode($request->getBody());
    $trans = new transaction(); 
    $result = $trans->getUsers($params);
    return $response->withStatus(200)->write($result);
});
//newly added
$app->post('/reminders/startAlert', function ($request, $response, $args) {
    $params = json_decode($request->getBody());
    $trans = new transaction();
    $result = $trans->startAlert($params);
    return $response->withStatus(200)->write($result);
});
//newly added
$app->post('/reminders/stopAlert', function ($request, $response, $args) {
    $params = json_decode($request->getBody());
    $trans = new transaction();
    $result = $trans->stopAlert($params);
    return $response->withStatus(200)->write($result);
});
//newly added
$app->post('/reminders/updateReminder', function ($request, $response, $args) {
    $params = json_decode($request->getBody());
    $trans = new transaction();
    $result = $trans->updateReminder($params);
    return $response->withStatus(200)->write($result);
});
//newly added
$app->post('/reminders/getSpecificReminder', function ($request, $response, $args) {
    $params = json_decode($request->getBody());
    $trans = new transaction();
    $result = $trans->getSpecificReminder($params);
    return $response->withStatus(200)->write($result);
});
//newly added
$app->post('/reminders/emailUpdate', function ($request, $response, $args) {
    $params = json_decode($request->getBody());
    $trans = new transaction();
    $result = $trans->emailUpdate($params);
    return $response->withStatus(200)->write($result);
});
//newly added
$app->post('/reminders/deleteReminder', function ($request, $response, $args) {
    $params = json_decode($request->getBody());
    $trans = new transaction();
    $result = $trans->deleteReminder($params);
    return $response->withStatus(200)->write($result);
});
//newly added
$app->post('/reminders/getAllReminders', function ($request, $response, $args) {
    $params = json_decode($request->getBody());
    $trans = new transaction();
    $result = $trans->getAllReminders($params);
    return $response->withStatus(200)->write($result);
});
//newly added
$app->post('/reminders/saveReminder', function ($request, $response, $args) {
    $params = json_decode($request->getBody());
    $trans = new transaction();
    $result = $trans->saveReminder($params);
    return $response->withStatus(200)->write($result);
});
//newly added
$app->post('/reminders/getEmailNames', function ($request, $response, $args) {
    $params = json_decode($request->getBody());
    $trans = new transaction();
    $result = $trans->getEmailNames($params);
    return $response->withStatus(200)->write($result);
});
//newly added
$app->post('/reminders/getPosition', function ($request, $response, $args) {
    $params = json_decode($request->getBody());
    $trans = new transaction();
    $result = $trans->getPosition($params);
    return $response->withStatus(200)->write($result);
});
//newly added
$app->post('/employee/getemployeelist', function ($request, $response, $args) {
    $params = json_decode($request->getBody());
    $trans = new transaction();
    $result = $trans->getOnlyEmployeeList($params);
    return $response->withStatus(200)->write($result);
});
//newly added

$app->post('/employee/getloghistory', function ($request, $response, $args) {
    $params = json_decode($request->getBody());
    $trans = new transaction();
    $result = $trans->getLogHistory($params);
    return $response->withStatus(200)->write($result);
});
//newly added

$app->post('/employee/getLQ', function ($request, $response, $args) {
    $params = json_decode($request->getBody());
    $trans = new transaction();
    $result = $trans->getLQ($params);
    return $response->withStatus(200)->write($result);
});
//newly added
$app->post('/employee/saveEmployeeNotes', function ($request, $response, $args) {
    $params = json_decode($request->getBody());
    $trans = new transaction();
    $result = $trans->saveEmployeeNotes($params);
    return $response->withStatus(200)->write($result);
});
//newly added
$app->post('/employee/saveLQ', function ($request, $response, $args) {
    $params = json_decode($request->getBody());
    $trans = new transaction();
    $result = $trans->saveLQ($params);
    return $response->withStatus(200)->write($result);
});
//newly added
$app->post('/employee/updateLQ', function ($request, $response, $args) {
    $params = json_decode($request->getBody());
    $trans = new transaction();
    $result = $trans->updateLQ($params);
    return $response->withStatus(200)->write($result);
});
//newly added
$app->post('/employee/updateEmployeeNotes', function ($request, $response, $args) {
    $params = json_decode($request->getBody());
    $trans = new transaction();
    $result = $trans->updateEmployeeNotes($params);
    return $response->withStatus(200)->write($result);
});
//newly added
$app->post('/employee/removeLog', function ($request, $response, $args) {
    $params = json_decode($request->getBody());
    $trans = new transaction();
    $result = $trans->removeLog($params);
    return $response->withStatus(200)->write($result);
});
//newly added
$app->post('/employee/removeLQ', function ($request, $response, $args) {
    $params = json_decode($request->getBody());
    $trans = new transaction();
    $result = $trans->removeLQ($params);
    return $response->withStatus(200)->write($result);
});
//newly added
$app->post('/employee/removeConf', function ($request, $response, $args) {
    $params = json_decode($request->getBody());
    $trans = new transaction();
    $result = $trans->removeConf($params);
    return $response->withStatus(200)->write($result);
});
//newly added
$app->post('/employee/updateFlag', function ($request, $response, $args) {
    $params = json_decode($request->getBody());
    $trans = new transaction();
    $result = $trans->updateFlag($params);
    return $response->withStatus(200)->write($result);
});
//newly added
$app->post('/user/systemlogs', function ($request, $response, $args) {
    $params = json_decode($request->getBody());
    $trans = new transaction();
    $result = $trans->getSystemLogs($params);
    return $response->withStatus(200)->write($result);
});
//newly added
$app->post('/admin/getPerformanceForms', function ($request, $response, $args) {
    $params = json_decode($request->getBody());
    $trans = new transaction();
    $result = $trans->getPerformanceForms($params);
    return $response->withStatus(200)->write($result);
});
//newly added
$app->post('/admin/saveForm', function ($request, $response, $args) {
    $params = json_decode($request->getBody());
    $trans = new transaction();
    $result = $trans->saveForm($params);
    return $response->withStatus(200)->write($result);
});
//newly added
$app->post('/admin/deleteForm', function ($request, $response, $args) {
    $params = json_decode($request->getBody());
    $trans = new transaction();
    $result = $trans->deleteForm($params);
    return $response->withStatus(200)->write($result);
});
//newly added
$app->post('/admin/updateForm', function ($request, $response, $args) {
    $params = json_decode($request->getBody());
    $trans = new transaction();
    $result = $trans->updateForm($params);
    return $response->withStatus(200)->write($result);
});
//newly added
$app->post('/performance/getFormReviews', function ($request, $response, $args) {
    $params = json_decode($request->getBody());
    $trans = new transaction();
    $result = $trans->getFormReviews($params);
    return $response->withStatus(200)->write($result);
});
//newly added
$app->post('/performance/saveFormReview', function ($request, $response, $args) {
    $params = json_decode($request->getBody());
    $trans = new transaction();
    $result = $trans->saveFormReview($params);
    return $response->withStatus(200)->write($result);
});
//newly added
$app->post('/performance/deleteFormReview', function ($request, $response, $args) {
    $params = json_decode($request->getBody());
    $trans = new transaction();
    $result = $trans->deleteFormReview($params);
    return $response->withStatus(200)->write($result);
});
//newly added
$app->post('/report/getScoresByYear', function ($request, $response, $args) {
    $params = json_decode($request->getBody());
    $trans = new transaction();
    $result = $trans->getScoresByYear($params);
    return $response->withStatus(200)->write($result);
});
//newly added
$app->post('/report/getScoresBySitelocation', function ($request, $response, $args) {
    $params = json_decode($request->getBody());
    $trans = new transaction();
    $result = $trans->getScoresBySitelocation($params);
    return $response->withStatus(200)->write($result);
});
//newly added
$app->post('/report/getScoresByPosition', function ($request, $response, $args) {
    $params = json_decode($request->getBody());
    $trans = new transaction();
    $result = $trans->getScoresByPosition($params);
    return $response->withStatus(200)->write($result);
});
//newly added
$app->post('/profile/getFormReviewsForView', function ($request, $response, $args) {
    $params = json_decode($request->getBody());
    $trans = new transaction();
    $result = $trans->getFormReviewsForView($params);
    return $response->withStatus(200)->write($result);
});
$app->post('/user/getglobaldata', function ($request, $response, $args) {
    $trans = new transaction();
    $result = $trans->getUserGlobalData();
    return $response->withStatus(200)->write($result);
});

$app->post('/user/getdata', function ($request, $response, $args) {
    $trans = new transaction();
    $result = $trans->getUserLoginData();
    return $response->withStatus(200)->write($result);
});

$app->post('/user/getuser', function ($request, $response, $args) {
    $params = json_decode($request->getBody());
    $trans = new transaction();
    $user_id = $params->user_id;
    $result = json_encode($trans->getUser($user_id));
    return $response->withStatus(200)->write($result);
});

$app->post('/user/save', function ($request, $response, $args) {
    $params = json_decode($request->getBody());
    $trans = new transaction();
    $result = $trans->saveUser($params);
    return $response->withStatus(200)->write($result);
});

$app->post('/user/save_child_user', function ($request, $response, $args) {
    $params = json_decode($request->getBody());
    $trans = new transaction();
    $result = $trans->saveChildUser($params);
    return $response->withStatus(200)->write($result);
});

$app->post('/user/update', function ($request, $response, $args) {
    $params = json_decode($request->getBody());
    $trans = new transaction();
    $result = $trans->updateUser($params);
    return $response->withStatus(200)->write($result);
});

$app->post('/user/search', function ($request, $response, $args) {
    $params = json_decode($request->getBody());
    $trans = new transaction();
    $result = $trans->searchUser($params);
    return $response->withStatus(200)->write($result);
});

$app->post('/user/get_employee_list', function ($request, $response, $args) {
    $params = json_decode($request->getBody());
    $trans = new transaction();
    $result = $trans->getEmployeeList($params);
    return $response->withStatus(200)->write($result);
});

$app->post('/user/activateuser', function ($request, $response, $args) {
    $params = json_decode($request->getBody());
    $trans = new transaction();
    $result = $trans->activateUser($params);
    return $response->withStatus(200)->write($result);
});

$app->post('/user/releaselock', function ($request, $response, $args) {
    $params = json_decode($request->getBody());
    $trans = new transaction();
    $result = $trans->releaseLock($params);
    return $response->withStatus(200)->write($result);
});

$app->post('/delete', function ($request, $response, $args) {
    $params = json_decode($request->getBody());
    $trans = new transaction();
    $result = $trans->delete($params);
    return $response->withStatus(200)->write($result);
});

$app->get('/user/getlogindetail/{id}', function ($request, $response, $args) {
    $route = $request->getAttribute('route');
    $id = $route->getArgument('id');
    $trans = new transaction();
    $data = $trans->getUserLoginDetail($id);
    return $response->withStatus(200)->write($data);
});

$app->get('/get/{type}/{id}', function ($request, $response, $args) {
    $route = $request->getAttribute('route');
    $id = $route->getArgument('id');
    $type = $route->getArgument('type');

    $trans = new transaction();
    $normal = array('hs','ar','sitedata','employee');
    if (in_array($type, $normal)) {
        $data = $trans->get($type, $id);
    } else {
        $data = $trans->getUserLoginDetail($id);
    }

    return $response->withStatus(200)->write($data);
});


$app->post('/course/getdata', function ($request, $response, $args) {
    $params = json_decode($request->getBody());
    $trans = new transaction();
    $result = $trans->getCourseData($params->user_id, $params);
    return $response->withStatus(200)->write($result);
    
});

$app->post('/get/sitedata', function ($request, $response, $args) {
    $params = json_decode($request->getBody());
    $trans = new transaction();
    $result = $trans->getSiteData($params);
    return $response->withStatus(200)->write($result);
    
});

$app->post('/course/start', function ($request, $response, $args) {
    $params = json_decode($request->getBody());
    $trans = new transaction();
    $result = $trans->startCourse($params);
    return $response->withStatus(200)->write($result);
    
});

$app->post('/site/savedata', function ($request, $response, $args) {
    $params = json_decode($request->getBody());
    $trans = new transaction();
    $result = $trans->saveSiteData($params);
    return $response->withStatus(200)->write($result);
    
});

$app->post('/data/search', function ($request, $response, $args) {
    $params = json_decode($request->getBody());
    $trans = new transaction();
    $result = $trans->searchSiteData($params);
    return $response->withStatus(200)->write($result);
    
});


$app->post('/course/getCourse', function ($request, $response, $args) {
    $params = json_decode($request->getBody());

    $trans = new transaction();
    $result = $trans->getCourseByID($params);
    return $response->withStatus(200)->write($result);
});
$app->post('/course/getCourseSingle', function ($request, $response, $args) {
    $params = json_decode($request->getBody());

    $trans = new transaction();
    $result = $trans->getCourse($params);
    return $response->withStatus(200)->write($result);
});

$app->post('/course/getcoursesbyuser', function ($request, $response, $args) {
    $params = json_decode($request->getBody());
    $trans = new transaction();
    $result = $trans->getCourseByUser($params);
    return $response->withStatus(200)->write($result);
});

$app->post('/course/getCate', function ($request, $response, $args) {
    $params = json_decode($request->getBody());

    $trans = new transaction();
    $result = $trans->getCourseCate();
    return $response->withStatus(200)->write($result);
    
});

$app->post('/course/activatecourse', function ($request, $response, $args) {
    $params = json_decode($request->getBody());
    $trans = new transaction();
    $result = $trans->activateCourse($params);
    return $response->withStatus(200)->write($result);
});

$app->post('/course/saveCourse', function ($request, $response, $args) {
    $params = json_decode($request->getBody());
    $trans = new transaction();
    $result = $trans->saveCourse($params);
    return $response->withStatus(200)->write($result);
});

$app->post('/course/addCourse', function ($request, $response, $args) {
    $params = json_decode($request->getBody());
    $trans = new transaction();
    $result = $trans->addCourse($params);
    return $response->withStatus(200)->write($result);
});

$app->post('/course/addCoursefile', function ($request, $response, $args) {
    $params = $_POST;
    $trans = new transaction();
    $result = $trans->addCoursefile($params);
    return $response->withStatus(200)->write($result);
});

$app->post('/course/editCourse', function ($request, $response, $args) {
    $params = $_POST;
    $trans = new transaction();
    $result = $trans->editCourse($params);
    return $response->withStatus(200)->write($result);
});

$app->post('/course/delCourse', function ($request, $response, $args) {
    $params = json_decode($request->getBody()); //print_r($params); exit();
    $trans = new transaction();
    $result = $trans->delCourse($params);
    return $response->withStatus(200)->write($result);
});

$app->post('/course/searchCourse', function ($request, $response, $args) {
    $params = json_decode($request->getBody());
    $trans = new transaction();
    $result = $trans->searchCourse($params);
    return $response->withStatus(200)->write($result);
});

$app->post('/course/allocCourse', function ($request, $response, $args) {
    $params = json_decode($request->getBody());
    $trans = new transaction();
    $result = $trans->allocCourse($params);
    return $response->withStatus(200)->write($result);
});

$app->post('/course/updateAllocCourse', function ($request, $response, $args) {
    $params = json_decode($request->getBody());
    $trans = new transaction();
    $result = $trans->updateAllocCourse($params);
    return $response->withStatus(200)->write($result);
});

$app->post('/course/getAllocCourses', function ($request, $response, $args) {
    $params = json_decode($request->getBody());
    $trans = new transaction();
    $result = $trans->getAllocCourseData($params->user_id);
    return $response->withStatus(200)->write($result);
});

$app->post('/course/submitanswer', function ($request, $response, $args) {
    $params = json_decode($request->getBody());
    $trans = new transaction();
    $result = $trans->saveCourseAnswer($params);
    return $response->withStatus(200)->write($result);
});

$app->post('/course/delAllocCourse', function ($request, $response, $args) {

    $params = json_decode($request->getBody()); //print_r($params); exit();
    $trans = new transaction();
    $result = $trans->delAllocCourse($params);
    return $response->withStatus(200)->write($result);
});

$app->post('/media/remove', function ($request, $response, $args) {

    $params = json_decode($request->getBody()); //print_r($params); exit();
    $trans = new transaction();
    $result = $trans->removeFile($params);
    return $response->withStatus(200)->write($result);
});


$app->post('/course/getAllocCourseById', function ($request, $response, $args) {
    $params = json_decode($request->getBody());

    $trans = new transaction();
    $result = $trans->getAllocCourseByID($params);
    return $response->withStatus(200)->write($result);

});

$app->post('/hs/getdata', function ($request, $response, $args) {
    $params = json_decode($request->getBody());

    $trans = new transaction();
    $result = $trans->getHSData($params);
    return $response->withStatus(200)->write($result);

});

$app->post('/hs/savehs', function ($request, $response, $args) {
    $params = json_decode($request->getBody());

    $trans = new transaction();
    $result = $trans->saveHS($params);
    return $response->withStatus(200)->write($result);

});

$app->post('/assetregister/getdata', function ($request, $response, $args) {
    $params = json_decode($request->getBody());
    $trans = new register();
    $result = $trans->getAssetRegisterData($params);
    return $response->withStatus(200)->write($result);
});

$app->post('/assetregister/save', function ($request, $response, $args) {
    $params = json_decode($request->getBody());
    $trans = new register();
    $result = $trans->saveAssetRegister($params);
    return $response->withStatus(200)->write($result);
});

$app->post('/injuryregister/getdata', function ($request, $response, $args) {
    $params = json_decode($request->getBody());
    $trans = new injuryregister();
    $result = $trans->getInjuryData($params);
    return $response->withStatus(200)->write($result);
});

$app->post('/injuryregister/save', function ($request, $response, $args) {
    $params = json_decode($request->getBody());
    $trans = new injuryregister();
    $result = $trans->saveInjury($params);
    return $response->withStatus(200)->write($result);
});

$app->get('/injuryregister/get/{id}', function ($request, $response, $args) {
    $route = $request->getAttribute('route');
    $id = $route->getArgument('id');
    $trans = new injuryregister();
    $data = $trans->getInjury($id);
    return $response->withStatus(200)->write($data);
});
$app->post('/course/save', function ($request, $response, $args) {
    $params = json_decode($request->getBody());
    $trans = new course();
    $result = $trans->saveCourse($params);
    return $response->withStatus(200)->write($result);
});

$app->post('/course/savefile', function ($request, $response, $args) {
    $params = json_decode($request->getBody());
    $trans = new course();
    $result = $trans->saveFile($params);
    return $response->withStatus(200)->write($result);
});

$app->post('/question/remove/file', function ($request, $response, $args) {
    $params = json_decode($request->getBody());
    $trans = new course();
    $result = $trans->removeFile($params);
    return $response->withStatus(200)->write($result);
});


$app->post('/course/detail/get', function ($request, $response, $args) {
    $params = json_decode($request->getBody());
    $trans = new course();
    $result = $trans->getCourse($params);
    return $response->withStatus(200)->write($result);
});


// Examples
/************************************************************************
$app->post('/order/getorders', function ($request, $response, $args) {
    $params = json_decode($request->getBody());

    $order = new order();
    $data = $order->getOrders($params->status);
    return $response->withStatus(200)->write($data);
});

$app->get('/order/getorder/{orderno}', function ($request, $response, $args) {
    $route = $request->getAttribute('route');
    $orderNo = $route->getArgument('orderno');

    $order = new order();
    $data = $order->getOrder($orderNo);
    return $response->withStatus(200)->write($data);
});
*/
