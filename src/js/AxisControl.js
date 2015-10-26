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

define(["./lsClient"],function(lsClient) {
  
  var AxisControl = function(key1,key2) {
    this.key1 = key1;
    this.key2 = key2;
    
    this.going1 = false;
    this.going2 = false;
  };
  
  function keyup(key) {
    send(key*10);
  }
  function keydown(key) {
    send(key);
  }
  function send(key) {
    var status = lsClient.getStatus();
    if (status == "STALLED" || status.indexOf("CONNECTED:") == 0) {
      lsClient.sendMessage(key, "InputKey", 1000);
    }
  }
  
  AxisControl.prototype = {
      
      goOne: function() {
        if (this.going2) {
          this.going2 = false;
          keyup(this.key2);
        }
        if (!this.going1) {
          this.going1 = true;
          keydown(this.key1);
        } 
      },
      
      stopOne:function() {
        if (this.going1) {
          this.going1 = false;
          keyup(this.key1);
        } 
      },
      
      goTwo: function() {
        if (this.going1) {
          this.going1 = false;
          keyup(this.key1);
        }
        if (!this.going2) {
          this.going2 = true;
          keydown(this.key2);
        } 
      },
      
      stopTwo:function() {
        if (this.going2) {
          this.going2 = false;
          keyup(this.key2);
        } 
      },
      
      stop: function() {
        if (this.going1) {
          this.going1 = false;
          keyup(this.key1);
        } else if (this.going2) {
          this.going2 = false;
          keyup(this.key2);
        }
        
      }
      
  };
  
  return AxisControl;
  
  
  
});