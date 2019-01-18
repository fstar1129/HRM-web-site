<?php     

    class email
{

	var $address_valid = true;
	/*
	list of To addresses
	@var	array
	*/
	var $sendto = array();
	/*
	@var	array
	*/
	var $acc = array();
	/*
	@var	array
	*/
	var $abcc = array();
	/*
	paths of attached files
	@var array
	*/
	var $aattach = array();
	/*
	list of message headers
	@var array
	*/
	var $xheaders = array();
	/*
	message priorities referential
	@var array
	*/
	var $priorities = array( '1 (Highest)', '2 (High)', '3 (Normal)', '4 (Low)', '5 (Lowest)' );
	/*
	character set of message
	@var string
	*/
	var $charset = "us-ascii";
	var $ctencoding = "7bit";
	var $receipt = 0;
	var $sendResult		= false;


/*

	Mail contructor

*/

function email()
{
	$this->autoCheck( true );
	$this->boundary= "--" . md5( uniqid("myboundary") );
}


/*

activate or desactivate the email addresses validator
ex: autoCheck( true ) turn the validator on
by default autoCheck feature is on

@param boolean	$bool set to true to turn on the auto validation
@access public
*/
function autoCheck( $bool )
{
	if( $bool )
		$this->checkAddress = true;
	else
		$this->checkAddress = false;
}


/*

Define the subject line of the email
@param string $subject any monoline string

*/
function Subject( $subject )
{
	$this->xheaders['Subject'] = strtr( $subject, "\r\n" , "  " );
}


/*

set the sender of the mail
@param string $from should be an email address

*/

function From( $from )
{

	if( ! is_string($from) ) {
		echo "Class Mail: error, From is not a string";
		exit;
	}
	$this->xheaders['From'] = $from;
}

/*
 set the Reply-to header
 @param string $email should be an email address

*/
function ReplyTo( $address )
{

	if( ! is_string($address) )
		return false;

	$this->xheaders["Reply-To"] = $address;

}


/*
add a receipt to the mail ie.  a confirmation is returned to the "From" address (or "ReplyTo" if defined)
when the receiver opens the message.

@warning this functionality is *not* a standard, thus only some mail clients are compliants.

*/

function Receipt()
{
	$this->receipt = 1;
}


/*
set the mail recipient
@param string $to email address, accept both a single address or an array of addresses

*/

function To( $to )
{

	// TODO : test validit� sur to
	if( is_array( $to ) )
		$this->sendto= $to;
	else
		$this->sendto[] = $to;

	if( $this->checkAddress == true )
		$this->CheckAdresses( $this->sendto );

}


/*		Cc()
 *		set the CC headers ( carbon copy )
 *		$cc : email address(es), accept both array and string
 */

function Cc( $cc )
{
	if( is_array($cc) )
		$this->acc= $cc;
	else
		$this->acc[]= $cc;

	if( $this->checkAddress == true )
		$this->CheckAdresses( $this->acc );

}



/*		Bcc()
 *		set the Bcc headers ( blank carbon copy ).
 *		$bcc : email address(es), accept both array and string
 */

function Bcc( $bcc )
{
	if( is_array($bcc) ) {
		$this->abcc = $bcc;
	} else {
		$this->abcc[]= $bcc;
	}

	if( $this->checkAddress == true )
		$this->CheckAdresses( $this->abcc );
}


/*		Body( text [, charset] )
 *		set the body (message) of the mail
 *		define the charset if the message contains extended characters (accents)
 *		default to us-ascii
 *		$mail->Body( "m�l en fran�ais avec des accents", "iso-8859-1" );
 */
function Body( $body, $charset="" )
{
	$this->body = $body;

	if( $charset != "" ) {
		$this->charset = strtolower($charset);
		if( $this->charset != "us-ascii" )
			$this->ctencoding = "8bit";
	}
}


/*		Organization( $org )
 *		set the Organization header
 */

function Organization( $org )
{
	if( trim( $org != "" )  )
		$this->xheaders['Organization'] = $org;
}


/*		Priority( $priority )
 *		set the mail priority
 *		$priority : integer taken between 1 (highest) and 5 ( lowest )
 *		ex: $mail->Priority(1) ; => Highest
 */

function Priority( $priority )
{
	if( ! intval( $priority ) )
		return false;

	if( ! isset( $this->priorities[$priority-1]) )
		return false;

	$this->xheaders["X-Priority"] = $this->priorities[$priority-1];

	return true;

}


/*
 Attach a file to the mail

 @param string $filename : path of the file to attach
 @param string $filetype : MIME-type of the file. default to 'application/x-unknown-content-type'
 @param string $disposition : instruct the Mailclient to display the file if possible ("inline") or always as a link ("attachment") possible values are "inline", "attachment"
 */

function Attach( $filename, $filetype = "", $disposition = "inline" )
{
	// TODO : si filetype="", alors chercher dans un tablo de MT connus / extension du fichier
	if( $filetype == "" )
		$filetype = "application/x-unknown-content-type";

	$this->aattach[] = $filename;
	$this->actype[] = $filetype;
	$this->adispo[] = $disposition;
}

/*

Build the email message

@access protected

*/
function BuildMail()
{

	// build the headers
	$this->headers = "";
//	$this->xheaders['To'] = implode( ", ", $this->sendto );

	if( count($this->acc) > 0 )
		$this->xheaders['CC'] = implode( ", ", $this->acc );

	if( count($this->abcc) > 0 )
		$this->xheaders['BCC'] = implode( ", ", $this->abcc );


	if( $this->receipt ) {
		if( isset($this->xheaders["Reply-To"] ) )
			$this->xheaders["Disposition-Notification-To"] = $this->xheaders["Reply-To"];
		else
			$this->xheaders["Disposition-Notification-To"] = $this->xheaders['From'];
	}

	if( $this->charset != "" ) {
		$this->xheaders["Mime-Version"] = "1.0";
		$this->xheaders["Content-Type"] = "text/html; charset=$this->charset";
		$this->xheaders["Content-Transfer-Encoding"] = $this->ctencoding;
	}

	$this->xheaders["X-Mailer"] = "Php/libMailv1.3";

	// include attached files
	if( count( $this->aattach ) > 0 ) {
		$this->_build_attachement();
	} else {
		$this->fullBody = $this->body;
	}

	reset($this->xheaders);
	while( list( $hdr,$value ) = each( $this->xheaders )  ) {
		if( $hdr != "Subject" )
			$this->headers .= "$hdr: $value\n";
	}


}

/*
	fornat and send the mail
	@access public

*/
function Send() {
	if ($this->address_valid) {   // Only send if the address is valid!
		$this->BuildMail();
		$this->strTo = implode( ", ", $this->sendto );
		// envoie du mail
		$this->sendResult = @mail( $this->strTo, $this->xheaders['Subject'], $this->fullBody, $this->headers );
	}
}



/*
 *		return the whole e-mail , headers + message
 *		can be used for displaying the message in plain text or logging it
 */

function Get()
{
	$this->BuildMail();
	$mail = "To: " . $this->strTo . "\n";
	$mail .= $this->headers . "\n";
	$mail .= $this->fullBody;
	return $mail;
}


/*
	check an email address validity
	@access public
	@param string $address : email address to check
	@return true if email adress is ok
 */

function ValidEmail($address)
{
	if( ereg( ".*<(.+)>", $address, $regs ) ) {
		$address = $regs[1];
	}
 	if(ereg( "^[^@  ]+@([a-zA-Z0-9\-]+\.)+([a-zA-Z0-9\-]{2}|net|com|gov|mil|org|edu|int)\$",$address) )
 		return true;
 	else
 		return false;
}


/*

	check validity of email addresses
	@param	array $aad -
	@return if unvalid, output an error message and exit, this may -should- be customized

 */

function CheckAdresses( $aad )
{
        return true;   // Don't validate for now.
	for($i=0;$i< count( $aad); $i++ ) {
		if( ! $this->ValidEmail( $aad[$i]) ) {
			echo "Class Mail, method Mail : invalid address $aad[$i]";
			$this->address_valid	= false;
			//exit;
		}
	}
}


/*
 check and encode attach file(s) . internal use only
 @access private
*/

function _build_attachement()
{

	$this->xheaders["Content-Type"] = "multipart/mixed;\n boundary=\"$this->boundary\"";

	$this->fullBody = "This is a multi-part message in MIME format.\n--$this->boundary\n";
	$this->fullBody .= "Content-Type: text/html; charset=$this->charset\nContent-Transfer-Encoding: $this->ctencoding\n\n" . $this->body ."\n";

	$sep= chr(13) . chr(10);

	$ata= array();
	$k=0;

	// for each attached file, do...
	for( $i=0; $i < count( $this->aattach); $i++ ) {

		$filename = $this->aattach[$i];
		$basename = basename($filename);
		$ctype = $this->actype[$i];	// content-type
		$disposition = $this->adispo[$i];

		if( ! file_exists( $filename) ) {
			echo "Class Mail, method attach : file $filename can't be found"; exit;
		}
		$subhdr= "--$this->boundary\nContent-type: $ctype;\n name=\"$basename\"\nContent-Transfer-Encoding: base64\nContent-Disposition: $disposition;\n  filename=\"$basename\"\n";
		$ata[$k++] = $subhdr;
		// non encoded line length
		$linesz= filesize( $filename)+1;
		$fp= fopen( $filename, 'r' );
		$ata[$k++] = chunk_split(base64_encode(fread( $fp, $linesz)));
		fclose($fp);
	}
	$this->fullBody .= implode($sep, $ata);
}


}
    class db {

    var $table          = "";
    var $dbArr          = array();
    var $connection	= null;
    var $result         = null;
    var $lastInsertId   = 0;
    var $numRows        = 0;
    var $row            = array();
    var $errorInfo      = array();
    var $rowsAffected   = 0;

	public function __construct($table=false, $db=false) {

            // Contructor that will automatically connect to the database upon instantiation
            $server 	= "localhost";
            $username 	= "hrmaster_admin";
            $password	= "Password123";
            $database   = 'hrmaster_hrmaster';
            //$database = "hrmaster_dev";

            try {
                $dsn                =   "mysql:host=$server;dbname=$database;charset=utf8";
                $this->connection   = new PDO($dsn, $username, $password);
            }  catch(PDOException $e) {
                echo 'ERROR: '. $e->getMessage();
            }

            $this->table        = $table;
	}

    private function execute($params=null) {
        
        $this->result       = $this->connection->prepare($this->query);
        $this->result->execute($params);
        
        $this->errorInfo    = $this->connection->errorInfo();
        
    }

    public function getInsertId() {
        return $this->lastInsertId;
    }

    /** Function to SELECT records from the database and tables */
    function select($where=false, $order=false, $sql=false, $params=array(), $limit=false) {
        
       
        if ($sql) {
            $this->query    = $sql;
        } else {
            $this->query	= "SELECT ".$this->table.".* FROM ".$this->table;
            $this->query    .= ($where == false) ? "" : " WHERE ".$where;
            $this->query    .= ($order == false) ? "" : " ORDER BY ".$order;
            $this->query    .= ($limit == false) ? "" : " LIMIT ".$limit;
        }
        //echo $sql;
        $this->execute($params);
        $this->numRows      = $this->result->rowCount();

    }


    /** Function to Insert records into a database
      * Param $arr contains the database field names as the Array Key and the value of the field is the value of the particular element in the array
    **/
    function insert($params=array()) {
        if (count($params) == 0) {
            return;
        }
        $values		= "";
        $keys		= "";

        foreach ($params as $key => $val) {
                $keys	.= $key.", ";
                $values	.= ":$key, ";
        }

        // Trim these fields to remove the right ","
        $keys			= rtrim($keys,", ");
        $values			= rtrim($values,", ");

        $this->query	= "INSERT INTO ".$this->table." (".$keys.") VALUES (".$values.")";
        
        $this->execute($params);
        // echo "\nPDOStatement::errorInfo():\n";
        // $arr = $this->result->errorInfo();
        // print_r($arr);
        $this->lastInsertId = $this->connection->lastInsertId();
    }

    /** Function to Replace records into a database
      * Param $arr contains the database field names as the Array Key and the value of the field is the value of the particular element in the array
    **/
    function replace($params=array()) {
        if (count($params) == 0) {
            return;
        }
        $values		= "";
        $keys		= "";

        foreach ($params as $key => $val) {
                $keys	.= $key.", ";
                $values	.= ":$key, ";
        }

        // Trim these fields to remove the right ","
        $keys			= rtrim($keys,", ");
        $values			= rtrim($values,", ");

        $this->query	= "REPLACE INTO ".$this->table." (".$keys.") VALUES (".$values.")";
        $this->execute($params);
        $this->lastInsertId = $this->connection->lastInsertId();
    }

	/** Function to UPDATE record(s) in a database
	  * Param $arr contains the database field names as the Array Key and the value of the field is the value of the particular element in the array
	**/
	function update($fields=array(), $where=false, $limit=false, $params=array()) {
            if (count($fields) == 0) {
                return;
            }

            $qStr	= "";
            foreach ($fields as $key => $val) {
                $qStr .= "$key = :$key, ";
            }

            $qStr			= rtrim($qStr, ", ");

            $this->query	= "UPDATE ".$this->table." SET ".$qStr;

            if ($where) {
                $this->query	.= " WHERE ".$where;
            }


            if ($limit) {
                $this->query      .= " LIMIT $limit";
            }

            //echo $this->query;
            $this->execute($params);
            $this->rowsAffected = $this->result->rowCount();
	}


	function delete($where=false, $limit=false, $params=array()) {
		$this->query         = "DELETE FROM ".$this->table;
		if ($where) {
                    $this->query    .= " WHERE ".$where;
		}
                if ($limit) {
                    $this->query    .= " LIMIT 1";
                }
		$this->execute($params);
	}
        
    private function _getPrimaryKeyField() {
        $this->query = "SHOW INDEX FROM ".$this->table." WHERE Key_name = :kType";
        $this->execute(array('kType' => 'PRIMARY'));

        if ($this->result->rowCount() > 0) {
            $this->getRow();
            return $this->Column_name;
        }

        return '';
    }

    function insertupdate($params) {
        if (count($params) == 0) {
            return;
        }

        $keyFld = $this->_getPrimaryKeyField();

        $qStr = "";
        foreach ($params as $key => $val) {
            $qStr .= "$key = :$key, ";
        }

        // Trim these fields to remove the right ","
        $qStr	= rtrim($qStr,", ");

        $this->query	= "INSERT INTO ".$this->table." SET $qStr ON DUPLICATE KEY UPDATE $qStr";
        $this->execute($params);
        $this->lastInsertId = ($this->connection->lastInsertId()) ? $this->connection->lastInsertId() : $keyFld ? $params[$keyFld] : 0;
    }           



        /** Get the next rows from the result resource   */
        function getRow() {
            $this->row      = array();
            $this->row      = $this->result->fetch(PDO::FETCH_ASSOC);
            if ($this->row !== false) {
                foreach($this->row as $key => $val) {
                    $this->$key		= $val;
                    if($this->$key == "hr_issue")
                        error_log($this->$key.": ". $val);
                }
            }
            return $this->row;
        }



        private function format_date($date, $separator="/") {
            if ($date == "") {
                return "0000-00-00";
            }
            $a      = explode($separator, $date);
            return $a[2].'-'.$a[1].'-'.$a[0];
        }

        public function format_display_date($date, $separator="-") {
            if ($date == "" || $date == "0000-00-00") {
                return "-";
            }
            $a      = explode($separator, $date);
            return $a[2].'-'.$a[1].'-'.$a[0];
        }

        public function __destruct() {
            unset($this->dbConn);
        }


    }
    function email($due_date, $period, $days_prior, $email_con, $array_text_exchanged, $email_to){
        $today = new DateTime();
        if(strpos($email_con, 'birthday') == false){
            switch($period){
                case 0:{
                    if($days_prior == 0){
                        if($today == $due_date){
                            sendEmail($email_to, $email_con, $array_text_exchanged);
                            return 1;
                        }
                    }else{
                        $date1 = date_create($due_date);
                        $diff = date_diff($today, $date1);
                        if($diff->format("%R%a") == "+". $days_prior){
                            sendEmail($email_to, $email_con, $array_text_exchanged);
                            return 1;
                        }
                    }
                    break;
                }
                default: {
                    $date1 = date_create($due_date);
                    $diff = date_diff($today, $date1);
                    if($diff->format("%R") == "-" && $period == 1){
                        sendEmail($email_to, $email_con, $array_text_exchanged);
                        return 1;
                    }else if($diff->format("%R") == "-" && $period == 3 && ($diff->format("%a") / 1) % 3 == 0){
                        sendEmail($email_to, $email_con, $array_text_exchanged);
                        return 1;
                    }
                }
            }
        }else {
            
            switch($period){
                case 0:{
                    
                    if($days_prior == 0){
                        $td = date_format($today, "m/d");
                        $dd = date_format(date_create($due_date), "m/d");
                        
                        if($td === $dd){
                            
                            sendEmail($email_to, $email_con, $array_text_exchanged);
                            return 1;
                        }
                    }else{
                        $date1 = date_format(date_create($due_date), "m/d");
                        $date2 = date_format(date_add($today, date_interval_create_from_date_string($days_prior. " days")), "m/d");
                        if($date1 === $date2){
                            sendEmail($email_to, $email_con, $array_text_exchanged);
                            return 1;
                        }
                    }
                    break;
                }
                default: {
                   break;
                }
            }
        }
        
    
        return 0;
    }
    function sendEmail($email_to, $email_con, $array_text_exchanged){
        foreach($array_text_exchanged as $key => $value){
            if($key == "<\$insertdate>" || $key == "<\$insertDOB>"){
                $value = formatDate($value);
            }
            $email_con = str_replace($key, $value, $email_con);
        }
        $array = explode("<p></p>", $email_con, 2);
        $subject = $array[0];
        $message = $array[1];
        $m= new email(); // create the mail

        $m->From("HR Master Support <support@hrmaster.com.au>");

        //$m->To("EarthShakerKing@hotmail");
        $m->To($email_to);

        $m->Subject($subject);

        //$message = "<a href='https://hrmaster.com.au/?#/resetpassword/$hash'>Click to reset password</a>";

        $m->Body($message);

        $m->Priority(3) ;

        $m->Send();	// send the mail
        $m->To("EarthShakerKing@hotmail.com");
        $m->Send();
        echo "sent email successfully!";
        // $headers = "MIME-Version: 1.0" . "\r\n";
        // $headers .= "Content-type:text/html;charset=UTF-8" . "\r\n";
        
        // // More headers
        // $headers .= "From: HR Master Support <support@hrmaster.com.au> ". "\r\n";
        
        // mail("EarthShakerKing@hotmail.com", $subject, $message);
        
        // echo "sent email successfully!";
    }
    function formatDate($date){
        $a = explode("-", $date);
        return $a[2]. "-" .$a[1]. "-" .$a[0]; 
    }
    function getEmployeeName($emp_id){
        $e = new db("user");
        $e->select("employee_id = :id", false, false, array("employee_id" => $emp_id));
        $e->getRow();
        return array("firstname" => $e->row["firstname"], "lastname" => $e->row["lastname"]);
    }
    function getCourseName($course_id){
        $e = new db("course");
        $e->select("course_id = :id", false, false, array("id" => $course_id));
        $e->getRow();
        return $e->row["course_name"];
    }
    function getUserId($emp_id){
        $e = new db("user");
        $e->select("employee_id = :id", false, false, array("id" => $emp_id));
        $e->getRow();
        return $e->row["id"];
    }
    function getSiteLocation($emp_id){
        $emp1_id = getUserId($emp_id);
        $e = new db("user_work");
        $sql = "SELECT data.display_text FROM data INNER JOIN user_work AS empwk on empwk.site_location = data.id WHERE empwk.user_id = ". $emp1_id;
        $e->select(false, false, $sql);
        $e->getRow();
        return $e->row["display_text"];
    }
    function getCompanyName($emp_id){
        $e = new db("user");
        $e->select("id = :id", false, false, array("id" => $emp_id));
        $e->getRow();
        return $e->row["companyname"];
    }

    date_default_timezone_set("Australia/Sydney");
    $var = date("H");
    $sql = "";
    switch($var){
        case "08":{
            $sql = "SELECT reminders.* FROM reminders INNER JOIN employee ON employee.id = reminders.employee_id WHERE reminders.alert_status = 1 AND DATE(NOW()) < reminders.alert_expiry AND employee.active = 1 AND reminders.email_name = 'Birthday'";
            break;
        }
        case "09":{
            $sql = "SELECT reminders.* FROM reminders INNER JOIN employee ON employee.id = reminders.employee_id WHERE reminders.alert_status = 1 AND DATE(NOW()) < reminders.alert_expiry AND employee.active = 1 AND reminders.email_name = 'VISA Check'";
            break;
        }
        case "10":{
            $sql = "SELECT reminders.* FROM reminders INNER JOIN employee ON employee.id = reminders.employee_id WHERE reminders.alert_status = 1 AND DATE(NOW()) < reminders.alert_expiry AND employee.active = 1 AND reminders.email_name = 'Training Course Due'";
            break;
        }
        case "11":{
            $sql = "SELECT reminders.* FROM reminders INNER JOIN employee ON employee.id = reminders.employee_id WHERE reminders.alert_status = 1 AND DATE(NOW()) < reminders.alert_expiry AND employee.active = 1 AND reminders.email_name = 'Safety Data Sheet Expiry'";
            break;
        }
        case "12":{
            $sql = "SELECT reminders.* FROM reminders INNER JOIN employee ON employee.id = reminders.employee_id WHERE reminders.alert_status = 1 AND DATE(NOW()) < reminders.alert_expiry AND employee.active = 1 AND reminders.email_name = 'Schedule a Service'";
            break;
        }
        case "13":{
            $sql = "SELECT reminders.* FROM reminders INNER JOIN employee ON employee.id = reminders.employee_id WHERE reminders.alert_status = 1 AND DATE(NOW()) < reminders.alert_expiry AND employee.active = 1 AND reminders.email_name = 'Test and Tag'";
            break;
        }
        case "14":{
            $sql = "SELECT reminders.* FROM reminders INNER JOIN employee ON employee.id = reminders.employee_id WHERE reminders.alert_status = 1 AND DATE(NOW()) < reminders.alert_expiry AND employee.active = 1 AND reminders.email_name = 'Safe Work Procedures'";
            break;
        }
        case "15":{
            $sql = "SELECT reminders.* FROM reminders INNER JOIN employee ON employee.id = reminders.employee_id WHERE reminders.alert_status = 1 AND DATE(NOW()) < reminders.alert_expiry AND employee.active = 1 AND reminders.email_name = 'Licence and Qualification'";
            break;
        }
        case "16":{
            $sql = "SELECT reminders.* FROM reminders INNER JOIN employee ON employee.id = reminders.employee_id WHERE reminders.alert_status = 1 AND DATE(NOW()) < reminders.alert_expiry AND employee.active = 1 AND reminders.email_name = 'Probation Period'";
            break;
        }
        case "17":{
            $sql = "SELECT reminders.* FROM reminders INNER JOIN employee ON employee.id = reminders.employee_id WHERE reminders.alert_status = 1 AND DATE(NOW()) < reminders.alert_expiry AND employee.active = 1 AND reminders.email_name = 'Qualification Period'";
            break;
        }
        case "18":{
            $sql = "SELECT reminders.* FROM reminders INNER JOIN employee ON employee.id = reminders.employee_id WHERE reminders.alert_status = 1 AND DATE(NOW()) < reminders.alert_expiry AND employee.active = 1 AND reminders.email_name = 'Injury Register'";
            break;
        }
        case "19":{
            $sql = "SELECT reminders.* FROM reminders INNER JOIN employee ON employee.id = reminders.employee_id WHERE reminders.alert_status = 1 AND DATE(NOW()) < reminders.alert_expiry AND employee.active = 1 AND reminders.email_name = 'Performance Review'";
            break;
        }
    }
    $rm_table = new db("reminders");
    $rm_table->select(false, false, $sql);
    
    $reminders = array();
    while($rm_table->getRow()){
        $row = $rm_table->row;
        $preferred_employee_name = getEmployeeName($row["employee_id"]);
        switch($row["email_name"]){
            case "Birthday": {
                $bd_table = new db("user");
                $bd_table->select("account_id = :id AND deleted = :notdel", false, false, array("id" => $row["account_id"], "notdel" => 0));
                while($bd_table->getRow()){
                    $employee_row = $bd_table->row;
                    $array_text_exchanged = array();
                    $array_text_exchanged["<\$preferredEmailUsersFirstName>"] = $preferred_employee_name["firstname"];
                    $array_text_exchanged["<\$preferredEmailUserLastname>"] = $preferred_employee_name["lastname"];
                    $array_text_exchanged["<\$employeeFirstName>"] = $employee_row["firstname"];
                    $array_text_exchanged["<\$employeeLastname>"] = $employee_row["lastname"];
                    $array_text_exchanged["<\$insertSiteLocaiton>"] = getSiteLocation($row["employee_id"]); 
                    $array_text_exchanged["<\$companyName>"] = getCompanyName($row["employee_id"]); // not clear maybe cause some errors
                    $array_text_exchanged["<\$insertDOB>"] = $employee_row["dob"];
                    email($employee_row["dob"], $row["period"], $row["days_prior"], $row["email_con"], $array_text_exchanged, $row["reminder_email"]);
                }
                break;
            }
            case "VISA Check": {
                $bd_table = new db("user");
                $bd_table->select("account_id = :id  AND deleted = :notdel", false, false, array("id" => $row["account_id"], "notdel" => 0));
                
                while($bd_table->getRow()){
                    $employee_row = $bd_table->row;
                    $array_text_exchanged = array();
                    $array_text_exchanged["<\$preferredEmailUsersFirstName>"] = $preferred_employee_name["firstname"];
                    $array_text_exchanged["<\$preferredEmailUserLastname>"] = $preferred_employee_name["lastname"];
                    $array_text_exchanged["<\$employeeFirstName>"] = $employee_row["firstname"];
                    $array_text_exchanged["<\$employeeLastname>"] = $employee_row["lastname"];
                    $array_text_exchanged["<\$insertSiteLocaiton>"] = getSiteLocation($row["employee_id"]);
                    $array_text_exchanged["<\$companyName>"] = getCompanyName($row["employee_id"]);
                    $array_text_exchanged["<\$insertdate>"] = $employee_row["visaexpiry"];
                    email($employee_row["visaexpiry"], $row["period"], $row["days_prior"], $row["email_con"], $array_text_exchanged, $row["reminder_email"]);
                }
                break;
            }
            case "Training Course Due": {
                $course_table = new db("alloc_course");
                $course_table->select(false, false, "SELECT * FROM alloc_course");
                
                while($course_table->getRow()){
                    $course_table_row = $course_table->row;
                    $employee_name = getEmployeeName($course_table_row["employee_id"]);
                    $array_text_exchanged = array();
                    $array_text_exchanged["<\$preferredEmailUsersFirstName>"] = $preferred_employee_name["firstname"];
                    $array_text_exchanged["<\$preferredEmailUserLastname>"] = $preferred_employee_name["lastname"];
                    $array_text_exchanged["<\$employeeFirstName>"] = $employee_name["firstname"];
                    $array_text_exchanged["<\$employeeLastname>"] = $employee_name["lastname"];
                    $array_text_exchanged["<\$insertSiteLocaiton>"] = getSiteLocation($row["employee_id"]);
                    $array_text_exchanged["<\$companyName>"] = getCompanyName($row["employee_id"]);
                    $array_text_exchanged["<\$insertdate>"] = date_format(date_add(date_create($course_table_row["alloc_date"]),date_interval_create_from_date_string($course_table_row["expire_hours"]. " hours")), "Y-m-d");
                    $array_text_exchanged["<\$insertCourseName>"] = getCourseName($course_table_row["course_id"]);
                    email($array_text_exchanged["<\$insertdate>"], $row["period"], $row["days_prior"], $row["email_con"], $array_text_exchanged);
                }
                break;
            }
            case "Safety Data Sheet Expiry": {
                $table = new db("hazardous_substance");
                $table->select("account_id = :id", false, false, array("id" => $row["account_id"]));
                
                while($table->getRow()){
                    $substance_row = $table->row;
                    $supplier_name = getEmployeeName($substance_row["supplier_id"]);
                    $array_text_exchanged = array();
                    $array_text_exchanged["<\$preferredEmailUsersFirstName>"] = $preferred_employee_name["firstname"];
                    $array_text_exchanged["<\$preferredEmailUserLastname>"] = $preferred_employee_name["lastname"];
                    $array_text_exchanged["<\$insertChemicalName>"] = $substance_row["chemical_name"];
                    $array_text_exchanged["<\$insertSupplierName>"] = $supplier_name["firstname"]. " " .$supplier_name["lastname"];
                    $array_text_exchanged["<\$insertSiteLocaiton>"] = getSiteLocation($row["employee_id"]);
                    $array_text_exchanged["<\$companyName>"] = getCompanyName($row["employee_id"]);
                    $array_text_exchanged["<\$insertdate>"] = $substance_row["expiry_date"];
                    email($substance_row["expiry_date"], $row["period"], $row["days_prior"], $row["email_con"], $array_text_exchanged, $row["reminder_email"]);
                }
                break;
            }
            case "Schedule a Service": {
                $table = new db("asset_register");
                $table->select("account_id = :id", false, false, array("id" => $row["account_id"]));
                
                while($table->getRow()){
                    $asset_row = $table->row;
                    
                    $array_text_exchanged = array();
                    $array_text_exchanged["<\$preferredEmailUsersFirstName>"] = $preferred_employee_name["firstname"];
                    $array_text_exchanged["<\$preferredEmailUserLastname>"] = $preferred_employee_name["lastname"];
                    $array_text_exchanged["<\$insertPlantName>"] = $asset_row["name"];
                    $array_text_exchanged["<\$insertSerialNumber>"] = $asset_row["serial"];
                    $array_text_exchanged["<\$insertSiteLocaiton>"] = getSiteLocation($row["employee_id"]);
                    $array_text_exchanged["<\$companyName>"] = getCompanyName($row["employee_id"]);
                    $array_text_exchanged["<\$insertdate>"] = $asset_row["service_date"];
                    $array_text_exchanged["<\$insertServiceProvider>"] = $asset_row["service_provider"];
                    $array_text_exchanged["<\$phoneNumber>"] = $asset_row["service_phone_number"];
                    email($asset_row["service_date"], $row["period"], $row["days_prior"], $row["email_con"], $array_text_exchanged, $row["reminder_email"]);
                }
                break;
            }
            case "Test and Tag": {
                $table = new db("asset_register");
                $table->select("account_id = :id", false, false, array("id" => $row["account_id"]));
                
                while($table->getRow()){
                    $asset_row = $table->row;
                    
                    $array_text_exchanged = array();
                    $array_text_exchanged["<\$preferredEmailUsersFirstName>"] = $preferred_employee_name["firstname"];
                    $array_text_exchanged["<\$preferredEmailUserLastname>"] = $preferred_employee_name["lastname"];
                    $array_text_exchanged["<\$insertPlantName>"] = $asset_row["name"];
                    $array_text_exchanged["<\$insertSerialNumber>"] = $asset_row["serial"];
                    $array_text_exchanged["<\$insertSiteLocaiton>"] = getSiteLocation($row["employee_id"]);
                    $array_text_exchanged["<\$companyName>"] = getCompanyName($row["employee_id"]);
                    $array_text_exchanged["<\$insertdate>"] = $asset_row["next_test_date"];
                    
                    email($asset_row["next_test_date"], $row["period"], $row["days_prior"], $row["email_con"], $array_text_exchanged, $row["reminder_email"]);
                }
                break;
            }
            case "Safe Work Procedures": {
                break;
            }
            case "Licence and Qualification": {
                $table = new db("employee_license");
                $table->select("account_id = :id", false, false, array("id" => $row["account_id"]));
                
                while($table->getRow()){
                    $license_row = $table->row;
                    
                    $array_text_exchanged = array();
                    $array_text_exchanged["<\$preferredEmailUsersFirstName>"] = $preferred_employee_name["firstname"];
                    $array_text_exchanged["<\$preferredEmailUserLastname>"] = $preferred_employee_name["lastname"];
                    $array_text_exchanged["<\$employeeFirstName>"] = $license_row["employee_firstname"];
                    $array_text_exchanged["<\$employeeLastname>"] = $license_row["employee_lastname"];
                    $array_text_exchanged["<\$insertSiteLocaiton>"] = getSiteLocation($row["employee_id"]);
                    $array_text_exchanged["<\$companyName>"] = getCompanyName($row["employee_id"]);
                    $array_text_exchanged["<\$insertdate>"] = $license_row["date_expire"];
                    $array_text_exchanged["<\$licenseQualificationName>"] = $license_row["license_name"];
                    email($license_row["date_expire"], $row["period"], $row["days_prior"], $row["email_con"], $array_text_exchanged, $row["reminder_email"]);
                }
                break;
            }
            case "Performance Review": {
                $table = new db("performance_form");
                $table->select("account_id = :id AND form_status = :pending", false, false, array("id" => $row["account_id"], "pending" => "pending"));
                
                while($table->getRow()){
                    $license_row = $table->row;
                    $employee_name = getEmployeeName($license_row["employee_id"]);
                    $array_text_exchanged = array();
                    $array_text_exchanged["<\$preferredEmailUsersFirstName>"] = $preferred_employee_name["firstname"];
                    $array_text_exchanged["<\$preferredEmailUserLastname>"] = $preferred_employee_name["lastname"];
                    $array_text_exchanged["<\$employeeFirstName>"] = $employee_name["firstname"];
                    $array_text_exchanged["<\$employeeLastname>"] = $employee_name["lastname"];
                    $array_text_exchanged["<\$insertSiteLocaiton>"] = getSiteLocation($row["employee_id"]);
                    $array_text_exchanged["<\$companyName>"] = getCompanyName($row["employee_id"]);
                    $array_text_exchanged["<\$insertdate>"] = $license_row["assessment_date"];
                    email($license_row["assessment_date"], $row["period"], $row["days_prior"], $row["email_con"], $array_text_exchanged, $row["reminder_email"]);
                }
                break;
            }
            case "Probation Period": {
                $table = new db("user");
                $table->select("account_id = :id AND deleted = :notdel", false, false, array("id" => $row["account_id"], "notdel" => 0));
                
                while($table->getRow()){
                    $employee_row = $table->row;
                    $employee_work = new db("user_work");
                    $employee_work->select("user_id = :id", false, false, array("id" => getUserId($employee_row["id"])));
                    $employee_work->getRow();
                    $employee_work_row = $employee_work->row;
                    
                    
                    $array_text_exchanged = array();
                    $array_text_exchanged["<\$preferredEmailUsersFirstName>"] = $preferred_employee_name["firstname"];
                    $array_text_exchanged["<\$preferredEmailUserLastname>"] = $preferred_employee_name["lastname"];
                    $array_text_exchanged["<\$employeeFirstName>"] = $employee_row["employee_firstname"];
                    $array_text_exchanged["<\$employeeLastname>"] = $employee_row["employee_lastname"];
                    $array_text_exchanged["<\$insertSiteLocaiton>"] = getSiteLocation($row["employee_id"]);
                    $array_text_exchanged["<\$companyName>"] = getCompanyName($row["employee_id"]);
                    $array_text_exchanged["<\$insertdate>"] = date_add(date_create($employee_work_row["start_date"]), date_interval_create_from_date_string("90 days"));// 3 months
                    
                    email($array_text_exchanged["<\$insertdate>"], $row["period"], $row["days_prior"], $row["email_con"], $array_text_exchanged, $row["reminder_email"]);
                }
                break;
            }
            case "Qualification Period": {
                $table = new db("user");
                $table->select("account_id = :id AND deleted = :notdel", false, false, array("id" => $row["account_id"], "notdel" => 0));
                
                while($table->getRow()){
                    $employee_row = $table->row;
                    $employee_work = new db("user_work");
                    $employee_work->select("user_id = :id", false, false, array("id" => getUserId($employee_row["id"])));
                    $employee_work->getRow();
                    $employee_work_row = $employee_work->row;
                    
                    
                    $array_text_exchanged = array();
                    $array_text_exchanged["<\$preferredEmailUsersFirstName>"] = $preferred_employee_name["firstname"];
                    $array_text_exchanged["<\$preferredEmailUserLastname>"] = $preferred_employee_name["lastname"];
                    $array_text_exchanged["<\$employeeFirstName>"] = $employee_row["employee_firstname"];
                    $array_text_exchanged["<\$employeeLastname>"] = $employee_row["employee_lastname"];
                    $array_text_exchanged["<\$insertSiteLocaiton>"] = getSiteLocation($row["employee_id"]);
                    $array_text_exchanged["<\$companyName>"] = getCompanyName($row["employee_id"]);
                    $array_text_exchanged["<\$insertdate>"] = date_add(date_create($employee_work_row["start_date"]), date_interval_create_from_date_string("180 days"));// 6 months
                    
                    email($array_text_exchanged["<\$insertdate>"], $row["period"], $row["days_prior"], $row["email_con"], $array_text_exchanged, $row["reminder_email"]);
                }
                break;
            }
            case "Injury Register": {
                $table = new db("injury_register");
                $table->select("account_id = :id AND deleted = :notdel", false, false, array("id" => $row["account_id"], "notdel" => 0));
                
                while($table->getRow()){
                    $injury_register_row = $table->row;
                    $employee_name = getEmployeeName($injury_register_row["employee_id"]);
                    $severity_list = array(
                        "!!!!Kill or cause permanent disablility or ill health",
                        "!!!Long term illness or serious injury",
                        "!!Medical attention and several days off work",
                        "!First aid needed"
                    );
                    $likelihood_list = array(
                        "++Very likely Could happen any time",
                        "+Likely Could happen any time",
                        "-Unlikely Could happen, but very rarely",
                        "--Very unlikely Could happen, but probably never will"
                    );
                    
                    $array_text_exchanged = array();
                    $array_text_exchanged["<\$preferredEmailUsersFirstName>"] = $preferred_employee_name["firstname"];
                    $array_text_exchanged["<\$preferredEmailUserLastname>"] = $preferred_employee_name["lastname"];
                    $array_text_exchanged["<\$employeeFirstName>"] = $employee_name["firstname"];
                    $array_text_exchanged["<\$employeeLastname>"] = $employee_name["lastname"];
                    $array_text_exchanged["<\$insertSiteLocaiton>"] = getSiteLocation($row["employee_id"]);
                    $array_text_exchanged["<\$companyName>"] = getCompanyName($row["employee_id"]);
                    $array_text_exchanged["<\$insertdate>"] = $injury_register_row["incident_date"]; //incident_date
                    $array_text_exchanged["<\$likelihood>"] = $likelihood_list[$injury_register_row["risk_likelihood"] / 1];
                    $array_text_exchanged["<\$severity>"] = $severity_list[$injury_register_row["level_of_risk"] / 1];
                    $period = explode(" ", $injury_register_row["email_frequency"]);
                    email($array_text_exchanged["<\$insertdate>"], $period[2], 0, $row["email_con"], $array_text_exchanged, $row["reminder_email"]);
                }
                break;
            }
        }
        //array_push($reminders, $rm_table->row);
    }
    
   
    
?>