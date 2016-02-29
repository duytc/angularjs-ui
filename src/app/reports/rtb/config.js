(function() {
    'use strict';

    angular.module('tagcade.reports.rtb')
        .provider('API_RTB_REPORTS_BASE_URL', {
            $get: function(API_REPORTS_BASE_URL) {
                return API_REPORTS_BASE_URL + '/rtbreports';
            }
        })
    ;
})();