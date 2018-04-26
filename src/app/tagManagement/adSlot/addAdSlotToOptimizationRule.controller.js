(function () {
    'use strict';

    angular.module('tagcade.tagManagement.adSlot')
        .controller('AddAdSlotToOptimizationRule', AddAdSlotToOptimizationRule)
    ;

    function AddAdSlotToOptimizationRule($scope, $modal, $modalInstance, adSlot, optimizationRules, AutoOptimizeIntegrationManager, historyStorage, AlertService, $translate, $state, HISTORY_TYPE_PATH) {
        $scope.adSlot = adSlot;
        $scope.optimizationRules = optimizationRules;
        $scope.optimizationConfigs = [];

        $scope.selected = {
            optimizationRule: null,
            optimizationConfig: null
        };

        $scope.selectOptimizationRule = selectOptimizationRule;
        $scope.selectOptimizationConfig = selectOptimizationConfig;
        $scope.groupEntities = groupEntities;
        $scope.isFormValid = isFormValid;
        $scope.submit = submit;

        function selectOptimizationRule(optimizationRule) {
            return AutoOptimizeIntegrationManager.getList({optimizationRule: optimizationRule.id})
                .catch(function () {
                    $scope.optimizationConfigs = [];
                })
                .then(function (autoOptimizeIntegrations) {
                    $scope.optimizationConfigs = autoOptimizeIntegrations.plain();
                    $scope.optimizationConfigs = _filterOptimizationConfigs($scope.optimizationConfigs, $scope.adSlot);

                    angular.forEach($scope.optimizationConfigs, function (config) {
                        config.line = true;
                    });

                    $scope.optimizationConfigs.push({
                        name: 'Create New...',
                        temp: true
                    });
                });
        }

        function selectOptimizationConfig(optimizationConfig) {
            if (_isCreateNewOptimizationConfig(optimizationConfig)) {
                /* submit create new */
                var modalInstance = $modal.open({
                    templateUrl: 'unifiedReport/autoOptimizeIntegration/autoOptimizeIntegrationForm.tpl.html',
                    size: 'lg',
                    controller: 'AutoOptimizeIntegrationForm',
                    resolve: {
                        autoOptimizeIntegration: function () {
                            return null;
                        },
                        optimizationRule: function () {
                            return $scope.selected.optimizationRule;
                        },
                        sites: function () {
                            return [$scope.adSlot.site];
                        },
                        selectedSites: function () {
                            return [$scope.adSlot.site];
                        },
                        selectedAdSlots: function () {
                            return [$scope.adSlot];
                        }
                    },
                    ncyBreadcrumb: {
                        label: 'Add To OptimizationRule for: {{ adSlot.libraryAdSlot.name }}'
                    }
                });

                return modalInstance.result
                    .then(function () {
                        $modalInstance.close();

                        historyStorage.getLocationPath(HISTORY_TYPE_PATH.adSlot, $state.current);

                        AlertService.addFlash({
                            type: 'success',
                            message: $translate.instant('Add To OptimizationRule for Ad Slot successfully')
                        });
                    })
                    .catch(function () {
                        $modalInstance.close();
                        //
                        // historyStorage.getLocationPath(HISTORY_TYPE_PATH.adSlot, $state.current);
                        //
                        // AlertService.addFlash({
                        //     type: 'error',
                        //     message: $translate.instant('Add To OptimizationRule for Ad Slot failed')
                        // });
                    });
            }
        }

        function groupEntities(item) {
            if (item.line) {
                return undefined; // no group
            }

            return ''; // separate group with no name
        }

        function isFormValid() {
            return true; // $scope.adTagMapping.$valid;
        }

        function submit() {
            $modalInstance.close();

            if (_isCreateNewOptimizationConfig($scope.selected.optimizationConfig)) {
                return;
            }

            /* submit edit sites for config */
            // add site to config if not have
            var _site = $scope.adSlot.site;
            var optimizationConfig = angular.copy($scope.selected.optimizationConfig);
            if (optimizationConfig.supplies && optimizationConfig.supplies.indexOf(_site.id) < 0) {
                optimizationConfig.supplies.push(_site.id);
            }

            // add ad slot to config if not have
            if (optimizationConfig.adSlots && optimizationConfig.adSlots.indexOf($scope.adSlot.id) < 0) {
                optimizationConfig.adSlots.push($scope.adSlot.id);
            }

            // remove temp fields
            delete optimizationConfig.line;

            // submit
            AutoOptimizeIntegrationManager.one(optimizationConfig.id).patch(optimizationConfig)
                .catch(function () {
                    historyStorage.getLocationPath(HISTORY_TYPE_PATH.adSlot, $state.current);

                    AlertService.addFlash({
                        type: 'error',
                        message: $translate.instant('Add To OptimizationRule for Ad Slot failed')
                    });
                })
                .then(function () {
                    historyStorage.getLocationPath(HISTORY_TYPE_PATH.adSlot, $state.current);

                    AlertService.addFlash({
                        type: 'success',
                        message: $translate.instant('Add To OptimizationRule for Ad Slot successfully')
                    });
                })
            ;
        }

        function _filterOptimizationConfigs(optimizationConfigs, adSlot) {
            var filteredOptimizationConfigs = [];
            angular.forEach(optimizationConfigs, function (optimizationConfig) {
                var _adSlotIds = optimizationConfig.adSlots;
                if (!_adSlotIds) {
                    _adSlotIds = [];
                }

                if (_adSlotIds.indexOf(adSlot.id) < 0) {
                    filteredOptimizationConfigs.push(optimizationConfig);
                }
            });

            return filteredOptimizationConfigs;
        }

        function _isCreateNewOptimizationConfig(optimizationConfig) {
            return (optimizationConfig.name == 'Create New...' && optimizationConfig.temp);
        }
    }
})();