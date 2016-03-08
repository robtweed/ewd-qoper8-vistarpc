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

 29 February 2016

*/

var allowed = require('./allowed');
var runRPC = require('./runRPC');

function initiate(messageObj, sessions) {
  var methods = ['GET'];
  var ok = allowed(messageObj.method, methods);
  if (ok.error) return ok;
  var session = sessions.create('vista', 300);
  var key;
  var iv;
  var encrypt = true; // default unless explicitly over-ridden!
  if (this.vista && this.vista.encryptAVCode === false) encrypt = false;
  if (encrypt) {
    key = sessions.uuid.replace(/-/g, '');
    var cipher = session.data.$('cipher');
    cipher.$('key').value = key;
    var low = 1000000000000000;
    var high = 9999999999999999;
    iv = Math.floor(Math.random() * (high - low) + low);
    cipher.$('iv').value = iv;
  }
  var params = {
    rpcName: 'XUS SIGNON SETUP'
  };
  var response = runRPC.call(this, params, session);
  var results = {
    Authorization: session.token,
    key: key,
    iv: iv
  };
  return results;
}

module.exports = initiate;
