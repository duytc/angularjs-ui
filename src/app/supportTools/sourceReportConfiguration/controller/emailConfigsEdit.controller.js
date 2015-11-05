(function() {
    'use strict';

    angular.module('tagcade.supportTools.sourceReportConfiguration')
        .controller('EmailConfigsEdit', EmailConfigsEdit)
    ;

    function EmailConfigsEdit($scope, $translate, $state, publishers, emailConfig, AlertService, sourceReportConfig) {
        $scope.emailReceive = emailConfig;
        $scope.publishers = publishers;

        $scope.selected = {
            includedAllSitesOfPublishers: emailConfig.includedAllSitesOfPublishers,
            includedAll: emailConfig.includedAll,
            includedAllSites: emailConfig.includedAllSitesOfPublishers.length > 0
        };

        $scope.isFormValid = isFormValid;
        $scope.submit = submit;

        function isFormValid() {
            if($scope.selected.includedAllSites) {
                return $scope.sourceReportConfig.$valid && $scope.selected.includedAllSitesOfPublishers.length > 0;
            }

            return $scope.sourceReportConfig.$valid;
        }

        function submit() {
            $scope.emailReceive.includedAllSitesOfPublishers = [];
            $scope.emailReceive.includedAll = $scope.selected.includedAll;

            if(!!$scope.selected.includedAllSites) {
                angular.forEach($scope.selected.includedAllSitesOfPublishers, function(publisher) {
                    if(publisher.id != null) {
                        $scope.emailReceive.includedAllSitesOfPublishers.push(publisher.id);
                    }
                });
            }

            return sourceReportConfig.updateEmailConfig($scope.emailReceive)
                .then(function() {
                    AlertService.addFlash({
                        type: 'success',
                        message: $translate.instant('SOURCE_CONFIG_MODULE.UPDATE_EMAIL_SUCCESS')
                    });
                })

                .then(function() {
                    $state.go($state.current, {uniqueRequestCacheBuster: Math.random()});
                })

                .catch(function() {
                    AlertService.addAlert({
                        type: 'error',
                        message: $translate.instant('SOURCE_CONFIG_MODULE.UPDATE_EMAIL_FAIL')
                    });
                });
        }
    }
})();