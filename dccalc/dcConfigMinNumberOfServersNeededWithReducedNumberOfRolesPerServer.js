import displayMsg from "../common/displayMsg.js"
import {debugMsg} from "../common/debug.js";

const dcConfigMinNumberOfServersNeededWithReducedNumberOfRolesPerServer   = function (generalValues, workloadsArrayLocal, sizingConstraints, dcConfigArrayLocal, dcItem) {
  let localDebugOn = false

  // Adjust the number of servers for actual DC if iscsi workload is running only in this actual DC. 
  // In this case, it perhaps might not make sense to have the iscsi gateway in a different DC, also, because it might be only useful if the client access is available to this addition
  // DC as well. For default, if the iscsi workload is only in a single DC selected, the assumption is to use only this DC but with a redundancy.
  
  let localDCsInUse = 0  // B41
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
      // the workload is relevant, of type iscsi-block, and exactly running only in actual DC
      debugMsg(generalValues, localDebugOn, 5, "dcConfigMinNumberOfServersNeededWithReducedNumberOfRolesPerServer", 28, `[DC=${dcItem}] useCase=${workloadsArrayLocal[workloadItem].useCase}, workload=workloadsArrayLocal[${workloadItem}], selectorArrayDC[${dcItem}]=${workloadsArrayLocal[workloadItem].selectorArrayDC[dcItem]}, sumNumDC=${workloadsArrayLocal[workloadItem].sumNumberDC}`,0,0,0)
      if (workloadsArrayLocal[workloadItem].useCase == "iscsi" && workloadsArrayLocal[workloadItem].selectorArrayDC[dcItem] == true && workloadsArrayLocal[workloadItem].sumNumberDC == 1) {
        //.... then, if (roundup($C41/$B41,0)-$S41)>0 ),
        if ((Math.ceil(dcConfigArrayLocal[dcItem].numberOfLocalScaleoutInstances/localDCsInUse) - dcConfigArrayLocal[dcItem].numberOfNeededMonInstances) > 0) {
          // ... then, if (($S41+roundup((roundup($C41/$B41,0)-$S41)/1,0)+roundup(($E41-$AG$3)/$B41,0)+$AG$3)>$R41 )
          if ( (Math.ceil(dcConfigArrayLocal[dcItem].numberOfLocalScaleoutInstances/localDCsInUse) 
                + Math.ceil((dcConfigArrayLocal[dcItem].numberOfLocalSpecialInstances-sizingConstraints.minNumberOfServersForSpecialRoles)/localDCsInUse) 
                + sizingConstraints.minNumberOfServersForSpecialRoles
               ) > dcConfigArrayLocal[dcItem].numberOfServersNeededForReplicaInSameDC ) {
           // ... then use $S41+roundup((roundup($C41/$B41,0)-$S41)/1,0)+roundup(($E41-$AG$3)/$B41,0)+$AG$3
           localMinNumOfServersNew = Math.ceil(dcConfigArrayLocal[dcItem].numberOfLocalScaleoutInstances/localDCsInUse) 
                                                                                        + Math.ceil(( dcConfigArrayLocal[dcItem].numberOfLocalSpecialInstances-sizingConstraints.minNumberOfServersForSpecialRoles )/localDCsInUse) 
                                                                                        + sizingConstraints.minNumberOfServersForSpecialRoles
           debugMsg(generalValues, localDebugOn, 5, "dcConfigMinNumberOfServersNeededWithReducedNumberOfRolesPerServer", 41, `[DC=${dcItem}] localMinNumOfServersNew=${localMinNumOfServersNew}`,0,0,0)
          }
          else {
            localMinNumOfServersNew = dcConfigArrayLocal[dcItem].numberOfServersNeededForReplicaInSameDC
            debugMsg(generalValues, localDebugOn, 5, "dcConfigMinNumberOfServersNeededWithReducedNumberOfRolesPerServer", 45, `[DC=${dcItem}] localMinNumOfServersNew=${localMinNumOfServersNew}`,0,0,0)
          }
        }
        else {
          // else, if (($S41+roundup(($E41-$AG$3)/$B41,0)+$AG$3)>$R41)
          if ( (dcConfigArrayLocal[dcItem].numberOfNeededMonInstances + Math.ceil(( dcConfigArrayLocal[dcItem].numberOfLocalSpecialInstances - sizingConstraints.minNumberOfServersForSpecialRoles ) / localDCsInUse) + sizingConstraints.minNumberOfServersForSpecialRoles) > dcConfigArrayLocal[dcItem].numberOfServersNeededForReplicaInSameDC ) {
            // .. then use $S41+roundup(($E41-$AG$3)/$B41,0)+$AG$3
            localMinNumOfServersNew = dcConfigArrayLocal[dcItem].numberOfNeededMonInstances + Math.ceil(( dcConfigArrayLocal[dcItem].numberOfLocalSpecialInstances - sizingConstraints.minNumberOfServersForSpecialRoles ) / localDCsInUse) + sizingConstraints.minNumberOfServersForSpecialRoles
            debugMsg(generalValues, localDebugOn, 5, "dcConfigMinNumberOfServersNeededWithReducedNumberOfRolesPerServer", 53, `[DC=${dcItem}] localMinNumOfServersNew=${localMinNumOfServersNew}`,0,0,0)
          }
          else {
            localMinNumOfServersNew = dcConfigArrayLocal[dcItem].numberOfServersNeededForReplicaInSameDC
            debugMsg(generalValues, localDebugOn, 5, "dcConfigMinNumberOfServersNeededWithReducedNumberOfRolesPerServer", 57, `[DC=${dcItem}] localMinNumOfServersNew=${localMinNumOfServersNew}`,0,0,0)
          }
        }
      }
      else {
         // else, if ((roundup($C41/$B41,0)-$S41)>0)
         if ( (Math.ceil(dcConfigArrayLocal[dcItem].numberOfLocalScaleoutInstances/localDCsInUse) - dcConfigArrayLocal[dcItem].numberOfNeededMonInstances) > 0 ) {
          // .... then, if (($S41+roundup((roundup($C41/$B41,0)-$S41)/1,0)+roundup($E41/$B41,0))>$R41)
          if ((Math.ceil(dcConfigArrayLocal[dcItem].numberOfLocalScaleoutInstances/localDCsInUse) + Math.ceil(dcConfigArrayLocal[dcItem].numberOfLocalSpecialInstances/localDCsInUse)) > dcConfigArrayLocal[dcItem].numberOfServersNeededForReplicaInSameDC ) {
            // .... then, use $S41+roundup((roundup($C41/$B41,0)-$S41)/1,0)+roundup($E41/$B41,0)
            localMinNumOfServersNew = Math.ceil(dcConfigArrayLocal[dcItem].numberOfLocalScaleoutInstances/localDCsInUse) + Math.ceil(dcConfigArrayLocal[dcItem].numberOfLocalSpecialInstances/localDCsInUse)
            debugMsg(generalValues, localDebugOn, 5, "dcConfigMinNumberOfServersNeededWithReducedNumberOfRolesPerServer", 68, `[DC=${dcItem}] dlocalMinNumOfServersNew=${localMinNumOfServersNew}`,0,0,0)
          }
          else {
            localMinNumOfServersNew = dcConfigArrayLocal[dcItem].numberOfServersNeededForReplicaInSameDC
            debugMsg(generalValues, localDebugOn, 5, "dcConfigMinNumberOfServersNeededWithReducedNumberOfRolesPerServer", 72, `[DC=${dcItem}] localMinNumOfServersNew=${localMinNumOfServersNew}`,0,0,0)
          }
         }
         else {
          // else, if (($S41+roundup($E41/$B41,0))>$R41)
          if ((dcConfigArrayLocal[dcItem].numberOfNeededMonInstances + Math.ceil(dcConfigArrayLocal[dcItem].numberOfLocalSpecialInstances/localDCsInUse)) > dcConfigArrayLocal[dcItem].numberOfServersNeededForReplicaInSameDC ) {
            // ... then, use $S41+roundup($E41/$B41,0)
            localMinNumOfServersNew = dcConfigArrayLocal[dcItem].numberOfNeededMonInstances + Math.ceil(dcConfigArrayLocal[dcItem].numberOfLocalSpecialInstances/localDCsInUse)
            debugMsg(generalValues, localDebugOn, 5, "dcConfigMinNumberOfServersNeededWithReducedNumberOfRolesPerServer", 80, `[DC=${dcItem}] localMinNumOfServersNew=${localMinNumOfServersNew}`,0,0,0)
          }
          else {
            localMinNumOfServersNew = dcConfigArrayLocal[dcItem].numberOfServersNeededForReplicaInSameDC
            debugMsg(generalValues, localDebugOn, 5, "dcConfigMinNumberOfServersNeededWithReducedNumberOfRolesPerServer", 84, `[DC=${dcItem}] localMinNumOfServersNew=${localMinNumOfServersNew}`,0,0,0)
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
  debugMsg(generalValues, localDebugOn, 5, "dcConfigMinNumberOfServersNeededWithReducedNumberOfRolesPerServer", 101, `[DC=${dcItem}] dcConfigArrayLocal[dcItem].prelimNumberOfServers=${dcConfigArrayLocal[dcItem].prelimNumberOfServers}`,0,0,0)
}

export default dcConfigMinNumberOfServersNeededWithReducedNumberOfRolesPerServer