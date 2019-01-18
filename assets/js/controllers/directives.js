app.run(function($rootScope) {
    $rootScope.typeOf = function(value) {
        return typeof value
    }
}).directive("stringToNumber", function() {
    return {
        require: "ngModel",
        link: function(scope, element, attrs, ngModel) {
            ngModel.$parsers.push(function(value) {
                return "" + value
            }), ngModel.$formatters.push(function(value) {
                return parseFloat(value)
            })
        }
    }
}).config(function($mdDateLocaleProvider) {
    $mdDateLocaleProvider.formatDate = function(date) {
        if (!date) return "";
        var d = new Date(date),
            dd = d.getDate() < 10 ? "0" + d.getDate() : d.getDate(),
            m = d.getMonth() + 1;
        return dd + "-" + (m < 10 ? "0" + m : m) + "-" + d.getFullYear()
    }
}).directive("hrmContent", function() {
    return {
        template: '<div id="wrapper"><div class="content"><div class="content-inside" ng-view></div></div><footer ng-include="\'assets/templates/_footer.html\'"></footer></div>'
    }
}).directive("empField", function() {
    return {
        retrict: "A",
        scope: {
            fldLabel: "@",
            fldType: "@",
            model: "=ngModel",
            required: "=ngRequired"
        },
        template: '<div class="form-group row"><label class="control-label col-sm-4">{{fldLabel}}</label><div class="col-sm-8"><input type="{{fldType}}" class="form-control" ng-model="model" ng-required="required" /><span style="display:none;" class="text-danger"></span></div></div>',
        link: function(scope, element, attrs) {
            angular.isUndefined(scope.fldType) && (scope.fldType = "text")
        }
    }
}).directive("userMessage", function() {
    return {
        scope: {
            obj: "="
        },
        template: '<div class="user-message">{{ obj.userMessage }}</div>'
    }
})



/*app.run(function($rootScope) {
    $rootScope.typeOf = function(value) {
      return typeof value;
    };
})
.directive('stringToNumber', function() {
    return {
        require: 'ngModel',
        link: function(scope, element, attrs, ngModel) {
            ngModel.$parsers.push(function(value) {
                return '' + value;
            });
            ngModel.$formatters.push(function(value) {
                return parseFloat(value);
            });
        }
    };
})



.config(function($mdDateLocaleProvider) {
    $mdDateLocaleProvider.formatDate = function(date) {
        if (!date) {
            return "";
        }
        var d = new Date(date);
        var dd = (d.getDate() < 10) ? "0" + d.getDate() : d.getDate();
        var m = d.getMonth() + 1;
        var mm = (m < 10) ? "0" + m : m;
        return dd + "-" + mm + "-" + d.getFullYear();
    };
})
.directive("hrmContent", function() {
    return {
        template : '<div id="wrapper"><div class="content"><div class="content-inside" ng-view></div></div><footer ng-include="\'assets/templates/_footer.html\'"></footer></div>'
    };
})
.directive("empField", function() {
    return {
        retrict: 'A',
        scope: {
            'fldLabel': '@',
            'fldType': '@',
            model: '=ngModel',
            required: '=ngRequired'
        },
        template : `<div class="form-group row">
                        <label class="control-label col-sm-4">{{fldLabel}}</label>
                        <div class="col-sm-8">
                            <input type="{{fldType}}" class="form-control" ng-model="model" ng-required="required" />
                            <span style="display:none;" class="text-danger"></span>
                        </div>
                    </div>`,
        link: function(scope, element, attrs) {
            if (angular.isUndefined(scope.fldType)) {
                scope.fldType = 'text';
            }
        }
    };
})
.directive("userMessage", function() {
    return {
        scope: { obj: '=' },
        template : '<div class="user-message">{{ obj.userMessage }}</div>'
    };
});
*/