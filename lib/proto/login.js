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

function login(messageObj, sessions) {

  var methods = ['POST'];
  var ok = allowed(messageObj.method, methods);
  if (ok.error) return ok;

  var accessCode = messageObj.body.accessCode;
  if (!accessCode || accessCode === '') return {
    error: 'Missing access code',
    status: {
      code: 403,
      text: 'Forbidden'
    }
  };

  var verifyCode = messageObj.body.verifyCode;
  if (!verifyCode || verifyCode === '') return {
    error: 'Missing verify code',
    status: {
      code: 403,
      text: 'Forbidden'
    }
  };

  var params = {
    rpcName: 'XUS SIGNON SETUP'
  };
  // Don't save the symbol table yet!

  var response = runRPC.call(this, params, session, false);
  
  params = {
    rpcName: 'XUS AV CODE',
    rpcArgs: [{
      type: 'LITERAL',
      value: accessCode + ';' + verifyCode
    }],
  };

  var response = runRPC.call(this, params, session, false);
  console.log('login response: ' + JSON.stringify(response));
  var values = response.value;
  var duz = values[0];
  var err = values[3]
  if (duz === '0' && err !== '') {
    return {
      error: err,
      status: {
        code: 403,
        text: 'Forbidden'
      }
    };
  }
  else {
    // logged in successfully

    // create session and save symbol table to it...

    var session = sessions.create('vista', 1200); // 20 minutes timeout

    ok = this.db.symbolTable.save(session);
    // clean up the back-end Cache/GT.M process:
    ok = this.db.symbolTable.clear();

    session.authenticated = true;

    if (this.vistARPC && this.vistARPC.context) {
      session.data.$('VistA').$('context').value = this.vistARPC.context;
    }

    // return response

    var greeting = values[7];
    var pieces = greeting.split(' ');
    pieces = pieces.splice(2, pieces.length);
    var displayName = pieces.join(' ');

    var results = {
      token: session.token,
      displayName: displayName,
      greeting: greeting,
      lastSignon: values[8],
      messages: values.splice(8, values.length)
    };
    return results;
  }
}

module.exports = login;
