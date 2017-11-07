(function() {
    'use strict';

    angular.module('tagcade.videoManagement.IVTPixel')
        .constant('IVT_PIXEL_MACROS', [
            // {label: "waterfall_id", key: "waterfall_id", root: '${waterfall_id}', helpText: 'Unique id of the Video Waterfall Tag'},
            // {label: "demand_tag_id", key: "demand_tag_id", root: '${demand_tag_id}', helpText: 'Unique id of the Video Demand Tag'},
            {label: "country", key: "country", root: '${country}', helpText: 'The country of the current website'},
            {label: "timestamp", key: "timestamp", root: '${timestamp}', helpText: 'Current time in unix time'},
            {label: "device_id", key: "device_id", root: '${device_id}', helpText: 'The device id, we expect the user to provide a value'},
            {label: "device_name", key: "device_name", root: '${device_name}', helpText: 'The device name, we expect the user to provide a value'}
        ])
    ;
})();