angular.module('tagcade.admin.userManagement', [
    'ui.router'
])

    .config(function ($stateProvider) {
        'use strict';

        $stateProvider
            .state('app.admin.userManagement', {
                abstract: true,
                url: '/userManagement',
                breadcrumb: {
                    title: 'User Management'
                }
            })
            .state('app.admin.userManagement.list', {
                url: '/list',
                views: {
                    'content@app': {
                        controller: 'AdminUserListController',
                        templateUrl: 'admin/userManagement/views/list.tpl.html'
                    }
                },
                resolve: {
                    users: function(AdminUserManager) {
                        return AdminUserManager.getList();
                    }
                },
                breadcrumb: {
                    title: 'Users'
                }
            })
            .state('app.admin.userManagement.new', {
                url: '/new',
                views: {
                    'content@app': {
                        controller: 'AdminUserFormController',
                        templateUrl: 'admin/userManagement/views/form.tpl.html'
                    }
                },
                resolve: {
                    user: function() {
                        return null;
                    }
                },
                breadcrumb: {
                    title: 'New User'
                }
            })
            .state('app.admin.userManagement.edit', {
                url: '/edit/{id:[0-9]+}',
                views: {
                    'content@app': {
                        controller: 'AdminUserFormController',
                        templateUrl: 'admin/userManagement/views/form.tpl.html'
                    }
                },
                resolve: {
                    user: function($stateParams, AdminUserManager) {
                        return AdminUserManager.one($stateParams.id).get();
                    }
                },
                breadcrumb: {
                    title: 'Edit User - {{ user.username }}'
                }
            })
        ;
    })

;