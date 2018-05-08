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
        $scope.chartFollow = {
            type: CHART_FOLLOW['COMPARISION']
        };

        $scope.datePickerOpts = {
            maxDate: moment().endOf('day'),
            ranges: {
                'Today': [moment().startOf('day'), moment().endOf('day')],
                'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
                'Last 7 Days': [moment().subtract(7, 'days'), moment().subtract(1, 'days')], // note: from yesterday
                'Last 30 Days': [moment().subtract(30, 'days'), moment().subtract(1, 'days')], // note: from yesterday
                'This Month': [moment().startOf('month'), moment().endOf('month')],
                'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
            }
        };

        $scope.formData = {
            compareTypeData: {
                compareType: COMPARE_TYPE['yesterday'],
                label: NewDashboardUtil.getCompareLabel('yesterday')
            },
            comparisionData: [],
            dashboardTypes: [],
            masterReport: [],
            dateRange: {
                startDate: $scope.datePickerOpts.ranges['Last 7 Days'][0],
                endDate: $scope.datePickerOpts.ranges['Last 7 Days'][1]
            },
            overviewData: {
                data: [],
                datePickerOpts: $scope.datePickerOpts
            },
            chartData: {
                datePickerOpts: $scope.datePickerOpts,
                reports: [],
                dateField: 'date', // default for display and video, not for ur
                urData: {
                    fields: [],
                    fieldsLabel: {},
                    types: {}
                }
            },
            reportData: null,
            reportView: [],
            publisher: $scope.publisher
        };

        $scope.currentModel = {
            dashboardType: [],
            reportView: null,
            isGettingReportView: false
        };

        var _currentDashboardType = {
            id: null
        };

        $scope.onSelectDashboardType = onSelectDashboardType;
        $scope.isUnifiedReportDashboard = isUnifiedReportDashboard;
        $scope.onSelectReportViewForUnifiedReport = onSelectReportViewForUnifiedReport;
        $scope.onChangeChartFollow = onChangeChartFollow;

        $scope.$watch('formData.dateRange', _onDateRangeChanged);

        _initData();

        /* scope functions ============================ */
        function isUnifiedReportDashboard(type) {
            return NewDashboardUtil.isUnifiedDashboard(type);
        }

        function isVideoDashboard(type) {
            return NewDashboardUtil.isVideoDashboard(type);
        }

        function isDisplayDashboard(type) {
            return NewDashboardUtil.isDisplayDashboard(type);
        }

        function onChangeChartFollow() {
            var data;

            if ($scope.chartFollow.type === CHART_FOLLOW['OVER_VIEW']) {
                data = $scope.formData.reportData;
            } else {
                if (!$scope.formData.comparisionData || !$scope.formData.comparisionData.current) return;
                data = $scope.formData.comparisionData.current;
            }

            if (isDisplayDashboard($scope.currentModel.dashboardType)) {
                var key = $scope.isAdmin ? 'platformStatistics' : 'accountStatistics';

                if (data && data[key]) {
                    $scope.formData.chartData.reports = data[key].reports;
                }
            } else if (isVideoDashboard($scope.currentModel.dashboardType)) {
                $scope.formData.chartData.reports = data.reports;
            } else if (isUnifiedReportDashboard($scope.currentModel.dashboardType)) {
                // set report fields
                var total = data.total;
                var fields = [];
                if (total) {
                    fields = Object.keys(total);
                    $scope.formData.chartData.urData.fields = fields;
                }
                // set report data.
                // Notice: total contains all show fields for chart, return empty report detail if total empty!!!
                // This avoid show empty chart
                $scope.formData.chartData.reports = (data.reports && total && fields && fields.length > 0) ? data.reports : [];
            }

            if (!$scope.$$phase) {
                $scope.$apply();
            }
        }

        function onSelectReportViewForUnifiedReport(reportView) {
            // reset default chartFollow
            $scope.chartFollow = {
                type: CHART_FOLLOW['OVER_VIEW']
            };

            // reset default chartFollow
            resetData();

            var param = {
                masterReport: reportView.id,
                startDate: DateFormatter.getFormattedDate($scope.formData.dateRange.startDate),
                endDate: DateFormatter.getFormattedDate($scope.formData.dateRange.endDate)
            };

            UnifiedReportDashboardRestAngular.one('reportview').one('overview').customPOST(param)
                .then(
                    function (data) {
                        var plainData = data.plain();
                        $scope.formData.reportData = plainData;
                        _extractOverviewData(plainData);
                    },
                    function (error) {
                        resetData();
                    }
                );
        }

        function onSelectDashboardType(dashboardType) {
            // check if no dashboardType selected. This is in case of loggin as publisher and has no module
            if (!dashboardType) {
                return;
            }

            // avoid select dashboard type again
            // also avoid event when select date range. TODO: find out why select date range makes this event...
            // temp unused because this make no report fill again when change date range. TODO: why???
            // if (!dashboardType.id || dashboardType.id === _currentDashboardType.id) {
            //     return;
            // }

            // update current dashboard type
            _currentDashboardType = dashboardType;

            // reset default chartFollow to overview
            $scope.chartFollow = {
                type: CHART_FOLLOW['OVER_VIEW']
            };

            // _getOverviewReport();
        }

        /* local functions ============================ */
        function _onDateRangeChanged(newValue, oldValue, scope) {
            if (!NewDashboardUtil.isDifferentDate(newValue, oldValue)) {
                return;
            }

            // get over view report again
            _getOverviewReport();
        }

        function _getReportView() {
            /* temp do not show quickly creating report view when getting list report views */
            $scope.currentModel.isGettingReportView = true;

            return UnifiedReportViewManager.one('dashboard').getList().then(function (data) {
                // filter all report views that have at least one date filter
                var reportViews = [];
                angular.forEach(data, function (reportView) {
                    if (!_isReportViewHasDateFilterAndEnabledUserProvidedDateRange(reportView)) {
                        return;
                    }

                    reportViews.push(reportView);
                });

                /* already sort by last run */

                $scope.formData.reportView = reportViews;

                /* enable chance for showing quickly creating report view when getting list report views done */
                $scope.currentModel.isGettingReportView = false;
            }, function (error) {
                $scope.formData.reportView = [];

                /* enable chance for showing quickly creating report view when getting list report views done */
                $scope.currentModel.isGettingReportView = false;
            })
        }

        function _isReportViewHasDateFilterAndEnabledUserProvidedDateRange(reportView) {
            if (!reportView.reportViewDataSets || reportView.reportViewDataSets.length < 1) {
                return false;
            }

            var filters = [];

            // get all filters from reportViewDataSets
            angular.forEach(reportView.reportViewDataSets, function (reportViewDataSet) {
                if (!reportViewDataSet || !reportViewDataSet.filters) {
                    return;
                }

                filters = filters.concat(reportViewDataSet.filters);
            });

            // get all filters if is subView
            if (reportView.subView) {
                if (reportView.filters && reportView.filters.length > 0) {
                    filters = filters.concat(reportView.filters);
                }
            }

            // check if has date filter
            var hasDateFilter = false;
            angular.forEach(filters, function (filter) {
                if (!filter || !filter.type || (filter.type !== 'date' && filter.type !== 'dateTime')) {
                    return;
                }

                // if userProvided is not enabled
                if (!filter.userProvided) {
                    return;
                }

                hasDateFilter = true;
            });

            return hasDateFilter;
        }

        function _getOverviewReport() {
            resetData();
            if (_currentDashboardType.id === 'DISPLAY') {
                // set chart date field
                $scope.formData.chartData.dateField = {
                    field: 'date',
                    format: 'YYYY-MM-DD'
                };

                // _getDisplayOverviewReport();

                return;
            }

            if (_currentDashboardType.id === 'VIDEO') {
                // set chart date field
                $scope.formData.chartData.dateField = {
                    field: 'date',
                    format: 'YYYY-MM-DD'
                };

                _getVideoOverviewReport();

                return;
            }

            if (_currentDashboardType.id === 'UNIFIED_REPORT') {
                // set chart date field
                // later in getUnifiedReport() because depend on which report view is selected!

                _getUnifiedReportOverviewReport();
            }
        }

        function _getVideoOverviewReport() {
            var param = {
                'breakdowns': angular.toJson(['day']),
                'endDate': DateFormatter.getFormattedDate($scope.formData.dateRange.endDate),
                'filters': angular.toJson({
                    'publisher': [], 'waterfallTag': [], 'demandPartner': [],
                    'videoDemandAdTag': [], 'videoPublisher': [],
                    'startDate': DateFormatter.getFormattedDate($scope.formData.dateRange.startDate),
                    'endDate': DateFormatter.getFormattedDate($scope.formData.dateRange.endDate)
                }),
                'metrics': angular.toJson(['requests'])
            };

            VideoReportRestAngular.one('video').one('report').get(param)
                .then(
                    function (data) {
                        $scope.formData.reportData = data;
                        _extractOverviewData(data);
                    },
                    function (error) {
                        resetData();
                    }
                );
        }

        function _getDisplayOverviewReport() {
            var route;
            if ($scope.isAdmin) {
                route = DISPLAY_REPORT_TYPES.platform;
            } else {
                route = DISPLAY_REPORT_TYPES.accounts + "/" + $scope.publisher.id;
            }

            var param = {
                'startDate': DateFormatter.getFormattedDate($scope.formData.dateRange.startDate),
                'endDate': DateFormatter.getFormattedDate($scope.formData.dateRange.endDate)
            };

            DisplayDashboardRestAngular.one(route).get(param)
                .then(
                    function (data) {
                        $scope.formData.reportData = data;
                        _extractOverviewData(data);
                    },
                    function (error) {
                        resetData();
                    }
                );
        }

        function _getUnifiedReportOverviewReport() {
            if (!$scope.currentModel.reportView) {
                $scope.formData.overviewData.data = [];
                $scope.formData.chartData.reports = [];
                _getReportView()
                    .then(function () {
                        // set default is first report view
                        if ($scope.formData.reportView && angular.isArray($scope.formData.reportView) && $scope.formData.reportView.length > 0) {
                            $scope.currentModel.reportView = $scope.formData.reportView[0];

                            // set chart date field
                            // get chart date field later once get chartData

                            onSelectReportViewForUnifiedReport($scope.currentModel.reportView);
                        }
                    });
            } else {
                // set chart date field
                // get chart date field later once get chartData

                onSelectReportViewForUnifiedReport($scope.currentModel.reportView);
            }
        }

        function resetData() {
            $scope.formData.overviewData.data = [];
            $scope.formData.chartData.reports = [];
        }

        function _extractVideoOverviewData(data) {
            if (!data) {
                resetData();
                return;
            }

            $scope.formData.overviewData.data = data;
            $scope.formData.chartData.reports = data.reports;
        }

        function _extractUnifiedOverviewData(data) {
            if (!data || !data.total || !data.columns || !data.types) {
                resetData();
                return;
            }

            var total = data.total;
            var fields = Object.keys(total);
            var showData = [];
            angular.forEach(fields, function (field) {
                var label = data.columns[field];
                var json = {
                    label: label,
                    value: total[field]
                };

                showData.push(json);
            });

            $scope.formData.overviewData.data = showData;
            $scope.formData.chartData.reports = data.reports;
            $scope.formData.chartData.urData.fields = fields;
            $scope.formData.chartData.urData.fieldsLabel = data.columns;
            $scope.formData.chartData.urData.types = data.types;
            $scope.formData.chartData.dateField = data.dateField;
        }

        function _extractDisplayOverviewData(dataDisplay) {
            var key = $scope.isAdmin ? 'platformStatistics' : 'accountStatistics';
            if (!dataDisplay || !dataDisplay[key]) {
                resetData();
                return;
            }

            var data = dataDisplay[key];

            $scope.formData.overviewData.data = data;
            $scope.formData.chartData.reports = data.reports;
        }

        function _extractOverviewData(data) {
            if (DASHBOARD_TYPE_JSON['VIDEO'] === $scope.currentModel.dashboardType.name) {
                _extractVideoOverviewData(data);
                return;
            }

            if (DASHBOARD_TYPE_JSON['DISPLAY'] === $scope.currentModel.dashboardType.name) {
                _extractDisplayOverviewData(data);
                return;
            }

            if (DASHBOARD_TYPE_JSON['UNIFIED_REPORT'] === $scope.currentModel.dashboardType.name) {
                _extractUnifiedOverviewData(data);
            }
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

            $scope.formData.overviewData.data = [];
            $scope.formData.topPerformersData = [];
            $scope.currentModel.dashboardType = ($scope.formData.dashboardTypes && $scope.formData.dashboardTypes.length > 0) ? $scope.formData.dashboardTypes[0] : [];

            /* load dashboard data for current dashboard type */
            onSelectDashboardType($scope.currentModel.dashboardType);
        }
    }
})();