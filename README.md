hipmob-node
===========

Hipmob Node bindings

## Installation

Download the latest version of the Hipmob server API Node bindings with:

    git clone https://github.com/Hipmob/hipmob-node

To get started, add the following to your Node file:

   var hipmob = require("hipmob");

Simple usage looks like:

    hipmob.setup('your-username','your-api-key');
    var apps = hipmob.get_applications();
    console.log(util.inspect(apps));

## Documentation

Please see https://www.hipmob.com/documentation/api.html for detailed documentation.



