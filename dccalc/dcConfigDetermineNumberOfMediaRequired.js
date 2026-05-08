import displayMsg from "../common/displayMsg.js"
import {debugMsg} from "../common/debug.js";

const dcConfigDetermineNumberOfMediaRequired = function (generalValues, workloadsArrayLocal, sizingConstraints, dcConfigArrayLocal, chassisArrayLocal, actualChassisID) {
  let localDebugOn = false

  /**
    This is covering the H41, H42, J41, J42, N41, and O41 (for SSD)
    NOTE: no coverage for NVMe1 use for workloads (yet)
   */
  for (let dcItem = 0; dcItem < generalValues.numberOfDCsPossible; dcItem++) {
    if(dcConfigArrayLocal[dcItem].numberOfWorkloadsInDC >0){
    
      // Check if RGW workload is running in this actual DC => this determines the number of media required for the index.
      /// Note: by default, the index can be backed by the media that is holding the RocksDB but must be flash media. Those can be used - however, for production,
      /// it might be worth to spend additional media for placing the object index: 
      /// - running out of space might block any side (RocksDB or index) from applying any changes. Quick allocations from RocksDB blueFS can be limiting the space
      /// - fast growing number of objects can limit the space for RocksDB and might render the OSD unusable
      /// - the space is limited for any OSD and cannot be grown once running out of space
      /// - spending any kind of dedicated media would allow to grow the index space independently with additional media

    
      let localDCDedicatedObjectIndexCapacity = 0 // raw capacity needed for dedicated index pool in TB
      let localDCNumberOfRGWCacheMedia = 0
      let localDCRequiredIndexCapacityOnNVMe4 = 0  // RocksDB location for HDD
      let localDCRequiredIndexCapacityOnNVMe5DedicatedWAL = 0  // RocksDB location for SSD if on separate NVMe
      let localDCRequiredIndexCapacityOnNVMe5NorWAL = 0  // RocksDB location for SSD if on separate NVMe
      let localDCRequiredIndexCapacityOnSSD1DedicatedWAL = 0  // RocksDB location for SSD if on separate NVMe
      let localDCRequiredIndexCapacityOnSSD1NorWAL = 0  // RocksDB location for SSD if on separate NVMe
      let localDCRequiredIndexCapacityOnNVMe1DedicatedWAL = 0 // RocksDB location for NVMe1 if no separate NVMe for neither RocksDB nor WAL
      let localDCRequiredIndexCapacityOnNVMe1NorWAL = 0 // RocksDB location for NVMe1 if no separate NVMe for neither RocksDB nor WAL
      let localDCRequiredIndexCapacityOnNVMe7DedicatedWAL = 0 // index goes to RocksDB location for NVMe1 if on separate NVMe
      let localDCRequiredIndexCapacityOnNVMe7IncludingWAL = 0 // index goes to RocksDB location for NVMe1 if on separate NVMe
      let localDCCorrectionForUnalignedObjectsHDD = 0  // additional capacity to be taken into account for unaligned object payload data allocation on media
      
      let localSSDCapacityWithDedicatedRocksDBDedicatedWAL = 0 // Any flash (portion of the) workload could be configured using the same media or using dedicated RocksDB media - would need different number of media 
      let localSSDCapacityWithDedicatedRocksDBIncludingWAL = 0
      let localSSDCapacityWithoutDedicatedRocksDBDedicatedWAL = 0 // Any flash (portion of the) workload could be configured using the same media or using dedicated RocksDB media - would need different number of media 
      let localSSDCapacityWithoutDedicatedRocksDBNorWAL = 0
      let localSSDAddCapacityWithOutDedicatedRocksDB = 0 // Any flash (portion of the) workload could be configured using the same media or using dedicated RocksDB media - would need this capacity on separate media
      //  The following is (might be now) used since the NVMe can have a dedicated NVMe type 7 as location for WAL and the NVMe might not always use the same media for placing the RocksDB
      let localNVMe1CapacityWithDedicatedRocksDBDedicatedWAL = 0 // Any flash (portion of the) workload could be configured using the same media or using dedicated RocksDB media - would need different number of media 
      let localNVMe1CapacityWithDedicatedRocksDBIncludingWAL = 0 
      let localNVMe1CapacityWithoutDedicatedRocksDBDedicatedWAL = 0 // Any flash (portion of the) workload could be configured using the same media or using dedicated RocksDB media - would need different number of media 
      let localNVMe1CapacityWithoutDedicatedRocksDBNorWAL = 0

      let localDCRocksDBSizeHDD = 0
      let localDCRocksDBSizeSSDWithDedicatedNVMeDedicatedWAL = 0
      let localDCRocksDBSizeSSDWithDedicatedNVMeIncludingWAL = 0
      let localDCRocksDBSizeSSDWithoutDedicatedNVMeDedicatedWAL = 0
      let localDCRocksDBSizeSSDWithoutDedicatedNVMeNorWAL = 0

      let localDCRocksDBSizeNVMe1WithDedicatedNVMeDedicatedWAL = 0 
      let localDCRocksDBSizeNVMe1WithDedicatedNVMeIncludingWAL = 0 
      let localDCRocksDBSizeNVMe1WithoutDedicatedNVMeDedicatedWAL = 0
      let localDCRocksDBSizeNVMe1WithoutDedicatedNVMeNorWAL = 0
      
      // all the following don't use a dedicated device for WAL
      let localNumberOfSSDNeededDedicatedRocksDBIncludingWAL = 0
      let localNumberOfSSDNeededDedicatedRocksDBDedicatedWAL = 0
      let localNumberOfSSDNeededNonDedicatedRocksDBNorWAL = 0
      let localNumberOfSSDNeededNonDedicatedRocksDBDedicatedWAL = 0

      let localNumberOfNVMe1NeededDedicatedRocksDBDedicatedWAL = 0
      let localNumberOfNVMe1NeededDedicatedRocksDBIncludingWAL = 0

      // processing the workloads and calculating the number of capacity needed for each config case
      for (let workloadItem = 0; workloadItem < generalValues.numberOfWorkloadsPossible; workloadItem++) {

        let localDCObjectIndexCapacity = 0 // takes all the actual index capacity required for the workload to be processed into the different locations
        let localWorkloadCorrectionForUnalignedObjectsHDD = 0
        let localWorkloadCorrectionForUnalignedObjectsSSD = 0
        let localDCCorrectionForUnalignedObjectsSSD1WithDedicatedRocksDBDedicatedWAL = 0 // additional capacity to be taken into account for unaligned object payload data allocation on media 
        let localDCCorrectionForUnalignedObjectsSSD1WithDedicatedRocksDBIncludingWAL = 0 // additional capacity to be taken into account for unaligned object payload data allocation on media 
        let localDCCorrectionForUnalignedObjectsSSD1WithoutDedicatedRocksDBDedicatedWAL = 0 // additional capacity to be taken into account for unaligned object payload data allocation on media 
        let localDCCorrectionForUnalignedObjectsSSD1WithoutDedicatedRocksDBNorWAL = 0 // additional capacity to be taken into account for unaligned object payload data allocation on media 
        let localWorkloadCorrectionForUnalignedObjectsNVMe1 = 0
        let localDCCorrectionForUnalignedObjectsNVMe1WithDedicatedRocksDBDedicatedWAL = 0 // additional capacity to be taken into account for unaligned object payload data allocation on media 
        let localDCCorrectionForUnalignedObjectsNVMe1WithDedicatedRocksDBIncludingWAL = 0 // additional capacity to be taken into account for unaligned object payload data allocation on media 
        let localDCCorrectionForUnalignedObjectsNVMe1WithoutDedicatedRocksDBDedicatedWAL = 0 // additional capacity to be taken into account for unaligned object payload data allocation on media 
        let localDCCorrectionForUnalignedObjectsNVMe1WithoutDedicatedRocksDBNorWAL = 0 // additional capacity to be taken into account for unaligned object payload data allocation on media 

        let localWorkloadRocksDBSizeHDD = 0
        let localWorkloadRocksDBSizeSSDWithDedicatedNVMeIncludingWAL = 0
        let localWorkloadRocksDBSizeSSDWithDedicatedNVMeDedicatedWAL = 0
        let localWorkloadRocksDBSizeSSDWithoutDedicatedNVMeDedicatedWAL = 0
        let localWorkloadRocksDBSizeSSDWithoutDedicatedNVMeNorWAL = 0 // no NVMe for placing RocksDB+WAL separately
        
        let localWorkloadRocksDBSizeNVMe1WithDedicatedNVMeIncludingWAL = 0 // additional NVMe for placing RocksDB - WAL is collocated with RocksDB
        let localWorkloadRocksDBSizeNVMe1WithDedicatedNVMeDedicatedWAL = 0 // additional NVMe for placing RocksDB - WAL goes to NVMe type 7
        let localWorkloadRocksDBSizeNVMe1WithoutDedicatedNVMeNorWAL = 0 // no additional NVMe for placing RocksDB - WAL is collocated with RocksDB
        let localWorkloadRocksDBSizeNVMe1WithoutDedicatedNVMeDedicatedWAL = 0 // no additional NVMe for placing RocksDB - WAL goes to NVMe type 7
        
        

        if (workloadsArrayLocal[workloadItem].reqCapacityNet > 0) {
          // RGW workloads
          if (workloadsArrayLocal[workloadItem].selectorArrayDC[dcItem] === true && workloadsArrayLocal[workloadItem].useCase === "rgwdata" ) {

            // workload uses this DC AND actual workload is an RGW workload
            //  Then check for the size needed and calculate the capacity needed for all workloads.
            // First: how many replica we'll need => if a single DC is used, 3 replica must be accounted for it. For more than a single DC, it depends on the number of
            // replica to be hosted within a single DC. This is different for 2 main DCs (4 replicas required, 2 per main DC) and all configs with more: then 3 replicas.
            //
            // Note: The index for RGW objects is either stored alongside with the pool itself of might use a dedicated pool. In case of the index uses no separate pool, 
            //       the capacity is needed within the RocksDB space. If HDD fronted by flash media then the space is needed there and must be taken into account for sizing
            //       those media for providing appropriate space that doesn't conflict with neither RocksDB nor the raw payload data, in design already.
            //       This additional capacity might go into a dedicated flash pool if configured this way. Otherwise needs to go into the RocksDB flash space.
            //       Flash only portion of a workload will need the capacity on the media for the RocksDB or on the media directly. HDD (hybrid supported only) pools will need
            //       this capacity on RocksDB flash media. However, based on design, also the index might use a dedicated pool for it.
            // Per case, calculate the needed capacity for hosting the index. This is first independent of any assignment to a certain DC. Then divide the resulting individual capacity 
            // by the number of actually used DCs and sum it up for all the workloads.

            // calculate the local required index capacity (in this DC) for this workload (in TB) 
            //    => #DC=1 requires that all replica reside in this actual DC and should be the default number, 
            //    => #DC>1 would apply the replica number to the index as well.
            debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 117, `[chassisID=${actualChassisID},workloadID=${workloadItem},DC=${dcItem}] workload in ACTUAL DC #${dcItem} and is type ${workloadsArrayLocal[workloadItem].useCase}`,0,0,0)
            if (workloadsArrayLocal[workloadItem].sumNumberDC === 1) {
              localDCObjectIndexCapacity = workloadsArrayLocal[workloadItem].reqCapacityNet * 1000*1000*1000*1000/(workloadsArrayLocal[workloadItem].sizeAvgObj * 1024) * sizingConstraints.expectedAverageEntrySizeInObjectIndexInBytes / 1024/1024/1024/1024 * workloadsArrayLocal[workloadItem].selectorRGWLifecycleNumVersions * sizingConstraints.requiredNumberOfReplicaForObjectIndex / workloadsArrayLocal[workloadItem].sumNumberDC
              debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 120, `[chassisID=${actualChassisID},workloadID=${workloadItem},DC=${dcItem}] workload ONLY in ACTUAL DC #${dcItem} and needed capacity for object index=${localDCObjectIndexCapacity}`,0,0,0)
            }
            else {
              localDCObjectIndexCapacity = workloadsArrayLocal[workloadItem].reqCapacityNet * 1000*1000*1000*1000/(workloadsArrayLocal[workloadItem].sizeAvgObj * 1024) * sizingConstraints.expectedAverageEntrySizeInObjectIndexInBytes / 1024/1024/1024/1024 * workloadsArrayLocal[workloadItem].selectorRGWLifecycleNumVersions * workloadsArrayLocal[workloadItem].reqNumReplica / workloadsArrayLocal[workloadItem].sumNumberDC
              debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 124, `[chassisID=${actualChassisID},workloadID=${workloadItem},DC=${dcItem}] workloadsArrayLocal[workloadItem].sizeAvgObj=${workloadsArrayLocal[workloadItem].sizeAvgObj}`,0,0,0)
              debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 125, `[chassisID=${actualChassisID},workloadID=${workloadItem},DC=${dcItem}] workload NOT ONLY in ACTUAL DC #${dcItem} and needed capacity for object index=${localDCObjectIndexCapacity}`,0,0,0)

            }

            // Determine desired configuration for object index and add capacity to where needed.
            debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 130, `[chassisID=${actualChassisID},workloadID=${workloadItem},DC=${dcItem}] rgw workload in DC#${dcItem} selected capacity for dedicated object index=${workloadsArrayLocal[workloadItem].selectorRGWIndexDedicatedFlashPool}`,0,0,0)
            if (workloadsArrayLocal[workloadItem].selectorRGWIndexDedicatedFlashPool === true) {
              // if this is set it's for both HDD and flash based portions of the worklod - it's always going to the separate index pool and we need to collect how much capacity is needed
              // for this pool. The amount needed for raw will be already calculated by this because we'll apply the required replication and the number of DCs used for the workload.
              // The media type would be NVMe6 .
              localDCDedicatedObjectIndexCapacity += localDCObjectIndexCapacity
              debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 136, `[chassisID=${actualChassisID},workloadID=${workloadItem},DC=${dcItem}] rgw workload in DC#${dcItem} needs capacity for dedicated object index=${localDCDedicatedObjectIndexCapacity}`,0,0,0)
            }
            else {
              // There is no general desire for the actual workload to use a dedicated index pool. HDD would require a hybrid config (for the default use, anyways) and would need to add the capacity to the RocksDB capacity space.
              // Depending on the SSD/NVMe configuration, a separate space might be needed for the data portion or on a dedicated media for RocksDB.
              debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 141, `[chassisID=${actualChassisID},workloadID=${workloadItem},DC=${dcItem}] rgw workload in DC#${dcItem} no dedicated index pool`,0,0,0)
              
              // For HDD anyways, because only with fronting flash for RocksDB, it needs to be allocated on NVMe4
              localDCRequiredIndexCapacityOnNVMe4 += localDCObjectIndexCapacity * (100 - workloadsArrayLocal[workloadItem].reqFlashPercent) / 100
              
              // and flash: reserve additional space on data device, dedicated NVMe for RocksDB or WAL 
              if (workloadsArrayLocal[workloadItem].selectorNVMe === true) {
                // NVMe1
                if (workloadsArrayLocal[workloadItem].selectorNVMe1DedicatedNVMe === true) {
                  // RocksDB is on NVMe7 - so index as well
                  if (workloadsArrayLocal[workloadItem].selectorNVMe1DedicatedNVMeForWAL === true) {
                    localDCRequiredIndexCapacityOnNVMe7DedicatedWAL += localDCObjectIndexCapacity * workloadsArrayLocal[workloadItem].reqFlashPercent / 100
                  debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 153, `[chassisID=${actualChassisID},workloadID=${workloadItem},DC=${dcItem}] rgw workload in DC#${dcItem} needs index capacity on dedicated NVMe for NVMe1(NVMe7):${localDCRequiredIndexCapacityOnNVMe7DedicatedWAL}`,0,0,0)  
                  }
                  else {
                    localDCRequiredIndexCapacityOnNVMe7IncludingWAL += localDCObjectIndexCapacity * workloadsArrayLocal[workloadItem].reqFlashPercent / 100
                    debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 157, `[chassisID=${actualChassisID},workloadID=${workloadItem},DC=${dcItem}] rgw workload in DC#${dcItem} needs index capacity on dedicated NVMe for NVMe(NVMe7):${localDCRequiredIndexCapacityOnNVMe7IncludingWAL}`,0,0,0)  
                  }
                }
                else {
                  // RocksDB is on NVMe1 - if no dedicated WAL, index is on NVMe1
                    if (workloadsArrayLocal[workloadItem].selectorNVMe1DedicatedNVMeForWAL === true) {
                      localDCRequiredIndexCapacityOnNVMe1DedicatedWAL += localDCObjectIndexCapacity * workloadsArrayLocal[workloadItem].reqFlashPercent / 100
                      debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 164, `[chassisID=${actualChassisID},workloadID=${workloadItem},DC=${dcItem}] rgw workload in DC#${dcItem} - no dedicated NVMe for RocksDB but WAL - needs index capacity on NVMe1:${localDCRequiredIndexCapacityOnNVMe1DedicatedWAL}`,0,0,0)
                    }
                    else {
                      localDCRequiredIndexCapacityOnNVMe1NorWAL += localDCObjectIndexCapacity * workloadsArrayLocal[workloadItem].reqFlashPercent / 100
                      debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 168, `[chassisID=${actualChassisID},workloadID=${workloadItem},DC=${dcItem}] rgw workload in DC#${dcItem} - no dedicated NVMe for RocksDB nor WAL - needs index capacity on NVMe1:${localDCRequiredIndexCapacityOnNVMe1NorWAL}`,0,0,0)
                    }
                }
              }
              else {
                // SSD
                if (workloadsArrayLocal[workloadItem].selectorSSDDedicatedNVMe === true) {
                  // RocksDB is on NVMe5 - so index as well even with dedicated WAL
                  if (workloadsArrayLocal[workloadItem].selectorSSDDedicatedNVMeForWAL === true) {
                    localDCRequiredIndexCapacityOnNVMe5DedicatedWAL += localDCObjectIndexCapacity * workloadsArrayLocal[workloadItem].reqFlashPercent / 100
                    debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 178, `[chassisID=${actualChassisID},workloadID=${workloadItem},DC=${dcItem}] rgw workload in DC#${dcItem} needs index capacity on dedicated NVMe for SSD1(NVMe5):${localDCRequiredIndexCapacityOnNVMe5DedicatedWAL}`,0,0,0)  
                  }
                  else {
                    // RocksDB is on NVMe5
                    localDCRequiredIndexCapacityOnNVMe5NorWAL += localDCObjectIndexCapacity * workloadsArrayLocal[workloadItem].reqFlashPercent / 100
                    debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 183, `[chassisID=${actualChassisID},workloadID=${workloadItem},DC=${dcItem}] rgw workload in DC#${dcItem} needs index pool on dedicated NVMe for SSD1(NVMe5):${localDCRequiredIndexCapacityOnNVMe5NorWAL}`,0,0,0)
                  }
                }
                else {
                  // RocksDB is on SSD1
                  if (workloadsArrayLocal[workloadItem].selectorSSDDedicatedNVMeForWAL === true) {
                    localDCRequiredIndexCapacityOnSSD1DedicatedWAL += localDCObjectIndexCapacity * workloadsArrayLocal[workloadItem].reqFlashPercent / 100
                    debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 190, `[chassisID=${actualChassisID},workloadID=${workloadItem},DC=${dcItem}] rgw workload in DC#${dcItem} - no dedicated NVMe for RocksDB - needs index capacity on SSD1 - w/ extra WAL:${localDCRequiredIndexCapacityOnSSD1DedicatedWAL}`,0,0,0)
                  }
                  else {
                    localDCRequiredIndexCapacityOnSSD1NorWAL += localDCObjectIndexCapacity * workloadsArrayLocal[workloadItem].reqFlashPercent / 100
                    debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 194, `[chassisID=${actualChassisID},workloadID=${workloadItem},DC=${dcItem}] rgw workload in DC#${dcItem} - no dedicated NVMe for RocksDB nor WAL - needs index capacity on SSD1:${localDCRequiredIndexCapacityOnSSD1NorWAL}`,0,0,0)
                  }
                }
              }
            }

            // Determine the need of RGW dedicated cache and sum up a dedicated media per workload and minNumber of instances for RGW per workload
            if (workloadsArrayLocal[workloadItem].selectorRGWCache === true) {
              if (chassisArrayLocal[actualChassisID].useRGWCaching == 1) {
                localDCNumberOfRGWCacheMedia += sizingConstraints.minNumberOfInstancesRoleRGW
                debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 204, `[chassisID=${actualChassisID},workloadID=${workloadItem},DC=${dcItem}] RGW cache media needed=${localDCNumberOfRGWCacheMedia}`,0,0,0)
              }
              else {
                displayMsg(document, "dcConfigDetermineNumberOfMediaRequired", 207, "error", `[chassisID=${actualChassisID},workloadID=${workloadItem},DC=${dcItem}] RGW cache media selected but chassis doesn't support it`,0,0,0)
              }
              
            }

            // Apply corrections to RGW use cases based on avg object size   ===> This might need to go prior to calculating the HDD and assigning it in top of the function
            // Both values in TB. Since the value of gross capacity for the workload is not reflecting the capacity distribution across DCs, the number of DCs in use for the workload needs to be 
            //   taken into account, since this here is reflecting the actual needed capacity on the media inside a specific DC - for all individual workloads.
            localWorkloadCorrectionForUnalignedObjectsHDD = (((workloadsArrayLocal[workloadItem].sizeAvgObj*1024) % sizingConstraints.fixedMinAllocSizeOnMediaHDD) / (workloadsArrayLocal[workloadItem].sizeAvgObj*1024)) * workloadsArrayLocal[workloadItem].reqCapacityGrossHDD / workloadsArrayLocal[workloadItem].sumNumberDC
            debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 216, `[chassisID=${actualChassisID},workloadID=${workloadItem},DC=${dcItem}] (workloadsArrayLocal[workloadItem].sizeAvgObj*1024) % sizingConstraints.fixedMinAllocSizeOnMediaHDD=${(workloadsArrayLocal[workloadItem].sizeAvgObj*1024) % sizingConstraints.fixedMinAllocSizeOnMediaHDD} `,0,0,0)
            debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 217, `[chassisID=${actualChassisID},workloadID=${workloadItem},DC=${dcItem}] workloadsArrayLocal[workloadItem].sizeAvgObj*1024=${workloadsArrayLocal[workloadItem].sizeAvgObj*1024}`,0,0,0)
            debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 218, `[chassisID=${actualChassisID},workloadID=${workloadItem},DC=${dcItem}] (((workloadsArrayLocal[workloadItem].sizeAvgObj*1024) % sizingConstraints.fixedMinAllocSizeOnMediaHDD) / (workloadsArrayLocal[workloadItem].sizeAvgObj*1024))=${(((workloadsArrayLocal[workloadItem].sizeAvgObj*1024) % sizingConstraints.fixedMinAllocSizeOnMediaHDD) / (workloadsArrayLocal[workloadItem].sizeAvgObj*1024))}`,0,0,0)
            debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 219, `[chassisID=${actualChassisID},workloadID=${workloadItem},DC=${dcItem}] localWorkloadCorrectionForUnalignedObjectsHDD = (((workloadsArrayLocal[workloadItem].sizeAvgObj*1024) % sizingConstraints.fixedMinAllocSizeOnMediaHDD) / (workloadsArrayLocal[workloadItem].sizeAvgObj*1024)) * workloadsArrayLocal[workloadItem].reqCapacityGrossHDD / workloadsArrayLocal[workloadItem].sumNumberDC = ${(((workloadsArrayLocal[workloadItem].sizeAvgObj*1024) % sizingConstraints.fixedMinAllocSizeOnMediaHDD) /(workloadsArrayLocal[workloadItem].sizeAvgObj*1024)) * workloadsArrayLocal[workloadItem].reqCapacityGrossHDD / workloadsArrayLocal[workloadItem].sumNumberDC}`,0,0,0)
            localDCCorrectionForUnalignedObjectsHDD += localWorkloadCorrectionForUnalignedObjectsHDD
            // for SSD: distinguish between normal and dedicated RocksDB media - not for data placement but for picking the right deployment schemes selected for the workloads
            if (workloadsArrayLocal[workloadItem].selectorNVMe === true) {
              // NVMe1
              localWorkloadCorrectionForUnalignedObjectsNVMe1 = (((workloadsArrayLocal[workloadItem].sizeAvgObj*1024) % sizingConstraints.fixedMinAllocSizeOnMediaNVMe) / (workloadsArrayLocal[workloadItem].sizeAvgObj*1024)) * workloadsArrayLocal[workloadItem].reqCapacityGrossSSD / workloadsArrayLocal[workloadItem].sumNumberDC
              if (workloadsArrayLocal[workloadItem].selectorNVMe1DedicatedNVMe === true) {
                if (workloadsArrayLocal[workloadItem].selectorNVMe1DedicatedNVMeForWAL === true) {
                  localDCCorrectionForUnalignedObjectsNVMe1WithDedicatedRocksDBDedicatedWAL += localWorkloadCorrectionForUnalignedObjectsNVMe1
                }
                else {
                  localDCCorrectionForUnalignedObjectsNVMe1WithDedicatedRocksDBIncludingWAL += localWorkloadCorrectionForUnalignedObjectsNVMe1
                }
              }
              else {
                if (workloadsArrayLocal[workloadItem].selectorNVMe1DedicatedNVMeForWAL === true) { 
                  localDCCorrectionForUnalignedObjectsNVMe1WithoutDedicatedRocksDBDedicatedWAL += localWorkloadCorrectionForUnalignedObjectsNVMe1
                }
                else {
                  localDCCorrectionForUnalignedObjectsNVMe1WithoutDedicatedRocksDBNorWAL += localWorkloadCorrectionForUnalignedObjectsNVMe1
                }
                
              }
            }
            else {
              // SSD
              localWorkloadCorrectionForUnalignedObjectsSSD = (((workloadsArrayLocal[workloadItem].sizeAvgObj*1024) % sizingConstraints.fixedMinAllocSizeOnMediaSSD) / (workloadsArrayLocal[workloadItem].sizeAvgObj*1024)) * workloadsArrayLocal[workloadItem].reqCapacityGrossSSD / workloadsArrayLocal[workloadItem].sumNumberDC
              if (workloadsArrayLocal[workloadItem].selectorSSDDedicatedNVMe === true) {
                if (workloadsArrayLocal[workloadItem].selectorSSDDedicatedNVMeForWAL === true) {
                  localDCCorrectionForUnalignedObjectsSSD1WithDedicatedRocksDBDedicatedWAL += localWorkloadCorrectionForUnalignedObjectsSSD
                }
                else {
                  localDCCorrectionForUnalignedObjectsSSD1WithDedicatedRocksDBIncludingWAL += localWorkloadCorrectionForUnalignedObjectsSSD
                }
                
              }
              else {
                if (workloadsArrayLocal[workloadItem].selectorSSDDedicatedNVMeForWAL === true) {
                  localDCCorrectionForUnalignedObjectsSSD1WithoutDedicatedRocksDBDedicatedWAL += localWorkloadCorrectionForUnalignedObjectsSSD
                }
                else {
                  localDCCorrectionForUnalignedObjectsSSD1WithoutDedicatedRocksDBNorWAL += localWorkloadCorrectionForUnalignedObjectsSSD
                }
              }
            }
            
            /// All should be complete here for specifics of RGW workloads.
            debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 266, `[chassisID=${actualChassisID},workloadID=${workloadItem},DC=${dcItem}] local capacity correction unaligned RGW object parts - for HDD=${localWorkloadCorrectionForUnalignedObjectsHDD}`,0,0,0)
            debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 267, `[chassisID=${actualChassisID},workloadID=${workloadItem},DC=${dcItem}] local capacity correction unaligned file parts - for SSD w/ RocksDB w/ WAL =${localDCCorrectionForUnalignedObjectsSSD1WithDedicatedRocksDBDedicatedWAL}, for SSD w/ RocksDB w/o WAL =${localDCCorrectionForUnalignedObjectsSSD1WithDedicatedRocksDBIncludingWAL}`,0,0,0)
            debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 268, `[chassisID=${actualChassisID},workloadID=${workloadItem},DC=${dcItem}] local capacity correction unaligned file parts - for SSD w/o RocksDB w/ WAL =${localDCCorrectionForUnalignedObjectsSSD1WithoutDedicatedRocksDBDedicatedWAL}, for SSD w/o RocksDB w/o WAL =${localDCCorrectionForUnalignedObjectsSSD1WithoutDedicatedRocksDBNorWAL}`,0,0,0)
            debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 269, `[chassisID=${actualChassisID},workloadID=${workloadItem},DC=${dcItem}] local capacity correction unaligned file parts - for NVMe w/ RocksDB w/ WAL =${localDCCorrectionForUnalignedObjectsNVMe1WithDedicatedRocksDBDedicatedWAL}, for NVMe w/ RocksDB w/o WAL =${localDCCorrectionForUnalignedObjectsNVMe1WithDedicatedRocksDBIncludingWAL}`,0,0,0)
            debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 270, `[chassisID=${actualChassisID},workloadID=${workloadItem},DC=${dcItem}] local capacity correction unaligned file parts - for NVMe w/o RocksDB w/ WAL =${localDCCorrectionForUnalignedObjectsNVMe1WithoutDedicatedRocksDBDedicatedWAL}, for NVMe w/o RocksDB w/o WAL =${localDCCorrectionForUnalignedObjectsNVMe1WithoutDedicatedRocksDBNorWAL}`,0,0,0)
          }    

          // CephFS workloads
          if (workloadsArrayLocal[workloadItem].selectorArrayDC[dcItem] === true && workloadsArrayLocal[workloadItem].useCase === "filedata" ) { 
            // Apply corrections to cephfs use cases based on avg object size
            // Both values in TB. Since the value of gross capacity for the workload is not reflecting the capacity distribution across DCs, the number of DCs in use for the workload needs to be 
            //   taken into account, since this here is reflecting the actual needed capacity on the media inside a specific DC - for all individual workloads.
            localWorkloadCorrectionForUnalignedObjectsHDD = (((workloadsArrayLocal[workloadItem].sizeAvgFile*1024) % sizingConstraints.fixedMinAllocSizeOnMediaHDD) / (workloadsArrayLocal[workloadItem].sizeAvgFile*1024)) * workloadsArrayLocal[workloadItem].reqCapacityGrossHDD / workloadsArrayLocal[workloadItem].sumNumberDC
            localDCCorrectionForUnalignedObjectsHDD += localWorkloadCorrectionForUnalignedObjectsHDD
            if (workloadsArrayLocal[workloadItem].selectorNVMe === true){
              // NVMe1
              localWorkloadCorrectionForUnalignedObjectsNVMe1 = (((workloadsArrayLocal[workloadItem].sizeAvgFile*1024) % sizingConstraints.fixedMinAllocSizeOnMediaNVMe) / (workloadsArrayLocal[workloadItem].sizeAvgFile*1024)) * workloadsArrayLocal[workloadItem].reqCapacityGrossNVMe / workloadsArrayLocal[workloadItem].sumNumberDC
              if (workloadsArrayLocal[workloadItem].selectorNVMe1DedicatedNVMe === true) {  
                if (workloadsArrayLocal[workloadItem].selectorNVMe1DedicatedNVMeForWAL === true) {
                  localDCCorrectionForUnalignedObjectsNVMe1WithDedicatedRocksDBDedicatedWAL += localWorkloadCorrectionForUnalignedObjectsNVMe1
                }
                else {
                  localDCCorrectionForUnalignedObjectsNVMe1WithDedicatedRocksDBIncludingWAL += localWorkloadCorrectionForUnalignedObjectsNVMe1
                }
              }
              else {
                if (workloadsArrayLocal[workloadItem].selectorNVMe1DedicatedNVMeForWAL === true) {
                  localDCCorrectionForUnalignedObjectsNVMe1WithoutDedicatedRocksDBDedicatedWAL += localWorkloadCorrectionForUnalignedObjectsNVMe1
                }
                else {
                  localDCCorrectionForUnalignedObjectsNVMe1WithoutDedicatedRocksDBNorWAL += localWorkloadCorrectionForUnalignedObjectsNVMe1
                }
              }
            }
            else {
              // SSD
              localWorkloadCorrectionForUnalignedObjectsSSD = (((workloadsArrayLocal[workloadItem].sizeAvgFile*1024) % sizingConstraints.fixedMinAllocSizeOnMediaSSD) / (workloadsArrayLocal[workloadItem].sizeAvgFile*1024)) * workloadsArrayLocal[workloadItem].reqCapacityGrossSSD / workloadsArrayLocal[workloadItem].sumNumberDC
              debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 303, `[chassisID=${actualChassisID},workloadID=${workloadItem},DC=${dcItem}] localWorkloadCorrectionForUnalignedObjectsSSD=${localWorkloadCorrectionForUnalignedObjectsSSD} = (((workloadsArrayLocal[workloadItem].sizeAvgFile=${workloadsArrayLocal[workloadItem].sizeAvgFile} * 1024) % sizingConstraints.fixedMinAllocSizeOnMediaSSD=${sizingConstraints.fixedMinAllocSizeOnMediaSSD}) / (workloadsArrayLocal[workloadItem].sizeAvgFile=${workloadsArrayLocal[workloadItem].sizeAvgFile} * 1024)) * workloadsArrayLocal[workloadItem].reqCapacityGrossSSD=${workloadsArrayLocal[workloadItem].reqCapacityGrossSSD} / workloadsArrayLocal[workloadItem].sumNumberDC=${workloadsArrayLocal[workloadItem].sumNumberDC}`,0,0,0)
              if (workloadsArrayLocal[workloadItem].selectorSSDDedicatedNVMe === true) {
                if (workloadsArrayLocal[workloadItem].selectorSSDDedicatedNVMeForWAL === true) {
                  localDCCorrectionForUnalignedObjectsSSD1WithDedicatedRocksDBDedicatedWAL += localWorkloadCorrectionForUnalignedObjectsSSD
                }
                else {
                  localDCCorrectionForUnalignedObjectsSSD1WithDedicatedRocksDBIncludingWAL += localWorkloadCorrectionForUnalignedObjectsSSD
                }
              }
              else {
                if (workloadsArrayLocal[workloadItem].selectorSSDDedicatedNVMeForWAL === true) {
                  localDCCorrectionForUnalignedObjectsSSD1WithoutDedicatedRocksDBDedicatedWAL += localWorkloadCorrectionForUnalignedObjectsSSD
                }
                else{
                  localDCCorrectionForUnalignedObjectsSSD1WithoutDedicatedRocksDBNorWAL += localWorkloadCorrectionForUnalignedObjectsSSD
                }
              }
            }
            
            debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 322, `[chassisID=${actualChassisID},workloadID=${workloadItem},DC=${dcItem}] local capacity correction unaligned file parts - for HDD=${localDCCorrectionForUnalignedObjectsHDD}`,0,0,0)
            debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 323, `[chassisID=${actualChassisID},workloadID=${workloadItem},DC=${dcItem}] local capacity correction unaligned file parts - for SSD w/ RocksDB w/ WAL =${localDCCorrectionForUnalignedObjectsSSD1WithDedicatedRocksDBDedicatedWAL}, for SSD w/ RocksDB w/o WAL =${localDCCorrectionForUnalignedObjectsSSD1WithDedicatedRocksDBIncludingWAL}`,0,0,0)
            debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 324, `[chassisID=${actualChassisID},workloadID=${workloadItem},DC=${dcItem}] local capacity correction unaligned file parts - for SSD w/o RocksDB w/ WAL =${localDCCorrectionForUnalignedObjectsSSD1WithoutDedicatedRocksDBDedicatedWAL}, for SSD w/o RocksDB w/o WAL =${localDCCorrectionForUnalignedObjectsSSD1WithoutDedicatedRocksDBNorWAL}`,0,0,0)
            debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 325, `[chassisID=${actualChassisID},workloadID=${workloadItem},DC=${dcItem}] local capacity correction unaligned file parts - for NVMe w/ RocksDB w/ WAL =${localDCCorrectionForUnalignedObjectsNVMe1WithDedicatedRocksDBDedicatedWAL}, for NVMe w/ RocksDB w/o WAL =${localDCCorrectionForUnalignedObjectsNVMe1WithDedicatedRocksDBIncludingWAL}`,0,0,0)
            debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 326, `[chassisID=${actualChassisID},workloadID=${workloadItem},DC=${dcItem}] local capacity correction unaligned file parts - for NVMe w/o RocksDB w/ WAL =${localDCCorrectionForUnalignedObjectsNVMe1WithoutDedicatedRocksDBDedicatedWAL}, for NVMe w/o RocksDB w/o WAL =${localDCCorrectionForUnalignedObjectsNVMe1WithoutDedicatedRocksDBNorWAL}`,0,0,0)
          }
          
          // For all capacity related calculation for real data placement
          if (workloadsArrayLocal[workloadItem].selectorArrayDC[dcItem] === true) {
            // RocksDB size must be calculated for any case: based on raw capacity needed per for the workload in the DC plus the correction for unaligned data or data portions - then decide where this additional
            //   capacity should go to: either dedicated media or the block device (for flash storage)
            localWorkloadRocksDBSizeHDD = workloadsArrayLocal[workloadItem].reqCapacityGrossHDD / workloadsArrayLocal[workloadItem].sumNumberDC * workloadsArrayLocal[workloadItem].rocksDBSpaceInPercent / 100 + localWorkloadCorrectionForUnalignedObjectsHDD
            debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 334, `[chassisID=${actualChassisID},workloadID=${workloadItem},DC=${dcItem}] CHECK HDD: ${workloadsArrayLocal[workloadItem].reqCapacityGrossHDD} / ${workloadsArrayLocal[workloadItem].sumNumberDC} * ${workloadsArrayLocal[workloadItem].rocksDBSpaceInPercent} / 100 + ${localWorkloadCorrectionForUnalignedObjectsHDD}`,0,0,0)
            localDCRocksDBSizeHDD += localWorkloadRocksDBSizeHDD
            // for flash: distinguish between normal and dedicated RocksDB media - also assign here the required SSD capacity to one of the two groups
            // of dedicated vs non-dedicated media for RocksDB
            if (workloadsArrayLocal[workloadItem].selectorNVMe === true ) {
              if (workloadsArrayLocal[workloadItem].selectorNVMe1DedicatedNVMe === true) {
                if (workloadsArrayLocal[workloadItem].selectorNVMe1DedicatedNVMeForWAL === true) {
                  localWorkloadRocksDBSizeNVMe1WithDedicatedNVMeDedicatedWAL = workloadsArrayLocal[workloadItem].reqCapacityGrossNVMe / workloadsArrayLocal[workloadItem].sumNumberDC * workloadsArrayLocal[workloadItem].rocksDBSpaceInPercent / 100 + localDCCorrectionForUnalignedObjectsNVMe1WithDedicatedRocksDBDedicatedWAL
                  debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 342, `[chassisID=${actualChassisID},workloadID=${workloadItem},DC=${dcItem}] CHECK RocksDB dedicated NVMe: ${workloadsArrayLocal[workloadItem].reqCapacityGrossNVMe } / ${workloadsArrayLocal[workloadItem].sumNumberDC} * ${workloadsArrayLocal[workloadItem].rocksDBSpaceInPercent} / 100 + ${localDCCorrectionForUnalignedObjectsNVMe1WithDedicatedRocksDBDedicatedWAL}`,0,0,0)
                  localDCRocksDBSizeNVMe1WithDedicatedNVMeDedicatedWAL += localWorkloadRocksDBSizeNVMe1WithDedicatedNVMeDedicatedWAL
                  localNVMe1CapacityWithDedicatedRocksDBDedicatedWAL += workloadsArrayLocal[workloadItem].reqCapacityGrossNVMe / workloadsArrayLocal[workloadItem].sumNumberDC
                }
                else {
                  localWorkloadRocksDBSizeNVMe1WithDedicatedNVMeIncludingWAL = workloadsArrayLocal[workloadItem].reqCapacityGrossNVMe / workloadsArrayLocal[workloadItem].sumNumberDC * workloadsArrayLocal[workloadItem].rocksDBSpaceInPercent / 100 + localDCCorrectionForUnalignedObjectsNVMe1WithDedicatedRocksDBIncludingWAL
                  debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 348, `[chassisID=${actualChassisID},workloadID=${workloadItem},DC=${dcItem}] CHECK RocksDB dedicated NVMe: ${workloadsArrayLocal[workloadItem].reqCapacityGrossNVMe } / ${workloadsArrayLocal[workloadItem].sumNumberDC} * ${workloadsArrayLocal[workloadItem].rocksDBSpaceInPercent} / 100 + ${localDCCorrectionForUnalignedObjectsNVMe1WithDedicatedRocksDBIncludingWAL}`,0,0,0)
                  localDCRocksDBSizeNVMe1WithDedicatedNVMeIncludingWAL += localWorkloadRocksDBSizeNVMe1WithDedicatedNVMeIncludingWAL
                  localNVMe1CapacityWithDedicatedRocksDBIncludingWAL += workloadsArrayLocal[workloadItem].reqCapacityGrossNVMe / workloadsArrayLocal[workloadItem].sumNumberDC
                }
              }
              else {
                if (workloadsArrayLocal[workloadItem].selectorNVMe1DedicatedNVMeForWAL === true) {
                  localWorkloadRocksDBSizeNVMe1WithoutDedicatedNVMeDedicatedWAL = workloadsArrayLocal[workloadItem].reqCapacityGrossNVMe / workloadsArrayLocal[workloadItem].sumNumberDC * workloadsArrayLocal[workloadItem].rocksDBSpaceInPercent / 100 + localDCCorrectionForUnalignedObjectsNVMe1WithoutDedicatedRocksDBDedicatedWAL
                  debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 356, `[chassisID=${actualChassisID},workloadID=${workloadItem},DC=${dcItem}] CHECK RocksDB nonDedicated NVMe: ${workloadsArrayLocal[workloadItem].reqCapacityGrossNVMe } / ${workloadsArrayLocal[workloadItem].sumNumberDC} * ${workloadsArrayLocal[workloadItem].rocksDBSpaceInPercent} / 100 + ${localDCCorrectionForUnalignedObjectsNVMe1WithoutDedicatedRocksDBDedicatedWAL}`,0,0,0)
                  localDCRocksDBSizeNVMe1WithoutDedicatedNVMeDedicatedWAL += localWorkloadRocksDBSizeNVMe1WithoutDedicatedNVMeDedicatedWAL
                  localNVMe1CapacityWithoutDedicatedRocksDBDedicatedWAL += workloadsArrayLocal[workloadItem].reqCapacityGrossNVMe / workloadsArrayLocal[workloadItem].sumNumberDC  
                }
                else {
                  localWorkloadRocksDBSizeNVMe1WithoutDedicatedNVMeNorWAL = workloadsArrayLocal[workloadItem].reqCapacityGrossNVMe / workloadsArrayLocal[workloadItem].sumNumberDC * workloadsArrayLocal[workloadItem].rocksDBSpaceInPercent / 100 + localDCCorrectionForUnalignedObjectsNVMe1WithoutDedicatedRocksDBNorWAL
                  debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 362, `[chassisID=${actualChassisID},workloadID=${workloadItem},DC=${dcItem}] CHECK RocksDB nonDedicated NVMe: ${workloadsArrayLocal[workloadItem].reqCapacityGrossNVMe } / ${workloadsArrayLocal[workloadItem].sumNumberDC} * ${workloadsArrayLocal[workloadItem].rocksDBSpaceInPercent} / 100 + ${localDCCorrectionForUnalignedObjectsNVMe1WithoutDedicatedRocksDBNorWAL}`,0,0,0)
                  localDCRocksDBSizeNVMe1WithoutDedicatedNVMeNorWAL += localWorkloadRocksDBSizeNVMe1WithoutDedicatedNVMeNorWAL
                  localNVMe1CapacityWithoutDedicatedRocksDBNorWAL += workloadsArrayLocal[workloadItem].reqCapacityGrossNVMe / workloadsArrayLocal[workloadItem].sumNumberDC
                
                }
              }
            }
            else {
              if (workloadsArrayLocal[workloadItem].selectorSSDDedicatedNVMe === true) {
                if (workloadsArrayLocal[workloadItem].selectorSSDDedicatedNVMeForWAL === true) {
                  localWorkloadRocksDBSizeSSDWithDedicatedNVMeDedicatedWAL = workloadsArrayLocal[workloadItem].reqCapacityGrossSSD / workloadsArrayLocal[workloadItem].sumNumberDC * workloadsArrayLocal[workloadItem].rocksDBSpaceInPercent / 100 + localDCCorrectionForUnalignedObjectsSSD1WithDedicatedRocksDBDedicatedWAL
                  debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 373, `[chassisID=${actualChassisID},workloadID=${workloadItem},DC=${dcItem}] CHECK RocksDB dedicated NVMe: ${workloadsArrayLocal[workloadItem].reqCapacityGrossSSD } / ${workloadsArrayLocal[workloadItem].sumNumberDC} * ${workloadsArrayLocal[workloadItem].rocksDBSpaceInPercent} / 100 + ${localDCCorrectionForUnalignedObjectsSSD1WithDedicatedRocksDBDedicatedWAL}`,0,0,0)
                  localDCRocksDBSizeSSDWithDedicatedNVMeDedicatedWAL += localWorkloadRocksDBSizeSSDWithDedicatedNVMeDedicatedWAL
                  localSSDCapacityWithDedicatedRocksDBDedicatedWAL += workloadsArrayLocal[workloadItem].reqCapacityGrossSSD / workloadsArrayLocal[workloadItem].sumNumberDC
                }
                else {
                  localWorkloadRocksDBSizeSSDWithDedicatedNVMeIncludingWAL = workloadsArrayLocal[workloadItem].reqCapacityGrossSSD / workloadsArrayLocal[workloadItem].sumNumberDC * workloadsArrayLocal[workloadItem].rocksDBSpaceInPercent / 100 + localDCCorrectionForUnalignedObjectsSSD1WithDedicatedRocksDBIncludingWAL
                  debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 379, `[chassisID=${actualChassisID},workloadID=${workloadItem},DC=${dcItem}] CHECK RocksDB dedicated NVMe: ${workloadsArrayLocal[workloadItem].reqCapacityGrossSSD } / ${workloadsArrayLocal[workloadItem].sumNumberDC} * ${workloadsArrayLocal[workloadItem].rocksDBSpaceInPercent} / 100 + ${localDCCorrectionForUnalignedObjectsSSD1WithDedicatedRocksDBIncludingWAL}`,0,0,0)
                  localDCRocksDBSizeSSDWithDedicatedNVMeIncludingWAL += localWorkloadRocksDBSizeSSDWithDedicatedNVMeIncludingWAL
                  localSSDCapacityWithDedicatedRocksDBIncludingWAL += workloadsArrayLocal[workloadItem].reqCapacityGrossSSD / workloadsArrayLocal[workloadItem].sumNumberDC  
                }
              }
              else {
                if (workloadsArrayLocal[workloadItem].selectorSSDDedicatedNVMeForWAL === true) {

                  localWorkloadRocksDBSizeSSDWithoutDedicatedNVMeDedicatedWAL = workloadsArrayLocal[workloadItem].reqCapacityGrossSSD / workloadsArrayLocal[workloadItem].sumNumberDC * workloadsArrayLocal[workloadItem].rocksDBSpaceInPercent / 100 + localDCCorrectionForUnalignedObjectsSSD1WithoutDedicatedRocksDBDedicatedWAL
                  debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 388, `[chassisID=${actualChassisID},workloadID=${workloadItem},DC=${dcItem}] CHECK nonDED NVMe: ${workloadsArrayLocal[workloadItem].reqCapacityGrossSSD } / ${workloadsArrayLocal[workloadItem].sumNumberDC} * ${workloadsArrayLocal[workloadItem].rocksDBSpaceInPercent} / 100 + ${localDCCorrectionForUnalignedObjectsSSD1WithoutDedicatedRocksDBDedicatedWAL}`,0,0,0)
                  localDCRocksDBSizeSSDWithoutDedicatedNVMeDedicatedWAL += localWorkloadRocksDBSizeSSDWithoutDedicatedNVMeDedicatedWAL + localSSDAddCapacityWithOutDedicatedRocksDB
                  localSSDCapacityWithoutDedicatedRocksDBDedicatedWAL += workloadsArrayLocal[workloadItem].reqCapacityGrossSSD / workloadsArrayLocal[workloadItem].sumNumberDC
                }
                else{
                  localWorkloadRocksDBSizeSSDWithoutDedicatedNVMeNorWAL = workloadsArrayLocal[workloadItem].reqCapacityGrossSSD / workloadsArrayLocal[workloadItem].sumNumberDC * workloadsArrayLocal[workloadItem].rocksDBSpaceInPercent / 100 + localDCCorrectionForUnalignedObjectsSSD1WithoutDedicatedRocksDBNorWAL
                  debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 394, `[chassisID=${actualChassisID},workloadID=${workloadItem},DC=${dcItem}] CHECK nonDED NVMe: ${workloadsArrayLocal[workloadItem].reqCapacityGrossSSD } / ${workloadsArrayLocal[workloadItem].sumNumberDC} * ${workloadsArrayLocal[workloadItem].rocksDBSpaceInPercent} / 100 + ${localDCCorrectionForUnalignedObjectsSSD1WithoutDedicatedRocksDBNorWAL}`,0,0,0)
                  localDCRocksDBSizeSSDWithoutDedicatedNVMeNorWAL += localWorkloadRocksDBSizeSSDWithoutDedicatedNVMeNorWAL + localSSDAddCapacityWithOutDedicatedRocksDB
                  localSSDCapacityWithoutDedicatedRocksDBNorWAL += workloadsArrayLocal[workloadItem].reqCapacityGrossSSD / workloadsArrayLocal[workloadItem].sumNumberDC  
                }
              }
            }
            if (generalValues.globalDebug == true || localDebugOn == true) {
              debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 401, `[chassisID=${actualChassisID},workloadID=${workloadItem},DC=${dcItem}] local DC SSD capacity localSSDCapacityWithDedicatedRocksDBDedicatedWAL=${localSSDCapacityWithDedicatedRocksDBDedicatedWAL}`,0,0,0)
              debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 402, `[chassisID=${actualChassisID},workloadID=${workloadItem},DC=${dcItem}] local DC SSD capacity localSSDCapacityWithDedicatedRocksDBIncludingWAL=${localSSDCapacityWithDedicatedRocksDBIncludingWAL}`,0,0,0)
              debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 403, `[chassisID=${actualChassisID},workloadID=${workloadItem},DC=${dcItem}] local DC SSD capacity localSSDCapacityWithoutDedicatedRocksDBDedicatedWAL=${localSSDCapacityWithoutDedicatedRocksDBDedicatedWAL}`,0,0,0)
              debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 404, `[chassisID=${actualChassisID},workloadID=${workloadItem},DC=${dcItem}] local DC SSD capacity localSSDCapacityWithoutDedicatedRocksDBNorWAL=${localSSDCapacityWithoutDedicatedRocksDBNorWAL}`,0,0,0)
              debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 405, `[chassisID=${actualChassisID},workloadID=${workloadItem},DC=${dcItem}] local capacity corrected of RocksDB space for unaligned data parts - for HDD=${localWorkloadRocksDBSizeHDD}`,0,0,0)
              debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 406, `[chassisID=${actualChassisID},workloadID=${workloadItem},DC=${dcItem}] local capacity corrected of RocksDB space for unaligned data parts - for SSD w/ dedicated RocksDB w/ dedicated WAL=${localDCRocksDBSizeSSDWithDedicatedNVMeDedicatedWAL}`,0,0,0)
              debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 407, `[chassisID=${actualChassisID},workloadID=${workloadItem},DC=${dcItem}] local capacity corrected of RocksDB space for unaligned data parts - for SSD w/ dedicated RocksDB w/o dedicated WAL=${localDCRocksDBSizeSSDWithDedicatedNVMeIncludingWAL}`,0,0,0)
              debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 408, `[chassisID=${actualChassisID},workloadID=${workloadItem},DC=${dcItem}] local capacity corrected of RocksDB space for unaligned data parts - for SSD w/o dedicated RocksDB w/ dedicated WAL=${localDCRocksDBSizeSSDWithoutDedicatedNVMeDedicatedWAL}`,0,0,0)
              debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 409, `[chassisID=${actualChassisID},workloadID=${workloadItem},DC=${dcItem}] local capacity corrected of RocksDB space for unaligned data parts - for SSD w/o dedicated RocksDB w/o dedicated WAL=${localDCRocksDBSizeSSDWithoutDedicatedNVMeNorWAL}`,0,0,0)
              debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 410, `[chassisID=${actualChassisID},workloadID=${workloadItem},DC=${dcItem}] local capacity corrected of RocksDB space for unaligned data parts - for NVMe w/ dedicated RocksDB w/ dedicated WAL=${localDCRocksDBSizeNVMe1WithDedicatedNVMeDedicatedWAL}`,0,0,0)
              debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 411, `[chassisID=${actualChassisID},workloadID=${workloadItem},DC=${dcItem}] local capacity corrected of RocksDB space for unaligned data parts - for NVMe w/ dedicated RocksDB w/o dedicated WAL=${localDCRocksDBSizeNVMe1WithDedicatedNVMeIncludingWAL}`,0,0,0)
              debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 412, `[chassisID=${actualChassisID},workloadID=${workloadItem},DC=${dcItem}] local capacity corrected of RocksDB space for unaligned data parts - for NVMe w/o dedicated RocksDB w/ dedicated WAL=${localDCRocksDBSizeNVMe1WithoutDedicatedNVMeDedicatedWAL}`,0,0,0)
              debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 413, `[chassisID=${actualChassisID},workloadID=${workloadItem},DC=${dcItem}] local capacity corrected of RocksDB space for unaligned data parts - for NVMe w/o dedicated RocksDB w/o dedicated WAL=${localDCRocksDBSizeNVMe1WithoutDedicatedNVMeNorWAL}`,0,0,0)
            }
          }
        }
      }
      // End of processing the workloads and calculating the capacity needed for each config case
      
      /// The specific size of media should come from a specific chassisConfig.
      // Media for dedicated index pool in DC
      debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 422, `[chassisID=${actualChassisID},DC=${dcItem}] actualChassisID=${actualChassisID}, chassisArrayLocal[actualChassisID].chassisID=${chassisArrayLocal[actualChassisID].chassisID}, maxHDDSlots=${chassisArrayLocal[actualChassisID].maxHDDSlots}`,0,0,0)
      dcConfigArrayLocal[dcItem].numberOfNVMe6Needed = Math.ceil(localDCDedicatedObjectIndexCapacity / chassisArrayLocal[actualChassisID].sizeNVMe6)
      debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 424, `[chassisID=${actualChassisID},DC=${dcItem}] localDCDedicatedObjectIndexCapacity=${localDCDedicatedObjectIndexCapacity} / chassisArrayLocal[actualChassisID].sizeNVMe6 ${chassisArrayLocal[actualChassisID].sizeNVMe6}`,0,0,0)
      debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 425, `[chassisID=${actualChassisID},DC=${dcItem}] #NVMe6 needed=${dcConfigArrayLocal[dcItem].numberOfNVMe6Needed}`,0,0,0)

      // HDD: Media for dedicated RocksDB media for HDD
      if (chassisArrayLocal[actualChassisID].sizeSSD4 === 0) {
        debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 429, `[chassisID=${actualChassisID},DC=${dcItem}] using SSD4`,0,0,0)
        // don't use SSD type 4 for fronting HDD - then use NVMe type 4
        // Check also the number of NVMe would be sufficient for the number of HDD allowed to cover Chassis.hddToSSD4
        dcConfigArrayLocal[dcItem].numberOfNVMe4Needed = Math.ceil((localDCRocksDBSizeHDD + localDCRequiredIndexCapacityOnNVMe4) / chassisArrayLocal[actualChassisID].sizeNVMe4)
        if (dcConfigArrayLocal[dcItem].numberOfNVMe4Needed < dcConfigArrayLocal[dcItem].numberOfHDDNeeded / chassisArrayLocal[actualChassisID].hddToSSD4) {
          // The number of media required based on capacity is not sufficient - would need to add more NVMe for the actual required number of HDD to front.
          dcConfigArrayLocal[dcItem].numberOfNVMe4Needed = Math.ceil(dcConfigArrayLocal[dcItem].numberOfHDDNeeded / chassisArrayLocal[actualChassisID].hddToSSD4)
        }
        debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 437, `[chassisID=${actualChassisID},DC=${dcItem}] #NVMe4 needed=${dcConfigArrayLocal[dcItem].numberOfNVMe4Needed}`,0,0,0)
      }
      else {
        // use SSD type 4 for hosting the RocksDB+WAL and also add the index capacity for HDD based RGW use cases hosted here on this SSD type 4 as well
        dcConfigArrayLocal[dcItem].numberOfSSD4Needed = Math.ceil((localDCRocksDBSizeHDD + localDCRequiredIndexCapacityOnNVMe4) / chassisArrayLocal[actualChassisID].sizeSSD4)
        debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 442, `[chassisID=${actualChassisID},DC=${dcItem}] (localDCRocksDBSizeHDD=${localDCRocksDBSizeHDD} + localDCRequiredIndexCapacityOnNVMe4=${localDCRequiredIndexCapacityOnNVMe4}) / chassisArrayLocal[actualChassisID].sizeSSD4=${chassisArrayLocal[actualChassisID].sizeSSD4})`,0,0,0)
        debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 443, `[chassisID=${actualChassisID},DC=${dcItem}] #SSD4 needed=${dcConfigArrayLocal[dcItem].numberOfSSD4Needed}`,0,0,0)
      }
      
      // SSD as pool media: 

      // Two different kinds of RocksDB capacity: with and without dedicated - with dedicated, there must be a different kind of media
      // for hosting the dedicated RocksDB: NVMe5 (RocksDB+WAL all-in-one); NVMe3 (WAL dedicated and separated from NVMe5)
      // Note: the capacity of localDCCorrectionForUnalignedObjectsSSD1WithDedicatedRocksDBIncludingWAL is not changing the RocksDB capacity. Similar for NMVe1.
      // Check also the number of NVMe would be sufficient for the number of SSD allowed to cover Chassis.ssdToNVMe5
      
      // SSD: with dedicated WAL
      dcConfigArrayLocal[dcItem].numberOfSSD1NeededWithoutDedicatedRocksDBDedicatedWAL = Math.ceil((localSSDCapacityWithoutDedicatedRocksDBDedicatedWAL + localDCRocksDBSizeSSDWithoutDedicatedNVMeDedicatedWAL + localDCRequiredIndexCapacityOnSSD1DedicatedWAL)/ chassisArrayLocal[actualChassisID].sizeSSD1)
      dcConfigArrayLocal[dcItem].numberOfSSD1NeededWithDedicatedRocksDBDedicatedWAL = Math.ceil((localSSDCapacityWithDedicatedRocksDBDedicatedWAL + localDCRocksDBSizeSSDWithDedicatedNVMeDedicatedWAL) / chassisArrayLocal[actualChassisID].sizeSSD1)
      debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 456, `[chassisID=${actualChassisID},DC=${dcItem}] dcConfigArrayLocal[dcItem].numberOfSSD1NeededWithoutDedicatedRocksDBDedicatedWAL=${dcConfigArrayLocal[dcItem].numberOfSSD1NeededWithoutDedicatedRocksDBDedicatedWAL}`,0,0,0)
      debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 457, `[chassisID=${actualChassisID},DC=${dcItem}] dcConfigArrayLocal[dcItem].numberOfSSD1NeededWithDedicatedRocksDBDedicatedWAL=${dcConfigArrayLocal[dcItem].numberOfSSD1NeededWithDedicatedRocksDBDedicatedWAL}`,0,0,0)
      // SSD - RocksDB size on dedicated flash media fronting the SSD1 =>  dedicated WAL means this lands on NVMe3 instead of landing on the NVMe5
      dcConfigArrayLocal[dcItem].numberOfNVMe3Needed = Math.ceil((dcConfigArrayLocal[dcItem].numberOfSSD1NeededWithoutDedicatedRocksDBDedicatedWAL * (sizingConstraints.defaultSizeOfWALOnNVMeInGB / 1000)) / chassisArrayLocal[actualChassisID].sizeNVMe3) + Math.ceil((dcConfigArrayLocal[dcItem].numberOfSSD1NeededWithDedicatedRocksDBDedicatedWAL * (sizingConstraints.defaultSizeOfWALOnNVMeInGB / 1000)) / chassisArrayLocal[actualChassisID].sizeNVMe3)
      debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 460, `[chassisID=${actualChassisID},DC=${dcItem}] #NVMe3 needed=${dcConfigArrayLocal[dcItem].numberOfNVMe3Needed}`,0,0,0)
      
      if (dcConfigArrayLocal[dcItem].numberOfNVMe3Needed < (Math.ceil(dcConfigArrayLocal[dcItem].numberOfSSD1NeededWithoutDedicatedRocksDBDedicatedWAL / chassisArrayLocal[actualChassisID].nvmeToNVMe3) + Math.ceil(dcConfigArrayLocal[dcItem].numberOfSSD1NeededWithDedicatedRocksDBDedicatedWAL / chassisArrayLocal[actualChassisID].nvmeToNVMe3) )){
        // The number of media required based on capacity is not sufficient - would need to add more NVMe for the actual required number of SSD1 to front.
        debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 464, `[chassisID=${actualChassisID},DC=${dcItem}] #NVMe3 needed=${dcConfigArrayLocal[dcItem].numberOfNVMe3Needed} < Math.ceil(dcConfigArrayLocal[dcItem].numberOfSSD1NeededWithoutDedicatedRocksDBDedicatedWAL=${dcConfigArrayLocal[dcItem].numberOfSSD1NeededWithoutDedicatedRocksDBDedicatedWAL} / chassisArrayLocal[actualChassisID].nvmeToNVMe3=${chassisArrayLocal[actualChassisID].nvmeToNVMe3}) + Math.ceil(dcConfigArrayLocal[dcItem].numberOfSSD1NeededWithDedicatedRocksDBDedicatedWAL=${dcConfigArrayLocal[dcItem].numberOfSSD1NeededWithDedicatedRocksDBDedicatedWAL} / chassisArrayLocal[actualChassisID].nvmeToNVMe3=${chassisArrayLocal[actualChassisID].nvmeToNVMe3})`,0,0,0)
        dcConfigArrayLocal[dcItem].numberOfNVMe3Needed = Math.ceil(dcConfigArrayLocal[dcItem].numberOfSSD1NeededWithoutDedicatedRocksDBDedicatedWAL / chassisArrayLocal[actualChassisID].nvmeToNVMe3) + Math.ceil(dcConfigArrayLocal[dcItem].numberOfSSD1NeededWithDedicatedRocksDBDedicatedWAL / chassisArrayLocal[actualChassisID].nvmeToNVMe3)
        debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 466, `[chassisID=${actualChassisID},DC=${dcItem}] #NVMe3 needed=${dcConfigArrayLocal[dcItem].numberOfNVMe3Needed}`,0,0,0)
      }
      debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 468, `[chassisID=${actualChassisID},DC=${dcItem}] #NVMe3 needed=${dcConfigArrayLocal[dcItem].numberOfNVMe3Needed}`,0,0,0)

      // NVMe1:
      if (generalValues.globalDebug == true || localDebugOn == true) {
        debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 472, `[chassisID=${actualChassisID},DC=${dcItem}] localDCRocksDBSizeNVMe1WithDedicatedNVMeIncludingWAL=${localDCRocksDBSizeNVMe1WithDedicatedNVMeIncludingWAL}`,0,0,0)
        debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 473, `[chassisID=${actualChassisID},DC=${dcItem}] localDCRequiredIndexCapacityOnNVMe1NorWAL=${localDCRequiredIndexCapacityOnNVMe1NorWAL}`,0,0,0)
        debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 474, `[chassisID=${actualChassisID},DC=${dcItem}] localDCRequiredIndexCapacityOnNVMe1DedicatedWAL=${localDCRequiredIndexCapacityOnNVMe1DedicatedWAL}`,0,0,0)
        debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 475, `[chassisID=${actualChassisID},DC=${dcItem}] localDCRequiredIndexCapacityOnNVMe7DedicatedWAL=${localDCRequiredIndexCapacityOnNVMe7DedicatedWAL}`,0,0,0)
        debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 476, `[chassisID=${actualChassisID},DC=${dcItem}] localDCRequiredIndexCapacityOnNVMe7IncludingWAL=${localDCRequiredIndexCapacityOnNVMe7IncludingWAL}`,0,0,0)
        debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 477, `[chassisID=${actualChassisID},DC=${dcItem}] localDCRocksDBSizeNVMe1WithDedicatedNVMeDedicatedWAL=${localDCRocksDBSizeNVMe1WithDedicatedNVMeDedicatedWAL}`,0,0,0)
      }
      
      // NVMe1 - with dedicated WAL
      // ??? RGW index data goes to RocksDB place - if there is a dedicated device this will be used.
      dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithoutDedicatedRocksDBDedicatedWAL = Math.ceil((localNVMe1CapacityWithoutDedicatedRocksDBDedicatedWAL + localDCRocksDBSizeNVMe1WithoutDedicatedNVMeDedicatedWAL + localDCRequiredIndexCapacityOnNVMe1DedicatedWAL) / chassisArrayLocal[actualChassisID].sizeNVMe1)
      dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithDedicatedRocksDBDedicatedWAL = Math.ceil((localNVMe1CapacityWithDedicatedRocksDBDedicatedWAL + localDCRocksDBSizeNVMe1WithDedicatedNVMeDedicatedWAL) / chassisArrayLocal[actualChassisID].sizeNVMe1)
      debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 484, `[chassisID=${actualChassisID},DC=${dcItem}] dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithoutDedicatedRocksDBDedicatedWAL=${dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithoutDedicatedRocksDBDedicatedWAL}`,0,0,0)
      debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 485, `[chassisID=${actualChassisID},DC=${dcItem}] dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithDedicatedRocksDBDedicatedWAL=${dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithDedicatedRocksDBDedicatedWAL}`,0,0,0)
      // NVMe8 for NVMe1
      dcConfigArrayLocal[dcItem].numberOfNVMe8Needed = Math.ceil((dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithoutDedicatedRocksDBDedicatedWAL * (sizingConstraints.defaultSizeOfWALOnNVMeInGB / 1000)) / chassisArrayLocal[actualChassisID].sizeNVMe8) + Math.ceil((dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithDedicatedRocksDBDedicatedWAL* (sizingConstraints.defaultSizeOfWALOnNVMeInGB / 1000)) / chassisArrayLocal[actualChassisID].sizeNVMe8)
      debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 488, `[chassisID=${actualChassisID},DC=${dcItem}] #NVMe8 needed=${dcConfigArrayLocal[dcItem].numberOfNVMe8Needed}`,0,0,0)
      if (dcConfigArrayLocal[dcItem].numberOfNVMe8Needed < (Math.ceil(dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithoutDedicatedRocksDBDedicatedWAL / chassisArrayLocal[actualChassisID].nvmeToNVMe8) + Math.ceil(dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithDedicatedRocksDBDedicatedWAL / chassisArrayLocal[actualChassisID].nvmeToNVMe8) )){
        // The number of media required based on capacity is not sufficient - would need to add more NVMe for the actual required number of NVMe1 to front.
        debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 491, `[chassisID=${actualChassisID},DC=${dcItem}] #NVMe8 needed=${dcConfigArrayLocal[dcItem].numberOfNVMe8Needed} < Math.ceil(dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithoutDedicatedRocksDBDedicatedWAL=${dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithoutDedicatedRocksDBDedicatedWAL} / chassisArrayLocal[actualChassisID].nvmeToNVMe8=${chassisArrayLocal[actualChassisID].nvmeToNVMe8}) + Math.ceil(dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithDedicatedRocksDBDedicatedWAL=${dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithDedicatedRocksDBDedicatedWAL} / chassisArrayLocal[actualChassisID].nvmeToNVMe8=${chassisArrayLocal[actualChassisID].nvmeToNVMe8})`,0,0,0)
        dcConfigArrayLocal[dcItem].numberOfNVMe8Needed = Math.ceil(dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithoutDedicatedRocksDBDedicatedWAL / chassisArrayLocal[actualChassisID].nvmeToNVMe8) + Math.ceil(dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithDedicatedRocksDBDedicatedWAL / chassisArrayLocal[actualChassisID].nvmeToNVMe8)
        debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 493, `[chassisID=${actualChassisID},DC=${dcItem}] #NVMe8 needed=${dcConfigArrayLocal[dcItem].numberOfNVMe8Needed}`,0,0,0)
      }
      debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 495, `[chassisID=${actualChassisID},DC=${dcItem}] #NVMe8 needed=${dcConfigArrayLocal[dcItem].numberOfNVMe8Needed}`,0,0,0)

      // RGW cache media are dedicated and counted as they are
      dcConfigArrayLocal[dcItem].numberOfNVMe2Needed = localDCNumberOfRGWCacheMedia
      debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 499, `[chassisID=${actualChassisID},DC=${dcItem}] #NVMe2 needed=${dcConfigArrayLocal[dcItem].numberOfNVMe2Needed}`,0,0,0)

      //// NOTE NOTE: we'll need to adjust the raw device capacity for any configuration by the correction factor of wasted space for objects and files if the avg object 
      ////            or file size is way off the min_alloc_size for the media. This should be done for replica and EC specifically !!!!
      ////            Way off means nothing specific but would be everything not aligning with min_alloc_size - even for small deviations, we can simply take it and don't need to 
      ////            distinguish between 'way off' and 'nearly matching'.

      // HDD:
      dcConfigArrayLocal[dcItem].numberOfHDDNeeded =  Math.ceil((dcConfigArrayLocal[dcItem].capacityNeededForHDD + localDCCorrectionForUnalignedObjectsHDD) / chassisArrayLocal[actualChassisID].sizeHDD1)
      debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 508, `[chassisID=${actualChassisID},DC=${dcItem}] #HDD needed=${dcConfigArrayLocal[dcItem].numberOfHDDNeeded}`,0,0,0)
      ////  In addition, the additional capacity for placing the RocksDB on any media used for block must be added to the number of media required - for kinds of flash.        
      
      // SSD1: - number of devices - the capacity for unaligned objects is already included here in the localSSDCapacity*
      dcConfigArrayLocal[dcItem].numberOfSSD1NeededWithDedicatedRocksDBIncludingWAL =  localNumberOfSSDNeededDedicatedRocksDBIncludingWAL = Math.ceil((localSSDCapacityWithDedicatedRocksDBIncludingWAL + localDCRocksDBSizeSSDWithDedicatedNVMeIncludingWAL) / chassisArrayLocal[actualChassisID].sizeSSD1)
      debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 513, `[chassisID=${actualChassisID},DC=${dcItem}] dcConfigArrayLocal[dcItem].numberOfSSD1NeededWithDedicatedRocksDBIncludingWAL=${dcConfigArrayLocal[dcItem].numberOfSSD1NeededWithDedicatedRocksDBIncludingWAL} =  localNumberOfSSDNeededDedicatedRocksDBIncludingWAL=${localNumberOfSSDNeededDedicatedRocksDBIncludingWAL} = Math.ceil((localSSDCapacityWithDedicatedRocksDBIncludingWAL=${localSSDCapacityWithDedicatedRocksDBIncludingWAL} + localDCRocksDBSizeSSDWithDedicatedNVMeIncludingWAL=${localDCRocksDBSizeSSDWithDedicatedNVMeIncludingWAL}) / chassisArrayLocal[actualChassisID].sizeSSD1=${chassisArrayLocal[actualChassisID].sizeSSD1})`,0,0,0)
      dcConfigArrayLocal[dcItem].numberOfSSDNeeded = dcConfigArrayLocal[dcItem].numberOfSSD1NeededWithDedicatedRocksDBIncludingWAL
      debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 515, `[chassisID=${actualChassisID},DC=${dcItem}]#SSD(sum) needed=${dcConfigArrayLocal[dcItem].numberOfSSDNeeded}`,0,0,0)
      
      dcConfigArrayLocal[dcItem].numberOfSSD1NeededWithDedicatedRocksDBDedicatedWAL =  localNumberOfSSDNeededDedicatedRocksDBDedicatedWAL = Math.ceil((localSSDCapacityWithDedicatedRocksDBDedicatedWAL + localDCRocksDBSizeSSDWithDedicatedNVMeDedicatedWAL) / chassisArrayLocal[actualChassisID].sizeSSD1)
      debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 518, `[chassisID=${actualChassisID},DC=${dcItem}] dcConfigArrayLocal[dcItem].numberOfSSD1NeededWithDedicatedRocksDBDedicatedWAL=${dcConfigArrayLocal[dcItem].numberOfSSD1NeededWithDedicatedRocksDBDedicatedWAL} =  localNumberOfSSDNeededDedicatedRocksDBDedicatedWAL=${localNumberOfSSDNeededDedicatedRocksDBDedicatedWAL} = Math.ceil((localSSDCapacityWithDedicatedRocksDBDedicatedWAL=${localSSDCapacityWithDedicatedRocksDBDedicatedWAL} + localDCRocksDBSizeSSDWithDedicatedNVMeDedicatedWAL=${localDCRocksDBSizeSSDWithDedicatedNVMeDedicatedWAL}) / chassisArrayLocal[actualChassisID].sizeSSD1=${chassisArrayLocal[actualChassisID].sizeSSD1})`,0,0,0)
      dcConfigArrayLocal[dcItem].numberOfSSDNeeded += dcConfigArrayLocal[dcItem].numberOfSSD1NeededWithDedicatedRocksDBDedicatedWAL
      debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 520, `[chassisID=${actualChassisID},DC=${dcItem}]#SSD(sum) needed=${dcConfigArrayLocal[dcItem].numberOfSSDNeeded}`,0,0,0)
      
      dcConfigArrayLocal[dcItem].numberOfSSD1NeededWithoutDedicatedRocksDBDedicatedWAL = localNumberOfSSDNeededNonDedicatedRocksDBDedicatedWAL = Math.ceil((localSSDCapacityWithoutDedicatedRocksDBDedicatedWAL + localDCRocksDBSizeSSDWithoutDedicatedNVMeDedicatedWAL + localDCRequiredIndexCapacityOnSSD1DedicatedWAL) / chassisArrayLocal[actualChassisID].sizeSSD1)
      dcConfigArrayLocal[dcItem].numberOfSSDNeeded += dcConfigArrayLocal[dcItem].numberOfSSD1NeededWithoutDedicatedRocksDBDedicatedWAL
      debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 524, `[chassisID=${actualChassisID},DC=${dcItem}]#SSD(sum) needed=${dcConfigArrayLocal[dcItem].numberOfSSDNeeded}`,0,0,0)

      dcConfigArrayLocal[dcItem].numberOfSSD1NeededWithoutDedicatedRocksDBNorWAL = localNumberOfSSDNeededNonDedicatedRocksDBNorWAL = Math.ceil((localSSDCapacityWithoutDedicatedRocksDBNorWAL + localDCRocksDBSizeSSDWithoutDedicatedNVMeNorWAL + localDCRequiredIndexCapacityOnSSD1NorWAL) / chassisArrayLocal[actualChassisID].sizeSSD1)
      dcConfigArrayLocal[dcItem].numberOfSSDNeeded += dcConfigArrayLocal[dcItem].numberOfSSD1NeededWithoutDedicatedRocksDBNorWAL
      debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 528, `[chassisID=${actualChassisID},DC=${dcItem}]#SSD(sum) needed=${dcConfigArrayLocal[dcItem].numberOfSSDNeeded}`,0,0,0)

      if (generalValues.globalDebug == true || localDebugOn == true) {
        debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 531, `[chassisID=${actualChassisID},DC=${dcItem}] #SSD w/o NVMe nor dedicated WAL needed=${dcConfigArrayLocal[dcItem].numberOfSSD1NeededWithoutDedicatedRocksDBNorWAL}`,0,0,0)
        debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 532, `[chassisID=${actualChassisID},DC=${dcItem}] #SSD w/o NVMe w/ dedicated WAL needed=${dcConfigArrayLocal[dcItem].numberOfSSD1NeededWithoutDedicatedRocksDBDedicatedWAL}`,0,0,0)
        debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 533, `[chassisID=${actualChassisID},DC=${dcItem}] #SSD w/ NVMe dedicated w/o separate WAL needed=${dcConfigArrayLocal[dcItem].numberOfSSD1NeededWithDedicatedRocksDBIncludingWAL}`,0,0,0)
        debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 534, `[chassisID=${actualChassisID},DC=${dcItem}] #SSD w/ NVMe dedicated w/ separate WAL needed=${dcConfigArrayLocal[dcItem].numberOfSSD1NeededWithDedicatedRocksDBDedicatedWAL}`,0,0,0)
        debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 535, `[chassisID=${actualChassisID},DC=${dcItem}] #SSD(sum)) needed=${dcConfigArrayLocal[dcItem].numberOfSSDNeeded}`,0,0,0)
      }

      // NVMe1 - number of devices - the capacity for unaligned objects is already included here in the localNVMe1Capacity*
      dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithDedicatedRocksDBIncludingWAL =  localNumberOfNVMe1NeededDedicatedRocksDBIncludingWAL = Math.ceil((localNVMe1CapacityWithDedicatedRocksDBIncludingWAL + localDCRocksDBSizeNVMe1WithDedicatedNVMeIncludingWAL) / chassisArrayLocal[actualChassisID].sizeNVMe1)
      debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 540, `[chassisID=${actualChassisID},DC=${dcItem}] dcConfigArrayLocal[dcItem].numberOfNMVe1NeededWithDedicatedRocksDBIncludingWAL=${dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithDedicatedRocksDBIncludingWAL} =  localNumberOfNVMe1NeededDedicatedRocksDBIncludingWAL=${localNumberOfNVMe1NeededDedicatedRocksDBIncludingWAL} = Math.ceil((localNVMe1CapacityWithDedicatedRocksDBIncludingWAL=${localNVMe1CapacityWithDedicatedRocksDBIncludingWAL} + localDCRocksDBSizeNVMe1WithDedicatedNVMeIncludingWAL=${localDCRocksDBSizeNVMe1WithDedicatedNVMeIncludingWAL}) / chassisArrayLocal[actualChassisID].sizeNVMe7=${chassisArrayLocal[actualChassisID].sizeNVMe1})`,0,0,0)
      dcConfigArrayLocal[dcItem].numberOfNVMe1Needed = dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithDedicatedRocksDBIncludingWAL

      dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithDedicatedRocksDBDedicatedWAL =  localNumberOfNVMe1NeededDedicatedRocksDBDedicatedWAL = Math.ceil((localNVMe1CapacityWithDedicatedRocksDBDedicatedWAL + localDCRocksDBSizeNVMe1WithDedicatedNVMeDedicatedWAL) / chassisArrayLocal[actualChassisID].sizeNVMe1)
      debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 544, `[chassisID=${actualChassisID},DC=${dcItem}] dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithDedicatedRocksDBDedicatedWAL=${dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithDedicatedRocksDBDedicatedWAL} =  localNumberOfNVMe1NeededDedicatedRocksDBDedicatedWAL=${localNumberOfNVMe1NeededDedicatedRocksDBDedicatedWAL} = Math.ceil((localNVMe1CapacityWithDedicatedRocksDBDedicatedWAL=${localNVMe1CapacityWithDedicatedRocksDBDedicatedWAL} + localDCRocksDBSizeNVMe1WithDedicatedNVMeDedicatedWAL=${localDCRocksDBSizeNVMe1WithDedicatedNVMeDedicatedWAL}) / chassisArrayLocal[actualChassisID].sizeSSD1=${chassisArrayLocal[actualChassisID].sizeNVMe1})`,0,0,0)
      dcConfigArrayLocal[dcItem].numberOfNVMe1Needed += dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithDedicatedRocksDBDedicatedWAL
      
      dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithoutDedicatedRocksDBDedicatedWAL = Math.ceil((localNVMe1CapacityWithoutDedicatedRocksDBDedicatedWAL + localDCRocksDBSizeNVMe1WithoutDedicatedNVMeDedicatedWAL + localDCRequiredIndexCapacityOnNVMe1DedicatedWAL) / chassisArrayLocal[actualChassisID].sizeNVMe1)
      dcConfigArrayLocal[dcItem].numberOfNVMe1Needed += dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithoutDedicatedRocksDBDedicatedWAL

      dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithoutDedicatedRocksDBNorWAL = Math.ceil((localNVMe1CapacityWithoutDedicatedRocksDBNorWAL + localDCRocksDBSizeNVMe1WithoutDedicatedNVMeNorWAL + localDCRequiredIndexCapacityOnNVMe1NorWAL) / chassisArrayLocal[actualChassisID].sizeNVMe1)
      dcConfigArrayLocal[dcItem].numberOfNVMe1Needed += dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithoutDedicatedRocksDBNorWAL

      if (generalValues.globalDebug == true || localDebugOn == true) {
        debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 554, `[chassisID=${actualChassisID},DC=${dcItem}] #NVMe1 w/o NVMe nor dedicated WAL needed=${dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithoutDedicatedRocksDBNorWAL}`,0,0,0)
        debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 555, `[chassisID=${actualChassisID},DC=${dcItem}] #NVMe1 w/o NVMe w/ dedicated WAL needed=${dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithoutDedicatedRocksDBDedicatedWAL}`,0,0,0)
        debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 556, `[chassisID=${actualChassisID},DC=${dcItem}] #NVMe1 w/ NVMe dedicated w/o separate WAL needed=${dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithDedicatedRocksDBIncludingWAL}`,0,0,0)
        debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 557, `[chassisID=${actualChassisID},DC=${dcItem}] #NVMe1 w/ NVMe dedicated w/ separate WAL needed=${dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithDedicatedRocksDBDedicatedWAL}`,0,0,0)
        debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 558, `[chassisID=${actualChassisID},DC=${dcItem}] #NVMe1(sum)) needed=${dcConfigArrayLocal[dcItem].numberOfNVMe1Needed}`,0,0,0)
      }
    

      // NVMe5 for SSD1
      dcConfigArrayLocal[dcItem].numberOfNVMe5Needed = Math.ceil((dcConfigArrayLocal[dcItem].numberOfSSD1NeededWithDedicatedRocksDBDedicatedWAL * (sizingConstraints.defaultSizeOfWALOnNVMeInGB  / 1000) + localDCRequiredIndexCapacityOnNVMe5DedicatedWAL) / chassisArrayLocal[actualChassisID].sizeNVMe5) + Math.ceil(((dcConfigArrayLocal[dcItem].numberOfSSD1NeededWithDedicatedRocksDBIncludingWAL * sizingConstraints.defaultSizeOfWALOnNVMeInGB / 1000) + localDCRequiredIndexCapacityOnNVMe5NorWAL)/ chassisArrayLocal[actualChassisID].sizeNVMe5)
      
      if (dcConfigArrayLocal[dcItem].numberOfNVMe5Needed < (Math.ceil(dcConfigArrayLocal[dcItem].numberOfSSD1NeededWithoutDedicatedRocksDBDedicatedWAL / chassisArrayLocal[actualChassisID].ssdToNVMe5) + Math.ceil(dcConfigArrayLocal[dcItem].numberOfSSD1NeededWithDedicatedRocksDBIncludingWAL / chassisArrayLocal[actualChassisID].ssdToNVMe5)) ){
        // The number of media required based on capacity is not sufficient - would need to add more NVMe for the actual required number of SSD to front.
        dcConfigArrayLocal[dcItem].numberOfNVMe5Needed = Math.ceil((dcConfigArrayLocal[dcItem].numberOfSSD1NeededWithoutDedicatedRocksDBDedicatedWAL / chassisArrayLocal[actualChassisID].ssdToNVMe5) + (dcConfigArrayLocal[dcItem].numberOfSSD1NeededWithDedicatedRocksDBIncludingWAL / chassisArrayLocal[actualChassisID].ssdToNVMe5))
        debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 568, `[chassisID=${actualChassisID},DC=${dcItem}] #NVMe5 needed=${dcConfigArrayLocal[dcItem].numberOfNVMe5Needed}`,0,0,0)
      }
      debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 570, `[chassisID=${actualChassisID},DC=${dcItem}] #NVMe5 needed=${dcConfigArrayLocal[dcItem].numberOfNVMe5Needed}`,0,0,0)

      // NVMe7 for NVMe1
      dcConfigArrayLocal[dcItem].numberOfNVMe7Needed = Math.ceil((dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithDedicatedRocksDBDedicatedWAL * (sizingConstraints.defaultSizeOfWALOnNVMeInGB / 1000) +  localDCRequiredIndexCapacityOnNVMe7DedicatedWAL) / chassisArrayLocal[actualChassisID].sizeNVMe7) + Math.ceil((dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithDedicatedRocksDBIncludingWAL * (sizingConstraints.defaultSizeOfWALOnNVMeInGB / 1000) + localDCRequiredIndexCapacityOnNVMe7IncludingWAL) / chassisArrayLocal[actualChassisID].sizeNVMe7)
      debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 574, `[chassisID=${actualChassisID},DC=${dcItem}] #NVMe7 needed=${dcConfigArrayLocal[dcItem].numberOfNVMe7Needed}`,0,0,0)
      if (dcConfigArrayLocal[dcItem].numberOfNVMe7Needed < (Math.ceil(dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithDedicatedRocksDBDedicatedWAL / chassisArrayLocal[actualChassisID].nvmeToNVMe7) + Math.ceil(dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithDedicatedRocksDBIncludingWAL / chassisArrayLocal[actualChassisID].nvmeToNVMe7) )){
        // The number of media required based on capacity is not sufficient - would need to add more NVMe for the actual required number of NVMe1 to front.
        debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 577, `[chassisID=${actualChassisID},DC=${dcItem}] #NVMe7 needed=${dcConfigArrayLocal[dcItem].numberOfNVMe7Needed} < Math.ceil(dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithDedicatedRocksDBDedicatedWAL=${dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithDedicatedRocksDBDedicatedWAL} / chassisArrayLocal[actualChassisID].nvmeToNVMe7=${chassisArrayLocal[actualChassisID].nvmeToNVMe7}) + Math.ceil(dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithDedicatedRocksDBIncludingWAL=${dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithDedicatedRocksDBIncludingWAL} / chassisArrayLocal[actualChassisID].nvmeToNVMe7=${chassisArrayLocal[actualChassisID].nvmeToNVMe7})`,0,0,0)
        dcConfigArrayLocal[dcItem].numberOfNVMe7Needed = Math.ceil(dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithDedicatedRocksDBDedicatedWAL / chassisArrayLocal[actualChassisID].nvmeToNVMe7) + Math.ceil(dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithDedicatedRocksDBIncludingWAL / chassisArrayLocal[actualChassisID].nvmeToNVMe7)
        debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 579, `[chassisID=${actualChassisID},DC=${dcItem}] #NVMe7 needed=${dcConfigArrayLocal[dcItem].numberOfNVMe7Needed}`,0,0,0)
      }
      debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 581, `[chassisID=${actualChassisID},DC=${dcItem}] #NVMe7 needed=${dcConfigArrayLocal[dcItem].numberOfNVMe7Needed}`,0,0,0)


      // This should now have all media covered for this DC.
      if (generalValues.globalDebug == true || localDebugOn == true) {
        debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 586, `[chassisID=${actualChassisID},DC=${dcItem}] DC=${dcItem} => #media HDD=${dcConfigArrayLocal[dcItem].numberOfHDDNeeded}, SSDw/dedicated=${dcConfigArrayLocal[dcItem].numberOfSSD1NeededWithDedicatedRocksDBIncludingWAL}, SSDw/oDedicated=${dcConfigArrayLocal[dcItem].numberOfSSD1NeededWithoutDedicatedRocksDBNorWAL}, #SSD for data =${dcConfigArrayLocal[dcItem].numberOfSSDNeeded}, #SSD4=${dcConfigArrayLocal[dcItem].numberOfSSD4Needed}`,0,0,0)
        debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 587, `[chassisID=${actualChassisID},DC=${dcItem}] DC=${dcItem} => #media NVMe1=${dcConfigArrayLocal[dcItem].numberOfNVMe1Needed}, NVMe2=${dcConfigArrayLocal[dcItem].numberOfNVMe2Needed}, NVMe3=${dcConfigArrayLocal[dcItem].numberOfNVMe3Needed}, NVMe4=${dcConfigArrayLocal[dcItem].numberOfNVMe4Needed}, NVMe5=${dcConfigArrayLocal[dcItem].numberOfNVMe5Needed}, NVMe6=${dcConfigArrayLocal[dcItem].numberOfNVMe6Needed}, NVMe7=${dcConfigArrayLocal[dcItem].numberOfNVMe7Needed}, NVMe8=${dcConfigArrayLocal[dcItem].numberOfNVMe8Needed}`,0,0,0)
      }
    }
  }
}

export default dcConfigDetermineNumberOfMediaRequired