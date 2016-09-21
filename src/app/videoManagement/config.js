(function() {
    'use strict';

    angular.module('tagcade.videoManagement')
        .constant('PLAYER_SIZE_OPTIONS', [
            {label: "Small", key: "small"},
            {label: "Medium", key: "medium"},
            {label: "Large", key: "large"}
        ])
        .constant('REQUIRED_MACROS_OPTIONS', [
            'ip_address',
            'user_agent',
            'page_url',
            'domain',
            'page_title',
            'player_width',
            'player_height',
            'player_dimensions',
            'player_size',
            'video_duration',
            'video_url',
            'video_id',
            'video_title',
            'video_description',
            'app_name',
            'user_lat',
            'user_lon'
        ])
        .constant('VIDEO_MACROS_REFERENCE', {

            'https?://search.spotxchange.com/vast/2' : {
                'content_page_url' : '${page_url}',
                'player_width'     : '${player_width}',
                'player_height'    : '${player_height}',
                'vid_duration'     : '${video_duration}',
                'vid_url'          : '${video_url}',
                'vid_id'           : '${video_id}',
                'vid_title'        : '${video_title}',
                'vid_description'  : '${video_description}',
                'cb'               : '${cache_buster}'
            },

            'https?://ads.adaptv.advertising.com/a/h' : {
                'cb'          : '${cache_buster}',
                'pageUrl'     : '${page_url}',
                'description' : '${video_description}',
                'duration'    : '${video_duration}',
                'id'          : '${video_id}',
                'title'       : '${video_title}',
                'url'         : '${video_url}'
            },

            'https?://vid.springserve.com/vast/' : {
                'w'   : '${player_width}',
                'h'   : '${player_height}',
                'url' : '${page_url}',
                'ip'  : '${ip_address}',
                'ua'  : '${user_agent}',
                'cb'  : '${cache_buster}'
            },

            'https?://vast.vertamedia.com/' : {
                'player_width'     : '${player_width}',
                'player_height'    : '${player_height}',
                'content_page_url' : '${page_url}',
                'vid_duration'     : '${video_duration}',
                'cb'               : '${cache_buster}'
            },

            'https?://vast.ssp.optimatic.com/vast/getVast.aspx' : {
                'pageURL'   : '${page_url}',
                'pageTitle' : '${page_title}',
                'cb'        : '${cache_buster}'
            },

            'https?://tag.1rx.io/' : {
                'w'   : '${player_width}',
                'h'   : '${player_height}',
                'url' : '${page_url}'
            },

            'https?://c.adforgeinc.com/w.php' : {
                'ua' : '${user_agent}',
                'u'  : '${page_url}',
                'cb' : '${cache_buster}',
                'ti' : '${video_title}',
                'de' : '${video_description}',
                'du' : '${video_duration}',
                'mi' : '${video_id}',
                'wi' : '${player_width}',
                'he' : '${player_height}'
            }

        })
    ;
})();