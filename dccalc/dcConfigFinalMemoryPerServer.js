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
    if (Math.ceil((dcConfigArrayLocal[dcItem].resultingNumberOfServersAsPerChassis - dcConfigArrayLocal[dcItem].numberOfNeededMonInstances - dcConfigArrayLocal[dcItem].numberOfLocalSpecialInstances)/dcConfigArrayLocal[dcItem].numberOfLocalScaleoutInstances) < 1) {
      localAdditionalRoleMemory = sizingConstraints.memPerAdditionalRole
    }
    else {
      localAdditionalRoleMemory = 0
    }
  }
  else {
    localAdditionalRoleMemory = 0
  }

  /**
   * For the effective number of media of a given type based on the dependencies, the resulting number is now based of recalculation of the number with taking dependencies into account.
   * Note that SSD4 generally doesn't need additional resources since this is already accounted for with the resources for the HDD coreing it. Expecting no change for futher code changes.
   */

  if (dcConfigArrayLocal[dcItem].resultingNumberOfServersAsPerChassis > 0) {
    dcConfigArrayLocal[dcItem].resultingMem = dcConfigArrayLocal[dcItem].prelimPerServerNumberOfHDDNeeded * sizingConstraints.memInGBPerHDD 
                                              + dcConfigArrayLocal[dcItem].prelimPerServerNumberOfSSDWithoutDedicatedNVMeNeeded * sizingConstraints.memInGBPerSSD
                                              + dcConfigArrayLocal[dcItem].prelimPerServerNumberOfSSDWithDedicatedNVMeNeeded * sizingConstraints.memInGBPerSSD
                                              + dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe1NeededWithoutDedicatedWAL * sizingConstraints.memInGBPerNVMe1
                                              + dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe1NeededWithDedicatedWAL * sizingConstraints.memInGBPerNVMe1
                                              + dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe2Needed * sizingConstraints.memInGBPerNVMe2
                                              + dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe3Needed * sizingConstraints.memInGBPerNVMe3
                                              + dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe4Needed * sizingConstraints.memInGBPerNVMe4
                                              + dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe5Needed * sizingConstraints.memInGBPerNVMe5
                                              + dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe6Needed * sizingConstraints.memInGBPerNVMe6
                                              + dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe7Needed * sizingConstraints.memInGBPerNVMe7
                                              + dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe8Needed * sizingConstraints.memInGBPerNVMe18
                                              + sizingConstraints.memPerNodeBase
                                              + localAdditionalRoleMemory
  }
  else {
    dcConfigArrayLocal[dcItem].resultingMem = 0
  }

  console.log(`dcConfigFinalMemoryPerServer() 48: [chassisID=${actualChassisID}] dcConfigArrayLocal[dcItem=${dcItem}].resultingMem=${dcConfigArrayLocal[dcItem].resultingMem}`)
}

export default dcConfigFinalMemoryPerServer