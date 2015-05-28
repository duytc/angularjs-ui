(function () {
    'use strict';

    var core = angular.module('tagcade.core', [
        'ui.router',

        // angular modules

        'ngAnimate',
        'ngSanitize',

        // cached templates

        'templates-app',
        'templates-common',

        // tagcade modules

        'tagcade.blocks.alerts',
        'tagcade.blocks.serverError',
        'tagcade.blocks.errorPage',
        'tagcade.blocks.misc',
        'tagcade.blocks.event',
        'tagcade.blocks.export',
        'tagcade.blocks.searchBox',
        'tagcade.blocks.queryBuilder',
        'tagcade.blocks.atSortableQuery',

        'tagcade.core.bootstrap',
        'tagcade.core.auth',
        'tagcade.core.router',
        'tagcade.core.layout',
        'tagcade.core.widgets',
        'tagcade.core.data',
        'tagcade.core.login',
        'tagcade.core.util',
        'tagcade.core.resetPassword',

        // 3rd party modules

        'httpi',
        'underscore',
        'restangular',
        'angular-loading-bar',
        'ui.bootstrap',
        'ui.select',
        'highcharts-ng',
        'angular-table',
        'currencyFilter',
        'xeditable',
        'angucomplete'
    ]);

    core.run(appRun);

    function appRun(Auth, EXISTING_SESSION) {
        // EXISTING_SESSION set by deferred angular bootstrap
        if (EXISTING_SESSION) {
            Auth.initSession(EXISTING_SESSION);
        }
    }
})();