(function () {
    'use strict';

    angular.module('tagcade.core.data.resources')
        .factory('DataSourceIntegration', DataSourceIntegration)
    ;

    function DataSourceIntegration(unifiedReportRestangular) {
        var RESOURCE_NAME = 'datasourceintegrations';

        return unifiedReportRestangular.service(RESOURCE_NAME);
    }
})();