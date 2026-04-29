import displayMsg from "../common/displayMsg.js"
import {debugMsg} from "../common/debug.js";

const dcConfigDetermineNumberOfRoleInstances = function (generalValues, workloadsArrayLocal, sizingConstraints, dcConfigArrayLocal) {
  let localDebugOn = false

  // Determine the number of scale-out and special instances needed in this DC - as per number
  // Actually, the number of instances for each workload per DC is using the minimum number but spreads this minium number across all
  // DCs in a way that if there is one at all, all DCs get an instances regardless whether the minimum would require a lot lower number
  // if the instances would be distributed not evenly but only with the number of instances required as minimum.
  for (let dcItem = 0; dcItem < generalValues.numberOfDCsPossible; dcItem++) {
    // all instances for this actual DC:
    let localScaleoutInstances = 0
    let localSpecialInstances = 0
    // crawl through the workloads and figure out the different use cases that would need some kind of instance
    for (let workloadItem = 0; workloadItem < generalValues.numberOfWorkloadsPossible; workloadItem++) {
      // sum up all scale-out instances based on the useCase and the min number of instances for this use case
      // ...., then divide by the number of DCs use for this workload and then determine whether this actual DC is used
      // then add it to the actual counter
      if (workloadsArrayLocal[workloadItem].selectorArrayDC[dcItem] === true) {
        // actual DC is used => add the number of instances 
        switch (workloadsArrayLocal[workloadItem].useCase) {
          // "rbd","rgwdata","filedata","filemetadata","iscsi"]
          case "rbd":
            localScaleoutInstances += 0
            break
          case "rgwdata":
            localScaleoutInstances += Math.ceil(sizingConstraints.minNumberOfInstancesRoleRGW / workloadsArrayLocal[workloadItem].sumNumberDC)
            break
          case "filedata":  
            // filemetadata (it's taking only one set of MDS per workload but filedata ca be multiple for different
            // file systems or sub-trees with separat data (... with perhaps dedicated sets of MDS)
            localScaleoutInstances += Math.ceil(sizingConstraints.minNumberOfInstancesRoleMDS / workloadsArrayLocal[workloadItem].sumNumberDC)
            break
          case "filemetadata":
            // filemetadata can be only one per file system - all needed instances are already accounted in the filedata section
            localScaleoutInstances += 0
            break
          //
          // Special Instances
          //
          case "iscsi":
            localSpecialInstances += Math.ceil(sizingConstraints.minNumberOfInstancesRoleMDS / workloadsArrayLocal[workloadItem].sumNumberDC)
            break
  
          // no default: iSCSI and others might be configured but not counting as scale-out
        }
      }
    }
    dcConfigArrayLocal[dcItem].numberOfLocalScaleoutInstances = localScaleoutInstances
    dcConfigArrayLocal[dcItem].numberOfLocalSpecialInstances = localSpecialInstances
    if (generalValues.globalDebug == true || localDebugOn == true) {
      debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfRoleInstances", 53, `DC=${dcItem} => #scale-out role instances: ${dcConfigArrayLocal[dcItem].numberOfLocalScaleoutInstances}, #special role instances: ${dcConfigArrayLocal[dcItem].numberOfLocalSpecialInstances}`,0,0,0)
    }
  }
}

export default dcConfigDetermineNumberOfRoleInstances