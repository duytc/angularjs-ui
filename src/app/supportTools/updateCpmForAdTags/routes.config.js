(function() {
    'use strict';

    angular.module('tagcade.supportTools.updateCpmForAdTags')
        .config(addStates)
    ;

    function addStates(UserStateHelperProvider) {
        UserStateHelperProvider
            .state('supportTools.updateCpmForAdTags', {
                abstract: true,
                url: '/CpmAdTags',
                ncyBreadcrumb: {
                    skip: true
                }
            })
            .state('supportTools.updateCpmForAdTags.list', {
            url: '/list',
            views: {
                'content@app': {
                    controller: 'AdTagListUpdateCpm',
                    templateUrl: 'supportTools/updateCpmForAdTags/adTagListUpdateCpm.tpl.html'
                }
            },
            resolve: {
                adTags: function(AdTagManager) {
                    return AdTagManager.getList();
                }
            },
            ncyBreadcrumb: {
                label: 'AdTags'
            }
        })
        ;
    }
})();