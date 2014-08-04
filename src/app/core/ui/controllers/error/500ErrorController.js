angular.module('tagcade.core.ui')

    .controller('500ErrorController', function(AlertService) {
        'use strict';

        AlertService.replaceAlerts({
            type: 'error',
            message: 'A server error occurred'
        });
    })

;