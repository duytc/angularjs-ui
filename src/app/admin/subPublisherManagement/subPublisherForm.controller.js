(function () {
    'use strict';

    angular
        .module('tagcade.admin.subPublisher')
        .controller('SubPublisherForm', SubPublisherForm)
    ;

    function SubPublisherForm($scope, $filter, $translate, _, subPublisherRestangular, AlertService, sites, ServerErrorProcessor, publishers, subPublisher, historyStorage, HISTORY_TYPE_PATH, COUNTRY_LIST) {
        $scope.fieldNameTranslations = {
            username: 'Username',
            plainPassword: 'Password',
            company: 'Company'
        };

        $scope.isNew = subPublisher === null;
        $scope.formProcessing = false;
        $scope.countries = COUNTRY_LIST;

        $scope.sites = !$scope.isAdmin() ? sites : [];
        $scope.publishers = publishers;
        $scope.siteData = [];

        $scope.subPublisher = subPublisher || {
            username: null,
            email: null,
            subPublisherSites: [],
            enabled: true
        };

        if(!$scope.isNew) {
            $scope.sites = $filter('selectedPublisher')(sites, subPublisher.publisher);

            angular.forEach($scope.subPublisher.subPublisherSites, function(data) {
                var index = _.findLastIndex(sites, {id: data.site.id});
                if(index >= 0) {
                    sites[index]['ticked'] = true;
                    $scope.siteData.push(sites[index]);
                }
            });
        }

        $scope.isFormValid = function() {
            if($scope.subPublisher.plainPassword != null || $scope.repeatPassword != null) {
                return $scope.userForm.$valid && $scope.repeatPassword == $scope.subPublisher.plainPassword;
            }

            return $scope.userForm.$valid;
        };

        $scope.backToListPublisher = function() {
            return historyStorage.getLocationPath(HISTORY_TYPE_PATH.subPublisher, '^.list');
        };

        $scope.selectPublisher = function(publisher) {
            $scope.sites = $filter('selectedPublisher')(sites, publisher);

            $scope.siteData = [];
        };

        $scope.submit = function() {
            if ($scope.formProcessing) {
                // already running, prevent duplicates
                return;
            }

            $scope.formProcessing = true;

            delete $scope.subPublisher.enabledModules;
            delete $scope.subPublisher.lastLogin;

            if(!$scope.isAdmin()) {
                delete $scope.subPublisher.publisher;
            }

            $scope.subPublisher.subPublisherSites = [];
            angular.forEach($scope.siteData, function(site) {
                $scope.subPublisher.subPublisherSites.push({site: site.id});
            });

            var saveUser = $scope.isNew ? subPublisherRestangular.one('subpublishers').post(null, $scope.subPublisher) : $scope.subPublisher.patch();

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
                        return historyStorage.getLocationPath(HISTORY_TYPE_PATH.subPublisher, '^.list');
                    }
                )
            ;
        };
    }
})();