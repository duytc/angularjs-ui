(function() {
    'use strict';

    angular.module('tagcade.reports.projectedBill')
        .controller('ProjectedBill', ProjectedBill)
    ;

    function ProjectedBill($scope, _, $filter,  AlertService, reportGroup, DateFormatter) {
        $scope.hasResult = reportGroup !== false;

        reportGroup = reportGroup || {};

        $scope.reportGroup = reportGroup;
        $scope.reports = $scope.reportGroup.reports || [];

        $scope.tableConfig = {
            itemsPerPage: 10
        };

        $scope.showPagination = showPagination;
        $scope.exportExcel = exportExcel;
        $scope.getExportExcelFileName = getExportExcelFileName();

        init();

        function init() {
            if (!$scope.hasResult) {
                AlertService.replaceAlerts({
                    type: 'warning',
                    message: 'There are no reports for that selection'
                });
            }
        }

        function showPagination() {
            return angular.isArray($scope.reports) && $scope.reports.length > $scope.tableConfig.itemsPerPage;
        }

        function exportExcel() {
            var exportExcel = $scope.reports;
            angular.forEach(exportExcel, function(value) {
                delete value.estCpm;
                delete value.estRevenue;
                delete value.fillRate;
                delete value.impressions;
                delete value.passbacks;
                delete value.publisherId;

                if(!value.name) {
                    value.name = 'All Publisher';
                }

                value.date = $filter('date')(value.date, 'longDate');
            });

            return exportExcel;
        }

        function getExportExcelFileName() {
            return 'tagcade-billing-report-' + DateFormatter.getFormattedDate(new Date(reportGroup.startDate)) + '-' + DateFormatter.getFormattedDate(new Date(reportGroup.endDate)) + '.csv';
        }
    }
})();