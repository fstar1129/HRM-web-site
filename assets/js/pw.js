/*$(function(){

	var pass1 = $('#password1'),
		pass2 = $('#password2'),
		email = $('#email'),
		form = $('#main form'),
		arrow = $('#main .arrow');

	// Use the complexify plugin on the first password field
	pass1.complexify({minimumChars:6, strengthScaleFactor:0.7}, function(valid, complexity){
alert('dsfgdfgdfggdgdg');
		if(valid){
			pass2.removeAttr('disabled');
			pass1.parent().removeClass('error').addClass('success');
		} else {
			pass2.attr('disabled','true');
			pass1.parent().removeClass('success').addClass('error');
		}

		var calculated = (complexity/100)*268 - 134;
		var prop = 'rotate('+(calculated)+'deg)';

		// Rotate the arrow
		arrow.css({
			'-moz-transform':prop,
			'-webkit-transform':prop,
			'-o-transform':prop,
			'-ms-transform':prop,
			'transform':prop
		});
	});

});
*/
