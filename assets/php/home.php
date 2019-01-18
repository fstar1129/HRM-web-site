<?php
require($_SERVER['DOCUMENT_ROOT']."/assets/php/bb.class.php");

$user = new eris();
$user->isLoggedIn();

$html = new html();
$leftContent = '';
$rightContent = '';
$clear = $html->div(array('class' => 'clear'));


$bb = new bb();

?>

<div id="home">
    
    <div class="user-welcome">        
        <div>
            <h4>Welcome <?php echo $_SESSION['userData']['firstname'] . ' ' . $_SESSION['userData']['lastname'] ?></h4>
        </div>
        <div class="last-login">Last login: <?php echo $user->lastLoggedIn(); ?></div>
    </div>
    
    <div class="two-panel-layout">
        <div class="eris-snapshot panel">
            <h4>Your current ERIS status:</h4>
            <p>Autosafe Reminders</p>
            <ul>
                <li><?php $bb->displayOverdueAuditIssues(); ?></li>
                <li><?php $bb->displayDatabaseIssues(); ?></li>
            </ul>

            <p>Recruitment &amp; Policy Reminders</p>
            <ul>
                <li><?php $bb->displaySavedPoliciesOfEmployment(); ?></li>
                <li><?php $bb->displayRemindersPending(); ?></li>
                <li><?php $bb->displayMTAAdminPolicyMsgs(); ?></li>
            </ul>                
        </div>    
        
        <div class="eris-favourite panel">
            

            <ul class="nav nav-tabs" role="tablist" id="useraccess-tabs">
                <li role="presentation" class="active"><a href="#freq-tab" aria-controls="freq-tab" role="tab" data-toggle="tab">Frequently visited pages</a></li>
                <li role="presentation"><a href="#fav-tab" aria-controls="fav-tab" role="tab" data-toggle="tab">Favourites</a></li>
            </ul>                        
                        
            <div class="tab-content">
                <div role="tabpanel" class="tab-pane fade in active" id="freq-tab">
                    <?php echo $bb->mostFrequentlyVisited(); ?>                    
                </div>
                <div role="tabpanel" class="tab-pane fade" id="fav-tab">
                    <?php echo $bb->displayFavorites(); ?>                                    
                </div>
            </div>           
        </div>            
        
    </div>
    
    <?php
    if (in_array($_SESSION['userData']['member_account'], array('S','M'))) {  ?>
        <div class="pending-policies panel">
            <h4>Pending policies needing review</h4>
            <?php $bb->pendingPolicies();  ?>
        </div>
    <?php } ?>
   
    
    <div class="bulletin-board panel">
        <h3>Latest News</h3>
        <?php $bb->displayRecentBBPosts($_SESSION['userData']['Sector']); ?>
    </div>

 

</div>



<script src="assets/js/thirdparty/jquery-1.11.2.min.js"></script>
<script src="assets/js/thirdparty/bootstrap.min.js"></script>
<?php /*
<script src="assets/js/dhtml/codebase/dhtmlx.js"></script> 
<script src="assets/js/thirdparty/lodash.min.js"></script>
*/
?>
<script>
$(document).ready(function() {
               
    $('.bb-header').click(function() {
        var id = $(this).data('header-id');
        var div = ".bbcontent-" + id;
        
        if ($(div).css('display') === 'none') {
            $('.bb-content').hide();
            $(div).show();
        } else {
            $(div).hide();
        }
    });
    
    $('#older-posts').change(function() {
        $('.loading').show();
        $('.older-bb-post').html('').hide();
        var id = $(this).val();
        $.ajax({
            method: 'POST',
            url: 'admin/ajax.php',
            data: { id: id, action: 'getOlderBBContent' },
            dataType: 'json',
            success: function(data) { 
                
                $('.loading').hide();
                $('.older-bb-post').show().html(data.content);
            },
            fail: function(data) {
                
            },
            complete: function(data) {
            }
        });         
    });
                
    $('.bb-content').hide();            
                
});
</script>    
