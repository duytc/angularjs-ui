(function () {
    'use strict';

    angular.module('tagcade.core.widgets')
        .directive('currentPageTitle', currentPageTitle)
    ;

    function currentPageTitle($state, $interpolate) {
        return {
            link: function(scope, element) {
                var title;

                var currentState = $state.$current;

                try {
                    title = currentState.breadcrumb.title;
                } catch(e) {}

                if (angular.isDefined(title) && angular.isString(title)) {
                    title = $interpolate(title)(currentState.locals.globals);
                    element.text(title);
                }
            }
        };
    }
})();