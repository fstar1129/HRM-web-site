<?php
header("Expires: Mon, 26 Jul 1997 05:00:00 GMT" );
header("Last-Modified: " . gmdate( "D, d M Y H:i:s" ) . "GMT" );
header("Cache-Control: no-cache, must-revalidate" );
header("Pragma: no-cache" );
header("Content-type: text/x-json");

require('../../admin/classes/cms.class.php');



if ($_POST['action']) {
    $action = $_POST['action'];
    $cms    = new cms();
    $cms->$action($_POST);
}