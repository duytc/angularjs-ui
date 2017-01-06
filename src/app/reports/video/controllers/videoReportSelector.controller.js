(function() {
    'use strict';

    angular.module('tagcade.reports.video')
        .controller('VideoReportSelector', VideoReportSelector)
    ;

    function VideoReportSelector($scope, $stateParams, $translate, $q, _, Auth, dateUtil, adminUserManager, VideoDemandPartnerManager, VideoPublisherManager, VideoDemandAdTagManager, VideoAdTagManager, accountManager, sessionStorage, BREAKDOWN_OPTION_FOR_VIDEO_REPORT, DIMENSIONS_OPTIONS_VIDEO_REPORT, REPORT_SETTINGS, UserStateHelper, AlertService) {
        var isAdmin = Auth.isAdmin();
        var isSubPublisher = Auth.isSubPublisher();
        var isPublisher = !isSubPublisher && !isAdmin;

        $scope.breakdownOption = BREAKDOWN_OPTION_FOR_VIDEO_REPORT;
        $scope.metricsOptions = DIMENSIONS_OPTIONS_VIDEO_REPORT;

        $scope.isAdmin = isAdmin;
        $scope.isSubPublisher = isSubPublisher;
        $scope.isPublisher = isPublisher;

        $scope.selectedData = {
            date: {
                startDate: null,
                endDate: null
            },
            selectMetricsAll: false
        };

        $scope.queryParams = REPORT_SETTINGS.default.view.report.videoReport;

        $scope.optionData = {
            publishers: [],
            adSources: [],
            demandPartners: [],
            adTags: [],
            videoPublishers: []
        };

        $scope.datePickerOpts = {
            maxDate:  moment().endOf('day'),
            ranges: {
                'Today': [moment().startOf('day'), moment().endOf('day')],
                'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
                'Last 7 Days': [moment().subtract(7, 'days'), moment().subtract(1, 'days')],
                'Last 30 Days': [moment().subtract(30, 'days'), moment().subtract(1, 'days')],
                'This Month': [moment().startOf('month'), moment().endOf('month')],
                'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
            }
        };

        $scope.getReports = getReports;
        $scope.saveOption = saveOption;
        $scope.isFormValid = isFormValid;
        $scope.groupEntities = groupEntities;
        $scope.checkedBreakdown = checkedBreakdown;
        $scope.selectBreakdown = selectBreakdown;
        $scope.selectMetricsAll = selectMetricsAll;
        $scope.selectMetrics = selectMetrics;
        $scope.checkedMetrics = checkedMetrics;
        $scope.showBreakdown = showBreakdown;
        $scope.disabledMetric = disabledMetric;
        
        function disabledMetric(metrics) {
            if(metrics.key == 'adTagRequests' && $scope.queryParams.breakdowns.indexOf('videoDemandAdTag') > -1) {
                return true
            }

            return false
        }

        function groupEntities(item){
            if (item.id === null) {
                return undefined; // no group
            }

            return ''; // separate group with no name
        }

        function checkedBreakdown(breakdown) {
            return $scope.queryParams.breakdowns.indexOf(breakdown.key) > -1;
        }

        function selectBreakdown(breakdown) {
            if(breakdown.key == 'videoDemandAdTag') {
                if($scope.queryParams.metrics.indexOf('adTagRequests') > -1) {
                    $scope.queryParams.metrics.splice($scope.queryParams.metrics.indexOf('adTagRequests'), 1)
                }
            }

            var index = $scope.queryParams.breakdowns.indexOf(breakdown.key);

            if(index > -1) {
                $scope.queryParams.breakdowns.splice(index, 1);
            } else {
                $scope.queryParams.breakdowns.push(breakdown.key);
            }
        }

        function selectMetricsAll(selectedAll) {
            if(selectedAll) {
                $scope.queryParams.metrics = [];
                angular.forEach($scope.metricsOptions, function(metrics) {
                    if(metrics.key == 'adTagRequests' && $scope.queryParams.breakdowns.indexOf('videoDemandAdTag') > -1) {
                        return;
                    }

                    $scope.queryParams.metrics.push(metrics.key)
                });
            } else {
                $scope.queryParams.metrics = [];
            }
        }

        function selectMetrics(metrics) {
            var index = $scope.queryParams.metrics.indexOf(metrics.key);

            if(index > -1) {
                $scope.queryParams.metrics.splice(index, 1);
            } else {
                $scope.queryParams.metrics.push(metrics.key);
            }

            _setVarSelectMetricsDefault();
        }

        function checkedMetrics(metrics) {
            return $scope.queryParams.metrics.indexOf(metrics.key) > -1;
        }

        function showBreakdown(breakdown) {
            if(!isAdmin) {
                if(breakdown.key == 'publisher') {
                    return false;
                }
            }

            return true;
        }

        function isFormValid() {
            return $scope.queryParams.metrics.length > 0 && $scope.queryParams.breakdowns.length > 0
        }

        function getReports() {
            var transition;
            var params = {
                startDate: $scope.selectedData.date.startDate,
                endDate: $scope.selectedData.date.endDate
            };

            $scope.queryParams.filters.startDate = dateUtil.getFormattedDate(params.startDate);
            $scope.queryParams.filters.endDate = dateUtil.getFormattedDate(params.endDate);

            params.metrics = angular.toJson($scope.queryParams.metrics);
            params.filters = angular.toJson($scope.queryParams.filters);
            params.breakdowns = angular.toJson($scope.queryParams.breakdowns);

            transition = UserStateHelper.transitionRelativeToBaseState(
                'reports.video.report',
                params
            );

            $q.when(transition)
                .catch(function(error) {
                    console.log(params);

                    AlertService.replaceAlerts({
                        type: 'error',
                        message: $translate.instant('REPORT.REPORT_FAIL')
                    });
                })
            ;
        }

        function saveOption() {
            if(!isPublisher) {
                return;
            }

            var sessionSetting = angular.fromJson(sessionStorage.getCurrentSettings());
            if(!sessionSetting || sessionSetting.length == 0) {
                sessionSetting = REPORT_SETTINGS.default;
            }

            sessionSetting.view.report.videoReport = $scope.queryParams;

            delete sessionSetting.view.report.videoReport.filters.startDate;
            delete sessionSetting.view.report.videoReport.filters.endDate;

            accountManager.one('').patch({ settings: sessionSetting })
                .then(function() {
                    //update settings for sessionStorage
                    sessionStorage.setCurrentSettings({view: sessionSetting.view || REPORT_SETTINGS.default.view });
                })
                .catch(function() {
                    console.log('update setting error !');
                })
            ;
        }

        function update() {
            var params = $stateParams;

            if (!_.isObject(params)) {
                return;
            }

            setTimeout(function() {
                // use storage when login is publisher, default have been config is REPORT_SETTINGS.videoReport
                var videoReportSetting = REPORT_SETTINGS.default.view.report.videoReport;

                if(isPublisher) {
                    var storageSetting = angular.fromJson(sessionStorage.getCurrentSettings());
                    // find storage config unifiedReport
                    if(!!storageSetting && !!storageSetting.view && !!storageSetting.view.report && !!storageSetting.view.report.videoReport) {
                        videoReportSetting = storageSetting.view.report.videoReport;
                    }
                }

                // update query params
                $scope.queryParams = {
                    metrics: !!params.metrics ? angular.fromJson(params.metrics) : videoReportSetting.metrics,
                    filters: !!params.filters ? angular.fromJson(params.filters) : videoReportSetting.filters,
                    breakdowns:  !!params.breakdowns ? angular.fromJson(params.breakdowns) : videoReportSetting.breakdowns
                };

                // update dateRange
                params.date = {endDate: null, startDate: null};
                params.date.endDate = !$scope.queryParams.filters || !$scope.queryParams.filters.endDate ? moment().subtract(1, 'days').startOf('day') : $scope.queryParams.filters.endDate;
                params.date.startDate = !$scope.queryParams.filters || !$scope.queryParams.filters.startDate ? moment().subtract(6, 'days').startOf('day') : $scope.queryParams.filters.startDate;

                // extend params
                angular.extend($scope.selectedData, params);

                _setVarSelectMetricsDefault($scope.queryParams.metrics);
            }, 0);
        }

        function _setVarSelectMetricsDefault(metrics) {
            // default select all metrics
            if(!$stateParams.metrics && angular.isArray(metrics) && metrics.length == 0) {
                // $scope.selectedData.selectMetricsAll = true;
                // selectMetricsAll($scope.selectedData.selectMetricsAll);
                $scope.queryParams.metrics = ['requests', 'bids', 'errors', 'impressions', 'blocks', 'requestFillRate'];

                return;
            }

            for(var index in $scope.metricsOptions) {
                var indexOption = _.findIndex($scope.queryParams.metrics, function(option) {
                    return option == $scope.metricsOptions[index].key
                });

                if(indexOption == -1) {
                    $scope.selectedData.selectMetricsAll = false;

                    return;
                }
            }

            $scope.selectedData.selectMetricsAll = true;
        }

        function init() {
            if (isAdmin) {
                adminUserManager.getList({ filter: 'publisher' })
                    .then(function (users) {
                        $scope.optionData.publishers = users;
                    })
                ;
            }

            VideoDemandPartnerManager.getList().then(function (demandPartners) {
                $scope.optionData.demandPartners = demandPartners;
            });

            VideoAdTagManager.getList().then(function (adTags) {
                $scope.optionData.adTags = adTags;
            });

            VideoDemandAdTagManager.getList().then(function (adSources) {
                $scope.optionData.adSources = adSources;
            });

            VideoPublisherManager.getList().then(function (videoPublishers) {
                $scope.optionData.videoPublishers = videoPublishers;
            });

            update();
        }

        init();
        update();
        $scope.$on('$stateChangeSuccess',  update);
    }
})();