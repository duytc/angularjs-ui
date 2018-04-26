(function () {
    'use strict';

    angular
        .module('tagcade.admin.publisherManagement')
        .controller('PublisherForm', PublisherForm)
    ;

    function PublisherForm($scope, $translate, _, headerBiddings, defaultThresholds, adminUserManager, AlertService, ServerErrorProcessor, publisher, historyStorage, HISTORY_TYPE_PATH, COUNTRY_LIST, USER_MODULES){
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
            bidders: [],
            billingConfigs: [],
            tagDomain: {
                secure: true,
                domain: null
            },
            emailSendAlert: null
        };

        if(!$scope.isNew) {
            if(publisher.tagDomain.length == 0) {
                $scope.publisher.tagDomain = {
                    secure: true,
                    domain: null
                };
            }

            if(publisher.billingConfigs.length > 0) {
                angular.forEach(publisher.billingConfigs, function(billingConfig) {
                    if(billingConfig.tiers.length > 0) {
                        _formatTiers(billingConfig.tiers);
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
            { label: 'In-Banner Video', role: 'MODULE_IN_BANNER' },
            { label: 'Source Report', role: 'MODULE_SOURCE_REPORT' },
            { label: 'Unified Report', role: 'MODULE_UNIFIED_REPORT' },
            { label: 'Sub Publisher', role: 'MODULE_SUB_PUBLISHER' },
            { label: 'Header Bidding', role: 'MODULE_HEADER_BIDDING' },
            { label: 'Auto Optimize', role: 'MODULE_AUTO_OPTIMIZE' }
//            { label: 'Fraud Detection', role: 'MODULE_FRAUD_DETECTION' }
        ];

        _formatTiers(defaultThresholds.video);
        _formatTiers(defaultThresholds.display);
        _formatTiers(defaultThresholds['in-banner']);
        _formatTiers(defaultThresholds['header-bidding']);

        $scope.headerBiddings = headerBiddings;
        $scope.defaultThresholds = defaultThresholds;

        $scope.hasModuleEnabled = hasModuleEnabled;
        $scope.toggleModuleRole = toggleModuleRole;
        $scope.isFormValid = isFormValid;
        $scope.backToListPublisher = backToListPublisher;
        $scope.hasBidder = hasBidder;
        $scope.toggleHeaderBidding = toggleHeaderBidding;
        $scope.disabledModule = disabledModule;
        $scope.addEmailSendAlert = addEmailSendAlert;
        $scope.removeEmailSendAlert = removeEmailSendAlert;

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

            // remove module do not display module
            if(role == USER_MODULES.displayAds && $scope.publisher.enabledModules.indexOf(USER_MODULES.displayAds) == -1) {
                if($scope.publisher.enabledModules.indexOf(USER_MODULES.video) > -1) {
                    $scope.publisher.enabledModules.splice($scope.publisher.enabledModules.indexOf(USER_MODULES.video), 1);
                }

                if($scope.publisher.enabledModules.indexOf(USER_MODULES.analytics) > -1) {
                    $scope.publisher.enabledModules.splice($scope.publisher.enabledModules.indexOf(USER_MODULES.analytics), 1);
                }

                if($scope.publisher.enabledModules.indexOf(USER_MODULES.headerBidding) > -1) {
                    $scope.publisher.enabledModules.splice($scope.publisher.enabledModules.indexOf(USER_MODULES.headerBidding), 1);
                }

                // if($scope.publisher.enabledModules.indexOf(USER_MODULES.source) > -1) {
                //     $scope.publisher.enabledModules.splice($scope.publisher.enabledModules.indexOf(USER_MODULES.source), 1);
                // }

                if($scope.publisher.enabledModules.indexOf(USER_MODULES.subPublisher) > -1) {
                    $scope.publisher.enabledModules.splice($scope.publisher.enabledModules.indexOf(USER_MODULES.subPublisher), 1);
                }

                if($scope.publisher.enabledModules.indexOf(USER_MODULES.inBanner) > -1) {
                    $scope.publisher.enabledModules.splice($scope.publisher.enabledModules.indexOf(USER_MODULES.inBanner), 1);
                }
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

        function toggleHeaderBidding(bidder) {
            var bidderIdx = getBidderIdx(bidder);

            if (hasBidder(bidder)) {
                $scope.publisher.bidders.splice(bidderIdx, 1);
            } else {
                $scope.publisher.bidders.push(bidder.abbreviation);
            }
        }

        function disabledModule(module) {
            if((module == USER_MODULES.subPublisher || module == USER_MODULES.headerBidding || module == USER_MODULES.inBanner) && !hasModuleEnabled(USER_MODULES.displayAds)) {
                return true;
            }

            if(module == USER_MODULES.autoOptimize && (!hasModuleEnabled(USER_MODULES.unified) || !hasModuleEnabled(USER_MODULES.displayAds))) {
                return true
            }

            return false;
        }

        function  _formatTiers(tiers) {
            angular.forEach(tiers, function(tier) {
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

        /**
         * Add an Email Send Alert
         */
        function addEmailSendAlert() {
            if (!$scope.publisher.emailSendAlert) {
                $scope.publisher.emailSendAlert = [];
            }

            $scope.publisher.emailSendAlert.push({
                email: null
            })
        }

        /**
         * Remove an Email Send Alert
         * @param index
         */
        function removeEmailSendAlert(index) {
            if(index > -1) {
                $scope.publisher.emailSendAlert.splice(index, 1)
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