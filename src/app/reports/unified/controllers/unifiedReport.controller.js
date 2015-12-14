(function() {
    'use strict';

    angular.module('tagcade.reports.unified')
        .controller('UnifiedReport', UnifiedReport)
    ;

    function UnifiedReport($scope, _, $state, $translate, reportGroup, AlertService, unifiedReport, ReportParams, dateUtil, REPORT_TYPE_KEY, EVENT_ACTION_SORTABLE) {
        $scope.hasResult = angular.isObject(reportGroup) ? reportGroup.reports.length > 0 :reportGroup !== false;

        reportGroup = reportGroup || {};

        $scope.reportGroup = reportGroup;
        $scope.reports = $scope.reportGroup.reports || [];
        $scope.reportTypeKey = REPORT_TYPE_KEY;

        if (!$scope.hasResult) {
            AlertService.replaceAlerts({
                type: 'warning',
                message: $translate.instant('REPORT.REPORTS_EMPTY')
            });
        }

        $scope.tableConfig = {
            maxPages: 10,
            totalItems: reportGroup.totalRecord,
            itemsPerPage: 10
        };

        $scope.availableOptions = {
            itemsPerPage: [10, 20, 30, 50],
            currentPage: 1,
            pageSize: 10
        };
        $scope.selectData = {
            query: null,
            searchBoxFields: null
        };

        $scope.dataSelect = [];
        $scope.modelSelect = [];
        $scope.settingsSelect = {
            showUncheckAll: false,
            showCheckAll: false,
            showButtonSubmit: false,
            buttonClasses: 'btn btn-primary',
            buttonSettingDisable: false,
            displayProp: 'label',
            idProp: 'key',
            dynamicTitle: false
        };
        $scope.translationTexts = {
            buttonDefaultText: 'Columns To Search'
        };

        $scope.eventSettings = {
            onItemSelect: onItemDropDownMultiSelect,
            onItemDeselect: onItemDropDownMultiSelect
        };

        function onItemDropDownMultiSelect() {
            _setSearchBoxFields($scope.modelSelect)
        }

        /**
         * dataSelect is fields allow search
         * modelSelect is fields select to search
         *
         * @param dataSelect
         * @param modelSelect
         */
        $scope.setDataSelect = function(dataSelect, modelSelect) {
            $scope.dataSelect = dataSelect;
            $scope.modelSelect = modelSelect;

            _setSearchBoxFields(modelSelect)
        };

        function _setSearchBoxFields(modelSelect) {
            var searchBoxFields = [];

            for(var idx in modelSelect) {
                searchBoxFields.push(modelSelect[idx].id)
            }

            $scope.selectData.searchBoxFields = searchBoxFields.toString();
        }

        $scope.showPagination = showPagination;
        $scope.drillDownReport = drillDownReport;
        $scope.searchData = searchData;
        $scope.changePage = changePage;
        $scope.changePageSize = changePageSize;

        function drillDownReport(state, drillParams) {
            if (!angular.isString(state)) {
                return;
            }

            state = $state.get(state, $state.$current);

            if (!state) {
                console.log('relative report state does not exist');
                return;
            }

            var params = ReportParams.getStateParams(unifiedReport.getInitialParams());

            if(!!drillParams) {
                if(!!drillParams.drillByDate) {
                    drillParams.drillByDate = dateUtil.getFormattedDate(drillParams.drillByDate);
                }

                angular.extend(params, drillParams)
            }

            $state.transitionTo(state, params)
                .catch(function() {
                    console.log(params);

                    AlertService.replaceAlerts({
                        type: 'error',
                        message: $translate.instant('REPORT.REPORT_FAIL')
                    });
                })
            ;
        }

        function searchData() {
            if(!$scope.selectData.searchBoxFields) {
                return;
            }

            var query = {page: 1, searchField: $scope.selectData.searchBoxFields || null, searchKey: $scope.selectData.query || null};
            _getByQuery(query);
        }

        function changePage(page) {
            var query = {page: page, searchField: $scope.selectData.searchBoxFields || null, searchKey: $scope.selectData.query || null};
            _getByQuery(query);
        }

        function changePageSize(size) {
            var query = {page: 1, size: size, searchField: $scope.selectData.searchBoxFields || null, searchKey: $scope.selectData.query || null};
            _getByQuery(query);
        }

        function showPagination() {
            return angular.isArray($scope.reports) && $scope.tableConfig.totalItems > $scope.tableConfig.itemsPerPage;
        }

        $scope.$on(EVENT_ACTION_SORTABLE, function(event, args) {
            _getByQuery(args);
        });

        function _getByQuery(query) {
            var params = unifiedReport.getInitialParams();
            angular.extend(params, query);

            unifiedReport.getPulsePoint(params)
                .then(function(reportGroup) {
                    $scope.reports = reportGroup.reports || [];
                    $scope.tableConfig.totalItems = reportGroup.totalRecord;

                    $scope.tableConfig.itemsPerPage = query.size || $scope.availableOptions.pageSize;
                    $scope.availableOptions.currentPage = query.page || $scope.availableOptions.currentPage;
                });
        }
    }
})();