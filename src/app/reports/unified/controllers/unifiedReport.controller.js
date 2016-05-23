(function() {
    'use strict';

    angular.module('tagcade.reports.unified')
        .controller('UnifiedReport', UnifiedReport)
    ;

    function UnifiedReport($scope, _, Auth, $stateParams, $state, $translate, reportGroup, AlertService, unifiedReport, ReportParams, dateUtil) {
        reportGroup = reportGroup || {};

        $scope.reportGroup = reportGroup;
        $scope.reports = [];
        $scope.subBreakDown = $stateParams.subBreakDown;

        if(!!$scope.subBreakDown && $scope.subBreakDown == 'day') {
            angular.forEach($scope.reportGroup.reports, function(rootReport) {
                $scope.reports = $scope.reports.concat(rootReport.reports.reverse());
            })
        } else {
            $scope.reports = $scope.reportGroup.reports || [];
        }

        $scope.params = $stateParams;
        $scope.enableViewTagcadeReport = Auth.getSession().enableViewTagcadeReport;

        $scope.tableConfig = {
            maxPages: 10,
            itemsPerPage: 10
        };

        $scope.showPagination = showPagination;
        $scope.drillDownReport = drillDownReport;
        $scope.getExportExcelFileName = getExportExcelFileName();

        function drillDownReport(state, drillParams) {
            if (!angular.isString(state)) {
                return;
            }

            state = $state.get(state, $state.$current);

            if (!state) {
                console.log('relative report state does not exist');
                return;
            }

            var params = ReportParams.getStateParams(unifiedReport.getInitialParams());

            if(!!drillParams) {
                if(!!drillParams.drillByDate) {
                    drillParams.drillByDate = dateUtil.getFormattedDate(drillParams.drillByDate);
                }

                angular.extend(params, drillParams)
            }

            $state.transitionTo(state, params)
                .catch(function() {
                    console.log(params);

                    AlertService.replaceAlerts({
                        type: 'error',
                        message: $translate.instant('REPORT.REPORT_FAIL')
                    });
                })
            ;
        }

        function showPagination() {
            return angular.isArray($scope.reports) && $scope.reports.length > $scope.tableConfig.itemsPerPage;
        }

        function getExportExcelFileName() {
            var endDate = $stateParams.endDate || $stateParams.startDate;
            return dateUtil.getFormattedDate($stateParams.startDate) + ' - ' + dateUtil.getFormattedDate(endDate) + ' - unified-report';
        }
    }
})();