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
var sessions = require('ewd-globals-session');

function login(messageObj) {

  var methods = ['POST'];
  var ok = allowed(messageObj.method, methods);
  if (ok.error) return ok;

  var results = sessions.tokenAuthenticate.call(this, messageObj.headers.authorization, true);
  if (results.error) return results;
  if (!results.session) return {
    error: 'Unexpected error - token authenticated, but unable to get session',
    status: {
      code: 500,
      text: 'Internal Server Error'
    }
  };

  var session = results.session;

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

  var response = runRPC.call(this, params, session);
    // need to check response for error ***
  
  params = {
    rpcName: 'XUS AV CODE',
    rpcArgs: [{
      type: 'LITERAL',
      value: accessCode + ';' + verifyCode
    }],
  };

  var response = runRPC.call(this, params, session);
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
    session.authenticated = true;
    session.expiryTime = 3600;
    session.updateExpiry();
    var greeting = values[7];
    var pieces = greeting.split(' ');
    pieces = pieces.splice(2, pieces.length);
    var displayName = pieces.join(' ');
    var results = {
      displayName: displayName,
      greeting: greeting,
      lastSignon: values[8],
      messages: values.splice(8, values.length)
    };
    return results;
  }
}

module.exports = login;
