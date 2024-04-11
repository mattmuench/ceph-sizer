// trying to implement Z41
/// TODO - total rewrite needed for the changed N41 vs NVMe2, and all other NVMe
const dcConfigFinalNumberOfCoresPerServer   = function (sizingConstraints, dcConfigArrayLocal, actualChassisID, dcItem) {
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
    // check for use of RGW caching
    let localRGWCacheUsed = 0
    if (dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe2Needed > 0) {
      localRGWCacheUsed = sizingConstraints.coresPerRGWCacheDevice
    }

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

    dcConfigArrayLocal[dcItem].resultingNumberOfCores = Math.ceil(dcConfigArrayLocal[dcItem].numberOfHDDNeeded / dcConfigArrayLocal[dcItem].resultingNumberOfServersAsPerChassis) * sizingConstraints.coresPerHDD 
                                                        + Math.ceil(dcConfigArrayLocal[dcItem].numberOfSSDNeeded / dcConfigArrayLocal[dcItem].resultingNumberOfServersAsPerChassis) * sizingConstraints.coresPerSSDold
                                                        + localRGWCacheUsed
                                                        + Math.ceil(dcConfigArrayLocal[dcItem].numberOfNVMe6Needed/dcConfigArrayLocal[dcItem].resultingNumberOfServersAsPerChassis) * sizingConstraints.coresPerNVMeForObjectIndexOnNVMe6
                                                        + sizingConstraints.coresPerNodeBase
                                                        + localAdditionRoleCores
  }
  else {
    dcConfigArrayLocal[dcItem].resultingNumberOfCores = 0
  }
  console.log(`dcConfigFinalNumberOfCoresPerServer() 61: [chassisID=${actualChassisID}] [DC=${dcItem}] dcConfigArrayLocal[dcItem].resultingNumberOfCores=${dcConfigArrayLocal[dcItem].resultingNumberOfCores}`)
}


export default dcConfigFinalNumberOfCoresPerServer