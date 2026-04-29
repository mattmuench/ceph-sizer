import displayMsg from "../common/displayMsg.js"
import {debugMsg} from "../common/debug.js";

const dcConfigDetermineNumberOfDCsInUse = function (generalValues, workloadsArrayLocal) {
  let localDebugOn = false

  let numberOfUsedDCsAllWorkloads = 0
  for ( let dcItem = 0; dcItem < generalValues.numberOfDCsPossible; dcItem++) {
    
    let dcUsedInWorkload = false
    for ( let workloadID = 0; workloadID < generalValues.numberOfWorkloadsPossible; workloadID++) {
      if (workloadsArrayLocal[workloadID].selectorArrayDC[dcItem] === true) {
        dcUsedInWorkload = true
      }
    }
    if (dcUsedInWorkload) {numberOfUsedDCsAllWorkloads++}
    // reset counter to restart for the next DC number
    dcUsedInWorkload = false
    
  }
  generalValues.numberOfDCsInUse = numberOfUsedDCsAllWorkloads
  if (generalValues.globalDebug == true || localDebugOn == true) {
    debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfDCsInUse", 23, `set GeneralValues.numberOfDCsInUse to ${generalValues.numberOfDCsInUse}`,0,0,0)
  }
}

export default dcConfigDetermineNumberOfDCsInUse