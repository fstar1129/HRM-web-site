<?php

if (!class_exists('db')) {
    require('db.class.php');
}
if (!class_exists('transaction')) {
    require('transaction.class.php');
}

if(!ini_get('date.timezone')) {
    date_default_timezone_set('GMT');
}

class register {

    function __construct() {

    }

    public function getData($type, $account=0) {
        $data   = array();
        $d      = new db('data');
        $d->select("type = :type AND account_id = :account", 'display_text ASC', false, array('type' => $type, 'account' => $account));
        while ($d->getRow()) {
            array_push($data, $d->row);
        }
        return $data;
    }
    
    public function getARData($account_id=false, $id=false) {
        $data = array();
        $db = new db('asset_register');
        $where = "1"; 
                
        $where .= ($account_id == false) ? '' : ' AND ar.account_id = :aid ';
        $where .= ($id == false) ? '' : ' AND ar.id = :id ';
        $sql = "SELECT ar.*, ar.site_location_id as SLI, ar.department_id AS DI, created_by AS CBY, who_inspected_id AS WI,
                    (SELECT display_text FROM data WHERE id = SLI) AS site_location,
                    (SELECT display_text FROM data WHERE id = DI) AS department,
                    (SELECT CONCAT(firstname,' ',lastname) FROM user WHERE id = CBY ) AS CreatedBy, 
                    (SELECT CONCAT(firstname,' ',lastname) FROM user WHERE id = WI) AS WhoInspected
                  FROM asset_register ar
                 WHERE $where
                   AND deleted = :d
                ORDER BY date_created DESC";
        $params = array('d' => 0);
        if ($account_id) {
            $params['aid'] = $account_id;
        }
        if ($id) {
            $params['id'] = $id;
        }        
        $db->select(false, false, $sql, $params);
        while ($db->getRow()) {
            array_push($data, $db->row); 
        }
        return $data;                
    }

    public function delete($table, $id) {
        $db = new db($table);
        $db->update(array('deleted' => 1), 'id = :id', 1, array('deleted' => 1, 'id' => $id));
    }
    
    public function getAssetRegisterData($post) {       
        $data = array();
        $trans = new transaction();        
        $d = new stdClass();
        $d->currUser = new stdClass();
        $d->currUser->account_id = $post->user->account_id;
        $employees = $trans->getEmployees(array('account_id' => $post->user->account_id), true);
        $users = $trans->getUsers($d, false, false);
        
        $data['users'] = array();
        foreach($employees as $k => $v) {
            array_push($data['users'], array('value' => $v['id'], 'table' => $v['table'], 'display' => $v['name']));
        }
        foreach($users as $k => $v) {
            array_push($data['users'], array('value' => $v['id'], 'table' => $v['table'], 'display' => $v['name']));
        }        
       
                        
        $data['records'] = $this->getARData($post->user->account_id);
        $data['sites'] = $this->getData('sitelocation', $post->user->account_id);
        $data['testresults'] = $this->getData('testresult');
        $data['testfrequency'] = $this->getData('testfrequency');
        $data['departments'] = $this->getData('department', $post->user->account_id);
        echo json_encode($data);
    }
    
    private function filterFields($table, $data) {
        $d = new db($table);
        $flds = array(); 
        $params = array();
        $d->select(false,false, "DESCRIBE $table", array());        
        while($d->getRow()) {
            array_push($flds, $d->Field);
        }
        
        foreach($data as $key => $value) {                      
            if (!in_array($key, $flds) || ($value === '') || is_null($value) || ($key === 'updated_by' && $value === 0)) {
                continue;
            }
            $params[$key] = $value;
        }
        
        return $params;
    }
    
    public function saveAssetRegister($post) {
        $data   = array();
        $d      = new db('asset_register');
        $ardata = (array)$post->ar;
               
        $ardata['purchase_date'] = (isset($ardata['purchase_date'])) ? date('Y-m-d', strtotime($ardata['purchase_date'])) : '';
        $ardata['inspected_date'] = (isset($ardata['inspected_date'])) ? date('Y-m-d', strtotime($ardata['inspected_date'])) : '';
        $ardata['next_test_date'] = (isset($ardata['next_test_date'])) ? date('Y-m-d', strtotime($ardata['next_test_date'])) : '';
        $ardata['service_date'] = (isset($ardata['service_date'])) ? date('Y-m-d', strtotime($ardata['service_date'])) : '';
              
        $ardata = $this->filterFields('asset_register', $ardata);
        
        $a3 = array('service_date','who_inspected_id','who_inspected_table','next_test_date','test_frequency_id','test_result_id','inspected_date');
        $a1 = array('service_schedule_date','service_address','service_phone_number','service_date','service_provider');
        $a2 = array('service_schedule_date','next_test_date','test_frequency_id','who_inspected_id','who_inspected_table','test_result_id','inspected_date');
        
        if ($ardata['action'] == 3) {
            foreach($a3 as $k => $idx) {
                $ardata[$idx] = null;
            }
        } elseif ($ardata['action'] == 1) {
            foreach($a1 as $k => $idx) {
                $ardata[$idx] = null;
            }            
        } elseif ($ardata['action'] == 2) {
            foreach($a2 as $k => $idx) {
                $ardata[$idx] = null;
            }            
        }

        $input = array();
        foreach($ardata as $key => $val) {
            if (!$val) {
                continue;
            }
            $input[$key] = $val;            
        }
                 
        $d->insertupdate($input);
        
        return json_encode($this->getARData($post->user->account_id));
    }

}
?>
