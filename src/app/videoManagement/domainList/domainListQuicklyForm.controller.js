(function() {
    'use strict';

    angular.module('tagcade.videoManagement.domainList')
        .controller('DomainListQuicklyForm', DomainListQuicklyForm)
    ;

    function DomainListQuicklyForm($scope, _, Auth, blackList, $modalInstance, $translate, domain, publishers, publisher, AlertService, BlackListManager, WhiteListManager, ServerErrorProcessor, DOMAINS_LIST_SEPARATOR) {
        $scope.blackList = blackList;
        $scope.fieldNameTranslations = {
            name: 'Name',
            domains: 'Domain'
        };

        var domainOld = angular.copy(domain);
        $scope.isNew = !domain.name;

        $scope.isAdmin = Auth.isAdmin();
        $scope.formProcessing = false;
        $scope.publishers = publishers;
        $scope.domainList = domainOld.domains;

        $scope.domain = domain;

        if(!!publisher) {
            $scope.domain.publisher = publisher;
        }

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

            var domainClone = angular.copy($scope.domain);
            delete domainClone.suffixKey;
            domainClone.domains = _.without(domainClone.domains, '');
            if(!$scope.isAdmin) {
                delete domainClone.publisher
            }

            $scope.formProcessing = true;

            var Manager = blackList ? BlackListManager: WhiteListManager;
            var actionManager = $scope.isNew ? Manager.post(domainClone): Manager.one(domainClone.id).patch(domainClone);
            actionManager
                .catch(
                function (response) {
                    var errorCheck = ServerErrorProcessor.setFormValidationErrors(response, $scope.domainForm, $scope.fieldNameTranslations);
                    $scope.formProcessing = false;

                    if(!$scope.isNew) {
                        angular.extend($scope.domain, domainOld);
                    }

                    return errorCheck;
                })
                .then(
                function (domainResponse) {
                    if($scope.isNew) {
                        angular.extend($scope.domain, domainResponse);
                    }

                    AlertService.addAlert({
                        type: 'success',
                        message: blackList ? ($scope.isNew ? $translate.instant('DOMAIN_LIST_MODULE.ADD_NEW_BLACK_LIST_SUCCESS') : $translate.instant('DOMAIN_LIST_MODULE.UPDATE_BLACK_LIST_SUCCESS')) : ($scope.isNew ? $translate.instant('DOMAIN_LIST_MODULE.UPDATE_BLACK_LIST_SUCCESS') : $translate.instant('DOMAIN_LIST_MODULE.UPDATE_WHITE_LIST_SUCCESS'))
                    });
                })
                .then(
                function () {
                    $modalInstance.close();
                }
            )
            ;
        }
    }
})();