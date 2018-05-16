(function () {
    'use strict';

    angular
        .module('tagcade.newDashboard')
        .controller('NewDashboard', NewDashboard)
    ;

    function NewDashboard($scope, _, publisher, COMPARE_TYPE, DASHBOARD_TYPE, DateFormatter, Auth,
                          DisplayDashboardRestAngular, DISPLAY_REPORT_TYPES, CHART_FOLLOW, DISPLAY_SHOW_FIELDS,
                          UnifiedReportDashboardRestAngular, VideoReportRestAngular, VIDEO_SHOW_FIELDS,
                          UnifiedReportViewManager, DASHBOARD_TYPE_JSON, NewDashboardUtil, userSession, USER_MODULES) {

        $scope.isAdmin = Auth.isAdmin();
        $scope.publisher = publisher == null ? null : publisher.plain();

        $scope.currentModel = {
            dashboardType: null
        };
        $scope.formData = {
            dashboardTypes: []
        };

        _initData();

        $scope.onSelectDashboardType = onSelectDashboardType;
        $scope.isUnifiedReportDashboard = isUnifiedReportDashboard;
        $scope.isDisplayOrVideoDashboard = isDisplayOrVideoDashboard;

        function isUnifiedReportDashboard(type) {
            return NewDashboardUtil.isUnifiedDashboard(type);
        }

        function isDisplayOrVideoDashboard(type) {
            return NewDashboardUtil.isDisplayDashboard(type) || NewDashboardUtil.isVideoDashboard(type);
        }

        function onSelectDashboardType(item) {
            if (!item) {
                return;
            }
            $scope.currentModel.dashboardType = item;
        }

        function _initData() {
            if ($scope.isAdmin) {
                $scope.formData.dashboardTypes = DASHBOARD_TYPE;
            } else {
                var dashboardTypeForPublisher = [];

                if (userSession.hasModuleEnabled(USER_MODULES.displayAds)) {
                    dashboardTypeForPublisher.push({id: 'DISPLAY', name: 'Pubvantage Display'});
                }

                if (userSession.hasModuleEnabled(USER_MODULES.unified)) {
                    dashboardTypeForPublisher.push({id: 'UNIFIED_REPORT', name: 'Unified Report'});
                }

                if (userSession.hasModuleEnabled(USER_MODULES.videoAds)) {
                    dashboardTypeForPublisher.push({id: 'VIDEO', name: 'Pubvantage Video'});
                }

                $scope.formData.dashboardTypes = dashboardTypeForPublisher;
            }

            $scope.currentModel.dashboardType = ($scope.formData.dashboardTypes && $scope.formData.dashboardTypes.length > 0) ? $scope.formData.dashboardTypes[0] : [];

            /* load dashboard data for current dashboard type */
            // onSelectDashboardType($scope.currentModel.dashboardType);
        }
    }
})();