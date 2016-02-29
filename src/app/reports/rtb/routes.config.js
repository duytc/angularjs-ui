(function() {
    'use strict';

    angular.module('tagcade.reports.rtb')
        .config(addStates)
    ;

    function addStates(UserStateHelperProvider) {
        // uniqueRequestCacheBuster is used as a work-around for reloading only the current state
        // currently UI-Router will reload all parent states as well, this causes problems having
        // the report selector reload as well.

        UserStateHelperProvider
            .state('reports.rtb', {
                abstract: true,
                url: '/rtb',
                views: {
                    'content@app': {
                        templateUrl: 'reports/rtb/views/rtbReport.tpl.html'
                    }
                }
            })
        ;

        UserStateHelperProvider
            .state('reports.rtb.site', {
                url: '/sites/{siteId:int}?{startDate:date}&{endDate:date}',
                params: {
                    endDate: null,
                    uniqueRequestCacheBuster: null
                },
                views: {
                    report: {
                        controller: 'ReportView',
                        templateUrl: 'reports/rtb/views/reportType/site/site.tpl.html'
                    }
                },
                resolve: {
                    reportGroup: /* @ngInject */ function ($stateParams, PERFORMANCE_REPORT_TYPES, rtbReport) {
                        return rtbReport.getSiteReport($stateParams, {
                            reportType: PERFORMANCE_REPORT_TYPES.site,
                            siteBreakdown: 'day'
                        });
                    }
                },
                ncyBreadcrumb: {
                    label: 'Rtb reports'
                }
            })
        ;

        UserStateHelperProvider
            .state('reports.rtb.siteAdSlots', {
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
                                return 'reports/rtb/views/reportType/site/adSlots.tpl.html';
                            }

                            return 'reports/rtb/views/reportType/site/adSlotsDateRange.tpl.html';
                        }
                    }
                },
                resolve: {
                    reportGroup: /* @ngInject */ function ($stateParams, PERFORMANCE_REPORT_TYPES, rtbReport) {
                        return rtbReport.getSiteAdSlotsReport($stateParams, {
                            reportType: PERFORMANCE_REPORT_TYPES.site,
                            siteBreakdown: 'adslot'
                        });
                    }
                },
                ncyBreadcrumb: {
                    label: 'RTB reports'
                }
            })
        ;

        UserStateHelperProvider
            .state('reports.rtb.adSlot', {
                url: '/adSlots/{adSlotId:int}?{startDate:date}&{endDate:date}',
                params: {
                    endDate: null,
                    uniqueRequestCacheBuster: null
                },
                views: {
                    report: {
                        controller: 'ReportView',
                        templateUrl: 'reports/rtb/views/reportType/adSlot/adSlot.tpl.html'
                    }
                },
                resolve: {
                    reportGroup: /* @ngInject */ function ($stateParams, PERFORMANCE_REPORT_TYPES, rtbReport) {
                        return rtbReport.getAdSlotReport($stateParams, {
                            reportType: PERFORMANCE_REPORT_TYPES.adSlot,
                            adSlotBreakdown: 'day'
                        });
                    }
                },
                ncyBreadcrumb: {
                    label: 'RTB reports'
                }
            })
        ;

        UserStateHelperProvider
            .state('reports.rtb.ronAdSlot', {
                url: '/ronAdSlots/{ronAdSlotId:int}?{startDate:date}&{endDate:date}',
                params: {
                    endDate: null,
                    uniqueRequestCacheBuster: null
                },
                views: {
                    report: {
                        controller: 'ReportView',
                        templateUrl: 'reports/rtb/views/reportType/ronAdSlot/ronAdSlot.tpl.html'
                    }
                },
                resolve: {
                    reportGroup: /* @ngInject */ function ($stateParams, PERFORMANCE_REPORT_TYPES, rtbReport) {
                        return rtbReport.getRonAdSlotReport($stateParams, {
                            reportType: PERFORMANCE_REPORT_TYPES.ronAdSlot,
                            ronAdSlotBreakdown: 'day'
                        });
                    }
                },
                ncyBreadcrumb: {
                    label: 'RTB reports'
                }
            })
        ;

        UserStateHelperProvider
            .state('reports.rtb.ronAdSlotSegments', {
                url: '/ronAdSlots/{ronAdSlotId:int}/segments?{startDate:date}&{endDate:date}',
                params: {
                    endDate: null,
                    uniqueRequestCacheBuster: null
                },
                views: {
                    report: {
                        controller: 'ReportView',
                        templateUrl: function($stateParams) {
                            if (!$stateParams.endDate) {
                                return 'reports/rtb/views/reportType/ronAdSlot/segments.tpl.html';
                            }

                            return 'reports/rtb/views/reportType/ronAdSlot/segmentsDateRange.tpl.html';
                        }
                    }
                },
                resolve: {
                    reportGroup: /* @ngInject */ function ($stateParams, PERFORMANCE_REPORT_TYPES, rtbReport) {
                        return rtbReport.getRonAdSlotSegmentsReport($stateParams, {
                            reportType: PERFORMANCE_REPORT_TYPES.ronAdSlot,
                            ronAdSlotBreakdown: 'segment'
                        });
                    }
                },
                ncyBreadcrumb: {
                    label: 'RTB reports'
                }
            })
        ;

        UserStateHelperProvider
            .state('reports.rtb.ronAdSlotSites', {
                url: '/ronAdSlots/{ronAdSlotId:int}/sites?{startDate:date}&{endDate:date}',
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
                                return 'reports/rtb/views/reportType/ronAdSlot/sites.tpl.html';
                            }

                            return 'reports/rtb/views/reportType/ronAdSlot/sitesDateRange.tpl.html';
                        }
                    }
                },
                resolve: {
                    reportGroup: /* @ngInject */ function ($stateParams, PERFORMANCE_REPORT_TYPES, rtbReport) {
                        return rtbReport.getRonAdSlotSitesReport($stateParams, {
                            reportType: PERFORMANCE_REPORT_TYPES.ronAdSlot,
                            ronAdSlotBreakdown: 'site'
                        });
                    }
                },
                ncyBreadcrumb: {
                    label: 'RTB reports'
                }
            })
        ;
    }
})();