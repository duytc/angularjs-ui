(function () {
    'use strict';

    angular
        .module('tagcade.subPublisher.subPublisherManagement')
        .config(addStates)
    ;

    function addStates($stateProvider) {
        $stateProvider
            .state({
                name: 'app.subPublisher.subPublisherManagement',
                abstract: true,
                url: '/subPublisherManagement'
            })

            .state({
                name: 'app.subPublisher.subPublisherManagement.edit',
                url: '/edit',
                views: {
                    'content@app': {
                        controller: 'SubPublisherCurrentForm',
                        templateUrl: 'subPublisher/subPublisherManagement/subPublisherManagementForm.tpl.html'
                    }
                },
                resolve: {
                    subPublisher: function(subPublisherRestangular, userSession) {
                        return subPublisherRestangular.one('subpublishers', userSession.id).get();
                    }
                },
                ncyBreadcrumb: {
                    label: 'Edit Profile'
                }
            })
        ;
    }
})();