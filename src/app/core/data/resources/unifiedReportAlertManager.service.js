(function () {
    'use strict';

    angular.module('tagcade.core.data.resources')
        .factory('UnifiedReportAlertManager', UnifiedReportAlertManager)
    ;

    function UnifiedReportAlertManager(unifiedReportRestangular) {
        var RESOURCE_NAME = 'alerts';

        unifiedReportRestangular.addRequestInterceptor(function(element, operation, what) {
            if (what !== RESOURCE_NAME) {
                return element;
            }

            if (['put', 'patch', 'post'].indexOf(operation) > -1) {
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