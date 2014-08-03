angular.module('tagcade.core.ui')

    .controller('500ErrorController', function(AlertService) {
        AlertService.replaceAlerts('danger', 'A server error occurred');
    })

;