cordova.define("com-snaphappi-plugins-camera-roll-location.CameraRollLocation", function (require, exports, module) {
  let exec = require('cordova/exec');

  export enum mediaType {
    Unknown, Image, Video, Audio
  }

  export enum mediaSubtype {
    // see: https://developer.apple.com/library/ios/documentation/Photos/Reference/Photos_Constants/index.html#//apple_ref/c/tdef/PHAssetMediaSubtype
    None = 0,
    PhotoPanorama = 1 << 0,
    PhotoHDR = 1 << 1,
    PhotoScreenshot = 1 << 2,
    PhotoLive = 1 << 3,
    VideoStreamed = 1 << 4,
    VideoHighFrameRate = 1 << 5,
    VideoTimelapse = 1 << 6
  }

  interface optionsGetByMoments {
    from?: Date,
    to?: Date,
    mediaType?: mediaType,
    mediaSubtype?: mediaSubtype
  }

  interface NodeCallback {
    (err: any, data: any): void;
  }

  /**
  * get photos CameraRoll along with location and moment data
  * calls (ios/swift) CameraRollLocation.getByMoments() using plugin exec 
  * swift: func getByMoments(from from: NSDate? = nil, to: NSDate? = nil) -> [PhotoWithLoc]
  *
  * @param  {optionsGetByMoments}    options {from:, to: mediaType: mediaSubtypes: }
  * @param  {NodeCallback}           nodejs style callback, i.e. (err, resp)=>{}
  * @return [PhotoWithLoc]           array of PhotoWithLoc
  */
  export function getByMoments(
    options: optionsGetByMoments = {},
    callback: NodeCallback,
  ) {
    let {from, to, mediaType, mediaSubtype} = options;
    const defaults: any = {
      // default params
    }
    const arg0: any = Object.assign({}, defaults);
    // _.pick
    ['from', 'to', 'mediaType', 'mediaSubtype'].forEach((k: string) => {
      if (options.hasOwnProperty(k) && options[k]) arg0[k] = options[k];
    })
    const successCallback = (result: any) => {
      try {
        let data = JSON.parse(result);
        callback(null, data);
      } catch (err) {
        callback(err, result);
      }

    };
    const errorCallback = (err: any) => callback(err, undefined);
    exec(successCallback, errorCallback, "cameraRollLocation", "getByMoments", [arg0]);
  }
}