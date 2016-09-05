(function() {
    'use strict';

    angular.module('tagcade.reports.performance')
        .config(addStates)
    ;

    function addStates($stateProvider) {
        $stateProvider
            .state('app.admin.reports.performance.platform', {
                url: '/platform?{startDate:date}&{endDate:date}&{subBreakDown}',
                params: {
                    startDate: null,
                    endDate: null,
                    uniqueRequestCacheBuster: null
                },
                views: {
                    report: {
                        controller: 'ReportView',
                        templateUrl: 'reports/performance/views/reportType/platform.tpl.html'
                    }
                },
                resolve: {
                    reportGroup: /* @ngInject */ function ($stateParams, PERFORMANCE_REPORT_TYPES, performanceReport) {
                        return performanceReport.getPlatformReport($stateParams, {
                            reportType: PERFORMANCE_REPORT_TYPES.platform,
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
            .state('app.admin.reports.performance.platformAccounts', {
                url: '/platform/accounts?{startDate:date}&{endDate:date}&{subBreakDown}',
                params: {
                    endDate: null,
                    uniqueRequestCacheBuster: null
                },
                views: {
                    report: {
                        controller: 'ReportView',
                        templateUrl: function($stateParams) {
                            if($stateParams.subBreakDown == 'day') {
                                return 'reports/performance/views/reportType/accountsByDay.tpl.html'
                            }

                            return 'reports/performance/views/reportType/accounts.tpl.html'
                        }
                    }
                },
                resolve: {
                    reportGroup: /* @ngInject */ function ($stateParams, PERFORMANCE_REPORT_TYPES, performanceReport) {
                        return performanceReport.getPlatformAccountsReport($stateParams, {
                            reportType: PERFORMANCE_REPORT_TYPES.platform,
                            breakDown: 'account'
                        });
                    }
                },
                ncyBreadcrumb: {
                    label: 'Performance reports'
                }
            })
        ;

        $stateProvider
            .state('app.admin.reports.performance.platformSites', {
                url: '/platform/sites?{startDate:date}&{endDate:date}&{subBreakDown}',
                params: {
                    endDate: null,
                    uniqueRequestCacheBuster: null
                },
                views: {
                    report: {
                        controller: 'ReportView',
                        templateUrl: function($stateParams) {
                            if($stateParams.subBreakDown == 'day') {
                                return 'reports/performance/views/reportType/site/sitesByDay.tpl.html'
                            }

                            return 'reports/performance/views/reportType/site/sites.tpl.html'
                        }
                    }
                },
                resolve: {
                    reportGroup: /* @ngInject */ function ($stateParams, PERFORMANCE_REPORT_TYPES, performanceReport) {
                        return performanceReport.getPlatformSitesReport($stateParams, {
                            reportType: PERFORMANCE_REPORT_TYPES.platform,
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
            .state('app.admin.reports.performance.account', {
                url: '/accounts/{publisherId:int}?{startDate:date}&{endDate:date}',
                params: {
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
                    reportGroup: /* @ngInject */ function ($stateParams, PERFORMANCE_REPORT_TYPES, performanceReport) {
                        return performanceReport.getAccountReport($stateParams, {
                            reportType: PERFORMANCE_REPORT_TYPES.account
                        });
                    }
                },
                ncyBreadcrumb: {
                    label: 'Performance reports'
                }
            })
        ;

        $stateProvider
            .state('app.admin.reports.performance.adNetworks', {
                url: '/accounts/{publisherId:int}/adNetworks?{startDate:date}&{endDate:date}&{subBreakDown}',
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

                            return 'reports/performance/views/reportType/adNetwork/adNetworks.tpl.html'
                        }
                    }
                },
                resolve: {
                    reportGroup: /* @ngInject */ function ($stateParams, PERFORMANCE_REPORT_TYPES, performanceReport) {
                        return performanceReport.getPublisherAdNetworksReport($stateParams, {
                            reportType: PERFORMANCE_REPORT_TYPES.adNetwork,
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
            .state('app.admin.reports.performance.sites', {
                url: '/accounts/{publisherId:int}/sites?{startDate:date}&{endDate:date}&{subBreakDown}',
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

                            return 'reports/performance/views/reportType/site/sites.tpl.html';
                        }
                    }
                },
                resolve: {
                    reportGroup: /* @ngInject */ function ($stateParams, PERFORMANCE_REPORT_TYPES, performanceReport) {
                        return performanceReport.getPublisherSitesReport($stateParams, {
                            reportType: PERFORMANCE_REPORT_TYPES.site,
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
            .state('app.admin.reports.performance.adNetworksAdTags', {
                url: '/accounts/{publisherId:int}/adNetworksAdTags?{startDate:date}&{endDate:date}&{subBreakDown}',
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
                    reportGroup: /* @ngInject */ function ($stateParams, PERFORMANCE_REPORT_TYPES, performanceReport) {
                        return performanceReport.getPublisherAdNetworksByAdTagsReport($stateParams, {
                            reportType: PERFORMANCE_REPORT_TYPES.adNetwork,
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
            .state('app.admin.reports.performance.adNetworksSubPublishers', {
                url: '/accounts/{publisherId:int}/adNetworksSubPublishers?{startDate:date}&{endDate:date}&{subBreakDown}',
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
                    reportGroup: /* @ngInject */ function ($stateParams, PERFORMANCE_REPORT_TYPES, performanceReport) {
                        return performanceReport.getPublisherAdNetworksBySubPublishersReport($stateParams, {
                            reportType: PERFORMANCE_REPORT_TYPES.adNetwork,
                            breakDown: 'subpublisher'
                        });
                    }
                },
                ncyBreadcrumb: {
                    label: 'Performance reports'
                }
            })
        ;

        $stateProvider
            .state('app.admin.reports.performance.adNetworkSiteSubPublishers', {
                url: '/accounts/{publisherId:int}/adNetworks/{adNetworkId:int}/subPublishers?{startDate:date}&{endDate:date}&{subBreakDown}',
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
                    reportGroup: /* @ngInject */ function ($stateParams, PERFORMANCE_REPORT_TYPES, performanceReport) {
                        return performanceReport.getAdNetworkSiteSubPublisherReport($stateParams, {
                            reportType: PERFORMANCE_REPORT_TYPES.adNetwork,
                            breakDown: 'subpublisher'
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