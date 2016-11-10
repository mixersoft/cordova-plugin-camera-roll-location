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
    let dateTaken: NSDate
    let mediaType: PHAssetMediaType
    let mediaSubtypes: PHAssetMediaSubtype
    var isFavorite: Bool
    let burstId: String?
    var representsBurst: Bool

    var longitude: Double?
    var latitude: Double?
    var speed: Double?

    var momentId: String?
    var momentLocationName: String?

    let dateFormatter = NSDateFormatter()
    let enUSPosixLocale = NSLocale(localeIdentifier: "en_US_POSIX")

    // for NSCoding
    // see: https://developer.apple.com/library/content/referencelibrary/GettingStarted/DevelopiOSAppsSwift/Lesson10.html
    func encodeWithCoder(aCoder: NSCoder) {
        aCoder.encodeObject(self.uuid, forKey: "uuid")
        aCoder.encodeObject(self.filename, forKey: "filename")
        aCoder.encodeObject(self.dateTaken, forKey: "dateTaken")
        aCoder.encodeInteger(self.mediaType.rawValue, forKey: "mediaType")
        aCoder.encodeObject(self.mediaSubtypes.rawValue, forKey: "mediaSubtypes")
        aCoder.encodeBool(self.isFavorite, forKey: "isFavorite")
        aCoder.encodeObject(self.burstId, forKey: "burstId")
        aCoder.encodeBool(self.representsBurst, forKey: "representsBurst")
        
        var geoJsonPoint : [String:AnyObject]
        if let lon = self.longitude, let lat = self.latitude {
             geoJsonPoint = [
                "type": "Point",
                "coordinates": [lon, lat]
            ]
            if let speed = self.speed {
                geoJsonPoint["speed"] = speed
            }
            aCoder.encodeObject(geoJsonPoint, forKey: "location")
        }

        aCoder.encodeObject(self.momentId, forKey: "momentId")
        aCoder.encodeObject(self.momentLocationName, forKey: "momentLocationName")
    }

    required init?(coder aDecoder: NSCoder) {
        // required
        guard
            let uuid = aDecoder.decodeObjectForKey("uuid") as! String?,
            let filename = aDecoder.decodeObjectForKey("filename") as! String?,
            let dateTaken = aDecoder.decodeObjectForKey("dateTaken") as! NSDate?,
            let mediaType = PHAssetMediaType(
                rawValue: aDecoder.decodeIntegerForKey("mediaType")
            )
            else {
                return nil
        }

        self.uuid = uuid
        self.filename = filename
        self.dateTaken = dateTaken
        self.mediaType = mediaType
        
        
        if let geoJson = aDecoder.decodeObjectForKey("location") as! [String:AnyObject]?,
            let coord = geoJson["coordinates"] as! Array<Double>?
        {
            self.longitude = coord[0]
            self.latitude = coord[1]
            self.speed = geoJson["speed"] as! Double?
        }

        self.isFavorite = aDecoder.decodeBoolForKey("isFavorite")
        self.representsBurst = aDecoder.decodeBoolForKey("representsBurst")
        self.mediaSubtypes = PHAssetMediaSubtype(
            rawValue: (aDecoder.decodeObjectForKey("mediaSubtypes") as! UInt?)!
        )

        // optional
        self.burstId = aDecoder.decodeObjectForKey("burstId") as! String?
        self.momentId = aDecoder.decodeObjectForKey("momentId") as! String?
        self.momentLocationName = aDecoder.decodeObjectForKey("momentLocationName") as! String?

        super.init()
    }


    required init(
        uuid: String, filename: String, dateTaken: NSDate,
        mediaType: PHAssetMediaType, mediaSubtypes : PHAssetMediaSubtype,
        isFavorite: Bool, burstId: String?, representsBurst: Bool,
        lon: Double?, lat: Double?, speed: Double?,
        momentId: String? = nil, momentLocationName: String? = nil
        ) {
        self.uuid = uuid
        self.filename = filename
        self.dateTaken = dateTaken
        self.mediaType = mediaType
        self.mediaSubtypes = mediaSubtypes       // NOTE: change to singular
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

        dateFormatter.locale = enUSPosixLocale
        dateFormatter.dateFormat = "yyyy-MM-dd HH:mm:ss.SSS"
        let localTime = dateFormatter.stringFromDate(self.dateTaken)
        dateFormatter.dateFormat = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'"
        dateFormatter.timeZone = NSTimeZone(abbreviation: "UTC")
        let iso8601Date = dateFormatter.stringFromDate(self.dateTaken)

        var result = "\"uuid\":\"\(self.uuid)\""
        result += ", \"filename\":\"\(self.filename)\""
        if !iso8601Date.isEmpty {
            result += ", \"dateTaken\":\"\(iso8601Date)\""
            result += ", \"localTime\":\"\(localTime)\""
        }

        result += ", \"mediaType\":\(self.mediaType.rawValue)"
        result += ", \"mediaSubypes\":\(self.mediaSubtypes.rawValue)"
        result += ", \"isFavorite\":\(self.isFavorite)"

        if let burstId = self.burstId {
            result += ", \"burstId\":\"\(burstId)\""
            result += ", \"representsBurst\":\(self.representsBurst)"
        }


        if (self.longitude != nil && self.latitude != nil) {
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

    func getByMoments(from from: NSDate? = nil, to: NSDate? = nil) -> [CameraRollPhoto] {
        var result : Array<CameraRollPhoto> = []

        let options = PHFetchOptions()
        options.sortDescriptors = [ NSSortDescriptor(key: "creationDate", ascending: false) ]
//        options.predicate =  NSPredicate(format: "mediaType = %i", PHAssetMediaType.Image.rawValue)

        let moments = PHAssetCollection.fetchMomentsWithOptions(nil)
        for j in 0 ..< moments.count {
            let moment = moments[j] as! PHAssetCollection

            // optional params
            if from != nil {
                guard let startDate = moment.startDate where from!.compare(startDate) != NSComparisonResult.OrderedDescending
                    else {
                        continue
                }
            }
            if to != nil {
                guard let endDate = moment.endDate where to!.compare(endDate) != NSComparisonResult.OrderedAscending
                    else {
                        continue
                }
            }


            guard moment.localizedLocationNames.count > 0 else {
                continue
            }
            // moment = {localIdentifier: UUID, localizedLocationNames:[], startDate: NSDate, endDate:NSDate }
//            print(moment)

            let assets = PHAsset.fetchAssetsInAssetCollection(moment, options: options)
            let retval = mapLocations(assets, moment:moment)
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


    func mapLocations(assets: PHFetchResult, from: NSDate? = nil, to: NSDate? = nil, moment: PHAssetCollection? = nil) -> [CameraRollPhoto]
    {

        // TODO: add moment? as a Dictionary with keys: startDate, endDate, count
        let locationName = moment?.localizedLocationNames.joinWithSeparator(", ")
        let locationUuid = moment?.localIdentifier


        var result : Array<CameraRollPhoto> = []
        for i in 0 ..< assets.count
        {

            let asset = assets[i]

            // is within date range, as necessary
            // TODO: if from, to, moment are all provided, check if moment.startDate, etc.
            guard
                let dateTaken = asset.creationDate as NSDate? else {
                continue
            }
            if from != nil {
                guard
                    from!.compare(dateTaken) != NSComparisonResult.OrderedAscending
                    else {
                        continue
                }
            }
            if to != nil{
                guard
                    to!.compare(dateTaken) != NSComparisonResult.OrderedDescending
                    else {
                        continue
                }
            }

            // is NOT hidden
            guard let isHidden = asset.hidden where isHidden == false else {
                continue
            }
            // is Image or Video
            guard case let mediaType = asset.mediaType as PHAssetMediaType
                where mediaType == .Image || mediaType == .Video
                else {
                    continue
            }
            // has required properties
            guard
                let uuid = asset.localIdentifier,
                let filename = asset.valueForKey("filename") as! String?
                else {
                    continue
            }

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
                isFavorite: asset.favorite, burstId: asset.burstIdentifier, representsBurst: asset.representsBurst,
                lon: lon, lat: lat, speed: speed,
                momentId: locationUuid, momentLocationName: locationName
            )
            result.append(photo)

        }

        return result
    }

}
