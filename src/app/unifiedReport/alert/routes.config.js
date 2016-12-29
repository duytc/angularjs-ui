(function() {
    'use strict';

    angular.module('tagcade.unifiedReport.alert')
        .config(addStates)
    ;

    function addStates(UserStateHelperProvider) {
        // uniqueRequestCacheBuster is used as a work-around for reloading only the current state
        // currently UI-Router will reload all parent states as well, this causes problems having

        UserStateHelperProvider
            .state('unifiedReport.alert', {
                abstract: true,
                url: '/alerts',
                ncyBreadcrumb: {
                    skip: true
                }
            })
            .state('unifiedReport.alert.list', {
                url: '/list?page&sortField&orderBy&search',
                params: {
                    uniqueRequestCacheBuster: null
                },
                views: {
                    'content@app': {
                        controller: 'AlertList',
                        templateUrl: 'unifiedReport/alert/alertList.tpl.html'
                    }
                },
                resolve: {
                    alerts: /* @ngInject */ function(UnifiedReportAlertManager) {

                        return UnifiedReportAlertManager.getList().then(function (alerts) {
                            return alerts.plain();
                        });
                    }
                },
                ncyBreadcrumb: {
                    label: 'Alerts'
                }
            })
    }
})();