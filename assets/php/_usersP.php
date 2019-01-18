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

// Company
$content = $html->div(array('content' => 'Company', 'class' => 'label float-left'));
$content .= $html->input(array('id' => 'company', 'class' => 'float-left required')).$clear;
$rightContent .= $html->fieldset(array('content' => $content));

// Trade name
$content = $html->div(array('content' => 'Trading name', 'class' => 'label float-left'));
$content .= $html->input(array('id' => 'tradename', 'class' => 'float-left required')).$clear;
$rightContent .= $html->fieldset(array('content' => $content));

// Phone
$content = $html->div(array('content' => 'Phone', 'class' => 'label float-left'));
$content .= $html->input(array('id' => 'telephone1', 'class' => 'float-left required')).$clear;
$rightContent .= $html->fieldset(array('content' => $content));

// Fax
$content = $html->div(array('content' => 'Fax', 'class' => 'label float-left'));
$content .= $html->input(array('id' => 'telephone2', 'class' => 'float-left')).$clear;
$rightContent .= $html->fieldset(array('content' => $content));

// Email
$content = $html->div(array('content' => 'Email', 'class' => 'label float-left'));
$content .= $html->input(array('id' => 'email', 'class' => 'float-left')).$clear;
$leftContent .= $html->fieldset(array('content' => $content));

// Address
$content = $html->div(array('content' => 'Address', 'class' => 'label float-left'));
$content .= $html->input(array('id' => 'address', 'class' => 'float-left required')).$clear;
$leftContent .= $html->fieldset(array('content' => $content));

// Suburb
$content = $html->div(array('content' => 'Suburb', 'class' => 'label float-left'));
$content .= $html->input(array('id' => 'suburb', 'class' => 'float-left required')).$clear;
$leftContent .= $html->fieldset(array('content' => $content));

// State
$content = $html->div(array('content' => 'State', 'class' => 'label float-left'));
$states = array('' => 'Please select..', 'ACT' => 'Australian Capital Territory', 'NSW' => 'New South Wales', 'SA' => 'South Australia', 'VIC' => 'Victoria', 'TAS' => 'Tasmania', 'QLD' => 'Queensland', 'WA' => 'Western Australia', 'NT' => 'Northern Territory');
$content .= $html->select(array('id' => 'state', 'class' => 'float-left required', 'options' => $states)).$clear;
$leftContent .= $html->fieldset(array('content' => $content));

// Postcode
$content = $html->div(array('content' => 'Postcode', 'class' => 'label float-left'));
$content .= $html->input(array('id' => 'postcode', 'class' => 'float-left required')).$clear;
$leftContent .= $html->fieldset(array('content' => $content));


/*
// Active
// State
$content = $html->div(array('content' => 'Status', 'class' => 'label float-left'));
$status = array('1' => 'Active', '0' => 'Disabled');
$content .= $html->select(array('id' => 'enabled', 'class' => 'float-left', 'options' => $status)).$clear;
$leftContent .= $html->fieldset(array('content' => $content));
*/



