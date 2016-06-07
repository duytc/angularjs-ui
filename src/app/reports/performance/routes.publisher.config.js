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

        $stateProvider
            .state('app.publisher.reports.performance.adNetworksSubPublishers', {
                url: '/adNetworksSubPublishers?{startDate:date}&{endDate:date}&{subBreakDown}',
                params: {
                    endDate: null,
                    uniqueRequestCacheBuster: null
                },
                views: {
                    report: {
                        controller: 'ReportView',
                        templateUrl: function($stateParams) {
                            if ($stateParams.subBreakDown == 'day') {
                                return 'reports/performance/views/reportType/adNetwork/subPublishersByDay.tpl.html';
                            }

                            if (!$stateParams.endDate) {
                                return 'reports/performance/views/reportType/adNetwork/subPublisher.tpl.html';
                            }

                            return 'reports/performance/views/reportType/adNetwork/subPublishersDateRange.tpl.html';
                        }
                    }
                },
                resolve: {
                    reportGroup: /* @ngInject */ function ($stateParams, PERFORMANCE_REPORT_TYPES, performanceReport, userSession) {
                        return performanceReport.getPublisherAdNetworksBySubPublishersReport($stateParams, {
                            reportType: PERFORMANCE_REPORT_TYPES.adNetwork,
                            breakDown: 'subpublisher',
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
            .state('app.publisher.reports.performance.adNetworkSiteSubPublishers', {
                url: '/adNetworks/{adNetworkId:int}/subPublishers?{startDate:date}&{endDate:date}&{subBreakDown}',
                params: {
                    endDate: null,
                    uniqueRequestCacheBuster: null
                },
                views: {
                    report: {
                        controller: 'ReportView',
                        templateUrl: function($stateParams) {
                            if($stateParams.subBreakDown == 'day') {
                                return 'reports/performance/views/reportType/adNetwork/subPublishersByDay.tpl.html'
                            }

                            return 'reports/performance/views/reportType/adNetwork/subPublishersDateRange.tpl.html'
                        }
                    }
                },
                resolve: {
                    reportGroup: /* @ngInject */ function ($stateParams, PERFORMANCE_REPORT_TYPES, performanceReport, userSession) {
                        return performanceReport.getAdNetworkSiteSubPublisherReport($stateParams, {
                            reportType: PERFORMANCE_REPORT_TYPES.adNetwork,
                            breakDown: 'subpublisher',
                            publisherId: userSession.id
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