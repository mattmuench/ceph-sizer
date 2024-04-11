import GeneralValues from "./GeneralValues.js"
import Results from "./Results.js"
/// const tableHeaderResultingConfigsArray = new TableHeaderResults
/// documentAddOutputConfigsTable(document,"Config","resultsoverview",generalSettings.numberOfConfigsPossible,tableHeaderResultingConfigsArray)


const resultsPerDCDisplay = function (documentMain, generalValuesLocal, idLabel, numberOfConfigsPossible, columnsDictArray, resultsPerDCArray) {
  const localDebug = false
  
  // Display the results for the configs per config table with separate entries per DC.
  ///const dataColumns = columnsDictArray.header.length

  for (let actualChassisID = 0; actualChassisID < generalValuesLocal.numberOfConfigsPossible; actualChassisID++) {
      resultsPerDCArray[actualChassisID].forEach((item) => {
        
        Object.keys(item).forEach((value) => {
          if (item.numServers > 0 ) {
          item.ChassisItemsDict.forEach((entry) => {
            if (generalValuesLocal.globalDebug) {
              if (generalValuesLocal.globalDebug == true || localDebug == true) {
              console.log(`resultsPerDCDisplay() 21: [chassisID=${actualChassisID},DC=${item.chassisID}]  Working on entry for chassisItemsDict: ${entry[1]}`)
              }
            }


            if (entry[1] == `${value}`) {
              if (generalValuesLocal.globalDebug == true || localDebug == true) {  
                console.log(`found value: ${value}`)
              }
              const testToConsoleValue = `resultsPerDCArray[item.chassisID][dcitem].${entry[1]}`
              const testForConsoleValue = resultsPerDCArray[actualChassisID][item.chassisID][entry[1]]
              if (generalValuesLocal.globalDebug == true || localDebug == true) {
                console.log(`resultsPerDCDisplay() 33: [chassisID=${actualChassisID},DC=${item.chassisID}] resultsPerDCArray.item.dcitem.value is actually ${value}: ${testToConsoleValue}=${testForConsoleValue}`)
              }

              if (value == "chassisID") {
                // console.log(`applyAllChanges -- workloads(): entry for chassisID ${item}=> skip it`)
              }
              else {
                // constructing the id string for the cell to read from
                let idStringToFind =  `${idLabel}-${actualChassisID}-${item.chassisID}-${entry[0]}`
                if (generalValuesLocal.globalDebug == true || localDebug == true) {
                  console.log(`resultsPerDCDisplay() 43: [chassisID=${actualChassisID},DC=${item.chassisID}] -- config: looking up the DOM element id ${idStringToFind}`)
                }
                const inputElement = documentMain.getElementById(idStringToFind)
                let myValue;
                let outputSubString = "output-"
                if (entry[0].includes(outputSubString)) {
                  if (generalValuesLocal.globalDebug == true || localDebug == true) {
                    console.log(`resultsPerDCDisplay 50: [chassisID=${actualChassisID},DC=${item.chassisID}] -- config: skipping entry[0] for input which is output: ${entry[0]}`)
                  }
                }
                else {
                  const cellID = `${idLabel}-${actualChassisID}-${item.chassisID}-${entry[0]}`
                  if (generalValuesLocal.globalDebug == true || localDebug == true) {
                    console.log(`resultsPerDCDisplay() 56: [chassisID=${actualChassisID},DC=${item.chassisID}] cellID => ${cellID}`)
                  }
                  ///const documentElement = documentMain.getElementById(cellID)
                  ///const dictItem = columnsDictArray.header[j][1]
                  ///const lookupValue = resultsPerDCArray[i][item.chassisID].ChassisItemsDict[j][1]
                  //targetElement.textContent = resultsPerDCArray[i][item.chassisID].${lookupValue}
                  documentMain.getElementById(cellID).innerHTML = resultsPerDCArray[actualChassisID][item.chassisID][entry[1]]

                  //documentMain.getElementById(cellID).innerHTML = "Hello2"
                  //documentMain.getElementById("resultsoverview-0-num-servers").innerHTML = "Hello2"
                  ////document.getElementById(cellID).innerhHTML = "Hello"
                  if (generalValuesLocal.globalDebug == true || localDebug == true) {
                    console.log(`resultsPerDCDisplay() 68: [chassisID=${actualChassisID},DC=${item.chassisID}] HTML node: ${document.getElementById(cellID)}, local HTML node: ${documentMain.getElementById(cellID)}`)
                    console.log(`resultsPerDCDisplay() 69: [chassisID=${actualChassisID},DC=${item.chassisID}] config = ${actualChassisID}, lookupValue=${entry[1]}, result=${resultsPerDCArray[actualChassisID][item.chassisID][entry[1]]}`)
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