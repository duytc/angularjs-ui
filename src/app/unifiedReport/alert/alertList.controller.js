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
        const ALERT_CODE_UN_EXPECTED_ERROR = 2000;

        $scope.tableConfig = {
            itemsPerPage: 10,
            maxPages: 10
        };

        $scope.formProcessing = false;
        $scope.checkAllItem = false;
        $scope.alerts = alerts;
        $scope.selectedAlert = [];
      
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

        var itemsForPager = [];

        function setItemForPager(item) {
            itemsForPager.push(item);
        }

        function getTitleAlert(alert) {
            return convertMessage(alert)
        }

        function deleteAlertMulti() {
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
                                $scope.selectedAlert.splice($scope.selectedAlert.indexOf(alert.id), 1)
                            }

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
                        message: 'The alerts selected have been deleted'
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
                        message: 'The alerts selected have been marked as unread'
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
                        message: 'The alerts selected have been marked as read'
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
                $scope.selectedAlert = []
            } else {
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
                    return 'File ' + '"' + detail.fileName + '"' + ' has been successfully uploaded to data source ' + '"' + detail.dataSourceName + '"' + '.';

                case ALERT_CODE_NEW_DATA_IS_RECEIVED_FROM_EMAIL:
                    return 'File ' + '"' + detail.fileName + '"' + ' has been successfully imported to data source ' + '"' + detail.dataSourceName + '"' + ' from email.';

                case ALERT_CODE_NEW_DATA_IS_RECEIVED_FROM_API:
                    return 'File ' + '"' + detail.fileName + '"' + ' has been successfully received to data source ' + '"' + detail.dataSourceName + '"' + ' from api.';

                case ALERT_CODE_NEW_DATA_IS_RECEIVED_FROM_UPLOAD_WRONG_FORMAT:
                    return 'Failed to upload file ' + '"' + detail.fileName + '"' + ' to data source ' + '"' + detail.dataSourceName + '"' + ' - wrong file format. Each Data source has only one type and file format.';

                case ALERT_CODE_NEW_DATA_IS_RECEIVED_FROM_EMAIL_WRONG_FORMAT:
                    return 'Failed to receive file ' + '"' + detail.fileName + '"' + ' from email to data source ' + '"' + detail.dataSourceName + '"' + ' - wrong format error. Each Data source has only one type and file format.';

                case ALERT_CODE_NEW_DATA_IS_RECEIVED_FROM_API_WRONG_FORMAT:
                    return 'Failed to receive file ' + '"' + detail.fileName + '"' + ' from api to data source ' + '"' + detail.dataSourceName + '"' + ' - wrong format error. Each Data source has only one type and file format.';

                case ALERT_CODE_DATA_IMPORT_MAPPING_FAIL:
                    return 'Failed to import file ' + '"' + detail.fileName + '"' + ' from data source  ' + '"' + detail.dataSourceName + '"' + ' to data set ' + '"' + detail.dataSetName + '"' + ' - MAPPING ERROR: no field in file is mapped to data set.';

                case ALERT_CODE_WRONG_TYPE_MAPPING:
                    return 'Failed to import file ' + '"' + detail.fileName + '"' + ' from data source  ' + '"' + detail.dataSourceName + '"' + ' to data set ' + '"' + detail.dataSetName + '"' + ' - MAPPING ERROR: found invalid content ' + '"' + detail.content + '"' + ' on field ' + '"' + detail.column + '"' + '.';

                case ALERT_CODE_DATA_IMPORT_REQUIRED_FAIL:
                    return 'Failed to import file ' + '"' + detail.fileName + '"' + ' from data source  ' + '"' + detail.dataSourceName + '"' + ' to data set ' + '"' + detail.dataSetName + '"' + ' - REQUIRE ERROR: required field ' + '"' + detail.column + '"' + ' does not exist.';

                case ALERT_CODE_FILTER_ERROR_INVALID_NUMBER:
                    return 'Failed to import file ' + '"' + detail.fileName + '"' + ' from data source  ' + '"' + detail.dataSourceName + '"' + ' to data set ' + '"' + detail.dataSetName + '"' + ' - invalid number format on field ' + '"' + detail.column + '"' + '.';

                case ALERT_CODE_TRANSFORM_ERROR_INVALID_DATE:
                    return 'Failed to import file ' + '"' + detail.fileName + '"' + ' from data source  ' + '"' + detail.dataSourceName + '"' + ' to data set ' + '"' + detail.dataSetName + '"' + ' - invalid date format on field ' + '"' + detail.column + '"' + '.';

                case ALERT_CODE_DATA_IMPORT_NO_HEADER_FOUND:
                    return 'Failed to import file ' + '"' + detail.fileName + '"' + ' from data source  ' + '"' + detail.dataSourceName + '"' + ' to data set ' + '"' + detail.dataSetName + '"' + ' - no header found from file.';

                case ALERT_CODE_DATA_IMPORT_NO_DATA_ROW_FOUND:
                    return 'Failed to import file ' + '"' + detail.fileName + '"' + ' from data source  ' + '"' + detail.dataSourceName + '"' + ' to data set ' + '"' + detail.dataSetName + '"' + ' - no data found from file.';

                case ALERT_CODE_FILE_NOT_FOUND:
                    return 'Failed to import file ' + '"' + detail.fileName + '"' + ' from data source  ' + '"' + detail.dataSourceName + '"' + ' to data set ' + '"' + detail.dataSetName + '"' + ' - file does not exist.';

                case ALERT_CODE_NO_DATA_RECEIVED_DAILY:
                    return 'Data source ' + '"' + detail.dataSourceName + '"' + ' has not received data daily (on ' + '"' + detail.date + '"' + ')';

                case ALERT_CODE_UN_EXPECTED_ERROR:
                    return 'Failed to import file ' + '"' + detail.fileName + '"' + ' from data source  ' + '"' + detail.dataSourceName + '"' + ' to data set ' + '"' + detail.dataSetName + '"' + ' - unexpected error, please contact your account manager';

                case ALERT_CODE_DATA_IMPORTED_SUCCESSFULLY:
                    return 'File ' + '"' + detail.fileName + '"' + ' from data source ' + '"' + detail.dataSourceName + '"' + ' has been successfully imported to data set ' + '"' + detail.dataSetName + '"' + '.';

                default:
                    return 'Unknown alert code (' + code + ')';
            }
        }

        $scope.$watch(function () {
            return $scope.tableConfig.currentPage
        }, function () {
            $scope.selectedAlert = [];
            itemsForPager = [];
            $scope.checkAllItem = false;
        });
    }
})();