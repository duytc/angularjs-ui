angular.module('tagcade.core.ui')

    .directive('currentPageTitle', function($state) {
        'use strict';

        return {
            link: function(scope, element) {
                var title;

                try {
                    title = $state.$current.breadcrumb.title;
                } catch(e) {}

                if (angular.isDefined(title) && angular.isString(title)) {
                    element.text(title);
                }
            }
        };
    })

;