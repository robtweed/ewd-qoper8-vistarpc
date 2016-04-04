/*

 ----------------------------------------------------------------------------
 | ewd-qoper8-vistarpc: VistA RPC Interface for use with ewd-qoper8         |
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

 8 March 2016

*/

var runRPCMessage = require('./runRPCMessage');
var authenticate = require('./authenticate');
var getGlobalArray = require('./getGlobalArray');
var login = require('./login');
var sessions = require('ewd-session');

function httpHandlers() { 

  this.on('DocumentStoreStarted', function() {

    console.log('clearing down ^TMP for ' + process.pid);
    var tmpGlo = new this.documentStore.DocumentNode('TMP');
    tmpGlo.$(process.pid).delete();
    var params = {
      range: {
        from: 'A'
      }
    };
    tmpGlo.forEachChild(params, function(ix, subNode) {
      console.log('clearing down ' + ix + ' nodes');
      subNode.$(process.pid).delete();
    });


    this.db.symbolTable = sessions.symbolTable(this.db);
    sessions.garbageCollector(this);
    sessions.init(this.documentStore);
  });

  // intercept the raw express message event

  this.on('expressMessage', function(messageObj, send, finished) {
 
    if (messageObj.application !== 'vista') {
      this.emit('unknownExpressMessage', messageObj, send, finished);
      return;
    }

    // special handling only for vista messages

    if (messageObj.expressType === 'login') {
      var results = login.call(this, messageObj, sessions);
      finished(results);
      return;
    }
    // all other messages must first be authenticated...
    var session = authenticate(messageObj, sessions);
    console.log('**** session = ' + JSON.stringify(session));
    if (session.error) {
      finished(session);
      return;
    }

    if (messageObj.expressType === 'runRPC') {
      var results = runRPCMessage.call(this, messageObj, session);
      finished(results);
      return;
    }

    if (messageObj.expressType === 'GLOBAL_ARRAY') {
      var results = getGlobalArray.call(this, messageObj, session);
      finished(results);
      return;
    }

    var ok = this.emit('VistAMessage', messageObj, session, send, finished);
    if (!ok) {
      var results = {
        error: 'No handler found for ' + messageObj.path + ' message'
      };
      finished(results);
    }
  });
}

module.exports = httpHandlers;
