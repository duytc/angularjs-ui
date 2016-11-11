(function() {
    'use strict';

    angular.module('tagcade.reports.video')
        .controller('VideoReportSummary', VideoReportSummary)
    ;

    function VideoReportSummary($scope, $stateParams) {
        var metrics = angular.fromJson($stateParams.metrics);

        $scope.hasKeyObject = hasKeyObject;

        function hasKeyObject(keyMetric, keyObject) {
            if(!angular.isObject($scope.reportGroup)) {
                return false;
            }

            return Object.keys($scope.reportGroup).indexOf(keyObject) > -1 && metrics.indexOf(keyMetric) > -1
        }
    }
})();