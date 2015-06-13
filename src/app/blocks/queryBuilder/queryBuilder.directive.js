(function () {
    'use strict';

    angular.module('tagcade.blocks.queryBuilder')
        .directive('queryBuilder', queryBuilder)
    ;

    function queryBuilder($compile, CONDITIONS_STRING, OPERATORS, GROUP_KEY, GROUP_TYPE, DATA_TYPE, TYPE_AD_SLOT_FOR_LIST, queryBuilderService, DisplayAdSlotManager) {
        'use strict';

        return {
            scope: {
                expressions: '=',
                adSlots: '=',
                tags: '=',
                native: '='
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
                    scope.typesList = TYPE_AD_SLOT_FOR_LIST;
                    scope.hideStartingPositionAdTag = false;

                    var groupKey = GROUP_KEY;
                    var groupTYPE = GROUP_TYPE;

                    scope.addExpression = addExpression;
                    scope.enableDragDropQueryBuilder = enableDragDropQueryBuilder;
                    scope.selectExpectAdSlot = selectExpectAdSlot;
                    scope.formatPositionLabel = formatPositionLabel;
                    scope.filterEntityType = filterEntityType;

                    scope.sortableOptions = {
                        disabled: true,
                        forcePlaceholderSize: true,
                        placeholder: 'sortable-placeholder'
                    };

                    scope.builtVariable = function(expressionDescriptor) {
                        return queryBuilderService.builtVariable(expressionDescriptor)
                    };


                    function selectExpectAdSlot(adSlot, expressionRoot, index) {
                        if(!scope.groups) {
                            scope.groups = [];
                        }

                        if(!!expressionRoot) {
                            if(!!expressionRoot.startingPosition) {
                                expressionRoot.startingPosition = null;
                            }
                        }

                        if (!adSlot) {
                            return;
                        }

                        var adSlotId = !!adSlot.id ? adSlot.id : adSlot;

                        if(adSlot.type == scope.typesList.native) {
                            scope.hideStartingPositionAdTag = true;
                        }
                        if(adSlot.type == scope.typesList.static) {
                            scope.hideStartingPositionAdTag = false;
                            DisplayAdSlotManager.one(adSlotId).getList('adtags')
                                .then(function(adTags) {
                                    scope.groups[index] = _setupGroup(adTags.plain());
                                })
                            ;
                        }
                    }

                    function _setupGroup(listAdTags) {
                        var adTagGroups = [];

                        angular.forEach(listAdTags, function(item) {
                            var index = 0;

                            if(adTagGroups.length == 0) {
                                adTagGroups[index] = [];
                            }
                            else {
                                var found = false;
                                angular.forEach(adTagGroups, function(group, indexGroup) {
                                    if(group[0].position == item.position && !found) {
                                        found = true;
                                        index = indexGroup;
                                    }
                                });

                                if(found == false) {
                                    index = adTagGroups.length;
                                    adTagGroups[index] = [];
                                }
                            }

                            adTagGroups[index].push(item);
                        });

                        return adTagGroups;
                    }

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

                    function filterEntityType(adSlot) {
                        if(adSlot.id == null || scope.native) {
                            return true;
                        }
                        else if(!scope.native) {
                            if(adSlot.type == scope.typesList.static) {
                                return true;
                            }

                            return false;
                        }

                        return false;
                    }

                    function enableDragDropQueryBuilder(enable) {
                        scope.sortableOptions['disabled'] = enable;
                    }

                    function formatPositionLabel(adTags) {
                        var listNameAdTag = [];

                        angular.forEach(adTags, function(adTag) {
                            listNameAdTag.push(adTag.name);
                        });

                        var showString = adTags[0].position + ': (' + listNameAdTag.toString().replace(',', ', ') + ')';

                        return showString;
                    }

                    scope.$watch(function() { return scope.adSlots }, function () {
                        if(!scope.adSlots && !scope.groups) {
                            return;
                        }

                        angular.forEach(scope.expressions, function(expressionRoot) {
                            if(!expressionRoot.expectAdSlot) {
                                return;
                            }

                            !!expressionRoot.expectAdSlot.id ? expressionRoot.expectAdSlot = expressionRoot.expectAdSlot.id : expressionRoot.expectAdSlot;
                        })
                    });

                    directive || (directive = $compile(content));

                    element.append(directive(scope, function ($compile) {
                        return $compile;
                    }));
                }
            }
        };
    }
})();