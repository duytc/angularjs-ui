(function () {
    'use strict';

    angular.module('tagcade.unifiedReport.report')
        .controller('UnifiedReportDetail', UnifiedReportDetail);

    function UnifiedReportDetail($scope, $stateParams, _, SortReportByColumnType, reportView, $translate, reportGroup, getDateReportView, AlertService, unifiedReportFormatReport, UnifiedReportViewManager, UserStateHelper, DateFormatter) {
        // reset css for id app
        var app = angular.element('#app');
        app.css({position: 'inherit'});

        $scope.reportView = reportView;
        $scope.reportGroup = reportGroup;
        $scope.hasResult = !angular.isNumber(reportGroup.status);

        $scope.reports = reportGroup.reports || [];
        $scope.types = reportGroup.types;
        $scope.isNew = !$scope.reportView.id;
        $scope.hasSaveRepoerView = !!$stateParams.saveReportView;
        $scope.formProcessing = false;

        // user tempReports to orderBy and reports to view
        $scope.tempReports = unifiedReportFormatReport.formatReports($scope.reports, $scope.reportView);

        // $scope.titleColumns = reportGroup.columns;
        $scope.titleColumns = SortReportByColumnType.changeColumnName(reportGroup.columns);
        $scope.columnReportDetailForExportExcel = [];
        $scope.titleReportDetailForExportExcel = [];
        $scope.hasSort = false;

        $scope.columnPositions = [];
        if (!!reportView.formats.length) {
            angular.forEach(reportView.formats, function (format) {
                if (format.type == 'columnPosition') {
                    $scope.columnPositions = angular.copy(format.fields);
                    if($scope.columnPositions.indexOf('report_view_alias') == -1 && reportView.multiView) {
                        $scope.columnPositions.unshift('report_view_alias');
                    }
                }
            });

            // push remain field to columnPositions
            var allFields,
                remainFields;

            allFields = _.keys($scope.reports[0]);
            remainFields = _.difference(allFields, $scope.columnPositions);

            if (remainFields.length > 0) {
                angular.forEach(remainFields, function (remainField) {
                    $scope.columnPositions.push(remainField);
                })
            }

            var indexReportViewAliasFormat = $scope.columnPositions.indexOf('report_view_alias');
            if(indexReportViewAliasFormat > -1 && reportView.multiView) {
                $scope.columnPositions.splice(indexReportViewAliasFormat, 1);
                $scope.columnPositions.unshift('report_view_alias');
            }
        }

        if (!$scope.columnPositions.length && $scope.reports.length > 0) {
            $scope.columnPositions = _.keys($scope.reports[0]);
            var indexReportViewAlias = $scope.columnPositions.indexOf('report_view_alias');
            if(indexReportViewAlias > -1 && reportView.multiView) {
                $scope.columnPositions.splice(indexReportViewAlias, 1);
                $scope.columnPositions.unshift('report_view_alias');
            }
        }

        if (angular.isArray($scope.reports) && $scope.reports.length > 0) {
            $scope.columnReportDetailForExportExcel = $scope.columnPositions;

            angular.forEach($scope.columnPositions, function (key) {
                var title = !!$scope.titleColumns[key] ? $scope.titleColumns[key] : key;
                $scope.titleReportDetailForExportExcel.push(title)
            })
        }

        $scope.reportViewForEdit = {
            reportViewDataSets: angular.toJson(reportView.reportViewDataSets),
            reportViewMultiViews: angular.toJson(reportView.reportViewMultiViews),
            filter: angular.toJson(reportView.filter),
            transforms: angular.toJson(reportView.transforms),
            showInTotal: angular.toJson(reportView.showInTotal),
            formats: angular.toJson(reportView.formats),
            weightedCalculations: angular.toJson(reportView.weightedCalculations),
            joinBy: angular.toJson(reportView.joinBy),
            name: reportView.name,
            alias: reportView.alias,
            reportView: reportView.id,
            multiView: reportView.multiView,
            subReportsIncluded: reportView.subReportsIncluded,
            publisher: angular.isObject(reportView.publisher) ? reportView.publisher.id : reportView.publisher
        };

        if(!$scope.hasResult) {
            if(reportGroup.status == 400) {
                AlertService.replaceAlerts({
                    type: 'error',
                    message: reportGroup.message
                });
            } else if (reportGroup.status == 500){
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
        }

        $scope.tableConfig = {
            maxPages: 10,
            itemsPerPage: 10
        };

        $scope.itemsPerPage = [
            {label: '10', key: '10'},
            {label: '20', key: '20'},
            {label: '30', key: '30'},
            {label: '40', key: '40'},
            {label: '50', key: '50'}
        ];

        $scope.itemsPerPage.selected = $scope.tableConfig.itemsPerPage;

        $scope.date = {
            startDate: $stateParams.startDate || getDateReportView.getMinStartDateInFilterReportView(reportView),
            endDate : $stateParams.endDate || getDateReportView.getMaxEndDateInFilterReportView(reportView)
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

        $scope.showPagination = showPagination;
        $scope.saveReportView = saveReportView;
        $scope.getExportExcelFileName = getExportExcelFileName;

        $scope.sort = sort;
        $scope.isShow = isShow;
        $scope.isEmptyObject = isEmptyObject;
        $scope.isNullValue = isNullValue;
        
        $scope.generateReport = generateReport;
        $scope.hasFilterDate = hasFilterDate;
        $scope.hideDaterange = hideDaterange;
        
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

        function generateReport(date) {
            var reportViewClone = angular.copy(reportView);

            var params = {
                reportView: $stateParams.reportView,
                reportViewDataSets: angular.toJson(reportViewClone.reportViewDataSets),
                fieldTypes: angular.toJson(reportViewClone.fieldTypes),
                reportViewMultiViews: angular.toJson(reportViewClone.reportViewMultiViews),
                transforms: angular.toJson(reportViewClone.transforms),
                showInTotal: angular.toJson(reportViewClone.showInTotal),
                weightedCalculations: angular.toJson(reportViewClone.weightedCalculations),
                formats: angular.toJson(reportViewClone.formats),
                joinBy: angular.toJson(reportViewClone.joinBy) || null,
                name: reportViewClone.name,
                alias: reportViewClone.alias,
                multiView: !!reportViewClone.multiView || reportViewClone.multiView == 'true',
                subReportsIncluded: !!reportViewClone.subReportsIncluded || reportViewClone.subReportsIncluded == 'true'
            };

            params.startDate = DateFormatter.getFormattedDate(date.startDate);
            params.endDate = DateFormatter.getFormattedDate(date.endDate);

            UserStateHelper.transitionRelativeToBaseState('unifiedReport.report.detail', params);
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

            $scope.hasSort = true;

        }

        function isShow(sortColumn) {
            return ($scope.sortBy == '\u0022' + sortColumn + '\u0022')
        }

        function getExportExcelFileName() {
            return !!$scope.reportView.name ? $scope.reportView.name : 'report-detail';
        }

        function saveReportView() {
            $scope.hasSaveRepoerView = true;
            $scope.formProcessing = true;

            if (!$scope.isAdmin()) {
                delete $scope.reportView.publisher;
            }

            var save = !$scope.isNew ? UnifiedReportViewManager.one($scope.reportView.id).patch($scope.reportView) : UnifiedReportViewManager.post($scope.reportView);

            save.then(function (data) {
                if ($scope.isNew) {
                    $scope.reportView.id = data.id;
                    $scope.reportViewForEdit.reportView = data.id;
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
        }

        function showPagination() {
            return angular.isArray($scope.reports) && $scope.reports.length > $scope.tableConfig.itemsPerPage;
        }
    }
})();