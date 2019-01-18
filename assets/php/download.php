<?php
    $path = "http://localhost:8011/assets/php/uploads/".$_GET["filename"]; // the file made available for download via this PHP file
    $mm_type="application/octet-stream"; // modify accordingly to the file type of $path, but in most cases no need to do so
    $file_path = "C:/xampp/htdocs/assets/php/uploads/".$_GET["filename"];
    header("Pragma: public");
    header("Expires: 0");
    header("Cache-Control: must-revalidate, post-check=0, pre-check=0");
    header("Cache-Control: public");
    header("Content-Description: File Transfer");
    header("Content-Type: " . $mm_type);
    header("Content-Length: " .(string)(filesize($file_path)));
    header('Content-Disposition: attachment; filename="'.basename($path).'"');
    header("Content-Transfer-Encoding: binary\n");

    readfile($path);
    exit;
?>