app.controller('indexController', ['$scope', '$rootScope', '$location', '$interval', function ($scope, $rootScope, $location, $interval) {
    $rootScope.showHeader = 1;
    $scope.sitename = 'hr master';
    $scope.slogan = "the HR professionals' best kept secret";

    $scope.showHeader = 1;
    $scope.isLoggedin = 0;

    $scope.MoreInfo = function() {
        $location.path('/moreinfo');
    }
    $scope.ForgotPassword = function() {
        $location.path('/forgotpassword');
    }

    $scope.ConfigureList = function() {
       $interval(function(){
           $('ul.container li:nth-child(2n)').css({
               "color": "#333"
           });
       }, 100, 1);
    };

    $scope.beginVertScroll = function(){
        $interval(
            function() {
                var firstElement = $('ul.container li:first');
                var hgt = firstElement.height() +
                            parseInt(firstElement.css("paddingTop"), 10) + parseInt(firstElement.css("paddingBottom"), 10) +
                            parseInt(firstElement.css("marginTop"), 10) + parseInt(firstElement.css("marginBottom"), 10);

                var cntnt = firstElement.html();
                var c = "<li>" + cntnt + "</li>";
                $("ul.container").append(c);
                ;

                cntnt = "";
                firstElement.animate({
                  "marginTop" : -hgt
                }, 600, function() {
                            $scope.itemToremove = $(this);
                           $('ul.container li').last().css({
                               "height:" :'200px',
                               "color" : '#333'
                           });
                           $(this).remove();

                       });
        }, 30000
      );
   };

}]);

app.directive('drctv', ["$interval", function($interval) {
    return {
        link: function ($scope, $element, $attribute, $interval) {
            $scope.ConfigureList();
            $scope.beginVertScroll();
        }
    };
}]);
