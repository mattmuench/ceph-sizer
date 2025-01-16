// Trying to implement AG41 -- public network
const dcConfigFinalPublicNetwork   = function (sizingConstraints, dcConfigArrayLocal, chassisArrayLocal, actualChassisID, dcItem) {
  // = if($Y41>0
  //     ,if ( Isnumber(Cover!$N$8)
  //         , if ( 
  //                max(
    //                   if( Cover!$N$8=10,1,0)
    //                 ,
    //                    if(Cover!$N$8=25,1,0)
    //                 ,
    //                    if(Cover!$N$8=40,1,0)
    //                 ,
    //                    if(Cover!$N$8=100,1,0)
    //                 )=1
    //           ,
    //              roundup(( $AC41*$AK$2 + $AD41*$AK$3 + roundup($N41/$Y41,0)*$AK$1 ) * ($AK$7/100)/100/Cover!$N$8,0)
    //           , 
    //              "ERROR: no valid NIC speed specified for ports"
    //           )
    //      ,
    //        "ERROR: NIC speed for ports must be a number"
    //      )
    //  ,
    //      0
    //  )
    
    // ONLY as temporary working local workaround - use of strings
    if (dcConfigArrayLocal[dcItem].resultingNumberOfServersAsPerChassis > 0) {
      //if (typeof chassisArrayLocal[actualChassisID].speedNicPublic === 'number') {
        console.log(`dcConfigFinalPublicNetwork() 28: [chassisID=${actualChassisID},DC=${dcItem}] chassisArrayLocal[actualChassisID].speedNicPublic=${chassisArrayLocal[actualChassisID].speedNicPublic}`)
        switch (chassisArrayLocal[actualChassisID].speedNicPublic) {
          case "10":
          case "25":
          case "50":
          case "100":
          // case 10:
          // case 25:
          // case 50:
          // case 100:
            // There will be no reduction for bi-directional traffic, since nearly the complete traffic might be either reads or writes - this would utilize mainly one direction only of bi-directional network connections.
            dcConfigArrayLocal[dcItem].resultingNumberOfPublicNetNICs = Math.ceil((dcConfigArrayLocal[dcItem].resultingNumberOfSSD * sizingConstraints.networkBandwidthPerSSDoldinMBsec
                                                                                    + dcConfigArrayLocal[dcItem].resultingNumberOfHDD * sizingConstraints.networkBandwidthPerHDDinMBsec
                                                                                    + dcConfigArrayLocal[dcItem].resultingNumberOfNVMe1 * sizingConstraints.networkBandwidthPerNVMeinMBsec
                                                                                   ) * 
                                                                                   (sizingConstraints.minPercentageOfClusterBandwidthForClientTrafficPerNode/100)
                                                                                   / 100/ chassisArrayLocal[actualChassisID].speedNicPublic
                                                                                  )
console.log(`dcConfigFinalPublicNetwork() 41: [chassisID=${actualChassisID},DC=${dcItem}] dcConfigArrayLocal[dcItem].resultingNumberOfPublicNetNICs=${dcConfigArrayLocal[dcItem].resultingNumberOfPublicNetNICs} = Math.ceil((dcConfigArrayLocal[dcItem].resultingNumberOfSSD=${dcConfigArrayLocal[dcItem].resultingNumberOfSSD} * sizingConstraints.networkBandwidthPerSSDoldinMBsec=${sizingConstraints.networkBandwidthPerSSDoldinMBsec}
  + dcConfigArrayLocal[dcItem].resultingNumberOfHDD=${dcConfigArrayLocal[dcItem].resultingNumberOfHDD} * sizingConstraints.networkBandwidthPerHDDinMBsec=${sizingConstraints.networkBandwidthPerHDDinMBsec}
  + dcConfigArrayLocal[dcItem].resultingNumberOfNVMe1=${dcConfigArrayLocal[dcItem].resultingNumberOfNVMe1} * sizingConstraints.networkBandwidthPerNVMeinMBsec=${sizingConstraints.networkBandwidthPerNVMeinMBsec}
 ) * 
 (sizingConstraints.minPercentageOfClusterBandwidthForClientTrafficPerNode=${sizingConstraints.minPercentageOfClusterBandwidthForClientTrafficPerNode}/100)
 / 100/ chassisArrayLocal[actualChassisID].speedNicPublic=${chassisArrayLocal[actualChassisID].speedNicPublic}
)`)                                                                              
            break
          default:
            console.log(`dcConfigFinalPublicNetwork() 50: [chassisID=${actualChassisID},DC=${dcItem}]  ERROR: no valid NIC speed specified for ports`)
        }
      //}
      //else {
      //  console.log(`dcConfigFinalPublicNetwork() 54: [chassisID=${actualChassisID},DC=${dcItem}]  ERROR: NIC speed for ports must be a number`)
      //}
    }
    else {
      dcConfigArrayLocal[dcItem].resultingNumberOfPublicNetNICs = 0
    }

    console.log(`dcConfigFinalPublicNetwork() 61: chassisID=${actualChassisID},DC=${dcItem}] dcConfigArrayLocal[dcItem].resultingNumberOfPublicNetNICs=${dcConfigArrayLocal[dcItem].resultingNumberOfPublicNetNICs}`)
}

export default dcConfigFinalPublicNetwork