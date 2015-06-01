(function() {
    'use strict';

    angular.module('tagcade.tagManagement.adSlot')
        .controller('AdSlotForm', AdSlotForm)
    ;

    function AdSlotForm($scope, historyStorage, $stateParams, $q, SiteManager, AdSlotManager, DynamicAdSlotManager, adSlotService, AlertService, ServerErrorProcessor, site, publisherList, siteList, adSlot, TYPE_AD_SLOT, HISTORY_TYPE_PATH) {
        $scope.fieldNameTranslations = {
            site: 'Site',
            name: 'Name',
            width: 'Width',
            height: 'Height'
        };

        $scope.isNew = adSlot === null;
        $scope.types = TYPE_AD_SLOT;
        $scope.tags = null;

        $scope.formProcessing = false;

        $scope.allowSiteSelection = $scope.isNew && !!siteList;

        $scope.submit = submit;
        $scope.selectPublisher = selectPublisher;
        $scope.selectSite = selectSite;
        $scope.selectType = selectType;
        $scope.isFormValid = isFormValid;

        // required by ui select
        $scope.selected = {
            publisher: site && site.publisher,
            type:  $scope.types[0]
        };

        $scope.publisherList = publisherList;
        $scope.siteList = siteList;
        $scope.groupEntities = groupEntities;
        
        $scope.adSlot = adSlot || {
            site: $scope.isNew && $stateParams.hasOwnProperty('siteId') ? parseInt($stateParams.siteId, 10) : null,
            name: null,
            expressions: []
        };

        $scope.adSlotsDefault = [{id: null, name: 'None'}];

        _update();

        function groupEntities(item){
            if (item.id === null) {
                return undefined; // no group
            }

            return ''; // separate group with no name
        }

        function selectSite(siteId) {
            if(!!$scope.adSlot.defaultAdSlot) {
                $scope.adSlot.defaultAdSlot = null;
            }

            return _getAdSlots(siteId)
        }

        function selectType(type) {
            if(type != $scope.types[0] && !!$scope.adSlot.site) {
                _getAdSlots($scope.adSlot.site, type);
            }
        }

        function selectPublisher(publisher, publisherId) {
            $scope.adSlot.site = null;
        }

        function isFormValid() {
            if($scope.selected.type == $scope.types[0]) { // validate static ad slot
                return $scope.adSlotForm.$valid;
            }

            // validate dynamic ad slot
            if(!!$scope.adSlot.defaultAdSlot && (!$scope.adSlot.expressions || $scope.adSlot.expressions.length < 1)) {
                return $scope.adSlotForm.$valid;
            }

            var validExpression = validateExpressions($scope.adSlot.expressions);

            return validExpression && $scope.adSlotForm.$valid;
        }

        function validateExpressions(expressions) {

            if (!expressions || expressions.length < 1) {
                return false;
            }

            var expression;
            for(var i in expressions) {
                expression = expressions[i];
                if (!validateSingleExpression(expression)) {

                    return false;
                }
            }

            return true;
        }

        function validateSingleExpression(expression) {
            if(!expression.expressionDescriptor.groupVal || expression.expressionDescriptor.groupVal.length < 1) {
               return false;
            }

            var group;
            for(var i in expression.expressionDescriptor.groupVal) {
                group = expression.expressionDescriptor.groupVal[i];
                if (!validateGroup(group)) {
                    return false;
                }
            }

            return true;
        }

        function validateGroup(group) {
            if(!!group.groupVal && group.groupVal.length > 0) {

                var tmpGroup;
                for(var i in group.groupVal) {
                    tmpGroup = group.groupVal[i];
                    if (!validateGroup(tmpGroup)) {
                        return false;
                    }
                }

                return true;
            }

            return !!group.var;
        }

        function submit() {
            if ($scope.formProcessing) {
                // already running, prevent duplicates
                return;
            }

            $scope.formProcessing = true;

            if($scope.selected.type != $scope.types[0]) {
                delete $scope.adSlot.height;
                delete $scope.adSlot.width;
            }
            else {
                delete $scope.adSlot.expressions;
                delete $scope.adSlot.defaultAdSlot;
            }

            delete $scope.adSlot.type;

            var Manager = $scope.selected.type != $scope.types[0] ? DynamicAdSlotManager : AdSlotManager;
            var saveAdSlot = $scope.isNew ? Manager.post($scope.adSlot) : $scope.adSlot.patch();

            saveAdSlot
                .catch(
                    function (response) {
                        var errorCheck = ServerErrorProcessor.setFormValidationErrors(response, $scope.adSlotForm, $scope.fieldNameTranslations);
                        $scope.formProcessing = false;
                        return errorCheck;
                    }
                )
                .then(
                    function () {
                        AlertService.addFlash({
                            type: 'success',
                            message: 'The ad slot has been ' + ($scope.isNew ? 'created' : 'updated')
                        });
                    },
                    function () {
                        AlertService.replaceAlerts({
                            type: 'error',
                            message: 'An error occurred. The ad slot could not be ' + ($scope.isNew ? 'created' : 'updated')
                        });

                        return $q.reject();
                    }
                )
                .then(
                    function () {
                        var siteId = $scope.adSlot.site;

                        if (angular.isObject(siteId)) {
                            siteId = siteId.id;
                        }

                        return historyStorage.getLocationPath(HISTORY_TYPE_PATH.adSlot, '^.list', {siteId: siteId});
                    }
                )
            ;
        }

        /**
         *
         * @param {Array} data
         * @param {String} [label]
         * @returns {Array}
         */
        function _addNoneOption(data, label)
        {
            if (!angular.isArray(data)) {
                throw new Error('Expected an array of data');
            }

            data.unshift({
                id: null, // default value
                name: label || 'None'
            });

            return data;
        }

        function _getAdSlots(siteId, type) {
            type = !!type ? type : $scope.selected.type;

            if((!$scope.isNew && !$scope.adSlot.width) || ($scope.isNew && type != $scope.types[0])) {
                SiteManager.one(siteId).getList('adslots').then(function (adSlots) {
                    $scope.adSlotsDefault = adSlots.plain();
                    $scope.adSlots = angular.copy($scope.adSlotsDefault);

                    _addNoneOption($scope.adSlotsDefault, 'None');

                    if(!$scope.isNew) {
                        angular.forEach($scope.adSlots, function(adSlot, index) {
                            if(adSlot.id == $scope.adSlot.id) {
                                $scope.adSlots.splice(index, 1);
                            }
                        });
                    }

                    if($scope.isNew) {
                        angular.forEach($scope.adSlot.expressions, function(expressionDescriptor) {
                            expressionDescriptor.expectAdSlot = null;
                        });
                    }
                });

                SiteManager.one(siteId).getList('dynamicadslots').then(function (dynamicadslots) {
                    $scope.tags = adSlotService.getTagsAdSlotDynamic(dynamicadslots.plain());
                });
            }
        }

        function _update() {
            if(!$scope.isNew) {
                if(!$scope.adSlot.width) {
                    $scope.selected.type = $scope.types[1];
                    _getAdSlots($scope.adSlot.site.id);
                }
            }
            if($scope.isNew && !!$stateParams.siteId) {
                if($scope.selected.type != $scope.types[0]) {
                    _getAdSlots($stateParams.siteId);
                }
            }
        }
    }
})();