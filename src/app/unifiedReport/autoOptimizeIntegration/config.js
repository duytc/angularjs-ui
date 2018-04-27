(function () {
    'use strict';

    angular.module('tagcade.unifiedReport.autoOptimizeIntegration')
        .constant('OPTIMIZATION_FREQUENCY', [
            {value: 'continuously', label: 'Continuously'},
            {value: '30 minutes', label: 'Every 30 minutes'},
            {value: '1 hour', label: 'Every hour'},
            {value: '24 hours', label: 'Every 24 hours'}

        ]).constant('PLATFORM_INTEGRATION', [
        {value: 'pubvantage', label: 'Pubvantage Display Ad Server', type: 'PUBVANTAGE_ADS_SERVER'}
    ])
    ;
})();