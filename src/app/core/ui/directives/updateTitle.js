angular.module('tagcade.core.ui')

    .directive('updateTitle', function($rootScope, $state, $interpolate, APP_NAME) {
        'use strict';

        return {
            link: function(scope, element) {
                var listener = function() {
                    var crumbs = [];

                    var generateBreadcrumbs = function(state) {
                        if(angular.isDefined(state.parent)) {
                            generateBreadcrumbs(state.parent);
                        }

                        if(angular.isDefined(state.breadcrumb)) {
                            if(angular.isDefined(state.breadcrumb.title)) {
                                var title = state.breadcrumb.title;

                                title = $interpolate(title)(state.locals.globals);

                                crumbs.push(title);
                            }
                        }
                    };

                    generateBreadcrumbs($state.$current);

                    var title = '';

                    if (crumbs.length > 0) {
                        title = crumbs.reverse().join(' - ');
                        title += ' | ';
                    }

                    title += APP_NAME;

                    element.text(title);
                };

                $rootScope.$on('$stateChangeSuccess', listener);
            }
        };
    })

;