(function() {
    'use strict';

    angular.module('tagcade.exchangeManagement')
        .config(addStates)
    ;

    function addStates(UserStateHelperProvider) {
        // uniqueRequestCacheBuster is used as a work-around for reloading only the current state
        // currently UI-Router will reload all parent states as well, this causes problems having

        UserStateHelperProvider
            .state('exchangeManagement', {
                abstract: true,
                url: '/exchanges',
                ncyBreadcrumb: {
                    skip: true
                }
            })
            .state('exchangeManagement.list', {
                url: '/list?page&sortField&orderBy&search',
                params: {
                    uniqueRequestCacheBuster: null
                },
                views: {
                    'content@app': {
                        controller: 'ExchangeList',
                        templateUrl: 'exchangeManagement/exchangeList.tpl.html'
                    }
                },
                resolve: {
                    exchanges: /* @ngInject */ function(ExchangeManager) {
                        return ExchangeManager.getList()
                    }
                },
                ncyBreadcrumb: {
                    label: '{{ "NAVBAR.EXCHANGES" | translate }}'
                }

            })
            .state('exchangeManagement.new', {
                url: '/new',
                views: {
                    'content@app': {
                        controller: 'ExchangeForm',
                        templateUrl: 'exchangeManagement/exchangeForm.tpl.html'
                    }
                },
                resolve: {
                    exchange: function() {
                        return null;
                    }
                },
                ncyBreadcrumb: {
                    label: '{{ "EXCHANGE_MODULE.NEW_EXCHANGE" | translate }}'
                }
            })
            .state('exchangeManagement.edit', {
                url: '/edit/{id:[0-9]+}',
                views: {
                    'content@app': {
                        controller: 'ExchangeForm',
                        templateUrl: 'exchangeManagement/exchangeForm.tpl.html'
                    }
                },
                resolve: {
                    exchange: /* @ngInject */ function(ExchangeManager, $stateParams) {
                        return ExchangeManager.one($stateParams.id).get();
                    }
                },
                ncyBreadcrumb: {
                    label: '{{ "EXCHANGE_MODULE.EDIT_EXCHANGE" | translate }}'
                }
            })
        ;
    }
})();