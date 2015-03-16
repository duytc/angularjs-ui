(function() {
    'use strict';

    angular.module('tagcade.supportTools.sourceReportConfiguration')
        .controller('AddSitesConfigForEmail', AddSitesConfigForEmail)
    ;

    function AddSitesConfigForEmail($scope, $state, publishers, sourceReportHasConfig, sourceReportConfig, AlertService) {
        $scope.sourceReportHasConfig = sourceReportHasConfig;
        $scope.sitesConfigSucceed = $scope.sourceReportHasConfig.sourceReportSiteConfigs;
        $scope.sitesNoConfig = [];

        $scope.sitesHasConfig = [];

        $scope.publishers = publishers;

        $scope.selectPublisher = selectPublisher;
        $scope.sitesHasConfigPush = sitesHasConfigPush;
        $scope.sitesHasConfigPushAll = sitesHasConfigPushAll;
        $scope.sitesHasConfigDrop = sitesHasConfigDrop;
        $scope.sitesHasConfigDropAll = sitesHasConfigDropAll;
        $scope.isFormValid = isFormValid;
        $scope.submit = submit;

        function selectPublisher(publisherId) {
            sourceReportConfig.getSiteByPublisher(publisherId)
                .then(function(sites) {
                    var siteConfig = $scope.sitesHasConfig.concat(_sitesParser($scope.sitesConfigSucceed));

                    $scope.sitesNoConfig = sourceReportConfig.getSitesNoConfig(siteConfig, sites);
                });
        }

        function _sitesParser(sourceReportSiteConfigs) {
            var sites = [];
            angular.forEach(sourceReportSiteConfigs, function(sourceReportSite) {
                sites.push(sourceReportSite.site);
            });

            return sites;
        }

        function sitesHasConfigPush(site) {
            $scope.sitesHasConfig.push(site);
            $scope.sitesNoConfig.splice($scope.sitesNoConfig.indexOf(site), 1);
        }

        function sitesHasConfigPushAll(allSites) {
            angular.forEach(allSites, function(site) {
                $scope.sitesHasConfig.push(site);
            });

            $scope.sitesNoConfig = [];
        }

        function sitesHasConfigDrop(site) {
            $scope.sitesNoConfig.push(site);
            $scope.sitesHasConfig.splice($scope.sitesHasConfig.indexOf(site), 1);
        }

        function sitesHasConfigDropAll(allSites) {
            angular.forEach(allSites, function(site) {
                $scope.sitesNoConfig.push(site);
            });

            $scope.sitesHasConfig = [];
        }

        function isFormValid() {
            return $scope.sitesHasConfig.length > 0 ;
        }

        function submit() {
            var sites = [];

            angular.forEach($scope.sitesHasConfig, function(site) {
                if(site.id != null) {
                    sites.push(site.id);
                }
            });

            return sourceReportConfig.postSiteForEmail($scope.sourceReportHasConfig.id, sites)
                .then(function() {
                    AlertService.addFlash({
                        type: 'success',
                        message: 'The email config has been updated'
                    });
                })

                .then(function() {
                    $state.reload();
                })

                .catch(function() {
                    AlertService.addAlert({
                        type: 'error',
                        message: 'The email config is not updated'
                    });
                });
        }
    }
})();