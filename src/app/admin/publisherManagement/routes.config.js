(function () {
    'use strict';

    angular
        .module('tagcade.admin.publisherManagement')
        .config(addStates)
    ;

    function addStates($stateProvider) {
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
                url: '/list',
                views: {
                    'content@app': {
                        controller: 'PublisherList',
                        templateUrl: 'admin/publisherManagement/publisherList.tpl.html'
                    }
                },
                resolve: {
                    publishers: function(adminUserManager) {
                        return adminUserManager.getList();
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
                    }
                },
                ncyBreadcrumb: {
                    label: 'Edit Publisher - {{ publisher.username }}'
                }
            })
        ;
    }
})();