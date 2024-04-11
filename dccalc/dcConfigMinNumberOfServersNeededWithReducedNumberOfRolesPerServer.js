// Trying to implement Y42
// Using T41 instead of R41 - since T41 already has the overall number for all instances, not sure why we need R41 to be used here.... it's including already R41 and some correction for MON ?
const dcConfigMinNumberOfServersNeededWithReducedNumberOfRolesPerServer   = function (generalValuesLocal, workloadsArrayLocal, sizingConstraints, dcConfigArrayLocal, dcItem) {
  // Adjust the number of servers for actual DC if iscsi workload is running only in this actual DC. 
  // In this case, it perhaps might not make sense to have the iscsi gateway in a different DC, also, because it might be only useful if the client access is available to this addition
  // DC as well. For default, if the iscsi workload is only in a single DC selected, the assumption is to use only this DC but with a redundancy.
  
  let localDCsInUse = 0  // B41
  for (let dcCheck = 0; dcCheck < generalValuesLocal.numberOfDCsPossible; dcCheck++) {
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
    for (let workloadItem = 0; workloadItem < generalValuesLocal.numberOfWorkloadsPossible; workloadItem++) {
      // the workload is relevant, of type iscsi-block, and exactly running only in actual DC
      console.log(`dcConfigMinNumberOfServersNeededWithReducedNumberOfRolesPerServer() 25: [DC=${dcItem}] useCase=${workloadsArrayLocal[workloadItem].useCase}, workload=workloadsArrayLocal[${workloadItem}], selectorArrayDC[${dcItem}]=${workloadsArrayLocal[workloadItem].selectorArrayDC[dcItem]}, sumNumDC=${workloadsArrayLocal[workloadItem].sumNumberDC}`)
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
           console.log(`dcConfigMinNumberOfServersNeededWithReducedNumberOfRolesPerServer() 38: [DC=${dcItem}] localMinNumOfServersNew=${localMinNumOfServersNew}`)
          }
          else {
            localMinNumOfServersNew = dcConfigArrayLocal[dcItem].numberOfServersNeededForReplicaInSameDC
            console.log(`dcConfigMinNumberOfServersNeededWithReducedNumberOfRolesPerServer() 42: [DC=${dcItem}] localMinNumOfServersNew=${localMinNumOfServersNew}`)
          }
        }
        else {
          // else, if (($S41+roundup(($E41-$AG$3)/$B41,0)+$AG$3)>$R41)
          if ( (dcConfigArrayLocal[dcItem].numberOfNeededMonInstances + Math.ceil(( dcConfigArrayLocal[dcItem].numberOfLocalSpecialInstances - sizingConstraints.minNumberOfServersForSpecialRoles ) / localDCsInUse) + sizingConstraints.minNumberOfServersForSpecialRoles) > dcConfigArrayLocal[dcItem].numberOfServersNeededForReplicaInSameDC ) {
            // .. then use $S41+roundup(($E41-$AG$3)/$B41,0)+$AG$3
            localMinNumOfServersNew = dcConfigArrayLocal[dcItem].numberOfNeededMonInstances + Math.ceil(( dcConfigArrayLocal[dcItem].numberOfLocalSpecialInstances - sizingConstraints.minNumberOfServersForSpecialRoles ) / localDCsInUse) + sizingConstraints.minNumberOfServersForSpecialRoles
            console.log(`dcConfigMinNumberOfServersNeededWithReducedNumberOfRolesPerServer() 50: [DC=${dcItem}] localMinNumOfServersNew=${localMinNumOfServersNew}`)
          }
          else {
            localMinNumOfServersNew = dcConfigArrayLocal[dcItem].numberOfServersNeededForReplicaInSameDC
            console.log(`dcConfigMinNumberOfServersNeededWithReducedNumberOfRolesPerServer() 54: [DC=${dcItem}] localMinNumOfServersNew=${localMinNumOfServersNew}`)
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
            console.log(`dcConfigMinNumberOfServersNeededWithReducedNumberOfRolesPerServer() 65: [DC=${dcItem}] dlocalMinNumOfServersNew=${localMinNumOfServersNew}`)
          }
          else {
            localMinNumOfServersNew = dcConfigArrayLocal[dcItem].numberOfServersNeededForReplicaInSameDC
            console.log(`dcConfigMinNumberOfServersNeededWithReducedNumberOfRolesPerServer() 69: [DC=${dcItem}] localMinNumOfServersNew=${localMinNumOfServersNew}`)
          }
         }
         else {
          // else, if (($S41+roundup($E41/$B41,0))>$R41)
          if ((dcConfigArrayLocal[dcItem].numberOfNeededMonInstances + Math.ceil(dcConfigArrayLocal[dcItem].numberOfLocalSpecialInstances/localDCsInUse)) > dcConfigArrayLocal[dcItem].numberOfServersNeededForReplicaInSameDC ) {
            // ... then, use $S41+roundup($E41/$B41,0)
            localMinNumOfServersNew = dcConfigArrayLocal[dcItem].numberOfNeededMonInstances + Math.ceil(dcConfigArrayLocal[dcItem].numberOfLocalSpecialInstances/localDCsInUse)
            console.log(`dcConfigMinNumberOfServersNeededWithReducedNumberOfRolesPerServer() 77: [DC=${dcItem}] localMinNumOfServersNew=${localMinNumOfServersNew}`)
          }
          else {
            localMinNumOfServersNew = dcConfigArrayLocal[dcItem].numberOfServersNeededForReplicaInSameDC
            console.log(`dcConfigMinNumberOfServersNeededWithReducedNumberOfRolesPerServer() 81: [DC=${dcItem}] localMinNumOfServersNew=${localMinNumOfServersNew}`)
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
  console.log(`dcConfigMinNumberOfServersNeededWithReducedNumberOfRolesPerServer() 98:[DC=${dcItem}] dcConfigArrayLocal[dcItem].prelimNumberOfServers=${dcConfigArrayLocal[dcItem].prelimNumberOfServers}`)
}

export default dcConfigMinNumberOfServersNeededWithReducedNumberOfRolesPerServer