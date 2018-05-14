const moment = require("moment");
const tz = require("moment-timezone");


module.exports = async function (activity) {

    try {
        
        // id is not needed in this specific service
        // yet id has a constant value to verify that clients return id as needed
        const id = "y" + moment().format('YYYY');

        var data = {};
        data.id = id;

        // extract _action from Request
        var _action = getObjPath(activity.Request,"Data.model._action");
        if(_action) { 
            activity.Request.Data.model._action = {};
        }else {
            _action = {};
        }

        switch(activity.Request.Path) {

            case "comment":
            case "utc":
                var comment = _action.comment;
                if(!comment) comment = "UTC = " + getObjPath(activity.Request,"Data.model.tsUTC");
                data = getObjPath(activity.Request,"Data.model");
                data._action = { response: { success: true, message: comment} };
                break;

            default:
                getData(activity,data);
                break;
        }



        // copy response data
        activity.Response.Data = data;

    } catch (error) {

        // return error response
        var m = error.message;    
        if (error.stack) m = m + ": " + error.stack;

        activity.Response.ErrorCode = (error.response && error.response.statusCode) || 500;
        activity.Response.Data = { ErrorText: m };

    }

    function getData(activity,data) {
        var tzName = getObjPath(activity.Context,"ContentItemSettings.tz");
        if(!tzName) tzName = "America/New_York";  // use default timezone America/New_York if user did not select a preference
        
        var now = moment.tz(moment.now(),tzName);

        data.ts = now.format();
        data.tsUTC = moment(now).tz("utc").format();
        data.time = now.format("LTS");
        data.tz = tzName;

        activity.Context.ContentItemSettings.counter = 1 + (activity.Context.ContentItemSettings.counter || 0)

        // return _settings if they are changed
        data._settings = activity.Context.ContentItemSettings;
    }

    function getObjPath(obj, path) {

        if (!path) return obj;
        if (!obj) return null;
  
        var paths = path.split('.'),
          current = obj;
  
        for (var i = 0; i < paths.length; ++i) {
          if (current[paths[i]] == undefined) {
            return undefined;
          } else {
            current = current[paths[i]];
          }
        }
        return current;
      }

};
