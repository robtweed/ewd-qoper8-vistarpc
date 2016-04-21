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

 21 April 2016

*/

var allowed = require('./allowed');
var runRPC = require('./runRPC');

module.exports = function(messageObj, session) {
  var methods = ['POST', 'PUT'];
  var ok = allowed(messageObj.method, methods);
  if (ok.error) return ok;

  var params = {
    rpcName: messageObj.params['0'],
    rpcArgs: messageObj.body
  };
  if (messageObj.query) {
    if (messageObj.query.format) params.format = messageObj.query.format;
    if (messageObj.query.context) params.context = messageObj.query.context;
    if (messageObj.query.returnGlobalArray === 'true') params.returnGlobalArray = true;
  }
  return runRPC.call(this, params, session);
};

