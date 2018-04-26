(function () {
    'use strict';

    angular.module('tagcade.unifiedReport.autoOptimization')
        .controller('AutoOptimizationList', AutoOptimizationList);

    function AutoOptimizationList($scope, $stateParams, $modal, AlertService, $translate,
                                  autoList, AutoOptimizationManager, AtSortableService,
                                  historyStorage, HISTORY_TYPE_PATH, EVENT_ACTION_SORTABLE, OptimizationUtil) {
        $scope.columnName = {};
        $scope.tableConfig = {
            itemsPerPage: 10,
            maxPages: 10,
            totalItems: Number(autoList.totalRecord)
        };
        $scope.autoList = autoList;
        $scope.product = "";
        $scope.status = "";

        $scope.availableOptions = {
            currentPage: $stateParams.page || 1,
            pageSize: 10
        };
        var params = $stateParams;
        var getDataSet;

        $scope.hasData = function () {
            return !!autoList.records.length;
        };

        if (!$scope.hasData()) {
            AlertService.replaceAlerts({
                type: 'warning',
                message: $translate.instant('AUTO_OPTIMIZE_INTEGRATION_MODULE.EMPTY_OPTIMIZATION_RULE')
            });
        }

        $scope.showPagination = showPagination;
        $scope.confirmDeletion = confirmDeletion;
        $scope.searchData = searchData;
        $scope.changePage = changePage;
        $scope.initEditData = initEditData;
        $scope.addLabelForOptimizeFields = addLabelForOptimizeFields;
        $scope.addLabelForSegmentFields = addLabelForSegmentFields;

        $scope.initEditData();

        function buildFieldsName() {

            angular.forEach($scope.autoList.records, function (optimizeField) {
                var reportView = optimizeField.reportView;
                $scope.columnName[optimizeField.id] = OptimizationUtil.buildFieldsName(reportView);
            });

        }

        /**
         * build data to display segments on form
         */
        function addLabelForSegmentFields() {
            angular.forEach($scope.autoList.records, function (optimizeField) {
                optimizeField.segmentFormData = [];
                var reportView = optimizeField.reportView;
                angular.forEach(optimizeField.segmentFields, function (segmentField) {
                    var label = $scope.columnName[optimizeField.id][segmentField];
                    var newLabel = '';
                    if (OptimizationUtil.isJoinField(segmentField, reportView) || !label) {
                        newLabel = segmentField;
                    } else {
                        newLabel = label;
                    }
                    var json = {
                        key: segmentField,
                        value: segmentField,
                        label: newLabel
                    };
                    optimizeField.segmentFormData.push(json)
                });
            });
        }

        /**
         * build data to display optimize fields on form
         */
        function addLabelForOptimizeFields() {
            angular.forEach($scope.autoList.records, function (optimizeField) {
                var reportView = optimizeField.reportView;
                angular.forEach(optimizeField.optimizeFields, function (optField) {
                    var label = $scope.columnName[optimizeField.id][optField.field];
                    if (OptimizationUtil.isJoinField(optField.field, reportView) || !label) {
                        optField['label'] = optField.field;
                    } else {
                        optField['label'] = label;
                    }

                });
            });
        }

        /**
         * init form data
         */
        function initEditData() {
            buildFieldsName();
            $scope.addLabelForOptimizeFields();
            $scope.addLabelForSegmentFields();
        }

        function confirmDeletion(auto, index) {
            var modalInstance = $modal.open({
                templateUrl: 'unifiedReport/autoOptimization/confirmDeletion.tpl.html'
            });

            modalInstance.result.then(function () {
                return AutoOptimizationManager.one(auto.id).remove()
                    .then(
                        function () {
                            _getDataSet(params);
                            AlertService.replaceAlerts({
                                type: 'success',
                                message: $translate.instant('AUTO_OPTIMIZE_INTEGRATION_MODULE.DELETE_SUCCESS_RULE')
                            });
                        },
                        function (response) {
                            if (!!response && !!response.data && !!response.data.message) {
                                AlertService.replaceAlerts({
                                    type: 'danger',
                                    message: response.data.message
                                });
                            }
                        }
                    );
            });
        }

        function showPagination() {
            return $scope.autoList.totalRecord > $scope.tableConfig.itemsPerPage;
        }

        $scope.$on('$locationChangeSuccess', function () {
            historyStorage.setParamsHistoryCurrent(HISTORY_TYPE_PATH.autoOptimization)
        });

        function searchData() {
            var query = {searchKey: $scope.selectData.query || ''};
            params = angular.extend(params, query);
            _getDataSet(params, 500);
        }

        $scope.$on(EVENT_ACTION_SORTABLE, function (event, query) {
            params = angular.extend(params, query);
            _getDataSet(params);
        });

        function changePage(currentPage) {
            params = angular.extend(params, {page: currentPage});
            _getDataSet(params);
        }

        function _getDataSet(query, ms) {
            clearTimeout(getDataSet);
            getDataSet = setTimeout(function () {
                params = query;
                return AutoOptimizationManager.one().get(query)
                    .then(function (optimizeRules) {
                        AtSortableService.insertParamForUrl(query);
                        $scope.autoList = optimizeRules;
                        $scope.tableConfig.totalItems = Number(optimizeRules.totalRecord);
                        $scope.availableOptions.currentPage = Number(query.page);
                        $scope.initEditData();
                    });
            }, ms || 0);
        }

    }
})();