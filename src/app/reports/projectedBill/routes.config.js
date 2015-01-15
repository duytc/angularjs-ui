(function() {
    'use strict';

    angular.module('tagcade.reports.projectedBill')
        .config(addStates)
    ;

    function addStates($stateProvider, UserStateHelperProvider) {
        UserStateHelperProvider
            .state('reports.projectedBill', {
                url: '/projectedBill',
                views: {
                    'content@app': {
                        templateUrl: 'reports/projectedBill/views/projectedBill.tpl.html'
                    }
                },
                ncyBreadcrumb: {
                    label: 'Billing Reports'
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
                    reportGroup: /* @ngInject */ function (projectedBillService) {
                        return projectedBillService.getPlatformProjectedBill();
                    }
                },
                ncyBreadcrumb: {
                    label: 'Projected Bill'
                }
            })
        ;

        $stateProvider
            .state('app.admin.reports.projectedBill.accounts', {
                url: '/accounts/{publisherId:int}',
                views: {
                    'projectedBill': {
                        controller: 'ProjectedBill',
                        templateUrl: 'reports/projectedBill/views/projectedBillDetail.tpl.html'
                    }
                },
                resolve: {
                    reportGroup: /* @ngInject */ function (projectedBillService, $stateParams) {
                        return projectedBillService.getAccountProjectedBill($stateParams.publisherId);
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
                    reportGroup: /* @ngInject */ function (projectedBillService, userSession) {
                        return projectedBillService.getAccountProjectedBill(userSession.id);
                    }
                },
                ncyBreadcrumb: {
                    label: 'Projected Bill'
                }
            })
        ;
    }
})();