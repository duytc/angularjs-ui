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
                resolve: {
                    reportSelectorCriteria: function () {
                        return {
                            startDate: null,
                            endDate: null
                        };
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
                url: '/platform?from&to',
                views: {
                    'report': {
                        template: 'This is a platform report'
                    }
                },
                resolve: {
                }
            })
        ;

        UserStateHelperProvider
            .state('reports.performanceReport.account', {
                url: '/account?from&to',
                views: {
                    'report': {
                        template: 'This is an account report'
                    }
                },
                resolve: {
                }
            })
            .state('reports.performanceReport.site', {
                url: '/site?from&to',
                views: {
                    'report': {
                        template: 'This is a site report'
                    }
                },
                resolve: {
                }
            })
            .state('reports.performanceReport.adSlot', {
                url: '/adSlot?from&to',
                views: {
                    'report': {
                        template: 'This is an ad slot report'
                    }
                },
                resolve: {
                }
            })
            .state('reports.performanceReport.adTag', {
                url: '/adTag?from&to',
                views: {
                    'report': {
                        template: 'This is an ad tag report'
                    }
                },
                resolve: {
                }
            })
            .state('reports.performanceReport.adNetwork', {
                url: '/adNetwork?from&to',
                views: {
                    'report': {
                        template: 'This is an ad network report'
                    }
                },
                resolve: {
                }
            })
        ;
    })

;
