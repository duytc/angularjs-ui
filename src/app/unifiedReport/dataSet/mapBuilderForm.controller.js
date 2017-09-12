(function() {
    'use strict';

    angular.module('tagcade.unifiedReport.dataSet')
        .controller('mapBuilderForm', mapBuilderForm);

    function mapBuilderForm($scope, $modal, $stateParams, AlertService, dataRows, dataSet, mapBuilderDataSet, UnifiedReportDataSetManager, HISTORY_TYPE_PATH, historyStorage) {
        $scope.dataRows = dataRows;
        $scope.rows = dataRows.records;
        $scope.dataSet = dataSet;

        var columns = !!$scope.rows[0] ? Object.keys($scope.rows[0]) : [];
        $scope.columns = mapBuilderDataSet.removeValues(columns);
        $scope.fields = [];

        angular.forEach(columns, function (column) {
            $scope.fields.push({
                key: column,
                label: dataRows.columns[column],
                type: dataRows.fieldTypes[column]
            })
        });

        $scope.tableConfig = {
            itemsPerPage: $stateParams.limit || 10,
            maxPages: 10,
            totalItems: dataRows.totalRecord
        };

        $scope.availableOptions = {
            currentPage: $stateParams.page || 1,
            pageSize: 10
        };

        var params = $stateParams;

        $scope.itemsPerPage = [
            {label: '10', key: '10'},
            {label: '20', key: '20'},
            {label: '30', key: '30'},
            {label: '40', key: '40'},
            {label: '50', key: '50'}
        ];

        $scope.selectedData = {
            filters: [],

            showAll: true,
            showIgnore: false,
            showUnmapped: false,
            showMapped: false
        };

        $scope.backToDataSetList = backToDataSetList;
        $scope.isNullValue = isNullValue;
        $scope.showPagination = showPagination;
        $scope.selectItemPerPages = selectItemPerPages;
        $scope.changePage = changePage;
        $scope.sort = sort;
        $scope.isShow = isShow;
        $scope.actionRemoveAssociate = actionRemoveAssociate;
        $scope.actionAssociate = actionAssociate;
        $scope.actionUndoIgnore = actionUndoIgnore;
        $scope.actionIgnore = actionIgnore;
        $scope.clickFilter = clickFilter;

        $scope.getDataFilter = getDataFilter;

        function clickFilter(selectedData, type) {
            angular.forEach(selectedData, function (value, key) {
                if(key == 'showAll' || key == 'showIgnore' || key == 'showUnmapped' || key == 'showMapped') {
                    selectedData[key] = type == key
                }
            });

            // if(type =='showAll') {
            //     $scope.selectedData.showIgnore = selectedData.showAll;
            //     $scope.selectedData.showUnmapped = selectedData.showAll;
            //     $scope.selectedData.showMapped = selectedData.showAll;
            // }
            //
            // if(!selectedData[type]) {
            //     $scope.selectedData.showAll = false;
            // }
            //
            // if(selectedData.showIgnore && selectedData.showUnmapped && selectedData.showMapped) {
            //     $scope.selectedData.showAll = true;
            // }
        }
        
        function getDataFilter() {
            var filters = mapBuilderDataSet.refactorFilter(angular.copy($scope.selectedData.filters));
            params = angular.extend(params, {filters: angular.toJson(filters), page: 1});

            __getDataRows(params);
        }

        function actionAssociate(row) {
            var modalInstance = $modal.open({
                templateUrl: 'unifiedReport/dataSet/associateController.tpl.html',
                controller: 'associateController',
                size: 'lg',
                resolve: {
                    leftSide: function () {
                        return row.__is_left_side == '1'
                    },
                    unique: function () {
                        return row.__unique_id
                    },
                    filter: function () {
                        return [
                            {field: "__is_left_side", type: "number", comparison: "equal", compareValue: (row.__is_left_side == '1') ? '0' : '1'},
                            {field: "__is_ignored", type: "number", comparison: "equal", compareValue: '0'}
                        ]
                    },
                    dataRows: function (UnifiedReportDataSetManager) {
                        var filters = angular.toJson([
                            {field: "__is_left_side", type: "number", comparison: "equal", compareValue: (row.__is_left_side == '1') ? '0' : '1'},
                            {field: "__is_ignored", type: "number", comparison: "equal", compareValue: '0'}
                        ]);

                        var params = {
                            filters: filters,
                            page: 1,
                            limit: 10
                        };

                        return UnifiedReportDataSetManager.one($stateParams.dataSet).one('rows').get(params)
                            .then(function (data) {
                                return data.plain()
                            });
                    },
                    dataSet: function () {
                        return $scope.dataSet
                    }
                }
            });

            modalInstance.result.then(function () {
                __getDataRows(params);
            });
        }

        function backToDataSetList() {
            return historyStorage.getLocationPath(HISTORY_TYPE_PATH.dataSet, '^.list');
        }

        function actionRemoveAssociate(row) {
            UnifiedReportDataSetManager.one($scope.dataSet.id).post('unmatching', {rowId: row.__id, __is_left_side: row.__is_left_side})
                .then(function() {
                    __getDataRows(params);

                    AlertService.replaceAlerts({
                        type: 'success',
                        message: 'The items have been remove mapped'
                    });
                })
                .catch(function() {
                    AlertService.replaceAlerts({
                        type: 'danger',
                        message: 'Could not remove mapped for the item'
                    });
                });
        }

        function actionUndoIgnore(row) {
            UnifiedReportDataSetManager.one($scope.dataSet.id).one('rows').post('update', {rowId: row.__id, isIgnore: '0'})
                .then(function() {
                    __getDataRows(params);

                    AlertService.replaceAlerts({
                        type: 'success',
                        message: 'The items have been undo ignore'
                    });
                })
                .catch(function() {
                    AlertService.replaceAlerts({
                        type: 'danger',
                        message: 'Could not undo ignore for the item'
                    });
                });
        }

        function actionIgnore(row) {
            UnifiedReportDataSetManager.one($scope.dataSet.id).one('rows').post('update', {rowId: row.__id, isIgnore: '1'})
                .then(function() {
                    __getDataRows(params);

                    AlertService.replaceAlerts({
                        type: 'success',
                        message: 'The items have been ignore'
                    });
                })
                .catch(function() {
                    AlertService.replaceAlerts({
                        type: 'danger',
                        message: 'Could not ignore for the item'
                    });
                });
        }

        function isShow(sortColumn) {
            return ($scope.sortBy == '\u0022' + sortColumn + '\u0022')
        }

        function sort(keyname) {
            $scope.sortBy = '\u0022'+keyname+'\u0022'; //set the sortBy to the param passed
            $scope.reverse = !$scope.reverse; //if true make it false and vice versa

            params = angular.extend(params, {orderBy: (!!$scope.reverse ? 'desc': 'asc'), sortField: $scope.sortBy});
            __getDataRows(params);
        }

        function changePage(currentPage) {
            params = angular.extend(params, {page: currentPage});
            __getDataRows(params);
        }

        function selectItemPerPages(itemPerPage) {
            params = angular.extend(params, {limit: itemPerPage, page: 1});
            __getDataRows(params);
        }

        function showPagination() {
            return angular.isArray($scope.dataRows.records) && $scope.dataRows.totalRecord > $scope.tableConfig.itemsPerPage;
        }

        function isNullValue(report, column) {
            return !report[column] && report[column] != 0;
        }

        var getDataRows;
        function __getDataRows(query, timeout) {
            clearTimeout(getDataRows);

            getDataRows = setTimeout(function() {
                params = angular.copy(query);

                var filters = angular.fromJson(params.filters) || [];
                if($scope.selectedData.showAll || (!$scope.selectedData.showMapped && !$scope.selectedData.showUnmapped && !$scope.selectedData.showIgnore && !$scope.selectedData.showAll)) {

                } else {
                    filters.push({field: "__is_ignored", type: "number", comparison: "equal", compareValue: $scope.selectedData.showIgnore ? '1' : '0'});

                    if($scope.selectedData.showMapped != $scope.selectedData.showUnmapped) {
                        if($scope.selectedData.showMapped) {
                            filters.push({field: "__is_associated", type: "number", comparison: "equal", compareValue: '1'})
                        }

                        if($scope.selectedData.showUnmapped) {
                            filters.push({field: "__is_associated", type: "number", comparison: "equal", compareValue: '0'}, {field: "__is_mapped", type: "number", comparison: "equal", compareValue:"0"})
                        }
                    }

                }

                params.filters = angular.toJson(filters);

                return UnifiedReportDataSetManager.one($scope.dataSet.id).one('rows').get(params)
                    .then(function(dataRows) {
                        $scope.dataRows = dataRows;
                        $scope.rows = dataRows.records || [];
                        $scope.tableConfig.totalItems = dataRows.totalRecord;
                        $scope.availableOptions.currentPage = Number(params.page);
                    });
            }, timeout || 0);
        }
    }
})();