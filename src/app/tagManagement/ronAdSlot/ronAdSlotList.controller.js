(function() {
    'use strict';

    angular.module('tagcade.tagManagement.ronAdSlot')
        .controller('RonAdSlotList', RonAdSlotList)
    ;

    function RonAdSlotList($scope, $modal, $stateParams, $translate, Auth, AlertService, ronAdSlots, historyStorage, AtSortableService, HISTORY_TYPE_PATH, RTB_STATUS_LABELS, EVENT_ACTION_SORTABLE, TYPE_AD_SLOT, RonAdSlotManager) {
        $scope.ronAdSlots = ronAdSlots;
        $scope.hasData = function () {
            return !!ronAdSlots.totalRecord;
        };

        var params = {
            page: 1
        };

        if (!$scope.hasData()) {
            AlertService.replaceAlerts({
                type: 'warning',
                message: $translate.instant('RON_AD_SLOT_MODULE.CURRENTLY_NO_RON_AD_SLOT')
            });
        }

        $scope.adSlotTypes = TYPE_AD_SLOT;
        $scope.rtbStatusLabels = RTB_STATUS_LABELS;
        $scope.today = new Date();
        $scope.demandSourceTransparency = Auth.getSession().demandSourceTransparency;

        $scope.tableConfig = {
            itemsPerPage: 10,
            maxPages: 10,
            totalItems: Number(ronAdSlots.totalRecord)
        };

        $scope.availableOptions = {
            currentPage: $stateParams.page || 1,
            pageSize: 10
        };

        $scope.selectData = {
            query: $stateParams.searchKey || null
        };

        var getAdSlot;

        $scope.showPagination = showPagination;
        $scope.confirmDeletion = confirmDeletion;
        $scope.changePage = changePage;
        $scope.searchData = searchData;

        function confirmDeletion(ronAdSlot) {
            var modalInstance = $modal.open({
                templateUrl: 'tagManagement/ronAdSlot/confirmDeletion.tpl.html'
            });
            modalInstance.result.then(function(){
                return RonAdSlotManager.one(ronAdSlot.id).remove()
                    .then(function(){
                        _getAdSlot(params);

                        AlertService.replaceAlerts({
                            type: 'success',
                            message: $translate.instant('RON_AD_SLOT_MODULE.DELETE_SUCCESS')
                        });
                    })
                    .catch(function(status) {
                        var message;

                        if(!!status && !!status.data && !!status.data.message) {
                            message = status.data.message
                        }
                        else {
                            message = $translate.instant('RON_AD_SLOT_MODULE.DELETE_FAIL')
                        }

                        AlertService.replaceAlerts({
                            type: 'danger',
                            message: message
                        });
                    });
            });
        }

        $scope.generateAdTag = function (ronAdSlot) {
            $modal.open({
                templateUrl: 'tagManagement/ronAdSlot/generateAdTag.tpl.html',
                resolve: {
                    javascriptTag: function () {
                        return RonAdSlotManager.one(ronAdSlot.id).customGET('jstag');
                    }
                },
                controller: function ($scope, javascriptTag) {
                    $scope.adSlotName = ronAdSlot.libraryAdSlot.name;
                    $scope.javascriptTag = javascriptTag.jstag;
                    $scope.getTextToCopy = function(string) {
                        return string.replace(/\n/g, '\r\n');
                    };

                    var globalReport = $translate.instant('SEGMENT_MODULE.GLOBAL_REPORT_SEGMENT');

                    $scope.segmentList = Object.keys(javascriptTag.segments);
                    $scope.segmentList.unshift(globalReport);

                    $scope.selectedSegmentModel = globalReport;

                    $scope.selectSegment = function(type){
                        $scope.javascriptTag = type == globalReport ? javascriptTag.jstag : javascriptTag.segments[type];
                    };

                }
            });
        };

        function showPagination() {
            return angular.isArray($scope.ronAdSlots.records) && $scope.ronAdSlots.totalRecord > $scope.tableConfig.itemsPerPage;
        }

        function changePage(currentPage) {
            params = angular.extend(params, {page: currentPage});
            _getAdSlot(params);
        }

        function searchData() {
            var query = {searchKey: $scope.selectData.query || ''};
            params = angular.extend(params, query);
            _getAdSlot(params, 500);
        }

        $scope.$on(EVENT_ACTION_SORTABLE, function(event, query) {
            params = angular.extend(params, query);
            _getAdSlot(params);
        });

        function _getAdSlot(query, ms) {
            params = query;

            clearTimeout(getAdSlot);

            getAdSlot = setTimeout(function() {
                params = query;
                return RonAdSlotManager.one().get(query)
                    .then(function(ronAdSlots) {
                        AtSortableService.insertParamForUrl(query);
                        $scope.ronAdSlots = ronAdSlots;
                        $scope.tableConfig.totalItems = Number(ronAdSlots.totalRecord);
                        $scope.availableOptions.currentPage = Number(query.page);
                    });
            }, ms || 0);
        }

        $scope.$on('$locationChangeSuccess', function() {
            historyStorage.setParamsHistoryCurrent(HISTORY_TYPE_PATH.ronAdSlot)
        });
    }
})();