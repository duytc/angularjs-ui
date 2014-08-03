angular.module('tagcade.core.ui')
    .directive('updateTitle', function($rootScope, $state, APP_NAME) {
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
                                crumbs.push(state.breadcrumb.title);
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
        }
    })
;