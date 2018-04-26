(function () {
    'use strict';

    angular.module('tagcade.unifiedReport.alert')
        .constant('ALERT_SOURCES', [
            {key: 'all', value: 'All Sources'},
            {key: 'datasource', value: 'Data source'},
            {key: 'optimization', value: 'Optimize Integration'}
        ])
        .provider('API_UNIFIED_ALERT_BASE_URL', {
            $get: function (API_UNIFIED_BASE_URL) {
                return API_UNIFIED_BASE_URL + '/alerts';
            }
        });
})();
