import displayMsg from "../common/displayMsg.js"
import {debugMsg} from "../common/debug.js";

const resultsPerDCDisplay = function (documentMain, generalValues, idLabel, numberOfConfigsPossible, columnsDictArray, resultsPerDCArray) {
  let localDebugOn = false

  // Display the results for the configs per config table with separate entries per DC.
  ///const dataColumns = columnsDictArray.header.length

  for (let actualChassisID = 0; actualChassisID < generalValues.numberOfConfigsPossible; actualChassisID++) {
      resultsPerDCArray[actualChassisID].forEach((item) => {
        
        Object.keys(item).forEach((value) => {
          if (item.numServers > 0 ) {
            // DC is in use - update table cells with actual values computed based on changes applied by user
            item.ChassisItemsDict.forEach((entry) => {
              if (generalValues.globalDebug) {
                if (generalValues.globalDebug == true || localDebugOn == true) {
                debugMsg(generalValues, localDebugOn, 5, "resultsPerDCDisplay", 19, `[chassisID=${actualChassisID},DC=${item.chassisID}]  Working on entry for chassisItemsDict: ${entry[1]}`,0,0,0)
                }
              }


              if (entry[1] == `${value}`) {
                if (generalValues.globalDebug == true || localDebugOn == true) {  
                  debugMsg(generalValues, localDebugOn, 5, "resultsPerDCDisplay", 26, `found value: ${value}`,0,0,0)
                }
                const testToConsoleValue = `resultsPerDCArray[item.chassisID][dcitem].${entry[1]}`
                const testForConsoleValue = resultsPerDCArray[actualChassisID][item.chassisID][entry[1]]
                if (generalValues.globalDebug == true || localDebugOn == true) {
                  debugMsg(generalValues, localDebugOn, 5, "resultsPerDCDisplay", 31, `[chassisID=${actualChassisID},DC=${item.chassisID}] resultsPerDCArray.item.dcitem.value is actually ${value}: ${testToConsoleValue}=${testForConsoleValue}`,0,0,0)
                }

                if (value == "chassisID") {
                  // console.log(`applyAllChanges -- workloads(): entry for chassisID ${item}=> skip it`)
                }
                else {
                  // constructing the id string for the cell to read from
                  let idStringToFind =  `${idLabel}-${actualChassisID}-${item.chassisID}-${entry[0]}`
                  if (generalValues.globalDebug == true || localDebugOn == true) {
                    debugMsg(generalValues, localDebugOn, 5, "resultsPerDCDisplay", 41, `[chassisID=${actualChassisID},DC=${item.chassisID}] -- config: looking up the DOM element id ${idStringToFind}`,0,0,0)
                  }
                  const inputElement = documentMain.getElementById(idStringToFind)
                  let myValue;
                  let outputSubString = "output-"
                  if (entry[0].includes(outputSubString)) {
                    if (generalValues.globalDebug == true || localDebugOn == true) {
                      debugMsg(generalValues, localDebugOn, 5, "resultsPerDCDisplay", 48, `[chassisID=${actualChassisID},DC=${item.chassisID}] -- config: skipping entry[0] for input which is output: ${entry[0]}`,0,0,0)
                    }
                  }
                  else {
                    const cellID = `${idLabel}-${actualChassisID}-${item.chassisID}-${entry[0]}`
                    if (generalValues.globalDebug == true || localDebugOn == true) {
                      debugMsg(generalValues, localDebugOn, 5, "resultsPerDCDisplay", 54, `[chassisID=${actualChassisID},DC=${item.chassisID}] cellID => ${cellID}`,0,0,0)
                    }
                  
                    documentMain.getElementById(cellID).innerHTML = resultsPerDCArray[actualChassisID][item.chassisID][entry[1]]

                    if (generalValues.globalDebug == true || localDebugOn == true) {
                      debugMsg(generalValues, localDebugOn, 5, "resultsPerDCDisplay", 60, `[chassisID=${actualChassisID},DC=${item.chassisID}] HTML node: ${document.getElementById(cellID)}, local HTML node: ${documentMain.getElementById(cellID)}`,0,0,0)
                      debugMsg(generalValues, localDebugOn, 5, "resultsPerDCDisplay", 61, `[chassisID=${actualChassisID},DC=${item.chassisID}] config = ${actualChassisID}, lookupValue=${entry[1]}, result=${resultsPerDCArray[actualChassisID][item.chassisID][entry[1]]}`,0,0,0)
                    }
                  } 
                }
              }
            })
          }
          else {
            // no user changes to respect for this DC (no servers) - update all cells to be empty
            item.ChassisItemsDict.forEach((entry) => {
              if (generalValues.globalDebug) {
                if (generalValues.globalDebug == true || localDebugOn == true) {
                debugMsg(generalValues, localDebugOn, 5, "resultsPerDCDisplay", 73, `[chassisID=${actualChassisID},DC=${item.chassisID}]  Working on entry for chassisItemsDict: ${entry[1]}`,0,0,0)
                debugMsg(generalValues, localDebugOn, 5, "resultsPerDCDisplay", 74, `[chassisID=${actualChassisID},DC=${item.chassisID}]  NO workload here - invaldiating the values`,0,0,0)
                }
              }


              if (entry[1] == `${value}`) {
                if (generalValues.globalDebug == true || localDebugOn == true) {  
                  debugMsg(generalValues, localDebugOn, 5, "resultsPerDCDisplay", 81, `found value: ${value}`,0,0,0)
                }
                const testToConsoleValue = `resultsPerDCArray[item.chassisID][dcitem].${entry[1]}`
                const testForConsoleValue = resultsPerDCArray[actualChassisID][item.chassisID][entry[1]]
                if (generalValues.globalDebug == true || localDebugOn == true) {
                  debugMsg(generalValues, localDebugOn, 5, "resultsPerDCDisplay", 86, `[chassisID=${actualChassisID},DC=${item.chassisID}] resultsPerDCArray.item.dcitem.value is actually ${value}: ${testToConsoleValue}=${testForConsoleValue} - but invalidating `,0,0,0)
                }

                if (value == "chassisID") {
                  // console.log(`applyAllChanges -- workloads(): entry for chassisID ${item}=> skip it`)
                }
                else {
                  // constructing the id string for the cell to read from
                  let idStringToFind =  `${idLabel}-${actualChassisID}-${item.chassisID}-${entry[0]}`
                  if (generalValues.globalDebug == true || localDebugOn == true) {
                    debugMsg(generalValues, localDebugOn, 5, "resultsPerDCDisplay", 96, `[chassisID=${actualChassisID},DC=${item.chassisID}] -- config: looking up the DOM element id ${idStringToFind} - but invalidating`,0,0,0)
                  }
                  const inputElement = documentMain.getElementById(idStringToFind)
                  let myValue;
                  let outputSubString = "output-"
                  if (entry[0].includes(outputSubString)) {
                    if (generalValues.globalDebug == true || localDebugOn == true) {
                      debugMsg(generalValues, localDebugOn, 5, "resultsPerDCDisplay", 103, `[chassisID=${actualChassisID},DC=${item.chassisID}] -- config: skipping entry[0] for input which is output: ${entry[0]} - but invalidating`,0,0,0)
                    }
                  }
                  else {
                    const cellID = `${idLabel}-${actualChassisID}-${item.chassisID}-${entry[0]}`
                    if (generalValues.globalDebug == true || localDebugOn == true) {
                      debugMsg(generalValues, localDebugOn, 5, "resultsPerDCDisplay", 109, `[chassisID=${actualChassisID},DC=${item.chassisID}] cellID => ${cellID}  - but invalidating`,0,0,0)
                    }
                    documentMain.getElementById(cellID).innerHTML = ""
                    if (generalValues.globalDebug == true || localDebugOn == true) {
                      debugMsg(generalValues, localDebugOn, 5, "resultsPerDCDisplay", 113, `[chassisID=${actualChassisID},DC=${item.chassisID}] HTML node: ${document.getElementById(cellID)}, local HTML node: ${documentMain.getElementById(cellID)}  - invalidated`,0,0,0)
                      debugMsg(generalValues, localDebugOn, 5, "resultsPerDCDisplay", 114, `[chassisID=${actualChassisID},DC=${item.chassisID}] config = ${actualChassisID}, lookupValue=${entry[1]}, result=${resultsPerDCArray[actualChassisID][item.chassisID][entry[1]]} - invalidated`,0,0,0)
                    }
                  } 
                }
              }
            })
          }
        })
      })
  //}
  }
}

export default resultsPerDCDisplay