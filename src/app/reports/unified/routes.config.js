(function() {
    'use strict';

    angular.module('tagcade.reports.unified')
        .config(addStates)
    ;

    function addStates(UserStateHelperProvider, REPORT_TYPE_KEY) {
        UserStateHelperProvider
            .state('reports.unified', {
                //abstract: true,
                url: '/unified',
                views: {
                    'content@app': {
                        templateUrl: 'reports/unified/views/unified.tpl.html'
                    }
                },
                ncyBreadcrumb: {
                    label: 'Unified Reports'
                }
            })
            .state('reports.unified.day', {
                url: '/day?{startDate:date}&{endDate:date}&{adNetwork:int}&{publisher:int}{reportType}',
                params: {
                    endDate: null,
                    uniqueRequestCacheBuster: null
                },
                views: {
                    unified: {
                        controller: 'UnifiedReport',
                        templateUrl: function($stateParams) {
                            if($stateParams.reportType == REPORT_TYPE_KEY.adTag) {
                                return 'reports/unified/views/reports/adTag/day.tpl.html'
                            }

                            if($stateParams.reportType == REPORT_TYPE_KEY.site) {
                                return 'reports/unified/views/reports/site/day.tpl.html'
                            }

                            if($stateParams.reportType == REPORT_TYPE_KEY.adTagGroup) {
                                return 'reports/unified/views/reports/adTagGroup/day.tpl.html'
                            }

                            return 'reports/unified/views/reports/daily/day.tpl.html'
                        }
                    }
                },
                resolve: {
                    reportGroup: /* @ngInject */ function ($stateParams, unifiedReport) {
                        return unifiedReport.getPulsePoint($stateParams, {breakDown: 'day', sortField: 'totalImps', orderBy: 'desc'});
                    }
                },
                ncyBreadcrumb: {
                    label: 'Unified reports'
                }
            })
            .state('reports.unified.site', {
                url: '/site?{startDate:date}&{endDate:date}&{adNetwork:int}&{publisher:int}{reportType}',
                params: {
                    endDate: null,
                    uniqueRequestCacheBuster: null
                },
                views: {
                    unified: {
                        controller: 'UnifiedReport',
                        templateUrl: 'reports/unified/views/reports/adTag/site.tpl.html'
                    }
                },
                resolve: {
                    reportGroup: /* @ngInject */ function ($stateParams, unifiedReport) {
                        return unifiedReport.getPulsePoint($stateParams, {breakDown: 'site', sortField: 'totalImps', orderBy: 'desc'});
                    }
                },
                ncyBreadcrumb: {
                    label: 'Unified reports'
                }
            })
            .state('reports.unified.country', {
                url: '/country?{startDate:date}&{endDate:date}&{adNetwork:int}&{publisher:int}{reportType}',
                params: {
                    endDate: null,
                    uniqueRequestCacheBuster: null
                },
                views: {
                    unified: {
                        controller: 'UnifiedReport',
                        templateUrl: function($stateParams) {
                            if($stateParams.reportType == REPORT_TYPE_KEY.adTagGroup) {
                                return 'reports/unified/views/reports/adTagGroup/country.tpl.html'
                            }

                            return 'reports/unified/views/reports/adTag/country.tpl.html'
                        }
                    }
                },
                resolve: {
                    reportGroup: /* @ngInject */ function ($stateParams, unifiedReport) {
                        return unifiedReport.getPulsePoint($stateParams, {breakDown: 'country', sortField: 'allImpressions', orderBy: 'desc'});
                    }
                },
                ncyBreadcrumb: {
                    label: 'Unified reports'
                }
            })
        ;
    }
})();