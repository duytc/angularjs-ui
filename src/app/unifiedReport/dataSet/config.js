(function() {
    'use strict';

    angular.module('tagcade.unifiedReport.dataSet')
        .constant('METRICS_SET', [{
            label: 'Date',
            key: 'date'
        }, {
            label: 'DateTime',
            key: 'datetime'
        }, {
            label: 'Text',
            key: 'text'
        }, {
            label: 'Multi Line Text',
            key: 'multiLineText'
        }, {
            label: 'Number',
            key: 'number'
        }, {
            label: 'Decimal',
            key: 'decimal'
        }])

        .constant('DIMENSIONS_SET',  [{
            label: 'Date',
            key: 'date'
        }, {
            label: 'DateTime',
            key: 'datetime'
        }, {
            label: 'Text',
            key: 'text'
        }])

    ;
})();