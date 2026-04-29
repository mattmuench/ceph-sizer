import displayMsg from "../common/displayMsg.js"
import {debugMsg} from "../common/debug.js";

const dcConfigFinalHDDPerServer   = function (generalValues, dcConfigArrayLocal, actualChassisID, dcItem) {
  let localDebugOn = false

  if (dcConfigArrayLocal[dcItem].resultingNumberOfServersAsPerChassis > 0) {
    dcConfigArrayLocal[dcItem].resultingNumberOfHDD = Math.ceil(dcConfigArrayLocal[dcItem].numberOfHDDNeeded / dcConfigArrayLocal[dcItem].resultingNumberOfServersAsPerChassis)
  }
  else {
    dcConfigArrayLocal[dcItem].resultingNumberOfHDD = 0
  }
  debugMsg(generalValues, localDebugOn, 5, "dcConfigFinalHDDPerServer", 13, `[chassisID=${actualChassisID}] dcConfigArrayLocal[dcItem=${dcItem}].resultingNumberOfHDD=${dcConfigArrayLocal[dcItem].resultingNumberOfHDD}`,0,0,0)
}  

export default dcConfigFinalHDDPerServer