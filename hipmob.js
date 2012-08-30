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
    }
    
    HipmobApp.prototype = {
	toString : function () {
            return this.toString();
        }
    };

    // Hipmob device prototype
    function HipmobDevice(hipmob, app, deviceid, full, source)
    {
	var hipmob = hipmob;
	var app = appid;
	var id = deviceid;
	var platform = full ? source['platform'] : false;
	var version = full ? source['version'] : false;
	var created = full ? source['created'] : false;
	var modified = full && 'modified' in source ? source['modified'] : false;
	var userdata = full && 'userdata' in source ? source['userdata'] : {};

	this.toString = function(){
	    return "(HipmobDevice) "+name+" ["+id+"]";
	};

	this.id = function(){ return id; }
	this.app = function(){ return app; }
	this.platform = function(){ return platform; }
	this.version = function(){ return version; }
	this.created = function(){ return created; }
	this.modified = function(){ return modified; }
	this.userdata = function(){ return userdata; }
    }
    
    HipmobDevice.prototype = {
	toString : function () {
            return this.toString();
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
    }
    
    var hipmob = function(username, password){
	return new Hipmob(username, password);
    };

    var _check_for_errors = function(headers)
    {
	if(!('x-hipmob-reason' in headers)) return;
	var match, reason = headers['x-hipmob-reason'];
	console.log(reason);
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