angular.module('tagcade.admin.userManagement', [
    'ui.router'
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
                        templateUrl: 'admin/userManagement/views/list.tpl.html'
                    }
                }
            })
            .state('app.admin.userManagement.new', {
                url: '/new',
                views: {
                    'content@app': {
                        templateUrl: 'admin/userManagement/views/new.tpl.html'
                    }
                }
            })
        ;
    })

;