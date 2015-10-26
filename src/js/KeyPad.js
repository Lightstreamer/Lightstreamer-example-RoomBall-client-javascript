/*
Copyright (c) Lightstreamer Srl

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

define(["./AxisControl"], function(AxisControl) {
  
  var rightLeft = new AxisControl(39,37);
  var upDown = new AxisControl(38,40);
  var cbMaster = function() {};
  
  
  var activeEvents = false;
  var activeMasterEvent = false; 
  
  var idle = true;
  var idleMaster = false;

  function addEvent(evnt, handler){ 
    if (document.body.addEventListener) {
        document.body.addEventListener(evnt, handler, false);
    } else {
        document.body.attachEvent("on"+evnt, handler);
    }
  }

  function KeyDown(e) {
    if (idle) {
      return;
    }
    var keyId = (window.event) ? event.keyCode : e.keyCode;
    keyId = keyId || e.which;
    
    switch(keyId) {
      case 38: //up
        upDown.goOne();
        break;
      case 39:// right
        rightLeft.goOne();
        break;
      case 40: // down
        upDown.goTwo();
        break;
      case 37: // left
        rightLeft.goTwo();
        break;
    }
  }
  
  function KeyUp(e) {
    var keyId = (window.event) ? event.keyCode : e.keyCode;
    keyId = keyId || e.which;
    
    switch(keyId) {
      case 38: case 87: case 32: //up
        upDown.stopOne();
        break;
      case 39: case 68: // right
        rightLeft.stopOne();
        break;
      case 40: case 83: // down
        upDown.stopTwo();
        break;
      case 37: case 65: // left
        rightLeft.stopTwo();
        break;
    }
    
  }
  
   function checkMasterCmd(e) {
    if (idleMaster) {
      return;
    } 
    var keyId = (window.event) ? event.keyCode : e.keyCode;
    keyId = keyId || e.which;
    
    switch(keyId) {
      case 84: //t
        cbMaster();
        break;
      case 82: //r
        cbMaster(true);
        break;
    }
    
  }
  
  return {
    startListening: function() {
      if (!activeEvents) {
        addEvent("keyup", KeyUp); 
        addEvent("keydown", KeyDown); 
        activeEvents = true;
      }
      
      idle = false;
    },
    
    stopListening: function() {
      upDown.stop();
      rightLeft.stop();
      
      idle = true;
    },
    
    listenMasterCommands: function(callback) {
      if (!activeMasterEvent) {
        activeMasterEvent = true;
        addEvent("keydown", checkMasterCmd); 
      }
      cbMaster = callback || cbMaster;
      
      idleMaster = false;
    },
    
    stopMasterCommands: function() {
      idleMaster = true;
    }
  };
  
  
});