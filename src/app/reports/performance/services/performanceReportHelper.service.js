(function() {
    'use strict';

    angular.module('tagcade.reports.performance')
        .factory('performanceReportHelper', performanceReportHelper)
    ;

    function performanceReportHelper($state, $translate, _, $modal, UserStateHelper, adminUserManager, AdNetworkManager, SiteManager, AdSlotManager, RonAdSlotManager, AdTagManager, SegmentManager, ReportParams, AlertService, PERFORMANCE_REPORT_STATES, UPDATE_CPM_TYPES) {
        var api = {
            popupReport: popupReport,
            drillDownReport: drillDownReport,
            openUpdateCpm: openUpdateCpm,
            goToEditPage: goToEditPage
        };

        return api;
        //

        function popupReport(relativeToState, report, reportGroup) {
            var confirmPopUp = $modal.open({
                templateUrl: _getTemplateUrlPopup(relativeToState),
                size : 'lg',
                controller: 'popupReportController',
                resolve: {
                    relativeEntityData: function() {
                        return _getRelativeEntityDataForPopupReport(relativeToState, report);
                    },
                    reportGroup: function() {
                        return reportGroup;
                    }
                }
            });

            confirmPopUp.result.then(function () {
                return drillDownReport(relativeToState, report, reportGroup);
            });
        }

        function drillDownReport(relativeToState, report, reportGroup) {

            if (!angular.isString(relativeToState)) {
                return;
            }

            // TODO: temporarily convert to common state if siteByAdNetwork
            // need refactor for more clearly understanding report states
            relativeToState = relativeToState == PERFORMANCE_REPORT_STATES.siteByAdNetwork ? PERFORMANCE_REPORT_STATES.adNetworkSiteAdTags : relativeToState;
            // TODO-END

            relativeToState = $state.get(relativeToState, $state.$current);

            if (!relativeToState) {
                console.log('relative report state does not exist');
                return;
            }

            var unfilteredParams = {};

            if (_.isObject(reportGroup.reportType)) {
                _.extend(unfilteredParams, reportGroup.reportType);
            }

            _.extend(unfilteredParams, report);

            var params = ReportParams.getStateParams(unfilteredParams);

            angular.forEach(params, function (value, key) {
                if (!angular.isObject(value)) {
                    return;
                }

                // if data being sent to the server is an object and has an id key
                // replace the value with just the id
                if (value.id) {
                    params[key+'Id'] = value.id;
                }
            });

            $state.transitionTo(relativeToState, params)
                .catch(function() {
                    console.log(params);

                    AlertService.replaceAlerts({
                        type: 'error',
                        message: $translate.instant('REPORT.REPORT_FAIL')
                    });
                })
            ;
        }

        function openUpdateCpm(item, type, reportGroup) {
            var reportType = item.reportType == null ? item : item.reportType;
            var id;

            $modal.open({
                templateUrl: function() {
                    if(type == UPDATE_CPM_TYPES.adTag) {
                        return 'reports/performance/views/cpmForm/formCpmEditorForAdTag.tpl.html';
                    }
                    if(type == UPDATE_CPM_TYPES.site) {
                        return 'reports/performance/views/cpmForm/formCpmEditorForSite.tpl.html';
                    }

                    return 'reports/performance/views/cpmForm/formCpmEditorForAdNetwork.tpl.html';
                },
                controller: 'FormCpmEditor',
                resolve: {
                    cpmData: function () {
                        if(type == UPDATE_CPM_TYPES.adTag) {
                            id = reportType.id ? reportType.id : reportType.adTagId;

                            return AdTagManager.one(id).get();
                        }

                        if(type == UPDATE_CPM_TYPES.site) {
                            return SiteManager.one(reportType.siteId).get();
                        }

                        id = reportType.id ? reportType.id : reportType.adNetworkId;
                        return AdNetworkManager.one(id).get();
                    },
                    Manager: function() {
                        if(type == UPDATE_CPM_TYPES.adTag) {
                            return AdTagManager.one(id);
                        }
                        if(type == UPDATE_CPM_TYPES.site) {

                            return AdNetworkManager.one(reportType.adNetworkId).one('sites', reportType.siteId);
                        }

                        return AdNetworkManager.one(id);
                    },
                    startDate : function() {
                        return reportGroup.startDate;
                    },
                    endDate: function() {
                        return reportGroup.endDate;
                    }
                }
            })
        }

        function goToEditPage(baseState, id) {
            var params = {id: id};
            UserStateHelper.transitionRelativeToBaseState(baseState, params)
        }

        function _getTemplateUrlPopup(relativeToState) {
            switch(relativeToState) {
                case PERFORMANCE_REPORT_STATES.sites:
                case PERFORMANCE_REPORT_STATES.account:
                    return 'reports/performance/views/popup/popupForPublisher.tpl.html';

                case PERFORMANCE_REPORT_STATES.siteAdSlots:
                case PERFORMANCE_REPORT_STATES.site:
                case PERFORMANCE_REPORT_STATES.adNetworkSite:
                case PERFORMANCE_REPORT_STATES.adNetworkSiteAdTags:
                    return 'reports/performance/views/popup/popupForSites.tpl.html';

                case PERFORMANCE_REPORT_STATES.adNetworkSites:
                case PERFORMANCE_REPORT_STATES.adNetwork:
                case PERFORMANCE_REPORT_STATES.siteByAdNetwork:
                    return 'reports/performance/views/popup/popupForAdNetwork.tpl.html';

                case PERFORMANCE_REPORT_STATES.adSlot:
                case PERFORMANCE_REPORT_STATES.adSlotAdTags:
                    return 'reports/performance/views/popup/popupForAdSlot.tpl.html';

                case PERFORMANCE_REPORT_STATES.ronAdSlotSegments:
                case PERFORMANCE_REPORT_STATES.ronAdSlot:
                    return 'reports/performance/views/popup/popupForRonAdSlot.tpl.html';

                case PERFORMANCE_REPORT_STATES.ronAdSlotSites:
                    return 'reports/performance/views/popup/popupForRonAdSlotSegments.tpl.html';

                case PERFORMANCE_REPORT_STATES.ronAdSlotAdTags:
                    return 'reports/performance/views/popup/popupForSites.tpl.html';

                case PERFORMANCE_REPORT_STATES.adTags:
                    return 'reports/performance/views/popup/popupForAdTag.tpl.html';
            }
        }

        function _getRelativeEntityDataForPopupReport(relativeToState, report) {
            var reportType = (report.reportType == null) ? report : report.reportType;

            switch(relativeToState) {
                case PERFORMANCE_REPORT_STATES.sites:
                case PERFORMANCE_REPORT_STATES.account:
                    return adminUserManager.one(reportType.publisherId).get();

                case PERFORMANCE_REPORT_STATES.siteAdSlots:
                case PERFORMANCE_REPORT_STATES.site:
                case PERFORMANCE_REPORT_STATES.adNetworkSite:
                case PERFORMANCE_REPORT_STATES.adNetworkSiteAdTags:
                    return SiteManager.one(reportType.siteId).get();

                case PERFORMANCE_REPORT_STATES.adNetworkSites:
                case PERFORMANCE_REPORT_STATES.adNetwork:
                case PERFORMANCE_REPORT_STATES.siteByAdNetwork:
                    return AdNetworkManager.one(reportType.adNetworkId).get();

                case PERFORMANCE_REPORT_STATES.adSlot:
                case PERFORMANCE_REPORT_STATES.adSlotAdTags:
                    return AdSlotManager.one(reportType.adSlotId).get();

                case PERFORMANCE_REPORT_STATES.ronAdSlotSegments:
                case PERFORMANCE_REPORT_STATES.ronAdSlot:
                    return RonAdSlotManager.one(reportType.ronAdSlotId).get();

                case PERFORMANCE_REPORT_STATES.ronAdSlotAdTags:
                    return SiteManager.one(reportType.site.id).get();

                case PERFORMANCE_REPORT_STATES.ronAdSlotSites:
                    return SegmentManager.one(reportType.segment.id).get();

                case PERFORMANCE_REPORT_STATES.adTags:
                    var adTagId = !reportType.adTagId ? reportType.ronAdTagId : reportType.adTagId;

                    return AdTagManager.one(adTagId).get();
            }
        }
    }
})();