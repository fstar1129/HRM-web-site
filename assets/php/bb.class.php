<?php

if (!class_exists('db')) {
    require($_SERVER['DOCUMENT_ROOT'].'/assets/php/db.class.php');
}


// Assumes session has been started
class bb {
	var $userId = 0;
	var $usersCreator = 0;
	var $isSuperUser = false;
	var $isMasterUser = false;
	var $isParentUser = false;
	var $isChildUser = false;
	var $accountType = "";
	var $userWhereClause = "";
        var $userSector = "";

	var $totalDBIssues = 0;


	public function __construct() {
		$this->_setUserDetails();

	}

	public function getUsersCreator() {
		$db = new db('users', 'eris_eris');
		$db->select("id = :id", false, false, array('id' => $this->userId));
		$db->getRow();
		$this->usersCreator = $db->createdBy;

		if ($isParentUser || $isChildUser) {
			$id = ($isParentUser) ? $this->userId : $this->usersCreator;
			$this->userWhereClause = "(userId IN (SELECT id FROM users WHERE createdBy = '$id') OR id = '$id')";
		}
	}

	private function _setUserDetails() {
		$this->userId = $_SESSION['userData']['id'];
		$this->accountType = $_SESSION['userData']['member_account'];
                $this->userSector = $_SESSION['userData']['Sector'];
		switch($_SESSION['userData']['member_account']) {
			case "S" : $this->isSuperUser = true; break;
			case "M" : $this->isMasterUser = true; break;
			case "P" : $this->isParentUser = true; break;
			case "C" : $this->isChildUser = true; break;
		}
	}

	public function getUsersName() {
		return $_SESSION['userData']['firstname'].' '.$_SESSION['userData']['lastname'];

	}

	public function getChecklistCount($where) {
		$db = new db('chklistinfo', 'eris_eris');

		$params = array();
		$params['status'] = "P";
		$params['uid1'] = $createrRow[0];
		$params['uid2'] = $this->userId;
		$params['completed'] = '0000-00-00';
		$params['subItem'] = 0;

		$where = "status = :status AND ($where OR userId = :uid1 OR userId = :uid2 ) AND dateOfCompletion < SYSDATE() AND dateCompleted = :completed AND subItemId != :subItem";


		$db->select($where, false, false, $params);
		return $db->numRows;

	}
        

	public function displayOverdueAuditIssues() {
            $num    = 0;
            $db     = new db('chklistinfo','eris_eris');
            $params = array();
            $params['s1'] = "p";
            $params['s2'] = "P";
            $params['dtComplete'] = '0000-00-00';
            $params['sitem'] = '0';
            $params['currUser'] = $this->userId;
            
            $where = "status IN (:s1,:s2) AND dateOfCompletion < SYSDATE() AND dateCompleted = :dtComplete AND subItemId != :sitem ";
            if ($this->isChildUser) {
                $where .= "AND userId IN (:currUser)";
                $db->select($where,false,false,$params);
                $num = $db->numRows;
            } else {
                if ($this->isParentUser) {
                    $where .= "AND userId IN (SELECT id FROM users WHERE id = :currUser OR createdBy = :currUser)";
                    $db->select($where,false,false,$params);
                    $num = $db->numRows;
                }
            }
            
            if ($num == 0) {
                echo "You have no Overdue Audit issues today";
                return;
            }
            echo "<a href='viewReminder.php' target='_blank' title='View overdue audit issues'>You have $num Overdue Audit issues today</a>";
	}
        
        private function _wcExpire() {
            $db = new db('employeereg','eris_eris');
            $params = array();
            $params['end'] = '0000-00-00';
            $params['dd'] = 0;
            $params['provided'] = "Y";
            $params['currUser'] = $this->userId;

            $sql = "SELECT e.userId
                      FROM employeereg e
                INNER JOIN workercompdetails w ON w.empId = e.empId 
                       AND w.WCEnddate = :end 
                       AND DATEDIFF(CURDATE(), w.WCExpireDate) = :dd
                       AND w.WCProvided = :provided 
                       AND e.userId IN (SELECT id FROM users WHERE id = :currUser OR createdBy = :currUser)";
            $db->select(false,false,$sql,$params);
            $this->totalDBIssues = $this->totalDBIssues + $db->numRows;
            unset($db);
        }
        
        private function _empWC() {
            $db     = new db('employeereg','eris_eris');
            $params = array();
            $params['end'] = '0000-00-00';
            $params['provided'] = "R";
            $params['currUser'] = $this->userId;
            
            $sql   = "SELECT e.userId 
                        FROM employeereg e
                  INNER JOIN workercompdetails w ON w.empId = e.empId 
                         AND w.WCEnddate = :end 
                         AND w.WCreminderDate = CURDATE() 
                         AND w.WCProvided = :provided 
                         AND e.userId IN (SELECT id FROM users WHERE id = :currUser OR createdBy = :currUser)";
            $db->select(false,false,$sql,$params);
            $this->totalDBIssues = $this->totalDBIssues + $db->numRows;           

            //----------------------------
            $params = array();
            $params['end'] = '0000-00-00';
            $params['provided'] = "Y";
            $params['currUser'] = $this->userId;
            $params['exp'] = -3;

            $sql = "SELECT e.userId
                      FROM employeereg e 
                INNER JOIN workercompdetails w ON w.empId = e.empId 
                       AND w.WCEnddate = :end 
                       AND DATEDIFF(CURDATE(), w.WCExpireDate ) = :exp
                       AND WCProvided = :provided 
                       AND e.userId IN (SELECT id FROM users WHERE id = :currUser OR createdBy = :currUser)";
            
            $db->select(false,false,$sql,$params);
            $this->totalDBIssues = $this->totalDBIssues + $db->numRows; 

            //----------------------------
            $params = array();
            $params['end'] = '0000-00-00';
            $params['provided'] = "Y";
            $params['currUser'] = $this->userId;
            $params['exp'] = 7;

            $sql = "SELECT e.userId
                      FROM employeereg e
                INNER JOIN workercompdetails w ON w.empId = e.empId 
                       AND w.WCEnddate = :end
                       AND DATEDIFF(CURDATE(), w.WCExpireDate ) = :exp 
                       AND w.WCProvided = :provided 
                       AND e.userId IN (SELECT id FROM users WHERE id = :currUser OR createdBy = :currUser)";
            
            $db->select(false,false,$sql,$params);
            $this->totalDBIssues = $this->totalDBIssues + $db->numRows; 

        }
        
        private function _empQual() {
            $db     = new db('employeereg','eris_eris');
            $params = array();
            $params['end'] = '0000-00-00';
            $params['provided'] = "R";
            $params['currUser'] = $this->userId;
            
            $sql   = "SELECT e.userId 
                        FROM employeereg e
                  INNER JOIN workercompdetails w ON w.empId = e.empId 
                         AND w.WCEnddate = :end 
                         AND w.WCreminderDate = CURDATE() 
                         AND w.WCProvided = :provided 
                         AND e.userId IN (SELECT id FROM users WHERE id = :currUser OR createdBy = :currUser)";
            $db->select(false,false,$sql,$params);
            $this->totalDBIssues = $this->totalDBIssues + $db->numRows;            
            
            $params = array();
            $params['renew'] = '0000-00-00';
            $params['currUser'] = $this->userId;  
            $sql   = "SELECT e.empId 
                        FROM employeereg e
                  INNER JOIN qualificationdetails q ON q.QualRenewaldate <= CURDATE()
                         AND q.QualRenewalDate != :renew
                         AND e.empId = q.empId 
                         AND e.userId IN (SELECT id FROM users WHERE id = :currUser OR createdBy = :currUser)";
            $db->select(false,false,$sql,$params);
            $this->totalDBIssues = $this->totalDBIssues + $db->numRows;             
            
            
            unset($db);
           
        }
        
        
        private function _empTraining() {

            $db     = new db('employeereg','eris_eris');
            $params = array();
            $params['renew'] = '0000-00-00';
            $params['currUser'] = $this->userId;
            
            $sql   = "SELECT e.empId 
                        FROM employeereg 
                  INNER JOIN trainingdetails t ON t.trainingRenewalDate <= CURDATE() 
                         AND t.trainingRenewalDate != :renew
                         AND e.empId = t.empId 
                         AND e.userId IN (SELECT id FROM users WHERE id = :currUser OR createdBy = :currUser)";
            $db->select(false,false,$sql,$params);
            $this->totalDBIssues = $this->totalDBIssues + $db->numRows; 


            //****** Reminders For MSDS Alerts *************/
            $params = array();
            $params['status'] = 'Activate';
            $params['currUser'] = $this->userId;
            
            $sql = "SELECT userId 
                      FROM msds_registration 
                     WHERE ExpireDate <= CURDATE() 
                       AND status = :status
                       AND userId IN (SELECT id FROM users WHERE id = :currUser OR createdBy = :currUser)";

            $db->select(false,false,$sql,$params);
            $this->totalDBIssues = $this->totalDBIssues + $db->numRows;
           
        }
        
        private function _empInjury() {
            
            $db     = new db('employeereg','eris_eris');
            $params = array();
            $params['rp1'] = '0';
            $params['rp2'] = '3';
            $params['currUser'] = $this->userId;
            
            $sql   = "SELECT userId, levelOfRisk, injuryId 
                        FROM injury_info 
                       WHERE remedialPriority :rp1 
                         AND remedialPriority <= :rp2
                         AND userId IN (SELECT id FROM users WHERE id = :currUser OR createdBy = :currUser)";
            $db->select(false,false,$sql,$params);
            $this->totalDBIssues = $this->totalDBIssues + $db->numRows;             
            
            //****** Reminders for Injury *******/
            $params = array();
            $params['rp1'] = 4;
            $params['rp2'] = 6;
            $params['currUser'] = $this->userId;            
            $sql = "SELECT userId,levelOfRisk,injuryId 
                      FROM injury_info 
                     WHERE (remedialPriority >= :rp1 AND remedialPriority < :rp2)
                       AND userId IN (SELECT id FROM users WHERE id = :currUser OR createdBy = :currUser)";		
            $db->select(false,false,$sql,$params);
            $this->totalDBIssues = $this->totalDBIssues + $db->numRows;


            $params = array();
            $params['rp'] = 6;
            $params['currUser'] = $this->userId;            
            $sql = "SELECT userId,levelOfRisk,injuryId
                      FROM injury_info 
                     WHERE remedialPriority = :rp
                       AND userId IN (SELECT id FROM users WHERE id = :currUser OR createdBy = :currUser)";
            
            $db->select(false,false,$sql,$params);
            $this->totalDBIssues = $this->totalDBIssues + $db->numRows;            
            
            $params = array();
            $params['s'] = 1;
            $params['currUser'] = $this->userId;            
            $sql = "SELECT *
                      FROM toolbox_events 
                     WHERE status = :s
                       AND userId = :currUser";
            
            $db->select(false,false,$sql,$params);
            $this->totalDBIssues = $this->totalDBIssues + $db->numRows;            



            $params = array();
            $params['end'] = '0000-00-00';
            $params['currUser'] = $this->userId;            
            $sql = "SELECT empId AS thisEmpid, workerCompId, 
                        (SELECT empName FROM employeereg WHERE employeereg.empId = thisEmpid) AS empName, 
                        (SELECT empLastName FROM employeereg WHERE employeereg.empId = thisEmpid) AS empLastName, 
                        DATE_FORMAT(WCStartDate, '%d-%m-%Y') as WCStartDate, 
                        DATE_FORMAT(WCEnddate, '%d-%m-%Y') as WCEndDate, 
                        DATE_FORMAT(WCreminderDate, '%d-%m-%Y') as WCreminderDate, 
                        DATE_FORMAT(WCExpireDate, '%d-%m-%Y') as WCExpireDate, 
        		DATE_FORMAT(RTWPDate, '%d-%m-%Y') as RTWPDate 
                   FROM workercompdetails 
                  WHERE empId IN (SELECT empId FROM employeereg WHERE userId IN (SELECT id FROM users WHERE id = :currUser OR createdBy = :currUser))
                    AND (WCEndDate = :end OR WCEndDate > DATE(NOW()) )";		
            $db->select(false,false,$sql,$params);
            $this->totalDBIssues = $this->totalDBIssues + $db->numRows;

        }

	public function displayDatabaseIssues() {
            $this->_wcExpire();
            $this->_empWC();
            $this->_empQual();
            $this->_empTraining();
            $this->_empInjury();
            if ($this->totalDBIssues == 0) {
                    echo "You have no database issues";
                    return;
            }
            echo "<a href='dataBase/index.php' title='View database issues' target='_blank'>You have ".$this->totalDBIssues." database issues</a>";
	}
        
        public function pendingPolicies() {
            $sql	 = "SELECT *, DATE_FORMAT(DateTime, '%d-%m-%Y at %H:%i') AS 'DateTimeDisplay',
                              FROM policiessaved p
                        INNER JOIN users u ON p.UserID = u.id
                             WHERE p.ReviewRequested IS NOT NULL
                               AND Reviewed IS NULL
                               AND u.Sector = :uSect";
            $db     = new db('policiessaved','eris_eris');
            $db->select(false,false,$sql,array('uSect' => $this->userSector));
            if ($db->numRows == 0) {
                echo "Nothing to review";
                return;
            }
            echo "<table>";
            while ($db->getRow()) {
                echo "<tr>";
                echo "<td>".$db->PolicyName."</td>";
                echo "<td>".$db->tradename."</td>";
                echo "<td>".$db->telephone1."</td>";
                echo "<td>".$db->login."</td>";
                echo "<td>".$db->DateTimeDisplay."</td>";
                echo "<td><a title='Click to view' href='policybuilder2/editpolicy.php?PolicyBuilderID=".$db->PolicyBuilderID."' target='_blank'>Review</a></td>";
                echo "</tr>";                
            }
            echo "</table>";
            
        }

	public function displaySavedPoliciesOfEmployment() {
            $db     = new db('policiessaved','eris_eris');
            $db->select("UserID = :currUser",false,false,array('currUser' => $this->userId));
            $num = $db->numRows;           

            if ($num == 0) {
                echo "You have no Policies of Employment saved";
                return;
            }
            echo "<a href='policybuilder2/policies.php' target='_blank' title='View saved policies of employment'>You have $num Policies of Employment saved</a>";
	}

	public function displayRemindersPending() {
            $db     = new db('policiessaved','eris_eris');
            $db->select("InternalReview > CURDATE() AND UserID = :currUser",false,false,array('currUser' => $this->userId));
            $num = $db->numRows;

            if ($num == 0) {
                echo "You have no Reminders pending";
                return;
            }
            echo "You have $num Reminders pending";
	}

	public function displayMTAAdminPolicyMsgs() {
            $db     = new db('policynotifications','eris_eris');
            $params = array();
            $params['currUser'] = $this->userId;
            $sql = "SELECT * 
                      FROM policynotifications pn
                INNER JOIN policies p ON p.id = pn.PolicyID
                     WHERE pn.UserID = :currUser";            
            $db->select(false,false,$sql,$params);
            $num = $db->numRows;              
            
            if ($num == 0) {
                echo "You have no messages from the MTA Policy Administrator";
                return;
            }
            echo "<a href='policybuilder2/viewnotifications.php' target='_blank' title='View messages from the MTA policy administrator'>You have $num messages from the MTA Policy Administrator</a>";
	}

	public function mostFrequentlyVisited() {
            $db = new db('user_activity_log','eris_eris');
            $sql = "SELECT COUNT(*) AS  'numVisits', page as PAGEID, page_section AS PAGESECTION, DATE_FORMAT(MAX(date_visited), '%d-%m-%Y at %H:%i') AS 'lastVisitedTime',
                        (SELECT label FROM eris_erisdata.cms WHERE id = PAGEID) as 'Page',
                        (SELECT label FROM eris_erisdata.cms WHERE id = PAGESECTION) as 'Page_Section'
                     FROM  `user_access_log` 
                    WHERE user_id = :user
                    GROUP BY `page`, `page_section` 
                    ORDER BY numVisits DESC
                    LIMIT 5";

            $params = array();
            $params['user'] = $this->userId;
            $db->select(false,false,$sql,$params);
            if ($db->numRows > 0) {
                echo "<ul>";
                while ($db->getRow()) {
                    
                    $title = "Visited ".$db->numVisits." times. Last visited on ".$db->lastVisitedTime;
                    
                    if ($db->PAGESECTION == 0 || !$db->PAGESECTION) {
                        echo '<li><a href="//www.eris.com.au/eris.php?id='.$db->PAGEID.'" title="'.$title.'">'.$db->Page.'</a></li>';
                    } else {
                        echo '<li><a href="//www.eris.com.au/eris.php?id='.$db->PAGEID.'&sub='.$db->PAGESECTION.'#'.$db->PAGESECTION.'" title="'.$title.'">'.$db->Page_Section.'</a></li>';
                    }                    
                }
                echo "</ul>"; 
            }
	}
        
        public function displayFavorites() {
            $db = new db('user_favorites','eris_eris');
            $params = array();
            $params['user'] = $this->userId;
            
            $sql = "SELECT page_id as PAGEID,
                        (SELECT parent_id FROM eris_erisdata.cms WHERE id = PAGEID) as 'Parent',
                        (SELECT label FROM eris_erisdata.cms WHERE id = PAGEID) as 'Page'
                     FROM `user_favorites` 
                    WHERE user_id = :user
                    LIMIT 8";            
            $db->select(false, false, $sql, array('user' => $this->userId));
            if ($db->numRows == 0) {
                echo "<p>No favorites</p>";
            } else {
                echo "<ul>";
                while ($db->getRow()) {
                    echo '<li><a href="//www.eris.com.au/eris.php?id='.$db->Parent.'&sub='.$db->PAGEID.'#'.$db->PAGEID.'" title="'.$title.'">'.$db->Page.'</a></li>';
                }
                echo "</ul>";
            }
        }
        
        public function displayRecentBBPosts($state) {
            $db = new db('cms','eris_erisdata');
            $db->select('state IN (SELECT id FROM states WHERE shortname = :st) AND active = :active AND data_type = :dt', 'date_added DESC', false, array('st' => $state, 'active' => 1, 'dt' => 1));
            $n = 1;
            while ($db->getRow() && $n <= 3) {
               // $db->getRow();            
                echo "<h4><a title='Click to open' name='".$db->id."' href='#".$db->id."' class='bb-header' data-header-id='".$db->id."'>".$db->label."</a></h4>";
                echo "<div class='bb-content bbcontent-".$db->id."'>";
                echo $db->content;
                echo "</div>";
                echo "<hr class='bb-post-separator' />";
                $n++;
            }
            
            echo '<select id="older-posts" name="older-posts">
                  <option value="">Select older news</option>';
            while ($db->getRow()) {
                echo '<option value="'.$db->id.'">'.$db->label.'</option>';
            }    
            echo '</select>';
            echo '<div class="loading" style="display: none;">';
            include('assets/templates/loading_non_ng.html');
            echo "</div>";
            echo '<div class="older-bb-post" style="display: none;"></div>';
            
        }
        
        

}