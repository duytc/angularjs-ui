angular.module('tagcade.core.ui')

    .controller('500ErrorController', function(AlertService) {
        'use strict';

        AlertService.replaceAlerts('danger', 'A server error occurred');
    })

;