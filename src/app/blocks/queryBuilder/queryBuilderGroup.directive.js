(function () {
    'use strict';

    angular.module('tagcade.blocks.queryBuilder')
        .directive('queryBuilderGroup', queryBuilderGroup)
    ;

    function queryBuilderGroup($compile, CONDITIONS_STRING, CONDITIONS_BOOLEAN, CONDITIONS_NUMERIC, OPERATORS, GROUP_KEY, GROUP_TYPE, DATA_TYPE) {
        'use strict';

        return {
            scope: {
                group: '=',
                groups: '=',
                index: '=',
                tags: '='
            },
            restrict: 'AE',
            templateUrl: 'blocks/queryBuilder/queryBuilderGroup.tpl.html',
            compile: function (element, attrs) {
                var content, directive;
                content = element.contents().remove();
                return function (scope, element, attrs) {
                    scope.operators = OPERATORS;
                    scope.conditions = CONDITIONS_STRING;
                    scope.groupKey = GROUP_KEY;
                    scope.groupType = GROUP_TYPE;
                    scope.dataTypes = DATA_TYPE;

                    scope.addGroup = addGroup;
                    scope.removeGroup = removeGroup;
                    scope.addCondition = addCondition;
                    scope.removeCondition = removeCondition;
                    scope.isGroup = isGroup;
                    scope.isDisabledButtonRemoveCondition = isDisabledButtonRemoveCondition;
                    scope.changeCondition = changeCondition;
                    scope.selectType = selectType;
                    scope.valIsNull = valIsNull;

                    function addGroup() {
                        // set default group, including two conditions
                        var group = {};
                        group[scope.groupType] = scope.operators[0];
                        group[scope.groupKey] = [];

                        scope.group[scope.groupKey].push(group);
                    }

                    function removeGroup() {
                        if(scope.index != undefined) {
                            scope.groups.splice(scope.index, 1);

                            return;
                        }

                        //reset expression group
                        scope.group = {};
                        scope.group = {
                            var : null,
                            cmp : scope.conditions[0].key,
                            val : null,
                            type : scope.dataTypes[0].key
                        };
                    }

                    function addCondition() {
                        scope.group[scope.groupKey].push({
                            var : null,
                            cmp: scope.conditions[0].key,
                            val : null,
                            type: scope.dataTypes[0].key
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

                    function valIsNull(cmp) {
                        if(cmp == scope.conditions[0].key || cmp == scope.conditions[1].key) {
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