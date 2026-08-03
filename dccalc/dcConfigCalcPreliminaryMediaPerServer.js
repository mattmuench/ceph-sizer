import displayMsg from "../common/displayMsg.js"
import {debugMsg} from "../common/debug.js";

const dcConfigCalcPreliminaryMediaPerServer = function (generalValues, dcConfigArrayLocal, dcItem, chassisArrayLocal, actualChassisID, numberOfServersNeeded) {
  let localDebugOn = false

  // Calculate preliminary number of media per server to avoid constantly calculating something that might be not that obvious at the time of use
  
  // Base media (block)
  if (chassisArrayLocal[actualChassisID].sizeHDD1 > 0) {
    dcConfigArrayLocal[dcItem].prelimPerServerNumberOfHDDWithoutDedicatedRocksDBNeeded = Math.ceil(dcConfigArrayLocal[dcItem].numberOfHDD1NeededWithoutDedicatedRocksDBNorWAL / numberOfServersNeeded) + Math.ceil(dcConfigArrayLocal[dcItem].numberOfHDD1NeededWithoutDedicatedRocksDBDedicatedWALonNVMe9 / numberOfServersNeeded) + Math.ceil(dcConfigArrayLocal[dcItem].numberOfHDD1NeededWithoutDedicatedRocksDBDedicatedWALonSSD9 / numberOfServersNeeded)
    dcConfigArrayLocal[dcItem].prelimPerServerNumberOfHDDWithDedicatedRockSDBonSSD4Needed = Math.ceil(dcConfigArrayLocal[dcItem].numberOfHDD1NeededWithDedicatedSSD4DedicatedWALonNVMe9 / numberOfServersNeeded) + Math.ceil(dcConfigArrayLocal[dcItem].numberOfHDD1NeededWithDedicatedSSD4DedicatedWALonSSD9 / numberOfServersNeeded) + Math.ceil(dcConfigArrayLocal[dcItem].numberOfHDD1NeededWithDedicatedSSD4IncludingWAL / numberOfServersNeeded)
    dcConfigArrayLocal[dcItem].prelimPerServerNumberOfHDDWithDedicatedRockSDBonNVMe4Needed = Math.ceil(dcConfigArrayLocal[dcItem].numberOfHDD1NeededWithDedicatedNVMe4DedicatedWALonNVMe9 / numberOfServersNeeded) + Math.ceil(dcConfigArrayLocal[dcItem].numberOfHDD1NeededWithDedicatedNVMe4DedicatedWALonSSD9 / numberOfServersNeeded) + Math.ceil(dcConfigArrayLocal[dcItem].numberOfHDD1NeededWithDedicatedNVMe4IncludingWAL / numberOfServersNeeded)
  }
  else {
    dcConfigArrayLocal[dcItem].prelimPerServerNumberOfHDDWithoutDedicatedRocksDBNeeded = 0
    dcConfigArrayLocal[dcItem].prelimPerServerNumberOfHDDWithDedicatedRockSDBonSSD4Needed = 0
    dcConfigArrayLocal[dcItem].prelimPerServerNumberOfHDDWithDedicatedRockSDBonNVMe4Needed = 0
  }
  dcConfigArrayLocal[dcItem].prelimPerServerNumberOfHDDNeeded = dcConfigArrayLocal[dcItem].prelimPerServerNumberOfHDDWithoutDedicatedRocksDBNeeded 
                                                              + dcConfigArrayLocal[dcItem].prelimPerServerNumberOfHDDWithDedicatedRockSDBonSSD4Needed
                                                              + dcConfigArrayLocal[dcItem].prelimPerServerNumberOfHDDWithDedicatedRockSDBonNVMe4Needed
  debugMsg(generalValues, localDebugOn, 5, "dcConfigCalcPreliminaryMediaPerServer", 23, `actualChassisID=${actualChassisID}, dcConfigArrayLocal[dcItem=${dcItem}].prelimPerServerNumberOfHDDNeeded=${dcConfigArrayLocal[dcItem].prelimPerServerNumberOfHDDNeeded}`,0,0,0)
  
  if (chassisArrayLocal[actualChassisID].sizeSSD1 > 0) {
    dcConfigArrayLocal[dcItem].prelimPerServerNumberOfSSDWithoutDedicatedNVMeNeeded = Math.ceil(dcConfigArrayLocal[dcItem].numberOfSSD1NeededWithoutDedicatedRocksDBNorWAL / numberOfServersNeeded) +  Math.ceil(dcConfigArrayLocal[dcItem].numberOfSSD1NeededWithoutDedicatedRocksDBDedicatedWAL / numberOfServersNeeded)
    dcConfigArrayLocal[dcItem].prelimPerServerNumberOfSSDWithDedicatedNVMeNeeded = Math.ceil(dcConfigArrayLocal[dcItem].numberOfSSD1NeededWithDedicatedRocksDBIncludingWAL / numberOfServersNeeded) + Math.ceil(dcConfigArrayLocal[dcItem].numberOfSSD1NeededWithDedicatedRocksDBDedicatedWAL / numberOfServersNeeded)
  }
  else {
    dcConfigArrayLocal[dcItem].prelimPerServerNumberOfSSDWithoutDedicatedNVMeNeeded = 0
    dcConfigArrayLocal[dcItem].prelimPerServerNumberOfSSDWithDedicatedNVMeNeeded = 0
  }
  dcConfigArrayLocal[dcItem].prelimPerServerNumberOfSSDNeeded = dcConfigArrayLocal[dcItem].prelimPerServerNumberOfSSDWithDedicatedNVMeNeeded 
                                                              + dcConfigArrayLocal[dcItem].prelimPerServerNumberOfSSDWithoutDedicatedNVMeNeeded
  debugMsg(generalValues, localDebugOn, 5, "dcConfigCalcPreliminaryMediaPerServer", 35, `actualChassisID=${actualChassisID}, dcConfigArrayLocal[dcItem=${dcItem}].prelimPerServerNumberOfSSDNeeded=${dcConfigArrayLocal[dcItem].prelimPerServerNumberOfSSDNeeded}`,0,0,0)
  
  if (chassisArrayLocal[actualChassisID].sizeNVMe1 > 0) {
    dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe1NeededWithDedicatedWAL = Math.ceil(dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithDedicatedRocksDBIncludingWAL / numberOfServersNeeded) + Math.ceil(dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithDedicatedRocksDBDedicatedWAL / numberOfServersNeeded)
    dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe1NeededWithoutDedicatedWAL = Math.ceil(dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithoutDedicatedRocksDBNorWAL / numberOfServersNeeded) + Math.ceil(dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithoutDedicatedRocksDBDedicatedWAL / numberOfServersNeeded)
  }
  else {
    dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe1NeededWithDedicatedWAL =0
    dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe1NeededWithoutDedicatedWAL = 0

  }
  dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe1Needed = dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe1NeededWithoutDedicatedWAL
                                                                + dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe1NeededWithDedicatedWAL
  debugMsg(generalValues, localDebugOn, 5, "dcConfigCalcPreliminaryMediaPerServer", 48, `actualChassisID=${actualChassisID}, dcConfigArrayLocal[dcItem=${dcItem}].prelimPerServerNumberOfNVMe1Needed=${dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe1Needed}`,0,0,0)

  // Dedicated media for RocksDB, WAL, dedicated index pool, and RGW cache media
  if (chassisArrayLocal[actualChassisID].sizeSSD4 > 0) {
    dcConfigArrayLocal[dcItem].prelimPerServerNumberOfSSD4Needed = Math.ceil(dcConfigArrayLocal[dcItem].numberOfSSD4Needed / numberOfServersNeeded)
    debugMsg(generalValues, localDebugOn, 5, "dcConfigCalcPreliminaryMediaPerServer", 51, `actualChassisID=${actualChassisID}, initial dcConfigArrayLocal[dcItem=${dcItem}].prelimPerServerNumberOfSSD4Needed=${dcConfigArrayLocal[dcItem].prelimPerServerNumberOfSSD4Needed}`,0,0,0)
    if (Math.ceil((dcConfigArrayLocal[dcItem].numberOfHDD1NeededWithDedicatedSSD4DedicatedWALonNVMe9 + dcConfigArrayLocal[dcItem].numberOfHDD1NeededWithDedicatedSSD4DedicatedWALonSSD9 + dcConfigArrayLocal[dcItem].numberOfHDD1NeededWithDedicatedSSD4IncludingWAL)/chassisArrayLocal[actualChassisID].hddToSSD4) > dcConfigArrayLocal[dcItem].prelimPerServerNumberOfSSD4Needed * numberOfServersNeeded){
      dcConfigArrayLocal[dcItem].prelimPerServerNumberOfSSD4Needed = Math.ceil(Math.ceil((dcConfigArrayLocal[dcItem].numberOfHDD1NeededWithDedicatedSSD4DedicatedWALonNVMe9 + dcConfigArrayLocal[dcItem].numberOfHDD1NeededWithDedicatedSSD4DedicatedWALonSSD9 + dcConfigArrayLocal[dcItem].numberOfHDD1NeededWithDedicatedSSD4IncludingWAL)/chassisArrayLocal[actualChassisID].hddToSSD4) / numberOfServersNeeded)
      debugMsg(generalValues, localDebugOn, 5, "dcConfigCalcPreliminaryMediaPerServer", 52, `actualChassisID=${actualChassisID}, corrected dcConfigArrayLocal[dcItem=${dcItem}].prelimPerServerNumberOfSSD4Needed=${dcConfigArrayLocal[dcItem].prelimPerServerNumberOfSSD4Needed} because ratio of HDD/SSD4 not preserved in calculation`,0,0,0)
    }
  }
  else {
    dcConfigArrayLocal[dcItem].prelimPerServerNumberOfSSD4Needed = 0
    debugMsg(generalValues, localDebugOn, 5, "dcConfigCalcPreliminaryMediaPerServer", 58, `actualChassisID=${actualChassisID}, dcConfigArrayLocal[dcItem=${dcItem}].prelimPerServerNumberOfSSD4Needed=${dcConfigArrayLocal[dcItem].prelimPerServerNumberOfSSD4Needed}`,0,0,0)
  }
  
  if (chassisArrayLocal[actualChassisID].sizeSSD9 > 0) {
    dcConfigArrayLocal[dcItem].prelimPerServerNumberOfSSD9Needed = Math.ceil(dcConfigArrayLocal[dcItem].numberOfSSD9Needed / numberOfServersNeeded)
    debugMsg(generalValues, localDebugOn, 5, "dcConfigCalcPreliminaryMediaPerServer", 66, `actualChassisID=${actualChassisID}, numberOfServersNeeded=${numberOfServersNeeded}, dcConfigArrayLocal[dcItem].prelimPerServerNumberOfSSD9Needed=${dcConfigArrayLocal[dcItem].prelimPerServerNumberOfSSD9Needed}`,0,0,0)
    debugMsg(generalValues, localDebugOn, 5, "dcConfigCalcPreliminaryMediaPerServer", 67, `actualChassisID=${actualChassisID}, initial dcConfigArrayLocal[dcItem=${dcItem}].prelimPerServerNumberOfSSD9Needed=${dcConfigArrayLocal[dcItem].prelimPerServerNumberOfSSD9Needed}`,0,0,0)
    if (Math.ceil((dcConfigArrayLocal[dcItem].numberOfHDD1NeededWithoutDedicatedRocksDBDedicatedWALonSSD9 + dcConfigArrayLocal[dcItem].numberOfHDD1NeededWithDedicatedSSD4DedicatedWALonSSD9 + dcConfigArrayLocal[dcItem].numberOfHDD1NeededWithDedicatedNVMe4DedicatedWALonSSD9)/chassisArrayLocal[actualChassisID].hddToSSD9) > dcConfigArrayLocal[dcItem].prelimPerServerNumberOfSSD9Needed * numberOfServersNeeded){
      debugMsg(generalValues, localDebugOn, 5, "dcConfigCalcPreliminaryMediaPerServer", 69, `actualChassisID=${actualChassisID}, if (Math.ceil((dcConfigArrayLocal[dcItem=${dcItem}].numberOfHDD1NeededWithoutDedicatedRocksDBDedicatedWALonSSD9=${dcConfigArrayLocal[dcItem].numberOfHDD1NeededWithoutDedicatedRocksDBDedicatedWALonSSD9} + dcConfigArrayLocal[dcItem=${dcItem}].numberOfHDD1NeededWithDedicatedSSD4DedicatedWALonSSD9=${dcConfigArrayLocal[dcItem].numberOfHDD1NeededWithDedicatedSSD4DedicatedWALonSSD9} + dcConfigArrayLocal[dcItem=${dcItem}].numberOfHDD1NeededWithDedicatedNVMe4DedicatedWALonSSD9=${dcConfigArrayLocal[dcItem].numberOfHDD1NeededWithDedicatedNVMe4DedicatedWALonSSD9})/chassisArrayLocal[actualChassisID=${actualChassisID}].hddToSSD9=${chassisArrayLocal[actualChassisID].hddToSSD9}) > dcConfigArrayLocal[dcItem=${dcItem}].prelimPerServerNumberOfSSD9Needed=${dcConfigArrayLocal[dcItem].prelimPerServerNumberOfSSD9Needed} * numberOfServersNeeded=${numberOfServersNeeded}){  `,0,0,0)
      dcConfigArrayLocal[dcItem].prelimPerServerNumberOfSSD9Needed = Math.ceil(Math.ceil((dcConfigArrayLocal[dcItem].numberOfHDD1NeededWithoutDedicatedRocksDBDedicatedWALonSSD9 + dcConfigArrayLocal[dcItem].numberOfHDD1NeededWithDedicatedSSD4DedicatedWALonSSD9 + dcConfigArrayLocal[dcItem].numberOfHDD1NeededWithDedicatedNVMe4DedicatedWALonSSD9)/chassisArrayLocal[actualChassisID].hddToSSD9) / numberOfServersNeeded)
      debugMsg(generalValues, localDebugOn, 5, "dcConfigCalcPreliminaryMediaPerServer", 71, `actualChassisID=${actualChassisID}, corrected dcConfigArrayLocal[dcItem=${dcItem}].prelimPerServerNumberOfSSD9Needed=${dcConfigArrayLocal[dcItem].prelimPerServerNumberOfSSD9Needed} because ratio of HDD/SSD9 not preserved in calculation`,0,0,0)
    }
  }
  else {
    dcConfigArrayLocal[dcItem].prelimPerServerNumberOfSSD9Needed = 0
    debugMsg(generalValues, localDebugOn, 5, "dcConfigCalcPreliminaryMediaPerServer", 76, `actualChassisID=${actualChassisID}, dcConfigArrayLocal[dcItem=${dcItem}].prelimPerServerNumberOfSSD9Needed=${dcConfigArrayLocal[dcItem].prelimPerServerNumberOfSSD9Needed}`,0,0,0)
  }
  
  if (chassisArrayLocal[actualChassisID].sizeNVMe2 > 0) {
    dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe2Needed = Math.ceil(dcConfigArrayLocal[dcItem].numberOfNVMe2Needed / numberOfServersNeeded)
    debugMsg(generalValues, localDebugOn, 5, "dcConfigCalcPreliminaryMediaPerServer", 81, `dcConfigArrayLocal[dcItem=${dcItem}].prelimPerServerNumberOfNVMe2Needed=${dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe2Needed}`,0,0,0)
  }
  else {
    dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe2Needed = 0
    debugMsg(generalValues, localDebugOn, 5, "dcConfigCalcPreliminaryMediaPerServer", 85, `dcConfigArrayLocal[dcItem=${dcItem}].prelimPerServerNumberOfNVMe2Needed=${dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe2Needed}`,0,0,0)
  }
  
  if (chassisArrayLocal[actualChassisID].sizeNVMe3 > 0) {
    dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe3Needed = Math.ceil(dcConfigArrayLocal[dcItem].numberOfNVMe3Needed / numberOfServersNeeded)
    debugMsg(generalValues, localDebugOn, 5, "dcConfigCalcPreliminaryMediaPerServer", 90, `actualChassisID=${actualChassisID}, dcConfigArrayLocal[dcItem=${dcItem}].prelimPerServerNumberOfNVMe3Needed=${dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe3Needed}`,0,0,0)
    if (Math.ceil((dcConfigArrayLocal[dcItem].numberOfSSD1NeededWithoutDedicatedRocksDBDedicatedWAL + dcConfigArrayLocal[dcItem].numberOfSSD1NeededWithDedicatedRocksDBDedicatedWAL) / chassisArrayLocal[actualChassisID].ssdToNVMe3) > dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe3Needed * numberOfServersNeeded){
      dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe3Needed = Math.ceil(Math.ceil((dcConfigArrayLocal[dcItem].numberOfSSD1NeededWithoutDedicatedRocksDBDedicatedWAL+dcConfigArrayLocal[dcItem].numberOfSSD1NeededWithDedicatedRocksDBDedicatedWAL)/chassisArrayLocal[actualChassisID].ssdToNVMe3) / numberOfServersNeeded)
      debugMsg(generalValues, localDebugOn, 5, "dcConfigCalcPreliminaryMediaPerServer", 93, `actualChassisID=${actualChassisID}, corrected dcConfigArrayLocal[dcItem=${dcItem}].prelimPerServerNumberOfNVMe3Needed=${dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe3Needed} because ratio of SSD1 with NVMe3/NVMe3 not preserved in calculation`,0,0,0)
    }
  }
  else {
    dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe3Needed = 0
    debugMsg(generalValues, localDebugOn, 5, "dcConfigCalcPreliminaryMediaPerServer", 98, `actualChassisID=${actualChassisID}, dcConfigArrayLocal[dcItem=${dcItem}].prelimPerServerNumberOfNVMe3Needed=${dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe3Needed}`,0,0,0)
  }
  
  if (chassisArrayLocal[actualChassisID].sizeNVMe4 > 0) {
    dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe4Needed = Math.ceil(dcConfigArrayLocal[dcItem].numberOfNVMe4Needed / numberOfServersNeeded)
    debugMsg(generalValues, localDebugOn, 5, "dcConfigCalcPreliminaryMediaPerServer", 103, `actualChassisID=${actualChassisID}, initial dcConfigArrayLocal[dcItem=${dcItem}].prelimPerServerNumberOfNVMe4Needed=${dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe4Needed}`,0,0,0)
    if (Math.ceil((dcConfigArrayLocal[dcItem].numberOfHDD1NeededWithDedicatedNVMe4DedicatedWALonNVMe9 + dcConfigArrayLocal[dcItem].numberOfHDD1NeededWithDedicatedNVMe4DedicatedWALonSSD9 + dcConfigArrayLocal[dcItem].numberOfHDD1NeededWithDedicatedNVMe4IncludingWAL)/chassisArrayLocal[actualChassisID].hddToNVMe4) > dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe4Needed * numberOfServersNeeded){
      dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe4Needed = Math.ceil(Math.ceil((dcConfigArrayLocal[dcItem].numberOfHDD1NeededWithDedicatedNVMe4DedicatedWALonNVMe9 + dcConfigArrayLocal[dcItem].numberOfHDD1NeededWithDedicatedNVMe4DedicatedWALonSSD9 + dcConfigArrayLocal[dcItem].numberOfHDD1NeededWithDedicatedNVMe4IncludingWAL)/chassisArrayLocal[actualChassisID].hddToNVMe4) / numberOfServersNeeded)
      debugMsg(generalValues, localDebugOn, 5, "dcConfigCalcPreliminaryMediaPerServer", 106, `actualChassisID=${actualChassisID}, corrected dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe4Needed=${dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe4Needed} because ratio of HDD/NVMe4 not preserved in calculation`,0,0,0)
    }
  }
  else {
    dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe4Needed = 0
    debugMsg(generalValues, localDebugOn, 5, "dcConfigCalcPreliminaryMediaPerServer",111, `actualChassisID=${actualChassisID}, dcConfigArrayLocal[dcItem=${dcItem}].prelimPerServerNumberOfNVMe4Needed=${dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe4Needed}`,0,0,0)
  }
  
  if (chassisArrayLocal[actualChassisID].sizeNVMe5 > 0) {
    dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe5Needed = Math.ceil(dcConfigArrayLocal[dcItem].numberOfNVMe5Needed / numberOfServersNeeded)
    debugMsg(generalValues, localDebugOn, 5, "dcConfigCalcPreliminaryMediaPerServer", 116, `actualChassisID=${actualChassisID}, initial dcConfigArrayLocal[dcItem=${dcItem}].prelimPerServerNumberOfNVMe5Needed=${dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe5Needed}`,0,0,0)
    if (Math.ceil(( dcConfigArrayLocal[dcItem].numberOfSSD1NeededWithDedicatedRocksDBDedicatedWAL + dcConfigArrayLocal[dcItem].numberOfSSD1NeededWithDedicatedRocksDBIncludingWAL) / chassisArrayLocal[actualChassisID].ssdToNVMe5 ) > dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe5Needed * numberOfServersNeeded){
      dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe5Needed = Math.ceil(Math.ceil((dcConfigArrayLocal[dcItem].numberOfSSD1NeededWithDedicatedRocksDBDedicatedWAL + dcConfigArrayLocal[dcItem].numberOfSSD1NeededWithDedicatedRocksDBIncludingWAL) / chassisArrayLocal[actualChassisID].ssdToNVMe5) / numberOfServersNeeded)
      debugMsg(generalValues, localDebugOn, 5, "dcConfigCalcPreliminaryMediaPerServer", 119, `cactualChassisID=${actualChassisID}, orrected dcConfigArrayLocal[dcItem=${dcItem}].prelimPerServerNumberOfNVMe5Needed=${dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe5Needed} because ratio of SSD1/NVMe5 not preserved in calculation`,0,0,0)
    }
  }
  else {
    dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe5Needed = 0
    debugMsg(generalValues, localDebugOn, 5, "dcConfigCalcPreliminaryMediaPerServer", 124, `actualChassisID=${actualChassisID}, dcConfigArrayLocal[dcItem=${dcItem}].prelimPerServerNumberOfNVMe5Needed=${dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe5Needed}`,0,0,0)
  }
  
  if (chassisArrayLocal[actualChassisID].sizeNVMe6 > 0) {
    dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe6Needed = Math.ceil(dcConfigArrayLocal[dcItem].numberOfNVMe6Needed / numberOfServersNeeded)
    debugMsg(generalValues, localDebugOn, 5, "dcConfigCalcPreliminaryMediaPerServer", 129, `actualChassisID=${actualChassisID}, dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe6Needed=${dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe6Needed}`,0,0,0)
  }
  else {
    dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe6Needed = 0
    debugMsg(generalValues, localDebugOn, 5, "dcConfigCalcPreliminaryMediaPerServer", 133, `actualChassisID=${actualChassisID}, dcConfigArrayLocal[dcItem=${dcItem}].prelimPerServerNumberOfNVMe6Needed=${dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe6Needed}`,0,0,0)
  }
  
  if (chassisArrayLocal[actualChassisID].sizeNVMe7 > 0) {
    dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe7Needed = Math.ceil(dcConfigArrayLocal[dcItem].numberOfNVMe7Needed / numberOfServersNeeded)
    debugMsg(generalValues, localDebugOn, 5, "dcConfigCalcPreliminaryMediaPerServer", 138, `actualChassisID=${actualChassisID}, initial dcConfigArrayLocal[dcItem=${dcItem}].prelimPerServerNumberOfNVMe7Needed=${dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe7Needed} = Math.ceil(dcConfigArrayLocal[dcItem].numberOfNVMe7Needed=${dcConfigArrayLocal[dcItem].numberOfNVMe7Needed} / numberOfServersNeeded=${numberOfServersNeeded})`,0,0,0)

    if (Math.ceil( ( dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithDedicatedRocksDBDedicatedWAL + dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithDedicatedRocksDBIncludingWAL) / chassisArrayLocal[actualChassisID].nvmeToNVMe7 ) > dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe7Needed * numberOfServersNeeded ){
      dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe7Needed = Math.ceil(Math.ceil((dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithDedicatedRocksDBDedicatedWAL + dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithDedicatedRocksDBIncludingWAL) / chassisArrayLocal[actualChassisID].nvmeToNVMe7 ) / numberOfServersNeeded)
      debugMsg(generalValues, localDebugOn, 5, "dcConfigCalcPreliminaryMediaPerServer", 142, `actualChassisID=${actualChassisID}, dcItem=${dcItem}, if (Math.ceil((dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithDedicatedRocksDBDedicatedWAL=${dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithDedicatedRocksDBDedicatedWAL} + dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithDedicatedRocksDBIncludingWAL=${dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithDedicatedRocksDBIncludingWAL})/chassisArrayLocal[actualChassisID].nvmeToNVMe7=${chassisArrayLocal[actualChassisID].nvmeToNVMe7}) > dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe7Needed=${dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe7Needed} * numberOfServersNeeded=${numberOfServersNeeded}){
        dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe7Needed=${dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe7Needed} = Math.ceil((dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithDedicatedRocksDBDedicatedWAL=${dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithDedicatedRocksDBDedicatedWAL} + dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithDedicatedRocksDBIncludingWAL=${dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithDedicatedRocksDBIncludingWAL}) / chassisArrayLocal[actualChassisID].nvmeToNVMe7=${chassisArrayLocal[actualChassisID].nvmeToNVMe7}) / numberOfServersNeeded=${numberOfServersNeeded}`,0,0,0)
      debugMsg(generalValues, localDebugOn, 5, "dcConfigCalcPreliminaryMediaPerServer", 144, `actualChassisID=${actualChassisID}, corrected dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe7Needed=${dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe7Needed} because ratio of NVMe1 with NVMe7/NVMe7 not preserved in calculation`,0,0,0)
    }
  }
  else {
    dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe7Needed = 0
    debugMsg(generalValues, localDebugOn, 5, "dcConfigCalcPreliminaryMediaPerServer", 149, `actualChassisID=${actualChassisID}, dcConfigArrayLocal[dcItem=${dcItem}].prelimPerServerNumberOfNVMe7Needed=${dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe7Needed}`,0,0,0)
  }
  
  if (chassisArrayLocal[actualChassisID].sizeNVMe8 > 0) {
    if (chassisArrayLocal[actualChassisID].useNVMe8 == true) {
      dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe8Needed = Math.ceil(dcConfigArrayLocal[dcItem].numberOfNVMe8Needed / numberOfServersNeeded)
      debugMsg(generalValues, localDebugOn, 5, "dcConfigCalcPreliminaryMediaPerServer", 155, `actualChassisID=${actualChassisID}, initial dcConfigArrayLocal[dcItem=${dcItem}].prelimPerServerNumberOfNVMe8Needed=${dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe8Needed}`,0,0,0)
      if (Math.ceil((dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithoutDedicatedRocksDBDedicatedWAL + dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithDedicatedRocksDBDedicatedWAL) / chassisArrayLocal[actualChassisID].nvmeToNVMe8 ) > dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe8Needed * numberOfServersNeeded){
        dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe8Needed = Math.ceil(Math.ceil((dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithoutDedicatedRocksDBDedicatedWAL + dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithDedicatedRocksDBDedicatedWAL) / chassisArrayLocal[actualChassisID].nvmeToNVMe8) / numberOfServersNeeded)
        debugMsg(generalValues, localDebugOn, 5, "dcConfigCalcPreliminaryMediaPerServer", 158, `actualChassisID=${actualChassisID}, corrected dcConfigArrayLocal[dcItem=${dcItem}].prelimPerServerNumberOfNVMe8Needed=${dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe8Needed} because ratio of NVMe1/NVMe8 not preserved in calculation`,0,0,0)
      }
    }
    else{
      dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe8Needed = 0
      debugMsg(generalValues, localDebugOn, 5, "dcConfigCalcPreliminaryMediaPerServer", 163, `actualChassisID=${actualChassisID}, initial dcConfigArrayLocal[dcItem=${dcItem}].prelimPerServerNumberOfNVMe8Needed=${dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe8Needed}`,0,0,0)
      // if the chassis provides no support for NVMe8 (even the size is configured) we need to check whether we need still NVMe8 because a workload selected it - and perhaps throw an error
      if (dcConfigArrayLocal[dcItem].numberOfNVMe8Needed > 0) {
        displayMsg(document, "dcConfigCalcPreliminaryMediaPerServer", 166, "error", `NVMe8 is selected in a workload but not supported by chassis config: DC=${dcItem},actualChassisID=${actualChassisID}`,0,0,0)
      }
    }

  }
  else {
    dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe8Needed = 0
    // if the chassis provides no support for NVMe8 (even the size is configured) we need to check whether we need still NVMe8 because a workload selected it - and perhaps throw an error
    debugMsg(generalValues, localDebugOn, 5, "dcConfigCalcPreliminaryMediaPerServer", 174, `actualChassisID=${actualChassisID}, initial dcConfigArrayLocal[dcItem=${dcItem}].prelimPerServerNumberOfNVMe8Needed=${dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe8Needed}`,0,0,0)
    if (dcConfigArrayLocal[dcItem].numberOfNVMe8Needed > 0) {
      displayMsg(document, "dcConfigCalcPreliminaryMediaPerServer", 176, "error", `NVMe8 is selected in a workload but no size given by chassis config: DC=${dcItem},actualChassisID=${actualChassisID}`,0,0,0)
    }
  }

  if (chassisArrayLocal[actualChassisID].sizeNVMe9 > 0) {
    if (chassisArrayLocal[actualChassisID].useNVMe9 == true) {
      dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe9Needed = Math.ceil(dcConfigArrayLocal[dcItem].numberOfNVMe9Needed / numberOfServersNeeded)
      debugMsg(generalValues, localDebugOn, 5, "dcConfigCalcPreliminaryMediaPerServer", 183, `actualChassisID=${actualChassisID}, initial dcConfigArrayLocal[dcItem=${dcItem}].prelimPerServerNumberOfNVMe9Needed=${dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe9Needed}`,0,0,0)
      //if (Math.ceil(dcConfigArrayLocal[dcItem].prelimPerServerNumberOfHDDNeeded/chassisArrayLocal[actualChassisID].hddToNVMe9) > dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe9Needed * numberOfServersNeeded){
      if (Math.ceil((dcConfigArrayLocal[dcItem].numberOfHDD1NeededWithoutDedicatedRocksDBDedicatedWALonNVMe9 + dcConfigArrayLocal[dcItem].numberOfHDD1NeededWithDedicatedSSD4DedicatedWALonNVMe9 + dcConfigArrayLocal[dcItem].numberOfHDD1NeededWithDedicatedNVMe4DedicatedWALonNVMe9) / chassisArrayLocal[actualChassisID].nvmeToNVMe9 ) > dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe9Needed * numberOfServersNeeded){
        dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe9Needed = Math.ceil(Math.ceil((dcConfigArrayLocal[dcItem].numberOfHDD1NeededWithoutDedicatedRocksDBDedicatedWALonNVMe9 + dcConfigArrayLocal[dcItem].numberOfHDD1NeededWithDedicatedSSD4DedicatedWALonNVMe9 + dcConfigArrayLocal[dcItem].numberOfHDD1NeededWithDedicatedNVMe4DedicatedWALonNVMe9) / chassisArrayLocal[actualChassisID].nvmeToNVMe9 ) / numberOfServersNeeded)
        debugMsg(generalValues, localDebugOn, 5, "dcConfigCalcPreliminaryMediaPerServer", 187, `actualChassisID=${actualChassisID}, corrected dcConfigArrayLocal[dcItem=${dcItem}].prelimPerServerNumberOfNVMe9Needed=${dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe9Needed} because ratio of HDD/NVMe9 not preserved in calculation`,0,0,0)
      }
    }
    else{
      dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe9Needed = 0
      debugMsg(generalValues, localDebugOn, 5, "dcConfigCalcPreliminaryMediaPerServer", 192, `actualChassisID=${actualChassisID}, initial dcConfigArrayLocal[dcItem=${dcItem}].prelimPerServerNumberOfNVMe9Needed=${dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe9Needed}`,0,0,0)
      // if the chassis provides no support for NVMe9 (even the size is configured) we need to check whether we need still NVMe9 because a workload selected it - and perhaps throw an error
      if (dcConfigArrayLocal[dcItem].numberOfNVMe9Needed > 0) {
        displayMsg(document, "dcConfigCalcPreliminaryMediaPerServer", 195, "error", `NVMe9 is selected in a workload but not supported by chassis config: DC=${dcItem},actualChassisID=${actualChassisID}`,0,0,0)
      }      
    }

  }
  else {
    dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe9Needed = 0
    debugMsg(generalValues, localDebugOn, 5, "dcConfigCalcPreliminaryMediaPerServer", 202, `actualChassisID=${actualChassisID}, initial dcConfigArrayLocal[dcItem=${dcItem}].prelimPerServerNumberOfNVMe9Needed=${dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe9Needed}`,0,0,0)
    // if the chassis provides no support for NVMe9 (even the size is configured) we need to check whether we need still NVMe9 because a workload selected it - and perhaps throw an error
    if (dcConfigArrayLocal[dcItem].numberOfNVMe9Needed > 0) {
      displayMsg(document, "dcConfigCalcPreliminaryMediaPerServer", 205, "error", `NVMe9 is selected in a workload but no size given by chassis config: DC=${dcItem},actualChassisID=${actualChassisID}`,0,0,0)
    }
  }

}

export default dcConfigCalcPreliminaryMediaPerServer