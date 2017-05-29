(function () {
    'use strict';

    angular.module('tagcade.blocks.queryBuilder')
        .directive('queryBuilderGroupForAdTag', queryBuilderGroupForAdTag)
    ;

    function queryBuilderGroupForAdTag($compile, $timeout, _, VARIABLE_FOR_AD_TAG, CONDITIONS_STRING, CONDITIONS_BOOLEAN, CONDITIONS_NUMERIC, OPERATORS, GROUP_KEY, GROUP_TYPE, DATA_TYPE, COUNTRY_LIST, DEVICES) {
        'use strict';

        return {
            scope: {
                group: '=',
                groups: '=',
                index: '=',
                disabledDirective: '=',
                domainList: '=',
                publisher: "="
            },
            restrict: 'AE',
            templateUrl: 'blocks/queryBuilder/queryBuilderGroupForAdTag.tpl.html',
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
                    scope.devices = DEVICES;
                    scope.countries = COUNTRY_LIST;
                    scope.variableForAdTags = VARIABLE_FOR_AD_TAG;
                    var itemGroupClone = {};

                    var mostCommonlyCountry = [
                        {name: 'Australia', code: 'AU', line: true},
                        {name: 'Canada', code: 'CA', line: true},
                        {name: 'United Kingdom', code: 'GB', line: true},
                        {name: 'United States', code: 'US', line: true}
                    ];

                    angular.forEach(scope.countries, function(country, index) {
                        angular.forEach(mostCommonlyCountry, function(mostCommonly) {
                            if(mostCommonly.code == country.code) {
                                delete scope.countries[index];
                                scope.countries.unshift(mostCommonly);
                            }
                        })
                    });

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
                    scope.getDataTypeList = getDataTypeList;
                    scope.groupEntities = groupEntities;
                    scope.getDomains = getDomains;
                    scope.findCondition = findCondition;
                    scope.selectCondition = selectCondition;
                    
                    function selectCondition(itemGroup) {
                        itemGroup.val = null
                    }

                    function findCondition(cmp, listCondition) {
                        return _.find(listCondition, function (condition) {
                            return condition.key == cmp
                        });
                    }

                    var numberChangeGroupVal = 0;
                    function getDomains(group, listCondition, index) {
                        var condition = findCondition(group.cmp, listCondition);

                        if(!condition) {
                            return []
                        }

                        if(!!group && !!group.val && group.val.length == 0 && !!itemGroupClone[index].val && itemGroupClone[index].val.length > 0) {
                            if(numberChangeGroupVal == 0) {
                                numberChangeGroupVal++;
                                group.val = itemGroupClone[index].val;
                            }
                        }

                        if(((condition.blacklist && scope.domainList.blacklist.length > 0) || (!condition.blacklist && scope.domainList.whitelist.length > 0)) && numberChangeGroupVal == 0 && !!group && !!group.val && group.val.length > 0) {
                            numberChangeGroupVal++;
                        }

                        if(condition.blacklist) {
                            return scope.domainList.blacklist
                        }

                        return scope.domainList.whitelist
                    }

                    function addGroup() {
                        // set default group, including two conditions
                        var group = {};
                        group[scope.groupType] = scope.operators[0];
                        group[scope.groupKey] = [];

                        scope.group[scope.groupKey].push(group);
                    }

                    function changeVarName(group, indexValue) {
                        $timeout(function () {
                            group.type = getDataTypeList(group)[0].key;
                            group.cmp = scope.conditions[0].key;
                            group.val = null;
                        }, 0, true)
                    }

                    function getDataTypeList(group) {
                        var dataTypeList = [];
                        for(var index in DATA_TYPE) {
                            if(DATA_TYPE[index].builtInVars.indexOf(group.var) > -1) {
                                dataTypeList.push(DATA_TYPE[index]);

                                return dataTypeList;
                            }
                        }

                        return DATA_TYPE;
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

                    function changeCondition(group, index) {
                        itemGroupClone[index] = angular.copy(group);
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
                                    if(!CONDITIONS_STRING[index].onlySupport) {
                                        conditions.push(CONDITIONS_STRING[index])
                                    } else {
                                        if(CONDITIONS_STRING[index].onlySupport.indexOf(group.var) > -1) {
                                            conditions.push(CONDITIONS_STRING[index])
                                        }
                                    }
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

                    function groupEntities(item){
                        if (item.line) {
                            return undefined; // no group
                        }

                        return ''; // separate group with no name
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