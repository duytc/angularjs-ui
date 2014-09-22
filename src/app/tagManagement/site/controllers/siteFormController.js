angular.module('tagcade.tagManagement.site')

    .controller('SiteFormController', function ($scope, $state, $q, SiteManager, AlertService, ServerErrorProcessor, site, publishers) {
        'use strict';

        $scope.fieldNameTranslations = {
            name: 'Name',
            domain: 'Domain'
        };

        $scope.isNew = site === null;
        $scope.formProcessing = false;

        $scope.allowPublisherSelection = $scope.userSession.isAdmin() && !!publishers;
        $scope.publishers = publishers;

        $scope.site = site || {
            name: null,
            domain: null
        };

        $scope.isFormValid = function() {
            return $scope.siteForm.$valid;
        };

        $scope.submit = function() {
            if ($scope.formProcessing) {
                // already running, prevent duplicates
                return;
            }

            $scope.formProcessing = true;

            var saveSite = $scope.isNew ? SiteManager.post($scope.site) : $scope.site.patch();

            saveSite
                .catch(
                    function (response) {
                        var errorCheck = ServerErrorProcessor.setFormValidationErrors(response, $scope.siteForm, $scope.fieldNameTranslations);
                        $scope.formProcessing = false;

                        return errorCheck;
                    }
                )
                .then(
                    function () {
                        AlertService.addFlash({
                            type: 'success',
                            message: 'The site has been ' + ($scope.isNew ? 'created' : 'updated')
                        });
                    }
                )
                .then(
                    function () {
                        return $state.go('^.list');
                    }
                )
            ;
        };
    })

;