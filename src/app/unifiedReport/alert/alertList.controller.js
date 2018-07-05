(function () {
    'use strict';

    angular.module('tagcade.unifiedReport.alert')
        .controller('AlertList', AlertList)
    ;

    function AlertList($scope, _, $filter, Auth, $stateParams, $translate, $modal, UISelectMethod, alerts, publishers, dataSources, dataSets,
                       UnifiedReportAlertManager, UnifiedReportDataSourceManager, AlertService, AtSortableService,
                       ITEMS_PER_PAGE, EVENT_ACTION_SORTABLE, optimizeIntegrationList, UnifiedAlertRestAngular, ALERT_SOURCES) {
        const ALERT_CODE_DATA_AUGMENTED_DATA_SET_CHANGED = 1001;
        const ALERT_CODE_NEW_DATA_IS_RECEIVED_FROM_UPLOAD = 1100;
        const ALERT_CODE_NEW_DATA_IS_RECEIVED_FROM_EMAIL = 1101;
        const ALERT_CODE_NEW_DATA_IS_RECEIVED_FROM_API = 1102;
        const ALERT_CODE_NEW_DATA_IS_RECEIVED_FROM_UPLOAD_WRONG_FORMAT = 1103;
        const ALERT_CODE_NEW_DATA_IS_RECEIVED_FROM_EMAIL_WRONG_FORMAT = 1104;
        const ALERT_CODE_NEW_DATA_IS_RECEIVED_FROM_API_WRONG_FORMAT = 1105;
        const ALERT_CODE_NO_DATA_RECEIVED_DAILY = 1300;
        const ALERT_CODE_DATA_IMPORTED_SUCCESSFULLY = 1200;
        const ALERT_CODE_DATA_IMPORT_MAPPING_FAIL = 1201;
        const ALERT_CODE_DATA_IMPORT_REQUIRED_FAIL = 1202;
        const ALERT_CODE_FILTER_ERROR_INVALID_NUMBER = 1203;
        const ALERT_CODE_TRANSFORM_ERROR_INVALID_DATE = 1204;
        const ALERT_CODE_DATA_IMPORT_NO_HEADER_FOUND = 1205;
        const ALERT_CODE_DATA_IMPORT_NO_DATA_ROW_FOUND = 1206;
        const ALERT_CODE_WRONG_TYPE_MAPPING = 1207;
        const ALERT_CODE_FILE_NOT_FOUND = 1208;
        const ALERT_CODE_NO_DATE_FORMAT = 1210;
        const ALERT_CODE_UN_EXPECTED_ERROR = 2000;
        const ALERT_CODE_FETCHER_LOGIN_FAIL = 2001;
        const ALERT_CODE_FETCHER_TIME_OUT = 2002;
        const ALERT_CODE_FETCHER_PASSWORD_EXPIRES = 2003;
        const ALERT_CODE_RECHECK_EMAIl = 2004;
        const ALERT_CODE_OPTIMIZATION_CONFIG_REFRESH_CACHE_PENDING = 3000;
        const ALERT_CODE_OPTIMIZATION_CONFIG_REFRESH_CACHE_SUCCESS = 3001;

        const ALL_OPTIMIZATIONS = 'All Optimizations';
        const OPTIMIZATION_KEY = 'optimization';
        const DATA_SOURCE_KEY = 'datasource';
        const DATA_SET_KEY = 'dataset';

        var params = $stateParams;
        var getAlertsForPagination;

        $scope.isAdmin = Auth.isAdmin();

        $scope.tableConfig = {
            itemsPerPage: 10,
            maxPages: 10,
            totalItems: Number(alerts.totalRecord)
        };

        $scope.availableOptions = {
            currentPage: $stateParams.page || 1,
            pageSize: 10
        };

        $scope.ALERT_SOURCES = ALERT_SOURCES;
        $scope.alertSource = extractAlertSourceParameter($stateParams.source);
        $scope.dataSources = UISelectMethod.addAllOption(dataSources, 'All Data Sources');
        $scope.dataSets = UISelectMethod.addAllOption(dataSets, 'All Data sets');
        $scope.publishers = !!publishers ? UISelectMethod.addAllOption(publishers, 'All Publisher') : [];
        $scope.optimizeIntegrationList = UISelectMethod.addAllOption(optimizeIntegrationList, ALL_OPTIMIZATIONS);
        $scope.alertSourceOptimization = extractOptimizeIntegrationParameter($stateParams.id);

        $scope.selectedData = {
            dataSource: extractDataSourceParameter($stateParams.id),
            dataSet: extractDataSetParameter($stateParams.id),
            publisherId: $stateParams.publisher ? Number($stateParams.publisher) : null,
            type: {
                info: true,
                warning: true,
                error: true,
                actionRequired: true
            },
            labelType: 'All Type'
        };

        $scope.alertTypes = [
            {key: 'info', label: 'Info'},
            {key: 'warning', label: 'Warning'},
            {key: 'error', label: 'Error'},
            {key: 'actionRequired', label: 'Action required'}
        ];

        $scope.formProcessing = false;
        $scope.checkAllItemInOnePage = false;
        $scope.alerts = alerts;
        $scope.selectedAlert = [];

        var itemsForPager = [];

        $scope.groupEntities = UISelectMethod.groupEntities;

        var latestModel = updateLatestModel();

        $scope.showPagination = showPagination;
        $scope.checkedAlert = checkedAlert;
        $scope.selectEntity = selectEntity;
        $scope.selectAll = selectAll;

        $scope.deleteAlert = deleteAlert;
        $scope.markAsRead = markAsRead;
        $scope.markAsUnread = markAsUnread;
        $scope.confirmChange = confirmChange;
        $scope.viewDetail = viewDetail;

        $scope.markAsReadMulti = markAsReadMulti;
        $scope.markAsUnreadMulti = markAsUnreadMulti;
        $scope.deleteAlertMulti = deleteAlertMulti;

        $scope.getTitleAlert = getTitleAlert;
        $scope.setItemForPager = setItemForPager;
        $scope.selectAllAlertInPages = selectAllAlertInPages;
        $scope.noneSelect = noneSelect;
        $scope.getAlerts = getAlerts;
        $scope.selectPublisher = selectPublisher;
        $scope.selectDataSource = selectDataSource;
        $scope.selectDataSet = selectDataSet;
        $scope.selectAlertSource = selectAlertSource;
        $scope.onSelectOptimization = onSelectOptimization;
        $scope.changePage = changePage;
        $scope.showBackToIntegration = showBackToIntegration;

        $scope.clickType = clickType;

        $scope.alerts = alerts.records;

        $scope.itemsPerPageList = ITEMS_PER_PAGE;

        $scope.changeItemsPerPage = changeItemsPerPage;

        function showBackToIntegration() {
            console.log($scope.alertSource);
            return $scope.alertSource.key === OPTIMIZATION_KEY && $scope.alertSourceOptimization.id != null;
        }

        function extractDataSourceParameter(dataSourceId) {
            if (dataSourceId == null || $scope.alertSource.key === OPTIMIZATION_KEY) return null;
            dataSourceId = Number(dataSourceId);
            var found = $scope.dataSources.find(function (dataSource) {
                return dataSource.id === dataSourceId;
            });
            if (found) return found;
            return null;
        }

        function extractDataSetParameter(dataSetId) {
            if (dataSetId == null || $scope.alertSource.key === OPTIMIZATION_KEY) return null;
            dataSetId = Number(dataSetId);
            var found = $scope.dataSets.find(function (dataSet) {
                return dataSet.id === dataSetId;
            });
            if (found) return found;
            return null;
        }

        function extractAlertSourceParameter(alertSource) {
            if (alertSource == null) return $scope.ALERT_SOURCES[0];
            var found = $scope.ALERT_SOURCES.find(function (alertSourceObject) {
                return alertSourceObject.key === alertSource;
            });
            if (found) {
                return found;
            }
            return $scope.ALERT_SOURCES[0];
        }

        function extractOptimizeIntegrationParameter(id) {
            if (id == null || $scope.alertSource.key === DATA_SOURCE_KEY) return $scope.optimizeIntegrationList[0];

            id = Number(id);
            var found = $scope.optimizeIntegrationList.find(function (optimizeIntegration) {
                return optimizeIntegration.id === id;
            });
            if (found) return found;

            return $scope.optimizeIntegrationList[0];
        }

        function onSelectOptimization(item) {
            $scope.alertSourceOptimization = item;
            selectAllAlertsType();
        }

        function typeIsEmpty() {
            var types = [];
            angular.forEach($scope.selectedData.type, function (value, key) {
                if (value == true) {
                    types.push(_.find($scope.alertTypes, {key: key}).label)
                }
            });
            return types.length === 0;
        }

        function clickType(type, typeKey) {
            var types = [];

            angular.forEach($scope.selectedData.type, function (value, key) {
                if (value == true) {
                    types.push(_.find($scope.alertTypes, {key: key}).label)
                }
            });

            if ($scope.alertTypes.length == types.length) {
                $scope.selectedData.labelType = 'All Type'
            } else if (types.length === 0) {
                $scope.selectedData.labelType = 'Select types'
            }
            else {
                $scope.selectedData.labelType = types.toString().replace(',', ', ')
            }
        }

        function selectPublisher() {
            $scope.selectedData.dataSource = null;
            $scope.alertSource = $scope.ALERT_SOURCES[0];
            $scope.alertSourceOptimization = $scope.optimizeIntegrationList[0];
        }

        function selectAlertSource(source) {
            // Reset selected alertSourceOptimization
            var optimizationRulesByPublisher = $filter('filterOptimizationRule')($scope.optimizeIntegrationList, $scope.selectedData.publisherId);
            if (optimizationRulesByPublisher && optimizationRulesByPublisher.length > 0) {
                $scope.alertSourceOptimization = $scope.optimizeIntegrationList[0];
            } else {
                $scope.alertSourceOptimization = null;
            }
            // Reset selected dataSource
            var dataSourcesByPublisher = $filter('filterByPublisher')($scope.dataSources, $scope.selectedData.publisherId);
            if (dataSourcesByPublisher && dataSourcesByPublisher.length > 0) {
                $scope.selectedData.dataSource = dataSources[0];
            } else {
                $scope.selectedData.dataSource = null;
            }
            $scope.alertSource = source;
            selectAllAlertsType();
        }

        function selectDataSource() {
            selectAllAlertsType();
        }

        function selectDataSet() {
            selectAllAlertsType();
        }

        function selectAllAlertsType() {
            var isSelectDataSource = false;
            var isSelectDataSet = false;
            if ($scope.alertSource.key === DATA_SOURCE_KEY)
                isSelectDataSource = true;
            if ($scope.alertSource.key === DATA_SET_KEY)
                isSelectDataSet = true;
            $scope.selectedData.type = {
                info: true,
                warning: true,
                error: true,
                actionRequired: !isSelectDataSource || !isSelectDataSet
            };

            $scope.selectedData.labelType = 'All Type';
        }

        function extractSelectedAlertSourceId(alertSource) {
            if (alertSource.key === DATA_SOURCE_KEY) {
                var dataSource = $scope.selectedData ? $scope.selectedData.dataSource : null;
                if (!isNaN(dataSource)) {
                    return dataSource;
                } else {
                    return dataSource ? dataSource.id : null;
                }
            } else if (alertSource.key === OPTIMIZATION_KEY) {
                return $scope.alertSourceOptimization ? $scope.alertSourceOptimization.id : null;
            } else if (alertSource.key === DATA_SET_KEY) {
                var dataSet = $scope.selectedData ? $scope.selectedData.dataSet : null;
                if (!isNaN(dataSet)) {
                    return dataSet;
                } else {
                    return dataSet ? dataSet.id : null;
                }
            }

            return null;
        }

        function extractAlertTypes() {
            var types = [];
            angular.forEach($scope.selectedData.type, function (value, key) {
                if (value == true) {
                    types.push(key)
                }
            });
            // Remove actionRequired if alert source is datasource
            var actionRequiredIndex = types.indexOf('actionRequired');
            if (actionRequiredIndex >= 0 && $scope.alertSource.key === 'datasource') {
                types.splice(actionRequiredIndex);
            }
            return types;
        }

        function prepareParams() {
            var types = extractAlertTypes();
            var selectedSourceId = extractSelectedAlertSourceId($scope.alertSource);
            return {
                publisher: $scope.selectedData.publisherId,
                types: types.length > 0 ? types.toString() : null,
                source: $scope.alertSource.key || 'all',
                id: selectedSourceId
            };
        }

        /**
         * store latest form data each time use click get alerts.
         * Used for actions on all page
         * @returns {{publisher: (null|*), alertSource: *, sourceId: *, types: Array}}
         */
        function updateLatestModel() {
            var model = {
                publisherId: $scope.selectedData.publisherId,
                alertSource: $scope.alertSource.key, // datasource  or optimization
                sourceId: extractSelectedAlertSourceId($scope.alertSource), //data source id or optimization id
                types: extractAlertTypes()
            };

            return model;
        }

        function getAlerts() {
            latestModel = updateLatestModel();
            $stateParams = angular.extend($stateParams, prepareParams());
            $stateParams.page = 1;
            _getAlertsForPagination($stateParams, 500, true);
        }

        function removeParam(param) {
            delete param.types;
        }

        function _getAlertsForPagination(query, ms, triggerByGetAlertButton) {
            clearTimeout(getAlertsForPagination);

            getAlertsForPagination = setTimeout(function () {
                return UnifiedAlertRestAngular.one('list').get(query)
                    .then(function (alerts) {
                        removeParam(query);
                        AtSortableService.insertParamForUrl(query);

                        setTimeout(function () {
                            $scope.alerts = alerts.records;
                            $scope.tableConfig.totalItems = Number(alerts.totalRecord);
                            $scope.availableOptions.currentPage = Number(query.page);

                            // get call by getAlerts function
                            if (triggerByGetAlertButton) {
                                noneSelect();
                            }
                            // update selected status for new
                            if ($scope.checkAllItem && !triggerByGetAlertButton) {
                                angular.forEach($scope.alerts, function (alert) {
                                    if ($scope.selectedAlert.indexOf(alert.id) == -1) {
                                        $scope.selectedAlert.push(alert.id)
                                    }
                                });
                            }

                        }, 0)
                    });
            }, ms || 0)

        }

        $scope.isFormValid = function () {
            return $scope.alertForm.$valid && !typeIsEmpty();
        };

        function selectAllAlertInPages() {
            $scope.checkAllItemInOnePage = true;
            $scope.checkAllItem = true;

            angular.forEach($scope.alerts, function (alert) {
                if ($scope.selectedAlert.indexOf(alert.id) == -1) {
                    $scope.selectedAlert.push(alert.id)
                }
            });
        }

        function noneSelect() {
            $scope.selectedAlert = [];
            $scope.checkAllItemInOnePage = false;
            $scope.checkAllItem = false;
        }

        function setItemForPager(item) {
            if (itemsForPager.length > $scope.tableConfig.itemsPerPage) {
                itemsForPager.splice(0, $scope.tableConfig.itemsPerPage);
            }

            itemsForPager.push(item);
        }

        function getTitleAlert(alert) {
            return convertMessage(alert)
        }

        function getCountSelectedAlerts(selectedAlerts) {
            var count = 0;
            if ($scope.checkAllItem) {
                count = $scope.tableConfig.totalItems;
            } else {
                count = selectedAlerts.length;
            }
            return count;
        }

        function deleteAlertMulti() {

            var params = buildParametersForAllPageActions();

            UnifiedReportAlertManager.one().customPUT(params, null, {action: 'delete'})
                .then(function () {
                    $scope.checkAllItemInOnePage = false;
                    getAlerts();

                    AlertService.replaceAlerts({
                        type: 'success',
                        message: getCountSelectedAlerts($scope.selectedAlert) + ' alerts have been deleted'
                    });
                });
        }

        function buildParametersForAllPageActions() {
            var params = [];
            if (!$scope.checkAllItem) {
                params = {ids: $scope.selectedAlert};
            } else {
                params = latestModel;
                params.ids = [];
            }

            return params;
        }

        function markAsUnreadMulti() {
            var params = buildParametersForAllPageActions();

            UnifiedReportAlertManager.one().customPUT(params, null, {action: 'markAsUnRead'})
                .then(function () {
                    // $scope.checkAllItem = false;

                    angular.forEach($scope.alerts, function (alert) {
                        if ($scope.selectedAlert.indexOf(alert.id) > -1) {
                            alert.isRead = false
                        }
                    });

                    AlertService.replaceAlerts({
                        type: 'success',
                        message: getCountSelectedAlerts($scope.selectedAlert) + ' alerts have been marked as unread'
                    });

                    noneSelect();
                });
        }

        function markAsReadMulti() {
            var params = buildParametersForAllPageActions();

            UnifiedReportAlertManager.one().customPUT(params, null, {action: 'markAsRead'})
                .then(function () {
                    // $scope.checkAllItem = false;

                    angular.forEach($scope.alerts, function (alert) {
                        if ($scope.selectedAlert.indexOf(alert.id) > -1) {
                            alert.isRead = true
                        }
                    });

                    AlertService.replaceAlerts({
                        type: 'success',
                        message: getCountSelectedAlerts($scope.selectedAlert) + ' alerts have been marked as read'
                    });

                    noneSelect();
                });
        }

        function showPagination() {
            return angular.isArray($scope.alerts) && $scope.tableConfig.totalItems > $scope.tableConfig.itemsPerPage;
        }

        function changePage(currentPage) {
            $scope.selectedAlert = [];
            if (!$scope.checkAllItem) {
                $scope.checkAllItemInOnePage = false;
            }
            params = angular.extend(params, {
                page: currentPage
            });
            params = angular.extend(params, prepareParams());
            _getAlertsForPagination(params, 500);
        }

        $scope.$on(EVENT_ACTION_SORTABLE, function (event, query) {
            params = angular.extend(params, query);
            params = angular.extend(params, prepareParams());
            params.limit = $scope.tableConfig.itemsPerPage;

            _getAlertsForPagination(params);
        });

        function checkedAlert(alert) {
            return $scope.selectedAlert.indexOf(alert.id) > -1
        }

        function selectEntity(alert) {
            var index = $scope.selectedAlert.indexOf(alert.id);

            if (index == -1) {
                $scope.selectedAlert.push(alert.id)
            } else {
                $scope.selectedAlert.splice(index, 1);
                $scope.checkAllItem = false;
            }

            if ($scope.selectedAlert.length == $scope.alerts.length) {
                $scope.checkAllItemInOnePage = true;
            } else {
                $scope.checkAllItemInOnePage = false;
            }
        }

        function selectAll() {
            $scope.checkAllItem = false;
            if ($scope.selectedAlert.length == $scope.alerts.length) {
                $scope.selectedAlert = [];
            } else {
                $scope.selectedAlert = [];
                angular.forEach($scope.alerts, function (alert) {
                    if ($scope.selectedAlert.indexOf(alert.id) == -1) {
                        $scope.selectedAlert.push(alert.id);
                    }
                });
            }
        }

        function deleteAlert(alert) {
            var deleteAlert = UnifiedReportAlertManager.one(alert.id).remove();

            deleteAlert
                .catch(function () {
                    AlertService.replaceAlerts({
                        type: 'error',
                        message: $translate.instant('UNIFIED_REPORT_ALERT_MODULE.DELETE_FAIL')
                    });
                })
                .then(function () {
                        changeItemsPerPage();
                        AlertService.replaceAlerts({
                            type: 'success',
                            message: $translate.instant('UNIFIED_REPORT_ALERT_MODULE.DELETE_SUCCESS')
                        });

                        if ($scope.alerts.length == $scope.selectedAlert.length) {
                            $scope.checkAllItem = true;
                        }
                    }
                );
        }

        function markAsRead(alert, hideAlert, needGetAlerts) {
            var updateAlert = UnifiedReportAlertManager.one(alert.id).patch({isRead: true});

            updateAlert
                .then(function () {
                    alert.isRead = true;

                    if (!hideAlert) {
                        AlertService.replaceAlerts({
                            type: 'success',
                            message: $translate.instant('UNIFIED_REPORT_ALERT_MODULE.MARK_ALERT_AS_READ_SUCCESS')
                        });
                    }
                    if (needGetAlerts) getAlerts();

                }).catch(function () {
                AlertService.replaceAlerts({
                    type: 'error',
                    message: $translate.instant('UNIFIED_REPORT_ALERT_MODULE.MARK_ALERT_AS_READ_FAIL')
                });
            })
        }

        function confirmChange(alert, action) {
            var actionData = [];
            if (action == 'ACTIVE_OPTIMIZATION_INTEGRATION') {
                actionData =
                    {
                        actionName: "ACTIVE_OPTIMIZATION_INTEGRATION",
                        actionData: {
                            optimizationIntegrationId: alert.optimizationIntegration.id
                        }
                    }
            }

            if (action == 'REJECT_OPTIMIZATION_INTEGRATION') {
                actionData =
                    {
                        actionName: "REJECT_OPTIMIZATION_INTEGRATION",
                        actionData: {
                            optimizationIntegrationId: alert.optimizationIntegration.id
                        }
                    }
            }
            UnifiedReportAlertManager.one('action').customPOST(actionData)
                .then(function (success) {
                    markAsRead(alert, true, true);
                    // alert.optimizationIntegration.active = !alert.optimizationIntegration.active;
                    AlertService.replaceAlerts({
                        type: 'success',
                        message: $translate.instant('UNIFIED_REPORT_ALERT_MODULE.SUCCESSFULLY')
                    });
                }, function (error) {
                    markAsRead(alert, true, false);
                    AlertService.replaceAlerts({
                        type: 'error',
                        message: $translate.instant('UNIFIED_REPORT_ALERT_MODULE.FAIL')
                    });
                });
        }

        function markAsUnread(alert) {
            var updateAlert = UnifiedReportAlertManager.one(alert.id).patch({isRead: false});

            updateAlert
                .then(function () {
                    alert.isRead = false;

                    AlertService.replaceAlerts({
                        type: 'success',
                        message: $translate.instant('UNIFIED_REPORT_ALERT_MODULE.MARK_ALERT_AS_UNREAD_SUCCESS')
                    });
                }).catch(function () {
                AlertService.replaceAlerts({
                    type: 'error',
                    message: $translate.instant('UNIFIED_REPORT_ALERT_MODULE.MARK_ALERT_AS_UNREAD_FAIL')
                });
            })
        }

        function viewDetail(alert) {
            if (!alert.isRead) {
                markAsRead(alert, true);
            }

            $modal.open({
                templateUrl: 'unifiedReport/alert/viewDetail.tpl.html',
                controller: function ($scope, alert) {
                    var RESOURCE_NAME = {
                        'pubvantage': 'Ad Slot',
                        'pubvantage-video': 'Video Waterfall Tag'
                    };

                    $scope.message = convertMessage(alert, true);
                    $scope.alertDetail = alert.detail;
                    $scope.position = alert.detail.Positions;
                    $scope.getWidth = getWidth;
                    $scope.getResourceName = getResourceName;

                    function getWidth(pos) {
                        if (!pos || pos.length === 0) return 12;
                        return pos.length > 1 ? 6 : 12;
                    }

                    /**
                     * return "Ad Slot" or "Video Waterfall Tag" or other due to platform integration
                     */
                    function getResourceName() {
                        var optimizationIntegration = alert.optimizationIntegration;
                        if (!optimizationIntegration
                            || !optimizationIntegration.platformIntegration
                            || !RESOURCE_NAME[optimizationIntegration.platformIntegration]
                        ) {
                            return 'UNKNOWN';
                        }

                        return RESOURCE_NAME[optimizationIntegration.platformIntegration];
                    }
                },
                resolve: {
                    alert: alert
                }
            });
        }

        // importAlertBuilderService
        function convertMessage(alert, isDetail) {
            var code = alert.code;
            var detail = alert.detail;

            if (!!detail.detail) {
                // support old alert detail with key "detail"
                return detail.detail;
            }

            // new alert detail without key "detail", using all keys in alert detail
            switch (code) {
                case ALERT_CODE_NEW_DATA_IS_RECEIVED_FROM_UPLOAD:
                case ALERT_CODE_NEW_DATA_IS_RECEIVED_FROM_EMAIL:
                case ALERT_CODE_NEW_DATA_IS_RECEIVED_FROM_API:
                    return 'A new file has been successfully uploaded to data source "' + detail.dataSourceName;

                case ALERT_CODE_NEW_DATA_IS_RECEIVED_FROM_UPLOAD_WRONG_FORMAT:
                case ALERT_CODE_NEW_DATA_IS_RECEIVED_FROM_EMAIL_WRONG_FORMAT:
                case ALERT_CODE_NEW_DATA_IS_RECEIVED_FROM_API_WRONG_FORMAT:
                    return 'Failed to upload a file to data source "' + detail.dataSourceName + '" because the file is in the wrong format';

                case ALERT_CODE_DATA_IMPORT_MAPPING_FAIL:
                    return 'Failed to import a file into data set "' + detail.dataSetName + '". There was a field mapping error';

                case ALERT_CODE_WRONG_TYPE_MAPPING:
                    return 'Failed to import a file into data set "' + detail.dataSetName + '". There was a mapping error due to invalid content on field "' + detail.column + '"';

                case ALERT_CODE_DATA_IMPORT_REQUIRED_FAIL:
                    return 'Failed to import a file into data set "' + detail.dataSetName + '". A required field "' + detail.column + '" is missing';

                case ALERT_CODE_FILTER_ERROR_INVALID_NUMBER:
                    return 'Failed to import a file into data set "' + detail.dataSetName + '". There was an invalid number format on field "' + detail.column + '"';

                case ALERT_CODE_TRANSFORM_ERROR_INVALID_DATE:
                    return 'Failed to import a file into data set "' + detail.dataSetName + '". There was an invalid date format on field "' + detail.column + '"';

                case ALERT_CODE_DATA_IMPORT_NO_HEADER_FOUND:
                    return 'Failed to import a file into data set "' + detail.dataSetName + '". No header row was found in the file. Please contact your account manager';

                case ALERT_CODE_DATA_IMPORT_NO_DATA_ROW_FOUND:
                    return 'Failed to import a file into data set "' + detail.dataSetName + '". No data was found in the file';

                case ALERT_CODE_FILE_NOT_FOUND:
                    return 'Failed to import a file into data set "' + detail.dataSetName + '". The uploaded file could not be found, please contact your account manager';

                case ALERT_CODE_NO_DATA_RECEIVED_DAILY:
                    return 'No files have been uploaded to data source "' + detail.dataSourceName + '" (ID: ' + detail.dataSourceId + '). You have an alert configured if no files are uploaded';

                case ALERT_CODE_UN_EXPECTED_ERROR:
                    return 'Failed to import a file into data set "' + detail.dataSetName + '". There was an unexpected error, please contact your account manager';

                case ALERT_CODE_FETCHER_LOGIN_FAIL:
                    return 'Browser login has failed for data source (ID: ' + detail.dataSourceId + '). Please check the credentials';

                case ALERT_CODE_FETCHER_TIME_OUT:
                    return 'A timeout error has occurred when downloading reports for data source (ID: ' + detail.dataSourceId + ')';

                case ALERT_CODE_FETCHER_PASSWORD_EXPIRES:
                    return 'Password expires on data source ' + detail.dataSourceId + '. Please change password for account ' + detail.username + ' on link ' + detail.url + ' or contact your account manager';

                case ALERT_CODE_NO_DATE_FORMAT:
                    return 'A file failed to load. There was an invalid date format on field "' + detail.column + '"';

                case ALERT_CODE_DATA_IMPORTED_SUCCESSFULLY:
                    return 'A new file has been loaded into data set "' + detail.dataSetName + '"';

                case ALERT_CODE_RECHECK_EMAIl:
                    return 'Received an e-mail for Data Source "' + detail.dataSourceName + 'with no attached report files". Please configure email anchor text in Data Source to download report files. Anchor texts is text of links found in email body.';

                case ALERT_CODE_OPTIMIZATION_CONFIG_REFRESH_CACHE_PENDING:
                case ALERT_CODE_OPTIMIZATION_CONFIG_REFRESH_CACHE_SUCCESS:
                case ALERT_CODE_DATA_AUGMENTED_DATA_SET_CHANGED:
                    return detail.message;

                default:
                    return 'Unknown alert code (' + code + '). Please contact your account manager';
            }
        }

        function changeItemsPerPage() {
            $scope.selectedAlert = [];
            $scope.checkAllItemInOnePage = false;

            var query = {limit: $scope.tableConfig.itemsPerPage || ''};
            params.page = 1;
            params = angular.extend(params, query);
            params = angular.extend(params, prepareParams());
            _getAlertsForPagination(params, 500);
        }

        $scope.$watch(function () {
            return $scope.tableConfig.currentPage
        }, function () {
            itemsForPager = [];

            if ($scope.checkAllItem == true && alerts.length == $scope.selectedAlert.length) {
                return
            }

            $scope.selectedAlert = [];
            $scope.checkAllItem = false;
        });
    }
})();