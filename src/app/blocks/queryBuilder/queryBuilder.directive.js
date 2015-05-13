(function () {
    'use strict';

    angular.module('tagcade.blocks.queryBuilder')
        .directive('queryBuilder', queryBuilder)
    ;

    function queryBuilder($compile, CONDITIONS_STRING, CONDITIONS_BOOLEAN, CONDITIONS_NUMERIC, OPERATORS, GROUP_KEY, GROUP_TYPE, DATA_TYPE, queryBuilderService) {
        'use strict';

        return {
            scope: {
                expressions: '=',
                adSlots: '=',
                tags: '='
            },
            restrict: 'AE',
            templateUrl: 'blocks/queryBuilder/queryBuilder.tpl.html',
            compile: function (element, attrs) {
                var content, directive;
                content = element.contents().remove();
                return function (scope, element, attrs) {
                    scope.operators = OPERATORS;
                    scope.conditions = CONDITIONS_STRING;
                    scope.dataTypes = DATA_TYPE;

                    var groupKey = GROUP_KEY;
                    var groupTYPE = GROUP_TYPE;

                    scope.addExpression = addExpression;
                    scope.removeExpressionRoot = removeExpressionRoot;
                    scope.addGroupRoot = addGroupRoot;
                    scope.addConditionRoot = addConditionRoot;
                    scope.isGroup = isGroup;
                    scope.isDisabledButtonRemoveExpressions = isDisabledButtonRemoveExpressions;
                    scope.changeCondition = changeCondition;
                    scope.selectType = selectType;
                    scope.enableDragDropQueryBuilder = enableDragDropQueryBuilder;

                    scope.sortableOptions = {
                        disabled: true,
                        forcePlaceholderSize: true,
                        placeholder: 'sortable-placeholder'
                    };

                    scope.builtVariable = function(expressionDescriptor) {
                        return queryBuilderService.builtVariable(expressionDescriptor)
                    };

                    function addExpression() {
                        // default condition
                        scope.expressions.push({
                            expressionDescriptor: {
                                var : null,
                                cmp : scope.conditions[0].key,
                                val : null,
                                type : scope.dataTypes[0].key
                            },
                            expectAdSlot : null
                        });
                    }

                    function removeExpressionRoot(index) {
                        if(isDisabledButtonRemoveExpressions) {
                            scope.expressions.splice(index, 1);
                        }
                    }

                    function isDisabledButtonRemoveExpressions() {
                        if(scope.expressions.length > 1) {
                            return false;
                        }

                        return true;
                    }

                    function addGroupRoot(expressionRoot) {
                        //reset expression group
                        expressionRoot.expressionDescriptor = {};

                        // set default group, including two conditions
                        expressionRoot.expressionDescriptor[groupTYPE] = scope.operators[0];
                        expressionRoot.expressionDescriptor[groupKey] = [];
                    }

                    function addConditionRoot(expressionRoot) {
                        //reset expression group
                        expressionRoot.expressionDescriptor = {};

                        expressionRoot.expressionDescriptor = {
                            var : null,
                            cmp : scope.conditions[0].key,
                            val : null,
                            type : scope.dataTypes[0].key
                        };
                    }

                    function isGroup(expressionRoot) {
                        if(expressionRoot.expressionDescriptor[groupKey] === undefined) {
                            return false;
                        }

                        return true;
                    }

                    function changeCondition(item) {
                        if(item == scope.dataTypes[1].key) {
                            return CONDITIONS_NUMERIC;
                        }
                        if(item == scope.dataTypes[2].key) {
                            return CONDITIONS_BOOLEAN;
                        }

                        return CONDITIONS_STRING;
                    }

                    function selectType(item) {
                        item.val = null;
                        item.cmp = scope.conditions[0].key;
                    }

                    function enableDragDropQueryBuilder(enable) {
                        scope.sortableOptions['disabled'] = enable;
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