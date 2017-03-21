(function() {
    'use strict';

    angular.module('tagcade.tagManagement.domainList')
        .controller('BlockListForm', BlockListForm)
    ;

    function BlockListForm($scope, $stateParams, $translate, domain, publishers, AlertService, adNetworks, BlockListManager, ServerErrorProcessor, historyStorage, HISTORY_TYPE_PATH, DOMAINS_LIST_SEPARATOR) {
        $scope.fieldNameTranslations = {
            name: 'Name',
            domains: 'Domain'
        };

        $scope.isNew = domain === null;
        $scope.formProcessing = false;

        $scope.publishers = publishers;
        $scope.adNetworks = adNetworks;
        $scope.domain = domain || {
            name: null,
            domains: [],
            networkBlacklists: [],
            isDefault: false
        };

        $scope.domainList = $scope.domain.domains || [];

        if(!$scope.isNew) {
            var networkBlacklists = [];
            angular.forEach(angular.copy($scope.domain.networkBlacklists), function(networkBlacklist) {
                networkBlacklists.push(networkBlacklist.adNetwork)
            });

            $scope.domain.networkBlacklists = networkBlacklists;

            angular.forEach($scope.adNetworks, function(adNetwork) {
                var index = _.findIndex($scope.domain.networkBlacklists, function (networkBlacklist) {
                    return !!networkBlacklist && networkBlacklist.id == adNetwork.id
                });

                if(index > -1) {
                    adNetwork['ticked'] = true;
                }
            });

        }

        $scope.backToListDomain = backToListDomain;
        $scope.selectPublisher = selectPublisher;
        $scope.isFormValid = isFormValid;
        $scope.submit = submit;
        $scope.addDomain = addDomain;

        function addDomain(query) {
            var hasSeparator = false;

            angular.forEach(DOMAINS_LIST_SEPARATOR, function(key) {
                if(query.indexOf(key) > -1 && !hasSeparator) {
                    hasSeparator = true;
                    var domains = query.split(key);

                    angular.forEach(domains, function(domain, index) {
                        if(!/^(?:[-A-Za-z0-9]+\.)+[A-Za-z]{2,6}$/.test(domain)) {
                            return
                        }

                        if($scope.domainList.indexOf(domain) > -1) {
                            return
                        }

                        $scope.domainList.push(domain);
                        $scope.domain.domains.push(domain);
                    });
                }
            });

            if(hasSeparator) {
                return '';
            }

            if(!/^(?:[-A-Za-z0-9]+\.)+[A-Za-z]{2,6}$/.test(query)) {
                return
            }

            if($scope.domainList.indexOf(query) > -1) {
                return
            }

            return query;
        }

        function backToListDomain() {
            if($stateParams.adNetworkId) {
                return historyStorage.getLocationPath(HISTORY_TYPE_PATH.blockList, '^.listByAdNetwork', {id: $stateParams.adNetworkId});
            }

            return historyStorage.getLocationPath(HISTORY_TYPE_PATH.blockList, '^.blockList');
        }

        function selectPublisher(publisher) {
        }

        function isFormValid() {
            return $scope.domainForm.$valid && $scope.domain.domains.length > 0;
        }

        function submit() {
            if ($scope.formProcessing) {
                // already running, prevent duplicates
                return;
            }

            $scope.formProcessing = true;
            delete $scope.domain.suffixKey;

            var networkBlacklists = [];

            angular.forEach($scope.domain.networkBlacklists, function (networkBlacklist) {
                if(!!networkBlacklist) {
                    networkBlacklists.push({adNetwork: networkBlacklist.id});
                }
            });

            angular.forEach(angular.copy($scope.domain.domains), function (domain) {
                if(domain == '' && !domain) {
                    var index = $scope.domain.domains.indexOf(domain);

                    if(index > -1) {
                        $scope.domain.domains.splice(index, 1)
                    }
                }
            });

            $scope.domain.networkBlacklists = networkBlacklists;

            var saveDomain = $scope.isNew ? BlockListManager.post($scope.domain) : $scope.domain.patch();
            saveDomain
                .catch(
                function (response) {
                    var errorCheck = ServerErrorProcessor.setFormValidationErrors(response, $scope.domainForm, $scope.fieldNameTranslations);
                    $scope.formProcessing = false;

                    return errorCheck;
                })
                .then(
                function () {
                    AlertService.addFlash({
                        type: 'success',
                        message: $scope.isNew ? $translate.instant('DOMAIN_LIST_MODULE.ADD_NEW_BLACK_LIST_SUCCESS') : $translate.instant('DOMAIN_LIST_MODULE.UPDATE_BLACK_LIST_SUCCESS')
                    });
                })
                .then(
                function () {
                    backToListDomain()
                })
            ;
        }
    }
})();