import displayMsg from "../common/displayMsg.js"

const  checkInputs = function (generalValuesLocal, workloadsArrayLocal, chassisArrayLocal) {
  const localDebug = true
    /// Determine the flash and HDD raw capaciy needed based on shares defined by the number of actually used DCs per workload
    /// and assign the actual needed capacity as sum of all for a DC to dcConfig
    /// Inside the WorkloadsArray[] workload, use the selectorArrayDC to determine wether a workload uses this DC before adding the
    /// capacity to a certain actual DC capacity
    
  for (let workloadItem = 0; workloadItem < generalValuesLocal.numberOfWorkloadsPossible; workloadItem++) {
    
    var dcSelection = 0
    for (let dcItem = 0; dcItem < generalValuesLocal.numberOfDCsPossible; dcItem++) {
      
      if (workloadsArrayLocal[workloadItem].selectorArrayDC[dcItem] === true) {
        console.log(`dcConfigDetermineCapacityRaw() 12: workload=${workloadItem} found selector for DC=${dcItem}`)
        dcSelection =+ 1
      }
    }
    
    if (dcSelection == 0 && workloadsArrayLocal[workloadItem].reqCapacityNet>0){
      displayMsg(document, "checkInputs", 25, "error", `no DC selected for workload ${workloadItem}`,0,0,0)
    }
    else 
      // Note that all chassis configs are by default optional and workloads might select a setting that is not present in all chassis configs (which is to be refined in calculation - see #107)
      if (workloadsArrayLocal[workloadItem].selectorRGWCache == true){
        let check = 0
        for (let actualChassisID = 0; actualChassisID < generalValuesLocal.numberOfConfigsPossible; actualChassisID++) {
          if(chassisArrayLocal[actualChassisID].sizeNVMe2 == 0) {
            check =+ 1
          }
        }
        if (check == 0){
          displayMsg(document, "checkInputs", 42, "error", `workload has selected RGW cache but no chassis has no RGW cache device: workload=${workloadItem}`,0,0,0)
        }
      }
      if (workloadsArrayLocal[workloadItem].selectorRGWIndexDedicatedFlashPool == true){
        let check = 0
        for (let actualChassisID = 0; actualChassisID < generalValuesLocal.numberOfConfigsPossible; actualChassisID++) {
          if(chassisArrayLocal[actualChassisID].sizeNVMe6 == 0) {
            check =+ 1
          }
        }
        if (check == 0){
          displayMsg(document, "checkInputs", 53, "error", `workload has selected RGW dedicated index pool but no chassis has index device NVMe6 (size=0): workload=${workloadItem}}`,0,0,0)
        }
      }
      // for SSD1
      if (workloadsArrayLocal[workloadItem].selectorSSDDedicatedNVMe == true){
        let check = 0
        for (let actualChassisID = 0; actualChassisID < generalValuesLocal.numberOfConfigsPossible; actualChassisID++) {
          if(chassisArrayLocal[actualChassisID].sizeNVMe5 > true) {
            check =+ 1
          }
        }
        if (check == 0){
          displayMsg(document, "checkInputs", 66, "error", `workload has selected dedicated NVMe for RocksDB for SSD but no chassis has selected NVMe5 to use: workload=${workloadItem}`,0,0,0)
        }
      }
      if (workloadsArrayLocal[workloadItem].selectorSSDDedicatedNVMeForWAL == true){
        let check = 0
        for (let actualChassisID = 0; actualChassisID < generalValuesLocal.numberOfConfigsPossible; actualChassisID++) {
          if(chassisArrayLocal[actualChassisID].useOptane1 == true) {
            if (chassisArrayLocal[actualChassisID].sizeOptane1 == 0){
              displayMsg(document, "checkInputs", 73, "error", `workload has selected dedicated NVMe for WAL for SSD but chassis config has not specified size of NVMe3: workload=${workloadItem}, chassis=${actualChassisID}`,0,0,0)
            }
            check =+ 1
          }
        }
        if (check == 0){
          displayMsg(document, "checkInputs", 79, "error", `workload has selected dedicated NVMe for WAL for SSD but no chassis has selected NVMe3 to use: workload=${workloadItem}`,0,0,0)
        }
      }
      // for NVMe1
      if (workloadsArrayLocal[workloadItem].selectorNVMe1DedicatedNVMe == true){
        let check = 0
        for (let actualChassisID = 0; actualChassisID < generalValuesLocal.numberOfConfigsPossible; actualChassisID++) {
          if(chassisArrayLocal[actualChassisID].useNVMe7 == true) {
            check =+ 1
          }
        }
        if (check == 0){
          displayMsg(document, "checkInputs", 92, "error", `workload has selected dedicated NVMe for RocksDB for NVMe1 but no chassis has selected NVMe7 to use: workload=${workloadItem}`,0,0,0)
        }
      }
      if (workloadsArrayLocal[workloadItem].selectorNVMe1DedicatedNVMeForWAL == true){
        let check = 0
        for (let actualChassisID = 0; actualChassisID < generalValuesLocal.numberOfConfigsPossible; actualChassisID++) {
          if(chassisArrayLocal[actualChassisID].useNVMe8 == true) {
            if (chassisArrayLocal[actualChassisID].sizeNVMe8 == 0){
              displayMsg(document, "checkInputs", 100, "error", `workload has selected dedicated NVMe for WAL for NVMe1 but chassis config has not specified size of NVMe8: workload=${workloadItem}, chassis=${actualChassisID}`,0,0,0)
            }
            check =+ 1
          }
        }
        if (check == 0){
          displayMsg(document, "checkInputs", 106, "error", `workload has selected dedicated NVMe for WAL for NVMe1 but no chassis has selected NVMe8 to use: workload=${workloadItem}`,0,0,0)
        }
      }
    }
  }
  
  export default checkInputs