(function() {
    'use strict';

    angular.module('tagcade.supportTools.cpmEditor')
        .controller('CpmEditor', CpmEditor)
    ;

    function CpmEditor($scope, $translate, Auth, AlertService, cpmEditorService, CPM_EDITOR_TYPES, DateFormatter, AdTagManager, AdNetworkManager) {
        var isAdmin = Auth.isAdmin();
        $scope.isAdmin = isAdmin;

        $scope.datePickerOpts = {
            maxDate: moment().subtract(1, 'days').endOf('day'),
            ranges: {
                'Last 7 Days': [moment().subtract(6, 'days'), moment()],
                'This Month': [moment().startOf('month'), moment().endOf('month')],
                'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
            }
        };

        var selectedData = {
            date: {
                startDate: null,
                endDate: null
            },
            CPM : null,
            updateTypes: null,
            publisherId: null,
            siteId: null,
            adNetworkId: null,
            adNetworkForSiteId: null,
            adSlotId: null,
            adTagId: null
        };

        if(!isAdmin) {
            selectedData.publisherId = true;
        }

        $scope.selectedData = selectedData;

        $scope.optionData = {
            publishers: [],
            sites: [],
            sitesByAdNetwork: [],
            adNetworks: [],
            adSlotId : []
        };

        $scope.submit = submit;
        $scope.isFormValid = isFormValid;
        $scope.selectUpdateTypesis = selectUpdateTypesis;
        $scope.selectPublisher = selectPublisher;
        $scope.selectSite = selectSite;
        $scope.selectAdSlot = selectAdSlot;
        $scope.selectAdNetworkForSiteId = selectAdNetworkForSiteId;
        $scope.updateTypes = CPM_EDITOR_TYPES;

        $scope.updateTypesOptions = [
            {
                key: CPM_EDITOR_TYPES.adTag,
                label: 'Ad Tag'
            },
            {
                key: CPM_EDITOR_TYPES.adNetwork,
                label: 'Demand Partner'
            },
            {
                key: CPM_EDITOR_TYPES.site,
                label: 'Supply'
            }
        ];

        init();

        function init() {
            if (isAdmin) {
                cpmEditorService.getPublishers()
                    .then(function (users) {
                        $scope.optionData.publishers = users;
                    })
                ;
            }

            cpmEditorService.getSites()
                .then(function (sites) {
                    $scope.optionData.sites = sites;
                })
            ;

            cpmEditorService.getAdNetworks()
                .then(function (adNetworks) {
                    $scope.optionData.adNetworks = adNetworks;
                })
            ;
        }

        function selectPublisher() {
            $scope.selectedData.siteId = null;
            $scope.selectedData.adNetworkId = null;
            $scope.selectedData.adNetworkForSiteId = null;
            $scope.selectedData.adSlotId = null;
            $scope.selectedData.adTagId = null;
        }

        function selectSite(site) {
            $scope.selectedData.adSlotId = null;
            $scope.selectedData.adTagId = null;

            cpmEditorService.getAdSlotBySite(site)
                .then(function (adSlots) {
                    $scope.optionData.adSlots = adSlots;
                })
            ;
        }

        function selectAdSlot(adSlot) {
            $scope.selectedData.adTagId = null;

            cpmEditorService.getAdTagByAdSlot(adSlot)
                .then(function (adTags) {
                    $scope.optionData.adTags = adTags;
                })
            ;
        }

        function selectAdNetworkForSiteId(adNetwork) {
            $scope.selectedData.sitesByAdNetworkId = null;

            cpmEditorService.getSitesByAdNetwork(adNetwork)
                .then(function (sites) {
                    $scope.optionData.sitesByAdNetwork = sites;
                })
            ;
        }

        function selectUpdateTypesis(reportTypeKey) {
            var updateTypes = $scope.selectedData.updateTypes;

            if (!angular.isObject(updateTypes)) {
                return false;
            }

            return updateTypes.key == reportTypeKey;
        }

        function isFormValid() {
            return $scope.cpmSelectorForm.$valid && $scope.selectedData.date.endDate <= $scope.datePickerOpts.maxDate && $scope.selectedData.CPM != null;
        }

        function submit() {
            //console.log($scope.selectedData);

            var Manager = null;

            if($scope.selectedData.adTagId) {
                Manager = AdTagManager.one($scope.selectedData.adTagId);
            }
            else if($scope.selectedData.adNetworkId) {
                Manager = AdNetworkManager.one($scope.selectedData.adNetworkId);
            }
            else if($scope.selectedData.adNetworkForSiteId) {
                Manager = AdNetworkManager.one($scope.selectedData.adNetworkForSiteId).one('sites', $scope.selectedData.sitesByAdNetworkId);
            }

            AlertService.removeAlert();

            var start = DateFormatter.getFormattedDate($scope.selectedData.date.startDate);
            var end = DateFormatter.getFormattedDate($scope.selectedData.date.endDate);

            var request = Manager.customPUT('', 'estcpm', { startDate : start, endDate : end, estCpm : $scope.selectedData.CPM });
            request
                .then(
                function () {
                    AlertService.addAlert({
                        type: 'success',
                        message: $translate.instant('CPM_EDITOR_MODULE.UPDATE_SUCCESS')
                    });
                })
                .catch(
                function () {
                    AlertService.addAlert({
                        type: 'error',
                        message: $translate.instant('CPM_EDITOR_MODULE.UPDATE_FAIL')
                    });
                });
        }
    }
})();