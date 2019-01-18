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

class injuryregister {

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
    
    public function getEmployees($account_id) {
        $data = array();
        $db = new db('employee');
        $db->select('account_id = :aid AND deleted = :notdel', false, false, array('aid' => $account_id, 'notdel' => 0));
        while ($db->getRow()) {
            array_push($data, $db->row);
        }
        return $data;
    }
    

    public function delete($table, $id) {
        $db = new db($table);
        $db->update(array('deleted' => 1), 'id = :id', 1, array('deleted' => 1, 'id' => $id));
    }
    
    public function getInjury($id) {
        $data = array();  
        $db = new db('injury_register');
        $db->select('id = :aid', false, false, array('aid' => $id));
        $db->getRow(); 
        return json_encode($db->row);
    }    
    
    public function getInjuryList($account) {
        $data = array();  
        $db = new db('injury_register');
        $sql = "SELECT *, DATE_FORMAT(incident_date,'%d-%m-%Y') AS dateOfIncident, investigated_by AS investigatedBy, remedial_priority AS remedialPriority,
                            natureofinjury_id AS NID, site_location_id AS SID,
                            (SELECT display_text FROM data WHERE id = SID) AS siteLocation, 
                            (SELECT display_text FROM data WHERE id = NID) AS natureOfInjury,
                        employee_id AS EID, (SELECT CONCAT(firstname,' ',lastname) FROM employee WHERE id = EID) AS injuredName
                 FROM injury_register 
                WHERE account_id = :aid 
                AND deleted = :del
                AND is_complete = :complete";
        $db->select(false, false, $sql, array('aid' => $account, 'del' => 0, 'complete' => 0));
        while ($db->getRow()) {
            array_push($data, $db->row);
        }     
        return $data;
    }
    
    public function getInjuryData($post) {
       
        $data = $this->getInjuryList($post->userData->account_id);
        $employees = $this->getEmployees($post->userData->account_id);
        $locations = $this->getData('injurylocation');
        $nature = $this->getData('injurynature');
        $bodypart = $this->getData('injuredbodypart');
        $mechanism = $this->getData('injurymechanism');
        $sites = $this->getData('sitelocation', $post->userData->account_id);
        
        $rq = array();
        array_push($rq, array('id'=> '', 'name' => 'Please select to give a recommendation'));        
        array_push($rq, array('id'=> 'Kill', 'name' => 'Kill or cause permanent disability/ill health'));
        array_push($rq, array('id'=> '!!!', 'name' => 'Long term illness or serious injury'));
        array_push($rq, array('id'=> '!!', 'name' => 'Medical attention & several days off work'));
        array_push($rq, array('id'=> '!', 'name' => 'First aid needed'));
  
        $rl = array();
        array_push($rl, array('id'=> '', 'name' => 'Please select to give a recommendation'));        
        array_push($rl, array('id'=> '++', 'name' => 'Very likely'));
        array_push($rl, array('id'=> '+', 'name' => 'Likely'));
        array_push($rl, array('id'=> '-', 'name' => 'Unlikely'));
        array_push($rl, array('id'=> '--', 'name' => 'Very unlikely')); 
        
        // Reminder frequency
        $rf = array();
        array_push($rf, array('id'=> '0', 'name' => 'Never'));        
        array_push($rf, array('id'=> '1', 'name' => 'Every day'));
        array_push($rf, array('id'=> '3', 'name' => 'Every 3 days'));
        array_push($rf, array('id'=> '5', 'name' => 'Every 5 days'));
        array_push($rf, array('id'=> '7', 'name' => 'Every 7 days')); 
        array_push($rf, array('id'=> '14', 'name' => 'Every 14 days')); 
        array_push($rf, array('id'=> '28', 'name' => 'Every 28 days')); 
        
        // Remedial priority
        $rp = array();
        for($i=0; $i<=6; $i++) {
            array_push($rp, array('id' => $i, 'name' => $i));
        }
         
        return json_encode(array('injuries' => $data, 'sites' => $sites, 'employees' => $employees, 'locations' => $locations, 'nature' => $nature, 'bodypart' => $bodypart, 'mechanism' => $mechanism, 'rq' => $rq, 'rl' => $rl, 'rf' => $rf, 'rp' => $rp)); 
        
    }
    
    public function saveInjury($post) {
        
        $db = new db('injury_register');
        $params = array();

        $params['id'] = $post->data->id;
        $params['account_id'] = $post->userData->account_id;
        $params['natureofinjury_id'] = $post->data->natureofinjury_id;
        $params['mechanismofinjury_id'] = $post->data->mechanismofinjury_id;
        $params['location_id'] = $post->data->location_id;
        $params['injuredbodypart_id'] = $post->data->injuredbodypart_id;
        $params['insurer_notified'] = $post->data->insurer_notified;
        $params['safework_notified'] = $post->data->safework_notified;
        $params['insurernotified_date'] = isset($post->data->insurernotified_date) ? date('Y-m-d', strtotime($post->data->insurernotified_date)) : '0000-00-00';
        $params['safeworknotified_date'] = isset($post->data->safeworknotified_date) ? date('Y-m-d', strtotime($post->data->safeworknotified_date)) : '0000-00-00';                
        $params['incident_time'] = $post->data->incident_time;
        $params['created_by'] = $post->data->created_by;
        $params['employee_id'] = $post->data->employee_id;
        $params['site_location_id'] = $post->data->site_location_id;
        $params['email_frequency'] = $post->data->email_frequency;
        $params['risk_likelihood'] = $post->data->likelihood_id;
        $params['level_of_risk'] = $post->data->severity_id;

        $params['incident_date'] = date('Y-m-d', strtotime($post->data->incident_date));
        $params['risk_identification'] = isset($post->data->risk_identification) ? $post->data->risk_identification : '';
        $params['risk_assessment'] = isset($post->data->risk_assessment) ? $post->data->risk_assessment : '';
        $params['risk_controls'] = isset($post->data->risk_controls) ? $post->data->risk_controls : '';
        $params['eyewitness'] = isset($post->data->eyewitness) ? $post->data->eyewitness : '';
        $params['investigated_by'] = isset($post->data->investigated_by) ? $post->data->investigated_by : '';
        
        
        $db->insertupdate($params);
        
        
        $data = array();
        $data['injuries'] = $this->getInjuryList($post->userData->account_id);
        return json_encode($data);
    }
    

    


}
?>
