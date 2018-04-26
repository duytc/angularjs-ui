(function () {
    'use strict';

    angular.module('tagcade.core.data.resources')
        .factory('AutoOptimizeIntegrationManager', AutoOptimizeIntegrationManager)
    ;

    function AutoOptimizeIntegrationManager (unifiedReportRestangular) {
        var RESOURCE_NAME = 'optimizationintegrations';

        return unifiedReportRestangular.service(RESOURCE_NAME);
    }
})();