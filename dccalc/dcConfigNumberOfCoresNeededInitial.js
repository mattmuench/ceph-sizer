import displayMsg from "../common/displayMsg.js"
import {debugMsg} from "../common/debug.js";

const dcConfigNumberOfCoresNeededInitial = function (generalValues, sizingConstraints, dcConfigArrayLocal, chassisArrayLocal, actualChassisID, dcItem) {
  let localDebugOn = false

  debugMsg(generalValues, localDebugOn, 5, "dcConfigNumberOfCoresNeededInitial", 7, `[chassisID=${actualChassisID},DC=${dcItem}] dcConfigArrayLocal[actualChassisID].numberOfServersNeededAllInstances=${dcConfigArrayLocal[actualChassisID].numberOfServersNeededAllInstances}, dcConfigArrayLocal[dcItem].numberOfNeededMonInstances=${dcConfigArrayLocal[dcItem].numberOfNeededMonInstances}, dcConfigArrayLocal[actualChassisID].numberOfLocalScaleoutInstances=${dcConfigArrayLocal[actualChassisID].numberOfLocalScaleoutInstances}, dcConfigArrayLocal[dcItem].numberOfLocalSpecialInstances=${dcConfigArrayLocal[dcItem].numberOfLocalSpecialInstances}`,0,0,0)
  if (dcConfigArrayLocal[dcItem].numberOfServersNeededAllInstances > 0) {
    // If servers needed in this DC at all
    debugMsg(generalValues, localDebugOn, 5, "dcConfigNumberOfCoresNeededInitial", 10, `[chassisID=${actualChassisID},DC=${dcItem}] servers needed in this DC: ${dcConfigArrayLocal[dcItem].numberOfServersNeededAllInstances}`,0,0,0)
    
    let localCoresForRGWCaching = 0
    if(chassisArrayLocal[actualChassisID].useRGWCaching === true ) {
      localCoresForRGWCaching = sizingConstraints.coresPerRGWCacheDevice
      debugMsg(generalValues, localDebugOn, 5, "madcConfigNumberOfCoresNeededInitialin", 15, `[chassisID=${actualChassisID},DC=${dcItem}] workloads uses RGW caching (selected)`,0,0,0)
    }
    let localCoresForScaleOutInstances = 0
    if(dcConfigArrayLocal[actualChassisID].numberOfLocalScaleoutInstances > 0){
      debugMsg(generalValues, localDebugOn, 5, "dcConfigNumberOfCoresNeededInitial", 19, `[chassisID=${actualChassisID},DC=${dcItem}] number of scale-out instances=${dcConfigArrayLocal[actualChassisID].numberOfLocalScaleoutInstances}`,0,0,0)
      // If we've got enough servers for all instances already, still add cores for the additional instance
      if(Math.ceil((dcConfigArrayLocal[dcItem].numberOfServersNeededAllInstances - dcConfigArrayLocal[dcItem].numberOfNeededMonInstances - dcConfigArrayLocal[dcItem].numberOfLocalSpecialInstances)/dcConfigArrayLocal[dcItem].numberOfLocalScaleoutInstances)<1 ) {
        localCoresForScaleOutInstances = sizingConstraints.coresPerAdditionalRole
      }
      else {
        // For more than 2 resulting scale-out + MON instances per server after special roles.
        if(Math.ceil((dcConfigArrayLocal[dcItem].numberOfServersNeededAllInstances - dcConfigArrayLocal[dcItem].numberOfLocalSpecialInstances)*2 < dcConfigArrayLocal[dcItem].numberOfLocalScaleoutInstances) ) {
          displayMsg(document, "dcConfigNumberOfCoresNeededInitial", 27, "error", `[chassisID=${actualChassisID},DC=${dcItem}] ERROR - more than 2 scale-out instances per server needed which is not supported - need ${dcConfigArrayLocal[dcItem].numberOfLocalScaleoutInstances} but only ${Math.ceil((dcConfigArrayLocal[dcItem].numberOfServersNeededAllInstances - dcConfigArrayLocal[dcItem].numberOfLocalSpecialInstances)*2)} servers available for scale-out role instances`,0,0,0)
        }
        else {
          localCoresForScaleOutInstances = sizingConstraints.coresPerAdditionalRole * Math.ceil(dcConfigArrayLocal[dcItem].numberOfLocalScaleoutInstances/dcConfigArrayLocal[dcItem].numberOfServersNeededAllInstances )
        }
      }
    } 
    debugMsg(generalValues, localDebugOn, 5, "dcConfigNumberOfCoresNeededInitial", 34, `[chassisID=${actualChassisID},DC=${dcItem}] cores for scale-out instances=${localCoresForScaleOutInstances}`,0,0,0)
    // Needs to be changed to use SSD new and SSD old later on based on selection of SSD speed - currently using SSDold only
    // Note: numberOfSSD4Needed omitted since the HDD account for the use of dedicated devices for RocksDB and WAL already.
    // TODO: Add cores needed per additional role - not only as a coresPerAdditionalRole but more based on individual scale-out and dedicated roles needs
    dcConfigArrayLocal[dcItem].numberOfCoresNeeded = dcConfigArrayLocal[dcItem].prelimPerServerNumberOfHDDNeeded*sizingConstraints.coresPerHDD 
                                                   + (dcConfigArrayLocal[dcItem].prelimPerServerNumberOfSSDWithoutDedicatedNVMeNeeded + dcConfigArrayLocal[dcItem].prelimPerServerNumberOfSSDWithDedicatedNVMeNeeded)
                                                               * sizingConstraints.coresPerSSDold 
                                                   + (dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe1NeededWithoutDedicatedWAL + dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe1NeededWithDedicatedWAL)
                                                               * sizingConstraints.coresPerNVMe1 
                                                   + localCoresForRGWCaching 
                                                   + dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe6Needed * sizingConstraints.coresPerNVMeForObjectIndexOnNVMe6 
                                                   + dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe2Needed * sizingConstraints.coresPerNVMe2
                                                   + dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe3Needed * sizingConstraints.coresPerNVMe3 
                                                   + dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe4Needed * sizingConstraints.coresPerNVMe4 
                                                   + dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe5Needed * sizingConstraints.coresPerNVMe5
                                                   + dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe7Needed * sizingConstraints.coresPerNVMe7
                                                   + dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe8Needed * sizingConstraints.coresPerNVMe8 
                                                   + sizingConstraints.coresPerNodeBase 
                                                   + localCoresForScaleOutInstances
                                                   + Math.ceil(dcConfigArrayLocal[dcItem].numberOfLocalSpecialInstances / dcConfigArrayLocal[dcItem].numberOfServersNeededAllInstances)
    
    debugMsg(generalValues, localDebugOn, 5, "dcConfigNumberOfCoresNeededInitial", 55, `[chassisID=${actualChassisID},DC=${dcItem}]  
      dcConfigArrayLocal[dcItem].numberOfCoresNeeded=${dcConfigArrayLocal[dcItem].numberOfCoresNeeded} 
      = dcConfigArrayLocal[dcItem].prelimPerServerNumberOfHDDNeeded=${dcConfigArrayLocal[dcItem].prelimPerServerNumberOfHDDNeeded})*sizingConstraints.coresPerHDD=${sizingConstraints.coresPerHDD} 
      + (dcConfigArrayLocal[dcItem].prelimPerServerNumberOfSSDWithoutDedicatedNVMeNeeded=${dcConfigArrayLocal[dcItem].prelimPerServerNumberOfSSDWithoutDedicatedNVMeNeeded} 
        + dcConfigArrayLocal[dcItem].prelimPerServerNumberOfSSDWithDedicatedNVMeNeeded=${dcConfigArrayLocal[dcItem].prelimPerServerNumberOfSSDWithDedicatedNVMeNeeded})*sizingConstraints.coresPerSSDold=${sizingConstraints.coresPerSSDold} 
      + (dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe1NeededWithoutDedicatedWAL=${dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe1NeededWithoutDedicatedWAL} 
        + dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe1NeededWithDedicatedWAL=${dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe1NeededWithDedicatedWAL}) * sizingConstraints.coresPerNVMe1=${sizingConstraints.coresPerNVMe1}
      + localCoresForRGWCaching=${localCoresForRGWCaching} 
      + dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe6Needed=${dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe6Needed}*sizingConstraints.coresPerNVMeForObjectIndexOnNVMe6=${sizingConstraints.coresPerNVMeForObjectIndexOnNVMe6} 
      + dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe2Needed=${dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe2Needed} * sizingConstraints.coresPerNVMe2=${sizingConstraints.coresPerNVMe2}
      + dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe3Needed=${dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe3Needed} * sizingConstraints.coresPerNVMe3=${sizingConstraints.coresPerNVMe3}
      + dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe4Needed=${dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe4Needed} * sizingConstraints.coresPerNVMe4=${sizingConstraints.coresPerNVMe4}
      + dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe5Needed=${dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe5Needed} * sizingConstraints.coresPerNVMe5=${sizingConstraints.coresPerNVMe5}
      + dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe7Needed=${dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe7Needed} * sizingConstraints.coresPerNVMe7=${sizingConstraints.coresPerNVMe7}
      + dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe8Needed=${dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe8Needed} * sizingConstraints.coresPerNVMe8=${sizingConstraints.coresPerNVMe8}
      + sizingConstraints.coresPerNodeBase=${sizingConstraints.coresPerNodeBase} 
      + localCoresForScaleOutInstances=${localCoresForScaleOutInstances} 
      + Math.ceil(dcConfigArrayLocal[dcItem].numberOfLocalSpecialInstances=${dcConfigArrayLocal[dcItem].numberOfLocalSpecialInstances}/dcConfigArrayLocal[dcItem].numberOfServersNeededAllInstances=${dcConfigArrayLocal[dcItem].numberOfServersNeededAllInstances}`,0,0,0)
  }
  debugMsg(generalValues, localDebugOn, 5, "dcConfigNumberOfCoresNeededInitial", 74, `[chassisID=${actualChassisID},DC=${dcItem}] number of cores initial = ${dcConfigArrayLocal[dcItem].numberOfCoresNeeded}`,0,0,0)
  dcConfigArrayLocal[dcItem].prelimPerServerNumberOfCoresNeeded = dcConfigArrayLocal[dcItem].numberOfCoresNeeded
}


export default dcConfigNumberOfCoresNeededInitial