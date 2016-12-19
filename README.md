# Cordova `CameraRollLocation` plugin
This cordova plugin provides an API for accessing camera-roll photos with location and 'moment' information.

plugin id=`"com-snaphappi-plugin-camera-roll-location"`

## Supported Platforms

* `ios` version 8+

## Installation

```
ionic plugin add cordova-plugin-add-swift-support --save
ionic plugin add cordova-plugin-camera-roll-location --save
ionic build ios
```

### Compatibility

```
Cordova CLI: 6.3.1
Gulp version:  CLI version 3.9.1
Gulp local:  
Ionic CLI Version: 2.1.0
Ionic App Lib Version: 2.1.0-beta.1
ios-deploy version: 1.8.6
ios-sim version: 5.0.8
OS: Mac OS X El Capitan
Node Version: v5.12.0
Xcode version: Xcode 7.3 Build version 7D175
```

## Usage

* see the demo: https://github.com/mixersoft/ionic2-camera-roll-location-demo

```javascript
// typescript 
interface cameraRollPhoto {
  uuid: string,
  filename: string,
  dateTaken: string, // isoDate
  localTime: string | Date, // YYYY-MM-DD HH:MM:SS.SSS
  mediaType: number,
  mediaSubtype: number,
  width: number,
  height: number,
  duration: number,
  location?: GeoJsonPoint,      // deprecate
  position?: LatLngSpeedLiteral,
  momentId?: string,
  momentLocationName?: string
}

// deprecate
interface location {
  type: string,
  coordinates: [number,number]  // [lon, lat]
  speed?: number
}

// same as google.maps.LatLngLiteral | {speed}
// prefer {position: LatLngSpeedLiteral} over {location:GeoJsonPoint}
interface LatLngSpeedLiteral {
  lat: number,
  lng: number,
  speed: number
}

interface optionsGetCameraRoll {
  from?: Date,
  to?: Date,
  mediaType?: mediaType,
  mediaSubtype?: mediaSubtype
}

interface optionsGetImage {
    width?: number;
    height?: number;
    version?: PHImageRequestOptionsVersion;
    resizeMode?: PHImageRequestOptionsResizeMode;
    deliveryMode?: PHImageRequestOptionsDeliveryMode;
    rawDataURI?: boolean;
}

// deprecate: renamed to getCameraRoll
type optionsGetByMoments = optionsGetCameraRoll;


class CameraRollPhoto {

  /**
   * get photos from CameraRoll together with location and moment data
   * calls (ios/swift) CameraRollLocation.getByMoments() using plugin exec()
   * swift: func getByMoments(from from: NSDate? = nil, to: NSDate? = nil) -> [AnyObject]
   *
   * plugin = window.cordova.plugins.CameraRollLocation
   *
   * @param  {optionsGetCameraRoll}   options {from:, to:, mediaType:, mediaSubtypes: }
   * @param  function NodeCallback    nodejs style callback, i.e. (err, resp)=>{}
   * @return [cameraRollPhoto,]       array of cameraRollPhoto
   */  
  getCameraRoll(
    options: optionsGetCameraRoll
    , callback?: (err:any, resp:any)=>void
  ) : void

  /**
   * get Image as DataURI from CameraRollWithLoc
   * NOTEs:
   *  runs synchronously on a background thread
   *  DataURIs are compatible with WKWebView, more performant scrolling
   * @param uuids: string[] of PHAsset.localIdentifiers
   * @param options:
   *  defaults:
   *    width: 320
   *    height: 240
   *    version: PHImageRequestOptionsVersion.Current
   *    resizeMode: PHImageRequestOptionsResizeMode.Fast
   *    deliveryMode: PHImageRequestOptionsDeliveryMode.fastFormat
   *    rawDataURI: false, add prefix `data:image/jpeg;base64,` to DataURI
   * @return { uuid: DataURI }
   */
  getImage(
    uuids: string[]
    , options: optionsGetImage
    , callback?:  (err:any, resp:any)=>void
  ): Promise<{[key: string]: DataURI;}>

  // deprecate
  getByMoments(
    options: optionsGetByMoments
    , callback: (err:any, resp:any)=>void
  ) : void
}


// javascript
platform.ready().then(() => {
  // Okay, so the platform is ready and our plugins are available.

  const plugin = cordova.plugins.CameraRollLocation;
  const results = plugin.getCameraRoll(
    {
      from: new Date('2016-09-01'),
      to: new Date('2016-09-30')
    }
    , (err, resp) => {
      if (err) return console.error(err)
      if (!resp || !resp.length) return console.info("plugin resp = empty")
      console.info(`plugin getCameraRoll() result[0...5]=${ resp.slice(0,5) }`);
    }
  );

  // or getCameraRoll() with Promises
  plugin.getCameraRoll({
      from: new Date('2016-09-01'),
      to: new Date('2016-09-30')
  })
  .then( result=>{
    console.info(`plugin getCameraRoll() result[0...5]=${ result.slice(0,5) }`);
  })

  // getImage() with Promises
  plugin.getImage(["XXXXXXXX-XXXX-XXXX-XXXX-F25F0864AE01/L0/001"],{
    width: 640,
    height: 480
  })
  .then( result=>{
    IMG.src = result["XXXXXXXX-XXXX-XXXX-XXXX-F25F0864AE01/L0/001"]
  })
});


```

### Sample Data

```
[{
  "uuid": "XXXXXXXX-XXXX-XXXX-XXXX-F25F0864AE01/L0/001",
  "filename": "IMG_0001.JPG",
  "dateTaken": "2016-01-01T09:51:28.446Z",
  "localTime": "2016-01-01 12:51:28.446",
  "mediaType": 1,
  "mediaSubypes": 0,
  "isFavorite": false,
  "width": 286,
  "height": 183,
  "position": {
    "lat": 48.8583736,
    "lng": 2.2922873,
    "speed": 1.54
  },
  "momentId": "XXXXXXXX-XXXX-XXXX-XXXX-1F2FD88BA004/L0/060",
  "momentLocationName": "Paris"
}]
```

## Reset Project Plugins

```
# ionic start myProject --v2
# cd myProject
# ionic plugin remove cordova-plugin-add-swift-support
# ionic plugin add cordova-plugin-add-swift-support --save
ionic plugin remove com-snaphappi-plugin-camera-roll-location;
ionic plugin add cordova-plugin-camera-roll-location;
ionic emulate
```

## License

This software is released under the [Apache 2.0 License][apache2_license].

© 2016 Snaphappi, Inc. All rights reserved

[apache2_license]: http://opensource.org/licenses/Apache-2.0
