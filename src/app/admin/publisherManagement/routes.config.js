(function () {
    'use strict';

    angular
        .module('tagcade.admin.publisherManagement')
        .config(addStates)
    ;

    function addStates($stateProvider) {
        // uniqueRequestCacheBuster is used as a work-around for reloading only the current state
        // currently UI-Router will reload all parent states as well, this causes problems having

        $stateProvider
            .state({
                name: 'app.admin.publisherManagement',
                abstract: true,
                url: '/userManagement',
                ncyBreadcrumb: {
                    label: 'Publisher Management'
                }
            })

            .state({
                name: 'app.admin.publisherManagement.list',
                url: '/list?page&sortField&orderBy&search',
                params: {
                    uniqueRequestCacheBuster: null
                },
                views: {
                    'content@app': {
                        controller: 'PublisherList',
                        templateUrl: 'admin/publisherManagement/publisherList.tpl.html'
                    }
                },
                resolve: {
                    publishers: function(adminUserManager) {
                        return adminUserManager.getList({all: true});
                    }
                },
                ncyBreadcrumb: {
                    label: 'Publishers'
                }
            })

            .state({
                name: 'app.admin.publisherManagement.new',
                url: '/new',
                views: {
                    'content@app': {
                        controller: 'PublisherForm',
                        templateUrl: 'admin/publisherManagement/publisherForm.tpl.html'
                    }
                },
                resolve: {
                    publisher: function() {
                        return null;
                    },
                    exchanges: /* @ngInject */ function(ExchangeManager) {
                        return ExchangeManager.getList()
                    },
                    headerBiddings: /* @ngInject */ function(HeaderBiddingManager) {
                        return HeaderBiddingManager.getList()
                    }
                },
                ncyBreadcrumb: {
                    label: 'New Publisher'
                }
            })

            .state({
                name: 'app.admin.publisherManagement.edit',
                url: '/edit/{id:[0-9]+}',
                views: {
                    'content@app': {
                        controller: 'PublisherForm',
                        templateUrl: 'admin/publisherManagement/publisherForm.tpl.html'
                    }
                },
                resolve: {
                    publisher: function($stateParams, adminUserManager) {
                        return adminUserManager.one($stateParams.id).get();
                    },
                    exchanges: /* @ngInject */ function(ExchangeManager) {
                        return ExchangeManager.getList()
                    },
                    headerBiddings: /* @ngInject */ function(HeaderBiddingManager) {
                        return HeaderBiddingManager.getList()
                    }
                },
                ncyBreadcrumb: {
                    label: 'Edit Publisher - {{ publisher.username }}'
                }
            })
        ;
    }
})();