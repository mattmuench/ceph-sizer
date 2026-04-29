import displayMsg from "../common/displayMsg.js"
import {debugMsg} from "../common/debug.js";

const dcConfigCalcPreliminaryMediaPerServer = function (generalValues, dcConfigArrayLocal, dcItem, chassisArrayLocal, actualChassisID, numberOfServersNeeded) {
  let localDebugOn = false

  // Calculate preliminary number of media per server to avoid constantly calculating something that might be not that obvious at the time of use
  
  if (chassisArrayLocal[actualChassisID].sizeHDD1 > 0) {
    dcConfigArrayLocal[dcItem].prelimPerServerNumberOfHDDNeeded = Math.ceil(dcConfigArrayLocal[dcItem].numberOfHDDNeeded / numberOfServersNeeded)  
  }
  else {
    dcConfigArrayLocal[dcItem].prelimPerServerNumberOfHDDNeeded = 0
  }
  /**
  if (chassisArrayLocal[actualChassisID].sizeSSD1 > 0) {
    dcConfigArrayLocal[dcItem].prelimPerServerNumberOfSSDNeeded = Math.ceil(dcConfigArrayLocal[dcItem].numberOfSSDNeeded / numberOfServersNeeded)
  }
  else {
    dcConfigArrayLocal[dcItem].prelimPerServerNumberOfSSDNeeded = 0
  }
   */
  if (chassisArrayLocal[actualChassisID].sizeSSD1 > 0) {
    dcConfigArrayLocal[dcItem].prelimPerServerNumberOfSSDWithoutDedicatedNVMeNeeded = Math.ceil(dcConfigArrayLocal[dcItem].numberOfSSD1NeededWithoutDedicatedRocksDBNorWAL / numberOfServersNeeded) +  Math.ceil(dcConfigArrayLocal[dcItem].numberOfSSD1NeededWithoutDedicatedRocksDBDedicatedWAL / numberOfServersNeeded)
  }
  else {
    dcConfigArrayLocal[dcItem].prelimPerServerNumberOfSSDWithoutDedicatedNVMeNeeded = 0
  }
  if (chassisArrayLocal[actualChassisID].sizeSSD1 > 0) {
    dcConfigArrayLocal[dcItem].prelimPerServerNumberOfSSDWithDedicatedNVMeNeeded = Math.ceil(dcConfigArrayLocal[dcItem].numberOfSSD1NeededWithDedicatedRocksDBIncludingWAL / numberOfServersNeeded) + Math.ceil(dcConfigArrayLocal[dcItem].numberOfSSD1NeededWithDedicatedRocksDBDedicatedWAL / numberOfServersNeeded)
  }
  else {
    dcConfigArrayLocal[dcItem].prelimPerServerNumberOfSSDWithDedicatedNVMeNeeded = 0
  }
  dcConfigArrayLocal[dcItem].prelimPerServerNumberOfSSDNeeded = dcConfigArrayLocal[dcItem].prelimPerServerNumberOfSSDWithDedicatedNVMeNeeded 
                                                              + dcConfigArrayLocal[dcItem].prelimPerServerNumberOfSSDWithoutDedicatedNVMeNeeded
  
  if (chassisArrayLocal[actualChassisID].sizeNVMe1 > 0) {
    dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe1NeededWithoutDedicatedWAL = Math.ceil(dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithoutDedicatedRocksDBNorWAL / numberOfServersNeeded) + Math.ceil(dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithoutDedicatedRocksDBDedicatedWAL / numberOfServersNeeded)
  }
  else {
    dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe1NeededWithoutDedicatedWAL = 0
  }
  if (chassisArrayLocal[actualChassisID].sizeNVMe1 > 0) {
    dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe1NeededWithDedicatedWAL = Math.ceil(dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithDedicatedRocksDBIncludingWAL / numberOfServersNeeded) + Math.ceil(dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithDedicatedRocksDBDedicatedWAL / numberOfServersNeeded)
  }
  else {
    dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe1NeededWithDedicatedWAL =0
  }
  dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe1Needed = dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe1NeededWithoutDedicatedWAL
                                                                + dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe1NeededWithDedicatedWAL

  if (chassisArrayLocal[actualChassisID].sizeSSD4 > 0) {
    dcConfigArrayLocal[dcItem].prelimPerServerNumberOfSSD4Needed = Math.ceil(dcConfigArrayLocal[dcItem].numberOfSSD4Needed / numberOfServersNeeded)
    if (Math.ceil(dcConfigArrayLocal[dcItem].prelimPerServerNumberOfHDDNeeded/chassisArrayLocal[dcItem].hddToSSD4) > dcConfigArrayLocal[dcItem].prelimPerServerNumberOfSSD4Needed * numberOfServersNeeded){
      dcConfigArrayLocal[dcItem].prelimPerServerNumberOfSSD4Needed = Math.ceil(Math.ceil(dcConfigArrayLocal[dcItem].prelimPerServerNumberOfHDDNeeded/chassisArrayLocal[dcItem].hddToSSD4) / numberOfServersNeeded)
      debugMsg(generalValues, localDebugOn, 5, "dcConfigCalcPreliminaryMediaPerServer", 55, `corrected dcConfigArrayLocal[dcItem].prelimPerServerNumberOfSSD4Needed=${dcConfigArrayLocal[dcItem].prelimPerServerNumberOfSSD4Needed} because ratio of HDD/SSD4 not preserved in calculation`,0,0,0)
    }
  }
  else {
    dcConfigArrayLocal[dcItem].prelimPerServerNumberOfSSD4Needed = 0
  }
  if (chassisArrayLocal[actualChassisID].sizeNVMe2 > 0) {
    dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe2Needed = Math.ceil(dcConfigArrayLocal[dcItem].numberOfNVMe2Needed / numberOfServersNeeded)
  }
  else {
    dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe2Needed = 0
  }
  if (chassisArrayLocal[actualChassisID].sizeNVMe3 > 0) {
    dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe3Needed = Math.ceil(dcConfigArrayLocal[dcItem].numberOfNVMe3Needed / numberOfServersNeeded)
    if (Math.ceil((dcConfigArrayLocal[dcItem].numberOfSSD1NeededWithoutDedicatedRocksDBDedicatedWAL + dcConfigArrayLocal[dcItem].numberOfSSD1NeededWithDedicatedRocksDBDedicatedWAL) / chassisArrayLocal[dcItem].ssdToOptane) > dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe3Needed * numberOfServersNeeded){
      dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe3Needed = Math.ceil(Math.ceil((dcConfigArrayLocal[dcItem].numberOfSSD1NeededWithoutDedicatedRocksDBDedicatedWAL+dcConfigArrayLocal[dcItem].numberOfSSD1NeededWithDedicatedRocksDBDedicatedWAL)/chassisArrayLocal[dcItem].ssdToOptane) / numberOfServersNeeded)
      debugMsg(generalValues, localDebugOn, 5, "dcConfigCalcPreliminaryMediaPerServer", 71, `corrected dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe3Needed=${dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe3Needed} because ratio of SSD1 with NVMe3/NVMe3 not preserved in calculation`,0,0,0)
    }
  }
  else {
    dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe3Needed = 0
  }
  if (chassisArrayLocal[actualChassisID].sizeNVMe4 > 0) {
    dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe4Needed = Math.ceil(dcConfigArrayLocal[dcItem].numberOfNVMe4Needed / numberOfServersNeeded)
    if (Math.ceil(dcConfigArrayLocal[dcItem].prelimPerServerNumberOfHDDNeeded/chassisArrayLocal[dcItem].hddToNVMe4) > dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe4Needed * numberOfServersNeeded){
      dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe4Needed = Math.ceil(Math.ceil(dcConfigArrayLocal[dcItem].prelimPerServerNumberOfHDDNeeded/chassisArrayLocal[dcItem].hddToNVMe4) / numberOfServersNeeded)
      debugMsg(generalValues, localDebugOn, 5, "dcConfigCalcPreliminaryMediaPerServer", 83, `corrected dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe4Needed=${dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe4Needed} because ratio of HDD/NVMe4 not preserved in calculation`,0,0,0)
    }
  }
  else {
    dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe4Needed = 0
  }
  if (chassisArrayLocal[actualChassisID].sizeNVMe5 > 0) {
    dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe5Needed = Math.ceil(dcConfigArrayLocal[dcItem].numberOfNVMe5Needed / numberOfServersNeeded)
    if (Math.ceil(( dcConfigArrayLocal[dcItem].numberOfSSD1NeededWithDedicatedRocksDBDedicatedWAL + dcConfigArrayLocal[dcItem].numberOfSSD1NeededWithDedicatedRocksDBIncludingWAL) / chassisArrayLocal[dcItem].ssdToNVMe5 ) > dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe5Needed * numberOfServersNeeded){
      dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe5Needed = Math.ceil(Math.ceil((dcConfigArrayLocal[dcItem].numberOfSSD1NeededWithDedicatedRocksDBDedicatedWAL + dcConfigArrayLocal[dcItem].numberOfSSD1NeededWithDedicatedRocksDBIncludingWAL) / chassisArrayLocal[dcItem].ssdToNVMe5) / numberOfServersNeeded)
      debugMsg(generalValues, localDebugOn, 5, "dcConfigCalcPreliminaryMediaPerServer", 93, `corrected dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe5Needed=${dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe5Needed} because ratio of SSD1/NVMe5 not preserved in calculation`,0,0,0)
    }
  }
  else {
    dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe5Needed = 0
  }
  if (chassisArrayLocal[actualChassisID].sizeNVMe6 > 0) {
    dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe6Needed = Math.ceil(dcConfigArrayLocal[dcItem].numberOfNVMe6Needed / numberOfServersNeeded)
  }
  else {
    dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe6Needed = 0
  }
  if (chassisArrayLocal[actualChassisID].sizeNVMe7 > 0) {
    dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe7Needed = Math.ceil(dcConfigArrayLocal[dcItem].numberOfNVMe7Needed / numberOfServersNeeded)
    debugMsg(generalValues, localDebugOn, 5, "dcConfigCalcPreliminaryMediaPerServer", 107, `initial dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe7Needed=${dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe7Needed} = Math.ceil(dcConfigArrayLocal[dcItem].numberOfNVMe7Needed=${dcConfigArrayLocal[dcItem].numberOfNVMe7Needed} / numberOfServersNeeded=${numberOfServersNeeded})`,0,0,0)

    if (Math.ceil( ( dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithDedicatedRocksDBDedicatedWAL + dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithDedicatedRocksDBIncludingWAL) / chassisArrayLocal[dcItem].nvmeToNVMe7 ) > dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe7Needed * numberOfServersNeeded ){
      dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe7Needed = Math.ceil(Math.ceil((dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithDedicatedRocksDBDedicatedWAL + dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithDedicatedRocksDBIncludingWAL) / chassisArrayLocal[dcItem].nvmeToNVMe7 ) / numberOfServersNeeded)
      debugMsg(generalValues, localDebugOn, 5, "dcConfigCalcPreliminaryMediaPerServer", 111, `if (Math.ceil((dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithDedicatedRocksDBDedicatedWAL=${dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithDedicatedRocksDBDedicatedWAL} + dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithDedicatedRocksDBIncludingWAL=${dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithDedicatedRocksDBIncludingWAL})/chassisArrayLocal[dcItem].nvmeToNVMe7=${chassisArrayLocal[dcItem].nvmeToNVMe7}) > dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe7Needed=${dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe7Needed} * numberOfServersNeeded=${numberOfServersNeeded}){
        dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe7Needed=${dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe7Needed} = Math.ceil((dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithDedicatedRocksDBDedicatedWAL=${dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithDedicatedRocksDBDedicatedWAL} + dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithDedicatedRocksDBIncludingWAL=${dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithDedicatedRocksDBIncludingWAL}) / chassisArrayLocal[dcItem].nvmeToNVMe7=${chassisArrayLocal[dcItem].nvmeToNVMe7}) / numberOfServersNeeded=${numberOfServersNeeded}`,0,0,0)
      debugMsg(generalValues, localDebugOn, 5, "dcConfigCalcPreliminaryMediaPerServer", 113, `corrected dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe7Needed=${dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe7Needed} because ratio of NVMe1 with NVMe7/NVMe7 not preserved in calculation`,0,0,0)
    }
  }
  else {
    dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe7Needed = 0
  }
  if (chassisArrayLocal[actualChassisID].sizeNVMe8 > 0) {
    if (chassisArrayLocal[actualChassisID].useNVMe8 == true) {
      dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe8Needed = Math.ceil(dcConfigArrayLocal[dcItem].numberOfNVMe8Needed / numberOfServersNeeded)
      if (Math.ceil((dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithoutDedicatedRocksDBDedicatedWAL + dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithDedicatedRocksDBDedicatedWAL) / chassisArrayLocal[dcItem].nvmeToNVMe8 ) > dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe8Needed * numberOfServersNeeded){
        dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe8Needed = Math.ceil(Math.ceil((dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithoutDedicatedRocksDBDedicatedWAL + dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithDedicatedRocksDBDedicatedWAL) / chassisArrayLocal[dcItem].nvmeToNVMe8) / numberOfServersNeeded)
        debugMsg(generalValues, localDebugOn, 5, "dcConfigCalcPreliminaryMediaPerServer", 124, `corrected dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe8Needed=${dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe8Needed} because ratio of NVMe1/NVMe8 not preserved in calculation`,0,0,0)
      }
    }
    else{
      dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe8Needed = 0
      // if the chassis provides no support for NVMe8 (even the size is configured) we need to check whether we need still NVMe8 because a workload selected it - and perhaps throw an error
      if (dcConfigArrayLocal[dcItem].numberOfNVMe8Needed > 0) {
        displayMsg(document, "dcConfigCalcPreliminaryMediaPerServer", 131, "error", `NVMe8 is selected in a workload but not supported by chassis config: DC=${dcItem},actualChassisID=${actualChassisID}`,0,0,0)
      }      
    }

  }
  else {
    dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe8Needed = 0
    // if the chassis provides no support for NVMe8 (even the size is configured) we need to check whether we need still NVMe8 because a workload selected it - and perhaps throw an error
    if (dcConfigArrayLocal[dcItem].numberOfNVMe8Needed > 0) {
      displayMsg(document, "dcConfigCalcPreliminaryMediaPerServer", 140, "error", `NVMe8 is selected in a workload but no size given by chassis config: DC=${dcItem},actualChassisID=${actualChassisID}`,0,0,0)
    }
  }
        
}

export default dcConfigCalcPreliminaryMediaPerServer