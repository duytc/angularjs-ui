(function () {
    'use strict';

    angular.module('tagcade.blocks.queryBuilder')
        .directive('queryBuilder', queryBuilder)
    ;

    function queryBuilder($compile, CONDITIONS, OPERATORS, GROUP_KEY, GROUP_TYPE, DATA_TYPE, queryBuilderService) {
        'use strict';

        return {
            scope: {
                expressions: '=',
                adSlots: '='
            },
            restrict: 'AE',
            templateUrl: 'blocks/queryBuilder/queryBuilder.tpl.html',
            compile: function (element, attrs) {
                var content, directive;
                content = element.contents().remove();
                return function (scope, element, attrs) {
                    scope.operators = OPERATORS;
                    scope.conditions = CONDITIONS;
                    var groupKey = GROUP_KEY;
                    var groupTYPE = GROUP_TYPE;
                    scope.dataTypes = DATA_TYPE;

                    scope.addExpression = addExpression;
                    scope.removeExpressionRoot = removeExpressionRoot;
                    scope.addGroupRoot = addGroupRoot;
                    scope.addConditionRoot = addConditionRoot;
                    scope.isGroup = isGroup;
                    scope.isDisabledButtonRemoveExpressions = isDisabledButtonRemoveExpressions;

                    scope.builtVariable = function(expression) {
                        return queryBuilderService.builtVariable(expression)
                    };

                    function addExpression() {
                        // default condition
                        scope.expressions.push({
                            expression: {
                                var : null,
                                cmp : scope.conditions[0],
                                val : null,
                                type : scope.dataTypes[0]
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
                        expressionRoot.expression = {};

                        // set default group, including two conditions
                        expressionRoot.expression[groupTYPE] = scope.operators[0].name;
                        expressionRoot.expression[groupKey] = [];
                        expressionRoot.expression[groupKey].unshift(
                            {
                            var : null,
                            cmp : scope.conditions[0],
                            val : null,
                            type : scope.dataTypes[0]
                            },
                            {
                            var : null,
                            cmp : scope.conditions[0],
                            val : null,
                            type : scope.dataTypes[0]
                            }
                        );
                    }

                    function addConditionRoot(expressionRoot) {
                        //reset expression group
                        expressionRoot.expression = {};

                        expressionRoot.expression = {
                            var : null,
                            cmp : scope.conditions[0],
                            val : null,
                            type : scope.dataTypes[0]
                        };
                    }

                    function isGroup(expressionRoot) {
                        if(expressionRoot.expression[groupKey] === undefined) {
                            return false;
                        }

                        return true;
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