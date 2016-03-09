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
            exchanges: [],
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

            if(!$scope.publisher.exchanges) {
                $scope.publisher.exchanges = []
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

        $scope.hasModuleEnabled = hasModuleEnabled;
        $scope.exchanges = exchanges;
        $scope.toggleModuleRole = toggleModuleRole;
        $scope.isFormValid = isFormValid;
        $scope.backToListPublisher = backToListPublisher;
        $scope.hasExchange = hasExchange;
        $scope.toggleExchange = toggleExchange;

        /**
         * check if current Publisher has a module enabled
         *
         * @param role
         * @return {boolean}
         */
        function hasModuleEnabled(role) {
            return $scope.publisher.enabledModules.indexOf(role) > -1;
        }

        /**
         * handle event toggle module roles
         *
         * @param role
         */
        function toggleModuleRole(role) {
            var idx = $scope.publisher.enabledModules.indexOf(role);

            if (idx > -1) {
                $scope.publisher.enabledModules.splice(idx, 1);
            } else {
                $scope.publisher.enabledModules.push(role);
            }
        }

        /**
         * Check if form is valid
         *
         * @return {boolean}
         */
        function isFormValid() {
            if($scope.publisher.plainPassword != null || $scope.repeatPassword != null) {
                return $scope.userForm.$valid && $scope.repeatPassword == $scope.publisher.plainPassword;
            }

            return $scope.userForm.$valid;
        }

        /**
         * navigate back list Publishers
         *
         * @return {*}
         */
        function backToListPublisher() {
            return historyStorage.getLocationPath(HISTORY_TYPE_PATH.publisher, '^.list');
        }

        /**
         * check if publisher already has an exchange, search by abbreviation of exchange
         *
         * @param {Object} exchange
         * @param {String} exchange.abbreviation
         * @return {boolean}
         */
        function hasExchange(exchange) {
            var idx = getExchangeIdx(exchange);

            return idx !== false && idx > -1;
        }

        /**
         * get idx of an exchange of current publisher, search by abbreviation of exchange
         *
         * @param {Object} exchange
         * @param {String} exchange.abbreviation
         * @return {*}
         */
        function getExchangeIdx(exchange)
        {
            if (!$scope.publisher.exchanges) {
                return false;
            }

            return _.findIndex($scope.publisher.exchanges, function (publisherExchange) {
                return exchange.abbreviation == publisherExchange
            });
        }

        /**
         * handle event toggleExchange
         *
         * @param {Object} exchange
         */
        function toggleExchange(exchange) {
            var exchangeIdx = getExchangeIdx(exchange);

            if (hasExchange(exchange)) {
                $scope.publisher.exchanges.splice(exchangeIdx, 1);
            } else {
                // !VERY IMPORTANT HERE: make exchange object "contains id" same as old data in $scope.publisher.exchanges
                // DON'T GET SAME MISTAKE AGAIN!!!
                $scope.publisher.exchanges.push(exchange.abbreviation);
            }
        }

        $scope.submit = function() {
            if ($scope.formProcessing) {
                // already running, prevent duplicates
                return;
            }

            var publisher = angular.copy($scope.publisher);

            if(!publisher.tagDomain.domain) {
                publisher.tagDomain = null;
            }

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