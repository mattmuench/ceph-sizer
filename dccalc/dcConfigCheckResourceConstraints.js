import displayMsg from "../common/displayMsg.js"
import {debugMsg} from "../common/debug.js";

const dcConfigCheckResourceConstraints = function (generalValues, dcConfigArrayLocal, chassisArrayLocal, actualChassisID, dcItem) {
  let localDebugOn = false

  // check if the provided resources by selected chassis would match the required resources for all media and roles
  debugMsg(generalValues, localDebugOn, 5, "dcConfigCheckResourceConstraints", 354, `[chassisID=${actualChassisID},dcItem=${dcItem}] dcConfigArrayLocal[dcItem].prelimPerServerNumberOfCoresNeeded=${dcConfigArrayLocal[dcItem].prelimPerServerNumberOfCoresNeeded}; dcConfigArrayLocal[dcItem].maxCpuSockets*chassisArrayLocal[actualChassisID].maxCpuCores=${chassisArrayLocal[actualChassisID].maxCpuSockets}*${chassisArrayLocal[actualChassisID].maxCpuCores};`,0,0,0)
  debugMsg(generalValues, localDebugOn, 5, "dcConfigCheckResourceConstraints", 354, `[chassisID=${actualChassisID},dcItem=${dcItem}] dcConfigArrayLocal[dcItem].prelimPerServerMemNeededPerServer=${dcConfigArrayLocal[dcItem].prelimPerServerMemNeededPerServer}; chassisArrayLocal[actualChassisID].maxMemGb)=${chassisArrayLocal[actualChassisID].maxMemGb}`,0,0,0)
  let localCheckResult = 0
  if (dcConfigArrayLocal[dcItem].prelimPerServerNumberOfCoresNeeded <= (chassisArrayLocal[actualChassisID].maxCpuSockets*chassisArrayLocal[actualChassisID].maxCpuCores) && dcConfigArrayLocal[dcItem].prelimPerServerMemNeededPerServer <= chassisArrayLocal[actualChassisID].maxMemGb) {
    dcConfigArrayLocal[dcItem].constraintsBasedOnCores = false
    dcConfigArrayLocal[dcItem].constraintsBasedOnNothing = true
    dcConfigArrayLocal[dcItem].constraintsBasedOnMem = false
    dcConfigArrayLocal[dcItem].constraintsBasedOnAll = false
    debugMsg(generalValues, localDebugOn, 5, "dcConfigCheckResourceConstraints", 16, `[chassisID=${actualChassisID},dcItem=${dcItem}] - cores <= max & mem <= max`,0,0,0)
  }
        
  if ((dcConfigArrayLocal[dcItem].prelimPerServerNumberOfCoresNeeded > (chassisArrayLocal[actualChassisID].maxCpuSockets*chassisArrayLocal[actualChassisID].maxCpuCores)) && (dcConfigArrayLocal[dcItem].prelimPerServerMemNeededPerServer <= chassisArrayLocal[actualChassisID].maxMemGb) ) {
    dcConfigArrayLocal[dcItem].constraintsBasedOnCores = true
    dcConfigArrayLocal[dcItem].constraintsBasedOnNothing = false
    dcConfigArrayLocal[dcItem].constraintsBasedOnMem = false
    dcConfigArrayLocal[dcItem].constraintsBasedOnAll = false
    debugMsg(generalValues, localDebugOn, 5, "dcConfigCheckResourceConstraints", 24, `[chassisID=${actualChassisID},dcItem=${dcItem}] - cores > max & mem <= max`,0,0,0)
  }
  
  if (dcConfigArrayLocal[dcItem].prelimPerServerNumberOfCoresNeeded > (chassisArrayLocal[actualChassisID].maxCpuSockets*chassisArrayLocal[actualChassisID].maxCpuCores)&& (dcConfigArrayLocal[dcItem].prelimPerServerMemNeededPerServer > chassisArrayLocal[actualChassisID].maxMemGb)) {
    dcConfigArrayLocal[dcItem].constraintsBasedOnCores = true
    dcConfigArrayLocal[dcItem].constraintsBasedOnNothing = false
    dcConfigArrayLocal[dcItem].constraintsBasedOnMem = true
    dcConfigArrayLocal[dcItem].constraintsBasedOnAll = true
    debugMsg(generalValues, localDebugOn, 5, "dcConfigCheckResourceConstraints", 32, `[chassisID=${actualChassisID},dcItem=${dcItem}] - cores > max & mem > max`,0,0,0)
  }
  if (dcConfigArrayLocal[dcItem].prelimPerServerNumberOfCoresNeeded <= (chassisArrayLocal[actualChassisID].maxCpuSockets*chassisArrayLocal[actualChassisID].maxCpuCores)&& (dcConfigArrayLocal[dcItem].prelimPerServerMemNeededPerServer > chassisArrayLocal[actualChassisID].maxMemGb)) {
    dcConfigArrayLocal[dcItem].constraintsBasedOnCores = false
    dcConfigArrayLocal[dcItem].constraintsBasedOnNothing = false
    dcConfigArrayLocal[dcItem].constraintsBasedOnMem = true
    dcConfigArrayLocal[dcItem].constraintsBasedOnAll = false
    debugMsg(generalValues, localDebugOn, 5, "dcConfigCheckResourceConstraints", 39, `[chassisID=${actualChassisID},dcItem=${dcItem}] - cores <= max & mem > max`,0,0,0)
  }
    
  
  debugMsg(generalValues, localDebugOn, 5, "dcConfigCheckResourceConstraints", 43, `[chassisID=${actualChassisID},dcItem=${dcItem}] dcConfigArrayLocal[dcItem].constraintsBasedOnCores=${dcConfigArrayLocal[dcItem].constraintsBasedOnCores}, dcConfigArrayLocal[dcItem].constraintsBasedOnNothing=${dcConfigArrayLocal[dcItem].constraintsBasedOnNothing}, dcConfigArrayLocal[dcItem].constraintsBasedOnMem=${dcConfigArrayLocal[dcItem].constraintsBasedOnMem},dcConfigArrayLocal[dcItem].constraintsBasedOnAll=${dcConfigArrayLocal[dcItem].constraintsBasedOnAll}`,0,0,0)
}

export default dcConfigCheckResourceConstraints