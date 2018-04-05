(function () {
    'use strict';

    angular.module('tagcade.newDashboard')
        .controller('DashboardOverview', DashboardOverview)
    ;

    function DashboardOverview($scope, Auth, CHART_FOLLOW, DASHBOARD_TYPE_JSON, NewDashboardUtil) {
        $scope.isAdmin = Auth.isAdmin();
        $scope.onDateApply = onDateApply;
        $scope.resetOverviewData = resetOverviewData;
        $scope.conClickOverViewDirective = conClickOverViewDirective;
        $scope.customOverviewData = _getOverviewData();

        /* watch reportView changed, then render for unified report */
        $scope.$watch('overviewData.data', _onOverviewDataChange);
        $scope.$watch('overviewData.dateRange', _onDateRangeChange);

        function resetOverviewData() {
            $scope.overviewData.data = [];
        }

        function conClickOverViewDirective() {
            if ($scope.chartFollow.type !== CHART_FOLLOW['OVER_VIEW']) {
                $scope.chartFollow.type = CHART_FOLLOW['OVER_VIEW'];
                $scope.onChangeChartFollow();
            }
        }

        function onDateApply() {
            $scope.resetOverviewData();
            var selectedDate = NewDashboardUtil.getStringDate($scope.overviewData.dateRange);
            if ($scope.chartFollow.type !== CHART_FOLLOW['OVER_VIEW'])
                $scope.chartFollow.type = CHART_FOLLOW['OVER_VIEW'];

            $scope.onDateChange(selectedDate);
        }
        
        function _onDateRangeChange(newValue, oldValue, scope) {
            if (NewDashboardUtil.isDifferentDate(newValue, oldValue)) {
                onDateApply();
            }
        }

        function _onOverviewDataChange() {
            $scope.customOverviewData = _getOverviewData();
        }

        function _getOverviewData() {
            var data = angular.copy($scope.overviewData.data);

            if (!isShowForUnifiedReport()) {
                return data;
            }

            // sort data for unified report
            var orderBy = 'asc'; // sort field name by alphabet asc
            var sortByForUnifiedReport = 'label';
            data.sort(function (r1, r2) {
                if (r1[sortByForUnifiedReport] == r2[sortByForUnifiedReport]) {
                    return 0;
                }

                return (r1[sortByForUnifiedReport] < r2[sortByForUnifiedReport])
                    ? (orderBy == 'desc' ? 1 : -1)
                    : (orderBy == 'desc' ? -1 : 1);
            });

            return data;
        }

        /* all scope functions ===================== */
        function isShowForUnifiedReport() {
            if (!$scope.dashboardType || !$scope.dashboardType.id) {
                return false;
            }

            return DASHBOARD_TYPE_JSON[$scope.dashboardType.id] === DASHBOARD_TYPE_JSON.UNIFIED_REPORT;
        }
    }
})();