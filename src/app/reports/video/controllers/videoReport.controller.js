(function() {
    'use strict';

    angular.module('tagcade.reports.video')
        .controller('VideoReport', VideoReport)
    ;

    function VideoReport($scope, $stateParams, reportGroup, dateUtil) {
        reportGroup = reportGroup || {};
        $scope.reportGroup = reportGroup;
        $scope.reportGroup.reports = reportGroup.reports || {};
        $scope.metrics = $stateParams.metrics;

        var metrics = angular.fromJson($scope.metrics);
        var breakdowns = angular.fromJson($stateParams.breakdowns);
        var filters = angular.fromJson($stateParams.filters);

        // set again when data is null
        filters.videoDemandAdTag = filters.videoDemandAdTag || {};
        filters.waterfallTag = filters.waterfallTag || {};
        filters.demandPartner = filters.demandPartner || {};
        filters.publisher = filters.publisher || {};
        filters.videoPublisher = filters.videoPublisher || {};

        $scope.params = $stateParams;
        $scope.arrayFieldExport = [];
        $scope.arrayHeaderExport = [];

        $scope.tableConfig = {
            maxPages: 10,
            itemsPerPage: 10
        };

        $scope.titleForReport = {
            'date' : 'Date',
            'name' : 'Name',
            'publisher' : 'Publisher',
            'videoPublisher' : 'Video Publisher',
            'videoDemandPartner' : 'Demand Partner',
            'videoDemandAdTag' : 'Demand Ad Tag',
            'videoWaterfallTag' : 'Waterfall Ad Tag',
            'requests': 'Requests',
            'bids': 'Bids',
            'bidRate': 'Bid Rate',
            'errors': 'Errors',
            'errorRate': 'Error Rate',
            //'wonOpportunities': 'Won Opportunities',
            'impressions': 'Impressions',
            'fillRate': 'Fill Rate',
            'clicks': 'Clicks',
            'clickThroughRate': 'Click Through Rate',
            'adTagRequests': 'Ad Tag Requests',
            'adTagBids': 'Ad Tag Bids',
            'adTagErrors': 'Ad Tag Errors',
            'blocks': 'Blocks'
        };

        // merger data in object root
        angular.forEach($scope.reportGroup.reports, function(object) {
            //var objectClone = angular.isArray(object.reports) && angular.isObject(object.reports[0]) && breakdowns.indexOf('date') == -1 ? object.reports[0] : object;
            var objectClone = object;

            // 'keys' is list object key, it be merge in objectRoot, support for export excel and show report
            var keys = ['videoWaterfallTag', 'videoDemandAdTag', 'videoDemandPartner', 'publisher', 'videoPublisher'];
            angular.forEach(keys, function(key) {
                _mergerObject(object, objectClone, key);
            })
        });

        // export excel
        angular.forEach($scope.titleForReport, function(value, key) {
            if(hasKeyObject($scope.reportGroup.reports[0], key)) {
                if(['videoDemandPartner', 'videoWaterfallTag', 'videoPublisher'].indexOf(key) > -1) {
                    $scope.arrayFieldExport.push(key + '.name');
                } else if(key == 'publisher') {
                    $scope.arrayFieldExport.push(key + '.company');
                } else if(key == 'videoDemandAdTag') {
                    $scope.arrayFieldExport.push(key + 'libraryVideoDemandAdTag.name');
                }
                else {
                    $scope.arrayFieldExport.push(key);
                }

                $scope.arrayHeaderExport.push(value);
            }
        });

        $scope.showPagination = showPagination;
        $scope.hasKeyObject = hasKeyObject;
        $scope.getExportExcelFileName = getExportExcelFileName();

        function showPagination() {
            return angular.isArray($scope.reportGroup.reports) && $scope.reportGroup.reports.length > $scope.tableConfig.itemsPerPage;
        }

        function getExportExcelFileName() {
            var endDate = filters.endDate || filters.startDate;
            return dateUtil.getFormattedDate(filters.startDate) + ' - ' + dateUtil.getFormattedDate(endDate) + ' - video-report';
        }

        function hasKeyObject(object, key) {
            if(!angular.isObject(object)) {
                return false;
            }

            if(['date', 'publisher', 'name', 'videoDemandPartner', 'videoWaterfallTag', 'videoDemandAdTag', 'videoPublisher'].indexOf(key) > -1) {
                if(key == 'date') {
                    return Object.keys(object).indexOf(key) > -1;
                }

                if(key == 'videoDemandAdTag') {
                    return Object.keys(object).indexOf(key) > -1 && (breakdowns.indexOf('videoDemandAdTag') > -1 || filters.videoDemandAdTag.length > 0);
                }

                if(key == 'videoWaterfallTag') {
                    return Object.keys(object).indexOf(key) > -1 && (breakdowns.indexOf('waterfallTag') > -1 || filters.waterfallTag.length > 0);
                }

                if(key == 'videoDemandPartner') {
                    return Object.keys(object).indexOf(key) > -1 && (breakdowns.indexOf('demandPartner') > -1 || filters.demandPartner.length > 0);
                }

                if(key == 'publisher') {
                    return Object.keys(object).indexOf(key) > -1 && (breakdowns.indexOf('publisher') > -1 || filters.publisher.length > 0);
                }

                if(key == 'videoPublisher') {
                    return Object.keys(object).indexOf(key) > -1 && (breakdowns.indexOf('videoPublisher') > -1 || filters.videoPublisher.length > 0);
                }
            }

            return Object.keys(object).indexOf(key) > -1 && metrics.indexOf(key) > -1
        }

        function _mergerObject(objectRoot, object, key) {
            for(var index in object) {
                var value = object[index];

                if(key == index) {
                    objectRoot[key] = value;

                    return;
                } else if(angular.isObject(value) && ['videoDemandPartner', 'libraryVideoDemandAdTag', 'videoWaterfallTag', 'videoDemandAdTag', 'videoWaterfallTagItem', 'reportType', 'videoPublisher'].indexOf(index) > -1) {
                    _mergerObject(objectRoot, value, key);
                }
            }
        }
    }
})();