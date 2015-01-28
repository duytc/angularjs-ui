(function() {
    'use strict';

    angular.module('tagcade.supportTools.cpmEditor')
        .config(addStates)
    ;

    function addStates(UserStateHelperProvider, $stateProvider) {
        UserStateHelperProvider
            .state('supportTools.cpmEditor', {
                url: '/CpmEditor',
                views: {
                    'content@app': {
                        templateUrl: 'supportTools/cpmEditor/views/cpmEditor.tpl.html'
                    }
                },
                ncyBreadcrumb: {
                    label: 'CPM Editor'
                }
            })
        ;

        $stateProvider
            .state('app.admin.supportTools.cpmEditor.adNetworks', {
                url: '/adNetworks/{publisherId:int}',
                views: {
                    'cpmEditor': {
                        controller: 'CpmEditor',
                        templateUrl: 'supportTools/cpmEditor/views/adNetworkList.tpl.html'
                    }
                },
                resolve: {
                    dataList: function(cpmEditorService, $stateParams, CPM_EDITOR_TYPES) {
                        return cpmEditorService.getAdNetworkForAdmin($stateParams, {
                            updateTypes: CPM_EDITOR_TYPES.adNetwork
                        });
                    }
                }
            })
        ;

        $stateProvider
            .state('app.publisher.supportTools.cpmEditor.adNetworks', {
                url: '/adNetworks',
                views: {
                    'cpmEditor': {
                        controller: 'CpmEditor',
                        templateUrl: 'supportTools/cpmEditor/views/adNetworkList.tpl.html'
                    }
                },
                resolve: {
                    dataList: function(cpmEditorService, CPM_EDITOR_TYPES) {
                        return cpmEditorService.getAdNetworkForPublisher({
                            updateTypes: CPM_EDITOR_TYPES.adNetwork
                        });
                    }
                }
            })
        ;

        UserStateHelperProvider
            .state('supportTools.cpmEditor.adTags', {
                url: '/site/{siteId:int}/adtags',
                views: {
                    'cpmEditor': {
                        controller: 'CpmEditor',
                        templateUrl: 'supportTools/cpmEditor/views/adTagList.tpl.html'
                    }
                },
                resolve: {
                    dataList: function(cpmEditorService, $stateParams, CPM_EDITOR_TYPES) {
                        return cpmEditorService.getAdTag($stateParams, {
                            updateTypes: CPM_EDITOR_TYPES.adTag
                        });
                    }
                }
            })
        ;

        UserStateHelperProvider
            .state('supportTools.cpmEditor.sites', {
                url: '/adNetwork/{adNetworkId:int}/sites',
                views: {
                    cpmEditor: {
                        controller: 'CpmEditor',
                        templateUrl: 'supportTools/cpmEditor/views/siteList.tpl.html'
                    }
                },
                resolve: {
                    dataList: function(cpmEditorService, $stateParams, CPM_EDITOR_TYPES) {
                        return cpmEditorService.getSite($stateParams, {
                            updateTypes: CPM_EDITOR_TYPES.site
                        });
                    }
                }
            })
        ;
    }
})();