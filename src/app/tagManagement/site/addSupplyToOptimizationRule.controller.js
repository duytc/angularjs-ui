(function () {
    'use strict';

    angular.module('tagcade.tagManagement.site')
        .controller('AddSupplyToOptimizationRule', AddSupplyToOptimizationRule)
    ;

    function AddSupplyToOptimizationRule($scope, $modal, $modalInstance, site, optimizationRules, AutoOptimizeIntegrationManager, historyStorage, AlertService, $translate, $state, HISTORY_TYPE_PATH) {
        $scope.site = site;
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
                    $scope.optimizationConfigs = _filterOptimizationConfigs($scope.optimizationConfigs, $scope.site);

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
                            return [site];
                        },
                        selectedSites: function () {
                            return [site];
                        },
                        selectedAdSlots: function () {
                            return null;
                        }
                    },
                    ncyBreadcrumb: {
                        label: 'Add To OptimizationRule for {{ site.name }}'
                    }
                });

                return modalInstance.result
                    .then(function () {
                        $modalInstance.close();

                        historyStorage.getLocationPath(HISTORY_TYPE_PATH.site, $state.current);

                        AlertService.addFlash({
                            type: 'success',
                            message: $translate.instant('Add To OptimizationRule for Site successfully')
                        });
                    })
                    .catch(function () {
                        $modalInstance.close();
                        //
                        // historyStorage.getLocationPath(HISTORY_TYPE_PATH.site, $state.current);
                        //
                        // AlertService.addFlash({
                        //     type: 'error',
                        //     message: $translate.instant('Add To OptimizationRule for Site failed')
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
            var optimizationConfig = angular.copy($scope.selected.optimizationConfig);
            if (optimizationConfig.supplies && optimizationConfig.supplies.indexOf($scope.site.id) < 0) {
                optimizationConfig.supplies.push($scope.site.id);
            }

            // remove temp fields
            delete optimizationConfig.line;

            // submit
            AutoOptimizeIntegrationManager.one(optimizationConfig.id).patch(optimizationConfig)
                .catch(function () {
                    historyStorage.getLocationPath(HISTORY_TYPE_PATH.site, $state.current);

                    AlertService.addFlash({
                        type: 'error',
                        message: $translate.instant('Add To OptimizationRule for Site failed')
                    });
                })
                .then(function () {
                    historyStorage.getLocationPath(HISTORY_TYPE_PATH.site, $state.current);

                    AlertService.addFlash({
                        type: 'success',
                        message: $translate.instant('Add To OptimizationRule for Site successfully')
                    });
                })
            ;
        }

        function _filterOptimizationConfigs(optimizationConfigs, site) {
            var filteredOptimizationConfigs = [];
            angular.forEach(optimizationConfigs, function (optimizationConfig) {
                var _siteIds = optimizationConfig.supplies;
                if (!_siteIds) {
                    _siteIds = [];
                }

                if (_siteIds.indexOf(site.id) < 0) {
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