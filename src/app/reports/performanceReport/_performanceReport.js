angular.module('tagcade.reports.performanceReport', [
    'daterangepicker'
])

    .constant('PERFORMANCE_REPORT_EVENTS', {
        formSubmit: 'tagcade.reports.performanceReport.form_submit',
        expandReport: 'tagcade.reports.performanceReport.expand_report'
    })

    .constant('PERFORMANCE_REPORT_TYPES', {
        platform: {
            platform: 'platform.platform',
            account: 'platform.account',
            site: 'platform.site',
            adSlot: 'platform.adSlot',
            adTag: 'platform.adTag'
        },

        adNetwork: {
            adNetwork: 'adNetwork.adNetwork',
            site: 'adNetwork.site',
            adTag: 'adNetwork.adTag'
        }
    })

    .config(function ($stateProvider, UserStateHelperProvider, PERFORMANCE_REPORT_TYPES) {
        'use strict';

        /**
         *
         * @param $stateParams
         * @param {String} reportType
         * @param {String} reportTypeIfExpanded
         * @returns {string}
         */
        function getTemplateUrl ($stateParams, reportType, reportTypeIfExpanded) {
            if ($stateParams.expand == 'true' || $stateParams.expand === true) {
                reportType = reportTypeIfExpanded;
            }

            return 'reports/performanceReport/views/reports/display/hierarchy/platform/' + reportType + 'Report.tpl.html';
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
                        return PERFORMANCE_REPORT_TYPES.platform.platform;
                    },

                    reports: /* @ngInject */ function ($stateParams, ReportSelectorForm, ReportSelector, reportType) {
                        ReportSelectorForm.setInitialData(reportType, $stateParams);

                        return ReportSelector.getReports(reportType, $stateParams);
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
                        return PERFORMANCE_REPORT_TYPES.platform.account;
                    },

                    reports: /* @ngInject */ function ($stateParams, ReportSelectorForm, ReportSelector, reportType) {
                        ReportSelectorForm.setInitialData(reportType, $stateParams);

                        return ReportSelector.getReports(reportType, $stateParams);
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
                        return PERFORMANCE_REPORT_TYPES.platform.account;
                    },

                    reports: /* @ngInject */ function ($stateParams, ReportSelectorForm, ReportSelector, reportType) {
                        ReportSelectorForm.setInitialData(reportType, $stateParams);

                        return ReportSelector.getReports(reportType, $stateParams);
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
                        return PERFORMANCE_REPORT_TYPES.platform.site;
                    },

                    reports: /* @ngInject */ function ($stateParams, ReportSelectorForm, ReportSelector, reportType) {
                        ReportSelectorForm.setInitialData(reportType, $stateParams);

                        return ReportSelector.getReports(reportType, $stateParams);
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
                        return PERFORMANCE_REPORT_TYPES.platform.adSlot;
                    },

                    reports: /* @ngInject */ function ($stateParams, ReportSelectorForm, ReportSelector, reportType) {
                        ReportSelectorForm.setInitialData(reportType, $stateParams);

                        return ReportSelector.getReports(reportType, $stateParams);
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
                        return PERFORMANCE_REPORT_TYPES.platform.adTag;
                    },

                    reports: /* @ngInject */ function ($stateParams, ReportSelectorForm, ReportSelector, reportType) {
                        ReportSelectorForm.setInitialData(reportType, $stateParams);

                        return ReportSelector.getReports(reportType, $stateParams);
                    }
                }
            })
            .state('reports.performanceReport.platform.adNetwork', {
                url: '/adNetwork/{adNetworkId:[0-9]+}?startDate&endDate',
                views: {
                    'report': {
                        controller: 'ReportViewController',
                        templateUrl: 'reports/performanceReport/views/reportView.tpl.html'
                    }
                },
                resolve: {
                    reportType: function () {
                        return PERFORMANCE_REPORT_TYPES.adNetwork.adNetwork;
                    },

                    reports: /* @ngInject */ function ($stateParams, ReportSelectorForm, ReportSelector, reportType) {
                        ReportSelectorForm.setInitialData(reportType, $stateParams);

                        return ReportSelector.getReports(reportType, $stateParams);
                    }
                }
            })
        ;
    })

;
