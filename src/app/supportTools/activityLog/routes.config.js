(function() {
    'use strict';

    angular.module('tagcade.supportTools.activityLog')
        .config(addStates)
    ;

    function addStates(UserStateHelperProvider) {
        UserStateHelperProvider
            .state('supportTools.activityLog', {
                abstract: true,
                url: '/activityLog',
                ncyBreadcrumb: {
                    skip: true
                }
            })
            .state({
                name: 'supportTools.activityLog.list',
                url: '/logs?{startDate}&{endDate}&{rowOffset}&{rowLimit}',
                views: {
                    'content@app': {
                        controller: 'ActivityLog',
                        templateUrl: 'supportTools/activityLog/activityLog.tpl.html'
                    }
                },
                resolve: {
                    logs: function($stateParams, adminRestangular, DateFormatter) {
                        if(!$stateParams.rowOffset || $stateParams.rowOffset < 0) {
                            $stateParams.rowOffset = 0;
                        }

                        if(!$stateParams.rowLimit) {
                            $stateParams.rowLimit = 30;
                        }

                        if(!$stateParams.startDate) {
                            $stateParams.startDate = DateFormatter.getFormattedDate(moment().subtract(6, 'days'));
                            $stateParams.endDate = DateFormatter.getFormattedDate(moment().startOf('day'));
                        }

                        return adminRestangular.one('logs').get($stateParams);
                    }
                },
                ncyBreadcrumb: {
                    label: 'Activity Logs'
                }
            })
        ;
    }
})();