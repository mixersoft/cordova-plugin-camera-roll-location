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

@objc(CameraRollLocation) class CameraRollLocation : CDVPlugin {

  // deprecate
  @objc(getByMoments:) func getByMoments(command: CDVInvokedUrlCommand) {
      return self.getCameraRoll(command: command);
  }

  @objc(getCameraRoll:) func getCameraRoll(command: CDVInvokedUrlCommand) {
    let dateFmt = DateFormatter()
    dateFmt.dateFormat = "yyyy-MM-dd"
    
    var pluginResult = CDVPluginResult(
      status: CDVCommandStatus_ERROR
    )

    // let options = command.arguments[0] as? String ?? ""
    let options : [String:Any] = command.arguments[0] as! [String:Any];

    // prepare params
    var fromDate : Date? = nil;
    var toDate : Date? = nil;
    if let from = options["from"] as! NSString? {
        fromDate = dateFmt.date(from: from.substring(to: 10))
        print("FROM: \( from.substring(to: 10) ) => \(fromDate)")
    }
    if let to = options["to"] as! NSString? {
        toDate = dateFmt.date(from: to.substring(to: 10))
        print("TO: \( to.substring(to: 10) ) => \(toDate)")
    }

    // get result from CameraRoll
    let cameraRoll = PhotoWithLocationService()
    var data : [NSData] = []

    // runInBackground
    self.commandDelegate!.run(inBackground: {

        let result = cameraRoll.getByMoments(from:fromDate, to:toDate);
        if result.count > 0 {

            // toJSON()
            var asJson = ""
            for o in result {
                if !asJson.isEmpty {
                    asJson += ", "
                }
                asJson += "\(o.toJson())"
                // data.append( NSKeyedArchiver.archivedDataWithRootObject(o) )
            }
            asJson = "[\(asJson)]"

            pluginResult = CDVPluginResult(
                status: CDVCommandStatus_OK,
                messageAs: asJson
            )
          } else if result.count == 0 {
              pluginResult = CDVPluginResult(
                  status: CDVCommandStatus_OK,
                  messageAs: "[]"
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
        self.commandDelegate!.send(
            pluginResult,
            callbackId: command.callbackId
        )
    })

  }


  // experimental
  @objc(getImage:) func getImage(command: CDVInvokedUrlCommand) {
    let uuids : [String] = command.arguments[0] as! [String];
    let options : [String:Any] = command.arguments[1] as! [String:Any];

    var pluginResult = CDVPluginResult(
        status: CDVCommandStatus_ERROR
    )
    let cameraRoll = PhotoWithLocationService()

    // runInBackground
    self.commandDelegate!.run(inBackground: {
        let result = cameraRoll.getImage(localIds:uuids, options:options)
        // var resultStr: String
        // do {
        //     let jsonData = try JSONSerialization.data(withJSONObject: result)
        //     resultStr = String(data: jsonData, encoding: .utf8)!
        // } catch {
        //     resultStr = "error:JSONSerialization()"
        // }
        pluginResult = CDVPluginResult(
            status: CDVCommandStatus_OK,
            messageAs: result
        )
        self.commandDelegate!.send(
            pluginResult,
            callbackId: command.callbackId
        )
    })
  }



}
