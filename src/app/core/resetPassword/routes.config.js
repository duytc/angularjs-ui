(function () {
    'use strict';

    angular.module('tagcade.core.resetPassword')
        .config(function ($stateProvider) {
            $stateProvider
                .state('resetPassword', {
                    parent: 'anon',
                    url: '/reset',
                    templateUrl: 'core/resetPassword/reset.tpl.html'
                })
            ;

            $stateProvider
                .state('checkEmail', {
                    parent: 'resetPassword',
                    url: '/checkEmail',
                    views: {
                        resetPassword: {
                            controller: 'CheckEmail',
                            templateUrl: 'core/resetPassword/checkEmail.tpl.html'
                        }
                    },
                    data: {
                        allowAnonymous: true
                    }
                })
            ;

            $stateProvider
                .state('changePassword', {
                    parent: 'resetPassword',
                    url: '/changePassword/{token}',
                    views: {
                        resetPassword: {
                            controller: 'ChangePassword',
                            templateUrl: 'core/resetPassword/changePassword.tpl.html'
                        }
                    },
                    resolve: {
                        token: function($stateParams) {
                            return $stateParams.token;
                        }
                    },
                    data: {
                        allowAnonymous: true
                    }
                })
            ;
        })
    ;
})();