(function() {
    'use strict';

    angular.module('tagcade.videoManagement.IVTPixel')
        .controller('VideoIVTPixelForm', VideoIVTPixelForm)
    ;

    function VideoIVTPixelForm($scope, $modal, $filter, $translate, IVTPixel, waterfalls, publishers, AlertService, VideoIVTPixelManager, ServerErrorProcessor, historyStorage, HISTORY_TYPE_PATH, IVT_PIXEL_MACROS) {
        $scope.fieldNameTranslations = {
            name: 'Name'
        };

        $scope.isNew = IVTPixel === null;
        $scope.formProcessing = false;

        $scope.publishers = publishers;
        $scope.waterfalls = !$scope.isAdmin() ? waterfalls : [];

        $scope.fireOnOption = [
            {key: 'request', label: 'Request'},
            {key: 'impression', label: 'Impression'}
        ];

        $scope.IVTPixel = IVTPixel || {
            name: null,
            urls: [
                {url: null}
            ],
            fireOn: 'request',
            runningLimit: 100,
            ivtPixelWaterfallTags: []
        };

        if(!$scope.isNew) {
            if($scope.isAdmin()) {
                _filterWaterfalls($scope.IVTPixel.publisher)
            }

            var urls = [];
            angular.forEach($scope.IVTPixel.urls, function (url) {
                urls.push({url: url});
            });

            $scope.IVTPixel.urls = urls;

            angular.forEach($scope.IVTPixel.ivtPixelWaterfallTags, function (ivtPixelWaterfallTag) {
                var index = _.findIndex($scope.waterfalls, function (waterfall) {
                    return waterfall.id == ivtPixelWaterfallTag.waterfallTag.id
                });

                if(index > -1) {
                    $scope.waterfalls[index].ticked = true;
                }
            });
        }

        $scope.backToListIVTPixel = backToListIVTPixel;
        $scope.selectPublisher = selectPublisher;
        $scope.isFormValid = isFormValid;
        $scope.submit = submit;
        $scope.addURL = addURL;
        $scope.removeURL = removeURL;
        $scope.clickVIewHelpText = clickVIewHelpText;
        
        function clickVIewHelpText() {
            $modal.open({
                templateUrl: 'videoManagement/IVTPixel/helpTextMacros.tpl.html',
                controller: function ($scope) {
                    $scope.macrosOptions = IVT_PIXEL_MACROS;
                }
            });
        }
        
        function removeURL(index) {
            $scope.IVTPixel.urls.splice(index, 1)
        }
        
        function addURL() {
            $scope.IVTPixel.urls.push({url: null})
        }

        function backToListIVTPixel() {
            return historyStorage.getLocationPath(HISTORY_TYPE_PATH.IVTPixel, '^.list');
        }

        function selectPublisher(publisher) {
            _filterWaterfalls(publisher);

            $scope.IVTPixel.ivtPixelWaterfallTags = []
        }

        function _filterWaterfalls(publisher) {
            $scope.waterfalls = $filter('filter')(waterfalls, function (waterfall) {
                return waterfall.videoPublisher.publisher.id == publisher.id
            });
        }

        function isFormValid() {
            return $scope.IVTPixelForm.$valid;
        }

        function submit() {
            if ($scope.formProcessing) {
                // already running, prevent duplicates
                return;
            }

            $scope.formProcessing = true;

            var IVTPixel = angular.copy($scope.IVTPixel);

            var ivtPixelWaterfallTags = [];
            angular.forEach(IVTPixel.ivtPixelWaterfallTags, function (ivtPixelWaterfallTag) {
                ivtPixelWaterfallTags.push({waterfallTag: ivtPixelWaterfallTag.id});
            });

            IVTPixel.ivtPixelWaterfallTags = ivtPixelWaterfallTags;

            var urls = [];
            angular.forEach(IVTPixel.urls, function (url) {
                urls.push(url.url);
            });

            IVTPixel.urls = urls;

            var saveIVTPixel = $scope.isNew ? VideoIVTPixelManager.post(IVTPixel) : VideoIVTPixelManager.one(IVTPixel.id).patch(IVTPixel);

            saveIVTPixel
                .catch(
                function (response) {
                    var errorCheck = ServerErrorProcessor.setFormValidationErrors(response, $scope.IVTPixelForm, $scope.fieldNameTranslations);
                    $scope.formProcessing = false;

                    return errorCheck;
                })
                .then(
                function () {
                    AlertService.addFlash({
                        type: 'success',
                        message: $scope.isNew ? 'The IVT Pixel has been created' : 'The IVT Pixel position has been updated'
                    });
                })
                .then(
                function () {
                    return historyStorage.getLocationPath(HISTORY_TYPE_PATH.IVTPixel, '^.list');
                }
            )
            ;
        }
    }
})();