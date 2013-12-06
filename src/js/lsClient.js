/*
Copyright 2013 Weswit s.r.l.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

//////////////// Connect to current host (or localhost) and configure a StatusWidget
define(["LightstreamerClient"],function(LightstreamerClient) {
  //var lsClient = new LightstreamerClient("http://push.lightstreamer.com","ROOM");
  var lsClient = new LightstreamerClient(null,"ROOM");
  lsClient.connect();

  return lsClient;
});

