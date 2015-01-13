(function() {
    'use strict';

    angular.module('tagcade.reports.source')
        .directive('tcSourceReportSelector', tcSourceReportSelector)
    ;

    function tcSourceReportSelector() {
        return {
            scope: {
                initialData: '='
            },
            restrict: 'AE',
            replace: 'true',
            templateUrl: 'reports/source/directives/tcSourceReportSelector.tpl.html',
            controller: 'SourceReportSelector'
        }
    }
})();