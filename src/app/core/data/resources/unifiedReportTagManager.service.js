(function () {
    'use strict';

    angular.module('tagcade.core.data.resources')
        .factory('UnifiedReportTagManager', UnifiedReportTagManager)
    ;

    function UnifiedReportTagManager(unifiedReportRestangular) {
        var RESOURCE_NAME = 'tags';

        return unifiedReportRestangular.service(RESOURCE_NAME);
    }
})();