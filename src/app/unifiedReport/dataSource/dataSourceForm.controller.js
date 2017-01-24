(function (){
	'use strict';

	angular.module('tagcade.unifiedReport.dataSource')
		.controller('DataSourceForm', DataSourceForm);

	function DataSourceForm($scope, UnifiedReportDataSourceManager, $translate, dataSource, integrations, publishers, AlertService, NumberConvertUtil, ServerErrorProcessor, historyStorage, HISTORY_TYPE_PATH){
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
        $scope.addNewParams = addNewParams;
        $scope.removeParams = removeParams;
        
		$scope.change = false;
		$scope.dataSource = dataSource || {
				dataSourceIntegrations: [],
				alertSetting: [],
				enable: true
			};

		$scope.alertSetting = {
			wrongFormat: _.contains($scope.dataSource.alertSetting, "wrongFormat"),
			dataReceived: _.contains($scope.dataSource.alertSetting, "dataReceived"),
			notReceived: _.contains($scope.dataSource.alertSetting, "notReceived")
		};

		$scope.fileFormats = [{
			label: 'CSV',
			key: 'csv'
		}, {
			label: 'Excel',
			key: 'excel'
		}, {
			label: 'Json',
			key: 'json'
		}];

		$scope.frequencies = [
		    {label: '3 hours', key: 3},
            {label: '6 hours', key: 6},
            {label: '12 hours', key: 12},
            {label: 'Day', key: 24},
            {label: '2 Day', key: 48}
        ];

        function removeParams(integration, index) {
            integration.params.splice(index, 1)
        }

        function addNewParams(integration) {
            integration.params.push({key: null, value: null})
        }

		function addNewIntegration(){
			$scope.dataSource.dataSourceIntegrations.push({
				integration: null,
				// username: null,
				// password: null,
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

			_setAlertSettingForDataSource($scope.alertSetting);

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

		function _setAlertSettingForDataSource(alertSetting){

			$scope.dataSource.alertSetting = [];

			if (alertSetting.wrongFormat) {
				$scope.dataSource.alertSetting.push('wrongFormat');
			}

			if (alertSetting.dataReceived) {
				$scope.dataSource.alertSetting.push('dataReceived');
			}

			if (alertSetting.notReceived) {
				$scope.dataSource.alertSetting.push('notReceived');
			}

			return $scope.dataSource;
		}
	}
})();