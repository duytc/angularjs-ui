(function () {
    'use strict';

    angular.module('tagcade.blocks.queryBuilder')
        .directive('queryBuilder', queryBuilder)
    ;

    function queryBuilder($compile, _, CONDITIONS_STRING, OPERATORS, GROUP_KEY, GROUP_TYPE, DATA_TYPE, TYPE_AD_SLOT, queryBuilderService, DisplayAdSlotManager) {
        'use strict';

        return {
            scope: {
                expressions: '=',
                adSlots: '=',
                tags: '=',
                native: '=',
                disabledDirective: '=',
                notHeaderBidding: '='
            },
            restrict: 'AE',
            templateUrl: 'blocks/queryBuilder/queryBuilder.tpl.html',
            compile: function (element, attrs) {
                var content,
                    directive,
                    headerName;

                content = element.contents().remove();
                return function (scope, element, attrs) {
                    scope.operators = OPERATORS;
                    scope.conditions = CONDITIONS_STRING;
                    scope.dataTypes = DATA_TYPE;
                    scope.typesList = TYPE_AD_SLOT;

                    var groupKey = GROUP_KEY;
                    var groupTYPE = GROUP_TYPE;

                    scope.sortableOptions = {
                        disabled: true,
                        forcePlaceholderSize: true,
                        placeholder: 'sortable-placeholder'
                    };

                    scope.addExpression = addExpression;
                    scope.enableDragDropQueryBuilder = enableDragDropQueryBuilder;
                    scope.selectExpectAdSlot = selectExpectAdSlot;
                    scope.formatPositionLabel = formatPositionLabel;
                    scope.filterEntityType = filterEntityType;
                    scope.expectAdSlotIsDisplay = expectAdSlotIsDisplay;
                    scope.changeHeaderBidPrice = changeHeaderBidPrice;
                    scope.getHeaderName = getHeaderName;
                    scope.removeGroup = removeGroup;

                    function removeGroup(expressions, $index) {
                        expressions.splice($index, 1)
                    }

                    scope.builtVariable = function(expressionDescriptor) {
                        return queryBuilderService.builtVariable(expressionDescriptor)
                    };

                    function selectExpectAdSlot(adSlot, expressionRoot, index) {
                        if(!scope.hideStartingPositionAdTag) {
                            scope.hideStartingPositionAdTag = [];
                        }

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

                        if(!!adSlot.libraryAdSlot && !!expressionRoot) {
                            expressionRoot.expectLibraryAdSlot = adSlot.libraryAdSlot.id;
                        }

                        var adSlotId = !!adSlot.id ? adSlot.id : adSlot;

                        if(adSlot.type == scope.typesList.native) {
                            scope.hideStartingPositionAdTag[index] = true;
                        }
                        if(adSlot.type == scope.typesList.display) {
                            scope.hideStartingPositionAdTag[index] = false;

                            if(!scope.groups[adSlotId]) {
                                // reset group by index
                                scope.groups[adSlotId] = [];

                                DisplayAdSlotManager.one(adSlotId).getList('adtags')
                                    .then(function(adTags) {
                                        scope.groups[adSlotId] = _setupGroup(adTags.plain());
                                    })
                                ;
                            }
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
                            name: null,
                            openStatus: true
                        });
                    }

                    function filterEntityType(adSlot) {
                        if(adSlot.id == null || scope.native) {
                            return true;
                        }
                        else if(!scope.native) {
                            if(adSlot.type == scope.typesList.display) {
                                return true;
                            }

                            if(adSlot.libType == scope.typesList.display) {
                                return true;
                            }

                            return false;
                        }

                        return false;
                    }

                    function changeHeaderBidPrice(expression) {
                        expression.hbBidPrice = expression.hbBidPriceClone
                    }


                    function getHeaderName(ruleName) {
                        ruleName = angular.copy(ruleName);

                        if (!ruleName.name && !ruleName.expectLibraryAdSlot) {
                            return 'New Rule';
                        }

                        if (!ruleName.name) {
                            ruleName.name = '';
                        }

                        if (!ruleName.expectLibraryAdSlot) {
                            return ruleName.name;
                        }

                        var expectLibraryAdSlotObject = null;
                        if(angular.isObject(ruleName.expectLibraryAdSlot)) {
                            expectLibraryAdSlotObject = {libraryAdSlot: ruleName.expectLibraryAdSlot};
                        } else {
                            expectLibraryAdSlotObject = _.find(scope.adSlots,function(adSlot){
                                return adSlot.libraryAdSlot.id == ruleName.expectLibraryAdSlot.id || adSlot.libraryAdSlot.id == ruleName.expectLibraryAdSlot;
                            });
                        }

                        headerName =   expectLibraryAdSlotObject ? (ruleName.name + ' (' + expectLibraryAdSlotObject.libraryAdSlot.name  +')'): ruleName.name;

                        return headerName;
                    }

                    function expectAdSlotIsDisplay(expectAdSlot) {
                        if(angular.isObject(expectAdSlot) && expectAdSlot.type == scope.typesList.display) {
                            return true
                        }

                        var adSlot = _.find(scope.adSlots, function(adSlot) {
                            return adSlot.id == expectAdSlot;
                        });

                        if(!adSlot) {
                            return false
                        }

                        return adSlot.type == scope.typesList.display
                    }

                    function enableDragDropQueryBuilder(enable) {
                        scope.sortableOptions['disabled'] = enable;
                    }

                    function formatPositionLabel(adTags) {
                        var listNameAdTag = [];

                        angular.forEach(adTags, function(adTag) {
                            listNameAdTag.push(adTag.libraryAdTag.name);
                        });

                        var showString = adTags[0].position + ': (' + listNameAdTag.toString().replace(',', ', ') + ')';

                        return showString;
                    }

                    scope.$watch(function() { return scope.adSlots }, function () {
                        if(!scope.adSlots && !scope.groups) {
                            return;
                        }

                        angular.forEach(scope.expressions, function(expressionRoot) {
                            if(angular.isObject(expressionRoot.expectLibraryAdSlot)) {
                                expressionRoot.expectLibraryAdSlot = expressionRoot.expectLibraryAdSlot.id
                            }

                            if(angular.isObject(expressionRoot.expressions)) {
                                if(angular.isObject(expressionRoot.expressions[0].expectAdSlot)) {
                                    expressionRoot.expressions[0].expectAdSlot = expressionRoot.expressions[0].expectAdSlot.id
                                }
                            }

                            delete expressionRoot.id;
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