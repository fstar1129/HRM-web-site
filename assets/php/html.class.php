<?php

class html {
    
    public function __construct() {

    }
    
    
    public function input($attribs) {
        $type = isset($attribs['type']) ? $attribs['type'] : 'text';
        $step = isset($attribs['step']) ? "step='".$attribs['step']."'" : '';   // Intended use is for "type=number"
        $val = isset($attribs['value']) ? "value='".$attribs['value']."'" : '';
        $ph = isset($attribs['placeholder']) ? "placeholder='".$attribs['placeholder']."'" : '';
        $name = isset($attribs['name']) ? "name='".$attribs['name']."'" : '';
        $id = isset($attribs['id']) ? "id='".$attribs['id']."'" : '';
        $class = (isset($attribs['class'])) ? "class='".$attribs['class']."'" : '';
        $other = (isset($attribs['singleattribs'])) ? $attribs['singleattribs'] : '';
        $style = (isset($attribs['singleattribs'])) ? "style='".$attribs['style']."'" : '';
        
        return "<input type='$type' $step $ph $name $id $class $other $val $style />";
        
    }

    public function select($attribs) {
        $id = isset($attribs['id']) ? "id='".$attribs['id']."'" : '';
        $class = (isset($attribs['class'])) ? "class='".$attribs['class']."'" : '';
        $content = '';
        if (isset($attribs['options'])) {
            if (is_array($attribs['options'])) {
                if (count($attribs['options']) > 0) {
                    foreach ($attribs['options'] as $key => $val) {
                        $content .= "<option value='$key'>$val</option>";
                    }
                }
            }
        }
        
        return "<select $id $class>$content</select>";        
    }
    
    public function div($attribs) {
        $id = isset($attribs['id']) ? "id='".$attribs['id']."'" : '';
        $class = (isset($attribs['class'])) ? "class='".$attribs['class']."'" : '';
        $content = (isset($attribs['content'])) ? $attribs['content'] : '';
        
        return "<div $id $class>$content</div>";        
    }

    public function label($attribs) {
        $id = isset($attribs['id']) ? "id='".$attribs['id']."'" : '';
        $class = (isset($attribs['class'])) ? "class='".$attribs['class']."'" : '';
        $content = (isset($attribs['content'])) ? $attribs['content'] : '';
        
        return "<label $id $class>$content</label>";
    }    

    public function fieldset($attribs) {
        $id = isset($attribs['id']) ? "id='".$attribs['id']."'" : '';
        $class = (isset($attribs['class'])) ? "class='".$attribs['class']."'" : '';
        $content = (isset($attribs['content'])) ? $attribs['content'] : '';
        
        return "<fieldset $id $class>$content</fieldset>";
    }      

    public function button($attribs) {
        $id = isset($attribs['id']) ? "id='".$attribs['id']."'" : '';
        $type = isset($attribs['type']) ? "type='".$attribs['type']."'" : '';
        $class = (isset($attribs['class'])) ? "class='".$attribs['class']."'" : '';
        $content = (isset($attribs['content'])) ? $attribs['content'] : '';
        $datadismiss = (isset($attribs['data-dismiss'])) ? "data-dismiss='".$attribs['data-dismiss']."'" : '';
        $arialabel = (isset($attribs['aria-label'])) ? "aria-label='".$attribs['aria-label']."'" : '';
        
        return "<button $id $type $class $datadismiss $arialabel>$content</button>";
    }      
    
    
}

?>