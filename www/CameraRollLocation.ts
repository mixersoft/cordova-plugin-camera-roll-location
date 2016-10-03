declare module "location-helper" {
    import { LatLng } from "camera-roll.types";
    export function round(v: number, precision?: number): number;
    export interface GeoJson {
        type: string;
        coordinates: [number, number];
    }
    export function isGeoJson(obj: any): obj is GeoJson;
    export abstract class GeoJsonBase {
        type: string;
        coordinates: [number, number];
        protected _mathRound: typeof round;
        constructor(type: string, coordinates: [number, number]);
        longitude(): number;
        latitude(): number;
        toLatLng(): {
            lat: number;
            lng: number;
        };
        /**
         * return [lon,lat] as decimals rounded to the 'precision' digits
         *    - google maps only uses 6 significant digits
         * @param  {int} precision [description]
         * @return {[number,number]}  [lon,lat]
         */
        getLonLat(precision?: number): [number, number];
    }
    export class GeoJsonPoint extends GeoJsonBase {
        static fromJson({type, coordinates}: GeoJson): GeoJsonPoint;
        /**
         * overloading constructors or using union types
         */
        constructor(obj: GeoJson | [number, number]);
    }
    /**
     * use GpsRegion and subclasses to checking if a GeoJsonPoint is "nearby",
     * i.e. GpsRegion.contains( GeoJsonPoint )
     */
    export abstract class GpsRegion {
        protected abstract boundaries(): GpsSides;
        /**
         * returns true if the GpsRegion contains the provided GeoJsonPoint
         * @param  {GeoJsonPoint} point
         * @return {boolean}
         */
        contains(point: GeoJsonPoint): boolean;
    }
    export class RectangularGpsRegion extends GpsRegion {
        sides: GpsSides;
        constructor(sides: GpsSides);
        protected boundaries(): GpsSides;
    }
    /**
     * uses a bounding square to determine contains()
     *  - square is centered on point with length = 2 * distance
     */
    export class CircularGpsRegion extends GpsRegion {
        point: GeoJsonPoint;
        distance: number;
        constructor(point: GeoJsonPoint, distance: number);
        protected boundaries(): GpsSides;
    }
    /**
     * get a boundingBox by GPS coordinates from a proscribed circle
     * see: http://stackoverflow.com/questions/33232008/javascript-calcualate-the-geo-coordinate-points-of-four-corners-around-a-cente
     */
    export interface GpsSides {
        top: number;
        right: number;
        bottom: number;
        left: number;
    }
    export interface GpsCorners {
        0: [number, number];
        1: [number, number];
        2: [number, number];
        3: [number, number];
    }
    /**
     * from package: js-marker-clusterer
     * Calculates the distance between two latlng locations in km.
     * @see http://www.movable-type.co.uk/scripts/latlong.html
     *
     * @param {google.maps.LatLng} p1 The first lat lng point.
     * @param {google.maps.LatLng} p2 The second lat lng point.
     * @return {number} The distance between the two points in m.
     * @private
    */
    export function distanceBetweenLatLng(p1: GeoJsonPoint, p2: GeoJsonPoint): number;
    export function distanceBetweenLatLng(p1: LatLng, p2: LatLng): number;
}
declare module "camera-roll.types" {
    import { GeoJson, GeoJsonPoint } from "location-helper";
    export interface optionsPlugin {
        from?: Date;
        to?: Date;
        mediaType?: mediaType;
        mediaSubtype?: mediaSubtype;
    }
    export interface optionsFilter {
        startDate?: Date;
        endDate?: Date;
        locationName?: string;
        mediaType?: mediaType[];
        isFavorite?: boolean;
        near?: {
            point: GeoJsonPoint;
            distance: number;
        };
        containsFn?: (location: GeoJson) => boolean;
        bounds?: LatLngBounds;
    }
    export interface optionsSort {
        key: string;
        descending?: boolean;
    }
    export interface cameraRollPhoto {
        uuid: string;
        filename: string;
        location: GeoJsonPoint;
        dateTaken: string;
        localTime: string;
        mediaType: number;
        mediaSubtype: number;
        momentId?: string;
        momentLocationName?: string;
    }
    export interface optionsGetByMoments {
        from?: Date;
        to?: Date;
        mediaType?: mediaType;
        mediaSubtype?: mediaSubtype;
    }
    export interface NodeCallback {
        (err: any, data: any): void;
    }
    /**
     * A LatLng is a point in geographical coordinates: latitude and longitude.
     *
     * * Latitude ranges between -90 and 90 degrees, inclusive. Values above or
     *   below this range will be clamped to the range [-90, 90]. This means
     *   that if the value specified is less than -90, it will be set to -90.
     *   And if the value is greater than 90, it will be set to 90.
     * * Longitude ranges between -180 and 180 degrees, inclusive. Values above
     *   or below this range will be wrapped so that they fall within the
     *   range. For example, a value of -190 will be converted to 170. A value
     *   of 190 will be converted to -170. This reflects the fact that
     *   longitudes wrap around the globe.
     *
     * Although the default map projection associates longitude with the
     * x-coordinate of the map, and latitude with the y-coordinate, the
     * latitude coordinate is always written first, followed by the longitude.
     * Notice that you cannot modify the coordinates of a LatLng. If you want
     * to compute another point, you have to create a new one.
     */
    export interface LatLng {
        /**
         * Creates a LatLng object representing a geographic point.
         * Note the ordering of latitude and longitude.
         * @param lat Latitude is specified in degrees within the range [-90, 90].
         * @param lng Longitude is specified in degrees within the range [-180, 180].
         * @param noWrap Set noWrap to true to enable values outside of this range.
         */
        /** Comparison function. */
        equals(other: LatLng): boolean;
        /** Returns the latitude in degrees. */
        lat(): number;
        /** Returns the longitude in degrees. */
        lng(): number;
        /** Converts to string representation. */
        toString(): string;
        /** Returns a string of the form "lat,lng". We round the lat/lng values to 6 decimal places by default. */
        toUrlValue(precision?: number): string;
    }
    export type LatLngLiteral = {
        lat: number;
        lng: number;
    };
    export type LatLngBoundsLiteral = {
        east: number;
        north: number;
        south: number;
        west: number;
    };
    export interface LatLngBounds {
        contains(latLng: LatLng): boolean;
        equals(other: LatLngBounds | LatLngBoundsLiteral): boolean;
        extend(point: LatLng): LatLngBounds;
        getCenter(): LatLng;
        getNorthEast(): LatLng;
        getSouthWest(): LatLng;
        intersects(other: LatLngBounds | LatLngBoundsLiteral): boolean;
        isEmpty(): boolean;
        toSpan(): LatLng;
        toString(): string;
        toUrlValue(precision?: number): string;
        union(other: LatLngBounds | LatLngBoundsLiteral): LatLngBounds;
    }
    export interface Point {
        /** A point on a two-dimensional plane. */
        /** The X coordinate */
        x: number;
        /** The Y coordinate */
        y: number;
        /** Compares two Points */
        equals(other: Point): boolean;
        /** Returns a string representation of this Point. */
        toString(): string;
    }
    export interface Size {
        height: number;
        width: number;
        equals(other: Size): boolean;
        toString(): string;
    }
    /**
     * PHAssetMediaType
     * iOS
     * see: https://developer.apple.com/reference/photos/phasset
     */
    export enum mediaType {
        Unknown = 0,
        Image = 1,
        Video = 2,
        Audio = 3,
    }
    /**
     * PHAssetMediaSubtype
     */
    export enum mediaSubtype {
        None = 0,
        PhotoPanorama = 1,
        PhotoHDR = 2,
        PhotoScreenshot = 4,
        PhotoLive = 8,
        VideoStreamed = 16,
        VideoHighFrameRate = 32,
        VideoTimelapse = 64,
    }
}
declare module "camera-roll.service" {
    import { optionsFilter, optionsSort, cameraRollPhoto } from "camera-roll.types";
    export class CameraRollWithLoc {
        protected _photos: cameraRollPhoto[];
        protected _filter: optionsFilter;
        protected _filteredPhotos: cameraRollPhoto[];
        static sortPhotos(photos: cameraRollPhoto[], options?: optionsSort[], replace?: boolean): cameraRollPhoto[];
        static groupPhotos(photos: cameraRollPhoto[], options?: any): any;
        constructor();
        /**
         * get cameraRollPhoto[] from CameraRoll using Plugin,
         * uses cached values by default, ignore with force==true
         * filter later in JS
         * @param  {any}                  interface optionsFilter
         * @param  {boolean = false}      refresh
         * @return {Promise<cameraRollPhoto[]>}         [description]
         */
        queryPhotos(options?: any, force?: boolean): Promise<cameraRollPhoto[]>;
        /**
         * filter photos in cameraRoll
         * @param  {optionsFilter}          {startDate:, endDate, locationName, mediaType}
         * @param  {boolean        = true}        replace, replaces existing filter by default
         *    use replace=false to merge with current filter
         * @return Promise<cameraRollPhoto[]>
         */
        filterPhotos(options?: optionsFilter, replace?: boolean): Promise<cameraRollPhoto[]>;
        /**
         * Sort Photos
         * @param  {optionsSort}       options  {key:, descending:}
         * @return Promise<cameraRollPhoto[]>
         */
        sortPhotos(options?: optionsSort[], replace?: boolean): Promise<cameraRollPhoto[]>;
        /**
         * cluster photos by dateTaken+location
         * @param  {any} options [description]
         * @return {any}         [description]
         */
        groupPhotos(options?: any): any;
        getPhotos(limit?: number): cameraRollPhoto[];
    }
}
declare module "cordova-plugin" {
    import { cameraRollPhoto, NodeCallback, optionsGetByMoments } from "camera-roll.types";
    /**
     * This is the ACTUAL cordova plugin method call
     * plugin method wrapper for CameraRollWithLoc class
     * calls (ios/swift) CameraRollLocation.getByMoments() using plugin exec
     * swift: func getByMoments(from from: NSDate? = nil, to: NSDate? = nil) -> [PhotoWithLoc]
     *
     * @param  {getByMomentsOptions}   options {from:, to: mediaType: mediaSubtypes: }
     * @param  callback()              OPTIONAL nodejs style callback, i.e. (err, resp)=>{}
     * @return Promise() or void       returns a Promise if callback is NOT provided
     */
    export function getByMoments(options: optionsGetByMoments, callback: NodeCallback): Promise<cameraRollPhoto[]>;
}
