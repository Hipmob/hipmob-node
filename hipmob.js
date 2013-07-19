// hipmob.js
// version: 0.8.1
// author: Femi Omojola
// license: Apache 2.0
// hipmob.js

(function(undefined){
    var qs = require('querystring');
    var fs = require('fs');
    var crypto = require('crypto');
    var serverurl = 'https://api.hipmob.com/';
    var hasModule = (typeof module !== 'undefined' && module.exports);
    var urlparse = require("url");
    var pattern1 = /No application specified\./;
    var pattern2 = /No device specified\./;
    var pattern3 = /API Request Failed\./;
    var pattern4 = /Device not found\./;
    var pattern5 = /Application not found\./;
    var pattern6 = /No friends specified\./;
    var pattern7 = /Unauthorized/;
    var pattern8 = /Authentication required/;
    var pattern9 = /Invalid message content-type\./;
    var pattern10 = /User not found\./;
    var pattern11 = /No status specified\./;
    var pattern12 = /Invalid status specified\./;
    var pattern13 = /You can only change your own status\./;

    // response patterns
    var message_sent_pattern = /Message sent\./;
    var multiple_messages_sent_pattern = /(\d*) messages sent\./;
    var friend_removed_pattern = /Friend removed\./;
    var no_changes_made_pattern = /No changes made\./;
    var all_friends_removed_pattern = /Friend list cleared \((\d*) friends removed\)\./;
    var friends_set_pattern = /Friend list updated \((\d*) friends added\)\./;
    var status_updated_pattern = /\[(\w*)\] status updated to "(\w*)"$/;
    
    //
    // returns the last function
    var fetch_callback = function()
    {
	var i, l = arguments.length;
	for(i=l-1;i>=0;i--){
	    if(typeof arguments[i] == 'function') return arguments[i];
	}
	return false;
    };
    
    // Hipmob app prototype
    function HipmobApp(hipmob, details, helpers)
    {
	var that = this;
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

	// sends bulk text messages
	this.send_text_messages = function(text, devices, callback)
	{
	    helpers['send_text_message'](id, devices, text, false, callback);
	};
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
			    callback(new Error("Invalid source response ["+typeof source+"]"))
			}
		    });
		}	
	    }else{
		throw new Error("[HipmobDevice.load] must be called with a callback");
	    }
	};

	this.available_message_count = function(callback){
	    if(typeof callback == 'function'){
		helpers['available_message_count'](i_app, deviceid, function(err, count){
		    if(err) callback(err);
		    else callback(false, count);
		});
	    }else{
		throw new Error("[HipmobDevice.available_message_count] must be called with a callback");
	    }
	};

	this.check_device_status = function(callback){
	    if(typeof callback == 'function'){
		helpers['check_device_status'](i_app, deviceid, function(err, count){
		    if(err) callback(err);
		    else callback(false, count);
		});
	    }else{
		throw new Error("[HipmobDevice.check_device_status] must be called with a callback");
	    }
	};

	this.send_text_message = function(text, arg1, arg2)
	{
	    var cb = fetch_callback(arg1, arg2);
	    if(text == undefined || typeof text != "string" || text.trim() === ""){
		if(cb != null) cb(new Error("Cannot send a blank text message"));
		else throw new Error("Cannot send a blank text message");
	    }else if(arg1 == undefined){
		helpers['send_text_message'](i_app, deviceid, text, false, function(err){});
	    }else if(arg1 == cb){
		helpers['send_text_message'](i_app, deviceid, text, false, function(err){
		    cb(err);
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

	this.send_json_message = function(content, arg1, arg2)
	{
	    var cb = fetch_callback(arg1, arg2);
	    if(content == undefined || typeof content != "object"){
		if(cb != null) cb(new Error("Cannot send a blank JSON message"));
		else throw new Error("Cannot send a blank JSON message");
	    }else if(arg1 == undefined){
		helpers['send_json_message'](i_app, deviceid, content, false, function(err){});
	    }else if(arg1 == cb){
		helpers['send_json_message'](i_app, deviceid, content, false, function(err){
		    cb(err);
		});
	    }else if(!arg1){
		if(arg2 == undefined){
		    helpers['send_json_message'](i_app, deviceid, content, false, function(err){});
		}else if(typeof arg2 == 'function'){
		    helpers['send_json_message'](i_app, deviceid, content, false, function(err){
			arg2(err);
		    });
		}else{
		    throw new Error("[HipmobDevice.send_json_message] invalid callback provided: not a function");
		}
	    }else{
		if(arg2 == undefined){
		    helpers['send_json_message'](i_app, deviceid, content, true, function(err){});
		}else if(typeof arg2 == 'function'){
		    helpers['send_json_message'](i_app, deviceid, content, true, function(err){
			arg2(err);
		    });
		}else{
		    throw new Error("[HipmobDevice.send_json_message] invalid callback provided: not a function");
		}
	    }
	};

	this.send_binary_message = function(content, arg1, arg2)
	{
	    var cb = fetch_callback(arg1, arg2);
	    if(content == undefined || !(content instanceof Buffer)){
		if(cb != null) cb(new Error("Cannot send a blank binary message"));
		else throw new Error("Cannot send a blank binary message");
	    }else if(arg1 == undefined){
		helpers['send_binary_message'](i_app, deviceid, content, false, function(err){});
	    }else if(arg1 == cb){
		helpers['send_binary_message'](i_app, deviceid, content, false, function(err){
		    cb(err);
		});
	    }else if(!arg1){
		if(arg2 == undefined){
		    helpers['send_binary_message'](i_app, deviceid, content, false, function(err){});
		}else if(typeof arg2 == 'function'){
		    helpers['send_binary_message'](i_app, deviceid, content, false, function(err){
			arg2(err);
		    });
		}else{
		    throw new Error("[HipmobDevice.send_binary_message] invalid callback provided: not a function");
		}
	    }else{
		if(arg2 == undefined){
		    helpers['send_binary_message'](i_app, deviceid, content, true, function(err){});
		}else if(typeof arg2 == 'function'){
		    helpers['send_binary_message'](i_app, deviceid, content, true, function(err){
			arg2(err);
		    });
		}else{
		    throw new Error("[HipmobDevice.send_binary_message] invalid callback provided: not a function");
		}
	    }
	};

	this.list_friends = function(callback){
	    if(typeof callback == 'function'){
		helpers['list_friends'](i_app, deviceid, callback);
	    }else{
		throw new Error("[HipmobDevice.list_friends] must be called with a callback");
	    }
	};

	this.remove_friend = function(friend, callback){
	    if(typeof callback == 'function'){
		helpers['remove_friend'](i_app, deviceid, friend, callback);
	    }else{
		helpers['remove_friend'](i_app, deviceid, friend);
	    }
	};

	this.remove_all_friends = function(callback){
	    helpers['remove_all_friends'](i_app, deviceid, function(err, count){
		if(typeof callback == 'function') callback(err, count);
	    });
	};

	this.add_friend = function(friends, callback){
	    helpers['add_friend'](i_app, deviceid, friends, function(err, count){
		if(typeof callback == 'function') callback(err, count);
	    });
	};

	this.set_friends = function(friends, callback){
	    helpers['set_friends'](i_app, deviceid, friends, function(err, count){
		if(typeof callback == 'function') callback(err, count);
	    });
	};

	this.send_file_message = function(formats, image, format, arg1, arg2){
	    var cb = fetch_callback(arg1, arg2);
	    var err = false;
	    if(image == undefined) err = new Error("Please provide an image");
	    else if(format == undefined) err = new Error("Please specify an image format");
	    else if(typeof format != "string") err = new Error("Please specify an image format as a string");
	    else if(formats.indexOf(format) == -1){
		err = new Error("Invalid image format ["+format+"]: must be one of ("+formats.toString()+")");
	    }
	    if(err){
		if(cb){
		    cb(err);
		    return;
		}else throw err;
	    }
	    
	    // verify that it exists
	    var proceed = function(data, length){
		if(arg1 == undefined){
		    helpers['send_file_message'](i_app, deviceid, data, length, format, false, function(err){});
		}else if(typeof arg1 == 'function'){
		    helpers['send_file_message'](i_app, deviceid, data, length, format, false, function(err){
			arg1(err);
		    });
		}else if(!arg1){
		    if(arg2 == undefined){
			helpers['send_file_message'](i_app, deviceid, data, length, format, false, function(err){});
		    }else if(typeof arg2 == 'function'){
			helpers['send_file_message'](i_app, deviceid, data, length, format, false, function(err){
			    arg2(err);
			});
		    }else{
			throw new Error("[HipmobDevice.send_file_message] invalid callback provided: not a function");
		    }
		}else{
		    if(arg2 == undefined){
			helpers['send_picture_message'](i_app, deviceid, data, length, format, true, function(err){});
		    }else if(typeof arg2 == 'function'){
			helpers['send_file_message'](i_app, deviceid, data, length, format, true, function(err){
			    arg2(err);
			});
		    }else{
			throw new Error("[HipmobDevice.send_file_message] invalid callback provided: not a function");
		    }
		}
	    };

	    // do the type verification
	    if(image instanceof Buffer){
		proceed(image, image.length);
	    }else if(typeof image == "string"){
		// see if it is a file
		fs.stat(image, function(err3, filestats){
		    if(err3){
			if(cb) cb(new Error("Invalid picture file specified ["+image+"/"+err3+"]"));
			else throw new Error("Invalid picture file specified ["+image+"/"+err3+"]");
		    }else{
			if(filestats.size == 0){
			    if(cb) cb(new Error("Empty picture file specified ["+image+"]"));
			    else throw new Error("Empty picture file specified ["+image+"]");
			}else{
			    proceed(image, filestats.size);
			}
		    }
		});
	    }else{
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

	check_device_status: function(callback){
	    this.check_device_status(callback);
	},

	send_text_message: function(text, autocreate, arg2){
	    this.send_text_message(text, autocreate, arg2);
	},

	send_json_message: function(content, autocreate, arg2){
	    this.send_json_message(content, autocreate, arg2);
	},

	send_binary_message: function(content, autocreate, arg2)
	{
	    this.send_binary_message(content, autocreate, arg2);
	},

	send_picture_message: function(image, format, autocreate, arg2){
	    this.send_file_message(['image/png','image/jpeg','image/gif'], image, format, autocreate, arg2);
	},
	
	send_audio_message: function(audio, format, autocreate, arg2){
	    this.send_file_message(['audio/mp3'], audio, format, autocreate, arg2);
	},

	list_friends: function(callback){
	    this.list_friends(callback);
	},

	remove_friend: function(friend, callback){
	    this.remove_friend(friend, callback);
	},

	remove_friends: function(friends, callback){
	    this.remove_friend(friends, callback);
	},

	remove_all_friends: function(callback){
	    this.remove_all_friends(callback);
	},

	add_friend: function(friend, callback){
	    this.add_friend(friend, callback);
	},

	add_friends: function(friends, callback){
	    this.add_friend(friends, callback);
	},

	set_friends: function(friends, callback){
	    this.set_friends(friends, callback);
	},
	
	generate_peer_token: function(secret, friend)
	{
	    var now = moment().unix();
	    return now + '|' + crypto.createHash('sha512').update(this.id() +'|'+friend.id()+'|'+now+'|'+secret).digest('hex');
	},

	generate_auth_token: function(secret)
	{
	    var now = moment().unix();
	    return now + '|'+ crypto.createHash('sha512').update(this.id() +'|'+now+'|'+secret).digest('hex');
	}
    };

    // Hipmob user prototype
    function HipmobUser(helpers, hipmob, details)
    {
	var i_helpers = helpers;
	var hipmob = hipmob;
	var username = details['username'];
	var first_name = details['first_name'];
	var last_name = details['last_name'];
	var status = details['status'];
	
	this.toString = function(){
	    return "(HipmobUser) "+username+" ("+first_name+" "+last_name+") ["+status+"]";
	};

	this.username = function(){ return username; }
	this.status = function(){ return status; }
	this.first_name = function(){ return first_name; }
	this.last_name = function(){ return last_name; }

	this.set_status = function(status, callback)
	{
	    var cb = fetch_callback(callback);
	    if(status == undefined || typeof status != "string" || status.trim() === ""){
		if(cb != null) cb(new Error("Cannot set the status to a blank string"));
		else throw new Error("Cannot set the status to a blank string");
	    }else if(!(status == "usestatus" || status == "online" || status == "offline" || status == "hours")){
		if(cb != null) cb(new Error("Invalid status specified"));
		else throw new Error("Invalid status specified");
	    }else{
		i_helpers['user_set_status'](username, status, cb);
	    }
	};
    }
    
    HipmobUser.prototype = {
	toString : function () {
            return this.toString();
        },

	set_status: function(status, callback){
	    this.set_status(status, callback);
	}
    };
    
    // Hipmob prototype
    function Hipmob(username, password)
    {
	var uname = username;
	var pword = password;
	var baseurl = serverurl;	
	
	// see if we need to reconstruct
	if(!password){
	    if(!username) throw new Error("No username/password or configuration URL specified.");
	    var parsed = urlparse.parse(username);
	    if(typeof parsed == 'object'){
		if('auth' in parsed && 'host' in parsed){
		    var bits = auth.split(":", 2);
		    if(bits.length == 2){
			uname = bits[0];
			password = bits[1];
		    }
		    baseurl = ('protocol' in parsed ? parsed.protocol : 'https') + "://" + host+"/";
		}
	    }else{
		throw new Error("No username/password or invalid configuration URL specified.");
	    }
	}
	var request = require('request');
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
			    res.push(new HipmobApp(this, detail, helpers));
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
	    if(callback == undefined){
		return new HipmobApp(this, {
		    id: id,
		    name: 'not set',
		    url: 'not set',
		    created: 'not set'
		}, helpers);
	    }
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
		    var res = new HipmobApp(this, JSON.parse(body), helpers);
		    if(typeof callback == 'function') callback(false, res);
		}else{
		    if(typeof callback == 'function') callback(true);
		}
	    });
	};

	this.get_user = function(username, callback)
	{
	    var authheader = 'Basic '+new Buffer(uname + ":" + pword).toString("base64");
	    var headers = {
		'Authorization': authheader
	    };
	    request.get({
		url: baseurl + "user/"+username,
		headers: headers
	    }, function(err, response, body){
		_check_for_errors(response.headers);
		if('headers' in response && 'content-type' in response.headers && response.headers['content-type'] == 'application/vnd.com.hipmob.User+json; version=1.0'){
		    var res = new HipmobUser(helpers, this, JSON.parse(body));
		    if(typeof callback == 'function') callback(false, res);
		}else{
		    if(typeof callback == 'function') callback(true);
		}
	    });
	};

	this.get_user = function(username, callback)
	{
	    var authheader = 'Basic '+new Buffer(uname + ":" + pword).toString("base64");
	    var headers = {
		'Authorization': authheader
	    };
	    request.get({
		url: baseurl + "user/"+username,
		headers: headers
	    }, function(err, response, body){
		_check_for_errors(response.headers);
		if('headers' in response && 'content-type' in response.headers && response.headers['content-type'] == 'application/vnd.com.hipmob.User+json; version=1.0'){
		    var res = new HipmobUser(helpers, this, JSON.parse(body));
		    if(typeof callback == 'function') callback(false, res);
		}else{
		    if(typeof callback == 'function') callback(true);
		}
	    });
	};

	this.get_user = function(username, callback)
	{
	    var authheader = 'Basic '+new Buffer(uname + ":" + pword).toString("base64");
	    var headers = {
		'Authorization': authheader
	    };
	    request.get({
		url: baseurl + "user/"+username,
		headers: headers
	    }, function(err, response, body){
		_check_for_errors(response.headers);
		if('headers' in response && 'content-type' in response.headers && response.headers['content-type'] == 'application/vnd.com.hipmob.User+json; version=1.0'){
		    var res = new HipmobUser(helpers, this, JSON.parse(body));
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

	// check the device status
	helpers['check_device_status'] = function(app, device, callback){
	    request({
		url: baseurl + "apps/"+app+"/devices/"+device+"/status",
		headers: {
		    'Authorization': 'Basic '+new Buffer(uname + ":" + pword).toString("base64")
		}, method: "GET"
	    }, function(err, response, body){
		try{
		    _check_for_errors(response.headers);
		    
		    // it works: load it up
		    if('headers' in response && 'content-type' in response.headers && response.headers['content-type'] == 'application/vnd.com.hipmob.Device.status+json; version=1.0'){
			var bits = JSON.parse(body);
			if('online' in bits) callback(false, bits.online);
			else callback(new Error("No message status was returned."));
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
	    var args = {
		headers: {
		    'Authorization': 'Basic '+new Buffer(uname + ":" + pword).toString("base64"),
		    'Content-Type': 'application/x-www-form-urlencoded'
		}, 
		method: "POST"
	    };
	    if(device instanceof Array){
		body['devices'] = device;
		args['url'] = baseurl + "apps/"+app+"/devices/messages";
	    }else{
		args['url'] = baseurl + "apps/"+app+"/devices/"+device+"/messages";
	    }
	    args['body'] = qs.stringify(body).toString('utf8');
	    request(args, function(err, response, body){
		var match;
		try{
		    _check_for_errors(response.headers);
		    if(response.statusCode == 200 && 'x-hipmob-reason' in response.headers && message_sent_pattern.test(response.headers['x-hipmob-reason'])){
			if(callback) callback(false);
		    }else if(response.statusCode == 200 && 'x-hipmob-reason' in response.headers && (match = multiple_messages_sent_pattern.exec(response.headers['x-hipmob-reason'])) != null){
			if(callback) callback(false, parseInt(match[1]));
		    }else{
			if(callback) callback(new Error(response.headers['x-hipmob-reason']));
		    }
		}catch(e){
		    if(callback) callback(e);
		}
	    });
	};

	// sends a JSON message
	helpers['send_json_message'] = function(app, device, content, autocreate, callback){
	    var headers = {
		'Authorization': 'Basic '+new Buffer(uname + ":" + pword).toString("base64"),
		'Content-Type': 'application/json'
	    };
	    if(autocreate) headers['X-Hipmob-Autocreate'] = 'true';
	    request({
		url: baseurl + "apps/"+app+"/devices/"+device+"/messages",
		headers: headers,
		method: "POST",
		json: content,
	    }, function(err, response, body){
		try{
		    _check_for_errors(response.headers);
		    if(response.statusCode == 200 && 'x-hipmob-reason' in response.headers && message_sent_pattern.test(response.headers['x-hipmob-reason'])){
			callback(false);
		    }else{
			callback(new Error(response.headers['x-hipmob-reason']));
		    }
		}catch(e){
		    callback(e);
		}
	    });
	};

	// sends a binary message
	helpers['send_binary_message'] = function(app, device, content, autocreate, callback){
	    var headers = {
		'Authorization': 'Basic '+new Buffer(uname + ":" + pword).toString("base64"),
		'Content-Type': 'application/octet-stream'
	    };
	    if(autocreate) headers['X-Hipmob-Autocreate'] = 'true';
	    request({
		url: baseurl + "apps/"+app+"/devices/"+device+"/messages",
		headers: headers,
		method: "POST",
		body: content,
	    }, function(err, response, body){
		try{
		    _check_for_errors(response.headers);
		    if(response.statusCode == 200 && 'x-hipmob-reason' in response.headers && message_sent_pattern.test(response.headers['x-hipmob-reason'])){
			callback(false);
		    }else{
			callback(new Error(response.headers['x-hipmob-reason']));
		    }
		}catch(e){
		    callback(e);
		}
	    });
	};

	// lists friends
	helpers['list_friends'] = function(app, device, callback){
	    request({
		url: baseurl + "apps/"+app+"/devices/"+device+"/friends",
		headers: {
		    'Authorization': 'Basic '+new Buffer(uname + ":" + pword).toString("base64")
		},
		method: "GET"
	    }, function(err, response, body){
		try{
		    _check_for_errors(response.headers);
		    if('headers' in response && 'content-type' in response.headers && response.headers['content-type'] == 'application/vnd.com.hipmob.DeviceFriends+json; version=1.0'){
			var decoded = JSON.parse(body);
			var res = [];
			if(decoded && "pagesize" in decoded && decoded.pagesize > 0){
			    var i, detail, len = decoded.friends.length;
			    for(i=0;i<len;i++){
				detail = decoded.friends[i];
				res.push(new HipmobDevice(helpers, this, app, detail, false));
			    }
			}
			callback(false, res);
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

	// remove friend
	helpers['remove_friend'] = function(app, device, friend, maincallback){
	    var flush_friend = function(friendid, callback){
		request({
		    url: baseurl + "apps/"+app+"/devices/"+device+"/friends/"+friendid,
		    headers: {
			'Authorization': 'Basic '+new Buffer(uname + ":" + pword).toString("base64")
		    },
		    method: "DELETE"
		}, function(err, response, body){
		    try{
			_check_for_errors(response.headers);
			if(response.statusCode == 200){
			    if('x-hipmob-reason' in response.headers ){
				if(no_changes_made_pattern.test(response.headers['x-hipmob-reason'])){
				    callback(false, 0);
				}else if(friend_removed_pattern.test(response.headers['x-hipmob-reason'])){
				    callback(false, 1);
				}else{
				    callback(new Error("Invalid response from server: "+response.headers['x-hipmob-reason']));
				}
			    }else{
				callback(new Error("No valid response from server"));
			    }
			}else{
			    callback(new Error("Delete failed"));
			}
		    }catch(e){
			callback(e);
		    }
		});
	    };
	    
	    var flush_friends = function(friendlist, finalcallback, sum)
	    {
		var info = friend.shift();
		flush_friend(info.id(), function(e, res){
		    if(e){
			if(typeof finalcallback == 'function') finalcallback(e);
		    }else{
			var nsum = sum+res;
			if(friendlist.length > 0) setTimeout(function(){ flush_friends(friendlist, finalcallback, nsum); });
			else if(typeof finalcallback == 'function') finalcallback(false, nsum);
		    }
		});
	    };

	    if(friend instanceof HipmobDevice){
		flush_friend(friend.id(), maincallback);
	    }else if('length' in friend && friend.length > 0){
		// make sure it is all good: no partials
		var i, len = friend.length, detail;
		for(i=0;i<len;i++){
		    detail = friend[i];
		    if(detail instanceof HipmobDevice) continue;
		    if(typeof maincallback == 'function') return maincallback(new Error("Invalid friend(s) passed: ["+detail+"]"));
		    return;
		}
		
		// everyone is a valid friend: start cycling through
		flush_friends(friend, maincallback, 0);
	    }else{
		if(typeof maincallback == 'function') maincallback(new Error("Invalid friend(s) passed: ["+friend+"]"));
	    }
	};

	// remove all friends
	helpers['remove_all_friends'] = function(app, device, callback){
	    request({
		url: baseurl + "apps/"+app+"/devices/"+device+"/friends",
		headers: {
		    'Authorization': 'Basic '+new Buffer(uname + ":" + pword).toString("base64")
		},
		method: "DELETE"
	    }, function(err, response, body){
		try{
		    _check_for_errors(response.headers);
		    if(response.statusCode == 200){
			if('x-hipmob-reason' in response.headers ){
			    var match;
			    if(no_changes_made_pattern.test(response.headers['x-hipmob-reason'])){
				callback(false, 0);
			    }else if((match = all_friends_removed_pattern.exec(response.headers['x-hipmob-reason'])) != null){
				callback(false, parseInt(match[1]));
			    }else{
				callback(new Error("Invalid response from server: "+response.headers['x-hipmob-reason']));
			    }
			}else{
			    callback(new Error("No valid response from server"));
			}
		    }else{
			callback(new Error("Delete failed"));
		    }
		}catch(e){
		    callback(e);
		}
	    });
	};

	// set friends
	helpers['set_friends'] = function(app, device, friends, callback){
	    var do_set_friends = function(friendlist){
		request({
		    url: baseurl + "apps/"+app+"/devices/"+device+"/friends",
		    headers: {
			'Authorization': 'Basic '+new Buffer(uname + ":" + pword).toString("base64"),
			'Content-Type': 'application/x-www-form-urlencoded'
		    },
		    body: qs.stringify({ friend: friendlist }).toString('utf8'),
		    method: "PUT"
		}, function(err, response, body){
		    try{
			_check_for_errors(response.headers);
			if(response.statusCode == 200){
			    if('x-hipmob-reason' in response.headers ){
				var match;
				if(no_changes_made_pattern.test(response.headers['x-hipmob-reason'])){
				    callback(false, 0);
				}else if((match = friends_set_pattern.exec(response.headers['x-hipmob-reason'])) != null){
				    callback(false, parseInt(match[1]));
				}else{
				    callback(new Error("Invalid response from server: "+response.headers['x-hipmob-reason']));
				}
			    }else{
				callback(new Error("No valid response from server"));
			    }
			}else{
			    callback(new Error("Set friends failed"));
			}
		    }catch(e){
			callback(e);
		    }
		});
	    };
	    
	    if(friends instanceof HipmobDevice){
		// everyone is a valid friend: build up the request
		do_set_friends([ friends.id() ]);
	    }else if('length' in friends && friends.length > 0){
		// make sure it is all good: no partials
		var i, len = friends.length, detail;
		var friendlist = [];
		for(i=0;i<len;i++){
		    detail = friends[i];
		    if(detail instanceof HipmobDevice){
			friendlist.push(detail.id());
			continue;
		    }
		    if(typeof callback == 'function') return callback(new Error("Invalid friend(s) passed: ["+detail+"]"));
		    return;
		}
		
		// everyone is a valid friend: build up the request
		do_set_friends(friendlist);
	    }else{
		if(typeof callback == 'function') callback(new Error("Invalid friend(s) passed: ["+friends+"]"));
	    }
	};

	// add friends
	helpers['add_friend'] = function(app, device, friends, callback){
	    var do_add_friends = function(friendlist){
		request({
		    method: "POST",
		    url: baseurl + "apps/"+app+"/devices/"+device+"/friends",
		    body: qs.stringify({ friend: friendlist }).toString('utf8'),
		    headers: {
			'Authorization': 'Basic '+new Buffer(uname + ":" + pword).toString("base64"),
			'Content-Type': 'application/x-www-form-urlencoded'
		    }
		}, function(err, response, body){
		    try{
			_check_for_errors(response.headers);
			//console.log("["+util.inspect(friendlist)+"]: "+util.inspect(response.headers));
			if(response.statusCode == 200){
			    if('x-hipmob-reason' in response.headers ){
				var match;
				if(no_changes_made_pattern.test(response.headers['x-hipmob-reason'])){
				    callback(false, 0);
				}else if((match = friends_set_pattern.exec(response.headers['x-hipmob-reason'])) != null){
				    callback(false, parseInt(match[1]));
				}else{
				    callback(new Error("Invalid response from server: "+response.headers['x-hipmob-reason']));
				}
			    }else{
				callback(new Error("No valid response from server"));
			    }
			}else{
			    callback(new Error("Add friends failed"));
			}
		    }catch(e){
			callback(e);
		    }
		});
	    };
	    
	    if(friends instanceof HipmobDevice){
		// everyone is a valid friend: build up the request
		do_add_friends([ friends.id() ]);
	    }else if('length' in friends && friends.length > 0){
		// make sure it is all good: no partials
		var i, len = friends.length, detail;
		var friendlist = [];
		for(i=0;i<len;i++){
		    detail = friends[i];
		    if(detail instanceof HipmobDevice){
			friendlist.push(detail.id());
			continue;
		    }
		    if(typeof callback == 'function') return callback(new Error("Invalid friend(s) passed: ["+detail+"]"));
		    return;
		}
		
		// everyone is a valid friend: build up the request
		do_add_friends(friendlist);
	    }else{
		if(typeof callback == 'function') callback(new Error("Invalid friend(s) passed: ["+friends+"]"));
	    }
	};

	// sends a picture or audio message
	helpers['send_file_message'] = function(app, device, data, length, format, autocreate, callback){
	    var headers = {
		'Authorization': 'Basic '+new Buffer(uname + ":" + pword).toString("base64"),
		'Content-Type': format,
		'Content-Length': length
	    };
	    if(autocreate) headers['X-Hipmob-Autocreate'] = 'true';
	    if(typeof data == "string"){
		fs.createReadStream(data).pipe(request({
		    url: baseurl + "apps/"+app+"/devices/"+device+"/messages",
		    headers: headers,
		    method: "POST"
		}, function(err, response, body){
		    try{
			_check_for_errors(response.headers);
			if(response.statusCode == 200 && 'x-hipmob-reason' in response.headers && message_sent_pattern.test(response.headers['x-hipmob-reason'])){
			    callback(false);
			}else{
			    callback(new Error(response.headers['x-hipmob-reason']));
			}
		    }catch(e){
			callback(e);
		    }
		}));
	    }else{
		// send the buffer
		request({
		    url: baseurl + "apps/"+app+"/devices/"+device+"/messages",
		    headers: headers,
		    method: "POST",
		    body: data
		}, function(err, response, body){
		    try{
			_check_for_errors(response.headers);
			if(response.statusCode == 200 && 'x-hipmob-reason' in response.headers && message_sent_pattern.test(response.headers['x-hipmob-reason'])){
			    callback(false);
			}else{
			    callback(new Error(response.headers['x-hipmob-reason']));
			}
		    }catch(e){
			callback(e);
		    }
		});
	    }
	};

	helpers['user_set_status'] = function(user, status, callback)
	{
	    request({
		url: baseurl + "user/"+user+"/status",
		headers: {
		    'Authorization': 'Basic '+new Buffer(uname + ":" + pword).toString("base64"),
		    'Content-Type': 'application/x-www-form-urlencoded'
		}, 
		method: "POST",
		body: qs.stringify({ status: status }).toString('utf8')
	    }, function(err, response, body){
		try{
		    _check_for_errors(response.headers);
		    if(response.statusCode == 200 && 'x-hipmob-reason' in response.headers && status_updated_pattern.test(response.headers['x-hipmob-reason'])){
			if(callback) callback(false);
		    }else{
			if(callback) callback(new Error(response.headers['x-hipmob-reason']));
		    }
		}catch(e){
		    if(callback) callback(e);
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
	}else if(pattern9.test(reason)){
	    throw new Error("Invalid message content type");
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
	}else if(pattern10.test(reason)){
	    throw new Error("User not found");
	}else if(pattern11.test(reason)){
	    throw new Error("No status specified");
	}else if(pattern12.test(reason)){
	    throw new Error("Invalid status specified");
	}else if(pattern13.test(reason)){
	    throw new Error("You can only change your own status");	    
	}
    }
    
    // CommonJS module is defined
    if(hasModule) {
        module.exports = hipmob;
    }
    
    /*global ender:false */
    if (typeof ender === 'undefined') {
        // here, `this` means `window` in the browser, or `global` on the server
        // add `hipmob` as a global object via a string identifier,
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