(function () {
        'use strict';

        angular.module('tagcade.core.historyStorage')
            .constant('HISTORY', 'tagcadeHistory')
            .constant('HISTORY_TYPE_PATH', {
                    site: 'site',
                    adSlot: 'adSlot',
                    adNetwork: 'adNetwork',
                    publisher: 'publisher',
                    adTagAdNetwork: 'adTagAdNetwork',
                    adTagLibrary: 'adTagLibrary',
                    adSlotLibrary: 'adSlotLibrary',
                    channel: 'channel',
                    ronAdSlot: "ronAdSlot",
                    segment: "segment",
                    subPublisher: "subPublisher",
                    videoPublisher: "videoPublisher",
                    allVideoDemandAdTag: "allVideoDemandAdTag",
                    videoAdTag: "videoAdTag",
                    videoDemandAdTag: "videoDemandAdTag",
                    demandPartner: "demandPartner",
                    libraryDemandAdTag: "libraryDemandAdTag",
                    domainList: "domainList",
                    blockList: "blockList",
                    whiteList: "whiteList",
                    dataSource: "dataSource",
                    dataSourceFile: "dataSourceFile",
                    dataSet: "dataSet",
                    connectDataSource: "connectDataSource",
                    unifiedReportView: "unifiedReportView",
                    unifiedReportDetail: "unifiedReportDetail",
                    public: "public",
                    importHistoryList: 'importHistoryList',
                    template: 'template',
                    tag: 'tag',
                    IVTPixel: 'IVTPixel',
                    autoOptimization: 'autoOptimization',
                    autoOptimizeIntegration: 'autoOptimizeIntegration'
            })
        ;
})();