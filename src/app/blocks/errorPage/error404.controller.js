(function () {
    'use strict';

    angular.module('tagcade.blocks.errorPage')
        .controller('404ErrorController', function(AlertService) {
            AlertService.replaceAlerts({
                type: 'error',
                message: 'The requested resource could not be found'
            });
        })
    ;
})();