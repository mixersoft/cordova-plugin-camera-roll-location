/*
 * Copyright (c) 2016 by Snaphappi, Inc. All rights reserved.
 *
 * @SNAPHAPPI_LICENSE_HEADER_START@
 *
 * This file contains Original Code and/or Modifications of Original Code
 * as defined in and that are subject to the Apache License
 * Version 2.0 (the 'License'). You may not use this file except in
 * compliance with the License. Please obtain a copy of the License at
 * http://opensource.org/licenses/Apache-2.0/ and read it before using this
 * file.
 *
 * The Original Code and all software distributed under the License are
 * distributed on an 'AS IS' basis, WITHOUT WARRANTY OF ANY KIND, EITHER
 * EXPRESS OR IMPLIED, AND APPLE HEREBY DISCLAIMS ALL SUCH WARRANTIES,
 * INCLUDING WITHOUT LIMITATION, ANY WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE, QUIET ENJOYMENT OR NON-INFRINGEMENT.
 * Please see the License for the specific language governing rights and
 * limitations under the License.
 *
 * @SNAPHAPPI_LICENSE_HEADER_END@
 */
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};


var location_helper_1 = exports;
var camera_roll_service_1 = exports;

// define("location-helper", ["require", "exports"], function (require, exports) {
//     "use strict";
    function round(v, precision) {
        if (precision === void 0) { precision = 6; }
        var scale = Math.pow(10, precision);
        return Math.round(v * scale) / scale;
    }
    exports.round = round;
    function isGeoJson(obj) {
        if (obj == undefined)
            return false;
        var type = obj.type, coordinates = obj.coordinates;
        return typeof type === 'string'
            && coordinates instanceof Array
            && typeof coordinates[0] === 'number'
            && typeof coordinates[1] === 'number';
    }
    exports.isGeoJson = isGeoJson;
    var GeoJsonBase = (function () {
        function GeoJsonBase(type, coordinates) {
            this.type = type;
            this.coordinates = coordinates;
            this._mathRound = round;
        }
        GeoJsonBase.prototype.longitude = function () {
            return this.coordinates[0];
        };
        GeoJsonBase.prototype.latitude = function () {
            return this.coordinates[1];
        };
        // google.maps.LatLngLiteral
        GeoJsonBase.prototype.toLatLng = function () {
            return {
                lat: this.coordinates[1],
                lng: this.coordinates[0]
            };
        };
        /**
         * return [lon,lat] as decimals rounded to the 'precision' digits
         *    - google maps only uses 6 significant digits
         * @param  {int} precision [description]
         * @return {[number,number]}  [lon,lat]
         */
        GeoJsonBase.prototype.getLonLat = function (precision) {
            var _this = this;
            if (precision === void 0) { precision = 6; }
            var rounded = this.coordinates.map(function (v) { return _this._mathRound(v, precision); });
            return rounded;
        };
        return GeoJsonBase;
    }());
    exports.GeoJsonBase = GeoJsonBase;
    var GeoJsonPoint = (function (_super) {
        __extends(GeoJsonPoint, _super);
        /**
         * overloading constructors or using union types
         */
        // constructor ( obj : GeoJson)
        // constructor ( obj : [number, number])
        // constructor ( obj : any)
        function GeoJsonPoint(obj) {
            var _this;
            if (obj instanceof Array) {
                var longitude = obj[0], latitude = obj[1];
                _this = _super.call(this, "Point", [longitude, latitude]) || this;
                return;
            }
            else {
                // must be type GeoJson
                var type = obj.type, coordinates = obj.coordinates;
                if (type != 'Point')
                    throw new Error("Error, expecting type=Point");
                if (type && coordinates) {
                    _this = _super.call(this, type, coordinates) || this;
                    return;
                }
            }
            return _this;
        }
        GeoJsonPoint.fromJson = function (_a) {
            var type = _a.type, coordinates = _a.coordinates;
            if (type != 'Point')
                throw new Error("Error, expecting type=Point");
            var longitude = coordinates[0], latitude = coordinates[1];
            return new GeoJsonPoint([longitude, latitude]);
        };
        return GeoJsonPoint;
    }(GeoJsonBase));
    exports.GeoJsonPoint = GeoJsonPoint;
    /**
     * use GpsRegion and subclasses to checking if a GeoJsonPoint is "nearby",
     * i.e. GpsRegion.contains( GeoJsonPoint )
     */
    var GpsRegion = (function () {
        function GpsRegion() {
        }
        /**
         * returns true if the GpsRegion contains the provided GeoJsonPoint
         * @param  {GeoJsonPoint} point
         * @return {boolean}
         */
        GpsRegion.prototype.contains = function (point) {
            var _a = point.coordinates, lonA = _a[0], latA = _a[1];
            var sides = this.boundaries();
            if ((latA - sides['top']) > 0)
                return false;
            if ((latA - sides['bottom']) < 0)
                return false;
            // does this work with box.lon > 180?
            if ((lonA - sides['right']) > 0)
                return false;
            if ((lonA - sides['left']) < 0)
                return false;
            // console.log(`check if lat: ${sides['bottom']} < ${latA} < ${sides['top']} `)
            // console.log(`check if lon: ${sides['left']} < ${lonA} < ${sides['right']} `)
            return true;
        };
        return GpsRegion;
    }());
    exports.GpsRegion = GpsRegion;
    var RectangularGpsRegion = (function (_super) {
        __extends(RectangularGpsRegion, _super);
        function RectangularGpsRegion(sides) {
            var _this = _super.call(this) || this;
            _this.sides = sides;
            return _this;
        }
        RectangularGpsRegion.prototype.boundaries = function () {
            return this.sides;
        };
        return RectangularGpsRegion;
    }(GpsRegion));
    exports.RectangularGpsRegion = RectangularGpsRegion;
    /**
     * uses a bounding square to determine contains()
     *  - square is centered on point with length = 2 * distance
     */
    var CircularGpsRegion = (function (_super) {
        __extends(CircularGpsRegion, _super);
        function CircularGpsRegion(point, distance) {
            var _this = _super.call(this) || this;
            _this.point = point;
            _this.distance = distance;
            return _this;
        }
        CircularGpsRegion.prototype.boundaries = function () {
            var boundingBox = getGpsBoundingBoxFromCircle(this.point.coordinates, this.distance).sides;
            return boundingBox;
        };
        return CircularGpsRegion;
    }(GpsRegion));
    exports.CircularGpsRegion = CircularGpsRegion;
    /**
     * getGpsBoundingBoxFromCircle() - get a boundingBox by GPS coordinates from a proscribed circle
     * @param  [number,number]  [lon, lat]      center expressed as [lon, lat] in decimals
     * @param  {number}  distance               distance in meters from center
     * @return {sides: GpsSides, corners: GpsCorners}   Object describing boundaries as GPS coordinates
     */
    function getGpsBoundingBoxFromCircle(_a, distance) {
        var lon = _a[0], lat = _a[1];
        var latRadian = lat * Math.PI / 180;
        var degLatKm = 110.574235;
        var degLongKm = 110.572833 * Math.cos(latRadian);
        var deltaLat = distance / 1000.0 / degLatKm;
        var deltaLong = distance / 1000.0 / degLongKm;
        var topLat = lat + deltaLat;
        var bottomLat = lat - deltaLat;
        var leftLng = lon - deltaLong;
        var rightLng = lon + deltaLong;
        var boundary = { top: topLat, right: rightLng, bottom: bottomLat, left: leftLng };
        // [lon,lat]
        var northWestCoords = [leftLng, topLat];
        var northEastCoords = [rightLng, topLat];
        var southWestCoords = [leftLng, bottomLat];
        var southEastCoords = [rightLng, bottomLat];
        var boundingBox = [northWestCoords, northEastCoords, southEastCoords, southWestCoords];
        return { sides: boundary, corners: boundingBox };
    }
    function distanceBetweenLatLng(p1, p2) {
        if (!p1 || !p2) {
            return 0;
        }
        var lng1, lat1, lng2, lat2;
        if (isGeoJson(p1)) {
            _a = p1.coordinates, lng1 = _a[0], lat1 = _a[1];
        }
        else {
            lng1 = p1.lng();
            lat1 = p1.lat();
        }
        if (isGeoJson(p2)) {
            _b = p2.coordinates, lng2 = _b[0], lat2 = _b[1];
        }
        else {
            lng2 = p2.lng();
            lat2 = p2.lat();
        }
        var R = 6371000; // Radius of the Earth in m
        var dLat = (lat2 - lat1) * Math.PI / 180;
        var dLon = (lng2 - lng1) * Math.PI / 180;
        var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                Math.sin(dLon / 2) * Math.sin(dLon / 2);
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        var d = R * c;
        return d;
        var _a, _b;
    }
    exports.distanceBetweenLatLng = distanceBetweenLatLng;
    ;
// });
// define("camera-roll.types", ["require", "exports"], function (require, exports) {
//     "use strict";
    /**
     * PHAssetMediaType
     * iOS
     * see: https://developer.apple.com/reference/photos/phasset
     */
    var mediaType;
    (function (mediaType) {
        mediaType[mediaType["Unknown"] = 0] = "Unknown";
        mediaType[mediaType["Image"] = 1] = "Image";
        mediaType[mediaType["Video"] = 2] = "Video";
        mediaType[mediaType["Audio"] = 3] = "Audio";
    })(mediaType = exports.mediaType || (exports.mediaType = {}));
    /**
     * PHAssetMediaSubtype
     */
    var mediaSubtype;
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
    })(mediaSubtype = exports.mediaSubtype || (exports.mediaSubtype = {}));
    /**
     * PHImageRequestOptions
     * iOS
     * see: https://developer.apple.com/reference/photos/phimagerequestoptions
     */
    var PHImageRequestOptionsVersion;
    (function (PHImageRequestOptionsVersion) {
        PHImageRequestOptionsVersion[PHImageRequestOptionsVersion["Current"] = 0] = "Current";
        PHImageRequestOptionsVersion[PHImageRequestOptionsVersion["Unadjusted"] = 1] = "Unadjusted";
        PHImageRequestOptionsVersion[PHImageRequestOptionsVersion["Original"] = 2] = "Original";
    })(PHImageRequestOptionsVersion = exports.PHImageRequestOptionsVersion || (exports.PHImageRequestOptionsVersion = {}));
    /**
     * PHImageRequestOptions
     * iOS
     * see: https://developer.apple.com/reference/photos/phimagerequestoptions
     */
    var PHImageRequestOptionsResizeMode;
    (function (PHImageRequestOptionsResizeMode) {
        PHImageRequestOptionsResizeMode[PHImageRequestOptionsResizeMode["None"] = 0] = "None";
        PHImageRequestOptionsResizeMode[PHImageRequestOptionsResizeMode["Fast"] = 1] = "Fast";
        PHImageRequestOptionsResizeMode[PHImageRequestOptionsResizeMode["Exact"] = 2] = "Exact";
    })(PHImageRequestOptionsResizeMode = exports.PHImageRequestOptionsResizeMode || (exports.PHImageRequestOptionsResizeMode = {}));
    /**
     * PHImageRequestOptions
     * iOS
     * see: https://developer.apple.com/reference/photos/phimagerequestoptions
     */
    var PHImageRequestOptionsDeliveryMode;
    (function (PHImageRequestOptionsDeliveryMode) {
        PHImageRequestOptionsDeliveryMode[PHImageRequestOptionsDeliveryMode["Opportunistic"] = 0] = "Opportunistic";
        PHImageRequestOptionsDeliveryMode[PHImageRequestOptionsDeliveryMode["HighQualityFormat"] = 1] = "HighQualityFormat";
        PHImageRequestOptionsDeliveryMode[PHImageRequestOptionsDeliveryMode["fastFormat"] = 2] = "fastFormat";
    })(PHImageRequestOptionsDeliveryMode = exports.PHImageRequestOptionsDeliveryMode || (exports.PHImageRequestOptionsDeliveryMode = {}));
// });
// define("camera-roll.service", ["require", "exports", "location-helper"], function (require, exports, location_helper_1) {
//     "use strict";
    exec = require('cordova/exec');
    var PLUGIN_KEY = "cordova.plugins.CameraRollLocation";
    function _localTimeAsDate(localTime) {
        try {
            var dt = new Date(localTime);
            if (isNaN(dt) == false)
                return dt;
            // BUG: Safari does not parse time strings to Date correctly  
            var _a = localTime.match(/(.*)\s(\d*):(\d*):(\d*)\./), d = _a[1], h = _a[2], m = _a[3], s = _a[4];
            dt = new Date(d);
            dt.setHours(parseInt(h), parseInt(m), parseInt(s));
            // console.log(`localTimeAsDate=${dt.toISOString()}`)
            return dt;
        }
        catch (err) {
            throw new Error("Invalid localTime string, value=" + localTime);
        }
    }
    var CameraRollWithLoc = (function () {
        function CameraRollWithLoc() {
            this._photos = [];
            this._filter = {};
        }
        CameraRollWithLoc.sortPhotos = function (photos, options, replace) {
            if (options === void 0) { options = [{ key: 'dateTaken', descending: false }]; }
            if (replace === void 0) { replace = true; }
            // TODO: only use first sort option right now
            var sort = options[0];
            // console.log(`>>> _keys(_): ${_keys(_).slice(10,20)}`);
            // const sorted = _sortBy( photos, (o) => {
            //   return (o as any)[ sort.key ]
            // });
            // if (sort.descending) sorted.reverse();
            //
            var sorted = Array.from(photos);
            var desc = sort.descending ? -1 : 1;
            sorted.sort(function () {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                var _a = args.map(function (o) {
                    var value = o[sort.key];
                    if (typeof value == "string")
                        value = value.toUpperCase();
                    return value;
                }), valueA = _a[0], valueB = _a[1];
                if (valueA < valueB)
                    return -1 * desc;
                if (valueA > valueB)
                    return 1 * desc;
                if (valueA == valueB)
                    return 0;
            });
            return sorted;
        };
        CameraRollWithLoc.groupPhotos = function (photos, options) {
            var MAX_DELTA = {
                time: 300,
                distance: 10 // meters
            };
            var sortedPhotos = CameraRollWithLoc.sortPhotos(photos, [{ key: 'dateTaken', descending: false }]);
            var grouped = [];
            var _counter = {
                prev: undefined,
                cur: undefined,
                next: undefined,
            };
            var _deltas = function (photos, i) {
                var result;
                _counter.prev = _counter.cur || undefined;
                _counter.cur = _counter.next || new Date(photos[i].dateTaken);
                _counter.next = i < photos.length - 1 ? new Date(photos[i + 1].dateTaken) : undefined;
                if (_counter.prev && !_counter.next)
                    result = [(_counter.cur - _counter.prev) / 1000, photos[i], 99999];
                else if (!_counter.prev && _counter.next)
                    result = [99999, photos[i], (_counter.next - _counter.cur) / 1000];
                else
                    result = [
                        (_counter.cur - _counter.prev) / 1000,
                        photos[i],
                        (_counter.next - _counter.cur) / 1000
                    ];
                return result;
            };
            var Decode;
            (function (Decode) {
                Decode[Decode["Before"] = 0] = "Before";
                Decode[Decode["Photo"] = 1] = "Photo";
                Decode[Decode["After"] = 2] = "After";
            })(Decode || (Decode = {}));
            var photoGroup;
            sortedPhotos.forEach(function (o, i, l) {
                var d = _deltas(l, i);
                if (d[0] > MAX_DELTA.time && d[2] > MAX_DELTA.time) {
                    // singleton
                    grouped["" + i] = d[1];
                }
                else if (d[0] <= MAX_DELTA.time && d[2] > MAX_DELTA.time) {
                    // last of group
                    photoGroup.push(d[1]);
                    // grouped[ `${i - photoGroup.length}, ${photoGroup.length}` ] = photoGroup;
                    photoGroup = [];
                }
                else if (d[0] > MAX_DELTA.time && d[2] <= MAX_DELTA.time) {
                    // first of group
                    photoGroup = [d[1]];
                    grouped["" + i] = photoGroup;
                }
                else {
                    // check distance between
                    var tail = photoGroup[photoGroup.length - 1];
                    var distance = location_helper_1.distanceBetweenLatLng(tail.location, d[1].location);
                    if (distance < MAX_DELTA.distance)
                        photoGroup.push(d[1]);
                    else {
                        // console.info(`location moved, close group, i=${grouped['indexOf'](photoGroup)}, length=${photoGroup.length}`);
                        photoGroup = [d[1]];
                        grouped["" + i] = photoGroup;
                    }
                }
            });
            return grouped;
        };
        /**
         * get cameraRollPhoto[] from CameraRoll using Plugin,
         * uses cached values by default, ignore with force==true
         * filter later in JS
         * @param  {optionsQuery}                  interface optionsQuery
         * @param  {boolean = false}      refresh
         * @return {Promise<cameraRollPhoto[]>}         [description]
         */
        CameraRollWithLoc.prototype.queryPhotos = function (options, force) {
            var _this = this;
            if (force === void 0) { force = false; }
            if (!this._isGettingCameraRoll && this._photos.length && !options && force == false) {
                // resolve immediately with cached value
                return Promise.resolve(this._photos);
            }
            if (this._isGettingCameraRoll && !options && force == false) {
                // wait for promise to resolve
                return this._isGettingCameraRoll;
            }
            if (options == undefined)
                options = {};
            var context;
            var plugin;
            if (typeof exec == "function")
                context = 'cordova';
            else {
                plugin = window && window.cordova && window.cordova.plugins && window.cordova.plugins.CameraRollLocation;
                if (plugin)
                    context = 'plugin';
            }
            switch (context) {
                case 'cordova':
                    // const args0 = _pick(options, ["from", "to", "mediaType", "mediaSubType"]);
                    var args0_1 = {};
                    ["from", "to", "mediaType", "mediaSubType"].forEach(function (k) {
                        if (options.hasOwnProperty(k) && options[k] != undefined)
                            args0_1[k] = options[k];
                    });
                    // map startDate=>from, endDate=>to as a convenience
                    if (options && !options.from && options['startDate'])
                        options.from = options['startDate'];
                    if (options && !options.to && options['endDate'])
                        options.to = options['endDate'];
                    var methodName_1 = "getCameraRoll";
                    this._isGettingCameraRoll = new Promise(function (resolve, reject) {
                        // cordova.exec()
                        exec(resolve, reject, "cameraRollLocation", methodName_1, [args0_1]);
                    })
                        .then(function (result) {
                        try {
                            if (result == undefined)
                                result = "[]";
                            var data = JSON.parse(result);
                            return Promise.resolve(data);
                        }
                        catch (err) {
                            return Promise.reject({ error: err, response: result });
                        }
                    });
                    break;
                case 'plugin':
                    this._isGettingCameraRoll = plugin.getCameraRoll(options);
                    break;
                default:
                    if (!cameraRollAsJsonString) {
                        this._isGettingCameraRoll = Promise.reject("ERROR: cordova plugin error, cordova not available??!?");
                    }
                    else {
                        if (!this._photos.length) {
                            console.warn("cordova.plugins.CameraRollLocation not available, using sample data");
                            try {
                                var parsed = JSON.parse(cameraRollAsJsonString);
                                this._photos = parsed;
                            }
                            catch (e) {
                                console.error("Error parsing JSON");
                            }
                        }
                        this._isGettingCameraRoll = Promise.resolve(this._photos);
                    }
                    break;
            }
            return this._isGettingCameraRoll.then(function (photos) {
                photos.forEach(function (o) {
                    if (o.localTime && typeof o.localTime == "string") {
                        o.localTime = _localTimeAsDate(o.localTime);
                    }
                    // deprecate
                    if (o.location && o.location instanceof location_helper_1.GeoJsonPoint == false) {
                        o.location = new location_helper_1.GeoJsonPoint(o.location);
                    }
                });
                _this._isGettingCameraRoll = null;
                return _this._photos = photos;
            });
        };
        /**
         * filter photos in cameraRoll
         * @param  {optionsFilter}          {startDate:, endDate, locationName, mediaType}
         * @param  {boolean        = true}        replace, replaces existing filter by default
         *    use replace=false to merge with current filter
         * @return Promise<cameraRollPhoto[]>
         */
        CameraRollWithLoc.prototype.filterPhotos = function (options, replace) {
            if (options === void 0) { options = {}; }
            if (replace === void 0) { replace = true; }
            if (replace) {
                Object.assign(this._filter, options);
            }
            else {
                this._filter = options;
            }
            var _a = this._filter, from = _a.startDate, to = _a.endDate, locationName = _a.locationName, mediaType = _a.mediaType, isFavorite = _a.isFavorite, near = _a.near, containsFn = _a.containsFn, bounds = _a.bounds;
            var result = this._photos;
            // cache value outside filter() loop
            var gpsRegion;
            // from, to expressed in localTime via from = new Date([date string])
            // let fromAsLocalTime = new Date(from.valueOf() - from.getTimezoneOffset()*60000).toJSON()
            result = result.filter(function (o) {
                // filter on localTime
                if (from && _localTimeAsDate(o['localTime']) < from)
                    return false;
                if (to && _localTimeAsDate(o['localTime']) > to)
                    return false;
                if (locationName
                    && false === o['momentLocationName'].startsWith(locationName))
                    return false;
                if (mediaType && mediaType.indexOf(o['mediaType']) == -1)
                    return false;
                if (isFavorite && false === o['isFavorite'])
                    return false;
                if (near) {
                    if (!o['location'])
                        return false;
                    gpsRegion = gpsRegion || new location_helper_1.CircularGpsRegion(near.point, near.distance);
                    var loc = new location_helper_1.GeoJsonPoint(o['location'].coordinates);
                    if (gpsRegion.contains(loc) == false)
                        return false;
                }
                if (typeof containsFn == "function"
                    && containsFn(o['location']) == false)
                    return false;
                if (bounds && typeof bounds.contains == "function"
                    && bounds.contains(o['location']) == false) {
                    return false;
                }
                // everything good
                return true;
            });
            this._filteredPhotos = result || [];
            return Promise.resolve(this._filteredPhotos);
        };
        /**
         * Sort Photos
         * @param  {optionsSort}       options  {key:, descending:}
         * @return Promise<cameraRollPhoto[]>
         */
        CameraRollWithLoc.prototype.sortPhotos = function (options, replace) {
            if (options === void 0) { options = [{ key: 'dateTaken', descending: true }]; }
            if (replace === void 0) { replace = true; }
            // call static method
            this._filteredPhotos = CameraRollWithLoc.sortPhotos(this._filteredPhotos, options, replace);
            return Promise.resolve(this._filteredPhotos);
        };
        /**
         * cluster photos by dateTaken+location
         * @param  {any} options [description]
         * @return {any}         [description]
         */
        CameraRollWithLoc.prototype.groupPhotos = function (options) {
            var copyOfPhotos = Array.from(this._filteredPhotos);
            // call static method
            var grouped = CameraRollWithLoc.groupPhotos(copyOfPhotos, options);
            console.log(Object.keys(grouped));
            return grouped;
        };
        CameraRollWithLoc.prototype.getPhotos = function (limit) {
            if (limit === void 0) { limit = 10; }
            var result = this._filteredPhotos || this._photos || [];
            if (!result.length) {
                console.warn("CameraRoll: no photos found. check query/filter");
            }
            result = result.slice(0, limit);
            result.forEach(function (o) {
                if (o.localTime && typeof o.localTime == "string") {
                    o.localTime = _localTimeAsDate(o.localTime);
                }
                // deprecate
                if (o.location instanceof location_helper_1.GeoJsonPoint == false) {
                    o.location = new location_helper_1.GeoJsonPoint(o.location);
                }
            });
            return result;
        };
        /**
         * get ImageData as DataURI from CameraRoll using Plugin,
         * @param  {optionsGetImage}      interface optionsGetImage
         * @param  callback               interface NodeCallback
         * @return {Promise<cameraRollPhoto[]>}         [description]
         */
        CameraRollWithLoc.prototype.getImage = function (uuids, options) {
            if (uuids === void 0) { uuids = []; }
            if (options === void 0) { options = {}; }
            var context;
            var plugin;
            if (typeof exec == "function")
                context = 'cordova';
            else {
                plugin = window && window.cordova && window.cordova.plugins && window.cordova.plugins.CameraRollLocation;
                if (plugin)
                    context = 'plugin';
            }
            switch (context) {
                case 'cordova':
                    var args0_2 = {};
                    ["width", "height", "version", "resizeMode", "deliveryMode", "quality", "rawDataURI"].forEach(function (k) {
                        if (options.hasOwnProperty(k) && options[k] != undefined)
                            args0_2[k] = options[k];
                    });
                    var methodName_2 = "getImage";
                    return new Promise(function (resolve, reject) {
                        // cordova.exec()
                        exec(resolve, reject, "cameraRollLocation", methodName_2, [uuids, args0_2]);
                    })
                        .then(function (result) {
                        try {
                            if (result == undefined)
                                result = {};
                            var someValid = Object.keys(result).some(function (k) {
                                // at least one DataURI is valid
                                return result[k].startsWith("error:") == false;
                            });
                            if (!args0_2["rawDataURI"]) {
                                var base64prefix_1 = "data:image/jpeg;base64,";
                                Object.keys(result).forEach(function (k) {
                                    if (result[k].startsWith("error:") == false) {
                                        result[k] = base64prefix_1 + result[k];
                                    }
                                });
                            }
                            if (someValid)
                                return Promise.resolve(result);
                            else
                                return Promise.reject({ error: "invalid DataURIs", response: result });
                        }
                        catch (err) {
                            return Promise.reject({ error: err, response: result });
                        }
                    });
                case 'plugin':
                    return plugin.getImage(uuids, options);
                default:
                    return Promise.reject("WARNING: getImage() not available from browser");
            }
        };
        return CameraRollWithLoc;
    }());
    exports.CameraRollWithLoc = CameraRollWithLoc;
// });
// define("cordova-plugin", ["require", "exports", "camera-roll.service"], function (require, exports, camera_roll_service_1) {
//     "use strict";

    /**
     * instantiate CameraRollWithLoc() and use in Cordova plugin method: getByMoments()
     */
    var plugin = new camera_roll_service_1.CameraRollWithLoc();
    /**
     * This is the ACTUAL cordova plugin method call
     * plugin method wrapper for CameraRollWithLoc class
     * calls (ios/swift) CameraRollLocation.getByMoments() using plugin exec
     * swift: func getByMoments(from from: NSDate? = nil, to: NSDate? = nil) -> [PhotoWithLoc]
     *
     * @param  {optionsGetCameraRoll}   options {from:, to: mediaType: mediaSubtypes: }
     * @param  callback()              OPTIONAL nodejs style callback, i.e. (err, resp)=>{}
     * @return Promise() or void       returns a Promise if callback is NOT provided
     */
    function getCameraRoll(options, callback) {
        var promise = plugin.queryPhotos(options);
        if (typeof callback == "function") {
            promise.then(function (result) {
                callback(null, result);
                return result;
            }, function (err) {
                callback(err, undefined);
                return Promise.reject(err);
            });
        }
        return promise;
    }
    exports.getCameraRoll = getCameraRoll;
    /**
     * get Image as DataURI from CameraRollWithLoc
     * NOTEs:
     *  runs synchronously on a background thread
     *  DataURIs are compatible with WKWebView, more performant scrolling
     * @param uuids: string[] of PHAsset.localIdentifiers
     * @return { uuid: dataURI: string}
     */
    function getImage(uuids, options, callback) {
        var promise = plugin.getImage(uuids, options);
        if (typeof callback == "function") {
            promise.then(function (result) {
                callback(null, result);
                return result;
            }, function (err) {
                callback(err, undefined);
                return Promise.reject(err);
            });
        }
        return promise;
    }
    exports.getImage = getImage;
    // deprecate
    function getByMoments(options, callback) {
        return getCameraRoll(options, callback);
    }
    exports.getByMoments = getByMoments;


// });