(function() {
    'use strict';

    angular.module('tagcade.videoManagement.domainList')
        .controller('DomainListForm', DomainListForm)
    ;

    function DomainListForm($scope, $state, $translate, domain, publishers, AlertService, BlackListManager, WhiteListManager, ServerErrorProcessor, historyStorage, HISTORY_TYPE_PATH, DOMAINS_LIST_SEPARATOR) {
        var blackList;
        $scope.blackList = blackList = !!$state.params.blackList;
        $scope.fieldNameTranslations = {
            name: 'Name',
            domains: 'Domain'
        };

        var domainOld = angular.copy(domain);
        $scope.isNew = domain === null;
        $scope.formProcessing = false;

        $scope.publishers = publishers;

        $scope.domain = domain || {
            name: null,
            domains: []
        };

        $scope.domainList = domainOld.domains;

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
            var state = blackList ? '^.blackList' : '^.whiteList';
            return historyStorage.getLocationPath(HISTORY_TYPE_PATH.domainList, state);
        }

        function selectPublisher(publisher) {
        }

        function isFormValid() {
            return $scope.domainForm.$valid;
        }

        function submit() {
            if ($scope.formProcessing) {
                // already running, prevent duplicates
                return;
            }

            $scope.formProcessing = true;
            delete $scope.domain.suffixKey;

            var postManager = blackList ? BlackListManager: WhiteListManager;
            var saveDomain = $scope.isNew ? postManager.post($scope.domain) : $scope.domain.patch();
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
                        message: $scope.isNew ? (blackList ? $translate.instant('DOMAIN_LIST_MODULE.ADD_NEW_BLACK_LIST_SUCCESS') : $translate.instant('DOMAIN_LIST_MODULE.UPDATE_BLACK_LIST_SUCCESS')) : (blackList ? $translate.instant('DOMAIN_LIST_MODULE.ADD_NEW_WHITE_LIST_SUCCESS') : $translate.instant('DOMAIN_LIST_MODULE.UPDATE_WHITE_LIST_SUCCESS'))
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