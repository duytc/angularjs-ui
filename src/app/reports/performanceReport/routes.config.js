(function() {
    'use strict';

    angular.module('tagcade.reports.performanceReport')
        .config(addStates)
    ;

    function addStates(UserStateHelperProvider) {
        // uniqueRequestCacheBuster is used as a work-around for reloading only the current state
        // currently UI-Router will reload all parent states as well, this causes problems having
        // the report selector reload as well.

        UserStateHelperProvider
            .state('reports.performance', {
                url: '/performance',
                views: {
                    'content@app': {
                        templateUrl: 'reports/performanceReport/views/performanceReport.tpl.html'
                    }
                },
                ncyBreadcrumb: {
                    label: 'Performance Reports'
                }
            })
        ;

        UserStateHelperProvider
            .state('reports.performance.adNetwork', {
                url: '/adNetworks/{adNetworkId:int}?{startDate:date}&{endDate:date}',
                params: {
                    endDate: null,
                    uniqueRequestCacheBuster: null
                },
                views: {
                    report: {
                        controller: 'ReportView',
                        templateUrl: 'reports/performanceReport/views/reportType/adNetwork/adNetwork.tpl.html'
                    }
                },
                resolve: {
                    reportGroup: /* @ngInject */ function ($stateParams, PERFORMANCE_REPORT_TYPES, PerformanceReport) {
                        return PerformanceReport.getAdNetworkReport($stateParams, {
                            reportType: PERFORMANCE_REPORT_TYPES.adNetwork,
                            adNetworkBreakdown: 'day'
                        });
                    }
                }
            })
        ;

        UserStateHelperProvider
            .state('reports.performance.adNetworkAdTags', {
                url: '/adNetworks/{adNetworkId:int}/adTags?{startDate:date}&{endDate:date}',
                params: {
                    endDate: null,
                    uniqueRequestCacheBuster: null
                },
                views: {
                    report: {
                        controller: 'ReportView',
                        templateUrl: 'reports/performanceReport/views/reportType/adNetwork/adTags.tpl.html'
                    }
                },
                resolve: {
                    reportGroup: /* @ngInject */ function ($stateParams, PERFORMANCE_REPORT_TYPES, PerformanceReport) {
                        return PerformanceReport.getAdNetworkAdTagsReport($stateParams, {
                            reportType: PERFORMANCE_REPORT_TYPES.adNetwork,
                            adNetworkBreakdown: 'adtag'
                        });
                    }
                }
            })
        ;

        UserStateHelperProvider
            .state('reports.performance.adNetworkSites', {
                url: '/adNetworks/{adNetworkId:int}/sites?{startDate:date}&{endDate:date}',
                params: {
                    endDate: null,
                    uniqueRequestCacheBuster: null
                },
                views: {
                    report: {
                        controller: 'ReportView',
                        templateUrl: 'reports/performanceReport/views/reportType/adNetwork/sites.tpl.html'
                    }
                },
                resolve: {
                    reportGroup: /* @ngInject */ function ($stateParams, PERFORMANCE_REPORT_TYPES, PerformanceReport) {
                        return PerformanceReport.getAdNetworkSitesReport($stateParams, {
                            reportType: PERFORMANCE_REPORT_TYPES.adNetwork,
                            adNetworkBreakdown: 'site'
                        });
                    }
                }
            })
        ;

        UserStateHelperProvider
            .state('reports.performance.adNetworkSite', {
                url: '/adNetworks/{adNetworkId:int}/sites/{siteId:int}?{startDate:date}&{endDate:date}',
                params: {
                    endDate: null,
                    uniqueRequestCacheBuster: null
                },
                views: {
                    report: {
                        controller: 'ReportView',
                        templateUrl: 'reports/performanceReport/views/reportType/adNetwork/site.tpl.html'
                    }
                },
                resolve: {
                    reportGroup: /* @ngInject */ function ($stateParams, PERFORMANCE_REPORT_TYPES, PerformanceReport) {
                        return PerformanceReport.getAdNetworkSiteReport($stateParams, {
                            reportType: PERFORMANCE_REPORT_TYPES.adNetwork
                        });
                    }
                }
            })
        ;

        UserStateHelperProvider
            .state('reports.performance.adNetworkSiteAdTags', {
                url: '/adNetworks/{adNetworkId:int}/sites/{siteId:int}/adTags?{startDate:date}&{endDate:date}',
                params: {
                    endDate: null,
                    uniqueRequestCacheBuster: null
                },
                views: {
                    report: {
                        controller: 'ReportView',
                        templateUrl: 'reports/performanceReport/views/reportType/adNetwork/adTags.tpl.html'
                    }
                },
                resolve: {
                    reportGroup: /* @ngInject */ function ($stateParams, PERFORMANCE_REPORT_TYPES, PerformanceReport) {
                        return PerformanceReport.getAdNetworkSiteAdTagsReport($stateParams, {
                            reportType: PERFORMANCE_REPORT_TYPES.adNetwork
                        });
                    }
                }
            })
        ;

        UserStateHelperProvider
            .state('reports.performance.site', {
                url: '/sites/{siteId:int}?{startDate:date}&{endDate:date}',
                params: {
                    endDate: null,
                    uniqueRequestCacheBuster: null
                },
                views: {
                    report: {
                        controller: 'ReportView',
                        templateUrl: 'reports/performanceReport/views/reportType/site/site.tpl.html'
                    }
                },
                resolve: {
                    reportGroup: /* @ngInject */ function ($stateParams, PERFORMANCE_REPORT_TYPES, PerformanceReport) {
                        return PerformanceReport.getSiteReport($stateParams, {
                            reportType: PERFORMANCE_REPORT_TYPES.site,
                            siteBreakdown: 'day'
                        });
                    }
                }
            })
        ;

        UserStateHelperProvider
            .state('reports.performance.siteAdSlots', {
                url: '/sites/{siteId:int}/adSlots?{startDate:date}&{endDate:date}',
                params: {
                    endDate: null,
                    uniqueRequestCacheBuster: null
                },
                views: {
                    report: {
                        controller: 'ReportView',
                        templateUrl: 'reports/performanceReport/views/reportType/site/adSlots.tpl.html'
                    }
                },
                resolve: {
                    reportGroup: /* @ngInject */ function ($stateParams, PERFORMANCE_REPORT_TYPES, PerformanceReport) {
                        return PerformanceReport.getSiteAdSlotsReport($stateParams, {
                            reportType: PERFORMANCE_REPORT_TYPES.site,
                            siteBreakdown: 'adslot'
                        });
                    }
                }
            })
        ;

        UserStateHelperProvider
            .state('reports.performance.siteAdTags', {
                url: '/sites/{siteId:int}/adTags?{startDate:date}&{endDate:date}',
                params: {
                    endDate: null,
                    uniqueRequestCacheBuster: null
                },
                views: {
                    report: {
                        controller: 'ReportView',
                        templateUrl: 'reports/performanceReport/views/reportType/site/adTags.tpl.html'
                    }
                },
                resolve: {
                    reportGroup: /* @ngInject */ function ($stateParams, PERFORMANCE_REPORT_TYPES, PerformanceReport) {
                        return PerformanceReport.getSiteAdTagsReport($stateParams, {
                            reportType: PERFORMANCE_REPORT_TYPES.site,
                            siteBreakdown: 'adtag'
                        });
                    }
                }
            })
        ;

        UserStateHelperProvider
            .state('reports.performance.adSlotAdTags', {
                url: '/adSlots/{adSlotId:int}/adTags?{startDate:date}&{endDate:date}',
                params: {
                    endDate: null,
                    uniqueRequestCacheBuster: null
                },
                views: {
                    report: {
                        controller: 'ReportView',
                        templateUrl: 'reports/performanceReport/views/reportType/site/adTags.tpl.html'
                    }
                },
                resolve: {
                    reportGroup: /* @ngInject */ function ($stateParams, PerformanceReport) {
                        return PerformanceReport.getAdSlotAdTagsReport($stateParams);
                    }
                }
            })
        ;
    }
})();