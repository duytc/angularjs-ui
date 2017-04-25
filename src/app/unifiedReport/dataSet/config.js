(function() {
    'use strict';

    angular.module('tagcade.unifiedReport.dataSet')
        .constant('METRICS_SET', [
            {label: 'Number', key: 'number'},
            {label: 'Decimal', key: 'decimal'},
            {label: 'Text', key: 'text'},
            {label: 'Large Text', key: 'largeText'},
            {label: 'Date', key: 'date'},
            {label: 'Date/Time', key: 'datetime'}
        ])

        .constant('DIMENSIONS_SET',  [
            {label: 'Date', key: 'date'},
            {label: 'Date/Time', key: 'datetime'},
            {label: 'Text', key: 'text'}
        ])

    ;
})();