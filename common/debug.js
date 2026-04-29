const debugMsg = function (generalValues, localDebugOverride, debugLevel, functionName, lineNumber, errorMessage, errorCode, mitigationHints, explanationHints, ) {

  /** 
   * functionName: the name of the function the error occured - can be derived from function.name
   * 
   * errorLevel: any of the values defined in errorLevel.js - actual designated could be 'error', 'warning', 'info';  'debug' would use another function
   * 
   * errorMessage: the message itself
   * 
   * errorCode: an error code that a function can use to simplify additional actions followed by displaying the error message itself (TBD)
   * 
   * mitigationHints: future set of messages that could be displayed in addition to an error message (perhaps, here only the code and loaded from another resource, like mitigationHints.js)
   * 
   * explanationHints: future set of messages that could be displayed in addition to an error message (perhaps, here only the code and loaded from another resource, like explanationHints.js)
   * 
   * Example: debugMsg(generalValues, localDebugOn, 5, "main", 354, "Hello from outside ?",0,0,0)
  */
  // generalValues.DebugOn could be set upon start of program - this is handy if any debug is still enabled but for any reason should be silenced for now
  if ( generalValues.enableDebugOn === true || generalValues.globalDebug === true ) {
    
    if( localDebugOverride === true) {
      //let documentLocation = 0
      //let msgType = errorLevel
      //let cellID = 0
      let constructedMessage = `${functionName}() ${lineNumber}: ${errorMessage}`

      if (generalValues.enabledDebugLevel >= debugLevel) { 
        //documentMain.getElementById(cellID).style.color = msgColor;
        //const cellLabel = documentMain.createElement("text")
        //cellLabel.innerHTML = `<p>${msgType}: ${constructedMessage}`
        //documentMain.getElementById(cellID).appendChild(cellLabel);

        console.log(constructedMessage)  
      }
    }
  }
}


/**
function functionName() 
{
   var myName = arguments.callee.toString();
   myName = myName.substr('function '.length);
   myName = myName.substr(0, myName.indexOf('('));

   return(myName);
}
 */

export {debugMsg/** , functionName */}