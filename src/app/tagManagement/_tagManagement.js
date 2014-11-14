/**
 * Base tag management module, this is always enabled
 */

angular.module('tagcade.tagManagement', [
    'ui.router',

    'tagcade.core',
    'tagcade.admin',

    'tagcade.tagManagement.tagGenerator',
    'tagcade.tagManagement.site'
])

    .config(function (UserStateHelperProvider) {
        UserStateHelperProvider
            .state('tagManagement', {
                abstract: true,
                url: '/tagManagement',
                ncyBreadcrumb: {
                    label: 'Tag Management'
                }
            })
        ;
    })

;