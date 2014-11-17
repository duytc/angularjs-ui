(function () {
    'use strict';

    angular.module('tagcade.blocks.errorPage')
        .controller('403ErrorController', function(AlertService) {
            AlertService.replaceAlerts({
                type: 'error',
                message: 'You do not have the required permissions to access this'
            });
        })
    ;
})();