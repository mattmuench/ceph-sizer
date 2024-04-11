// Trying to implement Y41  
const dcConfigAdjustNumberOfServers   = function (sizingConstraints, dcConfigArrayLocal, chassisArrayLocal, actualChassisID, dcItem) {
  /**
   * Case 1:
   *       The number of cores available per server matches the required number of cores. Memory also matches the maximum configuration possible.
   *       => Do nothing and simply use the number of servers as it is.
   * Case 2:
   *       The number of cores matches the required number. Memory wouldn't match.
   * Case 3:
   *       The number of cores doesn't match the required number. Memory matches.
   * Case 4:
   *       The number of cores doesn't match the required number. Memory wouldn't match either.
   * In any of the latter 3 cases, try one of these and use the one with the smallest number of servers.
   *       => Try to reduce the collocated roles and check if this relaxes it - but could max the # servers required over other approaches. However, this would make some servers special but could go with one role only = 4 cores + 4 cores for OS
   *       => We would need to reduce the number of media proportionally for the config.
   *          In worst case, by skipping an Optane we would have lots of cores available: We'd then go and reducre the number of SSD and HDD in ratio until we get a matching result but keep the Optane.
   */

  let localNewNumberOfServersByReducingCores = 0
  let localNewNumberOfServersByReducingMem = 0
  if (dcConfigArrayLocal[dcItem].constraintsBasedOnNothing === true) {
    // nothing to change
    console.log(`dcConfigAdjustNumberOfServers() 23: [chassisID=${actualChassisID},DC=${dcItem}] => not constrained, carrying over dcConfigArrayLocal[dcItem].prelimNumberOfServers=${dcConfigArrayLocal[dcItem].prelimNumberOfServers}`)
    dcConfigArrayLocal[dcItem].resultingNumberOfServersAsPerChassis = dcConfigArrayLocal[dcItem].prelimNumberOfServers
    console.log(`dcConfigAdjustNumberOfServers() 25: [chassisID=${actualChassisID},DC=${dcItem}] => not constrained, carrying over dcConfigArrayLocal[dcItem].resultingNumberOfServersAsPerChassis=${dcConfigArrayLocal[dcItem].resultingNumberOfServersAsPerChassis}`)
  }
  else {
    //  # If the workload in this DC requires RGW cache devices....
    if (dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe2Needed > 0) {
      console.log(`dcConfigAdjustNumberOfServers() 30: [chassisID=${actualChassisID},DC=${dcItem}] prelimPerServerNumberOfNVMe2Needed=${dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe2Needed} > 0`)
      // We need a cache device in this server.
      // We want to use the maximum of either servers needed (at minimum) based on cores or on memory.
        if ( dcConfigArrayLocal[dcItem].prelimPerServerNumberOfCoresNeeded > (chassisArrayLocal[actualChassisID].maxCpuSockets * chassisArrayLocal[actualChassisID].maxCpuCores) ) {
          // If cores max in server are fewer than needed:
          let localReduceByRatioOfCores = 0
          let localReduceNumberOfNVMe3ForSSD = 0
          let localReduceNumberOfRoles = 0
          
          // # First: try to reduce the number of servers by taking the ratio of cores needed to cores provided in a server.
          if (chassisArrayLocal[actualChassisID].useRGWCaching === false) {
            // RGW cache used:
            console.log(`dcConfigAdjustNumberOfServers() 42: [chassisID=${actualChassisID},DC=${dcItem}] ERROR: Workload requires RGW cache device but config doesn't provide it`)
          }
          else {
            // # ( DCConfig.numberOfNVMe3Needed provides the number of "Optanes", SizingConstraints.coresPerNVMe3 provides cores for the Optanes.)
            localReduceByRatioOfCores = Math.ceil(  dcConfigArrayLocal[dcItem].prelimNumberOfServers / 
                                                  (
                                                      (  (chassisArrayLocal[actualChassisID].maxCpuSockets * chassisArrayLocal[actualChassisID].maxCpuCores) 
                                                            - dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe2Needed * sizingConstraints.coresPerNVMe2
                                                                - sizingConstraints.coresPerNodeBase 
                                                                - sizingConstraints.coresPerRGWCacheDevice
                                                      ) /
                                                      ( dcConfigArrayLocal[dcItem].prelimPerServerNumberOfHDDNeeded * sizingConstraints.coresPerHDD 
                                                        + dcConfigArrayLocal[dcItem].prelimPerServerNumberOfSSDNeeded * sizingConstraints.coresPerSSDold 
                                                        + dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe3Needed * sizingConstraints.coresPerNVMe3)
                                                  )
                                                )
            console.log(`dcConfigAdjustNumberOfServers 58: [chassisID=${actualChassisID},DC=${dcItem}] localReduceByRatioOfCores=${localReduceByRatioOfCores} = Math.ceil(  dcConfigArrayLocal[dcItem].prelimNumberOfServers=${dcConfigArrayLocal[dcItem].prelimNumberOfServers} / 
            (
                (  (chassisArrayLocal[actualChassisID].maxCpuSockets=${chassisArrayLocal[actualChassisID].maxCpuSockets} * chassisArrayLocal[actualChassisID].maxCpuCores=${chassisArrayLocal[actualChassisID].maxCpuCores}) 
                      - dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe2Needed=${dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe2Needed} * sizingConstraints.coresPerNVMe2=${sizingConstraints.coresPerNVMe2}
                          - sizingConstraints.coresPerNodeBase=${sizingConstraints.coresPerNodeBase}
                          - sizingConstraints.coresPerRGWCacheDevice=${sizingConstraints.coresPerRGWCacheDevice}
                ) /
                ( dcConfigArrayLocal[dcItem].prelimPerServerNumberOfHDDNeeded=${dcConfigArrayLocal[dcItem].prelimPerServerNumberOfHDDNeeded} * sizingConstraints.coresPerHDD=${sizingConstraints.coresPerHDD} 
                  + dcConfigArrayLocal[dcItem].prelimPerServerNumberOfSSDNeeded=${dcConfigArrayLocal[dcItem].prelimPerServerNumberOfSSDNeeded} * sizingConstraints.coresPerSSDold=${sizingConstraints.coresPerSSDold} 
                  + dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe3Needed=${dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe3Needed} * sizingConstraints.coresPerNVMe3=${sizingConstraints.coresPerNVMe3})
            )
            )`)
          }
          
          // # Second: If there are more than one Optanes, we could reduce the number of Optanes and by this reducing the number of SSD per server.
          if(dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe3Needed > 0) {
            console.log(`dcConfigAdjustNumberOfServers() 74: [chassisID=${actualChassisID},DC=${dcItem}] dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe3Needed=${dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe3Needed} > 0`)
            if (dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe3Needed > 1) {
              console.log(`dcConfigAdjustNumberOfServers() 76: [chassisID=${actualChassisID},DC=${dcItem}] dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe3Needed=${dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe3Needed} > 1`)
              /**
               * # How many of the Optanes we need to reduce to get down to a reasonable level of cores ?
               * # The number of cores available minus all the default amount for OS and RGW cache would give us the number of available cores for media and Optanes. Then we can
               * # calculate by the ratio of cores per set of Optanes (SSD and HDD cores for the same ratio) the number of servers required instead.
               * #  TRUNC( remainder_of_cores / ((SSDinServer*coresPerSSD+HDDinServer*coresPerHDD)/#Optanes),0)
               * #  TRUNC( (Cover!$I$8*Cover!$J$8-roundup(N41/T41,0)*$AH$5-$AR$5-$G$3)/TRUNC(remainder_of_cores / ((SSDinServer*coresPerSSD+HDDinServer*coresPerHDD)/#Optanes),0),0)
               * # The number of SSD divided by the number of max SSD per Optane will define the needed number of servers.
               */
              // Cover!$R$8 => Chassis.ssdToOptane
              // Since we might have SSD with and without NVMe3 fronting, we need a new value for resulting number of those that will need one.
              let localPerServerNVMe3 = 0
              if (chassisArrayLocal[actualChassisID].useOptane1 === true ) {
                console.log(`dcConfigAdjustNumberOfServers() 89: [chassisID=${actualChassisID},DC=${dcItem}] using Optane`)
                localPerServerNVMe3 = chassisArrayLocal[actualChassisID].prelimPerServerNumberOfNVMe3Needed
              }
              localReduceNumberOfNVMe3ForSSD = Math.ceil( localPerServerNVMe3 /
                                                  Math.floor( ((chassisArrayLocal[actualChassisID].maxCpuSockets * chassisArrayLocal[actualChassisID].maxCpuCores) 
                                                           - dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe6Needed * sizingConstraints.coresPerNVMe6
                                                           - sizingConstraints.coresPerNodeBase
                                                           - sizingConstraints.coresPerRGWCacheDevice
                                                         ) / 
                                                         ( (dcConfigArrayLocal[dcItem].prelimPerServerNumberOfSSDNeeded * sizingConstraints.coresPerSSDold
                                                            +dcConfigArrayLocal[dcItem].prelimPerServerNumberOfHDDNeeded * sizingConstraints.coresPerHDD
                                                           )/dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe3Needed
                                                         )
                                                       )
                                                )
            }
            else {
              console.log(`dcConfigAdjustNumberOfServers() 106: [chassisID=${actualChassisID},DC=${dcItem}] dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe3Needed=${dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe3Needed} NOT > 1`)
              localReduceNumberOfNVMe3ForSSD = 0
            }
          }
          else {
            console.log(`dcConfigAdjustNumberOfServers() 111: [chassisID=${actualChassisID},DC=${dcItem}] dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe3Needed=${dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe3Needed} NOT > 0`)
            localReduceNumberOfNVMe3ForSSD = 0
          }

          //  # We simply reduce the number of roles ___ BUT: WE NEED TO CHECK THE NUMBER OF SERVERS THEN
          localReduceNumberOfRoles = Math.ceil(dcConfigArrayLocal[dcItem].prelimNumberOfServers / (((chassisArrayLocal[actualChassisID].maxCpuSockets * chassisArrayLocal[actualChassisID].maxCpuCores)
                                                                                                     -dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe6Needed * sizingConstraints.coresPerNVMe6
                                                                                                     -sizingConstraints.coresPerNodeBase
                                                                                                     +sizingConstraints.coresPerAdditionalRole
                                                                                                     -sizingConstraints.coresPerRGWCacheDevice
                                                                                                    ) / 
                                                                                                    (dcConfigArrayLocal[dcItem].prelimPerServerNumberOfHDDNeeded * sizingConstraints.coresPerHDD
                                                                                                     +dcConfigArrayLocal[dcItem].prelimPerServerNumberOfSSDNeeded * sizingConstraints.coresPerSSDold
                                                                                                     +dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe3Needed * sizingConstraints.coresPerNVMe3
                                                                                                    )
                                                                                                   )
                                            )
          console.log(`dcConfigAdjustNumberOfServers() 128: [chassisID=${actualChassisID},DC=${dcItem}] localReduceNumberOfRoles=${localReduceNumberOfRoles} = Math.ceil(dcConfigArrayLocal[dcItem].prelimNumberOfServers=${dcConfigArrayLocal[dcItem].prelimNumberOfServers} / (((chassisArrayLocal[actualChassisID].maxCpuSockets=${chassisArrayLocal[actualChassisID].maxCpuSockets} * chassisArrayLocal[actualChassisID].maxCpuCores=${chassisArrayLocal[actualChassisID].maxCpuCores})
          -dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe6Needed=${dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe6Needed} * sizingConstraints.coresPerNVMe6=${sizingConstraints.coresPerNVMe6}
          -sizingConstraints.coresPerNodeBase=${sizingConstraints.coresPerNodeBase}
          +sizingConstraints.coresPerAdditionalRole=${sizingConstraints.coresPerAdditionalRole}
          -sizingConstraints.coresPerRGWCacheDevice=${sizingConstraints.coresPerRGWCacheDevice}
         ) / 
         (dcConfigArrayLocal[dcItem].prelimPerServerNumberOfHDDNeeded=${dcConfigArrayLocal[dcItem].prelimPerServerNumberOfHDDNeeded} * sizingConstraints.coresPerHDD=${sizingConstraints.coresPerHDD}
          +dcConfigArrayLocal[dcItem].prelimPerServerNumberOfSSDNeeded=${dcConfigArrayLocal[dcItem].prelimPerServerNumberOfSSDNeeded} * sizingConstraints.coresPerSSDold=${sizingConstraints.coresPerSSDold}
          +dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe3Needed=${dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe3Needed} * sizingConstraints.coresPerNVMe3=${sizingConstraints.coresPerNVMe3}
         )
        )
)`)
          // take the max of all above => this is the number of servers we will correct the cores per server
          localNewNumberOfServersByReducingCores = Math.min(localReduceByRatioOfCores,localReduceNumberOfNVMe3ForSSD,localReduceNumberOfRoles)
        }
        else {
          localNewNumberOfServersByReducingCores = dcConfigArrayLocal[dcItem].prelimNumberOfServers
        }
        // End of first entries to max from

        // Second to max from:
        if (dcConfigArrayLocal[dcItem].prelimPerServerMemNeededPerServer > chassisArrayLocal[actualChassisID].maxMemGb) {
          // # If memory max is smaller than required:
          min(/* from all below */)
          let localReduceMemByRatio = 0
          let localReduceMemByRole = 0
          // # First: try to reduce the number of servers by taking the ratio of memory needed to memory provided in a server.
          if (chassisArrayLocal[actualChassisID].useRGWCaching === false) {
            console.log(`dcConfigAdjustNumberOfServers() 156: [chassisID=${actualChassisID},DC=${dcItem}] ERROR: Workload requires RGW cache device but config doesn't provide it`)
          }
          else {
            // # Info: Optanes don't require additional memory. So, we don't need to take those into account. (However, even RGW cache doesn't get additional memoery, too.)
            localReduceMemByRatio = Math.ceil( dcConfigArrayLocal[dcItem].prelimNumberOfServers / 
                                             ((chassisArrayLocal[actualChassisID].maxMemGb 
                                               - dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe6Needed * sizingConstraints.memInGBPerNVMeForObjectIndexOnNVMe6
                                               - sizingConstraints.memPerNodeBase
                                              ) / 
                                              (dcConfigArrayLocal[dcItem].prelimPerServerNumberOfHDDNeeded * sizingConstraints.memInGBPerHDD
                                               + dcConfigArrayLocal[dcItem].prelimPerServerNumberOfSSDNeeded * sizingConstraints.memInGBPerSSD
                                              )
                                             )
                                           )
          }

          // # The other only option would be to reduce the additional role by one.
          localReduceMemByRole = Math.ceil(dcConfigArrayLocal[dcItem].prelimNumberOfServers /
                                           ((chassisArrayLocal[actualChassisID].maxMemGb 
                                              - dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe6Needed * sizingConstraints.memInGBPerNVMeForObjectIndexOnNVMe6
                                              - sizingConstraints.memPerNodeBase
                                              + sizingConstraints.memPerAdditionalRole
                                            ) / 
                                            (dcConfigArrayLocal[dcItem].prelimPerServerNumberOfHDDNeeded * sizingConstraints.memInGBPerHDD
                                             + dcConfigArrayLocal[dcItem].prelimPerServerNumberOfSSDNeeded * sizingConstraints.memInGBPerSSD
                                            )
                                           )
                                          )

          // take the min of both
          localNewNumberOfServersByReducingMem = Math.min(localReduceMemByRatio, localReduceMemByRole)
        }
        else {
          localNewNumberOfServersByReducingMem = dcConfigArrayLocal[dcItem].prelimNumberOfServers
        }

        // From all these reduction either by reducing cores or by reducing memory needed, take the max number of servers resulting
        dcConfigArrayLocal[dcItem].resultingNumberOfServersAsPerChassis = Math.max (localNewNumberOfServersByReducingCores, localNewNumberOfServersByReducingMem)
    }
    else {
      console.log(`dcConfigAdjustNumberOfServers() 196: [chassisID=${actualChassisID},DC=${dcItem}] IF dcConfigArrayLocal[dcItem].prelimPerServerNumberOfCoresNeeded=${dcConfigArrayLocal[dcItem].prelimPerServerNumberOfCoresNeeded} > (chassisArrayLocal[actualChassisID].maxCpuSockets=${chassisArrayLocal[actualChassisID].maxCpuSockets} * chassisArrayLocal[actualChassisID].maxCpuCores=${chassisArrayLocal[actualChassisID].maxCpuCores})`)
      console.log(`dcConfigAdjustNumberOfServers() 197: [chassisID=${actualChassisID},DC=${dcItem}] prelimPerServerNumberOfNVMe2Needed=${dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe2Needed} <= 0`)
      // # We need no cache device in this server.
      // # We want to use the maximum of either servers needed (min) based on cores or on memory.
      
      // We use the maximum of servers at min required that we get from trying to reduce the cores to the number of cores provided, or by reducing the required memory
      let localReduceByCores = 0
      let localReduceByMem = 0
      
      // 1) check for cores
      console.log(`dcConfigAdjustNumberOfServers() 206: [chassisID=${actualChassisID},DC=${dcItem}] IF dcConfigArrayLocal[dcItem].prelimPerServerNumberOfCoresNeeded=${dcConfigArrayLocal[dcItem].prelimPerServerNumberOfCoresNeeded} > (chassisArrayLocal[actualChassisID].maxCpuSockets=${chassisArrayLocal[actualChassisID].maxCpuSockets} * chassisArrayLocal[actualChassisID].maxCpuCores=${chassisArrayLocal[actualChassisID].maxCpuCores})`)
      if (dcConfigArrayLocal[dcItem].prelimPerServerNumberOfCoresNeeded > (chassisArrayLocal[actualChassisID].maxCpuSockets * chassisArrayLocal[actualChassisID].maxCpuCores)) {
        console.log(`dcConfigAdjustNumberOfServers() 208: [chassisID=${actualChassisID},DC=${dcItem}] Core constrained`)
        // # If cores max in server are fewer than needed:
        // We use the minimum of the number of servers needed by reducing resources
        let localReduceByCoresRatio = 0
        let localReduceByCoresForOptanes = 0
        let localReduceByCoresForRoles = 0

        // # First: try to reduce the number of servers by taking the ratio of cores needed to cores provided in a server.
        // # (U41 provides the number of Optanes, G4 provides cores for the Optanes.)
        localReduceByCoresRatio = Math.ceil(dcConfigArrayLocal[dcItem].prelimNumberOfServers /
                                            (((chassisArrayLocal[actualChassisID].maxCpuSockets * chassisArrayLocal[actualChassisID].maxCpuCores) 
                                               - dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe6Needed * sizingConstraints.coresPerNVMe6 
                                               - sizingConstraints.coresPerNodeBase
                                             ) / 
                                             (dcConfigArrayLocal[dcItem].prelimPerServerNumberOfHDDNeeded * sizingConstraints.coresPerHDD 
                                              + dcConfigArrayLocal[dcItem].prelimPerServerNumberOfSSDNeeded * sizingConstraints.coresPerSSDold 
                                              + dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe3Needed * sizingConstraints.coresPerNVMe3
                                             )
                                            )
                                           )
        console.log(`dcConfigAdjustNumberOfServers() 228: [chassisID=${actualChassisID},DC=${dcItem}] localReduceByCoresRatio=${localReduceByCoresRatio} = Math.ceil(dcConfigArrayLocal[dcItem].prelimNumberOfServers=${dcConfigArrayLocal[dcItem].prelimNumberOfServers} /
        (((chassisArrayLocal[actualChassisID].maxCpuSockets=${chassisArrayLocal[actualChassisID].maxCpuSockets} * chassisArrayLocal[actualChassisID].maxCpuCores=${chassisArrayLocal[actualChassisID].maxCpuCores}) 
           - dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe6Needed=${dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe6Needed} * sizingConstraints.coresPerNVMe6=${sizingConstraints.coresPerNVMe6} 
           - sizingConstraints.coresPerNodeBase=${sizingConstraints.coresPerNodeBase}
         ) / 
         (dcConfigArrayLocal[dcItem].prelimPerServerNumberOfHDDNeeded=${dcConfigArrayLocal[dcItem].prelimPerServerNumberOfHDDNeeded} * sizingConstraints.coresPerHDD=${sizingConstraints.coresPerHDD} 
          + dcConfigArrayLocal[dcItem].prelimPerServerNumberOfSSDNeeded=${dcConfigArrayLocal[dcItem].prelimPerServerNumberOfSSDNeeded} * sizingConstraints.coresPerSSDold=${sizingConstraints.coresPerSSDold} 
          + dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe3Needed=${dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe3Needed} * sizingConstraints.coresPerNVMe3=${sizingConstraints.coresPerNVMe3}
         )
        )
       )`)

        // # Second: If there are more than one Optanes, we could reduce the number of Optanes and by this reducing the number of SSD per server
        if (dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe3Needed > 0) {
          console.log(`dcConfigAdjustNumberOfServers() 242: [chassisID=${actualChassisID},DC=${dcItem}] dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe3Needed=${dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe3Needed} > 0`)
          if (dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe3Needed > 1) {
            console.log(`dcConfigAdjustNumberOfServers() 244: [chassisID=${actualChassisID},DC=${dcItem}] dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe3Needed=${dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe3Needed} > 1`)
            /**
             * # How many of the Optanes we need to reduce to get down to a reasonable level of cores ?
             * # The number of cores available minus all the default amount for OS and RGW cache would give us the number of available cores for media and Optanes. Then we can
             * # calculate by the ratio of cores per set of Optanes (SSD and HDD cores for the same ratio) the number of servers required instead.
             * #  TRUNC( remainder_of_cores / ((SSDinServer*coresPerSSD+HDDinServer*coresPerHDD)/#Optanes),0)
             * #  TRUNC( (Cover!$I$8*Cover!$J$8-roundup(N41/T41,0)*$AH$5-$AR$5-$G$3)/TRUNC(remainder_of_cores / ((SSDinServer*coresPerSSD+HDDinServer*coresPerHDD)/#Optanes),0),0)
             * # The number of SSD divided by the number of max SSD per Optane will define the needed number of servers.
             */
            // Since we might have SSD with and without NVMe3 fronting, we need a new value for resulting number of those that will need one.
            let localSSDFrontedByNVMe3 = 0
            if (chassisArrayLocal[actualChassisID].useOptane1 === true ) {
              console.log(`dcConfigAdjustNumberOfServers() 256: [chassisID=${actualChassisID},DC=${dcItem}] using Optanes`)
              localSSDFrontedByNVMe3 = Math.ceil(dcConfigArrayLocal[dcItem].prelimPerServerNumberOfSSDWithoutDedicatedNVMeNeeded / dcConfigArrayLocal[dcItem].prelimPerServerNumberOfSSDWithDedicatedNVMeNeeded * dcConfigArrayLocal[dcItem].prelimPerServerNumberOfSSDNeeded)
            }
            localReduceByCoresForOptanes = Math.ceil( Math.ceil(localSSDFrontedByNVMe3/chassisArrayLocal[actualChassisID].ssdToOptane) / 
                                                                Math.floor( ((chassisArrayLocal[actualChassisID].maxCpuSockets * chassisArrayLocal[actualChassisID].maxCpuCores)
                                                                             - dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe6Needed * sizingConstraints.coresPerNVMe6
                                                                             - sizingConstraints.coresPerNodeBase
                                                                            ) / 
                                                                            ((dcConfigArrayLocal[dcItem].prelimPerServerNumberOfHDDNeeded * sizingConstraints.coresPerHDD
                                                                              +dcConfigArrayLocal[dcItem].prelimPerServerNumberOfSSDNeeded * sizingConstraints.coresPerSSDold
                                                                             )/
                                                                             dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe3Needed
                                                                            )
                                                                          )
                                                    )
          }
          else {
            console.log(`dcConfigAdjustNumberOfServers() 273: [chassisID=${actualChassisID},DC=${dcItem}] dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe3Needed=${dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe3Needed} NOT > 1`)
            localReduceByCoresForOptanes = 0
          }
        }
        else {
          console.log(`dcConfigAdjustNumberOfServers() 278: [chassisID=${actualChassisID},DC=${dcItem}] dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe3Needed=${dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe3Needed} NOT > 0`)
          localReduceByCoresForOptanes = 999999
        }

        // # The other only option would be to reduce the additional role by one.
        // # We simply reduce the number of roles per server (not two scale-out anymore)___ BUT: We need to check the number of servers then needed
        if ( dcConfigArrayLocal[dcItem].resultingNumberOfServersForiSCSILocalAsPerChassis > Math.ceil(dcConfigArrayLocal[dcItem].prelimNumberOfServers / 
                                                                                                       (((chassisArrayLocal[actualChassisID].maxCpuSockets * chassisArrayLocal[actualChassisID].maxCpuCores)
                                                                                                          - dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe6Needed * sizingConstraints.coresPerNVMe6
                                                                                                          - sizingConstraints.coresPerNodeBase
                                                                                                          - sizingConstraints.coresPerAdditionalRole
                                                                                                        ) / (dcConfigArrayLocal[dcItem].prelimPerServerNumberOfHDDNeeded * sizingConstraints.coresPerHDD
                                                                                                             + dcConfigArrayLocal[dcItem].prelimPerServerNumberOfSSDNeeded * sizingConstraints.coresPerSSDold
                                                                                                             + dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe3Needed * sizingConstraints.coresPerNVMe3
                                                                                                            )
                                                                                                       )
                                                                                                     ) 
           ) {
          localReduceByCoresForRoles = dcConfigArrayLocal[dcItem].resultingNumberOfServersForiSCSILocalAsPerChassis
          console.log(`dcConfigAdjustNumberOfServers() 297: [chassisID=${actualChassisID},DC=${dcItem}] resultingNumberOfServersForiSCSILocalAsPerChassis is bigger`)
        }
        else {
          localReduceByCoresForRoles = Math.ceil(dcConfigArrayLocal[dcItem].prelimNumberOfServers / 
                                                 (((chassisArrayLocal[actualChassisID].maxCpuSockets * chassisArrayLocal[actualChassisID].maxCpuCores)
                                                    - dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe6Needed * sizingConstraints.coresPerNVMe6
                                                    - sizingConstraints.coresPerNodeBase
                                                    - sizingConstraints.coresPerAdditionalRole
                                                  ) / 
                                                  (dcConfigArrayLocal[dcItem].prelimPerServerNumberOfHDDNeeded * sizingConstraints.coresPerHDD
                                                   + dcConfigArrayLocal[dcItem].prelimPerServerNumberOfSSDNeeded * sizingConstraints.coresPerSSDold
                                                   + dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe3Needed * sizingConstraints.coresPerNVMe3
                                                  )
                                                 )
                                                )
          console.log(`dcConfigAdjustNumberOfServers() 312: [chassisID=${actualChassisID},DC=${dcItem}] reducing for one scale-out role`)
        }

        // Take the min of all:
        localReduceByCores = Math.min(localReduceByCoresRatio, localReduceByCoresForOptanes,localReduceByCoresForRoles )
        
      }
      else {
        console.log(`dcConfigAdjustNumberOfServers() 320: [chassisID=${actualChassisID},DC=${dcItem}] Not Core constrained`)
        localReduceByCores = dcConfigArrayLocal[dcItem].prelimNumberOfServers
      }

      // 2) check for memory
      if ( dcConfigArrayLocal[dcItem].prelimPerServerMemNeededPerServer > chassisArrayLocal[actualChassisID].maxMemGb) {
        console.log(`dcConfigAdjustNumberOfServers() 326: [chassisID=${actualChassisID},DC=${dcItem}] MEM constrained`)
        // # If memory max is smaller than required:
        let localReduceByMemRatio = 0
        let localReduceByMemRole = 0
        // Use the minnimum number of servers we can get to by... 

        /**
         * # First: try to reduce the number of servers by taking the ratio of memory needed for base and media to memory provided in a server.
         * # In contrast the the above section with RGW cache involved for at least one workload in this DC, we don't have it here at all. So, we don't need to check for it and can directly go to the calculation of servers required.
         * # Optanes don't require additional memory. So, we don't need to take those into account.
         */
        localReduceByMemRatio = Math.ceil(dcConfigArrayLocal[dcItem].prelimNumberOfServers / 
                                          ((chassisArrayLocal[actualChassisID].maxMemGb - dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe6Needed * sizingConstraints.memInGBPerNVMeForObjectIndexOnNVMe6
                                            - sizingConstraints.memPerNodeBase
                                           ) / 
                                           (dcConfigArrayLocal[dcItem].prelimPerServerNumberOfHDDNeeded * sizingConstraints.memInGBPerHDD
                                            + dcConfigArrayLocal[dcItem].prelimPerServerNumberOfSSDNeeded * sizingConstraints.memInGBPerSSD
                                           )
                                          )
                                         )
        console.log(`dcConfigAdjustNumberOfServers() 346: [chassisID=${actualChassisID},DC=${dcItem}] localReduceByMemRatio=${localReduceByMemRatio} = Math.ceil(dcConfigArrayLocal[dcItem].prelimNumberOfServers=${dcConfigArrayLocal[dcItem].prelimNumberOfServers} / 
        ((chassisArrayLocal[actualChassisID].maxMemGb=${chassisArrayLocal[actualChassisID].maxMemGb} - dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe6Needed=${dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe6Needed} * sizingConstraints.memInGBPerNVMeForObjectIndexOnNVMe6=${sizingConstraints.memInGBPerNVMeForObjectIndexOnNVMe6}
          - sizingConstraints.memPerNodeBase=${sizingConstraints.memPerNodeBase}
         ) / 
         (dcConfigArrayLocal[dcItem].prelimPerServerNumberOfHDDNeeded=${dcConfigArrayLocal[dcItem].prelimPerServerNumberOfHDDNeeded} * sizingConstraints.memInGBPerHDD=${sizingConstraints.memInGBPerHDD}
          + dcConfigArrayLocal[dcItem].prelimPerServerNumberOfSSDNeeded=${dcConfigArrayLocal[dcItem].prelimPerServerNumberOfSSDNeeded} * sizingConstraints.memInGBPerSSD=${sizingConstraints.memInGBPerSSD}
         )
        )
       )`)

        // # The other only option would be to reduce the additional role by one.
        // # We simply reduce the number of roles per server (not two scale-out anymore)___ BUT: We need to check the number of servers then needed
        if ( dcConfigArrayLocal[dcItem].resultingNumberOfServersForiSCSILocalAsPerChassis > Math.ceil(dcConfigArrayLocal[dcItem].prelimNumberOfServers / 
                                                                                                      ((chassisArrayLocal[actualChassisID].maxMemGb
                                                                                                        - dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe6Needed * sizingConstraints.memInGBPerNVMeForObjectIndexOnNVMe6 
                                                                                                        - sizingConstraints.memPerNodeBase 
                                                                                                        - sizingConstraints.memPerAdditionalRole
                                                                                                       ) / 
                                                                                                       (dcConfigArrayLocal[dcItem].prelimPerServerNumberOfHDDNeeded * sizingConstraints.memInGBPerHDD 
                                                                                                        + dcConfigArrayLocal[dcItem].prelimPerServerNumberOfSSDNeeded * sizingConstraints.memInGBPerSSD
                                                                                                       )
                                                                                                      )
                                                                                                     ) 
           ) {
          localReduceByMemRole = dcConfigArrayLocal[dcItem].resultingNumberOfServersForiSCSILocalAsPerChassis
          console.log(`dcConfigAdjustNumberOfServers() 371: [chassisID=${actualChassisID},DC=${dcItem}] resultingNumberOfServersForiSCSILocalAsPerChassisis larger then resulting num of servers as per previous calc`)
        }
        else {
          localReduceByMemRole = Math.ceil(dcConfigArrayLocal[dcItem].prelimNumberOfServers / 
                                           ((chassisArrayLocal[actualChassisID].maxMemGb 
                                             - dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe6Needed * sizingConstraints.memInGBPerNVMeForObjectIndexOnNVMe6 
                                             - sizingConstraints.memPerNodeBase 
                                             - sizingConstraints.memPerAdditionalRole
                                            ) / 
                                            (dcConfigArrayLocal[dcItem].prelimPerServerNumberOfHDDNeeded * sizingConstraints.memInGBPerHDD 
                                             + dcConfigArrayLocal[dcItem].prelimPerServerNumberOfSSDNeeded * sizingConstraints.memInGBPerSSD
                                            )
                                           )
                                          )
          console.log(`dcConfigAdjustNumberOfServers() 385: [chassisID=${actualChassisID},DC=${dcItem}] localReduceByMemRole=${localReduceByMemRole} = Math.ceil(dcConfigArrayLocal[dcItem].prelimNumberOfServers=${dcConfigArrayLocal[dcItem].prelimNumberOfServers} / ((chassisArrayLocal[dcItem].maxMemGb=${chassisArrayLocal[actualChassisID].maxMemGb} - dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe6Needed=${dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe6Needed}*sizingConstraints.memInGBPerNVMeForObjectIndexOnNVMe6=${sizingConstraints.memInGBPerNVMeForObjectIndexOnNVMe6} - sizingConstraints.memPerNodeBase=${sizingConstraints.memPerNodeBase} + sizingConstraints.memPerAdditionalRole=${sizingConstraints.memPerAdditionalRole}) / (dcConfigArrayLocal[dcItem].prelimPerServerNumberOfHDDNeeded=${dcConfigArrayLocal[dcItem].prelimPerServerNumberOfHDDNeeded}*sizingConstraints.memInGBPerHDD=${sizingConstraints.memInGBPerHDD} + dcConfigArrayLocal[dcItem].prelimPerServerNumberOfSSDNeeded=${dcConfigArrayLocal[dcItem].prelimPerServerNumberOfSSDNeeded}*sizingConstraints.memInGBPerSSD=${sizingConstraints.memInGBPerSSD})))`)
          console.log(`dcConfigAdjustNumberOfServers() 386: [chassisID=${actualChassisID},DC=${dcItem}] reduced by a single role`)
        }

        // Use min of both:
        console.log(`dcConfigAdjustNumberOfServers() 390: [chassisID=${actualChassisID},DC=${dcItem}] localReduceByMemRatio=${localReduceByMemRatio}, localReduceByMemRole=${localReduceByMemRole}`)
        localReduceByMem = Math.max(localReduceByMemRatio, localReduceByMemRole)

      }
      else {
        console.log(`dcConfigAdjustNumberOfServers() 395: [chassisID=${actualChassisID},DC=${dcItem}] Not MEM constrained`)
        localReduceByMem = dcConfigArrayLocal[dcItem].prelimNumberOfServers
      }

      // We take the maxmimum of the min # servers:
      console.log(`dcConfigAdjustNumberOfServers() 400: [chassisID=${actualChassisID},DC=${dcItem}] localReduceByCores=${localReduceByCores}, localReduceByMem=${localReduceByMem}`)
      dcConfigArrayLocal[dcItem].resultingNumberOfServersAsPerChassis = Math.max(localReduceByCores, localReduceByMem)
    }
  }

  console.log(`dcConfigAdjustNumberOfServers() 405: [chassisID=${actualChassisID},DC=${dcItem}] dcConfigArrayLocal[dcItem].resultingNumberOfServersAsPerChassis=${dcConfigArrayLocal[dcItem].resultingNumberOfServersAsPerChassis}`)
}

export default dcConfigAdjustNumberOfServers