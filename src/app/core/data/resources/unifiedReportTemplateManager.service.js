(function () {
    'use strict';

    angular.module('tagcade.core.data.resources')
        .factory('UnifiedReportTemplateManager', UnifiedReportTemplateManager)
    ;

    function UnifiedReportTemplateManager(unifiedReportRestangular) {
        var RESOURCE_NAME = 'reportviewtemplates';

        return unifiedReportRestangular.service(RESOURCE_NAME);
    }
})();