const displayMsg = function (documentMain, functionName, lineNumber, errorLevel, errorMessage, errorCode, mitigationHints, explanationHints) {

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
   * Example: displayMsg(document, "main", 354, "info", "Hello from outside ?",0,0,0)
  */
  let documentLocation = 0
  let msgType = errorLevel
  let cellID = 0
  let constructedMessage = `${functionName}() ${lineNumber}: ${errorMessage}`
  let msgColor = 0
  
  switch (errorLevel) {
    case "error":  { msgType = "ERROR"; cellID=`error-message`; msgColor="red"} break;
    case "warn":  { msgType = "WARNING"; cellID=`error-message`; msgColor="orange"} break;
    case "info":  { msgType = "INFO"; cellID=`misc-message`; msgColor="blue"} break;
    default: { msgType = "FATAL"; cellID=`error-message`; constructedMessage = `displayMsg() 23: no valid errorLevel found: errorLevel=${errorLevel}`; console.log(`displayMsg() 23: no valid errorLevel found: errorLevel=${errorLevel}`) }

  }
  
  documentMain.getElementById(cellID).style.color = msgColor;
  const cellLabel = documentMain.createElement("text")
  cellLabel.innerHTML = `<p>${msgType}: ${constructedMessage}`
  documentMain.getElementById(cellID).appendChild(cellLabel);
}

export default displayMsg