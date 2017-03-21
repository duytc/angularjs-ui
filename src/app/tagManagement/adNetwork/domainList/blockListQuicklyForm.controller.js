(function() {
    'use strict';

    angular.module('tagcade.tagManagement.adNetwork')
        .controller('BlockListQuicklyForm', BlockListQuicklyForm)
    ;

    function BlockListQuicklyForm($scope, _, Auth, $modalInstance, $translate, domain, publishers, publisher, AlertService, BlockListManager, ServerErrorProcessor, DOMAINS_LIST_SEPARATOR) {
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

            var actionManager = $scope.isNew ? BlockListManager.post(domainClone): BlockListManager.one(domainClone.id).patch(domainClone);
            actionManager
                .catch(
                function (response) {
                    var errorCheck = ServerErrorProcessor.setFormValidationErrors(response, $scope.domainForm, $scope.fieldNameTranslations);
                    $scope.formProcessing = false;

                    if(!$scope.isNew) {
                        angular.extend($scope.domain, domainOld);
                    }

                    $modalInstance.dismiss();

                    return errorCheck;
                })
                .then(
                function (domainResponse) {
                    if($scope.isNew) {
                        angular.extend($scope.domain, domainResponse);
                    }

                    AlertService.replaceAlerts({
                        type: 'success',
                        message: ($scope.isNew ? $translate.instant('AD_NETWORK_MODULE.ADD_NEW_BLACK_LIST_SUCCESS') : $translate.instant('AD_NETWORK_MODULE.UPDATE_BLACK_LIST_SUCCESS'))
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