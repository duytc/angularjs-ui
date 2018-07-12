(function () {
    'use strict';

    angular.module('tagcade.public')
        .controller('shareableUnifiedReport', shareableUnifiedReport);

    function shareableUnifiedReport($scope, $stateParams, $translate, $modal, exportExcelService,reportViewUtil,
                                    reports, unifiedReportFormatReport, DateFormatter, AlertService,
                                    AtSortableService, dataService, API_UNIFIED_PUBLIC_END_POINT,
                                    historyStorage, HISTORY_TYPE_PATH,COMPARISON_TYPES_FILTER_CONNECT_TEXT,
                                    COMPARISON_TYPES_FILTER_CONNECT_DECIMAL, COMPARISON_TYPES_FILTER_CONNECT_NUMBER) {
        // reset css for id app
        var app = angular.element('#app');
        app.css({position: 'inherit'});

        $scope.reportView = reports.reportView;

        if(!!$scope.reportView && $scope.reportView.subView && angular.isObject($scope.reportView.masterReportView)) {
            var masterReportView = angular.copy($scope.reportView.masterReportView);
            masterReportView.filters = $scope.reportView.filters;
            delete  masterReportView.id;
            delete  masterReportView.subView;
            delete  masterReportView.masterReportView;
            delete  masterReportView.name;

            $scope.reportView = angular.extend($scope.reportView, masterReportView);
        }

        $scope.hasResult = !angular.isNumber(reports.status);
        $scope.reports = reports.reports || [];
        $scope.total = reports.total;
        $scope.average = reports.average;
        $scope.search = {};
        $scope.dimensions = [];
        $scope.metrics = [];

        if(!$scope.hasResult) {
            if(reports.status == 400) {
                AlertService.replaceAlerts({
                    type: 'error',
                    message: reports.message
                });
            } else if (reports.status == 500){
                AlertService.replaceAlerts({
                    type: 'error',
                    message: reports.message ||  $translate.instant('REPORT.REPORT_FAIL')
                });
            } else {
                AlertService.replaceAlerts({
                    type: 'warning',
                    message: $translate.instant('REPORT.REPORTS_EMPTY')
                });
            }

            return
        } else {
            if ($scope.reports.length == 0) {
                AlertService.replaceAlerts({
                    type: 'warning',
                    message: $translate.instant('REPORT.REPORTS_EMPTY')
                });
            }
        }

        $scope.tempReports = unifiedReportFormatReport.formatReports($scope.reports, $scope.reportView);

        $scope.titleColumns = reports.columns;
        $scope.columnReportDetailForExportExcel = [];
        $scope.titleReportDetailForExportExcel = [];

        _updateColumnPositions();

        if (!!$scope.reportView.formats.length && !!reports && reports.length > 0) {
            angular.forEach($scope.reportView.formats, function (format) {
                if (format.type == 'columnPosition' && format.fields.length > 0) {
                    angular.forEach(format.fields, function (field) {
                        var index = $scope.columnPositions.indexOf(field);

                        if(index > -1) {
                            $scope.columnPositions.splice(index, 1)
                        }
                    });

                    $scope.columnPositions = format.fields.concat($scope.columnPositions)
                }
            });
        }

        $scope.tableConfig = {
            itemsPerPage: $stateParams.limit || 10,
            maxPages: 10,
            totalItems: reports.totalReport
        };

        $scope.availableOptions = {
            currentPage: $stateParams.page || 1,
            pageSize: 10
        };

        var getReportDetail;
        var params = {
            page: 1
        };

        $scope.itemsPerPage = [
            {label: '10', key: '10'},
            {label: '20', key: '20'},
            {label: '30', key: '30'},
            {label: '40', key: '40'},
            {label: '50', key: '50'}
        ];

        $scope.selected = {
            date: {
                startDate: $stateParams.startDate || (!!reports.dateRange ? reports.dateRange.startDate : null),
                endDate : $stateParams.endDate || (!!reports.dateRange ? reports.dateRange.endDate : null)
            }
        };

        $scope.datePickerOpts = {
            maxDate:  reports.allowDatesOutside ?  moment().subtract(1, 'days').startOf('day') : (!!reports.dateRange ? reports.dateRange.endDate : undefined),
            minDate:  reports.allowDatesOutside ? undefined : (!!reports.dateRange ? reports.dateRange.startDate : undefined),
            ranges: {
                'Today': [moment().startOf('day'), moment().startOf('day')],
                'Yesterday': [moment().subtract(1, 'days').startOf('day'), moment().subtract(1, 'days').startOf('day')],
                'Last 7 Days': [moment().subtract(7, 'days').startOf('day'), moment().subtract(1, 'days').startOf('day')],
                'Last 30 Days': [moment().subtract(30, 'days'), moment().subtract(1, 'days')],
                'This Month': [moment().startOf('month'), moment().endOf('month')],
                'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
            }
        };

        _update();

        //custom filter
        _buildCustomFilters();
        $scope.customFilterContainer = _extractCustomFilters();
        

        $scope.getExportExcelFileName = getExportExcelFileName;
        $scope.isEmptyObject = isEmptyObject;
        $scope.isShow = isShow;
        $scope.sort = sort;
        $scope.isNullValue = isNullValue;
        $scope.refreshData = refreshData;
        $scope.searchReportView = searchReportView;
        $scope.selectItemPerPages = selectItemPerPages;
        $scope.changePage = changePage;
        $scope.exportExcel = exportExcel;
        $scope.hasFilterDate = hasFilterDate;
        $scope.generateReport = generateReport;
        $scope.showPagination = showPagination;
        $scope.setClassName = setClassName;
        //Custom filter
        $scope.getComparisonTypes = getComparisonTypes;
        $scope.addCompareValueText = addCompareValueText;
        $scope.isDatasetHasUserProvidedFilterExceptDate = isDatasetHasUserProvidedFilterExceptDate;

        /**
         * Filters is in reportView.reportViewDatasets, but to subReportView, filter is in reportView.filters
         * Need push reportView.filters into reportView.reportViewDatasets to submit to api
         * @private
         */
        function _buildCustomFilters() {
            reportViewUtil._buildCustomFilters($scope.reportView.filters, $scope.reportView.reportViewDataSets);
        }

        function isDatasetHasUserProvidedFilterExceptDate(dataset) {
            return reportViewUtil.isDatasetHasUserProvidedFilterExceptDate(dataset);
        }

        function _extractCustomFilters() {
            //enable outside value
            if(!$scope.reportView.sharedKeysConfig[$stateParams.token]) return;

            var allowedOutsideFilters = $scope.reportView.sharedKeysConfig[$stateParams.token].filters;
            var datasets = angular.copy($scope.reportView.reportViewDataSets);
            _.forEach(datasets, function (dataset) {
                _.forEach(dataset.filters, function (filter) {
                    filter.originalCompareValue = angular.copy(filter.compareValue);
                    if(_checkIsChildOf(filter, dataset, allowedOutsideFilters)){
                        filter.allowOutsideValue = true;
                    }
                })
            });

            return datasets;
        }
        
        function _checkIsChildOf(filter, dataset, allowedOutsideFilters) {
            if(!allowedOutsideFilters) return false;
            var found = allowedOutsideFilters.find(function (filterItem) {
                return filterItem.name === filter.field && filterItem.dataSetId === dataset.dataSet.id;
            });
            return !!found;
        }
        
        function getComparisonTypes(customFilter, field, dataset) {
            if (customFilter.type === 'text') {
                return COMPARISON_TYPES_FILTER_CONNECT_TEXT;
            }
            if (customFilter.type === 'number') {
                if (_getFieldType(field, dataset) === 'decimal') {
                    return COMPARISON_TYPES_FILTER_CONNECT_DECIMAL;
                }
                return COMPARISON_TYPES_FILTER_CONNECT_NUMBER;
            }
            return []
        }

        function _getFieldType(field, dataset) {
            if ($scope.reportView && $scope.reportView.fieldTypes) {
                return $scope.reportView.fieldTypes[field + '_' + dataset.dataSet];
            }
            return null;
        }

        function addCompareValueText(query) {
            if (/['`$]/.test(query)) {
                return;
            }
            return query;
        }
        function setClassName() {
            var totalItem = Object.keys($scope.total).length;

            if(totalItem == 1) {
                return 'col-md-12'
            } else if(totalItem == 2) {
                return 'col-md-6'
            } else if(totalItem%5 == 0 || ((totalItem+1)%5 == 0 && totalItem%3 != 0 && totalItem%4 != 0)) {
                return 'col-md-5-2'
            } else if(totalItem%4 == 0 || ((totalItem+1)%4 == 0 && totalItem%3 != 0)) {
                return 'col-md-3'
            }
            else if(totalItem%3 == 0 || (totalItem+1)%3 == 0) {
                return 'col-md-4'
            } else if(totalItem > 5) {
                return 'col-md-5-2'
            } else {
                return 'col-md-4'
            }
        }

        function generateReport(date) {
            var params = {};
            var newDimensions = [];
            var newMetrics = [];

            angular.forEach($scope.fieldsShow.dimensions, function (value) {
                if(value && value.ticked && !!$scope.dimensions) {
                    newDimensions.push(value.name);
                }
            });

            angular.forEach($scope.fieldsShow.metrics, function (value) {
                if(value && value.ticked && !!$scope.metrics) {
                    newMetrics.push(value.name);
                }
            });

            params.startDate = DateFormatter.getFormattedDate(date.startDate);
            params.endDate = DateFormatter.getFormattedDate(date.endDate);
            params.userDefineDimensions = angular.toJson(newDimensions);
            params.userDefineMetrics = angular.toJson(newMetrics);
            $scope.availableOptions.currentPage = 1;
            _getReportDetail(params);
        }

        function _buildCustomFilterParams() {
            var params = [];
            _.forEach($scope.customFilterContainer, function (dataset) {
                var json = {
                    dataSet: dataset.dataSet.id,
                    filters : dataset.filters
                };
                params.push(json);
            });

            return params;
        }

        function hasFilterDate() {
            for (var i in $scope.reportView.filters) {
                var filterRoot = $scope.reportView.filters[i];

                if((filterRoot.type == 'date' || filterRoot.type == 'datetime') && filterRoot.userProvided && !!reports.dateRange.startDate && !!reports.dateRange.endDate) {
                    return true
                }
            }

            for (var reportViewIndex in $scope.reportView.reportViewDataSets) {
                var reportView = $scope.reportView.reportViewDataSets[reportViewIndex];

                for (var filterIndex in reportView.filters) {
                    var filter = reportView.filters[filterIndex];

                    if((filter.type == 'date' || filter.type == 'datetime') && filter.userProvided && !!reports.dateRange.startDate && !!reports.dateRange.endDate) {
                        return true
                    }
                }
            }

            return false;
        }

        function openEmailPopup(res, params, reportView) {
            var modalEmail = $modal.open({
                templateUrl: 'unifiedReport/template/confirmFillUserEmail.tpl.html',
                controller: function ($scope) {
                    $scope.isLimitedEmail = false;
                    $scope.content = _.isObject(res) ? res['message'] : null;
                    $scope.email = [];

                    $scope.isInValidEmail = function () {
                        var regexEmail = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
                        return _.isEmpty($scope.email) || _.isEmpty(_.filter($scope.email, function (e) {
                                return !regexEmail.test(String(e).toLowerCase());
                            }));
                    }

                    $scope.isEmailEmpty = function () {
                        return _.isEmpty($scope.email);
                    }

                    $scope.addEmail = function(email)
                    {
                        var size = _.size($scope.email);
                        $scope.isLimitedEmail = _.isUndefined(email) ? (--size > 9) : size > 9;

                        if(size <= 9)
                            return email;
                    }

                    $scope.sendEmail = function() {
                        modalEmail.dismiss('cancel');
                        params.reportView = reportView;
                        dataService.makeHttpGetRequest('/v1/reportviews/:reportView/sharedReports', angular.extend(params, { userEmail: JSON.stringify($scope.email) }), API_UNIFIED_PUBLIC_END_POINT)
                            .then(function (data) {
                                AlertService.replaceAlerts({
                                    type: 'warning',
                                    message: 'We are processing for this report file and send to you ASAP via your mails !'
                                });
                            });
                    }
                }
            });
        }

        function exportExcel() {
            var params = {};
            var newDimensions = [];
            var newMetrics = [];

            angular.forEach($scope.fieldsShow.dimensions, function (value) {
                if(value && value.ticked && !!$scope.dimensions) {
                    newDimensions.push(value.name);
                }
            });

            angular.forEach($scope.fieldsShow.metrics, function (value) {
                if(value && value.ticked && !!$scope.metrics) {
                    newMetrics.push(value.name);
                }
            });

            params.startDate = DateFormatter.getFormattedDate($scope.selected.date.startDate);
            params.endDate = DateFormatter.getFormattedDate($scope.selected.date.endDate);
            params.userDefineDimensions = angular.toJson(newDimensions);
            params.userDefineMetrics = angular.toJson(newMetrics);
            params.token = $stateParams.token;
            params.reportView = $stateParams.reportView;

            params.searches = $scope.search;
            params.isExport = true;

            dataService.makeHttpGetRequest('/v1/reportviews/:reportView/sharedReports', params, API_UNIFIED_PUBLIC_END_POINT)
                .then(function (reportData) {
                    if(_.isObject(reportData) && reportData['code']) {
                        delete params.isExport;
                        return openEmailPopup(reportData, params, $stateParams.reportView);
                    }

                    exportExcelService.exportExcel(reportData.reports, $scope.columnReportDetailForExportExcel, $scope.titleReportDetailForExportExcel, getExportExcelFileName());
                    /*var blob = new Blob([reportData], {type: "text/plain;charset=utf-8"});
                    var reportName = 'report-detail';

                    return saveAs(blob, [reportName + '.csv']);*/
                })
        }

        function changePage(currentPage) {
            _getReportDetail();
        }

        function selectItemPerPages(itemPerPage) {
            $scope.availableOptions.currentPage = 1;
            _getReportDetail();
        }

        function searchReportView() {
            _getReportDetail();
        }

        function refreshData() {
            $scope.tableConfig.itemsPerPage = 10;
            historyStorage.getLocationPath(HISTORY_TYPE_PATH.public, 'app.public', {limit: $scope.tableConfig.itemsPerPage});
        }

        function isNullValue(report, column) {
            return !report[column] && report[column] != 0;
        }

        function sort(keyname) {
            $scope.sortBy = '\u0022' + keyname + '\u0022'; //set the sortBy to the param passed
            $scope.reverse = !$scope.reverse; //if true make it false and vice versa

            _getReportDetail();
        }

        function isShow(sortColumn) {
            return ($scope.sortBy == '\u0022' + sortColumn + '\u0022')
        }

        function isEmptyObject(object) {
            if (!object && object != 0) {
                return false
            }

            return Object.keys(object).length > 0
        }

        function getExportExcelFileName() {
            return 'report-detail'
        }

        function _updateColumnPositions() {
            $scope.columnPositions = !!$scope.columnPositions && $scope.columnPositions.length > 0 ? $scope.columnPositions : [];

            if ($scope.reports.length > 0) {
                var reportViews = $scope.reportView.reportViewDataSets;
                var totalDimensions = [];
                var totalMetrics = [];

                angular.forEach(reportViews, function (reportView) {
                    totalDimensions = totalDimensions.concat(reportView.dimensions);
                    totalMetrics = totalMetrics.concat(reportView.metrics)
                });

                var dimensions = [];
                var metrics = [];

                angular.forEach(_.keys($scope.reports[0]), function (col) {
                    var key = null;

                    if(col.lastIndexOf('_') > -1) {
                        key = col.slice(0, col.lastIndexOf('_'));
                    } else {
                        key = col;
                    }

                    var hasJoin = _.findIndex($scope.reportView.joinBy, function (join) {
                        return join.outputField == col
                    });

                    if(totalDimensions.indexOf(key) > -1 || hasJoin > -1) {
                        dimensions.push(col)
                    } else {
                        metrics.push(col)
                    }
                });

                dimensions = _.sortBy(dimensions, function (dimension) {
                    var key = null;

                    if(dimension.lastIndexOf('_') > -1) {
                        key = dimension.slice(0, dimension.lastIndexOf('_'));
                    } else {
                        key = dimension;
                    }

                    return key
                });

                metrics = _.sortBy(metrics, function (metric) {
                    var key = null;

                    if(metric.lastIndexOf('_') > -1) {
                        key = metric.slice(0, metric.lastIndexOf('_'));
                    } else {
                        key = metric;
                    }

                    return key
                });

                angular.forEach(angular.copy(dimensions).reverse(), function (dimension) {
                    if($scope.reportView.fieldTypes[dimension] == 'date' || $scope.reportView.fieldTypes[dimension] == 'datetime') {
                        dimensions.splice(dimensions.indexOf(dimension), 1);
                        dimensions.unshift(dimension);
                    }
                });

                angular.forEach(angular.copy(metrics).reverse(), function (metric) {
                    if($scope.reportView.fieldTypes[metric] == 'date' || $scope.reportView.fieldTypes[metric] == 'datetime') {
                        metrics.splice(metrics.indexOf(metric), 1);
                        metrics.unshift(metric);
                    }
                });

                $scope.columnPositions = dimensions.concat(metrics);
            }

            if (!!$scope.reportView.formats.length && $scope.reports.length > 0) {
                angular.forEach($scope.reportView.formats, function (format) {
                    if (format.type == 'columnPosition' && format.fields.length > 0) {
                        angular.forEach(format.fields, function (field) {
                            var index = $scope.columnPositions.indexOf(field);

                            if(index > -1) {
                                $scope.columnPositions.splice(index, 1)
                            }
                        });

                        $scope.columnPositions = format.fields.concat($scope.columnPositions);

                        angular.forEach(angular.copy($scope.columnPositions), function (col) {
                            var index = $scope.columnPositions.indexOf(col);
                            if(!!$scope.titleColumns && !$scope.titleColumns[col] && index > -1) {
                                $scope.columnPositions.splice(index, 1);
                            }
                        })
                    }
                });
            }

            if (angular.isArray($scope.reports) && $scope.reports.length > 0) {
                $scope.columnReportDetailForExportExcel = [];
                $scope.titleReportDetailForExportExcel = [];

                $scope.columnPositions = _.intersection($scope.columnPositions, Object.keys($scope.reports[0]));
                var report = $scope.columnPositions;

                angular.forEach(report, function (key) {
                    $scope.columnReportDetailForExportExcel.push(key);

                    var title = !!$scope.titleColumns[key] ? $scope.titleColumns[key] : key;
                    $scope.titleReportDetailForExportExcel.push(title)
                })
            }

            // remove columnPositions
            angular.forEach(angular.copy($scope.columnPositions), function (column) {
                var indexD = _.findIndex($scope.dimensions, {name: column});

                if(indexD > -1) {
                    if(!$scope.dimensions[indexD].ticked) {
                        $scope.columnPositions.splice($scope.columnPositions.indexOf(column), 1)
                    }
                } else {
                    var indexM = _.findIndex($scope.metrics, {name: column});

                    if(indexM > -1) {
                        if(!$scope.metrics[indexM].ticked) {
                            $scope.columnPositions.splice($scope.columnPositions.indexOf(column), 1)
                        }
                    }
                }
            });

            // add columnPositions
            angular.forEach($scope.dimensions, function (dm) {
                if(dm.ticked && $scope.columnPositions.indexOf(dm.name) == -1)  {
                    $scope.columnPositions.push(dm.name);
                }
            });

            angular.forEach($scope.dimensions.concat($scope.metrics), function (dm) {
                if(dm.ticked && $scope.columnPositions.indexOf(dm.name) == -1)  {
                    $scope.columnPositions.push(dm.name);
                }
            });

            if($scope.reports.length > 0) {
                angular.forEach(angular.copy($scope.columnPositions), function (column) {
                    var index = _.keys($scope.reports[0]).indexOf(column);

                    if(index == -1) {
                        $scope.columnPositions.splice($scope.columnPositions.indexOf(column), 1)
                    }
                })
            }
        }

        function showPagination() {
            return angular.isArray($scope.reports) && $scope.tableConfig.totalItems > $scope.tableConfig.itemsPerPage;
        }

        function _getReportDetail(paramsCustom) {
            clearTimeout(getReportDetail);

            if(!!paramsCustom) {
                angular.forEach(angular.copy($scope.search), function (value, key) {
                    if(!paramsCustom.userDefineDimensions[key] && !paramsCustom.userDefineMetrics[key]) {
                        delete $scope.search[key]
                    }
                });
            }

            getReportDetail = setTimeout(function() {
                params = angular.extend(params, $stateParams, {searches: angular.toJson($scope.search), limit: $scope.tableConfig.itemsPerPage, page: $scope.availableOptions.currentPage, orderBy: (!!$scope.reverse ? 'desc': 'asc'), sortField: $scope.sortBy}, paramsCustom);
                //custom filters
                params.customFilter = JSON.stringify(_buildCustomFilterParams());
                return dataService.makeHttpGetRequest('/v1/reportviews/:reportView/sharedReports', params, API_UNIFIED_PUBLIC_END_POINT)
                    .then(function(reports) {
                        AtSortableService.insertParamForUrl(params);
                        $scope.reports = reports;
                        $scope.reports = reports.reports || [];
                        $scope.total = reports.total;
                        $scope.average = reports.average;
                        $scope.tableConfig.totalItems = reports.totalReport;
                        $scope.availableOptions.currentPage = Number(params.page);
                        $scope.titleColumns = reports.columns;

                        AlertService.clearAllRemovable();

                        _updateColumnPositions();
                    }, function (response) {
                        if(response.status == 400) {
                            AlertService.replaceAlerts({
                                type: 'error',
                                message: response.data.message
                            });
                        } else if (response.status == 500){
                            AlertService.replaceAlerts({
                                type: 'error',
                                message:  $translate.instant('REPORT.REPORT_FAIL')
                            });
                        } else {
                            AlertService.replaceAlerts({
                                type: 'warning',
                                message: $translate.instant('REPORT.REPORTS_EMPTY')
                            });
                        }
                    });
            }, 500);
        }

        function _update() {
            var totalDimensions = [];
            var totalMetrics = [];

            var reportViews = $scope.reportView.reportViewDataSets;

            angular.forEach(reportViews, function (reportView) {
                totalDimensions = totalDimensions.concat(reportView.dimensions);
                totalMetrics = totalMetrics.concat(reportView.metrics)
            });

            angular.forEach(reports.fields, function (field) {
                var key = null;

                if(field.lastIndexOf('_') > -1) {
                    key = field.slice(0, field.lastIndexOf('_'));
                } else {
                    key = field;
                }

                var hasJoin = _.findIndex($scope.reportView.joinBy, function (join) {
                    return join.outputField == field
                });

                for(var x in $scope.reportView.joinBy) {
                    var join = $scope.reportView.joinBy[x];
                    if(!_joinIsMetrics(join, totalMetrics)) {
                        if(_.findIndex($scope.dimensions, function (dimension) { return dimension.name == join.outputField }) == -1 && !!join.outputField && join.outputField == field) {
                            $scope.dimensions.push({name: join.outputField , label: $scope.titleColumns[join.outputField] || join.outputField, ticked: join.isVisible});
                        }
                    } else {
                        if(_.findIndex($scope.metrics, function (metric) { return metric.name == join.outputField }) == -1 && !!join.outputField && join.outputField == field) {
                            $scope.metrics.push({name: join.outputField , label: $scope.titleColumns[join.outputField] || join.outputField, ticked: join.isVisible});
                        }
                    }
                }

                if(hasJoin == -1) {
                    angular.forEach(reportViews, function (reportView) {
                        if(reportView.metrics.indexOf(key) > -1) {
                            var index = _.findIndex($scope.metrics, {name: field});

                            if(index == -1) {
                                $scope.metrics.push({name: field, label: $scope.titleColumns[field] || field, ticked: true});
                            }
                        }

                        if(reportView.dimensions.indexOf(key) > -1 || key == 'report_view_alias') {
                            var j = _.findIndex($scope.dimensions, {name: field});

                            if(j == -1) {
                                $scope.dimensions.push({name: field, label: $scope.titleColumns[field] || field, ticked: true});
                            }
                        }
                    });

                    if(_.findIndex($scope.dimensions, {name: field}) == -1 && _.findIndex($scope.metrics, {name: field}) == -1) {
                        $scope.metrics.push({name: field, label: $scope.titleColumns[field] || field, ticked: true});
                    }
                }
            });

            $scope.fieldsShow = $scope.fieldsShow || {dimensions: [], metrics: []};
        }

        function _joinIsMetrics(join, totalMetrics) {
            if(totalMetrics.indexOf(join.joinFields[0].field) > -1 && totalMetrics.indexOf(join.joinFields[1].field) > -1) {
                return true
            }

            return false
        }

        $scope.$watch(function () {
            return $scope.fieldsShow.dimensions
        }, function () {
            var totalSelect = 0;
            var indexDimension;

            angular.forEach($scope.dimensions, function (dimension, index) {
                if(dimension.ticked) {
                    totalSelect += 1;
                    indexDimension = index;

                    dimension.disabled = false;
                }
            });

            if(totalSelect == 1) {
                $scope.dimensions[indexDimension].disabled = true
            }
        });

        historyStorage.setParamsHistoryCurrent(HISTORY_TYPE_PATH.public);
        $scope.$on('$locationChangeSuccess', function() {
            historyStorage.setParamsHistoryCurrent(HISTORY_TYPE_PATH.public)
        });
    }
})
();