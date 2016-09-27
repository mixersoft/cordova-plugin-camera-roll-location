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
    if (options["from"] != nil) {
        fromDate = Date.parse( (options["from"] as! NSString).substringToIndex(10) )
        print("FROM: \( (options["from"] as! NSString).substringToIndex(10) ) => \(fromDate)")
    }
    if (options["to"] != nil) {
        toDate = Date.parse( (options["to"] as! NSString).substringToIndex(10) )
        print("TO: \( (options["to"] as! NSString).substringToIndex(10) ) => \(toDate)")
    }
    
    // get result from CameraRoll
    let cameraRoll = PhotoWithLocationService()
    let result = cameraRoll.getByMoments(from:fromDate, to:toDate);
    if (result.count > 0) {

      var asJson = ""
      for o in result {
          if !asJson.isEmpty {
              asJson += ", "
          }
          asJson += "\(o.toJson())"
      }
      asJson = "[\(asJson)]"
        
      pluginResult = CDVPluginResult(
        status: CDVCommandStatus_OK,
        messageAsString: asJson
//        messageAsArray: result   // ???: how do you return as an JS Object??
      )  

    }

    self.commandDelegate!.sendPluginResult(
      pluginResult, 
      callbackId: command.callbackId
    )
  }
}