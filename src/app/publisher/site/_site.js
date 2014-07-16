angular.module('tagcadeApp.publisher.site', [
    'ui.router'
])

    .config(function ($stateProvider) {
        $stateProvider.state('app.publisher.sites', {
            url: '/sites',
            template: 'List sites here. <a ui-sref="app.publisher.dashboard">Dashboard</a>'
        });
    })

;