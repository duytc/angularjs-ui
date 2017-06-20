(function (){
    'use strict';

    angular.module('tagcade.unifiedReport.dataSource')
        .controller('DataSourceForm', DataSourceForm);

    function DataSourceForm($scope, _, UnifiedReportDataSourceManager, DataSourceIntegration, $translate, dataSource, integrations, publishers, AlertService, dateUtil, ServerErrorProcessor, historyStorage, HISTORY_TYPE_PATH){
        $scope.publishers = publishers;
        $scope.integrations = integrations;

        $scope.isNew = dataSource === null;
        $scope.formProcessing = false;
        $scope.integrations.active = false;
        $scope.dynamicDatePickerOpts = [
            {key: 'yesterday', label: 'Yesterday'},
            {key: 'last 2 days', label: 'Last 2 Days'},
            {key: 'last 3 days', label: 'Last 3 Days'},
            {key: 'last 4 days', label: 'Last 4 Days'},
            {key: 'last 5 days', label: 'Last 5 Days'},
            {key: 'last 6 days', label: 'Last 6 Days'},
            {key: 'last week', label: 'Last Week'}
        ];

        $scope.integrationTypes = [
            {key: 'checkEvery', label: 'Check Every'},
            {key: 'checkAt', label: 'Check At'}
        ];

        $scope.datePickerOpts = {
            singleDatePicker: true
        };

        $scope.change = false;
        $scope.dataSource = dataSource || {
            dataSourceIntegrations: [
                {
                    integration: null,
                    active: true,
                    params: [],
                    backFill: false,
                    // backFillForce: false,
                    backFillStartDate: {
                        startDate: null,
                        endDate: null
                    },
                    backFillEndDate: {
                        startDate: null,
                        endDate: null
                    },
                    schedule: {
                        checked: 'checkAt',
                        checkEvery:  { hour: null },
                        checkAt: [{timeZone: null, hour: 1, minutes: 0}]
                    }
                }
            ],
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
            enable: true,
            useIntegration: false
        };

        $scope.hours = _.range(0, 24);
        $scope.minutes = _.range(0, 60);

        $scope.timezonesForIntegration = [
            {key: 'UTC', label: 'UTC'},
            {key: 'EST5EDT', label: 'EST'},
            {key: 'CST6CDT', label: 'CST'},
            {key: 'PST8PDT', label: ' PST'}
        ];

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
            {label: '2 Days', key: 48}
        ];

        angular.forEach($scope.dataSource.dataSourceIntegrations, function (dataSourceIntegration) {
            angular.forEach(dataSourceIntegration.params, function (param) {
                if(param.type == 'date') {
                    param.value = {
                        startDate: param.value,
                        endDate: param.value
                    };
                }

                if(param.type == 'option') {
                    var integration = _.find($scope.integrations, function (integration) {
                        return integration.id == dataSourceIntegration.integration || integration.id == dataSourceIntegration.integration.id
                    });

                    var paramOption = _.find(integration.params, function (paramOption) {
                        return paramOption.key == param.key
                    });

                    if(!!paramOption) {
                        param.optionValues = paramOption.optionValues;
                    }
                }
            });

            if(!angular.isObject(dataSourceIntegration.backFillStartDate)) {
                dataSourceIntegration.backFillStartDate = {
                    startDate: dataSourceIntegration.backFillStartDate,
                    endDate: dataSourceIntegration.backFillStartDate
                }
            }

            if(!angular.isObject(dataSourceIntegration.backFillEndDate)) {
                dataSourceIntegration.backFillEndDate = {
                    startDate: dataSourceIntegration.backFillEndDate,
                    endDate: dataSourceIntegration.backFillEndDate
                }
            }
        });

        $scope.disabledFormat = !!angular.copy($scope.dataSource.format);

        // $scope.addNewIntegration = addNewIntegration;
        // $scope.removeIntegration = removeIntegration;
        $scope.isFormValid = isFormValid;
        $scope.submit = submit;
        $scope.deleteDataSource = deleteDataSource;
        $scope.backToDataSourceList = backToDataSourceList;
        $scope.removeParams = removeParams;
        $scope.createNewParams = createNewParams;
        $scope.groupEntities = groupEntities;
        $scope.reStringDate = reStringDate;
        $scope.selectPublisher = selectPublisher;
        $scope.selectedPublisherForIntegration = selectedPublisherForIntegration;
        $scope.addFixedTime = addFixedTime;
        $scope.removeFixedTime = removeFixedTime;
        $scope.checkedUseIntegration = checkedUseIntegration;
        $scope.formatParamKey = formatParamKey;
        $scope.viewValue = viewValue;

        function viewValue(integration, param) {
            if(!$scope.isNew && !param.value) {
                DataSourceIntegration.one(integration.id || integration).one('showvalue').get({param: param.key})
                    .then(function (value) {
                        param.value = value
                    })
            }
        }

        function formatParamKey(key) {
            var keys = key.split("");

            angular.forEach(angular.copy(keys), function (keyItem, index) {
                if(keyItem.search(/[A-Z]/) == 0) {
                    keys[index] = ' ' + keyItem
                }
            });

            return keys.join("")
        }

        function checkedUseIntegration(useIntegration) {
            if(useIntegration && $scope.dataSource.dataSourceIntegrations.length == 0) {
               $scope.dataSource.dataSourceIntegrations = [{
                   integration: null,
                   active: true,
                   params: [],
                   backFill: false,
                   // backFillForce: false,
                   backFillStartDate: {
                       startDate: null,
                       endDate: null
                   },
                   backFillEndDate: {
                       startDate: null,
                       endDate: null
                   },
                   schedule: {
                       checked: 'checkAt',
                       checkEvery:  { hour: null },
                       checkAt: [{timeZone: null, hour: 1, minutes: 0}]
                   }
               }]
           }
        }
        
        function removeFixedTime(index, schedule) {
            schedule.checkAt.splice(index, 1);
        }

        function addFixedTime(schedule) {
            if(!schedule.checkAt) {
                schedule.checkAt = []
            }

            schedule.checkAt.push({timeZone: null, hour: 1, minutes: 0});
        }

        function selectedPublisherForIntegration(integration) {
            if(!$scope.isAdmin() || integration.enableForAllUsers) {
                return true
            }

            if(!$scope.dataSource.publisher) {
                return false;
            }
            
            var index = _.findIndex(integration.integrationPublishers, function (integrationPublisher) {
                return integrationPublisher.publisher.id == $scope.dataSource.publisher || integrationPublisher.publisher.id == $scope.dataSource.publisher.id
            });

            return index > -1;
        }

        function selectPublisher(publisher) {
            $scope.dataSource.dataSourceIntegrations = [{
                integration: null,
                active: true,
                params: [],
                backFill: false,
                // backFillForce: false,
                backFillStartDate: {
                    startDate: null,
                    endDate: null
                },
                backFillEndDate: {
                    startDate: null,
                    endDate: null
                },
                schedule: {
                    checked: 'checkAt',
                    checkEvery:  { hour: null },
                    checkAt: [{timeZone: null, hour: 1, minutes: 0}]
                }
            }]
        }

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
            integration.params = item.params;

            angular.forEach(integration.params, function (param) {
                if(param.type == 'bool') {
                    param.value = false
                }
                param.value = null
            })
        }

        function removeParams(integration, index){
            integration.params.splice(index, 1);
        }

        // function addNewIntegration(){
        //     $scope.dataSource.dataSourceIntegrations.push({
        //         integration: null,
        //         active: true,
        //         params: []
        //     });
        // }

        // function removeIntegration(index){
        //     $scope.dataSource.dataSourceIntegrations.splice(index, 1);
        // }

        function isFormValid(){
            if(!!$scope.userForm.regex && !!$scope.userForm.regex.$viewValue) {
                var isValid = true;

                try {
                    new RegExp($scope.userForm.regex.$viewValue);
                } catch(e) {
                    isValid = false
                }

                if(!isValid) {
                    return false
                }
            }

            for (var index in $scope.dataSource.dataSourceIntegrations) {
                if($scope.dataSource.dataSourceIntegrations[index].backFill) {
                    if(!$scope.dataSource.dataSourceIntegrations[index].backFillStartDate && !$scope.dataSource.dataSourceIntegrations[index].backFillStartDate.startDate) {
                        return false
                    }

                    // if(!$scope.dataSource.dataSourceIntegrations[index].backFillEndDate && !$scope.dataSource.dataSourceIntegrations[index].backFillEndDate.startDate) {
                    //     return false
                    // }
                }
            }

            return $scope.userForm.$valid;
        }

        function submit(){
            if ($scope.formProcessing) {
                // already running, prevent duplicates
                return;
            }

            $scope.formProcessing = true;

            var dataSource = angular.copy($scope.dataSource);

            if (!$scope.isAdmin()) {
                delete dataSource.publisher;
            }

            if(dataSource.useIntegration) {
                // dataSource.format = null;

                angular.forEach(dataSource.dataSourceIntegrations, function (dataSourceIntegration) {
                    delete dataSourceIntegration.id;

                    angular.forEach(dataSourceIntegration.params, function (param) {
                        if(param.type == 'date') {
                            param.value = dateUtil.getFormattedDate(param.value.startDate);
                        }

                        if(param.type == 'option') {
                            delete param.optionValues
                        }

                        if(param.type == 'bool' && !param.value) {
                            param.value = false
                        }
                    });

                    if(!!dataSourceIntegration.backFillStartDate && !!dataSourceIntegration.backFillStartDate.startDate) {
                        dataSourceIntegration.backFillStartDate = dateUtil.getFormattedDate(dataSourceIntegration.backFillStartDate.startDate);
                    } else {
                        dataSourceIntegration.backFillStartDate = null;
                    }

                    if(!!dataSourceIntegration.backFillEndDate && !!dataSourceIntegration.backFillEndDate.startDate) {
                        dataSourceIntegration.backFillEndDate = dateUtil.getFormattedDate(dataSourceIntegration.backFillEndDate.startDate);
                    } else {
                        dataSourceIntegration.backFillEndDate = null;
                    }
                });
            } else {
                dataSource.dataSourceIntegrations = []
            }

            var saveDataSource = $scope.isNew ? UnifiedReportDataSourceManager.post(dataSource) : UnifiedReportDataSourceManager.one(dataSource.id).patch(dataSource);

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