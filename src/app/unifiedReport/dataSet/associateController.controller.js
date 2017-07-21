(function() {
    'use strict';

    angular.module('tagcade.unifiedReport.dataSet')
        .controller('associateController', associateController);

    function associateController($scope, $modalInstance, AlertService, filter, dataSet, unique, leftSide, dataRows, mapBuilderDataSet, UnifiedReportDataSetManager) {
        $scope.dataSet = dataSet;

        $scope.leftSide = leftSide;
        $scope.unique = unique;

        $scope.dataRows = dataRows;
        $scope.rows = dataRows.records;

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

        $scope.data = {};
        $scope.data.leftSide = leftSide ? unique : [];
        $scope.data.rightSide = !leftSide ? unique : [];

        $scope.tableConfig = {
            itemsPerPage: 10,
            maxPages: 7,
            totalItems: dataRows.totalRecord
        };

        $scope.availableOptions = {
            currentPage: 1,
            pageSize: 10
        };

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

        $scope.selectedDate = {
            filters: []
        };

        $scope.getDataFilter = getDataFilter;
        $scope.selectItemPerPages = selectItemPerPages;
        $scope.changePage = changePage;
        $scope.sort = sort;
        $scope.isShow = isShow;
        $scope.showPagination = showPagination;
        $scope.isNullValue = isNullValue;
        $scope.selectEntity = selectEntity;
        $scope.checkedSide = checkedSide;
        $scope.submit = submit;
        
        function submit() {
            UnifiedReportDataSetManager.one($scope.dataSet.id).post('matching', $scope.data)
                .catch(function(response) {
                    $modalInstance.close();

                    AlertService.replaceAlerts({
                        type: 'error',
                        message: 'Could not mapped for the item'
                    });
                }).then(function(data) {
                    $modalInstance.close();

                    AlertService.replaceAlerts({
                        type: 'success',
                        message: 'The items have been mapped'
                    });
                })
        }

        function selectEntity(row) {
            var index;
            if(leftSide) {
                index =  $scope.data.rightSide.indexOf(row.__unique_id);

                if(index > -1) {
                    $scope.data.rightSide.splice(index, 1)
                } else {
                    $scope.data.rightSide.push(row.__unique_id)
                }
            } else {
                index =  $scope.data.leftSide.indexOf(row.__unique_id);

                if(index > -1) {
                    $scope.data.leftSide.splice(index, 1)
                } else {
                    $scope.data.leftSide.push(row.__unique_id)
                }
            }
        }

        function checkedSide(row) {
            if(leftSide) {
                return $scope.data.leftSide.indexOf(row.__unique_id) > -1
            }

            return $scope.data.rightSide.indexOf(row.__unique_id) > -1
        }

        function isShow(sortColumn) {
            return ($scope.sortBy == '\u0022' + sortColumn + '\u0022')
        }

        function sort(keyname) {
            $scope.sortBy = '\u0022'+keyname+'\u0022'; //set the sortBy to the param passed
            $scope.reverse = !$scope.reverse; //if true make it false and vice versa

            params = angular.extend(params, {orderBy: (!!$scope.reverse ? 'desc': 'acs'), sortField: $scope.sortBy});
            __getDataRows(params);
        }

        function changePage(currentPage) {
            params = angular.extend(params, {page: currentPage});
            __getDataRows(params);
        }

        function getDataFilter() {
            $scope.data.leftSide = leftSide ? unique : [];
            $scope.data.rightSide = !leftSide ? unique : [];

            var filters = mapBuilderDataSet.refactorFilter(angular.copy($scope.selectedDate.filters));
            params = angular.extend(params, {filters: angular.toJson(filters), page: 1});

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

            // merge filter
            var filters = angular.fromJson(query.filters) || [];
            filters = filters.concat(filter);
            query.filters = angular.toJson(filters);

            getDataRows = setTimeout(function() {
                params = angular.copy(query);
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