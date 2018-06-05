(function() {
    'use strict';

    angular.module('tagcade.unifiedReport.autoOptimizeIntegration')
        .controller('AutoOptimizeIntegrationList', AutoOptimizeIntegrationList)
    ;

    function AutoOptimizeIntegrationList($scope, $q, $translate, $modal, AlertService, AutoOptimizeIntegrationManager, AutoOptimizationManager,
                                         autoOptimizeIntegrations, AtSortableService, HISTORY_TYPE_PATH, historyStorage, optimizationRule) {
        $scope.autoOptimizeIntegrations = autoOptimizeIntegrations;
        $scope.optimizationRule = optimizationRule;
        $scope.hasData = function () {
            return !!autoOptimizeIntegrations.length;
        };

        if (!$scope.hasData()) {
            AlertService.replaceAlerts({
                type: 'warning',
                message: $translate.instant('AUTO_OPTIMIZE_INTEGRATION_MODULE.CURRENTLY_NO_INTEGRATION')
            });
        }

        $scope.tableConfig = {
            itemsPerPage: 10,
            maxPages: 10
        };

        $scope.showPagination = showPagination;
        $scope.toggleStatus = toggleStatus;
        $scope.backToOptimizedRuleList = backToOptimizedRuleList;
        $scope.confirmDeletion = confirmDeletion;
        $scope.optimizeNow = optimizeNow;

        function optimizeNow(integration) {
            AutoOptimizeIntegrationManager.one(integration.id).one('optimizenow').get()
                .then(function () {
                        if (integration.optimizationAlerts === "notifyMeBeforeMakingChange") {
                            AlertService.replaceAlerts({
                                type: 'error',
                                message: $translate.instant('AUTO_OPTIMIZE_INTEGRATION_MODULE.OPTIMIZE_NOW_MESSAGE')
                            });
                        }else {
                            AlertService.replaceAlerts({
                                type: 'success',
                                message: $translate.instant('AUTO_OPTIMIZE_INTEGRATION_MODULE.OPTIMIZATION_UPDATED')
                            });
                        }

                    },
                    function (err) {
                        AlertService.replaceAlerts({
                            type: 'error',
                            message: err.data.message
                        });
                    })

        }
        
        function toggleStatus(auto) {
            var newStatus = !auto.active;

            AutoOptimizeIntegrationManager.one(auto.id).patch({
                'active': newStatus
            }).catch(function () {
                    AlertService.replaceAlerts({
                        type: 'error',
                        message: $translate.instant('AUTO_OPTIMIZE_INTEGRATION_MODULE.CHANGE_STATUS_FAIL')
                    });

                    return $q.reject($translate.instant('AUTO_OPTIMIZE_INTEGRATION_MODULE.CHANGE_STATUS_FAIL'));
                })
                .then(function () {
                    auto.active = newStatus;
                })
            ;
        }

        function confirmDeletion(autoOptimizeIntegration, index) {
            var modalInstance = $modal.open({
                templateUrl: 'unifiedReport/autoOptimizeIntegration/confirmDeletion.tpl.html'
            });

            modalInstance.result.then(function () {
                return AutoOptimizeIntegrationManager.one(autoOptimizeIntegration.id).remove()
                    .then(
                        function () {
                            var index = autoOptimizeIntegrations.indexOf(autoOptimizeIntegration);

                            if (index > -1) {
                                autoOptimizeIntegrations.splice(index, 1);
                            }

                            $scope.autoOptimizeIntegrations = autoOptimizeIntegrations;

                            if($scope.tableConfig.currentPage > 0 && autoOptimizeIntegrations.length/10 == $scope.tableConfig.currentPage) {
                                AtSortableService.insertParamForUrl({page: $scope.tableConfig.currentPage});
                                $scope.tableConfig.currentPage =- 1;
                            }

                            AlertService.replaceAlerts({
                                type: 'success',
                                message: $translate.instant('AUTO_OPTIMIZE_INTEGRATION_MODULE.DELETE_SUCCESS')
                            });
                        },
                        function () {
                            AlertService.replaceAlerts({
                                type: 'danger',
                                message:  $translate.instant('AUTO_OPTIMIZE_INTEGRATION_MODULE.DELETE_FAIL')
                            });
                        }
                    )
                    ;
            });
        }

        function backToOptimizedRuleList() {
            return historyStorage.getLocationPath(HISTORY_TYPE_PATH.autoOptimization, '^.^.autoOptimization.list');
        }

        function showPagination() {
            return angular.isArray($scope.autoOptimizeIntegrations) && $scope.autoOptimizeIntegrations.length > $scope.tableConfig.itemsPerPage;
        }

        $scope.$on('$locationChangeSuccess', function() {
            historyStorage.setParamsHistoryCurrent(HISTORY_TYPE_PATH.autoOptimizeIntegration)
        });
    }
})();