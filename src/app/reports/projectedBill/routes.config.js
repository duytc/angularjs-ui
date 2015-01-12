(function() {
    'use strict';

    angular.module('tagcade.reports.projectedBill')
        .config(addStates)
    ;

    function addStates($stateProvider, UserStateHelperProvider) {
        UserStateHelperProvider
            .state('reports.projectedBill', {
                abstract: true,
                url: '/projectedBill',
                ncyBreadcrumb: {
                    skip: true
                }
            })
        ;

        $stateProvider
            .state('app.admin.reports.projectedBill.platform', {
                url: '/platform',
                views: {
                    'content@app': {
                        controller: 'ProjectedBill',
                        templateUrl: 'reports/projectedBill/projectedBill.tpl.html'
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
                    'content@app': {
                        controller: 'ProjectedBill',
                        templateUrl: 'reports/projectedBill/projectedBill.tpl.html'
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
                    'content@app': {
                        controller: 'ProjectedBill',
                        templateUrl: 'reports/projectedBill/projectedBill.tpl.html'
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