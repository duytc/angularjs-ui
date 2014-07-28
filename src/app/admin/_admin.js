angular.module('tagcade.admin', [
    'ui.router',

    'tagcade.core',
    'tagcade.admin.ui',
    'tagcade.admin.dashboard',
    'tagcade.admin.userManagement'
])

    .constant('API_ADMIN_BASE_URL', 'http://api.tagcade.dev/app_dev.php/api/admin/v1')

    .factory('AdminRestangular', function (Restangular, API_ADMIN_BASE_URL) {
        return Restangular.withConfig(function (RestangularConfigurer) {
            RestangularConfigurer.setBaseUrl(API_ADMIN_BASE_URL);
        })
    })

    .config(function ($stateProvider, USER_ROLES) {
        $stateProvider
            .state('app.admin', {
                abstract: true,
                views: {
                    'header@app': {
                        templateUrl: 'admin/ui/views/header.tpl.html'
                    },
                    'nav@app': {
                        templateUrl: 'admin/ui/views/nav.tpl.html'
                    }
                },
                url: '/adm',
                data: {
                    role: USER_ROLES.admin
                }
            })
            .state('app.admin.myAccount', {
                url: '/myAccount',
                views: {
                    'content@app': {
                        controller: 'MyAccountController',
                        templateUrl: 'core/myAccount/views/myAccount.tpl.html'
                    }
                }
            })
        ;
    })

;