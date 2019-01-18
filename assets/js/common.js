$(function() {
    window.app = $.extend(true, window.app || {}, {
        module: {   	
            request: function(data) {
                var returndata = '';
                    $.ajax({
                        method: 'POST',
                        url: '/includes/ajax.php',
                        data: (_.isUndefined(data.data)) ? {} : data.data,
                        dataType: 'json',
                        async: false,//(_.isUndefined(data.async)) ? true : data.async,
                    success: function(data) {                    
                        returndata = data.responseText;
                    },
                    fail: function(data) {

                    },
                    complete: function(data) {
                        returndata = data.responseText;
                    }
                });        	
                return returndata;
            },

            addFavorite: function(id) {

            }
            
        },
        account: {
            userAccounts: [],
            users: [],
            currentUser: [],        	
        }
    });
});