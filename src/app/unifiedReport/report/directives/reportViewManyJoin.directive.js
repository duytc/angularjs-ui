(function () {
    'use strict';

    angular.module('tagcade.unifiedReport.report')
        .directive('reportViewManyJoin', reportViewManyJoin)
    ;

    function reportViewManyJoin($compile, $timeout, _, AddCalculatedField, REPORT_BUILDER_TRANSFORMS_ALL_FIELD_TYPES, POSITIONS_FOR_REPLACE_TEXT, CONNECT_DATA_SOURCE_TYPE_FORMAT_ALL_FIELD_KEY, DATE_FORMAT_TYPES, METRICS_SET) {
        'use strict';

        return {
            scope: {
                dataSets: '=listDataSets',
                reportBuilder: '='
            },
            restrict: 'AE',
            templateUrl: 'unifiedReport/report/directives/reportViewManyJoin.tpl.html',
            compile: function (element, attrs) {
                var content, directive;
                content = element.contents().remove();
                return function (scope, element, attrs) {
                    scope.joinBy = scope.reportBuilder.joinBy;
                    scope.addJoinBy = addJoinBy;
                    scope.removeJoinBy = removeJoinBy;
                    scope.addJoinField = addJoinField;
                    scope.removeJoinField = removeJoinField;
                    scope.getDataSetForJoin = getDataSetForJoin;
                    scope.selectDateSet = selectDateSet;
                    scope.selectJoinField = selectJoinField;
                    
                    function selectJoinField(joinItem) {
                        $timeout(function () {
                            if(joinItem.joinFields[0].field == joinItem.joinFields[1].field) {
                                joinItem.outputField = joinItem.joinFields[0].field;
                            } else {
                                joinItem.outputField = null
                            }
                        }, 0, true)
                    }

                    function selectDateSet(dataSet, joinField) {
                        // if(!dataSet) {
                        //     return;
                        // }
                        //
                        // var reportViewDataSet = _.find(scope.reportBuilder.reportViewDataSets, function (reportViewDataSet) {
                        //     return reportViewDataSet.dataSet == dataSet.id || reportViewDataSet.dataSet == dataSet;
                        // });
                        //
                        // if(!!reportViewDataSet) {
                        //     joinField.allFields = reportViewDataSet.dimensions.concat(reportViewDataSet.metrics);
                        // }
                    }
                    
                    function getDataSetForJoin(currentJoinField, joinFields) {
                        var dataSets = [];
                        angular.forEach(scope.reportBuilder.reportViewDataSets, function (reportViewDataSet) {
                            if(!!reportViewDataSet.dataSet) {
                                var dataSet = _.find(scope.dataSets, function (dataSet) {
                                    var indexJoinField = _.findIndex(joinFields, function (joinField) {
                                        return joinField.dataSet == reportViewDataSet.dataSet && reportViewDataSet.dataSet != currentJoinField.dataSet
                                    });

                                    return dataSet.id == reportViewDataSet.dataSet && indexJoinField == -1;
                                });

                                if(!!dataSet) {
                                    dataSets.push(dataSet);
                                }
                            }
                        });

                        return dataSets;
                    }

                    function removeJoinField(joinFields, index) {
                        joinFields.splice(index, 1);
                    }
                    
                    function addJoinField(joinFields) {
                        joinFields.push({dataSet: null, field: null})
                    }
                    
                    function removeJoinBy(index) {
                        scope.joinBy.splice(index, 1);
                    }
                    
                    function addJoinBy() {
                        scope.joinBy.push({
                            joinFields: [
                                {dataSet: null, field: null, allFields: []},
                                {dataSet: null, field: null, allFields: []}
                            ],
                            outputField: null,
                            isVisible: true
                        })
                    }

                    directive || (directive = $compile(content));

                    element.append(directive(scope, function ($compile) {
                        return $compile;
                    }));
                }
            }
        };
    }
})();