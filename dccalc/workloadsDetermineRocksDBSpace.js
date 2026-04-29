import displayMsg from "../common/displayMsg.js"
import {debugMsg} from "../common/debug.js";

const workloadsDetermineRocksDBSpace = function (generalValues, workloadArrayLocal, sizingConstraints) {
  let localDebugOn = false

  for (let workloadItem = 0; workloadItem < generalValues.numberOfWorkloadsPossible; workloadItem++) {
    const useCase = workloadArrayLocal[workloadItem].useCase
    if (generalValues.globalDebug == true || localDebugOn == true) {
      debugMsg(generalValues, localDebugOn, 5, "workloadsDetermineRocksDBSpace", 10, `workloadItem=${workloadItem}, USE CASE => ${workloadArrayLocal[workloadItem].useCase}, locally used: ${useCase}`,0,0,0)
    }
    
    sizingConstraints.addCapacityPerPoolUse.forEach((useCaseName)=>{
      if (generalValues.globalDebug == true) {
        debugMsg(generalValues, localDebugOn, 5, "workloadsDetermineRocksDBSpace", 15, `ENTERING check for use case, useCaseName=${useCaseName[0]}`,0,0,0)
      }
      if (useCaseName[0] == useCase) {
        workloadArrayLocal[workloadItem].rocksDBSpaceInPercent = useCaseName[1]
        if (generalValues.globalDebug == true) {
          debugMsg(generalValues, localDebugOn, 5, "workloadsDetermineRocksDBSpace", 20, `workloadItem=${workloadItem}, use case picked additional capacity = ${useCaseName[1]}, set item to: ${workloadArrayLocal[workloadItem].rocksDBSpaceInPercent}`,0,0,0)
        }
      }
    })
  }
  
}

export default workloadsDetermineRocksDBSpace