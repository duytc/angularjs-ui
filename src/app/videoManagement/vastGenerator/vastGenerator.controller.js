(function() {
    'use strict';

    angular.module('tagcade.videoManagement.vastGenerator')
        .controller('VastGenerator', VastGenerator)
    ;

    function VastGenerator($scope, $modal, $translate, $location, $q, AlertService, vastTags, publishers, videoPublishers, videoPublisher, REQUIRED_MACROS_OPTIONS) {
        $scope.formProcessing = false;

        $scope.vastTags = vastTags;
        $scope.publishers = publishers;
        $scope.videoPublishers = videoPublishers;
        $scope.allowPublisherSelection = $scope.isAdmin() && !!publishers;

        var requiredMacrosOptions = angular.copy(REQUIRED_MACROS_OPTIONS);

        _update();

        //not allowed to be set via url parameter
        function _update() {
            angular.forEach(['ip_address', 'user_agent'], function (macro) {
                var index = _.findIndex(requiredMacrosOptions, function (item) {
                    return item.key == macro
                });

                if(index > -1) {
                    requiredMacrosOptions.splice(index, 1)
                }
            })
        }

        $scope.requiredMacrosOptions = requiredMacrosOptions;

        $scope.selected = {
            publisher: videoPublisher && videoPublisher.publisher,
            videoPublisher: videoPublisher,
            secure: false,
            macros: ['page_url', 'player_width', 'player_height']
        };

        $scope.groupEntities = groupEntities;

        function groupEntities(item){
            if (item.line) {
                return undefined; // no group
            }

            return ''; // separate group with no name
        }

        $scope.clickVIewHelpText = function () {
            $modal.open({
                templateUrl: 'videoManagement/vastGenerator/helpTextMacros.tpl.html',
                controller: function ($scope) {
                    $scope.macrosOptions = requiredMacrosOptions;
                }
            });
        };

        $scope.selectPublisher = function(publisher) {
            $scope.selected.videoPublisher = null;
        };

        $scope.isFormValid = function() {
            if($scope.selected.macros.indexOf('page_url') == -1 || $scope.selected.macros.indexOf('player_width') == -1 || $scope.selected.macros.indexOf('player_height') == -1) {
                return false
            }

            return $scope.vastGeneratorForm.$valid;
        };

        $scope.removeMacros = function (item) {
            if(['page_url', 'player_width', 'player_height'].indexOf(item) > -1) {
                AlertService.replaceAlerts({
                    type: 'warning',
                    message: 'page_url, player_width and player_height are required macros'
                });
            }
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

            var getVastTagsPromise = $scope.selected.videoPublisher.customGET('vasttags', {secure: $scope.selected.secure, macros: angular.toJson($scope.selected.macros)});

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