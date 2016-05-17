(function() {
    'use strict';

    angular.module('tagcade.exchangeManagement')
        .controller('ExchangeForm', ExchangeForm)
    ;

    function ExchangeForm($scope, $translate, exchange, ExchangeManager, ServerErrorProcessor, AlertService, historyStorage, HISTORY_TYPE_PATH) {
        $scope.fieldNameTranslations = {
            name: 'Name',
            canonicalName: 'Abbreviation'
        };

        $scope.isNew = exchange === null;
        $scope.formProcessing = false;

        $scope.exchange = exchange || {
            name: null,
            canonicalName: null
        };

        $scope.isFormValid = function() {
            return $scope.exchangeForm.$valid;
        };

        $scope.submit = function() {
            if ($scope.formProcessing) {
                // already running, prevent duplicates
                return;
            }

            $scope.formProcessing = true;

            var saveInvoice = $scope.isNew ? ExchangeManager.post($scope.exchange) : $scope.exchange.patch();
            saveInvoice
                .catch(
                function (response) {
                    var errorCheck = ServerErrorProcessor.setFormValidationErrors(response, $scope.exchangeForm, $scope.fieldNameTranslations);
                    $scope.formProcessing = false;

                    return errorCheck;
                })
                .then(
                function () {
                    AlertService.addFlash({
                        type: 'success',
                        message: $scope.isNew ? $translate.instant('EXCHANGE_MODULE.ADD_NEW_SUCCESS') : $translate.instant('EXCHANGE_MODULE.UPDATE_SUCCESS')
                    });
                })
                .then(
                function () {
                    return historyStorage.getLocationPath(HISTORY_TYPE_PATH.exchange, '^.list');
                })
            ;
        };
    }
})();