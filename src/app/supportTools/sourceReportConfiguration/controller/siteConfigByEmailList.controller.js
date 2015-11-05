(function() {
    'use strict';

    angular.module('tagcade.supportTools.sourceReportConfiguration')
        .controller('SiteConfigByEmailList', SiteConfigByEmailList)
    ;

    function SiteConfigByEmailList($scope, $translate, $modal, $state, sourceReportHasConfig, AlertService, sourceReportConfig) {
        $scope.sourceReportHasConfig = sourceReportHasConfig;

        if(!$scope.sourceReportHasConfig.length) {
            AlertService.addAlert({
                type: 'warning',
                message: $translate.instant('SOURCE_CONFIG_MODULE.CURRENTLY_NO_SITE_CONFIG')
            });
        }

        $scope.confirmDeletion = confirmDeletion;
        $scope.addSitesConfigForEmail = addSitesConfigForEmail;

        $scope.tableConfig = {
            itemsPerPage: 10,
            maxPages: 10
        };

        function confirmDeletion(siteConfig){
            var modalInstance = $modal.open({
                templateUrl: 'supportTools/sourceReportConfiguration/views/confirmDeletion.tpl.html'
            });

            modalInstance.result.then(function () {
                return sourceReportConfig.deleteSiteConfig(siteConfig.id)
                    .then(function() {
                        AlertService.addFlash({
                            type: 'success',
                            message: $translate.instant('SOURCE_CONFIG_MODULE.DELETE_SITE_SUCCESS')
                        });
                    })

                    .then(function() {
                        $state.go($state.current, {uniqueRequestCacheBuster: Math.random()});
                    })

                    .catch(function() {
                        AlertService.addAlert({
                            type: 'error',
                            message: $translate.instant('SOURCE_CONFIG_MODULE.DELETE_SITE_FAIL')
                        });
                    });
            })
        }

        function addSitesConfigForEmail() {
            $modal.open({
                templateUrl: 'supportTools/sourceReportConfiguration/views/addSitesConfigForEmail.tpl.html',
                controller: 'AddSitesConfigForEmail',
                size: 'lg',
                resolve: {
                    publishers: /* @ngInject */ function() {
                        return sourceReportConfig.getPublishers()
                    },

                    sourceReportHasConfig: function() {
                        return angular.copy($scope.sourceReportHasConfig);
                    }
                }
            });
        }
    }
})();