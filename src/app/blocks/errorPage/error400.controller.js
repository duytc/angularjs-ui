(function () {
    'use strict';

    angular.module('tagcade.blocks.errorPage')
        .controller('400ErrorController', function(AlertService) {
            AlertService.replaceAlerts({
                type: 'error',
                message: 'An invalid request was sent to the server'
            });
        })
    ;
})();