angular.module('tagcade.reports.performanceReport', [
    'daterangepicker'
])

    .constant('PERFORMANCE_REPORT_EVENTS', {
        formSubmit: 'tagcade.reports.performanceReport.form_submit'
    })

    .config(function ($stateProvider, UserStateHelperProvider) {
        'use strict';

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

        // admin only
        $stateProvider
            .state('app.admin.reports.performanceReport.platform', {
                url: '/platform?startDate&endDate',
                views: {
                    'report': {
                        controller: 'ReportViewController',
                        templateUrl: 'reports/performanceReport/views/reportView.tpl.html'
                    }
                },
                resolve: {
                    report: function ($q, $stateParams, ReportSelector) {
                        var initSelectorDataPromise = ReportSelector.setInitialData('platform', $stateParams);

                        return $q.all(initSelectorDataPromise).then(function () {
                            return {};
                        });
                    }
                }
            })
        ;

        $stateProvider
            .state('app.admin.reports.performanceReport.account', {
                url: '/account/{publisherId:[0-9]+}?startDate&endDate',
                views: {
                    'report': {
                        controller: 'ReportViewController',
                        templateUrl: 'reports/performanceReport/views/reportView.tpl.html'
                    }
                },
                resolve: {
                    report: function ($q, $stateParams, ReportSelector) {
                        var initSelectorDataPromise = ReportSelector.setInitialData('account', $stateParams);

                        return $q.all(initSelectorDataPromise).then(function () {
                            return {};
                        });
                    }
                }
            })
        ;

        $stateProvider
            .state('app.publisher.reports.performanceReport.account', {
                url: '/account?startDate&endDate',
                views: {
                    'report': {
                        controller: 'ReportViewController',
                        templateUrl: 'reports/performanceReport/views/reportView.tpl.html'
                    }
                },
                resolve: {
                    report: function ($q, $stateParams, ReportSelector) {
                        var initSelectorDataPromise = ReportSelector.setInitialData('account', $stateParams);

                        return $q.all(initSelectorDataPromise).then(function () {
                            return {};
                        });
                    }
                }
            })
        ;

        UserStateHelperProvider
            .state('reports.performanceReport.site', {
                url: '/site/{siteId:[0-9]+}?startDate&endDate',
                views: {
                    'report': {
                        controller: 'ReportViewController',
                        templateUrl: 'reports/performanceReport/views/reportView.tpl.html'
                    }
                },
                resolve: {
                    report: function ($q, $stateParams, ReportSelector) {
                        var initSelectorDataPromise = ReportSelector.setInitialData('site', $stateParams);

                        return $q.all(initSelectorDataPromise).then(function () {
                            return {};
                        });
                    }
                }
            })
            .state('reports.performanceReport.adSlot', {
                url: '/adSlot/{adSlotId:[0-9]+}?startDate&endDate',
                views: {
                    'report': {
                        controller: 'ReportViewController',
                        templateUrl: 'reports/performanceReport/views/reportView.tpl.html'
                    }
                },
                resolve: {
                    report: function ($q, $stateParams, ReportSelector) {
                        var initSelectorDataPromise = ReportSelector.setInitialData('adSlot', $stateParams);

                        return $q.all(initSelectorDataPromise).then(function () {
                            return {};
                        });
                    }
                }
            })
            .state('reports.performanceReport.adTag', {
                url: '/adTag/{adTagId:[0-9]+}?startDate&endDate',
                views: {
                    'report': {
                        controller: 'ReportViewController',
                        templateUrl: 'reports/performanceReport/views/reportView.tpl.html'
                    }
                },
                resolve: {
                    report: function ($q, $stateParams, ReportSelector) {
                        var initSelectorDataPromise = ReportSelector.setInitialData('adTag', $stateParams);

                        return $q.all(initSelectorDataPromise).then(function () {
                            return {};
                        });
                    }
                }
            })
            .state('reports.performanceReport.adNetwork', {
                url: '/adNetwork/{adNetworkId:[0-9]+}?startDate&endDate',
                views: {
                    'report': {
                        controller: 'ReportViewController',
                        templateUrl: 'reports/performanceReport/views/reportView.tpl.html'
                    }
                },
                resolve: {
                    report: function ($q, $stateParams, ReportSelector) {
                        var initSelectorDataPromise = ReportSelector.setInitialData('adNetwork', $stateParams);

                        return $q.all(initSelectorDataPromise).then(function () {
                            return {};
                        });
                    }
                }
            })
        ;
    })

;
