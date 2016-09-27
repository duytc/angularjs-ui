(function () {
    'use strict';

    angular
        .module('tagcade.admin.publisherManagement')
        .controller('PublisherForm', PublisherForm)
    ;

    function PublisherForm($scope, $translate, _, exchanges, headerBiddings, adminUserManager, AlertService, ServerErrorProcessor, publisher, historyStorage, HISTORY_TYPE_PATH, COUNTRY_LIST, USER_MODULES){
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
            bidders: [],
            billingConfigs: [],
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

            if(publisher.billingConfigs.length > 0) {
                angular.forEach(publisher.billingConfigs, function(billingConfig) {
                    if(billingConfig.tiers.length > 0) {
                        angular.forEach(billingConfig.tiers, function(tier) {
                            if(1000000000 <= tier.threshold) {
                                tier.threshold = tier.threshold/1000000000;
                                tier.number = 1000000000;
                            }
                            else if(1000000 <= tier.threshold && tier.threshold < 1000000000) {
                                tier.threshold = tier.threshold/1000000;
                                tier.number = 1000000;
                            } else {
                                tier.threshold = tier.threshold/1000;
                                tier.number = 1000;
                            }
                        })
                    }
                })
            }

            if(publisher.enabledModules.indexOf(USER_MODULES.video) > -1 || publisher.enabledModules.indexOf(USER_MODULES.analytics) > -1) {
                if(publisher.enabledModules.indexOf(USER_MODULES.source) == -1) {
                    publisher.enabledModules.push(USER_MODULES.source);
                }
            }
        }

        $scope.modules = [
            { label: 'Display', role: 'MODULE_DISPLAY' },
            { label: 'Video', role: 'MODULE_VIDEO' },
            { label: 'Source Report', role: 'MODULE_SOURCE_REPORT' },
            { label: 'Unified Report', role: 'MODULE_UNIFIED_REPORT' },
            { label: 'RTB (Real Time Bidding)', role: 'MODULE_RTB' },
            { label: 'Sub Publisher', role: 'MODULE_SUB_PUBLISHER' },
            { label: 'Header Bidding', role: 'MODULE_HEADER_BIDDING' }
//            { label: 'Fraud Detection', role: 'MODULE_FRAUD_DETECTION' }
        ];

        $scope.exchanges = exchanges;
        $scope.headerBiddings = headerBiddings;

        $scope.hasModuleEnabled = hasModuleEnabled;
        $scope.toggleModuleRole = toggleModuleRole;
        $scope.isFormValid = isFormValid;
        $scope.backToListPublisher = backToListPublisher;
        $scope.hasExchange = hasExchange;
        $scope.hasBidder = hasBidder;
        $scope.toggleExchange = toggleExchange;
        $scope.toggleHeaderBidding = toggleHeaderBidding;

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

            if(role == USER_MODULES.source) { // Note: These code support for API. Replace Video Source Module by video and analytic module
                if($scope.publisher.enabledModules.indexOf(USER_MODULES.video) == -1 || $scope.publisher.enabledModules.indexOf(USER_MODULES.analytics) == -1) {
                    $scope.publisher.enabledModules.push(USER_MODULES.video);
                    $scope.publisher.enabledModules.push(USER_MODULES.analytics);
                } else {
                    $scope.publisher.enabledModules.splice($scope.publisher.enabledModules.indexOf(USER_MODULES.video), 1);
                    $scope.publisher.enabledModules.splice($scope.publisher.enabledModules.indexOf(USER_MODULES.analytics), 1);
                }
            }

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
         * check if publisher already has an bidder, search by abbreviation of bidder
         *
         * @param {Object} bidder
         * @param {String} bidder.abbreviation
         * @return {boolean}
         */
        function hasBidder(bidder) {
            var idx = getBidderIdx(bidder);

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
         * get idx of an bidder of current publisher, search by abbreviation of bidder
         *
         * @param {Object} bidder
         * @param {String} bidder.abbreviation
         * @return {*}
         */
        function getBidderIdx(bidder)
        {
            if (!$scope.publisher.bidders) {
                return false;
            }

            return _.findIndex($scope.publisher.bidders, function (publisherBidder) {
                return bidder.abbreviation == publisherBidder
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

        function toggleHeaderBidding(bidder) {
            var bidderIdx = getBidderIdx(bidder);

            if (hasBidder(bidder)) {
                $scope.publisher.bidders.splice(bidderIdx, 1);
            } else {
                $scope.publisher.bidders.push(bidder.abbreviation);
            }
        }

        $scope.submit = function() {
            if ($scope.formProcessing) {
                // already running, prevent duplicates
                return;
            }

            var publisher = angular.copy($scope.publisher);

            var billingConfigsCopy = angular.copy(publisher.billingConfigs);
            publisher.billingConfigs = [];

            angular.forEach(billingConfigsCopy, function(billingConfig) {
                if(publisher.enabledModules.indexOf(billingConfig.module) == -1) {
                    return;
                }

                angular.forEach(billingConfig.tiers, function(tier) {
                    if(Number(tier.number) == 1000000) {
                        tier.threshold = tier.threshold * 1000000;
                    } else if(Number(tier.number) == 1000000000) {
                        tier.threshold = tier.threshold * 1000000000;
                    } else {
                        tier.threshold = tier.threshold * 1000;
                    }

                    delete tier.number;
                });

                publisher.billingConfigs.push(billingConfig);
            });

            var indexModuleSourceReport = publisher.enabledModules.indexOf(USER_MODULES.source);
            // remove source module
            if(indexModuleSourceReport > -1) {
                publisher.enabledModules.splice(indexModuleSourceReport, 1);
            }

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
                            message: $scope.isNew ? $translate.instant('PUBLISHER_MODULE.ADD_NEW_SUCCESS') : $translate.instant('PUBLISHER_MODULE.UPDATE_SUCCESS')
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