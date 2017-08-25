(function() {
    'use strict';

    angular.module('tagcade.videoManagement')
        .constant('PLAYER_SIZE_OPTIONS', [
            {label: "Small", key: "small"},
            {label: "Medium", key: "medium"},
            {label: "Large", key: "large"}
        ])
        .constant('REQUIRED_MACROS_OPTIONS', [
            // auto detect macros =>group item line = true
            {label: "ip_address", key: "ip_address", root: '${ip_address}', helpText: "The IP address of the current website", line: true},
            {label: "country", key: "country", root: '${country}', helpText: 'The country of the current website', line: true},
            {label: "user_agent", key: "user_agent", root: '${user_agent}', helpText: "The user agent of the current browser", line: true},
            {label: "timestamp", key: "timestamp", root: '${timestamp}', helpText: 'Current time in unix time', line: true},
            // user provides macros
            {label: "page_url", key: "page_url", root: '${page_url}', helpText: "The url of the current page"},
            {label: "domain", key: "domain", root: '${domain}', helpText: "The domain defined manually by user"},
            {label: "page_title", key: "page_title", root: '${page_title}', helpText: "Title of the current page"},
            {label: "player_width", key: "player_width", root: '${player_width}', helpText: "Define the width of the video player"},
            {label: "player_height", key: "player_height", root: '${player_height}', helpText: "Define the height of the video player"},
            {label: "player_dimensions", key: "player_dimensions", root: '${player_dimensions}', helpText: "Define the dimension of video player (width and height)"},
            {label: "player_size", key: "player_size", root: '${player_size}', helpText: "Define the size of player, size will be parsed into dimensions (width, height)"},
            {label: "video_duration", key: "video_duration", root: '${video_duration}', helpText: "Duration of the curent video in second"},
            {label: "video_url", key: "video_url", root: '${video_url}', helpText: "Url of current video"},
            {label: "video_id", key: "video_id", root: '${video_id}', helpText: "Unique id of video in the system"},
            {label: "video_title", key: "video_title", root: '${video_title}', helpText: "Title of the current video"},
            {label: "video_description", key: "video_description", root: '${video_description}', helpText: "Text that describes the content of current video"},
            {label: "app_name", key: "app_name", root: '${app_name}', helpText: " Name of the mobile app showing this video ad"},
            {label: "user_lat", key: "user_lat", root: '${user_lat}', helpText: "The latitude of user"},
            {label: "user_lon", key: "user_lon", root: '${user_lon}', helpText: "The longitude of user"},
            {label: "waterfall_id", key: "waterfall_id", root: '${waterfall_id}', helpText: 'Unique id of the Video Waterfall Tag'},
            {label: "demand_tag_id", key: "demand_tag_id", root: '${demand_tag_id}', helpText: 'Unique id of the Video Demand Tag'},
            {label: "device_id", key: "device_id", root: '${device_id}', helpText: 'The device id, we expect the user to provide a value'},
            {label: "device_name", key: "device_name", root: '${device_name}', helpText: 'The device name, we expect the user to provide a value'}
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
                'desc': '${video_description}',
                'dur':  '${video_duration}',
                'ip'  : '${ip_address}',
                'ua'  : '${user_agent}',
                'cb'  : '${cache_buster}'
            },

            'https?://vast.vertamedia.com/' : {
                'player_width'     : '${player_width}',
                'player_height'    : '${player_height}',
                'content_page_url' : '${page_url}',
                'vid_duration'     : '${video_duration}',
                'video_duration'   : '${video_duration}',
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
                'ip' : '${ip_address}',
                'ua' : '${user_agent}',
                'u'  : '${page_url}',
                'cb' : '${cache_buster}',
                'ti' : '${video_title}',
                'de' : '${video_description}',
                'du' : '${video_duration}',
                'mi' : '${video_id}',
                'wi' : '${player_width}',
                'he' : '${player_height}'
            },

            'https?://vast.yashi.com' : {
                'vid_id'        : '${video_id}',
                'vid_title'     : '${video_title}',
                'vid_url'       : '${video_url}',
                'player_width'  : '${player_width}',
                'player_height' : '${player_height}',
                'page_url'      : '${page_url}'
            },

            'https?://go.aniview.com/api/adserver/vast/' : {
                'AV_URL'  : '${page_url}',
                'cb'      : '${cache_buster}'
            },

            'https?://arena.altitude-arena.com' : {
                'page_url'          : '${page_url}',
                'cb'                : '${cache_buster}',
                'player_width'      : '${player_width}',
                'player_height'     : '${player_height}',
                'media_description' : '${video_description}',
                'video_duration'    : '${video_duration}',
                'media_file_id'     : '${video_id}'
            },

            'https?://ssp.streamrail.net/ssp/vpaid' : {
                'page_url'           : '${page_url}',
                'cb'                 : '${cache_buster}',
                'width'              : '${player_width}',
                'height'             : '${player_height}',
                'video_description'  : '${video_description}',
                'video_duration'     : '${video_duration}',
                'video_id'           : '${video_id}'
            },

            'https?://ssp.lkqd.net' : {
                'width'         : '${player_width}',
                'height'        : '${player_height}',
                'dnt'           : '${do_not_track}',
                'pageurl'       : '${page_url}',
                'ip'            : '${ip_address}',
                'ua'            : '${user_agent}',
                'contentid'     : '${video_id}',
                'contenttitle'  : '${video_title}',
                'contenturl'    : '${video_url}',
                'rnd'           : '${cache_buster}'
            }

        })
    ;
})();