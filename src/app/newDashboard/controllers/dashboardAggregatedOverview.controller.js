(function () {
    'use strict';

    angular.module('tagcade.newDashboard')
        .controller('DashboardAggregatedOverview', DashboardAggregatedOverview)
    ;

    function DashboardAggregatedOverview($scope, Auth, DASHBOARD_TYPE_JSON, COLUMNS_NAME_MAPPING_FOR_VIDEO_REPORT,
                                         $timeout, COMPARE_TYPE, videoReportService, ASC, reportRestangular,
                                         CHART_FOLLOW, ADMIN_DISPLAY_COMPARISION, PUBLISHER_DISPLAY_COMPARISION,
                                         DISPLAY_SHOW_FIELDS, unifiedReportComparisionRestangular, NewDashboardUtil) {
        $scope.isAdmin = Auth.isAdmin();

        $scope.resetOverviewData = resetOverviewData;
        $scope.isShowForUnifiedReport = isShowForUnifiedReport;
        $scope.isShowForDisplayReport = isShowForDisplayReport;
        $scope.isShowForVideoReport = isShowForVideoReport;
        $scope.hasDisplayOverviewTable = hasDisplayOverviewTable;

        $scope.columnNameMappingForVideoReport = COLUMNS_NAME_MAPPING_FOR_VIDEO_REPORT;

        $scope.customOverviewData = _refactorOverviewData();

        /* watch reportView changed, then render for unified report */
        $scope.$watch('overviewData.data', _onOverviewDataChange);

        function hasDisplayOverviewTable() {
            return isShowForDisplayReport() && $scope.overviewData.data;
        }

        function resetOverviewData() {
            $scope.overviewData.data = [];
        }

        function _onOverviewDataChange() {
            $scope.customOverviewData = _refactorOverviewData();
        }

        function _refactorOverviewData() {
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

        function isShowForDisplayReport() {
            if (!$scope.dashboardType || !$scope.dashboardType.id) {
                return false;
            }

            return DASHBOARD_TYPE_JSON[$scope.dashboardType.id] === DASHBOARD_TYPE_JSON.DISPLAY;
        }

        function isShowForVideoReport() {
            if (!$scope.dashboardType || !$scope.dashboardType.id) {
                return false;
            }

            return DASHBOARD_TYPE_JSON[$scope.dashboardType.id] === DASHBOARD_TYPE_JSON.VIDEO;
        }
    }
})();