(function() {
    'use strict';

    angular.module('tagcade.reports.unified')
        .controller('UnifiedReport', UnifiedReport)
    ;

    function UnifiedReport($scope, _, $state, $stateParams, $translate, reportGroup, AlertService, unifiedReport, ReportParams, dateUtil, REPORT_TYPE_KEY, EVENT_ACTION_SORTABLE) {
        $scope.hasResult = angular.isObject(reportGroup) ? reportGroup.reports.length > 0 :reportGroup !== false;

        reportGroup = reportGroup || {};

        $scope.reportGroup = reportGroup;
        $scope.reports = $scope.reportGroup.reports || [];
        $scope.reportTypeKey = REPORT_TYPE_KEY;

        $scope.tableConfig = {
            maxPages: 10,
            itemsPerPage: 10
        };

        if (!$scope.hasResult) {
            AlertService.replaceAlerts({
                type: 'warning',
                message: $translate.instant('REPORT.REPORTS_EMPTY')
            });
        }

        // default page = 1
        $scope.currentPage = $stateParams.page || 1;
        $scope.paginationConfig = {
            itemsPerPage: 10,
            totalItems: reportGroup.totalRecord,
            maxSize: 10
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
            var params = unifiedReport.getInitialParams();
            params.page = 1;

            unifiedReport.getPulsePoint(params, {searchField: $scope.selectData.searchBoxFields, searchKey: $scope.selectData.query})
                .then(function(reportGroup) {
                    $scope.reports = reportGroup.reports || [];
                    $scope.paginationConfig.totalItems = reportGroup.totalRecord;
                });
        }

        function changePage(page) {
            var params = unifiedReport.getInitialParams();
            params.page = page;

            unifiedReport.getPulsePoint(params, {searchField: $scope.selectData.searchBoxFields, searchKey: $scope.selectData.query})
                .then(function(reportGroup) {
                    $scope.reports = reportGroup.reports || [];
                });
        }

        function showPagination() {
            return angular.isArray($scope.reports) && $scope.paginationConfig.totalItems > $scope.tableConfig.itemsPerPage;
        }

        $scope.$on(EVENT_ACTION_SORTABLE, function(event, args) {
            var params = unifiedReport.getInitialParams();

            unifiedReport.getPulsePoint(params, args)
                .then(function(reportGroup) {
                    $scope.reports = reportGroup.reports || [];
                });
        });
    }
})();