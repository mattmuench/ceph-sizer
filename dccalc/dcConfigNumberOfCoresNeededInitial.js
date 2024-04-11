// Trying to implement V41 including all other NVMe as well
// =if ( $T41 >0,roundup($J41/$T41,0)*$G$5+roundup($J42/$T41,0)*$J$5+if(Cover!$U$8="x",$G$3,0)+roundup($N41/$T41,0)*$AH$5+$AR$5+if(C41>0,if(roundup(($T41-$S41-$E41)/C41,0)<1,$AR$4,0),0),0)
const dcConfigNumberOfCoresNeededInitial = function (sizingConstraints, dcConfigArrayLocal, chassisArrayLocal, actualChassisID, dcItem) {
  // 
  console.log(`dcConfigNumberOfCoresNeededInitial() 5: [chassisID=${actualChassisID},DC=${dcItem}] dcConfigArrayLocal[actualChassisID].numberOfServersNeededAllInstances=${dcConfigArrayLocal[actualChassisID].numberOfServersNeededAllInstances}, dcConfigArrayLocal[dcItem].numberOfNeededMonInstances=${dcConfigArrayLocal[dcItem].numberOfNeededMonInstances}, dcConfigArrayLocal[actualChassisID].numberOfLocalScaleoutInstances=${dcConfigArrayLocal[actualChassisID].numberOfLocalScaleoutInstances}, dcConfigArrayLocal[dcItem].numberOfLocalSpecialInstances=${dcConfigArrayLocal[dcItem].numberOfLocalSpecialInstances} `)
  if (dcConfigArrayLocal[dcItem].numberOfServersNeededAllInstances > 0) {
    // If servers needed in this DC at all
    console.log(`dcConfigNumberOfCoresNeededInitial() 8: [chassisID=${actualChassisID},DC=${dcItem}] servers needed in this DC: ${dcConfigArrayLocal[dcItem].numberOfServersNeededAllInstances}`)
    
    let localCoresForRGWCaching = 0
    if(chassisArrayLocal[actualChassisID].useRGWCaching === true ) {
      localCoresForRGWCaching = sizingConstraints.coresPerRGWCacheDevice
      console.log(`dcConfigNumberOfCoresNeededInitial() 13: [chassisID=${actualChassisID},DC=${dcItem}] workloads uses RGW caching (selected)`)
    }
    let localCoresForScaleOutInstances = 0
    if(dcConfigArrayLocal[actualChassisID].numberOfLocalScaleoutInstances > 0){
      console.log(`dcConfigNumberOfCoresNeededInitial() 17: [chassisID=${actualChassisID},DC=${dcItem}] number of scale-out instances=${dcConfigArrayLocal[actualChassisID].numberOfLocalScaleoutInstances}`)
      // If we've got enough servers for all instances already, still add cores for the additional instance
      if(Math.ceil((dcConfigArrayLocal[dcItem].numberOfServersNeededAllInstances - dcConfigArrayLocal[dcItem].numberOfNeededMonInstances - dcConfigArrayLocal[dcItem].numberOfLocalSpecialInstances)/dcConfigArrayLocal[dcItem].numberOfLocalScaleoutInstances)<1 ) {
        localCoresForScaleOutInstances = sizingConstraints.coresPerAdditionalRole
      }
      else {
        // For more than 2 resulting scale-out + MON instances per server after special roles.
        if(Math.ceil((dcConfigArrayLocal[dcItem].numberOfServersNeededAllInstances - dcConfigArrayLocal[dcItem].numberOfLocalSpecialInstances)*2 < dcConfigArrayLocal[dcItem].numberOfLocalScaleoutInstances) ) {
          console.log(`dcConfigNumberOfCoresNeededInitial() 25: [chassisID=${actualChassisID},DC=${dcItem}] ERROR - more than 2 scale-out instances per server needed which is not supported - need ${dcConfigArrayLocal[dcItem].numberOfLocalScaleoutInstances} but only ${Math.ceil((dcConfigArrayLocal[dcItem].numberOfServersNeededAllInstances - dcConfigArrayLocal[dcItem].numberOfLocalSpecialInstances)*2)} servers available for scale-out role instances`)
        }
        else {
          localCoresForScaleOutInstances = sizingConstraints.coresPerAdditionalRole * Math.ceil(dcConfigArrayLocal[dcItem].numberOfLocalScaleoutInstances/dcConfigArrayLocal[dcItem].numberOfServersNeededAllInstances )
        }
      }
    } 
    console.log(`dcConfigNumberOfCoresNeededInitial() 32: [chassisID=${actualChassisID},DC=${dcItem}] cores for scale-out instances=${localCoresForScaleOutInstances}`)
    // Needs to be changed to use SSD new and SSD old later on based on selection of SSD speed - currently using SSDold only
    // Note: numberOfSSD4Needed omitted since the HDD account for the use of dedicated devices for RocksDB and WAL already.
    // TODO: Add cores needed per additional role - not only as a coresPerAdditionalRole but more based on individual scale-out and dedicated roles needs
    dcConfigArrayLocal[dcItem].numberOfCoresNeeded = dcConfigArrayLocal[dcItem].prelimPerServerNumberOfHDDNeeded*sizingConstraints.coresPerHDD 
                                                   + (dcConfigArrayLocal[dcItem].prelimPerServerNumberOfSSDWithoutDedicatedNVMeNeeded + dcConfigArrayLocal[dcItem].prelimPerServerNumberOfSSDWithDedicatedNVMeNeeded)
                                                               * sizingConstraints.coresPerSSDold 
                                                   + localCoresForRGWCaching 
                                                   + dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe6Needed * sizingConstraints.coresPerNVMeForObjectIndexOnNVMe6 
                                                   + sizingConstraints.coresPerNodeBase 
                                                   + localCoresForScaleOutInstances
                                                   + Math.ceil(dcConfigArrayLocal[dcItem].numberOfLocalSpecialInstances / dcConfigArrayLocal[dcItem].numberOfServersNeededAllInstances)
    console.log(`dcConfigNumberOfCoresNeededInitial() 44: [chassisID=${actualChassisID},DC=${dcItem}]  dcConfigArrayLocal[dcItem].numberOfCoresNeeded=${dcConfigArrayLocal[dcItem].numberOfCoresNeeded} = dcConfigArrayLocal[dcItem].prelimPerServerNumberOfHDDNeeded=${dcConfigArrayLocal[dcItem].prelimPerServerNumberOfHDDNeeded})*sizingConstraints.coresPerHDD=${sizingConstraints.coresPerHDD} + (dcConfigArrayLocal[dcItem].prelimPerServerNumberOfSSDWithoutDedicatedNVMeNeeded=${dcConfigArrayLocal[dcItem].prelimPerServerNumberOfSSDWithoutDedicatedNVMeNeeded} + dcConfigArrayLocal[dcItem].prelimPerServerNumberOfSSDWithDedicatedNVMeNeeded=${dcConfigArrayLocal[dcItem].prelimPerServerNumberOfSSDWithDedicatedNVMeNeeded})*sizingConstraints.coresPerSSDold=${sizingConstraints.coresPerSSDold} + localCoresForRGWCaching=${localCoresForRGWCaching} + dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe6Needed=${dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe6Needed}*sizingConstraints.coresPerNVMeForObjectIndexOnNVMe6=${sizingConstraints.coresPerNVMeForObjectIndexOnNVMe6} + sizingConstraints.coresPerNodeBase=${sizingConstraints.coresPerNodeBase} + localCoresForScaleOutInstances=${localCoresForScaleOutInstances} + Math.ceil(dcConfigArrayLocal[dcItem].numberOfLocalSpecialInstances=${dcConfigArrayLocal[dcItem].numberOfLocalSpecialInstances}/dcConfigArrayLocal[dcItem].numberOfServersNeededAllInstances=${dcConfigArrayLocal[dcItem].numberOfServersNeededAllInstances}`)
    
    // Need to add all cores needed for NVMe of any sort (not in sheet this way): NOTE that this is actually incorrect since it's simply saying that those are equally assigned across all nodes in a similar way which is
    //   definitely not the case: depending on the configuration chosen, either those NVMe are assigned as needed to the nodes, or special distribution is required and then depends on the number of devices resulting from this 
    //   distribution.
    //   With the current approach, all NVMe with workloads are taken, equally distributed across all nodes in a "virtual way" and then the number of cores are calculated.
    dcConfigArrayLocal[dcItem].numberOfCoresNeeded += (dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe1NeededWithoutDedicatedWAL + dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe1NeededWithDedicatedWAL) * sizingConstraints.coresPerNVMe1 + dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe3Needed * sizingConstraints.coresPerNVMe3
    console.log(`dcConfigNumberOfCoresNeededInitial() 51: [chassisID=${actualChassisID},DC=${dcItem}] dcConfigArrayLocal[dcItem].numberOfCoresNeeded=${dcConfigArrayLocal[dcItem].numberOfCoresNeeded} += (dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe1NeededWithoutDedicatedWAL=${dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe1NeededWithoutDedicatedWAL} + dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe1NeededWithDedicatedWAL=${dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe1NeededWithDedicatedWAL})*sizingConstraints.coresPerNVMe1=${sizingConstraints.coresPerNVMe1} + dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe3Needed=${dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe3Needed} * sizingConstraints.coresPerNVMe3=${sizingConstraints.coresPerNVMe3}`)
  }
  console.log(`dcConfigNumberOfCoresNeededInitial() 53: [chassisID=${actualChassisID},DC=${dcItem}] number of cores initial = ${dcConfigArrayLocal[dcItem].numberOfCoresNeeded}`)
  dcConfigArrayLocal[dcItem].prelimPerServerNumberOfCoresNeeded = dcConfigArrayLocal[dcItem].numberOfCoresNeeded
}


export default dcConfigNumberOfCoresNeededInitial