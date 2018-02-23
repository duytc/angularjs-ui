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
                    title = currentState.ncyBreadcrumb.label;
                    console.log('title');
                    console.log(title);
                } catch(e) {}

                if (angular.isDefined(title) && angular.isString(title)) {
                    console.log(currentState.locals.globals);
                    title = $interpolate(title)(currentState.locals.globals);
                    console.log(title);
                    element.text(title);
                }
            }
        };
    }
})();