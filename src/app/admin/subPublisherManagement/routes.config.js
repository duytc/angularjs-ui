(function () {
    'use strict';

    angular
        .module('tagcade.admin.subPublisher')
        .config(addStates)
    ;

    function addStates(UserStateHelperProvider, STATUS_STATE_FOR_SUB_PUBLISHER_PERMISSION) {
        UserStateHelperProvider
            .state({
                name: 'subPublisher',
                data: {
                    demandSourceTransparency: STATUS_STATE_FOR_SUB_PUBLISHER_PERMISSION.hide
                },
                abstract: true,
                url: '/subPublisherManagement'
            })

            .state({
                name: 'subPublisher.list',
                url: '/list?page&sortField&orderBy&search',
                params: {
                    uniqueRequestCacheBuster: null
                },
                views: {
                    'content@app': {
                        controller: 'SubPublisherList',
                        templateUrl: 'admin/subPublisherManagement/subPublisherList.tpl.html'
                    }
                },
                resolve: {
                    subPublishers: function(subPublisherRestangular) {
                        return subPublisherRestangular.one('subpublishers').getList();
                    }
                },
                ncyBreadcrumb: {
                    label: 'Sub Publishers'
                }
            })

            .state({
                name: 'subPublisher.new',
                url: '/new',
                views: {
                    'content@app': {
                        controller: 'SubPublisherForm',
                        templateUrl: 'admin/subPublisherManagement/subPublisherForm.tpl.html'
                    }
                },
                resolve: {
                    subPublisher: function() {
                        return null;
                    },
                    sites: /* @ngInject */ function(SiteManager) {
                        return SiteManager.one('notBelongToSubPublisher').getList();
                    },
                    partners: function(PartnerManager) {
                        return PartnerManager.getList();
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
                    label: 'New Sub Publisher'
                }
            })

            .state({
                name: 'subPublisher.edit',
                url: '/edit/{id:[0-9]+}',
                views: {
                    'content@app': {
                        controller: 'SubPublisherForm',
                        templateUrl: 'admin/subPublisherManagement/subPublisherForm.tpl.html'
                    }
                },
                resolve: {
                    subPublisher: function($stateParams, subPublisherRestangular) {
                        return subPublisherRestangular.one('fullInfo', $stateParams.id).get();
                    },
                    sites: /* @ngInject */ function(SiteManager) {
                        return SiteManager.one('notBelongToSubPublisher').getList();
                    },
                    partners: function(PartnerManager) {
                        return PartnerManager.getList();
                    }
                },
                customResolve: {
                    admin: {
                        publishers: function() {
                            return null;
                        }
                    }
                },
                ncyBreadcrumb: {
                    label: 'Edit Sub Publisher - {{ subPublisher.username }}'
                }
            })
        ;
    }
})();