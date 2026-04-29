import displayMsg from "../common/displayMsg.js"
import {debugMsg} from "../common/debug.js";

const dcConfigMemNeededInitial = function (generalValues, sizingConstraints, dcConfigArrayLocal, dcItem) {
  let localDebugOn = false

  // =if($T41>0,roundup($J41/$T41,0)*$G$6+roundup($J42/$T41,0)*$J$6+roundup($N41/T41,0)*$AH$6+$AR$6+if(C41>0,if(roundup(($T41-$S41-$E41)/C41,0)<1,$AR$7,0),0),0)
  if (dcConfigArrayLocal[dcItem].numberOfServersNeededAllInstances > 0) {
    let localMemPerAdditionalRole = 0
    // if(C41>0,if(roundup(($T41-$S41-$E41)/C41,0)<1,$AR$7,0),0)
    if(dcConfigArrayLocal[dcItem].numberOfLocalScaleoutInstances > 0 ) {
      if(Math.ceil((dcConfigArrayLocal[dcItem].numberOfServersNeededAllInstances - dcConfigArrayLocal[dcItem].numberOfNeededMonInstances - dcConfigArrayLocal[dcItem].numberOfLocalSpecialInstances) / dcConfigArrayLocal[dcItem].numberOfLocalScaleoutInstances) < 1) {
        localMemPerAdditionalRole = sizingConstraints.memPerAdditionalRole
      }
    }
  
    dcConfigArrayLocal[dcItem].memNeededPerServer = dcConfigArrayLocal[dcItem].prelimPerServerNumberOfHDDNeeded * sizingConstraints.memInGBPerHDD 
                                                  + (dcConfigArrayLocal[dcItem].prelimPerServerNumberOfSSDWithoutDedicatedNVMeNeeded + dcConfigArrayLocal[dcItem].prelimPerServerNumberOfSSDWithDedicatedNVMeNeeded)*sizingConstraints.memInGBPerSSD 
                                                  + (dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe1NeededWithoutDedicatedWAL + dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe1NeededWithDedicatedWAL) * sizingConstraints.memInGBPerNVMe1
                                                  + dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe6Needed * sizingConstraints.memInGBPerNVMeForObjectIndexOnNVMe6 
                                                  + dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe2Needed * sizingConstraints.memInGBPerNVMe2
                                                  + dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe3Needed * sizingConstraints.memInGBPerNVMe3
                                                  + dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe4Needed * sizingConstraints.memInGBPerNVMe4
                                                  + dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe5Needed * sizingConstraints.memInGBPerNVMe5
                                                  + dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe7Needed * sizingConstraints.memInGBPerNVMe7
                                                  + dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe8Needed * sizingConstraints.memInGBPerNVMe8
                                                  + sizingConstraints.memPerNodeBase 
                                                  + localMemPerAdditionalRole
  }
  debugMsg(generalValues, localDebugOn, 5, "dcConfigMemNeededInitial", 30, `[DC=${dcItem} dcConfigArrayLocal[dcItem].memNeededPerServer=${dcConfigArrayLocal[dcItem].memNeededPerServer}`,0,0,0)
  dcConfigArrayLocal[dcItem].prelimPerServerMemNeededPerServer = dcConfigArrayLocal[dcItem].memNeededPerServer

  debugMsg(generalValues, localDebugOn, 5, "dcConfigMemNeededInitial", 33, `[DC=${dcItem} dcConfigArrayLocal[dcItem].prelimPerServerMemNeededPerServer=${dcConfigArrayLocal[dcItem].prelimPerServerMemNeededPerServer}`,0,0,0)
  
}

export default dcConfigMemNeededInitial