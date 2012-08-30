//
// get_applications
//
{
    var util = require('util');
    var hipmob = require("./hipmob.js");
    var handle = hipmob(process.env.hipmob_username, process.env.hipmob_password);
    handle.get_applications(function(err, apps){
	console.log("------------------------ get_applications ---------------------------------------");
	if(apps && 'length' in apps){
	    var i, len = apps.length;
	    console.log(len + " apps were found.");
	    for(i=0;i<len;i++){
		console.log((i+1)+": "+apps[i]);
	    }
	}else{
	    console.log("No apps were available.");
	}
	console.log("\r\n");
    });
}

//
// get_application
//
{
    var util = require('util');
    var hipmob = require("./hipmob.js");
    var handle = hipmob(process.env.hipmob_username, process.env.hipmob_password);
    handle.get_application(process.env.hipmob_app, function(err, app){
	console.log("------------------------ get_application ----------------------------------------");
	console.log("--->["+app+"]");
	//console.log(util.inspect(response));
	console.log("\r\n");
    });
}

//
// verify
//
{
    var util = require('util');
    var hipmob = require("./hipmob.js");
    var handle = hipmob(process.env.hipmob_username, process.env.hipmob_apikey);
    handle.get_device(process.env.hipmob_app, '123', true, function(err, dev){
	console.log("------------------------ verify_device_exists -----------------------------------");
	if(!err) console.log(dev); else console.log(err); 
	console.log("\r\n");
    });
    
    handle.get_device(process.env.hipmob_app, '7819157D-41BA-4214-A35D-8B48E1930FDF', true, function(err, dev){ 
	console.log("------------------------ verify_device_exists -----------------------------------");
	if(!err) console.log("["+dev+"]"); else console.log(err); 
	console.log("\r\n");
    });
}

//
// get device details
//
{
    var util = require('util');
    var hipmob = require("./hipmob.js");
    var handle = hipmob(process.env.hipmob_username, process.env.hipmob_apikey);
    var dev = handle.get_device(process.env.hipmob_app, '7819157D-41BA-4214-A35D-8B48E1930FDF', false);
    dev.load(function(err, devres){ 
	console.log("------------------------ get_device_details -------------------------------------");
	if(!err){ console.log(devres+": ["+devres.created()+"]"); }else{ console.log(err); }
	console.log("\r\n");
    });
}

//
// get pending message count
//
{
    var util = require('util');
    var hipmob = require("./hipmob.js");
    var handle = hipmob(process.env.hipmob_username, process.env.hipmob_apikey);
    var dev = handle.get_device(process.env.hipmob_app, '7819157D-41BA-4214-A35D-8B48E1930FDF', false);
    dev.available_message_count(function(err, count){
	console.log("------------------------ available_message_count --------------------------------");
	if(!err){ console.log("Available messages: "+count); }else{ console.log(err); }
	console.log("\r\n");
    });
}

//
// send text message
//
{
    var util = require('util');
    var hipmob = require("./hipmob.js");
    var handle = hipmob(process.env.hipmob_username, process.env.hipmob_apikey);
    var dev = handle.get_device(process.env.hipmob_app, '7819157D-41BA-4214-A35D-8B48E1930FDF', false);
    dev.send_text_message("Message 1.");
    dev.send_text_message("Message 2.", function(err){
	console.log("------------------------ send_text_messages -------------------------------------");
	if(!err){ console.log("Message sent."); }else{ console.log(err); }
	console.log("\r\n");
    });
}
