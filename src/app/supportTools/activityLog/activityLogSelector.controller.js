(function () {
   'use strict';

    angular
        .module('tagcade.supportTools.activityLog')
        .controller('ActivityLogSelector', ActivityLogSelector)
    ;

    function ActivityLogSelector($scope, $translate, _, UserStateHelper, adminUserManager, AlertService, activityLogs, selectorFormCalculator, DateFormatter) {
        $scope.groupEntities = groupEntities;
        $scope.getLogs = getLogs;

        $scope.selectedData = {
            date: {
                startDate: null,
                endDate: null
            },
            publisherId: null
        };

        init();

        $scope.datePickerOpts = {
            maxDate:  moment().endOf('day'),
            ranges: {
                'Last 7 Days': [moment().subtract(6, 'days'), moment()],
                'This Month': [moment().startOf('month'), moment().endOf('month')],
                'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
            }
        };

        adminUserManager.getList({ filter: 'publisher' })
            .then(function (users) {
                addAllOption(users, 'All Publishers');
                return $scope.publishers = users;
            })
        ;

        function addAllOption(data, label) {
            if (!angular.isArray(data)) {
                throw new Error('Expected an array of data');
            }

            data.unshift({
                id: null, // default value
                company: label || 'All'
            });

            return data;
        }

        function groupEntities(item) {
            if (item.id === null) {
                return undefined; // no group
            }

            return ''; // separate group with no name
        }

        function init() {
            var initialParams = activityLogs.getInitialParams();

            selectorFormCalculator.getCalculatedParams(initialParams).then(
                function(calculatedParams) {

                    var initialData = {
                        date: {
                            startDate: null,
                            endDate: null
                        },
                        publisherId: null
                    };

                    angular.extend(initialData, _.omit(calculatedParams));

                    if(!initialData.date.endDate) {
                        initialData.date.endDate = initialData.date.startDate;
                    }

                    if (!initialData.date.startDate) {
                        angular.extend(initialData, {
                            date: {
                                startDate:  moment().subtract(6, 'days'),
                                endDate: moment().startOf('day')
                            }
                        })
                    }

                    angular.extend($scope.selectedData, initialData);
                }
            );
        }

        function getLogs() {
            var params = {
                startDate: DateFormatter.getFormattedDate($scope.selectedData.date.startDate),
                endDate: DateFormatter.getFormattedDate($scope.selectedData.date.endDate),
                publisherId: $scope.selectedData.publisherId,
                loginLogs: activityLogs.getInitialShowLoginLogs()
            };

            UserStateHelper.transitionRelativeToBaseState('supportTools.activityLog.list', params)
                .catch(function(error) {
                    AlertService.replaceAlerts({
                        type: 'error',
                        message: $translate.instant('ACTION_LOG_MODULE.GET_ACTION_LOG_FAIL')
                    });
                })
            ;
        }
    }
})();