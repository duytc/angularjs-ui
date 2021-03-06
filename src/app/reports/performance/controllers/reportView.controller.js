(function () {
    'use strict';

    angular.module('tagcade.reports.performance')
        .controller('ReportView', ReportView)
    ;

    /**
     * @param {Array} reportGroup.reports
     */
    function ReportView($scope, $translate, $stateParams, $timeout, _, accountManager, sessionStorage, $state, Auth, AlertService, reportGroup, DateFormatter, performanceReportHelper, PERFORMANCE_REPORT_STATES, UPDATE_CPM_TYPES, TYPE_AD_SLOT, REPORT_SETTINGS) {

        var isAdmin = Auth.isAdmin();
        $scope.isAdmin = isAdmin;

        var isSubPublisher = Auth.isSubPublisher();

        $scope.hasResult = reportGroup !== false;
        reportGroup = reportGroup || {};
        $scope.reportGroup = reportGroup;
        $scope.reports = [];
        $scope.subBreakDown = $stateParams.subBreakDown;

        var dataGroupReport = $state.current.params.expanded ? ($scope.reportGroup.expandedReports || []) : ($scope.reportGroup.reports || []);

        if ($scope.hasResult && !!reportGroup.expandedResult) {
            reportGroup.expandedResult.reportType = reportGroup.reportType;
            reportGroup = reportGroup.expandedResult || {};
            reportGroup.refreshedSlotOpportunities = $scope.reportGroup.refreshedSlotOpportunities;
            reportGroup.averageRefreshedSlotOpportunities = $scope.reportGroup.averageRefreshedSlotOpportunities;

            $scope.reportGroup = reportGroup;
            dataGroupReport = $scope.reportGroup.reports || [];
        }

        // var dataGroupReport = $state.current.params.expanded ? ($scope.reportGroup.expandedReports || []) : ($scope.reportGroup.reports || []);

        if (!!$scope.subBreakDown && $scope.subBreakDown == 'day') {
            angular.forEach(dataGroupReport, function (rootReport) {
                // set report type for item by day
                angular.forEach(rootReport.reports, function (report) {
                    report.reportType = rootReport.reportType
                });

                $scope.reports = $scope.reports.concat(rootReport.reports.reverse());
            })
        } else {
            $scope.reports = dataGroupReport;
        }

        $scope.demandSourceTransparency = Auth.getSession().demandSourceTransparency;

        var reportType = 'adTag';

        var currentSetting = sessionStorage.getCurrentSettings();
        var oldSetting = (!_.isUndefined(currentSetting) && _.isNull(currentSetting)) ? angular.fromJson(currentSetting) : [];

        var settings = (isAdmin || isSubPublisher) ? [] : oldSetting;

        $scope.dataSelect = dataSelect();
        $scope.modelSelect = modelSelect();
        $scope.settingsSelect = {
            showUncheckAll: false,
            showCheckAll: false,
            showButtonSubmit: true,
            buttonClasses: 'btn btn-sm btn-primary btn-manage-ad-tag',
            buttonSubmitClasses: 'btn btn-primary btn-manage-ad-tag',
            buttonSettingDisable: false,
            displayProp: 'label',
            idProp: 'key',
            dynamicTitle: false
        };
        $scope.translationTexts = {
            buttonDefaultText: 'Column View Settings',
            buttonSubmitDefaultText: 'Save'
        };

        $scope.eventSettings = {
            onItemSelect: onItemSelect,
            onItemDeselect: onItemDeselect,
            onSubmit: eventSubmitSetting
        };

        if (!!$scope.reportGroup && !!$scope.reportGroup.reportType) {
            if (!!$scope.reportGroup.reportType.adSlotType) {
                $scope.isNotNativeAdSlot = $scope.reportGroup.reportType.adSlotType != TYPE_AD_SLOT.native ? true : false;
            } else {
                $scope.isNotNativeAdSlot = $scope.reportGroup.reportType.ronAdSlotType != TYPE_AD_SLOT.native ? true : false;
            }
        }

        $scope.tableConfig = {
            maxPages: 10,
            itemsPerPage: 10
        };

        $scope.showPagination = showPagination;
        $scope.params = $state.current.params;
        $scope.reportStates = PERFORMANCE_REPORT_STATES;
        $scope.updateCpmTypes = UPDATE_CPM_TYPES;

        $scope.goToEditPage = goToEditPage;
        $scope.popupReport = popupReport;
        $scope.drillDownReport = drillDownReport;
        $scope.openUpdateCpm = openUpdateCpm;
        $scope.backToAdTagList = backToAdTagList;
        $scope.getReportFields = getReportFields;
        $scope.getExportExcelFileName = getExportExcelFileName();
        $scope.showConfigForPerformanceByAdTag = showConfigForPerformanceByAdTag;
        $scope.getExportedFieldsForSiteAdNetwork = getExportedFieldsForSiteAdNetwork;
        $scope.getExportedFieldsForAdNetworkSite = getExportedFieldsForAdNetworkSite;

        if (!$scope.hasResult) {
            AlertService.replaceAlerts({
                type: 'warning',
                message: $translate.instant('REPORT.REPORTS_EMPTY')
            });
        }

        function popupReport(relativeToState, report) {
            performanceReportHelper.popupReport(relativeToState, report, reportGroup);
        }

        function drillDownReport(relativeToState, report) {
            performanceReportHelper.drillDownReport(relativeToState, report, reportGroup);
        }

        function openUpdateCpm(item, type) {
            performanceReportHelper.openUpdateCpm(item, type, reportGroup);
        }

        function goToEditPage(baseState, id) {
            performanceReportHelper.goToEditPage(baseState, id);
        }

        function showPagination() {
            return angular.isArray($scope.reports) && $scope.reports.length > $scope.tableConfig.itemsPerPage;
        }

        function getExportExcelFileName() {
            var reportType = reportGroup.reportType || {};
            var reportTypeString = angular.isArray(reportType) ? (reportType.shift().reportType) : reportType.reportType;

            reportTypeString = (reportTypeString != null && reportTypeString != undefined) ? reportTypeString.replace(/\./g, "-") : '';

            return 'pubvantage-report-' + reportTypeString + '-' + DateFormatter.getFormattedDate(new Date(reportGroup.startDate)) + '-' + DateFormatter.getFormattedDate(new Date(reportGroup.endDate));
        }

        function showConfigForPerformanceByAdTag(setting) {
            if (!settings
                || !settings.view
                || !settings.view.report
                || !settings.view.report.performance
                || !settings.view.report.performance[reportType]) {
                return true;
            }

            setting = _.findWhere(settings.view.report.performance[reportType], {key: setting});

            if (!setting) {
                return true;
            }

            // Display fields for admin
            if ($scope.isAdmin) {
                if (setting.hasOwnProperty('hideForAdmin') && setting.hideForAdmin) {
                    return false;
                }

                if (setting.hasOwnProperty('hideForNativeAdSlot')) {
                    if (setting.hideForNativeAdSlot && !$scope.isNotNativeAdSlot) {
                        return false;
                    }
                }

                return true;
            }

            //Native adSlot and not show this field for native adslot
            if (setting.hasOwnProperty('isNotNativeAdSlot') && !$scope.isNotNativeAdSlot && setting.hideForNativeAdSlot) {
                return false;
            }

            return !!setting.show;
        }

        function getReportFields(reportFilesNew, type) {
            var fields = [];
            if (isAdmin) {
                fields = _getReportFieldsForAdmin();
            }
            else {
                fields = _getReportFieldsForPublisher(type);
            }

            angular.forEach(fields, function (field) {
                reportFilesNew.push(field);
            });

            // add fields for site-adNetworkReport
            if (type == 'siteAdNetwork') {
                angular.forEach(ADDITION_FIELDS_FOR_PRICE, function (additionField) {
                    reportFilesNew.push(additionField);
                })
            }

            return reportFilesNew;
        }

        function backToAdTagList() {
            var state = !!$scope.isNotNativeAdSlot ? '^.^.^.tagManagement.adTag.list' : '^.^.^.tagManagement.adTag.nativeList';

            $state.go(state, {adSlotId: $scope.reportGroup.reportType.adSlotId})
        }

        function dataSelect() {
            var data = [];
            if (!settings || !settings.view || !settings.view.report || !settings.view.report.performance || !settings.view.report.performance[reportType]) {
                settings = angular.copy(REPORT_SETTINGS.default);
            }

            $timeout(function () {
                angular.forEach(settings.view.report.performance[reportType], function (item) {
                    if (!$scope.isAdmin) {
                        if (item.hasOwnProperty('show')) {
                            if ($scope.isNotNativeAdSlot && item.key != 'voidImpressions') { //void impression ís only for admin
                                data.push(item);
                            } else {
                                if (item.hasOwnProperty('hideForNativeAdSlot') && !item.hideForNativeAdSlot) {
                                    data.push(item)
                                }
                            }
                        }

                    } else {
                        if (item.hasOwnProperty('hideForAdmin') && !item.hideForAdmin) {
                            if ($scope.isNotNativeAdSlot) {
                                data.push(item);
                            } else {
                                if (item.hasOwnProperty('hideForNativeAdSlot') && !item.hideForNativeAdSlot) {
                                    data.push(item)
                                }
                            }
                        } else {
                            data.push(item)
                        }
                    }
                });
            }, 0);

            console.log('Data to select ', data);

            return data;
        }

        function modelSelect() {
            var data = [];

            $timeout(function () {
                angular.forEach($scope.dataSelect, function (item) {
                    if (item.show) {
                        return data.push({id: item.key});
                    }
                });
            }, 0);

            return data;
        }

        function eventSubmitSetting() {
            _onItemSetting();
        }

        function onItemSelect() {
            // _onItemSetting();
        }

        function onItemDeselect() {
            //_onItemSetting();
        }

        function _onItemSetting() {
            // disable save button temporarily, prevent duplicates
            $scope.settingsSelect.buttonSettingDisable = true;

            if (!settings || !settings.view || !settings.view.report || !settings.view.report.performance || !settings.view.report.performance[reportType]) {
                settings = angular.copy(REPORT_SETTINGS.default);
            }

            //old-settings contains full columns for building patch
            var settingsOld = angular.copy(settings);

            console.log('model select', $scope.modelSelect);

            //detect all changed-items and call api for PATCH
            angular.forEach(settings.view.report.performance[reportType], function (setting) {
                if (!$scope.modelSelect.length) {
                    setting.show = false;
                    return;
                }

                var found = $scope.modelSelect.find(function (element) {
                    return element.id == setting.key
                });

                setting.show = !!found;

                if (!$scope.isNotNativeAdSlot) {
                    if (setting.hideForNativeAdSlot) {
                        setting.show = false;
                    }
                }
            });

            if (!isAdmin) {
                var patchedSettings = getPatchedSettings(settingsOld, settings);

                accountManager.one('').patch({settings: patchedSettings})
                    .then(function () {
                        //update settings for sessionStorage
                        sessionStorage.setCurrentSettings(settings);

                        // enable again save button
                        $scope.settingsSelect.buttonSettingDisable = false;
                    })
                    .catch(function () {
                        console.log('update setting error !');

                        // enable again save button
                        $scope.settingsSelect.buttonSettingDisable = false;
                    })
                ;
            }
        }

        function _getReportFieldsForAdmin() {
            var fields = [];

            angular.forEach(REPORT_SETTINGS.default.view.report.performance[reportType], function (setting) {
                if (setting.hideForNativeAdSlot) {
                    if ($scope.isNotNativeAdSlot && !setting.hideForAdmin) {
                        return fields.push(setting);
                    }
                }
                else {
                    if (!setting.hideForAdmin) {
                        return fields.push(setting);
                    }
                }
            });

            return angular.copy(fields);
        }

        function _getReportFieldsForPublisher(type) {
            var fields = [];

            if (!settings
                || !settings.view
                || !settings.view.report
                || !settings.view.report.performance
                || !settings.view.report.performance[reportType]) {
                settings = angular.copy(REPORT_SETTINGS.default);
            }

            angular.forEach(settings.view.report.performance[reportType], function (setting) {
                if ((setting.show || (!!type && type != reportType))) {
                    if (!!$scope.isNotNativeAdSlot) {
                        return fields.push(setting);
                    }
                }
            });

            return angular.copy(fields);
        }

        /* build the patched-settings (only changes) from old settings (oldSettings) and new settings (newSettings) */
        function getPatchedSettings(oldSettings, newSettings) {
            if (!oldSettings //undefined
                || !oldSettings.view.report.performance[reportType] //undefined
                || !newSettings //undefined
                || !newSettings.view.report.performance[reportType] //undefined
                || oldSettings.view.report.performance[reportType].length !== newSettings.view.report.performance[reportType].length //not same size
                || angular.toJson(oldSettings) === angular.toJson(newSettings) //no changes
                || angular.toJson(oldSettings) === angular.toJson(REPORT_SETTINGS.default) //it's the first time, publisher has not had settings before
            ) {
                return newSettings;
            }

            var changedItems = [];
            for (var idx = 0; idx < oldSettings.view.report.performance[reportType].length; idx++) {
                if (oldSettings.view.report.performance[reportType][idx].key === newSettings.view.report.performance[reportType][idx].key
                    && oldSettings.view.report.performance[reportType][idx].show !== newSettings.view.report.performance[reportType][idx].show
                ) {
                    changedItems.push(newSettings.view.report.performance[reportType][idx]);
                }
            }

            var patchedSettings = angular.copy(newSettings);
            patchedSettings.view.report.performance[reportType] = changedItems;

            return patchedSettings;
        }


        function getExportedFieldsForSiteAdNetwork(customFields) {
            var commonConfigFields = REPORT_SETTINGS.default.view.report.performance['siteAdNetwork'];

            var filteredCommonConfigFields = [];
            angular.forEach(commonConfigFields, function (config) {
                if ($scope.isAdmin) {
                    if (config.hasOwnProperty('isAdminView') && config.isAdminView) {
                        filteredCommonConfigFields.push(config);
                    }
                } else {
                    filteredCommonConfigFields.push(config);
                }
            });

            console.log('getExportedFieldsForSiteAdNetwork',filteredCommonConfigFields);

            if (!angular.isArray(customFields)) {
                return [];
            }

            return _addCommonConfigFields(customFields, filteredCommonConfigFields);
        }

        function getExportedFieldsForAdNetworkSite(customFields) {

            var commonConfigFields = REPORT_SETTINGS.default.view.report.performance['adNetworkSite'];

            var filteredCommonConfigFields = [];
            angular.forEach(commonConfigFields, function (config) {
                if ($scope.isAdmin) {
                    if (config.hasOwnProperty('isAdminView') && config.isAdminView) {
                        filteredCommonConfigFields.push(config);
                    }
                } else {
                    filteredCommonConfigFields.push(config);
                }
            });

            if (!angular.isArray(customFields)) {
                return [];
            }

            return _addCommonConfigFields(customFields, filteredCommonConfigFields);
        }

        function _addCommonConfigFields(customFields, commonConfigFields) {
            if ($scope.isAdmin) {
                angular.forEach(commonConfigFields, function (configField) {
                    if (configField.hasOwnProperty('isAdminView') && configField.isAdminView) {
                        if ($scope.isNotNativeAdSlot) {
                            customFields.push(configField);
                        } else {
                            if (configField.hasOwnProperty('hideForNativeAdSlot') && !configField.hideForNativeAdSlot) {
                                customFields.push(configField);
                            }
                        }
                    }
                });
            } else {
                angular.forEach(commonConfigFields, function (configField) {
                    if (configField.hasOwnProperty('isPublisherView') && configField.isPublisherView) {
                        if ($scope.isNotNativeAdSlot) {
                            customFields.push(configField);
                        } else {
                            if (configField.hasOwnProperty('hideForNativeAdSlot') && !configField.hideForNativeAdSlot) {
                                customFields.push(configField);
                            }
                        }
                    }
                });
            }

            return customFields;
        }


    }
})();