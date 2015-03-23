(function() {
    'use strict';

    angular.module('tagcade.supportTools.sourceReportConfiguration')
        .controller('EmailConfigsEdit', EmailConfigsEdit)
    ;

    function EmailConfigsEdit($scope, $state, emailConfig, AlertService, sourceReportConfig) {
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