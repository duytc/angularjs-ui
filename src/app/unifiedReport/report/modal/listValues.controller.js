(function () {
    'use strict';

    angular
        .module('tagcade.unifiedReport.report')
        .controller('listValuesController', listValuesController)
    ;

    function listValuesController($scope, $modal, AlertService, listValues, dimensionsMetrics, reportBuilder, transform, fields, ReportViewAddConditionalTransformValues) {
        $scope.listValues = listValues;

        $scope.tableConfig = {
            itemsPerPage: 10,
            maxPages: 10
        };

        $scope.hasAdTags = function () {
            return !!listValues.length;
        };

        $scope.remove = remove;
        $scope.showPagination = showPagination;
        $scope.newValue = newValue;
        $scope.editValue = editValue;

        function editValue(value) {
            $modal.open({
                templateUrl: 'unifiedReport/report/modal/newValueForm.tpl.html',
                size: 'lg',
                resolve: {
                    fields: function () {
                        return fields
                    },
                    listValues: function () {
                        return $scope.listValues
                    },
                    transform: function () {
                        return transform
                    },
                    value: function () {
                        return value
                    },
                    reportBuilder: function () {
                        return reportBuilder
                    },
                    dimensionsMetrics: function () {
                        return dimensionsMetrics
                    }
                },
                controller: 'NewValueForm'
            });
        }

        function newValue() {
            $modal.open({
                templateUrl: 'unifiedReport/report/modal/newValueForm.tpl.html',
                size: 'lg',
                resolve: {
                    fields: function () {
                        return fields
                    },
                    listValues: function () {
                        return $scope.listValues
                    },
                    transform: function () {
                        return transform
                    },
                    value: function () {
                        return null
                    },
                    reportBuilder: function () {
                        return reportBuilder
                    },
                    dimensionsMetrics: function () {
                        return dimensionsMetrics
                    }
                },
                controller: 'NewValueForm'
            });
        }

        function showPagination() {
            return angular.isArray($scope.listValues) && $scope.listValues.length > $scope.tableConfig.itemsPerPage;
        }

        function remove(item) {
            return ReportViewAddConditionalTransformValues.one(item.id).remove()
                .then(
                    function () {
                        var index = _.findIndex($scope.listValues, {id: item.id});
                        if (index > -1) {
                            $scope.listValues.splice(index, 1);
                        }

                        listValues = $scope.listValues;

                        if($scope.tableConfig.currentPage > 0 && $scope.listValues.length/10 == $scope.tableConfig.currentPage) {
                            $scope.tableConfig.currentPage =- 1;
                        }

                        var indexTransformValue = transform.values.indexOf(item.id);
                        if(indexTransformValue > -1) {
                            transform.values.splice(indexTransformValue, 1)
                        }

                        AlertService.replaceAlerts({
                            type: 'success',
                            message: 'The values was removed'
                        });
                    },
                    function () {
                        AlertService.replaceAlerts({
                            type: 'danger',
                            message: 'The value could not be removed'
                        });
                    }
                )
                ;
        }
    }
})();