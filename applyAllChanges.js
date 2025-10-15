import checkInputs from "./dccalc/checkInputs.js"
import calcDCConfig from "./calcDCConfig.js"
import calcResultsOverview from "./calcResultsOverview.js"
import calcResultsPerDC from "./calcResultsPerDC.js"
import resultsOverviewDisplay from "./resultsOverviewDisplay.js"
import resultsPerDCDisplay from "./resultsPerDCDisplay.js"
import displayMsg from "./common/displayMsg.js"
import {debugMsg} from "./common/debug.js";
// For testing only:
import Results from "./Results.js"


const applyAllChanges = function (documentMain, generalValues, workloadsValues, chassisValues, sizingConstraints, configsArrayLocal, tableHeaderResultingConfigsArray, resultsOverviewArrayLocal) {
  
  let localDebugOn = true

  // clear any previous messages
  documentMain.getElementById("misc-message").innerText = ``
  documentMain.getElementById("error-message").innerText = ``

  // read all current values from all input fields
  // Start with actual global values.
  debugMsg(generalValues, localDebugOn, 5, "applyAllChanges", 22, `workloadsArray passed contains: ${workloadsValues}`,0,0,0)
  debugMsg(generalValues, localDebugOn, 5, "applyAllChanges", 23, `number of entries in array: ${workloadsValues.length}`,0,0,0)

  // get general settings from header of the page (like similar/different config) -  capacity is set by readDesiredCapacity()
  let rbsSimilarConfig = document.getElementsByName("global-similar-config");
  for (let i=0, iLen=rbsSimilarConfig.length; i<iLen; i++) {
    if (rbsSimilarConfig[i].checked) {
      generalValues.desiredSimilarConfig = rbsSimilarConfig[i].value;
      debugMsg(generalValues, localDebugOn, 5, "applyAllChanges", 30, `similarConfig -- For General is desiredSimilarConfig is NEW: desiredSimilarConfig=${generalValues.desiredSimilarConfig}`,0,0,0)
    }
  }

  let rbsSimilarMediaConfig = document.getElementsByName("global-similar-media-config");
  for (let i=0, iLen=rbsSimilarConfig.length; i<iLen; i++) {
    if (rbsSimilarMediaConfig[i].checked) {
      generalValues.desiredSimilarMediaConfig = rbsSimilarMediaConfig[i].value;
      debugMsg(generalValues, localDebugOn, 5, "applyAllChanges", 38, `similarConfig -- For General is desiredSimilarConfig is NEW: desiredSimilarConfig=${generalValues.desiredSimilarConfig}`,0,0,0)
      
    }
  }


  ///   start  workloadsArray / chassisArray elements  and then find the associated  entries in the document to read the values from
  ///           Entries are found based on translation table in the respective classes.
  ///           Based on actual array of workloads/configs, per array entry (just one workload/config) lookup all
  ///           elements available in the object (based on classes Workload/Chassis) and look it up in the 
  ///           WorkloadsItemsDict / ChassisItemsDict: first item is the string used for creating the id for the DOM element
  ///           and second is the name of the corresponding element of the class. There might be additional entries, like for
  ///           the automated number of DCs to use.
  /////////
  ///////// Reading in all value for WORKLOADS
  /////////
  let workloadValid = 0

  workloadsValues.forEach((item) => {
    debugMsg(generalValues, localDebugOn, 5, "applyAllChanges", 57, `workloadID = ${item}`,0,0,0)
    Object.keys(item).forEach((value) => {
      item.workloadItemsDict.forEach((entry) => {
        if (generalValues.globalDebug) {
          // console.log(`applyAllChanges() 2: Working on entry for workloadsDict - check workloadItemsDict: ${item.workloadItemsDict}`)
          // console.log(`applyAllChanges() 2: "workloads = item", entry is = ${entry}`)
          debugMsg(generalValues, localDebugOn, 5, "applyAllChanges", 63, `[workloadID=${item}] Working on entry for workloadsDict: ${entry[1]}`,0,0,0)
        }
        
        
        if (entry[1] == `${value}`) {
          debugMsg(generalValues, localDebugOn, 5, "applyAllChanges", 68, `found value: ${value}`,0,0,0)
          const testToConsoleValue = `workloadsValues[item.workloadID].${entry[1]}`
          const testForConsoleValue = workloadsValues[item.workloadID][entry[1]]
          debugMsg(generalValues, localDebugOn, 5, "applyAllChanges", 71, `[workloadID=${item}] For ${item.workloadID} is workloadsValues.item.value is actually ${value}: ${testToConsoleValue}=${testForConsoleValue}`,0,0,0)
          
          
          if (value == "workloadID") {
            debugMsg(generalValues, localDebugOn, 6, "applyAllChanges", 75, `entry for workloadID ${item}=> skip it`,0,0,0)
            workloadValid = 1
            debugMsg(generalValues, localDebugOn, 5, "applyAllChanges", 77, `RE-SETTING workloadValid=${workloadValid}`,0,0,0)
          }
          else {
            // constructing the id string for the cell to read from
            let idStringToFind =  `workload-${item.workloadID}-${entry[0]}`
            debugMsg(generalValues, localDebugOn, 5, "applyAllChanges", 82, `[workloadID=${item}] looking up the DOM element id ${idStringToFind}`,0,0,0)
            const inputElement = documentMain.getElementById(idStringToFind)
            let myValue;
            let outputSubString = "output-"
            if (entry[0].includes(outputSubString)) {
              debugMsg(generalValues, localDebugOn, 5, "applyAllChanges", 87, `[workloadID=${item}] skipping entry[0] for input which is output: ${entry[0]}`,0,0,0)
            }
            else {
              switch (entry[0]) {
                case "req-capacity-net": {
                  if (inputElement.value !== '') {
                    debugMsg(generalValues, localDebugOn, 5, "applyAllChanges", 93, `[workloadID=${item}]  CHANGE: workloadID=${item.workloadID} - inputElement.value=${inputElement.value}`,0,0,0)
                    if (!isNaN(Number(inputElement.value))) {
                      workloadsValues[item.workloadID][entry[1]] = inputElement.value
                      if (inputElement.value == 0){
                        workloadValid = 0
                        debugMsg(generalValues, localDebugOn, 5, "applyAllChanges", 98, `[workloadID=${item}]  INVALID workload: workloadID=${item.workloadID} - inputElement.value=${inputElement.value}`,0,0,0)
                      }
                      else {
                        workloadValid = 1
                        debugMsg(generalValues, localDebugOn, 5, "applyAllChanges", 102, `[workloadID=${item}]  VALID workload: workloadID=${item.workloadID} - inputElement.value=${inputElement.value}`,0,0,0)
                      }
                    }
                    else {
                      workloadValid = 0
                      displayMsg(documentMain, "applyAllChanges", 107, "error", `workloadID=${item.workloadID} - ${entry[0]} must be a number (actual value=${inputElement.value})`,0,0,0)
                    }
                  }
                  else {
                      workloadValid = 0
                      debugMsg(generalValues, localDebugOn, 5, "applyAllChanges", 112, `[workloadID=${item}]  INVALID workload: workloadID=${item.workloadID} - inputElement.value=${inputElement.value} - workloadValid=${workloadValid}`,0,0,0)
                  }
                  break
                }
                case "use-case": {
                  let rbs = document.getElementsByName(idStringToFind);
                  for (let i=0, iLen=rbs.length; i<iLen; i++) {
                    if (rbs[i].checked) {
                      workloadsValues[item.workloadID][entry[1]] = rbs[i].value;
                      debugMsg(generalValues, localDebugOn, 5, "applyAllChanges", 121, `[workloadID=${item}] For ${item.workloadID} is workloadsValues.item.value is NEW: workloadsValues[${item.workloadID}].${entry[1]}=${workloadsValues[item.workloadID][entry[1]]}`,0,0,0)
                    }
                  }
                  break
                }
                case "selector-highdense":
                case "selector-nvme": 
                case "selector-rgw-index-flash":
                case "selector-rgw-cache":
                case "selector-dedicatedNVMe":
                case "selector-SSDdedicatedNVMe":
                case "selector-SSDdedicatedNVMeForWAL":
                case "selector-NVMe1dedicatedNVMe":
                case "selector-NVMe1dedicatedNVMeForWAL":
                {
                  /// Get value of checked or unchecked from checkboxes 
                  workloadsValues[item.workloadID][entry[1]]=documentMain.getElementById(idStringToFind).checked
                  debugMsg(generalValues, localDebugOn, 5, "applyAllChanges", 138, `[workloadID=${item}]  For ${item.workloadID} is workloadsValues.item.value is NEW: workloadsValues[${item.workloadID}].${entry[1]}=${workloadsValues[item.workloadID][entry[1]]}`,0,0,0)
                  break
                }
                case "selector-dc": {
                  //// Multiple entries to check here - stay here and loop through the registered DCs from 
                  ////   Workload.workloadItemsDict["selector-dc"] in the dcSelectorList
                  for (let dcItem = 0; dcItem < generalValues.numberOfDCsPossible; dcItem++) {
                    // clearing the DC selector from previous run - otherwise, all previously selected DCs will stay
                    workloadsValues[item.workloadID][entry[1]][dcItem]=false
                    debugMsg(generalValues, localDebugOn, 5, "applyAllChanges",147, `[workloadID=${item}]  checking DC selector - ${entry[2][dcItem]}`,0,0,0)                      
                    let lookupDOMElement = `${idStringToFind}`+`${dcItem}`
                    if (generalValues.globalDebug) {
                      const checkForDOMElement =  documentMain.getElementById(lookupDOMElement)
                      debugMsg(generalValues, localDebugOn, 5, "applyAllChanges", 151, `[workloadID=${item}]  Is checked ${lookupDOMElement} ? =${checkForDOMElement.checked}`,0,0,0)
                      let resultCheck = checkForDOMElement.checked
                      debugMsg(generalValues, localDebugOn, 5, "applyAllChanges", 153, `[workloadID=${item}]  checking DC selector NOW - ${entry[2][dcItem]}:${resultCheck}`,0,0,0)
                    }
                    if (workloadValid == 0){
                      debugMsg(generalValues, localDebugOn, 5, "applyAllChanges", 156, `[workloadID=${item}]  For ${item.workloadID} is workloadsValues.item.value ${dcItem} is INVALID: workloadsValues[${item.workloadID}].${entry[1]}[${dcItem}]=${workloadsValues[item.workloadID][entry[1]][dcItem]} -- workloadValid=${workloadValid}`,0,0,0)
                      workloadsValues[item.workloadID][entry[1]][dcItem]=0
                    }
                    else {
                      workloadsValues[item.workloadID][entry[1]][dcItem]=documentMain.getElementById(lookupDOMElement).checked
                      debugMsg(generalValues, localDebugOn, 5, "applyAllChanges", 162, `[workloadID=${item}]  For ${item.workloadID} is workloadsValues.item.value ${dcItem} is VALID: workloadsValues[${item.workloadID}].${entry[1]}[${dcItem}]=${workloadsValues[item.workloadID][entry[1]][dcItem]}`,0,0,0)
                    }
                  }
                  break
                } 
                default:  {
                  // Keep the default or actual value  if nothing is provided
                  debugMsg(generalValues, localDebugOn, 5, "applyAllChanges", 168, `[workloadID=${item}]  CHECK: workloadID=${item.workloadID}, workloadsValues[${item.workloadID}] is ${entry[0]}, variable name associated is: ${entry[1]}`,0,0,0)
                  
                  if (inputElement.value !== '') {
                    debugMsg(generalValues, localDebugOn, 5, "applyAllChanges", 172, `[workloadID=${item}]  CHANGE: workloadID=${item.workloadID} - inputElement.value=${inputElement.value}`,0,0,0)
                    if (!isNaN(Number(inputElement.value))) {
                      workloadsValues[item.workloadID][entry[1]] = inputElement.value
                    }
                    else {
                      displayMsg(documentMain, "applyAllChanges", 174, "error", `workloadID=${item.workloadID} - ${entry[0]} must be a number (actual value=${inputElement.value})`,0,0,0)
                    }
                  }
                  else {
                    // Don't change the actual value (default)
                    debugMsg(generalValues, localDebugOn, 5, "applyAllChanges", 181, `[workloadID=${item}]  DEFAULT: workloadID=${item.workloadID} - ${entry[0]} is undefined - keeping set value`,0,0,0)
                  }
                  debugMsg(generalValues, localDebugOn, 5, "applyAllChanges", 184, `[workloadID=${item}] For ${item.workloadID} is workloadsValues.item.value is NEW ${value}: ${testToConsoleValue}=${workloadsValues[item.workloadID][entry[1]]}`,0,0,0)
                }
              }
            }
            
          }
           
        }  
      })
    })
    })

    /////////
    ///////// Reading in all value for CHASSIS
    /////////
    
    chassisValues.forEach((item) => {
      debugMsg(generalValues, localDebugOn, 5, "applyAllChanges", 201, `[chassisID=${item}]: chassisID = ${item}`,0,0,0)
      Object.keys(item).forEach((value) => {
        item.ChassisItemsDict.forEach((entry) => {
          if (generalValues.globalDebug) {
            // console.log(`applyAllChanges() 2: Working on entry for ChassisItemsDict - check ChassisItemsDict: ${item.ChassisItemsDict}`)
            // console.log(`applyAllChanges() 2: "chassis = item", entry is = ${entry}`)
            debugMsg(generalValues, localDebugOn, 5, "applyAllChanges", 206, `[chassisID=${item}] Working on entry for ChassisItemsDict: ${entry[1]}`,0,0,0)
          }
          
          if (entry[1] == `${value}`) {
            debugMsg(generalValues, localDebugOn, 5, "applyAllChanges", 211, `found value: ${value}`,0,0,0)
            const testToConsoleValue = `chassisValues[item.chassisID].${entry[1]}`
            const testForConsoleValue = chassisValues[item.chassisID][entry[1]]
            debugMsg(generalValues, localDebugOn, 5, "applyAllChanges", 213, `[chassisID=${item}] For ${item.chassisID} is chassisValues.item.value is actually ${value}: ${testToConsoleValue}=${testForConsoleValue}`,0,0,0)
            if (value == "chassisID") {
              // console.log(`applyAllChanges -- workloads(): entry for chassisID ${item}=> skip it`)
            }
            else {
              // constructing the id string for the cell to read from
              let idStringToFind =  `chassis-${item.chassisID}-${entry[0]}`
              debugMsg(generalValues, localDebugOn, 5, "applyAllChanges", 220, `[chassisID=${item}] looking up the DOM element id ${idStringToFind}`,0,0,0)
              const inputElement = documentMain.getElementById(idStringToFind)
              let outputSubString = "output-"
              if (entry[0].includes(outputSubString)) {
                debugMsg(generalValues, localDebugOn, 5, "applyAllChanges", 224, `[chassisID=${item}] skipping entry[0] for input which is output: ${entry[0]}`,0,0,0)
              }
              else {
                switch (entry[0]) {
                  case "use-SSD4-over-NVMe4":
                  case "use-rgw-caching": 
                  case "use-nvme-7":
                  case "use-nvme-8": 
                  case "use-optane-1": {
                    chassisValues[item.chassisID][entry[1]]=documentMain.getElementById(idStringToFind).checked
                    debugMsg(generalValues, localDebugOn, 5, "applyAllChanges", 234, `[chassisID=${item}] For ${item.chassisID} setting entry[1]=${entry[1]} for idStringToFind=${idStringToFind} which is checked=${documentMain.getElementById(idStringToFind).checked}`,0,0,0)
                    debugMsg(generalValues, localDebugOn, 5, "applyAllChanges", 235, `[chassisID=${item}] For ${item.chassisID} is chassisValues.item.value is NEW: chassisValues[${item.chassisID}].${entry[1]}=${chassisValues[item.chassisID][entry[1]]}`,0,0,0)
                    break
                  }
                  default:  {
                    // Keep the default or actual value  if nothing is provided
                    if (inputElement.value !== '') {
                      debugMsg(generalValues, localDebugOn, 5, "applyAllChanges", 242, `[chassisID=${item}] CHANGE: workloadID=${item.workloadID} - inputElement.value=${inputElement.value}`,0,0,0)
                      if (!isNaN(Number(inputElement.value))) {
                        chassisValues[item.chassisID][entry[1]] = inputElement.value
                      }
                      else {
                        displayMsg(documentMain, "applyAllChanges", 246, "error", `[chassisID=${item}] ERROR: workloadID=${item.workloadID} - ${entry[0]} must be a number (actual value=${inputElement.value})`,0,0,0)
                      }
                    }
                    else {
                      // Don't change the actual value (default)
                      debugMsg(generalValues, localDebugOn, 5, "applyAllChanges", 251, `[chassisID=${item}] DEFAULT: workloadID=${item.workloadID} - ${entry[0]} is undefined - keeping set value`,0,0,0)
                    }
                    debugMsg(generalValues, localDebugOn, 5, "applyAllChanges", 253, `[chassisID=${item}] For ${item.chassisID} is chassisValues.item.value is NEW ${value}: ${testToConsoleValue}=${chassisValues[item.chassisID][entry[1]]}`,0,0,0)
                  }
                }
              }
              //console.log(`applyAllChanges -- chassis(): myValue = ${myValue} for idStringToFind=${idStringToFind}`)  
            }                
          }
        })
      })
      })

      // All entries read from the document input => now apply the changes (calculate the values needed)
      /** What do we actually need - per DC and in sum for the overview
       *  - #servers 
       *  - CPU cores
       *  - MEM min
       *  - HDD1 size
       *  - #HDD1
       *  - SSD1 size 
       *  - #SSD1
       *  - NVMe1 size
       *  - #NVMe1
       *  - raw capacity (data)
       *  - net capacity (data based on config)
       * 
       *  - #NIC (public)
       *  - #NIC (cluster)
       *  - NVMe{2..7}
       *  - raw capacity for subscriptions
       *  - SKU sizing
      */
      // Calculate the media and server configuration based on changed workloads and chassis configuration. 

      let actualChassisID = 0
      debugMsg(generalValues, localDebugOn, 5, "applyAllChanges", 278, `working on config ${actualChassisID}`,0,0,0)
      debugMsg(generalValues, localDebugOn, 5, "applyAllChanges", 288, `the array is ${configsArrayLocal}`,0,0,0)
      debugMsg(generalValues, localDebugOn, 5, "applyAllChanges", 289, ` ... and the actual sub-array is the array ${configsArrayLocal[actualChassisID]}`,0,0,0)
      /// HERE: change to use  configsArray
      ///// TESTING:
      /**
      chassisValues[0].chassisID = 0
      chassisValues[0].maxHDDSlots = 24
      chassisValues[0].maxSSDSlots = 24
      chassisValues[0].maxNVMeSlots = 24
      chassisValues[0].maxAllSlots = 24
      chassisValues[0].maxDedicatedNVMeSlots = 2
      chassisValues[0].maxAllMediaSum = 26
      chassisValues[0].maxCpuSockets = 2
      chassisValues[0].maxCpuCores = 24
      chassisValues[0].maxMemGb = 256
      chassisValues[0].maxPciSlots = 3
      chassisValues[0].sizeHDD1 = 6
      chassisValues[0].speedNicPublic = 25
      chassisValues[0].sizeNVMe1 = 4
      chassisValues[0].sizeNVMe2 = 2
      chassisValues[0].sizeNVMe3 = 2
      chassisValues[0].sizeNVMe4 = 2
      chassisValues[0].sizeNVMe5 = 2
      chassisValues[0].sizeNVMe6 =2
      chassisValues[0].sizeSSD1 = 4
      chassisValues[0].ssdToOptane = 5
      chassisValues[0].sizeOptane1 = 0.375
      chassisValues[0].useSSD4overNVMe4 = 1
      chassisValues[0].hddToSSD4 = 5
      chassisValues[0].sizeSSD4 = 0.8
      chassisValues[0].hddToNVMe4 = 17
      chassisValues[0].ssdToNVMe5 = 5
      chassisValues[0].speedNicCluster = 25
      chassisValues[0].useRGWCaching = 0
      chassisValues[0].useOptane1 = 0
      chassisValues[0].sizeNVMe7 = 0.375
      chassisValues[0].nvmeToNVMe7 = 4

      chassisValues[1].chassisID = 1
      chassisValues[1].maxHDDSlots = 12
      chassisValues[1].maxSSDSlots = 12
      chassisValues[1].maxNVMeSlots = 12
      chassisValues[1].maxAllSlots = 12
      chassisValues[1].maxDedicatedNVMeSlots = 2
      chassisValues[1].maxAllMediaSum = 14
      chassisValues[1].maxCpuSockets = 2
      chassisValues[1].maxCpuCores = 16
      chassisValues[1].maxMemGb = 192
      chassisValues[1].maxPciSlots = 3
      chassisValues[1].sizeHDD1 = 4
      chassisValues[1].speedNicPublic = 25
      chassisValues[1].sizeNVMe1 = 4
      chassisValues[1].sizeNVMe2 = 2
      chassisValues[1].sizeNVMe3 = 2
      chassisValues[1].sizeNVMe4 = 2
      chassisValues[1].sizeNVMe5 = 2
      chassisValues[1].sizeNVMe6 =2
      chassisValues[1].sizeSSD1 = 3.2
      chassisValues[1].ssdToOptane = 5
      chassisValues[1].sizeOptane1 = 0.375
      chassisValues[1].useSSD4overNVMe4 = 1
      chassisValues[1].hddToSSD4 = 5
      chassisValues[1].sizeSSD4 = 0.8
      chassisValues[1].hddToNVMe4 = 17
      chassisValues[1].ssdToNVMe5 = 5
      chassisValues[1].speedNicCluster = 25
      chassisValues[1].useRGWCaching = 0
      chassisValues[1].useOptane1 = 0
      chassisValues[1].sizeNVMe7 = 0.375
      chassisValues[1].nvmeToNVMe7 = 4
       */

      checkInputs(generalValues, workloadsValues, chassisValues)
      calcDCConfig(generalValues, workloadsValues, sizingConstraints, configsArrayLocal, chassisValues)
      // 
      // Update the output for the overview and individual Chassis configs.
      // 4) results: ???????? => initialize also the arrays holding specific information about the DC use - note that the number 
//    of DCs is variable and defined globally in GeneralValues.numberOfConfigsPossible
// Program flow (M16) 
const resultsOverviewArray = []
for (let resultingConfig = 0; resultingConfig < generalValues.numberOfConfigsPossible; resultingConfig++) {
  const resultNew = new Results
  //console.log(`This is content of new workloadNew array: ${workloadNew}`)
  //console.log(`This is content of 1. object in workloadNew array: ${workloadNew.workloadItemsDict[0][1]}`)
  //console.log(`This is content of 2. object in workloadNew array: ${workloadNew.workloadItemsDict[1]}`)
  //console.log(`This is length of workloadNew workload names array: ${workloadNew.workloadItemsDict.length}`)
  
  // console.log(`DC name in cell DC4 from workloadNew array: ${workloadNew.workloadItemsDict["selector-dc"]}`)

  debugMsg(generalValues, localDebugOn, 5, "applyAllChanges", 376, `This is length of chassisNew array: ${Object.keys(resultNew).length}`,0,0,0)
  resultNew.chassisID = `${resultingConfig}`
  
  resultsOverviewArray.push(resultNew)
}


const resultsPerDCArray = []
for (let config = 0; config < generalValues.numberOfConfigsPossible; config++) {
  const resultsArray = []
  for (let dcConfig = 0; dcConfig < generalValues.numberOfDCsPossible; dcConfig++) {
    const dcResultsNew = new Results
    //console.log(`This is content of new workloadNew array: ${workloadNew}`)
    //console.log(`This is content of 1. object in workloadNew array: ${workloadNew.workloadItemsDict[0][1]}`)
    //console.log(`This is content of 2. object in workloadNew array: ${workloadNew.workloadItemsDict[1]}`)
    //console.log(`This is length of workloadNew workload names array: ${workloadNew.workloadItemsDict.length}`)
    
    // console.log(`DC name in cell DC4 from workloadNew array: ${workloadNew.workloadItemsDict["selector-dc"]}`)
  
    debugMsg(generalValues, localDebugOn, 5, "applyAllChanges", 395, `This is length of chassisNew array: ${Object.keys(dcResultsNew).length}`,0,0,0)
    dcResultsNew.chassisID = `${dcConfig}`
    
    resultsArray.push(dcResultsNew)
  }
  resultsPerDCArray.push(resultsArray)
}
      calcResultsOverview(generalValues,configsArrayLocal,chassisValues, resultsOverviewArray)
      calcResultsPerDC(generalValues,configsArrayLocal,chassisValues, resultsPerDCArray)

      // Now, update the document display
      resultsOverviewDisplay(documentMain, generalValues, "resultsoverview", generalValues.numberOfConfigsPossible, tableHeaderResultingConfigsArray, resultsOverviewArray)
      resultsPerDCDisplay(documentMain, generalValues, "results-configNum", generalValues.numberOfConfigsPossible, tableHeaderResultingConfigsArray, resultsPerDCArray)

  }

  export default applyAllChanges