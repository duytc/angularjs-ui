angular.module('tagcade.core.ui')

    .controller('404ErrorController', function(AlertService) {
        'use strict';

        AlertService.replaceAlerts({
            type: 'error',
            message: 'The requested resource could not be found'
        });
    })

;