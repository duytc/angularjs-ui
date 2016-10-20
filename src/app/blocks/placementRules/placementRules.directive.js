(function () {
    'use strict';

    angular.module('tagcade.blocks.placementRules')
        .directive('placementRules',  placementRules)
    ;

    function placementRules($compile) {
        'use strict';

        return {
            scope: {
                rules: '=',
                videoPublishers: '=',
                sellPrice: '=',
                waterfallTags: '='
            },
            restrict: 'AE',
            templateUrl: 'blocks/placementRules/placementRules.tpl.html',
            compile: function (element, attrs) {
                var content, directive;
                content = element.contents().remove();

                return function (scope, element, attrs) {

                    console.log('value in directive:',scope.sellPrice);
                    console.log('Video Publisher in Directive:', scope.videoPublishers);

                    scope.profiltValueLabel = 'Profit Value';
                    scope.requiredBuyPrice = scope.sellPrice;
                    var waterfallTags = angular.copy(scope.waterfallTags);
                    console.log("Waterfall tag in compiler", waterfallTags);
                    scope.ruleTypes = [
                        {key: 1, value: "Fixed Profit"},
                        {key: 2, value: "Profit Margin"},
                        {key: 3, value: "Manual"}
                    ];

                    scope.addNewPlacementRule = addNewPlacementRule;
                    scope.removePlacementRule = removePlacementRule;
                    scope.changeProfitValueLabel = changeProfitValueLabel;
                    scope.changeRequireBuyPrice = changeRequireBuyPrice;
                    scope.changeWaterfallTags = changeWaterfallTags;

                    function addNewPlacementRule() {
                        scope.rules.push({profitType: 3, profitValue: null, position:null, priority: null, rotationWeight:null, waterfalls: null, publishers: []});
                    }

                    function removePlacementRule(index) {
                        scope.rules.splice(index, 1);
                    }

                    function changeProfitValueLabel($item) {
                        switch ($item.key) {
                            case 1:
                                scope.profiltValueLabel = 'Profit Value ($)';
                                break;
                            case 2:
                                scope.profiltValueLabel = 'Profit Value (%)';
                                break;
                            default:
                                scope.profiltValueLabel = 'Profit Value';
                                break;
                        }
                    }

                    function changeRequireBuyPrice(inputValue, inputType) {
                        switch (inputType) {
                            case 1:
                                var requireBuyPriceByFixProfit = scope.sellPrice - inputValue;
                                scope.requiredBuyPrice = requireBuyPriceByFixProfit > 0 ? requireBuyPriceByFixProfit : 0;
                                break;
                            case 2:
                                var requireBuyPriceByMarginProfit = scope.sellPrice - inputValue*scope.sellPrice/100;
                                scope.requiredBuyPrice = requireBuyPriceByMarginProfit > 0 ? requireBuyPriceByMarginProfit : 0;
                                break;
                            default:
                                scope.requiredBuyPrice = scope.sellPrice;
                                break;
                        }
                    }

                    function changeWaterfallTags(publishers) {
                        console.log("Publisher after filter", publishers);
                       /* scope.waterfallTags = _.filter(waterfallTags , function(waterfallTag){
                            return _.contains(publishers, waterfallTag.videoPublisher.id);
                        });

                        console.log("Value after filter", scope.waterfallTags);*/
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