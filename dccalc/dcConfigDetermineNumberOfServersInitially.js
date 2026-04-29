import displayMsg from "../common/displayMsg.js"
import {debugMsg} from "../common/debug.js";

const dcConfigDetermineNumberOfServersInitially = function (generalValues, dcConfigArrayLocal, chassisArrayLocal, actualChassisID, dcItem) {
  let localDebugOn = false

  // Limitations are in place for number of HDD and SSD - the ratio of both  might indicate a viable mix.
  let minServersForHDD = Math.ceil(dcConfigArrayLocal[dcItem].numberOfHDDNeeded / chassisArrayLocal[actualChassisID].maxHDDSlots)
  let minServersForSSD = Math.ceil( Math.ceil(dcConfigArrayLocal[dcItem].numberOfHDDNeeded * 1/chassisArrayLocal[actualChassisID].hddToSSD) / chassisArrayLocal[actualChassisID].maxSSDSlots)
  let ratioHDDslotsVsSSDslots = chassisArrayLocal[actualChassisID].maxHDDSlots > chassisArrayLocal[actualChassisID].maxSSDSlots
  // The  number of SSD is determined by the number of HDD and it's ratio for fronting SSD.
  // The number of SSD is composed by the number of SSD without fronting flash and SSD with fronting flash. (Because we need to separate the media for both use cases, don't mix those up - only here for counting)
  // The number of NVMe is already calculated - only the individual ratio within a chassis needs to be balanced depending on the scheme used for config of similar or exact.
  // CALC: SSDAll
  let localNumberOfAllSSD = dcConfigArrayLocal[dcItem].numberOfSSD4Needed 
                            + dcConfigArrayLocal[dcItem].numberOfSSD1NeededWithoutDedicatedRocksDBNorWAL
                            + dcConfigArrayLocal[dcItem].numberOfSSD1NeededWithoutDedicatedRocksDBDedicatedWAL 
                            + dcConfigArrayLocal[dcItem].numberOfSSD1NeededWithDedicatedRocksDBDedicatedWAL
                            + dcConfigArrayLocal[dcItem].numberOfSSD1NeededWithDedicatedRocksDBIncludingWAL
  debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfServersInitially", 20, `[chassisID=${actualChassisID},dcItem=${dcItem}] localNumberOfAllSSD=${localNumberOfAllSSD}`,0,0,0)
  debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfServersInitially", 21, `[chassisID=${actualChassisID},dcItem=${dcItem}] localNumberOfAllSSD=${dcConfigArrayLocal[dcItem].numberOfSSD4Needed}`,0,0,0)
  debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfServersInitially", 22, `[chassisID=${actualChassisID},dcItem=${dcItem}] localNumberOfAllSSD=${dcConfigArrayLocal[dcItem].numberOfSSD1NeededWithoutDedicatedRocksDBNorWAL}`,0,0,0)
  debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfServersInitially", 23, `[chassisID=${actualChassisID},dcItem=${dcItem}] localNumberOfAllSSD=${dcConfigArrayLocal[dcItem].numberOfSSD1NeededWithoutDedicatedRocksDBDedicatedWAL}`,0,0,0)
  debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfServersInitially", 24, `[chassisID=${actualChassisID},dcItem=${dcItem}] localNumberOfAllSSD=${dcConfigArrayLocal[dcItem].numberOfSSD1NeededWithDedicatedRocksDBDedicatedWAL}`,0,0,0)
  debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfServersInitially", 25, `[chassisID=${actualChassisID},dcItem=${dcItem}] localNumberOfAllSSD=${dcConfigArrayLocal[dcItem].numberOfSSD1NeededWithDedicatedRocksDBIncludingWAL}`,0,0,0)
  // CALC: NAll
  let localNumberOfAllNVMe =  dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithoutDedicatedRocksDBNorWAL
                            + dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithoutDedicatedRocksDBDedicatedWAL
                            + dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithDedicatedRocksDBDedicatedWAL
                            + dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithDedicatedRocksDBIncludingWAL
                            + dcConfigArrayLocal[dcItem].numberOfNVMe2Needed 
                            + dcConfigArrayLocal[dcItem].numberOfNVMe3Needed
                            + dcConfigArrayLocal[dcItem].numberOfNVMe4Needed
                            + dcConfigArrayLocal[dcItem].numberOfNVMe5Needed
                            + dcConfigArrayLocal[dcItem].numberOfNVMe6Needed
                            + dcConfigArrayLocal[dcItem].numberOfNVMe7Needed
                            + dcConfigArrayLocal[dcItem].numberOfNVMe8Needed
  debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfServersInitially", 38, `[chassisID=${actualChassisID},dcItem=${dcItem}] localNumberOfAllNVMe=${localNumberOfAllNVMe}`,0,0,0)
  debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfServersInitially", 39, `[chassisID=${actualChassisID},dcItem=${dcItem}] localNumberOfAllNVMe1RW=${dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithoutDedicatedRocksDBNorWAL}`,0,0,0)
  debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfServersInitially", 40, `[chassisID=${actualChassisID},dcItem=${dcItem}] localNumberOfAllNVMe1R+W=${dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithoutDedicatedRocksDBDedicatedWAL}`,0,0,0)
  debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfServersInitially", 41, `[chassisID=${actualChassisID},dcItem=${dcItem}] localNumberOfAllNVMe1+R+W=${dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithDedicatedRocksDBDedicatedWAL}`,0,0,0)
  debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfServersInitially", 42, `[chassisID=${actualChassisID},dcItem=${dcItem}] localNumberOfAllNVMe1+RW=${dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithDedicatedRocksDBIncludingWAL}`,0,0,0)
  debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfServersInitially", 43, `[chassisID=${actualChassisID},dcItem=${dcItem}] localNumberOfAllNVMe2=${dcConfigArrayLocal[dcItem].numberOfNVMe2Needed}`,0,0,0)
  debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfServersInitially", 44, `[chassisID=${actualChassisID},dcItem=${dcItem}] localNumberOfAllNVMe3=${dcConfigArrayLocal[dcItem].numberOfNVMe3Needed}`,0,0,0)
  debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfServersInitially", 45, `[chassisID=${actualChassisID},dcItem=${dcItem}] localNumberOfAllNVMe4=${dcConfigArrayLocal[dcItem].numberOfNVMe4Needed}`,0,0,0)
  debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfServersInitially", 46, `[chassisID=${actualChassisID},dcItem=${dcItem}] localNumberOfAllNVMe5=${dcConfigArrayLocal[dcItem].numberOfNVMe5Needed}`,0,0,0)
  debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfServersInitially", 47, `[chassisID=${actualChassisID},dcItem=${dcItem}] localNumberOfAllNVMe6=${dcConfigArrayLocal[dcItem].numberOfNVMe6Needed}`,0,0,0)
  debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfServersInitially", 48, `[chassisID=${actualChassisID},dcItem=${dcItem}] localNumberOfAllNVMe7=${dcConfigArrayLocal[dcItem].numberOfNVMe7Needed}`,0,0,0)
  debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfServersInitially", 49, `[chassisID=${actualChassisID},dcItem=${dcItem}] localNumberOfAllNVMe8=${dcConfigArrayLocal[dcItem].numberOfNVMe8Needed}`,0,0,0)


  // maxRatioHDDToAll => ratio for using all HDD slots compared to all available (HDD+SSD) drive slots
  let maxRatioHDDToAll = chassisArrayLocal[actualChassisID].maxHDDSlots / chassisArrayLocal[actualChassisID].maxAllSlots
  // maxRatioHDDToAll => ratio for using all SSD slots compared to all available (HDD+SSD) drive slots
  let maxRatioSSDToAll = chassisArrayLocal[actualChassisID].maxSSDSlots / chassisArrayLocal[actualChassisID].maxAllSlots
  // For finding a useful number of HDD and SSD per server: The maximum number of HDD and the maximum number of SSD in a server are the boundaries we can move the ratio of SSD to HDD in.
  // Since we cannot use all slots agnostic for SSD and HDD in the same way, the final decision whether a ratio is possible must be checked. However, since probably there are also slots that
  // can be used for NVMe from the overall available drive slots, there might be the limit already imposed if NVMe would occupy drive slots, too. 
  let maxRatioHDDvsSSD = 0
  let maxRatioSSDvsHDD = 0
  if (chassisArrayLocal[actualChassisID].maxSSDSlots < chassisArrayLocal[actualChassisID].maxAllSlots) {
    maxRatioSSDvsHDD = chassisArrayLocal[actualChassisID].maxSSDSlots / (chassisArrayLocal[actualChassisID].maxAllSlots - chassisArrayLocal[actualChassisID].maxSSDSlots)
    debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfServersInitially", 63, `[chassisID=${actualChassisID},dcItem=${dcItem}] maxRatioSSDvsHDD=${maxRatioSSDvsHDD} = chassisArrayLocal[actualChassisID].maxSSDSlots=${chassisArrayLocal[actualChassisID].maxSSDSlots} / (chassisArrayLocal[actualChassisID].maxAllSlots=${chassisArrayLocal[actualChassisID].maxAllSlots} - chassisArrayLocal[actualChassisID].maxSSDSlots=${chassisArrayLocal[actualChassisID].maxSSDSlots})`,0,0,0)
  }
  if (chassisArrayLocal[actualChassisID].maxHDDSlots < chassisArrayLocal[actualChassisID].maxAllSlots) {          
    maxRatioHDDvsSSD = chassisArrayLocal[actualChassisID].maxHDDSlots / (chassisArrayLocal[actualChassisID].maxAllSlots - chassisArrayLocal[actualChassisID].maxHDDSlots)
    debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfServersInitially", 67, `[chassisID=${actualChassisID},dcItem=${dcItem}]  maxRatioHDDvsSSD=${maxRatioHDDvsSSD} = chassisArrayLocal[actualChassisID].maxHDDSlots=${chassisArrayLocal[actualChassisID].maxHDDSlots} / (chassisArrayLocal[actualChassisID].maxAllSlots=${chassisArrayLocal[actualChassisID].maxAllSlots} - chassisArrayLocal[actualChassisID].maxHDDSlots=${chassisArrayLocal[actualChassisID].maxHDDSlots})`,0,0,0)
  }
  let maxRatioNVMeVsAllDrives = chassisArrayLocal[actualChassisID].maxNVMeSlots / chassisArrayLocal[actualChassisID].maxAllSlots
  debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfServersInitially", 70, `[chassisID=${actualChassisID},dcItem=${dcItem}] maxRatioNVMeVsAllDrives=${maxRatioNVMeVsAllDrives} = chassisArrayLocal[actualChassisID].maxNVMeSlots=${chassisArrayLocal[actualChassisID].maxNVMeSlots} / chassisArrayLocal[actualChassisID].maxAllSlots=${chassisArrayLocal[actualChassisID].maxAllSlots}`,0,0,0)
  let ratioHDDvsSSD = 0
  let ratioSSDvsHDD = 0
  // CALC (3): ratHvS
  // Note:
  // With HDD vs SSD and SSD vs HDD max ratio values, at least we can determine if the ratio required given by the actual config might match the supported chassis config. If yes, the number of
  // servers can be determined then by checking the ratio to the NVMe required. If not, then we need to find the optimal ratio for the minimum number of servers by tyesting the
  // checking the boundary crossed and then determining the number of min servers for this kind of media where the number of media is not fulfilled. 
          
  if ( localNumberOfAllSSD > 0) {
    debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfServersInitially", 80, `[chassisID=${actualChassisID},dcItem=${dcItem}] localNumberOfAllSSD=${localNumberOfAllSSD} is > 0`,0,0,0)
    ratioHDDvsSSD = dcConfigArrayLocal[dcItem].numberOfHDDNeeded / localNumberOfAllSSD
    if (chassisArrayLocal[actualChassisID].maxHDDSlots < chassisArrayLocal[actualChassisID].maxAllSlots ) {
      if (ratioHDDvsSSD > maxRatioHDDvsSSD) {
        // the actual ratio of HDD vs SSD is not within the range and must be tuned towards a matching range => apply correction in the direction that is not fulfilled:
        ratioHDDvsSSD = maxRatioHDDvsSSD
      }
    }
    debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfServersInitially", 88, `[chassisID=${actualChassisID},dcItem=${dcItem}] ratioHDDvsSSD=${ratioHDDvsSSD}`,0,0,0)
  }
  if ( dcConfigArrayLocal[actualChassisID].numberOfHDDNeeded > 0) {
    debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfServersInitially", 91, `[chassisID=${actualChassisID},dcItem=${dcItem}] dcConfigArrayLocal[actualChassisID].numberOfHDDNeeded=${dcConfigArrayLocal[actualChassisID].numberOfHDDNeeded} is > 0`,0,0,0)
    ratioSSDvsHDD =  localNumberOfAllSSD / dcConfigArrayLocal[dcItem].numberOfHDDNeeded
    if (chassisArrayLocal[actualChassisID].maxSSDSlots < chassisArrayLocal[actualChassisID].maxAllSlots) {
      if (ratioSSDvsHDD > maxRatioSSDvsHDD) {
        // the actual ratio of HDD vs SSD is not within the range and must be tuned towards a matching range => apply correction in the direction that is not fulfilled:
        ratioHDDvsSSD = 1/maxRatioSSDvsHDD
      }
    }
    debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfServersInitially", 99, `[chassisID=${actualChassisID},dcItem=${dcItem}] ratioHDDvsSSD=${ratioHDDvsSSD}`,0,0,0)
  }
          
  // CALC (26): determine possible coverage with dedicated slots for NVMe - how many servers we would need to place additional NVMe there
  // To find the number of slots to use in drive slots for all HDD, SSD, and NVMe, check first if we would be safe to use only dedicated slots for NVMe.
  let requiredSumOfSSDandHDD = dcConfigArrayLocal[dcItem].numberOfHDDNeeded + localNumberOfAllSSD
  debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfServersInitially", 105, `[chassisID=${actualChassisID},dcItem=${dcItem}] requiredSumOfSSDandHDD=${requiredSumOfSSDandHDD} = dcConfigArrayLocal[dcItem].numberOfHDDNeeded=${dcConfigArrayLocal[dcItem].numberOfHDDNeeded} + localNumberOfAllSSD=${localNumberOfAllSSD}`,0,0,0)
  let ratioAllActualNVMeVsAllDrives = localNumberOfAllNVMe / requiredSumOfSSDandHDD
  debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfServersInitially", 107, `[chassisID=${actualChassisID},dcItem=${dcItem}] ratioAllActualNVMeVsAllDrives=${ratioAllActualNVMeVsAllDrives} = localNumberOfAllNVMe=${localNumberOfAllNVMe} / requiredSumOfSSDandHDD=${requiredSumOfSSDandHDD}`,0,0,0)
  let initServ = 0
  if (localNumberOfAllNVMe > 0) {
    debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfServersInitially", 110, `IS: [chassisID=${actualChassisID},dcItem=${dcItem}] localNumberOfAllNVMe=${localNumberOfAllNVMe} > 0`,0,0,0)
    if(ratioAllActualNVMeVsAllDrives >= chassisArrayLocal[actualChassisID].maxDedicatedNVMeSlots/chassisArrayLocal[actualChassisID].maxAllSlots) {
      debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfServersInitially", 112, `IS: [chassisID=${actualChassisID},dcItem=${dcItem}] ratioAllActualNVMeVsAllDrives=${ratioAllActualNVMeVsAllDrives} >= chassisArrayLocal[actualChassisID].maxDedicatedNVMeSlots=${chassisArrayLocal[actualChassisID].maxDedicatedNVMeSlots}/chassisArrayLocal[actualChassisID].maxAllSlots=${chassisArrayLocal[actualChassisID].maxAllSlots}`,0,0,0)
      // There might be more than the NVMe slots required for all NVMe in the actual absolute NVMe number vs HDD+SSD than the ratio of dedicated NVMe vs drive slots can provide, or exactly the number, or even less. 
      // Not all NVMe can be placed using the dedicated NVMe slots if there are any.
      // To figure out how many media must go in sum into drive slots, reduce the number of media required to assign by the number of dedicated slots (roughly, because we cannot determine the proper number without
      // knowing the number of media slots that might not used by SSD nor HDD and, therefor, the number of empty slots available for NVMe).
      //initServ = Math.ceil((requiredSumOfNVMe + requiredSumOfSSDandHDD)/chassisArrayLocal[actualChassisID].maxAllMediaSum)
      initServ = Math.ceil((localNumberOfAllNVMe + requiredSumOfSSDandHDD)/chassisArrayLocal[actualChassisID].maxAllMediaSum)
      //console.log(`dcConfigDetermineNumberOfServersInitially() 88: [chassisID=${actualChassisID},dcItem=${dcItem}] initServ=${initServ} = Math.ceil((requiredSumOfNVMe=${requiredSumOfNVMe} + requiredSumOfSSDandHDD=${requiredSumOfSSDandHDD})/chassisArrayLocal[actualChassisID].maxAllMediaSum=${chassisArrayLocal[actualChassisID].maxAllMediaSum})`)
      debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfServersInitially", 120, `[chassisID=${actualChassisID},dcItem=${dcItem}] initServ=${initServ} = Math.ceil((localNumberOfAllNVMe=${localNumberOfAllNVMe} + requiredSumOfSSDandHDD=${requiredSumOfSSDandHDD})/chassisArrayLocal[actualChassisID].maxAllMediaSum=${chassisArrayLocal[actualChassisID].maxAllMediaSum})`,0,0,0)
    }
    else {
      // All NVMe and HDD and SSD must go into any number of slots: 
      initServ = Math.ceil((requiredSumOfSSDandHDD + localNumberOfAllNVMe)/chassisArrayLocal[actualChassisID].maxAllSlots)
      debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfServersInitially", 125, `[chassisID=${actualChassisID},dcItem=${dcItem}] initServ=${initServ} = Math.ceil((requiredSumOfSSDandHDD=${requiredSumOfSSDandHDD} + localNumberOfAllNVMe=${localNumberOfAllNVMe})/chassisArrayLocal[actualChassisID].maxAllMediaSum=${chassisArrayLocal[actualChassisID].maxAllMediaSum})`,0,0,0)
    }
  }
  else {
    // If no NVMe needed at all, use the maxAllSlots instead of maxAllMediaSum
    initServ = Math.ceil((requiredSumOfSSDandHDD)/chassisArrayLocal[actualChassisID].maxAllSlots)
    debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfServersInitially", 131, `[chassisID=${actualChassisID},dcItem=${dcItem}] initServ=${initServ} = Math.ceil((requiredSumOfSSDandHDD=${requiredSumOfSSDandHDD})/chassisArrayLocal[actualChassisID].maxAllSlots=${chassisArrayLocal[actualChassisID].maxAllSlots})`,0,0,0)
  }
  let NdS = chassisArrayLocal[actualChassisID].maxDedicatedNVMeSlots
  debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfServersInitially", 134, `[chassisID=${actualChassisID},dcItem=${dcItem}]  NdS=${NdS} = chassisArrayLocal[actualChassisID].maxDedicatedNVMeSlots=${chassisArrayLocal[actualChassisID].maxDedicatedNVMeSlots}`,0,0,0)

  let NAll = localNumberOfAllNVMe
  let HDDAll = dcConfigArrayLocal[actualChassisID].numberOfHDDNeeded
  let SSDAll = localNumberOfAllSSD
  let AllS = chassisArrayLocal[actualChassisID].maxAllSlots
  let ratHvS = ratioHDDvsSSD
  let HDDmedS = 0
  
  // If Chassis.desiredSimilarMediaConfig is selected, the simple config placing all the special NVMe somewhere would be used:
  debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfServersInitially", 144, `[chassisID=${actualChassisID},dcItem=${dcItem}] generalValues.desiredSimilarMediaConfig=${generalValues.desiredSimilarMediaConfig}`,0,0,0)
  if (generalValues.desiredSimilarMediaConfig == 1) {
    // CALC (4): ratNvA
    let ratNvA = 0
    if ((HDDAll + SSDAll) > 0 && NAll > 0) {
      // might be smaller than zero if the number of NVMe required is lower than the number of dedicated NVMe slots => check in all uses of it for being > 0
      if ((NAll - NdS * initServ) > 0) {
        ratNvA = (NAll - NdS * initServ) / ( HDDAll + SSDAll)
        if (ratNvA > maxRatioNVMeVsAllDrives) {
          // correct down to limited number of slots allowed to be used by NVMe (so, not up to all drive slots)
          ratNvA = maxRatioNVMeVsAllDrives
        }
      }
      else {
        ratNvA = 0
      }
    }
    debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfServersInitially", 161, `[chassisID=${actualChassisID},dcItem=${dcItem}] ratNvA=${ratNvA}`,0,0,0)

    // CALC (25): (would be zero if no NVMe needed after dedicated)
    let NmedS = 0
    if ((HDDAll + SSDAll) > 0 && NAll > 0) {
      if ((NAll - NdS * initServ) > 0) {
        NmedS = Math.ceil(ratNvA * (HDDAll + SSDAll)/ initServ)
      }
      else {
        NmedS = 0
      }
    }
    else {
      if ((NAll - NdS * initServ) > 0) {
        NmedS = Math.ceil((NAll / initServ) - NdS )
      }
      else {
        NmedS = 0
      }
    }
    debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfServersInitially", 181, `[chassisID=${actualChassisID},dcItem=${dcItem}]  NmedS=${NmedS}`,0,0,0)

    // CALC (15):
    let RemS = AllS - NmedS
    // CALC (21) or (24):
    let HDDmedS = 0
    if ( SSDAll > 0) {
      // (21)
      if (ratHvS > 0) {
        HDDmedS = RemS - Math.ceil(HDDAll / (ratHvS * initServ))
        debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfServersInitially", 191, `[chassisID=${actualChassisID},dcItem=${dcItem}] HDDmedS=${HDDmedS} = RemS=${RemS} - Math.ceil(HDDAll=${HDDAll} / (ratHvS=${ratHvS} * initServ=${initServ}))`,0,0,0)
      }
      else {
        HDDmedS = 0
        debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfServersInitially", 195, `[chassisID=${actualChassisID},dcItem=${dcItem}] HDDmedS=${HDDmedS}`,0,0,0)
      }  
    }
    else {
      // (24)
      HDDmedS = RemS 
      debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfServersInitially", 201, `[chassisID=${actualChassisID},dcItem=${dcItem}] HDDmedS=${HDDmedS} = RemS=${RemS}`,0,0,0)
    }
    // CALC (22) or (23):
    let SSDmedS = 0
    if ( HDDAll > 0) {
      // (22)
      SSDmedS = RemS - HDDmedS
    }
    else {
      // (23)
      SSDmedS = RemS
    }
    debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfServersInitially", 213, `[chassisID=${actualChassisID},dcItem=${dcItem}] HDDmedS=${HDDmedS}, SSDmedS=${SSDmedS}, NmedS=${NmedS}, NdS=${NdS}`,0,0,0)
            
    /// Check: All above must serve AllmedS (1) = maxAllMediaSum >= HDDmedS + SSDmedS + NmedS + NdS and AllS = maxAllSlots >= HDDmedS + SSDmedS + NmedS
    if ( chassisArrayLocal[actualChassisID].maxAllMediaSum < (Math.max(HDDmedS,SSDmedS) + NmedS + NdS)) {
      debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfServersInitially", 217, `  [chassisID=${actualChassisID},dcItem=${dcItem}] Error - more slots assigned to media than available in chassis - DC# ${dcItem} for chassisConfig ${actualChassisID} `,0,0,0)
    }
    if ( chassisArrayLocal[actualChassisID].maxAllSlots < (Math.max(HDDmedS,SSDmedS) + NmedS)) {
      debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfServersInitially", 220, `[chassisID=${actualChassisID},dcItem=${dcItem}] Error - more slots in drive slots assigned to media than available in chassis - DC# ${dcItem} for chassisConfig ${actualChassisID} `,0,0,0)
    }

    // Results: If the initial number of servers calculated is larger then the resulting number of servers for any of the media types (HDD, SSD, NVMe) in the drive slots, the number of servers must be raised.
    //        Also, if the number of NVMes provided in all slots (drive and dedicated slots), the number of servers must be raised.
    debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfServersInitially", 225, `[chassisID=${actualChassisID},dcItem=${dcItem}], localNumberOfAllNVMe=${localNumberOfAllNVMe}`,0,0,0)
    let actualNumberOfServersForNVMe = 0
    if ((NmedS + NdS)> 0) {
      actualNumberOfServersForNVMe = Math.ceil(localNumberOfAllNVMe / (Number(NmedS) + Number(NdS)))
      let tempactualNumberOfServersForNVMe = 0
      let tempNmedSplusNdS = 0
      tempNmedSplusNdS = (Number(NmedS) + Number(NdS))
      tempactualNumberOfServersForNVMe = localNumberOfAllNVMe / (Number(NmedS) + Number(NdS))
      debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfServersInitially", 233, `[chassisID=${actualChassisID},dcItem=${dcItem}] actualNumberOfServersForNVMe=${actualNumberOfServersForNVMe}, tempactualNumberOfServersForNVMe=${tempactualNumberOfServersForNVMe}, tempNmedSplusNdS=${tempNmedSplusNdS}`,0,0,0)
    }
    let actualNumberOfServersForHDD = 0
    if (HDDmedS > 0) {
      actualNumberOfServersForHDD = Math.ceil(dcConfigArrayLocal[dcItem].numberOfHDDNeeded / HDDmedS)
      debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfServersInitially", 238, `[chassisID=${actualChassisID},dcItem=${dcItem}] actualNumberOfServersForHDD=${actualNumberOfServersForHDD}`,0,0,0)
    }
    let actualNumberOfServersForSSD = 0
    if (SSDmedS > 0) {
      actualNumberOfServersForSSD = Math.ceil(localNumberOfAllSSD / SSDmedS)
      debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfServersInitially", 243, `[chassisID=${actualChassisID},dcItem=${dcItem}] actualNumberOfServersForSSD=${actualNumberOfServersForSSD}`,0,0,0)
    }
    // The max of all gives the required server number based on chassis config for media.
    dcConfigArrayLocal[dcItem].numberOfServersNeededBasedOnChassisConfig = Math.max(actualNumberOfServersForNVMe, actualNumberOfServersForHDD, actualNumberOfServersForSSD)
    debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfServersInitially", 247, `[chassisID=${actualChassisID},dcItem=${dcItem}] dcConfigArrayLocal[dcItem].numberOfServersNeededBasedOnChassisConfig=${dcConfigArrayLocal[dcItem].numberOfServersNeededBasedOnChassisConfig} = Math.max(actualNumberOfServersForNVMe=${actualNumberOfServersForNVMe}, actualNumberOfServersForHDD=${actualNumberOfServersForHDD}, actualNumberOfServersForSSD=${actualNumberOfServersForSSD}) `,0,0,0)
    
    
    // CHECK: the number of SSD must now match the number of SSD required per HDD pack (hddToSSD4) plus all other SSD/#servers
    let numberOfSSDPerServer = 0
    if (chassisArrayLocal[actualChassisID].useSSD4overNVMe4 > 0){
      if ( (HDDmedS/chassisArrayLocal[actualChassisID].hddToSSD4) < (dcConfigArrayLocal[dcItem].numberOfSSD4Needed/actualNumberOfServersForHDD) ){
        numberOfSSDPerServer = Math.ceil(dcConfigArrayLocal[dcItem].numberOfSSD4Needed/dcConfigArrayLocal[dcItem].numberOfServersNeededBasedOnChassisConfig) + Math.ceil((dcConfigArrayLocal[dcItem].numberOfSSD1NeededWithoutDedicatedRocksDBNorWAL + dcConfigArrayLocal[dcItem].numberOfSSD1NeededWithDedicatedRocksDBIncludingWAL)/dcConfigArrayLocal[dcItem].numberOfServersNeededBasedOnChassisConfig)
        debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfServersInitially", 255, `[chassisID=${actualChassisID},dcItem=${dcItem}] numberOfSSDPerServer=${numberOfSSDPerServer} = Math.ceil(dcConfigArrayLocal[dcItem].numberOfSSD4Needed=${dcConfigArrayLocal[dcItem].numberOfSSD4Needed}/dcConfigArrayLocal[dcItem].numberOfServersNeededBasedOnChassisConfig=${dcConfigArrayLocal[dcItem].numberOfServersNeededBasedOnChassisConfig}) + Math.ceil((dcConfigArrayLocal[dcItem].numberOfSSD1NeededWithoutDedicatedRocksDBNorWAL=${dcConfigArrayLocal[dcItem].numberOfSSD1NeededWithoutDedicatedRocksDBNorWAL} + dcConfigArrayLocal[dcItem].numberOfSSD1NeededWithDedicatedRocksDBIncludingWAL=${dcConfigArrayLocal[dcItem].numberOfSSD1NeededWithDedicatedRocksDBIncludingWAL})/dcConfigArrayLocal[dcItem].numberOfServersNeededBasedOnChassisConfig=${dcConfigArrayLocal[dcItem].numberOfServersNeededBasedOnChassisConfig})`,0,0,0)  
      }
      else {
        if (Math.ceil(HDDAll/chassisArrayLocal[actualChassisID].hddToSSD4) > Math.ceil(HDDmedS/chassisArrayLocal[actualChassisID].hddToSSD4)){
          numberOfSSDPerServer = Math.ceil(HDDmedS/chassisArrayLocal[actualChassisID].hddToSSD4) + Math.ceil((dcConfigArrayLocal[dcItem].numberOfSSD1NeededWithoutDedicatedRocksDBNorWAL + dcConfigArrayLocal[dcItem].numberOfSSD1NeededWithDedicatedRocksDBIncludingWAL)/dcConfigArrayLocal[dcItem].numberOfServersNeededBasedOnChassisConfig)
          debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfServersInitially", 260, `[chassisID=${actualChassisID},dcItem=${dcItem}] numberOfSSDPerServer=${numberOfSSDPerServer} = Math.ceil(HDDmedS=${HDDmedS}/chassisArrayLocal[actualChassisID].hddToSSD4=${chassisArrayLocal[actualChassisID].hddToSSD4}) + Math.ceil((dcConfigArrayLocal[dcItem].numberOfSSD1NeededWithoutDedicatedRocksDBNorWAL=${dcConfigArrayLocal[dcItem].numberOfSSD1NeededWithoutDedicatedRocksDBNorWAL} + dcConfigArrayLocal[dcItem].numberOfSSD1NeededWithDedicatedRocksDBIncludingWAL=${dcConfigArrayLocal[dcItem].numberOfSSD1NeededWithDedicatedRocksDBIncludingWAL})/dcConfigArrayLocal[dcItem].numberOfServersNeededBasedOnChassisConfig=${dcConfigArrayLocal[dcItem].numberOfServersNeededBasedOnChassisConfig})`,0,0,0)    
        }
        else {
          numberOfSSDPerServer = Math.ceil(HDDAll/chassisArrayLocal[actualChassisID].hddToSSD4) + Math.ceil((dcConfigArrayLocal[dcItem].numberOfSSD1NeededWithoutDedicatedRocksDBNorWAL + dcConfigArrayLocal[dcItem].numberOfSSD1NeededWithDedicatedRocksDBIncludingWAL)/dcConfigArrayLocal[dcItem].numberOfServersNeededBasedOnChassisConfig)
          debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfServersInitially", 264, `[chassisID=${actualChassisID},dcItem=${dcItem}] numberOfSSDPerServer=${numberOfSSDPerServer} = Math.ceil(HDDAll=${HDDmedS}/chassisArrayLocal[actualChassisID].hddToSSD4=${chassisArrayLocal[actualChassisID].hddToSSD4}) + Math.ceil((dcConfigArrayLocal[dcItem].numberOfSSD1NeededWithoutDedicatedRocksDBNorWAL=${dcConfigArrayLocal[dcItem].numberOfSSD1NeededWithoutDedicatedRocksDBNorWAL} + dcConfigArrayLocal[dcItem].numberOfSSD1NeededWithDedicatedRocksDBIncludingWAL=${dcConfigArrayLocal[dcItem].numberOfSSD1NeededWithDedicatedRocksDBIncludingWAL})/dcConfigArrayLocal[dcItem].numberOfServersNeededBasedOnChassisConfig=${dcConfigArrayLocal[dcItem].numberOfServersNeededBasedOnChassisConfig})`,0,0,0)    
        }
      }
    }
    else {
      
        numberOfSSDPerServer = Math.ceil((dcConfigArrayLocal[dcItem].numberOfSSD1NeededWithoutDedicatedRocksDBNorWAL + dcConfigArrayLocal[dcItem].numberOfSSD1NeededWithDedicatedRocksDBIncludingWAL)/dcConfigArrayLocal[dcItem].numberOfServersNeededBasedOnChassisConfig)
        debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfServersInitially", 271, `[chassisID=${actualChassisID},dcItem=${dcItem}] numberOfSSDPerServer=${numberOfSSDPerServer} = Math.ceil((dcConfigArrayLocal[dcItem].numberOfSSD1NeededWithoutDedicatedRocksDBNorWAL=${dcConfigArrayLocal[dcItem].numberOfSSD1NeededWithoutDedicatedRocksDBNorWAL} + dcConfigArrayLocal[dcItem].numberOfSSD1NeededWithDedicatedRocksDBIncludingWAL=${dcConfigArrayLocal[dcItem].numberOfSSD1NeededWithDedicatedRocksDBIncludingWAL})/dcConfigArrayLocal[dcItem].numberOfServersNeededBasedOnChassisConfig=${dcConfigArrayLocal[dcItem].numberOfServersNeededBasedOnChassisConfig})`,0,0,0)  
    }
    
    // CHECK: the number of NVMe must now match the number of NVMe required per HDD pack (hddToNVMe4) +
    //        the number of any NVMe required for SSD fronting or WAL, or NVMe WAL
    let numberOfNMVePerServer = 0
    if (chassisArrayLocal[actualChassisID].useSSD4overNVMe4 < 1){
      if ( (HDDmedS/chassisArrayLocal[actualChassisID].hddToNVMe4) < (dcConfigArrayLocal[dcItem].numberOfNVMe4Needed/actualNumberOfServersForHDD) ){
        debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfServersInitially", 279, `[chassisID=${actualChassisID},dcItem=${dcItem}] IS: (HDDmedS=${HDDmedS}/chassisArrayLocal[actualChassisID].hddToNVMe4=${chassisArrayLocal[actualChassisID].hddToNVMe4}) < (dcConfigArrayLocal[dcItem].numberOfNVMe4Needed=${dcConfigArrayLocal[dcItem].numberOfNVMe4Needed}/actualNumberOfServersForHDD=${actualNumberOfServersForHDD})`,0,0,0)
        numberOfNMVePerServer = Math.ceil(dcConfigArrayLocal[dcItem].numberOfNVMe4Needed/dcConfigArrayLocal[dcItem].numberOfServersNeededBasedOnChassisConfig) 
                              + Math.ceil(Math.ceil(dcConfigArrayLocal[dcItem].numberOfSSD1NeededWithDedicatedRocksDBIncludingWAL/dcConfigArrayLocal[dcItem].numberOfServersNeededBasedOnChassisConfig)/chassisArrayLocal[actualChassisID].ssdToNVMe5) 
                              + Math.ceil(Math.ceil(dcConfigArrayLocal[dcItem].numberOfSSD1NeededWithDedicatedRocksDBDedicatedWAL/dcConfigArrayLocal[dcItem].numberOfServersNeededBasedOnChassisConfig)/chassisArrayLocal[actualChassisID].ssdToNVMe5) 
                              + Math.ceil(Math.ceil(dcConfigArrayLocal[dcItem].numberOfSSD1NeededWithoutDedicatedRocksDBDedicatedWAL/dcConfigArrayLocal[dcItem].numberOfServersNeededBasedOnChassisConfig)/chassisArrayLocal[actualChassisID].ssdToOptane) 
                              + Math.ceil(Math.ceil(dcConfigArrayLocal[dcItem].numberOfSSD1NeededWithDedicatedRocksDBDedicatedWAL/dcConfigArrayLocal[dcItem].numberOfServersNeededBasedOnChassisConfig)/chassisArrayLocal[actualChassisID].ssdToOptane) 
                              + Math.ceil(Math.ceil(dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithDedicatedRocksDBDedicatedWAL/dcConfigArrayLocal[dcItem].numberOfServersNeededBasedOnChassisConfig)/chassisArrayLocal[actualChassisID].nvmeToNVMe8) 
                              + Math.ceil(Math.ceil(dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithDedicatedRocksDBIncludingWAL/dcConfigArrayLocal[dcItem].numberOfServersNeededBasedOnChassisConfig)/chassisArrayLocal[actualChassisID].nvmeToNVMe8) 
                              + Math.ceil(Math.ceil(dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithoutDedicatedRocksDBDedicatedWAL/dcConfigArrayLocal[dcItem].numberOfServersNeededBasedOnChassisConfig)/chassisArrayLocal[actualChassisID].nvmeToNVMe7) 
                              + Math.ceil(Math.ceil(dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithDedicatedRocksDBDedicatedWAL/dcConfigArrayLocal[dcItem].numberOfServersNeededBasedOnChassisConfig)/chassisArrayLocal[actualChassisID].nvmeToNVMe7) 
                              + Math.ceil(dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithoutDedicatedRocksDBNorWAL / dcConfigArrayLocal[dcItem].numberOfServersNeededBasedOnChassisConfig)
                              + Math.ceil(dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithoutDedicatedRocksDBDedicatedWAL / dcConfigArrayLocal[dcItem].numberOfServersNeededBasedOnChassisConfig)
                              + Math.ceil(dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithDedicatedRocksDBDedicatedWAL / dcConfigArrayLocal[dcItem].numberOfServersNeededBasedOnChassisConfig)
                              + Math.ceil(dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithDedicatedRocksDBIncludingWAL / dcConfigArrayLocal[dcItem].numberOfServersNeededBasedOnChassisConfig)
        debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfServersInitially", 293, `[chassisID=${actualChassisID},dcItem=${dcItem}] numberOfNMVePerServer=${numberOfNMVePerServer} = 
                    Math.ceil(dcConfigArrayLocal[dcItem].numberOfNVMe4Needed=${dcConfigArrayLocal[dcItem].numberOfNVMe4Needed}/dcConfigArrayLocal[dcItem].numberOfServersNeededBasedOnChassisConfig=${dcConfigArrayLocal[dcItem].numberOfServersNeededBasedOnChassisConfig}) 
                    + Math.ceil(Math.ceil(dcConfigArrayLocal[dcItem].numberOfSSD1NeededWithDedicatedRocksDBIncludingWAL=${dcConfigArrayLocal[dcItem].numberOfSSD1NeededWithDedicatedRocksDBIncludingWAL}/dcConfigArrayLocal[dcItem].numberOfServersNeededBasedOnChassisConfig=${dcConfigArrayLocal[dcItem].numberOfServersNeededBasedOnChassisConfig})/chassisArrayLocal[actualChassisID].ssdToNVMe5=${chassisArrayLocal[actualChassisID].ssdToNVMe5}) 
                    + Math.ceil(Math.ceil(dcConfigArrayLocal[dcItem].numberOfSSD1NeededWithDedicatedRocksDBDedicatedWAL=${dcConfigArrayLocal[dcItem].numberOfSSD1NeededWithDedicatedRocksDBDedicatedWAL}/dcConfigArrayLocal[dcItem].numberOfServersNeededBasedOnChassisConfig=${dcConfigArrayLocal[dcItem].numberOfServersNeededBasedOnChassisConfig})/chassisArrayLocal[actualChassisID].ssdToNVMe5=${chassisArrayLocal[actualChassisID].ssdToNVMe5}) 
                    + Math.ceil(Math.ceil(dcConfigArrayLocal[dcItem].numberOfSSD1NeededWithoutDedicatedRocksDBDedicatedWAL=${dcConfigArrayLocal[dcItem].numberOfSSD1NeededWithoutDedicatedRocksDBDedicatedWAL}/dcConfigArrayLocal[dcItem].numberOfServersNeededBasedOnChassisConfig=${dcConfigArrayLocal[dcItem].numberOfServersNeededBasedOnChassisConfig})/chassisArrayLocal[actualChassisID].ssdToOptane=${chassisArrayLocal[actualChassisID].ssdToOptane}) 
                    + Math.ceil(Math.ceil(dcConfigArrayLocal[dcItem].numberOfSSD1NeededWithDedicatedRocksDBDedicatedWAL=${dcConfigArrayLocal[dcItem].numberOfSSD1NeededWithDedicatedRocksDBDedicatedWAL}/dcConfigArrayLocal[dcItem].numberOfServersNeededBasedOnChassisConfig=${dcConfigArrayLocal[dcItem].numberOfServersNeededBasedOnChassisConfig})/chassisArrayLocal[actualChassisID].ssdToOptane=${chassisArrayLocal[actualChassisID].ssdToOptane}) 
                    + Math.ceil(Math.ceil(dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithDedicatedRocksDBDedicatedWAL=${dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithDedicatedRocksDBDedicatedWAL}/dcConfigArrayLocal[dcItem].numberOfServersNeededBasedOnChassisConfig=${dcConfigArrayLocal[dcItem].numberOfServersNeededBasedOnChassisConfig})/chassisArrayLocal[actualChassisID].nvmeToNVMe8=${chassisArrayLocal[actualChassisID].nvmeToNVMe8}) 
                    + Math.ceil(Math.ceil(dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithDedicatedRocksDBIncludingWAL=${dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithDedicatedRocksDBIncludingWAL}/dcConfigArrayLocal[dcItem].numberOfServersNeededBasedOnChassisConfig=${dcConfigArrayLocal[dcItem].numberOfServersNeededBasedOnChassisConfig})/chassisArrayLocal[actualChassisID].nvmeToNVMe8=${chassisArrayLocal[actualChassisID].nvmeToNVMe8}) 
                    + Math.ceil(Math.ceil(dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithoutDedicatedRocksDBDedicatedWAL=${dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithoutDedicatedRocksDBDedicatedWAL}/dcConfigArrayLocal[dcItem].numberOfServersNeededBasedOnChassisConfig=${dcConfigArrayLocal[dcItem].numberOfServersNeededBasedOnChassisConfig})/chassisArrayLocal[actualChassisID].nvmeToNVMe7=${chassisArrayLocal[actualChassisID].nvmeToNVMe7}) 
                    + Math.ceil(Math.ceil(dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithDedicatedRocksDBDedicatedWAL=${dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithDedicatedRocksDBDedicatedWAL}/dcConfigArrayLocal[dcItem].numberOfServersNeededBasedOnChassisConfig=${dcConfigArrayLocal[dcItem].numberOfServersNeededBasedOnChassisConfig})/chassisArrayLocal[actualChassisID].nvmeToNVMe7=${chassisArrayLocal[actualChassisID].nvmeToNVMe7}) 
                    + Math.ceil(dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithoutDedicatedRocksDBNorWAL=${dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithoutDedicatedRocksDBNorWAL} / dcConfigArrayLocal[dcItem].numberOfServersNeededBasedOnChassisConfig=${dcConfigArrayLocal[dcItem].numberOfServersNeededBasedOnChassisConfig})
                    + Math.ceil(dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithoutDedicatedRocksDBDedicatedWAL=${dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithoutDedicatedRocksDBDedicatedWAL} / dcConfigArrayLocal[dcItem].numberOfServersNeededBasedOnChassisConfig=${dcConfigArrayLocal[dcItem].numberOfServersNeededBasedOnChassisConfig})
                    + Math.ceil(dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithDedicatedRocksDBDedicatedWAL=${dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithDedicatedRocksDBDedicatedWAL} / dcConfigArrayLocal[dcItem].numberOfServersNeededBasedOnChassisConfig=${dcConfigArrayLocal[dcItem].numberOfServersNeededBasedOnChassisConfig})
                    + Math.ceil(dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithDedicatedRocksDBIncludingWAL=${dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithDedicatedRocksDBIncludingWAL} / dcConfigArrayLocal[dcItem].numberOfServersNeededBasedOnChassisConfig=${dcConfigArrayLocal[dcItem].numberOfServersNeededBasedOnChassisConfig})        
        `,0,0,0)
        /**
        if (chassisArrayLocal[actualChassisID].useOptane1) {
          numberOfNMVePerServer += Math.ceil(Math.ceil(dcConfigArrayLocal[dcItem].numberOfSSD1NeededWithDedicatedRocksDBIncludingWAL/dcConfigArrayLocal[dcItem].numberOfServersNeededBasedOnChassisConfig)/chassisArrayLocal[actualChassisID].ssdToOptane)
          debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfServersInitially", 312, `[chassisID=${actualChassisID},dcItem=${dcItem}] adding Optanes: numberOfNMVePerServer=${numberOfNMVePerServer}`,0,0,0)
        }
        debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfServersInitially", 314, `[chassisID=${actualChassisID},dcItem=${dcItem}] numberOfNMVePerServer=${numberOfNMVePerServer}`,0,0,0)
         */
      }
      else {
        numberOfNMVePerServer = Math.ceil(HDDmedS/chassisArrayLocal[actualChassisID].hddToNVMe4) 
        + Math.ceil(Math.ceil(dcConfigArrayLocal[dcItem].numberOfSSD1NeededWithDedicatedRocksDBIncludingWAL/dcConfigArrayLocal[dcItem].numberOfServersNeededBasedOnChassisConfig)/chassisArrayLocal[actualChassisID].ssdToNVMe5) 
        + Math.ceil(Math.ceil(dcConfigArrayLocal[dcItem].numberOfSSD1NeededWithDedicatedRocksDBDedicatedWAL/dcConfigArrayLocal[dcItem].numberOfServersNeededBasedOnChassisConfig)/chassisArrayLocal[actualChassisID].ssdToNVMe5) 
        + Math.ceil(Math.ceil(dcConfigArrayLocal[dcItem].numberOfSSD1NeededWithoutDedicatedRocksDBDedicatedWAL/dcConfigArrayLocal[dcItem].numberOfServersNeededBasedOnChassisConfig)/chassisArrayLocal[actualChassisID].ssdToOptane) 
        + Math.ceil(Math.ceil(dcConfigArrayLocal[dcItem].numberOfSSD1NeededWithDedicatedRocksDBDedicatedWAL/dcConfigArrayLocal[dcItem].numberOfServersNeededBasedOnChassisConfig)/chassisArrayLocal[actualChassisID].ssdToOptane) 
        + Math.ceil(Math.ceil(dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithDedicatedRocksDBDedicatedWAL/dcConfigArrayLocal[dcItem].numberOfServersNeededBasedOnChassisConfig)/chassisArrayLocal[actualChassisID].nvmeToNVMe8) 
        + Math.ceil(Math.ceil(dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithDedicatedRocksDBIncludingWAL/dcConfigArrayLocal[dcItem].numberOfServersNeededBasedOnChassisConfig)/chassisArrayLocal[actualChassisID].nvmeToNVMe8) 
        + Math.ceil(Math.ceil(dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithoutDedicatedRocksDBDedicatedWAL/dcConfigArrayLocal[dcItem].numberOfServersNeededBasedOnChassisConfig)/chassisArrayLocal[actualChassisID].nvmeToNVMe7) 
        + Math.ceil(Math.ceil(dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithDedicatedRocksDBDedicatedWAL/dcConfigArrayLocal[dcItem].numberOfServersNeededBasedOnChassisConfig)/chassisArrayLocal[actualChassisID].nvmeToNVMe7) 
        + Math.ceil(dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithoutDedicatedRocksDBNorWAL / dcConfigArrayLocal[dcItem].numberOfServersNeededBasedOnChassisConfig)
        + Math.ceil(dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithoutDedicatedRocksDBDedicatedWAL / dcConfigArrayLocal[dcItem].numberOfServersNeededBasedOnChassisConfig)
        + Math.ceil(dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithDedicatedRocksDBDedicatedWAL / dcConfigArrayLocal[dcItem].numberOfServersNeededBasedOnChassisConfig)
        + Math.ceil(dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithDedicatedRocksDBIncludingWAL / dcConfigArrayLocal[dcItem].numberOfServersNeededBasedOnChassisConfig)
        debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfServersInitially", 330, `[chassisID=${actualChassisID},dcItem=${dcItem}] numberOfNMVePerServer=${numberOfNMVePerServer} = 
                    Math.ceil(HDDmedS=${HDDmedS}/chassisArrayLocal[actualChassisID].hddToNVMe4=${chassisArrayLocal[actualChassisID].hddToNVMe4}) 
                    + Math.ceil(Math.ceil(dcConfigArrayLocal[dcItem].numberOfSSD1NeededWithDedicatedRocksDBIncludingWAL=${dcConfigArrayLocal[dcItem].numberOfSSD1NeededWithDedicatedRocksDBIncludingWAL}/dcConfigArrayLocal[dcItem].numberOfServersNeededBasedOnChassisConfig=${dcConfigArrayLocal[dcItem].numberOfServersNeededBasedOnChassisConfig})/chassisArrayLocal[actualChassisID].ssdToNVMe5=${chassisArrayLocal[actualChassisID].ssdToNVMe5}) 
                    + Math.ceil(Math.ceil(dcConfigArrayLocal[dcItem].numberOfSSD1NeededWithDedicatedRocksDBDedicatedWAL=${dcConfigArrayLocal[dcItem].numberOfSSD1NeededWithDedicatedRocksDBDedicatedWAL}/dcConfigArrayLocal[dcItem].numberOfServersNeededBasedOnChassisConfig=${dcConfigArrayLocal[dcItem].numberOfServersNeededBasedOnChassisConfig})/chassisArrayLocal[actualChassisID].ssdToNVMe5=${chassisArrayLocal[actualChassisID].ssdToNVMe5}) 
                    + Math.ceil(Math.ceil(dcConfigArrayLocal[dcItem].numberOfSSD1NeededWithoutDedicatedRocksDBDedicatedWAL=${dcConfigArrayLocal[dcItem].numberOfSSD1NeededWithoutDedicatedRocksDBDedicatedWAL}/dcConfigArrayLocal[dcItem].numberOfServersNeededBasedOnChassisConfig=${dcConfigArrayLocal[dcItem].numberOfServersNeededBasedOnChassisConfig})/chassisArrayLocal[actualChassisID].ssdToOptane=${chassisArrayLocal[actualChassisID].ssdToOptane}) 
                    + Math.ceil(Math.ceil(dcConfigArrayLocal[dcItem].numberOfSSD1NeededWithDedicatedRocksDBDedicatedWAL=${dcConfigArrayLocal[dcItem].numberOfSSD1NeededWithDedicatedRocksDBDedicatedWAL}/dcConfigArrayLocal[dcItem].numberOfServersNeededBasedOnChassisConfig=${dcConfigArrayLocal[dcItem].numberOfServersNeededBasedOnChassisConfig})/chassisArrayLocal[actualChassisID].ssdToOptane=${chassisArrayLocal[actualChassisID].ssdToOptane}) 
                    + Math.ceil(Math.ceil(dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithDedicatedRocksDBDedicatedWAL=${dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithDedicatedRocksDBDedicatedWAL}/dcConfigArrayLocal[dcItem].numberOfServersNeededBasedOnChassisConfig=${dcConfigArrayLocal[dcItem].numberOfServersNeededBasedOnChassisConfig})/chassisArrayLocal[actualChassisID].nvmeToNVMe8=${chassisArrayLocal[actualChassisID].nvmeToNVMe8}) 
                    + Math.ceil(Math.ceil(dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithDedicatedRocksDBIncludingWAL=${dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithDedicatedRocksDBIncludingWAL}/dcConfigArrayLocal[dcItem].numberOfServersNeededBasedOnChassisConfig=${dcConfigArrayLocal[dcItem].numberOfServersNeededBasedOnChassisConfig})/chassisArrayLocal[actualChassisID].nvmeToNVMe8=${chassisArrayLocal[actualChassisID].nvmeToNVMe8}) 
                    + Math.ceil(Math.ceil(dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithoutDedicatedRocksDBDedicatedWAL=${dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithoutDedicatedRocksDBDedicatedWAL}/dcConfigArrayLocal[dcItem].numberOfServersNeededBasedOnChassisConfig=${dcConfigArrayLocal[dcItem].numberOfServersNeededBasedOnChassisConfig})/chassisArrayLocal[actualChassisID].nvmeToNVMe7=${chassisArrayLocal[actualChassisID].nvmeToNVMe7}) 
                    + Math.ceil(Math.ceil(dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithDedicatedRocksDBDedicatedWAL=${dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithDedicatedRocksDBDedicatedWAL}/dcConfigArrayLocal[dcItem].numberOfServersNeededBasedOnChassisConfig=${dcConfigArrayLocal[dcItem].numberOfServersNeededBasedOnChassisConfig})/chassisArrayLocal[actualChassisID].nvmeToNVMe7=${chassisArrayLocal[actualChassisID].nvmeToNVMe7}) 
                    + Math.ceil(dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithoutDedicatedRocksDBNorWAL=${dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithoutDedicatedRocksDBNorWAL} / dcConfigArrayLocal[dcItem].numberOfServersNeededBasedOnChassisConfig=${dcConfigArrayLocal[dcItem].numberOfServersNeededBasedOnChassisConfig})
                    + Math.ceil(dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithoutDedicatedRocksDBDedicatedWAL=${dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithoutDedicatedRocksDBDedicatedWAL} / dcConfigArrayLocal[dcItem].numberOfServersNeededBasedOnChassisConfig=${dcConfigArrayLocal[dcItem].numberOfServersNeededBasedOnChassisConfig})
                    + Math.ceil(dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithDedicatedRocksDBDedicatedWAL=${dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithDedicatedRocksDBDedicatedWAL} / dcConfigArrayLocal[dcItem].numberOfServersNeededBasedOnChassisConfig=${dcConfigArrayLocal[dcItem].numberOfServersNeededBasedOnChassisConfig})
                    + Math.ceil(dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithDedicatedRocksDBIncludingWAL=${dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithDedicatedRocksDBIncludingWAL} / dcConfigArrayLocal[dcItem].numberOfServersNeededBasedOnChassisConfig=${dcConfigArrayLocal[dcItem].numberOfServersNeededBasedOnChassisConfig})        
        `,0,0,0)
        /**
        if (chassisArrayLocal[actualChassisID].useOptane1) {
          numberOfNMVePerServer += Math.ceil(dcConfigArrayLocal[dcItem].numberOfSSD1NeededWithDedicatedRocksDBIncludingWAL/chassisArrayLocal[actualChassisID].ssdToOptane) 
          debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfServersInitially", 348, `[chassisID=${actualChassisID},dcItem=${dcItem}] adding Optanes: numberOfNMVePerServer=${numberOfNMVePerServer}`,0,0,0)
        }
        debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfServersInitially", 350, `[chassisID=${actualChassisID},dcItem=${dcItem}] numberOfNMVePerServer=${numberOfNMVePerServer}`,0,0,0)
         */
      }
    }
    else {  
      numberOfNMVePerServer = Math.ceil(Math.ceil(dcConfigArrayLocal[dcItem].numberOfSSD1NeededWithDedicatedRocksDBIncludingWAL/dcConfigArrayLocal[dcItem].numberOfServersNeededBasedOnChassisConfig)/chassisArrayLocal[actualChassisID].ssdToNVMe5) 
                            + Math.ceil(Math.ceil(dcConfigArrayLocal[dcItem].numberOfSSD1NeededWithDedicatedRocksDBDedicatedWAL/dcConfigArrayLocal[dcItem].numberOfServersNeededBasedOnChassisConfig)/chassisArrayLocal[actualChassisID].ssdToNVMe5) 
                            + Math.ceil(Math.ceil(dcConfigArrayLocal[dcItem].numberOfSSD1NeededWithoutDedicatedRocksDBDedicatedWAL/dcConfigArrayLocal[dcItem].numberOfServersNeededBasedOnChassisConfig)/chassisArrayLocal[actualChassisID].ssdToOptane) 
                            + Math.ceil(Math.ceil(dcConfigArrayLocal[dcItem].numberOfSSD1NeededWithDedicatedRocksDBDedicatedWAL/dcConfigArrayLocal[dcItem].numberOfServersNeededBasedOnChassisConfig)/chassisArrayLocal[actualChassisID].ssdToOptane) 
                            + Math.ceil(Math.ceil(dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithDedicatedRocksDBDedicatedWAL/dcConfigArrayLocal[dcItem].numberOfServersNeededBasedOnChassisConfig)/chassisArrayLocal[actualChassisID].nvmeToNVMe8) 
                            + Math.ceil(Math.ceil(dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithDedicatedRocksDBIncludingWAL/dcConfigArrayLocal[dcItem].numberOfServersNeededBasedOnChassisConfig)/chassisArrayLocal[actualChassisID].nvmeToNVMe8) 
                            + Math.ceil(Math.ceil(dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithoutDedicatedRocksDBDedicatedWAL/dcConfigArrayLocal[dcItem].numberOfServersNeededBasedOnChassisConfig)/chassisArrayLocal[actualChassisID].nvmeToNVMe7) 
                            + Math.ceil(Math.ceil(dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithDedicatedRocksDBDedicatedWAL/dcConfigArrayLocal[dcItem].numberOfServersNeededBasedOnChassisConfig)/chassisArrayLocal[actualChassisID].nvmeToNVMe7) 
                            + Math.ceil(dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithoutDedicatedRocksDBNorWAL / dcConfigArrayLocal[dcItem].numberOfServersNeededBasedOnChassisConfig)
                            + Math.ceil(dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithoutDedicatedRocksDBDedicatedWAL / dcConfigArrayLocal[dcItem].numberOfServersNeededBasedOnChassisConfig)
                            + Math.ceil(dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithDedicatedRocksDBDedicatedWAL / dcConfigArrayLocal[dcItem].numberOfServersNeededBasedOnChassisConfig)
                            + Math.ceil(dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithDedicatedRocksDBIncludingWAL / dcConfigArrayLocal[dcItem].numberOfServersNeededBasedOnChassisConfig)
      debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfServersInitially", 367, `[chassisID=${actualChassisID},dcItem=${dcItem}] numberOfNMVePerServer=${numberOfNMVePerServer} = 
                            Math.ceil(Math.ceil(dcConfigArrayLocal[dcItem].numberOfSSD1NeededWithDedicatedRocksDBIncludingWAL=${dcConfigArrayLocal[dcItem].numberOfSSD1NeededWithDedicatedRocksDBIncludingWAL}/dcConfigArrayLocal[dcItem].numberOfServersNeededBasedOnChassisConfig=${dcConfigArrayLocal[dcItem].numberOfServersNeededBasedOnChassisConfig})/chassisArrayLocal[actualChassisID].ssdToNVMe5=${chassisArrayLocal[actualChassisID].ssdToNVMe5}) 
                            + Math.ceil(Math.ceil(dcConfigArrayLocal[dcItem].numberOfSSD1NeededWithDedicatedRocksDBDedicatedWAL=${dcConfigArrayLocal[dcItem].numberOfSSD1NeededWithDedicatedRocksDBDedicatedWAL}/dcConfigArrayLocal[dcItem].numberOfServersNeededBasedOnChassisConfig=${dcConfigArrayLocal[dcItem].numberOfServersNeededBasedOnChassisConfig})/chassisArrayLocal[actualChassisID].ssdToNVMe5=${chassisArrayLocal[actualChassisID].ssdToNVMe5}) 
                            + Math.ceil(Math.ceil(dcConfigArrayLocal[dcItem].numberOfSSD1NeededWithoutDedicatedRocksDBDedicatedWAL=${dcConfigArrayLocal[dcItem].numberOfSSD1NeededWithoutDedicatedRocksDBDedicatedWAL}/dcConfigArrayLocal[dcItem].numberOfServersNeededBasedOnChassisConfig=${dcConfigArrayLocal[dcItem].numberOfServersNeededBasedOnChassisConfig})/chassisArrayLocal[actualChassisID].ssdToOptane=${chassisArrayLocal[actualChassisID].ssdToOptane}) 
                            + Math.ceil(Math.ceil(dcConfigArrayLocal[dcItem].numberOfSSD1NeededWithDedicatedRocksDBDedicatedWAL=${dcConfigArrayLocal[dcItem].numberOfSSD1NeededWithDedicatedRocksDBDedicatedWAL}/dcConfigArrayLocal[dcItem].numberOfServersNeededBasedOnChassisConfig=${dcConfigArrayLocal[dcItem].numberOfServersNeededBasedOnChassisConfig})/chassisArrayLocal[actualChassisID].ssdToOptane=${chassisArrayLocal[actualChassisID].ssdToOptane}) 
                            + Math.ceil(Math.ceil(dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithDedicatedRocksDBDedicatedWAL=${dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithDedicatedRocksDBDedicatedWAL}/dcConfigArrayLocal[dcItem].numberOfServersNeededBasedOnChassisConfig=${dcConfigArrayLocal[dcItem].numberOfServersNeededBasedOnChassisConfig})/chassisArrayLocal[actualChassisID].nvmeToNVMe8=${chassisArrayLocal[actualChassisID].nvmeToNVMe8}) 
                            + Math.ceil(Math.ceil(dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithDedicatedRocksDBIncludingWAL=${dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithDedicatedRocksDBIncludingWAL}/dcConfigArrayLocal[dcItem].numberOfServersNeededBasedOnChassisConfig=${dcConfigArrayLocal[dcItem].numberOfServersNeededBasedOnChassisConfig})/chassisArrayLocal[actualChassisID].nvmeToNVMe8=${chassisArrayLocal[actualChassisID].nvmeToNVMe8}) 
                            + Math.ceil(Math.ceil(dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithoutDedicatedRocksDBDedicatedWAL=${dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithoutDedicatedRocksDBDedicatedWAL}/dcConfigArrayLocal[dcItem].numberOfServersNeededBasedOnChassisConfig=${dcConfigArrayLocal[dcItem].numberOfServersNeededBasedOnChassisConfig})/chassisArrayLocal[actualChassisID].nvmeToNVMe7=${chassisArrayLocal[actualChassisID].nvmeToNVMe7}) 
                            + Math.ceil(Math.ceil(dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithDedicatedRocksDBDedicatedWAL=${dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithDedicatedRocksDBDedicatedWAL}/dcConfigArrayLocal[dcItem].numberOfServersNeededBasedOnChassisConfig=${dcConfigArrayLocal[dcItem].numberOfServersNeededBasedOnChassisConfig})/chassisArrayLocal[actualChassisID].nvmeToNVMe7=${chassisArrayLocal[actualChassisID].nvmeToNVMe7}) 
                            + Math.ceil(dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithoutDedicatedRocksDBNorWAL=${dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithoutDedicatedRocksDBNorWAL} / dcConfigArrayLocal[dcItem].numberOfServersNeededBasedOnChassisConfig=${dcConfigArrayLocal[dcItem].numberOfServersNeededBasedOnChassisConfig})
                            + Math.ceil(dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithoutDedicatedRocksDBDedicatedWAL=${dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithoutDedicatedRocksDBDedicatedWAL} / dcConfigArrayLocal[dcItem].numberOfServersNeededBasedOnChassisConfig=${dcConfigArrayLocal[dcItem].numberOfServersNeededBasedOnChassisConfig})
                            + Math.ceil(dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithDedicatedRocksDBDedicatedWAL=${dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithDedicatedRocksDBDedicatedWAL} / dcConfigArrayLocal[dcItem].numberOfServersNeededBasedOnChassisConfig=${dcConfigArrayLocal[dcItem].numberOfServersNeededBasedOnChassisConfig})
                            + Math.ceil(dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithDedicatedRocksDBIncludingWAL=${dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithDedicatedRocksDBIncludingWAL} / dcConfigArrayLocal[dcItem].numberOfServersNeededBasedOnChassisConfig=${dcConfigArrayLocal[dcItem].numberOfServersNeededBasedOnChassisConfig})
      `,0,0,0)
      if (chassisArrayLocal[actualChassisID].useOptane1) {
        numberOfNMVePerServer += Math.ceil(dcConfigArrayLocal[dcItem].numberOfSSD1NeededWithDedicatedRocksDBIncludingWAL/chassisArrayLocal[actualChassisID].ssdToOptane) 
        debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfServersInitially", 383, `[chassisID=${actualChassisID},dcItem=${dcItem}] adding Optanes: numberOfNMVePerServer=${numberOfNMVePerServer}`,0,0,0)
      }
      debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfServersInitially", 385, `[chassisID=${actualChassisID},dcItem=${dcItem}] numberOfNMVePerServer=${numberOfNMVePerServer}`,0,0,0)
      
    }
    
    // The max of all gives the required server number based on chassis config for media.
    // Check the minimum number of servers required anyways for placing the role instances:
    
    // RFE: might be improved to really use tha ctual configuration of the workloads to pick the best h/w config and not pick more than needed for minimum - this actually assumes that there are always 2nd scale-out instances
    let localMinServersForRoles = dcConfigArrayLocal[dcItem].numberOfLocalSpecialInstances + Math.max(Math.ceil((dcConfigArrayLocal[dcItem].numberOfLocalScaleoutInstances+dcConfigArrayLocal[dcItem].numberOfNeededMonInstances)/2),dcConfigArrayLocal[dcItem].numberOfNeededMonInstances)
    debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfServersInitially", 394, `let localMinServersForRoles=${localMinServersForRoles} = dcConfigArrayLocal[dcItem].numberOfLocalSpecialInstances=${dcConfigArrayLocal[dcItem].numberOfLocalSpecialInstances} + Math.max(Math.ceil((dcConfigArrayLocal[dcItem].numberOfLocalScaleoutInstances=${dcConfigArrayLocal[dcItem].numberOfLocalScaleoutInstances}+dcConfigArrayLocal[dcItem].numberOfNeededMonInstances=${dcConfigArrayLocal[dcItem].numberOfNeededMonInstances})/2),dcConfigArrayLocal[dcItem].numberOfNeededMonInstances=${dcConfigArrayLocal[dcItem].numberOfNeededMonInstances})`,0,0,0)
    dcConfigArrayLocal[dcItem].numberOfServersNeededBasedOnChassisConfig = Math.max(actualNumberOfServersForNVMe, actualNumberOfServersForHDD, actualNumberOfServersForSSD, localMinServersForRoles)
    debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfServersInitially", 396, `[chassisID=${actualChassisID},dcItem=${dcItem}] dcConfigArrayLocal[dcItem].numberOfServersNeededBasedOnChassisConfig=${dcConfigArrayLocal[dcItem].numberOfServersNeededBasedOnChassisConfig} - restricted perhaps by localMinServersForRoles=${localMinServersForRoles}`,0,0,0)
  }
  else {
    if (generalValues.desiredSameMediaConfig === true ) {
      // Need to recalculate everything - but with the first calculation also estimating the addition NVMes required
      // when the initial number of servers got estimated: for all the special ones as NVMe type 2 and 6, the number 
      // gets corrected by at least the initialServer calculation, e.g., N2 with 2 media => N2 with #initialServer media
      debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfServersInitially", 403, `[chassisID=${actualChassisID},dcItem=${dcItem}] INFO - same media config is currently not supported`,0,0,0)
    }
  } 
}

export default dcConfigDetermineNumberOfServersInitially