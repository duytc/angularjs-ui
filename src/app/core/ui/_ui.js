angular.module('tagcade.core.ui', [
    'angular-loading-bar',
    'ngAnimate',
    'ui.router',
    'ui.bootstrap',
    'ui.select',
    'ngTable'
])

    .config(function(uiSelectConfig) {
        uiSelectConfig.theme = 'bootstrap';
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
                }
            })
            .state('anon', {
                abstract: true,
                templateUrl: 'core/ui/views/anon.tpl.html'
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