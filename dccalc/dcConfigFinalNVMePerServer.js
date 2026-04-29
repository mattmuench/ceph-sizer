import displayMsg from "../common/displayMsg.js"
import {debugMsg} from "../common/debug.js";

const dcConfigFinalNVMePerServer   = function (generalValues, dcConfigArrayLocal, actualChassisID, dcItem, chassisArrayLocal) {
  let localDebugOn = false

  if (dcConfigArrayLocal[dcItem].resultingNumberOfServersAsPerChassis > 0) {
    dcConfigArrayLocal[dcItem].resultingNumberOfNVMe1 = dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe1NeededWithoutDedicatedWAL + dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe1NeededWithDedicatedWAL
    dcConfigArrayLocal[dcItem].resultingNumberOfNVMe2 = dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe2Needed
    dcConfigArrayLocal[dcItem].resultingNumberOfNVMe3 = dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe3Needed
    dcConfigArrayLocal[dcItem].resultingNumberOfNVMe4 = dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe4Needed
    dcConfigArrayLocal[dcItem].resultingNumberOfNVMe5 = dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe5Needed
    dcConfigArrayLocal[dcItem].resultingNumberOfNVMe6 = dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe6Needed
    dcConfigArrayLocal[dcItem].resultingNumberOfNVMe7 = dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe7Needed
    dcConfigArrayLocal[dcItem].resultingNumberOfNVMe8 = dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe8Needed
  }
  else {
    dcConfigArrayLocal[dcItem].resultingNumberOfNVMe1 = 0
    dcConfigArrayLocal[dcItem].resultingNumberOfNVMe2 = 0
    dcConfigArrayLocal[dcItem].resultingNumberOfNVMe3 = 0
    dcConfigArrayLocal[dcItem].resultingNumberOfNVMe4 = 0
    dcConfigArrayLocal[dcItem].resultingNumberOfNVMe5 = 0
    dcConfigArrayLocal[dcItem].resultingNumberOfNVMe6 = 0
    dcConfigArrayLocal[dcItem].resultingNumberOfNVMe7 = 0
    dcConfigArrayLocal[dcItem].resultingNumberOfNVMe8 = 0
  }

  if (generalValues.globalDebug == true || localDebugOn == true) {
    debugMsg(generalValues, localDebugOn, 5, "dcConfigFinalNVMePerServer", 29, `[chassisID=${actualChassisID}] dcConfigArrayLocal[dcItem=${dcItem}].resultingNumberOfNVMe1=${dcConfigArrayLocal[dcItem].resultingNumberOfNVMe1}`,0,0,0)
    debugMsg(generalValues, localDebugOn, 5, "dcConfigFinalNVMePerServer", 30, `[chassisID=${actualChassisID}] dcConfigArrayLocal[dcItem=${dcItem}].resultingNumberOfNVMe2=${dcConfigArrayLocal[dcItem].resultingNumberOfNVMe2}`,0,0,0)
    debugMsg(generalValues, localDebugOn, 5, "dcConfigFinalNVMePerServer", 31, `[chassisID=${actualChassisID}] dcConfigArrayLocal[dcItem=${dcItem}].resultingNumberOfNVMe3=${dcConfigArrayLocal[dcItem].resultingNumberOfNVMe3}`,0,0,0)
    debugMsg(generalValues, localDebugOn, 5, "dcConfigFinalNVMePerServer", 32, `[chassisID=${actualChassisID}] dcConfigArrayLocal[dcItem=${dcItem}].resultingNumberOfNVMe4=${dcConfigArrayLocal[dcItem].resultingNumberOfNVMe4}`,0,0,0)
    debugMsg(generalValues, localDebugOn, 5, "dcConfigFinalNVMePerServer", 33, `[chassisID=${actualChassisID}] dcConfigArrayLocal[dcItem=${dcItem}].resultingNumberOfNVMe5=${dcConfigArrayLocal[dcItem].resultingNumberOfNVMe5}`,0,0,0)
    debugMsg(generalValues, localDebugOn, 5, "dcConfigFinalNVMePerServer", 34, `[chassisID=${actualChassisID}] dcConfigArrayLocal[dcItem=${dcItem}].resultingNumberOfNVMe6=${dcConfigArrayLocal[dcItem].resultingNumberOfNVMe6}`,0,0,0)
    debugMsg(generalValues, localDebugOn, 5, "dcConfigFinalNVMePerServer", 35, `[chassisID=${actualChassisID}] dcConfigArrayLocal[dcItem=${dcItem}].resultingNumberOfNVMe7=${dcConfigArrayLocal[dcItem].resultingNumberOfNVMe7}`,0,0,0)
    debugMsg(generalValues, localDebugOn, 5, "dcConfigFinalNVMePerServer", 36, `[chassisID=${actualChassisID}] dcConfigArrayLocal[dcItem=${dcItem}].resultingNumberOfNVMe8=${dcConfigArrayLocal[dcItem].resultingNumberOfNVMe8}`,0,0,0)
  }
}

export default dcConfigFinalNVMePerServer