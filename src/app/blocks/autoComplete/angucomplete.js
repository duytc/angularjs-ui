/**
 * Angucomplete
 * Autocomplete directive for AngularJS
 * By Daryl Rowland
 */

angular.module('angucomplete', [] )
    .directive('angucomplete', function ($parse, $http, $sce, $timeout) {
        return {
            restrict: 'EA',
            scope: {
                "id": "@id",
                "placeholder": "@placeholder",
                "selectedObject": "=selectedobject",
                "url": "@url",
                "dataField": "@datafield",
                "titleField": "@titlefield",
                "descriptionField": "@descriptionfield",
                "imageField": "@imagefield",
                "imageUri": "@imageuri",
                "inputClass": "@inputclass",
                "userPause": "@pause",
                "localData": "=localdata",
                "searchFields": "@searchfields",
                "minLengthUser": "@minlength",
                "matchClass": "@matchclass",
                "searchStr": "=ngModel",
                disabledForm: '=',
                ngChange: '&'
            },
            template: '<form name="dropDownForm" class="angucomplete-holder"><input autocomplete="off" name="search" ng-disabled="disabledForm" ng-pattern="/\\${PAGE_URL}|\\${DOMAIN}|\\${DEVICE}|\\${SCREEN_WIDTH}|\\${SCREEN_HEIGHT}|\\${WINDOW_WIDTH}|\\${WINDOW_HEIGHT}|\\${USER_AGENT}|\\${COUNTRY}|^[a-zA-Z_\x7f-\xff][a-zA-Z0-9_\x7f-\xff]*$/i" id="{{id}}_value" ng-model="searchStr" type="text" placeholder="{{placeholder}}" class="{{inputClass}}" onmouseup="this.select();" ng-focus="resetHideResults()" ng-blur="hideResults()" /><div id="{{id}}_dropdown" class="angucomplete-dropdown" ng-if="showDropdown"><div class="angucomplete-searching" ng-show="searching">Searching...</div><div class="angucomplete-searching" ng-show="!searching && (!results || results.length == 0)">No results found</div><div class="angucomplete-row" ng-repeat="result in results" ng-mousedown="selectResult(result)" ng-mouseover="hoverRow()" ng-class="{\'angucomplete-selected-row\': $index == currentIndex}"><div ng-if="imageField" class="angucomplete-image-holder"><img ng-if="result.image && result.image != \'\'" ng-src="{{result.image}}" class="angucomplete-image"/><div ng-if="!result.image && result.image != \'\'" class="angucomplete-image-default"></div></div><div class="angucomplete-title" ng-if="matchClass" ng-bind-html="result.title"></div><div class="angucomplete-title" ng-if="!matchClass">{{ result.title }}</div><div ng-if="result.description && result.description != \'\'" class="angucomplete-description">{{result.description}}</div></div></div></form>',

            link: function($scope, elem, attrs) {
                $scope.lastSearchTerm = null;
                $scope.currentIndex = null;
                $scope.justChanged = false;
                $scope.searchTimer = null;
                $scope.hideTimer = null;
                $scope.searching = false;
                $scope.pause = 500;
                $scope.minLength = 3;

                if ($scope.minLengthUser && $scope.minLengthUser != "") {
                    $scope.minLength = $scope.minLengthUser;
                }

                if ($scope.userPause) {
                    $scope.pause = $scope.userPause;
                }

                $scope.$watch(function() {
                    return $scope.searchStr
                }, function(){
                    return $scope.ngChange();
                });

                isNewSearchNeeded = function(newTerm, oldTerm) {
                    return newTerm.length >= $scope.minLength && newTerm != oldTerm
                };

                $scope.processResults = function(responseData, str) {
                    if (responseData && responseData.length > 0) {
                        $scope.results = [];

                        var titleFields = [];
                        if ($scope.titleField && $scope.titleField != "") {
                            titleFields = $scope.titleField.split(",");
                        }

                        for (var i = 0; i < responseData.length; i++) {
                            // Get title variables
                            var titleCode = [];

                            for (var t = 0; t < titleFields.length; t++) {
                                titleCode.push(responseData[i][titleFields[t]]);
                            }

                            var description = "";
                            if ($scope.descriptionField) {
                                description = responseData[i][$scope.descriptionField];
                            }

                            var imageUri = "";
                            if ($scope.imageUri) {
                                imageUri = $scope.imageUri;
                            }

                            var image = "";
                            if ($scope.imageField) {
                                image = imageUri + responseData[i][$scope.imageField];
                            }

                            var text = titleCode.join(' ');
                            if ($scope.matchClass) {
                                var re = $scope.regexTranslator(str);
                                var strPart = text.match(re)[0];
                                text = $sce.trustAsHtml(text.replace(re, '<span class="'+ $scope.matchClass +'">'+ strPart +'</span>'));
                            }

                            var resultRow = {
                                title: text,
                                description: description,
                                image: image,
                                originalObject: responseData[i]
                            };

                            $scope.results[$scope.results.length] = resultRow;
                        }


                    } else {
                        $scope.results = [];
                    }
                };

                $scope.regexTranslator = function(input) {
                    var outputString = "";

                    var specialCharacter = "$({[!=";

                    for (i =0; i < input.length; i++)
                    {
                        if (specialCharacter.indexOf(input[i]) >=0) {
                            outputString += '\\' + input[i];
                        }
                        else outputString += input[i];
                    }
                    return new RegExp(outputString, "i");
                };

                $scope.searchTimerComplete = function(str) {
                    // Begin the search

                    if (str.length >= $scope.minLength) {
                        if ($scope.localData) {
                            var searchFields = $scope.searchFields.split(",");

                            var matches = [];

                            for (var i = 0; i < $scope.localData.length; i++) {
                                var match = false;

                                for (var s = 0; s < searchFields.length; s++) {
                                    match = match || (typeof $scope.localData[i][searchFields[s]] === 'string' && typeof str === 'string' && $scope.localData[i][searchFields[s]].toLowerCase().indexOf(str.toLowerCase()) >= 0);
                                }

                                if (match) {
                                    matches[matches.length] = $scope.localData[i];
                                }
                            }

                            $scope.searching = false;
                            $scope.processResults(matches, str);

                        }
                        //else {
                        //    $http.get($scope.url + str, {}).
                        //        success(function(responseData, status, headers, config) {
                        //            $scope.searching = false;
                        //            $scope.processResults((($scope.dataField) ? responseData[$scope.dataField] : responseData ), str);
                        //        }).
                        //        error(function(data, status, headers, config) {
                        //            console.log("error");
                        //        });
                        //}
                    }
                };

                $scope.hideResults = function() {
                    $scope.hideTimer = $timeout(function() {
                        $scope.showDropdown = false;
                    }, $scope.pause);

                    var searchItemExisted = false;
                    for(itemIdx in $scope.localData) {
                        if($scope.localData[itemIdx].name == $scope.searchStr) {
                            searchItemExisted = true;
                            break
                        }
                    }

                    if(!searchItemExisted) {
                        if(!$scope.localData) {
                            return;
                        }

                        return $scope.localData.push({name : $scope.searchStr});
                    }
                };

                $scope.resetHideResults = function() {
                    if($scope.hideTimer) {
                        $timeout.cancel($scope.hideTimer);
                    }
                };

                $scope.hoverRow = function(index) {
                    $scope.currentIndex = index;
                };

                $scope.keyPressed = function(event) {
                    if(!(event.which == 38 || event.which == 40 || event.which == 13)) {
                        if (!$scope.dropDownForm.search.$viewValue || $scope.dropDownForm.search.$viewValue == "") {
                            $scope.showDropdown = false;
                            $scope.lastSearchTerm = null
                        }
                        else if(isNewSearchNeeded($scope.dropDownForm.search.$viewValue, $scope.lastSearchTerm)) {
                            $scope.lastSearchTerm = $scope.dropDownForm.search.$viewValue;
                            $scope.showDropdown = true;
                            $scope.currentIndex = -1;
                            $scope.results = [];

                            if ($scope.searchTimer) {
                                $timeout.cancel($scope.searchTimer);
                            }

                            $scope.searching = true;

                            $scope.searchTimer = $timeout(function() {
                                $scope.searchTimerComplete($scope.dropDownForm.search.$viewValue);
                            }, $scope.pause);
                        }
                    } else {
                        event.preventDefault();
                    }
                };

                $scope.selectResult = function(result) {
                    if ($scope.matchClass) {
                        result.title = result.title.toString().replace(/(<([^>]+)>)/ig, '');
                    }
                    $scope.searchStr = $scope.lastSearchTerm = result.title;
                    $scope.selectedObject = result;
                    $scope.showDropdown = false;
                    $scope.results = [];
                    //$scope.$apply();
                };

                var inputField = elem.find('input');

                inputField.on('keyup', $scope.keyPressed);

                elem.on("keyup", function (event) {
                    if(event.which === 40) {
                        if ($scope.results && ($scope.currentIndex + 1) < $scope.results.length) {
                            $scope.currentIndex ++;
                            $scope.$apply();
                            event.preventDefault;
                            event.stopPropagation();
                        }

                        $scope.$apply();
                    } else if(event.which == 38) {
                        if ($scope.currentIndex >= 1) {
                            $scope.currentIndex --;
                            $scope.$apply();
                            event.preventDefault;
                            event.stopPropagation();
                        }

                    } else if (event.which == 13) {
                        if ($scope.results && $scope.currentIndex >= 0 && $scope.currentIndex < $scope.results.length) {
                            $scope.selectResult($scope.results[$scope.currentIndex]);
                            $scope.$apply();
                            event.preventDefault;
                            event.stopPropagation();
                        } else {
                            $scope.results = [];
                            $scope.$apply();
                            event.preventDefault;
                            event.stopPropagation();
                        }

                    } else if (event.which == 27) {
                        $scope.results = [];
                        $scope.showDropdown = false;
                        $scope.$apply();
                    } else if (event.which == 8) {
                        $scope.selectedObject = null;
                        $scope.$apply();
                    }
                });

            }
        };
    });