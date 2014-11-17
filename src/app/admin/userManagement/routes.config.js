(function () {
    'use strict';

    angular
        .module('tagcade.admin.userManagement')
        .config(addStates)
    ;

    function addStates($stateProvider) {
        $stateProvider
            .state({
                name: 'app.admin.userManagement',
                abstract: true,
                url: '/userManagement',
                ncyBreadcrumb: {
                    label: 'User Management'
                }
            })

            .state({
                name: 'app.admin.userManagement.list',
                url: '/list',
                views: {
                    'content@app': {
                        controller: 'UserList',
                        templateUrl: 'admin/userManagement/userList.tpl.html'
                    }
                },
                resolve: {
                    users: function(adminUserManager) {
                        return adminUserManager.getList();
                    }
                },
                ncyBreadcrumb: {
                    label: 'Users'
                }
            })

            .state({
                name: 'app.admin.userManagement.new',
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

            .state({
                name: 'app.admin.userManagement.edit',
                url: '/edit/{id:[0-9]+}',
                views: {
                    'content@app': {
                        controller: 'UserForm',
                        templateUrl: 'admin/userManagement/userForm.tpl.html'
                    }
                },
                resolve: {
                    user: function($stateParams, adminUserManager) {
                        return adminUserManager.one($stateParams.id).get();
                    }
                },
                ncyBreadcrumb: {
                    label: 'Edit User - {{ user.username }}'
                }
            })
        ;
    }
})();