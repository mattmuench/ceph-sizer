
const workloadsDetermineRocksDBSpace = function (generalValuesLocal, workloadArrayLocal, sizingConstraints) {
  const localDebug = false

  for (let workloadItem = 0; workloadItem < generalValuesLocal.numberOfWorkloadsPossible; workloadItem++) {
    const useCase = workloadArrayLocal[workloadItem].useCase
    if (generalValuesLocal.globalDebug == true || localDebug == true) {
      console.log(`workloadsDetermineRocksDBSpace() 8: workloadItem=${workloadItem}, USE CASE => ${workloadArrayLocal[workloadItem].useCase}, locally used: ${useCase}`)
    }
    
    sizingConstraints.addCapacityPerPoolUse.forEach((useCaseName)=>{
      if (generalValuesLocal.globalDebug == true) {
        console.log(`workloadsDetermineRocksDBSpace() 13: ENTERING check for use case, useCaseName=${useCaseName[0]}`)
      }
      if (useCaseName[0] == useCase) {
        workloadArrayLocal[workloadItem].rocksDBSpaceInPercent = useCaseName[1]
        if (generalValuesLocal.globalDebug == true) {
          console.log(`workloadsDetermineRocksDBSpace() 18: workloadItem=${workloadItem}, use case picked additional capacity = ${useCaseName[1]}, set item to: ${workloadArrayLocal[workloadItem].rocksDBSpaceInPercent}`)
        }
      }
    })
  }
  
}

const dcConfigDetermineNumberOfDCsInUse = function (generalValuesLocal, workloadsArrayLocal) {
  const localDebug = true
  // cell B41
  let numberOfUsedDCsAllWorkloads = 0
  for ( let dcItem = 0; dcItem < generalValuesLocal.numberOfDCsPossible; dcItem++) {
    
    let dcUsedInWorkload = false
    for ( let workloadID = 0; workloadID < generalValuesLocal.numberOfWorkloadsPossible; workloadID++) {
      if (workloadsArrayLocal[workloadID].selectorArrayDC[dcItem] === true) {
        dcUsedInWorkload = true
      }
    }
    if (dcUsedInWorkload) {numberOfUsedDCsAllWorkloads++}
    // reset counter to restart for the next DC number
    dcUsedInWorkload = false
    
  }
  generalValuesLocal.numberOfDCsInUse = numberOfUsedDCsAllWorkloads
  if (generalValuesLocal.globalDebug == true || localDebug == true) {
    console.log(`dcConfigDetermineNumberOfDCsInUse() 45: set GeneralValues.numberOfDCsInUse to ${generalValuesLocal.numberOfDCsInUse}`)
  }
}

const dcConfigDetermineNumberOfDCsForWorkload = function (generalValuesLocal, workloadsArrayLocal) {
  const localDebug = true
  
  for ( let workloadID = 0; workloadID < generalValuesLocal.numberOfWorkloadsPossible; workloadID++) {
    let dcUsedInWorkload = 0
    for ( let dcItem = 0; dcItem < generalValuesLocal.numberOfDCsPossible; dcItem++) {
      if (workloadsArrayLocal[workloadID].selectorArrayDC[dcItem] === true) {
          dcUsedInWorkload += 1
      }
    }
    workloadsArrayLocal[workloadID].sumNumberDC = dcUsedInWorkload
    if (generalValuesLocal.globalDebug == true || localDebug == true) {
      console.log(`dcConfigDetermineNumberOfDCsForWorkload() 61: workloadID=${workloadID} uses #DCs: ${workloadsArrayLocal[workloadID].sumNumberDC}`)
    }
  }  
}

const workloadDetermineCapacityRaw = function (generalValuesLocal, workloadsArrayLocal, sizingConstraints) {
  const localDebug = true
  /// Determine the raw capacity, flash raw capacity, and HDD raw capacity needed for each workload and store it there
  // The values are per workload in sum for all DCs used for this workload.
  for (let workloadItem = 0; workloadItem < generalValuesLocal.numberOfWorkloadsPossible; workloadItem++) {
    let localGrossCapacity = workloadsArrayLocal[workloadItem].reqCapacityNet * workloadsArrayLocal[workloadItem].reqNumReplica / sizingConstraints.cephClusterNearFull
    workloadsArrayLocal[workloadItem].reqCapacityGrossHDD = localGrossCapacity * (1 - workloadsArrayLocal[workloadItem].reqFlashPercent/100)
    workloadsArrayLocal[workloadItem].reqCapacityGrossSSD = localGrossCapacity * workloadsArrayLocal[workloadItem].reqFlashPercent/100
    if (generalValuesLocal.globalDebug == true || localDebug == true) {
      console.log(`workloadDetermineCapacityRaw() 75: input for calc: net=${workloadsArrayLocal[workloadItem].reqCapacityNet}, replica=${workloadsArrayLocal[workloadItem].reqNumReplica}, clusterNearFull=${sizingConstraints.cephClusterNearFull};localGrossCapacity=${localGrossCapacity} `)
      console.log(`workloadDetermineCapacityRaw() 76: gross capacity per used DC based on replica for workloadID=${workloadItem} => HDD=${workloadsArrayLocal[workloadItem].reqCapacityGrossHDD}, SSD=${workloadsArrayLocal[workloadItem].reqCapacityGrossSSD} `)
    }
  }
}


export { workloadsDetermineRocksDBSpace, dcConfigDetermineNumberOfDCsInUse, dcConfigDetermineNumberOfDCsForWorkload, workloadDetermineCapacityRaw }