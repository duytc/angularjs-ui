angular.module('tagcade.reports.performanceReport', [
    'daterangepicker'
])

    .constant('PERFORMANCE_REPORT_EVENTS', {
        formSubmit: 'tagcade.reports.performanceReport.form_submit',
        expandReport: 'tagcade.reports.performanceReport.expand_report'
    })

    .constant('PERFORMANCE_REPORT_TYPES', {
        // site hierarchy
        platform: {
            platform: {
                type: 'platform.platform',
                name: 'Platform Report',
                routeParams: {
                    platform: null
                }
            },

            account: {
                type: 'platform.account',
                name: 'Account Report',
                requiredParams: ['publisherId'],
                routeParams: {
                    account: 'publisherId'
                }
            },

            site: {
                type: 'platform.site',
                name: 'Site Report',
                requiredParams: ['siteId'],
                routeParams: {
                    site: 'siteId'
                }
            },

            adSlot: {
                type: 'platform.adSlot',
                name: 'Ad Slot Report',
                requiredParams: ['adSlotId'],
                routeParams: {
                    adslot: 'adSlotId'
                }
            },

            adTag: {
                type: 'platform.adTag',
                name: 'Ad Tag Report',
                requiredParams: ['adTagId'],
                routeParams: {
                    adtag: 'adTagId'
                },
                isExpandable: false
            }
        },

        // ad network hierarchy
        adNetwork: {
            adNetwork: {
                type: 'adNetwork.adNetwork',
                name: 'Ad Network',
                requiredParams: ['adNetworkId'],
                routeParams: {
                    adnetwork: 'adNetworkId'
                }
            },

            site: {
                type: 'adNetwork.site',
                name: 'Ad Network',
                requiredParams: ['adNetworkId', 'siteId'],
                routeParams: {
                    adnetwork: 'adNetworkId',
                    site: 'siteId'
                }
            }
        }
    })

    .config(function ($stateProvider, UserStateHelperProvider, PERFORMANCE_REPORT_TYPES) {
        'use strict';

        /**
         *
         * @param $stateParams
         * @param {String} reportType
         * @param {String} reportTypeIfExpanded
         * @param {String} [hierarchy]
         * @returns {string}
         */
        function getTemplateUrl ($stateParams, reportType, reportTypeIfExpanded, hierarchy) {
            hierarchy = hierarchy || 'platform';

            if ($stateParams.expand == 'true' || $stateParams.expand === true) {
                reportType = reportTypeIfExpanded;
            }

            return 'reports/performanceReport/views/reports/display/hierarchy/' + hierarchy + '/' + reportType + 'Report.tpl.html';
        }

        UserStateHelperProvider
            .state('reports.performanceReport', {
                url: '/performanceReports',
                views: {
                    'content@app': {
                        controller: 'PerformanceReportController',
                        templateUrl: 'reports/performanceReport/views/performanceReport.tpl.html'
                    }
                },
                data: {
                    wideContent: true
                },
                breadcrumb: {
                    title: 'Performance Reports'
                }
            })
        ;

        // base report hierarchy states, UI router requires we define another ui view

        UserStateHelperProvider
            .state('reports.performanceReport.platform', {
                abstract: true,
                views: {
                    '': {
                        template: '<div ui-view="report"></div>'
                    }
                }
            })
        ;

        UserStateHelperProvider
            .state('reports.performanceReport.adNetwork', {
                abstract: true,
                views: {
                    '': {
                        template: '<div ui-view="report"></div>'
                    }
                }
            })
        ;

        // admin only
        $stateProvider
            .state('app.admin.reports.performanceReport.platform.platform', {
                url: '/platform?startDate&endDate&expand',
                views: {
                    'report': {
                        controller: 'ReportViewController',
                        templateUrl: function ($stateParams) {
                            return getTemplateUrl($stateParams, 'platform', 'account');
                        }
                    }
                },
                resolve: {
                    reportType: function () {
                        return PERFORMANCE_REPORT_TYPES.platform.platform.type;
                    },

                    reports: /* @ngInject */ function ($stateParams, ReportSelectorForm, ReportFetcher, reportType) {
                        ReportSelectorForm.setInitialData(reportType, $stateParams);

                        return ReportFetcher.getReports(reportType, $stateParams);
                    }
                }
            })
        ;

        $stateProvider
            .state('app.admin.reports.performanceReport.platform.account', {
                url: '/account/{publisherId:[0-9]+}?startDate&endDate&expand',
                views: {
                    'report': {
                        controller: 'ReportViewController',
                        templateUrl: function ($stateParams) {
                            return getTemplateUrl($stateParams, 'account', 'site');
                        }
                    }
                },
                resolve: {
                    reportType: function () {
                        return PERFORMANCE_REPORT_TYPES.platform.account.type;
                    },

                    reports: /* @ngInject */ function ($stateParams, ReportSelectorForm, ReportFetcher, reportType) {
                        ReportSelectorForm.setInitialData(reportType, $stateParams);

                        return ReportFetcher.getReports(reportType, $stateParams);
                    }
                }
            })
        ;

        $stateProvider
            .state('app.publisher.reports.performanceReport.platform.account', {
                url: '/account?startDate&endDate&expand',
                views: {
                    'report': {
                        controller: 'ReportViewController',
                        templateUrl: function ($stateParams) {
                            return getTemplateUrl($stateParams, 'account', 'site');
                        }
                    }
                },
                resolve: {
                    reportType: function () {
                        return PERFORMANCE_REPORT_TYPES.platform.account.type;
                    },

                    reports: /* @ngInject */ function ($stateParams, ReportSelectorForm, ReportFetcher, reportType) {
                        ReportSelectorForm.setInitialData(reportType, $stateParams);

                        return ReportFetcher.getReports(reportType, $stateParams);
                    }
                }
            })
        ;

        UserStateHelperProvider
            .state('reports.performanceReport.platform.site', {
                url: '/site/{siteId:[0-9]+}?startDate&endDate&expand',
                views: {
                    'report': {
                        controller: 'ReportViewController',
                        templateUrl: function ($stateParams) {
                            return getTemplateUrl($stateParams, 'site', 'adSlot');
                        }
                    }
                },
                resolve: {
                    reportType: function () {
                        return PERFORMANCE_REPORT_TYPES.platform.site.type;
                    },

                    reports: /* @ngInject */ function ($stateParams, ReportSelectorForm, ReportFetcher, reportType) {
                        ReportSelectorForm.setInitialData(reportType, $stateParams);

                        return ReportFetcher.getReports(reportType, $stateParams);
                    }
                }
            })
            .state('reports.performanceReport.platform.adSlot', {
                url: '/adSlot/{adSlotId:[0-9]+}?startDate&endDate&expand',
                views: {
                    'report': {
                        controller: 'ReportViewController',
                        templateUrl: function ($stateParams) {
                            return getTemplateUrl($stateParams, 'adSlot', 'adTag');
                        }
                    }
                },
                resolve: {
                    reportType: function () {
                        return PERFORMANCE_REPORT_TYPES.platform.adSlot.type;
                    },

                    reports: /* @ngInject */ function ($stateParams, ReportSelectorForm, ReportFetcher, reportType) {
                        ReportSelectorForm.setInitialData(reportType, $stateParams);

                        return ReportFetcher.getReports(reportType, $stateParams);
                    }
                }
            })
            .state('reports.performanceReport.platform.adTag', {
                url: '/adTag/{adTagId:[0-9]+}?startDate&endDate&expand',
                views: {
                    'report': {
                        controller: 'ReportViewController',
                        templateUrl: 'reports/performanceReport/views/reports/display/hierarchy/platform/adTagReport.tpl.html'
                    }
                },
                resolve: {
                    reportType: function () {
                        return PERFORMANCE_REPORT_TYPES.platform.adTag.type;
                    },

                    reports: /* @ngInject */ function ($stateParams, ReportSelectorForm, ReportFetcher, reportType) {
                        ReportSelectorForm.setInitialData(reportType, $stateParams);

                        return ReportFetcher.getReports(reportType, $stateParams);
                    }
                }
            })
            .state('reports.performanceReport.adNetwork.adNetwork', {
                url: '/adNetwork/{adNetworkId:[0-9]+}?startDate&endDate&expand',
                views: {
                    'report': {
                        controller: 'ReportViewController',
                        templateUrl: function ($stateParams) {
                            return getTemplateUrl($stateParams, 'adNetwork', 'site', 'adNetwork');
                        }
                    }
                },
                resolve: {
                    reportType: function () {
                        return PERFORMANCE_REPORT_TYPES.adNetwork.adNetwork.type;
                    },

                    reports: /* @ngInject */ function ($stateParams, ReportSelectorForm, ReportFetcher, reportType) {
                        ReportSelectorForm.setInitialData(reportType, $stateParams);

                        return ReportFetcher.getReports(reportType, $stateParams);
                    }
                }
            })
            .state('reports.performanceReport.adNetwork.site', {
                url: '/adNetwork/{adNetworkId:[0-9]+}/site/{siteId:[0-9]+}?startDate&endDate&expand',
                views: {
                    'report': {
                        controller: 'ReportViewController',
                        templateUrl: function ($stateParams) {
                            return getTemplateUrl($stateParams, 'site', 'adTag', 'adNetwork');
                        }
                    }
                },
                resolve: {
                    reportType: function () {
                        return PERFORMANCE_REPORT_TYPES.adNetwork.site.type;
                    },

                    reports: /* @ngInject */ function ($stateParams, ReportSelectorForm, ReportFetcher, reportType) {
                        ReportSelectorForm.setInitialData(reportType, $stateParams);

                        return ReportFetcher.getReports(reportType, $stateParams);
                    }
                }
            })
        ;
    })

;
