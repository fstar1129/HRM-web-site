<?php
ini_set('display_errors', 'On');
error_reporting(E_ALL | E_STRICT);


if (!class_exists('db')) {
    require('db.class.php');
}

if(!ini_get('date.timezone')){
    date_default_timezone_set('GMT');
}

class course {

    var $lockoutLengthMins = 15;
    var $database = '';
    var $user = array();
    var $server_url = "http://www.hrmaster.com.au";
    var $courseTable = 'courseGR';
    var $questionsTable = 'questionsGR';
    var $answersTable = 'answersGR';

    function __construct() {

    }
    
    // Get the id of the first deleted question for an answer - 0 if none
    private function getExistingAnswer($questionId) {
        $db = new db($this->answersTable);
        $db->select('question_id = :qid AND deleted = :del', 'answer_id ASC', false, array('qid' => $questionId, 'del' => 1));
        if ($db->numRows == 0) {
            return 0;
        } else {
            $db->getRow();
            return $db->answer_id;
        }
    }
    
    
    public function saveAnswers($questionId, $answers, $correctAnswerIndex) {
        $db = new db($this->answersTable);
        $db->update(array('deleted' => 1), 'question_id = :qid', false, array('deleted' => 1, 'qid' => $questionId));
        
        $correctId = 0;
        $db = new db($this->answersTable);
        $counter = -1;
        foreach($answers as $index => $answer) {
            $counter++;
            if (trim($answer->title) == '') {
                continue;  // ignore answers with no name/label
            }
                    
            $existingAnswer = $this->getExistingAnswer($questionId);
            $data = array();
            $data['title'] = $answer->title;
            $data['question_id'] = $questionId;
            
            $cIndex = 0;
            if ($existingAnswer == 0) {
                $db->insert($data);
                $cIndex = $db->lastInsertId;
            } else {
                $data['deleted'] = 0;
                $params = $data;
                $params['aid'] = $existingAnswer;
                $db->update($data, 'answer_id = :aid', 1, $params);
                $cIndex = $existingAnswer;
            }

            if ($counter == $correctAnswerIndex) {
                $correctId = $cIndex;
            }
        }
        return $correctId;
    }
    
    public function saveQuestions($courseId, $questions) {
        $db = new db($this->questionsTable);
        foreach($questions as $index => $obj) {
            $data = array();

            $data['title'] = $obj->title;
            $data['media_type'] = $obj->media_type;
            $data['course_id'] = $courseId;
            $data['image'] = '';
            $data['video'] = '';
            $data['pdf'] = '';        
            switch($data['media_type']) {
                case 0: $data['image'] = $obj->image; break;
                case 1: $data['video'] = $obj->video; break;
                case 3: $data['pdf'] = $obj->pdf; break;
            }
            $db->bindParams = true;
            if ($obj->question_id == 0 || !$obj->question_id) {
                $db->insert($data);
                $recordId = $db->lastInsertId;
            } else {
                $params = $data;
                $params['qid'] = $obj->question_id;
                $db->update($data, 'question_id = :qid', 1, $params);
                $recordId = $obj->question_id;
            }

            $correctAnswerId = $this->saveAnswers($recordId, $obj->answers, $obj->correct_answer_index);
            $db->update(array('correct_answer_id' => 1), 'question_id = :qid', 1, array('correct_answer_id' => $correctAnswerId, 'qid' => $recordId));
        }
    }

    public function saveCourse($course) {
        
        $db = new db($this->courseTable);

        $data = array();
        $data['course_id'] = isset($course->data->course_id) ? $course->data->course_id : 0;
        $data['course_type'] = $course->data->course_type;
        $data['status'] = $course->data->status;
        $data['time_limit'] = $course->data->time_limit;
        $data['is_randomized'] = $course->data->is_randomized;
        $data['display_error_message'] = $course->data->display_error_message;
        $data['reorder'] = $course->data->reorder;
        $data['is_comeback'] = $course->data->is_comeback;
        $data['try_again'] = $course->data->try_again;
        $data['is_global'] = $course->data->is_global;
        $data['correct_only'] = $course->data->correct_only;
        $data['is_auto_inactive'] = $course->data->is_auto_inactive;
        $data['course_category_id'] = $course->data->course_category_id;
        $data['course_name'] = (isset($course->data->course_name)) ? $course->data->course_name : '';
        $data['course_description'] = (isset($course->data->course_description)) ? $course->data->course_description : '';
        $data['user_id'] = $course->userData->id;
        $data['account_id'] = $course->userData->account_id;
        $db->bindParams = true;
        
        $db->insertupdate($data);
        $this->saveQuestions($db->lastInsertId, $course->data->questions);
        
        if ($db->lastInsertId) {
            echo json_encode(array('success' => 1));
        } else {
            echo json_encode(array('success' => 0));
        }
    } 
    
    public function saveFile() {
        $type = $_POST['type'];
        switch($type) {
            case 'image': $directory = 'images/'; break;
            case 'video': $directory = 'video/'; break;
            case 'pdf': $directory = 'pdf/'; break;
        }
        
        $uploadsDir = "/home/hrmaster/public_html/assets/uploads/$directory";
        
        $file = $_FILES['fileToUpload'];
        
        if ($file['error']) {
            echo json_encode(array('success' => 0, 'message' => 'Error uploading file'));
            die;
        }

        $arr = explode('.', $file['name']);
        $extn = array_pop($arr);
        $newName = implode('',$arr).'--'.time().".".$extn;

        move_uploaded_file($file['tmp_name'], "$uploadsDir/".$newName);        
        
        echo json_encode(array('success' => 1, 'message' => 'Success! File uploaded successfully.', 'filename' => $newName, 'href' => 'https://hrmaster.com.au/assets/uploads/'.$directory.$newName));
   
    }
    
    public function getAnswers($qid, $correct_id) {
        $data = array();
        $a = new db($this->answersTable);
        $a->select('question_id = :qid AND deleted = :notdel', 'answer_id ASC', false, array('qid' => $qid, 'notdel' => 0));
        $i = 0;
        $correctIndex = '';
        while($a->getRow()) {
            $a->row['index'] = $i;
            if ($correct_id == $a->answer_id) {
               $correctIndex = $i; 
            }
            array_push($data, $a->row);
            $i++;
        }
        return array('answers' => $data, 'correctIndex' => $correctIndex);
    }
    
    public function getCourse($params) {
        $detail = array();
        $db = new db($this->courseTable);
        $db->select('course_id = :cid', false, false, array('cid' => $params->course_id));
        if ($db->numRows > 0) {
            $db->getRow();
            $detail['detail'] = $db->row;
            $detail['questions'] = array();
            $q = new db($this->questionsTable);
            $q->select('course_id = :cid', 'question_id ASC', false, array('cid' => $params->course_id));
            $idx = 0;
            while ($q->getRow()) {
                $q->row['index'] = $idx;
                $qNum = $idx + 1;
                $q->row['name'] = "Question ".$qNum;
                $q->row['media_type'] = (int)$q->row['media_type'];
                switch($q->row['media_type']) {
                    case '0': $q->row['image_href'] = 'https://hrmaster.com.au/assets/uploads/images/'.$q->image; break;
                    case '1': $q->row['image_href'] = 'https://hrmaster.com.au/assets/uploads/video/'.$q->video; break;
                    case '3': $q->row['image_href'] = 'https://hrmaster.com.au/assets/uploads/pdf/'.$q->pdf; break;
                }
                $aList = $this->getAnswers($q->question_id, $q->correct_answer_id);
                
                $answerList = $aList['answers'];//this->getAnswers($q->question_id);
                $q->row['answer_count'] = count($answerList);
                $q->row['correct_answer_index'] = $aList['correctIndex'];
                $qArr = $q->row;
                $qArr['answers'] = $answerList;
                array_push($detail['questions'], $qArr);
                $idx++;
            }
        }
        
        return json_encode($detail);
    }


    public function removeFile($params) {
        print_r($params);
        
        
    }


}

?>

