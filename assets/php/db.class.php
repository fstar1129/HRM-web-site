<?php
ini_set('display_errors', 'On');
error_reporting(E_ALL | E_STRICT);

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
            $config    	= parse_ini_file('application.ini', 'production');
            $mode       = $config['mode'];
            $server 	= $config[$mode]['dbserver'];
            $username 	= $config[$mode]['dbuser'];
            $password	= $config[$mode]['dbpassword'];
            $database   = $config[$mode]['dbdatabase'];
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

?>
