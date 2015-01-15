(function() {
    'use strict';

    angular.module('tagcade.reports')
        .factory('selectorFormCalculator', selectorFormCalculator)
    ;

    function selectorFormCalculator($q, _, adminUserManager, AdNetworkManager, SiteManager, AdSlotManager, AdTagManager) {
        var api = {
            getCalculatedParams: getCalculatedParams,
        };

        var _entityFieldHierarchies = [
            ['publisherId', 'siteId', 'adSlotId', 'adTagId'],
            ['publisherId', 'adNetworkId']
        ];

        // used only for the initial setting of criteria to determine any missing criteria
        // i.e if we have an adSlotId, then we can also determine the siteId for that ad slot
        var _entityFieldInitializers = {
            publisherId: function (id) {
                // todo check that this user is a publisher and not just any user

                return adminUserManager.one(id).then(function (publisher) {
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

        return api;

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

        function getCalculatedParams(initialParams) {
            var promises = [];
            // params to return
            var params = angular.copy(initialParams);

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
    }
})();
