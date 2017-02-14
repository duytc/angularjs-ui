(function (){
    'use strict';

    angular.module('tagcade.unifiedReport.dataSource')
        .controller('DataSourceForm', DataSourceForm);

    function DataSourceForm($scope, _, UnifiedReportDataSourceManager, $translate, dataSource, integrations, publishers, AlertService, TIMEZONES, ServerErrorProcessor, historyStorage, HISTORY_TYPE_PATH){
        $scope.publishers = publishers;
        $scope.integrations = integrations;

        $scope.isNew = (dataSource === null);
        $scope.formProcessing = false;
        $scope.integrations.active = false;

        $scope.addNewIntegration = addNewIntegration;
        $scope.removeIntegration = removeIntegration;
        $scope.isFormValid = isFormValid;
        $scope.submit = submit;
        $scope.deleteDataSource = deleteDataSource;
        $scope.backToDataSourceList = backToDataSourceList;
        $scope.removeParams = removeParams;
        $scope.createNewParams = createNewParams;
        $scope.groupEntities = groupEntities;
        $scope.reStringDate = reStringDate;

        function reStringDate(date) {
            return date < 10 ? ('0' + date) : date
        }

        function groupEntities(item){
            if (item == 'EST' || item == 'UTC' || item == 'CST' || item == 'PST') {
                return undefined; // no group
            }

            return ''; // separate group with no name
        }

        function createNewParams(integration, item) {
            var allParamObjects = [];
            var allParams = item.params;
            if (_.isEmpty(allParams)) {
                integration.params = [];
                return;
            }
            _.each(allParams, function (value){
                var newObject = {'key':value, 'value':null};
                allParamObjects.push(newObject);
            });
            integration.params = allParamObjects;

            return integration.params;
        }

        $scope.change = false;
        $scope.dataSource = dataSource || {
                dataSourceIntegrations: [],
                alertSetting: [
                    {
                        type: "wrongFormat",
                        alertTimeZone: null,
                        alertHour: 1,
                        alertMinutes: 0,
                        active: false
                    }, {
                        type:"dataReceived",
                        alertTimeZone: null,
                        alertHour: 1,
                        alertMinutes: 0,
                        active: false
                    }, {
                        type:"notReceived",
                        alertTimeZone: null,
                        alertHour: 1,
                        alertMinutes: 0,
                        active: false
                    }
                ],
                enable: true
        };

        $scope.hours = _.range(0, 24);
        $scope.minutes = _.range(0, 60);
        $scope.timezones = TIMEZONES;

        $scope.fileFormats = [
            {label: 'CSV', key: 'csv'},
            {label: 'Excel', key: 'excel'},
            {label: 'Json', key: 'json'}
        ];

        $scope.frequencies = [
            {label: '3 hours', key: 3},
            {label: '6 hours', key: 6},
            {label: '12 hours', key: 12},
            {label: 'Day', key: 24},
            {label: '2 Day', key: 48}
        ];

        function removeParams(integration, index){
            integration.params.splice(index, 1);
        }

        function addNewIntegration(){
            $scope.dataSource.dataSourceIntegrations.push({
                integration: null,
                active: true,
                params: []
            });
        }

        function removeIntegration(index){
            $scope.dataSource.dataSourceIntegrations.splice(index, 1);
        }

        function isFormValid(){
            return $scope.userForm.$valid;
        }

        function submit(){
            if ($scope.formProcessing) {
                // already running, prevent duplicates
                return;
            }

            $scope.formProcessing = true;

            if (!$scope.isAdmin()) {
                delete $scope.dataSource.publisher;
            }

            var saveDataSource = $scope.isNew ? UnifiedReportDataSourceManager.post($scope.dataSource) : UnifiedReportDataSourceManager.one($scope.dataSource.id).patch($scope.dataSource);

            saveDataSource.catch(function (response){
                var errorCheck = ServerErrorProcessor.setFormValidationErrors(response, $scope.userForm, $scope.fieldNameTranslations);
                $scope.formProcessing = false;

                return errorCheck;
            }).then(function (){
                AlertService.addFlash({
                    type: 'success',
                    message: $scope.isNew ? $translate.instant('UNIFIED_REPORT_DATA_SOURCE_MODULE.ADD_NEW_SUCCESS') : $translate.instant('UNIFIED_REPORT_DATA_SOURCE_MODULE.UPDATE_SUCCESS')
                });
            }).then(function (){
                return historyStorage.getLocationPath(HISTORY_TYPE_PATH.dataSource, '^.list');
            });
        }

        function deleteDataSource(){
            if ($scope.formProcessing) {
                // already running, prevent duplicates
                return;
            }

            $scope.formProcessing = true;

            if (!$scope.isAdmin()) {
                delete $scope.dataSource.publisher;
            }

            var saveDataSource = UnifiedReportDataSourceManager.one($scope.dataSource.id).delete($scope.dataSource);

            saveDataSource.catch(function (response){
                var errorCheck = ServerErrorProcessor.setFormValidationErrors(response, $scope.userForm, $scope.fieldNameTranslations);
                $scope.formProcessing = false;

                return errorCheck;
            }).then(function (){
                AlertService.addFlash({
                    type: 'success',
                    message: $scope.isNew ? $translate.instant('UNIFIED_REPORT_DATA_SOURCE_MODULE.DELETE_SUCCESS') : $translate.instant('UNIFIED_REPORT_DATA_SOURCE_MODULE.UPDATE_SUCCESS')
                });
            }).then(function (){
                return historyStorage.getLocationPath(HISTORY_TYPE_PATH.videoPublisher, '^.list');
            });
        }

        function backToDataSourceList(){
            return historyStorage.getLocationPath(HISTORY_TYPE_PATH.dataSource, '^.list');
        }
    }
})();