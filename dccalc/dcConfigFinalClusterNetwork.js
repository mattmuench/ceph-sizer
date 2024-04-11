// Trying to implement AG42 - cluster network
const dcConfigFinalClusterNetwork   = function (sizingConstraints, dcConfigArrayLocal, chassisArrayLocal, actualChassisID, dcItem) {
  // = if($Y41>0
  //     ,
  //        if ( Isnumber(Cover!$N$8)
  //           , if ( 
    //                max(
      //                    if(Cover!$N$8=10,1,0)
      //                 ,
      //                    if(Cover!$N$8=25,1,0)
      //                 ,
      //                    if(Cover!$N$8=40,1,0)
      //                 ,
      //                    if(Cover!$N$8=100,1,0)
      //                 )=1
      //            ,
      //              roundup(( $AC41*$AK$2 +$AD41*$AK$3 + roundup($N41/$Y41,0)*$AK$1)/100/Cover!$N$8,0)
      //            ,
      //              "ERROR: no valid NIC speed specified for ports"
      //            )
      //        ,
      //            "ERROR: NIC speed for ports must be a number"
      //        )
      // ,
      //    0
      // )
  if (dcConfigArrayLocal[dcItem].resultingNumberOfServersAsPerChassis > 0) {
    console.log(`dcConfigFinalClusterNetwork() 28: [chassisID=${actualChassisID},DC=${dcItem}] chassisArrayLocal[actualChassisID].speedNicCluster=${chassisArrayLocal[actualChassisID].speedNicCluster}`)
    if (typeof chassisArrayLocal[actualChassisID].speedNicCluster === 'number') {
      switch (chassisArrayLocal[actualChassisID].speedNicCluster) {
        case 10:
        case 25:
        case 50:
        case 100:
          dcConfigArrayLocal[dcItem].resultingNumberOfClusterNetNICs = Math.round((dcConfigArrayLocal[dcItem].resultingNumberOfSSD * sizingConstraints.networkBandwidthPerSSDoldinMBsec
                                                                                  + dcConfigArrayLocal[dcItem].resultingNumberOfHDD * sizingConstraints.networkBandwidthPerHDDinMBsec
                                                                                  + dcConfigArrayLocal[dcItem].resultingNumberOfNVMe1 * sizingConstraints.networkBandwidthPerNVMeinMBsec
                                                                                 ) / 100 / chassisArrayLocal[actualChassisID].speedNicCluster
                                                                                )
          break
        default:
          console.log(`dcConfigFinalClusterNetwork() 42: [chassisID=${actualChassisID},DC=${dcItem}] ERROR: no valid NIC speed specified for ports`)
      }
    }
    else {
      console.log(`dcConfigFinalClusterNetwork() 46: [chassisID=${actualChassisID},DC=${dcItem}] ERROR: NIC speed for ports must be a number`)
    }
  }
  else {
    dcConfigArrayLocal[dcItem].resultingNumberOfClusterNetNICs = 0
  }

  console.log(`dcConfigFinalClusterNetwork() 53: [chassisID=${actualChassisID},DC=${dcItem}] dcConfigArrayLocal[dcItem].resultingNumberOfClusterNetNICs=${dcConfigArrayLocal[dcItem].resultingNumberOfClusterNetNICs}`)
}

export default dcConfigFinalClusterNetwork