(function () {
    'use strict';

    angular.module('tagcade.core.data.resources')
        .factory('UnifiedReportDataSourceIntegrationBackfillHistories', UnifiedReportDataSourceIntegrationBackfillHistories)
    ;

    function UnifiedReportDataSourceIntegrationBackfillHistories(unifiedReportRestangular) {
        var RESOURCE_NAME = 'datasourceintegrationbackfillhistories';

        return unifiedReportRestangular.service(RESOURCE_NAME);
    }
})();