angular.module('tagcade.core.ui')

    .directive('currentPageTitle', function($state, $interpolate) {
        'use strict';

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
    })

;