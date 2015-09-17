(function () {
    'use strict';

    angular.module('tagcade.blocks.errorPage')
        .controller('403ErrorController', function($translate, AlertService) {
            AlertService.replaceAlerts({
                type: 'error',
                message: $translate.instant('ERROR_PAGE.403')
            });
        })
    ;
})();