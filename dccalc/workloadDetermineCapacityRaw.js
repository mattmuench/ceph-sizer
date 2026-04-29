import displayMsg from "../common/displayMsg.js"
import {debugMsg} from "../common/debug.js";

const workloadDetermineCapacityRaw = function (generalValues, workloadsArrayLocal, sizingConstraints) {
  let localDebugOn = false

  /// Determine the raw capacity, flash raw capacity, and HDD raw capacity needed for each workload and store it there
  // The values are per workload in sum for all DCs used for this workload.
  for (let workloadItem = 0; workloadItem < generalValues.numberOfWorkloadsPossible; workloadItem++) {
    let localGrossCapacity = workloadsArrayLocal[workloadItem].reqCapacityNet * workloadsArrayLocal[workloadItem].reqNumReplica / sizingConstraints.cephClusterNearFull
    workloadsArrayLocal[workloadItem].reqCapacityGrossHDD = localGrossCapacity * (1 - workloadsArrayLocal[workloadItem].reqFlashPercent/100)
    // if nvme performance selected (for flash), the flash capacity should be provided by NVMe
    if (workloadsArrayLocal[workloadItem].selectorNVMe == true ){
      workloadsArrayLocal[workloadItem].reqCapacityGrossNVMe = localGrossCapacity * workloadsArrayLocal[workloadItem].reqFlashPercent/100
    }
    else {
      workloadsArrayLocal[workloadItem].reqCapacityGrossSSD = localGrossCapacity * workloadsArrayLocal[workloadItem].reqFlashPercent/100
    }
    
    if (generalValues.globalDebug == true || localDebugOn == true) {
      debugMsg(generalValues, localDebugOn, 5, "workloadDetermineCapacityRaw", 21, `input for calc: net=${workloadsArrayLocal[workloadItem].reqCapacityNet}, replica=${workloadsArrayLocal[workloadItem].reqNumReplica}, clusterNearFull=${sizingConstraints.cephClusterNearFull};localGrossCapacity=${localGrossCapacity}`,0,0,0)
      debugMsg(generalValues, localDebugOn, 5, "workloadDetermineCapacityRaw", 22, `gross capacity per used DC based on replica for workloadID=${workloadItem} => HDD=${workloadsArrayLocal[workloadItem].reqCapacityGrossHDD}, SSD=${workloadsArrayLocal[workloadItem].reqCapacityGrossSSD}, NVMe=${workloadsArrayLocal[workloadItem].reqCapacityGrossNVMe}`,0,0,0)
    }
  }
}


export default workloadDetermineCapacityRaw