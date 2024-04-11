const dcConfigDetermineCapacityRaw = function (generalValuesLocal, workloadsArrayLocal, dcConfigArrayLocal) {
const localDebug = true
  /// Determine the flash and HDD raw capaciy needed based on shares defined by the number of actually used DCs per workload
  /// and assign the actual needed capacity as sum of all for a DC to dcConfig
  /// Inside the WorkloadsArray[] workload, use the selectorArrayDC to determine wether a workload uses this DC before adding the
  /// capacity to a certain actual DC capacity
  for (let dcItem = 0; dcItem < generalValuesLocal.numberOfDCsPossible; dcItem++) {
    let localDCCapacityFlash = 0
    let localDCCapacityHDD = 0
    for (let workloadItem = 0; workloadItem < generalValuesLocal.numberOfWorkloadsPossible; workloadItem++) {
      if (workloadsArrayLocal[workloadItem].selectorArrayDC[dcItem] === true) {
        // workload uses this DC
        dcConfigArrayLocal[dcItem].numberOfWorkloadsInDC += 1
        localDCCapacityFlash += workloadsArrayLocal[workloadItem].reqCapacityGrossSSD / workloadsArrayLocal[workloadItem].sumNumberDC
        localDCCapacityHDD += workloadsArrayLocal[workloadItem].reqCapacityGrossHDD / workloadsArrayLocal[workloadItem].sumNumberDC
      }
    }
    dcConfigArrayLocal[dcItem].capacityNeededForSSD = localDCCapacityFlash
    dcConfigArrayLocal[dcItem].capacityNeededForHDD = localDCCapacityHDD
    if (generalValuesLocal.globalDebug == true || localDebug == true) {
      console.log(`dcConfigDetermineCapacityRaw() 21: DC=${dcItem} raw capacity HDD=${dcConfigArrayLocal[dcItem].capacityNeededForHDD}, SSD=${dcConfigArrayLocal[dcItem].capacityNeededForSSD}`)
    }
  }
}

export default dcConfigDetermineCapacityRaw