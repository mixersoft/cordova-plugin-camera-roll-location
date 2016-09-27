//
//  PhotoWithLocationService.swift
//
//  Created by michael lin on 8/3/16.
//  Copyright © 2016 Snaphappi. All rights reserved.
//

import Photos
import CoreLocation

let DEBUG = true

class PhotoWithLoc {
    
    let uuid: String
    var filename: String
    let dateTaken: NSDate
    let mediaType: PHAssetMediaType
    let mediaSubtype: PHAssetMediaSubtype
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
        self.mediaSubtype = mediaSubtypes       // NOTE: change to singular
        self.isFavorite = isFavorite
        self.burstId = burstId
        self.representsBurst = representsBurst
        
        self.longitude = lon
        self.latitude = lat
        self.speed = speed
        
        self.momentId = momentId
        self.momentLocationName = momentLocationName
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
        result += ", \"mediaSubype\":\(self.mediaSubtype.rawValue)"
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
    
    func getByMoments(from from: NSDate? = nil, to: NSDate? = nil) -> [PhotoWithLoc] {
        var result : Array<PhotoWithLoc> = []
        
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
    
    
    func mapLocations(assets: PHFetchResult, from: NSDate? = nil, to: NSDate? = nil, moment: PHAssetCollection? = nil) -> [PhotoWithLoc]
    {
        
        // TODO: add moment? as a Dictionary with keys: startDate, endDate, count
        let locationName = moment?.localizedLocationNames.joinWithSeparator(", ")
        let locationUuid = moment?.localIdentifier

        
        var result : Array<PhotoWithLoc> = []
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
                let filename = asset.filename
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
            
            let photo = PhotoWithLoc(
                uuid: uuid, filename: filename!, dateTaken: dateTaken,
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



