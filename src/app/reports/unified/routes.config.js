(function() {
    'use strict';

    angular.module('tagcade.reports.unified')
        .config(addStates)
    ;

    function addStates(UserStateHelperProvider) {
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
                url: '/day?{startDate:date}&{endDate:date}&{reportType}&{adNetwork}&{site:int}&{publisher:int}',
                params: {
                    endDate: null,
                    uniqueRequestCacheBuster: null
                },
                views: {
                    unified: {
                        controller: 'UnifiedReport',
                        templateUrl: 'reports/unified/views/reports/unified/day.tpl.html'
                    }
                },
                resolve: {
                    reportGroup: /* @ngInject */ function ($stateParams, unifiedReport, userSession) {
                        $stateParams.publisher = !!$stateParams.publisher ? $stateParams.publisher : userSession.id;

                        return unifiedReport.getPulsePoint($stateParams, {breakDown: 'day'});
                    }
                },
                ncyBreadcrumb: {
                    label: 'Unified reports'
                }
            })
            .state('reports.unified.tagcadeDay', {
                url: '/tagcadeDay?{startDate:date}&{endDate:date}&{reportType}&{adNetwork}&{site:int}&{publisher:int}',
                params: {
                    endDate: null,
                    uniqueRequestCacheBuster: null
                },
                views: {
                    unified: {
                        controller: 'UnifiedReport',
                        templateUrl: 'reports/unified/views/reports/tagcade/day.tpl.html'
                    }
                },
                resolve: {
                    reportGroup: /* @ngInject */ function ($stateParams, unifiedReport, userSession) {
                        $stateParams.publisher = !!$stateParams.publisher ? $stateParams.publisher : userSession.id;

                        return unifiedReport.getAdNetworkReport($stateParams, {breakDown: 'day'});
                    }
                },
                ncyBreadcrumb: {
                    label: 'Unified reports'
                }
            })
            .state('reports.unified.discrepanciesDay', {
                url: '/discrepanciesDay?{startDate:date}&{endDate:date}&{reportType}&{adNetwork}&{site:int}&{publisher:int}',
                params: {
                    endDate: null,
                    uniqueRequestCacheBuster: null
                },
                views: {
                    unified: {
                        controller: 'UnifiedReport',
                        templateUrl: 'reports/unified/views/reports/discrepancies/day.tpl.html'
                    }
                },
                resolve: {
                    reportGroup: /* @ngInject */ function ($stateParams, unifiedReport, userSession) {
                        $stateParams.publisher = !!$stateParams.publisher ? $stateParams.publisher : userSession.id;

                        return unifiedReport.getPulsePointDiscrepancies($stateParams, {breakDown: 'day'});
                    }
                },
                ncyBreadcrumb: {
                    label: 'Unified reports'
                }
            })

            .state('reports.unified.site', {
                url: '/site?{startDate:date}&{endDate:date}&{reportType}&{adNetwork}&{site:int}&{publisher:int}&{subBreakDown}',
                params: {
                    endDate: null,
                    uniqueRequestCacheBuster: null
                },
                views: {
                    unified: {
                        controller: 'UnifiedReport',
                        templateUrl:  'reports/unified/views/reports/unified/site.tpl.html'
                    }
                },
                resolve: {
                    reportGroup: /* @ngInject */ function ($stateParams, unifiedReport, userSession) {
                        $stateParams.publisher = !!$stateParams.publisher ? $stateParams.publisher : userSession.id;

                        return unifiedReport.getPulsePoint($stateParams, {breakDown: 'sites'});
                    }
                },
                ncyBreadcrumb: {
                    label: 'Unified reports'
                }
            })
            .state('reports.unified.tagcadeSite', {
                url: '/tagcadeSite?{startDate:date}&{endDate:date}&{reportType}&{adNetwork}&{site:int}&{publisher:int}&{subBreakDown}',
                params: {
                    endDate: null,
                    uniqueRequestCacheBuster: null
                },
                views: {
                    unified: {
                        controller: 'UnifiedReport',
                        templateUrl: 'reports/unified/views/reports/tagcade/site.tpl.html'
                    }
                },
                resolve: {
                    reportGroup: /* @ngInject */ function ($stateParams, unifiedReport, userSession) {
                        $stateParams.publisher = !!$stateParams.publisher ? $stateParams.publisher : userSession.id;

                        return unifiedReport.getAdNetworkReport($stateParams, {breakDown: 'sites'});
                    }
                },
                ncyBreadcrumb: {
                    label: 'Unified reports'
                }
            })
            .state('reports.unified.discrepanciesSite', {
                url: '/discrepanciesSite?{startDate:date}&{endDate:date}&{reportType}&{adNetwork}&{site:int}&{publisher:int}&{subBreakDown}',
                params: {
                    endDate: null,
                    uniqueRequestCacheBuster: null
                },
                views: {
                    unified: {
                        controller: 'UnifiedReport',
                        templateUrl: 'reports/unified/views/reports/discrepancies/site.tpl.html'
                    }
                },
                resolve: {
                    reportGroup: /* @ngInject */ function ($stateParams, unifiedReport, userSession) {
                        $stateParams.publisher = !!$stateParams.publisher ? $stateParams.publisher : userSession.id;

                        return unifiedReport.getPulsePointDiscrepancies($stateParams, {breakDown: 'sites'});
                    }
                },
                ncyBreadcrumb: {
                    label: 'Unified reports'
                }
            })

            .state('reports.unified.adtag', {
                url: '/adtag?{startDate:date}&{endDate:date}&{reportType}&{adNetwork}&{site:int}&{publisher:int}&{subBreakDown}',
                params: {
                    endDate: null,
                    uniqueRequestCacheBuster: null
                },
                views: {
                    unified: {
                        controller: 'UnifiedReport',
                        templateUrl: 'reports/unified/views/reports/unified/adtag.tpl.html'
                    }
                },
                resolve: {
                    reportGroup: /* @ngInject */ function ($stateParams, unifiedReport, userSession) {
                        $stateParams.publisher = !!$stateParams.publisher ? $stateParams.publisher : userSession.id;

                        return unifiedReport.getPulsePoint($stateParams, {breakDown: 'adtags'});
                    }
                },
                ncyBreadcrumb: {
                    label: 'Unified reports'
                }
            })
            .state('reports.unified.tagcadeAdtag', {
                url: '/tagcadeAdtag?{startDate:date}&{endDate:date}&{reportType}&{adNetwork}&{site:int}&{publisher:int}&{subBreakDown}',
                params: {
                    endDate: null,
                    uniqueRequestCacheBuster: null
                },
                views: {
                    unified: {
                        controller: 'UnifiedReport',
                        templateUrl: 'reports/unified/views/reports/tagcade/adtag.tpl.html'
                    }
                },
                resolve: {
                    reportGroup: /* @ngInject */ function ($stateParams, unifiedReport, userSession) {
                        $stateParams.publisher = !!$stateParams.publisher ? $stateParams.publisher : userSession.id;

                        return unifiedReport.getAdNetworkReport($stateParams, {breakDown: 'adtags'});
                    }
                },
                ncyBreadcrumb: {
                    label: 'Unified reports'
                }
            })
            .state('reports.unified.discrepanciesAdtag', {
                url: '/discrepanciesAdtag?{startDate:date}&{endDate:date}&{reportType}&{adNetwork}&{site:int}&{publisher:int}&{subBreakDown}',
                params: {
                    endDate: null,
                    uniqueRequestCacheBuster: null
                },
                views: {
                    unified: {
                        controller: 'UnifiedReport',
                        templateUrl: 'reports/unified/views/reports/discrepancies/adtag.tpl.html'
                    }
                },
                resolve: {
                    reportGroup: /* @ngInject */ function ($stateParams, unifiedReport, userSession) {
                        $stateParams.publisher = !!$stateParams.publisher ? $stateParams.publisher : userSession.id;

                        return unifiedReport.getPulsePointDiscrepancies($stateParams, {breakDown: 'adtags'});
                    }
                },
                ncyBreadcrumb: {
                    label: 'Unified reports'
                }
            })

            .state('reports.unified.partner', {
                url: '/partner?{startDate:date}&{endDate:date}&{reportType}&{adNetwork}&{site:int}&{publisher:int}&{subBreakDown}',
                params: {
                    endDate: null,
                    uniqueRequestCacheBuster: null
                },
                views: {
                    unified: {
                        controller: 'UnifiedReport',
                        templateUrl: 'reports/unified/views/reports/unified/partner.tpl.html'
                    }
                },
                resolve: {
                    reportGroup: /* @ngInject */ function ($stateParams, unifiedReport, userSession) {
                        $stateParams.publisher = !!$stateParams.publisher ? $stateParams.publisher : userSession.id;

                        return unifiedReport.getPulsePoint($stateParams, {breakDown: 'partners'});
                    }
                },
                ncyBreadcrumb: {
                    label: 'Unified reports'
                }
            })
            .state('reports.unified.tagcadePartner', {
                url: '/tagcadePartner?{startDate:date}&{endDate:date}&{reportType}&{adNetwork}&{site:int}&{publisher:int}&{subBreakDown}',
                params: {
                    endDate: null,
                    uniqueRequestCacheBuster: null
                },
                views: {
                    unified: {
                        controller: 'UnifiedReport',
                        templateUrl: 'reports/unified/views/reports/tagcade/partner.tpl.html'
                    }
                },
                resolve: {
                    reportGroup: /* @ngInject */ function ($stateParams, unifiedReport, userSession) {
                        $stateParams.publisher = !!$stateParams.publisher ? $stateParams.publisher : userSession.id;

                        return unifiedReport.getAdNetworkReport($stateParams, {breakDown: 'partners'});
                    }
                },
                ncyBreadcrumb: {
                    label: 'Unified reports'
                }
            })
            .state('reports.unified.discrepanciesPartner', {
                url: '/discrepanciesPartner?{startDate:date}&{endDate:date}&{reportType}&{adNetwork}&{site:int}&{publisher:int}&{subBreakDown}',
                params: {
                    endDate: null,
                    uniqueRequestCacheBuster: null
                },
                views: {
                    unified: {
                        controller: 'UnifiedReport',
                        templateUrl: 'reports/unified/views/reports/discrepancies/partner.tpl.html'
                    }
                },
                resolve: {
                    reportGroup: /* @ngInject */ function ($stateParams, unifiedReport, userSession) {
                        $stateParams.publisher = !!$stateParams.publisher ? $stateParams.publisher : userSession.id;

                        return unifiedReport.getPulsePointDiscrepancies($stateParams, {breakDown: 'partners'});
                    }
                },
                ncyBreadcrumb: {
                    label: 'Unified reports'
                }
            })
        ;
    }
})();