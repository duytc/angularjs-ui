angular.module('tagcade.core.ui')

    .controller('403ErrorController', function(AlertService) {
        'use strict';

        AlertService.replaceAlerts({
            type: 'error',
            message: 'You do not have the required permissions to access this'
        });
    })

;