(function () {
    'use strict';

    angular.module('tagcade.unifiedReport.report')
        .controller('UnifiedReportDetail', UnifiedReportDetail);

    function UnifiedReportDetail($scope, $stateParams, _, SortReportByColumnType ,reportView, $translate, reportGroup, AlertService, unifiedReportFormatReport, UnifiedReportViewManager) {
        $scope.reportView = reportView;
        $scope.reportGroup = reportGroup;
        $scope.hasResult = reportGroup !== false;

        $scope.reports = reportGroup.reports || [];
        $scope.types = reportGroup.types;
        $scope.isNew = !$scope.reportView.id;
        $scope.hasSaveRepoerView = !!$stateParams.saveReportView;
        $scope.formProcessing = false;


        if (!$scope.hasResult) {
            AlertService.replaceAlerts({
                type: 'warning',
                message: $translate.instant('REPORT.REPORTS_EMPTY')
            });
        }

        // user tempReports to orderBy and reports to view
        $scope.tempReports = unifiedReportFormatReport.formatReports($scope.reports, $scope.reportView);


      //  $scope.titleColumns = reportGroup.columns;
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
            dataSets: angular.toJson(reportView.dataSets),
            reportViews: angular.toJson(reportView.reportViews),
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

        if (!$scope.reports || $scope.reports.length == 0) {
            AlertService.replaceAlerts({
                type: 'warning',
                message: $translate.instant('REPORT.REPORTS_EMPTY')
            });
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

        $scope.showPagination = showPagination;
        $scope.saveReportView = saveReportView;
        $scope.getExportExcelFileName = getExportExcelFileName;

        $scope.sort = sort;
        $scope.isShow = isShow;
        $scope.isEmptyObject = isEmptyObject;
        $scope.isNullValue = isNullValue;

        function isNullValue(report, column) {
            return _.isNull(report[column]);
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