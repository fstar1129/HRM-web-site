<?php
ini_set('display_errors', 'On');
error_reporting(E_ALL | E_STRICT);


if (!class_exists('db')) {

    require('db.class.php');

}

require('email.class.php');



if( ! ini_get('date.timezone') )

{

    date_default_timezone_set('GMT');

}



class transaction {



    var $lockoutLengthMins = 15;

    var $database = '';

    var $user = array();

    // var $server_url = "https://www.hrmaster.com.au";

    var $server_url = "http://localhost:8011";



    function __construct() {



    }

    public function initialDataDprt($userId) {
        $d      = new db('employee_work');

        $sql = "SELECT
                    data.id,
                    data.display_text AS department
                FROM
                (SELECT
                    department
                FROM 
                    (SELECT department FROM employee_work INNER JOIN 
                    (SELECT id FROM employee WHERE deleted = 0 AND account_id = :uid) t_employee 
                    ON employee_work.employee_id = t_employee.id ) t1
                GROUP BY department) t_department
                INNER JOIN data
                ON data.id = t_department.department";
        $d->select(false, false, $sql, array('uid' => $userId));

        if ($d->numRows == 0) {

            return ;

        }
        $i=0;
        $temp_id = null;
        while ($d->getRow()) {
          
            if($temp_id == $d->id)
            continue;
            $data[$i] = array('id' => $d->id, 'department' => $d->department);
            $temp_id = $d->id;
            $i++;
        }

         echo json_encode(array('res' => $data));
      }
      
      public function initialDataLctn($userId) {
        $d      = new db('employee_work');

        $sql = "SELECT
                    data.id,
                    data.display_text AS location
                FROM
                (SELECT
                    site_location
                FROM 
                    (SELECT site_location FROM employee_work INNER JOIN 
                    (SELECT id FROM employee WHERE deleted = 0 AND account_id = :uid) t_employee 
                    ON employee_work.employee_id = t_employee.id ) t1
                GROUP BY site_location) t_sitelocation
                INNER JOIN data
                ON data.id = t_sitelocation.site_location";

        $d->select(false, false, $sql, array('uid' => $userId));

        if ($d->numRows == 0) {

            return ;

        }
        $i=0;
        $temp_id = null;
        while ($d->getRow()) {
            if($temp_id == $d->id)
            continue;
            $data[$i] = array('id' => $d->id, 'location' => $d->location);
            $temp_id = $d->id;
            $i++;
        }

         echo json_encode(array('res' => $data));
  
      }

      public function initialDataYr($userId) {
        $d      = new db('employee_work');

        $sql    = "SELECT YEAR(employee_work.workdate_added) AS year 
        FROM employee_work INNER JOIN (SELECT id FROM employee e WHERE deleted = 0 AND account_id =  :uid) employee_t ON employee_work.employee_id = employee_t.id 
        GROUP BY YEAR(employee_work.workdate_added) ORDER BY year";

        $d->select(false, false, $sql, array('uid' => $userId));

        if ($d->numRows == 0) {

            return ;

        }
        $i=0;
        while ($d->getRow()) {
            
            $data[$i] = array('year' => $d->year);
            $i++;
        }

         echo json_encode(array('res' => $data));
  
      }
      
      public function initialDataEply($userId) {
        $d      = new db('employee');

        $sql    = "SELECT employee.id,firstname ,lastname FROM employee RIGHT JOIN (SELECT * FROM employee_work INNER JOIN (SELECT id FROM employee e 

        WHERE deleted = 0

          AND account_id = :uid) t ON employee_work.employee_id = t.id ) t1 ON employee.id = t1.employee_id ORDER BY id";

        $d->select(false, false, $sql, array('uid' => $userId));

        if ($d->numRows == 0) {

            return ;

        }

        $i=0;
        $temp_id = null;
        while ($d->getRow()) {
          
            if($temp_id == $d->id)
            continue;
            $data[$i] = array('id' => $d->id, 'employee' => $d->firstname.' '.$d->lastname);
            $temp_id = $d->id;
            $i++;
        }

         echo json_encode(array('res' => $data));
      }
     
      public function initialDataUserCount($userId) {
       
        $d      = new db('employee_work');
        $sql    = "SELECT	
                        t_year.year AS myYear,
                        Ccount
                    FROM 
                        (SELECT YEAR(employee_work.workdate_added) AS year FROM employee_work GROUP BY YEAR(employee_work.workdate_added)) t_year LEFT JOIN	 
                        ( 
                        SELECT
                            t1.year,
                            COUNT(employee_id) AS Ccount 
                        FROM 
                            (SELECT YEAR(employee_work.workdate_added) AS year, employee_id FROM employee_work INNER JOIN 
                            (SELECT id FROM employee e WHERE deleted = 0 AND account_id = :uid) employee_t ON employee_work.employee_id = employee_t.id ) t1 GROUP BY t1.year
                        ) t1 ON t_year.year = t1.year
                    ORDER BY t_year.year";

        $d->select(false, false, $sql, array('uid' => $userId));

        if ($d->numRows == 0) {
    
            return;
    
        }
        $i = 0;
        while ($d->getRow()) {
            
            $data[$i] = array('year' =>$d->myYear,'count'=>$d->Ccount);
            $i++;
    
        }
         echo json_encode(array('res' => $data));
  
      }
    
    public function departmentBarCalc($get,$userId) {

        $d      = new db('employee_work');
        $sql    = "SELECT	
                        t_year.year AS Cyear,
                        Ccount
                    FROM 
                        (SELECT YEAR(employee_work.workdate_added) AS year FROM employee_work GROUP BY YEAR(employee_work.workdate_added)) t_year LEFT JOIN
                        (
                        SELECT
                            t1.year,
                            COUNT(t1.department) AS Ccount         
                        FROM 
                            (SELECT YEAR(employee_work.workdate_added) AS year, department, employee_id FROM employee_work INNER JOIN 
                            (SELECT id FROM employee e WHERE deleted = 0 AND account_id = :uid) employee_t ON employee_work.employee_id = employee_t.id) t1  WHERE t1.department = :id GROUP BY t1.year
                        ) t1 ON t_year.year = t1.year
                    ORDER BY t_year.year";
            
        $d->select(false, false, $sql, array('id' => $get,'uid' => $userId));

        if ($d->numRows == 0) {
    
            return;
    
        }
        $i = 0;
        while ($d->getRow()) {
            
            $data[$i] = array('year' =>$d->Cyear,'count'=>$d->Ccount);
            $i++;
    
        }
         echo json_encode(array('res' => $data));
    }

    
    public function locationBarCalc($get,$userId) {

        $d      = new db('employee_work');
        $sql    = "SELECT	
                        t_year.year AS Cyear,
                        Ccount
                    FROM 
                        (SELECT YEAR(employee_work.workdate_added) AS year FROM employee_work GROUP BY YEAR(employee_work.workdate_added)) t_year LEFT JOIN	
                        (	
                        SELECT 
                            t1.year, 
                            COUNT(t1.site_location) AS Ccount 
                        FROM 
                            (SELECT YEAR(employee_work.workdate_added) AS year, site_location, employee_id FROM employee_work INNER JOIN 
                            (SELECT id FROM employee e WHERE deleted = 0 AND account_id = :uid) employee_t ON employee_work.employee_id = employee_t.id) t1 WHERE t1.site_location = :id GROUP BY t1.year
                        ) t1 ON t_year.year = t1.year
                    ORDER BY t_year.year";
            
        $d->select(false, false, $sql, array('id' => $get,'uid' => $userId));

        if ($d->numRows == 0) {
    
            return;
    
        }
        $i = 0;
        while ($d->getRow()) {
            
            $data[$i] = array('year' =>$d->Cyear,'count'=>$d->Ccount);
            $i++;
    
        }
         echo json_encode(array('res' => $data));
    }

    public function departmentPieCalc($get,$userId) {

        $d      = new db('employee_work');
        $sql    = "SELECT 
            t2.id,
            data.display_text AS Cname 
        FROM 
            data INNER JOIN 
            (SELECT 
                t1.department AS id 
            FROM 
                (SELECT * 
                FROM 
                    employee_work INNER JOIN 
                    (SELECT id FROM employee e WHERE deleted = 0 AND account_id = :uid) employee_t ON employee_work.employee_id = employee_t.id ) t1 
            WHERE 
                YEAR(t1.workdate_added) = :year) t2 ON data.id = t2.id
            ORDER BY t2.id";

        $d->select(false, false, $sql, array('year' => $get,'uid' => $userId));

        if ($d->numRows == 0) {

            return;

        }
        $i = 0;
        while ($d->getRow()) {
            
            $data[$i] = array('name' =>$d->Cname);
            $i++;

        }
         echo json_encode(array('res' => $data));
  
      }


      public function locationPieCalc($get,$userId){

        $d      = new db('employee_work');
        $sql    = "SELECT 
            t2.id,
            data.display_text AS Cname 
        FROM 
            data INNER JOIN 
            (SELECT 
                t1.site_location AS id 
            FROM 
                (SELECT * FROM employee_work INNER JOIN 
                (SELECT id FROM employee e WHERE deleted = 0 AND account_id = :uid) employee_t ON employee_work.employee_id = employee_t.id ) t1 
            WHERE YEAR(t1.workdate_added) = :year) t2 ON data.id = t2.id
        ORDER BY t2.id";

        $d->select(false, false, $sql, array('year' => $get,'uid' => $userId));

        if ($d->numRows == 0) {

            return;
        }
        $i = 0;
        while ($d->getRow()) {
            
            $data[$i] = array('id' =>$d->id, 'name' =>$d->Cname);
            $i++;

        }
         echo json_encode(array('res' => $data));

      }

      public function departmentCompensationCalc($get,$userId){
       
        $d      = new db('employee_work');
        $sql    = "SELECT 
            t2.Cname,
            SUM(annual_rate) AS salary,
            SUM(bonus) AS bonus,
            SUM(overtime) AS overtime,
            SUM(commission) AS commission 
        FROM (
            SELECT 
                data.display_text AS Cname,
                t1.* 
            FROM 
                data INNER JOIN 
                (SELECT * FROM employee_work INNER JOIN 
                (SELECT id FROM employee e WHERE deleted = 0 AND account_id = :uid) employee_t ON employee_work.employee_id = employee_t.id) t1 ON data.id = t1.department
            ) t2 
        WHERE YEAR(t2.workdate_added) = :year GROUP BY Cname";

        $d->select(false, false, $sql, array('year' => $get,'uid' => $userId));

        if ($d->numRows == 0) {

            return;
        }
        $i = 0;
        while ($d->getRow()) {
            
            $data[$i] = array('name' =>$d->Cname, 'salary' =>$d->salary,'bonus'=>$d->bonus,'overtime'=>$d->overtime,'commission'=>$d->commission);
            $i++;

        }
         echo json_encode(array('res' => $data));

      }
     
      
      public function locationCompensationCalc($get,$userId){

        $d      = new db('employee_work');
        $sql    = "SELECT 
            t2.Cname,
            SUM(annual_rate) AS salary,
            SUM(bonus) AS bonus,
            SUM(overtime) AS overtime,
            SUM(commission) AS commission 
        FROM (
            SELECT 
                data.display_text AS Cname,
                t1.* 
            FROM 
                data INNER JOIN 
                (SELECT * FROM employee_work INNER JOIN 
                (SELECT id FROM employee e WHERE deleted = 0 AND account_id = :uid) employee_t ON employee_work.employee_id = employee_t.id) t1 ON data.id = t1.site_location
            ) t2 
        WHERE YEAR(t2.workdate_added) = :year GROUP BY Cname";

        $d->select(false, false, $sql, array('year' => $get,'uid' => $userId));

        if ($d->numRows == 0) {

            return;
        }
        $i = 0;
        while ($d->getRow()) {
            
            $data[$i] = array('name' =>$d->Cname, 'salary' =>$d->salary,'bonus'=>$d->bonus,'overtime'=>$d->overtime,'commission'=>$d->commission);
            $i++;

        }
         echo json_encode(array('res' => $data));

      }

      public function baseSalaryCalc($get,$userId){

        $d      = new db('employee_work');
        $sql    = "SELECT 
            annual_rate 
        FROM 
            (SELECT * FROM employee_work INNER JOIN 
            (SELECT id FROM employee e WHERE deleted = 0 AND account_id = :uid) employee_t ON employee_work.employee_id = employee_t.id ) t1 
        WHERE 
            YEAR(t1.workdate_added) = :year ORDER BY annual_rate";

        $d->select(false, false, $sql, array('year' => $get,'uid' => $userId));

        if ($d->numRows == 0) {

            return;
        }
        $i = 0;
        while ($d->getRow()) {
            $data[$i] = $d->annual_rate;
            $i++;
        }
         $counts = $this->compareSize($data);
         $label = ['>$10,000','$90,000-$100,000','$80,000-$90,000','$70,000-$80,000','$60,000-$70,000',
         '$50,000-$60,000','$40,000-$50,000','$30,000-$40,000','<$30,000'];
         $result = array('label'=>$label,'data'=>$counts);
        echo json_encode(array('res' => $result ));

      }

      public function totalCompensationCalc($get,$userId){

        $d      = new db('employee_work');
        $sql    = "SELECT	
                        t_year.year,
                        t1.annual_rate,
                        t1.overtime,
                        t1.bonus,
                        t1.commission
                    FROM 
                        (SELECT YEAR(employee_work.workdate_added) AS year FROM employee_work GROUP BY YEAR(employee_work.workdate_added)) t_year LEFT JOIN		
                        (	
                        SELECT 
                            YEAR(t1.workdate_added) AS year,
                            SUM(annual_rate) AS annual_rate,
                            SUM(overtime) AS overtime,
                            SUM(bonus) AS bonus,
                            SUM(commission) AS commission 
                        FROM 
                            (SELECT * FROM employee_work INNER JOIN 
                            (SELECT id FROM employee e WHERE deleted = 0 AND account_id = :uid) employee_t ON employee_work.employee_id = employee_t.id ) t1 
                        WHERE employee_id = :id
                        ) t1 ON t_year.year = t1.year
                    ORDER BY t_year.year";

        $d->select(false, false, $sql, array('id' => $get,'uid' => $userId));

        if ($d->numRows == 0) {

            return;
        }
        $i = 0;
        $total = 0;
        while ($d->getRow()) {
            $total = $d->annual_rate+$d->overtime+$d->bonus+$d->commission;
            $data[$i] = array('year' =>$d->year, 'total' =>$total);
            $i++;
            $total = 0;
        }
         echo json_encode(array('res' => $data));

      }
      
      public function compareSize($get){
        $value = array();
        for($i = 0; $i < 9; $i++){
            $value[$i] = 0;
        }
       for($i = 0; $i < count($get); $i++ ){
        if($get[$i] < 30000)
        {
            $value[8]++;
            continue;
        } 
        if($get[$i] >= 30000 && $get[$i] < 40000)
        {
            $value[7]++;
            continue;
        } if($get[$i] >= 4000 && $get[$i] < 50000)
        {
            $value[6]++;
            continue;
        } if($get[$i] >= 5000 && $get[$i] < 60000)
        {
            $value[5]++;
            continue;
        } if($get[$i] >= 6000 && $get[$i] < 70000)
        {
            $value[4]++;
            continue;
        } if($get[$i] >= 7000 && $get[$i] < 80000)
        {
            $value[3]++;
            continue;
        } if($get[$i] >= 8000 && $get[$i] < 90000)
        {
            $value[2]++;
            continue;
        } if($get[$i] >= 9000 && $get[$i] < 100000)
        {
            $value[1]++;
            continue;
        } if($get[$i] >= 10000)
        {
            $value[0]++;
            continue;
        } 
       }
       return $value;
      }
      public function selectedEmplyCalc($id,$year,$userId) {

        $d      = new db('employee_work');

        $sql    = "SELECT
        t1.*,
        (SELECT
            SUM(bonus) + SUM(overtime) + SUM(commission) + SUM(annual_rate) AS total_comp
        FROM
            employee_work
        WHERE
            employee_id = :id AND YEAR(workdate_added) = :year) AS 'Total Comp.',
        (SELECT	
            firstname
        FROM
            employee
        WHERE
            deleted = 0 AND id = :id) AS firstname,
        (SELECT	
            lastname
        FROM
            employee
        WHERE
            deleted = 0 AND id = :id) AS lastname
    FROM
    (SELECT
        start_date AS 'Hire Date',
        end_date AS 'Term. Date',
        YEAR(workdate_added) AS 'Year',
        annual_rate,
        workdate_added,
        bonus AS 'Bonus',
        overtime AS 'Overtime',
        commission AS 'Commission',
        annual_leave_owing AS 'Annual Leave',
        (
            CASE 
                WHEN employment_type_id = 341 THEN personal_leave_taken / 7.6
                WHEN employment_type_id = 342 THEN personal_leave_taken / hours_week * days_week
                ELSE ''
            END
        ) AS 'Sick Days',
        (SELECT display_text FROM data WHERE data.id = employee_work.site_location) AS 'Location',
        (SELECT display_text FROM data WHERE data.id = employee_work.department) AS 'Department',
        (SELECT display_text FROM data WHERE data.id = employee_work.employment_type_id) AS 'Empl.Type'
    FROM
        employee_work
    WHERE
        employee_id = :id AND YEAR(workdate_added) = :year) AS t1
        
    INNER JOIN
    
    (SELECT
        MAX(workdate_added) max_workdate_added
    FROM
        employee_work
    WHERE
        employee_id = :id AND YEAR(workdate_added) = :year
    GROUP BY 
        employee_id) t2
    ON t1.workdate_added = t2.max_workdate_added
        ";

        $d->select(false, false, $sql, array('id'=>$id,'year'=>$year,'uid' => $userId));

        if ($d->numRows == 0) {

            return;

        }
        $i=0;
        while ($d->getRow()) {
            
            $data[$i] = array('employee_data' => $d);
            $i++;
        }

         echo json_encode(array('res' => $data[0])); 
  
      }

      public function totalSalaryCalc($get,$userId) {

        $d      = new db('employee_work');

        $sql    = "SELECT
            SUM(annual_rate) AS 'Total Salaries',
            SUM(bonus) AS 'Total Bonuses',
            SUM(overtime) AS 'Total Overtimes',
            SUM(commission) AS 'Total Commissions',
            SUM(annual_rate) + SUM(bonus) + SUM(overtime) + SUM(commission) AS 'Total Compensations',
            SUM(CASE 
                WHEN employment_type_id = 341 THEN personal_leave_taken / 7.6
                WHEN employment_type_id = 342 THEN personal_leave_taken / hours_week * days_week
                ELSE 0
            END) AS 'Total Sick Days'
        FROM
        (SELECT * FROM employee_work WHERE YEAR(workdate_added) = :year) t1 
        INNER JOIN
        (SELECT id FROM employee WHERE deleted = 0 AND account_id = :uid) t2
        ON t1.employee_id = t2.id";

        $d->select(false, false, $sql, array('year'=>$get,'uid' => $userId));
        if ($d->numRows == 0) {

            return ;

        }
        $i=0;
        while ($d->getRow()) {
            
            $data[$i] = array('total_data' => $d);
            $i++;
        }

         echo json_encode(array('res' => $data[0])); 
  
      }
      

    public function doLogin($post) {



        $result = $this->checkLogin($post->username, $post->password);

        echo ($result === false) ? json_encode(array('success' => "0")) : $result;

    }



    public function checkLogin($login, $password) { 


        if (!$login || !$password) {

            return false;

        }



        $data   = array();

        $l      = new db('user');

        $l->select("username = :login AND password = :pw AND active = :e AND deleted = :del",false, false, array('login' => $login, 'pw' => md5($password), 'e' => 1, 'del' => 0));



        if ($l->numRows == 0) {  // ie. wrong password, inactive or deleted

            $l->select("username = :login",false, false, array('login' => $login));

            $l->getRow();
            //newly added
            if(!isset($l->active)){
                return json_encode(array('success' => 0, 'message' => "This username is not found in our records."));
            }
            if ($l->active == 0 || $l->deleted == 1) {

                return json_encode(array('success' => 0, 'message' => "This username is not found in our records."));

            } else {

                $loginAttempts = $l->login_attempts + 1;

                if ($loginAttempts > 3) {

                    $nextLogin = mktime(date('H'),date('i') + $this->lockoutLengthMins, date('s'),date('m'),date('d'),date('Y'));

                    $l->update(array('login_attempts' => 0, 'can_next_login' => 0), "id = :id", false, array('login_attempts' => $loginAttempts, 'can_next_login' => $nextLogin, 'id' => $l->id));

                } else {

                    $l->update(array('login_attempts' => 0), "id = :id", false, array('login_attempts' => $loginAttempts, 'id' => $l->id));

                }



            }



            if ($l->can_next_login > 0) {

                $currTime = strtotime('now');

                if ($currTime < $l->can_next_login) {

                    $message = "Your account has been temporarily locked. Please contact HRM or alternatively, your account will be unlocked at ".date('H:i', $l->can_next_login)." on the ".date('d/m/Y', $l->can_next_login).".";

                    return json_encode(array('success' => 0, 'message' => $message));

                }

            }

            return json_encode(array('success' => 0, 'message' => "Invalid username or password"));

        }

        $l->getRow();

        if ($l->can_next_login > 0) {

            if (strtotime('now') < $l->can_next_login) {

                $message = "Your account has been temporarily locked. Please contact HRM or alternatively, your account will be unlocked at ".date('H:i', $l->can_next_login)." on the ".date('d/m/Y', $l->can_next_login).".";

                return json_encode(array('success' => 0, 'message' => $message));

            }

        }



        $numLogins = $l->total_logins + 1;

        $lastLogin = date('Y-m-d H:i:s');

        $l->update(array('total_logins' => 0, 'last_login' => $lastLogin, 'can_next_login' => 0, 'login_attempts' => 0), "id = :id", false, array('total_logins' => $numLogins, 'last_login' => $lastLogin, 'can_next_login' => 0, 'id' => $l->id, 'login_attempts' => 0));



        $perms = $this->_getPermissions($l->usertype_id, $l->id);



        return json_encode(array('userdetail' => $l->row, 'success' => "1", 'permissions' => $perms));

    }



    private function _getPermissions($usertype, $user_id) {

        $data   = array();

        $p      = new db('permissions');

        $sql    = "SELECT p.*, p.module_id AS MID,

                    (SELECT controller FROM modules WHERE id = MID) AS 'controller'

                     FROM permissions p

                    WHERE usertype_id = :u

                       OR user_id = :uid";

        $p->select(false, false, $sql, array('u' => $usertype, 'uid' => $user_id));

        if ($p->numRows == 0) {

            return array();

        }

        while ($p->getRow()) {

            $data[$p->module_id] = array('r' => $p->_read, 'w' => $p->_write, 'd' => $p->_delete, 'c' => $p->controller);

        }

        return $data;

    }



    public function getEmployees($post, $returnData=false) {

        $data = array();

        $e      = new db('user');
        /*
        $sql = "SELECT *, CONCAT(firstname,' ',lastname) as 'name', state as STATE, e.id as EID, 'employee' AS `table`,
                (SELECT display_text FROM data WHERE id = STATE) as 'StateName',
                IF(gender='M','Male','Female') as 'gender',
                DATE_FORMAT(dob, '%d-%m-%Y') as 'dob',
                DATE_FORMAT(visaexpiry, '%d-%m-%Y') as 'visaexpiry'
                 FROM employee e
                WHERE deleted = :del
                  AND account_id = :aid";
        */
        $sql = "SELECT *, CONCAT(firstname,' ',lastname) as 'name', state as STATE, u.id as UID, 'user' AS `table`,
                (SELECT display_text FROM data WHERE id = STATE) as 'StateName',
                IF(gender='M','Male','Female') as 'gender',
                DATE_FORMAT(dob, '%d-%m-%Y') as 'dob',
                DATE_FORMAT(visaexpiry, '%d-%m-%Y') as 'visaexpiry'
                 FROM user u
                WHERE deleted = :del
                  AND account_id = :aid";        
        $e->select(false,false, $sql, array('del' => 0, 'aid' => $post['account_id']));

        while ($e->getRow()) {
            array_push($data,$e->row); 
        }
        /*
        $data1 = array();
        $e = new db("data");
        foreach($data as $row){
            $sql = "SELECT data.display_text FROM data INNER JOIN employee_work ON employee_work.site_location = data.id WHERE employee_work.employee_id = " . $row['id'];
            $e->select(false,false, $sql);

            $e->getRow();
            $row["StateName"] = $e->row["display_text"];
            array_push($data1, $row);
        }
*/
        if ($returnData) {
            return $data;
        }

        echo json_encode($data);

    }



    public function getData($type, $account=0) {

        $data   = array();
        $d      = new db('data');
        $d->select("type = :type AND account_id IN (0, :account)", 'display_text ASC', false, array('type' => $type, 'account' => $account));
        while ($d->getRow()) {
            array_push($data, $d->row);
        }

        return $data;

    }

    public function getFlag(){
        $data = array();

        $d = new db('flags');

        $sql = "SELECT * FROM flags";
        $d->select(false, 'id ASC', $sql);

        while ($d->getRow()) {

            array_push($data, $d->row);

        }

        return $data;
    }

    public function getEmployeeData($post) {
        $data = array();
        $data['employees'] = $this->getEmployees(array('account_id' => $post->currUser->account_id), true);
        $data['states'] = $this->getData('state');
        $data['countries'] = $this->getData('country');       
        $data['persontype'] = $this->getData('persontitle'); 
        //$data['workstate'] = $this->getData('state', $post->currUser->account_id); 
        $data['positions'] = $this->getData('position', $post->currUser->account_id);
        $data['levels'] = $this->getData('level', $post->currUser->account_id);
        $data['departments'] = $this->getData('department', $post->currUser->account_id);
        $data['sitelocation'] = $this->getData('sitelocation', $post->currUser->account_id);    
        $data['emptype'] = $this->getData('emptype'); 
        $data['hr_issue'] = $this->getData('hr_issue', $post->currUser->account_id);
        $data['hr_action'] = $this->getData('hr_action', $post->currUser->account_id);
        $data['license_name'] = $this->getData('license_name', $post->currUser->account_id);
        $data['license_type'] = $this->getData('license_type', $post->currUser->account_id);
        $data['flag'] = $this->getFlag();

        echo json_encode($data);
    }



    public function getEmailFromHash($post) {

        $u      = new db('password_reset');

        $u->select("hash = :hash",false, false, array('hash' => $post->hash));

        if ($u->numRows == 0) {

            echo json_encode(array('success' => 0, 'message' => 'Invalid hash key for password reset'));

            return;

        }

        $u->getRow();



        $expire = date_create($u->date_created);

        date_add($expire, date_interval_create_from_date_string('30 minutes'));

        $expireAfter = strtotime(date_format($expire, 'Y-m-d H:i:s'));



        if (strtotime('now') > $expireAfter) {

            echo json_encode(array('success' => 0, 'message' => 'Link to reset password has expired.'));

            return;

        }



        echo json_encode(array('success' => 1, 'message' => '', 'email' => $u->email, 'username' => $u->username));

    }



    public function resetPassword($post) {

        $u      = new db('user');

        $u->update(array('password' => md5($post->password)),"username = :u", false, array('password' => md5($post->password), 'u' => $post->username));

        if ($u->rowsAffected > 0) {

            echo json_encode(array('success' => 1, 'message' => 'Your password has reset successfully.'));

        } else {

            echo json_encode(array('success' => 0, 'message' => 'Your password could not be reset.'));

        }

    }
    //newly added
    public function updateFlag($post){

        $e = new db('employee_notes');

        $today = date("Y-m-d H:i:s");
        $emp_notes['updated_time'] = $today;

        $sql = "SELECT * FROM flags";
        $f = new db("flags");
        $f->select(false, false, $sql);
        $flags = array();
        while ($f->getRow()) {

            array_push($flags, $f->row['display_text']);

        }

        $e->select("id = :id", false, false, array('id' => $post->log_id));
        $rows = array();
        while ($e->getRow()) {

            array_push($rows, $e->row);

        }
        $row = array();
        $row = $rows[0];
        $data1 = array();
        $data1['who'] = $row['entered_employee_name'];
        $data1['what'] = "Removed a ". $flags[$row['flag_id'] - 1] ." flag from ". $row['employee_firstname'] ." ". $row['employee_lastname'] ." file.";
        $date1['time'] = $today;
        $data1['account_id'] = $row['entered_employee_id'];
        $sl = new db("system_logs");
        $sl->insert($data1);
        $e->update(array('flag_id' => 0), "id = :id", 1, array('flag_id' => 0, 'id' => $post->log_id));
    }



    public function forgotPassword($post) {



        $u      = new db('user');

        $u->select("email = :email AND active = :e AND deleted = :del",false, false, array('email' => $post->email, 'e' => 1, 'del' => 0));

        if ($u->numRows == 0) {

            echo json_encode(array('success' => 0, 'message' => 'The email address does not match our records. Please try again or email support@hrmaster.com.au'));

            return;

        }

        $u->getRow();



        $hashStr = $post->email.time();

        $hash = hash('md5', $hashStr);



        $data = array();

        $data['email'] = $post->email;

        $data['hash'] = $hash;

        $data['username'] = $u->username;



        $pr = new db('password_reset');

        $pr->insert($data);



        // Send email to the user



        $m= new email(); // create the mail

        $m->From("HR Master Support <support@hrmaster.com.au>");

        $m->To($post->email);

        $m->Subject("Forgotten password reset");



        $message = "Hello ".$u->firstname.' '.$u->lastname.",<br><br>You recently requested to reset your password for your HR Master account. In order to do so, please <a href='http://hrmaster.com.au/?#/resetpassword/$hash'>Click Here</a> and you will be redirected to HR Masters \"change password\" page.<br><br>

        If you did not request a password reset, please ignore this email or contact us and let us know. This password reset is valid for the next 30 minutes at which time, it will expire.<br><br>

        Kind regards <br>

        HRM Technical Support";

        //$message = "<a href='https://hrmaster.com.au/?#/resetpassword/$hash'>Click to reset password</a>";

        $m->Body($message);

        $m->Priority(3) ;

        $m->Send();	// send the mail

        echo json_encode(array('success' => 1, 'message' => 'You will receive an email shortly with instructions on how to reset your password'));





    }

    

    public function searchSiteData($post) {

        $data = array();

        $db = new db('data');

        if (isset($post->account_id)) {

            $db->select('display_text LIKE :dt AND type = :type AND account_id = :aid', 'display_text ASC', false, array('dt' => '%'.$post->keyword.'%',  'type' => $post->type, 'aid' => $post->account_id));

        } else {

            $db->select('display_text LIKE :dt AND type = :type', 'display_text ASC', false, array('dt' => '%'.$post->keyword.'%',  'type' => $post->type));

        }

        while ($db->getRow()) {

            array_push($data, $db->row);

        }

        echo json_encode(array('data' => $data));

    }



    public function searchUser($post, $returnJson=true) {

        $keyword = $post->keyword;

        $user_table = new db('user');

        $data = array();

        $sql = "SELECT * FROM user WHERE account_id = :aid AND (username LIKE :kw OR firstname LIKE :kw OR lastname LIKE :kw) ";

        

        if (isset($post->usertype) && 1==2) { // Make this fail in case it's changed later

            $sql .= " AND usertype_id = :ut";

            $user_table->select(false,false, $sql, array('kw' => '%'.$keyword.'%', 'ut' => $post->usertype, 'aid' => $post->userData->account_id));            

        } else {

            $user_table->select(false,false, $sql, array('kw' => '%'.$keyword.'%', 'aid' => $post->userData->account_id));

        }



        while ($user_table->getRow()) {

            array_push($data, $user_table->row);

        }

        if ($returnJson) {

            echo json_encode(array('users' => $data));

        } else {

            return $data;

        }

    }
    //newly added
    public function getEmailNames($post, $returnJson=true) {
        $e = new db('email_name');
        $sql = "SELECT * FROM email_name";
        $e->select(false, false, $sql);
        $data = array();
        while ($e->getRow()) {

            array_push($data, $e->row);

        }

        echo json_encode($data);
    }
    //newly added
    public function getPosition($post, $returnJson=true) {
        $e = new db('employee_work');
        $e->select('employee_id = :id', false, false, array('id' => $post->emp_id));
        $e->getRow();
        $emp_work = $e->row;
        $e = new db("data");
        $e->select('id = :id', false, false, array('id' => $emp_work['position']));
        $e->getRow();
        $position = $e->row;
        
        echo json_encode($position);
    }
    //newly added
    public function getLogHistory($post, $returnJson=true){
        $e = new db('user_notes');
        $data = array();    
        $sql = "SELECT *, entered_user_id AS UID, tagged_user_id AS TID,
                    (SELECT CONCAT(firstname,' ',lastname) FROM user WHERE id = UID) AS entered_employee_name,
                    (SELECT CONCAT(firstname,' ',lastname) FROM user WHERE id = TID) AS tagged_user_name
                  FROM user_notes un
                 WHERE (account_id = :aid AND user_id = :eid) 
                    OR (account_id = :aid AND tagged_user_id = :eid)";
                
        $e->select(false , false, $sql, array('eid' => $post->employee_id, 'aid' => $post->userData->account_id));
        
        while ($e->getRow()) {
            $e->row['account_id'] = $post->userData->firstname.' '.$post->userData->lastname;
            array_push($data, $e->row);
        }
       
        if ($returnJson) {
            echo json_encode(array('logs' => $data));
        } else {
            return $data;

        }
    }
    //newly added
    public function getLQ($post, $returnJson=true){
        $e = new db('user_license');
        $data = array();     
        
        $e->select("account_id = :aid AND user_id = :eid" , 'id DESC', false, array('eid' => $post->employee_id, 'aid' => $post->userData->account_id));
        while ($e->getRow()) {
            array_push($data, $e->row);
        }
        
        if ($returnJson) {
            echo json_encode(array('logs' => $data));
        } else {
            return $data;
        }
    }
    //newly added 
    public function getOnlyEmployeeList($post, $returnJson=true){

        $e = new db('user');
        $data = array();
        $e->select("account_id = :aid", 'id ASC', false, array('aid' => $post->userData->account_id));

        while ($e->getRow()) {
            array_push($data, $e->row);
        }

   

        if ($returnJson) {
            echo json_encode(array('employees' => $data));
        } else {
            return $data;

        }
    }
    //newly added
    public function getEmployeeName($id){
        $e = new db("user");

        $e->select("id = :id", false, false, array("id" => $id));
        $e->getRow();
        return $e->row['firstname'] ." ". $e->row['lastname'];
    }
    //newly added
    public function getSiteLocation($id){
        $e = new db("user_work");
        $sql = "SELECT DISTINCT(user_work.site_location) FROM user_work INNER JOIN user ON user.id = user_work.user_id AND user.employee_id = ".$id;
        $e->select("employee_id = :id", false, false, array("id" => $id));

        $e->getRow();

        $site_id = $e->row['site_location'];

        $d = new db("data");

        $e->select("id = :id", false, false, array("id" => $site_id));

        $e->getRow();

        $site_id = $e->row['display_text'];
    }
    
    //newly added
    public function getAllReminders($post){


        $e = new db("reminders");

        $e->select("account_id = :account_id", false, false, array("account_id" => $post->account_id));

        $reminders = array();

        while($e->getRow()){
            $e->row["employee_name"] = $this->getEmployeeName($e->row["employee_id"]);
            $d = new db("employee");
            $d->select("id = :id", false, false, array("id" => $e->row["employee_id"]));
            $d->getRow();
            $e->row["active"] = $d->row["active"];
            date_default_timezone_get("Australia/Sydney");
            $da = strtotime($e->row["alert_expiry"]);
            
            $today = date("Y-m-d");
            if($today > date("Y-m-d", $da)){
                $e->row["alert_expiry_status"] = 1;
            }else{
                $e->row["alert_expiry_status"] = 0;
            }
            array_push($reminders, $e->row);
        }
        echo json_encode(array("reminders" => $reminders));
    }
    //newly added
    public function getEmployeeNameById($user_id){
        $e = new db("user");
        $e->select("id = :id", false, false, array("id" => $user_id));
        $e->getRow();
        return array("firstname" => $e->row["firstname"], "lastname" => $e->row["lastname"]);
    }
    public function getManagerNameById($id){
        $e = new db("user");
        $e->select("id = :id", false, false, array("id" => $id));
        $e->getRow();
        return array("firstname" => $e->row["firstname"], "lastname" => $e->row["lastname"]);
    }
    public function getPositionName($id){
        $e = new db("data");
        $e->select("id = :id", false, false, array("id" => $id));
        $e->getRow();
        return $e->row["display_text"];
    }
    public function getEmployeeWorkById($user_id){
        $e = new db("user_work");
        $sql = "SELECT usrwk.*, data.display_text as site_location FROM data INNER JOIN user_work AS usrwk on usrwk.site_location = data.id WHERE usrwk.user_id = ". $user_id ." ORDER BY usrwk.workdate_added DESC LIMIT 1";
        $e->select(false, false, $sql);
        $e->getRow();
        return $e->row;
    }
    //newly added
    public function getPerformanceForms($post){


        $e = new db("performance_forms");

        $e->select("account_id = :account_id And user_status = :active", false, false, array("account_id" => $post->account_id, "active" => 1));

        $performance_forms = array();

        while($e->getRow()){
            $employee_name = $this->getEmployeeNameById($e->row["employee_id"]);
            $employee_work = $this->getEmployeeWorkById($e->row["employee_id"]);
            $manager_name = $this->getEmployeeNameById($e->row["manager_id"]);
            $row = array("id" => $e->row["id"], "form_status" => $e->row["form_status"], "manager_name" => $manager_name["firstname"]. " " .$manager_name["lastname"], 
                        "employee_name" => $employee_name["firstname"]. " " .$employee_name["lastname"],
                        "assessment_date" => $e->row["assessment_date"],
                        "start_date" => $employee_work["start_date"],
                        "questions" => $e->row["questions"],
                        "site_location" => $employee_work["site_location"],
                        "frequency" => $e->row["frequency"] > 1 ? $e->row["frequency"]. " months" : $e->row["frequency"]. " month");
            array_push($performance_forms, $row);
        }
        $employees = array();
        $emp = new db("user");
        
        $emp->select('account_id = :aid AND deleted = :notdel AND active = :active', false, false, array('aid' => $post->account_id, 'notdel' => 0, "active" => 1));
        while ($emp->getRow()) {
            $sql = "SELECT emp.*, data.display_text as site_location FROM user_work as emp INNER JOIN data ON data.id = emp.site_location WHERE emp.user_id =". $emp->row["id"]." ORDER BY emp.workdate_added DESC LIMIT 1";
            $empwk = new db("user_work");
            $empwk->select(false, false, $sql);
            $empwk->getRow();

            $row = array("id" => $emp->row["id"], "firstname" => $emp->row["firstname"], "lastname" => $emp->row["lastname"], "position" => $this->getPositionName($empwk->row["position"]), "site_location" => $empwk->row["site_location"], "start_date" => $empwk->row["start_date"]);
            array_push($employees, $row);
        }

        $standard_questions = array();
        $emp = new db("standard_questions");
        $emp->select(false, false, "SELECT * FROM standard_questions");
        while ($emp->getRow()) {
            array_push($standard_questions, $emp->row);
        }
        echo json_encode(array("performance_forms" => $performance_forms, "employees" => $employees, "standard_questions" => $standard_questions));
    }
    //newly added
    public function saveForm($post){
        $data = array();
        $data["account_id"] = $post->userData->account_id;
        $data["created_by"] = $post->userData->id;
        $data["employee_id"] = $post->form->employee_id;
        $data["manager_id"] = $post->form->manager_id;
        $data["frequency"] = $post->form->frequency;
        $data["form_status"] = "pending";
        $time = strtotime($post->form->start_date);
        $final = date("Y-m-d", strtotime("+". $post->form->frequency / 1 ." month", $time));
        // $data["assessment_date"] = $post->form->start_date == null ? null : $final;
        $data["assessment_date"] = $final;
        $data["questions"] = "";
        foreach($post->form->specializedQuestionList as $question){
            $data["questions"] .= $question->question_text;
            $data["questions"] .= ",";
        }
        
        $e = new db("performance_forms");
        $e->insert($data);


        $e->select("account_id = :account_id And user_status = :active", false, false, array("account_id" => $post->userData->account_id, "active" => 1));

        $performance_forms = array();

        while($e->getRow()){
            $employee_name = $this->getEmployeeNameById($e->row["employee_id"]);
            $employee_work = $this->getEmployeeWorkById($e->row["employee_id"]);
            $manager_name = $this->getEmployeeNameById($e->row["manager_id"]);
            $row = array("id" => $e->row["id"], "form_status" => $e->row["form_status"], "manager_name" => $manager_name["firstname"]. " " .$manager_name["lastname"], 
                        "employee_name" => $employee_name["firstname"]. " " .$employee_name["lastname"],
                        "assessment_date" => $e->row["assessment_date"],
                        "start_date" => $employee_work["start_date"],
                        "questions" => $e->row["questions"],
                        "site_location" => $employee_work["site_location"],
                        "frequency" => $e->row["frequency"] > 1 ? $e->row["frequency"]. " months" : $e->row["frequency"]. " month");
            array_push($performance_forms, $row);
        }
        echo json_encode(array("performance_forms" => $performance_forms, "p" => $data));
    }
    //newly added
    public function updateForm($post){
        $data = array();
        // $e = new db("employee");
        // $fl_name = explode(" ", $post->form->employee_name);
        // $e->select("firstname = :firstname AND lastname = :lastname", false, false, array("firstname" => $fl_name[0], "lastname" => $fl_name[1]));
        // $e->getRow();
        // $data["employee_id"] = $e->row["id"];
        // $e = new db("user");
        // $fl_name = explode(" ", $post->form->manager_name);
        // $e->select("firstname = :firstname AND lastname = :lastname", false, false, array("firstname" => $fl_name[0], "lastname" => $fl_name[1]));
        // $e->getRow();
        $data["employee_id"] = $post->form->employee_id;
        $data["manager_id"] = $post->form->manager_id;
        $data["account_id"] = $post->userData->account_id;
        $data["created_by"] = $post->userData->id;
        $data["frequency"] = $post->form->frequency;
        $data["questions"] = "";
        foreach($post->form->specializedQuestionList as $question){
            $data["questions"] .= $question->question_text;
            $data["questions"] .= ",";
        }
        $e = new db("performance_forms");
        $data1 = $data;
        $data1["id"] = $post->form->id;
        $e->update($data, "id = :id", false, $data1);
        $e->select("account_id = :account_id And user_status = :active", false, false, array("account_id" => $post->userData->account_id, "active" => 1));

        $performance_forms = array();

        while($e->getRow()){
            $employee_name = $this->getEmployeeNameById($e->row["employee_id"]);
            $employee_work = $this->getEmployeeWorkById($e->row["employee_id"]);
            $manager_name = $this->getEmployeeNameById($e->row["manager_id"]);
            $row = array("id" => $e->row["id"], "form_status" => $e->row["form_status"], "manager_name" => $manager_name["firstname"]. " " .$manager_name["lastname"], 
                        "employee_name" => $employee_name["firstname"]. " " .$employee_name["lastname"],
                        "assessment_date" => $e->row["assessment_date"],
                        "start_date" => $employee_work["start_date"],
                        "questions" => $e->row["questions"],
                        "site_location" => $employee_work["site_location"],
                        "frequency" => $e->row["frequency"] > 1 ? $e->row["frequency"]. " months" : $e->row["frequency"]. " month");
            array_push($performance_forms, $row);
        }
        echo json_encode(array("performance_forms" => $performance_forms));
    }
    //newly added
    public function deleteForm($post){
        $e      = new db('performance_forms');

        $e->delete('id = :id', false, array('id' => $post->form->id));

        $e->select("account_id = :account_id And user_status = :active", false, false, array("account_id" => $post->userData->account_id, "active" => 1));

        $performance_forms = array();

        while($e->getRow()){
            $employee_name = $this->getEmployeeNameById($e->row["employee_id"]);
            $employee_work = $this->getEmployeeWorkById($e->row["employee_id"]);
            $manager_name = $this->getEmployeeNameById($e->row["manager_id"]);
            $row = array("id" => $e->row["id"], "form_status" => $e->row["form_status"], "manager_name" => $manager_name["firstname"]. " " .$manager_name["lastname"], 
                        "employee_name" => $employee_name["firstname"]. " " .$employee_name["lastname"],
                        "assessment_date" => $e->row["assessment_date"],
                        "start_date" => $employee_work["start_date"],
                        "site_location" => $employee_work["site_location"],
                        "questions" => $e->row["questions"],
                        "frequency" => $e->row["frequency"] > 1 ? $e->row["frequency"]. " months" : $e->row["frequency"]. " month");
            array_push($performance_forms, $row);
        }
        echo json_encode(array("performance_forms" => $performance_forms));
    }
    //newly added
    public function getFormReviews($post){
        $sql = "SELECT site_location FROM user_work WHERE user_id = ".$post->userData->id ." ORDER BY workdate_added DESC LIMIT 1";
        $e = new db("user_work");
        $e->select(false, false, $sql);
        $e->getRow();
        $site_location_id = $e->row["site_location"];
        $e = new db("performance_forms");
        $e->select("user_status = :active", false, false, array("active" => 1)); 
        $form_reviews = array();
        
        while($e->getRow()){
            $ek = new db("user_work");
            $sql = "SELECT site_location FROM user_work WHERE user_id = ".$e->row["employee_id"] ." ORDER BY workdate_added DESC LIMIT 1";
            $ek->select(false, false, $sql);
            $ek->getRow();
            if($ek->row["site_location"] == $site_location_id){
                $employee_name = $this->getEmployeeNameById($e->row["employee_id"]);
                $employee_work = $this->getEmployeeWorkById($e->row["employee_id"]);
                $manager_name = $this->getEmployeeNameById($e->row["manager_id"]);
                $row = array("id" => $e->row["id"], "form_status" => $e->row["form_status"], "manager_name" => $manager_name["firstname"]. " " .$manager_name["lastname"], 
                            "employee_name" => $employee_name["firstname"]. " " .$employee_name["lastname"],
                            "assessment_date" => $e->row["assessment_date"],
                            "start_date" => $employee_work["start_date"],
                            "site_location" => $employee_work["site_location"],
                            "questions" => $e->row["questions"],
                            "scores" => $e->row["scores"],
                            "comments" => $e->row["comments"],
                            "review_date" => $e->row["review_date"],
                            "frequency" => $e->row["frequency"]);
                array_push($form_reviews, $row);
            }
        }
        $standard_questions = array();
        $emp = new db("standard_questions");
        $emp->select(false, false, "SELECT * FROM standard_questions");
        while ($emp->getRow()) {
            array_push($standard_questions, $emp->row);
        }
        echo json_encode(array("form_reviews" => $form_reviews, "standard_questions" => $standard_questions));

    }
    //newly added
    public function saveFormReview($post){
        $data = array();
        $data["scores"] = $post->scores;
        $data["comments"] = $post->comments;
        $e = new db("performance_forms");
        $e->select("id = :id", false, false, array("id" => $post->id));
        $e->getRow();
        date_default_timezone_get("Australia/Sydney");
        $data["review_date"] = date("Y-m-d");
        $time = strtotime(date("Y-m-d"));
        $final = date("Y-m-d", strtotime("+". $e->row["frequency"] / 1 ." month", $time));
        $data["scores"] .= "~#".$data["scores"];
        $data["comments"] .= "!#".$data["comments"];
        // $data["assessment_date"] = $post->form->start_date == null ? null : $final;
        $data["assessment_date"] = $final;
        $e = new db("performance_forms");
        $data1 = $data;
        $data1["id"] = $post->id;
        $e->update($data, "id = :id", false, $data1);
        $sys_log = array();
        $e->select("id = :id", false, false, array("id" => $post->id));
        $e->getRow();
        $manager_name = $this->getEmployeeNameById($e->row["manager_id"]);
        $sys_log['who'] = $manager_name["firstname"]. " " . $manager_name["lastname"];
        $employee_name = $this->getEmployeeNameById($e->row["employee_id"]);
        $sys_log['what'] = "Completed a review for ".$employee_name["firstname"]. " ". $employee_name["lastname"];

        $sys_log['time'] = $data["review_date"];

        $sys_log['account_id'] = $e->row["account_id"];
        $sl = new db("system_logs");

        $sl->insert($sys_log);
        $this->getFormReviews($post);

        //storing system log 
        
    }
    //newly added
    public function getFormReviewsForView($post){
        $sql = "SELECT site_location FROM user_work WHERE user_id = ".$post->userData->id ." ORDER BY workdate_added DESC LIMIT 1";
        $e = new db("user_work");
        $e->select(false, false, $sql);
        $e->getRow();
        $site_location_id = $e->row["site_location"];
        $e = new db("performance_forms");
        $e->select("employee_id = :id", false, false, array("id" => $post->userData->id));
        $form_reviews = array();
        
        while($e->getRow()){
            $ek = new db("user_work");
            $sql = "SELECT site_location FROM user_work WHERE user_id = ".$e->row["manager_id"]." ORDER BY workdate_added DESC LIMIT 1";
            $ek->select(false, false, $sql);
            $ek->getRow();
            if($ek->row["site_location"] == $site_location_id){
                $employee_name = $this->getEmployeeNameById($e->row["employee_id"]);
                $employee_work = $this->getEmployeeWorkById($e->row["employee_id"]);
                $manager_name = $this->getEmployeeNameById($e->row["manager_id"]);
                $row = array("id" => $e->row["id"], "form_status" => $e->row["form_status"], "manager_name" => $manager_name["firstname"]. " " .$manager_name["lastname"], 
                            "employee_name" => $employee_name["firstname"]. " " .$employee_name["lastname"],
                            "assessment_date" => $e->row["assessment_date"],
                            "start_date" => $employee_work["start_date"],
                            "site_location" => $employee_work["site_location"],
                            "questions" => $e->row["questions"],
                            "scores" => $e->row["scores"],
                            "comments" => $e->row["comments"],
                            "review_date" => $e->row["review_date"]);
                array_push($form_reviews, $row);
            }
        }
        $standard_questions = array();
        $emp = new db("standard_questions");
        $emp->select(false, false, "SELECT * FROM standard_questions");
        while ($emp->getRow()) {
            array_push($standard_questions, $emp->row);
        }
        echo json_encode(array("form_reviews" => $form_reviews, "standard_questions" => $standard_questions));
    }
    
    //newly added
    public function getReviewReports($post){
        $data = array();
        $e = new db("performance_forms");
        $e->select("scores <> :scores AND account_id = :account_id", false, false, array("scores" => "", "account_id" => $post->userData->account_id));
        while($e->getRow()){
            $employee_name = $this->getEmployeeNameById($e->row["employee_id"]);
            $employee_work = $this->getEmployeeWorkById($e->row["employee_id"]);
            $row = array("id" => $e->row["id"],
                        "employee_name" => $employee_name["firstname"]. " " .$employee_name["lastname"],
                        "site_location" => $employee_work["site_location"],
                        "scores" => $e->row["scores"],
                        "department_name" => $employee_work["department_name"]);
            array_push($data, $row);
        }
        echo json_encode(array("review_reports" => $data));
    }
    //newly added
    public function formatDate($date){
        $a = explode("-", $date);
        return $a[2]. "-" .$a[1]. "-" .$a[0]; 
    }
    //newly added
    public function saveReminder($post, $returnJson=true){
        $data = (array)$post->cloned_reminder;
        $employee_name = $this->getEmployeeName($data['employee_id']);
        $site_location = $this->getSiteLocation($data['employee_id']);
        switch($data['email_name']){
            case "Birthday": {
                //$due_date = $this->bdDue($data['employee_id']); 
                $email_con = "Email advising an <\$employeeFirstName> <\$employeeLastname>'s birthday is approaching<p></p><br>Dear <\$preferredEmailUsersFirstName> <\$preferredEmailUserLastname>,<br>".
                "<br>This email is an automated reminder advising you that our human resources database, has identified that <\$employeeFirstName> <\$employeeLastname> who is working at <\$insertSiteLocaiton>, is having their birthday on the <\$insertDOB>.<br>".
                "<br>Please do not reply email. This is an automated message and replies are not monitored. Should you wish to unsubscribe, please contact your human resources manager.<br>".
                "<br>Kind Regards.<br>System Administrator<br>".
                "<\$companyName>";
                break;
            }
            case "VISA Check": {
                //$due_date = $this->visaDue($data['employee_id']); 
                $email_con = "Email advising that an <\$employeeFirstName> <\$employeeLastname>'s visa expiry date is approaching<p></p><br>Dear <\$preferredEmailUsersFirstName> <\$preferredEmailUserLastname>,<br>".
                "<br>This email is an automated reminder advising you that our human resources database, has identified that <\$employeeFirstName> <\$employeeLastname> who is working at <\$insertSiteLocaiton>, has a visa expiry date set for <\$insertdate>.<br>".
                "<br>Please ensure you conduct the relevant VEVO check prior to this date and record the results on her human resources file.<br>".
                "<br>Please do not reply email. This is an automated message and replies are not monitored. Should you wish to unsubscribe, please contact your human resources manager.<br>".
                "<br>Kind Regards.<br>System Administrator<br>".
                "<\$companyName>";
                break;
            }
            case "Training Course Due": {
                //$due_date = $this->trainingDue($data['employee_id']); 
                //$course_name = "";
                $email_con = "Email advising that an <\$employeeFirstName> <\$employeeLastname>'s training course is overdue<p></p><br>Dear <\$preferredEmailUsersFirstName> <\$preferredEmailUserLastname>,<br>".
                "<br>This email is an automated reminder advising you that our human resources database, has identified that <\$employeeFirstName> <\$employeeLastname>  who is working at <\$insertSiteLocaiton>, is currently undertaking training and development courses specifically, the course labelled <\$insertCourseName>.".
                "This course has a due date for <\$insertdate> and is not yet completed.<br>".
                "<br>Please ensure this course is completed within the allocated timeframe.<br>".
                "<br>Please do not reply email. This is an automated message and replies are not monitored. Should you wish to unsubscribe, please contact your human resources manager.<br>".
                "<br>Kind Regards.<br>System Administrator<br>".
                "<\$companyName>";
                break;
            }
            case "Safety Data Sheet Expiry": {
                //$due_date = $this->safetyDue($data['employee_id']); 
                //$chemical_name = "";
                //$supplier_name = "";
                $email_con = "Email advising that a SDS is about to expire<p></p><br>Dear <\$preferredEmailUsersFirstName> <\$preferredEmailUserLastname>,<br>".
                "<br>This email is an automated reminder advising you that our Hazardous Substance Register contained within our human resources database, has identified that the chemical labelled <\$insertChemicalName> at <\$insertSiteLocaiton>, has a safety data sheet that is due to expire on <\$insertdate>.<br>".
                "<br>Please ensure you contact the supplier, <\$insertSupplierName>, prior to the due date to organise an up-to date safety data sheet and notify the human resources department via email of the details.";
                "<br>Please do not reply email. This is an automated message and replies are not monitored. Should you wish to unsubscribe, please contact your human resources manager.<br>".
                "<br>Kind Regards.<br>System Administrator<br>".
                "<\$companyName>";
                break;
            }
            case "Schedule a Service": {
                //$due_date = $this->scheduleDue($data['employee_id']); 
                //$plan_name = "";
                //$serial_number = "";
                //$service_provider = "";
                //$phone_number = "";
                $email_con = "Email advising plant or equipment is due for a schedule or service<p></p><br>Dear <\$preferredEmailUsersFirstName> <\$preferredEmailUserLastname>,<br>".
                "<br>This email is an automated reminder advising you that our Asset Register contained within our human resources database, has identified that the plant/equipment called <\$insertPlantName> with the serial number of <\$insertSerialNumber> at <\$insertSiteLocaiton> has a service date scheduled for <\$insertdate>.<br>";
                "<br>Please ensure you contact the supplier, <\$insertServiceProvider> on <\$phoneNumber>, prior to the scheduled date to ensure everything is in order. Following the service, please advise the human resources department via email of the details so the asset register can be updated.";
                "<br>Please do not reply email. This is an automated message and replies are not monitored. Should you wish to unsubscribe, please contact your human resources manager.<br>".
                "<br>Kind Regards.<br>System Administrator<br>".
                "<\$companyName>";
                break;
            }
            case "Test and Tag": {
                //$due_date = $this->testDue($data['employee_id']); 
                //$plan_name = "";
                //$serial_number = "";
                $email_con = "Email advising testing and tagging of an item is required<p></p><br>Dear <\$preferredEmailUsersFirstName> <\$preferredEmailUserLastname>,<br>".
                "<br>This email is an automated reminder advising you that our electrical testing and tagging register contained within our human resources database, has identified that the plant/equipment called <\$insertPlantName> with the serial number of <\$insertSerialNumber> at <\$insertSiteLocaiton> electrical testing and tagging due on <\$insertdate>.<br>";
                "<br>Please ensure you organise this prior to the due date and advise the human resources department via email of the details so the testing and tagging register can be updated.";
                "<br>Please do not reply email. This is an automated message and replies are not monitored. Should you wish to unsubscribe, please contact your human resources manager.<br>".
                "<br>Kind Regards.<br>System Administrator<br>".
                "<\$companyName>";
                break;
            }
            case "Safe Work Procedures": {
                //$due_date = $this->safeworkDue($data['employee_id']); 
                $email_con = "Email advising an <\$employeeFirstName> <\$employeeLastname>'s SWP competency sign off is overdue<p></p><br>Dear <\$preferredEmailUsersFirstName> <\$preferredEmailUserLastname>,<br>".
                "<br>This email is an automated reminder advising you that our training register contained within our human resources database, has identified that that <\$employeeFirstName> <\$employeeLastname> who is working at <\$insertSiteLocaiton>, has their competency assessment due on the <\$insertdate><br>".
                "<br>Please ensure this employee has been assessed and marked as competent in all safe work procedures that they were trained in when commencing with the business. If they are not competent, they are not permitted to undertake any duties in the workplace until deemed competent by their manager. Until that point, they must be suitably monitored to ensure this is the case.<br>".
                "<br>NOTE: You are required to contact human resources immediately if you are unsure of the safe work procedures needing assessment and/or, if there any safe work procedures required, which this person has not done (for example, a new piece of equipment not yet reported to HR).<br>".
                "<br>Once, this assessment is completed in full, please advise the human resources department of the safe work procedure assessed, when it was assessed and whether they are competent in the safe work procedure.<br>".
                "<br>Please do not reply email. This is an automated message and replies are not monitored. Should you wish to unsubscribe, please contact your human resources manager.<br>".
                "<br>Kind Regards.<br>System Administrator<br>".
                "<\$companyName>";
                break;
            }
            case "Licence and Qualification": {
                //$due_date = $this->licenceDue($data['employee_id']); 
                //$licence_name = "";
                $email_con = "Email advising an <\$employeeFirstName> <\$employeeLastname>'s licence or qualification is about to expire<p></p><br>Dear <\$preferredEmailUsersFirstName> <\$preferredEmailUserLastname>,<br>".
                "<br>This email is an automated reminder advising you that our license and qualification register contained within our human resources database, has identified that <\$employeeFirstName> <\$employeeLastname> who is working at <\$insertSiteLocaiton>, has their <\$licenseQualificationName> due to expire on <\$insertdate><br>".
                "<br>Please ensure the business is not adversely affected by this expired license/qualification and if required, advise the employee they are to update their <\$licenseQualificationName> qualification/license.<br>".
                "<br>Once this is updated, please email the human resources department of the details so <\$employeeFirstName> <\$employeeLastname>'s employment records can be adjusted accordingly.<br>".
                "<br>Please do not reply email. This is an automated message and replies are not monitored. Should you wish to unsubscribe, please contact your human resources manager.<br>".
                "<br>Kind Regards.<br>System Administrator<br>".
                "<\$companyName>";
                break;
            }
            case "Probation Period": {
               // $due_date = $this->probationDue($data['employee_id']); 
                $email_con = "Email advising that an <\$employeeFirstName> <\$employeeLastname>'s 3 month probationary period is about to expire<p></p><br>Dear <\$preferredEmailUsersFirstName> <\$preferredEmailUserLastname>,<br>".
                "<br>This email is an automated reminder advising you that employment database contained within our human resources system, has identified that that <\$employeeFirstName> <\$employeeLastname> who is working at <\$insertSiteLocaiton>, has their 3 month probationary period due to expire on <\$insertdate><br>".
                "<br>Please ensure a probationary period assessment form was filled in for this employee (in its entirety) and emailed to the human resources before this due date so <\$employeeFirstName> <\$employeeLastname>'s employment records can be updated accordingly.<br>".
                "<br>Please do not reply email. This is an automated message and replies are not monitored. Should you wish to unsubscribe, please contact your human resources manager.<br>".
                "<br>Kind Regards.<br>System Administrator<br>".
                "<\$companyName>";
                break;
            }
            case "Qualification Period": {
                //$due_date = $this->qualificationDue($data['employee_id']); 
                $email_con = "Email advising that an <\$employeeFirstName> <\$employeeLastname>'s 6 month qualification period is about to expire<p></p><br>Dear <\$preferredEmailUsersFirstName> <\$preferredEmailUserLastname>,<br>".
                "<br>This email is an automated reminder advising you that employment database contained within our human resources system, has identified that that <\$employeeFirstName> <\$employeeLastname> who is working at <\$insertSiteLocaiton>, has their 6 month qualification period due to expire on <\$insertdate><br>".
                "<br>Please ensure a second probationary period assessment form was filled in for this employee (in its entirety) and emailed to the human resources before this due date so <\$employeeFirstName> <\$employeeLastname>'s employment records can be updated accordingly.<br>".
                "<br>Be aware, after this date, the employee will be automatically be offered unconditional employment and be automatically entitlement to unfair dismissal protections and laws.<br>".
                "<br>Please do not reply email. This is an automated message and replies are not monitored. Should you wish to unsubscribe, please contact your human resources manager.<br>".
                "<br>Kind Regards.<br>System Administrator<br>".
                "<\$companyName>";
                break;
            }
            case "Injury Register": {
                //$due_date = $this->injuryDue($data['employee_id']); 
                $email_con = "Email advising an outstanding item on a prior injury needs to be reviewed<p></p><br>Dear <\$preferredEmailUsersFirstName> <\$preferredEmailUserLastname>,<br>".
                "<br>This email is an automated reminder advising you that our business injury register, located in our human resources database, has identified that <\$employeeFirstName> <\$employeeLastname> who is working at <\$insertSiteLocaiton>, sustained a work related injury on <\$insertdate>.<br>".
                "<br>At the time of the injury, the likelihood of it reoccuring, was marked as <\$likelihood>(in nature) and had a severity rating of <\$severity>.<br>".
                "<br>As such, this automated reminder was created to advise you of this to ensure you are taking the appropriate measures to ensure this incident does not occur again.<br>".
                "<br>Once this risk has been remedied, please email the human resources department to ensure they update the records.<br>".
                "Please do not reply email. This is an automated message and replies are not monitored. Should you wish to unsubscribe, please contact your human resources manager.<br>".
                "<br>Kind Regards.<br>System Administrator<br>".
                "<\$companyName>";
                break;
            }
            case "Performance Review": {
                //$due_date = $this->injuryDue($data['employee_id']); 
                $email_con = "Email advising <\$employeeFirstName> <\$employeeLastname> performance review is approaching<p></p><br>Dear <\$preferredEmailUsersFirstName> <\$preferredEmailUserLastname>,<br>".
                "<br>This email is an automated reminder advising you that our human resources database, has identified that <\$employeeFirstName> <\$employeeLastname> who is working at <\$insertSiteLocaiton>, has their performance review due on <\$insertdate>.<br>".
                "<br>This performance review was set for you to conduct on <\$insertdate>. Please ensure you conduct <\$employeeFirstName> <\$employeeLastname>’s review prior to this date.<br>".
                "<br>Please do not reply email. This is an automated message and replies are not monitored. Should you wish to unsubscribe, please contact your human resources manager.".
                "<br>Kind Regards.<br>System Administrator<br>".
                "<\$companyName>";
                break;
            }
        }
        
        $data['email_con'] = $email_con;
        date_default_timezone_set("Australia/Sydney");
        // $date = date('Y-m-d H:i:s');
        $today = date("Y-m-d H:i:s");
        
        $data['created_at'] = $today;
        $data['due_date'] = $today;
        $data['alerts_count'] = 0;
        
        //$data['employee_name'] = $this->getEmployeeName($data['employee_id']);
        $e = new db("reminders");
        $sql = "SELECT count(*) AS alerts_count FROM reminders WHERE alert_status = 1 AND employee_id =". $data["employee_id"];
        $e->select(false, false, $sql);
        $e->getRow();
        $alerts_count = $e->row["alerts_count"];
        
        $data["alerts_count"] = $alerts_count + 1;
        $e->insert($data);
        
        $e->update(array("alerts_count" => 0), "employee_id = :id", false, array("alerts_count" => $data["alerts_count"], "id" => $data["employee_id"]));
        
        echo json_encode(array("reminders" => $this->getReminder($data["employee_id"])));

    }
    //newly added
    public function saveEmployeeNotes($post, $returnJson=true){
        $data = (array)$post;

        $emp_notes = (array)$data['emp_notes'];
        $empNotes = $emp_notes;
        
        date_default_timezone_set("Australia/Sydney");
        $today = date("Y-m-d H:i:s");
        
        $emp_notes['updated_time'] = $today;
        $e = new db("user_notes");
           
        if (isset($emp_notes['tagged_employee_id'])) {
            $emp_notes['tagged_user_id'] = $emp_notes['tagged_employee_id'];
            unset($emp_notes['tagged_employee_id']);
        }

        //$emp_notes['tagged_user_name'] = $emp_notes['tagged_employee_name'];
        unset($emp_notes['tagged_employee_name']);  
        
        $emp_notes['entered_user_id'] = $emp_notes['entered_employee_id'];
        unset($emp_notes['entered_employee_id']);

        //$emp_notes['entered_user_name'] = $emp_notes['entered_employee_name'];
        unset($emp_notes['entered_employee_name']);        
        
        $emp_notes['user_id'] = $emp_notes['employee_id'];
        unset($emp_notes['employee_id']);
        
        //$emp_notes['user_firstname'] = $emp_notes['employee_firstname'];
        unset($emp_notes['employee_firstname']);  
        
        //$emp_notes['user_lastname'] = $emp_notes['employee_lastname'];
        unset($emp_notes['employee_lastname']);
        
        //print_r($emp_notes); die;
        $insert = array();
        foreach($emp_notes as $key => $val) {
            if (trim($val) === '') {
                continue;
            }
            $insert[$key] = $val;
        }
        
        
        $e->insert($insert);
        $id = $e->lastInsertId;
        $data1 = array();


        $f = new db("flags");

        $sql = "SELECT * FROM flags";
        $f->select(false, false, $sql);
        $flags = array();
        while ($f->getRow()) {
            array_push($flags, $f->row['display_text']);
        }

        $sl = new db("system_logs");
        
        $emp_notes['flag_id'] = (isset($emp_notes['flag_id'])) ? $emp_notes['flag_id'] : '';

        if($emp_notes['flag_id'] == ''){
            $emp_notes['flag_id'] = 0;
        } else {
            $data1['who'] = $empNotes['entered_employee_name'];
            $data1['what'] = "Added a ". $flags[$empNotes['flag_id'] - 1] ." flag to ". $empNotes['employee_firstname'] ." ". $empNotes['employee_lastname'] ." file.";
            $date1['time'] = $today;
            $data1['account_id'] = $empNotes['entered_employee_id'];
            $sl->insert($data1);
        }
        
        $empNotes['mark_c'] = isset($empNotes['mark_c']) ? $empNotes['mark_c'] : '';
        
        if($empNotes['mark_c'] == ''){
            $empNotes['mark_c'] = 0;
        } else {
                $data1['who'] = $empNotes['entered_employee_name'];
                $data1['what'] = "Added a confidentiality flag on ". $empNotes['employee_firstname'] ." ". $empNotes['employee_lastname'] ." file.";
                $date1['time'] = $today;
                $data1['account_id'] = $empNotes['entered_employee_id'];
                $sl->insert($data1);
        }
        if(isset($empNotes['tagged_employee_name'])){
                $data1['who'] = $empNotes['entered_employee_name'];
                $data1['what'] = "Tagged ". $empNotes["tagged_employee_name"] ." call log ". $id ." on ". $empNotes['employee_firstname'] ." ". $empNotes['employee_lastname'] ." file.";
                $date1['time'] = $today;
                $data1['account_id'] = $empNotes['entered_employee_id'];
                $sl->insert($data1);
        }

        $data1['who'] = $empNotes['entered_employee_name'];
        $data1['what'] = "Created a call log ". $e->getInsertId() ." on ". $empNotes['employee_firstname'] ." ". $empNotes['employee_lastname'] ." file.";
        $date1['time'] = $today;
        $data1['account_id'] = $empNotes['entered_employee_id'];
        $sl = new db("system_logs");
        $sl->insert($data1);
    }
    
    //newly added
    public function saveLQ($post, $returnJson=true){
        $data = (array)$post;
        $lq = (array)$data['lq'];
        $en = new db('user_license');
        
        $lq['entered_user_id'] = $lq['entered_employee_id'];
        unset($lq['entered_employee_id']);
        
        $lq['entered_user_name'] = $lq['entered_employee_name'];
        unset($lq['entered_employee_name']);

        $lq['user_id'] = $lq['employee_id'];
        unset($lq['employee_id']);
        
        $lq['user_firstname'] = $lq['employee_firstname'];
        unset($lq['employee_firstname']);

        $lq['euser_lastname'] = $lq['employee_lastname'];
        unset($lq['employee_lastname']);        

        $lq['date_from'] = date('Y-m-d', $lq['date_from']);
        $lq['date_expire'] = date('Y-m-d', $lq['date_expire']);        

        $en->insert($lq);
    }
    
    //newly added
    public function updateEmployeeNotes($post, $returnJson=true){
        $data = (array)$post;

        $emp_notes = (array)$data['emp_notes'];    
        
        $id = $data['id'];
        date_default_timezone_set("Australia/Sydney");

        $today = date("Y-m-d H:i:s");
        $emp_notes['updated_time'] = $today;
        
        $update_data = $emp_notes;
        $update_data['id'] = $id;

        $f = new db("flags");

        $sql = "SELECT * FROM flags";
        $f->select(false, false, $sql);
        $flags = array();
        while ($f->getRow()) {
            array_push($flags, $f->row['display_text']);
        }

        $data1 = array();
        $e = new db("user_notes");
        
        $sql = "SELECT *, tagged_user_id AS TID,
                    (SELECT CONCAT(firstname,' ',lastname) FROM user WHERE id = TID) as tagged_employee_name
                  FROM user_notes
                 WHERE id = :id";
        $e->select(false, false, $sql, array('id' => $id));
        
        $empl = new db("user"); 
        
        // Get Entered Employee
        $empl->select('id = :id', false, false, array('id' => $emp_notes['entered_user_id'])); 
        $emp_notes['entered_employee_name'] = '';
        if ($empl->numRows > 0) {
            $empl->getRow();
            $emp_notes['entered_employee_name'] = $empl->firstname.' '.$empl->lastname;
        }

        // Get Tagged Employee
        $empl->select('id = :id', false, false, array('id' => $emp_notes['tagged_employee_id'])); 
        $emp_notes['tagged_employee_name'] = '';
        if ($empl->numRows > 0) {
            $empl->getRow();
            $emp_notes['tagged_employee_name'] = $empl->firstname.' '.$empl->lastname;
        }        
        
        // Get Employee
        $empl->select('id = :id', false, false, array('id' => $emp_notes['employee_id'])); 
        $emp_notes['employee_name'] = '';
        if ($empl->numRows > 0) {
            $empl->getRow();
            $emp_notes['employee_firstname'] = $empl->firstname;
            $emp_notes['employee_lastname'] = $empl->lastname;
        }

        $rows = array();
        while ($e->getRow()) {
            array_push($rows, $e->row);
        }
        $row = array();
        $row = $rows[0];

        $sl = new db("system_logs");

        if($emp_notes['flag_id'] == ''){
            $emp_notes['flag_id'] = 0;
        }
        if($row['flag_id'] != $emp_notes['flag_id']){
            if($emp_notes["flag_id"] != 0){
                $data1['who'] = $emp_notes['entered_employee_name'];
                $data1['what'] = "Added a ". $flags[$emp_notes['flag_id'] - 1] ." flag to ". $emp_notes['employee_firstname'] ." ". $emp_notes['employee_lastname'] ." file.";
                $date1['time'] = $today;
                $data1['account_id'] = $emp_notes['entered_employee_id'];
                $sl->insert($data1);
            }
            else{
                $data1['who'] = $emp_notes['entered_employee_name'];
                $data1['what'] = "Removed a ". $flags[$row['flag_id'] - 1] ." flag from ". $emp_notes['employee_firstname'] ." ". $emp_notes['employee_lastname'] ." file.";
                $date1['time'] = $today;
                $data1['account_id'] = $emp_notes['entered_employee_id'];
                $sl->insert($data1);
            }
        }
        
        if($emp_notes['mark_c'] == ''){
            $emp_notes['mark_c'] = 0;
        }
        if($row['mark_c'] != $emp_notes['mark_c']){
            if($emp_notes["mark_c"] != 0){
                $data1['who'] = $emp_notes['entered_employee_name'];
                $data1['what'] = "Added a confidentiality flag on ". $emp_notes['employee_firstname'] ." ". $emp_notes['employee_lastname'] ." file.";
                $date1['time'] = $today;
                $data1['account_id'] = $emp_notes['entered_employee_id'];
                $sl->insert($data1);
            }
            else{
                $data1['who'] = $emp_notes['entered_employee_name'];
                $data1['what'] = "Removed a confidentiality flag from ". $emp_notes['employee_firstname'] ." ". $emp_notes['employee_lastname'] ." file.";
                $date1['time'] = $today;
                $data1['account_id'] = $emp_notes['entered_employee_id'];
                $sl->insert($data1);
            }
        }
        echo "row".$row['tagged_employee_name'];
        echo "emp".$emp_notes['tagged_employee_name'];
        if(!isset($emp_notes['tagged_employee_name'])){
            $emp_notes['tagged_employee_name'] = $row['tagged_employee_name'];
            $update_data['tagged_employee_name'] = $row['tagged_employee_name'];
        }
        if($row['tagged_employee_name'] != $emp_notes['tagged_employee_name']){
            if($emp_notes["tagged_employee_name"] != ''){
                $data1['who'] = $emp_notes['entered_employee_name'];
                $data1['what'] = "Tagged ". $emp_notes["tagged_employee_name"] ." call log ". $id ." on ". $emp_notes['employee_firstname'] ." ". $emp_notes['employee_lastname'] ." file.";
                $date1['time'] = $today;
                $data1['account_id'] = $emp_notes['entered_employee_id'];
                $sl->insert($data1);
            }
            else{
                $data1['who'] = $emp_notes['entered_employee_name'];
                $data1['what'] = "Removed ". $row["tagged_employee_name"] ." Tag from call log ". $id ." on ". $emp_notes['employee_firstname'] ." ". $emp_notes['employee_lastname'] ." file.";
                $date1['time'] = $today;
                $data1['account_id'] = $emp_notes['entered_employee_id'];
                $sl->insert($data1);
            }
        }
        
        $data1['who'] = $emp_notes['entered_employee_name'];
        $data1['what'] = "Edited call log ". $id ." on ". $emp_notes['employee_firstname'] ." ". $emp_notes['employee_lastname'] ." file.";
        $date1['time'] = $today;
        $data1['account_id'] = $emp_notes['entered_employee_id'];
        //$sl->insert($data1);
        
        $fields = array();
        $fields['hr_issue'] = $update_data['hr_issue'];
        $fields['flag_id'] = $update_data['flag_id'];
        $fields['hr_action'] = $update_data['hr_action'];
        $fields['hr_issue_note'] = $update_data['hr_issue_note'];
        $fields['hr_action_note'] = $update_data['hr_action_note'];
        $fields['tagged_user_id'] = $update_data['tagged_user_id'];
        $fields['upload_file_path'] = $update_data['upload_file_path'];
        $fields['hour'] = $update_data['hour'];
        $fields['min'] = $update_data['min'];
        $fields['mark_c'] = $update_data['mark_c'];
        $fields['entered_user_id'] = $update_data['entered_user_id'];
        $fields['timer'] = $update_data['timer'];
        $fields['updated_time'] = $update_data['updated_time'];
        $fields['entered_user_id'] = $update_data['entered_employee_id'];
        $fields['user_id'] = $update_data['employee_id'];
        $fields['account_id'] = $update_data['account_id'];
        $fields['tagged_user_id'] = $update_data['tagged_employee_id']; 
        
        $data = $fields;
        $data['id'] = $update_data['id']; 
        
        //print_r($data);
        $e->bindParams = true;
        $e->update($fields, "id = :id", 1, $data);

    }
    
    //newly added
    public function startAlert($post, $returnJson=true){
        

        $e = new db("reminders");
        $data['alert_status'] = 0;
        $e->update($data, "id = :id", 1, array("id" => $post->id, "alert_status" => 1));

        $e->select("id = :id", false, false, array('id' => $post->id));
        $e->getRow();
        $row = $e->row;
        
        echo json_encode(array("reminders" => $this->getReminder($row["employee_id"])));

    }
    //newly added
    public function getReminder($emp_id){
        $e = new db("reminders");
        $data = array();
        $e->select("employee_id = :id", false, false, array('id' => $emp_id));
        while ($e->getRow()) {

            

            switch($e->row["email_name"]){
                case "Birthday": $e->row['description'] = "Email advising an employee’s birthday is approaching"; break;
                case "VISA Check": $e->row['description'] = "Email advising that an employee’s visa expiry date is approaching"; break;
                case "Training Course Due": $e->row['description'] = "Email advising that an employee’s training course is overdue"; break;
                case "Safety Data Sheet Expiry": $e->row['description'] = "Email advising that a SDS is about to expire"; break;
                case "Schedule a Service": $e->row['description'] = "Email advising plant or equipment is due for a schedule or service"; break;
                case "Test and Tag": $e->row['description'] = "Email advising testing and tagging of an item is required"; break;
                case "Safe Work Procedures": $e->row['description'] = "Email advising an employee’s SWP competency sign off is overdue"; break;
                case "Licence and Qualification": $e->row['description'] = "Email advising an employee’s licence or qualification is about to expire"; break;
                case "Probation Period": $e->row['description'] = "Email advising that an employee’s 3 month probationary period is about to expire"; break;
                case "Qualification Period": $e->row['description'] = "Email advising that an employee’s 6 month qualification period is about to expire"; break;
                case "Injury Register": $e->row['description'] = "Email advising an outstanding item on a prior injury needs to be reviewed."; break;
            }
            array_push($data, $e->row);
        }
        return $data;
    }
    //newly added
    public function stopAlert($post, $returnJson=true){
        

        $e = new db("reminders");
        $data['alert_status'] = 0;
        $e->update($data, "id = :id", 1, array("id" => $post->id, "alert_status" => 0));
        $e->select("id = :id", false, false, array('id' => $post->id));
        $e->getRow();
        $row = $e->row;

        echo json_encode(array("reminders" => $this->getReminder($row["employee_id"])));
        
    }
    //cron test
    public function cron(){
        $e = new db("reminders");
        $data['alert_status'] = 0;
        $e->update($data, "id = :id", 1, array("id" => 11, "alert_status" => 0));
    }
    //newly added
    public function emailUpdate($post, $returnJson=true){

        $e = new db("reminders");
        
        $data = array();
        $data['email_con'] = $post->email_con;

        switch($post->days_prior){
            case 0: {
                $data['days_prior'] = 1; 
                $data['period'] = 0;
                break;
            }
            case 1: 
            {
                $data['days_prior'] = 3; 
                $data['period'] = 0;
                break;
            }
            case 2: {
                $data['days_prior'] = 7; 
                $data['period'] = 0;
                break;
            }
            case 3: {
                $data['days_prior'] = 14; 
                $data['period'] = 0;
                break;
            }
            case 4: {
                $data['days_prior'] = 28; 
                $data['period'] = 0;
                break;
            }
            case 5: {
                $data['days_prior'] = 0; 
                $data['period'] = 0;
                break;
            }
            case 6: {
                $data['days_prior'] = 0; 
                $data['period'] = 1;
                break;
            }
            case 7: {
                $data['days_prior'] = 0; 
                $data['period'] = 3;
                break;
            }
        }
        $data['id'] = $post->id; 
        $e->update($data, "id = :id", 1, $data);
        $e->select("id = :id", false, false, array('id' => $post->id));
        $e->getRow();
        
        switch($e->row["email_name"]){
            case "Birthday": $e->row['description'] = "Email advising an employee’s birthday is approaching"; break;
            case "VISA Check": $e->row['description'] = "Email advising that an employee’s visa expiry date is approaching"; break;
            case "Training Course Due": $e->row['description'] = "Email advising that an employee’s training course is overdue"; break;
            case "Safety Data Sheet Expiry": $e->row['description'] = "Email advising that a SDS is about to expire"; break;
            case "Schedule a Service": $e->row['description'] = "Email advising plant or equipment is due for a schedule or service"; break;
            case "Test and Tag": $e->row['description'] = "Email advising testing and tagging of an item is required"; break;
            case "Safe Work Procedures": $e->row['description'] = "Email advising an employee’s SWP competency sign off is overdue"; break;
            case "Licence and Qualification": $e->row['description'] = "Email advising an employee’s licence or qualification is about to expire"; break;
            case "Probation Period": $e->row['description'] = "Email advising that an employee’s 3 month probationary period is about to expire"; break;
            case "Qualification Period": $e->row['description'] = "Email advising that an employee’s 6 month qualification period is about to expire"; break;
            case "Injury Register": $e->row['description'] = "Email advising an outstanding item on a prior injury needs to be reviewed."; break;
        }
        $row = $e->row;
        echo json_encode(array("reminder" => $row));

    }
    //newly added
    public function updateReminder($post, $returnJson=true){
        $data = (array)$post->cloned_reminder;   
        
        $id = $data['id'];
        date_default_timezone_set("Australia/Sydney");
        // $date = date('Y-m-d H:i:s');
        $today = date("Y-m-d H:i:s");

        $data['created_at'] = $today;

        $e = new db("reminders");
        
        $e->update($data, "id = :id", 1, $data);
    }
     //newly added
     public function updateLQ($post, $returnJson=true){
        $data = (array)$post;


        $lq = (array)$data['lq'];    
        
        $id = $data['id'];

        $update_data = $lq;
        $update_data['id'] = $id;

        $e = new db("user_license");
        
        $e->update($lq, "id = :id", 1, $update_data);

    }
    //newly added
    public function getSystemLogs($post, $returnJson=true){

        $account_id = $post->account_id;
        $sl = new db("system_logs");
        $sl->select("account_id = :account_id", "time DESC", false, array('account_id' => $account_id));
        $data = array();
        while ($sl->getRow()) {
            array_push($data, $sl->row);
        }

        if ($returnJson) {
            echo json_encode(array('logs' => $data));
        } else {
            return $data;
        }

    }
    
    public function searchEmployee($post, $returnJson=true) {

        

        $keyword = $post->keyword;

        $e = new db('employee');

        $data = array();

        $sql = "SELECT * FROM employee WHERE account_id = :aid AND (firstname LIKE :kw OR lastname LIKE :kw) ";        

        $e->select("account_id = :aid AND (firstname LIKE :kw OR lastname LIKE :kw)", false, false, array('kw' => '%'.$keyword.'%', 'aid' => $post->userData->account_id));

        

        while ($e->getRow()) {

            array_push($data, $e->row);

        }

   

        if ($returnJson) {

            echo json_encode(array('employees' => $data));

        } else {

            return $data;

        }

    }    

    

    public function searchEmployeeUser($post) {

        $users = $this->searchUser($post, false);

        $emps = $this->searchEmployee($post, false);

        

        $data = array_merge($users, $emps);   

        $data = $users;

       

        echo json_encode(array('users' => $data));

    }
    


    public function getEmployeeList($post) {

        $ut = new db('user');



        $data = array();

        $ut->select('account_id IN (SELECT account_id FROM user WHERE id = :uid ) AND usertype_id = :type',false, false, array('uid' => $post->user_id, 'type' => $post->usertype));



        while ($ut->getRow()) {

            $ut->row['name'] = $ut->firstname.' '.$ut->lastname;

            array_push($data, $ut->row);

        }

        echo json_encode(array('users' => $data));

    }



    public function getPermissionData() {

        $data = array();

        $data['roles'] = $this->getData('usertype');



        $n      = 0;

        $m      = new db('modules');

        $sm      = new db('modules');

        $m->select("status = :status AND parent_id = :top", 'parent_id ASC, display_order ASC', false, array('status' => 1, 'top' => 0));

        while ($m->getRow()) {            

            $data['modules'][$n] = array('id' => $m->id, 'text' => $m->module, 'sub' => 0);

            $n++;

            $sm->select("status = :status AND parent_id = :p", 'display_order ASC', false, array('status' => 1, 'p' => $m->id));

            while ($sm->getRow()) { 

                $data['modules'][$n] = array('id' => $sm->id, 'text' => $sm->module, 'sub' => 1);

                $n++;

            }

        }

        

        /*        

        

        $output = array();

        foreach($data['modules'] as $key => $obj) {

            $output[$key] = array('id' => $obj['id'], 'text' => $obj['text']);

            if (isset($obj['sub'])) {

                foreach($obj['sub'] as $k => $arr) {

                    $output[$arr['id']] = array('id' => $arr['id'], 'text' => $arr['text']);

                }

            }

        }*/

                

        //$data['modules'] = $output;

        echo json_encode($data);

    }



    public function savePermissions($post) {

        $p      = new db('permissions');

        $p->delete('usertype_id = :role', false, array('role' => $post->role));



        $modules = get_object_vars($post->modules);

        $types = array('read','write','delete');

        foreach($types as $k => $type) {

            foreach($modules[$type] as $key => $val) {

                if (!is_numeric($val) || $val == 0) {

                    continue;

                }

                $data = array();

                $data['module_id'] = $key;

                $data['usertype_id'] = $post->role;

                $data['_'.$type] = 1;



                $p->select('usertype_id = :ut AND module_id = :m', false, false, array('ut' => $post->role, 'm' => $key));

                if ($p->numRows == 0) {

                    $p->insert($data);

                } else {

                    $p->update(array('_'.$type => 1), 'usertype_id = :ut AND module_id = :m', 1, array('_'.$type => 1,'ut' => $post->role, 'm' => $key));

                }

            }

        }

    }



    public function getUserLoginDetail($id) {

        $user = $this->getUser($id);

        $perms = $this->getPermissions($user['user']['usertype_id'], true);

        echo json_encode(array('user' => $user, 'permissions' => $perms));

    }

    

    public function getPermissions($role, $returnArray=false) {

        $data   = array();

        $p      = new db('permissions');

        $p->select('usertype_id = :ut', false, false, array('ut' => $role));

        while($p->getRow()) {

            $read = ($p->_read == 1) ? $p->module_id : 0;

            $write = ($p->_write == 1) ? $p->module_id : 0;

            $delete = ($p->_delete == 1) ? $p->module_id : 0;

            $data[] = array('read' => $read,'delete' => $delete,'write' => $write,'module' => $p->module_id);

        }

        if ($returnArray) {

            return $data;

        } else {

            echo json_encode($data);

        }

    }



    public function getRoles($post) {
        $data = $this->getData('usertype');
        echo json_encode($data);
    }

    private function _checkUsernameExists($username) {
        $u      = new db('user');
        $u->select('username = :u', false, false, array('u' => $username));
        return ($u->numRows > 0) ? true : false;
    }



    private function _describeTable($table, $db) {

        $data   = array();

        $a      = new db(false, $db);

        $a->select(false,false, "DESCRIBE $table", array());

        

        while($a->getRow()) {

            array_push($data, $a->row);

        }

        return $data;
    }



    private function _save($table, $data, $keyFld="id", $method=false, $db=false) {
        $Fields = $this->_describeTable($table, $db);
        $params = array();
        $id = 0;

        foreach($Fields as $key => $field) {
            $fldname = $field['Field'];
            if ($field['Key'] == 'PRI') {
                if (isset($data[$fldname])) {
                    $id = $data[$fldname];
                }

                continue;
            }

            if ($field['Type'] == "date") {
                if(isset($data[$fldname])) {
                    $data[$fldname] = date('Y-m-d', strtotime($data[$fldname]));//$this->_formatDateToDb($data[$fldname]);
                }
            }

            if (isset($data[$fldname])) {
                $params[$fldname] = $data[$fldname];
            }

        }

        $a = new db($table, $db);
        if ($method == "replace") {
            $a->replace($params);
            return;
        }

        if ($id == 0) {
            $a->insert($params);
            return $a->lastInsertId;
        } else {
            $data = $params;
            $data['id'] = $id;
            unset($params['id']);
            $a->update($params, "id = :id", 1, $data);
            return $id;
        }
    }



    public function saveEmployee($post) {

        $data = (array)$post;
        $emp = (array)$data['emp'];    
        $empwork = (array)$data['empwork'];
        $currUser = (array)$data['currUser'];
        
        $emp['dob'] = date('Y-m-d',strtotime($emp['dob']));
        $emp['visaexpiry'] = date('Y-m-d',strtotime($emp['visaexpiry']));
        if (!isset($emp['usertype_id'])) {
            if (!$emp['id']) {
                $emp['usertype_id'] = 281;
            }
        }
        
        $newEmpId = $this->_save('user', $emp, false, false);
        $fieldList = $this->_describeTable('user_work', false);
        $fields = array();

        foreach($fieldList as $key => $val) {
            array_push($fields, $val['Field']);
        }

        $workdata = array();
        foreach($empwork as $key => $val) {
            if (!in_array($key, $fields)) {
                continue;
            }

            if (in_array($key, array('start_date','end_date'))) {
                $val = date('Y-m-d', strtotime($val));
            }
            $workdata[$key] = $val;         
        }
        
        $workdata['user_id'] = $newEmpId;      
        $db = new db('user_work');
        $db->insertupdate($workdata);
        $employees = $this->getEmployees(array('account_id' => $currUser['account_id']), true);
        echo json_encode(array('employees' => $employees));
    }


    public function delete($post) {       

        if ($post->type == "employee") {                       

            $e = new db('employee');

            $e->update(array('deleted' => 1), 'id = :id', 1, array('id' => $post->typeDetail->id, 'deleted' => 1));            

            $employees = $this->getEmployees(array('account_id' => $post->currUser->account_id), true);           

            return json_encode(array('employees' => $employees));

        } elseif ($post->type == "user") { 

            $e = new db('user');           

            $e->update(array('deleted' => 1), 'id = :id', 1, array('id' => $post->typeDetail->id, 'deleted' => 1));    

            return $this->getUsers(array('account_id' => $post->currUser->account_id), false);

        } elseif ($post->type == "hs") { 

            $e = new db('hazardous_substance');           

            $e->update(array('deleted' => 1), 'id = :id', 1, array('id' => $post->typeDetail->id, 'deleted' => 1));

            $d = new stdClass();

            $d->user = new stdClass();

            $d->user->account_id = $post->currUser->account_id;

            $this->getHSData($d);       

        } elseif ($post->type == "sitedata") { 

            $d = new db('data');

            $d->delete('id = :id', false, array('id' => $post->typeDetail->id));

            $this->getSiteData(array());

        } elseif ($post->type == "ar") { 

            $register = new register();

            $register->delete('asset_register',$post->typeDetail->id);

            return json_encode($register->getARData($post->currUser->account_id));

        } else {

            return json_encode(array());

        }

    }



    public function getEmployee($id) {
        $e = new db('user');
        $e->select('id = :id', false, false, array('id' => $id));
        $e->getRow();
        $emp = $e->row;

        $ew = new db('user_work');

        $sql = "SELECT w.*, site_location AS SL,
                    (SELECT display_text FROM data WHERE id = SL) AS site_location_name 
                  FROM user_work w
                 WHERE w.user_id = :id
              ORDER BY workdate_added DESC
                 LIMIT 1";

        $ew->select(false, false, $sql, array('id' => $id));
        $empwork = $ew->getRow();
        
        
        //newly added to get flag only one at present
        $en =  new db('user_notes');
        $en->select('user_id = :id AND flag_id <> :flag', false, false, array('id' => $id, 'flag' => 0));
        $flags = array();
        while ($en->getRow()) {
            array_push($flags, $en->row);
        }

        return array('emp' => $emp, 'empwork' => $empwork, 'flags' => $flags);
    }



    public function getUser($id) {

        $u      = new db('user');

        $sql = "SELECT *, CONCAT(firstname,' ',lastname) as 'name', state as STATE,

                (SELECT display_text FROM data WHERE id = STATE) as 'StateName'

                 FROM user u

                WHERE id = :id";



        $u->select(false,false, $sql, array('id' => $id));

        $u->getRow();

        $u->row['dob'] = date('d-m-Y', strtotime($u->row['dob']));

        return array('user' => $u->row);

    }



    public function get($type, $id) {

        switch($type) {
            case 'employee': $data = $this->getEmployee($id); break;
            case 'user': $data = $this->getUser($id); break;
            case 'hs': $data = $this->getHazardousSubsatance($id); break;
            case 'ar': $reg = new register();
                       $data = $reg->getARData(false, $id); break;
            case 'sitedata': $data = $this->getSitewideData($id); break;
        }

        return json_encode($data);

    }

    

    public function getSitewideData($id) {

        $db = new db('data');

        $db->select('id = :id', false, false, array('id' => $id));

        $db->getRow(); 

        return $db->row;                    

    }

    

    public function getHazardousSubsatance($id) {

        $db = new db('hazardous_substance');

        $db->select('id = :id', false, false, array('id' => $id));

        $db->getRow(); 

        return $db->row;    

    }



    private function _formatDateToDb($date) {

        if (!$date) {

            return '0000-00-00';

        }

        if (strpos($date, 'T') === false) {

            $a = explode('-', $date);

            return $a[2]."-".$a[1]."-".$a[0];

        } else {

            $a = explode('T', $date);

            return $a[0];

        }





    }



    private function _formatDateFromDb($date) {

        if (!$date || $date == '0000-00-00') {

            return '';

        }

        $date = str_replace('/', '-', $date);

        return date('Y-m-d', strtotime($date));

    }



    public function saveUser($post) {

        $data = get_object_vars($post->user);     



        if (isset($data['password'])) {

            if ($data['password']) {

                $data['public_password'] = $data['password'];

                $data['password'] = md5($data['password']);

            } else {

                unset($data['password']);

                unset($data['public_password']);

            }

        }



        if (isset($data['username']) && !$data['id']) {

            if ($this->_checkUsernameExists($data['username'])) {

                echo json_encode(array('success' => 0, 'message' => 'Username already exists. Please choose another.'));

                return;

            }

        }



        $newAccount = (isset($data['account_id']) && intval($data['account_id']) > 0) ? false : true;

        $userId = $this->_save('user', $data);



        // If we're creating a brand new account

        if ($newAccount) {

            $data['added_by'] = (isset($post->userData->id)) ? $post->userData->id : 0;

            $this->_save('user', array('account_id' => $userId, 'id' => $userId));

            return json_encode(array('success' => 1, 'message' => 'User account has been created successfully.', 'users' => $this->getUsers(array(), true, false)));

        }

        return json_encode(array('users' => $this->getUsers(array(), true, false), 'success' => 1, 'message' => 'User account has been updated successfully'));



    }



    public function saveChildUser($post) {

        $data = get_object_vars($post->user);



        if (isset($data['password'])) {

            if ($data['password']) {

                $data['public_password'] = $data['password'];

                $data['password'] = md5($data['password']);

            } else {

                unset($data['password']);

                unset($data['public_password']);

            }

        }



        if ($data['id'] > 0) {

            $userId = $this->_save('user', $data);

            return json_encode(array('success' => 1, 'message' => 'User account has been updated successfully.'));            

        } else {

            if (isset($data['username'])) {

                if ($this->_checkUsernameExists($data['username'])) {

                    return json_encode(array('success' => 0, 'message' => 'Username already exists. Please choose another.'));

                }

            }

            $userId = $this->_save('user', $data);

            return json_encode(array('success' => 1, 'message' => 'User account has been updated successfully.'));             

        }

    }



    public function updateUser($post) {

        $data   = array();



        $data = get_object_vars($post->user);

        if (isset($data['password'])) {

            if ($data['password']) {

                $data['public_password'] = $data['password'];

                $data['password'] = md5($data['password']);

            } else {

                unset($data['password']);

                unset($data['public_password']);

            }

        }



        $this->_save('user', $data);

        return json_encode(array('success' => 1));

    }



    public function releaseLock($post) {        

        $u = new db('user');

        $u->update(array('login_attempts' => 0, 'can_next_login' => 0), 'id = :id', 1, array('login_attempts' => 0, 'can_next_login' => 0, 'id' => $post->userId));

        echo json_encode(array('success' => 1, 'message' => 'Lock has been released successfully.'));

    }



    public function activateEmployee($post) {

        $e = new db('employee');

        $e->update(array('active' => 1), 'id = :id', 1, array('active' => $post['status'], 'id' => $post['employeeId']));

        echo json_encode(array('success' => 1));

    }



    public function getUsers($post, $isAdmin=false, $returnJson=true) {

        $u = new db('user');

        $data = array();

        $sql = "SELECT *, CONCAT(firstname,' ',lastname) as 'name', state as STATE, usertype_id AS UTYPE, 'user' AS `table`,

                (SELECT display_text FROM data WHERE id = STATE) as 'StateName',

                (SELECT display_text FROM data WHERE id = UTYPE) as 'UserRole',



                IF(gender='M','Male','Female') as 'gender'

                 FROM user u

                WHERE deleted = :del";

        $params = array();

        $params['del'] = 0;

        

        $getAllUsers = false;

        if (isset($post->admin)) {

            $getAllUsers = ($post->admin == 1) ? true : false;

        }

        

        

        if (!$isAdmin && !$getAllUsers) {

            $sql .= " AND account_id = :aid";

            $params['aid'] = $post->currUser->account_id;

        }



        $u->select(false,false, $sql, $params);

        while ($u->getRow()) {

            array_push($data, $u->row);

        }



        return ($returnJson) ? json_encode($data) : $data;

    }

    

    public function getUsersByType($account, $usertype, $returnJson=false) {

       

        $u = new db('user');

        $data = array();

        $sql = "SELECT *, CONCAT(firstname,' ',lastname) as 'name', state as STATE, usertype_id AS UTYPE,

                (SELECT display_text FROM data WHERE id = STATE) as 'StateName',

                (SELECT display_text FROM data WHERE id = UTYPE) as 'UserRole',



                IF(gender='M','Male','Female') as 'gender'

                 FROM user u

                WHERE deleted = :del

                  AND account_id = :aid

                  AND usertype_id = :type";

        $params = array();

        $params['del'] = 0;

        $params['aid'] = $account;

        $params['type'] = $usertype;

        $u->select(false,false, $sql, $params);

        while ($u->getRow()) {

            array_push($data, $u->row);

        }



        return ($returnJson) ? json_encode($data) : $data;

    }    



    public function getUserData($post) {

        $users = $this->getUsers($post->currUser, $post->admin);

        $countries = $this->getData('country');

        $states = $this->getData('state');

        $person = $this->getData('persontitle');

        $roles = $this->getData('usertype');

        echo json_encode(array('users' => $users, 'states' => $states, 'countries' => $countries, 'persontype' => $person, 'roles' => $roles));

    }



    public function getUserGlobalData() {

        $countries = $this->getData('country');

        $states = $this->getData('state');

        $roles = $this->getData('usertype');

        echo json_encode(array('states' => $states, 'countries' => $countries, 'roles' => $roles));

    }



    public function activateUser($post) {

        $u = new db('user');

        $u->update(array('active' => 1), 'id = :id', 1, array('active' => $post->status, 'id' => $post->userId));

        echo json_encode(array('success' => 1));

    }



    public function activateCourse($post) {

        $u = new db('course');

        $u->update(array('status' => 1), 'course_id = :id', 1, array('status' => $post->status, 'id' => $post->courseId));

        echo json_encode(array('success' => 1));

    }







    public function getCourseData($user_id, $post) {
        $c = new db('course');
        $data = array();
        
        $showAll = (isset($post->activeOnly)) ? false : true;
        
        if ($showAll) {
            $sql = "SELECT c.course_id, c.course_name, c.course_type, c.course_description, c.status, c_c.course_category_name, c_c.course_category_id, c.user_id, c.course_id as CID,
                            (SELECT COUNT(*) FROM alloc_course WHERE course_id = CID AND status <> :complete) as NumLearners
                      FROM course as c 
                INNER JOIN course_category as c_c ON c.course_category_id = c_c.course_category_id 
                     WHERE c.user_id = :uid OR c.is_global = :global
                  ORDER BY c.course_name ASC, c.created_on DESC";

            $c->select(false,false, $sql, array('uid' => $user_id, 'global' => 1, 'complete' => 1));  
        } else {
            $sql = "SELECT c.course_id, c.course_name, c.course_type, c.course_description, c.status, c_c.course_category_name, c_c.course_category_id, c.user_id, c.course_id as CID,
                            (SELECT COUNT(*) FROM alloc_course WHERE course_id = CID AND status <> :complete) as NumLearners
                      FROM course as c 
                INNER JOIN course_category as c_c ON c.course_category_id = c_c.course_category_id 
                     WHERE (c.user_id = :uid OR c.is_global = :global) AND c.status = :active
                  ORDER BY c.course_name ASC, c.created_on DESC";

            $c->select(false,false, $sql, array('uid' => $user_id, 'global' => 1, 'complete' => 1, 'active' => 1));             
         
        }
        
        while ($c->getRow()) {

            array_push($data, $c->row);

        }

        

        $user = $this->getUser($user_id);

        $employees = $this->getUsersByType($user['user']['account_id'], 281); // Get Learners

        echo json_encode(array('courses' => $data, 'learners' => $employees));

    }

    

    function getMediaFullURL($image) {

        $url = $this->getHomeURL();

        return $url . "/assets/uploads/" . $image;

    }



    public function getCourse($params) {

        $course_id = $params->course_id;        

          

        $course_db = new db('course');

        $data = array();

         

        $course_db->select("course_id = :cid AND user_id IN (SELECT id FROM user WHERE account_id IN (SELECT account_id FROM user WHERE id = :uid) )", false, false, array('cid' => $course_id, 'uid' => $params->currUser->id));

        if ($course_db->numRows == 0) {

            echo json_encode(array('course' => array('course_id' => -1)));

            die;

        }

        $course_db->getRow();

        $course = $course_db->row;



        // Get Questions.

        $question_db = new db('questions');

        $question_db->select('course_id = :cid', 'question_id ASC', false, array('cid' => $course_id));

        $questions = array();



        while ($question_db->getRow()) {

            $question = $question_db->row;

            $question_id = $question['question_id'];

            $media_type = $question['media_type'];



            // Image.

            if($media_type == 0) {

                $image = $question['image'];

                $image_array = explode(',', $image);

                $index = 0;

                foreach($image_array as $item) {

                    if($item != null && $item != "") {

                        $question["image" . $index] = $this->getMediaFullURL($item);

                    }

                    $index ++;

                }

            }

            // Video.

            else if($media_type == 1) {

                if ($question['video']) {

                    $video = $question['video'];

                    $question['video'] = $this->getMediaFullURL($video).'?autoplay=0';

                }

            }

            // PDF.

            else if($media_type == 3) {

                if ($question['pdf']) {

                    $pdf = $question['pdf'];

                    $question['pdf'] = $this->getMediaFullURL($pdf).'#zoom=100';

                }

            }



            // Get Answers.

            $answer_db = new db('answers');

            $answer_db->select('question_id = :qid',false, false, array('qid' => $question_id));

            $answers = array();

            while ($answer_db->getRow()) {

                $answer = $answer_db->row;

                array_push($answers, $answer);

            }

            $question['answers'] = $answers;

            array_push($questions, $question);

        }



        $course['questions'] = $questions;

        echo json_encode(array('course' => $course));

    }    

    

    

    

    

    public function getCourseByID($params) {

        $course_id = $params->course_id;        

        $employee = $this->getEmployee($params->employee_id); 

        $employee = $this->getUser($params->employee_id);

        

        $course_db = new db('course');

        $data = array();

        

        $sql = "SELECT ac.*, c.*, ac.alloc_date as AllocDate, DATE_ADD(ac.alloc_date, INTERVAL ac.expire_hours HOUR) AS CourseExpireDate,

                    (SELECT TIMEDIFF(DATE_ADD(ac.alloc_date, INTERVAL ac.expire_hours HOUR), NOW())) AS TimeLeft,

                    (CASE

                        WHEN ac.status = 0 THEN 'Pending'

                        WHEN ac.status = 1 THEN 'Completed'

                        WHEN ac.status = 2 THEN 'Overdue'

                    END) AS CourseStatus,

                  (SELECT COUNT(*) FROM questions WHERE course_id = :cid) as NumQuestions

                  FROM alloc_course ac

            INNER JOIN course c ON ac.course_id = c.course_id

                 WHERE ac.employee_id = :eid

                   AND c.course_id = :cid

              ORDER BY ac.alloc_date DESC";        

        

        $course_db->select(false,false, $sql, array('eid' => $params->employee_id, 'cid' => $course_id));

        $course_db->getRow();

        $course = $course_db->row;



        // Get Questions.

        $question_db = new db('questions');

        

        $sql = "SELECT *, question_id as QID, 

                  (SELECT COUNT(*) FROM submitted_answers WHERE course_id = :cid AND question_id = QID and employee_id = :eid) AS isAnswered

                  FROM questions

                 WHERE course_id = :cid

              ORDER BY question_id ASC";

        $question_db->select(false,false,$sql, array('cid' => $course_id, 'eid' => $params->employee_id));



        $questions = array();



        while ($question_db->getRow()) {

            $question = $question_db->row;

            $question_id = $question['question_id'];

            $media_type = $question['media_type'];



            // Image.

            if($media_type == 0) {

                $image = $question['image'];

                $image_array = explode(',', $image);

                $index = 0;

                foreach($image_array as $item) {

                    if($item != null && $item != "") {

                        $question["image" . $index] = $this->getMediaFullURL($item);

                    }

                    $index ++;

                }

            }

            // Video.

            else if($media_type == 1) {

                $video = $question['video'];

                $url = $this->getHomeURL();        

                $question['video'] = $url . "/assets/uploads/" . $video;

            }

            // PDF.

            else if($media_type == 3) {

                $pdf = $question['pdf'];

                $question['pdf'] = $this->getMediaFullURL($pdf);

            }



            // Get Answers.

            $answer_db = new db('answers');

            $answer_db->select('question_id = :qid',false, false, array('qid' => $question_id));

            $answers = array();

            while ($answer_db->getRow()) {

                $answer = $answer_db->row;

                array_push($answers, $answer);

            }

            $question['answers'] = $answers;

            array_push($questions, $question);

        }



        $course['questions'] = $questions;

        echo json_encode(array('course' => $course, 'employee' => $employee));

    }

    

    public function getCourseByUser($params) {

        $data = array();

        $db = new db();

        $sql = "SELECT ac.*, c.*, ac.alloc_date as AllocDate, DATE_ADD(ac.alloc_date, INTERVAL ac.expire_hours HOUR) AS CourseExpireDate,

                    (SELECT TIMEDIFF(CourseExpireDate, NOW())) AS TimeLeft,

                    (CASE

                        WHEN ac.status = 0 THEN 'Pending'

                        WHEN ac.status = 1 THEN 'Completed'

                        WHEN ac.status = 2 THEN 'Overdue'

                    END) AS CourseStatus

                  FROM alloc_course ac

            INNER JOIN course c ON ac.course_id = c.course_id

                 WHERE ac.employee_id = :eid

              ORDER BY ac.alloc_date DESC";

        $db->select(false, false, $sql, array('eid' => $params->userId));

        while ($db->getRow()) {            
            $db->started_date = (isset($db->started_date)) ? $db->started_date : null;
            $db->row['DateStarted'] = (is_null($db->started_date) || !$db->started_date) ? 'Not yet commenced' : date('d-m-Y H:i', strtotime($db->started_date));

            $db->row['DateCompleted'] = ($db->completed_date == '0000-00-00 00:00:00') ? 'Not completed' : date('d-m-Y H:i', strtotime($db->completed_date));

            $db->row['course'] = $db->course_name;

            //$db->row['CourseStatus'] = '<a href="javascript:void(0);" ng-click="GotoCourse('.$db->course_id.')">'.$db->CourseStatus.'</a>';

            array_push($data, $db->row);

        }



        echo json_encode($data);

    }    



    public function getCourseCate() {

        $c      = new db('course_category');

        $data = array();

        $c->select(false,false, false, array());





        while ($c->getRow()) {

            array_push($data, $c->row);

        }

        echo json_encode(array('course_category' => $data));

    }



    

    public function startCourse($post) {

        $ac = new db('alloc_course');

        $params = array();

        $params['started_date'] = date('Y-m-d H:i:s');

        $params['cid'] = $post->course_id;

        $params['eid'] = $post->employee_id;        

        $ac->update(array('started_date' => 1),'course_id = :cid AND employee_id = :eid AND started_date IS NULL', 1, $params);   

    }

    

    

    

    public function saveCourse($post) { // update course



        $course = $post->courseData;

        $course_id = $course->course_id;

        $course_name = $course->course_name;

        $course_description = $course->course_description;

        $course_category_id = $course->course_category_id;

        $course_type = $course->course_type;

        $status = $course->status;

        $time_limit = $course->time_limit;

        $is_randomized = $course->is_randomized;

        $display_error_message = $course->display_error_message;

        $reorder = $course->reorder;

        $is_comeback = $course->is_comeback;

        $try_again = $course->try_again;

        $is_global = $course->is_global;

        $is_auto_inactive = $course->is_auto_inactive;

        $auto_inactive_time = isset($course->auto_inactive_time) ? $course->auto_inactive_time : '';



        $course_db  = new db('course');

        if($course_id) {

            $data = array('course_id' => $course_id, 'course_name' => $course_name, 'course_description' => $course_description,

                'course_category_id' => $course_category_id, 'course_type' => $course_type,

                'status' => $status, 'time_limit' => $time_limit, 'is_randomized' => $is_randomized, 'display_error_message' => $display_error_message,

                'reorder' => $reorder, 'is_comeback' => $is_comeback, 'try_again' => $try_again, 'is_global' => $is_global, 'is_auto_inactive' => $is_auto_inactive, 'auto_inactive_time' => $auto_inactive_time,);

            $course_db->update($data, 'course_id = :course_id', false, $data);

            $returnData = $course;

            

        } else {

            $data = array(

                'course_name' => $course_name,

                'course_description' => $course_description,

                'course_category_id' => $course_category_id,

                'course_type' => $course_type,

                'status' => $status,

                'time_limit' => $time_limit,

                'is_randomized' => $is_randomized,

                'display_error_message' => $display_error_message,

                'reorder' => $reorder,

                'is_comeback' => $is_comeback,

                'try_again' => $try_again,

                'is_global' => $is_global,

                'is_auto_inactive' => $is_auto_inactive,

                'auto_inactive_time' => $auto_inactive_time,

                'user_id' => $course->user_id

            );



            $course_db->insert($data);

            $course_id = $course_db->lastInsertId;

            $returnData = $data;

        }

        $this->saveQuestions($course->questions, $course_id);

        return json_encode($returnData);

        

    }

    

    private function getValue($val) {

        $isnew = strpos($val, 'new');

        if ($isnew === false) {

            return $val;

        } else {

            $arr = explode('_', $val);

            return $arr[0];

        }

    }

    

    private function saveQuestions($questions, $course_id) {

        if (count($questions) == 0) {

            return;

        }

        $db = new db('questions');

        foreach($questions as $key => $question) {

            $data = array();

            $data['title'] = $question->title;

            $data['correct_answer_id'] = $this->getValue($question->correct_answer_id);

            $data['media_type'] =  isset($question->media_type) ? $this->getValue($question->media_type) : 0;

            $data['course_id'] =  $course_id;

            

            if (isset($question->uploadedfile)) {

                $data['video'] = ($data['media_type'] == 1) ? $question->uploadedfile : '';

                $data['image'] = '';//$question[''];

                $data['pdf'] =  ($data['media_type'] == 3) ? $question->uploadedfile : '';

                $data['ppt'] =  ($data['media_type'] == 2) ? $question->uploadedfile : '';

            }

            

            if (strpos($question->question_id, 'new') !== false) {

                unset($question->question_id);

            }

            

            if (isset($question->question_id)) {

                if ($question->question_id) {

                    $params = $data;

                    $params['qid'] = $question->question_id;

                    $db->update($data, 'question_id = :qid', 1, $params);

                    $this->saveAnswers($question->answers, $question->question_id, false);

                } else {

                    $db->insert($data);

                    $this->saveAnswers($question->answers, $db->lastInsertId, $data['correct_answer_id']);

                }

            } else {

                $db->insert($data);

                $this->saveAnswers($question->answers, $db->lastInsertId, $data['correct_answer_id']);

            }

        } 

    }

    

    private function saveAnswers($answers, $questionId, $index) {

        if (count($answers) == 0) {

            return;

        } 

        

        $saved = array();

        

                                

        $db = new db('answers');

        $q = new db('questions');

        foreach($answers as $key => $answer) { 

            $data = array();

            $data['title'] = $answer->title;

            $data['question_id'] = $questionId;

            

            if (isset($answer->answer_id)) {

                $isnew = strpos($answer->answer_id, 'new');

                if ($isnew === false) {

                    $params = $data;

                    $params['aid'] = $answer->answer_id;

                    $db->update($data, 'answer_id = :aid', 1, $params);

                    array_push($saved, $answer->answer_id);

                } else {

                    $db->insert($data);

                    array_push($saved, $db->lastInsertId);

                    if ($index) {

                        if ($key == $index) {

                            $q->update(array('correct_answer_id' => 1), 'question_id = :id', 1, array('correct_answer_id' => $db->lastInsertId, 'id' => $questionId));

                        }

                    }

                }

            } else {

                $db->insert($data);  

                array_push($saved, $db->lastInsertId);

                if ($index) {

                    if ($key == $index) { 

                        $q->update(array('correct_answer_id' => 1), 'question_id = :id', 1, array('correct_answer_id' => $db->lastInsertId, 'id' => $questionId));

                    }

                }                

            }                     

        }

        $sql = "DELETE FROM answers WHERE question_id = :qid AND answer_id NOT IN (".implode(",", $saved).")";

        $db->select(false, false, $sql, array('qid' => $questionId));

    }



    private function _checkCourseNameExists($coursename) {

        $u      = new db('course');

        $u->select('course_name = :u', false, false, array('u' => $coursename));

        return ($u->numRows > 0) ? true : false;

    }



    function getHomeURL() {

        return $this->server_url;

//        $urls = explode('/', $_SERVER['REQUEST_URI']);

//        foreach($urls as $url) {

//            if($url != null && count($url) > 0) {

//                return "http://" . $_SERVER['HTTP_HOST'] . "/" . $url;

//            }

//        }

//        return "http://" . $_SERVER['HTTP_HOST'];

    }

    

    

    function uploadFile($file, $media_type) {

        $errors     = array();

        $file_name  = $file['name'];

        $file_size  = $file['size'];

        $file_tmp   = $file['tmp_name'];

        $file_type  = $file['type'];

        $file_ext   = strtolower(end(explode('.', $file['name'])));



        if($file_name == null || count($file_name) == 0) return null;



        if($media_type == 0) {

            $real_name = md5(uniqid('image', true)) . "." . $file_ext;

            move_uploaded_file($file_tmp, __DIR__ . "/../uploads/image/" . $real_name);

            return "image/".$real_name;

        } else if($media_type == 1) {

            $real_name = md5(uniqid('video', true)). "." . $file_ext;

            move_uploaded_file($file_tmp,__DIR__ . "/../uploads/video/" . $real_name);

            return "video/".$real_name;

        } else if($media_type == 3) {

            $real_name = md5(uniqid('pdf', true)). "." . $file_ext;

            move_uploaded_file($file_tmp,__DIR__ . "/../uploads/pdf/" . $real_name);

            return "pdf/".$real_name;

        } else {

            $real_name = md5(uniqid('ppt', true)). "." . $file_ext;

            move_uploaded_file($file_tmp,__DIR__ . "/../uploads/ppt/" .$real_name);

            return "ppt/".$real_name;

        }

    }    

    



    function uploadMedia($media_name, $media_type) {

        if(!isset($_FILES[$media_name])) return null;



        $errors = array();

        $file_name = $_FILES[$media_name]['name'];

        $file_size = $_FILES[$media_name]['size'];

        $file_tmp =$_FILES[$media_name]['tmp_name'];

        $file_type=$_FILES[$media_name]['type'];

        $file_ext=strtolower(end(explode('.',$_FILES[$media_name]['name'])));



        if($file_name == null || count($file_name) == 0) return null;



        if($media_type == 0) {

            $real_name = md5(uniqid('image', true)) . "." . $file_ext;

            move_uploaded_file($file_tmp, __DIR__ . "/../uploads/image/" . $real_name);

            return "image/".$real_name;

        }

        else if($media_type == 1) {

            $real_name = md5(uniqid('video', true)). "." . $file_ext;

            move_uploaded_file($file_tmp,__DIR__ . "/../uploads/video/" . $real_name);

            return "video/".$real_name;

        }

        else if($media_type == 3) {

            $real_name = md5(uniqid('pdf', true)). "." . $file_ext;

            move_uploaded_file($file_tmp,__DIR__ . "/../uploads/pdf/" . $real_name);

            return "pdf/".$real_name;

        }

        else {

            $real_name = md5(uniqid('ppt', true)). "." . $file_ext;

            move_uploaded_file($file_tmp,__DIR__ . "/../uploads/ppt/" .$real_name);

            return "ppt/".$real_name;

        }

    }



    function parseCountValue($value) {

        $array_temp = explode(':', $value);

        return $array_temp[count($array_temp) - 1];

    }



    public function editCourse($post) {

        $data   = array();

     

        // Update Course.

        $course_id = $post['course_id'];

        $course_name = $post['course_name'];

        $course_description = $post['course_description'];

        $course_category_id = $post['course_category_id'];

        $course_type = $post['course_type'];

        $status = $post['status'];

        $user_id = $post['user_id'];

        $time_limit = $post['time_limit'];

        $is_randomized = $post['is_randomized'];

        $display_error_message = $post['display_error_message'];

        $reorder = $post['reorder'];

        $is_comeback = $post['is_comeback'];

        $try_again = $post['try_again'];

        $is_global = $post['is_global'];

        $is_auto_inactive = $post['is_auto_inactive'];

        $auto_inactive_time = isset($post['auto_inactive_time']) ? $post['auto_inactive_time'] : '';



        $course_db  = new db('course');

        $course_db->update(array('course_name' => $course_name, 'course_description' => $course_description, 'course_category_id' => $course_category_id, 'course_type' => $course_type,

            'status' => $status, 'user_id' => $user_id, 'time_limit' => $time_limit, 'is_randomized' => $is_randomized, 'display_error_message' => $display_error_message,

            'reorder' => $reorder, 'try_again' => $try_again, 'is_global' => $is_global, 'is_auto_inactive' => $is_auto_inactive, 'is_comeback' => $is_comeback, 'auto_inactive_time' => $auto_inactive_time), "course_id = :id", false,

            array('course_name' => $course_name, 'course_description' => $course_description, 'course_category_id' => $course_category_id, 'course_type' => $course_type,

                'status' => $status, 'user_id' => $user_id, 'time_limit' => $time_limit, 'is_randomized' => $is_randomized, 'display_error_message' => $display_error_message,

                'reorder' => $reorder, 'try_again' => $try_again, 'is_global' => $is_global, 'is_auto_inactive' => $is_auto_inactive, 'is_comeback' => $is_comeback,

                'auto_inactive_time' => $auto_inactive_time, 'id' => $course_id));



        // Get all questions for selected course.

        $questions_db = new db('questions');

        $sql = "SELECT * FROM questions WHERE course_id = :id";

        $questions_db->select(false,false, $sql, array('id' => $course_id));

        $old_questions = array();



        while ($questions_db->getRow()) {

            $question = $questions_db->row;

            array_push($old_questions, $question);

        }



        // Update Questions.

        $answers_db = new db('answers');



        $course_question_count = $post['course_question_count'];

        $course_question_count = $this->parseCountValue($course_question_count);



        $question_ids = array();

        for($i = 0; $i < $course_question_count; $i++) {

            $question_id = $post['question_id' . $i];



            if(strpos($question_id, 'new') !== false) {

                // New Question.

                $question_title = $post['question_title' . $question_id];

                $question_media_type = $post['question_media_type' . $question_id];

                $question_answer_count = $this->parseCountValue($post['question_answer_count' . $question_id]);

                $correct_answer = $post['correct_answer' . $question_id];



                $question_data = array(

                    'title' => $question_title,

                    'media_type' => $question_media_type,

                    'course_id' => $course_id,

                );



                // Upload Media.

                if($question_media_type == 0) {

                    $images = array();



                    $image_name1 = "image0_" . $question_id;

                    $media_name1 = $this->uploadMedia($image_name1, $question_media_type);

                    if($media_name1 != null && count($media_name1) > 0){

                        array_push($images, $media_name1);

                    }



                    $image_name2 = "image1_" . $question_id;

                    $media_name2 = $this->uploadMedia($image_name2, $question_media_type);

                    if($media_name2 != null && count($media_name2) > 0){

                        array_push($images, $media_name2);

                    }



                    $image_name3 = "image2_" . $question_id;

                    $media_name3 = $this->uploadMedia($image_name3, $question_media_type);

                    if($media_name3 != null && count($media_name3) > 0){

                        array_push($images, $media_name3);

                    }



                    $question_data['image'] = implode(',', $images);



                } else if($question_media_type == 1) {

                    // Video.

                    $video_name = "media_video_" . $question_id;

                    $media_name = $this->uploadMedia($video_name, $question_media_type);

                    if($media_name != null && count($media_name) > 0){

                        $question_data['video'] = $media_name;

                    }

                } else if($question_media_type == 3) {

                    // PDF.

                    $pdf_name = "media_pdf_" . $question_id;

                    $media_name = $this->uploadMedia($pdf_name, $question_media_type);

                    if($media_name != null && count($media_name) > 0){

                        $question_data['pdf'] = $media_name;

                    }

                }



                $questions_db->insert($question_data);

                $new_question_id = $questions_db->lastInsertId;



                for($j = 0; $j < $question_answer_count; $j++) {

                    $answer_id = $post['answer_id'. $question_id . "_" . $j];

                    $answer_title = $post['answer' . $question_id . '_' . $answer_id];

                    $answer_data = array(

                        'title' => $answer_title,

                        'question_id' => $new_question_id,

                    );



                    $answers_db->insert($answer_data);

                    $new_answer_id = $answers_db->lastInsertId;



                    if($correct_answer == $answer_id) {

                        $questions_db->update(array('correct_answer_id' => $new_answer_id), "question_id = :id", false, array('correct_answer_id' => $new_answer_id, 'id' => $new_question_id));

                    }

                }

            }

            else {

                array_push($question_ids, $question_id);



                // Existing Question.

                $question_title = $post['question_title' . $question_id];

                $question_media_type = $post['question_media_type' . $question_id];

                $question_answer_count = $this->parseCountValue($post['question_answer_count' . $question_id]);

                $correct_answer = $post['correct_answer' . $question_id];

                $question_image = $post['question_image' . $question_id];



                // Get all answers for questions.

                $sql = "SELECT * FROM answers WHERE question_id = :id";

                $answers_db->select(false,false, $sql, array('id' => $question_id));

                $old_answers = array();

                while ($answers_db->getRow()) {

                    $answer = $answers_db->row;

                    array_push($old_answers, $answer);

                }



                // Update Answers.

                $new_answer_ids = array();

                for($j = 0; $j < $question_answer_count; $j++) {



                    $answer_id = $post['answer_id'. $question_id . "_" . $j];



                    if(strpos($answer_id, 'new') !== false) {

                        $answer_title = $post['answer' . $question_id . '_' . $answer_id];

//                    echo "<br> New Anwser Title: " . $answer_title;



                        $answer_data = array(

                            'title' => $answer_title,

                            'question_id' => $question_id,

                        );



                        $answers_db->insert($answer_data);

                        $answer_new_id = $answers_db->lastInsertId;



                        if($correct_answer == $answer_id) {

                            $correct_answer = $answer_new_id;

                            $questions_db->update(array('correct_answer_id' => $answer_new_id), "question_id = :id", false, array('correct_answer_id' => $answer_new_id, 'id' => $question_id));

                        }

                    }

                    else {

                        array_push($new_answer_ids, $answer_id);

                        $answer_title = $post['answer' . $question_id . '_' . $answer_id];

                        $answers_db->update();

                        $answers_db->update(array('title' => $answer_title), "answer_id = :id", false, array('title' => $answer_title, 'id' => $answer_id));

                    }

                }



                // Process removed ids.

                foreach($old_answers as $answer) {

                    $answer_id = $answer['answer_id'];

                    $exist = false;

                    foreach($new_answer_ids as $id) {

                        if($answer_id == $id) {

                            $exist = true;

                            break;

                        }

                    }



                    if(!$exist) {

                        $answers_db->delete('answer_id = :id', false, array('id' => $answer_id));

                    }

                }

                $questions_db->update(array('title' => $question_title, 'correct_answer_id' => $correct_answer, 'media_type' => $question_media_type),

                    "question_id = :id", false,

                    array('title' => $question_title, 'correct_answer_id' => $correct_answer, 'media_type' => $question_media_type, 'id' => $question_id));



                // Update Media.

                if($question_media_type == 0) {

                    $images = explode(',', $question_image);



                    $image_name1 = "image0_" . $question_id;

                    $media_name1 = $this->uploadMedia($image_name1, $question_media_type);

                    if($media_name1 != null && count($media_name1) > 0){

                        if(count($images) == 0) {

                            array_push($images, $media_name1);

                        }

                        else {

                            $images[0] = $media_name1;

                        }

                    }



                    $image_name2 = "image1_" . $question_id;

                    $media_name2 = $this->uploadMedia($image_name2, $question_media_type);

                    if($media_name2 != null && count($media_name2) > 0){

                        if(count($images) <= 1) {

                            array_push($images, $media_name2);

                        }

                        else {

                            $images[1] = $media_name2;

                        }

                    }



                    $image_name3 = "image2_" . $question_id;

                    $media_name3 = $this->uploadMedia($image_name3, $question_media_type);

                    if($media_name3 != null && count($media_name3) > 0){

                        if(count($images) <= 2) {

                            array_push($images, $media_name3);

                        }

                        else {

                            $images[2] = $media_name3;

                        }

                    }



                    $string_images = implode(',', $images);

                    $questions_db->update(array('image' => $string_images),

                        "question_id = :id", false,

                        array('image' => $string_images, 'id' => $question_id));





                } else if($question_media_type == 1) {

                    // Video.

                    $video_name = "media_video_" . $question_id;

                    $media_name = $this->uploadMedia($video_name, $question_media_type);

                    if($media_name != null && count($media_name) > 0){

                        $questions_db->update(array('video' => $media_name),

                            "question_id = :id", false,

                            array('video' => $media_name, 'id' => $question_id));

                    }

                } else if($question_media_type == 3) {

                    // PDF.

                    $pdf_name = "media_pdf_" . $question_id;

                    $media_name = $this->uploadMedia($pdf_name, $question_media_type);



                    if($media_name != null && count($media_name) > 0){

                        $questions_db->update(array('pdf' => $media_name), "question_id = :id", false, array('pdf' => $media_name, 'id' => $question_id));

                    }

                }

            }

        }



        foreach($old_questions as $question) {

            $question_id = $question['question_id'];

            $exist = false;



            foreach($question_ids as $id) {

                if($question_id == $id) {

                    $exist = true;

                    break;

                }

            }



            if(!$exist) {

                $this->removeQuestion($question_id);

            }

        }



        $this->gotoCourseListPage();

    }

    

    public function getUserLoginData() {

        session_start();

        echo $_SESSION['userdata'];

    }



    public function addCoursefile($post) {

        if (count($_FILES) == 0) {

            return json_encode(array('filename' => 'x'));

        }



        foreach($_FILES as $key => $file) {

            $data = array();

            switch ($post['type']) {
                case 'image': $media_name = $this->uploadFile($file, 0);  break;
                case 'pdf': $media_name = $this->uploadFile($file, 3);  break;

                case 'video': $media_name = $this->uploadFile($file, 1);break;

                case 'ppt': $media_name = $this->uploadFile($file, 2);break;                            

            }                        

        }



        return json_encode(array('filename' => $media_name));

    }

    



    public function addCourse($post) { // update course     

        $returnDetail = array();

        $course_db  = new db('course');

        $course = $post->courseData;

        $data = array(

            'course_name' => $course->course_name,

            'course_description' => isset($course->course_description) ? $course->course_description : '',

            'course_category_id' => $course->course_category_id,

            'course_type' => $course->course_type,

            'status' => $course->status,

            'user_id' => isset($course->user_id) ? $course->user_id : 0,

            'time_limit' => $course->time_limit,

            'is_randomized' => $course->is_randomized,

            'display_error_message' => $course->display_error_message,

            'reorder' => $course->reorder,

            'is_comeback' => $course->is_comeback,

            'try_again' => $course->try_again,

            'is_global' => $course->is_global,

            'is_auto_inactive' => $course->is_auto_inactive,

            'auto_inactive_time' => isset($course->auto_inactive_time) ? $course->auto_inactive_time : '0000-00-00'

        );



        $course_db->insert($data);

        $course_id = $course_db->lastInsertId;

        $returnDetail['course_id'] = $course_id;



        // Save Questions.

        $questions_db  = new db('questions');

        $answers_db = new db('answers');



        $course_question_count = $course->question_count;

        if(isset($course_question_count)) {

            for($i = 0; $i < $course_question_count; $i++) {

                $question_title = $course->questions[$i]->title;               

                $question_media_type = (isset($course->questions[$i]->media_type)) ? $course->questions[$i]->media_type : 0;

                $question_answer_count = $course->questions[$i]->answer_count;

                $correct_answer = $course->questions[$i]->correct_answer;



                $question_data = array(

                    'title' => $question_title,

                    'media_type' => $question_media_type,

                    'course_id' => $course_id,

                );

                            

                

                $questions_db->insert($question_data);

                $question_id = $questions_db->lastInsertId;

                $returnDetail['questions']['index'][$i] = $question_id; 





                for($j = 0; $j < $question_answer_count; $j++) {

                    $answer_data = array(

                        'title' => $course->questions[$i]->answers[$j]->title,

                        'question_id' => $question_id,

                    );



                    $answers_db->insert($answer_data);

                    $answer_id = $answers_db->lastInsertId;



                    if($correct_answer == $j) {

                        $questions_db->update(array('correct_answer_id' => 0), "question_id = :id", false, array('correct_answer_id' => $answer_id, 'id' => $question_id));

                    }

                }

            }

        }

        session_start();

        $_SESSION['coursedetail'] = $returnDetail;

        

        echo json_encode($returnDetail);

        //$this->gotoCourseListPage();

    }



    function gotoCourseListPage() {

        $url = $this->server_url . '/#/trainingcourses';

        header("location: $url");

        exit();

    }



    public function delCourse($post) {

        $course_db = new db('course');

        $questions_db  = new db('questions');

        $answers_db = new db('answers');



        $course_id = $post->course_id;

        $user_id = $post->user_id;



        // Get all questions.

        $sql = "SELECT * FROM questions WHERE course_id = " . $course_id;

        $questions_db->select(false,false, $sql, array());

        while ($questions_db->getRow()) {

            $question = $questions_db->row;

            $question_id = $question['question_id'];



            // Remove all answers.

            $answers_db->delete('question_id = :id', false, array('id' => $question_id));

        }



        $questions_db->delete('course_id = :id', false, array('id' => $course_id));

        $course_db->delete('course_id = :id', false, array('id' => $post->course_id));



        return ($this->getCourseData($user_id));

    }



    function removeQuestion($question_id) {

        $questions_db  = new db('questions');

        $answers_db = new db('answers');



        // Remove all answers.

        $answers_db->delete('question_id = :id', false, array('id' => $question_id));



        // Remove Question.

        $questions_db->delete('question_id = :id', false, array('id' => $question_id));

    }
    //newly added
    public function getSpecificReminder($post){
        $e = new db("reminders");

        $e->select("id = :id", false, false, array("id" => $post->id));

        $e->getRow();
        switch($e->row["email_name"]){
            case "Birthday": $e->row['description'] = "Email advising an employee’s birthday is approaching"; break;
            case "VISA Check": $e->row['description'] = "Email advising that an employee’s visa expiry date is approaching"; break;
            case "Training Course Due": $e->row['description'] = "Email advising that an employee’s training course is overdue"; break;
            case "Safety Data Sheet Expiry": $e->row['description'] = "Email advising that a SDS is about to expire"; break;
            case "Schedule a Service": $e->row['description'] = "Email advising plant or equipment is due for a schedule or service"; break;
            case "Test and Tag": $e->row['description'] = "Email advising testing and tagging of an item is required"; break;
            case "Safe Work Procedures": $e->row['description'] = "Email advising an employee’s SWP competency sign off is overdue"; break;
            case "Licence and Qualification": $e->row['description'] = "Email advising an employee’s licence or qualification is about to expire"; break;
            case "Probation Period": $e->row['description'] = "Email advising that an employee’s 3 month probationary period is about to expire"; break;
            case "Qualification Period": $e->row['description'] = "Email advising that an employee’s 6 month qualification period is about to expire"; break;
            case "Injury Register": $e->row['description'] = "Email advising an outstanding item on a prior injury needs to be reviewed."; break;
        }
        
        $reminder = $e->row;

        $reminder['employee_name'] = $this->getEmployeeName($reminder['employee_id']);

        $e->select("employee_id = :employee_id", false, false, array("employee_id" => $reminder["employee_id"]));

        $reminders = array();

        while($e->getRow()){
            switch($e->row["email_name"]){
                case "Birthday": $e->row['description'] = "Email advising an employee’s birthday is approaching"; break;
                case "VISA Check": $e->row['description'] = "Email advising that an employee’s visa expiry date is approaching"; break;
                case "Training Course Due": $e->row['description'] = "Email advising that an employee’s training course is overdue"; break;
                case "Safety Data Sheet Expiry": $e->row['description'] = "Email advising that a SDS is about to expire"; break;
                case "Schedule a Service": $e->row['description'] = "Email advising plant or equipment is due for a schedule or service"; break;
                case "Test and Tag": $e->row['description'] = "Email advising testing and tagging of an item is required"; break;
                case "Safe Work Procedures": $e->row['description'] = "Email advising an employee’s SWP competency sign off is overdue"; break;
                case "Licence and Qualification": $e->row['description'] = "Email advising an employee’s licence or qualification is about to expire"; break;
                case "Probation Period": $e->row['description'] = "Email advising that an employee’s 3 month probationary period is about to expire"; break;
                case "Qualification Period": $e->row['description'] = "Email advising that an employee’s 6 month qualification period is about to expire"; break;
                case "Injury Register": $e->row['description'] = "Email advising an outstanding item on a prior injury needs to be reviewed."; break;
            }
            array_push($reminders, $e->row);
        }
        
        echo json_encode(array("reminder" => $reminder, "reminders" => $reminders));

    }
    //newly added
    public function deleteReminder($post){
        $d = new db('reminders');

        $d->select("id = :id", false, false, array("id" => $post->reminder->id));
        $d->getRow();
        $employee_id = $d->row["employee_id"];
        $sql = "SELECT count(*) AS alerts_count FROM reminders WHERE alert_status = 1 AND employee_id =". $employee_id;
        $d->select(false, false, $sql);
        $d->getRow();
        $alerts_count = $d->row["alerts_count"];
        
        $alerts_count --;
        $d->delete('id = :id', false, array('id' => $post->reminder->id));
        
        $d->update(array("alerts_count" => 0), "employee_id = :id", false, array("alerts_count" => $alerts_count, "id" => $employee_id));
        


        $d->select(false, false, "SELECT * FROM reminders");

        $data = array();

        while($d->getRow()){
            switch($d->row["email_name"]){
                case "Birthday": $d->row['description'] = "Email advising an employee’s birthday is approaching"; break;
                case "VISA Check": $d->row['description'] = "Email advising that an employee’s visa expiry date is approaching"; break;
                case "Training Course Due": $d->row['description'] = "Email advising that an employee’s training course is overdue"; break;
                case "Safety Data Sheet Expiry": $d->row['description'] = "Email advising that a SDS is about to expire"; break;
                case "Schedule a Service": $d->row['description'] = "Email advising plant or equipment is due for a schedule or service"; break;
                case "Test and Tag": $d->row['description'] = "Email advising testing and tagging of an item is required"; break;
                case "Safe Work Procedures": $d->row['description'] = "Email advising an employee’s SWP competency sign off is overdue"; break;
                case "Licence and Qualification": $d->row['description'] = "Email advising an employee’s licence or qualification is about to expire"; break;
                case "Probation Period": $d->row['description'] = "Email advising that an employee’s 3 month probationary period is about to expire"; break;
                case "Qualification Period": $d->row['description'] = "Email advising that an employee’s 6 month qualification period is about to expire"; break;
                case "Injury Register": $d->row['description'] = "Email advising an outstanding item on a prior injury needs to be reviewed."; break;
            }
            
            $d->row["employee_name"] = $this->getEmployeeName($d->row["employee_id"]);
            $e = new db("employee");
            $e->select("id = :id", false, false, array("id" => $d->row["employee_id"]));
            $e->getRow();
            $d->row["active"] = $e->row["active"];
            date_default_timezone_get("Australia/Sydney");
            $da = strtotime($d->row["alert_expiry"]);
            
            $today = date("Y-m-d");
            if($today > date("Y-m-d", $da)){
                $d->row["alert_expiry_status"] = 1;
            }else{
                $d->row["alert_expiry_status"] = 0;
            }
            array_push($data, $d->row);
        }
        
        echo json_encode(array("reminders" => $data));
    }
    //newly added
    public function removeLog($post) {

        $e  = new db('employee_notes');

        $employee_notes_id = $post->log_id;

        $today = date("Y-m-d H:i:s");
        
        $emp_notes['updated_time'] = $today;

        $e->select("id = :id", false, false, array('id' => $post->log_id));
        $rows = array();
        while ($e->getRow()) {

            array_push($rows, $e->row);

        }
        $row = array();
        $row = $rows[0];

        
        $data1 = array();

        $data1['who'] = $row['entered_employee_name'];

        $data1['what'] = "Removed a call log ". $employee_notes_id ." on ". $row['employee_firstname'] ." ". $row['employee_lastname'] ." file.";

        $date1['time'] = $today;

        $data1['account_id'] = $row['entered_employee_id'];

        $sl = new db("system_logs");
        
        $sl->insert($data1);

        $e->delete('id = :id', false, array('id' => $employee_notes_id));
        
        echo json_encode(array('success' => 200));
    }

    //newly added
    public function removeLQ($post) {

        $e  = new db('user_license');

        $employee_license_id = $post->log_id;
        $e->delete('id = :id', false, array('id' => $employee_license_id));
        
        echo json_encode(array('success' => 200));
    }
    //newly added
    public function removeConf($post) {
        date_default_timezone_set("Australia/Sydney");
        // $date = date('Y-m-d H:i:s');
        $today = date("Y-m-d H:i:s");
        $data1 = array();

        $e = new db("employee_notes");
        
        $e->select("id = :id", false, false, array('id' => $post->log_id));

        $rows = array();
        while ($e->getRow()) {

            array_push($rows, $e->row);

        }
        $row = array();
        $row = $rows[0];

        $data1['who'] = $row['entered_employee_name'];

        $data1['what'] = "Removed a confidentiality flag from ". $row['employee_firstname'] ." ". $row['employee_lastname'] ." file.";

        $date1['time'] = $today;

        $data1['account_id'] = $row['entered_employee_id'];

        $sl = new db("system_logs");
        $sl->insert($data1);
        
        $e->update(array("mark_c" => 0), "id = :id", false, array("mark_c" => 0, "id" => $post->log_id));
        echo json_encode(array('success' => 200));

    }
    //newly added
    public function allScores($id,$year,$userId){
        $employee_name = array();
        $total_score = array();
        $e = new db("user_work");
        $sql = "SELECT DISTINCT(site_location) FROM user_work WHERE user_id = ".$id;
        $e->select(false, false, $sql);
        $e->getRow();
        $site_location = $e->row["site_location"];

        $pf = new db("performance_forms");
        $sql = "SELECT DISTINCT pf.employee_id, pf.scores, CONCAT(user.firstname, ' ', user.lastname) AS nm  FROM performance_forms AS pf INNER JOIN user_work AS ewk ON ewk.user_id = pf.employee_id AND ewk.site_location = ".$site_location.
                   " WHERE pf.scores <> '' AND YEAR(review_date) = ".$year;
        $pf->select(false,false,$sql);
        while($pf->getRow()){
            array_push($employee_name, $pf->row["nm"]);
            $scores = explode(",", rtrim($pf->row["scores"], ","));
            $score = 0;
            foreach($scores as $key => $value){
                $score += intval($value);
            }
            array_push($total_score, $score);
        }
        $da = new db("data");
        $da->select("id = :id", false, false, array("id" => $site_location));
        $da->getRow();
        $site_location_name = $da->row["display_text"];
        echo json_encode(array("names" => $employee_name, "scores" => $total_score, "site_location" => $site_location_name));
    }
    //newly added
    public function allScoresByPosition($id,$year,$userId){
        $employee_name = array();
        $total_score = array();
        $e = new db("user_work");
        $sql = "SELECT DISTINCT user_work.* FROM user_work WHERE user_id = ".$id;
        $e->select(false, false, $sql);
        $e->getRow();
        $site_location = $e->row["site_location"];
        $position = $e->row["position"];
        $pf = new db("performance_forms");
        $sql = "SELECT DISTINCT pf.employee_id, pf.scores, CONCAT(user.firstname, ' ', user.lastname) AS nm  FROM performance_forms AS pf INNER JOIN user_work AS ewk ON ewk.user_id = pf.employee_id AND ewk.site_location = ".$site_location." AND ewk.position = ".$position.
                    " WHERE pf.scores <> '' AND YEAR(pf.review_date) = ".$year;
        $pf->select(false,false,$sql);
        while($pf->getRow()){
            array_push($employee_name, $pf->row["nm"]);
            $scores = explode(",", rtrim($pf->row["scores"], ","));
            $score = 0;
            foreach($scores as $key => $value){
                $score += intval($value);
            }
            array_push($total_score, $score);

        }
        $da = new db("data");
        $da->select("id = :id", false, false, array("id" => $site_location));
        $da->getRow();
        $site_location_name = $da->row["display_text"];
        $da->select("id = :id", false, false, array("id" => $position));
        $da->getRow();
        $position_name = $da->row["display_text"];
        echo json_encode(array("names" => $employee_name, "scores" => $total_score, "site_location" => $site_location_name, "position" => $position_name));
    }
    //newly added
    public function getDaysOverdueBySiteLocation($userId){
       $site_locations = array();
       $days_overdue = array();
       $ek = new db("user_work");
       $sql = "SELECT DISTINCT ewk.site_location as sl FROM user_work AS ewk INNER JOIN performance_forms AS pf ON pf.employee_id = ewk.user_id AND pf.account_id = ".$userId;
       $ek->select(false,false,$sql);
       while($ek->getRow()){
           
           $da = new db("data");
           $da->select("id = :id", false, false, array("id" => $ek->row["sl"]));
           $da->getRow();
           array_push($site_locations, $da->row["display_text"]);
           $sql = "SELECT pf.assessment_date, pf.review_date, pf.form_status FROM performance_forms AS pf INNER JOIN user_work AS emk ON emk.site_location = ".$ek->row["sl"]. " AND emk.user_id = pf.employee_id";
           $pf = new db("performance_forms");
           $pf->select(false, false, $sql);
           $over_due = 0;
           while($pf->getRow()){
               if($pf->row["form_status"] == 'completed'){
                    if($pf->row["assessment_date"] < $pf->row["review_date"]){
                       
                        $over_due += $this->dateDiff($pf->row["assessment_date"], $pf->row["review_date"]);
                    }
               }else{
                    $today = date_format(new DateTime(), "Y-m-d");
                    if($pf->row["assessment_date"] < $today){
                       
                        $over_due += $this->dateDiff($pf->row["assessment_date"], $today);
                    }
               }
           }
           array_push($days_overdue, $over_due);
       }
       $pieData = array();
       $pieData["data"] = $days_overdue;
       $pieData["label"] = $site_locations;
       echo json_encode(array("pieData" => $pieData));
    }
    //newly added
    public function getDaysOverdueDetail($param, $userId){
        $days_overdue = array();
        $employee_names = array();

        $da = new db("data");
        $da->select("display_text = :id", false, false, array("id" => $param));
        $da->getRow();
        $site_location = $da->row["id"];

        $sql = "SELECT DISTINCT pf.employee_id, pf.assessment_date, pf.review_date, pf.form_status, CONCAT(user.firstname, ' ', user.lastname) AS nm FROM performance_forms AS pf INNER JOIN user_work AS emk ON emk.site_location = ".$site_location. " AND emk.user_id = pf.employee_id INNER JOIN user as user ON user.id = emk.user_id";
        $pf = new db("performance_forms");
        $pf->select(false, false, $sql);
        
        while($pf->getRow()){
            $pf1 = new db("performance_forms");
            $pf1->select("employee_id = :id", false, false, array("id" => $pf->row["employee_id"]));
            $over_due = 0;
            while($pf1->getRow()){
                if($pf1->row["form_status"] == 'completed'){
                    if($pf1->row["assessment_date"] < $pf1->row["review_date"]){
                    
                        $over_due += $this->dateDiff($pf1->row["assessment_date"], $pf1->row["review_date"]);
                    }
                }else{
                    $today = date_format(new DateTime(), "Y-m-d");
                    if($pf1->row["assessment_date"] < $today){
                    
                        $over_due += $this->dateDiff($pf1->row["assessment_date"], $today);
                    }
                }
                
            }
            array_push($employee_names, $pf->row["nm"]);
            array_push($days_overdue, $over_due);
        }
        
        $pieData = array();
        $pieData["data"] = $days_overdue;
        $pieData["label"] = $employee_names;
        echo json_encode(array("pieData" => $pieData));
     }
    
    public function dateDiff($date1, $date2){
        $review_date = date_create($date1);
        $assessment_date = date_create($date2);
        $diff = date_diff($review_date, $assessment_date);
        return intval($diff->format("%a"));
    }
    // Search Courses.

    public function searchCourse($post) {

        $keyword = $post->keyword;

        $course_table = new db('course');



        $data = array();

        $sql = "SELECT * FROM course WHERE course_name LIKE '%". $keyword ."%'";

        $course_table->select(false,false, $sql, array());



        while ($course_table->getRow()) {

            array_push($data, $course_table->row);

        }

        echo json_encode(array('courses' => $data));

    }



    // Alloc Course.

    public function allocCourse($post) {

        

        $db = new db('alloc_course');

        $data = array(

            'course_id' => $post->allocCourseData->course_id,

            'course_supervisor' => $post->allocCourseData->course_supervisor,

            'employee_id' => $post->allocCourseData->employee_id,

            'expire_hours' => $post->allocCourseData->expire_hours,

            'alloc_date' => $post->allocCourseData->alloc_date,

            'is_sending_email' => $post->allocCourseData->is_sending_email,

            'status' => $post->allocCourseData->status,

            'user_id' => $post->allocCourseData->user_id,

            'created_on' => date('Y-m-d H:i:s'),

            'updated_on' => date('Y-m-d H:i:s'),

        );

        

       

        $db->insert($data);

        $email_content = "";

        if($post->allocCourseData->is_sending_email == 1) {

            $email_content = $this->sendEmailForAllocCourse($post->allocCourseData->course_id, $post->allocCourseData->employee_id, $post->allocCourseData->user_id, $post->allocCourseData->expire_hours, $post->allocCourseData->alloc_date);

        }



        echo json_encode(array('alloc_course_id ' => $db->lastInsertId, 'alloc_date' => $post->allocCourseData->alloc_date, 'email_content' => $email_content));

    }



    public function updateAllocCourse($post) {

        $alloc_course_table = new db('alloc_course');



        $id = $post->allocCourseData->id;

        $course_id = $post->allocCourseData->course_id;

        $course_description = $post->allocCourseData->course_description;

        $course_supervisor = $post->allocCourseData->course_supervisor;

        $employee_id = $post->allocCourseData->employee_id;

        $expire_hours = $post->allocCourseData->expire_hours;

        $alloc_date = $post->allocCourseData->alloc_date;

        $is_sending_email = $post->allocCourseData->is_sending_email;

        $status = $post->allocCourseData->status;

        $user_id = $post->allocCourseData->user_id;
        
        $alloc_date = date('Y-m-d H:i:s', strtotime($post->allocCourseData->alloc_date));

        $alloc_course_table->update(array('course_id' => $course_id, 'course_supervisor' => $course_supervisor, 'employee_id' => $employee_id,
            'expire_hours' => $expire_hours, 'alloc_date' => $alloc_date, 'is_sending_email' => $is_sending_email, 'status' => $status), "id = :id", false,
            array('course_id' => $course_id, 'course_supervisor' => $course_supervisor, 'employee_id' => $employee_id,
                'expire_hours' => $expire_hours, 'alloc_date' => $alloc_date, 'is_sending_email' => $is_sending_email, 'status' => $status, 'id' => $id));



        if($post->allocCourseData->is_sending_email == 1) {

            $email_content = $this->sendEmailForAllocCourse($post->allocCourseData->course_id, $post->allocCourseData->employee_id, $post->allocCourseData->user_id, $post->allocCourseData->expire_hours, $post->allocCourseData->alloc_date);

        }

        echo json_encode(array('alloc_course_id ' => $id, 'alloc_date' => $post->allocCourseData->alloc_date, 'content' => $email_content));

    }



    public function getAllocCourseData($user_id) {

        $alloc_course = new db('alloc_course');

        $data = array();

        $sql = "SELECT ac.id, ac.status, ac.alloc_date, ac.expire_hours, ac.completed_date, course.course_name, 

                        user.firstname, user.lastname, 
                        (SELECT TIMEDIFF(DATE_ADD(ac.alloc_date, INTERVAL ac.expire_hours HOUR), NOW())) AS TimeLeft,
                    (CASE
                        WHEN ac.status = 0 THEN 'Pending'
                        WHEN ac.status = 1 THEN 'Completed'
                        WHEN ac.status = 2 THEN 'Overdue'
                    END) AS course_status                     
                 FROM alloc_course AS ac 

                 JOIN course AS course ON ac.course_id = course.course_id

                 JOIN user AS user ON ac.employee_id = user.id 

                WHERE ac.user_id = :u 

             ORDER BY ac.created_on DESC";

        $alloc_course->select(false,false, $sql, array('u' => $user_id));



        while ($alloc_course->getRow()) {

            array_push($data, $alloc_course->row);

        }

        echo json_encode(array('alloc_courses' => $data));

    }



    public function getAllocCourseByID($params) {

        $alloc_course_id = $params->alloc_course_id;

        $alloc_course_db = new db('alloc_course');

        $course_db = new db('course');

        $user_db = new db('user');



        $sql = "SELECT * FROM alloc_course WHERE id = :id";



        $alloc_course_db->select(false,false, $sql, array('id' => $alloc_course_id));

        $alloc_course_db->getRow();

        $alloc_course = $alloc_course_db->row;



        // Get Course.

        $course_id = $alloc_course["course_id"];

        $sql = "SELECT * FROM course WHERE course_id = :id";

        $course_db->select(false,false, $sql, array('id' => $course_id));

        $course_db->getRow();

        $course = $course_db->row;

        $alloc_course["course"] = $course;



        // Get Supervisor.

        $course_supervisor = $alloc_course["course_supervisor"];

        $sql = "SELECT * FROM user WHERE id = :id";

        $user_db->select(false,false, $sql, array('id' => $course_supervisor));

        $user_db->getRow();

        $supervisor_user = $user_db->row;

        $alloc_course["supervisor_user"] = $supervisor_user;



        // Get Employee.

        $employee_id = $alloc_course["employee_id"];

        $sql = "SELECT * FROM user WHERE id = :id";

        $user_db->select(false,false, $sql, array('id' => $employee_id));

        $user_db->getRow();

        $employee_user = $user_db->row;

        $alloc_course["employee_user"] = $employee_user;



        echo json_encode(array('alloc_course' => $alloc_course, 'alloc_course_id' => $alloc_course_id, 'sql' => $sql));

    }



    public function delAllocCourse($post) {

        $alloc_course = new db('alloc_course');

        $alloc_course_id = $post->alloc_course_id;

        $user_id = $post->user_id;

        // Get all questions.

        $alloc_course->delete('id = :id', false, array('id' => $alloc_course_id));

        return ($this->getAllocCourseData($user_id));

    }



    function get_data($url) {

        $ch = curl_init();

        $timeout = 5;

        curl_setopt($ch, CURLOPT_URL, $url);

        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);

        curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, $timeout);

        $data = curl_exec($ch);

        curl_close($ch);

        return $data;

    }

    
    //newly inserted for system logs
    // Update the course status if the course is finished

    public function updateCourseStatus($params) {

        

        $ac = new db('alloc_course');

        $ac->select('employee_id = :eid AND course_id = :cid', false, false, array('eid' => $params->employee_id, 'cid' => $params->course_id));

        $ac->getRow();

        $attempt = $ac->attempts + 1;

        

        

        $q = new db('questions');        

        $q->select('course_id = :cid',false, false, array('cid' => $params->course_id));

          

        $a = new db('submitted_answers');

        $a->select('employee_id = :eid AND course_id = :cid AND attempt = :a', false, false, array('eid' => $params->employee_id, 'cid' => $params->course_id, 'a' => $attempt));

        

               

        // All questions answered

        if ($q->numRows == $a->numRows) {

            $c = new db('submitted_answers');

            $c->select('employee_id = :eid AND course_id = :cid AND is_correct = :c AND attempt = :a', false, false, array('eid' => $params->employee_id, 'cid' => $params->course_id, 'c' => 1, 'a' => $attempt));

            

            // If number correct equals total number of questions - passed course

            if ($c->numRows == $a->numRows) {
                $ac = new db('alloc_course');
                $flds = array('status' => 1, 'completed_date' => date('Y-m-d H:i:s'));
                $data = array('status' => 1, 'completed_date' => date('Y-m-d H:i:s'), 'cid' => $params->course_id, 'eid' => $params->employee_id);
                $ac->update($flds,'course_id = :cid AND employee_id = :eid', 1, $data);
                $sl = new db("system_logs");
                $c = new db("course");
                $sql = "SELECT course_name FROM course WHERE course_id =". $params->course_id;
                $c->select(false, false, $sql);
                $c->getRow();
                $course_name = $c->row["course_name"];
                $c = new db("employee");
                $sql = "SELECT CONCAT(firstname,' ',lastname) as employee_name, account_id FROM employee WHERE employee_id =". $params->employee_id;
                $c->select(false, false, $sql);
                $c->getRow();
                $employee_name = $c->row["employee_name"];
                $account_id = $c->row["account_id"];
                $sl = new db("system_logs");
                $data1 = array();


                $data1['who'] = $employee_name;

                $data1['what'] = "course ". $course_name ." completed.". $employee_name;

                $date1['time'] = date('Y-m-d H:i:s');

                $data1['account_id'] = $account_id;

                $sl->insert($data1);
            } else {

                

            }            

            

            // Update the attempts

            $ac = new db('alloc_course');

            $ac->update(array('attempts' => 1), 'course_id = :cid AND employee_id = :eid', 1, array('attempts' => $attempt, 'cid' => $params->course_id, 'eid' => $params->employee_id));

            

            

            

        }

        

        

    }

    

    public function saveCourseAnswer($params) {

        $ac = new db('alloc_course');

        $ac->select('course_id = :cid AND employee_id = :eid', false, false, array('cid' => $params->course_id, 'eid' => $params->employee_id));

        $ac->getRow(); 

        $attempt = $ac->attempts + 1;

        

        $q = new db('questions');

        $q->select('question_id = :qid', false, false, array('qid' => $params->question_id));

        $q->getRow();    

        

        $data = array();

        $data['employee_id'] = $params->employee_id;

        $data['course_id'] = $params->course_id;

        $data['question_id'] = $params->question_id;

        $data['answer_id'] = $params->answer_id;        

        $data['attempt'] = $attempt;

        $data['is_correct'] = ($q->correct_answer_id == $params->answer_id) ? 1 : 0;

   

        $db = new db('submitted_answers');    

        $db->insert($data);

        

        $result = array();

        $result['numCorrect'] = 0;

        $result['totalQuestions'] = 0;

        $db = new db('submitted_answers');

        $db->select('employee_id = :eid AND course_id = :cid AND attempt = :a', false, false, array('eid' => $params->employee_id, 'cid' => $params->course_id, 'a' => $attempt));

        

        while ($db->getRow()) {

            $result['totalQuestions']++;

            if ($db->is_correct == 1) {

                $result['numCorrect']++;

            }

        }

        

        if ($result['numCorrect'] == 0) {

            $result['percentageScore'] = '0%';

        } else {

            $result['percentageScore'] = number_format((($result['numCorrect'] / $result['totalQuestions']) * 100),2).'%';            

        }         

  

        $this->updateCourseStatus($params);

        

        return json_encode($result);

    }

    

    public function removeFile($params) { 

        $path = getcwd().'/assets/uploads/';

        $q = new db('questions');

        $q->select('question_id = :qid', false, false, array('qid' => $params->questionId));

        $q->getRow();

        

        if ($q->video) {

            if (file_exists($path.$q->video) === true) {

                unlink($path.$q->video);

            } 

        }

        if ($q->ppt) {

            if (file_exists($path.$q->ppt) === true) {

                unlink($path.$q->ppt);

            }             

        }

        if ($q->image) {

            if (file_exists($path.$q->image) === true) {

                unlink($path.$q->image);

            }             

        }

        if ($q->pdf) {

            if (file_exists($path.$q->pdf) === true) {            

                unlink($path.$q->pdf);

            }             

        }

        

        $flds = array('media_type' => 0, 'video' => '', 'ppt' => '', 'image' => '', 'pdf' => '');

        $params = array('media_type' => 0, 'video' => '', 'ppt' => '', 'image' => '', 'pdf' => '', 'qid' => $params->questionId);

        $q->update($flds,'question_id = :qid', 1, $params);

       

    }



    function sendEmailForAllocCourse($course_id, $employee_id, $user_id, $expire_hours, $alloc_date) {

        $course_db = new db('course');

        $user_db = new db('user');



        // Get Course.

        $sql = "SELECT * FROM course WHERE course_id = :id";

        $course_db->select(false,false, $sql, array('id' => $course_id));

        $course_db->getRow();

        $course = $course_db->row;



        // Get Employee.

        $sql = "SELECT * FROM user WHERE id = :id";

        $user_db->select(false,false, $sql, array('id' => $employee_id));

        $user_db->getRow();

        $employee = $user_db->row;



        // Get Current User Id.

        $sql = "SELECT * FROM user WHERE id = :id";

        $user_db->select(false,false, $sql, array('id' => $user_id));

        $user_db->getRow();

        $user = $user_db->row;



        $employee_name = $employee["firstname"] . " " . $employee["lastname"];

        $employee_username = $employee["username"];

        $employee_password = $employee["public_password"];

        $employee_email = $employee["email"];



        $company_name = $user["companyname"];

        $company_email = $user["email"];



        $date = strtotime($alloc_date);

        $active_date = date("d/m/Y", $date);



        $course_name = $course["course_name"];

        $login_link = "http://hrmaster.com.au/#/login";

        

        $c = new db('alloc_date');

        $sql = "SELECT DATE_FORMAT(ADDDATE(`alloc_date`, INTERVAL `expire_hours` HOUR), '%e/%m/%Y') as expire_date FROM alloc_course WHERE course_id = :course AND employee_id = :eid";        

        $c->select(false,false, $sql, array('course' => $course_id, 'eid' => $employee_id));

        $c->getRow();

        $expire_date = $c->expire_date;

        

       

        /*$expire = date_create($active_date);

        date_add($expire, date_interval_create_from_date_string($expire_hours . "hours"));

        $expireAfter = strtotime(date_format($expire, 'Y-m-d H:i:s'));

        $expire_date = date("d/m/Y",$expireAfter);   */



        $content = "<p>Dear ". $employee_name ."</p>";

        $content .= "<p>". $company_name ." has set a training account for you on " .$active_date. " for the training module of " . $course_name. ". You will be required to complete all questions correctly to pass this module. Your result will be sent directly to " .$company_name. " for quality assurance and training purposes.</p>";

        $content .= "<p>You will need to click the following link <a href='" . $login_link . "'> " . $login_link. "</a> and enter the following details as your username and password(". $employee_username ." / " . $employee_password . "). This course will expire on the " .$expire_date. ". Please ensure this course is finished by that time and you are encouraged to speak to your supervisor if you are unsure of any of the details.</p>";

        $content .= "<p>Best of luck</p>";





        try {

            $file_content = $this->get_data('http://hrmaster.com.au/assets/php/email_templates/alloc_course_email_template.html');

        }

        catch (Exception $e) {

            $file_content = $e->getMessage();

        }



        $file_content = str_replace("<div id='message-content'></div>", $content, $file_content);



        $subject = 'HR Master Training Details';

        $headers = "MIME-Version: 1.0\r\n";

        $headers .= "From: " . $company_name . " <" . $company_email . ">\r\n";

        $headers .= "Reply-To: " . $company_email . "\r\n";

        $headers .= "Return-Path: ". $company_email ."\r\n";

        $headers .= "X-Priority: 3\r\n";

        $headers .= "X-Mailer: PHP". phpversion() ."\r\n";

        $headers .= "Content-Type: text/html; charset=ISO-8859-1\r\n";



        mail($employee_email, $subject, $file_content, $headers);

        return $file_content;

    }

    

    public function getHSData($post) {

        $managers = $this->getUsersByType($post->user->account_id, 18, false);

        $db = new db('hazardous_substance');

        $sql = "SELECT *, site_location_id as SLI, DATE_FORMAT(expiry_date, '%e/%m/%Y') AS Expiration, 

                    (SELECT display_text FROM data WHERE id = SLI ) AS 'site_location'

                  FROM hazardous_substance hs

                 WHERE account_id = :aid

                   AND deleted = :del

                 ORDER BY date_created ASC";

                               

        $db->select(false, false, $sql, array('aid' => $post->user->account_id, 'del' => 0));

        $hs = array();

        while($db->getRow()) {

            $db->row['SDS_Available'] = ($db->row['has_sds'] == 1) ? "Yes" : "No";

            array_push($hs, $db->row);

        }

        

        echo json_encode(array('records' => $hs, 'managers' => $managers, 'locations' => $this->getData('sitelocation',$post->user->account_id), 'suppliers' => $this->getData('supplier',$post->user->account_id)));

        

    }

    

    public function saveHS($post) {

        $db = new db('hazardous_substance');

        $data = (array)$post->hs;

        $data['expiry_date'] = date('Y-m-d', strtotime($data['expiry_date']));

        

        if ($data['id'] > 0) {

            $data['date_updated'] = date('Y-m-d H:i:s');

        }

       

        $db->insertupdate($data);          

        $this->getHSData($post);

    }

    

    public function saveSiteData($params) {

        $db = new db('data');



        $data = (array)$params->sitedata;        

        $data['account_id'] = (isset($params->user->account_id)) ? $params->user->account_id : 0; 



        $db->insertupdate($data);          

        $this->getSiteData($params);               

    }



    public function getSiteData($params) {      

        $toCheck = array('position','level','department','entitle', 'testresult','emptype','sitelocation','testfrequency','supplier');

        $sdata = array();

        $types = array();

        $db = new db('data');

        $db->select('type <> :type AND account_id = :aid', 'type ASC', false, array('type' => 'country', 'aid' => $params->account_id));

        while($db->getRow()) {

            array_push($sdata, $db->row);

            if (!in_array($db->type, $types)) {

                array_push($types, $db->type);

            }

        }

        foreach($toCheck as $key => $val) {

            if (!in_array($val, $types)) {

                array_push($types, $val);

            }            

        }

        

        echo json_encode(array('sitedata' => $sdata, 'datatype' => $types));

        

    }

}

?>