(function() {
    'use strict';

    angular.module('tagcade.reports.source')
        .controller('SourceReportController', SourceReportController)
    ;

    function SourceReportController($state, $scope, AlertService, dateUtil, reportGroup, DateFormatter) {
        $scope.hasResult = reportGroup !== false;

        reportGroup = reportGroup || {};

        $scope.reportGroup = reportGroup;
        $scope.reports = $scope.reportGroup.reports || [];

        $scope.tableConfig = {
            maxPages: 10,
            itemsPerPage: 10
        };

        $scope.showPagination = showPagination;
        $scope.getExportExcelFileName = getExportExcelFileName();

        var reportViews = {
            'user': false,
            'display': false,
            'video': false
        };

        $scope.reportViews = angular.copy(reportViews);
        $scope.reportViews.user = true;

        $scope.showView = showView;

        $scope.openDetail = openDetail;

        init();

        function init() {
            if (!$scope.hasResult) {
                AlertService.replaceAlerts({
                    type: 'warning',
                    message: 'There are no reports for that selection'
                });
            }
        }

        function showView(view) {
            if (reportViews.hasOwnProperty(view)) {
                $scope.reportViews = angular.copy(reportViews); // reset all views to false
                $scope.reportViews[view] = true;
            }
        }

        function openDetail(siteId, date) {
            date = dateUtil.getDate(date);

            if (date) {
                date = date.toDate();
            }

            var params = {
                siteId: siteId,
                date: date
            };

            return $state.go('^.siteDetail', params, {
                inherit: false
            }).catch(function() {
                console.log(params);

                AlertService.replaceAlerts({
                    type: 'error',
                    message: 'An error occurred trying to open the report'
                });
            })
        }

        function showPagination() {
            return angular.isArray($scope.reports) && $scope.reports.length > $scope.tableConfig.itemsPerPage;
        }

        function getExportExcelFileName() {
            return 'tagcade-source-report-' + DateFormatter.getFormattedDate(new Date(reportGroup.startDate)) + '-' + DateFormatter.getFormattedDate(new Date(reportGroup.endDate));
        }
    }
})();