(function() {
    'use strict';

    angular.module('tagcade.supportTools.sourceReportConfiguration')
        .controller('SiteConfigByEmailList', SiteConfigByEmailList)
    ;

    function SiteConfigByEmailList($scope, $modal, $state, sourceReportHasConfig, AlertService, sourceReportConfig) {
        $scope.sourceReportHasConfig = sourceReportHasConfig;

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
                            message: 'The site config has been deleted'
                        });
                    })

                    .then(function() {
                        $state.reload();
                    })

                    .catch(function() {
                        AlertService.addAlert({
                            type: 'error',
                            message: 'The site config not been deleted'
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