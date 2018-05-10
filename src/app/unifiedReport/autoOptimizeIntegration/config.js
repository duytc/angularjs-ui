(function () {
    'use strict';

    angular.module('tagcade.unifiedReport.autoOptimizeIntegration')
        .constant('OPTIMIZATION_FREQUENCY', [
            {value: 'continuously', label: 'Continuously'},
            {value: '30 minutes', label: 'Every 30 minutes'},
            {value: '1 hour', label: 'Every hour'},
            {value: '4 hours', label: 'Every 4 hours'},
            {value: '12 hours', label: 'Every 12 hours'},
            {value: '24 hours', label: 'Every 24 hours'}

        ]).constant('PLATFORM_INTEGRATION', [
        {value: 'pubvantage', label: 'Pubvantage Display Ad Server', type: 'PUBVANTAGE_ADS_SERVER'},
        {value: 'pubvantage-video', label: 'Pubvantage Video Ad Server', type: 'PUBVANTAGE_VIDEO_ADS_SERVER'}
    ])
    ;
})();