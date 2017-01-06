(function () {
    'use strict';

    angular.module('tagcade.core.data.resources')
        .factory('UnifiedReportDataSetManager', UnifiedReportDataSetManager)
    ;

    function UnifiedReportDataSetManager(unifiedReportRestangular) {
        var RESOURCE_NAME = 'datasets';

        unifiedReportRestangular.addRequestInterceptor(function(element, operation, what) {
            if (what !== RESOURCE_NAME) {
                return element;
            }

            if (['put', 'patch', 'post'].indexOf(operation) > -1) {
                delete element.id;

                angular.forEach(element.datasourceentries, function(datasourceentries) {
                    datasourceentries.dataSourceentry = datasourceentries.id;
                })
            }

            return element;
        });

        return unifiedReportRestangular.service(RESOURCE_NAME);
    }
})();