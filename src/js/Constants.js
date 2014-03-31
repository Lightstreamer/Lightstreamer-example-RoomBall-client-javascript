define(function(){
  var protocolToUse = document.location.protocol != "file:" ? document.location.protocol : "http:";
  return {
    ADAPTER: "ROOMBALL",
    SERVER: protocolToUse+"//localhost:8080"
  };
});
  