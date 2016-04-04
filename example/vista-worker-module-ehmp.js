/*

 ----------------------------------------------------------------------------
 | ewd-vista-rpc: VistA RPC REST interface using ewd-qoper8                 |
 |                                                                          |
 | Copyright (c) 2016 M/Gateway Developments Ltd,                           |
 | Reigate, Surrey UK.                                                      |
 | All rights reserved.                                                     |
 |                                                                          |
 | http://www.mgateway.com                                                  |
 | Email: rtweed@mgateway.com                                               |
 |                                                                          |
 |                                                                          |
 | Licensed under the Apache License, Version 2.0 (the "License");          |
 | you may not use this file except in compliance with the License.         |
 | You may obtain a copy of the License at                                  |
 |                                                                          |
 |     http://www.apache.org/licenses/LICENSE-2.0                           |
 |                                                                          |
 | Unless required by applicable law or agreed to in writing, software      |
 | distributed under the License is distributed on an "AS IS" BASIS,        |
 | WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. |
 | See the License for the specific language governing permissions and      |
 |  limitations under the License.                                          |
 ----------------------------------------------------------------------------

  4 April 2016

*/

// ewd-qoper8 Worker Module example which implements VistA RPC access on a Cache system


module.exports = function() {

  // load standard qoper8-express formatted message handlers:

  var handleExpressMessage = require('ewd-qoper8-express').workerMessage;

  // load VistA RPC-specific handlers

  var vistaRPC = require('ewd-qoper8-vistarpc');

  this.on('start', function(isFirst) {

    // set up standard VistA RPC message handlers (initiate, login and authentication)
    vistaRPC.httpHandlers.call(this);
    this.vistARPC = {
      context: 'HMP UI CONTEXT',
      cleardown: {
        'HMP WRITEBACK ALLERGY': ["ALLERGY", "GMRA", "HMPF"]
      }
    };

    // handler to catch all other vista.* requests

    this.on('VistAMessage', function(messageObj, session, send, finished) {
      console.log('*** VistAMessage: ' + session.id);
      finished({error: 'No handler defined for VistA messages of type ' + messageObj.expressType});
    });

    // connect worker to Cache and start globalStore abstraction

    var connectCacheTo = require('ewd-qoper8-cache');
    var params = {
      path: '/usr/cachesys/mgr',
      namespace: 'VISTA'
    };
    connectCacheTo(this, params);

  });

  this.on('message', function(messageObj, send, finished) {
    var expressMessage = handleExpressMessage.call(this, messageObj, send, finished);
  });

};
