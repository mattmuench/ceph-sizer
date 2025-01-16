// Trying to implement X41
const dcConfigCheckResourceConstraints = function (dcConfigArrayLocal, chassisArrayLocal, actualChassisID, dcItem) {

  // check if the provided resources by selected chassis would match the required resources for all media and roles
  console.log(`dcConfigCheckResourceConstraints() 5: [chassisID=${actualChassisID},dcItem=${dcItem}] dcConfigArrayLocal[dcItem].prelimPerServerNumberOfCoresNeeded=${dcConfigArrayLocal[dcItem].prelimPerServerNumberOfCoresNeeded}; dcConfigArrayLocal[dcItem].maxCpuSockets*chassisArrayLocal[actualChassisID].maxCpuCores=${chassisArrayLocal[actualChassisID].maxCpuSockets}*${chassisArrayLocal[actualChassisID].maxCpuCores};`)
  console.log(`dcConfigCheckResourceConstraints() 6: [chassisID=${actualChassisID},dcItem=${dcItem}] dcConfigArrayLocal[dcItem].prelimPerServerMemNeededPerServer=${dcConfigArrayLocal[dcItem].prelimPerServerMemNeededPerServer}; chassisArrayLocal[actualChassisID].maxMemGb)=${chassisArrayLocal[actualChassisID].maxMemGb}`)
  let localCheckResult = 0
  if (dcConfigArrayLocal[dcItem].prelimPerServerNumberOfCoresNeeded <= (chassisArrayLocal[actualChassisID].maxCpuSockets*chassisArrayLocal[actualChassisID].maxCpuCores) && dcConfigArrayLocal[dcItem].prelimPerServerMemNeededPerServer <= chassisArrayLocal[actualChassisID].maxMemGb) {
    dcConfigArrayLocal[dcItem].constraintsBasedOnCores = false
    dcConfigArrayLocal[dcItem].constraintsBasedOnNothing = true
    dcConfigArrayLocal[dcItem].constraintsBasedOnMem = false
    dcConfigArrayLocal[dcItem].constraintsBasedOnAll = false
    console.log(`dcConfigCheckResourceConstraints() 13: [chassisID=${actualChassisID},dcItem=${dcItem}] - cores <= max & mem <= max`)
  }
        
  if ((dcConfigArrayLocal[dcItem].prelimPerServerNumberOfCoresNeeded > (chassisArrayLocal[actualChassisID].maxCpuSockets*chassisArrayLocal[actualChassisID].maxCpuCores)) && (dcConfigArrayLocal[dcItem].prelimPerServerMemNeededPerServer <= chassisArrayLocal[actualChassisID].maxMemGb) ) {
    dcConfigArrayLocal[dcItem].constraintsBasedOnCores = true
    dcConfigArrayLocal[dcItem].constraintsBasedOnNothing = false
    dcConfigArrayLocal[dcItem].constraintsBasedOnMem = false
    dcConfigArrayLocal[dcItem].constraintsBasedOnAll = false
    console.log(`dcConfigCheckResourceConstraints() 21: [chassisID=${actualChassisID},dcItem=${dcItem}] - cores > max & mem <= max`)
  }
  
  if (dcConfigArrayLocal[dcItem].prelimPerServerNumberOfCoresNeeded > (chassisArrayLocal[actualChassisID].maxCpuSockets*chassisArrayLocal[actualChassisID].maxCpuCores)&& (dcConfigArrayLocal[dcItem].prelimPerServerMemNeededPerServer > chassisArrayLocal[actualChassisID].maxMemGb)) {
    dcConfigArrayLocal[dcItem].constraintsBasedOnCores = true
    dcConfigArrayLocal[dcItem].constraintsBasedOnNothing = false
    dcConfigArrayLocal[dcItem].constraintsBasedOnMem = true
    dcConfigArrayLocal[dcItem].constraintsBasedOnAll = true
    console.log(`dcConfigCheckResourceConstraints() 29: [chassisID=${actualChassisID},dcItem=${dcItem}] - cores > max & mem > max`)
  }
  if (dcConfigArrayLocal[dcItem].prelimPerServerNumberOfCoresNeeded <= (chassisArrayLocal[actualChassisID].maxCpuSockets*chassisArrayLocal[actualChassisID].maxCpuCores)&& (dcConfigArrayLocal[dcItem].prelimPerServerMemNeededPerServer > chassisArrayLocal[actualChassisID].maxMemGb)) {
    dcConfigArrayLocal[dcItem].constraintsBasedOnCores = false
    dcConfigArrayLocal[dcItem].constraintsBasedOnNothing = false
    dcConfigArrayLocal[dcItem].constraintsBasedOnMem = true
    dcConfigArrayLocal[dcItem].constraintsBasedOnAll = false
    console.log(`dcConfigCheckResourceConstraints() 36: [chassisID=${actualChassisID},dcItem=${dcItem}] - cores <= max & mem > max`)
  }
    
  
  console.log(`dcConfigCheckResourceConstraints() 40: [chassisID=${actualChassisID},dcItem=${dcItem}] dcConfigArrayLocal[dcItem].constraintsBasedOnCores=${dcConfigArrayLocal[dcItem].constraintsBasedOnCores}, dcConfigArrayLocal[dcItem].constraintsBasedOnNothing=${dcConfigArrayLocal[dcItem].constraintsBasedOnNothing}, dcConfigArrayLocal[dcItem].constraintsBasedOnMem=${dcConfigArrayLocal[dcItem].constraintsBasedOnMem},dcConfigArrayLocal[dcItem].constraintsBasedOnAll=${dcConfigArrayLocal[dcItem].constraintsBasedOnAll}`)
}

export default dcConfigCheckResourceConstraints