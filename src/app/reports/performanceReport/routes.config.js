(function() {
    'use strict';

    angular.module('tagcade.reports.performanceReport')
        .config(addStates)
    ;

    function addStates(UserStateHelperProvider) {
        UserStateHelperProvider
            .state('reports.performanceReport', {
                url: '/performanceReports',
                views: {
                    'content@app': {
                        templateUrl: 'reports/performanceReport/views/performanceReport.tpl.html'
                    }
                },

                breadcrumb: {
                    title: 'Performance Reports'
                }
            })
        ;

        UserStateHelperProvider
            .state('reports.performanceReport.adNetwork', {
                url: '/adNetworks/{adNetworkId:int}?{startDate:date}&{endDate:date}',
                params: {
                    endDate: null
                },
                views: {
                    report: {
                        controller: 'ReportView',
                        templateUrl: 'reports/performanceReport/views/reportType/adNetwork/adNetwork.tpl.html'
                    }
                },
                resolve: {
                    reportGroup: /* @ngInject */ function ($stateParams, PerformanceReport) {
                        return PerformanceReport.getAdNetworkReport($stateParams);
                    }
                }
            })
        ;

        UserStateHelperProvider
            .state('reports.performanceReport.adNetworkAdTags', {
                url: '/adNetworks/{adNetworkId:int}/adTags?{startDate:date}&{endDate:date}',
                params: {
                    endDate: null
                },
                views: {
                    report: {
                        controller: 'ReportView',
                        templateUrl: 'reports/performanceReport/views/reportType/adNetwork/adTags.tpl.html'
                    }
                },
                resolve: {
                    reportGroup: /* @ngInject */ function ($stateParams, PerformanceReport) {
                        return PerformanceReport.getAdNetworkAdTagsReport($stateParams);
                    }
                }
            })
        ;

        UserStateHelperProvider
            .state('reports.performanceReport.adNetworkSites', {
                url: '/adNetworks/{adNetworkId:int}/sites?{startDate:date}&{endDate:date}',
                params: {
                    endDate: null
                },
                views: {
                    report: {
                        controller: 'ReportView',
                        templateUrl: 'reports/performanceReport/views/reportType/adNetwork/sites.tpl.html'
                    }
                },
                resolve: {
                    reportGroup: /* @ngInject */ function ($stateParams, PerformanceReport) {
                        return PerformanceReport.getAdNetworkSitesReport($stateParams);
                    }
                }
            })
        ;

        UserStateHelperProvider
            .state('reports.performanceReport.adNetworkSite', {
                url: '/adNetworks/{adNetworkId:int}/sites/{siteId:int}?{startDate:date}&{endDate:date}',
                params: {
                    endDate: null
                },
                views: {
                    report: {
                        controller: 'ReportView',
                        templateUrl: 'reports/performanceReport/views/reportType/adNetwork/site.tpl.html'
                    }
                },
                resolve: {
                    reportGroup: /* @ngInject */ function ($stateParams, PerformanceReport) {
                        return PerformanceReport.getAdNetworkSiteReport($stateParams);
                    }
                }
            })
        ;

        UserStateHelperProvider
            .state('reports.performanceReport.adNetworkSiteAdTags', {
                url: '/adNetworks/{adNetworkId:int}/sites/{siteId:int}/adTags?{startDate:date}&{endDate:date}',
                params: {
                    endDate: null
                },
                views: {
                    report: {
                        controller: 'ReportView',
                        templateUrl: 'reports/performanceReport/views/reportType/adNetwork/adTags.tpl.html'
                    }
                },
                resolve: {
                    reportGroup: /* @ngInject */ function ($stateParams, PerformanceReport) {
                        return PerformanceReport.getAdNetworkSiteAdTagsReport($stateParams);
                    }
                }
            })
        ;

        UserStateHelperProvider
            .state('reports.performanceReport.site', {
                url: '/sites/{siteId:int}?{startDate:date}&{endDate:date}',
                params: {
                    endDate: null
                },
                views: {
                    report: {
                        controller: 'ReportView',
                        templateUrl: 'reports/performanceReport/views/reportType/site/site.tpl.html'
                    }
                },
                resolve: {
                    reportGroup: /* @ngInject */ function ($stateParams, PerformanceReport) {
                        return PerformanceReport.getSiteReport($stateParams);
                    }
                }
            })
        ;

        UserStateHelperProvider
            .state('reports.performanceReport.siteAdSlots', {
                url: '/sites/{siteId:int}/adSlots?{startDate:date}&{endDate:date}',
                params: {
                    endDate: null
                },
                views: {
                    report: {
                        controller: 'ReportView',
                        templateUrl: 'reports/performanceReport/views/reportType/site/adSlots.tpl.html'
                    }
                },
                resolve: {
                    reportGroup: /* @ngInject */ function ($stateParams, PerformanceReport) {
                        return PerformanceReport.getSiteAdSlotsReport($stateParams);
                    }
                }
            })
        ;

        UserStateHelperProvider
            .state('reports.performanceReport.siteAdTags', {
                url: '/sites/{siteId:int}/adTags?{startDate:date}&{endDate:date}',
                params: {
                    endDate: null
                },
                views: {
                    report: {
                        controller: 'ReportView',
                        templateUrl: 'reports/performanceReport/views/reportType/site/adTags.tpl.html'
                    }
                },
                resolve: {
                    reportGroup: /* @ngInject */ function ($stateParams, PerformanceReport) {
                        return PerformanceReport.getSiteAdTagsReport($stateParams);
                    }
                }
            })
        ;

        UserStateHelperProvider
            .state('reports.performanceReport.adSlotAdtags', {
                url: '/adSlots/{adSlotId:int}/adTags?{startDate:date}&{endDate:date}',
                params: {
                    endDate: null
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