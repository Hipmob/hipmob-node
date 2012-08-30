// hipmob.js
// version: 0.1.0
// author: Femi Omojola
// license: Apache 2.0
// hipmob.js

(function(undefined){
    var serverurl = 'https://api.hipmob.com/';
    var hasModule = (typeof module !== 'undefined' && module.exports);
    var pattern1 = /No application specified\./;
    var pattern2 = /No device specified\./;
    var pattern3 = /API Request Failed\./;
    var pattern4 = /Device not found\./;
    var pattern5 = /Application not found\./;
    var pattern6 = /No friends specified\./;
    var pattern7 = /Unauthorized/;
    var pattern8 = /Authentication required/;
    
    // response patterns
    var message_sent_pattern = /Message sent\./;

    var helpers = {};
    
    // Hipmob app prototype
    function HipmobApp(hipmob, details)
    {
	var hipmob = hipmob;
	var id = details['id'];
	var name = details['name'];
	var url = details['url'];
	var created = details['created'];
	var modified = 'modified' in details ? details['modified'] : false;
	
	this.toString = function(){
	    return "(HipmobApp) "+name+" ["+id+"]";
	};

	this.id = function(){ return id; }
	this.created = function(){ return created; }
	this.modified = function(){ return modified; }
	
	this.is_hipmob_app = function(){ return true; }
    }
    
    HipmobApp.prototype = {
	toString : function () {
            return this.toString();
        }	
    };

    // Hipmob device prototype
    function HipmobDevice(helpers, hipmob, app, deviceid, full, sourcedata)
    {
	var i_helpers = helpers;
	var i_hipmob = hipmob;
	var i_app = app;
	var id = deviceid;
	var loaded = full;
	var platform = false;
	var version = false;
	var created = false;
	var modified = false;
	var userdata = {};
	var that = this;
	
	var apply_source = function(source)
	{
	    platform = source['platform'];
	    version = source['version'];
	    created = source['created'];
	    modified = 'modified' in source ? source['modified'] : false;
	    userdata = 'userdata' in source ? source['userdata'] : {};
	    loaded = true;
	};
	
	if(full && source && typeof source == 'object'){
	    apply_source(sourcedata);
	}

	this.toString = function(){
	    return "(HipmobDevice) ["+i_app+"/"+id+"]";
	};

	this.id = function(){ return id; }
	this.app = function(){ return i_app; }
	this.platform = function(){ return platform; }
	this.version = function(){ return version; }
	this.created = function(){ return created; }
	this.modified = function(){ return modified; }
	this.userdata = function(){ return userdata; }

	this.load = function(callback){
	    if(typeof callback == 'function'){
		if(full){
		    callback(false, that);
		}else{
		    helpers['load'](i_app, deviceid, function(err, source){
			if(err) callback(err);
			else if(source && typeof source == 'object'){
			    apply_source(source);
			    callback(false, that);
			}else{
			    throw new Error("Invalid source response ["+typeof source+"]");
			}
		    });
		}	
	    }else{
		throw new Error("[HipmobDevice.load] must be called with a callback");
	    }
	};

	this.available_message_count = function(callback){
	    if(typeof callback == 'function'){
		if(full){
		    callback(false, that);
		}else{
		    helpers['available_message_count'](i_app, deviceid, function(err, count){
			if(err) callback(err);
			else callback(false, count);
		    });
		}	
	    }else{
		throw new Error("[HipmobDevice.available_message_count] must be called with a callback");
	    }
	};

	this.send_text_message = function(text, arg1, arg2){
	    if(text == undefined) throw new Error("Cannot send a blank text message");
	    else if(arg1 == undefined){
		helpers['send_text_message'](i_app, deviceid, text, false, function(err){});
	    }else if(typeof arg1 == 'function'){
		helpers['send_text_message'](i_app, deviceid, text, false, function(err){
		    arg1(err);
		});
	    }else if(!arg1){
		if(arg2 == undefined){
		    helpers['send_text_message'](i_app, deviceid, text, false, function(err){});
		}else if(typeof arg2 == 'function'){
		    helpers['send_text_message'](i_app, deviceid, text, false, function(err){
			arg2(err);
		    });
		}else{
		    throw new Error("[HipmobDevice.send_text_message] invalid callback provided: not a function");
		}
	    }else{
		if(arg2 == undefined){
		    helpers['send_text_message'](i_app, deviceid, text, true, function(err){});
		}else if(typeof arg2 == 'function'){
		    helpers['send_text_message'](i_app, deviceid, text, true, function(err){
			arg2(err);
		    });
		}else{
		    throw new Error("[HipmobDevice.send_text_message] invalid callback provided: not a function");
		}
	    }
	};
    }
    
    HipmobDevice.prototype = {
	toString : function () {
            return this.toString();
        },

	load: function(callback){
	    this.load(callback);
	},
	
	available_message_count: function(callback){
	    this.available_message_count(callback);
	},

	send_text_message: function(text, autocreate, arg2){
	    this.send_text_message(text, autocreate, arg2);
	},

	send_picture_message: function(image, format, autocreate, arg2){
	    this.send_picture_message(image, format, autocreate, arg2);
	},

	send_audio_message: function(audio, format, autocreate, arg2){
	    this.send_audio_message(audio, format, autocreate, arg2);
	}
    };
    
    // Hipmob prototype
    function Hipmob(username, password)
    {
	var uname = username;
	var pword = password;
	var request = require('request');
	var baseurl = serverurl;
	var util = require('util');
	if('hipmob_server' in process.env){
	    baseurl = process.env.hipmob_server;
	}

	var helpers = {};
	this.get_applications = function(callback)
	{
	    var authheader = 'Basic '+new Buffer(uname + ":" + pword).toString("base64");
	    var headers = {
		'Authorization': authheader
	    };
	    request.get({
		url: baseurl + "apps",
		headers: headers
	    }, function(err, response, body){
		_check_for_errors(response.headers);
		if('headers' in response && 'content-type' in response.headers && response.headers['content-type'] == 'application/vnd.com.hipmob.App-list+json; version=1.0'){
		    var decoded = JSON.parse(body);
		    var res = [];
		    if("count" in decoded && decoded.count > 0){
			var i, detail, len = decoded.values.length;
			for(i=0;i<len;i++){
			    detail = decoded.values[i];
			    res.push(new HipmobApp(this, detail));
			}
		    }
		    if(typeof callback == 'function') callback(false, res);
		}else{
		    if(typeof callback == 'function') callback(true);
		}
	    });
	};

	this.get_application = function(id, callback)
	{
	    var authheader = 'Basic '+new Buffer(uname + ":" + pword).toString("base64");
	    var headers = {
		'Authorization': authheader
	    };
	    request.get({
		url: baseurl + "apps/"+id,
		headers: headers
	    }, function(err, response, body){
		_check_for_errors(response.headers);
		if('headers' in response && 'content-type' in response.headers && response.headers['content-type'] == 'application/vnd.com.hipmob.App+json; version=1.0'){
		    var res = new HipmobApp(this, JSON.parse(body));
		    if(typeof callback == 'function') callback(false, res);
		}else{
		    if(typeof callback == 'function') callback(true);
		}
	    });
	};
	
	this.get_device = function(app, deviceid, arg1, arg2)
	{
	    var mobilekey = typeof app == 'string' ? app : app.id();
	    if(arg1 == undefined){
		return new HipmobDevice(helpers, this, mobilekey, deviceid, false);
	    }else if(typeof arg1 == 'function'){
		// not asking to be verified
		arg1(false, new HipmobDevice(helpers, this, mobilekey, deviceid, false));
	    }else if(!arg1){
		if(arg2 == undefined){
		    return new HipmobDevice(helpers, this, mobilekey, deviceid, false);
		}else if(typeof arg2 == 'function'){
		    // not asking to be verified
		    arg2(false, new HipmobDevice(helpers, this, mobilekey, deviceid, false));
		}
	    }else if(typeof arg2 == 'function'){
		// must verify, so must have an arg2
		var authheader = 'Basic '+new Buffer(uname + ":" + pword).toString("base64");
		var headers = {
		    'Authorization': authheader
		};
		request({
		    url: baseurl + "apps/"+mobilekey+"/devices/"+deviceid,
		    headers: headers,
		    method: "HEAD"
		}, function(err, response, body){
		    try{
			_check_for_errors(response.headers);
			
			// it works: go
			arg2(false, new HipmobDevice(helpers, this, mobilekey, deviceid, false));
		    }catch(e){
			arg2(e);
		    }
		});
	    }else{
		throw new Error("Can not verify a device id without a callback.");
	    }
	};

	// does a full pull of the device's details from the server
	helpers['load'] = function(app, device, callback){
	    request({
		url: baseurl + "apps/"+app+"/devices/"+device,
		headers: {
		    'Authorization': 'Basic '+new Buffer(uname + ":" + pword).toString("base64")
		}, method: "GET"
	    }, function(err, response, body){
		try{
		    _check_for_errors(response.headers);
		    
		    // it works: load it up
		    if('headers' in response && 'content-type' in response.headers && response.headers['content-type'] == 'application/vnd.com.hipmob.Device+json; version=1.0'){
			callback(false, JSON.parse(body));
		    }else{
			var err = "Invalid response type";
			if('headers' in response && 'content-type' in response.headers) err += " ["+response.headers['content-type']+"]";
			else err += " (No Content-Type header)";
			callback(new Error(err));
		    }
		}catch(e){
		    callback(e);
		}
	    });
	};

	// fetches the available message count
	helpers['available_message_count'] = function(app, device, callback){
	    request({
		url: baseurl + "apps/"+app+"/devices/"+device+"/messagecount",
		headers: {
		    'Authorization': 'Basic '+new Buffer(uname + ":" + pword).toString("base64")
		}, method: "GET"
	    }, function(err, response, body){
		console.log(body);
		try{
		    _check_for_errors(response.headers);
		    
		    // it works: load it up
		    if('headers' in response && 'content-type' in response.headers && response.headers['content-type'] == 'application/vnd.com.hipmob.Device.pendingmessagecount+json; version=1.0'){
			var bits = JSON.parse(body);
			if('count' in bits) callback(false, bits.count);
			else callback(new Error("No message count was returned."));
		    }else{
			var err = "Invalid response type";
			if('headers' in response && 'content-type' in response.headers) err += " ["+response.headers['content-type']+"]";
			else err += " (No Content-Type header)";
			callback(new Error(err));
		    }
		}catch(e){
		    callback(e);
		}
	    });
	};

	// sends a text message
	helpers['send_text_message'] = function(app, device, text, autocreate, callback){
	    var body = { text: text };
	    if(autocreate) body['autocreate'] = "true";
	    request({
		url: baseurl + "apps/"+app+"/devices/"+device+"/messages",
		headers: {
		    'Authorization': 'Basic '+new Buffer(uname + ":" + pword).toString("base64")
		}, method: "POST",
		form: body
	    }, function(err, response, body){
		try{
		    _check_for_errors(response.headers);
		    var res = false;
		    if('x-hipmob-reason' in response.headers && message_sent_pattern.test(response.headers['x-hipmob-reason'])) res = true;
		    callback(res);
		}catch(e){
		    callback(e);
		}
	    });
	};
    }
    
    var hipmob = function(username, password){
	return new Hipmob(username, password);
    };

    var _check_for_errors = function(headers)
    {
	if(!('x-hipmob-reason' in headers)) return;
	var match, reason = headers['x-hipmob-reason'];
	//console.log(reason);
	if(pattern7.test(reason)){
	    throw new Error("Unauthorized");
	}else if(pattern8.test(reason)){
	    throw new Error("Authentication required");
	}else if(pattern1.test(reason)){
	    throw new Error("No application specified");
	}else if(pattern2.test(reason)){
	    throw new Error("No device specified");
	}else if(pattern3.test(reason)){
	    throw new Error("Invalid request");
	}else if(pattern4.test(reason)){
	    throw new Error("Device not found");
	}else if(pattern5.test(reason)){
	    throw new Error("Application not found");
	}else if(pattern6.test(reason)){
	    throw new Error("No friends specified");
	}
    }
    
    // CommonJS module is defined
    if(hasModule) {
        module.exports = hipmob;
    }
    /*global ender:false */
    if (typeof ender === 'undefined') {
        // here, `this` means `window` in the browser, or `global` on the server
        // add `moment` as a global object via a string identifier,
        // for Closure Compiler "advanced" mode
        this['hipmob'] = hipmob;
    }
    /*global define:false */
    if (typeof define === "function" && define.amd) {
        define("hipmob", [], function () {
            return hipmob;
        });
    }
    
}).call(this);