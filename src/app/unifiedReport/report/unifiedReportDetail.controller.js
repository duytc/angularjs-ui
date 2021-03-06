(function () {
    'use strict';

    angular.module('tagcade.unifiedReport.report')
        .controller('UnifiedReportDetail', UnifiedReportDetail);

    function UnifiedReportDetail($scope, $q, $modal, historyStorage, $stateParams, _, allDimensionsMetrics, reportView,
                                 dataSources, $translate, reportGroup, dataService, unifiedReportBuilder, getDateReportView,
                                 AlertService, UnifiedReportViewManager, DateFormatter, HISTORY_TYPE_PATH, API_UNIFIED_END_POINT,
                                 sessionStorage, userSession, COMPARISON_TYPES_FILTER_CONNECT_TEXT,reportViewUtil, METRICS_SET,
                                 COMPARISON_TYPES_FILTER_CONNECT_DECIMAL, COMPARISON_TYPES_FILTER_CONNECT_NUMBER) {
        const maxEmailAllowed = 10;
        const CALCULATED_METRIC_USER_DEFINED = 1;

        // reset css for id app
        var app = angular.element('#app');
        app.css({position: 'inherit'});

        $scope.linkDownload = API_UNIFIED_END_POINT + '/v1/reportview/download';
        $scope.tableConfig = {
            itemsPerPage: $stateParams.limit || 10,
            maxPages: 10,
            totalItems: Number(reportGroup.totalReport)
        };

        $scope.availableOptions = {
            currentPage: $stateParams.page || 1,
            pageSize: 10
        };

        var getReportDetail;
        var params = {
            page: 1
        };

        $scope.search = {};
        $scope.reportView = reportView;
        $scope.reportGroup = reportGroup;
        $scope.hasResult = !angular.isNumber(reportGroup.status);

        $scope.reports = reportGroup.reports || [];
        $scope.types = reportGroup.types;
        $scope.isNew = !$scope.reportView.id;
        $scope.hasSaveRepoerView = !!$stateParams.id;
        $scope.formProcessing = false;

        $scope.dimensions = [];
        $scope.metrics = [];

        //calculated metrics
        $scope.typesField = METRICS_SET;
        $scope.patternForAddField =  /^[a-zA-Z_][a-zA-Z0-9_$\s]*$/;
        $scope.calculatedMetricsResult = sortCalculatedResultByName(reportGroup.calculatedMetricsResult || {});
        $scope.isCalculatedMetricsComplete = true;

        _updateColumnPositions();
        _fixWrongTickedDimensionAndMetric();
        reportViewUtil.updateLabelForOptions($scope.metrics, allDimensionsMetrics);
        reportViewUtil.updateLabelForOptions($scope.dimensions, allDimensionsMetrics);

        if(!!reportView && reportView.subView && angular.isObject(reportView.masterReportView)) {
            var masterReportView = angular.copy(reportView.masterReportView);
            masterReportView.filters = reportView.filters;
            delete  masterReportView.id;
            delete  masterReportView.subView;
            delete  masterReportView.masterReportView;
            delete  masterReportView.name;

            reportView = angular.extend(reportView, masterReportView);
        }

        $scope.reportViewForEdit = {
            reportViewDataSets: angular.toJson(reportView.reportViewDataSets),
            filters: angular.toJson(reportView.filters),
            transforms: angular.toJson(reportView.transforms),
            showInTotal: angular.toJson(reportView.showInTotal),
            formats: angular.toJson(reportView.formats),
            weightedCalculations: angular.toJson(reportView.weightedCalculations),
            joinBy: angular.toJson(reportView.joinBy),
            requireJoin: reportView.requireJoin,
            metricCalculations: angular.toJson(reportView.metricCalculations),
            name: reportView.name,
            masterReportView: angular.isObject(reportView.masterReportView) ? reportView.masterReportView.id : reportView.masterReportView,
            subView: reportView.subView,
            id: reportView.id,
            isShowDataSetName: reportView.isShowDataSetName,
            preCalculateTable: reportView.preCalculateTable,
            largeReport:  reportView.largeReport,
            availableToRun:  reportView.availableToRun,
            availableToChange: reportView.availableToChange,
            publisher: angular.isObject(reportView.publisher) ? reportView.publisher.id : reportView.publisher,
            enableCustomDimensionMetric: reportView.enableCustomDimensionMetric,
            calculatedMetrics: angular.toJson(reportView.calculatedMetrics)
        };

        if(!$scope.hasResult) {
            if (reportGroup.status == 400) {
                AlertService.replaceAlerts({
                    type: 'error',
                    message: reportGroup.message
                });
            } else if (reportGroup.status == 500) {
                AlertService.replaceAlerts({
                    type: 'error',
                    message: reportGroup.message || $translate.instant('REPORT.REPORT_FAIL')
                });
            } else {
                AlertService.replaceAlerts({
                    type: 'warning',
                    message: $translate.instant('REPORT.REPORTS_EMPTY')
                });
            }
        }

        $scope.itemsPerPage = [
            {label: '10', key: '10'},
            {label: '20', key: '20'},
            {label: '30', key: '30'},
            {label: '40', key: '40'},
            {label: '50', key: '50'}
        ];

        $scope.itemsPerPage.selected = $scope.tableConfig.itemsPerPage;

        $scope.selected = {
            date: {
                startDate: $stateParams.startDate || getDateReportView.getMinStartDateInFilterReportView(reportView),
                endDate : $stateParams.endDate || getDateReportView.getMaxEndDateInFilterReportView(reportView)
            }
        };

        $scope.fieldsCalculatedMetric = [];

        _updateMissingDate($scope.selected.date);

        $scope.datePickerOpts = {
            maxDate:  moment().endOf('day'),
            ranges: {
                'Today': [moment().startOf('day'), moment().endOf('day')],
                'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
                'Last 7 Days': [moment().subtract(6, 'days'), moment()],
                'Last 30 Days': [moment().subtract(30, 'days'), moment().subtract(1, 'days')],
                'This Month': [moment().startOf('month'), moment().endOf('month')],
                'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
            }
        };

        $scope.showPagination = showPagination;
        $scope.saveReportView = saveReportView;
        $scope.getExportExcelFileName = getExportExcelFileName;

        $scope.sort = sort;
        $scope.isShow = isShow;
        $scope.isEmptyObject = isEmptyObject;
        $scope.isNullValue = isNullValue;
        
        $scope.generateReport = generateReport;
        $scope.hasFilterDate = hasFilterDate;
        $scope.refreshData = refreshData;
        $scope.changePage = changePage;
        $scope.selectItemPerPages = selectItemPerPages;
        $scope.searchReportView = searchReportView;
        $scope.exportExcel = exportExcel;
        $scope.showDetailsMissingDates = showDetailsMissingDates;
        $scope.showReportDetail = showReportDetail;
        $scope.enableSelectDaterange = enableSelectDaterange;
        $scope.setClassName = setClassName;
        //Custom filter
        $scope.getComparisonTypes = getComparisonTypes;
        $scope.addCompareValueText = addCompareValueText;
        $scope.isShowCustomFilter = isShowCustomFilter;
        $scope.isShowDatasetHasUserProvidedFilterExceptDate = isShowDatasetHasUserProvidedFilterExceptDate;
        $scope.isShowHelpBlock = isShowHelpBlock;

        //Calculated Metrics
        $scope.getCalculatedMetrics = getCalculatedMetrics;
        $scope.getColumnCompatible = getColumnCompatible;
        $scope.filterCalculatedMetricsDefined = filterCalculatedMetricsDefined;
        $scope.getDisplayNameMetric = getDisplayNameMetric;
        $scope.isAllowUserDefinedMetrics = isAllowUserDefinedMetrics;
        $scope.isShowCalculatedMetric = isShowCalculatedMetric;
        $scope.isShowCalculatedMetricResults = isShowCalculatedMetricResults;


        _buildCustomFilters();
        /**
         * Filters is in reportView.reportViewDatasets, but to subReportView, filter is in reportView.filters
         * Need push reportView.filters into reportView.reportViewDatasets to submit to api
         * @private
         */
        function _buildCustomFilters() {
            reportViewUtil._buildCustomFilters($scope.reportView.filters, $scope.reportView.reportViewDataSets);
        }

        function isShowDatasetHasUserProvidedFilterExceptDate(dataset) {
            return reportViewUtil.isDatasetHasUserProvidedFilterExceptDate(dataset);
        }

        function isShowHelpBlock(customFilter) {
            return reportViewUtil.isShowHelpBlock(customFilter)
        }

        function isShowCustomFilter() {
            return reportViewUtil.hasCustomFilters($scope.reportView.reportViewDataSets);
        }

        function getColumnCompatible(items) {
            return setClassName(items);
        }

        function filterCalculatedMetricsDefined(items) {
            return _.filter(items, function (item) {
                return isAllowUserDefinedMetrics(item);
            })
        }

        function getCalculatedMetrics(field) {
            if(!field)
                return;
            $scope.isCalculatedMetricsComplete = false;
            return generateReport($scope.selected.date, $scope.reportView);
        }

        function isShowCalculatedMetricResults() {
            return !_.isEmpty($scope.calculatedMetricsResult);
        }

        function isShowCalculatedMetric() {
            return !_.isEmpty($scope.reportView.calculatedMetrics) && !isNotContainsUserDefined();
        }

        function isNotContainsUserDefined() {
            return _.isEmpty(_.findWhere($scope.reportView.calculatedMetrics, {calculationType: CALCULATED_METRIC_USER_DEFINED}));
        }

        function getDisplayNameMetric(key) {
            return (_.findWhere($scope.reportView.calculatedMetrics, {field: key}) || {displayName: key}).displayName;
        }

        function sortCalculatedResultByName(results) {
            if(_.isEmpty(results))
                return results;

            var calculatedResults = [];
            for(var key in results) {
                calculatedResults.push({
                    key: key,
                    displayName: getDisplayNameMetric(key),
                    value: results[key]
                })
            }

            return calculatedResults;
        }

        function isAllowUserDefinedMetrics(field) {
            return field.calculationType && field.calculationType == CALCULATED_METRIC_USER_DEFINED;
        }

        function _fixWrongTickedDimensionAndMetric() {
            // Fix bug: some metrics ticked wrong by default. https://trello.com/c/rmXhwtVO/2637-ur-usability-fixes-small
            //This solution is not good. Just to fix above bug. If there is some change, this solution may not work
            /**
             * Solution: First time enter into report view builder, table show correct columns (correctFields = _.keys($scope.reports[0])).
             * For example: Report view has Dataset_1 and Dataset_2, user select request of Dataset_1, but not select request of Dataset_2.
             * Problem: on metrics'd ui-select box, request of Dataset_2 ticked default, and name of Dataset_1 is missing, but report table doesn't show request of Dataset_1.
             * Report table is correct => need un-ticked and show Dataset_1's name metrics's on ui-select.
             * Dimension need to be fixed, too.
             *
             */
            var correctFields = _.keys($scope.reports[0]);
            _unTickWrongMetrics(correctFields);
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
            if (reportView && reportView.fieldTypes) {
                return reportView.fieldTypes[field + '_' + dataset.dataSet];
            }
            return null;
        }

        function addCompareValueText(query) {
            if (/['`$]/.test(query)) {
                return;
            }
            return query;
        }

        function setClassName(data) {
            if(data) {
                var totalItem = !_.isArray(data) ? Object.keys(data).length : _.size(data);
            } else {
                var totalItem = Object.keys($scope.reportGroup.total).length;
            }

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

        function enableSelectDaterange() {
            if(!!$scope.reportView.enableCustomDimensionMetric) {
                return true
            }

            for (var i in $scope.reportView.filters) {
                var filterRoot = $scope.reportView.filters[i];

                if(filterRoot.type == 'date' || filterRoot.type == 'datetime') {
                    if(filterRoot.userProvided) {
                        return true
                    }
                }
            }

            for (var reportViewIndex in $scope.reportView.reportViewDataSets) {
                var reportView = $scope.reportView.reportViewDataSets[reportViewIndex];

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

        function showReportDetail() {
            return $scope.reports && $scope.reports.length > 0;
        }

        function showDetailsMissingDates() {
            $modal.open({
                templateUrl: 'unifiedReport/report/showMissingDate.tpl.html',
                controller: function ($scope, missingDate) {
                    $scope.missingDate = missingDate;

                    $scope.tableConfig = {
                        itemsPerPage: 10,
                        maxPages: 7
                    };

                    $scope.showPagination = function () {
                        return angular.isArray($scope.missingDate) && $scope.missingDate.length > $scope.tableConfig.itemsPerPage;
                    }
                },
                resolve: {
                    missingDate: function () {
                        return $scope.missingDate;
                    }
                }
            });
        }

        function openEmailPopup(res, params) {
            var modalEmail = $modal.open({
                templateUrl: 'unifiedReport/template/confirmFillUserEmail.tpl.html',
                controller: function ($scope) {
                    $scope.isLimitedEmail = false;
                    $scope.content = _.isObject(res) ? res['message'] : null;
                    $scope.email = reportView.emailSendAlert ? reportView.emailSendAlert : (userSession.email ? [userSession.email] : []);

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
                        var size = !_.contains(_.values($scope.email), email) ? (_.size($scope.email) + 1) : (_.size($scope.email) - 1);
                        $scope.isLimitedEmail = size > maxEmailAllowed;

                        return email;
                    }

                    $scope.sendEmail = function() {
                        modalEmail.dismiss('cancel');
                        dataService.makeHttpPOSTRequest('/v1/reportview/download', angular.extend(params, { userEmail: $scope.email }), API_UNIFIED_END_POINT)
                            .then(function (data) {
                                AlertService.replaceAlerts({
                                    type: 'warning',
                                    message: 'We are processing for this report file and send to you ASAP via your mails !'
                                });
                            })
                    }
                }
            });
        }

        function exportExcel() {
            var params = _toJsonReportView(reportView);
            delete params.page;

            dataService.makeHttpPOSTRequest('', params, API_UNIFIED_END_POINT + '/v1/reportview/download')
                .then(function (data) {
                    if(_.isObject(data) && data['code']) {
                        return openEmailPopup(data, params);
                    }

                    var blob = new Blob([data], {type: "text/plain;charset=utf-8"});
                    var reportName = !!reportView.name ? reportView.name : 'report-detail';

                    return saveAs(blob, [reportName + '.csv']);
                });
        }
        
        function searchReportView() {
            $scope.availableOptions.currentPage = 1;

            _getReportDetail(_toJsonReportView(reportView), 250);
        }
        
        function selectItemPerPages(itemPerPage) {
            $scope.availableOptions.currentPage = 1;

            _getReportDetail(_toJsonReportView(reportView, itemPerPage));
        }

        function changePage(currentPage) {
            _getReportDetail(_toJsonReportView(reportView));
        }

        function _getReportDetail(query, timeout) {
            clearTimeout(getReportDetail);

            getReportDetail = setTimeout(function() {
                params = angular.copy(query);
                return unifiedReportBuilder.getPlatformReport(params)
                    .then(function(reportGroup) {
                        $scope.reportGroup = reportGroup;
                        $scope.reports = reportGroup.reports || [];
                        $scope.tableConfig.totalItems = Number(reportGroup.totalReport);
                        $scope.availableOptions.currentPage = Number(params.page);
                        $scope.isCalculatedMetricsComplete = true;
                        $scope.calculatedMetricsResult = sortCalculatedResultByName(reportGroup.calculatedMetricsResult || {});

                        _updateColumnPositions();

                        if($scope.reports.length > 0) {
                            AlertService.clearAll()
                        }
                    });
            }, timeout || 0);
        }

        function refreshData() {
            historyStorage.getLocationPath(HISTORY_TYPE_PATH.unifiedReportDetail, '^.detail');
        }

        function hasFilterDate() {
            for (var reportViewIndex in $scope.reportView.reportViewDataSets) {
                var reportView = $scope.reportView.reportViewDataSets[reportViewIndex];

                for (var filterIndex in reportView.filters) {
                    var filter = reportView.filters[filterIndex];

                    if((filter.type == 'date' || filter.type == 'datetime') && filter.userProvided) {
                        return true
                    }
                }
            }

            for (var i in $scope.reportView.filters) {
                var filterRoot = $scope.reportView.filters[i];

                if((filterRoot.type == 'date' || filterRoot.type == 'datetime') && filterRoot.userProvided) {
                    return true
                }
            }

            return false;
        }

        function generateReport(date, customReportView) {
            $scope.availableOptions.currentPage = 1;

            var params = _toJsonReportView(customReportView ? customReportView : reportView);

            params.startDate = DateFormatter.getFormattedDate(date.startDate);
            params.endDate = DateFormatter.getFormattedDate(date.endDate);

            if(!hasFilterDate()) {
                delete params.startDate;
                delete params.endDate;
            }

            _getReportDetail(params);

            _updateMissingDate(params);
        }

        function isNullValue(report, column) {
            return !report[column] && report[column] != 0;
        }

        function isEmptyObject(object) {
            if (!object) {
                return false
            }

            return Object.keys(object).length > 0
        }

        function sort(keyname) {
            $scope.sortBy = '\u0022'+keyname+'\u0022'; //set the sortBy to the param passed
            $scope.reverse = !$scope.reverse; //if true make it false and vice versa

            _getReportDetail(_toJsonReportView(reportView));
        }

        function isShow(sortColumn) {
            return ($scope.sortBy == '\u0022' + sortColumn + '\u0022')
        }

        function getExportExcelFileName() {
            return !!$scope.reportView.name ? $scope.reportView.name : 'report-detail';
        }

        function saveReportView() {
            var dfd = $q.defer();

            dfd.promise
                .then(function () {
                    $scope.hasSaveRepoerView = true;
                    $scope.formProcessing = true;

                    if (!$scope.isAdmin()) {
                        delete $scope.reportView.publisher;
                    }

                    // refactor reportView data
                    var reportView = angular.copy($scope.reportView);
                    reportView = _removeDataSetNameFromParam(reportView);

                    var save = !$scope.isNew ? UnifiedReportViewManager.one(reportView.id).patch(reportView) : UnifiedReportViewManager.post(reportView);

                    save.then(function (data) {
                        if ($scope.isNew) {
                            $scope.reportView.id = data.id;
                            $scope.reportView.largeReport = data.largeReport;
                            $scope.reportViewForEdit.id = data.id;
                        }

                        if(data.largeReport) {
                            AlertService.addFlash({
                                type: 'warning',
                                message: 'Please wait a few minutes for the changes to take effect.'
                            });

                            return historyStorage.getLocationPath(HISTORY_TYPE_PATH.unifiedReportView, '^.listReportView');
                        }

                        $scope.formProcessing = false;

                        AlertService.replaceAlerts({
                            type: 'success',
                            message: $scope.isNew ? 'The report view has been created' : 'The report view has been updated'
                        });
                    })
                    .catch(function () {
                        $scope.hasSaveRepoerView = false;
                    });
                });

            if (!$scope.reportView.name) {
                var modalInstance = $modal.open({
                    templateUrl: 'unifiedReport/report/inputName.tpl.html',
                    resolve: {
                        reportView: function () {
                            return $scope.reportView
                        }
                    },
                    controller: function ($scope, reportView) {
                        $scope.reportView = reportView;
                    }
                });

                modalInstance.result.then(function () {
                    dfd.resolve();
                }).catch(function () {
                    $scope.reportView.name = null;
                });
            } else {
                // if it is not a pause, proceed without a modal
                dfd.resolve();
            }

            function _removeDataSetNameFromParam(reportView) {
                if (!reportView || !angular.isArray(reportView.reportViewDataSets)) {
                    return reportView;
                }

                angular.forEach(reportView.reportViewDataSets, function (reportViewDataSet) {
                    delete reportViewDataSet.dataSetName;
                });

                return reportView;
            }
        }

        function showPagination() {
            return angular.isArray($scope.reportGroup.reports) && $scope.tableConfig.totalItems > $scope.tableConfig.itemsPerPage;
        }

        function _toJsonReportView(reportView, itemPerPage) {
            var params = angular.copy(reportView);

            angular.forEach(params.reportViewDataSets, function (item) {
                item.dataSet = angular.isObject(item.dataSet) ? item.dataSet.id : item.dataSet;

                delete item.id;
                delete item.tempDimensions;
                delete item.tempMetrics;
                delete item.fields;
                delete item.allFields;
                delete item.dimensionsMetrics;
                delete item.selectAllDimensionsMetrics;
                delete item.dataSetName;
            });

            params.masterReportView = angular.isObject(params.masterReportView) ? params.masterReportView.id : params.masterReportView;
            params.startDate = DateFormatter.getFormattedDate($scope.selected.date.startDate);
            params.endDate = DateFormatter.getFormattedDate($scope.selected.date.endDate);

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

            if(newDimensions.length > 0 || newMetrics.length > 0) {
                angular.forEach(angular.copy($scope.search), function (value, key) {
                    if(newDimensions.indexOf(key) == -1 && newMetrics.indexOf(key) == -1) {
                        delete $scope.search[key]
                    }
                });
            }

            angular.forEach(angular.copy($scope.search), function (value, key) {
                if(!value || value == '') {
                    delete $scope.search[key]
                }
            });

            params = angular.extend(params, {
                searches: $scope.search,
                limit: !!itemPerPage ? itemPerPage.key : $scope.tableConfig.itemsPerPage,
                page: $scope.availableOptions.currentPage,
                orderBy: (!!$scope.reverse ? 'desc': 'asc'),
                sortField: $scope.sortBy,
                userDefineDimensions: newDimensions,
                userDefineMetrics: newMetrics
            });

            return params;
        }

        function _updateMissingDate(daterange) {
            $scope.missingDate = [];
            angular.forEach(dataSources, function (dataSource) {
                if(!!dataSource.missingDate && dataSource.missingDate.length > 0) {
                    angular.forEach(dataSource.missingDate, function (date) {
                        if(hasFilterDate() && date) {
                            var startDate = new Date(daterange.startDate);
                            var endDate = new Date(daterange.endDate);
                            var currentDate = new Date(date);

                            if(currentDate >= startDate && currentDate <= endDate) {
                                $scope.missingDate.push({date: date, dataSource: dataSource});
                            }
                        } else {
                            $scope.missingDate.push({date: date, dataSource: dataSource});
                        }
                    })
                }
            });

        }

        function _updateColumnPositions() {
            $scope.titleColumnsForSelect = !!$scope.titleColumns && !!$scope.titleColumnsForSelect && Object.keys($scope.titleColumnsForSelect).length > 0 ? $scope.titleColumnsForSelect : $scope.reportGroup.columns;
            $scope.titleColumns = angular.extend({}, $scope.titleColumns, $scope.reportGroup.columns);
            $scope.columnReportDetailForExportExcel = [];
            $scope.titleReportDetailForExportExcel = [];

            $scope.columnPositions = !!$scope.columnPositions && $scope.columnPositions.length > 0 ? $scope.columnPositions : [];

            var fieldTypes = angular.copy($scope.reportView.fieldTypes);

            if (true) {
                var totalDimensions = [];
                var totalMetrics = [];

                angular.forEach($scope.reportView.reportViewDataSets, function (reportView) {
                    totalDimensions = totalDimensions.concat(reportView.dimensions);
                    totalMetrics = totalMetrics.concat(reportView.metrics)
                });

                var data = allDimensionsMetrics.dataSets;
                angular.forEach(data, function (item) {
                    totalDimensions = totalDimensions.concat(_.keys(item.dimensions));
                    totalMetrics = totalMetrics.concat(_.keys(item.metrics))
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

                    for(var x in $scope.reportView.joinBy) {
                        var join = $scope.reportView.joinBy[x];
                        if(!_joinIsMetrics(join, totalMetrics)) {
                            if(_.findIndex($scope.dimensions, function (dimension) { return dimension.name == join.outputField }) == -1 && !!join.outputField) {
                                dimensions.push(join.outputField);
                                $scope.dimensions.push({name: join.outputField , label: $scope.titleColumnsForSelect[join.outputField] || join.outputField, ticked: join.isVisible});
                            }
                        } else {
                            if(_.findIndex($scope.metrics, function (metric) { return metric.name == join.outputField }) == -1 && !!join.outputField) {
                                metrics.push(join.outputField);
                                $scope.metrics.push({name: join.outputField , label: $scope.titleColumnsForSelect[join.outputField] || join.outputField, ticked: join.isVisible});
                            }
                        }
                    }

                    if(hasJoin == -1) {
                        if(totalDimensions.indexOf(key) > -1) {
                            if(dimensions.indexOf(col) == -1) {
                                dimensions.push(col);

                                if(_.findIndex($scope.dimensions, function (dimension) { return dimension.name == col }) == -1) {
                                    $scope.dimensions.push({name: col, label: $scope.titleColumnsForSelect[col], ticked: true});
                                }
                            }
                        } else {
                            if(metrics.indexOf(col) == -1) {
                                metrics.push(col);

                                if(_.findIndex($scope.metrics, function (dimension) { return dimension.name == col }) == -1) {
                                    $scope.metrics.push({name: col, label: $scope.titleColumnsForSelect[col], ticked: true});
                                }
                            }
                        }
                    }
                });
                //forEach Datasets, update $scope.dimensions

                angular.forEach(data, function (item) {
                    if(true) {
                        angular.forEach(item.dimensions, function (type, dimension) {
                            var col = dimension + '_' + item.id;

                            for(var x in $scope.reportView.joinBy) {
                                var join = $scope.reportView.joinBy[x];
                                for(var y in join.joinFields) {
                                    var joinField = join.joinFields[y];

                                    if((joinField.field + '_' + joinField.dataSet) == col) {
                                        return
                                    }
                                }
                            }

                            if(dimensions.indexOf(col) == -1 && !!col) {
                                fieldTypes[col] = type;

                                if(_.findIndex($scope.dimensions, function (dimension) { return dimension.name == col }) == -1) {
                                    $scope.dimensions.push({name: col, label: allDimensionsMetrics.columns[col] || allDimensionsMetrics.columns[dimension], ticked: isTicket(dimension)});
                                }
                            }
                        });
                    }

                    for(var x in $scope.reportView.joinBy) {
                        var join = $scope.reportView.joinBy[x];
                        if(!_joinIsMetrics(join, totalMetrics)) {
                            if(_.findIndex($scope.dimensions, function (dimension) { return dimension.name == join.outputField }) == -1 && !!join.outputField) {
                                $scope.dimensions.push({name: join.outputField , label: join.outputField, ticked: join.isVisible && $scope.reports.length == 0});
                            }
                        } else {
                            if(_.findIndex($scope.metrics, function (metric) { return metric.name == join.outputField }) == -1 && !!join.outputField) {
                                $scope.metrics.push({name: join.outputField , label: join.outputField, ticked: join.isVisible && $scope.reports.length == 0});
                            }
                        }
                    }

                    angular.forEach(item.metrics, function (type, metric) {
                        var col = metric + '_' + item.id;

                        for(var x in $scope.reportView.joinBy) {
                            var join = $scope.reportView.joinBy[x];
                            for(var y in join.joinFields) {
                                var joinField = join.joinFields[y];

                                if((joinField.field + '_' + joinField.dataSet) == col) {
                                    return
                                }
                            }
                        }

                        if(metrics.indexOf(col) == -1 && !!col) {
                            fieldTypes[col] = type;

                            if(_.findIndex($scope.metrics, function (metric) { return metric.name == col }) == -1) {
                                $scope.metrics.push({name: col, label: allDimensionsMetrics.columns[col] || allDimensionsMetrics.columns[metric], ticked: _.keys($scope.reports[0]).indexOf(col) > -1 || isTicket(metric)});
                            }
                        }
                    })
                });

                // add columnPositions
                angular.forEach($scope.dimensions, function (dm) {
                    if(dm.ticked && dimensions.indexOf(dm.name) == -1)  {
                        dimensions.push(dm.name);
                    }
                });

                angular.forEach($scope.metrics, function (dm) {
                    if(dm.ticked && metrics.indexOf(dm.name) == -1)  {
                        metrics.push(dm.name);
                    }
                });

                dimensions = _.uniq(dimensions);
                metrics = _.uniq(metrics);

                dimensions = _.sortBy(dimensions);
                dimensions = _.sortBy(dimensions, function (dimension) {
                    var key = null;

                    if(dimension.lastIndexOf('_') > -1) {
                        key = dimension.slice(0, dimension.lastIndexOf('_'));
                    } else {
                        key = dimension;
                    }

                    return key
                });

                metrics = _.sortBy(metrics);
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
                    if(fieldTypes[dimension] == 'date' || fieldTypes[dimension] == 'datetime') {
                        dimensions.splice(dimensions.indexOf(dimension), 1);
                        dimensions.unshift(dimension);
                    }
                });

                angular.forEach(angular.copy(metrics).reverse(), function (metric) {
                    if(fieldTypes[metric] == 'date' || fieldTypes[metric] == 'datetime') {
                        metrics.splice(metrics.indexOf(metric), 1);
                        metrics.unshift(metric);
                    }
                });

                $scope.columnPositions = $scope.reports.length > 0 ? dimensions.concat(metrics) : $scope.columnPositions;
            }

            if (!!reportView.formats.length && $scope.reports.length > 0) {
                angular.forEach(reportView.formats, function (format) {
                    if (format.type == 'columnPosition' && format.fields.length > 0) {
                        angular.forEach(format.fields, function (field) {
                            var index = $scope.columnPositions.indexOf(field);

                            if(index > -1) {
                                $scope.columnPositions.splice(index, 1)
                            }
                        });

                        $scope.columnPositions = format.fields.concat($scope.columnPositions);

                        angular.forEach(angular.copy($scope.columnPositions), function (field) {
                            if(_.keys($scope.reports[0]).indexOf(field) == -1) {
                                var index = $scope.columnPositions.indexOf(field);
                                $scope.columnPositions.splice(index, 1);
                            }
                        });

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
                $scope.columnReportDetailForExportExcel = $scope.columnPositions;

                angular.forEach($scope.columnPositions, function (key) {
                    var title = !!$scope.titleColumns[key] ? $scope.titleColumns[key] : key;
                    $scope.titleReportDetailForExportExcel.push(title)
                })
            }

            if($scope.reports.length == 0) {
                angular.forEach(reportView.transforms, function (transform) {
                    if (transform.type == 'addField' || transform.type == 'addConditionValue' || transform.type == 'addCalculatedField' || transform.type == 'comparisonPercent') {
                        angular.forEach(transform.fields, function (field) {
                            if (!!field.field) {
                                var index = _.findIndex($scope.metrics, {name: field.field});
                                if(index == -1) {
                                    $scope.metrics.unshift({name: field.field, label: field.field, ticked: $scope.reports.length == 0});
                                }
                            }
                        })
                    }
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

            // // add columnPositions
            // angular.forEach($scope.dimensions, function (dm) {
            //     if(dm.ticked && $scope.columnPositions.indexOf(dm.name) == -1)  {
            //         $scope.columnPositions.push(dm.name);
            //     }
            // });
            //
            // angular.forEach($scope.dimensions.concat($scope.metrics), function (dm) {
            //     if(dm.ticked && $scope.columnPositions.indexOf(dm.name) == -1)  {
            //         $scope.columnPositions.push(dm.name);
            //     }
            // });

            if($scope.reports.length > 0) {
                angular.forEach(angular.copy($scope.columnPositions), function (column) {
                    var index = _.keys($scope.reports[0]).indexOf(column);

                    if(index == -1) {
                        $scope.columnPositions.splice($scope.columnPositions.indexOf(column), 1)
                    }
                })
            }

            $scope.fieldsShow = $scope.fieldsShow || {dimensions: [], metrics: []};
        }

        /**
         *
         * @param metricName example: requests_1
         * @returns {'metricName': 'requests', 'datasetId': '1'}
         */
        function getDatasetIdFromMetricName(metricName) {
            if(!metricName) return null;
            var _index = metricName.lastIndexOf("_");
            return {
                metricName: metricName.substring(0, _index),
                datasetId: metricName.substring(_index + 1, metricName.length)
            }
        }
        /**
         * Fix bug: some metrics ticked wrong by default
         * https://trello.com/c/rmXhwtVO/2637-ur-usability-fixes-small
         */
        function _unTickWrongMetrics(correctFields) {
            _.each($scope.dimensions, function (dimension) {
                var fieldName = dimension.name;

                if(!_.contains(correctFields, fieldName)) {
                    dimension.ticked = false;
                }
            });

            _.each($scope.metrics, function (metric) {
                var fieldName = metric.name;

                if(!_.contains(correctFields, fieldName)) {
                    metric.ticked = false;
                }
            });
        }

        function isTicket(col) {
            var totalDimensionsMetrics = [];
            angular.forEach($scope.reportView.reportViewDataSets, function (reportView) {
                totalDimensionsMetrics = totalDimensionsMetrics.concat(reportView.dimensions);
                totalDimensionsMetrics = totalDimensionsMetrics.concat(reportView.metrics)
            });

            return totalDimensionsMetrics.indexOf(col) > -1
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

        $scope.$on('$locationChangeSuccess', function() {
            historyStorage.setParamsHistoryCurrent(HISTORY_TYPE_PATH.unifiedReportDetail)
        });
    }
})();