(function() {
    'use strict';

    angular.module('tagcade.supportTools.sourceReportConfiguration')
        .controller('CloneSourceReportConfig', CloneSourceReportConfig)
    ;

    function CloneSourceReportConfig($scope, $translate, $state, publishers, emailConfig, sourceReportConfig, AlertService) {
        $scope.publishers = publishers;

        $scope.emailConfig = emailConfig;
        $scope.emailConfig.includedAllSites = $scope.emailConfig.includedAllSitesOfPublishers.length > 0;

        $scope.emailReceive = [{id: 1}];
        $scope.showDetail = false;

        $scope.addEmailInput = addEmailInput;
        $scope.removeEmailInput = removeEmailInput;
        $scope.isFormValid = isFormValid;
        $scope.submit = submit;

        function addEmailInput() {
            var numberEmail = $scope.emailReceive.length+1;
            $scope.emailReceive.push({id : numberEmail})
        }

        function removeEmailInput(email) {
            if($scope.emailReceive.length > 1) {
                $scope.emailReceive.splice($scope.emailReceive.indexOf(email), 1);
            }
        }

        function isFormValid() {
            return $scope.emailReceive.length > 0 && !!$scope.emailReceive[0].email;
        }

        function submit() {
            var emails = [];

            angular.forEach($scope.emailReceive, function(emailReceive) {
                if(emailReceive.email != null) {
                    emails.push(emailReceive.email);
                }
            });

            sourceReportConfig.cloneSourceReportConfig(emailConfig.id, emails)
                .catch(function() {
                    AlertService.addAlert({
                        type: 'error',
                        message: $translate.instant('SOURCE_CONFIG_MODULE.CLONE_EMAIL_FAIL')
                    });
                })
                .then(function () {
                    AlertService.addFlash({
                        type: 'success',
                        message: $translate.instant('SOURCE_CONFIG_MODULE.CLONE_EMAIL_SUCCESS')
                    });
                })
                .then(function() {
                    $state.go($state.current, {uniqueRequestCacheBuster: Math.random()});
                })
        }
    }
})();