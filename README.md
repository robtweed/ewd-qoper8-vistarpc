# ewd-qoper8-vistarpc: Plug-in ewd-qoper8 module to enable REST access to VistA RPCs
 
Rob Tweed <rtweed@mgateway.com>  
24 February 2016, M/Gateway Developments Ltd [http://www.mgateway.com](http://www.mgateway.com)  

Twitter: @rtweed

Google Group for discussions, support, advice etc: [http://groups.google.co.uk/group/enterprise-web-developer-community](http://groups.google.co.uk/group/enterprise-web-developer-community)


## ewd-qoper8-vistarpc

This plug-in module for ewd-qoper8 and Express provides the worker module support to access VistA RPCs

VistA is the Open Source Electronic Healthcare Record used by the US Dept of Veterans Affairs.

For details on ewd-qoper8, see:
  [http://gradvs1.mgateway.com/download/ewd-qoper8.pdf](http://gradvs1.mgateway.com/download/ewd-qoper8.pdf)

## Installing

       npm install ewd-qoper8-vistarpc
	   
## Using ewd-qoper8-vistarpc

A working example is provided in the /example directory.

The master process is defined in /example/ewd-vista/express

The worker process module is /example/vista-worker-module

### Preparation

Currently the example is designed for use with VistA running on an InterSystems' Cache database platform.

You'll need to install the following:

       npm install express
       npm install body-parser
       npm install ewd-qoper8
       npm install ewd-qoper8-express
       npm install ewd-qoper8-cache
       npm install ewd-globals-session
       npm install ewd-qoper8-vistarpc       

The worker module (/example/vista-worker-module.js) assumes that the VistA database is in a Cache namespace called 'VISTA', and
that Cache is installed in /opt/cache.

To adapt the module for use with your system, edit the params object within these lines in the worker module:

      var connectCacheTo = require('ewd-qoper8-cache');
      var params = {
        namespace: 'VISTA'
      };
      connectCacheTo(this, params);

You can specify any or all of the following properties of params:

- path: The path of your Cache system's MGR directory (/opt/cache/mgr)
- username: The username for connecting to Cache (_SYSTEM)
- password: This password for connecting to Cache (SYS)
- namespace: The Cache namespace to connect to (USER)

You need to also make sure that you install two Cache routines into the namespace you'll be connecting to:

- ewdSymbolTable.m which you'll find in the ewd-globals-session module directory in the path /mumps.  Save and compile this with the
routine name ewdSymbolTable
- ewdVistARPC.m which you'll find in the ewd-qoper8-vistarpc module directory in the path /mumps.  Save and compile this with the
routine name ewdVistARPC

By default, the master process (/example/ewd-vista-express.js) will start Express and tell it to listen on port 8080.
If you want to use a different port, edit this line in the master process file:

        app.listen(8080);

By default, ewd-qoper8 will use a worker pool-size of 1.  If you want it to make more workers available to ewd-qoper8, 
simply add the following lines after the app.listen line:

        q.on('start', function() {
          this.setWorkerPoolSize(3);
        });

### Start Express and ewd-qoper8

Make sure you're in the directory you were in when you installed all the Node.js modules

       node node_modules/ewd-qoper8-vistarpc/example/ewd-vista-express

You may need to do this as sudo, depending on the permissions settings for Express and Cache.

You should see the following:

        Worker Bootstrap Module file written to node_modules/ewd-qoper8-worker.js
        ========================================================
        ewd-qoper8 is up and running.  Max worker pool size: 1
        ========================================================
        Session Garbage Collector has started

Express will now be running and listening on port 8080 (or whatever you may have changed it to)

### Using ewd-qoper8-vistarpc

Use a REST Client (eg Chrome Advanced REST Client)

The first thing you need to do is send an initiate request.  This starts a new, as yet unauthenticated Session with an initial
MUMPS/VistA symbol table:

       GET http://192.168.1.100:8080/vista/initiate

       (change the IP address and port as required)

You should get back a response similar to this:

      {
        "Authorization": "02d3ad03-87eb-495c-ba86-437cfd99a266"
        "key": "e609e99713c34bf4b8028bcfc79bad5e"
        "iv": 9188054014695808
      }

Currently the key and iv aren't used - high-security login will be supported in the next release.

Copy and paste the value of the Authorization property (without the quotes) into the REST Client's Authorization Header field.
Also set the Content-Type to application/json

Now login.  You'll need to know a valid VistA Access and Verify code:


       POST http://192.168.1.100:8080/vista/initiate

The data payload should be a JSON document containing the Access and Verify codes, eg:

      {
        "accessCode": "mYAccessC0de!",
        "verifyCode": "mYver1fYC0de#"
      }

If the credentials aren't correct you'll get an HTTP error response back. Otherwise you should see a VistA
welcome/login object returned, eg:


      {
        "displayName": "CHERYL"
        "greeting": "Good afternoon CHERYL"
        "lastSignon": " You last signed on today at 12:39"
        "messages": [5]
        0: " You last signed on today at 12:39"
        1: "You have 311 new messages. (311 in the 'IN' basket)"
        2: ""
        3: "Enter '^NML' to read your new messages."
        4: "You've got PRIORITY mail!" -
      }

You can now run any RPC that the logged in user has access rights to use:

       POST http://192.168.1.100:8080/vista/runRPC/[RPC Name]

eg

       POST http://192.168.1.100:8080/vista/runRPC/DDR GETS ENTRY DATA

Note: you may need to URL escape the spaces within the RPC name with %23

The payload should be a JSON object that defines the RPC arguments, eg:

      [
        {
          "type": "LIST",
          "value": {
            "FILE": "200",
            "FIELDS": ".01",
            "IENS": ".5,",
            "FLAGS": "IE"
          }
        }
      ]

For the above example, if successful you should see a response such as:

      {
        "type": "ARRAY"
        "value": {
          1: "[Data]"
          2: "200^.5^.01^POSTMASTER^POSTMASTER"
        } -
      }


Make sure all requests have the Authorization header set to the token returned by the original /initiate request, and
that their Content-Type is application/json


## License

 Copyright (c) 2016 M/Gateway Developments Ltd,                           
 Reigate, Surrey UK.                                                      
 All rights reserved.                                                     
                                                                           
  http://www.mgateway.com                                                  
  Email: rtweed@mgateway.com                                               
                                                                           
                                                                           
  Licensed under the Apache License, Version 2.0 (the "License");          
  you may not use this file except in compliance with the License.         
  You may obtain a copy of the License at                                  
                                                                           
      http://www.apache.org/licenses/LICENSE-2.0                           
                                                                           
  Unless required by applicable law or agreed to in writing, software      
  distributed under the License is distributed on an "AS IS" BASIS,        
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. 
  See the License for the specific language governing permissions and      
   limitations under the License.      
