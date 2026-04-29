import displayMsg from "../common/displayMsg.js"
import {debugMsg} from "../common/debug.js";

const resultsOverviewDisplay = function (documentMain, generalValues, idLabel, numberOfConfigsPossible, columnsDictArray, resultsOverviewArrayLocal) {
  let localDebugOn = false

  // Display the results for the configs overview table line by line.
  ///const dataColumns = columnsDictArray.header.length

  
  resultsOverviewArrayLocal.forEach((item) => {
    if (item.numServers > 0) {
      Object.keys(item).forEach((value) => {
        item.ChassisItemsDict.forEach((entry) => {
          if (generalValues.globalDebug) {
            // console.log(`applyAllChanges() 2: Working on entry for workloadsDict - check workloadItemsDict: ${item.workloadItemsDict}`)
            // console.log(`applyAllChanges() 2: "workloads = item", entry is = ${entry}`)
            if (generalValues.globalDebug == true || localDebugOn == true) {
            debugMsg(generalValues, localDebugOn, 5, "resultsOverviewDisplay", 19, `Working on entry for chassisItemsDict: ${entry[1]}`,0,0,0)
            }
          }


          if (entry[1] == `${value}`) {
            if (generalValues.globalDebug == true || localDebugOn == true) {  
              debugMsg(generalValues, localDebugOn, 5, "resultsOverviewDisplay", 26, `found value: ${value}`,0,0,0)
            }
            const testToConsoleValue = `resultsOverviewArrayLocal[item.chassisID].${entry[1]}`
            const testForConsoleValue = resultsOverviewArrayLocal[item.chassisID][entry[1]]
            if (generalValues.globalDebug == true || localDebugOn == true) {
              debugMsg(generalValues, localDebugOn, 5, "resultsOverviewDisplay", 31, `For ${item.chassisID} is resultsOverviewArrayLocal.item.value is actually ${value}: ${testToConsoleValue}=${testForConsoleValue}`,0,0,0)
            }

            if (value == "chassisID") {
              // console.log(`applyAllChanges -- workloads(): entry for chassisID ${item}=> skip it`)
            }
            else {
              // constructing the id string for the cell to read from
              let idStringToFind =  `resultsoverview-${item.chassisID}-${entry[0]}`
              if (generalValues.globalDebug == true || localDebugOn == true) {
                debugMsg(generalValues, localDebugOn, 5, "resultsOverviewDisplay", 41, `looking up the DOM element id ${idStringToFind}`,0,0,0)
              }
              const inputElement = documentMain.getElementById(idStringToFind)
              let myValue;
              let outputSubString = "output-"
              if (entry[0].includes(outputSubString)) {
                if (generalValues.globalDebug == true || localDebugOn == true) {
                  debugMsg(generalValues, localDebugOn, 5, "resultsOverviewDisplay", 48, `skipping entry[0] for input which is output: ${entry[0]}`,0,0,0)
                }
              }
              else {
                const cellID = `${idLabel}-${item.chassisID}-${entry[0]}`
                if (generalValues.globalDebug == true || localDebugOn == true) {
                  debugMsg(generalValues, localDebugOn, 5, "resultsOverviewDisplay", 54, `cellID => ${cellID}`,0,0,0)
                }
                ///const documentElement = documentMain.getElementById(cellID)
                ///const dictItem = columnsDictArray.header[j][1]
                ///const lookupValue = resultsOverviewArrayLocal[i].ChassisItemsDict[j][1]
                //targetElement.textContent = resultsOverviewArrayLocal[i].${lookupValue}
                documentMain.getElementById(cellID).innerHTML = resultsOverviewArrayLocal[item.chassisID][entry[1]]

                //documentMain.getElementById(cellID).innerHTML = "Hello2"
                //documentMain.getElementById("resultsoverview-0-num-servers").innerHTML = "Hello2"
                ////document.getElementById(cellID).innerhHTML = "Hello"
                if (generalValues.globalDebug == true || localDebugOn == true) {
                  debugMsg(generalValues, localDebugOn, 5, "resultsOverviewDisplay", 67, `HTML node: ${document.getElementById(cellID)}, local HTML node: ${documentMain.getElementById(cellID)}`,0,0,0)
                  debugMsg(generalValues, localDebugOn, 5, "resultsOverviewDisplay", 68, `config = ${item.chassisID}, lookupValue=${entry[1]}, result=${resultsOverviewArrayLocal[item.chassisID][entry[1]]}`,0,0,0)
                }
              } 
            }
          }
        })
      })
    }
  })
}

export default resultsOverviewDisplay