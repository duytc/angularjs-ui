(function () {
    'use strict';

    angular.module('tagcade.core.data.resources')
        .factory('AutoOptimizationManager', AutoOptimizationManager)
    ;

    function AutoOptimizationManager(unifiedReportRestangular) {
        // var RESOURCE_NAME = 'autooptimizationconfigs';
        var RESOURCE_NAME = 'optimizationrules';

        return unifiedReportRestangular.service(RESOURCE_NAME);
    }
})();