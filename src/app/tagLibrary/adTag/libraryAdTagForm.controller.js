(function() {
    'use strict';

    angular.module('tagcade.tagLibrary.adTag')
        .controller('LibraryAdTagForm', LibraryAdTagForm)
    ;

    function LibraryAdTagForm($scope, Auth, $modal, $translate, whiteList, blackList, AlertService, AdNetworkManager, adminUserManager, ServerErrorProcessor, AdNetworkCache, adTag, publisherList, AdTagLibrariesManager, historyStorage, queryBuilderService, AD_TYPES, USER_MODULES, VARIABLE_FOR_AD_TAG, HISTORY_TYPE_PATH) {
        $scope.fieldNameTranslations = {
            adNetwork: 'adNetwork',
            html: 'html'
        };

        $scope.editorOptions = {
            lineWrapping : true,
            indentUnit: 0,
            mode : "htmlmixed"
        };

        $scope.isNew = adTag === null;
        $scope.adTypes = AD_TYPES;
        $scope.formProcessing = false;
        $scope.adNetworkList = [];
        $scope.publisherList = publisherList;

        $scope.adTag = adTag || {
            html: null,
            adNetwork: null,
            adType: $scope.adTypes.customAd,
            descriptor: null,
            expressionDescriptor: {
                groupVal: [],
                groupType: 'AND'
            },
            inBannerDescriptor: {
                timeout: null,
                playerWidth: null,
                playerHeight: null,
                vastTags: [{tag: null}]
            }
        };

        $scope.domainList = {
            blacklist: blackList,
            whitelist: whiteList
        };

        $scope.selected = {
            publisher: !$scope.isNew ? adTag.adNetwork.publisher : null
        };

        if(!!$scope.adTag.descriptor) {
            if(!$scope.adTag.descriptor.imageUrl) {
                $scope.adTag.descriptor = null;
            }
        }

        $scope.sortableOptions = {
            disabled: true,
            forcePlaceholderSize: true,
            placeholder: 'sortable-placeholder'
        };

        if(!$scope.isNew) {
            if(angular.isArray($scope.adTag.expressionDescriptor) || !$scope.adTag.expressionDescriptor) {
                $scope.adTag.expressionDescriptor = {groupVal: [], groupType: 'AND'}
            }
        }

        var sideParams = {
            adNetwork: {
                totalRecord: 0,
                params: {
                    query: '',
                    page: null
                }
            }
        };

        if(!$scope.isAdmin()) {
            searchAdNetworkItem(null, Auth.getSession().id);
        }

        $scope.addMoreAdNetworkItems = addMoreAdNetworkItems;
        $scope.searchAdNetworkItem = searchAdNetworkItem;
        $scope.clickVIewHelpText = clickVIewHelpText;

        function clickVIewHelpText() {
            $modal.open({
                templateUrl: 'videoManagement/IVTPixel/helpTextMacros.tpl.html',
                controller: function ($scope, MACROS_FOR_AD_TAG) {
                    $scope.macrosOptions = MACROS_FOR_AD_TAG;
                }
            });
        }

        function searchAdNetworkItem(query, publisherId) {
            if(query == sideParams.adNetwork.params.query) {
                return;
            }

            sideParams.adNetwork.params.page = 1;
            sideParams.adNetwork.params.searchKey = query;
            sideParams.adNetwork.params.query = query;

            var publisher = publisherId || (angular.isObject($scope.selected.publisher) ? $scope.selected.publisher.id : $scope.selected.publisher);

            var Manage = $scope.isAdmin() ? adminUserManager.one(publisher).one('adnetworks') : AdNetworkManager.one();

            return Manage.get(sideParams.adNetwork.params)
                .then(function(datas) {
                    sideParams.adNetwork.totalRecord = datas.totalRecord;

                    $scope.adNetworkList = [];
                    angular.forEach(datas.records, function(adNetwork) {
                        $scope.adNetworkList.push(adNetwork);
                    });
                });
        }

        function addMoreAdNetworkItems() {
            var page = Math.ceil((($scope.adNetworkList.length -1)/10) + 1);

            if(($scope.isAdmin() && !$scope.selected.publisher) || sideParams.adNetwork.params.page === page || (page > Math.ceil(sideParams.adNetwork.totalRecord/10) && page != 1)) {
                return
            }

            sideParams.adNetwork.params.page = page;

            var publisher = angular.isObject($scope.selected.publisher) ? $scope.selected.publisher.id : $scope.selected.publisher;
            var Manage = $scope.isAdmin() ? adminUserManager.one(publisher).one('adnetworks') : AdNetworkManager.one();

            return Manage.get(sideParams.adNetwork.params)
                .then(function(datas) {
                    sideParams.adNetwork.totalRecord = datas.totalRecord;
                    angular.forEach(datas.records, function(adNetwork) {
                        $scope.adNetworkList.push(adNetwork);
                    });
                })
        }

        $scope.builtVariable = function(expressionDescriptor) {
            return queryBuilderService.builtVariable(expressionDescriptor)
        };

        $scope.isFormValid = function() {
            for(var i in $scope.adTag.expressionDescriptor.groupVal) {
                var group = $scope.adTag.expressionDescriptor.groupVal[i];
                if (!_validateGroup(group)) {
                    return false;
                }
            }

            return $scope.adTagLibraryForm.$valid;
        };

        function _validateGroup(group) {
            if(!!group.groupVal && group.groupVal.length > 0) {

                var tmpGroup;
                for(var i in group.groupVal) {
                    tmpGroup = group.groupVal[i];
                    if (!_validateGroup(tmpGroup)) {
                        return false;
                    }
                }

                return true;
            }

            if(group.customVar == '${DOMAIN}' || group.customVar == '${DEVICE}' || group.customVar == '${COUNTRY}') {
                if(!group.val || group.val.length == 0) {
                    return false
                }
            }

            return (!!group.customVar && group.customVar != 'CUSTOM') || !!group.var;
        }

        $scope.selectPublisher = function(publisher) {
            $scope.adTag.adNetwork = null;
            $scope.adTag.expressionDescriptor = {
                groupVal: [],
                    groupType: 'AND'
            };

            searchAdNetworkItem(null, publisher.id);
        };

        $scope.backToAdTagLibraryList = function() {
            return historyStorage.getLocationPath(HISTORY_TYPE_PATH.adTagLibrary, '^.list');
        };

        $scope.createAdNetwork = function() {
            var modalInstance = $modal.open({
                templateUrl: 'tagManagement/adTag/adNetworkQuicklyForm.tpl.html',
                controller: 'AdNetworkQuicklyForm',
                size: 'lg',
                resolve: {
                    publishers: function(adminUserManager){
                        if(!$scope.isAdmin()) {
                            return null;
                        }

                        if(!!publisherList) {
                            return publisherList;
                        }

                        return adminUserManager.getList({ filter: 'publisher' }).then(function (users) {
                            return users.plain();
                        });
                    },
                    blockList: function (DisplayBlackListManager) {
                        return DisplayBlackListManager.getList()
                            .then(function (blockList) {
                                return blockList.plain()
                            });
                    },
                    whiteList: function (DisplayWhiteListManager) {
                        return DisplayWhiteListManager.getList()
                            .then(function (whiteList) {
                                return whiteList.plain()
                            });
                    }
                }
            });

            modalInstance.result.then(function () {
                AdNetworkCache.getAllAdNetworks()
                    .then(function(adNetworks) {
                        $scope.adNetworkList = adNetworks;
                    });
            })
        };

        $scope.addVast = function () {
            $scope.adTag.inBannerDescriptor.vastTags.push({
                tag: null
            })
        };

        $scope.removeTag = function (index) {
            if(index > -1) {
                $scope.adTag.inBannerDescriptor.vastTags.splice(index, 1)
            }
        };

        $scope.enableDragDropVastTag = function(enable) {
            $scope.sortableOptions['disabled'] = enable;
        };

        $scope.hasInBanner = function () {
            if($scope.isAdmin() && !$scope.selected.publisher) {
                return false
            } else if($scope.isAdmin() && !!$scope.selected.publisher) {
                return $scope.selected.publisher.enabledModules.indexOf(USER_MODULES.inBanner) > -1
            }

            return Auth.getSession().hasModuleEnabled(USER_MODULES.inBanner);
        };

        $scope.moveVastTag = function(array, from, to) {
            array.splice(to, 0, array.splice(from, 1)[0]);
        };

        $scope.submit = function() {
            if ($scope.formProcessing) {
                // already running, prevent duplicates
                return;
            }

            $scope.formProcessing = true;

            var adTag = angular.copy($scope.adTag);
            _formatGroupVal(adTag.expressionDescriptor.groupVal);

            if(adTag.expressionDescriptor.groupVal.length == 0) {
                adTag.expressionDescriptor = null;
            }

            var saveAdTagLibrary =  $scope.isNew ? AdTagLibrariesManager.post(adTag) : AdTagLibrariesManager.one(adTag.id).patch(adTag);
            saveAdTagLibrary
                .catch(
                function (response) {
                    if(!response.data.errors) {
                        AlertService.replaceAlerts({
                            type: 'error',
                            message: response.data.message
                        });
                    }

                    var errorCheck = ServerErrorProcessor.setFormValidationErrors(response, $scope.adTagLibraryForm, $scope.fieldNameTranslations);
                    $scope.formProcessing = false;

                    return errorCheck;
                })
                .then(
                function () {
                    AlertService.addFlash({
                        type: 'success',
                        message: $scope.isNew ? $translate.instant('AD_TAG_MODULE.ADD_NEW_SUCCESS') : $translate.instant('AD_TAG_MODULE.UPDATE_SUCCESS')
                    });
                })
                .then(
                function () {
                    return historyStorage.getLocationPath(HISTORY_TYPE_PATH.adTagLibrary, '^.list');
                })
            ;
        };

        _update();

        function _update() {
            if(!$scope.isNew) {
                _convertGroupVal(adTag.expressionDescriptor.groupVal);
            }
        }

        function _convertGroupVal(groupVal) {
            angular.forEach(groupVal, function(group) {
                var index = _.findIndex(VARIABLE_FOR_AD_TAG, {key: group.var});

                if(index > -1) {
                    group.customVar = group.var;
                } else {
                    group.customVar = 'CUSTOM';
                }

                if(angular.isString(group.val) && (group.var == '${COUNTRY}' || group.var == '${DEVICE}' || group.var == '${DOMAIN}')) {
                    group.val = group.val.split(',');

                    if(group.var != '${DOMAIN}') {
                        group.cmp = group.cmp == '==' ||  group.cmp == 'is' ? 'is' : 'isNot';
                    }
                }

                if(angular.isObject(group.groupVal)) {
                    _convertGroupVal(group.groupVal);
                }
            });
        }

        function _formatGroupVal(groupVal) {
            angular.forEach(groupVal, function(group) {
                if(group.customVar != 'CUSTOM') {
                    group.var = group.customVar;
                }

                delete group.customVar;

                if(angular.isObject(group.val)) {
                    group.val = group.val.toString();
                }

                if(angular.isObject(group.groupVal)) {
                    _formatGroupVal(group.groupVal);
                }
            });
        }
    }
})();