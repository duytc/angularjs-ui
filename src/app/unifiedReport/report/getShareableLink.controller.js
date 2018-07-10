(function () {
    'use strict';

    angular
        .module('tagcade.unifiedReport.report')
        .controller('GetShareableLink', GetShareableLink)
    ;

    function GetShareableLink($scope, $rootScope, AlertService, fieldsReportView, reportView, shareable, UnifiedReportViewManager, DateFormatter, getDateReportView, ITEMS_PER_PAGE) {

        $scope.shareable = angular.copy(shareable);
        $scope.reportView = reportView;

        $scope.fieldsReportView = fieldsReportView;
        $scope.isNew = $scope.shareable == null;
        $scope.shareableLink = !!$scope.shareable ? $scope.shareable.link : null;

        $scope.fieldsToShare = !!$scope.shareable && !!$scope.shareable.fields ? $scope.shareable.fields.fields : [];
        $scope.customFilters = _buildCustomFilters();
        
        $scope.selected = {
            allowDatesOutside: !!$scope.shareable && !!$scope.shareable.fields && !!$scope.shareable.fields.allowDatesOutside,
            selectAll: $scope.isNew ? true : $scope.fieldsToShare.length == $scope.fieldsReportView.length,
            date: isDynamic() ? getDynamicDate() : {
                startDate: !!$scope.shareable && !!$scope.shareable.fields && !!$scope.shareable.fields.dateRange ? $scope.shareable.fields.dateRange.startDate : getDateReportView.getMinStartDateInFilterReportView(reportView),
                endDate : !!$scope.shareable && !!$scope.shareable.fields && !!$scope.shareable.fields.dateRange ? $scope.shareable.fields.dateRange.endDate : getDateReportView.getMaxEndDateInFilterReportView(reportView)
            },
            customFilters: _extractCustomFilters()
        };

        $scope.datePickerOpts = {
            maxDate:  moment().endOf('day'),
            ranges: {
                'Today': [moment().startOf('day'), moment().endOf('day')],
                'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
                'Last 7 Days': [moment().subtract(6, 'days'), moment()],
                'This Month': [moment().startOf('month'), moment().endOf('month')],
                'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
            }
        };

        $scope.dynamicDatePickerOpts = [
            {key: 'Today', value: 'today'},
            {key: 'Yesterday', value: 'yesterday'},
            {key: 'Last 7 Days', value: 'last 7 days'},
            {key: 'Last 30 Days', value: 'last 30 days'},
            {key: 'This Month', value: 'this month'},
            {key: 'Last Month', value: 'last month'}
        ];

        // default select all
        if($scope.isNew) {
            selectAll();
        }

        $scope.selectAll = selectAll;
        $scope.changeDate = changeDate;
        $scope.hideDaterange = hideDaterange;
        $scope.enableSelectDaterange = enableSelectDaterange;
        $scope.getDynamicDate = getDynamicDate;
        $scope.isDynamic = isDynamic;
        $scope.saveShareableLink = saveShareableLink;
        $scope.disabledDimension = disabledDimension;
        $scope.getTextToCopy = getTextToCopy;
        $scope.toggleField = toggleField;
        $scope.getShareableLink = getShareableLink;
        $scope.highlightText = highlightText;

        function _extractCustomFilters() {
            if($scope.isNew) return;

           var filtersFromApi =  shareable.fields.filters;
           var selectedFilters = [];
           _.forEach($scope.customFilters, function (filterOption) {
               _.forEach(filtersFromApi, function (filterFromApi) {
                   if(filterFromApi.name === filterOption.name && filterFromApi.dataSetId ===filterOption.dataSetId){
                       filterOption.ticked = true;
                       selectedFilters.push(filterOption);
                   }
               })
           });

           return selectedFilters;

        }
        function _buildCustomFilters() {
            var customFilters = [];
            _.forEach($scope.reportView.reportViewDataSets, function (dataset) {
                var option = {
                    label: '<strong> Dataset ' + dataset.dataSet.name + '</strong>',
                    name: dataset.dataSet.name,
                    value: null,
                    msGroup: true
                };
                customFilters.push(option);

                _.forEach(dataset.filters, function (filter) {
                    var option = {
                        label: filter.field,
                        ticked: false,
                        name: filter.field,
                        value: filter,
                        dataSetId: dataset.dataSet.id
                    };
                    customFilters.push(option);
                });

                customFilters.push({msGroup: false});
            });
            return customFilters;
        }

        function disabledDimension(field) {
            return $scope.reportView.largeReport && _.values($scope.reportView.dimensions).indexOf(field.key) > -1
        }

        function getTextToCopy(string) {
            return string.replace(/\n/g, '\r\n');
        }

        function toggleField(field) {
            if($scope.isNew) {
                $scope.shareableLink = null;
            }

            var index = $scope.fieldsToShare.indexOf(field.key);

            if(index == -1) {
                $scope.fieldsToShare.push(field.key);
            } else {
                $scope.fieldsToShare.splice(index, 1);
                $scope.selected.selectAll = false
            }

            if($scope.fieldsToShare.length == $scope.fieldsReportView.length) {
                $scope.selected.selectAll = true
            }
        };

        $scope.hasField = function(filed) {
            return _.findIndex($scope.fieldsToShare, function (item) {return item == filed.key}) > -1;
        };

        function getShareableLink() {
            var params = {
                allowDatesOutside: $scope.selected.allowDatesOutside,
                fields: $scope.fieldsToShare,
                dateRange: isDynamic() ? getDynamicDate() : {
                    startDate: DateFormatter.getFormattedDate($scope.selected.date.startDate),
                    endDate: DateFormatter.getFormattedDate($scope.selected.date.endDate)
                }
            };

            UnifiedReportViewManager.one(reportView.id).post('shareablelink', params)
                .then(function (shareableLink) {
                    $scope.shareableLink = shareableLink
                });
        }

        function highlightText(shareableLink) {
            return shareableLink;
        }

        function _buildFilterParams() {
            return $scope.selected.customFilters;
        }

        function saveShareableLink() {
            /*if(_.isEmpty($scope.shareable.token)) {
                return $scope.getShareableLink();
            }*/

            var params = {
                token: $scope.shareable.token,
                sharedKeysConfig : {
                    allowDatesOutside: $scope.selected.allowDatesOutside,
                    fields: $scope.fieldsToShare,
                    dateRange: isDynamic() ? getDynamicDate() : {
                        startDate: DateFormatter.getFormattedDate($scope.selected.date.startDate),
                        endDate: DateFormatter.getFormattedDate($scope.selected.date.endDate)
                    },
                    filters: _buildFilterParams()
                }
            };

            UnifiedReportViewManager.one(reportView.id).post('share', params)
                .then(function () {
                    shareable.fields.fields = angular.copy($scope.fieldsToShare);
                    shareable.fields.allowDatesOutside = angular.copy($scope.selected.allowDatesOutside);
                    shareable.fields.dateRange = {
                        startDate: DateFormatter.getFormattedDate($scope.selected.date.startDate),
                        endDate: DateFormatter.getFormattedDate($scope.selected.date.endDate)
                    };

                    AlertService.addAlert({
                        type: 'success',
                        message: 'The shareable link has been updated'
                    });
                    $rootScope.$broadcast('SHARE_LINK_UPDATED', {
                        token: shareable.token,
                        customFilters: $scope.selected.customFilters
                    });
                });
        }

        function changeDate() {
            if($scope.isNew) {
                $scope.shareableLink = null;
            }
        }

        function getDynamicDate() {
            for (var i in $scope.reportView.filters) {
                var filterRoot = $scope.reportView.filters[i];

                if((filterRoot.type == 'date' || filterRoot.type == 'datetime') && filterRoot.dateType == 'dynamic') {
                    return filterRoot.dateValue
                }
            }

            for (var reportViewIndex in $scope.reportView.reportViewDataSets) {
                var reportView = $scope.reportView.reportViewDataSets[reportViewIndex];

                for (var filterIndex in reportView.filters) {
                    var filter = reportView.filters[filterIndex];

                    if((filter.type == 'date' || filter.type == 'datetime') && filter.dateType == 'dynamic') {
                        return filter.dateValue
                    }
                }
            }

            return false;
        }

        function selectAll() {
            if($scope.isNew) {
                $scope.shareableLink = null;
            }

            if(!$scope.selected.selectAll) {
                $scope.fieldsToShare = []
            } else {
                angular.forEach($scope.fieldsReportView, function (field) {
                    var index = $scope.fieldsToShare.indexOf(field.key);

                    if(index == -1) {
                        $scope.fieldsToShare.push(field.key);
                    }
                })
            }
        }

        function enableSelectDaterange() {
            for (var i in $scope.reportView.filters) {
                var filterRoot = $scope.reportView.filters[i];

                if(filterRoot.type == 'date' || filterRoot.type == 'datetime') {
                    if(filterRoot.userProvided) {
                        return true
                    }
                }
            }

            for (var reportViewIndex in $scope.reportView.reportViewDataSets) {
                var reportView = $scope.reportView.reportViewDataSets[reportViewIndex];

                for (var filterIndex in reportView.filters) {
                    var filter = reportView.filters[filterIndex];

                    if(filter.type == 'date' || filter.type == 'datetime') {
                        if(filter.userProvided) {
                            return true
                        }
                    }
                }
            }

            return false;
        }

        function isDynamic() {
            for (var i in $scope.reportView.filters) {
                var reportViewRoot = $scope.reportView.filters[i];

                for (var j in reportViewRoot.filters) {
                    var filterRoot = reportViewRoot.filters[j];

                    if((filterRoot.type == 'date' || filterRoot.type == 'datetime') && filterRoot.dateType == 'dynamic') {
                        return true
                    }
                }
            }

            for (var reportViewIndex in $scope.reportView.reportViewDataSets) {
                var reportView = $scope.reportView.reportViewDataSets[reportViewIndex];

                for (var filterIndex in reportView.filters) {
                    var filter = reportView.filters[filterIndex];

                    if((filter.type == 'date' || filter.type == 'datetime') && filter.dateType == 'dynamic') {
                        return true
                    }
                }
            }

            return false;
        }

        function hideDaterange() {
            for (var i in $scope.reportView.filters) {
                var filterRoot = $scope.reportView.filters[i];

                if(filterRoot.type == 'date' || filterRoot.type == 'datetime') {
                    return true
                }
            }

            for (var reportViewIndex in $scope.reportView.reportViewDataSets) {
                var reportView = $scope.reportView.reportViewDataSets[reportViewIndex];

                for (var filterIndex in reportView.filters) {
                    var filter = reportView.filters[filterIndex];

                    if(filter.type == 'date' || filter.type == 'datetime') {
                        return true
                    }
                }
            }

            return false;
        }
    }
})();