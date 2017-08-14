(function() {
    'use strict';

    angular.module('tagcade.unifiedReport', [
        'mentio',

        'tagcade.unifiedReport.dataSource',
        'tagcade.unifiedReport.alert',
        'tagcade.unifiedReport.dataSourceFile',
        'tagcade.unifiedReport.dataSet',
        'tagcade.unifiedReport.connect',
        'tagcade.unifiedReport.report',
        'tagcade.unifiedReport.importHistory',
        'tagcade.unifiedReport.template',
        'tagcade.unifiedReport.tag'
    ]);
})();
