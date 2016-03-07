(function () {
    'use strict';

    angular
        .module('tagcade.admin.publisherManagement')
        .controller('PublisherForm', PublisherForm)
    ;

    function PublisherForm($scope, $translate, _, exchanges, adminUserManager, AlertService, ServerErrorProcessor, publisher, historyStorage, HISTORY_TYPE_PATH, COUNTRY_LIST) {
        $scope.fieldNameTranslations = {
            username: 'Username',
            plainPassword: 'Password',
            company: 'Company',
            tagDomain: 'Tag Domain'
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
            country: null,
            publisherExchanges: [],
            tagDomain: {
                secure: true,
                domain: null
            }
        };

        if(!$scope.isNew) {
            if(publisher.tagDomain.length == 0) {
                $scope.publisher.tagDomain = {
                    secure: true,
                    domain: null
                };
            }

            if(!$scope.publisher.publisherExchanges) {
                $scope.publisher.publisherExchanges = []
            }
        }

        $scope.modules = [
            { label: 'Display', role: 'MODULE_DISPLAY' },
            { label: 'Analytics', role: 'MODULE_ANALYTICS' },
            { label: 'Video Analytics', role: 'MODULE_VIDEO_ANALYTICS' },
            { label: 'Unified Report', role: 'MODULE_UNIFIED_REPORT' },
            { label: 'RTB (Real Time Bidding)', role: 'MODULE_RTB' },
            { label: 'Sub Publisher', role: 'MODULE_SUB_PUBLISHER' }
//            { label: 'Fraud Detection', role: 'MODULE_FRAUD_DETECTION' }
        ];

        $scope.exchanges = exchanges;

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

        $scope.hasExchange = function (exchange) {
            if(!$scope.publisher.publisherExchanges) {
                return false;
            }

            return _.findIndex($scope.publisher.publisherExchanges, function(publisherExchange) {
                    return exchange == publisherExchange.exchange.id
                }) > -1;
        };

        $scope.toggleExchange= function (exchangeId) {
            var idx =  _.findIndex($scope.publisher.publisherExchanges, function(publisherExchange) {
                return exchangeId == publisherExchange.exchange.id
            });

            if (idx > -1) {
                $scope.publisher.publisherExchanges.splice(idx, 1);
            } else {
                // !VERY IMPORTANT HERE: make exchange object "contains id" same as old data in $scope.publisher.publisherExchanges
                // DON'T GET SAME MISTAKE AGAIN!!!
                $scope.publisher.publisherExchanges.push({exchange: {id: exchangeId}});
            }
        };

        $scope.submit = function() {
            if ($scope.formProcessing) {
                // already running, prevent duplicates
                return;
            }

            var publisher = angular.copy($scope.publisher);

            if(!publisher.tagDomain.domain) {
                publisher.tagDomain = null;
            }

            var publisherExchanges = [];

            angular.forEach(publisher.publisherExchanges, function(publisherExchange) {
                publisherExchanges.push({exchange: publisherExchange.exchange.id || publisherExchange.exchange});
            });

            publisher.publisherExchanges = publisherExchanges;

            $scope.formProcessing = true;

            var saveUser = $scope.isNew ? adminUserManager.post(publisher) : adminUserManager.one(publisher.id).patch(publisher);

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