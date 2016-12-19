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
//
//  PhotoWithLocationService.swift
//
//  Created by michael lin on 8/3/16.
//  Copyright © 2016 Snaphappi. All rights reserved.
//

import Photos
import CoreLocation

let DEBUG = false

class CameraRollPhoto: NSObject, NSCoding {
    
    let uuid: String
    var filename: String
    let dateTaken: Date
    let mediaType: PHAssetMediaType
    let mediaSubtypes: PHAssetMediaSubtype
    
    var width: Int
    var height: Int
    var duration: Double
    
    var isFavorite: Bool
    let burstId: String?
    var representsBurst: Bool
    
    var longitude: Double?
    var latitude: Double?
    var speed: Double?
    
    var momentId: String?
    var momentLocationName: String?
    
    let dateFormatter = DateFormatter()
    let enUSPosixLocale = NSLocale(localeIdentifier: "en_US_POSIX")
    
    // for NSCoding
    // see: https://developer.apple.com/library/content/referencelibrary/GettingStarted/DevelopiOSAppsSwift/Lesson10.html
    func encode(with aCoder: NSCoder) {
        aCoder.encode(self.uuid, forKey: "uuid")
        aCoder.encode(self.filename, forKey: "filename")
        aCoder.encode(self.dateTaken, forKey: "dateTaken")
        aCoder.encode(self.mediaType.rawValue, forKey: "mediaType")
        aCoder.encode(self.mediaSubtypes.rawValue, forKey: "mediaSubtypes")
        aCoder.encode(self.width, forKey: "width")
        aCoder.encode(self.height, forKey: "height")
        aCoder.encode(self.duration, forKey: "duration")
        aCoder.encode(self.isFavorite, forKey: "isFavorite")
        aCoder.encode(self.burstId, forKey: "burstId")
        aCoder.encode(self.representsBurst, forKey: "representsBurst")
        
        var geoJsonPoint : [String:Any]
        var position : [String:Double]
        if let lon = self.longitude, let lat = self.latitude {
            // google.maps.LatLngLiteral | speed
            position = [
                "lat": lat,
                "lng": lon,
            ]
            // deprecate: GeoJsonPoint is the format for MongoDB $near queries
            geoJsonPoint = [
                "type": "Point",
                "coordinates": [lon, lat]
            ]
            if let speed = self.speed {
                position["speed"] = speed

                geoJsonPoint["speed"] = speed as AnyObject?
            }
            aCoder.encode(position, forKey: "position")
            aCoder.encode(geoJsonPoint, forKey: "location")
        }
        
        aCoder.encode(self.momentId, forKey: "momentId")
        aCoder.encode(self.momentLocationName, forKey: "momentLocationName")
    }
    
    required init?(coder aDecoder: NSCoder) {
        // required
        guard
            let uuid = aDecoder.decodeObject(forKey: "uuid") as! String?,
            let filename = aDecoder.decodeObject(forKey: "filename") as! String?,
            let dateTaken = aDecoder.decodeObject(forKey: "dateTaken") as! Date?,
            let mediaType = PHAssetMediaType(
                rawValue: aDecoder.decodeInteger(forKey: "mediaType")
            )
            else {
                return nil
        }
        
        self.uuid = uuid
        self.filename = filename
        self.dateTaken = dateTaken
        self.mediaType = mediaType
        
        self.width = aDecoder.decodeInteger(forKey: "width")
        self.height = aDecoder.decodeInteger(forKey: "height")
        self.duration = aDecoder.decodeDouble(forKey: "duration")

        // deprecate, use 'position' instead
        if let geoJson = aDecoder.decodeObject(forKey: "location") as! [String:AnyObject]?,
            let coord = geoJson["coordinates"] as! Array<Double>?
        {
            self.longitude = coord[0]
            self.latitude = coord[1]
            self.speed = geoJson["speed"] as! Double?
        }
                
        if let position = aDecoder.decodeObject(forKey: "position") as! [String:Double]?
        {
            self.latitude = position["lat"]
            self.longitude = position["lng"]
            self.speed = position["speed"]
        }
        
        self.isFavorite = aDecoder.decodeBool(forKey: "isFavorite")
        self.representsBurst = aDecoder.decodeBool(forKey: "representsBurst")
        self.mediaSubtypes = PHAssetMediaSubtype(
            rawValue: (aDecoder.decodeObject(forKey: "mediaSubtypes") as! UInt?)!
        )
        
        // optional
        self.burstId = aDecoder.decodeObject(forKey: "burstId") as! String?
        self.momentId = aDecoder.decodeObject(forKey: "momentId") as! String?
        self.momentLocationName = aDecoder.decodeObject(forKey: "momentLocationName") as! String?
        
        super.init()
    }
    
    
    required init(
        uuid: String, filename: String, dateTaken: Date,
        mediaType: PHAssetMediaType, mediaSubtypes : PHAssetMediaSubtype,
        width: Int, height: Int, duration: TimeInterval,
        isFavorite: Bool, burstId: String?, representsBurst: Bool,
        lon: Double?, lat: Double?, speed: Double?,
        momentId: String? = nil, momentLocationName: String? = nil
        ) {
        self.uuid = uuid
        self.filename = filename
        self.dateTaken = dateTaken
        self.mediaType = mediaType
        self.mediaSubtypes = mediaSubtypes       // NOTE: change to singular
        self.width = width
        self.height = height
        self.duration = duration as Double
        self.isFavorite = isFavorite
        self.burstId = burstId
        self.representsBurst = representsBurst
        
        self.longitude = lon
        self.latitude = lat
        self.speed = speed
        
        self.momentId = momentId
        self.momentLocationName = momentLocationName
        
        super.init()
    }
    
    func coordinates() -> Array<String>? {
        if (self.longitude == nil || self.latitude == nil)
        {
            return nil
        }
        return ["\(self.longitude)", "\(self.latitude)"]
    }
    
    func toJson() -> String {
        
        dateFormatter.locale = enUSPosixLocale as Locale!
        dateFormatter.dateFormat = "yyyy-MM-dd HH:mm:ss.SSS"
        let localTime = dateFormatter.string(from:self.dateTaken)
        dateFormatter.dateFormat = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'"
        dateFormatter.timeZone = NSTimeZone(abbreviation: "UTC") as TimeZone!
        let iso8601Date = dateFormatter.string(from:self.dateTaken)
        
        var result = "\"uuid\":\"\(self.uuid)\""
        result += ", \"filename\":\"\(self.filename)\""
        if !iso8601Date.isEmpty {
            result += ", \"dateTaken\":\"\(iso8601Date)\""
            result += ", \"localTime\":\"\(localTime)\""
        }
        
        result += ", \"mediaType\":\(self.mediaType.rawValue)"
        result += ", \"mediaSubypes\":\(self.mediaSubtypes.rawValue)"
        result += ", \"width\":\(self.width)"
        result += ", \"height\":\(self.height)"
        result += ", \"duration\":\(self.duration)"
        result += ", \"isFavorite\":\(self.isFavorite)"
        
        if let burstId = self.burstId {
            result += ", \"burstId\":\"\(burstId)\""
            result += ", \"representsBurst\":\(self.representsBurst)"
        }
        
        
        if (self.longitude != nil && self.latitude != nil) {
            // google.maps.LatLngLiteral
            var position = "\"lat\":\(self.latitude!), \"lng\":\(self.longitude!)"
            if self.speed != nil {
                position += ", \"speed\":\(self.speed!)"
            }
            result += ", \"position\":{" + position + "}"

            // format as geoJson Point
            let type = "Point"
            var location = "\"type\":\"\(type)\""
            location += ", \"coordinates\":[\(self.longitude!), \(self.latitude!)]"
            if self.speed != nil {
                location += ", \"speed\":\(self.speed!)"
            }
            result += ", \"location\":{" + location + "}"
            
        } else {
            result += ", \"location\":null"
        }
        
        if (self.momentId != nil) {
            result += ", \"momentId\":\"\(self.momentId!)\""
            result += ", \"momentLocationName\":\"\(self.momentLocationName!)\""
        }
        
        
        return "{" + result + "}"
    }
}


class PhotoWithLocationService {
    
    func getByMoments(from: Date? = nil, to: Date? = nil) -> [CameraRollPhoto] {
        var result : Array<CameraRollPhoto> = []
        
        let options = PHFetchOptions()
        options.sortDescriptors = [ NSSortDescriptor(key: "creationDate", ascending: false) ]
        //        options.predicate =  NSPredicate(format: "mediaType = %i", PHAssetMediaType.Image.rawValue)
        
        let moments = PHAssetCollection.fetchMoments(with: nil)
        for j in 0 ..< moments.count {
            let moment = moments[j] 
            
            // optional params
            if from != nil {
                guard let startDate = moment.startDate, from!.compare(startDate) != ComparisonResult.orderedDescending
                    else {
                        continue
                }
            }
            if to != nil {
                guard let endDate = moment.endDate, to!.compare(endDate) != ComparisonResult.orderedAscending
                    else {
                        continue
                }
            }
            
            
            guard moment.localizedLocationNames.count > 0 else {
                continue
            }
            // moment = {localIdentifier: UUID, localizedLocationNames:[], startDate: NSDate, endDate:NSDate }
            //            print(moment)
            
            let assets = PHAsset.fetchAssets(in: moment, options: options)
            let retval = mapLocations(assets: assets, moment:moment)
            result += retval
        }
        
        if DEBUG {
            var asJson = ""
            for o in result {
                if !asJson.isEmpty {
                    asJson += ", "
                }
                asJson += "\(o.toJson())"
            }
            print( "[\(asJson)]")
        }
        
        return result
    }
    
    
    func mapLocations(assets: PHFetchResult<PHAsset>, from: Date? = nil, to: Date? = nil, moment: PHAssetCollection? = nil) -> [CameraRollPhoto]
    {
        
        // TODO: add moment? as a Dictionary with keys: startDate, endDate, count
        let locationName = moment?.localizedLocationNames.joined(separator: ", ")
        let locationUuid = moment?.localIdentifier
        
        
        var result : Array<CameraRollPhoto> = []
        for i in 0 ..< assets.count
        {
            
            let asset = assets[i]
            
            // is within date range, as necessary
            // TODO: if from, to, moment are all provided, check if moment.startDate, etc.
            guard
                let dateTaken = asset.creationDate as Date? else {
                    continue
            }
            if from != nil {
                guard
                    from!.compare(dateTaken) != ComparisonResult.orderedAscending
                    else {
                        continue
                }
            }
            if to != nil{
                guard
                    to!.compare(dateTaken) != ComparisonResult.orderedDescending
                    else {
                        continue
                }
            }
            
            // is NOT hidden
            if asset.isHidden == true {
                continue
            }
            // is Image or Video
            guard case let mediaType = asset.mediaType as PHAssetMediaType, mediaType == .image || mediaType == .video
                else {
                    continue
            }
            // has required properties
            guard
                let filename = asset.value(forKey: "filename") as! String?
                else {
                    continue
            }
            
            let uuid = asset.localIdentifier
            var lon: Double?
            var lat: Double?
            var speed: Double?  //  in meters/second
            
            
            if let location = asset.location as CLLocation? {
                lon = location.coordinate.longitude
                lat = location.coordinate.latitude
                speed = location.speed
            }
            
            let photo = CameraRollPhoto(
                uuid: uuid, filename: filename, dateTaken: dateTaken,
                mediaType: asset.mediaType, mediaSubtypes : asset.mediaSubtypes,
                width: asset.pixelWidth, height: asset.pixelHeight, duration: asset.duration,
                isFavorite: asset.isFavorite, burstId: asset.burstIdentifier, representsBurst: asset.representsBurst,
                lon: lon, lat: lat, speed: speed,
                momentId: locationUuid, momentLocationName: locationName
            )
            result.append(photo)
            
        }
        
        return result
    }

    func getImage(localIds: Array<String>, options:[String: Any]) -> [String: String] {
        let fetchOpts = PHFetchOptions();
        fetchOpts.includeHiddenAssets = false
        fetchOpts.includeAssetSourceTypes = PHAssetSourceType.typeUserLibrary
        let assets : PHFetchResult<PHAsset> = PHAsset.fetchAssets(withLocalIdentifiers: localIds, options: fetchOpts)
        
        let w : Int = (options["width"] as? Int? ?? 320)!
        let h : Int = (options["height"] as? Int? ?? 240)!
        let size = CGSize(width: w, height: h)

        let imgReqOpts = PHImageRequestOptions()
        imgReqOpts.isSynchronous = true
        imgReqOpts.version = (options["version"] != nil)
            ? PHImageRequestOptionsVersion(rawValue: options["version"] as! Int)!
            :  PHImageRequestOptionsVersion.current
        imgReqOpts.deliveryMode = (options["deliveryMode"] != nil)
            ? PHImageRequestOptionsDeliveryMode(rawValue: options["deliveryMode"] as! Int)!
            :  PHImageRequestOptionsDeliveryMode.fastFormat
        imgReqOpts.resizeMode = (options["resizeMode"] != nil)
            ? PHImageRequestOptionsResizeMode(rawValue: options["resizeMode"] as! Int)!
            :  PHImageRequestOptionsResizeMode.fast
        imgReqOpts.isNetworkAccessAllowed = false
        let jpgQuality : CGFloat = CGFloat( options["quality"] as! Float? ?? 0.7 )
        
        var result : [String: String] = [:]
        for i in 0 ..< assets.count
        {
            let asset = assets[i], key = localIds[i]

            // PHImageManager.requestImage() example
            PHImageManager.default().requestImage(for: asset, targetSize: size
            , contentMode: PHImageContentMode.default
            , options: imgReqOpts
            , resultHandler: { uiImage, _ in
                guard let image = uiImage else {
                    result[localIds[i]] = "error:PHImageManager.requestImage()"  // nil?
                    return 
                }
                let jpgData:Data? = UIImageJPEGRepresentation(image, jpgQuality)
                guard let data = jpgData else {
                    result[localIds[i]] = "error:UIImageJPEGRepresentation()"
                    return
                }
                let dataURI = data.base64EncodedString(options: .lineLength64Characters)
                result[key] = dataURI
                return
            })
        }
        return result

    }
    
}
