(function() {
    'use strict';

    angular.module('tagcade.unifiedReport.alert')
        .controller('AlertList', AlertList)
    ;

    function AlertList($scope, _, $translate, $modal, alerts, UnifiedReportAlertManager, AlertService) {
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
            switch(alert.code) {
                case 100:
                    return alert.message.fileName + ' upload to ' + alert.message.dataSourceName + ' successfully';
                    break;
                case 103:
                    return alert.message.fileName + ' upload to ' + alert.message.dataSourceName + ' failed';
                    break;
                case 200:
                    return alert.message.fileName + ' of ' + alert.message.dataSourceName + ' import to ' + alert.message.dataSetName + ' had been successfully';
                    break;
                case 201:
                case 202:
                case 203:
                case 204:
                case 205:
                case 206:
                    return alert.message.fileName + ' of ' + alert.message.dataSourceName + ' import to ' + alert.message.dataSetName + ' had errors';
                    break;
            }
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
                            }

                            $scope.alerts = alerts;

                            if($scope.tableConfig.currentPage > 0 && alerts.length == $scope.tableConfig.currentPage) {
                                $scope.tableConfig.currentPage = $scope.tableConfig.currentPage - 1;
                            }

                            if($scope.alerts.length == $scope.selectedAlert.length) {
                                $scope.checkAllItem = true;
                            }
                        }
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
                    })
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
                    })
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
                    $scope.message = alert.detail.detail;

                    // switch(alert.code) {
                    //     case 100:
                    //         $scope.message = alert.message.fileName + ' upload to ' + alert.message.dataSourceName + ' successfully';
                    //         break;
                    //     case 103:
                    //         $scope.message = alert.message.fileName + ' upload to ' + alert.message.dataSourceName + ' has wrong format';
                    //         break;
                    //     case 200:
                    //         $scope.message = alert.message.fileName + ' of ' + alert.message.dataSourceName + ' import to ' + alert.message.dataSetName + ' had been successfully';
                    //         break;
                    //     case 201:
                    //         $scope.message = alert.message.fileName + ' of ' + alert.message.dataSourceName + ' import to '+ alert.message.dataSetName + ' happen error when mapping require fields';
                    //         break;
                    //     case 202:
                    //         $scope.message = alert.message.fileName + ' of ' + alert.message.dataSourceName + ' import to '+ alert.message.dataSetName + ' happen error when required fields at row ' + alert.message.row;
                    //         break;
                    //     case 203:
                    //         $scope.message = alert.message.fileName + ' of ' + alert.message.dataSourceName + ' import to ' + alert.message.dataSetName + ' happen error when filter file at row ' + alert.message.row + ' and column ' + alert.message.column + '';
                    //         break;
                    //     case 204:
                    //         $scope.message = alert.message.fileName + ' of ' + alert.message.dataSourceName + ' import to ' + alert.message.dataSetName + ' happen error when transform file at row ' + alert.message.row + ' and column ' + alert.message.column + '';
                    //         break;
                    //     case 205:
                    //         $scope.message = alert.message.fileName + ' of ' + alert.message.dataSourceName + ' import to ' + alert.message.dataSetName + ' import fail.';
                    //         break;
                    // }
                },
                resolve: {
                    alert: alert
                }
            });
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