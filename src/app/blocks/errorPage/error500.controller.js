(function () {
    'use strict';

    angular.module('tagcade.blocks.errorPage')
        .controller('500ErrorController', function($translate, AlertService) {
            AlertService.replaceAlerts({
                type: 'error',
                message: $translate.instant('ERROR_PAGE.500')
            });
        })
    ;
})();