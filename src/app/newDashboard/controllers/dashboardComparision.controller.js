(function () {
    'use strict';

    angular.module('tagcade.newDashboard')
        .controller('DashboardComparision', DashboardComparision)
    ;

    function DashboardComparision($scope, $timeout, COMPARE_TYPE, videoReportService, Auth, ASC,
                                  DASHBOARD_TYPE_JSON, reportRestangular, CHART_FOLLOW,
                                  ADMIN_DISPLAY_COMPARISION, PUBLISHER_DISPLAY_COMPARISION, COLUMNS_NAME_MAPPING_FOR_VIDEO_REPORT, DISPLAY_SHOW_FIELDS,
                                  unifiedReportComparisionRestangular, NewDashboardUtil) {
        $scope.isAdmin = Auth.isAdmin();

        const CURRENT_LABEL = 'current';
        const HISTORY_LABEL = 'history';

        // $scope.currentModel = $scope.compareTypeData;

        $scope.formData = {
            comparisionData: [],
            dayValuesForDayOverDay: [
                moment().subtract(1, 'days').format('YYYY-MM-DD'),
                moment().subtract(2, 'days').format('YYYY-MM-DD')
            ]
        };

        $scope.onChangeMode = onChangeMode;
        $scope.getRecentDay = getRecentDay;
        $scope.getPreviousDay = getPreviousDay;
        $scope.isShowForUnifiedReport = isShowForUnifiedReport;
        $scope.isShowForDisplayReport = isShowForDisplayReport;
        $scope.isShowForVideoReport = isShowForVideoReport;

        $scope.columnNameMappingForVideoReport = COLUMNS_NAME_MAPPING_FOR_VIDEO_REPORT;

        _getData(false);

        $scope.$watch('dashboardType', function () {
            // reset to default
            $scope.compareTypeData.compareType = COMPARE_TYPE['day'];

            _getData(false);
        });

        $scope.$watch('reportView', function () {
            // reset to default
            $scope.compareTypeData.compareType = COMPARE_TYPE['day'];

            _getData(false);
        });

        function _notifyDrawChart() {
            if ($scope.chartFollow.type !== CHART_FOLLOW['COMPARISION'])
                $scope.chartFollow.type = CHART_FOLLOW['COMPARISION'];
            $timeout(function () {
                $scope.onChangeChartFollow();
            }, 0);

        }


        function getRecentDay() {
            return $scope.formData.dayValuesForDayOverDay[0];
        }

        function getPreviousDay() {
            return $scope.formData.dayValuesForDayOverDay[1];
        }

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

        function _getData(isClickChangeMode) {
            var param = {
                type: $scope.compareTypeData.compareType
            };

            if ($scope.dashboardType.id === 'DISPLAY') {
                _getDisplayComparision(param, isClickChangeMode);
            } else if ($scope.dashboardType.id === 'VIDEO') {
                _getVideoComparision(param, isClickChangeMode);
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

                _getUnifiedComparision(param2, isClickChangeMode);
            }
        }

        function _getVideoComparision(param, isClickChangeMode) {
            videoReportService.getComparision(param).then(function (data) {
                $scope.comparisionData = data;
                $scope.formData.comparisionData = _extractComparisionData(data, $scope.dashboardType);

                if (isClickChangeMode) {
                    _notifyDrawChart();
                }
            }, function (error) {
                $scope.comparisionData = [];
                $scope.formData.comparisionData = [];
            });
        }

        function _getDisplayComparision(param, isClickChangeMode) {
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
                $scope.formData.comparisionData = _extractComparisionData(data, $scope.dashboardType);
                if (isClickChangeMode)
                    _notifyDrawChart();

            }, function (error) {
                $scope.comparisionData = [];
                $scope.formData.comparisionData = [];
            });
        }

        function _getUnifiedComparision(param, isClickChangeMode) {
            unifiedReportComparisionRestangular.one('comparison').customPOST(param).then(function (data) {
                $scope.comparisionData = data.plain();
                $scope.formData.comparisionData = _extractComparisionData(data, $scope.dashboardType);
                if (isClickChangeMode)
                    _notifyDrawChart();
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
            _getData(true);
        }

        function _extractComparisionData(data, dashboardType) {
            if (DASHBOARD_TYPE_JSON['UNIFIED_REPORT'] === dashboardType.name) {
                return _extractUnifiedReportComparision(data);
            } else if (DASHBOARD_TYPE_JSON['VIDEO'] === dashboardType.name) {
                return _extractVideoComparision(data);
            } else {
                return _extractDisplayComparision(data);
            }
        }

        function _generateComparisonData(showFields, currentData, historyData, columns) {
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
                        value: currentData == null || showFields[index] == null ? null : currentData[showFields[index]]
                    },
                    history: {
                        label: HISTORY_LABEL,
                        value: historyData == null || showFields[index] == null ? null : historyData[showFields[index]]
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

        function _extractUnifiedReportComparision(data) {
            if (!data) {
                return [];
            }
            var showFields = getUnifiedShowFields(data);
            var currentData = data.current ? data.current.total : [];
            var historyData = data.history ? data.history.total : [];
            var columns = data.history ? data.history.columns : [];

            return _generateComparisonData(showFields, currentData, historyData, columns);
        }

        function getUnifiedShowFields(data) {
            if (!data) return [];
            if (data.current && data.current.total) {
                var keys = Object.keys(data.current.total);
                if (keys && keys.length > 0)
                    return keys;
            }
            if (data.history && data.history.total) {
                var keys = Object.keys(data.history.total);
                if (keys && keys.length > 0)
                    return keys;
            }
            return [];
        }

        function _extractVideoComparision(data) {
            if (!data || !data.current || !data.history) {
                return [];
            }

            return data;
        }

        function _extractDisplayComparision(data) {
            if (!data) {
                return [];
            }

            var key = $scope.isAdmin ? 'platformStatistics' : 'accountStatistics';
            return {
                current: data.current[key],
                history: data.history[key]
            };
        }
    }
})();