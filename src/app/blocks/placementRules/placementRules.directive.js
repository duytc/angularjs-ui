(function () {
    'use strict';

    angular.module('tagcade.blocks.placementRules')
        .directive('placementRules', placementRules)
    ;

    function placementRules($compile) {
        'use strict';

        return {
            scope: {
                rules: '=',
                videoPublishers: '='
            },
            restrict: 'AE',
            templateUrl: 'blocks/placementRules/placementRules.tpl.html',
            compile: function (element, attrs) {
                var content, directive;
                content = element.contents().remove();
                return function (scope, element, attrs) {
                    scope.ruleTypes = [
                        {key: 1, value: "Fixed Profit"},
                        {key: 2, value: "Profit Margin"},
                        {key: 3, value: "Manual"}
                    ];

                    scope.addNewPlacementRule = addNewPlacementRule;
                    scope.removePlacementRule = removePlacementRule;

                    function addNewPlacementRule() {
                        scope.rules.push({profitType: null, profitValue: null, publishers: []});
                    }

                    function removePlacementRule(index) {
                        scope.rules.splice(index,1);
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