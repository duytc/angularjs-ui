angular.module('tagcade.reports.performanceReport')

    .factory('ReportSelector', function($rootScope, $q, _, Auth, DateFormatter, AdminUserManager, SiteManager, AdSlotManager, AdTagManager, AdNetworkManager) {
        var _isAdmin = Auth.isAdmin();

        var api = {};

        var _initialized = false;

        var _criteria = {
            date: {
                startDate: moment(),
                endDate: moment()
            },
            reportType: null,
            publisherId: null,
            siteId: null,
            adSlotId: null,
            adTagId: null,
            adNetworkId: null
        };

        var _reportTypes = [
            {
                type: 'account',
                name: 'Account',
                fields: [],
                criteria: []
            },
            {
                type: 'site',
                name: 'Site',
                fields: ['site'], // denotes the fields that should be visible when this is the selected report type
                criteria: ['siteId'] // denotes the criteria that is required to fetch these reports from the server
            },
            {
                type: 'adSlot',
                name: 'Ad Slot',
                fields: ['site', 'adSlot'],
                criteria: ['adSlotId']
            },
            {
                type: 'adTag',
                name: 'Ad Tag',
                fields: ['site', 'adSlot', 'adTag'],
                criteria: ['adTagId']
            },
            {
                type: 'adNetwork',
                name: 'Ad Network',
                fields: ['adNetwork'],
                criteria: ['adNetworkId']
            }
        ];

        if (_isAdmin) {
            angular.forEach(_reportTypes, function (type) {
                type.fields.unshift('publisher');
            });

            try {
                findReportType('account').criteria.push('publisherId');
            }
            catch (e) {}

            _reportTypes.unshift({
                type: 'platform',
                name: 'Platform',
                fields: [],
                criteria: []
            });
        }

        var _entityFields = ['publisherId', 'siteId', 'adSlotId', 'adTagId', 'adNetworkId'];

        var _entityFieldHierarchies = [
            ['publisherId', 'siteId', 'adSlotId', 'adTagId'],
            ['publisherId', 'adNetworkId']
        ];

        var _entityFieldData = {
            publisherList: [],
            siteList: [],
            adSlotList: [],
            adTagList: [],
            adNetworkList: []
        };

        // initializes the select boxes with list data
        var _fields = {
            publisher: {
                initChoices: function () {
                    if (_entityFieldData.publisherList.length) {
                        return true;
                    }

                    return AdminUserManager.getList({ filter: 'publisher' })
                        .then(function (users) {
                            _entityFieldData.publisherList = users.plain();
                        })
                    ;
                }
            },
            site: {
                initChoices: function () {
                    if (_entityFieldData.siteList.length) {
                        return true;
                    }

                    return SiteManager.getList()
                        .then(function (sites) {
                            _entityFieldData.siteList = sites.plain();
                        })
                    ;
                }
            },
            adSlot: {
                siteId: null,
                initChoices: function (siteId) {
                    siteId = parseInt(siteId, 10);

                    if (!siteId) {
                        return false;
                    }

                    if (siteId !== this.siteId) {
                        // new siteId, so clear out the old saved data
                        _entityFieldData.adSlotList = [];
                    }

                    if (_entityFieldData.adSlotList.length) {
                        return true;
                    }

                    this.siteId = siteId;

                    return SiteManager.one(siteId).getList('adslots')
                        .then(function (adSlots) {
                            _entityFieldData.adSlotList = adSlots.plain();
                        })
                    ;
                }
            },
            adTag: {
                adSlotId: null,
                initChoices: function (adSlotId) {
                    adSlotId = parseInt(adSlotId, 10);

                    if (!adSlotId) {
                        return false;
                    }

                    if (adSlotId !== this.adSlotId) {
                        _entityFieldData.adTagList = [];
                    }

                    if (_entityFieldData.adTagList.length) {
                        return true;
                    }

                    this.adSlotId = adSlotId;

                    return AdSlotManager.one(adSlotId).getList('adtags')
                        .then(function (adTags) {
                            _entityFieldData.adTagList = adTags.plain();
                        })
                    ;
                }
            },
            adNetwork: {
                initChoices: function () {
                    if (_entityFieldData.adNetworkList.length) {
                        return true;
                    }

                    return AdNetworkManager.getList()
                        .then(function (adNetworks) {
                            _entityFieldData.adNetworkList = adNetworks.plain();
                        })
                    ;
                }
            }
        };

        // used only for the initial setting of criteria to determine any missing criteria
        // i.e if we have an adSlotId, then we can also determine the siteId for that ad slot
        var _entityFieldInitializers = {
            'publisherId': function (id) {
                // todo check that this user is a publisher and not just any user

                return AdminUserManager.one(id).then(function (publisher) {
                    return publisher.plain();
                });
            },
            'siteId': function (id) {
                return SiteManager.one(id).get().then(function (site) {
                    return site.plain();
                });
            },
            'adSlotId': function (id) {
                return AdSlotManager.one(id).get().then(function (adSlot) {
                    return adSlot.plain();
                });
            },
            'adTagId': function (id) {
                return AdTagManager.one(id).get().then(function (adTag) {
                    return adTag.plain();
                });
            },
            'adNetworkId': function (id) {
                return AdNetworkManager.one(id).get().then(function (adNetwork) {
                    return adNetwork.plain();
                });
            }
        };

        /**
         *
         * @param {String} reportType
         * @return {Object|Boolean}
         */
        function findReportType(reportType) {
            return _.findWhere(_reportTypes, { type: reportType });
        }

        /**
         *
         * @param {Object|String} reportType
         * @returns {Object}
         */
        function getReportType(reportType) {
            if (_.isString(reportType)) {
                reportType = _.findWhere(_reportTypes, { type: reportType });
            }

            if (!angular.isObject(reportType) || !angular.isArray(reportType.fields)) {
                return false;
            }

            return reportType;
        }

        function isCriteriaProperty(prop) {
            return _.has(_criteria, prop);
        }

        function isEntityField(field) {
            return _.contains(_entityFields, field);
        }

        /**
         * Get field ancestors in reverse order
         *
         * @param {String} entity
         * @returns {Array|Boolean}
         */
        function getEntityFieldAncestors(entity) {
            for (var i = 0; i < +_entityFieldHierarchies.length; i++) {
                var hierarchy = _entityFieldHierarchies[i];

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

        function setInitialCriteria(data) {
            if (!_.isObject(data)) {
                throw new Error('expected an object');
            }

            var knownKeys = _.intersection(_.keys(data), _.keys(_criteria));

            data = _.pick(data, knownKeys);

            data = _.mapValues(data, function (value, key) {
                if (isEntityField(key)) {
                    value = parseInt(value, 10);
                }

                return value;
            });

            angular.extend(_criteria, data);
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

        function initializeEntityFieldData() {
            var promises = [];

            // need to only check for entity fields that were initially set
            var initialCriteria = angular.copy(_criteria);

            _.forEach(_entityFieldHierarchies, function (hierarchy) {
                _.forEach(hierarchy, function (field) {
                    if (!initialCriteria[field]) {
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

                    var getDataPromise = $q.when(getDataFn(initialCriteria[field]))
                        .then(function (entity) {
                            setEntityFieldData(entity, ancestors);
                        })
                    ;

                    promises.push(getDataPromise);
                });
            });

            return $q.all(promises);
        }

        /**
         * Given an object of data and known ancestors, it goes up the object graph
         * assigning entity ids. This assumes entity field data is the entity ID stored
         * in the 'id' property
         *
         * @param {Object} data
         * @param {Array} ancestors
         */
        function setEntityFieldData(data, ancestors) {
            if (!_.isArray(ancestors)) {
                return;
            }

            var current = data;

            for (var i = 0; i < ancestors.length; i++) {
                var field = ancestors[i];

                if (!isCriteriaProperty(field)) {
                    continue;
                }
                var prop = stripPropertyId(field);

                if (!current[prop]) {
                    return;
                }

                _criteria[field] = current[prop].id;

                current = current[prop];
            }
        }

        api.setAsInitialized = function () {
            _initialized = true;
        };

        /**
         * Set the initial data for the report selector on the first load only
         *
         * If the user has already been interacting with the form, it will already be filled with data
         *
         * @param {string} reportType
         * @param {Object} params
         * @return {Boolean|Promise}
         *
         */
        api.setInitialData = function (reportType, params) {
            if (_initialized) {
                return true;
            }

            if (_.isEmpty(params)) {
                return $q.reject('params is empty');
            }

            if (!findReportType(reportType)) {
                throw new Error('that report type does not exist');
            }

            this.setAsInitialized();

            var initialCriteria = {};

            var startDate = moment().startOf('day');
            var endDate = moment().startOf('day');

            if (params.from) {
                startDate = DateFormatter.getDate(params.from);

                if (!DateFormatter.isValidDate(startDate)) {
                    return $q.reject('invalid start date');
                }
            }

            if (params.to && params.from) {
                endDate = DateFormatter.getDate(params.to);

                if (!DateFormatter.isValidDate(endDate)) {
                    return $q.reject('invalid end date');
                }
            }

            if (!DateFormatter.isValidDateRange(startDate, endDate)) {
                return $q.reject('invalid date range');
            }

            initialCriteria.date = {
                startDate: startDate,
                endDate: endDate
            };

            angular.extend(initialCriteria, _.omit(params, 'from', 'to'));

            setInitialCriteria(initialCriteria);

            var initEntityFieldDataPromise = initializeEntityFieldData();

            var setReportTypePromise = $q.when(initEntityFieldDataPromise)
                .then(function () {
                    return api.selectReportType(reportType);
                })
            ;

            return $q.all([initEntityFieldDataPromise, setReportTypePromise]);
        };

        api.wasInitialized = function () {
            return _initialized;
        };

        /**
         * @returns {Object}
         */
        api.getCriteria = function () {
            // returns a reference, this means it could be modified outside the service
            return _criteria;
        };

        /**
         *
         * @returns {Object|Boolean}
         */
        api.getCriteriaSummary = function () {
            var reportType = getReportType(_criteria.reportType);

            if (!reportType) {
                return false;
            }

            var startDate = _criteria.date.startDate;
            var endDate = _criteria.date.endDate;

            if (!DateFormatter.isValidDateRange(startDate, endDate)) {
                return false;
            }

            startDate = DateFormatter.getFormattedDate(startDate);
            endDate = DateFormatter.getFormattedDate(endDate);

            if (!startDate || !endDate) {
                return false;
            }

            var summary = {
                startDate: startDate,
                endDate: endDate,
                reportType: reportType.type
            };

            if (_.isArray(reportType.criteria)) {
                var requiredCriteria = _.pick(_criteria, reportType.criteria);
                var requiredCriteriaIsSet = _.every(requiredCriteria, _.identity);

                if (!requiredCriteriaIsSet) {
                    return false;
                }

                angular.extend(summary, requiredCriteria);
            }

            return summary;
        };

        /**
         *
         * @returns {Array}
         */
        api.getReportTypes = function () {
            // returns a reference, this means it could be modified outside the service
            return _reportTypes;
        };

        /**
         *
         * @returns {Object}
         */
        api.getEntityFieldData = function () {
            // returns a reference, this means it could be modified outside the service
            return _entityFieldData;
        };

        api.resetSiteSelection = function () {
            _entityFieldData.siteList = [];
            _criteria.siteId = null;

            this.resetAdSlotSelection();
        };

        api.resetAdSlotSelection = function () {
            _entityFieldData.adSlotList = [];
            _criteria.adSlotId = null;

            this.resetAdTagSelection();
        };

        api.resetAdTagSelection = function () {
            _entityFieldData.adTagList = [];
            _criteria.adTagId = null;
        };

        api.resetAdNetworkSelection = function () {
            _entityFieldData.adNetworkList = [];
            _criteria.adNetworkId = null;
        };

        api.fieldShouldBeVisible = function (field, reportType) {
            reportType = reportType || _criteria.reportType;

            reportType = getReportType(reportType);

            if (!reportType) {
                return false;
            }

            return reportType.fields.indexOf(field) !== -1;
        };

        api.selectReportType = function (reportType) {
            var promises = [];

            reportType = getReportType(reportType);

            if (!reportType) {
                return false;
            }

            // criteria only needs the type, not the whole object
            _criteria.reportType = reportType.type;

            if (_isAdmin && this.fieldShouldBeVisible('publisher', reportType)) {
                promises.push(_fields.publisher.initChoices());
            }

            if (this.fieldShouldBeVisible('site', reportType)) {
                promises.push(_fields.site.initChoices());
            }

            if (this.fieldShouldBeVisible('adSlot', reportType)) {
                promises.push(_fields.adSlot.initChoices(_criteria.siteId));
            }

            if (this.fieldShouldBeVisible('adTag', reportType)) {
                promises.push(_fields.adTag.initChoices(_criteria.adSlotId));
            }

            if (this.fieldShouldBeVisible('adNetwork', reportType)) {
                promises.push(_fields.adNetwork.initChoices());
            }

            return $q.all(promises);
        };

        api.selectPublisher = function (publisher, publisherId) {
            this.resetSiteSelection();
            this.resetAdNetworkSelection();

            if (this.fieldShouldBeVisible('site')) {
                _fields.site.initChoices();
            }

            if (this.fieldShouldBeVisible('adNetwork')) {
                _fields.adNetwork.initChoices();
            }
        };

        api.selectSite = function (site, siteId) {
            this.resetAdSlotSelection();

            if (this.fieldShouldBeVisible('adSlot')) {
                _fields.adSlot.initChoices(siteId);
            }
        };

        api.selectAdSlot = function (adSlot, adSlotId) {
            this.resetAdTagSelection();

            if (this.fieldShouldBeVisible('adTag')) {
                _fields.adTag.initChoices(adSlotId);
            }
        };

        return api;
    })

;