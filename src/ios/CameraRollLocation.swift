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

// import PhotoWithLocationService;

class Date {
  // adjust for localTime
  class func parse(dateStr:String, format:String="yyyy-MM-dd") -> NSDate {
      let dateFmt = NSDateFormatter()
      dateFmt.timeZone = NSTimeZone.defaultTimeZone()
      dateFmt.dateFormat = format
      return dateFmt.dateFromString(dateStr)!
  }
}

@objc(CameraRollLocation) class CameraRollLocation : CDVPlugin {


  func getByMoments(command: CDVInvokedUrlCommand) {
    var pluginResult = CDVPluginResult(
      status: CDVCommandStatus_ERROR
    )

    // let options = command.arguments[0] as? String ?? ""
    let options = command.arguments[0];

    // prepare params
    var fromDate : NSDate? = nil;
    var toDate : NSDate? = nil;
    if let from = options["from"] as! NSString? {
        fromDate = Date.parse( from.substringToIndex(10) )
        print("FROM: \( from.substringToIndex(10) ) => \(fromDate)")
    }
    if let to = options["to"] as! NSString? {
        toDate = Date.parse( to.substringToIndex(10) )
        print("TO: \( to.substringToIndex(10) ) => \(toDate)")
    }

    // get result from CameraRoll
    let cameraRoll = PhotoWithLocationService()
    var data : [NSData] = []

    // runInBackground
    self.commandDelegate!.runInBackground({

        let result = cameraRoll.getByMoments(from:fromDate, to:toDate);
        if result.count > 0 {

            // toJSON()
            var asJson = ""
            for o in result {
                if !asJson.isEmpty {
                    asJson += ", "
                }
                asJson += "\(o.toJson())"
                data.append( NSKeyedArchiver.archivedDataWithRootObject(o) )
            }
            asJson = "[\(asJson)]"

            pluginResult = CDVPluginResult(
                status: CDVCommandStatus_OK,
                messageAsString: asJson
            )
          } else if result.count == 0 {
              pluginResult = CDVPluginResult(
                  status: CDVCommandStatus_OK,
                  messageAsString: "[]"
              )
          }

//    let aDict = [result[0].uuid:result[0]]
//    pluginResult = CDVPluginResult(
//        status: CDVCommandStatus_OK
////      ,  messageAsArray: result          // <NSInvalidArgumentException> Invalid type in JSON write (mappi1.CameraRollPhoto)
////      ,  messageAsArray: data            // <NSInvalidArgumentException> Invalid type in JSON write (NSConcreteMutableData)
////      ,  messageAsDictionary: aDict      // Invalid type in JSON write (mappi1.CameraRollPhoto)
////      ,  messageAsMultipart: data        // returns ArrayBuffer to JS - then what?
//    )

        // send result in Background
        self.commandDelegate!.sendPluginResult(
            pluginResult,
            callbackId: command.callbackId
        )
    })

  }
}
