(function() {
    'use strict';

    angular.module('tagcade.reports.projectedBill')
        .config(addStates)
    ;

    function addStates($stateProvider, UserStateHelperProvider) {
        UserStateHelperProvider
            .state('reports.projectedBill', {
                //abstract: true,
                url: '/projectedBill',
                views: {
                    'content@app': {
                        templateUrl: 'reports/projectedBill/views/projectedBill.tpl.html'
                    }
                },
                ncyBreadcrumb: {
                    label: 'Projected Bill'
                }
            })
        ;

        $stateProvider
            .state('app.admin.reports.projectedBill.platform', {
                url: '/platform',
                views: {
                    'projectedBill': {
                        controller: 'ProjectedBill',
                        templateUrl: 'reports/projectedBill/views/projectedBillDetail.tpl.html'
                    }
                },
                resolve: {
                    reportGroup: /* @ngInject */ function ($stateParams, projectedBillService, REPORT_TYPES) {
                        return projectedBillService.getPlatformProjectedBill($stateParams, {
                            reportType: REPORT_TYPES.platform
                        });
                    }
                },
                ncyBreadcrumb: {
                    label: 'Projected Bill'
                }
            })
        ;

        $stateProvider
            .state('app.admin.reports.projectedBill.account', {
                url: '/accounts/{publisherId:int}',
                views: {
                    'projectedBill': {
                        controller: 'ProjectedBill',
                        templateUrl: 'reports/projectedBill/views/projectedBillDetail.tpl.html'
                    }
                },
                resolve: {
                    reportGroup: /* @ngInject */ function (projectedBillService, $stateParams, REPORT_TYPES) {
                        return projectedBillService.getAccountProjectedBill($stateParams, {
                            reportType: REPORT_TYPES.account
                        });
                    }
                },
                ncyBreadcrumb: {
                    label: 'Projected Bill'
                }
            })
        ;

        $stateProvider
            .state('app.publisher.reports.projectedBill.account', {
                url: '/account',
                views: {
                    'projectedBill': {
                        controller: 'ProjectedBill',
                        templateUrl: 'reports/projectedBill/views/projectedBillDetail.tpl.html'
                    }
                },
                resolve: {
                    reportGroup: /* @ngInject */ function ($stateParams, projectedBillService, userSession, REPORT_TYPES) {
                        return projectedBillService.getAccountProjectedBill($stateParams, {
                            reportType: REPORT_TYPES.account,
                            publisherId: userSession.id
                        });
                    }
                },
                ncyBreadcrumb: {
                    label: 'Projected Bill'
                }
            })
        ;

        UserStateHelperProvider
            .state('reports.projectedBill.site', {
                url: '/sites/{siteId:int}',
                views: {
                    projectedBill: {
                        controller: 'ProjectedBill',
                        templateUrl: 'reports/projectedBill/views/projectedBillDetail.tpl.html'
                    }
                },
                resolve: {
                    reportGroup: /* @ngInject */ function ($stateParams, REPORT_TYPES, projectedBillService) {
                        return projectedBillService.getSiteProjectedBill($stateParams, {
                            reportType: REPORT_TYPES.site
                        });
                    }
                },
                ncyBreadcrumb: {
                    label: 'Projected Bill'
                }
            })
        ;
    }
})();