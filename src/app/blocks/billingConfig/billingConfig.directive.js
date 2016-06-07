(function () {
    'use strict';

    angular.module('tagcade.blocks.billingConfig')
        .directive('billingConfig', billingConfig)
    ;

    function billingConfig($compile, _, MODULES_BILLING_CONFIG, BILLING_FACTORS) {
        'use strict';

        return {
            scope: {
                billingConfigs: '=',
                publisher: '='
            },
            restrict: 'AE',
            templateUrl: 'blocks/billingConfig/billingConfig.tpl.html',
            compile: function (element, attrs) {
                var content, directive;
                content = element.contents().remove();
                return function (scope, element, attrs) {
                    scope.modules = MODULES_BILLING_CONFIG;
                    scope.billingFactors = BILLING_FACTORS;

                    if(scope.billingConfigs.length == 0) {
                        angular.forEach(scope.modules, function(module) {
                            scope.billingConfigs.push({
                                module: module.role,
                                defaultConfig: true,
                                tiers: [],
                                billingFactor: module.role == 'MODULE_DISPLAY' ? 'SLOT_OPPORTUNITY' : 'VIDEO_IMPRESSION' //set default billing factor
                            });
                        })
                    } else {
                        angular.forEach(scope.modules, function(module) {
                            var index = _.findIndex(scope.billingConfigs, function(billingConfig) {
                                return billingConfig.module == module.role
                            });

                            if(index == -1) {
                                scope.billingConfigs.push({
                                    module: module.role,
                                    defaultConfig: true,
                                    tiers: [],
                                    billingFactor: module.role == 'MODULE_DISPLAY' ? 'SLOT_OPPORTUNITY' : 'VIDEO_IMPRESSION' //set default billing factor
                                });
                            }
                        });

                        angular.forEach(scope.billingConfigs, function(billingConfig) {
                            var thresholdIZero = _.findIndex(billingConfig.tiers, function(tier) {
                                return tier.threshold == 0 || tier.threshold == '0';
                            });

                            if(thresholdIZero == -1) {
                                billingConfig.tiers.unshift({
                                    cpmRate: null,
                                    threshold: 0,
                                    number: 1000
                                })
                            }

                            delete billingConfig.id;
                            delete billingConfig.publisher;
                            delete billingConfig.publisherId;
                        })
                    }

                    scope.getLabelModuleConfig = function(role) {
                        return _.find(scope.modules, function(module) {
                            return module.role == role;
                        }).label
                    };

                    scope.getBillingFactorsForModule = function(module, billingConfig) {
                        var billingFactors = [];

                        angular.forEach(scope.billingFactors, function(billingFactor) {
                            if(billingFactor.supportForModule.indexOf(module) > -1) {
                                billingFactors.push(billingFactor);
                            }
                        });

                        if(billingFactors.length == 1) {
                            billingConfig.billingFactor = billingFactors[0].key;
                        }

                        return billingFactors;
                    };

                    scope.removeDefaultConfig = function(billingConfig) {
                        var thresholdIZero = _.findIndex(billingConfig.tiers, function(tier) {
                            return tier.threshold == 0;
                        });

                        if(!billingConfig.defaultConfig && (billingConfig.tiers.length == 0 || thresholdIZero == -1)) {
                            billingConfig.tiers.unshift({
                                threshold: 0,
                                cpmRate: billingConfig.module == 'MODULE_HEADER_BIDDING' ? 0 : null,
                                number: 1000
                            })
                        }
                    };

                    scope.hasModuleEnabled = function (role) {
                        return scope.publisher.enabledModules.indexOf(role) > -1;
                    };

                    scope.addTier = function(billingConfig) {
                        billingConfig.tiers.push({
                            threshold: null,
                            cpmRate: null,
                            number: 1000
                        })
                    };

                    scope.removeTier = function(index, billingConfig) {
                        billingConfig.tiers.splice(index, 1);

                        if(billingConfig.tiers.length == 0) {
                            billingConfig.defaultConfig = true;
                        }
                    };

                    directive || (directive = $compile(content));

                    element.append(directive(scope, function ($compile) {
                        return $compile;
                    }));
                }
            }
        };
    }
})();