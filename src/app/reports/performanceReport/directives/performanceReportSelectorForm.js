angular.module('tagcade.reports.performanceReport')

    .directive('performanceReportSelectorForm', function(
        $q, _, REPORT_DATE_FORMAT, PERFORMANCE_REPORT_TYPES, PERFORMANCE_REPORT_EVENTS, Auth, ReportSelector, ReportSelectorForm
    ) {
        return {
            scope: {},
            restrict: 'AE',
            replace: 'true',
            templateUrl: 'reports/performanceReport/directives/performanceReportSelectorForm.tpl.html',
            controller: function($scope, $rootScope, $stateParams, $timeout) {
                // note, there is initialization code at bottom of the controller

                $scope.isLoading = false;
                $scope.isCollapsed = false;

                var isAdmin = Auth.isAdmin();

                var reportTypes = [
                    {
                        type: PERFORMANCE_REPORT_TYPES.platform.account,
                        name: 'Account',
                        fields: [],
                        criteria: []
                    },
                    {
                        type: PERFORMANCE_REPORT_TYPES.platform.site,
                        name: 'Site',
                        fields: ['site'], // denotes the fields that should be visible when this is the selected report type
                        criteria: ['siteId'] // denotes the criteria that is required to fetch these reports from the server
                    },
                    {
                        type: PERFORMANCE_REPORT_TYPES.platform.adSlot,
                        name: 'Ad Slot',
                        fields: ['site', 'adSlot'],
                        criteria: ['adSlotId']
                    },
                    {
                        type: PERFORMANCE_REPORT_TYPES.platform.adTag,
                        name: 'Ad Tag',
                        fields: ['site', 'adSlot', 'adTag'],
                        criteria: ['adTagId']
                    },
                    {
                        type: PERFORMANCE_REPORT_TYPES.adNetwork.adNetwork,
                        name: 'Ad Network',
                        fields: ['adNetwork'],
                        criteria: ['adNetworkId']
                    }
                ];

                if (isAdmin) {
                    _.forEach(reportTypes, function (type) {
                        type.fields.unshift('publisher');
                    });

                    try {
                        findReportType('account').criteria.push('publisherId');
                    }
                    catch (e) {}

                    reportTypes.unshift({
                        type: PERFORMANCE_REPORT_TYPES.platform.platform,
                        name: 'Platform',
                        fields: [],
                        criteria: []
                    });
                }

                var entityFieldData = {
                    publisherList: [],
                    siteList: [],
                    adSlotList: [],
                    adTagList: [],
                    adNetworkList: []
                };

                var fields = {
                    publisher: {
                        initChoices: function () {
                            if (entityFieldData.publisherList.length) {
                                return true;
                            }

                            return ReportSelectorForm.getPublishers()
                                .then(function (users) {
                                    entityFieldData.publisherList = users;
                                })
                            ;
                        }
                    },
                    site: {
                        initChoices: function () {
                            if (entityFieldData.siteList.length) {
                                return true;
                            }

                            return ReportSelectorForm.getSites()
                                .then(function (sites) {
                                    entityFieldData.siteList = sites;
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
                                entityFieldData.adSlotList = [];
                            }

                            if (entityFieldData.adSlotList.length) {
                                return true;
                            }

                            this.siteId = siteId;

                            return ReportSelectorForm.getAdSlots(siteId)
                                .then(function (adSlots) {
                                    entityFieldData.adSlotList = adSlots;
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
                                entityFieldData.adTagList = [];
                            }

                            if (entityFieldData.adTagList.length) {
                                return true;
                            }

                            this.adSlotId = adSlotId;

                            return ReportSelectorForm.getAdTags(adSlotId)
                                .then(function (adTags) {
                                    entityFieldData.adTagList = adTags;
                                })
                            ;
                        }
                    },
                    adNetwork: {
                        initChoices: function () {
                            if (entityFieldData.adNetworkList.length) {
                                return true;
                            }

                            return ReportSelectorForm.getAdNetworks()
                                .then(function (adNetworks) {
                                    entityFieldData.adNetworkList = adNetworks;
                                })
                            ;
                        }
                    }
                };

                /**
                 *
                 * @param {String} reportType
                 * @return {Object|Boolean}
                 */
                function findReportType(reportType) {
                    return _.findWhere(reportTypes, { type: reportType });
                }

                /**
                 *
                 * @param {Object|String} reportType
                 * @returns {Object}
                 */
                function getReportType(reportType) {
                    if (_.isString(reportType)) {
                        reportType = findReportType(reportType);
                    }

                    if (!_.isObject(reportType) || !_.isArray(reportType.fields)) {
                        return false;
                    }

                    return reportType;
                }

                $scope.isAdmin = Auth.isAdmin();

                $scope.formProcessing = false;

                $scope.datePickerOpts = {
                    format: REPORT_DATE_FORMAT,
                    minDate: null, // user join date
                    maxDate:  moment().endOf('day'),
                    ranges: {
                        'Today': [moment().startOf('day'), moment().endOf('day')],
                        'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
                        'Last 7 Days': [moment().subtract(6, 'days'), moment()],
                        'Last 30 Days': [moment().subtract(29, 'days'), moment()],
                        'This Month': [moment().startOf('month'), moment().endOf('month')],
                        'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
                    }
                };

                $scope.criteria = {
                    date: {
                        startDate: moment(),
                        endDate: moment()
                    },
                    expand: false,
                    reportType: null,
                    publisherId: null,
                    siteId: null,
                    adSlotId: null,
                    adTagId: null,
                    adNetworkId: null,
                    allSites: null
                };

                $scope.reportTypes = reportTypes;

                $scope.entityFieldData = entityFieldData;

                $scope.openSelector = function () {
                    if ($scope.isLoading) {
                        return;
                    }

                    $scope.isCollapsed = !$scope.isCollapsed
                };

                /**
                 *
                 * @param {String} field
                 * @param {Object} [reportType]
                 * @returns {Boolean}
                 */
                $scope.fieldShouldBeVisible = function (field, reportType) {
                    reportType = reportType || $scope.criteria.reportType;

                    reportType = getReportType(reportType);

                    if (!reportType) {
                        return false;
                    }

                    return reportType.fields.indexOf(field) !== -1;
                };

                $scope.resetSiteSelection = function () {
                    $scope.siteList = [];
                    $scope.criteria.siteId = null;
                };

                $scope.resetAdSlotSelection = function () {
                    $scope.adSlotList = [];
                    $scope.criteria.adSlotId = null;
                };

                $scope.resetAdTagSelection = function () {
                    $scope.adTagList = [];
                    $scope.criteria.adTagId = null;
                };

                $scope.resetAdNetworkSelection = function () {
                    $scope.adNetworkList = [];
                    $scope.criteria.adNetworkId = null;
                };

                $scope.selectReportType = function (reportType) {
                    reportType = reportType || $scope.criteria.reportType;

                    var promises = [];

                    reportType = getReportType(reportType);

                    if (!reportType) {
                        return false;
                    }

                    if (isAdmin && $scope.fieldShouldBeVisible('publisher', reportType)) {
                        promises.push(fields.publisher.initChoices());
                    }

                    if ($scope.fieldShouldBeVisible('site', reportType)) {
                        promises.push(fields.site.initChoices());
                    }

                    if ($scope.fieldShouldBeVisible('adSlot', reportType)) {
                        promises.push(fields.adSlot.initChoices($scope.criteria.siteId));
                    }

                    if ($scope.fieldShouldBeVisible('adTag', reportType)) {
                        promises.push(fields.adTag.initChoices($scope.criteria.adSlotId));
                    }

                    if ($scope.fieldShouldBeVisible('adNetwork', reportType)) {
                        promises.push(fields.adNetwork.initChoices());
                        promises.push(fields.site.initChoices());
                    }

                    return $q.all(promises);
                };

                $scope.selectPublisher = function (publisher, publisherId) {
                    $scope.resetSiteSelection();
                    $scope.resetAdNetworkSelection();

                    if ($scope.fieldShouldBeVisible('site')) {
                        fields.site.initChoices();
                    }

                    if ($scope.fieldShouldBeVisible('adNetwork')) {
                        fields.adNetwork.initChoices();
                    }
                };

                $scope.selectSite = function (site, siteId) {
                    $scope.resetAdSlotSelection();
                    $scope.resetAdTagSelection();

                    if ($scope.fieldShouldBeVisible('adSlot')) {
                        fields.adSlot.initChoices(siteId);
                    }
                };

                $scope.selectAdSlot = function (adSlot, adSlotId) {
                    $scope.resetAdTagSelection();

                    if ($scope.fieldShouldBeVisible('adTag')) {
                        fields.adTag.initChoices(adSlotId);
                    }
                };

                $scope.selectAdNetwork = function (adNetwork, adNetworkId) {
                    fields.site.initChoices(); // this field always shows for ad network reports
                };

                $scope.isFormValid = function() {
                    return $scope.reportSelectorForm.$valid;
                };

                $scope.submit = function() {
                    if ($scope.formProcessing) {
                        // already running, prevent duplicate
                        return;
                    }

                    $scope.formProcessing = true;

                    var params = ReportSelector.getParamsForReportType($scope.criteria);

                    if (!$rootScope.$broadcast(PERFORMANCE_REPORT_EVENTS.formSubmit, $scope.criteria.reportType, params).defaultPrevented) {
                        $scope.isCollapsed = true;
                    }

                    $scope.formProcessing = false;
                };

                // form init

                function reloadData() {
                    if (!ReportSelectorForm.requiresReload) {
                        return;
                    }

                    ReportSelectorForm.requiresReload = false;

                    var criteria = ReportSelectorForm.getInitialParams();

                    if (!criteria) {
                        return $q.reject('no criteria');
                    }

                    $scope.isCollapsed = true;
                    $scope.isLoading = true;

                    _.extend($scope.criteria, criteria);

                    return ReportSelectorForm.getCalculatedParams(criteria)
                        .then(function (params) {
                            _.extend($scope.criteria, params);
                        })
                        .then(function () {
                            return $scope.selectReportType();
                        })
                        .finally(function () {
                            $scope.isLoading = false;
                        })
                    ;
                }

                $scope.$watch(function () {
                    return ReportSelectorForm.requiresReload;
                }, reloadData);
            }
        };
    })

;