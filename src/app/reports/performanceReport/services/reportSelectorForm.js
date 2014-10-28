angular.module('tagcade.reports.performanceReport')

    .factory('ReportSelectorForm', function(
        $rootScope, $q, _, Auth, DateFormatter, AdminUserManager, SiteManager, AdSlotManager, AdTagManager, AdNetworkManager
        ) {
        var api = {};

        api.requiresReload = false;

        var __data = null;

        function resetData() {
            __data = {};
        }

        var _entityFieldHierarchies = [
            ['publisherId', 'siteId', 'adSlotId', 'adTagId'],
            ['publisherId', 'adNetworkId']
        ];

        // used only for the initial setting of criteria to determine any missing criteria
        // i.e if we have an adSlotId, then we can also determine the siteId for that ad slot
        var _entityFieldInitializers = {
            publisherId: function (id) {
                // todo check that this user is a publisher and not just any user

                return AdminUserManager.one(id).then(function (publisher) {
                    return publisher.plain();
                });
            },
            siteId: function (id) {
                return SiteManager.one(id).get().then(function (site) {
                    return site.plain();
                });
            },
            adSlotId: function (id) {
                return AdSlotManager.one(id).get().then(function (adSlot) {
                    return adSlot.plain();
                });
            },
            adTagId: function (id) {
                return AdTagManager.one(id).get().then(function (adTag) {
                    return adTag.plain();
                });
            },
            adNetworkId: function (id) {
                return AdNetworkManager.one(id).get().then(function (adNetwork) {
                    return adNetwork.plain();
                });
            }
        };

        function isBoolean(value) {
            return _.contains([true, 'true'], value);
        }

        /**
         * Removes Id from the end of a string
         * @param prop
         * @returns {String}
         */
        function stripPropertyId(prop) {
            var idMatch = prop.lastIndexOf('Id');

            if (idMatch === -1) {
                return prop;
            }

            return prop.substr(0, idMatch);
        }

        /**
         * Get field ancestors in reverse order
         *
         * @param {String} entity
         * @returns {Array|Boolean}
         */
        function getEntityFieldAncestors(entity) {
            for (var i = 0; i < _entityFieldHierarchies.length; i++) {
                var hierarchy = angular.copy(_entityFieldHierarchies[i]); // need a copy otherwise splice modifies

                var fieldPos = _.indexOf(hierarchy, entity);

                if (fieldPos === -1) {
                    continue;
                }

                var ancestors = hierarchy.splice(0, fieldPos);

                if (!ancestors.length) {
                    continue;
                }

                return ancestors.reverse();
            }

            return false;
        }

        /**
         * Given an object of data and known ancestors, it goes up the object graph
         * collecting entity ids. This assumes entity field data is the entity ID stored
         * in the 'id' property
         *
         * i.e if we had an ad slot entity such as
         *
         * {
         *      id: 1,
         *      site: {
         *          id: 2,
         *          publisher: {
         *              id: 3
         *          }
         *      }
         * }
         *
         * The return value will be
         *
         * {
         *      siteId: 2,
         *      publisherId: 3
         * }
         *
         * @param {Object} data
         * @param {Array} ancestors
         * @return {Object|Boolean}
         */
        function getParamsFromEntity(data, ancestors) {
            if (!_.isArray(ancestors)) {
                return false;
            }

            var params = {};

            var current = data;

            for (var i = 0; i < ancestors.length; i++) {
                var field = ancestors[i];

                var prop = stripPropertyId(field);

                if (!current[prop]) {
                    break;
                }

                params[field] = current[prop].id;

                current = current[prop];
            }

            return params;
        }

        /**
         *
         * @param initialParams
         * @returns {Promise<Object>}
         */
        function getCalculatedParams(initialParams) {
            var promises = [];

            // params to return
            var params = {};

            _.forEach(_entityFieldHierarchies, function (hierarchy) {
                _.forEach(hierarchy, function (field) {
                    if (!initialParams[field]) {
                        return;
                    }

                    if (!_.has(_entityFieldInitializers, field)) {
                        return;
                    }

                    var getDataFn = _entityFieldInitializers[field];

                    if (!_.isFunction(getDataFn)) {
                        return;
                    }

                    var ancestors = getEntityFieldAncestors(field);

                    if (!ancestors || !ancestors.length) {
                        return;
                    }

                    var getDataPromise = $q.when(getDataFn(initialParams[field]))
                        .then(function (entity) {
                            _.extend(params, getParamsFromEntity(entity, ancestors));
                        })
                    ;

                    promises.push(getDataPromise);
                });
            });

            return $q.all(promises).then(function () {
                return params;
            });
        }

        /**
         * Returns a date object used by the date range picker from query params
         *
         * @param startDate
         * @param endDate
         * @returns {Object}
         */
        function getDateRangeFromQueryParams(startDate, endDate) {
            var dateRange = {};

            startDate = DateFormatter.getDate(startDate);

            if (!startDate) {
                return dateRange;
            }

            dateRange.date = {
                startDate: startDate
            };

            endDate = DateFormatter.getDate(endDate);

            if (!endDate) {
                endDate = startDate;
            }

            dateRange.date.endDate = endDate;

            return dateRange;
        }

        /**
         *
         * @param {String} reportType
         * @param {Object} params
         * @returns {boolean}
         */
        api.setInitialData = function (reportType, params) {
            if (!_.isString(reportType) || !_.isObject(params)) {
                return false;
            }

            resetData();

            var initialData = {};
            
            _.extend(
                initialData,
                params,
                {
                    reportType: reportType
                }
            );

            __data = initialData;

            this.requiresReload = true;

            return true;
        };

        /**
         *
         * @returns {Object|Boolean}
         */
        api.getInitialParams = function () {
            if (!_.isObject(__data) || _.isEmpty(__data)) {
                return false;
            }

            var params = {
                reportType: __data.reportType,
                expand: isBoolean(__data.expand)
            };

            _.extend(params, getDateRangeFromQueryParams(__data.startDate, __data.endDate));

            var ids = _.pick(__data, function(value, key) {
                if (!_.isString(key)) {
                    return false;
                }

                return /Id$/.test(key);
            });

            _.extend(params, ids);

            resetData();

            return params;
        };

        /**
         *
         * @param {Object} initialParams
         * @returns {Promise.<Object>}
         */
        api.getCalculatedParams = function (initialParams) {
            if (!_.isObject(initialParams)) {
                return $q.reject('no initial params provided');
            }

            return getCalculatedParams(initialParams);
        };

        api.getPublishers = function () {
            return AdminUserManager.getList({ filter: 'publisher' })
                .then(function (users) {
                    return users.plain();
                })
            ;
        };

        api.getSites = function () {
            return SiteManager.getList()
                .then(function (sites) {
                    return sites.plain();
                })
            ;
        };

        api.getAdSlots = function (siteId) {
            return SiteManager.one(siteId).getList('adslots')
                .then(function (adSlots) {
                    return adSlots.plain();
                })
            ;
        };

        api.getAdTags = function (adSlotId) {
            return AdSlotManager.one(adSlotId).getList('adtags')
                .then(function (adTags) {
                    return adTags.plain();
                })
            ;
        };

        api.getAdNetworks = function () {
            return AdNetworkManager.getList()
                .then(function (adNetworks) {
                    return adNetworks.plain();
                })
            ;
        };

        return api;
    })

;