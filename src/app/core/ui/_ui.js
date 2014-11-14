angular.module('tagcade.core.ui', [
    'angular-loading-bar',
    'ngAnimate',
    'ui.router',
    'ui.bootstrap',
    'ui.select',
    'ngTable',
    'ncy-angular-breadcrumb'
])

    .config(function(uiSelectConfig) {
        uiSelectConfig.theme = 'bootstrap';
    })

    .config(function($breadcrumbProvider) {
        $breadcrumbProvider.setOptions({
            includeAbstract: true
        });
    })

    .config(function ($stateProvider, $urlRouterProvider) {
        'use strict';

        $stateProvider
            // all states should inherit from root
            // we can ensure that the current user has a valid session status
            .state('app', {
                abstract: true,
                templateUrl: 'core/ui/views/app.tpl.html',
                controller: 'AppController',
                resolve: {
                    userSession: function(Auth) {
                        return Auth.getSession();
                    }
                },
                ncyBreadcrumb: {
                    skip: true
                }
            })
            .state('anon', {
                abstract: true,
                templateUrl: 'core/ui/views/anon.tpl.html',
                ncyBreadcrumb: {
                    skip: true
                }
            })
        ;

        $urlRouterProvider.otherwise(function($injector) {
            $injector.invoke(/* @ngInject */ function ($state, $q, Auth, UserStateHelper, ENTRY_STATE) {
                Auth.check()
                    .catch(
                        function () {
                            $state.go(ENTRY_STATE);
                            return $q.reject('not authenticated');
                        }
                    )
                    .then(
                        function () {
                            return UserStateHelper.transitionRelativeToBaseState('dashboard');
                        }
                    )
                ;
            });
        });
    })

;