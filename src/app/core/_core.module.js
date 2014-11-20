(function () {
    'use strict';

    var core = angular.module('tagcade.core', [
        'ui.router',

        // angular modules

        'ngAnimate',

        // cached templates

        'templates-app',
        'templates-common',

        // tagcade modules

        'tagcade.blocks.alerts',
        'tagcade.blocks.serverError',
        'tagcade.blocks.errorPage',
        'tagcade.blocks.misc',

        'tagcade.core.bootstrap',
        'tagcade.core.auth',
        'tagcade.core.router',
        'tagcade.core.layout',
        'tagcade.core.widgets',
        'tagcade.core.data',
        'tagcade.core.login',

        // 3rd party modules

        'underscore',
        'restangular',
        'angular-loading-bar',
        'ui.bootstrap',
        'ui.select',
        'ngTable',
        'ncy-angular-breadcrumb'
    ]);

    core.run(appRun);

    function appRun(Auth, EXISTING_SESSION) {
        // EXISTING_SESSION set by deferred angular bootstrap
        if (EXISTING_SESSION) {
            Auth.initSession(EXISTING_SESSION);
        }
    }
})();