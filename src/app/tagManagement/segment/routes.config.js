(function() {
    'use strict';

    angular.module('tagcade.tagManagement.segment')
        .config(addStates)
    ;

    function addStates(UserStateHelperProvider, STATUS_STATE_FOR_SUB_PUBLISHER_PERMISSION) {
        // uniqueRequestCacheBuster is used as a work-around for reloading only the current state
        // currently UI-Router will reload all parent states as well, this causes problems having

        UserStateHelperProvider
            .state('tagManagement.segment', {
                abstract: true,
                url: '/segments',
                data: {
                    demandSourceTransparency: STATUS_STATE_FOR_SUB_PUBLISHER_PERMISSION.hide
                },
                ncyBreadcrumb: {
                    skip: true
                }
            })
            .state('tagManagement.segment.list', {
                url: '/list?page&sortField&orderBy&search',
                params: {
                    uniqueRequestCacheBuster: null
                },
                views: {
                    'content@app': {
                        controller: 'SegmentList',
                        templateUrl: 'tagManagement/segment/segmentList.tpl.html'
                    }
                },
                resolve: {
                    segments: /* @ngInject */ function(SegmentManager) {
                        return SegmentManager.getList().then(function (segments) {
                            return segments.plain();
                        });
                    }
                },
                ncyBreadcrumb: {
                    label: 'Segments'
                }
            })
        ;
    }
})();