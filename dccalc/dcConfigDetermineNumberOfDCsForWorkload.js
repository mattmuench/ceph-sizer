import displayMsg from "../common/displayMsg.js"
import {debugMsg} from "../common/debug.js";

const dcConfigDetermineNumberOfDCsForWorkload = function (generalValues, workloadsArrayLocal) {
  let localDebugOn = false
  
  for ( let workloadID = 0; workloadID < generalValues.numberOfWorkloadsPossible; workloadID++) {
    let dcUsedInWorkload = 0
    for ( let dcItem = 0; dcItem < generalValues.numberOfDCsPossible; dcItem++) {
      if (workloadsArrayLocal[workloadID].selectorArrayDC[dcItem] === true) {
          dcUsedInWorkload += 1
      }
    }
    workloadsArrayLocal[workloadID].sumNumberDC = dcUsedInWorkload
    if (generalValues.globalDebug == true || localDebugOn == true) {
      debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfDCsForWorkload", 16, `workloadID=${workloadID} uses #DCs: ${workloadsArrayLocal[workloadID].sumNumberDC}`,0,0,0)
    }
  }  
}

export default dcConfigDetermineNumberOfDCsForWorkload