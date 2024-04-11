import GeneralValues from "./GeneralValues.js"
/// const tableHeaderResultingConfigsArray = new TableHeaderResults
/// documentAddOutputConfigsTable(document,"Config","resultsoverview",generalSettings.numberOfConfigsPossible,tableHeaderResultingConfigsArray)


const resultsOverviewDisplay = function (documentMain, generalValuesLocal, idLabel, numberOfConfigsPossible, columnsDictArray, resultsOverviewArrayLocal) {
  const localDebug = false
  // Display the results for the configs overview table line by line.
  ///const dataColumns = columnsDictArray.header.length

  
  resultsOverviewArrayLocal.forEach((item) => {
    if (item.numServers > 0) {
      Object.keys(item).forEach((value) => {
        item.ChassisItemsDict.forEach((entry) => {
          if (generalValuesLocal.globalDebug) {
            // console.log(`applyAllChanges() 2: Working on entry for workloadsDict - check workloadItemsDict: ${item.workloadItemsDict}`)
            // console.log(`applyAllChanges() 2: "workloads = item", entry is = ${entry}`)
            if (generalValuesLocal.globalDebug == true || localDebug == true) {
            console.log(`resultsOverviewDisplay():  Working on entry for chassisItemsDict: ${entry[1]}`)
            }
          }


          if (entry[1] == `${value}`) {
            if (generalValuesLocal.globalDebug == true || localDebug == true) {  
              console.log(`resultsOverviewDisplay() 27: found value: ${value}`)
            }
            const testToConsoleValue = `resultsOverviewArrayLocal[item.chassisID].${entry[1]}`
            const testForConsoleValue = resultsOverviewArrayLocal[item.chassisID][entry[1]]
            if (generalValuesLocal.globalDebug == true || localDebug == true) {
              console.log(`resultsOverviewDisplay() 32: For ${item.chassisID} is resultsOverviewArrayLocal.item.value is actually ${value}: ${testToConsoleValue}=${testForConsoleValue}`)
            }

            if (value == "chassisID") {
              // console.log(`applyAllChanges -- workloads(): entry for chassisID ${item}=> skip it`)
            }
            else {
              // constructing the id string for the cell to read from
              let idStringToFind =  `resultsoverview-${item.chassisID}-${entry[0]}`
              if (generalValuesLocal.globalDebug == true || localDebug == true) {
                console.log(`resultsOverviewDisplay() 42: looking up the DOM element id ${idStringToFind}`)
              }
              const inputElement = documentMain.getElementById(idStringToFind)
              let myValue;
              let outputSubString = "output-"
              if (entry[0].includes(outputSubString)) {
                if (generalValuesLocal.globalDebug == true || localDebug == true) {
                  console.log(`resultsOverviewDisplay() 49: skipping entry[0] for input which is output: ${entry[0]}`)
                }
              }
              else {
                const cellID = `${idLabel}-${item.chassisID}-${entry[0]}`
                if (generalValuesLocal.globalDebug == true || localDebug == true) {
                  console.log(`resultsOverviewDisplay() 55: cellID => ${cellID}`)
                }
                ///const documentElement = documentMain.getElementById(cellID)
                ///const dictItem = columnsDictArray.header[j][1]
                ///const lookupValue = resultsOverviewArrayLocal[i].ChassisItemsDict[j][1]
                //targetElement.textContent = resultsOverviewArrayLocal[i].${lookupValue}
                documentMain.getElementById(cellID).innerHTML = resultsOverviewArrayLocal[item.chassisID][entry[1]]

                //documentMain.getElementById(cellID).innerHTML = "Hello2"
                //documentMain.getElementById("resultsoverview-0-num-servers").innerHTML = "Hello2"
                ////document.getElementById(cellID).innerhHTML = "Hello"
                if (generalValuesLocal.globalDebug == true || localDebug == true) {
                  console.log(`resultsOverviewDisplay() 67: HTML node: ${document.getElementById(cellID)}, local HTML node: ${documentMain.getElementById(cellID)}`)
                  console.log(`resultsOverviewDisplay() 68: config = ${item.chassisID}, lookupValue=${entry[1]}, result=${resultsOverviewArrayLocal[item.chassisID][entry[1]]}`)
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