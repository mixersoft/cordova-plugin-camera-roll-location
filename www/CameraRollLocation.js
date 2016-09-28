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
    * @param  {optionsGetByMoments}    options {from:, to: mediaType: mediaSubtypes: }
    * @param  {NodeCallback}           nodejs style callback, i.e. (err, resp)=>{}
    * @return [PhotoWithLoc]           array of PhotoWithLoc
    */
    function getByMoments(options, callback) {
        if (options === void 0) { options = {}; }
        var from = options.from, to = options.to, mediaType = options.mediaType, mediaSubtype = options.mediaSubtype;
        var defaults = {};
        var arg0 = Object.assign({}, defaults);
        // _.pick
        ['from', 'to', 'mediaType', 'mediaSubtype'].forEach(function (k) {
            if (options.hasOwnProperty(k) && options[k])
                arg0[k] = options[k];
        });
        var successCallback = function (result) {
            if (result === void 0) { result = "[]"; }
            try {
                var data = JSON.parse(result);
                callback(null, data);
            }
            catch (err) {
                callback(err, result);
            }
        };
        var errorCallback = function (err) { return callback(err, undefined); };
        exec(successCallback, errorCallback, "cameraRollLocation", "getByMoments", [arg0]);
    }
    exports.getByMoments = getByMoments;

// });
