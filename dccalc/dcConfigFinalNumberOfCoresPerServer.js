// trying to implement Z41
/// TODO - total rewrite needed for the changed N41 vs NVMe2, and all other NVMe
const dcConfigFinalNumberOfCoresPerServer   = function (generalValuesLocal, sizingConstraints, dcConfigArrayLocal, actualChassisID, dcItem) {
  // Determine the final number of cores per server needed for configuration:
  // =if($Y41>0,roundup($J41/$Y41,0)*$G$5 + roundup($J42/$Y41,0)*$J$5 + if(Cover!$U$8="x",$G$3,0) + roundup($N41/$Y41,0)*$AH$5 + $AR$5 + if(C41>0,if(roundup(($Y41-$S41-$E41)/C41,0)<1,$AR$4,0),0),0)
  // =if($Y41>0
  //    ,
  //      roundup($J41/$Y41,0)*$G$5 + roundup($J42/$Y41,0)*$J$5 
  //      + if(Cover!$U$8="x"
  //          ,
  //             $G$3
  //          ,
  //             0
  //          ) 
  //      + roundup($N41/$Y41,0)*$AH$5 
  //      + $AR$5 
  //      + if(C41>0
  //          ,
  //            if( roundup(($Y41-$S41-$E41)/C41,0) < 1 
  //              ,
  //                $AR$4
  //              ,
  //                0
  //              )
  //          ,
  //            0
  //          )
  //   ,
  //      0
  //   )
  if (dcConfigArrayLocal[dcItem].resultingNumberOfServersAsPerChassis > 0) {

    let localAdditionRoleCores = 0
    if (dcConfigArrayLocal[dcItem].numberOfLocalScaleoutInstances > 0) {
      if (Math.ceil((dcConfigArrayLocal[dcItem].resultingNumberOfServersAsPerChassis - dcConfigArrayLocal[dcItem].numberOfNeededMonInstances - dcConfigArrayLocal[dcItem].numberOfLocalSpecialInstances)/dcConfigArrayLocal[dcItem].numberOfLocalScaleoutInstances) < 1) {
        localAdditionRoleCores = sizingConstraints.coresPerAdditionalRole
      }
      else {
        localAdditionRoleCores = 0
      }
    }
    else {
      localAdditionRoleCores = 0
    }

    /**
     * For the effective number of media of a given type based on the dependencies, the resulting number is now based of recalculation of the number with taking dependencies into account.
     * Note that SSD4 generally doesn't need additional resources since this is already accounted for with the resources for the HDD cores. Expecting no change for futher code changes.
     */
    dcConfigArrayLocal[dcItem].resultingNumberOfCores = dcConfigArrayLocal[dcItem].prelimPerServerNumberOfHDDNeeded * sizingConstraints.coresPerHDD 
                                                        + dcConfigArrayLocal[dcItem].prelimPerServerNumberOfSSDWithoutDedicatedNVMeNeeded * sizingConstraints.coresPerSSDold
                                                        + dcConfigArrayLocal[dcItem].prelimPerServerNumberOfSSDWithDedicatedNVMeNeeded * sizingConstraints.coresPerSSDold
                                                        + dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe1NeededWithoutDedicatedWAL * sizingConstraints.coresPerNVMe1
                                                        + dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe1NeededWithDedicatedWAL * sizingConstraints.coresPerNVMe1
                                                        + dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe2Needed * sizingConstraints.coresPerNVMe2
                                                        + dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe3Needed * sizingConstraints.coresPerNVMe3
                                                        + dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe4Needed * sizingConstraints.coresPerNVMe4
                                                        + dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe5Needed * sizingConstraints.coresPerNVMe5
                                                        + dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe6Needed * sizingConstraints.coresPerNVMe6
                                                        + dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe7Needed * sizingConstraints.coresPerNVMe7
                                                        + dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe8Needed * sizingConstraints.coresPerNVMe8
                                                        + sizingConstraints.coresPerNodeBase
                                                        + localAdditionRoleCores
  }
  else {
    dcConfigArrayLocal[dcItem].resultingNumberOfCores = 0
  }
  console.log(`dcConfigFinalNumberOfCoresPerServer() 61: [chassisID=${actualChassisID}] [DC=${dcItem}] dcConfigArrayLocal[dcItem].resultingNumberOfCores=${dcConfigArrayLocal[dcItem].resultingNumberOfCores}`)
}


export default dcConfigFinalNumberOfCoresPerServer