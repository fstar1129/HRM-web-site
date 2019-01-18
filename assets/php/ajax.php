<?php
header("Expires: Mon, 26 Jul 1997 05:00:00 GMT" );
header("Last-Modified: " . gmdate( "D, d M Y H:i:s" ) . "GMT" );
header("Cache-Control: no-cache, must-revalidate" );
header("Pragma: no-cache" );
header("Content-type: text/x-json");

//require($_SERVER['DOCUMENT_ROOT'].'/assets/php/config.php');
//require($_SERVER['DOCUMENT_ROOT'].'/assets/php/transaction.class.php');

require('config.php');
require('transaction.class.php');

$_POST = json_decode(file_get_contents('php://input'), true);

if ($_POST['action']) {
    $action = $_POST['action'];
    $trans  = new transaction();
    $trans->$action($_POST);
}