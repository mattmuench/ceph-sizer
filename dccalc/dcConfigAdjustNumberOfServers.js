import displayMsg from "../common/displayMsg.js"
import {debugMsg} from "../common/debug.js";

// Trying to implement Y41  
const dcConfigAdjustNumberOfServers   = function (generalValues, sizingConstraints, dcConfigArrayLocal, chassisArrayLocal, actualChassisID, dcItem) {
  let localDebugOn = false
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
   *          In worst case, by skipping an NVMe3 we would have lots of cores available: We'd then go and reducre the number of SSD and HDD in ratio until we get a matching result but keep the NVMe3.
   */

  let localNewNumberOfServersByReducingCores = 0
  let localNewNumberOfServersByReducingMem = 0
  if (dcConfigArrayLocal[dcItem].constraintsBasedOnNothing === true) {
    // nothing to change
    debugMsg(generalValues, localDebugOn, 5, "dcConfigAdjustNumberOfServers", 27, `[chassisID=${actualChassisID},DC=${dcItem}] => not constrained, carrying over dcConfigArrayLocal[dcItem].prelimNumberOfServers=${dcConfigArrayLocal[dcItem].prelimNumberOfServers}`,0,0,0)
    dcConfigArrayLocal[dcItem].resultingNumberOfServersAsPerChassis = dcConfigArrayLocal[dcItem].prelimNumberOfServers
    debugMsg(generalValues, localDebugOn, 5, "dcConfigAdjustNumberOfServers", 29, `[chassisID=${actualChassisID},DC=${dcItem}] => not constrained, carrying over dcConfigArrayLocal[dcItem].resultingNumberOfServersAsPerChassis=${dcConfigArrayLocal[dcItem].resultingNumberOfServersAsPerChassis}`,0,0,0)
  }
  else {
    debugMsg(generalValues, localDebugOn, 5, "dcConfigAdjustNumberOfServers", 32, `[chassisID=${actualChassisID},DC=${dcItem}] prelimPerServerNumberOfNVMe2Needed=${dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe2Needed} > 0`,0,0,0)
    let localMinServersForRoles = dcConfigArrayLocal[dcItem].numberOfLocalSpecialInstances + Math.max(Math.ceil((dcConfigArrayLocal[dcItem].numberOfLocalScaleoutInstances+dcConfigArrayLocal[dcItem].numberOfNeededMonInstances)/2),dcConfigArrayLocal[dcItem].numberOfNeededMonInstances)
    // We want to use the maximum of either servers needed (at minimum) based on cores or on memory.
    if ( dcConfigArrayLocal[dcItem].prelimPerServerNumberOfCoresNeeded > (chassisArrayLocal[actualChassisID].maxCpuSockets * chassisArrayLocal[actualChassisID].maxCpuCores) ) {
      // If cores max in server are fewer than needed:
      let localReduceByRatioOfCoresMinRoles = 0
      let localReduceByRatioOfCoresMaxRoles = 0
      let localReduceNumberOfNVMe3ForSSD = 0
      let localReduceNumberOfNVMe8ForNVMe1 = 0
      let localReducedByNumberOfRoles = 0
      
      let localMinScaleOutRolesPerServer = 0
      // determine number of scale-out instances and exclusive instances
      let localCoresScaleOutRoles = 0
      let localCoresExclusiveRoles = 0
      localCoresScaleOutRoles = dcConfigArrayLocal[dcItem].numberOfLocalScaleoutInstances * Math.max(sizingConstraints.coresPerMGRInstance,sizingConstraints.coresPerRGWInstance,sizingConstraints.coresPerMDSInstance) + dcConfigArrayLocal[dcItem].numberOfNeededMonInstances * sizingConstraints.coresPerMONInstance
      localCoresExclusiveRoles = dcConfigArrayLocal[dcItem].numberOfLocalSpecialInstances * Math.max(sizingConstraints.coresPeriSCSIInstance,sizingConstraints.coresPerRBDMirrorInstance)
      let localCoresMaxAllPerExclusiveInstance = Math.max(sizingConstraints.coresPeriSCSIInstance,sizingConstraints.coresPerRBDMirrorInstance)
      let localCoresMaxAllPerScaleOutInstance = Math.max(sizingConstraints.coresPerMGRInstance,sizingConstraints.coresPerRGWInstance,sizingConstraints.coresPerMDSInstance,sizingConstraints.coresPerMONInstance) 
      debugMsg(generalValues, localDebugOn, 5, "dcConfigAdjustNumberOfServers", 51, `localCoresMaxAllPerScaleOutInstance=${localCoresMaxAllPerScaleOutInstance} = Math.max(sizingConstraints.coresPerMGRInstance=${sizingConstraints.coresPerMGRInstance},sizingConstraints.coresPerRGWInstance=${sizingConstraints.coresPerRGWInstance},sizingConstraints.coresPerMDSInstance=${sizingConstraints.coresPerMDSInstance},sizingConstraints.coresPerMONInstance=${sizingConstraints.coresPerMONInstance})`,0,0,0)
      // RFE: might be improved to really use tha ctual configuration of the workloads to pick the best h/w config and not pick more than needed for minimum - this actually assumes that there are always 2nd scale-out instances
      let localCoresMinAllPerScaleOutTwoInstances = Math.max(sizingConstraints.coresPerMGRInstance,sizingConstraints.coresPerRGWInstance,sizingConstraints.coresPerMDSInstance) // MONs are no secondary instances
      //let localMinServersForRoles = dcConfigArrayLocal[dcItem].numberOfLocalSpecialInstances + Math.max(Math.ceil((dcConfigArrayLocal[dcItem].numberOfLocalScaleoutInstances+dcConfigArrayLocal[dcItem].numberOfNeededMonInstances)/2),dcConfigArrayLocal[dcItem].numberOfNeededMonInstances)
      //let localMinCoresReducableAgnostic = Math.min(Math.max(sizingConstraints.coresPerMGRInstance,sizingConstraints.coresPerRGWInstance,sizingConstraints.coresPerMDSInstance, sizingConstraints.coresPerMONInstance), Math.max(sizingConstraints.coresPeriSCSIInstance,sizingConstraints.coresPerRBDMirrorInstance))
      let localCoresMinForRolesInitiallyAnyServer = 0  // this is the actual minimum number of cores that will be needed to run the role instances on any server (all servers are equeal in this DC)
      debugMsg(generalValues, localDebugOn, 5, "dcConfigAdjustNumberOfServers", 57, `localMinServersForRoles=${localMinServersForRoles}`,0,0,0)
      // check feasibility of the number of servers proposed regarding the role instances we need
      if (localMinServersForRoles <= dcConfigArrayLocal[dcItem].prelimNumberOfServers) {
        // ok - can place the roles
        debugMsg(generalValues, localDebugOn, 5, "dcConfigAdjustNumberOfServers", 61, `ok - localMinServersForRoles=${localMinServersForRoles}, dcConfigArrayLocal[dcItem].prelimNumberOfServers=${dcConfigArrayLocal[dcItem].prelimNumberOfServers}`,0,0,0)
      }
      else {
        displayMsg(document, "dcConfigAdjustNumberOfServers", 64, "error", "unable to place all roles to preliminary number of servers already - number of servers must be increased",0,0,0)
        /// MUST ADJUST PRELIM #servers
        dcConfigArrayLocal[dcItem].prelimNumberOfServers = localMinServersForRoles
      }
      debugMsg(generalValues, localDebugOn, 5, "dcConfigAdjustNumberOfServers", 68, `dcConfigArrayLocal[dcItem].prelimNumberOfServers=${dcConfigArrayLocal[dcItem].prelimNumberOfServers}`,0,0,0)
      // Figure out the minium number of cores that we'd need to place the needed instances on any server
      if ((dcConfigArrayLocal[dcItem].prelimNumberOfServers - localCoresExclusiveRoles) <= localCoresScaleOutRoles) {
        // there would be enough room to store each scale-out role to a node exclusively
        let localMinRolesPerServer = 1
        localCoresMinForRolesInitiallyAnyServer = Math.max(localCoresMaxAllPerExclusiveInstance,localCoresMaxAllPerScaleOutInstance)
      }
      else {
        let localMinScaleOutRolesPerServer = 2
        localCoresMinForRolesInitiallyAnyServer = Math.max(localCoresMaxAllPerExclusiveInstance,localCoresMaxAllPerScaleOutInstance+localCoresMinAllPerScaleOutTwoInstances)
      }
      let localCoresMinForMinRolesInitiallyAnyServer = Math.max(localCoresMaxAllPerExclusiveInstance,localCoresMaxAllPerScaleOutInstance)
      debugMsg(generalValues, localDebugOn, 5, "dcConfigAdjustNumberOfServers", 80, `localCoresMinForMinRolesInitiallyAnyServer=${localCoresMinForMinRolesInitiallyAnyServer} = Math.max(${localCoresMaxAllPerExclusiveInstance},localCoresMaxAllPerScaleOutInstance=${localCoresMaxAllPerScaleOutInstance})`,0,0,0)
      let localMinServersForMinRolesInitiallyAnyServer = dcConfigArrayLocal[dcItem].numberOfLocalSpecialInstances + dcConfigArrayLocal[dcItem].numberOfLocalScaleoutInstances + dcConfigArrayLocal[dcItem].numberOfNeededMonInstances
      let localCoresMinForMaxRolesInitiallyAnyServer = Math.max(localCoresMaxAllPerExclusiveInstance,localCoresMaxAllPerScaleOutInstance+localCoresMinAllPerScaleOutTwoInstances)
      let localMinServersForMaxRolesInitiallyAnyServer = dcConfigArrayLocal[dcItem].numberOfLocalSpecialInstances + Math.ceil(Math.max((dcConfigArrayLocal[dcItem].numberOfLocalScaleoutInstances + dcConfigArrayLocal[dcItem].numberOfNeededMonInstances)/2,dcConfigArrayLocal[dcItem].numberOfNeededMonInstances))
      debugMsg(generalValues, localDebugOn, 5, "dcConfigAdjustNumberOfServers", 84, `localMinServersForMaxRolesInitiallyAnyServer=${localMinServersForMaxRolesInitiallyAnyServer} = dcConfigArrayLocal[dcItem].numberOfLocalSpecialInstances=${dcConfigArrayLocal[dcItem].numberOfLocalSpecialInstances} + Math.ceil(Math.max((dcConfigArrayLocal[dcItem].numberOfLocalScaleoutInstances=${dcConfigArrayLocal[dcItem].numberOfLocalScaleoutInstances} + dcConfigArrayLocal[dcItem].numberOfNeededMonInstances=${dcConfigArrayLocal[dcItem].numberOfNeededMonInstances})/2,dcConfigArrayLocal[dcItem].numberOfNeededMonInstances=${dcConfigArrayLocal[dcItem].numberOfNeededMonInstances}))`,0,0,0)
      // # ( DCConfig.numberOfNVMe3Needed provides the number of "NVMe3s", SizingConstraints.coresPerNVMe3 provides cores for the NVMe3s.)
      // # First: try to reduce the number of servers by taking the ratio of cores needed to cores provided in a server.
      // localReduceByRatioOfCoresMinRoles => How many of the actual media we need to reduce to if we would have only a single role instance on any of the servers in this DC.
      localReduceByRatioOfCoresMinRoles = Math.ceil(  dcConfigArrayLocal[dcItem].prelimNumberOfServers / 
                                            (
                                                (  (chassisArrayLocal[actualChassisID].maxCpuSockets * chassisArrayLocal[actualChassisID].maxCpuCores) 
                                                      - dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe6Needed * sizingConstraints.coresPerNVMe6
                                                          - sizingConstraints.coresPerNodeBase 
                                                          - localCoresMinForMinRolesInitiallyAnyServer
                                                          - dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe2Needed * sizingConstraints.coresPerNVMe2
                                                ) /
                                                ( dcConfigArrayLocal[dcItem].prelimPerServerNumberOfHDDNeeded * sizingConstraints.coresPerHDD 
                                                  + dcConfigArrayLocal[dcItem].prelimPerServerNumberOfSSDWithoutDedicatedNVMeNeeded * sizingConstraints.coresPerSSDold 
                                                  + dcConfigArrayLocal[dcItem].prelimPerServerNumberOfSSDWithDedicatedNVMeNeeded * sizingConstraints.coresPerSSDold 
                                                  + dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe1NeededWithoutDedicatedWAL * sizingConstraints.coresPerNVMe1
                                                  + dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe1NeededWithDedicatedWAL * sizingConstraints.coresPerNVMe1
                                                  + dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe3Needed * sizingConstraints.coresPerNVMe3
                                                  + dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe4Needed * sizingConstraints.coresPerNVMe4
                                                  + dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe5Needed * sizingConstraints.coresPerNVMe5
                                                  + dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe7Needed * sizingConstraints.coresPerNVMe7
                                                  + dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe8Needed * sizingConstraints.coresPerNVMe8
                                                )
                                            )
                                          )
      debugMsg(generalValues, localDebugOn, 5, "dcConfigAdjustNumberOfServers", 109, `dcConfigAdjustNumberOfServers 124: [chassisID=${actualChassisID},DC=${dcItem}] localReduceByRatioOfCoresMinRoles=${localReduceByRatioOfCoresMinRoles} = Math.ceil(  dcConfigArrayLocal[dcItem].prelimNumberOfServers=${dcConfigArrayLocal[dcItem].prelimNumberOfServers} / 
      (
          (  (chassisArrayLocal[actualChassisID].maxCpuSockets=${chassisArrayLocal[actualChassisID].maxCpuSockets} * chassisArrayLocal[actualChassisID].maxCpuCores=${chassisArrayLocal[actualChassisID].maxCpuCores}) 
                - dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe6Needed=${dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe6Needed} * sizingConstraints.coresPerNVMe2=${sizingConstraints.coresPerNVMe6}
                    - sizingConstraints.coresPerNodeBase=${sizingConstraints.coresPerNodeBase} - localCoresMinForMinRolesInitiallyAnyServer=${localCoresMinForMinRolesInitiallyAnyServer}
                    - dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe2Needed=${dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe2Needed} * sizingConstraints.coresPerNVMe2=${sizingConstraints.coresPerNVMe2}
          ) /
          ( dcConfigArrayLocal[dcItem].prelimPerServerNumberOfHDDNeeded=${dcConfigArrayLocal[dcItem].prelimPerServerNumberOfHDDNeeded} * sizingConstraints.coresPerHDD=${sizingConstraints.coresPerHDD} 
            + dcConfigArrayLocal[dcItem].prelimPerServerNumberOfSSDWithoutDedicatedNVMeNeeded=${dcConfigArrayLocal[dcItem].prelimPerServerNumberOfSSDWithoutDedicatedNVMeNeeded} * sizingConstraints.coresPerSSDold=${sizingConstraints.coresPerSSDold} 
            + dcConfigArrayLocal[dcItem].prelimPerServerNumberOfSSDWithDedicatedNVMeNeeded=${dcConfigArrayLocal[dcItem].prelimPerServerNumberOfSSDWithDedicatedNVMeNeeded} * sizingConstraints.coresPerSSDold=${sizingConstraints.coresPerSSDold} 
            + dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe1NeededWithoutDedicatedWAL=${dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe1NeededWithoutDedicatedWAL} * sizingConstraints.coresPerNVMe1=${sizingConstraints.coresPerNVMe1}
            + dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe1NeededWithDedicatedWAL=${dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe1NeededWithDedicatedWAL} * sizingConstraints.coresPerNVMe1=${sizingConstraints.coresPerNVMe1}
            + dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe3Needed=${dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe3Needed} * sizingConstraints.coresPerNVMe3=${sizingConstraints.coresPerNVMe3}
            + dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe4Needed=${dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe4Needed} * sizingConstraints.coresPerNVMe4=${sizingConstraints.coresPerNVMe4}
            + dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe5Needed=${dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe5Needed} * sizingConstraints.coresPerNVMe5=${sizingConstraints.coresPerNVMe5}
            + dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe7Needed=${dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe7Needed} * sizingConstraints.coresPerNVMe7=${sizingConstraints.coresPerNVMe7}
            + dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe8Needed=${dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe8Needed} * sizingConstraints.coresPerNVMe8=${sizingConstraints.coresPerNVMe8}
            )
      )
      )`,0,0,0)
      // localReduceByRatioOfCoresMaxRoles => How many of the actual media we need to reduce to if we would have the maximum needed role instances (up to two) on any of the servers in this DC.
      localReduceByRatioOfCoresMaxRoles = Math.ceil(  dcConfigArrayLocal[dcItem].prelimNumberOfServers / 
                                            (
                                                (  (chassisArrayLocal[actualChassisID].maxCpuSockets * chassisArrayLocal[actualChassisID].maxCpuCores) 
                                                      - dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe6Needed * sizingConstraints.coresPerNVMe6
                                                          - sizingConstraints.coresPerNodeBase 
                                                          - localCoresMinForMaxRolesInitiallyAnyServer
                                                          - dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe2Needed * sizingConstraints.coresPerNVMe2
                                                ) /
                                                ( dcConfigArrayLocal[dcItem].prelimPerServerNumberOfHDDNeeded * sizingConstraints.coresPerHDD 
                                                  + dcConfigArrayLocal[dcItem].prelimPerServerNumberOfSSDWithoutDedicatedNVMeNeeded * sizingConstraints.coresPerSSDold 
                                                  + dcConfigArrayLocal[dcItem].prelimPerServerNumberOfSSDWithDedicatedNVMeNeeded * sizingConstraints.coresPerSSDold 
                                                  + dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe1NeededWithoutDedicatedWAL * sizingConstraints.coresPerNVMe1
                                                  + dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe1NeededWithDedicatedWAL * sizingConstraints.coresPerNVMe1
                                                  + dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe3Needed * sizingConstraints.coresPerNVMe3
                                                  + dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe4Needed * sizingConstraints.coresPerNVMe4
                                                  + dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe5Needed * sizingConstraints.coresPerNVMe5
                                                  + dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe7Needed * sizingConstraints.coresPerNVMe7
                                                  + dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe8Needed * sizingConstraints.coresPerNVMe8
                                                )
                                            )
                                          )
      debugMsg(generalValues, localDebugOn, 5, "dcConfigAdjustNumberOfServers", 151, `dcConfigAdjustNumberOfServers 164: [chassisID=${actualChassisID},DC=${dcItem}] localReduceByRatioOfCoresMaxRoles=${localReduceByRatioOfCoresMaxRoles} = Math.ceil(  dcConfigArrayLocal[dcItem].prelimNumberOfServers=${dcConfigArrayLocal[dcItem].prelimNumberOfServers} / 
      (
          (  (chassisArrayLocal[actualChassisID].maxCpuSockets=${chassisArrayLocal[actualChassisID].maxCpuSockets} * chassisArrayLocal[actualChassisID].maxCpuCores=${chassisArrayLocal[actualChassisID].maxCpuCores}) 
                - dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe6Needed=${dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe6Needed} * sizingConstraints.coresPerNVMe2=${sizingConstraints.coresPerNVMe6}
                    - sizingConstraints.coresPerNodeBase=${sizingConstraints.coresPerNodeBase} - localCoresMinForMaxRolesInitiallyAnyServer=${localCoresMinForMaxRolesInitiallyAnyServer}
                    - dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe2Needed=${dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe2Needed} * sizingConstraints.coresPerNVMe2=${sizingConstraints.coresPerNVMe2}
          ) /
          ( dcConfigArrayLocal[dcItem].prelimPerServerNumberOfHDDNeeded=${dcConfigArrayLocal[dcItem].prelimPerServerNumberOfHDDNeeded} * sizingConstraints.coresPerHDD=${sizingConstraints.coresPerHDD} 
            + dcConfigArrayLocal[dcItem].prelimPerServerNumberOfSSDWithoutDedicatedNVMeNeeded=${dcConfigArrayLocal[dcItem].prelimPerServerNumberOfSSDWithoutDedicatedNVMeNeeded} * sizingConstraints.coresPerSSDold=${sizingConstraints.coresPerSSDold} 
            + dcConfigArrayLocal[dcItem].prelimPerServerNumberOfSSDWithDedicatedNVMeNeeded=${dcConfigArrayLocal[dcItem].prelimPerServerNumberOfSSDWithDedicatedNVMeNeeded} * sizingConstraints.coresPerSSDold=${sizingConstraints.coresPerSSDold} 
            + dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe1NeededWithoutDedicatedWAL=${dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe1NeededWithoutDedicatedWAL} * sizingConstraints.coresPerNVMe1=${sizingConstraints.coresPerNVMe1}
            + dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe1NeededWithDedicatedWAL=${dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe1NeededWithDedicatedWAL} * sizingConstraints.coresPerNVMe1=${sizingConstraints.coresPerNVMe1}
            + dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe3Needed=${dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe3Needed} * sizingConstraints.coresPerNVMe3=${sizingConstraints.coresPerNVMe3}
            + dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe4Needed=${dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe4Needed} * sizingConstraints.coresPerNVMe4=${sizingConstraints.coresPerNVMe4}
            + dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe5Needed=${dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe5Needed} * sizingConstraints.coresPerNVMe5=${sizingConstraints.coresPerNVMe5}
            + dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe7Needed=${dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe7Needed} * sizingConstraints.coresPerNVMe7=${sizingConstraints.coresPerNVMe7}
            + dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe8Needed=${dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe8Needed} * sizingConstraints.coresPerNVMe8=${sizingConstraints.coresPerNVMe8}
            )
      )
      )`,0,0,0)
      
      // NEW 2024/11/15 - try to define the reduction by a single media
      //   Any media requiring cores could be removed in order to get to the supportable number of cores. Each device has a different portion that it takes from the overall cores needed per server.
      //   If a media requires 4 cores and it has 6 media in this configuration but the number of supported cores would be 64 with a demand of 160 cores, it could reduce the numnber of cores by reducing a number of media: 160 - 4 * 6 = 160 - 24 = 1136 >> 64 - which would not work.
      //   However, the combination of reducing everything by a single media first (for smaller differences) could lead to success. In a second step, also the portions of possible reductions compared to number of media to reduce further could lead to optimizing the config.
      //   Iteratively then going forward while respecting the minimal media required per node of a certain kind will bring down the number of cores.
      
      
      // Check for the number of media that has the largest number with regards of the number of cores consumed in sum (highest score = highest portion of cores assigned)
       // Media with 0 or 1 count are skipped for score.
      let scoreCoresPerMediaType = ["SSD", "HDD", "NVMe1", "NVMe2", "NVMe3", "NVMe6", "NVMe8"]
      let highScore = 0
      let mediaNumber = 0
      let lowestMinServersMinRoles = 0
      let lowestMinServersMediaTypeMinRoles = 0
      let lowestMinServersMaxRoles = 0
      let lowestMinServersMediaTypeMaxRoles = 0
      
      for (let mediatype = 0; mediatype < scoreCoresPerMediaType.length; mediatype++) {
        //let varString = "localCoresPortion" + scoreCoresPerMediaType[mediatype]
        let coreString = "coresPer" + scoreCoresPerMediaType[mediatype]
        let prelimString = "prelimPerServerNumberOf" + scoreCoresPerMediaType[mediatype] + "Needed"
        let mediaSumString = "numberOf" + scoreCoresPerMediaType[mediatype] + "Needed"
        let prelimMediaSumString = "prelimPerServerNumberOf" + scoreCoresPerMediaType[mediatype] + "Needed"
        debugMsg(generalValues, localDebugOn, 5, "dcConfigAdjustNumberOfServers", 195, `coreString=${coreString}, prelimString=${prelimString}; dcConfigArrayLocal[dcItem].prelimString=${dcConfigArrayLocal[dcItem][prelimString]}, sizingConstraints.coreString=${sizingConstraints[coreString]}`,0,0,0)
        debugMsg(generalValues, localDebugOn, 5, "dcConfigAdjustNumberOfServers", 196, `scoreCoresPerMediaType=${scoreCoresPerMediaType}, mediatype=${mediatype}`,0,0,0)
        scoreCoresPerMediaType[mediatype] = {}
        scoreCoresPerMediaType[mediatype].score = dcConfigArrayLocal[dcItem][prelimString] * sizingConstraints[coreString]
        scoreCoresPerMediaType[mediatype].number = dcConfigArrayLocal[dcItem][prelimString]
        debugMsg(generalValues, localDebugOn, 5, "dcConfigAdjustNumberOfServers", 200, `coreString=${coreString}, prelimString=${prelimString}, scoreCoresPerMediaType[mediatype].score=${scoreCoresPerMediaType[mediatype].score}, scoreCoresPerMediaType[mediatype].number=${scoreCoresPerMediaType[mediatype].number}`,0,0,0)
        if (scoreCoresPerMediaType[mediatype].number > 1) {
          let localAddBackElement = 0
          if (scoreCoresPerMediaType[mediatype].score > highScore){
            highScore = scoreCoresPerMediaType[mediatype].score
            mediaNumber = mediatype
            // Calculate needed elements max for staying within the limits of cores:
            // After all other cores needed by any of the elements of the actual server configuration, except the one we check for, divide the rest of cores by the cores needed for the element.
            // Reduce the number first by all fixed (NVMe2, NVMe6, ...) assignments with minimum deployment per server for equal config of servers but then add the amount back for the actual element.  ===> WHY ?
            // All flexible elements, like NVMe1 or HDD, can be handled with default.
            
            switch (prelimString) {
              case "NVMe2":
              case "NVMe6":
                localAddBackElement = dcConfigArrayLocal[dcItem][prelimString] * sizingConstraints[coreString]
              default:
            }
            let localReduceToMinRoles = // number of media to size the config per server down for the actual media
                                              Math.ceil(( chassisArrayLocal[actualChassisID].maxCpuSockets * chassisArrayLocal[actualChassisID].maxCpuCores 
                                                      - dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe6Needed * sizingConstraints.coresPerNVMe6
                                                      - sizingConstraints.coresPerNodeBase
                                                      - localCoresMinForMinRolesInitiallyAnyServer
                                                      - dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe2Needed * sizingConstraints.coresPerNVMe2
                                                      + localAddBackElement
                                                     
                                                      - dcConfigArrayLocal[dcItem].prelimPerServerNumberOfSSDWithoutDedicatedNVMeNeeded * sizingConstraints.coresPerSSDold
                                                      - dcConfigArrayLocal[dcItem].prelimPerServerNumberOfSSDWithDedicatedNVMeNeeded * sizingConstraints.coresPerSSDold
                                                      - dcConfigArrayLocal[dcItem].prelimPerServerNumberOfHDDNeeded * sizingConstraints.coresPerHDD
                                                      - dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe1NeededWithoutDedicatedWAL * sizingConstraints.coresPerNVMe1
                                                      - dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe1NeededWithDedicatedWAL * sizingConstraints.coresPerNVMe1
                                                      - dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe2Needed * sizingConstraints.coresPerNVMe2
                                                      - dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe3Needed * sizingConstraints.coresPerNVMe3
                                                      - dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe4Needed * sizingConstraints.coresPerNVMe4
                                                      - dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe5Needed * sizingConstraints.coresPerNVMe5
                                                      - dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe7Needed * sizingConstraints.coresPerNVMe7
                                                      - dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe8Needed * sizingConstraints.coresPerNVMe8
                                                      + dcConfigArrayLocal[dcItem][prelimString] * sizingConstraints[coreString]
                                                )/sizingConstraints[coreString]
                                              )

            if (generalValues.globalDebug == true || localDebugOn == true) {
              debugMsg(generalValues, localDebugOn, 5, "dcConfigAdjustNumberOfServers", 241, `localAddBackElement=${localAddBackElement}`,0,0,0)
              debugMsg(generalValues, localDebugOn, 5, "dcConfigAdjustNumberOfServers", 242, `localCoresMinForMinRolesInitiallyAnyServer=${localCoresMinForMinRolesInitiallyAnyServer}`,0,0,0)
              debugMsg(generalValues, localDebugOn, 5, "dcConfigAdjustNumberOfServers", 243, `dcConfigArrayLocal[dcItem].prelimPerServerNumberOfSSDWithoutDedicatedNVMeNeeded=${dcConfigArrayLocal[dcItem].prelimPerServerNumberOfSSDWithoutDedicatedNVMeNeeded} * sizingConstraints.coresPerSSDold=${sizingConstraints.coresPerSSDold}`,0,0,0)
              debugMsg(generalValues, localDebugOn, 5, "dcConfigAdjustNumberOfServers", 244, `dcConfigArrayLocal[dcItem].prelimPerServerNumberOfSSDWithDedicatedNVMeNeeded=${dcConfigArrayLocal[dcItem].prelimPerServerNumberOfSSDWithDedicatedNVMeNeeded} * sizingConstraints.coresPerSSDold=${sizingConstraints.coresPerSSDold}`,0,0,0)
              debugMsg(generalValues, localDebugOn, 5, "dcConfigAdjustNumberOfServers", 245, `dcConfigArrayLocal[dcItem].prelimPerServerNumberOfHDDNeeded=${dcConfigArrayLocal[dcItem].prelimPerServerNumberOfHDDNeeded} * sizingConstraints.coresPerHDD=${sizingConstraints.coresPerHDD}`,0,0,0)
              debugMsg(generalValues, localDebugOn, 5, "dcConfigAdjustNumberOfServers", 246, `dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe1NeededWithoutDedicatedWAL=${dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe1NeededWithoutDedicatedWAL} * sizingConstraints.coresPerNVMe1=${sizingConstraints.coresPerNVMe1}`,0,0,0)
              debugMsg(generalValues, localDebugOn, 5, "dcConfigAdjustNumberOfServers", 247, `dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe1NeededWithDedicatedWAL=${dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe1NeededWithDedicatedWAL} * sizingConstraints.coresPerNVMe1=${sizingConstraints.coresPerNVMe1}`,0,0,0)
              debugMsg(generalValues, localDebugOn, 5, "dcConfigAdjustNumberOfServers", 248, `dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe2Needed=${dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe2Needed} * sizingConstraints.coresPerNVMe2=${sizingConstraints.coresPerNVMe2}`,0,0,0)
              debugMsg(generalValues, localDebugOn, 5, "dcConfigAdjustNumberOfServers", 249, `dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe3Needed=${dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe3Needed} * sizingConstraints.coresPerNVMe3=${sizingConstraints.coresPerNVMe3}`,0,0,0)
              debugMsg(generalValues, localDebugOn, 5, "dcConfigAdjustNumberOfServers", 250, `dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe4Needed=${dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe4Needed} * sizingConstraints.coresPerNVMe4=${sizingConstraints.coresPerNVMe4}`,0,0,0)
              debugMsg(generalValues, localDebugOn, 5, "dcConfigAdjustNumberOfServers", 251, `dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe5Needed=${dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe5Needed} * sizingConstraints.coresPerNVMe5=${sizingConstraints.coresPerNVMe5}`,0,0,0)
              debugMsg(generalValues, localDebugOn, 5, "dcConfigAdjustNumberOfServers", 252, `dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe6Needed=${dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe6Needed} * sizingConstraints.coresPerNVMe6=${sizingConstraints.coresPerNVMe6}`,0,0,0)
              debugMsg(generalValues, localDebugOn, 5, "dcConfigAdjustNumberOfServers", 253, `dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe7Needed=${dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe7Needed} * sizingConstraints.coresPerNVMe7=${sizingConstraints.coresPerNVMe7}`,0,0,0)
              debugMsg(generalValues, localDebugOn, 5, "dcConfigAdjustNumberOfServers", 254, `dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe8Needed=${dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe8Needed} * sizingConstraints.coresPerNVMe8=${sizingConstraints.coresPerNVMe8}`,0,0,0)
              debugMsg(generalValues, localDebugOn, 5, "dcConfigAdjustNumberOfServers", 255, `dcConfigArrayLocal[dcItem][prelimString]=${dcConfigArrayLocal[dcItem][prelimString]}, sizingConstraints[coreString]=${sizingConstraints[coreString]}`,0,0,0)
            }
            // Once we've got the actual number of devices in question per server, calculate the number of servers needed then - based on number of devices needed actually per server multiplied with the number of localReduceToMinRoles
            // This gives us the minimum number of servers based on reducing only this device (no other).
            scoreCoresPerMediaType[mediatype].minNumber = localReduceToMinRoles
            if (lowestMinServersMinRoles < scoreCoresPerMediaType[mediatype].minNumber) {
              lowestMinServersMinRoles = scoreCoresPerMediaType[mediatype].minNumber
              lowestMinServersMediaTypeMinRoles = mediatype
              debugMsg(generalValues, localDebugOn, 5, "dcConfigAdjustNumberOfServers", 263, `media name=${coreString}, lowestMinServersMinRoles=${lowestMinServersMinRoles}, lowestMinServersMediaTypeMinRoles=${lowestMinServersMediaTypeMinRoles}, localReduceToMinRoles=${localReduceToMinRoles}, scoreCoresPerMediaType[mediatype].minNumber=${scoreCoresPerMediaType[mediatype].minNumber}, dcConfigArrayLocal[dcItem][mediaSumString]=${dcConfigArrayLocal[dcItem][mediaSumString]}`,0,0,0)
            }
            else {
              debugMsg(generalValues, localDebugOn, 5, "dcConfigAdjustNumberOfServers", 266, `media name=${coreString}, lowestMinServersMinRoles=${lowestMinServersMinRoles}, lowestMinServersMediaTypeMinRoles=${lowestMinServersMediaTypeMinRoles}, localReduceToMinRoles=${localReduceToMinRoles},  scoreCoresPerMediaType[mediatype].minNumber=${scoreCoresPerMediaType[mediatype].minNumber}, dcConfigArrayLocal[dcItem][mediaSumString]=${dcConfigArrayLocal[dcItem][mediaSumString]}`,0,0,0)
            }
            let localReduceToMaxRoles = // number of servers to size the config per server down for the actual media using max number of roles per server (e.g. MON+RGW if there is one)
                                              Math.ceil(( chassisArrayLocal[actualChassisID].maxCpuSockets * chassisArrayLocal[actualChassisID].maxCpuCores 
                                                      - dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe6Needed * sizingConstraints.coresPerNVMe6
                                                      - sizingConstraints.coresPerNodeBase
                                                      - localCoresMinForMaxRolesInitiallyAnyServer
                                                      - dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe2Needed * sizingConstraints.coresPerNVMe2
                                                      + localAddBackElement
                                                     
                                                      - dcConfigArrayLocal[dcItem].prelimPerServerNumberOfSSDWithoutDedicatedNVMeNeeded * sizingConstraints.coresPerSSDold
                                                      - dcConfigArrayLocal[dcItem].prelimPerServerNumberOfSSDWithDedicatedNVMeNeeded * sizingConstraints.coresPerSSDold
                                                      - dcConfigArrayLocal[dcItem].prelimPerServerNumberOfHDDNeeded * sizingConstraints.coresPerHDD
                                                      - dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe1NeededWithoutDedicatedWAL * sizingConstraints.coresPerNVMe1
                                                      - dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe1NeededWithDedicatedWAL * sizingConstraints.coresPerNVMe1
                                                      - dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe2Needed * sizingConstraints.coresPerNVMe2
                                                      - dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe3Needed * sizingConstraints.coresPerNVMe3
                                                      - dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe4Needed * sizingConstraints.coresPerNVMe4
                                                      - dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe5Needed * sizingConstraints.coresPerNVMe5
                                                      - dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe7Needed * sizingConstraints.coresPerNVMe7
                                                      - dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe8Needed * sizingConstraints.coresPerNVMe8
                                                      + dcConfigArrayLocal[dcItem][prelimString] * sizingConstraints[coreString]
                                                )/sizingConstraints[coreString]
                                              )
            if (generalValues.globalDebug == true || localDebugOn == true) {
              debugMsg(generalValues, localDebugOn, 5, "dcConfigAdjustNumberOfServers", 291, `localAddBackElement=${localAddBackElement}`,0,0,0)
              debugMsg(generalValues, localDebugOn, 5, "dcConfigAdjustNumberOfServers", 292, `localCoresMinForMaxRolesInitiallyAnyServer=${localCoresMinForMaxRolesInitiallyAnyServer}`,0,0,0)
              debugMsg(generalValues, localDebugOn, 5, "dcConfigAdjustNumberOfServers", 293, `dcConfigArrayLocal[dcItem].prelimPerServerNumberOfSSDWithoutDedicatedNVMeNeeded=${dcConfigArrayLocal[dcItem].prelimPerServerNumberOfSSDWithoutDedicatedNVMeNeeded} * sizingConstraints.coresPerSSDold=${sizingConstraints.coresPerSSDold}`,0,0,0)
              debugMsg(generalValues, localDebugOn, 5, "dcConfigAdjustNumberOfServers", 294, `dcConfigArrayLocal[dcItem].prelimPerServerNumberOfSSDWithDedicatedNVMeNeeded=${dcConfigArrayLocal[dcItem].prelimPerServerNumberOfSSDWithDedicatedNVMeNeeded} * sizingConstraints.coresPerSSDold=${sizingConstraints.coresPerSSDold}`,0,0,0)
              debugMsg(generalValues, localDebugOn, 5, "dcConfigAdjustNumberOfServers", 295, `dcConfigArrayLocal[dcItem].prelimPerServerNumberOfHDDNeeded=${dcConfigArrayLocal[dcItem].prelimPerServerNumberOfHDDNeeded} * sizingConstraints.coresPerHDD=${sizingConstraints.coresPerHDD}`,0,0,0)
              debugMsg(generalValues, localDebugOn, 5, "dcConfigAdjustNumberOfServers", 296, `dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe1NeededWithoutDedicatedWAL=${dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe1NeededWithoutDedicatedWAL} * sizingConstraints.coresPerNVMe1=${sizingConstraints.coresPerNVMe1}`,0,0,0)
              debugMsg(generalValues, localDebugOn, 5, "dcConfigAdjustNumberOfServers", 297, `dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe1NeededWithDedicatedWAL=${dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe1NeededWithDedicatedWAL} * sizingConstraints.coresPerNVMe1=${sizingConstraints.coresPerNVMe1}`,0,0,0)
              debugMsg(generalValues, localDebugOn, 5, "dcConfigAdjustNumberOfServers", 298, `dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe2Needed=${dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe2Needed} * sizingConstraints.coresPerNVMe2=${sizingConstraints.coresPerNVMe2}`,0,0,0)
              debugMsg(generalValues, localDebugOn, 5, "dcConfigAdjustNumberOfServers", 299, `dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe3Needed=${dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe3Needed} * sizingConstraints.coresPerNVMe3=${sizingConstraints.coresPerNVMe3}`,0,0,0)
              debugMsg(generalValues, localDebugOn, 5, "dcConfigAdjustNumberOfServers", 300, `dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe4Needed=${dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe4Needed} * sizingConstraints.coresPerNVMe4=${sizingConstraints.coresPerNVMe4}`,0,0,0)
              debugMsg(generalValues, localDebugOn, 5, "dcConfigAdjustNumberOfServers", 301, `dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe5Needed=${dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe5Needed} * sizingConstraints.coresPerNVMe5=${sizingConstraints.coresPerNVMe5}`,0,0,0)
              debugMsg(generalValues, localDebugOn, 5, "dcConfigAdjustNumberOfServers", 302, `dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe6Needed=${dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe6Needed} * sizingConstraints.coresPerNVMe6=${sizingConstraints.coresPerNVMe6}`,0,0,0)
              debugMsg(generalValues, localDebugOn, 5, "dcConfigAdjustNumberOfServers", 303, `dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe7Needed=${dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe7Needed} * sizingConstraints.coresPerNVMe7=${sizingConstraints.coresPerNVMe7}`,0,0,0)
              debugMsg(generalValues, localDebugOn, 5, "dcConfigAdjustNumberOfServers", 304, `dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe8Needed=${dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe8Needed} * sizingConstraints.coresPerNVMe8=${sizingConstraints.coresPerNVMe8}`,0,0,0)
              debugMsg(generalValues, localDebugOn, 5, "dcConfigAdjustNumberOfServers", 305, `dcConfigArrayLocal[dcItem][prelimString]=${dcConfigArrayLocal[dcItem][prelimString]}, sizingConstraints[coreString]=${sizingConstraints[coreString]}`,0,0,0)
            }
            // Once we've got the actual number of devices in question per server, calculate the number of servers needed then
            // This gives us the minimum number of servers based on reducing only this device (no other).
            scoreCoresPerMediaType[mediatype].minNumber = localReduceToMaxRoles
            debugMsg(generalValues, localDebugOn, 5, "dcConfigAdjustNumberOfServers", 310, `scoreCoresPerMediaType[mediatype].minNumber=${scoreCoresPerMediaType[mediatype].minNumber}   = Math.ceil(dcConfigArrayLocal[dcItem][prelimMediaSumString=${prelimMediaSumString}]=${dcConfigArrayLocal[dcItem][prelimMediaSumString]} * localReduceToMaxRoles=${localReduceToMaxRoles})`,0,0,0)
            if (lowestMinServersMaxRoles < scoreCoresPerMediaType[mediatype].minNumber) {
              lowestMinServersMaxRoles = scoreCoresPerMediaType[mediatype].minNumber
              lowestMinServersMediaTypeMaxRoles = mediatype
              debugMsg(generalValues, localDebugOn, 5, "dcConfigAdjustNumberOfServers", 314, `lowestMinServersMaxRoles=${lowestMinServersMaxRoles}, lowestMinServersMediaTypeMinRoles=${lowestMinServersMediaTypeMinRoles}, localReduceToMaxRoles=${localReduceToMaxRoles}, scoreCoresPerMediaType[mediatype].minNumber=${scoreCoresPerMediaType[mediatype].minNumber}, dcConfigArrayLocal[dcItem][mediaSumString]=${dcConfigArrayLocal[dcItem][mediaSumString]}`,0,0,0)
            }
            else {
              debugMsg(generalValues, localDebugOn, 5, "dcConfigAdjustNumberOfServers", 317, `media name=${coreString}, lowestMinServersMaxRoles=${lowestMinServersMaxRoles}, lowestMinServersMediaTypeMaxRoles=${lowestMinServersMediaTypeMaxRoles}, localReduceToMaxRoles=${localReduceToMinRoles},  scoreCoresPerMediaType[mediatype].minNumber=${scoreCoresPerMediaType[mediatype].minNumber}, dcConfigArrayLocal[dcItem][mediaSumString]=${dcConfigArrayLocal[dcItem][mediaSumString]}`,0,0,0)
            }
            
          }
        }
        else {
          scoreCoresPerMediaType[mediatype].score = 0
          debugMsg(generalValues, localDebugOn, 5, "dcConfigAdjustNumberOfServers", 324, `media name=${coreString}, score=0`,0,0,0)
        }
      }
      debugMsg(generalValues, localDebugOn, 5, "dcConfigAdjustNumberOfServers", 327, `lowestMinServersMinRoles=${lowestMinServersMinRoles}, lowestMinServersMediaTypeMinRoles=${lowestMinServersMediaTypeMinRoles}; lowestMinServersMaxRoles=${lowestMinServersMaxRoles}, lowestMinServersMediaTypeMaxRoles=${lowestMinServersMediaTypeMaxRoles}, dcConfigArrayLocal[dcItem].numberOfNeededMonInstances=${dcConfigArrayLocal[dcItem].numberOfNeededMonInstances}`,0,0,0)
      
      //  # We simply reduce the number of roles ___ BUT: WE NEED TO CHECK THE NUMBER OF SERVERS THEN needed
      if (localMinScaleOutRolesPerServer == 2) {
        // skip this section since we need 2 scale-out role instances per server
        localReducedByNumberOfRoles = 999999
      }
      else {
        localReducedByNumberOfRoles = Math.ceil(dcConfigArrayLocal[dcItem].prelimNumberOfServers / (((chassisArrayLocal[actualChassisID].maxCpuSockets * chassisArrayLocal[actualChassisID].maxCpuCores)
                                                                                                   - dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe6Needed * sizingConstraints.coresPerNVMe6
                                                                                                   - sizingConstraints.coresPerNodeBase
                                                                                                   - localCoresMinForRolesInitiallyAnyServer
                                                                                                   - dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe2Needed * sizingConstraints.coresPerNVMe2
                                                                                                  ) / 
                                                                                                  (dcConfigArrayLocal[dcItem].prelimPerServerNumberOfHDDNeeded * sizingConstraints.coresPerHDD
                                                                                                   + dcConfigArrayLocal[dcItem].prelimPerServerNumberOfSSDWithoutDedicatedNVMeNeeded * sizingConstraints.coresPerSSDold
                                                                                                   + dcConfigArrayLocal[dcItem].prelimPerServerNumberOfSSDWithDedicatedNVMeNeeded * sizingConstraints.coresPerSSDold
                                                                                                   + dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe1NeededWithoutDedicatedWAL * sizingConstraints.coresPerNVMe1
                                                                                                   + dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe1NeededWithDedicatedWAL * sizingConstraints.coresPerNVMe1
                                                                                                   + dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe3Needed * sizingConstraints.coresPerNVMe3
                                                                                                   + dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe4Needed * sizingConstraints.coresPerNVMe4
                                                                                                   + dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe5Needed * sizingConstraints.coresPerNVMe5
                                                                                                   + dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe7Needed * sizingConstraints.coresPerNVMe7
                                                                                                   + dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe8Needed * sizingConstraints.coresPerNVMe8
                                                                                                  )
                                                                                                 )
                                          )
        debugMsg(generalValues, localDebugOn, 5, "dcConfigAdjustNumberOfServers", 354, `dcConfigAdjustNumberOfServers() 354: [chassisID=${actualChassisID},DC=${dcItem}] localReducedByNumberOfRoles=${localReducedByNumberOfRoles} = Math.ceil(dcConfigArrayLocal[dcItem].prelimNumberOfServers=${dcConfigArrayLocal[dcItem].prelimNumberOfServers} / (((chassisArrayLocal[actualChassisID].maxCpuSockets=${chassisArrayLocal[actualChassisID].maxCpuSockets} * chassisArrayLocal[actualChassisID].maxCpuCores=${chassisArrayLocal[actualChassisID].maxCpuCores})
        - dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe6Needed=${dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe6Needed} * sizingConstraints.coresPerNVMe6=${sizingConstraints.coresPerNVMe6}
        - sizingConstraints.coresPerNodeBase=${sizingConstraints.coresPerNodeBase} - localCoresMinForRolesInitiallyAnyServer=${localCoresMinForRolesInitiallyAnyServer}
        - dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe2Needed=${dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe2Needed} * sizingConstraints.coresPerNVMe2=${sizingConstraints.coresPerNVMe2}
        )   / 
        (  dcConfigArrayLocal[dcItem].prelimPerServerNumberOfHDDNeeded=${dcConfigArrayLocal[dcItem].prelimPerServerNumberOfHDDNeeded} * sizingConstraints.coresPerHDD=${sizingConstraints.coresPerHDD}
        +dcConfigArrayLocal[dcItem].prelimPerServerNumberOfSSDWithoutDedicatedNVMeNeeded=${dcConfigArrayLocal[dcItem].prelimPerServerNumberOfSSDWithoutDedicatedNVMeNeeded} * sizingConstraints.coresPerSSDold=${sizingConstraints.coresPerSSDold}
        +dcConfigArrayLocal[dcItem].prelimPerServerNumberOfSSDWithDedicatedNVMeNeeded=${dcConfigArrayLocal[dcItem].prelimPerServerNumberOfSSDWithDedicatedNVMeNeeded} * sizingConstraints.coresPerSSDold=${sizingConstraints.coresPerSSDold}
        +dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe1NeededWithoutDedicatedWAL=${dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe1NeededWithoutDedicatedWAL} * sizingConstraints.coresPerNVMe1=${sizingConstraints.coresPerNVMe1}
        +dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe1NeededWithDedicatedWAL=${dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe1NeededWithDedicatedWAL} * sizingConstraints.coresPerNVMe1=${sizingConstraints.coresPerNVMe1}
        +dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe3Needed=${dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe3Needed} * sizingConstraints.coresPerNVMe3=${sizingConstraints.coresPerNVMe3}
        +dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe4Needed=${dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe4Needed} * sizingConstraints.coresPerNVMe4=${sizingConstraints.coresPerNVMe4}
        +dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe5Needed=${dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe5Needed} * sizingConstraints.coresPerNVMe5=${sizingConstraints.coresPerNVMe5}
        +dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe7Needed=${dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe7Needed} * sizingConstraints.coresPerNVMe7=${sizingConstraints.coresPerNVMe7}
        +dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe8Needed=${dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe8Needed} * sizingConstraints.coresPerNVMe8=${sizingConstraints.coresPerNVMe8}
        )  
        ))`,0,0,0)
        // take the min of all above => this is the number of servers we will correct the cores per server
        ///// CAN WE USE those *minRoles and *maxRoles values out of the box ? Shouldn't we check whether this is possible at all at the end ? At Least, for any minRoles, the number of servers for this minRoles layout needs to be paried with 
        /////    the mem as well - the same for maxRoles, since we need to ensure to still provide enough servers in those cases. The limits would be for those minRoles and mnaxRoles the min number of severs required in the one or
        /////    the other scenario.
        localNewNumberOfServersByReducingCores = Math.min(
                                                          Math.min(
                                                            Math.max(localReduceByRatioOfCoresMinRoles,localMinServersForMinRolesInitiallyAnyServer,localMinServersForRoles), 
                                                            Math.max(localReduceByRatioOfCoresMaxRoles,localMinServersForMaxRolesInitiallyAnyServer,localMinServersForRoles)
                                                          ),
                                                          /*localReduceNumberOfNVMe3ForSSD, localReduceNumberOfNVMe8ForNVMe1,*/ 
                                                          Math.max(localReducedByNumberOfRoles,localMinServersForRoles), 
                                                          Math.min(
                                                            Math.max(lowestMinServersMinRoles,localMinServersForMinRolesInitiallyAnyServer), 
                                                            Math.max(lowestMinServersMaxRoles,localMinServersForMaxRolesInitiallyAnyServer,localMinServersForRoles)
                                                          )
                                                        )
        debugMsg(generalValues, localDebugOn, 5, "dcConfigAdjustNumberOfServers", 387, `dcConfigAdjustNumberOfServers() 380a: localNewNumberOfServersByReducingCores=${localNewNumberOfServersByReducingCores} = Math.min(
          Math.min(
            Math.max(localReduceByRatioOfCoresMinRoles=${localReduceByRatioOfCoresMinRoles},localMinServersForMinRolesInitiallyAnyServer=${localMinServersForMinRolesInitiallyAnyServer},localMinServersForRoles=${localMinServersForRoles}), 
            Math.max(localReduceByRatioOfCoresMaxRoles=${localReduceByRatioOfCoresMaxRoles},localMinServersForMaxRolesInitiallyAnyServer=${localMinServersForMaxRolesInitiallyAnyServer},localMinServersForRoles=${localMinServersForRoles})
          ),
          /*localReduceNumberOfNVMe3ForSSD, localReduceNumberOfNVMe8ForNVMe1,*/ 
          Math.max(localReducedByNumberOfRoles=${localReducedByNumberOfRoles},localMinServersForRoles=${localMinServersForRoles}), 
          Math.min(
            Math.max(lowestMinServersMinRoles=${lowestMinServersMinRoles},localMinServersForMinRolesInitiallyAnyServer=${localMinServersForMinRolesInitiallyAnyServer},localMinServersForRoles=${localMinServersForRoles}), 
            Math.max(lowestMinServersMaxRoles=${lowestMinServersMaxRoles},localMinServersForMaxRolesInitiallyAnyServer=${localMinServersForMaxRolesInitiallyAnyServer},localMinServersForRoles=${localMinServersForRoles})
          )
        )`,0,0,0)
      }
    }
    else {
      localNewNumberOfServersByReducingCores = Math.max(dcConfigArrayLocal[dcItem].prelimNumberOfServers,localMinServersForRoles)
      debugMsg(generalValues, localDebugOn, 5, "dcConfigAdjustNumberOfServers", 403, `localNewNumberOfServersByReducingCores=Math.max(${localNewNumberOfServersByReducingCores},localMinServersForRoles=${localMinServersForRoles})`,0,0,0)
    }
    debugMsg(generalValues, localDebugOn, 5, "dcConfigAdjustNumberOfServers", 405, `[chassisID=${actualChassisID},DC=${dcItem}]  localNewNumberOfServersByReducingCores=${localNewNumberOfServersByReducingCores}`,0,0,0)
    // End of first entries to max from
    // Second to max from:
    if (dcConfigArrayLocal[dcItem].prelimPerServerMemNeededPerServer > chassisArrayLocal[actualChassisID].maxMemGb) {
      // # If memory max is smaller than required:
      // min(/* from all below */)
      
      let localReduceMemByRatioMinRoles = 0
      let localReduceMemByRatioMaxRoles = 0
      let localReduceMemByRole = 0
      // If cores max in server are fewer than needed:
      let localReduceByRatioOfCoresMinRoles = 0
      let localReduceByRatioOfCoresMaxRoles = 0
      let localReduceNumberOfNVMe3ForSSD = 0
      let localReduceNumberOfNVMe8ForNVMe1 = 0
      let localReducedByNumberOfRoles = 0
      
      let localMinScaleOutRolesPerServer = 0
      // determine number of scale-out instances and exclusive instances
      let localMemScaleOutRoles = 0
      let localMemExclusiveRoles = 0
      localMemScaleOutRoles = dcConfigArrayLocal[dcItem].numberOfLocalScaleoutInstances * Math.max(sizingConstraints.memPerMGRInstance,sizingConstraints.memPerRGWInstance,sizingConstraints.memPerMDSInstance) + dcConfigArrayLocal[dcItem].numberOfNeededMonInstances * sizingConstraints.memPerMONInstance
      localMemExclusiveRoles = dcConfigArrayLocal[dcItem].numberOfLocalSpecialInstances * Math.max(sizingConstraints.memPeriSCSIInstance,sizingConstraints.memPerRBDMirrorInstance)
      let localMemMaxAllPerExclusiveInstance = Math.max(sizingConstraints.memPeriSCSIInstance,sizingConstraints.memPerRBDMirrorInstance)
      let localMemMaxAllPerScaleOutInstance = Math.max(sizingConstraints.memPerMGRInstance,sizingConstraints.memPerRGWInstance,sizingConstraints.memPerMDSInstance,sizingConstraints.memPerMONInstance) 
      // RFE: might be improved to really use tha ctual configuration of the workloads to pick the best h/w config and not pick more than needed for minimum - this actually assumes that there are always 2nd scale-out instances
      let localMemMinAllPerScaleOutTwoInstances = Math.max(sizingConstraints.memPerMGRInstance,sizingConstraints.memPerRGWInstance,sizingConstraints.memPerMDSInstance) // MONs are no secondary instances 
      //let localMinServersForRoles = dcConfigArrayLocal[dcItem].numberOfLocalSpecialInstances + Math.max(Math.ceil((dcConfigArrayLocal[dcItem].numberOfLocalScaleoutInstances+dcConfigArrayLocal[dcItem].numberOfNeededMonInstances)/2),dcConfigArrayLocal[dcItem].numberOfNeededMonInstances)
      debugMsg(generalValues, localDebugOn, 5, "dcConfigAdjustNumberOfServers", 433, `localMinServersForRoles=${localMinServersForRoles} dcConfigArrayLocal[dcItem].numberOfLocalSpecialInstances=${dcConfigArrayLocal[dcItem].numberOfLocalSpecialInstances} + Math.max(Math.ceil((dcConfigArrayLocal[dcItem].numberOfLocalScaleoutInstances=${dcConfigArrayLocal[dcItem].numberOfLocalScaleoutInstances}+dcConfigArrayLocal[dcItem].numberOfNeededMonInstances=${dcConfigArrayLocal[dcItem].numberOfNeededMonInstances})/2),dcConfigArrayLocal[dcItem].numberOfNeededMonInstances=${dcConfigArrayLocal[dcItem].numberOfNeededMonInstances})`,0,0,0)
      //let localMinMemReducableAgnostic = Math.min(Math.max(sizingConstraints.memPerMGRInstance,sizingConstraints.memPerRGWInstance,sizingConstraints.memPerMDSInstance, sizingConstraints.memPerMONInstance), Math.max(sizingConstraints.memPeriSCSIInstance,sizingConstraints.memPerRBDMirrorInstance))
      let localMemMinForRolesInitiallyAnyServer = 0  // this is the actual minimum number of cores that will be needed to run the role instances on any server (all servers are equeal in this DC)
      ///// ???? REVISIT 1) localMinServersForRoles in all as min max , 2) the following calculation (and also for the one about cores) doesn't make sense at all)
      // check feasibility of the number of servers proposed regarding the role instances we need
      if (localMinServersForRoles <= dcConfigArrayLocal[dcItem].prelimNumberOfServers) {
        // ok - can place the roles
        debugMsg(generalValues, localDebugOn, 5, "dcConfigAdjustNumberOfServers", 440, `ok - localMinServersForRoles=${localMinServersForRoles}, dcConfigArrayLocal[dcItem].prelimNumberOfServers=${dcConfigArrayLocal[dcItem].prelimNumberOfServers}`,0,0,0)
      }
      else {
        displayMsg(document, "dcConfigAdjustNumberOfServers", 465, "error", "unable to place all roles to preliminary number of servers already - number of servers must be increased",0,0,0)
        /// MUST ADJUST PRELIM #servers
        dcConfigArrayLocal[dcItem].prelimNumberOfServers = localMinServersForRoles
      }
      debugMsg(generalValues, localDebugOn, 5, "dcConfigAdjustNumberOfServers", 447, `dcConfigArrayLocal[dcItem].prelimNumberOfServers=${dcConfigArrayLocal[dcItem].prelimNumberOfServers}`,0,0,0)
      // Figure out the minium number of cores that we'd need to place the needed instances on any server
      if ((dcConfigArrayLocal[dcItem].prelimNumberOfServers - localMemExclusiveRoles) <= localMemScaleOutRoles) {
        // there would be enough room to store each scale-out role to a node exclusively
        let localMinRolesPerServer = 1
        localMemMinForRolesInitiallyAnyServer = Math.max(localMemMaxAllPerExclusiveInstance,localMemMaxAllPerScaleOutInstance)
      }
      else {
        let localMinScaleOutRolesPerServer = 2
        localMemMinForRolesInitiallyAnyServer = Math.max(localMemMaxAllPerExclusiveInstance,localMemMaxAllPerScaleOutInstance+localMemMinAllPerScaleOutTwoInstances)
      }
      let localMemMinForMinRolesInitiallyAnyServer = Math.max(localMemMaxAllPerExclusiveInstance,localMemMaxAllPerScaleOutInstance)
      let localMinServersForMinRolesInitiallyAnyServer = dcConfigArrayLocal[dcItem].numberOfLocalSpecialInstances + dcConfigArrayLocal[dcItem].numberOfLocalScaleoutInstances + dcConfigArrayLocal[dcItem].numberOfNeededMonInstances
      let localMemMinForMaxRolesInitiallyAnyServer = Math.max(localMemMaxAllPerExclusiveInstance,localMemMaxAllPerScaleOutInstance+localMemMinAllPerScaleOutTwoInstances)
      let localMinServersForMaxRolesInitiallyAnyServer = dcConfigArrayLocal[dcItem].numberOfLocalSpecialInstances + Math.ceil(Math.max((dcConfigArrayLocal[dcItem].numberOfLocalScaleoutInstances + dcConfigArrayLocal[dcItem].numberOfNeededMonInstances)/2,dcConfigArrayLocal[dcItem].numberOfNeededMonInstances))
      
      // # First: try to reduce the number of servers by taking the ratio of memory needed to memory provided in a server.
      // Check for the number of media that has the largest number with regards of the number of cores consumed in sum (highest score = highest portion of cores assigned)
      // Media with 0 or 1 count are skipped for score.
      let scoreMemPerMediaType = ["SSD", "HDD", "NVMe1", "NVMe2", "NVMe3", "NVMe6", "NVMe8"]
      let highScore = 0
      let mediaNumber = 0
      let lowestMinServersMinRoles = 0
      let lowestMinServersMediaTypeMinRoles = 0
      let lowestMinServersMaxRoles = 0
      let lowestMinServersMediaTypeMaxRoles = 0
        
      for (let mediatype = 0; mediatype < scoreMemPerMediaType.length; mediatype++) {
        //let varString = "localMemPortion" + scoreMemPerMediaType[mediatype]
        let memString = "memInGBPer" + scoreMemPerMediaType[mediatype]
        let prelimString = "prelimPerServerNumberOf" + scoreMemPerMediaType[mediatype] + "Needed"
        let mediaSumString = "numberOf" + scoreMemPerMediaType[mediatype] + "Needed"
        let prelimMediaSumString = "prelimPerServerNumberOf" + scoreMemPerMediaType[mediatype] + "Needed"
        debugMsg(generalValues, localDebugOn, 5, "dcConfigAdjustNumberOfServers", 480, `memString=${memString}, prelimString=${prelimString}; dcConfigArrayLocal[dcItem].prelimString=${dcConfigArrayLocal[dcItem][prelimString]}, sizingConstraints.memString=${sizingConstraints[memString]}`,0,0,0)
        debugMsg(generalValues, localDebugOn, 5, "dcConfigAdjustNumberOfServers", 481, `scoreMemPerMediaType=${scoreMemPerMediaType}, mediatype=${mediatype}`,0,0,0)
        scoreMemPerMediaType[mediatype] = {}
        scoreMemPerMediaType[mediatype].score = dcConfigArrayLocal[dcItem][prelimString] * sizingConstraints[memString]
        scoreMemPerMediaType[mediatype].number = dcConfigArrayLocal[dcItem][prelimString]
        debugMsg(generalValues, localDebugOn, 5, "dcConfigAdjustNumberOfServers", 485, `memString=${memString}, prelimString=${prelimString}, scoreMemPerMediaType[mediatype].score=${scoreMemPerMediaType[mediatype].score}, scoreMemPerMediaType[mediatype].number=${scoreMemPerMediaType[mediatype].number}`,0,0,0)
        if (scoreMemPerMediaType[mediatype].number > 1) {
          let localAddBackElement = 0
          if (scoreMemPerMediaType[mediatype].score > highScore){
            highScore = scoreMemPerMediaType[mediatype].score
            mediaNumber = mediatype
            // Calculate needed elements max for staying within the limits of cores:
            // After all other cores needed by any of the elements of the actual server configuration, except the one we check for, divide the rest of cores by the cores needed for the element.
            // Reduce the number first by all fixed (NVMe2, NVMe6, ...) assignments with minimum deployment per server for equal config of servers but then add the amount back for the actual element.
            // All flexible elements, like NVMe1 or HDD, can be handled with default.
            switch (prelimString) {
              case "NVMe2":
              case "NVMe6":
                localAddBackElement = dcConfigArrayLocal[dcItem][prelimString] * sizingConstraints[memString]
              default:
            }
            let localReduceToMinRoles = // number of media to size the config per server down for the actual media
                                              Math.ceil(( chassisArrayLocal[actualChassisID].maxMemGb 
                                                      - dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe6Needed * sizingConstraints.memInGBPerNVMe6
                                                      - sizingConstraints.memPerNodeBase
                                                      - localMemMinForMinRolesInitiallyAnyServer
                                                      - dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe2Needed * sizingConstraints.memInGBPerNVMe2
                                                      + localAddBackElement
                                                      - dcConfigArrayLocal[dcItem].prelimPerServerNumberOfSSDWithoutDedicatedNVMeNeeded * sizingConstraints.memInGBPerSSD
                                                      - dcConfigArrayLocal[dcItem].prelimPerServerNumberOfSSDWithDedicatedNVMeNeeded * sizingConstraints.memInGBPerSSD
                                                      - dcConfigArrayLocal[dcItem].prelimPerServerNumberOfHDDNeeded * sizingConstraints.memInGBPerHDD
                                                      - dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe1NeededWithoutDedicatedWAL * sizingConstraints.memInGBPerNVMe1
                                                      - dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe1NeededWithDedicatedWAL * sizingConstraints.memInGBPerNVMe1
                                                      - dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe2Needed * sizingConstraints.memInGBPerNVMe2
                                                      - dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe3Needed * sizingConstraints.memInGBPerNVMe3
                                                      - dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe4Needed * sizingConstraints.memInGBPerNVMe4
                                                      - dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe5Needed * sizingConstraints.memInGBPerNVMe5
                                                      - dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe7Needed * sizingConstraints.memInGBPerNVMe7
                                                      - dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe8Needed * sizingConstraints.memInGBPerNVMe8
                                                      + dcConfigArrayLocal[dcItem][prelimString] * sizingConstraints[memString]
                                                )/sizingConstraints[memString]
                                              )
            if (generalValues.globalDebug == true || localDebugOn == true) {
              debugMsg(generalValues, localDebugOn, 5, "dcConfigAdjustNumberOfServers", 523, `localAddBackElement=${localAddBackElement}`,0,0,0)
              debugMsg(generalValues, localDebugOn, 5, "dcConfigAdjustNumberOfServers", 524, `localMemMinForMinRolesInitiallyAnyServer=${localMemMinForMinRolesInitiallyAnyServer}`,0,0,0)
              debugMsg(generalValues, localDebugOn, 5, "dcConfigAdjustNumberOfServers", 525, `dcConfigArrayLocal[dcItem].prelimPerServerNumberOfSSDWithoutDedicatedNVMeNeeded=${dcConfigArrayLocal[dcItem].prelimPerServerNumberOfSSDWithoutDedicatedNVMeNeeded} * sizingConstraints.memInGBPerSSD=${sizingConstraints.memInGBPerSSD}`,0,0,0)
              debugMsg(generalValues, localDebugOn, 5, "dcConfigAdjustNumberOfServers", 526, `dcConfigArrayLocal[dcItem].prelimPerServerNumberOfSSDWithDedicatedNVMeNeeded=${dcConfigArrayLocal[dcItem].prelimPerServerNumberOfSSDWithDedicatedNVMeNeeded} * sizingConstraints.memInGBPerSSD=${sizingConstraints.memInGBPerSSD}`,0,0,0)
              debugMsg(generalValues, localDebugOn, 5, "dcConfigAdjustNumberOfServers", 527, `dcConfigArrayLocal[dcItem].prelimPerServerNumberOfHDDNeeded=${dcConfigArrayLocal[dcItem].prelimPerServerNumberOfHDDNeeded} * sizingConstraints.memInGBPerHDD=${sizingConstraints.memInGBPerHDD}`,0,0,0)
              debugMsg(generalValues, localDebugOn, 5, "dcConfigAdjustNumberOfServers", 528, `dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe1NeededWithoutDedicatedWAL=${dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe1NeededWithoutDedicatedWAL} * sizingConstraints.memInGBPerNVMe1=${sizingConstraints.memInGBPerNVMe1}`,0,0,0)
              debugMsg(generalValues, localDebugOn, 5, "dcConfigAdjustNumberOfServers", 529, `dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe1NeededWithDedicatedWAL=${dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe1NeededWithDedicatedWAL} * sizingConstraints.memInGBPerNVMe1=${sizingConstraints.memInGBPerNVMe1}`,0,0,0)
              debugMsg(generalValues, localDebugOn, 5, "dcConfigAdjustNumberOfServers", 530, `dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe2Needed=${dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe2Needed} * sizingConstraints.memInGBPerNVMe2=${sizingConstraints.memInGBPerNVMe2}`,0,0,0)
              debugMsg(generalValues, localDebugOn, 5, "dcConfigAdjustNumberOfServers", 531, `dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe3Needed=${dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe3Needed} * sizingConstraints.memInGBPerNVMe3=${sizingConstraints.memInGBPerNVMe3}`,0,0,0)
              debugMsg(generalValues, localDebugOn, 5, "dcConfigAdjustNumberOfServers", 532, `dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe4Needed=${dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe4Needed} * sizingConstraints.memInGBPerNVMe4=${sizingConstraints.memInGBPerNVMe4}`,0,0,0)
              debugMsg(generalValues, localDebugOn, 5, "dcConfigAdjustNumberOfServers", 533, `dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe5Needed=${dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe5Needed} * sizingConstraints.memInGBPerNVMe5=${sizingConstraints.memInGBPerNVMe5}`,0,0,0)
              debugMsg(generalValues, localDebugOn, 5, "dcConfigAdjustNumberOfServers", 534, `dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe6Needed=${dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe6Needed} * sizingConstraints.memInGBPerNVMe6=${sizingConstraints.memInGBPerNVMe6}`,0,0,0)
              debugMsg(generalValues, localDebugOn, 5, "dcConfigAdjustNumberOfServers", 535, `dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe7Needed=${dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe7Needed} * sizingConstraints.memInGBPerNVMe7=${sizingConstraints.memInGBPerNVMe7}`,0,0,0)
              debugMsg(generalValues, localDebugOn, 5, "dcConfigAdjustNumberOfServers", 536, `dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe8Needed=${dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe8Needed} * sizingConstraints.memInGBPerNVMe8=${sizingConstraints.memInGBPerNVMe8}`,0,0,0)
              debugMsg(generalValues, localDebugOn, 5, "dcConfigAdjustNumberOfServers", 537, `dcConfigArrayLocal[dcItem][prelimString]=${dcConfigArrayLocal[dcItem][prelimString]}, sizingConstraints[memString]=${sizingConstraints[memString]}`,0,0,0)
            }
            // Once we've got the actual number of devices in question per server, calculate the number of servers needed then 
            // This gives us the minimum number of servers based on reducing only this device (no other).
            scoreMemPerMediaType[mediatype].minNumber = /*Math.ceil(dcConfigArrayLocal[dcItem][prelimMediaSumString] * */ localReduceToMinRoles/*)*/
            if (lowestMinServersMinRoles < scoreMemPerMediaType[mediatype].minNumber) {
              lowestMinServersMinRoles = scoreMemPerMediaType[mediatype].minNumber
              lowestMinServersMediaTypeMinRoles = mediatype
              debugMsg(generalValues, localDebugOn, 5, "dcConfigAdjustNumberOfServers", 545, `media name=${memString}, lowestMinServersMinRoles=${lowestMinServersMinRoles}, lowestMinServersMediaTypeMinRoles=${lowestMinServersMediaTypeMinRoles}, localReduceToMinRoles=${localReduceToMinRoles}, scoreMemPerMediaType[mediatype].minNumber=${scoreMemPerMediaType[mediatype].minNumber}, dcConfigArrayLocal[dcItem][mediaSumString]=${dcConfigArrayLocal[dcItem][mediaSumString]}`,0,0,0)
            }
            else {
              debugMsg(generalValues, localDebugOn, 5, "dcConfigAdjustNumberOfServers", 548, `media name=${memString}, lowestMinServersMinRoles=${lowestMinServersMinRoles}, lowestMinServersMediaTypeMinRoles=${lowestMinServersMediaTypeMinRoles}, localReduceToMinRoles=${localReduceToMinRoles},  scoreMemPerMediaType[mediatype].minNumber=${scoreMemPerMediaType[mediatype].minNumber}, dcConfigArrayLocal[dcItem][mediaSumString]=${dcConfigArrayLocal[dcItem][mediaSumString]}`,0,0,0)
            }
           
            let localReduceToMaxRoles = // number of media to size the config per server down for the actual media
            Math.ceil(( chassisArrayLocal[actualChassisID].maxMemGb 
                    - dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe6Needed * sizingConstraints.memInGBPerNVMe6
                    - sizingConstraints.memPerNodeBase
                    - localMemMinForMaxRolesInitiallyAnyServer
                    - dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe2Needed * sizingConstraints.memInGBPerNVMe2
                    + localAddBackElement
                    - dcConfigArrayLocal[dcItem].prelimPerServerNumberOfSSDWithoutDedicatedNVMeNeeded * sizingConstraints.memInGBPerSSD
                    - dcConfigArrayLocal[dcItem].prelimPerServerNumberOfSSDWithDedicatedNVMeNeeded * sizingConstraints.memInGBPerSSD
                    - dcConfigArrayLocal[dcItem].prelimPerServerNumberOfHDDNeeded * sizingConstraints.memInGBPerHDD
                    - dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe1NeededWithoutDedicatedWAL * sizingConstraints.memInGBPerNVMe1
                    - dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe1NeededWithDedicatedWAL * sizingConstraints.memInGBPerNVMe1
                    - dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe2Needed * sizingConstraints.memInGBPerNVMe2
                    - dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe3Needed * sizingConstraints.memInGBPerNVMe3
                    - dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe4Needed * sizingConstraints.memInGBPerNVMe4
                    - dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe5Needed * sizingConstraints.memInGBPerNVMe5
                    - dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe7Needed * sizingConstraints.memInGBPerNVMe7
                    - dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe8Needed * sizingConstraints.memInGBPerNVMe8
                    + dcConfigArrayLocal[dcItem][prelimString] * sizingConstraints[memString]
              )/sizingConstraints[memString]
            )

            if (generalValues.globalDebug == true || localDebugOn == true) {
              debugMsg(generalValues, localDebugOn, 5, "dcConfigAdjustNumberOfServers", 574, `dcConfigAdjustNumberOfServers() 547: localReduceToMaxRoles=${localReduceToMaxRoles} = Math.ceil(( chassisArrayLocal[actualChassisID].maxMemGb=${chassisArrayLocal[actualChassisID].maxMemGb} 
                                        - dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe6Needed=${dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe6Needed} * sizingConstraints.memIGBPerNVMe6=${sizingConstraints.memIGBPerNVMe6}
                                        - sizingConstraints.memPerNodeBase=${sizingConstraints.memPerNodeBase}
                                        - localMemMinForMaxRolesInitiallyAnyServer=${localMemMinForMaxRolesInitiallyAnyServer}
                                        - dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe2Needed=${dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe2Needed} * sizingConstraints.memInGBPerNVMe2=${sizingConstraints.memInGBPerNVMe2}
                                        + localAddBackElement=${localAddBackElement}
                                        - dcConfigArrayLocal[dcItem].prelimPerServerNumberOfSSDWithoutDedicatedNVMeNeeded=${dcConfigArrayLocal[dcItem].prelimPerServerNumberOfSSDWithoutDedicatedNVMeNeeded} * sizingConstraints.memInGBPerSSD=${sizingConstraints.memInGBPerSSD}
                                        - dcConfigArrayLocal[dcItem].prelimPerServerNumberOfSSDWithDedicatedNVMeNeeded=${dcConfigArrayLocal[dcItem].prelimPerServerNumberOfSSDWithDedicatedNVMeNeeded} * sizingConstraints.memInGBPerSSD=${sizingConstraints.memInGBPerSSD}
                                        - dcConfigArrayLocal[dcItem].prelimPerServerNumberOfHDDNeeded=${dcConfigArrayLocal[dcItem].prelimPerServerNumberOfHDDNeeded} * sizingConstraints.memInGBPerHDD=${sizingConstraints.memInGBPerHDD}
                                        - dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe1NeededWithoutDedicatedWAL=${dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe1NeededWithoutDedicatedWAL} * sizingConstraints.memInGBPerNVMe1=${sizingConstraints.memInGBPerNVMe1}
                                        - dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe1NeededWithDedicatedWAL=${dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe1NeededWithDedicatedWAL} * sizingConstraints.memInGBPerNVMe1=${sizingConstraints.memInGBPerNVMe1}
                                        - dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe2Needed=${dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe2Needed} * sizingConstraints.memInGBPerNVMe2=${sizingConstraints.memInGBPerNVMe2}
                                        - dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe3Needed=${dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe3Needed} * sizingConstraints.memInGBPerNVMe3=${sizingConstraints.memInGBPerNVMe3}
                                        - dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe4Needed=${dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe4Needed} * sizingConstraints.memInGBPerNVMe4=${sizingConstraints.memInGBPerNVMe4}
                                        - dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe5Needed=${dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe5Needed} * sizingConstraints.memInGBPerNVMe5=${sizingConstraints.memInGBPerNVMe5}
                                        - dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe6Needed=${dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe6Needed} * sizingConstraints.memInGBPerNVMe6=${sizingConstraints.memInGBPerNVMe6}
                                        - dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe7Needed=${dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe7Needed} * sizingConstraints.memInGBPerNVMe7=${sizingConstraints.memInGBPerNVMe7}
                                        - dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe8Needed=${dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe8Needed} * sizingConstraints.memInGBPerNVMe8=${sizingConstraints.memInGBPerNVMe8}
                                        + dcConfigArrayLocal[dcItem][prelimString]=${dcConfigArrayLocal[dcItem][prelimString]} * sizingConstraints[memString]=${sizingConstraints[memString]}
                                  )/sizingConstraints[memString]=${sizingConstraints[memString]})`,0,0,0)
              debugMsg(generalValues, localDebugOn, 5, "dcConfigAdjustNumberOfServers", 594, `localAddBackElement=${localAddBackElement}`,0,0,0)
              debugMsg(generalValues, localDebugOn, 5, "dcConfigAdjustNumberOfServers", 595, `localMemMinForMaxRolesInitiallyAnyServer=${localMemMinForMaxRolesInitiallyAnyServer}`,0,0,0)
              debugMsg(generalValues, localDebugOn, 5, "dcConfigAdjustNumberOfServers", 596, `dcConfigArrayLocal[dcItem].prelimPerServerNumberOfSSDWithoutDedicatedNVMeNeeded=${dcConfigArrayLocal[dcItem].prelimPerServerNumberOfSSDWithoutDedicatedNVMeNeeded} * sizingConstraints.memInGBmPerSSD=${sizingConstraints.memInGBPerSSD}`,0,0,0)
              debugMsg(generalValues, localDebugOn, 5, "dcConfigAdjustNumberOfServers", 597, `dcConfigArrayLocal[dcItem].prelimPerServerNumberOfSSDWithDedicatedNVMeNeeded=${dcConfigArrayLocal[dcItem].prelimPerServerNumberOfSSDWithDedicatedNVMeNeeded} * sizingConstraints.memInGBmPerSSD=${sizingConstraints.memInGBPerSSD}`,0,0,0)
              debugMsg(generalValues, localDebugOn, 5, "dcConfigAdjustNumberOfServers", 598, `dcConfigArrayLocal[dcItem].prelimPerServerNumberOfHDDNeeded=${dcConfigArrayLocal[dcItem].prelimPerServerNumberOfHDDNeeded} * sizingConstraints.memInGBPerHDD=${sizingConstraints.memInGBPerHDD}`,0,0,0)
              debugMsg(generalValues, localDebugOn, 5, "dcConfigAdjustNumberOfServers", 599, `dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe1NeededWithoutDedicatedWAL=${dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe1NeededWithoutDedicatedWAL} * sizingConstraints.memInGBPerNVMe1=${sizingConstraints.memInGBPerNVMe1}`,0,0,0)
              debugMsg(generalValues, localDebugOn, 5, "dcConfigAdjustNumberOfServers", 600, `dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe1NeededWithDedicatedWAL=${dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe1NeededWithDedicatedWAL} * sizingConstraints.memInGBPerNVMe1=${sizingConstraints.memInGBPerNVMe1}`,0,0,0)
              debugMsg(generalValues, localDebugOn, 5, "dcConfigAdjustNumberOfServers", 601, `dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe2Needed=${dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe2Needed} memzingConstraints.memInGBPerNVMe2=${sizingConstraints.memInGBPerNVMe2}`,0,0,0)
              debugMsg(generalValues, localDebugOn, 5, "dcConfigAdjustNumberOfServers", 602, `dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe3Needed=${dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe3Needed} memzingConstraints.memInGBPerNVMe3=${sizingConstraints.memInGBPerNVMe3}`,0,0,0)
              debugMsg(generalValues, localDebugOn, 5, "dcConfigAdjustNumberOfServers", 603, `dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe4Needed=${dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe4Needed} memzingConstraints.memInGBPerNVMe4=${sizingConstraints.memInGBPerNVMe4}`,0,0,0)
              debugMsg(generalValues, localDebugOn, 5, "dcConfigAdjustNumberOfServers", 604, `dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe5Needed=${dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe5Needed} memzingConstraints.memInGBPerNVMe5=${sizingConstraints.memInGBPerNVMe5}`,0,0,0)
              debugMsg(generalValues, localDebugOn, 5, "dcConfigAdjustNumberOfServers", 605, `dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe6Needed=${dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe6Needed} memzingConstraints.memInGBPerNVMe6=${sizingConstraints.memInGBPerNVMe6}`,0,0,0)
              debugMsg(generalValues, localDebugOn, 5, "dcConfigAdjustNumberOfServers", 606, `dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe7Needed=${dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe7Needed} memzingConstraints.memInGBPerNVMe7=${sizingConstraints.memInGBPerNVMe7}`,0,0,0)
              debugMsg(generalValues, localDebugOn, 5, "dcConfigAdjustNumberOfServers", 607, `dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe8Needed=${dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe8Needed} memzingConstraints.memInGBPerNVMe8=${sizingConstraints.memInGBPerNVMe8}`,0,0,0)
              debugMsg(generalValues, localDebugOn, 5, "dcConfigAdjustNumberOfServers", 608, `dcConfigArrayLocal[dcItem][prelimString]=${dcConfigArrayLocal[dcItem][prelimString]}, sizingConstraints[memString]=${sizingConstraints[memString]}`)
            }
            // Once we've got the actual number of devices in question per server, calculate the number of servers needed then 
            // This gives us the minimum number of servers based on reducing only this device (no other).
            scoreMemPerMediaType[mediatype].minNumber = localReduceToMaxRoles
            if (lowestMinServersMaxRoles < scoreMemPerMediaType[mediatype].minNumber) {
              lowestMinServersMaxRoles = scoreMemPerMediaType[mediatype].minNumber
              lowestMinServersMediaTypeMaxRoles = mediatype
              debugMsg(generalValues, localDebugOn, 5, "dcConfigAdjustNumberOfServers", 616, `media name=${memString}, lowestMinServersMaxRoles=${lowestMinServersMaxRoles}, lowestMinServersMediaTypeMinRoles=${lowestMinServersMediaTypeMinRoles}, localReduceToMaxRoles=${localReduceToMaxRoles}, scoreMemPerMediaType[mediatype].minNumber=${scoreMemPerMediaType[mediatype].minNumber}, dcConfigArrayLocal[dcItem][mediaSumString]=${dcConfigArrayLocal[dcItem][mediaSumString]}`,0,0,0)
            }
            else {
              debugMsg(generalValues, localDebugOn, 5, "dcConfigAdjustNumberOfServers", 619, `media name=${memString}, lowestMinServersMaxRoles=${lowestMinServersMaxRoles}, lowestMinServersMediaTypeMaxRoles=${lowestMinServersMediaTypeMaxRoles}, localReduceToMaxRoles=${localReduceToMinRoles},  scoreMemPerMediaType[mediatype].minNumber=${scoreMemPerMediaType[mediatype].minNumber}, dcConfigArrayLocal[dcItem][mediaSumString]=${dcConfigArrayLocal[dcItem][mediaSumString]}`,0,0,0)
            }
           
          }
        }
        else {
          scoreMemPerMediaType[mediatype].score = 0
          debugMsg(generalValues, localDebugOn, 5, "dcConfigAdjustNumberOfServers", 626, `media name=${memString}, score=0`,0,0,0)
        }
      }
      debugMsg(generalValues, localDebugOn, 5, "dcConfigAdjustNumberOfServers", 629, `lowestMinServersMinRoles=${lowestMinServersMinRoles}, lowestMinServersMediaTypeMinRoles=${lowestMinServersMediaTypeMinRoles}; lowestMinServersMaxRoles=${lowestMinServersMaxRoles}, lowestMinServersMediaTypeMaxRoles=${lowestMinServersMediaTypeMaxRoles}`,0,0,0)
      // MAY BE UNNEEDED, especially regarding this line above: if (dcConfigArrayLocal[dcItem].prelimNumberOfServers > localMinServersForMaxRolesInitiallyAnyServer) {
      localReduceMemByRatioMinRoles = Math.ceil( dcConfigArrayLocal[dcItem].prelimNumberOfServers / 
                                       ((chassisArrayLocal[actualChassisID].maxMemGb 
                                         - dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe6Needed * sizingConstraints.memInGBPerNVMe6
                                         - sizingConstraints.memPerNodeBase
                                         - localMemMinForMinRolesInitiallyAnyServer
                                         - dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe2Needed * sizingConstraints.memInGBPerNVMe2
                                        ) / 
                                        (dcConfigArrayLocal[dcItem].prelimPerServerNumberOfHDDNeeded * sizingConstraints.memInGBPerHDD
                                         + dcConfigArrayLocal[dcItem].prelimPerServerNumberOfSSDWithoutDedicatedNVMeNeeded * sizingConstraints.memInGBPerSSD
                                         + dcConfigArrayLocal[dcItem].prelimPerServerNumberOfSSDWithDedicatedNVMeNeeded * sizingConstraints.memInGBPerSSD
                                         + dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe1NeededWithoutDedicatedWAL * sizingConstraints.memInGBPerNVMe1
                                         + dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe1NeededWithDedicatedWAL * sizingConstraints.memInGBPerNVMe1
                                         + dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe3Needed * sizingConstraints.memInGBPerNVMe3
                                         + dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe4Needed * sizingConstraints.memInGBPerNVMe4
                                         + dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe5Needed * sizingConstraints.memInGBPerNVMe5
                                         + dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe7Needed * sizingConstraints.memInGBPerNVMe7
                                         + dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe8Needed * sizingConstraints.memInGBPerNVMe8
                                        )
                                       )
                                     )
       debugMsg(generalValues, localDebugOn, 5, "dcConfigAdjustNumberOfServers", 651, `dcConfigArrayLocal[dcItem].prelimNumberOfServers=${dcConfigArrayLocal[dcItem].prelimNumberOfServers}/(${(chassisArrayLocal[actualChassisID].maxMemGb 
        - dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe6Needed * sizingConstraints.memInGBPerNVMe6
        - sizingConstraints.memPerNodeBase
        - localMemMinForMinRolesInitiallyAnyServer
        - dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe2Needed * sizingConstraints.memInGBPerNVMe2
       )} / ${(dcConfigArrayLocal[dcItem].prelimPerServerNumberOfHDDNeeded * sizingConstraints.memInGBPerHDD
        + dcConfigArrayLocal[dcItem].prelimPerServerNumberOfSSDWithoutDedicatedNVMeNeeded * sizingConstraints.memInGBPerSSD
        + dcConfigArrayLocal[dcItem].prelimPerServerNumberOfSSDWithDedicatedNVMeNeeded * sizingConstraints.memInGBPerSSD
        + dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe1NeededWithoutDedicatedWAL * sizingConstraints.memInGBPerNVMe1
        + dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe1NeededWithDedicatedWAL * sizingConstraints.memInGBPerNVMe1
        + dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe3Needed * sizingConstraints.memInGBPerNVMe3
        + dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe4Needed * sizingConstraints.memInGBPerNVMe4
        + dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe5Needed * sizingConstraints.memInGBPerNVMe5
        + dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe7Needed * sizingConstraints.memInGBPerNVMe7
        + dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe8Needed * sizingConstraints.memInGBPerNVMe8
       )})`,0,0,0)
      localReduceMemByRatioMaxRoles = Math.ceil( dcConfigArrayLocal[dcItem].prelimNumberOfServers / 
                                     ((chassisArrayLocal[actualChassisID].maxMemGb 
                                       - dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe6Needed * sizingConstraints.memInGBPerNVMe6
                                       - sizingConstraints.memPerNodeBase
                                       - localMemMinForMaxRolesInitiallyAnyServer
                                       - dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe2Needed * sizingConstraints.memInGBPerNVMe2
                                      ) / 
                                      (dcConfigArrayLocal[dcItem].prelimPerServerNumberOfHDDNeeded * sizingConstraints.memInGBPerHDD
                                       + dcConfigArrayLocal[dcItem].prelimPerServerNumberOfSSDWithoutDedicatedNVMeNeeded * sizingConstraints.memInGBPerSSD
                                       + dcConfigArrayLocal[dcItem].prelimPerServerNumberOfSSDWithDedicatedNVMeNeeded * sizingConstraints.memInGBPerSSD
                                       + dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe1NeededWithoutDedicatedWAL * sizingConstraints.memInGBPerNVMe1
                                       + dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe1NeededWithDedicatedWAL * sizingConstraints.memInGBPerNVMe1
                                       + dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe1Needed * sizingConstraints.memInGBPerNVMe1
                                       + dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe3Needed * sizingConstraints.memInGBPerNVMe3
                                       + dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe4Needed * sizingConstraints.memInGBPerNVMe4
                                       + dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe5Needed * sizingConstraints.memInGBPerNVMe5
                                       + dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe7Needed * sizingConstraints.memInGBPerNVMe7
                                       + dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe8Needed * sizingConstraints.memInGBPerNVMe8
                                      )
                                     )
                                    )
      debugMsg(generalValues, localDebugOn, 5, "dcConfigAdjustNumberOfServers", 688, `localReduceMemByRatioMaxRoles=${localReduceMemByRatioMaxRoles} = Math.ceil( dcConfigArrayLocal[dcItem].prelimNumberOfServers=${dcConfigArrayLocal[dcItem].prelimNumberOfServers} / 
      ((chassisArrayLocal[actualChassisID].maxMemGb=${chassisArrayLocal[actualChassisID].maxMemGb} 
        - dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe6Needed=${dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe6Needed} * sizingConstraints.memInGBPerNVMe6=${sizingConstraints.memInGBPerNVMe6}
        - sizingConstraints.memPerNodeBase=${sizingConstraints.memPerNodeBase}
        - localMemMinForMaxRolesInitiallyAnyServer=${localMemMinForMaxRolesInitiallyAnyServer}
        - dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe2Needed=${dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe2Needed} * sizingConstraints.memInGBPerNVMe2=${sizingConstraints.memInGBPerNVMe2}
       ) / 
       (dcConfigArrayLocal[dcItem].prelimPerServerNumberOfHDDNeeded=${dcConfigArrayLocal[dcItem].prelimPerServerNumberOfHDDNeeded} * sizingConstraints.memInGBPerHDD=${sizingConstraints.memInGBPerHDD}
        + dcConfigArrayLocal[dcItem].prelimPerServerNumberOfSSDWithoutDedicatedNVMeNeeded=${dcConfigArrayLocal[dcItem].prelimPerServerNumberOfSSDWithoutDedicatedNVMeNeeded} * sizingConstraints.memInGBPerSSD=${sizingConstraints.memInGBPerSSD}
        + dcConfigArrayLocal[dcItem].prelimPerServerNumberOfSSDWithDedicatedNVMeNeeded=${dcConfigArrayLocal[dcItem].prelimPerServerNumberOfSSDWithDedicatedNVMeNeeded} * sizingConstraints.memInGBPerSSD=${sizingConstraints.memInGBPerSSD}
        + dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe1NeededWithoutDedicatedWAL=${dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe1NeededWithoutDedicatedWAL} * sizingConstraints.memInGBPerNVMe1=${sizingConstraints.memInGBPerNVMe1}
        + dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe1NeededWithDedicatedWAL=${dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe1NeededWithDedicatedWAL} * sizingConstraints.memInGBPerNVMe1=${sizingConstraints.memInGBPerNVMe1}
        + dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe1Needed=${dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe1Needed} * sizingConstraints.memInGBPerNVMe1=${sizingConstraints.memInGBPerNVMe1}
        + dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe3Needed=${dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe3Needed} * sizingConstraints.memInGBPerNVMe3=${sizingConstraints.memInGBPerNVMe3}
        + dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe4Needed=${dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe4Needed} * sizingConstraints.memInGBPerNVMe4=${sizingConstraints.memInGBPerNVMe3}
        + dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe5Needed=${dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe5Needed} * sizingConstraints.memInGBPerNVMe5=${sizingConstraints.memInGBPerNVMe3}
        + dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe7Needed=${dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe7Needed} * sizingConstraints.memInGBPerNVMe7=${sizingConstraints.memInGBPerNVMe3}
        + dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe8Needed=${dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe8Needed} * sizingConstraints.memInGBPerNVMe8=${sizingConstraints.memInGBPerNVMe3}
       )
      )
     )`,0,0,0)
      // # The other only option would be to reduce the additional role by one.
      localReduceMemByRole = Math.ceil(dcConfigArrayLocal[dcItem].prelimNumberOfServers /
                                       ((chassisArrayLocal[actualChassisID].maxMemGb 
                                          - dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe6Needed * sizingConstraints.memInGBPerNVMe6
                                          - sizingConstraints.memPerNodeBase
                                          - localMemMinForMinRolesInitiallyAnyServer
                                          - dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe2Needed * sizingConstraints.memInGBPerNVMe2
                                        ) / 
                                        (dcConfigArrayLocal[dcItem].prelimPerServerNumberOfHDDNeeded * sizingConstraints.memInGBPerHDD
                                         + dcConfigArrayLocal[dcItem].prelimPerServerNumberOfSSDWithoutDedicatedNVMeNeeded * sizingConstraints.memInGBPerSSD
                                         + dcConfigArrayLocal[dcItem].prelimPerServerNumberOfSSDWithDedicatedNVMeNeeded * sizingConstraints.memInGBPerSSD
                                         + dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe1NeededWithoutDedicatedWAL * sizingConstraints.memInGBPerNVMe1
                                         + dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe1NeededWithDedicatedWAL * sizingConstraints.memInGBPerNVMe1
                                         + dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe1Needed * sizingConstraints.memInGBPerNVMe1
                                         + dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe1Needed * sizingConstraints.memInGBPerNVMe1
                                         + dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe3Needed * sizingConstraints.memInGBPerNVMe3
                                         + dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe4Needed * sizingConstraints.memInGBPerNVMe4
                                         + dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe5Needed * sizingConstraints.memInGBPerNVMe5
                                         + dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe7Needed * sizingConstraints.memInGBPerNVMe7
                                         + dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe8Needed * sizingConstraints.memInGBPerNVMe8
                                        )
                                       )
                                      )
      // take the min of both
      localNewNumberOfServersByReducingMem = Math.min(
                                                      Math.min(
                                                        Math.max(localReduceMemByRatioMinRoles,localMinServersForMinRolesInitiallyAnyServer), 
                                                        Math.max(localReduceMemByRatioMaxRoles,localMinServersForMaxRolesInitiallyAnyServer)
                                                      ),
                                                      localReduceMemByRole, 
                                                      Math.min(
                                                        Math.max(localReduceMemByRatioMinRoles,localMinServersForMinRolesInitiallyAnyServer), 
                                                        Math.max(localReduceMemByRatioMaxRoles,localMinServersForMaxRolesInitiallyAnyServer)
                                                      )
                                                    )
        debugMsg(generalValues, localDebugOn, 5, "dcConfigAdjustNumberOfServers", 744, `localNewNumberOfServersByReducingMem = Math.min(
          Math.min(
            Math.max(localReduceMemByRatioMinRoles=${localReduceMemByRatioMinRoles},localMinServersForMinRolesInitiallyAnyServer=${localMinServersForMinRolesInitiallyAnyServer}), 
            Math.max(localReduceMemByRatioMaxRoles=${localReduceMemByRatioMaxRoles},localMinServersForMaxRolesInitiallyAnyServer=${localMinServersForMaxRolesInitiallyAnyServer})
          ),
          localReduceMemByRole=${localReduceMemByRole}, 
          Math.min(
            Math.max(localReduceMemByRatioMinRoles=${localReduceMemByRatioMinRoles},localMinServersForMinRolesInitiallyAnyServer=${localMinServersForMinRolesInitiallyAnyServer}), 
            Math.max(localReduceMemByRatioMaxRoles=${localReduceMemByRatioMaxRoles},localMinServersForMaxRolesInitiallyAnyServer=${localMinServersForMaxRolesInitiallyAnyServer})
          )
          )`,0,0,0)
    }
    else {
      localNewNumberOfServersByReducingMem = dcConfigArrayLocal[dcItem].prelimNumberOfServers
    }
    debugMsg(generalValues, localDebugOn, 5, "dcConfigAdjustNumberOfServers", 759, `localNewNumberOfServersByReducingMem=${localNewNumberOfServersByReducingMem}`,0,0,0)
    // From all these reduction either by reducing cores or by reducing memory needed, take the max number of servers resulting
    dcConfigArrayLocal[dcItem].resultingNumberOfServersAsPerChassis = Math.max (localNewNumberOfServersByReducingCores, localNewNumberOfServersByReducingMem)
    debugMsg(generalValues, localDebugOn, 5, "dcConfigAdjustNumberOfServers", 762, `dcConfigArrayLocal[dcItem].resultingNumberOfServersAsPerChassis =${dcConfigArrayLocal[dcItem].resultingNumberOfServersAsPerChassis }`,0,0,0)

  }
  debugMsg(generalValues, localDebugOn, 5, "dcConfigAdjustNumberOfServers", 765, `[chassisID=${actualChassisID},DC=${dcItem}] dcConfigArrayLocal[dcItem].resultingNumberOfServersAsPerChassis=${dcConfigArrayLocal[dcItem].resultingNumberOfServersAsPerChassis}`,0,0,0)
}

export default dcConfigAdjustNumberOfServers