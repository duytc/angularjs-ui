(function() {
    'use strict';

    angular.module('tagcade.videoManagement.demandPartner')
        .config(addStates)
    ;

    function addStates(UserStateHelperProvider) {
        // uniqueRequestCacheBuster is used as a work-around for reloading only the current state
        // currently UI-Router will reload all parent states as well, this causes problems having

        UserStateHelperProvider
            .state('videoManagement.demandPartner', {
                abstract: true,
                url: '/demandPartners',
                ncyBreadcrumb: {
                    skip: true
                }
            })
            .state('videoManagement.demandPartner.list', {
                url: '/list?page&sortField&orderBy&search&limit',
                params: {
                    uniqueRequestCacheBuster: null
                },
                views: {
                    'content@app': {
                        controller: 'DemandPartnerList',
                        templateUrl: 'videoManagement/demandPartner/demandPartnerList.tpl.html'
                    }
                },
                resolve: {
                    demandPartners: /* @ngInject */ function(VideoDemandPartnerManager, $stateParams) {
                        $stateParams.page = !$stateParams.page ? 1 : $stateParams.page;
                        $stateParams.orderBy = !$stateParams.orderBy ? 'desc' : $stateParams.orderBy;
                        $stateParams.sortField = !$stateParams.sortField ? 'name' : $stateParams.sortField;
                        $stateParams.limit = !$stateParams.limit ? 10 : $stateParams.itemsPerPage;
                        return VideoDemandPartnerManager.one().get($stateParams);
                    }
                },
                ncyBreadcrumb: {
                    label: 'Video Demand Partners'
                }
            })
            .state('videoManagement.demandPartner.new', {
                url: '/new',
                views: {
                    'content@app': {
                        controller: 'DemandPartnerForm',
                        templateUrl: 'videoManagement/demandPartner/demandPartnerForm.tpl.html'
                    }
                },
                resolve: {
                    demandPartner: function() {
                        return null;
                    }
                },
                customResolve: {
                    admin: {
                        publishers: /* @ngInject */ function(adminUserManager) {
                            return adminUserManager.getList({ filter: 'publisher' }).then(function (users) {
                                return users.plain();
                            });
                        }
                    }
                },
                ncyBreadcrumb: {
                    label: 'New Video Demand Partner'
                }
            })
            .state('videoManagement.demandPartner.edit', {
                url: '/edit/{id:[0-9]+}',
                views: {
                    'content@app': {
                        controller: 'DemandPartnerForm',
                        templateUrl: 'videoManagement/demandPartner/demandPartnerForm.tpl.html'
                    }
                },
                resolve: {
                    demandPartner: /* @ngInject */ function($stateParams, VideoDemandPartnerManager) {
                        return VideoDemandPartnerManager.one($stateParams.id).get();
                    },
                    publishers: function() {
                        return null;
                    }
                },
                ncyBreadcrumb: {
                    label: 'Edit Video Demand Partner - {{ demandPartner.name }}'
                }
            })
        ;
    }
})();