(function() {
    'use strict';

    angular.module('tagcade.unifiedReport.autoOptimizeIntegration')
        .controller('TagsMappingController', TagsMappingController)
    ;

    function TagsMappingController($scope, $modal, Auth, sites, SiteManager, autoOptimizeIntegrationClone, adTags, adSlotService, columnName, autoOptimizeIntegration, adminUserManager, AdTagManager, autoOptimizeConfig, EVENT_ACTION_SORTABLE) {
        $scope.isAdmin = Auth.isAdmin();

        $scope.sites = addAllOption(sites, 'All Site');
        $scope.adSlots = [];
        $scope.adTags = adTags;
        $scope.columnName = columnName;

        $scope.autoOptimizeIntegration = autoOptimizeIntegration;
        $scope.autoOptimizeConfig = autoOptimizeConfig;
        $scope.autoOptimizeIntegrationAdTagsMappings = $scope.autoOptimizeIntegration.autoOptimizeIntegrationAdTagsMappings;

        var params = {
            page: 1,
            autoOptimize: true
        };

        $scope.tableConfig = {
            itemsPerPage: 10,
            maxPages: 10,
            totalItems: Number(adTags.totalRecord)
        };

        $scope.availableOptions = {
            currentPage: 1,
            pageSize: 10
        };

        $scope.selectData = {
            query: null
        };

        var getAdTags;

        $scope.selected = {
            site: null,
            adSlot: null,
            mapping: null
        };

        $scope.filterOptions = [
            {key: null, label: 'All'},
            {key: 'mapped', label: 'Mapped Ad Tags'},
            {key: 'unMapped', label: 'Not Mapped Ad Tags'}
        ];

        $scope.showPagination = showPagination;
        $scope.confirmDeletion = confirmDeletion;
        $scope.editMapping = editMapping;
        $scope.selectSite = selectSite;
        $scope.selectAdSlot = selectAdSlot;
        $scope.changePage = changePage;
        $scope.searchData = searchData;
        $scope.showIdentifier = showIdentifier;
        $scope.selectFilter = selectFilter;
        
        function selectFilter(filter) {
            params.page = 1;
            params.autoOptimizeIntegrationAdTagsMapping = filter.key == null ? undefined : filter.key == 'mapped';

            var adSlot = _.find($scope.adSlots, {id: $scope.selected.adSlot});
            _getAdTag(params, null, adSlot);
        }

        function showIdentifier(adTag) {
            var mapping =  _.find($scope.autoOptimizeIntegrationAdTagsMappings, function (item) {
               return item.adTag == adTag.id || item.adTag.id == adTag.id
            });

            return !!mapping && !!mapping.identifier ? mapping.identifier : "<not mapped>"
        }

        function changePage(currentPage) {
            params = angular.extend(params, {page: currentPage});

            var adSlot = _.find($scope.adSlots, {id: $scope.selected.adSlot});
            _getAdTag(params, null, adSlot);
        }

        function searchData() {
            var query = {searchKey: $scope.selectData.query || ''};
            params = angular.extend(params, query);

            var adSlot = _.find($scope.adSlots, {id: $scope.selected.adSlot});
            _getAdTag(params, 500, adSlot);
        }

        $scope.$on(EVENT_ACTION_SORTABLE, function(event, query) {
            params = angular.extend(params, query);

            var adSlot = _.find($scope.adSlots, {id: $scope.selected.adSlot});
            _getAdTag(params, null, adSlot);
        });

        function _getAdTag(query, ms, adSlot) {
            params = query;
            params.autoOptimizeIntegrationId = $scope.autoOptimizeIntegration.id;
            params.includeAdTagIds = [];
            params.excludeAdTagIds = [];

            angular.forEach($scope.autoOptimizeIntegrationAdTagsMappings, function (item) {
                params.includeAdTagIds.push(angular.isObject(item.adTag) ? item.adTag.id : item.adTag)
            });

            angular.forEach(autoOptimizeIntegrationClone.autoOptimizeIntegrationAdTagsMappings, function (autoOptimizeIntegrationAdTagsMapping) {
                var index = angular.forEach($scope.autoOptimizeIntegrationAdTagsMappings, function (item) {
                    return item.adTag.id == autoOptimizeIntegrationAdTagsMapping.adTag.id
                });

                if(index == -1) {
                    params.excludeAdTagIds.push(item.adTag.id);
                }
            });

            params.includeAdTagIds = angular.toJson(params.includeAdTagIds);
            params.excludeAdTagIds = angular.toJson(params.excludeAdTagIds);

            clearTimeout(getAdTags);

            getAdTags = setTimeout(function() {
                var Manager = getManager(params, adSlot);

                params = query;
                return Manager.then(function(adTags) {
                    $scope.adTags = adTags;
                    $scope.tableConfig.totalItems = Number(adTags.totalRecord);
                    $scope.availableOptions.currentPage = Number(query.page);
                });
            }, ms || 0);
        }

        function selectAdSlot(adSlot) {
            params.page = 1;
            $scope.selected.adSlot = adSlot.id;
            _getAdTag(params, null, adSlot);
        }

        function selectSite(site) {
            $scope.selected.adSlot = null;

            if(!!site.id) {
                SiteManager.one(site.id).one('adslots').getList(null, {autoOptimize: true, autoOptimizeIntegrationId: $scope.autoOptimizeIntegration.id})
                    .then(function (adSlots) {
                        $scope.adSlots = addAllOption(adSlots, 'All Ad Slot');
                    });
            }

            params.page = 1;
            $scope.selected.site = site.id;
            _getAdTag(params);
        }

        /**
         *
         * @param {Array} data
         * @param {String} [label]
         * @returns {Array}
         */
        function addAllOption(data, label) {
            if (!angular.isArray(data)) {
                throw new Error('Expected an array of data');
            }

            data.unshift({
                id: null, // default value
                name: label || 'All',
                libraryAdSlot: {
                    name: label || 'All'
                }
            });

            return data;
        }

        function editMapping(adTag) {
            $modal.open({
                templateUrl: 'unifiedReport/autoOptimizeIntegration/addMapping.tpl.html',
                size: 'lg',
                resolve: {
                    adTag: function () {
                        return adTag
                    },
                    sites: function (SiteManager, adminUserManager) {
                        if(!$scope.isAdmin) {
                            return SiteManager.getList();
                        }

                        return adminUserManager.one(_.isObject($scope.autoOptimizeIntegration.publisher) ? $scope.autoOptimizeIntegration.publisher.id : $scope.autoOptimizeIntegration.publisher).one('sites').getList()
                    },
                    columnName: function () {
                        return $scope.columnName
                    },
                    autoOptimizeConfig: function () {
                        return $scope.autoOptimizeConfig
                    },
                    autoOptimizeIntegration: function () {
                        return $scope.autoOptimizeIntegration
                    },
                    identifiers: function (AutoOptimizationManager) {
                        return AutoOptimizationManager.one(angular.isObject($scope.autoOptimizeConfig) ? $scope.autoOptimizeConfig.id : $scope.autoOptimizeConfig).getList('identifiers');
                    }
                },
                controller: 'AddMappingController'
            });
        }

        function confirmDeletion(adTag) {
            var index =  _.findIndex($scope.autoOptimizeIntegrationAdTagsMappings, function (item) {
                return item.adTag == adTag.id || item.adTag.id == adTag.id
            });

            if(index > -1) {
                $scope.autoOptimizeIntegration.autoOptimizeIntegrationAdTagsMappings.splice(index, 1)
            }
        }

        function showPagination() {
            return angular.isArray($scope.adTags.records) && $scope.adTags.totalRecord > $scope.tableConfig.itemsPerPage;
        }
        
        function getManager(params, adSlot) {
            if(!$scope.selected.site) {
                if(!$scope.isAdmin) {
                    return AdTagManager.one().get(params);
                }

                return adminUserManager.one(_.isObject($scope.autoOptimizeIntegration.publisher) ? $scope.autoOptimizeIntegration.publisher.id : $scope.autoOptimizeIntegration.publisher).one('adtags').get(params)
            } else {
                if(!$scope.selected.adSlot) {
                    return SiteManager.one($scope.selected.site).one('adtagsactive').get(params);
                }

                var Manager = adSlotService.getManagerForAdSlot(adSlot);
                return Manager.one($scope.selected.adSlot).one('adtags').get(params);
            }
        }
    }
})();