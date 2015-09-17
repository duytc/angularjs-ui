(function() {
    'use strict';

    angular.module('tagcade.supportTools.sourceReportConfiguration')
        .controller('EmailConfigsEdit', EmailConfigsEdit)
    ;

    function EmailConfigsEdit($scope, $translate, $state, emailConfig, AlertService, sourceReportConfig) {
        $scope.emailReceive = emailConfig;

        $scope.isFormValid = isFormValid;
        $scope.submit = submit;

        function isFormValid() {
            return $scope.sourceReportConfig.$valid;
        }

        function submit() {
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