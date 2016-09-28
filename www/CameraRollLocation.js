// cordova.define("com-snaphappi-plugins-camera-roll-location.CameraRollLocation", function (require, exports, module) {

var exec = require('cordova/exec');
(function (mediaType) {
    mediaType[mediaType["Unknown"] = 0] = "Unknown";
    mediaType[mediaType["Image"] = 1] = "Image";
    mediaType[mediaType["Video"] = 2] = "Video";
    mediaType[mediaType["Audio"] = 3] = "Audio";
})(exports.mediaType || (exports.mediaType = {}));
var mediaType = exports.mediaType;
(function (mediaSubtype) {
    // see: https://developer.apple.com/library/ios/documentation/Photos/Reference/Photos_Constants/index.html#//apple_ref/c/tdef/PHAssetMediaSubtype
    mediaSubtype[mediaSubtype["None"] = 0] = "None";
    mediaSubtype[mediaSubtype["PhotoPanorama"] = 1] = "PhotoPanorama";
    mediaSubtype[mediaSubtype["PhotoHDR"] = 2] = "PhotoHDR";
    mediaSubtype[mediaSubtype["PhotoScreenshot"] = 4] = "PhotoScreenshot";
    mediaSubtype[mediaSubtype["PhotoLive"] = 8] = "PhotoLive";
    mediaSubtype[mediaSubtype["VideoStreamed"] = 16] = "VideoStreamed";
    mediaSubtype[mediaSubtype["VideoHighFrameRate"] = 32] = "VideoHighFrameRate";
    mediaSubtype[mediaSubtype["VideoTimelapse"] = 64] = "VideoTimelapse";
})(exports.mediaSubtype || (exports.mediaSubtype = {}));
var mediaSubtype = exports.mediaSubtype;
/**
* get photos CameraRoll along with location and moment data
* calls (ios/swift) CameraRollLocation.getByMoments() using plugin exec
* swift: func getByMoments(from from: NSDate? = nil, to: NSDate? = nil) -> [PhotoWithLoc]
*
* @param  {getByMomentsOptions}   options {from:, to: mediaType: mediaSubtypes: }
* @param  callback()              OPTIONAL nodejs style callback, i.e. (err, resp)=>{}
* @return Promise() or void       returns a Promise if callback is NOT provided
*/
function getByMoments(options, callback) {
    if (options === void 0) { options = {}; }
    var methodName = "getByMoments";
    var from = options.from, to = options.to, mediaType = options.mediaType, mediaSubtype = options.mediaSubtype;
    var defaults = {};
    var arg0 = Object.assign({}, defaults);
    // _.pick
    ['from', 'to', 'mediaType', 'mediaSubtype'].forEach(function (k) {
        if (options.hasOwnProperty(k) && options[k])
            arg0[k] = options[k];
    });
    if (typeof callback == "function") {
        // use provided callbacks, node style
        return PluginHelper.callCordovaPlugin(methodName, [arg0], undefined, function (result) {
            try {
                if (result == undefined)
                    result = "[]";
                var data = JSON.parse(result);
                return callback(null, data);
            }
            catch (err) {
                return callback(err, result);
            }
        }, function (err) {
            return callback(err, undefined);
        });
    }
    else {
        // use Promise
        return PluginHelper.wrapPromise(methodName, [arg0])
            .then(function (result) {
            try {
                if (result == undefined)
                    result = "[]";
                var data = JSON.parse(result);
                return data;
            }
            catch (err) {
                return PluginHelper.getPromise(function (resolve, reject) {
                    reject({ error: err, response: result });
                });
            }
        });
    }
}
exports.getByMoments = getByMoments;
var PluginHelper = (function () {
    function PluginHelper() {
    }
    PluginHelper.wrapPromise = function (methodName, args, opts) {
        if (opts === void 0) { opts = {}; }
        var pluginResult, rej;
        var p = PluginHelper.getPromise(function (resolve, reject) {
            pluginResult = PluginHelper.callCordovaPlugin(methodName, args, opts, resolve, reject);
            rej = reject;
        });
        // Angular throws an error on unhandled rejection, but in this case we have already printed
        // a warning that Cordova is undefined or the plugin is uninstalled, so there is no reason
        // to error
        if (pluginResult && pluginResult.error) {
            p.catch(function () { });
            rej(pluginResult.error);
        }
        return p;
    };
    PluginHelper.getPromise = function (cb) {
        var tryNativePromise = function () {
            if (window.Promise) {
                return new Promise(function (resolve, reject) {
                    cb(resolve, reject);
                });
            }
            else {
                console.error('No Promise support or polyfill found. To enable Ionic Native support, please add the es6-promise polyfill before this script, or run with a library like Angular 1/2 or on a recent browser.');
            }
        };
        if (window.angular) {
            var injector = window.angular.element(document.querySelector('[ng-app]') || document.body).injector();
            if (injector) {
                var $q = injector.get('$q');
                return $q(function (resolve, reject) {
                    cb(resolve, reject);
                });
            }
            else {
                console.warn('Angular 1 was detected but $q couldn\'t be retrieved. This is usually when the app is not bootstrapped on the html or body tag. Falling back to native promises which won\'t trigger an automatic digest when promises resolve.');
                return tryNativePromise();
            }
        }
        else {
            return tryNativePromise();
        }
    };
    PluginHelper.callCordovaPlugin = function (methodName, args, opts, resolve, reject) {
        if (opts === void 0) { opts = {}; }
        // we are already in the plugin, so window.cordova checks are not necessary
        return exec(resolve, reject, "cameraRollLocation", methodName, args);
    };
    return PluginHelper;
}());

// });
