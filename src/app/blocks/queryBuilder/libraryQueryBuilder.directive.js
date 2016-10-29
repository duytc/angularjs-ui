(function () {
    'use strict';

    angular.module('tagcade.blocks.queryBuilder')
        .directive('libraryQueryBuilder', libraryQueryBuilder)
    ;

    function libraryQueryBuilder($compile, _, CONDITIONS_STRING, OPERATORS, GROUP_KEY, GROUP_TYPE, DATA_TYPE, TYPE_AD_SLOT, queryBuilderService, DisplayAdSlotLibrariesManager) {
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
            templateUrl: 'blocks/queryBuilder/libraryQueryBuilder.tpl.html',
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
                    var headerName =  null;
                    scope.status = {
                        isFirstOpen: false
                    };

                    scope.addExpression = addExpression;
                    scope.enableDragDropQueryBuilder = enableDragDropQueryBuilder;
                    scope.selectExpectAdSlot = selectExpectAdSlot;
                    scope.formatPositionLabel = formatPositionLabel;
                    scope.filterEntityType = filterEntityType;
                    scope.expectAdSlotIsDisplay = expectAdSlotIsDisplay;
                    scope.changeHeaderBidPrice = changeHeaderBidPrice;
                    scope.getHeaderName = getHeaderName;
                    scope.isCollapsedRule = isCollapsedRule;

                    scope.sortableOptions = {
                        disabled: true,
                        forcePlaceholderSize: true,
                        placeholder: 'sortable-placeholder'
                    };

                    scope.builtVariable = function(expressionDescriptor) {
                        return queryBuilderService.builtVariable(expressionDescriptor)
                    };

                    function selectExpectAdSlot(adSlot, expressionRoot, index) {
                        if (!scope.hideStartingPositionAdTag) {
                            scope.hideStartingPositionAdTag = [];
                        }

                        if (!scope.groups) {
                            scope.groups = [];
                        }

                        if (!!expressionRoot) {
                            if(!!expressionRoot.startingPosition) {
                                expressionRoot.startingPosition = null;
                            }
                        }

                        if (!adSlot) {
                            return;
                        }

                        var adSlotId = !!adSlot.id ? adSlot.id : adSlot;

                        if (adSlot.libType == scope.typesList.native) {
                            scope.hideStartingPositionAdTag[index] = true;
                        }
                        if (adSlot.libType == scope.typesList.display) {
                            scope.hideStartingPositionAdTag[index] = false;

                            if(!scope.groups[adSlotId]) {
                                // reset group by index
                                scope.groups[adSlotId] = [];

                                DisplayAdSlotLibrariesManager.one(adSlotId).getList('adtags')
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
                            expectLibraryAdSlot: null,
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

                    var hasCheckExpectAdSlotIsDisplay = false;

                    function expectAdSlotIsDisplay(expectAdSlot) {
                        if(hasCheckExpectAdSlotIsDisplay) {
                            return true;
                        }

                        if(angular.isObject(expectAdSlot) && expectAdSlot.libType == scope.typesList.display) {
                            hasCheckExpectAdSlotIsDisplay = true;
                            return true
                        }

                        var adSlot = _.find(scope.adSlots, function(adSlot) {
                            return adSlot.id == expectAdSlot;
                        });

                        if(!adSlot) {
                            return false
                        }

                        return adSlot.libType == scope.typesList.display || adSlot.type == scope.typesList.display
                    }

                    function changeHeaderBidPrice(expression) {
                        expression.hbBidPrice = expression.hbBidPriceClone
                    }

                    function getHeaderName(ruleName) {

                        ruleName = angular.copy(ruleName);

                        if (!ruleName.name && !ruleName.expectLibraryAdSlot) {
                            return null;
                        }

                        if (!ruleName.name) {
                            ruleName.name = '';
                        }

                        if (!ruleName.expectLibraryAdSlot) {
                            return ruleName.name;
                        }

                        var expectLibraryAdSlotObject = _.find(scope.adSlots,function(adSlot){
                            return adSlot.id == ruleName.expectLibraryAdSlot.id || adSlot.id == ruleName.expectLibraryAdSlot;
                        });

                        headerName =   expectLibraryAdSlotObject ? (ruleName.name + ' (' + expectLibraryAdSlotObject.name  +')'): ruleName.name;
                        return headerName;
                    }

                    function isCollapsedRule(expression) {
                        console.log("test");
                        return (expression.name ==  null && expression.expectLibraryAdSlot == null);
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

                    scope.$watch(function() {
                        return scope.adSlots
                    }, function() {
                        if (!scope.adSlots && !scope.groups) {
                            return;
                        }

                        angular.forEach(scope.expressions, function(expressionRoot) {
                            if (angular.isObject(expressionRoot.expectLibraryAdSlot)) {
                                expressionRoot.expectLibraryAdSlot = expressionRoot.expectLibraryAdSlot.id;
                            }
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