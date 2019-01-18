<?php
//require($_SERVER['DOCUMENT_ROOT']."/admin/classes/eris.class.php");
$user = new eris();
$user->isLoggedIn();

$html = new html();
$leftContent = '';
$rightContent = '';
$clear = $html->div(array('class' => 'clear'));

$calendar = '<span id="renewCalendar" class="glyphicon glyphicon-calendar" style="margin: 5px 0 0 5px;"></span>';


// Yes, there are better ways of doing this.
switch ($_SESSION['memberAccount']) {
    case "S" : include('assets/php/_usersS.php'); break;
    case "M" : include('assets/php/_usersM.php'); break;
    case "P" : include('assets/php/_usersP.php'); break;
    case "C" : include('assets/php/_usersC.php'); break;  
}

// ID
$content = $html->div(array('content' => '', 'class' => 'label float-left'));
$content .= $html->input(array('id' => 'id', 'type' => 'hidden', 'class' => 'float-left')).$clear;
$rightContent .= $html->fieldset(array('content' => $content));

// Layout
$left = $html->div(array('content' => $leftContent , 'class' => 'main-content-2 float-left'));
$right = $html->div(array('content' => $rightContent , 'class' => 'main-content-2 float-left'));
    
    
    
?>

<div id="autosafe-users">
    <h1>Autosafe Users</h1>
    <?php if ($_SESSION['memberAccount'] != 'C') {    ?>
            <div class="create-user"><span>Create user</span></div>        
    <?php 
        }
    ?>

    <div id="gridbox" style="width:100%; height:600px; background-color:white; "></div>

    <!-- Modal -->
    <div class="modal fade" id="usercontent" tabindex="-1" role="dialog" aria-labelledby="manageUser">
        <div class="modal-dialog" role="document" style="width: 60%;">
            <div class="modal-content">
                <div class="modal-header">              
                    <?php echo $html->button(array('content' => "<span aria-hidden='true'>&times;</span>", 'type' => 'button', 'class' => 'close', 'data-dismiss' => 'modal', 'aria-label' => 'Close')); ?>
                    <h3 class="modal-title" id="manageUser">Create User</h3>
                </div>
                <div class="modal-body">
                    <?php echo $html->div(array('content' => $left.$right.$clear, 'class' => 'main-content')); ?>
                </div>
                <div class="modal-footer">
                   <div class='user-message'>&nbsp;</div>
                  <?php echo $html->button(array('content' => 'Save', 'type' => 'button', 'class' => 'btn btn-primary', 'id' => 'save-user')); ?>  
                  <?php echo $html->button(array('content' => 'Close', 'type' => 'button', 'class' => 'btn btn-default', 'data-dismiss' => 'modal')); ?>
                </div>
            </div>
        </div>
    </div>  

</div>



<script src="assets/js/thirdparty/jquery-1.11.2.min.js"></script>
<script src="assets/js/thirdparty/bootstrap.min.js"></script>
<script src="assets/js/dhtml/codebase/dhtmlx.js"></script> 
<script src="assets/js/thirdparty/lodash.min.js"></script>
<script>var users = '<?php echo $userlist; ?>';</script>
<script src="assets/js/build/users.min.js"></script>