(function() {
    'use strict';

    angular.module('tagcade.videoManagement.vastGenerator')
        .controller('VastGenerator', VastGenerator)
    ;

    function VastGenerator($scope, $translate, $location, $q, vastTags, publishers, videoPublishers, videoPublisher) {
        $scope.formProcessing = false;

        $scope.vastTags = vastTags;
        $scope.publishers = publishers;
        $scope.videoPublishers = videoPublishers;
        $scope.allowPublisherSelection = $scope.isAdmin() && !!publishers;

        $scope.selected = {
            publisher: videoPublisher && videoPublisher.publisher,
            videoPublisher: videoPublisher,
            secure: false
        };

        $scope.selectPublisher = function(publisher) {
            $scope.selected.videoPublisher = null;
        };

        $scope.isFormValid = function() {
            return $scope.vastGeneratorForm.$valid;
        };

        $scope.exportVastTags = function(vastTags) {
            var tagsString = _formatForExportVastTags(vastTags) ;

            var blob = new Blob([tagsString], {type: "text/plain;charset=utf-8"});
            var name = $scope.selected.videoPublisher.name;
            var lastNameFile = '-vats-tags.txt';

            return saveAs(blob, [name  + lastNameFile]);
        };

        $scope.getTextToCopy = function(string) {
            if (navigator.appVersion.indexOf("Win") != -1) {
                return string.replace(/\n/g, '\r\n');
            }

            return string;
        };

        $scope.highlightText = function (vasttag) {
            return vasttag.replace(new RegExp("[^&?]*?=", "gi"), function(match) {
                return '<span class="highlightedText">' + match.replace('=', '') + '</span>=';
            });
        };

        $scope.submit = function() {
            if ($scope.formProcessing) {
                // already running, prevent duplicates
                return;
            }

            $scope.formProcessing = true;

            $scope.vastTags = null;

            var getVastTagsPromise = $scope.selected.videoPublisher.customGET('vasttags', {secure: $scope.selected.secure});

            $q.when(getVastTagsPromise)
                .then(function (vastTags) {
                    $scope.vastTags = vastTags.plain();

                    $location.search({ videoPublisherId: $scope.selected.videoPublisher.id});
                })
                .finally(function () {
                    $scope.formProcessing = false;
                })
            ;
        };

        function _formatForExportVastTags(vastTags) {
            var tags = $translate.instant('VAST_GENERATOR_MODULE.GUIDE_COPY');

            angular.forEach(vastTags, function(item) {
                if(angular.isObject(item)) {
                    tags = tags + _downLine("=") + item.name.toUpperCase() + _downLine("-") + '\n' + item.vasttag;
                }
            });

            return tags;
        }

        function _downLine(divider) {
            var dividers = '';
            divider = !divider ? '-' : divider;

            var i = 0;
            for(i; i < 25; i++) {
                dividers = dividers + divider;
            }

            return '\n' + dividers + '\n';
        }
    }
})();