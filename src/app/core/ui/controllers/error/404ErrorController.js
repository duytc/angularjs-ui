angular.module('tagcade.core.ui')

    .controller('404ErrorController', function(AlertService) {
        'use strict';

        AlertService.replaceAlerts('danger', 'The requested resource could not be found');
    })

;