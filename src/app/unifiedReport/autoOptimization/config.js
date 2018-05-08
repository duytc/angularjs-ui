(function () {
    'use strict';

    angular.module('tagcade.unifiedReport.autoOptimization')
        .constant('DATETIME_RANGE_OPTIONS', [
            {value: '-48 hours', key: 'Last 48 Hours'},
            {value: '-24 hours', key: 'Last 24 Hours'},
            {value: '-12 hours', key: 'Last 12 Hours'}
        ])
    ;
})();