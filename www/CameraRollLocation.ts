
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
* get photos from CameraRoll together with location and moment data
* calls (ios/swift) CameraRollLocation.getByMoments() using plugin exec()
* swift: func getByMoments(from from: NSDate? = nil, to: NSDate? = nil) -> [PhotoWithLoc]
*
* @param  {getByMomentsOptions}   options {from:, to: mediaType: mediaSubtypes: }
* @param  callback()              OPTIONAL nodejs style callback, i.e. (err, resp)=>{}
* @return Promise() or void       returns a Promise if callback is NOT provided
*/
export function getByMoments(
  options: getByMomentsOptions = {},
  callback?: NodeCallback,
) {
  const methodName = "getByMoments";
  let {from, to, mediaType, mediaSubtype} = options;
  const defaults: any = {
    // default params
  }
  const arg0: any = Object.assign({}, defaults);
  // _.pick
  ['from', 'to', 'mediaType', 'mediaSubtype'].forEach((k: string) => {
    if (options.hasOwnProperty(k) && options[k]) arg0[k] = options[k];
  })

  if (typeof callback == "function") {
    // use provided callbacks, node style
    return PluginHelper.callCordovaPlugin(methodName, [arg0], undefined
      , (result:any)=>{
        try {
          if (result == undefined) result = "[]";
          const data = JSON.parse(result);
          return callback(null, data);
        } catch (err) {
          return callback(err, result);
        }
      }
      , (err:any)=>{
        return callback(err, undefined);
      });
  } else {
    // use Promise
    return PluginHelper.wrapPromise(methodName, [arg0])
    .then( (result:any)=>{
      try {
        if (result == undefined) result = "[]";
        const data = JSON.parse(result);
        return data;
      } catch (err) {
        return PluginHelper.getPromise( (resolve, reject)=>{
          reject({error: err, response: result});
        });
      }
    })
  }
}



/**
 * Helper methods borrowed from Ionic Native to return as Promise
 * see: https://github.com/driftyco/ionic-native/blob/master/src/plugins/plugin.ts
 */
declare var window : any;
class PluginHelper {

  static wrapPromise(methodName: string, args: any[], opts: any = {}) {
    let pluginResult, rej;
    const p = PluginHelper.getPromise((resolve, reject) => {
      pluginResult = PluginHelper.callCordovaPlugin(methodName, args, opts, resolve, reject);
      rej = reject;
    });
    // Angular throws an error on unhandled rejection, but in this case we have already printed
    // a warning that Cordova is undefined or the plugin is uninstalled, so there is no reason
    // to error
    if (pluginResult && pluginResult.error) {
      p.catch(() => { });
      rej(pluginResult.error);
    }
    return p;
  }

  static getPromise(cb) {
    const tryNativePromise = () => {
      if (window.Promise) {
        return new Promise((resolve, reject) => {
          cb(resolve, reject);
        });
      } else {
        console.error('No Promise support or polyfill found. To enable Ionic Native support, please add the es6-promise polyfill before this script, or run with a library like Angular 1/2 or on a recent browser.');
      }
    };

    if (window.angular) {
      let injector = window.angular.element(document.querySelector('[ng-app]') || document.body).injector();
      if (injector) {
        let $q = injector.get('$q');
        return $q((resolve, reject) => {
          cb(resolve, reject);
        });
      } else {
        console.warn('Angular 1 was detected but $q couldn\'t be retrieved. This is usually when the app is not bootstrapped on the html or body tag. Falling back to native promises which won\'t trigger an automatic digest when promises resolve.');
        return tryNativePromise();
      }
    } else {
      return tryNativePromise();
    }
  }

  static callCordovaPlugin(methodName: string, args: any[], opts: any = {}, resolve: Function, reject: Function) {
    // we are already in the plugin, so window.cordova checks are not necessary
    return exec(resolve, reject, "cameraRollLocation", methodName, args);
  }
}
