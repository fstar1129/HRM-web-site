<?php

// First name
$content = $html->div(array('content' => 'First name', 'class' => 'label float-left'));
$content .= $html->input(array('id' => 'firstname', 'class' => 'float-left required'));
$leftContent .= $html->fieldset(array('content' => $content)).$clear;

// Last name
$content = $html->div(array('content' => 'Last name', 'class' => 'label float-left'));
$content .= $html->input(array('id' => 'lastname', 'class' => 'float-left required'));
$leftContent .= $html->fieldset(array('content' => $content)).$clear;

// USERname
$content = $html->div(array('content' => 'Username', 'class' => 'label float-left'));
$content .= $html->input(array('id' => 'login', 'class' => 'float-left required'));
$rightContent .= $html->fieldset(array('content' => $content)).$clear;

// Password
$content = $html->div(array('content' => 'Password', 'class' => 'label float-left'));
$content .= $html->input(array('id' => 'password', 'type' => 'password', 'class' => 'float-left required'));
$rightContent .= $html->fieldset(array('content' => $content)).$clear;





