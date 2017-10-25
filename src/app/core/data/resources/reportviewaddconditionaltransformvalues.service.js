(function () {
    'use strict';

    angular.module('tagcade.core.data.resources')
        .factory('ReportViewAddConditionalTransformValues', ReportViewAddConditionalTransformValues)
    ;

    function ReportViewAddConditionalTransformValues(unifiedReportRestangular) {
        var RESOURCE_NAME = 'reportviewaddconditionaltransformvalues';

        unifiedReportRestangular.addRequestInterceptor(function(element, operation, what) {
            if (what !== RESOURCE_NAME) {
                return element;
            }

            if (['put', 'patch', 'post'].indexOf(operation) > -1) {
                delete element.id;
            }

            return element;
        });

        return unifiedReportRestangular.service(RESOURCE_NAME);
    }
})();