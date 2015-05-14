(function () {
    'use strict';

    angular.module('tagcade.blocks.queryBuilder')
        .directive('queryBuilder', queryBuilder)
    ;

    function queryBuilder($compile, CONDITIONS_STRING, OPERATORS, GROUP_KEY, GROUP_TYPE, DATA_TYPE, queryBuilderService) {
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
                        var expressionDescriptor = {};

                        // set default group, including two conditions
                        expressionDescriptor[groupTYPE] = scope.operators[0];
                        expressionDescriptor[groupKey] = [];

                        // default condition
                        scope.expressions.push({
                            expressionDescriptor: expressionDescriptor,
                            expectAdSlot : null
                        });
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