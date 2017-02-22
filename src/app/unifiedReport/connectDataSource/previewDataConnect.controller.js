(function() {
    'use strict';

    angular.module('tagcade.unifiedReport.connect')
        .controller('PreviewDataConnect', PreviewDataConnect);

    function PreviewDataConnect($scope, reportData) {
        $scope.reportData = reportData;
        $scope.columns = reportData.length > 0 ? Object.keys(reportData[0]) : [];

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