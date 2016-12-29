(function () {
    'use strict';

    angular
        .module('tagcade.videoManagement.videoPublisher')
        .controller('VideoPublisherForm', VideoPublisherForm)
    ;

    function VideoPublisherForm($scope, $filter, $translate, VideoPublisherManager, AlertService, ServerErrorProcessor, publishers, videoPublisher, historyStorage, HISTORY_TYPE_PATH, COUNTRY_LIST) {
        $scope.fieldNameTranslations = {
            name: 'Name'
        };

        $scope.isNew = videoPublisher === null;
        $scope.formProcessing = false;

        $scope.publishers = publishers;
        $scope.videoPublisher = videoPublisher || {
            name: null
        };

        $scope.isFormValid = function() {
            return $scope.userForm.$valid;
        };

        $scope.backToListPublisher = function() {
            return historyStorage.getLocationPath(HISTORY_TYPE_PATH.videoPublisher, '^.list');
        };

        $scope.selectPublisher = function(publisher) {
        };


        $scope.submit = function() {

            if ($scope.formProcessing) {
                // already running, prevent duplicates
                return;
            }

            $scope.formProcessing = true;

            if(!$scope.isAdmin()) {
                delete $scope.videoPublisher.publisher;
            }

            var saveUser = $scope.isNew ? VideoPublisherManager.post($scope.videoPublisher) : VideoPublisherManager.one($scope.videoPublisher.id).patch($scope.videoPublisher);

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
                        return historyStorage.getLocationPath(HISTORY_TYPE_PATH.videoPublisher, '^.list');
                    }
                )
            ;
        };
    }
})();