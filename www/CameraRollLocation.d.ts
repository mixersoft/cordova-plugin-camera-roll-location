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
declare module "location-helper" {
    export function round(v: number, precision?: number): number;
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
    export interface LatLngLiteral {
        lat: number;
        lng: number;
    }
    export interface LatLngSpeedLiteral extends LatLngLiteral {
        speed?: number;
    }
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
    /**
     * GeoJsonPoint format used by MongoDB $near queries
     */
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
    import { LatLngSpeedLiteral, LatLngBounds, GeoJson, GeoJsonPoint } from "location-helper";
    export interface optionsPlugin {
        from?: Date;
        to?: Date;
        mediaType?: mediaType;
        mediaSubtype?: mediaSubtype;
    }
    export interface optionsQuery {
        from?: Date;
        to?: Date;
        mediaType?: mediaType;
        mediaSubtype?: mediaSubtype;
        [propName: string]: any;
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
        dateTaken: string;
        localTime: string | Date;
        mediaType: number;
        mediaSubtype: number;
        width: number;
        height: number;
        duration: number;
        location?: GeoJsonPoint;
        position?: LatLngSpeedLiteral;
        momentId?: string;
        momentLocationName?: string;
    }
    export interface optionsGetCameraRoll {
        from?: Date;
        to?: Date;
        mediaType?: mediaType;
        mediaSubtype?: mediaSubtype;
    }
    /**
     * defaults:
     *    width: 320
     *    height: 240
     *    version: PHImageRequestOptionsVersion.Current
     *    resizeMode: PHImageRequestOptionsResizeMode.Fast
     *    deliveryMode: PHImageRequestOptionsDeliveryMode.fastFormat
     *    rawDataURI: false, add prefix `data:image/jpeg;base64,` to DataURI
     */
    export interface optionsGetImage {
        width?: number;
        height?: number;
        version?: PHImageRequestOptionsVersion;
        resizeMode?: PHImageRequestOptionsResizeMode;
        deliveryMode?: PHImageRequestOptionsDeliveryMode;
        rawDataURI?: boolean;
    }
    export type optionsGetByMoments = optionsGetCameraRoll;
    export interface NodeCallback {
        (err: any, data: any): void;
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
    export type DataURI = string;
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
    /**
     * PHImageRequestOptions
     * iOS
     * see: https://developer.apple.com/reference/photos/phimagerequestoptions
     */
    export enum PHImageRequestOptionsVersion {
        Current = 0,
        Unadjusted = 1,
        Original = 2,
    }
    /**
     * PHImageRequestOptions
     * iOS
     * see: https://developer.apple.com/reference/photos/phimagerequestoptions
     */
    export enum PHImageRequestOptionsResizeMode {
        None = 0,
        Fast = 1,
        Exact = 2,
    }
    /**
     * PHImageRequestOptions
     * iOS
     * see: https://developer.apple.com/reference/photos/phimagerequestoptions
     */
    export enum PHImageRequestOptionsDeliveryMode {
        Opportunistic = 0,
        HighQualityFormat = 1,
        fastFormat = 2,
    }
}
declare module "camera-roll.service" {
    import { optionsQuery, optionsFilter, optionsSort, cameraRollPhoto, optionsGetImage, DataURI } from "camera-roll.types";
    export class CameraRollWithLoc {
        protected _photos: cameraRollPhoto[];
        protected _filter: optionsFilter;
        protected _filteredPhotos: cameraRollPhoto[];
        private _isGettingCameraRoll;
        static sortPhotos(photos: cameraRollPhoto[], options?: optionsSort[], replace?: boolean): cameraRollPhoto[];
        static groupPhotos(photos: cameraRollPhoto[], options?: any): any;
        constructor();
        /**
         * get cameraRollPhoto[] from CameraRoll using Plugin,
         * uses cached values by default, ignore with force==true
         * filter later in JS
         * @param  {optionsQuery}                  interface optionsQuery
         * @param  {boolean = false}      refresh
         * @return {Promise<cameraRollPhoto[]>}         [description]
         */
        queryPhotos(options?: optionsQuery, force?: boolean): Promise<cameraRollPhoto[]>;
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
        /**
         * get ImageData as DataURI from CameraRoll using Plugin,
         * @param  {optionsGetImage}      interface optionsGetImage
         * @param  callback               interface NodeCallback
         * @return {Promise<cameraRollPhoto[]>}         [description]
         */
        getImage(uuids: string[], options: optionsGetImage): Promise<{
            [key: string]: DataURI;
        }>;
    }
}
declare module "cordova-plugin" {
    import { cameraRollPhoto, NodeCallback, optionsGetCameraRoll, optionsGetImage, DataURI } from "camera-roll.types";
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
    export function getCameraRoll(options: optionsGetCameraRoll, callback?: NodeCallback): Promise<cameraRollPhoto[]>;
    /**
     * get Image as DataURI from CameraRollWithLoc
     * NOTEs:
     *  runs synchronously on a background thread
     *  DataURIs are compatible with WKWebView, more performant scrolling
     * @param uuids: string[] of PHAsset.localIdentifiers
     * @return { uuid: dataURI}
     */
    export function getImage(uuids: string[], options: optionsGetImage, callback?: NodeCallback): Promise<{
        [key: string]: DataURI;
    }>;
    export function getByMoments(options: optionsGetCameraRoll, callback: NodeCallback): Promise<cameraRollPhoto[]>;
}
