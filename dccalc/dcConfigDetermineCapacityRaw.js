import displayMsg from "../common/displayMsg.js"
import {debugMsg} from "../common/debug.js";

const dcConfigDetermineCapacityRaw = function (generalValues, workloadsArrayLocal, dcConfigArrayLocal) {
  let localDebugOn = false

  /// Determine the flash and HDD raw capaciy needed based on shares defined by the number of actually used DCs per workload
  /// and assign the actual needed capacity as sum of all for a DC to dcConfig
  /// Inside the WorkloadsArray[] workload, use the selectorArrayDC to determine wether a workload uses this DC before adding the
  /// capacity to a certain actual DC capacity
  for (let dcItem = 0; dcItem < generalValues.numberOfDCsPossible; dcItem++) {
    let localDCCapacityFlash = 0
    let localDCCapacityHDD = 0
    // clean the previous selection for number of workloads per DC
    dcConfigArrayLocal[dcItem].numberOfWorkloadsInDC = 0
    
    for (let workloadItem = 0; workloadItem < generalValues.numberOfWorkloadsPossible; workloadItem++) {
      if (workloadsArrayLocal[workloadItem].selectorArrayDC[dcItem] === true) {
        debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineCapacityRaw", 19, `workload=${workloadItem} found selector for DC=${dcItem}`,0,0,0)
        // workload uses this DC
        dcConfigArrayLocal[dcItem].numberOfWorkloadsInDC += 1
        localDCCapacityFlash += workloadsArrayLocal[workloadItem].reqCapacityGrossSSD / workloadsArrayLocal[workloadItem].sumNumberDC
        localDCCapacityHDD += workloadsArrayLocal[workloadItem].reqCapacityGrossHDD / workloadsArrayLocal[workloadItem].sumNumberDC
      }
    }
    dcConfigArrayLocal[dcItem].capacityNeededForSSD = localDCCapacityFlash
    dcConfigArrayLocal[dcItem].capacityNeededForHDD = localDCCapacityHDD
    if (generalValues.globalDebug == true || localDebugOn == true) {
      debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineCapacityRaw", 29, `DC=${dcItem} raw capacity HDD=${dcConfigArrayLocal[dcItem].capacityNeededForHDD}, SSD=${dcConfigArrayLocal[dcItem].capacityNeededForSSD}`,0,0,0)
    }
  }
}

export default dcConfigDetermineCapacityRaw