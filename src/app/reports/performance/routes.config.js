(function() {
    'use strict';

    angular.module('tagcade.reports.performance')
        .config(addStates)
    ;

    function addStates(UserStateHelperProvider) {
        // uniqueRequestCacheBuster is used as a work-around for reloading only the current state
        // currently UI-Router will reload all parent states as well, this causes problems having
        // the report selector reload as well.

        UserStateHelperProvider
            .state('reports.performance', {
                abstract: true,
                url: '/performance',
                views: {
                    'content@app': {
                        templateUrl: 'reports/performance/views/performanceReport.tpl.html'
                    }
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
                        templateUrl: 'reports/performance/views/reportType/adNetwork/adNetwork.tpl.html'
                    }
                },
                resolve: {
                    reportGroup: /* @ngInject */ function ($stateParams, PERFORMANCE_REPORT_TYPES, performanceReport) {
                        return performanceReport.getAdNetworkReport($stateParams, {
                            reportType: PERFORMANCE_REPORT_TYPES.adNetwork,
                            adNetworkBreakdown: 'day'
                        });
                    }
                },
                ncyBreadcrumb: {
                    label: 'Performance reports'
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
                        templateUrl: 'reports/performance/views/reportType/adNetwork/adTags.tpl.html'
                    }
                },
                resolve: {
                    reportGroup: /* @ngInject */ function ($stateParams, PERFORMANCE_REPORT_TYPES, performanceReport) {
                        return performanceReport.getAdNetworkAdTagsReport($stateParams, {
                            reportType: PERFORMANCE_REPORT_TYPES.adNetwork,
                            adNetworkBreakdown: 'adtag'
                        });
                    }
                },
                ncyBreadcrumb: {
                    label: 'Performance reports'
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
                        templateUrl: function($stateParams) {
                            if (!$stateParams.endDate) {
                                return 'reports/performance/views/reportType/adNetwork/sites.tpl.html'
                            }

                            return 'reports/performance/views/reportType/adNetwork/sitesDateRange.tpl.html'
                        }
                    }
                },
                resolve: {
                    reportGroup: /* @ngInject */ function ($stateParams, PERFORMANCE_REPORT_TYPES, performanceReport) {
                        return performanceReport.getAdNetworkSitesReport($stateParams, {
                            reportType: PERFORMANCE_REPORT_TYPES.adNetwork,
                            adNetworkBreakdown: 'site'
                        });
                    }
                },
                ncyBreadcrumb: {
                    label: 'Performance reports'
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
                        templateUrl: 'reports/performance/views/reportType/adNetwork/site.tpl.html'
                    }
                },
                resolve: {
                    reportGroup: /* @ngInject */ function ($stateParams, PERFORMANCE_REPORT_TYPES, performanceReport) {
                        return performanceReport.getAdNetworkSiteReport($stateParams, {
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
                        templateUrl: 'reports/performance/views/reportType/adNetwork/adTags.tpl.html'
                    }
                },
                resolve: {
                    reportGroup: /* @ngInject */ function ($stateParams, PERFORMANCE_REPORT_TYPES, performanceReport) {
                        return performanceReport.getAdNetworkSiteAdTagsReport($stateParams, {
                            reportType: PERFORMANCE_REPORT_TYPES.adNetwork,
                            adNetworkBreakdown: 'adtag'
                        });
                    }
                },
                ncyBreadcrumb: {
                    label: 'Performance reports'
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
                        templateUrl: 'reports/performance/views/reportType/site/site.tpl.html'
                    }
                },
                resolve: {
                    reportGroup: /* @ngInject */ function ($stateParams, PERFORMANCE_REPORT_TYPES, performanceReport) {
                        return performanceReport.getSiteReport($stateParams, {
                            reportType: PERFORMANCE_REPORT_TYPES.site,
                            siteBreakdown: 'day'
                        });
                    }
                },
                ncyBreadcrumb: {
                    label: 'Performance reports'
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
                        templateUrl: function($stateParams) {
                            if (!$stateParams.endDate) {
                                return 'reports/performance/views/reportType/site/adSlots.tpl.html';
                            }

                            return 'reports/performance/views/reportType/site/adSlotsDateRange.tpl.html';
                        }
                    }
                },
                resolve: {
                    reportGroup: /* @ngInject */ function ($stateParams, PERFORMANCE_REPORT_TYPES, performanceReport) {
                        return performanceReport.getSiteAdSlotsReport($stateParams, {
                            reportType: PERFORMANCE_REPORT_TYPES.site,
                            siteBreakdown: 'adslot'
                        });
                    }
                },
                ncyBreadcrumb: {
                    label: 'Performance reports'
                }
            })
        ;

        UserStateHelperProvider
            .state('reports.performance.siteAdTags', {
                url: '/sites/{siteId:int}/adTags?{startDate:date}&{endDate:date}',
                params: {
                    endDate: null,
                    expanded: true,
                    uniqueRequestCacheBuster: null
                },
                views: {
                    report: {
                        controller: 'ReportView',
                        templateUrl: function($stateParams) {
                            if (!$stateParams.endDate) {
                                return 'reports/performance/views/reportType/site/adTags.tpl.html';
                            }

                            return 'reports/performance/views/reportType/site/adTagsDateRange.tpl.html';
                        }
                    }
                },
                resolve: {
                    reportGroup: /* @ngInject */ function ($stateParams, PERFORMANCE_REPORT_TYPES, performanceReport) {
                        return performanceReport.getSiteAdTagsReport($stateParams, {
                            reportType: PERFORMANCE_REPORT_TYPES.site,
                            siteBreakdown: 'adtag'
                        });
                    }
                },
                ncyBreadcrumb: {
                    label: 'Performance reports'
                }
            })
        ;

        UserStateHelperProvider
            .state('reports.performance.adSlot', {
                url: '/adSlots/{adSlotId:int}?{startDate:date}&{endDate:date}',
                params: {
                    endDate: null,
                    uniqueRequestCacheBuster: null
                },
                views: {
                    report: {
                        controller: 'ReportView',
                        templateUrl: 'reports/performance/views/reportType/adSlot/adSlot.tpl.html'
                    }
                },
                resolve: {
                    reportGroup: /* @ngInject */ function ($stateParams, PERFORMANCE_REPORT_TYPES, performanceReport) {
                        return performanceReport.getAdSlotReport($stateParams, {
                            reportType: PERFORMANCE_REPORT_TYPES.adSlot,
                            adSlotBreakdown: 'day'
                        });
                    }
                },
                ncyBreadcrumb: {
                    label: 'Performance reports'
                }
            })
        ;

        UserStateHelperProvider
            .state('reports.performance.adSlotAdTags', {
                url: '/adSlots/{adSlotId:int}/adTags?{startDate:date}&{endDate:date}',
                params: {
                    endDate: null,
                    expanded: true,
                    uniqueRequestCacheBuster: null
                },
                views: {
                    report: {
                        controller: 'ReportView',
                        templateUrl: function($stateParams) {
                            if (!$stateParams.endDate) {
                                return 'reports/performance/views/reportType/site/adTags.tpl.html';
                            }

                            return 'reports/performance/views/reportType/site/adTagsDateRange.tpl.html';
                        }
                    }
                },
                resolve: {
                    reportGroup: /* @ngInject */ function ($stateParams, PERFORMANCE_REPORT_TYPES, performanceReport) {
                        return performanceReport.getAdSlotAdTagsReport($stateParams, {
                            reportType: PERFORMANCE_REPORT_TYPES.adSlot,
                            adSlotBreakdown: 'adtag'
                        });
                    }
                },
                ncyBreadcrumb: {
                    label: 'Performance reports'
                }
            })
        ;
    }
})();