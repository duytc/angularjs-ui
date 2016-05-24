(function() {
    'use strict';

    angular.module('tagcade.reports.unified')
        .controller('UnifiedReportSelector', UnifiedReportSelector)
    ;

    function UnifiedReportSelector($scope, $stateParams, $translate, $q, $state, _, Auth, adminUserManager, subPublisherRestangular, AdNetworkManager, UserStateHelper, AlertService, ReportParams, unifiedReport) {
        var toState = null;

        var isAdmin = Auth.isAdmin();
        var isSubPublisher = Auth.isSubPublisher();
        var userSession = Auth.getSession();
        var demandSourceTransparency = $scope.demandSourceTransparency = Auth.getSession().demandSourceTransparency;

        $scope.isAdmin = isAdmin;
        $scope.isSubPublisher = isSubPublisher;

        $scope.selectedData = {
            date: {
                startDate: null,
                endDate: null
            },
            publisher: null,
            adNetwork: null,
            site : null,
            breakDown: null,
            breakDowns: {},
            subBreakDown: null,
            page: 1
        };

        $scope.optionData = {
            publishers: [],
            subPublishers: addAllOption([], 'My Account'),
            adNetworks: addAllOption([], 'All Demand Partners'),
            sites: addAllOption([], 'All Sites')
        };

        $scope.datePickerOpts = {
            maxDate:  moment().subtract(1, 'days'),
            ranges: {
                'Today': [moment().startOf('day'), moment().endOf('day')],
                'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
                'Last 7 Days': [moment().subtract(7, 'days'), moment().subtract(1, 'days')],
                'Last 30 Days': [moment().subtract(30, 'days'), moment().subtract(1, 'days')],
                'This Month': [moment().startOf('month'), moment().endOf('month')],
                'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
            }
        };

        $scope.getReports = getReports;
        $scope.selectBreakdownOption = selectBreakdownOption;
        $scope.isFormValid = isFormValid;
        $scope.selectPublisher = selectPublisher;
        $scope.selectSubPublisher = selectSubPublisher;
        $scope.getPartnerForPublisher = getPartnerForPublisher;
        $scope.selectAdNetwork = selectAdNetwork;
        $scope.selectSite = selectSite;
        $scope.groupEntities = groupEntities;
        $scope.filterBreakdown = filterBreakdown;
        $scope.clickBreakdown = clickBreakdown;

        $scope.reportTypeOptions = [
            {
                key: 'myaccount',
                label: 'My Account'
            },
            {
                key: 'subpublisher',
                label: 'Sub Publisher'
            }
        ];

        $scope.breakdownOptions = [
            {
                key: 'day',
                label: 'By Day',
                toState: 'reports.unified.day'
            },
            {
                key: 'partners',
                label: 'By Partner',
                toState: 'reports.unified.partner'
            },
            {
                key: 'sites',
                label: 'By Site',
                toState: 'reports.unified.site'
            },
            {
                key: 'adtags',
                label: 'By Ad Tag',
                toState: 'reports.unified.adtag'
            }
        ];

        function groupEntities(item){
            if (item.id === null) {
                return undefined; // no group
            }

            return ''; // separate group with no name
        }

        function filterBreakdown(option) {
            if(!demandSourceTransparency) {
                if(option.key == 'day' || option.key == 'sites') {
                    return true;
                }

                return false;
            }

            if(!!$scope.selectedData.adNetwork && option.key == 'partners') {
                return false;
            }

            if(!!$scope.selectedData.site && option.key == 'sites') {
                return false;
            }

            return true;
        }

        function clickBreakdown(option) {
            var breakdowns = [];

            angular.forEach($scope.selectedData.breakDowns, function(support, key) {
                if(option != 'day' && support && key != 'day' && key != option) {
                    $scope.selectedData.breakDowns[key] = false;
                }

                if($scope.selectedData.breakDowns[key]) {
                    breakdowns.push(key)
                }
            });

            _setVarBreakdown(breakdowns);
        }

        function _setVarBreakdown(breakdowns) {
            if(breakdowns.length == 2) {
                var indexOfDay = breakdowns.indexOf('day');
                $scope.selectedData.subBreakDown = breakdowns[indexOfDay];
                $scope.selectedData.breakDown = breakdowns[indexOfDay == 0 ? 1 : 0]
            } else {
                $scope.selectedData.breakDown = breakdowns[0];
                $scope.selectedData.subBreakDown = null;
            }

            var breakdownOption = _.find($scope.breakdownOptions, function(breakdownOption) {
                return breakdownOption.key == $scope.selectedData.breakDown;
            });

            $scope.selectedData.labelBreakdown = _getLabelBreakdown(breakdowns);

            if(!!breakdownOption && !!breakdownOption.toState) {
                toState = breakdownOption.toState;
            }
        }

        function _getLabelBreakdown(breakdowns) {
            var labels = '';

            angular.forEach(breakdowns, function(breakdown, index) {
                var breakdownOption = _.find($scope.breakdownOptions, function(breakdownOption) {
                    return breakdownOption.key == breakdown;
                });

                if(!!breakdownOption) {
                    labels = labels + (index != 0 ? ', ' : '') + breakdownOption.label;
                }
            });

            return labels;
        }

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
                name: label || 'All',
                username: label || 'All' // username to for list sub publisher use
            });

            return data;
        }

        function selectPublisher(publisherId) {
            $scope.selectedData.adNetwork = null;
            //$scope.selectedData.breakDown = null;
            $scope.selectedData.site = null;

            getPartnerForPublisher(publisherId)
        }

        function selectSubPublisher(subPublisherId) {
            $scope.selectedData.adNetwork = null;
            //$scope.selectedData.breakDown = null;
            $scope.selectedData.site = null;
        }

        function selectAdNetwork(adNetwork) {
            if (!angular.isObject(adNetwork)) {
                throw new Error('no report type');
            }

            $scope.selectedData.site = null;

            if(!adNetwork.id) {
                return
            }

            if($scope.selectedData.breakDown == 'partners') {
                $scope.selectedData.breakDown = null;
            }

            getSitesForAdNetworkAndSubPublisher(adNetwork.id, $scope.selectedData.publisher);
        }

        function getSitesForAdNetworkAndSubPublisher(adNetworkId, publisherId) {
            if(adNetworkId == 'all') {
                return;
            }

            AdNetworkManager.one(adNetworkId).one('sites').getList(null, {publisher: publisherId})
                .then(function(datas) {
                    var sites = [];
                    angular.forEach(datas.plain(), function(data) {
                        sites.push(data.site);
                    });

                    addAllOption(sites, 'All Sites');
                    $scope.optionData.sites = sites;
                });
        }

        function selectSite(site) {
            if(!!site.id && $scope.selectedData.breakDown == 'sites') {
                $scope.selectedData.breakDown = null;
            }
        }

        function getPartnerForPublisher(publisherId) {
            if(!demandSourceTransparency) {
                return;
            }

            AdNetworkManager.getList({builtIn: true, publisher: publisherId})
                .then(function(partner) {
                    $scope.optionData.adNetworks = addAllOption(partner.plain(), 'All Demand Partners');
                });
        }

        function selectBreakdownOption(breakdownOption) {
            if (!angular.isObject(breakdownOption) || !breakdownOption.toState) {
                throw new Error('breakdown option is missing a target state');
            }

            toState = breakdownOption.toState;
        }

        function isFormValid() {
            return $scope.reportSelectorForm.$valid;
        }

        function getReports() {
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
                        message: $translate.instant('REPORT.REPORT_FAIL')
                    });
                })
            ;
        }

        function update() {
            var params = ReportParams.getFormParams(unifiedReport.getInitialParams());

            params = params || {};

            if (!_.isObject(params)) {
                return;
            }

            if(params.publisher == userSession.id) {
                params.publisher = null;
            }

            if(params.adNetwork == 'all') {
                params.adNetwork = null;
            }

            if (!params.date.endDate) {
                params.date.endDate = !params.date.startDate ? moment().subtract(1, 'days').startOf('day') : params.date.startDate;
            }

            if (!params.date.startDate) {
                params.date.startDate = moment().subtract(6, 'days').startOf('day');
            }

            if(params.breakDown) {
                $scope.selectedData.breakDowns = {};
                $scope.selectedData.breakDowns[params.breakDown] = true;

                if(params.subBreakDown) {
                    $scope.selectedData.breakDowns[params.subBreakDown] = true;
                }

                $scope.selectedData.labelBreakdown = _getLabelBreakdown([params.breakDown, params.subBreakDown]);
            }

            angular.extend($scope.selectedData, params);
        }

        function init() {
            if (isAdmin) {
                adminUserManager.getList({ filter: 'publisher' })
                    .then(function (users) {
                        $scope.optionData.publishers = users;
                    })
                ;
            }

            if (!isSubPublisher && !isAdmin) {
                subPublisherRestangular.one('subpublishers').getList()
                    .then(function(users) {
                        $scope.optionData.subPublishers = addAllOption(users.plain(), 'My Account');
                    });
            }

            if(!isAdmin) {
                if(!!demandSourceTransparency) {
                    AdNetworkManager.getList({builtIn: true})
                        .then(function(adNetworks) {
                            $scope.optionData.adNetworks = addAllOption(adNetworks.plain(), 'All Demand Partners');
                        });
                }
            }

            if(!$stateParams.startDate) {
                unifiedReport.resetParams();
            }

            if(!!$stateParams.publisher && isAdmin) {
                getPartnerForPublisher($stateParams.publisher);
            }

            if(!!$stateParams.publisher && !!$stateParams.adNetwork) {
                getSitesForAdNetworkAndSubPublisher($stateParams.adNetwork, $stateParams.publisher);
            }

            update();
        }

        init();
        update();
        $scope.$on('$stateChangeSuccess', update);
    }
})();