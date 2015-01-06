(function () {
    'use strict';

    angular
        .module('tagcade.admin.publisherManagement')
        .controller('PublisherForm', PublisherForm)
    ;

    function PublisherForm($scope, $state, $q, adminUserManager, AlertService, ServerErrorProcessor, publisher) {
        $scope.fieldNameTranslations = {
            username: 'Username',
            email: 'Email',
            billingRate : 'Billing Rate',
            plainPassword: 'Password',
            enabledModules: 'Modules',
            enabled: 'Enabled'
        };

        $scope.isNew = publisher === null;
        $scope.formProcessing = false;

        $scope.publisher = publisher || {
            username: null,
            email: null,
            billingRate : null,
            enabledModules: [],
            enabled: true,
            lastLogin: null
        };

        $scope.modules = [
            { label: 'Display', role: 'MODULE_DISPLAY' },
//            { label: 'Video', role: 'MODULE_VIDEO' },
            { label: 'Analytics', role: 'MODULE_ANALYTICS' },
//            { label: 'Fraud Detection', role: 'MODULE_FRAUD_DETECTION' }
        ];

        $scope.hasModuleEnabled = function (role) {
            return $scope.publisher.enabledModules.indexOf(role) > -1;
        };

        $scope.toggleModuleRole = function (role) {
            var idx = $scope.publisher.enabledModules.indexOf(role);

            if (idx > -1) {
                $scope.publisher.enabledModules.splice(idx, 1);
            } else {
                $scope.publisher.enabledModules.push(role);
            }
        };

        $scope.isFormValid = function() {
            return $scope.userForm.$valid;
        };

        $scope.submit = function() {
            if ($scope.formProcessing) {
                // already running, prevent duplicates
                return;
            }

            $scope.formProcessing = true;

            var saveUser = $scope.isNew ? adminUserManager.post($scope.publisher) : $scope.publisher.patch();

            saveUser
                .catch(
                    function (response) {
                        var errorCheck = ServerErrorProcessor.setFormValidationErrors(response, $scope.userForm, $scope.fieldNameTranslations);
                        $scope.formProcessing = false;

                        return errorCheck;
                    }
                )
                .then(
                    function () {
                        AlertService.addFlash({
                            type: 'success',
                            message: 'The publisher has been updated'
                        });
                    }
                )
                .then(
                    function () {
                        return $state.go('^.list');
                    }
                )
            ;
        };
    }
})();