(function () {
    'use strict';

    angular.module('tagcade.core.data.resources')
        .factory('UnifiedReportImportHistoryManager', UnifiedReportImportHistoryManager)
    ;

    function UnifiedReportImportHistoryManager(unifiedReportRestangular) {
        var RESOURCE_NAME = 'importhistories';

        return unifiedReportRestangular.service(RESOURCE_NAME);
    }
})();