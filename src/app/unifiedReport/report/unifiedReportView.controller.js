(function () {
    'use strict';

    angular.module('tagcade.unifiedReport.report')
        .controller('UnifiedReportView', UnifiedReportView);

    function UnifiedReportView($scope, _, $q, $translate, SortReportByColumnType, $modal, AlertService, reportViewList, UnifiedReportViewManager, unifiedReportBuilder, UserStateHelper, AtSortableService, exportExcelService, historyStorage, HISTORY_TYPE_PATH) {
        $scope.reportViewList = reportViewList;

        $scope.hasData = function () {
            return !!reportViewList.length;
        };

        if (!$scope.hasData()) {
            AlertService.replaceAlerts({
                type: 'warning',
                message: 'There is currently no report view'
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
                controller: function ($scope, $state, $modalInstance, reportView) {
                    $scope.reportView = reportView;

                    $scope.cloneReportView = {
                        name: null,
                        alias: null
                    };
                    
                    $scope.submit = submit;
                    $scope.isFormValid = isFormValid;

                    function isFormValid() {
                        return $scope.cloneReportViewForm.$valid;
                    }
                    
                    function submit() {
                        $modalInstance.close();

                        var params = {
                            cloneSettings: [$scope.cloneReportView]
                        };

                        UnifiedReportViewManager.one(reportView.id).post('clone', params)
                            .catch(function () {
                                AlertService.replaceAlerts({
                                    type: 'error',
                                    message: "Could not clone the report view"
                                });
                            })
                            .then(function () {
                                $state.reload();

                                AlertService.addFlash({
                                    type: 'success',
                                    message: "The report view has been cloned successfully"
                                });
                            })
                    }
                }
            });
        }

        function downloadReport(reportView) {
            angular.forEach(reportView.reportViewDataSets, function (reportViewDataSet) {
                reportViewDataSet.dataSet = angular.isObject(reportViewDataSet.dataSet) ? reportViewDataSet.dataSet.id : reportViewDataSet.dataSet
            });

            angular.forEach(reportView.reportViewMultiViews, function (reportViewMultiView) {
                reportViewMultiView.subView = angular.isObject(reportViewMultiView.subView) ? reportViewMultiView.subView.id : reportViewMultiView.subView
            });

            var params = {
                reportViewDataSets: angular.toJson(reportView.reportViewDataSets),
                transforms: angular.toJson(reportView.transforms),
                formats: angular.toJson(reportView.formats),
                weightedCalculations: angular.toJson(reportView.weightedCalculations),
                joinBy: angular.toJson(reportView.joinBy) || null,

                fieldTypes: angular.toJson(reportView.fieldTypes),
                reportViewMultiViews: angular.toJson(reportView.reportViewMultiViews),
                showInTotal: angular.toJson(reportView.showInTotal),
                name: reportView.name,
                multiView: !!reportView.multiView || reportView.multiView,
                subReportsIncluded: !!reportView.subReportsIncluded || reportView.subReportsIncluded
            };

            unifiedReportBuilder.getPlatformReport(params)
                .then(function (reportGroup) {
                    var reports = reportGroup.reports;

                    if (reports.length > 0) {
                        var columnReportDetailForExportExcel = [],
                            titleReportDetailForExportExcel = [],
                            columnPositionObject = null,
                            columnPosition = [],
                            newMapColumns = [];

                        var report = Object.keys(reports[0]);

                        if (reportView.formats.length > 0) {
                            columnPositionObject = _.findWhere(reportView.formats, {type: "columnPosition"});
                        }

                        if (_.has(columnPositionObject, 'fields')) {
                            columnPosition = columnPositionObject.fields;

                            if(columnPosition.indexOf('report_view_alias') == -1 && reportView.multiView) {
                                columnPosition.unshift('report_view_alias');
                            }
                        }

                        if (!columnPosition.length && reports.length > 0) {
                            columnPosition = _.keys(reports[0]);
                            var indexReportViewAlias = columnPosition.indexOf('report_view_alias');
                            if(indexReportViewAlias > -1 && reportView.multiView) {
                                columnPosition.splice(indexReportViewAlias, 1);
                                columnPosition.unshift('report_view_alias');
                            }
                        }

                        //Rearrange the order of the report column and title before export excel
                        angular.forEach(report, function (key) {
                            columnReportDetailForExportExcel.push(key);
                        });

                        newMapColumns = columnPosition;

                        var remainColumns = _.difference(columnReportDetailForExportExcel, newMapColumns);
                        _.each(remainColumns, function (remainColumn) {
                            newMapColumns.push(remainColumn);
                        });

                        _.each(newMapColumns, function (mapColumn) {
                            titleReportDetailForExportExcel.push(reportGroup.columns[mapColumn]);
                        });

                        titleReportDetailForExportExcel= SortReportByColumnType.changeColumnName(titleReportDetailForExportExcel);

                        var reportName = !!reportView.name ? reportView.name : 'report-detail';
                        exportExcelService.exportExcel(reports, newMapColumns, titleReportDetailForExportExcel, reportName, true);
                    } else {
                        AlertService.replaceAlerts({
                            type: 'warning',
                            message: 'There are no reports for that selection'
                        });
                    }
                })
                .catch(function () {
                    AlertService.replaceAlerts({
                        type: 'warning',
                        message: 'There are no reports for that selection'
                    });
                });
        }

        function runReport(reportView) {
            var transition = UserStateHelper.transitionRelativeToBaseState(
                'unifiedReport.report.detail', {
                    reportView: reportView.id
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
                    function () {
                        AlertService.replaceAlerts({
                            type: 'danger',
                            message: 'The report view could not be deleted'
                        });
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
                        return UnifiedReportDataSetManager.getList({hasConnectedDataSource: true}).then(function (dataSets) {
                            var fields = _.union(reportView.dimensions.concat(reportView.metrics));
                            var formatFields = [];

                            angular.forEach(fields, function (field) {
                                var key = null;
                                var id = null;

                                if(field.lastIndexOf('_') > -1) {
                                    key = field.slice(0, field.lastIndexOf('_'));
                                    id = field.slice(field.lastIndexOf('_') + 1, field.length);
                                }

                                if(reportView.joinBy.length > 0) {
                                    for(var index in reportView.joinBy) {
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
                    $scope.hasFilterDate = hasFilterDate;
                    $scope.hideDaterange = hideDaterange;

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
                            fields: angular.toJson(fieldsToShare),
                            dateRange: {
                                startDate: DateFormatter.getFormattedDate($scope.selected.date.startDate),
                                endDate: DateFormatter.getFormattedDate($scope.selected.date.endDate)
                            }
                        };

                        UnifiedReportViewManager.one(reportView.id).customGET('shareablelink', params)
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

                    function hasFilterDate() {
                        var reportViews = !$scope.reportView.multiView ? $scope.reportView.reportViewDataSets : $scope.reportView.reportViewMultiViews;
                        for (var reportViewIndex in reportViews) {
                            var reportView = reportViews[reportViewIndex];

                            for (var filterIndex in reportView.filters) {
                                var filter = reportView.filters[filterIndex];

                                if((filter.type == 'date' || filter.type == 'datetime') && filter.dateType == 'userProvided') {
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