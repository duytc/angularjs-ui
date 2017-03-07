(function() {
    'use strict';

    angular.module('tagcade.videoManagement.adTag')
        .controller('ShowVastTag', ShowVastTag)
    ;

    function ShowVastTag($scope, $modal, vastTags, $stateParams, VastTagRequestManager, videoWaterfallTag) {
        $scope.vastTags = formatDate(vastTags);
        $scope.videoWaterfallTag = videoWaterfallTag;

        $scope.tableConfig = {
            itemsPerPage: 10,
            maxPages: 10,
            totalItems: Number(vastTags.totalRecord)
        };

        $scope.availableOptions = {
            currentPage: $stateParams.page || 1,
            pageSize: 10
        };

        var params = {
            page: 1
        };

        $scope.changePage = changePage;
        $scope.showPagination = showPagination;
        $scope.showRequest = showRequest;

        function showRequest(vastTag) {
            $modal.open({
                templateUrl: 'videoManagement/adTag/showRequest.tpl.html',
                resolve: {
                    vastTag: function (){
                        return vastTag
                    }
                },
                controller: function ($scope, vastTag){
                    $scope.vastTag = vastTag;

                    $scope.getTextToCopy = function (string){
                        return string.replace(/\n/g, '\r\n');
                    };
                }
            });
        }

        function showPagination() {
            return angular.isArray($scope.vastTags.records) && $scope.vastTags.totalRecord > $scope.tableConfig.itemsPerPage;
        }

        function changePage(currentPage) {
            params = angular.extend(params, {page: currentPage});
            _getVastTags(params);
        }

        function _getVastTags(query) {
            params.uuid = videoWaterfallTag.uuid;

            return VastTagRequestManager.one().get(params)
                .then(function(vastTags) {
                    $scope.vastTags = formatDate(vastTags);
                    $scope.tableConfig.totalItems = Number(vastTags.totalRecord);
                    $scope.availableOptions.currentPage = Number(query.page);
                });
        }

        function formatDate(vastTags) {
            angular.forEach(vastTags.records, function (record) {
                record.time.date = moment.tz(record.time.date, record.time.timezone).format();
            });

            return vastTags
        }
    }
})();