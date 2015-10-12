(function () {
    'use strict';

    angular.module('tagcade.blocks.queryBuilder')
        .directive('queryBuilderGroup', queryBuilderGroup)
    ;

    function queryBuilderGroup($compile, _, CONDITIONS_STRING, CONDITIONS_BOOLEAN, CONDITIONS_NUMERIC, OPERATORS, GROUP_KEY, GROUP_TYPE, DATA_TYPE, COUNTRY_LIST) {
        'use strict';

        return {
            scope: {
                group: '=',
                groups: '=',
                index: '=',
                tags: '=',
                disabledDirective: '='
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
                    scope.dataTypeList = DATA_TYPE;
                    scope.countries = COUNTRY_LIST;
                    var numberLoad = 0;

                    scope.addGroup = addGroup;
                    scope.removeGroup = removeGroup;
                    scope.addCondition = addCondition;
                    scope.removeCondition = removeCondition;
                    scope.isGroup = isGroup;
                    scope.isDisabledButtonRemoveCondition = isDisabledButtonRemoveCondition;
                    scope.changeCondition = changeCondition;
                    scope.selectType = selectType;
                    scope.valIsNull = valIsNull;
                    scope.changeVarName = changeVarName;

                    function addGroup() {
                        // set default group, including two conditions
                        var group = {};
                        group[scope.groupType] = scope.operators[0];
                        group[scope.groupKey] = [];

                        scope.group[scope.groupKey].push(group);
                    }

                    function changeVarName(group) {
                        numberLoad++;

                        var dataTypeList = [];
                        for(var index in DATA_TYPE) {
                            if(DATA_TYPE[index].builtInVars.indexOf(group.var) > -1) {
                                dataTypeList.push(DATA_TYPE[index]);

                                if(numberLoad > 1) {
                                    // reset group
                                    group.type = DATA_TYPE[index].key;
                                    group.cmp = scope.conditions[0].key;
                                    group.val = null;
                                }

                                scope.dataTypeList = dataTypeList;

                                return;
                            }
                        }

                        scope.dataTypeList = DATA_TYPE;
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
                        _refactorVar(itemGroup);

                        if(itemGroup[scope.groupKey] === undefined) {
                            return false;
                        }

                        return true;
                    }

                    function changeCondition(group) {
                        var conditions = [];

                        if(group.type == scope.dataTypes[1].key) {
                            for(var index in CONDITIONS_NUMERIC) {
                                if(CONDITIONS_NUMERIC[index].unsupportedBuiltInVars.indexOf(group.var) == -1) {
                                    conditions.push(CONDITIONS_NUMERIC[index])
                                }
                            }
                        }
                        else if(group.type == scope.dataTypes[2].key) {
                            for(var index in CONDITIONS_BOOLEAN) {
                                if(CONDITIONS_BOOLEAN[index].unsupportedBuiltInVars.indexOf(group.var) == -1) {
                                    conditions.push(CONDITIONS_BOOLEAN[index])
                                }
                            }
                        }
                        else {
                            for(var index in CONDITIONS_STRING) {
                                if(CONDITIONS_STRING[index].unsupportedBuiltInVars.indexOf(group.var) == -1) {
                                    conditions.push(CONDITIONS_STRING[index])
                                }
                            }
                        }

                        if(_.findLastIndex(conditions, {key: group.cmp}) == -1) {
                            group.cmp = conditions[0].key;
                        }

                        return conditions;
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

                    // change variable not using underscore info using underscore
                    function _refactorVar(itemGroup) {
                        if (itemGroup.var == '${PAGEURL}') {
                            itemGroup.var = '${PAGE_URL}';
                        }
                        else if (itemGroup.var == '${USERAGENT}') {
                            itemGroup.var = '${USER_AGENT}';
                        }
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