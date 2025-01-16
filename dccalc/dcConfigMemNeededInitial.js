// Trying to implement W41
const dcConfigMemNeededInitial = function (sizingConstraints, dcConfigArrayLocal, dcItem) {
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
                                                  + dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe2Needed * sizingConstraints.memInGBPerNVMe2
                                                  + dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe6Needed * sizingConstraints.memInGBPerNVMeForObjectIndexOnNVMe6 
                                                  + sizingConstraints.memPerNodeBase 
                                                  + localMemPerAdditionalRole
  }
  console.log(`dcConfigMemNeededInitial() 20: [DC=${dcItem} dcConfigArrayLocal[dcItem].memNeededPerServer=${dcConfigArrayLocal[dcItem].memNeededPerServer}`)
  dcConfigArrayLocal[dcItem].prelimPerServerMemNeededPerServer = dcConfigArrayLocal[dcItem].memNeededPerServer

  // Need to add all cores needed for NVMe of any sort (not in sheet this way): NOTE that this is actually incorrect since it's simply saying that those are equally assigned across all nodes in a similar way which is
    //   definitely not the case: depending on the configuration chosen, either those NVMe are assigned as needed to the nodes, or special distribution is required and then depends on the number of devices resulting from this 
    //   distribution.
    //   With the current approach, all NVMe with workloads are taken, equally distributed across all nodes in a "virtual way" and then the number of cores are calculated.
    dcConfigArrayLocal[dcItem].prelimPerServerMemNeededPerServer += (dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe1NeededWithoutDedicatedWAL + dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe1NeededWithDedicatedWAL) * sizingConstraints.memInGBPerNVMe1
    console.log(`dcConfigMemNeededInitial() 28: [DC=${dcItem} dcConfigArrayLocal[dcItem].prelimPerServerMemNeededPerServer=${dcConfigArrayLocal[dcItem].prelimPerServerMemNeededPerServer} += (dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe1NeededWithoutDedicatedWAL=${dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe1NeededWithoutDedicatedWAL} + dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe1NeededWithDedicatedWAL=${dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe1NeededWithDedicatedWAL})*sizingConstraints.coresPerNVMe1=${sizingConstraints.memInGBPerNVMe1}`)
  
}

export default dcConfigMemNeededInitial