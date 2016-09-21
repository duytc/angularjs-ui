(function() {
    'use strict';

    angular.module('tagcade.videoManagement.domainList')
        .config(addStates)
    ;

    function addStates(UserStateHelperProvider) {
        // uniqueRequestCacheBuster is used as a work-around for reloading only the current state
        // currently UI-Router will reload all parent states as well, this causes problems having

        UserStateHelperProvider
            .state('videoManagement.domainList', {
                abstract: true,
                url: '/domainList',
                ncyBreadcrumb: {
                    skip: true
                }
            })
            .state('videoManagement.domainList.blackList', {
                url: '/blackList?page&sortField&orderBy&search',
                params: {
                    blackList: true
                },
                views: {
                    'content@app': {
                        controller: 'DomainList',
                        templateUrl: 'videoManagement/domainList/domainList.tpl.html'
                    }
                },
                resolve: {
                    domainList: /* @ngInject */ function(BlackListManager) {
                        return BlackListManager.getList().then(function (domainList) {
                            return domainList.plain();
                        });
                    }
                },
                ncyBreadcrumb: {
                    label: 'Black List'
                }
            })
            .state('videoManagement.domainList.whiteList', {
                url: '/whiteList?page&sortField&orderBy&search',
                params: {
                    whiteList: true
                },
                views: {
                    'content@app': {
                        controller: 'DomainList',
                        templateUrl: 'videoManagement/domainList/domainList.tpl.html'
                    }
                },
                resolve: {
                    domainList: /* @ngInject */ function(WhiteListManager) {
                        return WhiteListManager.getList().then(function (domainList) {
                            return domainList.plain();
                        });
                    }
                },
                ncyBreadcrumb: {
                    label: 'White List'
                }
            })
            .state('videoManagement.domainList.newBlack', {
                url: '/newBlack',
                params: {
                    blackList: true
                },
                views: {
                    'content@app': {
                        controller: 'DomainListForm',
                        templateUrl: 'videoManagement/domainList/domainListForm.tpl.html'
                    }
                },
                resolve: {
                    domain: function() {
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
                    label: 'New Black List'
                }
            })
            .state('videoManagement.domainList.newWhite', {
                url: '/newWhite',
                params: {
                    whiteList: true
                },
                views: {
                    'content@app': {
                        controller: 'DomainListForm',
                        templateUrl: 'videoManagement/domainList/domainListForm.tpl.html'
                    }
                },
                resolve: {
                    domain: function() {
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
                    label: 'New White List'
                }
            })

            .state('videoManagement.domainList.editBlack', {
                url: '/editBlack/{id:[0-9]+}',
                params: {
                    blackList: true
                },
                views: {
                    'content@app': {
                        controller: 'DomainListForm',
                        templateUrl: 'videoManagement/domainList/domainListForm.tpl.html'
                    }
                },
                resolve: {
                    domain: /* @ngInject */ function($stateParams, BlackListManager) {
                        return BlackListManager.one($stateParams.id).get();
                    },
                    publishers: function() {
                        return null;
                    }
                },
                ncyBreadcrumb: {
                    label: 'Edit Black List - {{ domain.name }}'
                }
            })

            .state('videoManagement.domainList.editWhite', {
                url: '/editWhite/{id:[0-9]+}',
                params: {
                    whiteList: true
                },
                views: {
                    'content@app': {
                        controller: 'DomainListForm',
                        templateUrl: 'videoManagement/domainList/domainListForm.tpl.html'
                    }
                },
                resolve: {
                    domain: /* @ngInject */ function($stateParams, WhiteListManager) {
                        return WhiteListManager.one($stateParams.id).get();
                    },
                    publishers: function() {
                        return null;
                    }
                },
                ncyBreadcrumb: {
                    label: 'Edit White List - {{ domain.name }}'
                }
            })
        ;
    }
})();