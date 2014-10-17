angular.module('tagcade.reports.performanceReport')

    .directive('performanceReportSelector', function(PERFORMANCE_REPORT_EVENTS, AlertService, AdminUserManager, SiteManager, AdSlotManager, AdNetworkManager) {
        return {
            scope: {
                isAdmin: '=',
                criteria: '='
            },
            restrict: 'AE',
            replace: 'true',
            templateUrl: 'reports/performanceReport/directives/selector.tpl.html',
            controller: function($scope, $rootScope) {
                $scope.isCollapsed = false;
                $scope.formProcessing = false;

                $scope.datePickerOpts = {
                    format: 'YYYY-MM-DD',
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

                $scope.publisherList = [];
                $scope.siteList = [];
                $scope.adSlotList = [];
                $scope.adTagList = [];
                $scope.adNetworkList = [];

                // need to store the reportType separate since this is the full object
                // in the criteria object, we just need the report name
                $scope.selected = {
                    reportType: null
                };

                $scope.criteria = angular.extend({
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
                }, $scope.criteria);

                $scope.publisherFilterCriteria = null;

                var fields = {
                    publisher: {
                        initData: function () {
                            if (!$scope.publisherList.length) {
                                AdminUserManager.getList({ filter: 'publisher' }).then(function (users) {
                                    $scope.publisherList = users.plain();
                                });
                            }
                        }
                    },
                    site: {
                        initData: function () {
                            if (!$scope.siteList.length) {
                                SiteManager.getList().then(function (sites) {
                                    $scope.siteList = sites.plain();
                                });
                            }
                        }
                    },
                    adSlot: {
                        siteId: null,
                        initData: function (siteId) {
                            siteId = parseInt(siteId, 10);

                            if (!siteId) {
                                return;
                            }

                            if (siteId !== this.siteId) {
                                // new siteId, so clear out the old saved data
                                $scope.adSlotList = [];
                            }

                            if (!$scope.adSlotList.length) {
                                SiteManager.one(siteId).getList('adslots').then(function (adSlots) {
                                    $scope.adSlotList = adSlots.plain();
                                });

                                this.siteId = siteId;
                            }
                        }
                    },
                    adTag: {
                        adSlotId: null,
                        initData: function (adSlotId) {
                            adSlotId = parseInt(adSlotId, 10);

                            if (!adSlotId) {
                                return;
                            }

                            if (adSlotId !== this.adSlotId) {
                                $scope.adTagList = [];
                            }

                            if (!$scope.adTagList.length) {
                                AdSlotManager.one(adSlotId).getList('adtags').then(function (adTags) {
                                    $scope.adTagList = adTags.plain();
                                });

                                this.adSlotId = adSlotId;
                            }
                        }
                    },
                    adNetwork: {
                        initData: function () {
                            if (!$scope.adNetworkList.length) {
                                AdNetworkManager.getList().then(function (adNetworks) {
                                    $scope.adNetworkList = adNetworks.plain();
                                });
                            }
                        }
                    }
                };

                var reportTypes = [
                    {
                        type: 'account',
                        name: 'Account',
                        fields: []
                    },
                    {
                        type: 'site',
                        name: 'Site',
                        fields: ['site']
                    },
                    {
                        type: 'adSlot',
                        name: 'Ad Slot',
                        fields: ['site', 'adSlot']
                    },
                    {
                        type: 'adTag',
                        name: 'Ad Tag',
                        fields: ['site', 'adSlot', 'adTag']
                    },
                    {
                        type: 'adNetwork',
                        name: 'Ad Network',
                        fields: ['adNetwork']
                    }
                ];

                if ($scope.isAdmin) {
                    angular.forEach(reportTypes, function (type) {
                        type.fields.unshift('publisher');
                    });

                    reportTypes.unshift({
                        type: 'platform',
                        name: 'Platform'
                    });
                }

                $scope.reportTypes = reportTypes;

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
                };

                /**
                 *
                 * @param {String} field
                 * @param {Object} [reportType]
                 * @returns {boolean}
                 */
                $scope.fieldShouldBeVisible = function (field, reportType) {
                    reportType = reportType || $scope.selected.reportType;

                    if (!angular.isObject(reportType) || !angular.isArray(reportType.fields)) {
                        return false;
                    }

                    return reportType.fields.indexOf(field) !== -1;
                };

                $scope.selectReportType = function (reportType) {
                    // criteria only needs the type, not the whole object
                    $scope.criteria.reportType = reportType.type;

                    if ($scope.isAdmin && $scope.fieldShouldBeVisible('publisher', reportType)) {
                        fields.publisher.initData();
                    }

                    if ($scope.fieldShouldBeVisible('site', reportType)) {
                        fields.site.initData();
                    }

                    if ($scope.fieldShouldBeVisible('adSlot', reportType)) {
                        fields.adSlot.initData($scope.criteria.siteId);
                    }

                    if ($scope.fieldShouldBeVisible('adTag', reportType)) {
                        fields.adTag.initData($scope.criteria.adSlotId);
                    }

                    if ($scope.fieldShouldBeVisible('adNetwork', reportType)) {
                        fields.adNetwork.initData();
                    }
                };

                $scope.selectPublisher = function (publisher, publisherId) {
                    $scope.resetSiteSelection();
                    $scope.resetAdSlotSelection();
                    $scope.resetAdTagSelection();
                    $scope.resetAdNetworkSelection();

                    $scope.publisherFilterCriteria = {
                        publisher: {
                            id: publisherId
                        }
                    };

                    if ($scope.fieldShouldBeVisible('site')) {
                        fields.site.initData();
                    }

                    if ($scope.fieldShouldBeVisible('adNetwork')) {
                        fields.adNetwork.initData();
                    }
                };

                $scope.selectSite = function (site, siteId) {
                    $scope.resetAdSlotSelection();
                    $scope.resetAdTagSelection();

                    if ($scope.fieldShouldBeVisible('adSlot')) {
                        fields.adSlot.initData(siteId);
                    }
                };

                $scope.selectAdSlot = function (adSlot, adSlotId) {
                    $scope.resetAdTagSelection();

                    if ($scope.fieldShouldBeVisible('adTag')) {
                        fields.adTag.initData(adSlotId);
                    }
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

                    if ($rootScope.$broadcast(PERFORMANCE_REPORT_EVENTS.formSubmit, $scope.criteria).defaultPrevented) {
                        AlertService.replaceAlerts({
                            type: 'error',
                            message: 'The report could not be loaded'
                        });
                    } else {
                        $scope.isCollapsed = true;
                    }

                    $scope.formProcessing = false;
                };
            }
        };
    })

;