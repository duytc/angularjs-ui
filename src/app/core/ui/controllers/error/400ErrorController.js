angular.module('tagcade.core.ui')

    .controller('400ErrorController', function(AlertService) {
        'use strict';

        AlertService.replaceAlerts({
            type: 'error',
            message: 'An invalid request was sent to the server'
        });
    })

;