(function () {
    'use strict';

    angular.module('tagcade.unifiedReport.report')
        .controller('UnifiedReportView', UnifiedReportView);

    function UnifiedReportView($scope, _, $q, $translate, $modal, AlertService, reportViewList, UnifiedReportViewManager, dataService, UserStateHelper, AtSortableService, API_UNIFIED_END_POINT, historyStorage, HISTORY_TYPE_PATH) {
        $scope.reportViewList = reportViewList;

        $scope.hasData = function () {
            return !!reportViewList.length;
        };

        if (!$scope.hasData()) {
            AlertService.replaceAlerts({
                type: 'warning',
                message: 'There is currently no report views'
            });
        }

        $scope.tableConfig = {
            itemsPerPage: 10,
            maxPages: 10
        };

        $scope.showPagination = showPagination;
        $scope.confirmDeletion = confirmDeletion;
        $scope.runReport = runReport;
        $scope.downloadReport = downloadReport;
        $scope.getShareableLink = getShareableLink;
        $scope.cloneReportView = cloneReportView;

        function cloneReportView(reportView) {
            $modal.open({
                templateUrl: 'unifiedReport/report/cloneReportView.tpl.html',
                size: 'lg',
                resolve: {
                    reportView: function () {
                        return reportView;
                    }
                },
                controller: 'CloneReportView'
            });
        }

        function downloadReport(reportView) {
            angular.forEach(reportView.reportViewDataSets, function (reportViewDataSet) {
                reportViewDataSet.dataSet = angular.isObject(reportViewDataSet.dataSet) ? reportViewDataSet.dataSet.id : reportViewDataSet.dataSet
            });

            angular.forEach(reportView.reportViewMultiViews, function (reportViewMultiView) {
                reportViewMultiView.subView = angular.isObject(reportViewMultiView.subView) ? reportViewMultiView.subView.id : reportViewMultiView.subView
            });

            var params = angular.copy(reportView);

            params.needToGroup = false;

            params.userDefineDimensions = reportView.enableCustomDimensionMetric ? params.dimensions : [];
            params.userDefineMetrics = reportView.enableCustomDimensionMetric ? params.metrics : [];

            dataService.makeHttpPOSTRequest('', params, API_UNIFIED_END_POINT + '/v1/reportview/download')
                .then(function (data) {
                    var blob = new Blob([data], {type: "text/plain;charset=utf-8"});
                    var reportName = !!reportView.name ? reportView.name : 'report-detail';

                    return saveAs(blob, [reportName + '.csv']);
                });
        }

        function runReport(reportView) {
            var transition = UserStateHelper.transitionRelativeToBaseState(
                'unifiedReport.report.detail', {
                    reportView: reportView.id,
                    saveReportView: true
                }
            );

            $q.when(transition)
                .catch(function (error) {
                    console.log(params);

                    AlertService.replaceAlerts({
                        type: 'error',
                        message: $translate.instant('REPORT.REPORT_FAIL')
                    });
                });
        }

        function confirmDeletion(reportView, index) {
            var modalInstance = $modal.open({
                templateUrl: 'unifiedReport/report/confirmDeletion.tpl.html'
            });

            modalInstance.result.then(function () {
                return UnifiedReportViewManager.one(reportView.id).remove()
                    .then(
                    function () {
                        var index = $scope.reportViewList.indexOf(reportView);

                        if (index > -1) {
                            reportViewList.splice(index, 1);
                        }

                        $scope.reportViewList = reportViewList;

                        if ($scope.tableConfig.currentPage > 0 && reportViewList.length/10 == $scope.tableConfig.currentPage) {
                            AtSortableService.insertParamForUrl({page: $scope.tableConfig.currentPage});
                            $scope.tableConfig.currentPage =- 1;
                        }

                        AlertService.replaceAlerts({
                            type: 'success',
                            message: 'The report view was deleted'
                        });
                    },
                    function (response) {
                        if(!!response && !!response.data && !!response.data.message) {
                            AlertService.replaceAlerts({
                                type: 'danger',
                                message: response.data.message
                            });
                        }
                    }
                );
            });
        }

        function getShareableLink(reportView) {
            $modal.open({
                templateUrl: 'unifiedReport/report/getShareableLink.tpl.html',
                size: 'lg',
                resolve: {
                    fieldsReportView: function (UnifiedReportDataSetManager) {
                        return UnifiedReportDataSetManager.getList().then(function (dataSets) {
                            var fields = _.union(reportView.dimensions.concat(reportView.metrics));
                            var formatFields = [];

                            angular.forEach(fields, function (field) {
                                var key = field;
                                var id = null;

                                if(field.lastIndexOf('_') > -1) {
                                    key = field.slice(0, field.lastIndexOf('_'));
                                    id = field.slice(field.lastIndexOf('_') + 1, field.length);
                                }

                                if(reportView.joinBy.length > 0) {
                                    for(var index in reportView.joinBy) {
                                        if(reportView.joinBy[index].outputField == field && !reportView.joinBy[index].isVisible) {
                                            return
                                        }

                                        var join = _.find(reportView.joinBy[index].joinFields, function (item) {
                                            return item.dataSet == id && item.field == key
                                        });

                                        if(!!join) {
                                            var indexFormatField = _.findIndex(formatFields, function (field) {
                                                return field.key == reportView.joinBy[index].outputField
                                            });

                                            if(indexFormatField == -1) {
                                                formatFields.push({
                                                    key: reportView.joinBy[index].outputField,
                                                    label: reportView.joinBy[index].outputField
                                                });
                                            }

                                            return
                                        }
                                    }
                                }

                                var dataSet = _.find(dataSets, function (dataSet) {
                                    if(key.indexOf('__') > -1 && (key.indexOf('_day') > -1 || key.indexOf('_month') > -1 || key.indexOf('_year') > -1)) {
                                        return dataSet.id == id
                                    }

                                    return (!!dataSet.dimensions[key] || !!dataSet.metrics[key]) && dataSet.id == id;
                                });

                                if(!!dataSet){
                                    formatFields.push({
                                        key: field,
                                        label: key + ' ('+ dataSet.name +')'
                                    })
                                } else {
                                    formatFields.push({
                                        key: field,
                                        label: field
                                    })
                                }
                            });

                            angular.forEach(reportView.transforms, function (transform) {
                                if (transform.type == 'addField' || transform.type == 'addCalculatedField' || transform.type == 'comparisonPercent') {
                                    angular.forEach(transform.fields, function (field) {
                                        var index = _.findIndex(formatFields, function (item) {
                                            return item.key == field.field;
                                        });

                                        if (!!field.field && index == -1) {
                                            formatFields.push({
                                                label: field.field,
                                                key: field.field
                                            });
                                        }
                                    })
                                }
                            });

                            if(reportView.multiView) {
                                formatFields.unshift({
                                    key: 'report_view_alias',
                                    label: 'Report View Alias'
                                });
                            }

                            return formatFields;
                        });
                    }
                },
                controller: function ($scope, fieldsReportView, UnifiedReportViewManager, DateFormatter, getDateReportView) {
                    $scope.reportView = reportView;
                    $scope.fieldsReportView = fieldsReportView;
                    var fieldsToShare = [];
                    $scope.shareableLink = null;
                    $scope.selected = {
                        selectAll: true,
                        date: {
                            startDate: getDateReportView.getMinStartDateInFilterReportView(reportView),
                            endDate : getDateReportView.getMaxEndDateInFilterReportView(reportView)
                        }
                    };

                    $scope.datePickerOpts = {
                        maxDate:  moment().endOf('day'),
                        ranges: {
                            'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
                            'Last 7 Days': [moment().subtract(6, 'days'), moment()],
                            'This Month': [moment().startOf('month'), moment().endOf('month')],
                            'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
                        }
                    };

                    // default select all
                    selectAll();

                    $scope.selectAll = selectAll;
                    $scope.changeDate = changeDate;
                    $scope.hideDaterange = hideDaterange;
                    $scope.enableSelectDaterange = enableSelectDaterange;

                    function changeDate() {
                        $scope.shareableLink = null;
                    }

                    $scope.getTextToCopy = function (string) {
                        return string.replace(/\n/g, '\r\n');
                    };

                    $scope.toggleField = function (field) {
                        $scope.shareableLink = null;

                        var index = fieldsToShare.indexOf(field.key);

                        if(index == -1) {
                            fieldsToShare.push(field.key);
                        } else {
                            fieldsToShare.splice(index, 1);
                            $scope.selected.selectAll = false
                        }

                        if(fieldsToShare.length == $scope.fieldsReportView.length) {
                            $scope.selected.selectAll = true
                        }
                    };

                    $scope.hasField = function(filed) {
                        return _.findIndex(fieldsToShare, function (item) {return item == filed.key}) > -1;
                    };

                    $scope.getShareableLink = function () {
                        var params = {
                            fields: fieldsToShare,
                            dateRange: {
                                startDate: DateFormatter.getFormattedDate($scope.selected.date.startDate),
                                endDate: DateFormatter.getFormattedDate($scope.selected.date.endDate)
                            }
                        };

                        UnifiedReportViewManager.one(reportView.id).post('shareablelink', params)
                            .then(function (shareableLink) {
                                $scope.shareableLink = shareableLink
                            });
                    };

                    $scope.highlightText = function (shareableLink) {
                        return shareableLink;
                    };
                    
                    function selectAll() {
                        $scope.shareableLink = null;

                        if(!$scope.selected.selectAll) {
                            fieldsToShare = []
                        } else {
                            angular.forEach($scope.fieldsReportView, function (field) {
                                var index = fieldsToShare.indexOf(field.key);

                                if(index == -1) {
                                    fieldsToShare.push(field.key);
                                }
                            })
                        }
                    }

                    function enableSelectDaterange() {
                        var reportViews = !$scope.reportView.multiView ? $scope.reportView.reportViewDataSets : $scope.reportView.reportViewMultiViews;
                        for (var reportViewIndex in reportViews) {
                            var reportView = reportViews[reportViewIndex];

                            for (var filterIndex in reportView.filters) {
                                var filter = reportView.filters[filterIndex];

                                if(filter.type == 'date' || filter.type == 'datetime') {
                                    if(filter.userProvided) {
                                        return true
                                    }
                                }
                            }
                        }

                        return false;
                    }

                    function hideDaterange() {
                        var reportViews = !$scope.reportView.multiView ? $scope.reportView.reportViewDataSets : $scope.reportView.reportViewMultiViews;
                        for (var reportViewIndex in reportViews) {
                            var reportView = reportViews[reportViewIndex];

                            for (var filterIndex in reportView.filters) {
                                var filter = reportView.filters[filterIndex];

                                if(filter.type == 'date' || filter.type == 'datetime') {
                                    return true
                                }
                            }
                        }

                        return false;
                    }
                }
            });
        }

        function showPagination() {
            return angular.isArray($scope.reportViewList) && $scope.reportViewList.length > $scope.tableConfig.itemsPerPage;
        }

        $scope.$on('$locationChangeSuccess', function () {
            historyStorage.setParamsHistoryCurrent(HISTORY_TYPE_PATH.unifiedReportView)
        });
    }
})();