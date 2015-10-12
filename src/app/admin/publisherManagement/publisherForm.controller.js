(function () {
    'use strict';

    angular
        .module('tagcade.admin.publisherManagement')
        .controller('PublisherForm', PublisherForm)
    ;

    function PublisherForm($scope, $translate, adminUserManager, AlertService, ServerErrorProcessor, publisher, historyStorage, HISTORY_TYPE_PATH, COUNTRY_LIST) {
        $scope.fieldNameTranslations = {
            username: 'Username',
            plainPassword: 'Password',
            company: 'company'
        };

        $scope.isNew = publisher === null;
        $scope.formProcessing = false;

        $scope.countries = COUNTRY_LIST;

        $scope.publisher = publisher || {
            username: null,
            email: null,
            billingRate : null,
            enabledModules: [],
            enabled: true,
            lastLogin: null,
            firstName: null,
            lastName: null,
            company: null,
            phone: null,
            city: null,
            state: null,
            address: null,
            postalCode: null,
            country: null
        };

        $scope.modules = [
            { label: 'Display', role: 'MODULE_DISPLAY' },
            { label: 'Analytics', role: 'MODULE_ANALYTICS' },
            { label: 'Video Analytics', role: 'MODULE_VIDEO_ANALYTICS' }
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
            if($scope.publisher.plainPassword != null || $scope.repeatPassword != null) {
                return $scope.userForm.$valid && $scope.repeatPassword == $scope.publisher.plainPassword;
            }

            return $scope.userForm.$valid;
        };

        $scope.backToListPublisher = function() {
            return historyStorage.getLocationPath(HISTORY_TYPE_PATH.publisher, '^.list');
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
                            message: $translate.instant('PUBLISHER_MODULE.ADD_NEW_SUCCESS')
                        });
                    }
                )
                .then(
                    function () {
                        return historyStorage.getLocationPath(HISTORY_TYPE_PATH.publisher, '^.list');
                    }
                )
            ;
        };
    }
})();