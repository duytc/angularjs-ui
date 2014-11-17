(function () {
    'use strict';

    angular.module('tagcade.core.login')
        .config(function ($stateProvider) {
            $stateProvider
                .state('login', {
                    parent: 'anon',
                    url: '/login',
                    controller: 'Login',
                    templateUrl: 'core/login/login.tpl.html',
                    data: {
                        allowAnonymous: true
                    }
                })
            ;
        })
    ;
})();