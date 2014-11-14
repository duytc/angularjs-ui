angular.module('tagcade.core.ui')

    .directive('updateTitle', function($rootScope, $state, $interpolate, _, APP_NAME) {
        'use strict';

        return {
            link: function(scope, element) {
                var updateTitle = function() {
                    var pageTitle = '';
                    var state = $state.$current;

                    if(_.isObject(state.ncyBreadcrumb) && state.ncyBreadcrumb.label) {
                        var title = state.ncyBreadcrumb.label;
                        title = $interpolate(title)(state.locals.globals);

                        if (title) {
                            pageTitle = title + ' | ';
                        }
                    }

                    pageTitle += APP_NAME;

                    element.text(pageTitle);
                };

                $rootScope.$on('$stateChangeSuccess', updateTitle);
            }
        };
    })

;