(function () {
    'use strict';

    angular
        .module('tagcade.admin.userManagement')
        .config(addRoutes)
    ;

    function addRoutes($stateProvider) {
        $stateProvider
            .state('app.admin.userManagement', {
                abstract: true,
                url: '/userManagement',
                ncyBreadcrumb: {
                    label: 'User Management'
                }
            })

            .state('app.admin.userManagement.list', {
                url: '/list',
                views: {
                    'content@app': {
                        controller: 'UserList',
                        templateUrl: 'admin/userManagement/userList.tpl.html'
                    }
                },
                resolve: {
                    users: function(AdminUserManager) {
                        return AdminUserManager.getList();
                    }
                },
                ncyBreadcrumb: {
                    label: 'Users'
                }
            })

            .state('app.admin.userManagement.new', {
                url: '/new',
                views: {
                    'content@app': {
                        controller: 'UserForm',
                        templateUrl: 'admin/userManagement/userForm.tpl.html'
                    }
                },
                resolve: {
                    user: function() {
                        return null;
                    }
                },
                ncyBreadcrumb: {
                    label: 'New User'
                }
            })


            .state('app.admin.userManagement.edit', {
                url: '/edit/{id:[0-9]+}',
                views: {
                    'content@app': {
                        controller: 'UserForm',
                        templateUrl: 'admin/userManagement/userForm.tpl.html'
                    }
                },
                resolve: {
                    user: function($stateParams, AdminUserManager) {
                        return AdminUserManager.one($stateParams.id).get();
                    }
                },
                ncyBreadcrumb: {
                    label: 'Edit User - {{ user.username }}'
                }
            })
        ;
    }
})();