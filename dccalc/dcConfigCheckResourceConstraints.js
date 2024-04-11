// Trying to implement X41
const dcConfigCheckResourceConstraints = function (dcConfigArrayLocal, chassisArrayLocal, actualChassisID, dcItem) {

  // check if the provided resources by selected chassis would match the required resources for all media and roles
  let localCheckResult = 0
  if (dcConfigArrayLocal[dcItem].prelimPerServerNumberOfCoresNeeded <= (chassisArrayLocal[actualChassisID].maxCpuSockets*chassisArrayLocal[actualChassisID].maxCpuCores) && dcConfigArrayLocal[dcItem].prelimPerServerMemNeededPerServer <= chassisArrayLocal[actualChassisID].maxMemGb) {
    dcConfigArrayLocal[dcItem].constraintsBasedOnCores = false
    dcConfigArrayLocal[dcItem].constraintsBasedOnNothing = true
    dcConfigArrayLocal[dcItem].constraintsBasedOnMem = false
    dcConfigArrayLocal[dcItem].constraintsBasedOnAll = false
  }
  else {
        
    if ((dcConfigArrayLocal[dcItem].prelimPerServerNumberOfCoresNeeded >(chassisArrayLocal[actualChassisID].maxCpuSockets*chassisArrayLocal[actualChassisID].maxCpuCores)) && (dcConfigArrayLocal[dcItem].prelimPerServerMemNeededPerServer > chassisArrayLocal[actualChassisID].maxMemGb) ) {
      dcConfigArrayLocal[dcItem].constraintsBasedOnCores = false
      dcConfigArrayLocal[dcItem].constraintsBasedOnNothing = false
      dcConfigArrayLocal[dcItem].constraintsBasedOnMem = false
      dcConfigArrayLocal[dcItem].constraintsBasedOnAll = true
    }
    else {
      if (dcConfigArrayLocal[dcItem].prelimPerServerNumberOfCoresNeeded > (chassisArrayLocal[actualChassisID].maxCpuSockets*chassisArrayLocal[actualChassisID].maxCpuCores)&& (dcConfigArrayLocal[dcItem].prelimPerServerMemNeededPerServer < chassisArrayLocal[actualChassisID].maxMemGb)) {
        dcConfigArrayLocal[dcItem].constraintsBasedOnCores = true
        dcConfigArrayLocal[dcItem].constraintsBasedOnNothing = false
        dcConfigArrayLocal[dcItem].constraintsBasedOnMem = false
        dcConfigArrayLocal[dcItem].constraintsBasedOnAll = false
      }
      else {
        dcConfigArrayLocal[dcItem].constraintsBasedOnCores = false
        dcConfigArrayLocal[dcItem].constraintsBasedOnNothing = false
        dcConfigArrayLocal[dcItem].constraintsBasedOnMem = true
        dcConfigArrayLocal[dcItem].constraintsBasedOnAll = false
      }
    }
  }
  console.log(`dcConfigCheckResourceConstraints() 35: [chassisID=${actualChassisID},dcItem=${dcItem}] dcConfigArrayLocal[dcItem].constraintsBasedOnCores=${dcConfigArrayLocal[dcItem].constraintsBasedOnCores}, dcConfigArrayLocal[dcItem].constraintsBasedOnNothing=${dcConfigArrayLocal[dcItem].constraintsBasedOnNothing}, dcConfigArrayLocal[dcItem].constraintsBasedOnMem=${dcConfigArrayLocal[dcItem].constraintsBasedOnMem},dcConfigArrayLocal[dcItem].constraintsBasedOnAll=${dcConfigArrayLocal[dcItem].constraintsBasedOnAll}`)
}

export default dcConfigCheckResourceConstraints