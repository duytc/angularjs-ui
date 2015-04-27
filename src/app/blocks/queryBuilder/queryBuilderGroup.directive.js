(function () {
    'use strict';

    angular.module('tagcade.blocks.queryBuilder')
        .directive('queryBuilderGroup', queryBuilderGroup)
    ;

    function queryBuilderGroup($compile, CONDITIONS, OPERATORS, GROUP_KEY, GROUP_TYPE, DATA_TYPE) {
        'use strict';

        return {
            scope: {
                group: '=',
                groups: '=',
                index: '='
            },
            restrict: 'AE',
            templateUrl: 'blocks/queryBuilder/queryBuilderGroup.tpl.html',
            compile: function (element, attrs) {
                var content, directive;
                content = element.contents().remove();
                return function (scope, element, attrs) {
                    scope.operators = OPERATORS;
                    scope.conditions = CONDITIONS;
                    scope.groupKey = GROUP_KEY;
                    scope.groupType = GROUP_TYPE;
                    scope.dataTypes = DATA_TYPE;

                    scope.addGroup = addGroup;
                    scope.removeGroup = removeGroup;
                    scope.addCondition = addCondition;
                    scope.removeCondition = removeCondition;
                    scope.isGroup = isGroup;
                    scope.isDisabledButtonRemoveCondition = isDisabledButtonRemoveCondition;

                    function addGroup() {
                        // set default group, including two conditions
                        var group = {};
                        group[scope.groupType] = scope.operators[0];
                        group[scope.groupKey] = [];
                        group[scope.groupKey].unshift(
                            {
                            var : null,
                            cmp : scope.conditions[0].key,
                            val : null,
                            type : scope.dataTypes[0]
                            },
                            {
                            var : null,
                            cmp : scope.conditions[0].key,
                            val : null,
                            type : scope.dataTypes[0]
                            }
                        );
                        scope.group[scope.groupKey].push(group);
                    }

                    function removeGroup() {
                        if(scope.index != undefined) {
                            if(scope.groups.length > 2) {
                                scope.groups.splice(scope.index, 1);
                            }

                            return;
                        }

                        //reset expression group
                        scope.group = {};
                        scope.group = {
                            var : null,
                            cmp : scope.conditions[0].key,
                            val : null,
                            type : scope.dataTypes[0]
                        };
                    }

                    function addCondition() {
                        scope.group[scope.groupKey].unshift({
                            var : null,
                            cmp: scope.conditions[0].key,
                            val : null,
                            type: scope.dataTypes[0]
                        });
                    }

                    function removeCondition(index) {
                        if(isDisabledButtonRemoveCondition) {
                            scope.group[scope.groupKey].splice(index, 1);
                        }
                    }

                    function isDisabledButtonRemoveCondition() {
                        if(scope.group[scope.groupKey].length > 2) {
                            return false
                        }

                        return true;
                    }

                    function isGroup(itemGroup) {
                        if(itemGroup[scope.groupKey] === undefined) {
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