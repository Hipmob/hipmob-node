var util = require('util');
var functions = {};

//
// get_applications
//
functions['get_apps'] = function(next){
    var hipmob = require("./hipmob.js");
    //var handle = hipmob(process.env.hipmob_username, process.env.hipmob_apikey);
    console.log(process.env.hipmob_url);
    var handle = hipmob(process.env.hipmob_url);
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

	if(typeof next == 'function') next();
    });
}

//
// get_application
//
functions['get_app'] = function(next){
    var hipmob = require("./hipmob.js");
    var handle = hipmob(process.env.hipmob_username, process.env.hipmob_apikey);
    handle.get_application(process.env.hipmob_app, function(err, app){
	console.log("------------------------ get_application ----------------------------------------");
	console.log("--->["+app+"]");
	//console.log(util.inspect(response));
	console.log("\r\n");

	if(typeof next == 'function') next();
    });
};

//
// verify
//
functions['verify_device'] = function(next){
    var hipmob = require("./hipmob.js");
    var handle = hipmob(process.env.hipmob_username, process.env.hipmob_apikey);
    handle.get_device(process.env.hipmob_app, '123', true, function(err, dev){
	console.log("------------------------ verify_device_exists -----------------------------------");
	if(!err) console.log(dev); else console.log(err); 
	console.log("\r\n");

	handle.get_device(process.env.hipmob_app, '7819157D-41BA-4214-A35D-8B48E1930FDF', true, function(err, dev){ 
	    console.log("------------------------ verify_device_exists -----------------------------------");
	    if(!err) console.log("["+dev+"]"); else console.log(err); 
	    console.log("\r\n");
	    
	    if(typeof next == 'function') next();
	});
    });
};

//
// get device details
//
functions['get_device_details'] = function(next){
    var hipmob = require("./hipmob.js");
    var handle = hipmob(process.env.hipmob_username, process.env.hipmob_apikey);
    var dev = handle.get_device(process.env.hipmob_app, '7819157D-41BA-4214-A35D-8B48E1930FDF', false);
    dev.load(function(err, devres){ 
	console.log("------------------------ get_device_details -------------------------------------");
	if(!err){ console.log(devres+": ["+devres.created()+"]"); }else{ console.log(err); }
	console.log("\r\n");

	if(typeof next == 'function') next();
    });
};

//
// get pending message count
//
functions['get_pending_message_count'] = function(next){
    var hipmob = require("./hipmob.js");
    var handle = hipmob(process.env.hipmob_username, process.env.hipmob_apikey);
    var dev = handle.get_device(process.env.hipmob_app, '7819157D-41BA-4214-A35D-8B48E1930FDF', false);
    dev.available_message_count(function(err, count){
	console.log("------------------------ available_message_count --------------------------------");
	if(!err){ console.log("Available messages: "+count); }else{ console.log(err); }
	console.log("\r\n");

	if(typeof next == 'function') next();
    });
};

//
// check device status
//
functions['check_device_status'] = function(next){
    var hipmob = require("./hipmob.js");
    var handle = hipmob(process.env.hipmob_username, process.env.hipmob_apikey);
    var dev = handle.get_device(process.env.hipmob_app, '7819157D-41BA-4214-A35D-8B48E1930FDF', false);
    dev.check_device_status(function(err, online){
	console.log("-------------------------- check_device_status ----------------------------------");
	if(!err){ console.log("Device Online? "+online); }else{ console.log(err); }
	console.log("\r\n");

	if(typeof next == 'function') next();
    });
};

//
// send text message
//
functions['send_text'] = function(next){
    var hipmob = require("./hipmob.js");
    var handle = hipmob(process.env.hipmob_username, process.env.hipmob_apikey);
    var dev = handle.get_device(process.env.hipmob_app, '7819157D-41BA-4214-A35D-8B48E1930FDF', false);
    dev.send_text_message("Message 1.");
    dev.send_text_message("Message 2.", function(err){
	console.log("------------------------ send_text_messages -------------------------------------");
	if(!err){ console.log("Message sent."); }else{ console.log(err); }
	console.log("\r\n");

	if(typeof next == 'function') next();
    });
};

//
// send picture message
//
functions['send_picture'] = function(next){
    var hipmob = require("./hipmob.js");
    var handle = hipmob(process.env.hipmob_username, process.env.hipmob_apikey);
    var dev = handle.get_device(process.env.hipmob_app, '7819157D-41BA-4214-A35D-8B48E1930FDF', false);
    dev.send_picture_message("./testdata/wheel.png", "image/png", function(err){
	console.log("------------------------ send_picture_message -------------------------------------");
	if(!err){ console.log("Message sent."); }else{ console.log(err); }
	console.log("\r\n");

	if(typeof next == 'function') next();
    });
};

//
// send audio message
//
functions['send_audio'] = function(next){
    var hipmob = require("./hipmob.js");
    var handle = hipmob(process.env.hipmob_username, process.env.hipmob_apikey);
    var dev = handle.get_device(process.env.hipmob_app, '7819157D-41BA-4214-A35D-8B48E1930FDF', false);
    dev.send_audio_message("./testdata/test.mp3", "audio/mp3", function(err){
	console.log("------------------------ send_audio_message -------------------------------------");
	if(!err){ console.log("Message sent."); }else{ console.log(err); }
	console.log("\r\n");

	if(typeof next == 'function') next();
    });
};

//
// list friends
//
var friendlist = false;
functions['list_friends'] = function(next){
    var hipmob = require("./hipmob.js");
    var handle = hipmob(process.env.hipmob_username, process.env.hipmob_apikey);
    var dev = handle.get_device(process.env.hipmob_app, '7819157D-41BA-4214-A35D-8B48E1930FDF', false);
    dev.list_friends(function(err, friends){
	console.log("------------------------ list_friends -------------------------------------------");
	if(!err){
	    if(friends && 'length' in friends){
		var i, len = friends.length;
		console.log(len + " friends were found.");
		for(i=0;i<len;i++){
		    console.log((i+1)+": "+friends[i]);
		}
		friendlist = friends;
	    }else{
		console.log(dev+" has no friends :-(.");
	    }
	}else{
	    console.log(err);
	}
	console.log("\r\n");

	if(typeof next == 'function') next();
    });
};

//
// add friend
//
functions['add_one_friend'] = function(next){
    var hipmob = require("./hipmob.js");
    var handle = hipmob(process.env.hipmob_username, process.env.hipmob_apikey);
    var dev = handle.get_device(process.env.hipmob_app, '7819157D-41BA-4214-A35D-8B48E1930FDF', false);
    var friend = handle.get_device(process.env.hipmob_app, '4322A04D-D292-4b76-8158-781F77FCE7DB', false);
    dev.add_friend(friend, function(err, count){
	console.log("------------------------ add_friend ---------------------------------------------");
	if(err) console.log(err)
	else if(count > 0) console.log(friend + " added.");
	else console.log("No changes made (friend must already be in friend list).");
	console.log("\r\n");

	if(typeof next == 'function') next();
    });
};

//
// add multiple friends
//
functions['add_multiple_friends'] = function(next){
    var hipmob = require("./hipmob.js");
    var handle = hipmob(process.env.hipmob_username, process.env.hipmob_apikey);
    var dev = handle.get_device(process.env.hipmob_app, '7819157D-41BA-4214-A35D-8B48E1930FDF', false);
    var friend1 = handle.get_device(process.env.hipmob_app, '89A84E7A-1F2B-4d80-8F4F-C4A9DDBB486D', false);
    var friend2 = handle.get_device(process.env.hipmob_app, '8D5F7113-78C8-45c8-8BF4-95DC95759017', false);
    dev.add_friends([friend1, friend2], function(err, count){
	console.log("------------------------ add_friends --------------------------------------------");
	if(err) console.log(err)
	else console.log("Added " + count + " friends.");
	console.log("\r\n");

	if(typeof next == 'function') next();
    });
};

//
// remove friend
//
functions['remove_one_friend'] = function(next){
    var hipmob = require("./hipmob.js");
    var handle = hipmob(process.env.hipmob_username, process.env.hipmob_apikey);
    var dev = handle.get_device(process.env.hipmob_app, '7819157D-41BA-4214-A35D-8B48E1930FDF', false);
    var friend = handle.get_device(process.env.hipmob_app, '8D5F7113-78C8-45c8-8BF4-95DC95759017', false);
    dev.remove_friend(friend, function(err, count){
	console.log("------------------------ remove_friend ------------------------------------------");
	if(err) console.log(err)
	else if(count == 1) console.log("Removed "+friend);
	else console.log("No changes made.");
	console.log("\r\n");

	if(typeof next == 'function') next();
    });
};

//
// remove multiple friend
//
functions['remove_multiple_friends'] = function(next){
    var hipmob = require("./hipmob.js");
    var handle = hipmob(process.env.hipmob_username, process.env.hipmob_apikey);
    var dev = handle.get_device(process.env.hipmob_app, '7819157D-41BA-4214-A35D-8B48E1930FDF', false);
    var friend1 = handle.get_device(process.env.hipmob_app, '89A84E7A-1F2B-4d80-8F4F-C4A9DDBB486D', false);
    var friend2 = handle.get_device(process.env.hipmob_app, '4322A04D-D292-4b76-8158-781F77FCE7DB', false);
    dev.remove_friends([friend1, friend2], function(err, count){
	console.log("------------------------ remove_friends -----------------------------------------");
	if(err) console.log(err)
	else console.log("Removed "+count+" friends.");
	console.log("\r\n");
	
	if(typeof next == 'function') next();
    });
};

//
// remove all friends
//
functions['remove_all_friends'] = function(next){
    var hipmob = require("./hipmob.js");
    var handle = hipmob(process.env.hipmob_username, process.env.hipmob_apikey);
    var dev = handle.get_device(process.env.hipmob_app, '7819157D-41BA-4214-A35D-8B48E1930FDF', false);
    dev.remove_all_friends(function(err, count){
	console.log("------------------------ remove_all_friends -------------------------------------");
	if(err) console.log(err)
	else console.log("Removed "+count+" friends.");
	console.log("\r\n");
	
	if(typeof next == 'function') next();
    });
};

//
// set friends
//
functions['set_friends'] = function(next){
    var hipmob = require("./hipmob.js");
    var handle = hipmob(process.env.hipmob_username, process.env.hipmob_apikey);
    var dev = handle.get_device(process.env.hipmob_app, '7819157D-41BA-4214-A35D-8B48E1930FDF', false);
    var friendlist = [ handle.get_device(process.env.hipmob_app, '5813cd68-402f-4836-8f9e-acf1aaaf937d', false),
		       handle.get_device(process.env.hipmob_app, '9177CBAF-81C0-4b73-9C2F-F04481D32F98', false),
		       handle.get_device(process.env.hipmob_app, '23275FF9-8511-42a3-A981-F438BEBDB5AB', false),
		       handle.get_device(process.env.hipmob_app, '97E27C77-C050-4990-A915-100AEBE856B4d', false) ];
    dev.set_friends(friendlist, function(err, count){
	console.log("------------------------ set_friends --------------------------------------------");
	if(err) console.log(err)
	else console.log("Added " + count + " friends.");
	console.log("\r\n");

	if(typeof next == 'function') next();
    });
}

//
// reset friends
//
functions['reset_friends'] = function(next){
    var hipmob = require("./hipmob.js");
    var handle = hipmob(process.env.hipmob_username, process.env.hipmob_apikey);
    var dev = handle.get_device(process.env.hipmob_app, '7819157D-41BA-4214-A35D-8B48E1930FDF', false);
    dev.set_friends(friendlist, function(err, count){
	console.log("------------------------ set_friends --------------------------------------------");
	if(err) console.log(err)
	else console.log("Added " + count + " friends.");
	console.log("\r\n");

	if(typeof next == 'function') next();
    });
}

//
// send JSON message
//
functions['send_json'] = function(next){
    var hipmob = require("./hipmob.js");
    var handle = hipmob(process.env.hipmob_username, process.env.hipmob_apikey);
    var dev = handle.get_device(process.env.hipmob_app, 'jsontest', false);
    dev.send_json_message({ "id": "json test", "value": ["1", "2", "3"] }, function(err){
	console.log("------------------------ send_json_message -------------------------------------");
	if(!err){ console.log("Message sent."); }else{ console.log(err); }
	console.log("\r\n");

	if(typeof next == 'function') next();
    });
};

//
// send binary message
//
functions['send_binary'] = function(next){
    var hipmob = require("./hipmob.js");
    var handle = hipmob(process.env.hipmob_username, process.env.hipmob_apikey);
    var dev = handle.get_device(process.env.hipmob_app, 'jsontest', false);
    var fs = require('fs');
    fs.readFile("./setup.template", function(err, data){
	console.log("------------------------ send_binary_message -------------------------------------");
	if(err){
	    console.log(err);
	    
	    if(typeof next == 'function') next();
	}else{
	    dev.send_binary_message(data, function(err){
		if(!err){ console.log("Message sent."); }else{ console.log(err); }
		console.log("\r\n");
		
		if(typeof next == 'function') next();
	    });
	}
    });
};

//
// get_user
//
functions['get_user'] = function(next){
    var hipmob = require("./hipmob.js");
    var handle = hipmob(process.env.hipmob_username, process.env.hipmob_apikey);
    handle.get_user(process.env.hipmob_username, function(err, user){
	console.log("------------------------ get_user ----------------------------------------");
	console.log("--->["+user+"]");
	//console.log(util.inspect(response));
	console.log("\r\n");

	if(typeof next == 'function') next();
    });
};

//
// set user status
//
functions['set_user_status'] = function(next){
    var hipmob = require("./hipmob.js");
    var handle = hipmob(process.env.hipmob_username, process.env.hipmob_apikey);
    var user = handle.get_user(process.env.hipmob_username, function(err, user){
	var oldstatus = user.status();
	var nstatus = oldstatus == "online" ? "offline" : "online";
	user.set_status(nstatus, function(err){
	    handle.get_user(process.env.hipmob_username, function(err, user2){
		console.log("------------------------ send_text_messages -------------------------------------");
		if(!err){ console.log("Status updated to "+user2.status()); }else{ console.log(err); }
		console.log("\r\n");
		user.set_status(oldstatus);
		
		if(typeof next == 'function') setTimeout(next, 100);
	    });
	});
    });
};


var run_test_function = function(index, total)
{
    if(index >= total){
	console.log("------>Complete.");
	return;
    }
    var nextIndex = index + 1;
    if(typeof functions[process.argv[index]] == 'function'){
	console.log("------>Running ["+process.argv[index]+"]");
	functions[process.argv[index]](function(){
	    setTimeout(function(){ run_test_function(nextIndex, total); }, 0);
	});
    }else{
	console.log("------>"+process.argv[index]+" could not be found in the test functions object ("+util.inspect(functions)+").");
    }
}

var len = process.argv.length;
if(len > 2){
    run_test_function(2, len);
}else{
    console.log("------>Please specify one or more functions to run.");
    var i = 1;
    for(var x in functions){
	console.log(i+": "+x);
    }
}
