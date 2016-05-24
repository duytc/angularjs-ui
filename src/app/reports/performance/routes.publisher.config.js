(function() {
    'use strict';

    angular.module('tagcade.reports.performance')
        .config(addStates)
    ;

    function addStates($stateProvider) {
        $stateProvider
            .state('app.publisher.reports.performance.account', {
                url: '/account?{startDate:date}&{endDate:date}',
                params: {
                    startDate: null,
                    endDate: null,
                    uniqueRequestCacheBuster: null
                },
                views: {
                    report: {
                        controller: 'ReportView',
                        templateUrl: 'reports/performance/views/reportType/account.tpl.html'
                    }
                },
                resolve: {
                    reportGroup: /* @ngInject */ function ($stateParams, PERFORMANCE_REPORT_TYPES, performanceReport, userSession) {
                        return performanceReport.getAccountReport($stateParams, {
                            reportType: PERFORMANCE_REPORT_TYPES.account,
                            publisherId: userSession.id
                        });
                    }
                },
                ncyBreadcrumb: {
                    label: 'Performance reports'
                }
            })
        ;

        $stateProvider
            .state('app.publisher.reports.performance.adNetworks', {
                url: '/adNetworks?{startDate:date}&{endDate:date}&{subBreakDown}',
                params: {
                    endDate: null,
                    uniqueRequestCacheBuster: null
                },
                views: {
                    report: {
                        controller: 'ReportView',
                        templateUrl: function($stateParams) {
                            if($stateParams.subBreakDown == 'day') {
                                return 'reports/performance/views/reportType/adNetwork/adNetworksByDay.tpl.html'
                            }

                            if (!$stateParams.endDate) {
                                return 'reports/performance/views/reportType/adNetwork/adNetworks.tpl.html';
                            }

                            return 'reports/performance/views/reportType/adNetwork/adNetworksDateRange.tpl.html';
                        }
                    }
                },
                resolve: {
                    reportGroup: /* @ngInject */ function ($stateParams, PERFORMANCE_REPORT_TYPES, performanceReport, userSession) {
                        return performanceReport.getPublisherAdNetworksReport($stateParams, {
                            reportType: PERFORMANCE_REPORT_TYPES.adNetwork,
                            publisherId: userSession.id,
                            breakDown: 'partner'
                        });
                    }
                },
                ncyBreadcrumb: {
                    label: 'Performance reports'
                }
            })
        ;

        $stateProvider
            .state('app.publisher.reports.performance.sites', {
                url: '/sites?{startDate:date}&{endDate:date}&{subBreakDown}',
                params: {
                    endDate: null,
                    uniqueRequestCacheBuster: null
                },
                views: {
                    report: {
                        controller: 'ReportView',
                        templateUrl: function($stateParams) {
                            if($stateParams.subBreakDown == 'day') {
                                return 'reports/performance/views/reportType/site/sitesByDay.tpl.html';
                            }

                            if (!$stateParams.endDate) {
                                return 'reports/performance/views/reportType/site/sites.tpl.html';
                            }

                            return 'reports/performance/views/reportType/site/sitesDateRange.tpl.html';
                        }
                    }
                },
                resolve: {
                    reportGroup: /* @ngInject */ function ($stateParams, PERFORMANCE_REPORT_TYPES, performanceReport, userSession) {
                        return performanceReport.getPublisherSitesReport($stateParams, {
                            reportType: PERFORMANCE_REPORT_TYPES.site,
                            publisherId: userSession.id,
                            breakDown: 'site'
                        });
                    }
                },
                ncyBreadcrumb: {
                    label: 'Performance reports'
                }
            })
        ;

        $stateProvider
            .state('app.publisher.reports.performance.sitesDay', {
                url: '/sitesDay?{startDate:date}&{endDate:date}',
                params: {
                    endDate: null,
                    uniqueRequestCacheBuster: null
                },
                views: {
                    report: {
                        controller: 'ReportView',
                        templateUrl: 'reports/performance/views/reportType/site/sitesByDay.tpl.html' // change tpl
                    }
                },
                resolve: {
                    reportGroup: /* @ngInject */ function ($stateParams, PERFORMANCE_REPORT_TYPES, performanceReport, userSession) {
                        return performanceReport.getPublisherSitesByDayReport($stateParams, {
                            reportType: PERFORMANCE_REPORT_TYPES.site,
                            publisherId: userSession.id,
                            breakDown: 'day'
                        });
                    }
                },
                ncyBreadcrumb: {
                    label: 'Performance reports'
                }
            })
        ;

        $stateProvider
            .state('app.publisher.reports.performance.adNetworksDay', {
                url: '/adNetworksDay?{startDate:date}&{endDate:date}',
                params: {
                    endDate: null,
                    uniqueRequestCacheBuster: null
                },
                views: {
                    report: {
                        controller: 'ReportView',
                        templateUrl: 'reports/performance/views/reportType/adNetwork/allAdNetworkByDay.tpl.html' // change tpl
                    }
                },
                resolve: {
                    reportGroup: /* @ngInject */ function ($stateParams, PERFORMANCE_REPORT_TYPES, performanceReport, userSession) {
                        return performanceReport.getPublisherAdNetworksByDayReport($stateParams, {
                            reportType: PERFORMANCE_REPORT_TYPES.adNetwork,
                            publisherId: userSession.id,
                            breakDown: 'day'
                        });
                    }
                },
                ncyBreadcrumb: {
                    label: 'Performance reports'
                }
            })
        ;

        $stateProvider
            .state('app.publisher.reports.performance.adNetworksAdTags', {
                url: '/adNetworksAdTags?{startDate:date}&{endDate:date}&{subBreakDown}',
                params: {
                    endDate: null,
                    uniqueRequestCacheBuster: null
                },
                views: {
                    report: {
                        controller: 'ReportView',
                        templateUrl: function($stateParams) {
                            if ($stateParams.subBreakDown == 'day') {
                                return 'reports/performance/views/reportType/adNetwork/adTagsByDay.tpl.html';
                            }

                            if (!$stateParams.endDate) {
                                return 'reports/performance/views/reportType/adNetwork/adTagsDateRange.tpl.html';
                            }

                            return 'reports/performance/views/reportType/adNetwork/adTags.tpl.html';
                        }
                    }
                },
                resolve: {
                    reportGroup: /* @ngInject */ function ($stateParams, PERFORMANCE_REPORT_TYPES, performanceReport, userSession) {
                        return performanceReport.getPublisherAdNetworksByAdTagsReport($stateParams, {
                            reportType: PERFORMANCE_REPORT_TYPES.adNetwork,
                            publisherId: userSession.id,
                            breakDown: 'adtag'
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