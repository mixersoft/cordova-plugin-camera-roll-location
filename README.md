# Cordova `CameraRollLocation` plugin
This cordova plugin provides an API for accessing camera-roll photos with location and 'moment' information.

plugin `id="com-snaphappi-plugin-camera-roll-location"`

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

```javascript
// typescript
interface cameraRollPhoto {
  uuid: string,
  filename: string,
  location: location,
  dateTaken: string, // isoDate
  localTime: string, // YYYY-MM-DD HH:MM:SS.SSS
  mediaType: number,
  mediaSubtype: number,
  momentId?: string,
  momentLocationName?: string
}

interface location {
  type: string,
  coordinates: [number,number]  // [lon, lat]
  speed?: number
}

interface optionsGetByMoments {
  from?: Date,
  to?: Date,
  mediaType?: mediaType,
  mediaSubtype?: mediaSubtype
}

/**
* get photos from CameraRoll together with location and moment data
* calls (ios/swift) CameraRollLocation.getByMoments() using plugin exec()
* swift: func getByMoments(from from: NSDate? = nil, to: NSDate? = nil) -> [AnyObject]
*
* plugin = window.cordova.plugins.CameraRollLocation
*
* @param  {optionsGetByMoments}    options {from:, to:, mediaType:, mediaSubtypes: }
* @param  function NodeCallback    nodejs style callback, i.e. (err, resp)=>{}
* @return [cameraRollPhoto,]       array of cameraRollPhoto
*/
class CameraRollPhoto {
    getByMoments(
      options: optionsGetByMoments
      , callback: (err:any, resp:any)=>void
    ) : void
}


// javascript
platform.ready().then(() => {
  // Okay, so the platform is ready and our plugins are available.

  const plugin = cordova.plugins.CameraRollLocation;
  const results = plugin.getByMoments(
    {
      from: new Date('2016-09-01'),
      to: new Date('2016-09-30')
    }
    , (err, resp) => {
      if (err) return console.error(err)
      if (!resp || !resp.length) return console.info("plugin resp = empty")
      console.info(`plugin getByMoments() result[0...5]=${ resp.slice(0,5) }`);
    }
  );

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
  "location": {
    "type": "Point",
    "coordinates": [
      23.3138,
      42.6704
    ],
    "speed": 1.54
  },
  "momentId": "XXXXXXXX-XXXX-XXXX-XXXX-1F2FD88BA004/L0/060",
  "momentLocationName": "Sofia"
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
