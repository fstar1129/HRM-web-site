<?php
define('KB', 1024);
define('MB', 1048576);
define('GB', 1073741824);
define('TB', 1099511627776);
$target_dir = "uploads/";
$target_file = $target_dir . basename($_FILES['file']['name']);
$uploadOk = 1;
$fileType = strtolower(pathinfo($target_file, PATHINFO_EXTENSION));


if(file_exists($target_file)){
    //echo "Sorry, file already exists. Change name of file please.";
    $uploadOk = 0;
    echo json_encode(["status" => $uploadOk, "msg" => "Sorry, file already exists. Change name of file please."]);
}

if($_FILES['file']['size'] > 5*MB){
    //echo "Sorry, your file is too large. Retry please.";
    
    $uploadOk = 0;
    echo json_encode(["status" => $uploadOk, "msg" => "Sorry, your file is too large. Retry please."]);
}

if($fileType != 'docx' && $fileType != 'doc' && $fileType != 'pdf'){
    //echo "Sorry, only doc or pdf are allowed. Retry please.";
    $uploadOk = 0;
    echo json_encode(["status" => $uploadOk, "msg" => "Sorry, only doc or pdf are allowed. Retry please."]);
}

if($uploadOk == 0){
    // echo "Sorry, your file was not uploaded. Retry please.";

}else{
    if(move_uploaded_file($_FILES['file']['tmp_name'], $target_file)) {
        //echo "The file ". basename($_FILES['file']['name']). " has been uploaded successfully.";
        $uploadOk = 1;
        echo json_encode(["status" => $uploadOk, "msg" => "The file ". basename($_FILES['file']['name']). " has been uploaded successfully."]);
    }else{
        //echo "Sorry, there was an error uploading your file. Retry please.";
        $uploadOk = 1;
        echo json_encode(["status" => $uploadOk, "msg" => "Sorry, there was an error uploading your file. Retry please."]);
    }
}

?>


