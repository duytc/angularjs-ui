(function () {
    'use strict';

    angular.module('tagcade.core.data.resources')
        .factory('UnifiedReportIntegrationManager', UnifiedReportIntegrationManager)
    ;

    function UnifiedReportIntegrationManager(unifiedReportRestangular) {
        var RESOURCE_NAME = 'integrations';

        return unifiedReportRestangular.service(RESOURCE_NAME);
    }
})();