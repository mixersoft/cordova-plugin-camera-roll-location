# camera-roll-location
This cordova plugin defines a global `window.CameraRollLocation` object which provides an API for accessing camera-roll photos with location information.

`plugin id="com-snaphappi-plugins-camera-roll-location" `

## Installation

tested on `ios` in the following configuration

```
Cordova CLI: 5.4.1
Gulp version:  CLI version 3.9.1
Gulp local:   Local version 3.9.1
Ionic CLI Version: 1.7.15
Ionic App Lib Version: 0.7.2
ios-deploy version: 1.8.2
ios-sim version: 5.0.3
OS: Mac OS X El Capitan
Node Version: v4.0.0
Xcode version: Xcode 7.3 Build version 7D175
```

```
ionic plugin add cordova-plugin-add-swift-support --save
# ionic plugin remove com-snaphappi-plugins-camera-roll-location;
ionic plugin add /dev.snaphappi.com/_xcode/CameraRollLocation
```

## Usage

```typescript
// typescript
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
