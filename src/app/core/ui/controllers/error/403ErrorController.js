angular.module('tagcade.core.ui')

    .controller('403ErrorController', function(AlertService) {
        AlertService.replaceAlerts('danger', 'You do not have the required permissions to access this');
    })

;