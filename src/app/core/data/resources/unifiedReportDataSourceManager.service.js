(function () {
    'use strict';

    angular.module('tagcade.core.data.resources')
        .factory('UnifiedReportDataSourceManager', UnifiedReportDataSourceManager)
    ;

    function UnifiedReportDataSourceManager(unifiedReportRestangular) {
        var RESOURCE_NAME = 'datasources';

        unifiedReportRestangular.addRequestInterceptor(function(element, operation, what) {
            if (what !== RESOURCE_NAME) {
                return element;
            }



            if (['put', 'patch', 'post'].indexOf(operation) > -1) {

                if (_.isNull(element) || _.isUndefined(element)) {
                    return;
                }

                delete element.id;
                angular.forEach(element.dataSourceIntegrations, function(dataSourceIntegration) {
                    dataSourceIntegration.integration = dataSourceIntegration.integration.id || dataSourceIntegration.integration;
                })
            }

            return element;
        });

        return unifiedReportRestangular.service(RESOURCE_NAME);
    }
})();