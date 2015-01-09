(function() {
    'use strict';

    angular.module('tagcade.supportTools.cpmEditor')
        .controller('CpmEditor', CpmEditor)
    ;

    function CpmEditor($scope, $modal, publishers, adNetworks, ngTableParams, $filter, TableParamsHelper, AdTagManager, userSession, AdNetworkManager, AccountManager, Auth) {
        $scope.publishers = publishers;
        $scope.adNetworks = null;
        $scope.sites = null;

        var isAdmin = Auth.isAdmin();
        $scope.isAdmin = isAdmin;

        if(!isAdmin) {
            $scope.adNetworks = adNetworks;
        }

        $scope.selected = {
            publisher : null,
            adNetwork : null
        };

        $scope.openBoxCpmEditorForAdTag = openBoxCpmEditorForAdTag;
        $scope.selectPublisher = selectPublisher;
        $scope.selectAdNetwork = selectAdNetwork;
        $scope.isFormValid = isFormValid;
        $scope.addAllOption = addAllOption;
        $scope.getListAdTag = getListAdTag;

        /**
         *
         * @param {Array} data
         * @param {String} [label]
         * @returns {Array}
         */
        function addAllOption(data, label)
        {
            if (!angular.isArray(data)) {
                throw new Error('Expected an array of data');
            }

            data.unshift({
                id: null, // default value
                name: label || 'All'
            });

            return data;
        }

        $scope.groupEntities = function(item){
            if (item.id === null) {
                return undefined; // no group
            }

            return ''; // separate group with no name
        };

        function selectPublisher() {
            $scope.selected.adNetwork = null;
            $scope.adNetworks = adNetworks;
        }

        function selectAdNetwork(adNetwork) {
            $scope.selected.site = null;
            return AdNetworkManager.one(adNetwork.id).one('sites').one('active').getList()
                .then(function (data) {
                    addAllOption(data, 'All Site');
                    $scope.sites = data.plain();
            });
        }

        function isFormValid() {
            if (!isAdmin) {
                return $scope.selected.adNetwork != null;
            }

            return $scope.selected.adNetwork != null && $scope.selected.publisher != null;
        }

        function getListAdTag() {
            delete $scope.tableParamsForAdTags;

            if(!isAdmin) {
                $scope.selected.publisher = userSession.id;
            }

            if(!$scope.selected.site) {
                AccountManager.one($scope.selected.publisher).one('adnetworks', $scope.selected.adNetwork).one('adtags').one('active').getList()
                    .then(function (data) {
                        var adTags = data.plain();
                        $scope.tableParamsForAdTags = tableParamsForAdTags(adTags);
                    })
                ;
            }
            else {
                AccountManager.one($scope.selected.publisher).one('adnetworks', $scope.selected.adNetwork).one('sites', $scope.selected.site).one('adtags').one('active').getList()
                    .then(function (data) {
                        var adTags = data.plain();
                        $scope.tableParamsForAdTags = tableParamsForAdTags(adTags);
                    })
                ;
            }
        }

        function tableParamsForAdTags(adTags) {
            return new ngTableParams(
                {
                    page: 1,
                    count: 10,
                    sorting: {
                        name: 'asc'
                    }
                },
                {
                    total: adTags.length,
                    getData: function($defer, params) {
                        var filters = TableParamsHelper.getFilters(params.filter());

                        var filteredData = params.filter() ? $filter('filter')(adTags, filters) : adTags;
                        var orderedData = params.sorting() ? $filter('orderBy')(filteredData, params.orderBy()) : filteredData;
                        var paginatedData = orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count());

                        params.total(orderedData.length);
                        $defer.resolve(paginatedData);
                    }
                }
            );
        }

        function openBoxCpmEditorForAdTag(adTag) {
            $modal.open({
                templateUrl: 'supportTools/cpmEditor/formCpmEditorForAdTag.tpl.html',
                size : 'lg',
                controller: 'FormCpmEditor',
                resolve: {
                    data: function () {
                        return adTag;
                    },
                    tplConfirm: function () {
                        return 'supportTools/cpmEditor/confirmUpdateForAdTag.tpl.html';
                    },
                    Manager: function() {
                        return AdTagManager;
                    }
                }
            })
        }

    }
})();