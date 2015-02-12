(function() {
    'use strict';

    angular.module('tagcade.supportTools.activityLog')
        .config(addStates)
    ;

    function addStates($stateProvider) {
        $stateProvider
            .state('app.admin.supportTools.activityLog', {
                url: '/activityLog',
                views: {
                    'content@app': {
                        controller: 'ActivityLogSelector',
                        templateUrl: 'supportTools/activityLog/activityLogSelector.tpl.html'
                    }
                },
                ncyBreadcrumb: {
                    label: 'Activity Logs'
                }
            })
        ;

        $stateProvider
            .state({
                name: 'app.admin.supportTools.activityLog.list',
                url: '/logs?{startDate}&{endDate}&{rowOffset}&{loginLogs}&{publisherId}',
                views: {
                    'logs': {
                        controller: 'ActivityLog',
                        templateUrl: 'supportTools/activityLog/activityLog.tpl.html'
                    }
                },
                resolve: {
                    logs: function($stateParams, activityLogs) {
                        return activityLogs.getLogs($stateParams);
                    }
                },
                ncyBreadcrumb: {
                    label: 'Activity Logs'
                }
            })
        ;
    }
})();