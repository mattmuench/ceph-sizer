import calcDCConfig from "./calcDCConfig.js"
import calcResultsOverview from "./calcResultsOverview.js"
import calcResultsPerDC from "./calcResultsPerDC.js"
import resultsOverviewDisplay from "./resultsOverviewDisplay.js"
import resultsPerDCDisplay from "./resultsPerDCDisplay.js"
import displayMsg from "./common/displayMsg.js"
// For testing only:
import Results from "./Results.js"

const applyAllChanges = function (documentMain, generalValues, workloadsValues, chassisValues, sizingConstraints, configsArrayLocal, tableHeaderResultingConfigsArray, resultsOverviewArrayLocal) {
  
  // clear any previous messages
  documentMain.getElementById("misc-message").innerText = ``
  documentMain.getElementById("error-message").innerText = ``

  // read all current values from all input fields
  // Start with actual global values.
  console.log(`applyAllChanges() 12: workloadsArray passed contains: ${workloadsValues}`)
  console.log(`applyAllChanges() 13: number of entries in array: ${workloadsValues.length}`)

  // get general settings from header of the page (like similar/different config) -  capacity is set by readDesiredCapacity()
  let rbsSimilarConfig = document.getElementsByName("global-similar-config");
  for (let i=0, iLen=rbsSimilarConfig.length; i<iLen; i++) {
    if (rbsSimilarConfig[i].checked) {
      generalValues.desiredSimilarConfig = rbsSimilarConfig[i].value;
      console.log(`applyAllChanges -- similarConfig 20(): For General is desiredSimilarConfig is NEW: desiredSimilarConfig=${generalValues.desiredSimilarConfig}`)
    }
  }

  let rbsSimilarMediaConfig = document.getElementsByName("global-similar-media-config");
  for (let i=0, iLen=rbsSimilarConfig.length; i<iLen; i++) {
    if (rbsSimilarMediaConfig[i].checked) {
      generalValues.desiredSimilarMediaConfig = rbsSimilarMediaConfig[i].value;
      console.log(`applyAllChanges -- similarMediaConfig 28(): For General is desiredSimilarMediaConfig is NEW: desiredSimilarMediaConfig=${generalValues.desiredSimilarMediaConfig}`)
      
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
    console.log(`applyAllChanges -- workloads() 45: workloadID = ${item}`)
    Object.keys(item).forEach((value) => {
      item.workloadItemsDict.forEach((entry) => {
        if (generalValues.globalDebug) {
          // console.log(`applyAllChanges() 2: Working on entry for workloadsDict - check workloadItemsDict: ${item.workloadItemsDict}`)
          // console.log(`applyAllChanges() 2: "workloads = item", entry is = ${entry}`)
          console.log(`applyAllChanges() 51: [workloadID=${item}] Working on entry for workloadsDict: ${entry[1]}`)
        }
        
        
        if (entry[1] == `${value}`) {
          console.log(`found value: ${value}`)
          const testToConsoleValue = `workloadsValues[item.workloadID].${entry[1]}`
          const testForConsoleValue = workloadsValues[item.workloadID][entry[1]]
          console.log(`applyAllChanges() 59: [workloadID=${item}] For ${item.workloadID} is workloadsValues.item.value is actually ${value}: ${testToConsoleValue}=${testForConsoleValue}`)
          
          
          if (value == "workloadID") {
            // console.log(`applyAllChanges -- workloads(): entry for workloadID ${item}=> skip it`)
            workloadValid = 1
              console.log(`applyAllChanges() 66: RE-SETTING workloadValid=${workloadValid}`)
          }
          else {
            // constructing the id string for the cell to read from
            let idStringToFind =  `workload-${item.workloadID}-${entry[0]}`
            console.log(`applyAllChanges() 68: [workloadID=${item}] looking up the DOM element id ${idStringToFind}`)
            const inputElement = documentMain.getElementById(idStringToFind)
            let myValue;
            let outputSubString = "output-"
            if (entry[0].includes(outputSubString)) {
              console.log(`applyAllChanges() 73: [workloadID=${item}] skipping entry[0] for input which is output: ${entry[0]}`)
            }
            else {
              switch (entry[0]) {
                case "req-capacity-net": {
                  if (inputElement.value !== '') {
                    console.log(`applyAllChanges() 79: [workloadID=${item}]  CHANGE: workloadID=${item.workloadID} - inputElement.value=${inputElement.value}`)
                    if (!isNaN(Number(inputElement.value))) {
                      workloadsValues[item.workloadID][entry[1]] = inputElement.value
                      if (inputElement.value == 0){
                        workloadValid = 0
                        console.log(`applyAllChanges() 79a: [workloadID=${item}]  INVALID workload: workloadID=${item.workloadID} - inputElement.value=${inputElement.value}`)
                      }
                      else {
                        workloadValid = 1
                        console.log(`applyAllChanges() 79b: [workloadID=${item}]  VALID workload: workloadID=${item.workloadID} - inputElement.value=${inputElement.value}`)
                      }
                    }
                    else {
                      workloadValid = 0
                      displayMsg(documentMain, "applyAllChanges", 104, "error", `workloadID=${item.workloadID} - ${entry[0]} must be a number (actual value=${inputElement.value})`,0,0,0)
                    }
                  }
                  else {
                      workloadValid = 0
                      console.log(`applyAllChanges() 79d: [workloadID=${item}]  INVALID workload: workloadID=${item.workloadID} - inputElement.value=${inputElement.value} - workloadValid=${workloadValid}`)
                  }
                  break
                }
                case "use-case": {
                  let rbs = document.getElementsByName(idStringToFind);
                  for (let i=0, iLen=rbs.length; i<iLen; i++) {
                    if (rbs[i].checked) {
                      workloadsValues[item.workloadID][entry[1]] = rbs[i].value;
                      console.log(`applyAllChanges() 82: [workloadID=${item}] For ${item.workloadID} is workloadsValues.item.value is NEW: workloadsValues[${item.workloadID}].${entry[1]}=${workloadsValues[item.workloadID][entry[1]]}`)
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
                  console.log(`applyAllChanges() 99: [workloadID=${item}]  For ${item.workloadID} is workloadsValues.item.value is NEW: workloadsValues[${item.workloadID}].${entry[1]}=${workloadsValues[item.workloadID][entry[1]]}`)                    
                  break
                }
                case "selector-dc": {
                  //// Multiple entries to check here - stay here and loop through the registered DCs from 
                  ////   Workload.workloadItemsDict["selector-dc"] in the dcSelectorList
                  for (let dcItem = 0; dcItem < generalValues.numberOfDCsPossible; dcItem++) {
                    // clearing the DC selector from previous run - otherwise, all previously selected DCs will stay
                    workloadsValues[item.workloadID][entry[1]][dcItem]=false
                    console.log(`applyAllChanges() 108: [workloadID=${item}]  checking DC selector - ${entry[2][dcItem]}`)                      
                    let lookupDOMElement = `${idStringToFind}`+`${dcItem}`
                    if (generalValues.globalDebug) {
                      const checkForDOMElement =  documentMain.getElementById(lookupDOMElement)
                      console.log(`applyAllChanges() 112: [workloadID=${item}]  Is checked ${lookupDOMElement} ? =${checkForDOMElement.checked}`)
                      let resultCheck = checkForDOMElement.checked
                      console.log(`applyAllChanges() 114: [workloadID=${item}]  checking DC selector NOW - ${entry[2][dcItem]}:${resultCheck}`)
                    }
                    if (workloadValid == 0){
                      console.log(`applyAllChanges() 117a: [workloadID=${item}]  For ${item.workloadID} is workloadsValues.item.value ${dcItem} is INVALID: workloadsValues[${item.workloadID}].${entry[1]}[${dcItem}]=${workloadsValues[item.workloadID][entry[1]][dcItem]} -- workloadValid=${workloadValid}`)
                      workloadsValues[item.workloadID][entry[1]][dcItem]=0
                    }
                    else {
                      workloadsValues[item.workloadID][entry[1]][dcItem]=documentMain.getElementById(lookupDOMElement).checked
                      console.log(`applyAllChanges() 117b: [workloadID=${item}]  For ${item.workloadID} is workloadsValues.item.value ${dcItem} is VALID: workloadsValues[${item.workloadID}].${entry[1]}[${dcItem}]=${workloadsValues[item.workloadID][entry[1]][dcItem]}`)
                    }
                  }
                  break
                } 
                default:  {
                  // Keep the default or actual value  if nothing is provided
                  console.log(`applyAllChanges() 123: [workloadID=${item}]  CHECK: workloadID=${item.workloadID}, workloadsValues[${item.workloadID}] is ${entry[0]}, variable name associated is: ${entry[1]}`)
                  
                  if (inputElement.value !== '') {
                    console.log(`applyAllChanges() 126: [workloadID=${item}]  CHANGE: workloadID=${item.workloadID} - inputElement.value=${inputElement.value}`)
                    if (!isNaN(Number(inputElement.value))) {
                      workloadsValues[item.workloadID][entry[1]] = inputElement.value
                    }
                    else {
                      displayMsg(documentMain, "applyAllChanges", 174, "error", `workloadID=${item.workloadID} - ${entry[0]} must be a number (actual value=${inputElement.value})`,0,0,0)
                    }
                  }
                  else {
                    // Don't change the actual value (default)
                    console.log(`applyAllChanges() 136: [workloadID=${item}]  DEFAULT: workloadID=${item.workloadID} - ${entry[0]} is undefined - keeping set value`)
                  }
                  console.log(`applyAllChanges() 138: [workloadID=${item}] For ${item.workloadID} is workloadsValues.item.value is NEW ${value}: ${testToConsoleValue}=${workloadsValues[item.workloadID][entry[1]]}`)
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
      console.log(`applyAllChanges() 156: [chassisID=${item}]: chassisID = ${item}`)
      Object.keys(item).forEach((value) => {
        item.ChassisItemsDict.forEach((entry) => {
          if (generalValues.globalDebug) {
            // console.log(`applyAllChanges() 2: Working on entry for ChassisItemsDict - check ChassisItemsDict: ${item.ChassisItemsDict}`)
            // console.log(`applyAllChanges() 2: "chassis = item", entry is = ${entry}`)
            console.log(`applyAllChanges() 1562 [chassisID=${item}] Working on entry for ChassisItemsDict: ${entry[1]}`)
          }
          
          if (entry[1] == `${value}`) {
            console.log(`found value: ${value}`)
            const testToConsoleValue = `chassisValues[item.chassisID].${entry[1]}`
            const testForConsoleValue = chassisValues[item.chassisID][entry[1]]
            console.log(`applyAllChanges() 169: [chassisID=${item}] For ${item.chassisID} is chassisValues.item.value is actually ${value}: ${testToConsoleValue}=${testForConsoleValue}`) 
            if (value == "chassisID") {
              // console.log(`applyAllChanges -- workloads(): entry for chassisID ${item}=> skip it`)
            }
            else {
              // constructing the id string for the cell to read from
              let idStringToFind =  `chassis-${item.chassisID}-${entry[0]}`
              console.log(`applyAllChanges() 176: [chassisID=${item}] looking up the DOM element id ${idStringToFind}`)
              const inputElement = documentMain.getElementById(idStringToFind)
              let outputSubString = "output-"
              if (entry[0].includes(outputSubString)) {
                console.log(`applyAllChanges() 180: [chassisID=${item}] skipping entry[0] for input which is output: ${entry[0]}`)
              }
              else {
                switch (entry[0]) {
                  case "use-SSD4-over-NVMe4":
                  case "use-rgw-caching": 
                  case "use-nvme-7":
                  case "use-nvme-8": 
                  case "use-optane-1": {
                    chassisValues[item.chassisID][entry[1]]=documentMain.getElementById(idStringToFind).checked
                    console.log(`applyAllChanges() 189: [chassisID=${item}] For ${item.chassisID} setting entry[1]=${entry[1]} for idStringToFind=${idStringToFind} which is checked=${documentMain.getElementById(idStringToFind).checked}`)
                    console.log(`applyAllChanges() 190: [chassisID=${item}] For ${item.chassisID} is chassisValues.item.value is NEW: chassisValues[${item.chassisID}].${entry[1]}=${chassisValues[item.chassisID][entry[1]]}`)
                    break
                  }
                  default:  {
                    // Keep the default or actual value  if nothing is provided
                    if (inputElement.value !== '') {
                      console.log(`applyAllChanges() 196: [chassisID=${item}] CHANGE: workloadID=${item.workloadID} - inputElement.value=${inputElement.value}`)
                      if (!isNaN(Number(inputElement.value))) {
                        chassisValues[item.chassisID][entry[1]] = inputElement.value
                      }
                      else {
                        displayMsg(documentMain, "applyAllChanges", 244, "error", `[chassisID=${item}] ERROR: workloadID=${item.workloadID} - ${entry[0]} must be a number (actual value=${inputElement.value})`,0,0,0)
                      }
                    }
                    else {
                      // Don't change the actual value (default)
                      console.log(`applyAllChanges() 206: [chassisID=${item}] DEFAULT: workloadID=${item.workloadID} - ${entry[0]} is undefined - keeping set value`)
                    }
                    console.log(`applyAllChanges() 208: [chassisID=${item}] For ${item.chassisID} is chassisValues.item.value is NEW ${value}: ${testToConsoleValue}=${chassisValues[item.chassisID][entry[1]]}`)
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
      console.log(`applyAllChanges() 242: working on config ${actualChassisID}`)
      console.log(`applyAllChanges() 243:  the array is ${configsArrayLocal}`)
      console.log(`applyAllChanges() 244:  ... and the actual sub-array is the array ${configsArrayLocal[actualChassisID]}`)
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

  console.log(`applyAllChanges() 331: This is length of chassisNew array: ${Object.keys(resultNew).length}`)
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
  
    console.log(`applyAllChanges() 350: This is length of chassisNew array: ${Object.keys(dcResultsNew).length}`)
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