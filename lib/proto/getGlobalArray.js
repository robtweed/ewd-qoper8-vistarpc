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

 4 April 2016

*/

var allowed = require('./allowed');

module.exports = function(messageObj, session) {
  
  var methods = ['GET'];
  var ok = allowed(messageObj.method, methods);
  if (ok.error) return ok;

  var rpcName = messageObj.query.rpcName;
  if (!rpcName || rpcName === '') return {
    error: 'Missing rpcName',
    status: {
      code: 403,
      text: 'Forbidden'
    }
  };
  var ref = session.data.$('GLOBAL_ARRAY').$(rpcName)
  if (ref.exists) {
    return ref.getDocument(); 
  }
  else {
    return {
      error: 'No GLOBAL_ARRAY data available for ' + rpcName,
      status: {
        code: 404,
        text: 'Not Found'
      }
    };
  }
};

