(function() {
    'use strict';

    angular.module('tagcade.tagManagement.domainList')
        .controller('WhiteListForm', WhiteListForm)
    ;

    function WhiteListForm($scope, $stateParams, $translate, domain, publishers, AlertService, adNetworks, DisplayWhiteListManager, ServerErrorProcessor, historyStorage, HISTORY_TYPE_PATH, DOMAINS_LIST_SEPARATOR) {
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
            networkWhiteLists: []
        };

        $scope.domainList = $scope.domain.domains || [];

        if(!$scope.isNew) {
            var networkWhiteLists = [];
            angular.forEach(angular.copy($scope.domain.networkWhiteLists), function(networkWhiteList) {
                networkWhiteLists.push(networkWhiteList.adNetwork)
            });

            $scope.domain.networkWhiteLists = networkWhiteLists;

            angular.forEach($scope.adNetworks, function(adNetwork) {
                var index = _.findIndex($scope.domain.networkWhiteLists, function (networkWhiteList) {
                    return !!networkWhiteList && networkWhiteList.id == adNetwork.id
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
                return historyStorage.getLocationPath(HISTORY_TYPE_PATH.whiteList, '^.whiteListByAdNetwork', {id: $stateParams.adNetworkId});
            }

            return historyStorage.getLocationPath(HISTORY_TYPE_PATH.whiteList, '^.whiteList');
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

            var networkWhiteLists = [];

            angular.forEach($scope.domain.networkWhiteLists, function (networkWhiteList) {
                if(!!networkWhiteList) {
                    networkWhiteLists.push({adNetwork: networkWhiteList.id});
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

            $scope.domain.networkWhiteLists = networkWhiteLists;

            var saveDomain = $scope.isNew ? DisplayWhiteListManager.post($scope.domain) : $scope.domain.patch();
            saveDomain
                .then(
                    function () {
                        AlertService.addFlash({
                            type: 'success',
                            message: $scope.isNew ? $translate.instant('DOMAIN_LIST_MODULE.ADD_NEW_WHITE_LIST_SUCCESS') : $translate.instant('DOMAIN_LIST_MODULE.UPDATE_WHITE_LIST_SUCCESS')
                        });

                        backToListDomain()
                    })
                .catch(
                function (response) {
                    $scope.formProcessing = false;

                    if(!response.data.errors) {
                        AlertService.replaceAlerts({
                            type: 'error',
                            message: response.data.message
                        });

                        return;
                    }

                    var errorCheck = ServerErrorProcessor.setFormValidationErrors(response, $scope.domainForm, $scope.fieldNameTranslations);

                    return errorCheck;
                })
            ;
        }
    }
})();