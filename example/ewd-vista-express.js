/*

 ----------------------------------------------------------------------------
 | ewd-qoper8.js: Node.js Queue and Multi-process Manager                   |
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

  26 January 2016

  Demonstrates use of vista1.js worker module which connects each
  worker process to the Cache database, intergrated with Express

  This version makes use of the ewd-qoper8-cache module for connecting
  Cache to an ewd-qoper8 worker process

    start using:

      node frontend2

    You may need to run this as sudo due to Cache permissions

*/

var express = require('express');
var bodyParser = require('body-parser');
var qoper8 = require('ewd-qoper8');
var qx = require('ewd-qoper8-express');
var sessions = require('ewd-globals-session');

var app = express();
app.use(bodyParser.json());

var q = new qoper8.masterProcess();
qx.addTo(q);

app.use('/vista', qx.router());

q.on('started', function() {

  // Worker processes will load the vista1.js module:

  this.worker.module = 'ewd-qoper8-vistarpc/example/vista-worker-module';
  this.setWorkerIdleLimit(300000);
  sessions.garbageCollector(q);
  app.listen(8080);
});

q.start();

