(function(){
    if (!window.addEventListener) {
        window.location = "./browserNotSupported.html";
    }
})();

//(function(){
//
//    var browserInfo = function get_browser_info(){
//        var ua=navigator.userAgent,tem,M=ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
//        if(/trident/i.test(M[1])){
//            tem=/\brv[ :]+(\d+)/g.exec(ua) || [];
//            return {name:'IE ',version:(tem[1]||'')};
//        }
//        if(M[1]==='Chrome'){
//            tem=ua.match(/\bOPR\/(\d+)/)
//            if(tem!=null)   {return {name:'Opera', version:tem[1]};}
//        }
//        M=M[2]? [M[1], M[2]]: [navigator.appName, navigator.appVersion, '-?'];
//        if((tem=ua.match(/version\/(\d+)/i))!=null) {M.splice(1,1,tem[1]);}
//        return {
//            name: M[0],
//            version: M[1]
//        };
//    };
//
//
//    var browser = browserInfo();
//
//    var SUPPORTED_BROWSER = {
//        chrome: {from: 11},
//        firefox: {from: 4},
//        safari: {from: 5.1},
//        opera: {from: 12},
//        msie: {from: 9}
//
//    };
//
//    if (browser.name == null) {
//        window.location = "./browserNotSupported.html";
//    }
//
//    var supported_version = SUPPORTED_BROWSER[browser.name.toLowerCase()];
//
//    var version_not_supported = supported_version == null || (browser.version < supported_version.from);
//    if (version_not_supported) {
//        window.location = "./browserNotSupported.html";
//    }
//})();
//
//
//
