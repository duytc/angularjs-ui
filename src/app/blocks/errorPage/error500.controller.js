(function () {
    'use strict';

    angular.module('tagcade.blocks.errorPage')
        .controller('500ErrorController', function(AlertService) {
            AlertService.replaceAlerts({
                type: 'error',
                message: 'A server error occurred'
            });
        })
    ;
})();