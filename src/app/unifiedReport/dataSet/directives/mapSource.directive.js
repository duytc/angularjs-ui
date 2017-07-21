(function (){
    'use strict';

    angular.module('tagcade.unifiedReport.dataSet')
        .directive('mapSource', mapSource)
    ;

    function mapSource($compile){
        'use strict';

        return {
            scope: {
                dataSet: '=itemDataSet',
                dataSets: '=listDataSets',
                totalDimensionsMetrics: '='
            },
            restrict: 'AE',
            templateUrl: 'unifiedReport/dataSet/directives/mapSource.tpl.html',
            compile: function (element, attrs){
                var content, directive;
                content = element.contents().remove();
                return function (scope, element, attrs){
                    scope.mapBuilderConfigs = scope.dataSet.mapBuilderConfigs;
                    scope.totalDimensionsMetricsDataSetMap = [];
                    scope.listSides = [];

                    if(scope.mapBuilderConfigs.length == 0) {
                        scope.mapBuilderConfigs.push({
                            name: null,
                            mapDataSet: null,
                            mapFields: [{key: null, value: null}],
                            filters: []
                        })
                    }

                    angular.forEach(scope.mapBuilderConfigs, function (mapBuilderConfig) {
                        if(!!mapBuilderConfig.mapDataSet) {
                            var mapDataSet = _.find(scope.dataSets, {id: mapBuilderConfig.mapDataSet.id || mapBuilderConfig.mapDataSet});
                            selectDataSet(mapDataSet, mapBuilderConfig, true);
                        }
                    });

                    scope.removeItem = removeItem;
                    scope.addGroupDataSet = addGroupDataSet;
                    scope.addMapField = addMapField;
                    scope.selectDataSet = selectDataSet;
                    scope.filterDataSets = filterDataSets;
                    scope.selectSide = selectSide;
                    scope.changeSide = changeSide;
                    scope.filterMapField = filterMapField;
                    scope.filterFieldValue = filterFieldValue;
                    
                    function filterFieldValue(mapField, mapBuilderConfig) {
                        return function (dm) {
                            var mapDataSetID = !!mapBuilderConfig.mapDataSet ? (mapBuilderConfig.mapDataSet.id || mapBuilderConfig.mapDataSet) : null;
                            if(!mapDataSetID || !mapField.key) {
                                return false
                            }

                            var mapDataSet = _.find(scope.dataSets, {id: mapDataSetID});

                            var totalDimensionsMetrics = scope.dataSet.dimensions.concat(scope.dataSet.metrics);

                            var typeKey = _.find(totalDimensionsMetrics, {name: mapField.key}).type;
                            var typeValue = mapDataSet.dimensions[dm] || mapDataSet.metrics[dm];

                            if((typeKey == 'number' || typeKey == 'decimal') && (typeValue == 'number' || typeValue == 'decimal')) {
                                return true
                            }

                            if((typeKey == 'text' || typeKey == 'largeText') && (typeValue == 'text' || typeValue == 'largeText')) {
                                return true
                            }

                            if((typeKey == 'date' || typeKey == 'datetime') && (typeValue == 'date' || typeValue == 'datetime')) {
                                return true
                            }

                            return false
                        }
                    }
                    
                    function filterMapField(mapFieldKey) {
                        return function (dm) {
                            if(mapFieldKey == dm) {
                                return true
                            }

                            for(var index in scope.mapBuilderConfigs) {
                                var mapBuilderConfig = scope.mapBuilderConfigs[index];

                                for(var j in mapBuilderConfig.mapFields) {
                                    var field = mapBuilderConfig.mapFields[j];

                                    if(dm == field.key) {
                                        return false
                                    }
                                }
                            }

                            return true
                        }
                    }

                    function changeSide(side, inputText) {
                        angular.forEach(scope.mapBuilderConfigs, function (mapBuilderConfig) {
                            if((side == 'rightSide' && !mapBuilderConfig.leftSide) || (side == 'leftSide' && mapBuilderConfig.leftSide)) {
                                mapBuilderConfig.name = inputText
                            }
                        })
                    }

                    function selectSide(side, mapSideConfig) {
                        mapSideConfig.leftSide = side.leftSide
                    }

                    function filterDataSets(item) {
                        if(!scope.dataSet) {
                            return true
                        }

                        return scope.dataSet.id != item.id
                    }

                    function selectDataSet(dataSet, mapSideConfig, notReset) {
                        if(!notReset) {
                            mapSideConfig.mapFields = [{key: null, value: null}];
                        }

                        mapSideConfig.totalDimensionsMetrics = _.keys(dataSet.dimensions).concat(_.keys(dataSet.metrics));
                    }

                    function addMapField(mapSideConfig) {
                        mapSideConfig.mapFields.push({key: null, value: null})
                    }
                    
                    function addGroupDataSet() {
                        scope.mapBuilderConfigs.push({
                            name: null,
                            mapDataSet: null,
                            mapFields: [{key: null, value: null}],
                            filters: []
                        })
                    }

                    function removeItem(items, index){
                        items.splice(index, 1);
                    }


                    scope.$watch(function (){
                        return scope.dataSet;
                    }, function (){
                        scope.listSides = [
                            {label: scope.dataSet.leftSide || 'Left Side', leftSide: true},
                            {label: scope.dataSet.rightSide || 'Right Side', leftSide: false}
                        ]
                    }, true);

                    directive || (directive = $compile(content));

                    element.append(directive(scope, function ($compile){
                        return $compile;
                    }));
                }
            }
        };
    }
})();