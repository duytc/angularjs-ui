(function () {
    'use strict';

    angular.module('tagcade.core.data.resources')
        .factory('ConnectAddConditionalTransformValues', ConnectAddConditionalTransformValues)
    ;

    function ConnectAddConditionalTransformValues(unifiedReportRestangular) {
        var RESOURCE_NAME = 'connecteddatasourceaddconditionaltransformvalues';

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