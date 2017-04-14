(function() {
    'use strict';

    angular.module('tagcade.unifiedReport.connect')
        .controller('PreviewDataConnect', PreviewDataConnect);

    function PreviewDataConnect($scope, reportData) {
        $scope.reportData = reportData;
        $scope.columns = !!reportData && angular.isObject(reportData.columns) ? _.keys(reportData.columns) : [];
        $scope.reports = !!reportData && !!reportData.reports ? reportData.reports : [];
        $scope.types = reportData.types;

        $scope.tableConfig = {
            maxPages: 10,
            itemsPerPage: 10
        };

        $scope.isNullValue = isNullValue;

        function isNullValue(report, column) {
            return !report[column] && report[column] != 0;
        }
    }
})();