(function() {
    'use strict';

    angular.module('tagcade.supportTools.cpmEditor')
        .config(addStates)
    ;

    function addStates(UserStateHelperProvider) {
        UserStateHelperProvider
            .state('supportTools.cpmEditor', {
                url: '/CpmEditor',
                views: {
                    'content@app': {
                        controller: 'CpmEditor',
                        templateUrl: 'supportTools/cpmEditor/views/cpmEditor.tpl.html'
                    }
                },
                ncyBreadcrumb: {
                    label: 'Cpm Editor'
                }
            })
        ;

    }
})();