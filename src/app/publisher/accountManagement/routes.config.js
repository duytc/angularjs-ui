(function () {
    'use strict';

    angular
        .module('tagcade.publisher.accountManagement')
        .config(addStates)
    ;

    function addStates($stateProvider) {
        $stateProvider
            .state({
                name: 'app.publisher.accountManagement',
                abstract: true,
                url: '/accountManagement'
            })

            .state({
                name: 'app.publisher.accountManagement.edit',
                url: '/edit',
                views: {
                    'content@app': {
                        controller: 'AccountForm',
                        templateUrl: 'publisher/accountManagement/accountForm.tpl.html'
                    }
                },
                resolve: {
                    publisher: function(accountManager) {
                        return accountManager.one('').get();
                    }
                },
                ncyBreadcrumb: {
                    label: 'Edit Profile'
                }
            })
        ;
    }
})();