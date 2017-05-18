(function() {
    'use strict';

    angular.module('tagcade.unifiedReport.alert')
        .controller('AlertList', AlertList)
    ;

    function AlertList($scope, _, $translate, $modal, alerts, UnifiedReportAlertManager, AlertService) {
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

        $scope.tableConfig = {
            itemsPerPage: 10,
            maxPages: 10
        };

        $scope.formProcessing = false;
        $scope.checkAllItem = false;
        $scope.alerts = alerts;
        $scope.selectedAlert = [];

        var itemsForPager = [];

        $scope.showPagination = showPagination;
        $scope.checkedAlert = checkedAlert;
        $scope.selectEntity = selectEntity;
        $scope.selectAll = selectAll;

        $scope.deleteAlert = deleteAlert;
        $scope.markAsRead = markAsRead;
        $scope.markAsUnread = markAsUnread;
        $scope.viewDetail = viewDetail;
        
        $scope.markAsReadMulti = markAsReadMulti;
        $scope.markAsUnreadMulti = markAsUnreadMulti;
        $scope.deleteAlertMulti = deleteAlertMulti;

        $scope.getTitleAlert= getTitleAlert;
        $scope.setItemForPager = setItemForPager;
        $scope.selectAllAlertInPages = selectAllAlertInPages;
        $scope.noneSelect = noneSelect;

        function selectAllAlertInPages() {
            $scope.checkAllItem = true;

            angular.forEach(alerts, function (alert) {
                if($scope.selectedAlert.indexOf(alert.id) == -1) {
                    $scope.selectedAlert.push(alert.id)
                }
            });
        }

        function noneSelect() {
            $scope.selectedAlert = [];
            $scope.checkAllItem = false
        }

        function setItemForPager(item) {
            if(itemsForPager.length > $scope.tableConfig.itemsPerPage) {
                itemsForPager.splice(0, $scope.tableConfig.itemsPerPage);
            }

            itemsForPager.push(item);
        }

        function getTitleAlert(alert) {
            return convertMessage(alert)
        }

        function deleteAlertMulti() {
            var selectedAlerts = angular.copy($scope.selectedAlert);

            UnifiedReportAlertManager.one().customPUT({ids: $scope.selectedAlert}, null, {delete: true})
                .then(function () {
                    $scope.checkAllItem = false;

                    angular.forEach(angular.copy($scope.alerts), function (alert) {
                        if($scope.selectedAlert.indexOf(alert.id) > -1) {
                            var index = _.findIndex(alerts, function (item) {
                                return alert.id == item.id;
                            });

                            if (index > -1) {
                                alerts.splice(index, 1);
                            }

                            var indexItemsForPager = _.findIndex(itemsForPager, function (item) {
                                return alert.id == item.id;
                            });

                            if (indexItemsForPager > -1) {
                                itemsForPager.splice(indexItemsForPager, 1);
                            }

                            $scope.selectedAlert.splice($scope.selectedAlert.indexOf(alert.id), 1);
                            $scope.alerts = alerts;

                            if($scope.tableConfig.currentPage > 0 && alerts.length/10 == $scope.tableConfig.currentPage) {
                                $scope.tableConfig.currentPage = $scope.tableConfig.currentPage - 1;
                            }

                            if($scope.alerts.length == $scope.selectedAlert.length) {
                                $scope.checkAllItem = true;
                            }
                        }
                    });

                    AlertService.replaceAlerts({
                        type: 'success',
                        message: selectedAlerts.length + ' alerts have been deleted'
                    });
                });
        }

        function markAsUnreadMulti() {
            UnifiedReportAlertManager.one().customPUT({ids: $scope.selectedAlert}, null, {status: false})
                .then(function () {
                    // $scope.checkAllItem = false;

                    angular.forEach($scope.alerts, function (alert) {
                        if($scope.selectedAlert.indexOf(alert.id) > -1) {
                            alert.isRead = false
                        }
                    });

                    AlertService.replaceAlerts({
                        type: 'success',
                        message: $scope.selectedAlert.length + ' alerts have been unread'
                    });
                });
        }

        function markAsReadMulti() {
            UnifiedReportAlertManager.one().customPUT({ids: $scope.selectedAlert}, null, {status: true})
                .then(function () {
                    // $scope.checkAllItem = false;

                    angular.forEach($scope.alerts, function (alert) {
                        if($scope.selectedAlert.indexOf(alert.id) > -1) {
                            alert.isRead = true
                        }
                    });

                    AlertService.replaceAlerts({
                        type: 'success',
                        message: $scope.selectedAlert.length + ' alerts have been marked as read'
                    });
                });
        }

        function showPagination() {
            return angular.isArray($scope.alerts) && $scope.alerts.length > $scope.tableConfig.itemsPerPage;
        }

        function checkedAlert(alert) {
            return $scope.selectedAlert.indexOf(alert.id) > -1
        }

        function selectEntity (alert) {
            var index = $scope.selectedAlert.indexOf(alert.id);

            if(index == -1) {
                $scope.selectedAlert.push(alert.id)
            } else {
                $scope.selectedAlert.splice(index, 1);
                $scope.checkAllItem = false;
            }

            if($scope.selectedAlert.length == $scope.alerts.length) {
                $scope.checkAllItem = true;
            }
        }

        function selectAll () {
            if($scope.selectedAlert.length == itemsForPager.length) {
                $scope.selectedAlert = [];
                $scope.checkAllItem = false;
            } else {
                $scope.selectedAlert = [];
                $scope.checkAllItem = true;

                angular.forEach(itemsForPager, function (alert) {
                    if($scope.selectedAlert.indexOf(alert.id) == -1) {
                        $scope.selectedAlert.push(alert.id)
                    }
                });
            }
        }

        function deleteAlert(alert) {
            var deleteAlert =  UnifiedReportAlertManager.one(alert.id).remove();

            deleteAlert
                .catch(function () {
                    AlertService.replaceAlerts({
                        type: 'error',
                        message: $translate.instant('UNIFIED_REPORT_ALERT_MODULE.DELETE_FAIL')
                    });
                })
                .then(function () {
                    var index = alerts.indexOf(alert);

                    if (index > -1) {
                        alerts.splice(index, 1);
                    }

                    $scope.alerts = alerts;

                    if($scope.tableConfig.currentPage > 0 && alerts.length/10 == $scope.tableConfig.currentPage) {
                        $scope.tableConfig.currentPage = $scope.tableConfig.currentPage - 1;
                    }

                    AlertService.replaceAlerts({
                        type: 'success',
                        message: $translate.instant('UNIFIED_REPORT_ALERT_MODULE.DELETE_SUCCESS')
                    });

                    if($scope.alerts.length == $scope.selectedAlert.length) {
                        $scope.checkAllItem = true;
                    }
                }
            );

        }

        function markAsRead (alert, hideAlert) {
            var updateAlert =  UnifiedReportAlertManager.one(alert.id).patch({isRead: true});

            updateAlert
                .then(function () {
                    alert.isRead = true;

                    if(!hideAlert) {
                        AlertService.replaceAlerts({
                            type: 'success',
                            message: $translate.instant('UNIFIED_REPORT_ALERT_MODULE.MARK_ALERT_AS_READ_SUCCESS')
                        });
                    }
                }).catch(function () {
                    AlertService.replaceAlerts({
                        type: 'error',
                        message: $translate.instant('UNIFIED_REPORT_ALERT_MODULE.MARK_ALERT_AS_READ_FAIL')
                    });
            })
        }

        function markAsUnread (alert) {
            var updateAlert =  UnifiedReportAlertManager.one(alert.id).patch({isRead: false});

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
            if(!alert.isRead) {
                markAsRead(alert, true);
            }

            $modal.open({
                templateUrl: 'unifiedReport/alert/viewDetail.tpl.html',
                controller: function ($scope, alert) {
                    $scope.message = convertMessage(alert);
                    $scope.alertDetail = alert.detail;
                },
                resolve: {
                    alert: alert
                }
            });
        }

        // importAlertBuilderService
        function convertMessage(alert) {
            var code = alert.code;
            var detail = alert.detail;

            if(!!detail.detail) {
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
                    return 'Failed to import a file into data set "' + detail.dataSetName + '". A required field "'+ detail.column +'" is missing';

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

                case ALERT_CODE_NO_DATE_FORMAT:
                    return 'A file failed to load. There was an invalid date format on field "' + detail.column +'"';

                case ALERT_CODE_DATA_IMPORTED_SUCCESSFULLY:
                    return 'A new file has been loaded into data set "' + detail.dataSetName + '"';

                default:
                    return 'Unknown alert code (' + code + '). Please contact your account manager';
            }
        }

        $scope.$watch(function () {
            return $scope.tableConfig.currentPage
        }, function () {
            itemsForPager = [];

            if($scope.checkAllItem == true && alerts.length == $scope.selectedAlert.length) {
                return
            }

            $scope.selectedAlert = [];
            $scope.checkAllItem = false;
        });
    }
})();