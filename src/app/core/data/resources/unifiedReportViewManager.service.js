(function () {
    'use strict';

    angular.module('tagcade.core.data.resources')
        .factory('UnifiedReportViewManager', UnifiedReportViewManager)
    ;

    function UnifiedReportViewManager(unifiedReportRestangular) {
        var RESOURCE_NAME = 'reportviews';

        return unifiedReportRestangular.service(RESOURCE_NAME);
    }
})();