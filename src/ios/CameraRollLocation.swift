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
