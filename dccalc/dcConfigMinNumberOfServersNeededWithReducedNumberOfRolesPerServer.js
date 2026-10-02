import displayMsg from "../common/displayMsg.js"
import {debugMsg} from "../common/debug.js";

const dcConfigMinNumberOfServersNeededWithReducedNumberOfRolesPerServer   = function (generalValues, workloadsArrayLocal, sizingConstraints, dcConfigArrayLocal, dcItem) {
  let localDebugOn = false

  // Adjust the number of servers for actual DC if iscsi workload is running only in this actual DC. 
  // In this case, it perhaps might not make sense to have the iscsi gateway in a different DC, also, because it might be only useful if the client access is available to this additional
  // DC as well. For default, if the iscsi workload is only in a single DC selected, the assumption is to use only this DC but with a redundancy.
  
  let localDCsInUse = 0
  for (let dcCheck = 0; dcCheck < generalValues.numberOfDCsPossible; dcCheck++) {
    // Check whether this DC is used at all and add it to the DCs in use
    if (dcConfigArrayLocal[dcCheck].numberOfWorkloadsInDC > 0) {
      localDCsInUse += 1
    }
  }
  // If workload is relevant, and is NOT running in actual DC, => ignore it
  if (dcConfigArrayLocal[dcItem].numberOfWorkloadsInDC == 0) {
    // ignore
  }
  else {
    // workloads running in actual DC:
    let localMinNumOfServers = 0
    let localMinNumOfServersNew = 0
    for (let workloadItem = 0; workloadItem < generalValues.numberOfWorkloadsPossible; workloadItem++) {
      debugMsg(generalValues, localDebugOn, 5, "dcConfigMinNumberOfServersNeededWithReducedNumberOfRolesPerServer", 27, `[DC=${dcItem}] useCase=${workloadsArrayLocal[workloadItem].useCase}, workload=workloadsArrayLocal[${workloadItem}], selectorArrayDC[${dcItem}]=${workloadsArrayLocal[workloadItem].selectorArrayDC[dcItem]}, sumNumDC=${workloadsArrayLocal[workloadItem].sumNumberDC}`,0,0,0)
      if (workloadsArrayLocal[workloadItem].useCase == "iscsi" && workloadsArrayLocal[workloadItem].selectorArrayDC[dcItem] == true && workloadsArrayLocal[workloadItem].sumNumberDC == 1) {
        // the workload is relevant, of type iscsi-block, and exactly running only in actual DC => all gateways are placed in this actual DC
        if ((Math.ceil(dcConfigArrayLocal[dcItem].numberOfLocalScaleoutInstances/localDCsInUse) - dcConfigArrayLocal[dcItem].numberOfNeededMonInstances) > 0) {
          // The number of scale-out instances in this DC is more than needed mon instances => the number of nodes must be larger than only the number 
          //   of mons plus the exclusive instances and incorporate additional nodes for those that don't land on the nodes collocated with mons.
          if ( (Math.ceil(dcConfigArrayLocal[dcItem].numberOfLocalScaleoutInstances/localDCsInUse) 
                + Math.ceil((dcConfigArrayLocal[dcItem].numberOfLocalSpecialInstances-sizingConstraints.minNumberOfServersForSpecialRoles)/localDCsInUse) 
                + sizingConstraints.minNumberOfServersForSpecialRoles
               ) > dcConfigArrayLocal[dcItem].numberOfServersNeededForReplicaInSameDC ) {
            // The number of resulting instances for combined mon and scale-out, and exclusive instances is larger than the minimum number of servers within the DC for local replica and thus the number must be adjusted upwards.
            localMinNumOfServersNew = Math.ceil(dcConfigArrayLocal[dcItem].numberOfLocalScaleoutInstances/localDCsInUse) 
                                                                                        + Math.ceil(( dcConfigArrayLocal[dcItem].numberOfLocalSpecialInstances-sizingConstraints.minNumberOfServersForSpecialRoles )/localDCsInUse) 
                                                                                        + sizingConstraints.minNumberOfServersForSpecialRoles
           debugMsg(generalValues, localDebugOn, 5, "dcConfigMinNumberOfServersNeededWithReducedNumberOfRolesPerServer", 41, `[DC=${dcItem}] localMinNumOfServersNew=${localMinNumOfServersNew}`,0,0,0)
          }
          else {
            // The number of resulting instances for combined mon and scale-out, and exclusive instances is not larger than the minimum number of servers within the DC for local replica and the number of servers is exactly the latter.
            localMinNumOfServersNew = dcConfigArrayLocal[dcItem].numberOfServersNeededForReplicaInSameDC
            debugMsg(generalValues, localDebugOn, 5, "dcConfigMinNumberOfServersNeededWithReducedNumberOfRolesPerServer", 46, `[DC=${dcItem}] localMinNumOfServersNew=${localMinNumOfServersNew}`,0,0,0)
          }
        }
        else {
          // The number of scale-out instances in this DC is less than needed mon instances => no additional nodes requires for scale-out than the mons needed
          if ( (dcConfigArrayLocal[dcItem].numberOfNeededMonInstances + Math.ceil(( dcConfigArrayLocal[dcItem].numberOfLocalSpecialInstances - sizingConstraints.minNumberOfServersForSpecialRoles ) / localDCsInUse) + sizingConstraints.minNumberOfServersForSpecialRoles) > dcConfigArrayLocal[dcItem].numberOfServersNeededForReplicaInSameDC ) {
            // The number of resulting instances for mon is covering the scale-out, and this and exclusive instances is larger than the minimum number of servers within the DC for local replica and thus the number must be adjusted upwards.
            localMinNumOfServersNew = dcConfigArrayLocal[dcItem].numberOfNeededMonInstances + Math.ceil(( dcConfigArrayLocal[dcItem].numberOfLocalSpecialInstances - sizingConstraints.minNumberOfServersForSpecialRoles ) / localDCsInUse) + sizingConstraints.minNumberOfServersForSpecialRoles
            debugMsg(generalValues, localDebugOn, 5, "dcConfigMinNumberOfServersNeededWithReducedNumberOfRolesPerServer", 54, `[DC=${dcItem}] localMinNumOfServersNew=${localMinNumOfServersNew}`,0,0,0)
          }
          else {
            // The number of resulting instances for mon is covering the scale-out, and this and exclusive instances is not larger than the minimum number of servers within the DC for local replica and thus is exactly the latter.
            localMinNumOfServersNew = dcConfigArrayLocal[dcItem].numberOfServersNeededForReplicaInSameDC
            debugMsg(generalValues, localDebugOn, 5, "dcConfigMinNumberOfServersNeededWithReducedNumberOfRolesPerServer", 59, `[DC=${dcItem}] localMinNumOfServersNew=${localMinNumOfServersNew}`,0,0,0)
          }
        }
      }
      else {
        // the workload is relevant, of type iscsi-block, but running in more than the actual DC => the gateways will be distributed across the DCs
         if ( (Math.ceil(dcConfigArrayLocal[dcItem].numberOfLocalScaleoutInstances/localDCsInUse) - dcConfigArrayLocal[dcItem].numberOfNeededMonInstances) > 0 ) {
          // additional nodes needed for scale-out instances that are not collocated with already needed mon instances
          if ((Math.ceil(dcConfigArrayLocal[dcItem].numberOfLocalScaleoutInstances/localDCsInUse) + Math.ceil(dcConfigArrayLocal[dcItem].numberOfLocalSpecialInstances/localDCsInUse)) > dcConfigArrayLocal[dcItem].numberOfServersNeededForReplicaInSameDC ) {
            // The  number of scale-out nodes plus the exclusive instances ndoes is larger than the minimum number of servers within the DC for local replica and thus the number must be adjusted upwards.
            localMinNumOfServersNew = Math.ceil(dcConfigArrayLocal[dcItem].numberOfLocalScaleoutInstances/localDCsInUse) + Math.ceil(dcConfigArrayLocal[dcItem].numberOfLocalSpecialInstances/localDCsInUse)
            debugMsg(generalValues, localDebugOn, 5, "dcConfigMinNumberOfServersNeededWithReducedNumberOfRolesPerServer", 70, `[DC=${dcItem}] dlocalMinNumOfServersNew=${localMinNumOfServersNew}`,0,0,0)
          }
          else {
            // The  number of scale-out nodes plus the exclusive instances ndoes is not larger than the minimum number of servers within the DC for local replica and thus the number must be exactly the latter.
            localMinNumOfServersNew = dcConfigArrayLocal[dcItem].numberOfServersNeededForReplicaInSameDC
            debugMsg(generalValues, localDebugOn, 5, "dcConfigMinNumberOfServersNeededWithReducedNumberOfRolesPerServer", 75, `[DC=${dcItem}] localMinNumOfServersNew=${localMinNumOfServersNew}`,0,0,0)
          }
         }
         else {
          // no additional nodes needed for scale-out instances that are not collocated with already needed mon instances
          if ((dcConfigArrayLocal[dcItem].numberOfNeededMonInstances + Math.ceil(dcConfigArrayLocal[dcItem].numberOfLocalSpecialInstances/localDCsInUse)) > dcConfigArrayLocal[dcItem].numberOfServersNeededForReplicaInSameDC ) {
            // The number of exclusive instances nodes is larger than the minimum number of servers within the DC for local replica and thus the number must be adjusted upwards.
            localMinNumOfServersNew = dcConfigArrayLocal[dcItem].numberOfNeededMonInstances + Math.ceil(dcConfigArrayLocal[dcItem].numberOfLocalSpecialInstances/localDCsInUse)
            debugMsg(generalValues, localDebugOn, 5, "dcConfigMinNumberOfServersNeededWithReducedNumberOfRolesPerServer", 83, `[DC=${dcItem}] localMinNumOfServersNew=${localMinNumOfServersNew}`,0,0,0)
          }
          else {
            // The number of exclusive instances nodes is not larger than the minimum number of servers within the DC for local replica and thus the number must be exactly the latter.
            localMinNumOfServersNew = dcConfigArrayLocal[dcItem].numberOfServersNeededForReplicaInSameDC
            debugMsg(generalValues, localDebugOn, 5, "dcConfigMinNumberOfServersNeededWithReducedNumberOfRolesPerServer", 88, `[DC=${dcItem}] localMinNumOfServersNew=${localMinNumOfServersNew}`,0,0,0)
          }
         }
      }

      if (localMinNumOfServers < localMinNumOfServersNew) {
        localMinNumOfServers = localMinNumOfServersNew
      }
    }
    if (localMinNumOfServers > dcConfigArrayLocal[dcItem].numberOfServersNeededAllInstances){
      dcConfigArrayLocal[dcItem].prelimNumberOfServers = localMinNumOfServers
    }
    else {
      dcConfigArrayLocal[dcItem].prelimNumberOfServers = dcConfigArrayLocal[dcItem].numberOfServersNeededAllInstances
    }
    
  }
  debugMsg(generalValues, localDebugOn, 5, "dcConfigMinNumberOfServersNeededWithReducedNumberOfRolesPerServer", 105, `[DC=${dcItem}] dcConfigArrayLocal[dcItem].prelimNumberOfServers=${dcConfigArrayLocal[dcItem].prelimNumberOfServers}`,0,0,0)
}

export default dcConfigMinNumberOfServersNeededWithReducedNumberOfRolesPerServer