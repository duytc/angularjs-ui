(function () {
    'use strict';

    angular.module('tagcade.blocks.queryBuilder')
        .directive('queryBuilder', queryBuilder)
    ;

    function queryBuilder($compile, CONDITIONS_STRING, OPERATORS, GROUP_KEY, GROUP_TYPE, DATA_TYPE, queryBuilderService, AdSlotManager) {
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
                    scope.selectExpectAdSlot = selectExpectAdSlot;
                    scope.getListNameAdTag = getListNameAdTag;

                    scope.sortableOptions = {
                        disabled: true,
                        forcePlaceholderSize: true,
                        placeholder: 'sortable-placeholder'
                    };

                    scope.builtVariable = function(expressionDescriptor) {
                        return queryBuilderService.builtVariable(expressionDescriptor)
                    };


                    function selectExpectAdSlot(adSlot, expressionRoot) {
                        if(!!expressionRoot) {
                            if(!!expressionRoot.startingPosition) {
                                expressionRoot.startingPosition = null;
                            }
                        }

                        if (!adSlot) {
                            return;
                        }

                        var adSlotId = !!adSlot.id ? adSlot.id : adSlot;

                        AdSlotManager.one(adSlotId).getList('adtags')
                            .then(function(adTags) {
                                scope.adTagGroups = _setupGroup(adTags.plain());
                            });
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

                    function enableDragDropQueryBuilder(enable) {
                        scope.sortableOptions['disabled'] = enable;
                    }

                    function getListNameAdTag(group) {
                        var listNameAdTag = [];

                        angular.forEach(group, function(adTag) {
                            listNameAdTag.push(adTag.name);
                        });

                        var showString = group[0].position + ': (' + listNameAdTag.toString().replace(',', ', ') + ')';

                        return showString;
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