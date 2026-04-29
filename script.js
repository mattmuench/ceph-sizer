import GeneralValues from "./GeneralValues.js";
import LoadedConfigs from "./LoadedConfigs.js";
import TableHeaderChassis from "./TableChassisLabels.js";
import TableHeaderResults from "./TableResultsLabels.js";
import TableHeaderWorkloads from "./TableWorkloadsLabels.js";
import Workload from "./Workload.js";
import Chassis from "./Chassis.js";
import SizingConstraints from "./SizingContraints.js";
import DCConfig from "./DCConfig.js"
//import calcDCConfig from "./calcDCConfig.js";
//import calcResults from "./calcResults.js";
import userCalcConvertTiB from "./userCalcConvertTiB.js"
import buttonApplyChanges from "./buttonApplyChanges.js";
import Results from "./Results.js";
import documentAddOutputConfigsTable from "./documentAddOutputConfigsTable.js"
import documentAddWorkloadsTable from "./documentAddWorkloadsTable.js"
import {installEventHandlerLoadChassisConfig} from "./fileInput/installEventHandlerLoadChassisConfig.js"
import {installEventHandlerLoadWorkloadConfig} from "./fileInput/installEventHandlerLoadWorkloadConfig.js"
import {debugMsg} from "./common/debug.js";

let localDebugOn = false

const calculateDCDistribution = function (generalValues,workloadsArrayLocal,chassisArrayLocal) {
  // From Google Sheet - idea is to c heck the selection made, give some warnings perhaps but also
  // other information - from sheet area Cover!U32-Cover!AB40, checks on Cover!R33-Cover!S40
  // Not used yet
}

/// PROGRAM FLOW ///
// create generalSettings object - holds settings for all configurations
const generalSettings = new GeneralValues

//generalSettings.globalDebug = false

// All tables will show this number of configs - global setting (might become configurable eventually)
//generalSettings.numberOfConfigsPossible = 8

// SizingConstraints
const sizingConstraints = new SizingConstraints

// LoadedConfigs
const loadedConfigs = new LoadedConfigs

// check:
debugMsg(generalSettings,localDebugOn, 2, "main script", 45, `Checking on sizingConstraints: ${sizingConstraints.addCapacityPerPoolUse[0]}`,0,0,0)

// create tableHeaderChassis object - populating the table header for chassis configurations
const tableHeaderChassisArray = new TableHeaderChassis


// Program flow (M1)
let successConvertTib = userCalcConvertTiB(document,generalSettings)
debugMsg(generalSettings,localDebugOn, 10, "main script", 53, `call to convertTib resulted in: ${successConvertTib}`,0,0,0)


  /// CALL TO FUNCTIONS to create tables ///

  // Put the Apply chassis changes button before the overview table
// Program Flow (M2)
const preSectChangeChassisConfigs = document.createElement("p");
const buttonApplyChangesConfigs= document.createElement("button")
buttonApplyChangesConfigs.setAttribute("id","button-apply-changes")
buttonApplyChangesConfigs.textContent = "Apply changes"
//buttonApplyChangedChassisConfigs.setAttribute("class","favorite styled")
preSectChangeChassisConfigs.appendChild(buttonApplyChangesConfigs)
document.body.appendChild(preSectChangeChassisConfigs)

//// THIS was the original creation of Chassis Config input table:  
//// documentAddTable(document,"Config","chassis",generalSettings.numberOfConfigsPossible,tableHeaderChassisArray)
//// THIS is now trying to use the workloads table structure because we have other styles like input and checkbox already
// Program flow (M5)
documentAddWorkloadsTable(document,generalSettings,"Config","chassis",generalSettings.numberOfConfigsPossible,tableHeaderChassisArray)


// Put the Apply chassis changes button before the overview table
// Program flow (M6)
const interSectChangeChassisConfigs = document.createElement("p");
const buttonApplyChangedChassisConfigs= document.createElement("button")
buttonApplyChangedChassisConfigs.setAttribute("id","button-apply-chassis-changes")
buttonApplyChangedChassisConfigs.textContent = "Apply chassis changes"
//buttonApplyChangedChassisConfigs.setAttribute("class","favorite styled")
interSectChangeChassisConfigs.appendChild(buttonApplyChangedChassisConfigs)
document.body.appendChild(interSectChangeChassisConfigs)

// Separate configs output table from config input table
// Program flow (M6a)
const intersectOverviewConfigFromOverview = document.createElement("p");
intersectOverviewConfigFromOverview.innerHTML = "<b>Resulting configurations as per workloads per config from above - as BOM for each -- in sum across all DCs and servers :</b>"
//buttonApplyChangedChassisConfigs.setAttribute("class","favorite styled")
//interSectChangeChassisConfigs.appendChild(buttonApplyChangedChassisConfigs)
document.body.appendChild(intersectOverviewConfigFromOverview)

// create tableHeaderChassis object - populating the table header for chassis configurations
// Program flow (M7)
// display the table for overview of all resulting configurations for all configs across all DCs
const tableHeaderResultingConfigsArray = new TableHeaderResults
documentAddOutputConfigsTable(document,generalSettings,"Config","resultsoverview",tableHeaderResultingConfigsArray,generalSettings.numberOfConfigsPossible)

// Separate workloads input table from config results overview table
// Program flow (M8)
const intersectOverviewConfigFromWorkloads = document.createElement("p");
intersectOverviewConfigFromWorkloads.innerHTML = "<b>Please input the workloads below and when finished with changes hit the Apply changed workloads button below:</b>"
//buttonApplyChangedChassisConfigs.setAttribute("class","favorite styled")
//interSectChangeChassisConfigs.appendChild(buttonApplyChangedChassisConfigs)
document.body.appendChild(intersectOverviewConfigFromWorkloads)


// display the workloads input table
// Program flow (M9)
const tableHeaderWorkloadsInputArray = new TableHeaderWorkloads;
documentAddWorkloadsTable(document,generalSettings,"Workload","workload",generalSettings.numberOfWorkloadsPossible,tableHeaderWorkloadsInputArray)

// Put the Apply workloads changes button after the workloads table
// Program flow (M10)
const interSectApplyWorkloadChanges = document.createElement("p");
const buttonApplyWorkloadsConfigs= document.createElement("button")
buttonApplyWorkloadsConfigs.setAttribute("id","button-apply-workloads-changes")
buttonApplyWorkloadsConfigs.textContent = "Apply workloads changes"
//buttonApplyWorkloadsConfigs.setAttribute("class","favorite styled")
interSectApplyWorkloadChanges.appendChild(buttonApplyWorkloadsConfigs)
document.body.appendChild(interSectApplyWorkloadChanges)

// Separate configs output table from config input table
// Program flow (M10a)
const intersectWorkloadsFromDCConfigs = document.createElement("p");
intersectWorkloadsFromDCConfigs.innerHTML = "<b>Resulting configurations as per workloads per config from above - as detailed server configuration per DC:</b>"
//buttonApplyChangedChassisConfigs.setAttribute("class","favorite styled")
//interSectChangeChassisConfigs.appendChild(buttonApplyChangedChassisConfigs)
document.body.appendChild(intersectWorkloadsFromDCConfigs)

// display the tables for an individual config across all DCs
// Program flow (M11)
let arrayOfConfigsResults = [];
for (let configNum = 0; configNum < generalSettings.numberOfConfigsPossible; configNum++) {
    const tableHeaderResultsPerConfigArray = new TableHeaderResults;
    tableHeaderResultsPerConfigArray.header[0][0] = `Resulting configuration "config "${configNum+1}`
    arrayOfConfigsResults.push(tableHeaderResultsPerConfigArray)
    documentAddOutputConfigsTable(document,generalSettings,"DC ",`results-configNum-${configNum}`,tableHeaderResultsPerConfigArray, generalSettings.numberOfDCsPossible)
}


// create the objects for holding all information
// 1) workloads: initialize also the arrays holding specific information about the DC use - note that the number 
//    of DCs is variable and defined globally in GeneralValues.numberOfConfigsPossible 
// Program flow (M12)
const workloadsArray = []
for (let workloadConfig = 0; workloadConfig < generalSettings.numberOfWorkloadsPossible; workloadConfig++) {
  const workloadNew = new Workload
  for (let z=0; z<generalSettings.numberOfWorkloadsPossible; z++) {
    workloadNew.selectorArrayDC[z]=false;
    workloadNew.checkArrayMinServersDC[z]=0;
    workloadNew.workloadItemsDict.forEach((entry) => {
      if (entry[0] == "selector-dc" ) {
        /// Don't need to record the full name :
        ///   entry[2].push(`selector-dc${z}`)
        /// ... but only the numbers - and by the entry can then select and construct the name
        entry[2][z]=z
      }
      if (entry[0] == "selector-dc" ) {
        if (generalSettings.globalDebug) {
          debugMsg(generalSettings,localDebugOn, 4, "main script", 161, `workloadsArrayINIT: Working on entry for workloadsDict: ${entry[1]}`,0,0,0)
          debugMsg(generalSettings,localDebugOn, 4, "main script", 162, `workloadsArrayINIT: #DC entries for workloadsDict: ${entry[2].length}`,0,0,0)
          debugMsg(generalSettings,localDebugOn, 4, "main script", 163, `workloadsArrayINIT: actual DC entry for workloadsDict: ${entry[2][z]}`,0,0,0)
        }
      }
    })
  }
  
  debugMsg(generalSettings,localDebugOn, 10, "main script", 169, `his is length of workloadNew array: ${Object.keys(workloadNew).length}`,0,0,0)
  workloadNew.workloadID = `${workloadConfig}`
  
  workloadsArray.push(workloadNew)
}
// check content of the array of workloads (just another array)
debugMsg(generalSettings,localDebugOn, 10, "main script", 175, `workloadsArray for workloads has content, a first for config#: ${workloadsArray[0].workloadID}`,0,0,0)
debugMsg(generalSettings,localDebugOn, 10, "main script", 176, `workloadsArray for workloads has content, a last for config#: ${workloadsArray[generalSettings.numberOfWorkloadsPossible-1].workloadID}`,0,0,0)

    // CHECK the external values - perhaps, need to work with an external object or do we return the newObject ?
    for (let workloads = 0; workloads < workloadsArray.length; workloads++) {
      // find all workload characterizing values from cells - go through all items in the object and find the appropriate input cells
      Object.keys(workloadsArray[workloads]).forEach((value) => {
        workloadsArray[workloads].workloadItemsDict.forEach((entry) => {
          if (entry[1] == `${value}`) {
            debugMsg(generalSettings,localDebugOn, 10, "main script", 184, `EXTERNAL-PRE CHECK workloads: ${workloads} found value ${value}: ${workloadsArray[workloads][entry[1]]}`,0,0,0)
            //console.log(`EXTERNAL-PRE CHECK-A workloads: ${workloads} found value ${value}: ${workloadsArray[workloads].useCase}`)
          }
        })
      })
    }

// 2) chassis: => initialize also the arrays holding specific information about the DC use - note that the number 
//    of DCs is variable and defined globally in GeneralValues.numberOfConfigsPossible 
// Program flow (M13)
const chassisArray = []
for (let chassisConfig = 0; chassisConfig < generalSettings.numberOfConfigsPossible; chassisConfig++) {
  const chassisNew = new Chassis
  debugMsg(generalSettings,localDebugOn, 9, "main script", 197, `This is length of chassisNew array: ${Object.keys(chassisNew).length}`,0,0,0)
  chassisNew.chassisID = `${chassisConfig}`
  
  chassisArray.push(chassisNew)
}
// check content of the array of workloads (just another array)
debugMsg(generalSettings,localDebugOn, 4, "main script", 203, `chassisArray for chassis has content a first for config#: ${chassisArray[0].chassisID}`,0,0,0)
debugMsg(generalSettings,localDebugOn, 4, "main script", 204, `chassisArray for chassis has content a last for config#: ${chassisArray[generalSettings.numberOfConfigsPossible-1].chassisID}`,0,0,0)

    // CHECK the external values - perhaps, need to work with an external object or do we return the newObject ?
    for (let chassisConfig = 0; chassisConfig < chassisArray.length; chassisConfig++) {
      // find all chassis characterizing values from cells - go through all items in the object and find the appropriate input cells
      Object.keys(chassisArray[chassisConfig]).forEach((value) => {
        chassisArray[chassisConfig].ChassisItemsDict.forEach((entry) => {
          if (entry[1] == `${value}`) {
            debugMsg(generalSettings,localDebugOn, 10, "main script", 212, `EXTERNAL-PRE CHECK chassis: ${chassisConfig} found value ${value}: ${chassisArray[chassisConfig][entry[1]]}`,0,0,0)
          }
        })
      })
    }    


// 3) dcConfigs: => initialize also the arrays holding specific information about the DC use - note that the number 
//    of DCs is variable and defined globally in GeneralValues.numberOfConfigsPossible
// DCConfig is per DC based on the individual chassis configuration and per Chassis configuration
// Program flow (M14) 
const configsArray = []
for (let config = 0; config < generalSettings.numberOfConfigsPossible; config++) {
  const dcConfigArray = []
  for (let dcConfig = 0; dcConfig < generalSettings.numberOfDCsPossible; dcConfig++) {
    const dcConfigNew = new DCConfig
    
    debugMsg(generalSettings,localDebugOn, 4, "main script", 229, `This is length of chassisNew array: ${Object.keys(dcConfigNew).length}`,0,0,0)
    
    dcConfigNew.DCID = `${dcConfig}`
    dcConfigArray.push(dcConfigNew)
  }
  configsArray.push(dcConfigArray)
}
/// check:
let actualChassisID = 0

debugMsg(generalSettings,localDebugOn, 4, "main script", 239, `working on config ${actualChassisID}`,0,0,0)
debugMsg(generalSettings,localDebugOn, 4, "main script", 240, `  the array is ${configsArray}`,0,0,0)
debugMsg(generalSettings,localDebugOn, 4, "main script", 241, ` ... and the actual sub-array is the array ${configsArray[actualChassisID]}`,0,0,0)



// 4) results: => initialize also the arrays holding specific information about the DC use - note that the number 
//    of DCs is variable and defined globally in GeneralValues.numberOfConfigsPossible
// Program flow (M15) 
const resultsOverviewArray = []
for (let resultingConfig = 0; resultingConfig < generalSettings.numberOfConfigsPossible; resultingConfig++) {
  const resultNew = new Results
  debugMsg(generalSettings,localDebugOn, 5, "main script", 251, `This is length of chassisNew array: ${Object.keys(resultNew).length}`,0,0,0)
  resultNew.chassisID = `${resultingConfig}`
  
  resultsOverviewArray.push(resultNew)
}

// Program flow (M16)
let buttonApplyChangesClicked = buttonApplyChanges(document, generalSettings, workloadsArray, chassisArray, sizingConstraints,  configsArray, tableHeaderResultingConfigsArray, resultsOverviewArray )
let resultInstallEventHandler1 = installEventHandlerLoadChassisConfig (document, chassisArray, generalSettings, loadedConfigs)
let resultInstallEventHandler2 = installEventHandlerLoadWorkloadConfig (document, workloadsArray, generalSettings, loadedConfigs)
// installed EventListeners 

// CHECK the external values - perhaps, need to work with an external object or do we return the newObject ?
for (let workloads = 0; workloads < workloadsArray.length; workloads++) {
  // find all workload characterizing values from cells - go through all items in the object and find the appropriate input cells
  Object.keys(workloadsArray[workloads]).forEach((value) => {
    workloadsArray[workloads].workloadItemsDict.forEach((entry) => {
      if (entry[1] == `${value}`) {
        debugMsg(generalSettings,localDebugOn, 5, "main script", 269, `EXTERNAL-POST CHECK workloads: ${workloads} found value ${value}: ${workloadsArray[workloads][entry[1]]}`,0,0,0)
      }
    })
  })
}

document.getElementById("misc-message").innerText = `none`
document.getElementById("error-message").innerText = `none`


