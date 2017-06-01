(function () {
    'use strict';

    angular.module('tagcade.blocks.queryBuilder')
        .directive('queryBuilderGroup', queryBuilderGroup)
    ;

    function queryBuilderGroup($compile, $timeout, _, AdSlotLibrariesManager, AdSlotManager, VARIABLE_FOR_AD_TAG, CONDITIONS_STRING, CONDITIONS_BOOLEAN, CONDITIONS_NUMERIC, OPERATORS, GROUP_KEY, GROUP_TYPE, DATA_TYPE, COUNTRY_LIST, DEVICES) {
        'use strict';

        return {
            scope: {
                group: '=',
                groups: '=',
                index: '=',
                tags: '=',
                disabledDirective: '=',
                isLibrary: '=',
                expectAdSlot: '='
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
                    scope.devices = DEVICES;
                    scope.countries = COUNTRY_LIST;
                    scope.blacklists = [];
                    scope.whitelists = [];
                    scope.variableForAdTags = angular.copy(VARIABLE_FOR_AD_TAG);

                    scope.variableForAdTags.push({key: 'CUSTOM', label: 'CUSTOM'});

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

                    scope.hasGetBlacklist = false;
                    scope.hasGetWhitelist = false;

                    scope.addGroup = addGroup;
                    scope.removeGroup = removeGroup;
                    scope.addCondition = addCondition;
                    scope.removeCondition = removeCondition;
                    scope.isGroup = isGroup;
                    scope.isDisabledButtonRemoveCondition = isDisabledButtonRemoveCondition;
                    scope.changeCondition = changeCondition;
                    scope.selectType = selectType;
                    scope.selectTypeDomain = selectTypeDomain;
                    scope.valIsNull = valIsNull;
                    scope.changeVarName = changeVarName;
                    scope.getDataTypeList = getDataTypeList;
                    scope.groupEntities = groupEntities;
                    scope.getDomains = getDomains;
                    scope.selectCondition = selectCondition;
                    scope.findCondition = findCondition;

                    function findCondition(cmp, listCondition) {
                        return _.find(listCondition, function (condition) {
                            return condition.key == cmp
                        });
                    }

                    function selectCondition(group, listCondition, index, resetVal) {
                        if(resetVal) {
                            group.val = null;
                        }

                        if(!group.cmp) {
                            return
                        }

                        var condition = findCondition(group.cmp, listCondition);

                        if(!!condition && _.has(condition, 'blacklist') && !condition.hideInputVal) {
                            if(scope.isLibrary) {
                                if(condition.blacklist) {
                                    if(scope.blacklists.length == 0) {
                                        AdSlotManager.one(scope.expectAdSlot.id || scope.expectAdSlot).getList('displayblacklists')
                                            .then(function (blacklists) {
                                                scope.blacklists = blacklists;
                                                scope.hasGetBlacklist = true;
                                            })
                                    }
                                } else {
                                    if(scope.whitelists.length == 0) {
                                        AdSlotManager.one(scope.expectAdSlot.id || scope.expectAdSlot).getList('displaywhitelists')
                                            .then(function (whitelists) {
                                                scope.whitelists =  whitelists;
                                                scope.hasGetWhitelist = true;
                                            })
                                    }
                                }
                            } else {
                                if(condition.blacklist) {
                                    if(scope.blacklists.length == 0) {
                                        AdSlotLibrariesManager.one(scope.expectAdSlot.id || scope.expectAdSlot).getList('displayblacklists')
                                            .then(function (blacklists) {
                                                scope.blacklists = blacklists;
                                                scope.hasGetBlacklist = true;
                                            })
                                    }
                                } else {
                                    if(scope.whitelists.length == 0) {
                                        AdSlotLibrariesManager.one(scope.expectAdSlot.id || scope.expectAdSlot).getList('displaywhitelists')
                                            .then(function (whitelists) {
                                                scope.whitelists =  whitelists;
                                                scope.hasGetWhitelist = true;
                                            })
                                    }
                                }
                            }
                        }
                    }

                    function getDomains(group, listCondition) {
                        var condition = findCondition(group.cmp, listCondition);

                        if(!condition) {
                            return []
                        }

                        if(condition.blacklist) {
                            return scope.blacklists
                        }

                        return scope.whitelists
                    }

                    function addGroup() {
                        // set default group, including two conditions
                        var group = {};
                        group[scope.groupType] = scope.operators[0];
                        group[scope.groupKey] = [];

                        scope.group[scope.groupKey].push(group);
                    }

                    function changeVarName(group, indexValue) {
                        // numberLoad++;
                        //
                        // if(numberLoad > indexValue + 1) {
                        //     // reset group
                        //     group.type = getDataTypeList(group)[0].key;
                        //     group.cmp = scope.conditions[0].key;
                        //     group.val = null;
                        // }

                        $timeout(function () {
                            group.type = getDataTypeList(group)[0].key;
                            group.cmp = scope.conditions[0].key;
                            group.val = null;
                        }, 0 , true)
                    }

                    function getDataTypeList(group) {
                        var dataTypeList = [];
                        for(var index in DATA_TYPE) {
                            if(DATA_TYPE[index].builtInVars.indexOf(group.customVar) > -1) {
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
                            customVar : null,
                            var : null,
                            cmp : scope.conditions[0].key,
                            val : null,
                            type : scope.dataTypes[0].key
                        };
                    }

                    function addCondition() {
                        scope.group[scope.groupKey].push({
                            customVar : null,
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
                                if(CONDITIONS_NUMERIC[index].unsupportedBuiltInVars.indexOf(group.customVar) == -1) {
                                    conditions.push(CONDITIONS_NUMERIC[index])
                                }
                            }
                        }
                        else if(group.type == scope.dataTypes[2].key) {
                            for(var index in CONDITIONS_BOOLEAN) {
                                if(CONDITIONS_BOOLEAN[index].unsupportedBuiltInVars.indexOf(group.customVar) == -1) {
                                    conditions.push(CONDITIONS_BOOLEAN[index])
                                }
                            }
                        }
                        else {
                            for(var index in CONDITIONS_STRING) {
                                if(CONDITIONS_STRING[index].unsupportedBuiltInVars.indexOf(group.customVar) == -1) {
                                    if(!CONDITIONS_STRING[index].onlySupport) {
                                        conditions.push(CONDITIONS_STRING[index])
                                    } else {
                                        if(CONDITIONS_STRING[index].onlySupport.indexOf(group.customVar) > -1) {
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

                    function selectTypeDomain(item) {
                        item.val = null;
                    }

                    function valIsNull(cmp) {
                        if(cmp == scope.conditions[0].key || cmp == scope.conditions[1].key) {
                            return false;
                        }

                        return true;
                    }

                    // change variable not using underscore info using underscore
                    function _refactorVar(itemGroup) {
                        if (itemGroup.customVar == '${PAGEURL}') {
                            itemGroup.customVar = '${PAGE_URL}';
                        }
                        else if (itemGroup.customVar == '${USERAGENT}') {
                            itemGroup.customVar = '${USER_AGENT}';
                        }
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