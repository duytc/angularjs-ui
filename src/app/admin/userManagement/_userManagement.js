angular.module('tagcade.admin.userManagement', [
    'ui.router',
    'ngTable'
])

    .config(function ($stateProvider) {
        $stateProvider
            .state('app.admin.userManagement', {
                abstract: true,
                url: '/userManagement'
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
                }
            })
        ;
    })

;