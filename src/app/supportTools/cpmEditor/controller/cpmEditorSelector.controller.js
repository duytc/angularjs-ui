(function() {
    'use strict';

    angular.module('tagcade.supportTools.cpmEditor')
        .controller('CpmEditorSelector', CpmEditorSelector)
    ;

    function CpmEditorSelector($scope, $q, $state, _, Auth, UserStateHelper, AlertService, ReportParams, cpmEditorService, CPM_EDITOR_TYPES, selectorFormCalculator) {
        var toState;
        var isAdmin = Auth.isAdmin();
        $scope.isAdmin = isAdmin;

        var selectedData = {
            updateTypes: null,
            publisherId: null,
            siteId: null,
            adNetworkId: null
        };

        $scope.selectedData = selectedData;

        $scope.optionData = {
            publishers: [],
            sites: [],
            adNetworks: []
        };

        $scope.showPublisherSelect = showPublisherSelect;
        $scope.selectUpdateTypesis = selectUpdateTypesis;
        $scope.isFormValid = isFormValid;
        $scope.getList = getList;
        $scope.selectUpdateTypes = selectUpdateTypes;
        $scope.selectPublisher = selectPublisher;
        $scope.updateTypes = CPM_EDITOR_TYPES;

        var updateTypesOptions = [
            {
                key: CPM_EDITOR_TYPES.adTag,
                label: 'Ad Tag',
                toState: 'supportTools.cpmEditor.adTags'
            },
            {
                key: CPM_EDITOR_TYPES.adNetwork,
                label: 'Ad Network',
                toState: 'supportTools.cpmEditor.adNetworks'
            },
            {
                key: CPM_EDITOR_TYPES.site,
                label: 'Site',
                toState: 'supportTools.cpmEditor.sites'
            }
        ];

        $scope.updateTypesOptions = updateTypesOptions;

        init();

        /**
         *
         * @param {Object} updateTypes
         */
        function selectUpdateTypes(updateTypes) {
            if (!angular.isObject(updateTypes) || !updateTypes.toState) {
                throw new Error('report type is missing a target state');
            }

            toState = updateTypes.toState;
        }

        /**
         *
         * @param {String} reportTypeKey
         * @return {Object|Boolean}
         */
        function findReportType(reportTypeKey) {
            return _.findWhere(updateTypesOptions, { key: reportTypeKey });
        }


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

            var initialParams = cpmEditorService.getInitialParams();
            if (initialParams == null) {
                return;
            }

            selectorFormCalculator.getCalculatedParams(initialParams).then(
                function(calculatedParams) {

                    var updateTypes = findReportType(calculatedParams.updateTypes) || null;
                    $scope.selectedData.updateTypes = updateTypes;

                    var initialData = {
                        publisherId: null,
                        siteId: null,
                        adNetworkId: null,
                        updateTypes: updateTypes
                    };

                    angular.extend(initialData, _.omit(calculatedParams, ['updateTypes']));

                    angular.extend($scope.selectedData, initialData);
                }
            );
        }

        function showPublisherSelect() {
            return isAdmin && $scope.cpmSelectorForm.updateTypes.$valid;
        }

        function selectPublisher() {
            $scope.selectedData.siteId = null;
            $scope.selectedData.adNetworkId = null;
        }

        function selectUpdateTypesis(reportTypeKey) {
            var updateTypes = $scope.selectedData.updateTypes;

            if (!angular.isObject(updateTypes)) {
                return false;
            }

            return updateTypes.key == reportTypeKey;
        }

        function isFormValid() {
            return $scope.cpmSelectorForm.$valid;
        }

        function getList() {
            var transition;
            var params = ReportParams.getStateParams($scope.selectedData);

            if (toState == null) {
                transition = $state.transitionTo(
                    $state.$current,
                    params
                );
            } else {
                transition = UserStateHelper.transitionRelativeToBaseState(
                    toState,
                    params
                );
            }

            $q.when(transition)
                .catch(function(error) {
                    console.log(params);

                    AlertService.replaceAlerts({
                        type: 'error',
                        message: 'An error occurred trying to request the report'
                    });
                })
            ;
        }
    }
})();