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

define(["./lsClient"],function(lsClient) {
  
  var loggedIn = false;
  var wasIn = false;
  var TRIM_REGEXP = new RegExp("^\\s*([\\s\\S]*?)\\s*$");
  
  lsClient.addListener({
    
    onListenStart: function() {
      this.onStatusChange(lsClient.getStatus());
    },
    
    onStatusChange: function(newStatus) {

      if (newStatus.indexOf("CONNECTED:") == 0 || newStatus == "STALLED") {
        enableLogin();
        if (wasIn) {
          wasIn = false;
          login.submitNick();
        }
      } else {
        if (loggedIn) {
          logOut();
          showLoginError("Connection Lost");
        }
        disableLogin();
        
      }
     
    }
  });
  
  function enableLogin() {
    document.getElementById("nick_button").disabled = false;
    document.getElementById("user_nick").disabled = false;
    hideLoginError();
  }
  function disableLogin() {
    document.getElementById("nick_button").disabled = true;
    document.getElementById("user_nick").disabled = true;
  }

  function letsGo(userName,changed) {
    loggedIn = true;
    hideLoginError();
    disableLogin();
    
    readyFun(userName,changed);
  }
  
  function logOut() {
    loggedIn = false;
    wasIn = true;
    login.init();
    
    stopFun();
  }

  function showLoginError(text) {
    document.getElementById("errorDiv").innerHTML = text;
    document.getElementById("errorDiv").style.display = "";
  }

  function hideLoginError() {
    document.getElementById("errorDiv").style.display = "none";
  }

  var readyFun = function(){};
  var stopFun = function(){};
  
  var login = {
    
      
    init: function(callback,callbackStop) {
      readyFun = callback || readyFun;
      stopFun = callbackStop || stopFun;
      hideLoginError();
      document.getElementById('user_nick').focus();
    },
    
    submitNick: function() {
      
      hideLoginError();
      
      if (document.getElementById("user_nick")) {
        var text = document.getElementById("user_nick").value;
        
        if (text === null || text === "") {
          showLoginError("Please choose a nickname");
        } else {
          text = text.replace(TRIM_REGEXP,"$1");
          
          if (text.indexOf(" ") != -1) {
            showLoginError("Space character is not allowed in the nickname");              
          } else if (text.indexOf("_") != -1) {
            showLoginError("Underscore character is not allowed in the nickname");              
          } else {
            myNick = text;
            
            disableLogin();
            lsClient.sendMessage("n|"+myNick, "Nick", 3000, {
              onAbort: function(originalMex, snt) {
                enableLogin();
                showLoginError("Unexpected error. Please try again.");
              },
              onDeny: function(originalMex, code, message) {
              
                if ( code == -2720 ) {
                  letsGo(message,true);
                } else {
                  enableLogin();
                  showLoginError(message);
                }
              },
              onDiscarded: function(originalMex) {
                enableLogin();
                showLoginError("Unexpected error. Please try again.");
              },
              onError: function(originalMex) {
                enableLogin();
                showLoginError("Unexpected error. Please try again.");
              },
              onProcessed: function(originalMex) {
                // OK.
                letsGo(myNick,false);
              }
            });      
          }
        }
      }
    }
  };
  
  return login;
  
});