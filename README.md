hipmob-node
===========

Hipmob Node bindings

## Installation

Download the latest version of the Hipmob server API Node bindings with:

    git clone https://github.com/Hipmob/hipmob-node

To get started, add the following to your Node file:

    var hipmob = require("hipmob");

Simple usage looks like:

    var util = require("util");
    var handle = hipmob('your-username','your-api-key');
    handle.get_applications(function(err, applist){
        console.log(util.inspect(applist));
    });

## Documentation

Please see https://www.hipmob.com/documentation/api.html for detailed documentation.



