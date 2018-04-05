(function () {
    'use strict';

    angular.module('tagcade.newDashboard')
        .controller('DashboardComparision', DashboardComparision)
    ;

    function DashboardComparision($scope, $timeout,  COMPARE_TYPE, videoReportService, Auth, ASC,
                                  DASHBOARD_TYPE_JSON, reportRestangular, CHART_FOLLOW,
                                  ADMIN_DISPLAY_COMPARISION, PUBLISHER_DISPLAY_COMPARISION, VIDEO_SHOW_FIELDS, DISPLAY_SHOW_FIELDS,
                                  unifiedReportComparisionRestangular, NewDashboardUtil) {
        $scope.isAdmin = Auth.isAdmin();

        const CURRENT_LABEL = 'current';
        const HISTORY_LABEL = 'history';

        // $scope.currentModel = $scope.compareTypeData;

        $scope.formData = {
            comparisionData: []
        };
        $scope.getData = getData;
        $scope.getVideoComparision = getVideoComparision;
        $scope.onChangeMode = onChangeMode;
        $scope.getDisplayComparision = getDisplayComparision;
        $scope.getUnifiedComparision = getUnifiedComparision;
        $scope.extractComparisionData = extractComparisionData;
        $scope.extractVideoComparision = extractVideoComparision;
        $scope.extractUnifiedReportComparision = extractUnifiedReportComparision;
        $scope.extractDisplayComparision = extractDisplayComparision;
        $scope.comparisionGenerator = comparisionGenerator;
        $scope.conClickComparisionDirective = conClickComparisionDirective;

        $scope.getData(false);

        $scope.$watch('dashboardType', function () {
            // reset to default
            $scope.compareTypeData.compareType = COMPARE_TYPE['day'];

            $scope.getData(false);
        });

        $scope.$watch('reportView', function () {
            // reset to default
            $scope.compareTypeData.compareType = COMPARE_TYPE['day'];

            $scope.getData(false);
        });

        function notifyDrawChart() {
            if ($scope.chartFollow.type !== CHART_FOLLOW['COMPARISION'])
                $scope.chartFollow.type = CHART_FOLLOW['COMPARISION'];
            $timeout(function () {
                $scope.onChangeChartFollow();
            }, 0);

        }

        function conClickComparisionDirective() {
            if ($scope.chartFollow.type !== CHART_FOLLOW['COMPARISION']) {
                $scope.chartFollow.type = CHART_FOLLOW['COMPARISION'];
                $scope.onChangeChartFollow();
            }
        }

        function getData(isClickChangeMode) {
            var param = {
                type: $scope.compareTypeData.compareType
            };
            if ($scope.dashboardType.id === 'DISPLAY') {
                $scope.getDisplayComparision(param, isClickChangeMode);
            } else if ($scope.dashboardType.id === 'VIDEO') {
                $scope.getVideoComparision(param, isClickChangeMode);
            } else {
                if (!$scope.reportView) {
                    $scope.comparisionData = [];
                    $scope.formData.comparisionData = [];
                    return;
                }
                var param2 = {
                    masterReport: $scope.reportView.id,
                    type: $scope.compareTypeData.compareType
                };
                $scope.getUnifiedComparision(param2, isClickChangeMode);
            }
        }

        function getVideoComparision(param, isClickChangeMode) {
            videoReportService.getComparision(param).then(function (data) {
                $scope.comparisionData = data;
                $scope.formData.comparisionData = $scope.extractComparisionData(data, $scope.dashboardType);
                if (isClickChangeMode)
                    notifyDrawChart();
            }, function (error) {
                $scope.comparisionData = [];
                $scope.formData.comparisionData = [];
            });
        }

        function getDisplayComparision(param, isClickChangeMode) {
            var json = {
                type: $scope.compareTypeData.compareType
            };
            var route;
            if ($scope.isAdmin) {
                route = ADMIN_DISPLAY_COMPARISION;
            } else {
                route = PUBLISHER_DISPLAY_COMPARISION + "/" + $scope.publisher.id;
            }
            reportRestangular.one(route).get(json).then(function (data) {
                $scope.comparisionData = data;
                $scope.formData.comparisionData = $scope.extractComparisionData(data, $scope.dashboardType);
                if (isClickChangeMode)
                    notifyDrawChart();

            }, function (error) {
                $scope.comparisionData = [];
                $scope.formData.comparisionData = [];
            });
        }

        function getUnifiedComparision(param, isClickChangeMode) {
            unifiedReportComparisionRestangular.one('comparison').customPOST(param).then(function (data) {
                $scope.comparisionData = data.plain();
                $scope.formData.comparisionData = $scope.extractComparisionData(data, $scope.dashboardType);
                if (isClickChangeMode)
                    notifyDrawChart();
            }, function (error) {
                $scope.comparisionData = [];
                $scope.formData.comparisionData = [];
            })
        }

        function getLabel(mode) {
            return NewDashboardUtil.getCompareLabel(mode);
        }

        function onChangeMode(mode) {
            $scope.compareTypeData.compareType = COMPARE_TYPE[mode];
            $scope.compareTypeData.label = getLabel(mode);
            $scope.getData(true);
        }

        function extractComparisionData(data, dashboardType) {
            if (DASHBOARD_TYPE_JSON['UNIFIED_REPORT'] === dashboardType.name) {
                return extractUnifiedReportComparision(data);
            } else if (DASHBOARD_TYPE_JSON['VIDEO'] === dashboardType.name) {
                return extractVideoComparision(data);
            } else {
                return extractDisplayComparision(data);
            }
        }

        function comparisionGenerator(showFields, currentData, historyData, columns) {
            var returnData = [];
            for (var index = 0; index < showFields.length; index++) {
                var label = '';

                if (columns == null) {
                    label = NewDashboardUtil.getShowLabel(showFields[index]);
                } else {
                    label = columns[showFields[index]];
                }

                var json = {
                    label: label,
                    current: {
                        label: CURRENT_LABEL,
                        value: currentData == null ? null : currentData[showFields[index]]
                    },
                    history: {
                        label: HISTORY_LABEL,
                        value: historyData == null ? null : historyData[showFields[index]]
                    }
                };
                returnData.push(json);
            }

            if (NewDashboardUtil.isUnifiedDashboard($scope.dashboardType)) {
                // sort returnData for unified report
                var orderBy = ASC; // sort field name by alphabet asc
                var sortByForUnifiedReport = 'label';
                returnData.sort(function (r1, r2) {
                    if (r1[sortByForUnifiedReport] == r2[sortByForUnifiedReport]) {
                        return 0;
                    }
                    return (r1[sortByForUnifiedReport] < r2[sortByForUnifiedReport])
                        ? (orderBy == 'desc' ? 1 : -1)
                        : (orderBy == 'desc' ? -1 : 1);
                });
            }
            return returnData;
        }

        function extractUnifiedReportComparision(data) {
            if (!data || !data.current || !data.history || !data.current.total || !data.history.total) {
                return [];
            }

            var total = data.current.total;
            var showFields = Object.keys(total);
            var currentData = data.current.total;
            var historyData = data.history.total;
            var columns = data.history.columns;

            return $scope.comparisionGenerator(showFields, currentData, historyData, columns);
        }

        function extractVideoComparision(data) {
            if (!data) {
                return [];
            }

            var currentData = data.current;
            var historyData = data.history;

            return $scope.comparisionGenerator(VIDEO_SHOW_FIELDS, currentData, historyData, null);
        }

        function extractDisplayComparision(data) {
            if (!data) {
                return [];
            }

            var key = $scope.isAdmin ? 'platformStatistics' : 'accountStatistics';
            var currentPlatformStatistics = data.current[key];
            var historyPlatformStatistics = data.history[key];

            return $scope.comparisionGenerator(DISPLAY_SHOW_FIELDS, currentPlatformStatistics, historyPlatformStatistics, null);
        }
    }
})();