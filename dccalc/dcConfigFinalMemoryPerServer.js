// trying to implement AA41
const dcConfigFinalMemoryPerServer   = function (sizingConstraints, dcConfigArrayLocal, actualChassisID, dcItem) {
  // =if($Y41>0
  //    ,
  //      roundup($J41/$Y41,0) * $G$6
  //      + roundup($J42/$Y41,0) * $J$6
  //      + roundup($N41/$Y41,0) * $AH$6
  //      + $AR$6
  //      + if(C41>0
  //          ,
  //            if(roundup(($Y41-$S41-$E41)/C41,0) < 1
  //              ,
  //                $AR$7
  //              ,
  //                0
  //              )
  //          ,
  //            0
  //          )
  //    ,
  //      0
  //    )

  let localAdditionalRoleMemory = 0
  if (dcConfigArrayLocal[dcItem].numberOfLocalScaleoutInstances > 0) {
    if (Math.round((dcConfigArrayLocal[dcItem].resultingNumberOfServersAsPerChassis - dcConfigArrayLocal[dcItem].numberOfNeededMonInstances - dcConfigArrayLocal[dcItem].numberOfLocalSpecialInstances)/dcConfigArrayLocal[dcItem].numberOfLocalScaleoutInstances) < 1) {
      localAdditionalRoleMemory = sizingConstraints.memPerAdditionalRole
    }
    else {
      localAdditionalRoleMemory = 0
    }
  }
  else {
    localAdditionalRoleMemory = 0
  }

  if (dcConfigArrayLocal[dcItem].resultingNumberOfServersAsPerChassis > 0) {
    dcConfigArrayLocal[dcItem].resultingMem = Math.round(dcConfigArrayLocal[dcItem].numberOfHDDNeeded / dcConfigArrayLocal[dcItem].resultingNumberOfServersAsPerChassis) * sizingConstraints.memInGBPerHDD
                                              + Math.round(dcConfigArrayLocal[dcItem].numberOfSSDNeeded / dcConfigArrayLocal[dcItem].resultingNumberOfServersAsPerChassis) * sizingConstraints.memInGBPerSSD
                                              + Math.round(dcConfigArrayLocal[dcItem].numberOfNVMe6Needed / dcConfigArrayLocal[dcItem].resultingNumberOfServersAsPerChassis) * sizingConstraints.memInGBPerNVMeForObjectIndexOnNVMe6
                                              + sizingConstraints.memPerNodeBase
                                              + localAdditionalRoleMemory
  }
  else {
    dcConfigArrayLocal[dcItem].resultingMem = 0
  }

  console.log(`dcConfigFinalMemoryPerServer() 48: [chassisID=${actualChassisID}] dcConfigArrayLocal[dcItem=${dcItem}].resultingMem=${dcConfigArrayLocal[dcItem].resultingMem}`)
}

export default dcConfigFinalMemoryPerServer