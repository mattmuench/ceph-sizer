import displayMsg from "../common/displayMsg.js"
const dcConfigDetermineNumberOfMediaRequired = function (generalValuesLocal, workloadsArrayLocal, sizingConstraints, dcConfigArrayLocal, chassisArrayLocal, actualChassisID) {
  const localDebug = true
  /**
    This is covering the H41, H42, J41, J42, N41, and O41 (for SSD)
    NOTE: no coverage for NVMe1 use for workloads (yet)
   */
  for (let dcItem = 0; dcItem < generalValuesLocal.numberOfDCsPossible; dcItem++) {
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
      let localDCRequiredIndexCapacityOnNVMe5 = 0  // RocksDB location for SSD if on separate NVMe
      let localDCRequiredIndexCapacityOnNVMe1DedicatedWAL = 0 // RocksDB location for NVMe1 if no separate NVMe for neither RocksDB nor WAL
      let localDCRequiredIndexCapacityOnNVMe1NorWAL = 0 // RocksDB location for NVMe1 if no separate NVMe for neither RocksDB nor WAL
      let localDCRequiredIndexCapacityOnNVMe7DedicatedWAL = 0 // index goes to RocksDB location for NVMe1 if on separate NVMe
      let localDCRequiredIndexCapacityOnNVMe7IncludingWAL = 0 // index goes to RocksDB location for NVMe1 if on separate NVMe
      let localDCCorrectionForUnalignedObjectsHDD = 0  // additional capacity to be taken into account for unaligned object payload data allocation on media
      
      
      
      let localDCCorrectionForUnalignedObjectsSSD1WithDedicatedRocksDBIncludingWAL = 0  // additional capacity to be taken into account for unaligned object payload data allocation on media 
      let localDCCorrectionForUnalignedObjectsSSD1WithDedicatedRocksDBDedicatedWAL = 0  // additional capacity to be taken into account for unaligned object payload data allocation on media 
      let localDCCorrectionForUnalignedObjectsSSD1WithoutDedicatedRocksDBNorWAL = 0  // additional capacity to be take into account for unaligned object payload data allocation on media
      let localDCCorrectionForUnalignedObjectsSSD1WithoutDedicatedRocksDBDedicatedWAL = 0  // additional capacity to be take into account for unaligned object payload data allocation on media
      
      let localDCCorrectionForUnalignedObjectsNVMe1WithDedicatedRocksDBIncludingWAL = 0  // additional capacity to be taken into account for unaligned object payload data allocation on media
      let localDCCorrectionForUnalignedObjectsNVMe1WithDedicatedRocksDBDedicatedWAL = 0  // additional capacity to be taken into account for unaligned object payload data allocation on media
      let localDCCorrectionForUnalignedObjectsNVMe1WithoutDedicatedRocksDBNorWAL = 0  // additional capacity to be take into account for unaligned object payload data allocation on media
      let localDCCorrectionForUnalignedObjectsNVMe1WithoutDedicatedRocksDBDedicatedWAL = 0  // additional capacity to be take into account for unaligned object payload data allocation on media
      
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
      
      // all these use a dedicated device for WAL, independent of the actual separation of RocksDB onto another dedicated media
//      let localNumberOfSSDNeededDedicatedRocksDBSepWAL = 0
//      let localNumberOfSSDNeededNonDedicatedRocksDBSepWAL = 0

      // processing the workloads and calculating the number of capacity needed for each config case
      for (let workloadItem = 0; workloadItem < generalValuesLocal.numberOfWorkloadsPossible; workloadItem++) {

        let localDCObjectIndexCapacity = 0 // takes all the actual index capacity required for the workload to be processed into the different locations
        let localWorkloadCorrectionForUnalignedObjectsHDD = 0
        let localWorkloadCorrectionForUnalignedObjectsSSD = 0
        let localWorkloadCorrectionForUnalignedObjectsNVMe1 = 0

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
            /////// switch (workloadsArrayLocal[workloadItem].sumNumberDC) {
            ///////   case 1: // only a single DC in the whole configuration => replica required is 3 => may be tuned with SizingConstraints.requiredNumberOfReplicaForObjectIndex
            ///////     {
            ///////       // index capacity is for the workload - per DC 
            ///////       localRequiredIndexCapacityFlash += workloadsArrayLocal[workloadItem].reqCapacityNet * workloadsArrayLocal[workloadItem].reqFlashPercent / 100 * 1000*1000*1000*1000/(workloadsArrayLocal[workloadItem].sizeAvgObj * 1024) * sizingConstraints.expectedAverageEntrySizeInObjectIndexInBytes / 1024/1024/1024/1024 * workloadsArrayLocal[workloadItem].selectorRGWLifecycleNumVersions *sizingConstraints.requiredNumberOfReplicaForObjectIndex / workloadsArrayLocal[workloadItem].sumNumberDC
            ///////       localRequiredIndexCapacityHDD += workloadsArrayLocal[workloadItem].reqCapacityNet * (100 - workloadsArrayLocal[workloadItem].reqFlashPercent) / 100 * 1000*1000*1000*1000/(workloadsArrayLocal[workloadItem].sizeAvgObj * 1024) * sizingConstraints.expectedAverageEntrySizeInObjectIndexInBytes * workloadsArrayLocal[workloadItem].selectorRGWLifecycleNumVersions *sizingConstraints.requiredNumberOfReplicaForObjectIndex / workloadsArrayLocal[workloadItem].sumNumberDC
            ///////     }
            ///////     break
            ///////   default: // 2 and more main DCs 
            ///////     {
            ///////       // index capacity is for the workload - per DC must be calculated later
            ///////       localRequiredIndexCapacityFlash += workloadsArrayLocal[workloadItem].reqCapacityNet * workloadsArrayLocal[workloadItem].reqFlashPercent / 100 * 1000*1000*1000*1000/(workloadsArrayLocal[workloadItem].sizeAvgObj * 1024) * sizingConstraints.expectedAverageEntrySizeInObjectIndexInBytes * workloadsArrayLocal[workloadItem].selectorRGWLifecycleNumVersions * workloadsArrayLocal[workloadItem].reqNumReplica / workloadsArrayLocal[workloadItem].sumNumberDC
            ///////       localRequiredIndexCapacityHDD = workloadsArrayLocal[workloadItem].reqCapacityNet * (100 - workloadsArrayLocal[workloadItem].reqFlashPercent) / 100 * 1000*1000*1000*1000/(workloadsArrayLocal[workloadItem].sizeAvgObj * 1024) * sizingConstraints.expectedAverageEntrySizeInObjectIndexInBytes * workloadsArrayLocal[workloadItem].selectorRGWLifecycleNumVersions * workloadsArrayLocal[workloadItem].reqNumReplica / workloadsArrayLocal[workloadItem].sumNumberDC
            ///////     }
            /////// }

            // calculate the local required index capacity (in this DC) for this workload (in TB) 
            //    => #DC=1 requires that all replica reside in this actual DC and should be the default number, 
            //    => #DC>1 would apply the replica number to the index as well.
            console.log(`dcConfigDetermineNumberOfMediaRequired() 138: [chassisID=${actualChassisID},workloadID=${workloadItem},DC=${dcItem}] workload in ACTUAL DC #${dcItem} and is type ${workloadsArrayLocal[workloadItem].useCase}`)
            if (workloadsArrayLocal[workloadItem].sumNumberDC === 1) {
              localDCObjectIndexCapacity = workloadsArrayLocal[workloadItem].reqCapacityNet * 1000*1000*1000*1000/(workloadsArrayLocal[workloadItem].sizeAvgObj * 1024) * sizingConstraints.expectedAverageEntrySizeInObjectIndexInBytes / 1024/1024/1024/1024 * workloadsArrayLocal[workloadItem].selectorRGWLifecycleNumVersions * sizingConstraints.requiredNumberOfReplicaForObjectIndex / workloadsArrayLocal[workloadItem].sumNumberDC
              console.log(`dcConfigDetermineNumberOfMediaRequired() 141: [chassisID=${actualChassisID},workloadID=${workloadItem},DC=${dcItem}] workload ONLY in ACTUAL DC #${dcItem} and needed capacity for object index=${localDCObjectIndexCapacity}`)
            }
            else {
              localDCObjectIndexCapacity = workloadsArrayLocal[workloadItem].reqCapacityNet * 1000*1000*1000*1000/(workloadsArrayLocal[workloadItem].sizeAvgObj * 1024) * sizingConstraints.expectedAverageEntrySizeInObjectIndexInBytes / 1024/1024/1024/1024 * workloadsArrayLocal[workloadItem].selectorRGWLifecycleNumVersions * workloadsArrayLocal[workloadItem].reqNumReplica / workloadsArrayLocal[workloadItem].sumNumberDC
              console.log(`dcConfigDetermineNumberOfMediaRequired() 145: [chassisID=${actualChassisID},workloadID=${workloadItem},DC=${dcItem}] workloadsArrayLocal[workloadItem].sizeAvgObj=${workloadsArrayLocal[workloadItem].sizeAvgObj}`)
              console.log(`dcConfigDetermineNumberOfMediaRequired() 146: [chassisID=${actualChassisID},workloadID=${workloadItem},DC=${dcItem}] workload NOT ONLY in ACTUAL DC #${dcItem} and needed capacity for object index=${localDCObjectIndexCapacity}`)

            }

            // Determine desired configuration for object index and add capacity to where needed.
            console.log(`dcConfigDetermineNumberOfMediaRequired() 151: [chassisID=${actualChassisID},workloadID=${workloadItem},DC=${dcItem}] rgw workload in DC#${dcItem} selected capacity for dedicated object index=${workloadsArrayLocal[workloadItem].selectorRGWIndexDedicatedFlashPool}`)
            if (workloadsArrayLocal[workloadItem].selectorRGWIndexDedicatedFlashPool === true) {
              // if this is set it's for both HDD and flash based portions of the worklod - it's always going to the separate index pool and we need to collect how much capacity is needed
              // for this pool. The amount needed for raw will be already calculated by this because we'll apply the required replication and the number of DCs used for the workload.
              // The media type would be NVMe6 .
              localDCDedicatedObjectIndexCapacity += localDCObjectIndexCapacity
              console.log(`dcConfigDetermineNumberOfMediaRequired() 157: [chassisID=${actualChassisID},workloadID=${workloadItem},DC=${dcItem}] rgw workload in DC#${dcItem} needs capacity for dedicated object index=${localDCDedicatedObjectIndexCapacity}`)
            }
            else {
              // There is no general desire for the actual workload to use a dedicated index pool. HDD would require a hybrid config (for the default use, anyways) and would need to add the capacity to the RocksDB capacity space.
              // Depending on the SSD/NVMe configuration, a separate space might be needed for the data portion or on a dedicated media for RocksDB.
              console.log(`dcConfigDetermineNumberOfMediaRequired() 162: [chassisID=${actualChassisID},workloadID=${workloadItem},DC=${dcItem}] rgw workload in DC#${dcItem} no dedicated index pool`)
              
              // For HDD anyways, because only with fronting flash for RocksDB, it needs to be allocated on NVMe4
              localDCRequiredIndexCapacityOnNVMe4 += localDCObjectIndexCapacity * (100 - workloadsArrayLocal[workloadItem].reqFlashPercent) / 100
              
              // and flash: reserve additional space on data device, dedicated NVMe for RocksDB or WAL 
              if (workloadsArrayLocal[workloadItem].selectorNVMe === true) {
                // NVMe1
                if (workloadsArrayLocal[workloadItem].selectorNVMe1DedicatedNVMe === true) {
                  // RocksDB is on NVMe7 - so index as well
                  if (workloadsArrayLocal[workloadItem].selectorNVMe1DedicatedNVMeForWAL === true) {
                    localDCRequiredIndexCapacityOnNVMe7DedicatedWAL += localDCObjectIndexCapacity * workloadsArrayLocal[workloadItem].reqFlashPercent / 100
                  console.log(`dcConfigDetermineNumberOfMediaRequired() 173: [chassisID=${actualChassisID},workloadID=${workloadItem},DC=${dcItem}] rgw workload in DC#${dcItem} needs index capacity on dedicated NVMe for NVMe1(NVMe7):${localDCRequiredIndexCapacityOnNVMe7DedicatedWAL}`)  
                  }
                  else {
                    localDCRequiredIndexCapacityOnNVMe7IncludingWAL += localDCObjectIndexCapacity * workloadsArrayLocal[workloadItem].reqFlashPercent / 100
                    console.log(`dcConfigDetermineNumberOfMediaRequired() 173: [chassisID=${actualChassisID},workloadID=${workloadItem},DC=${dcItem}] rgw workload in DC#${dcItem} needs index capacity on dedicated NVMe for NVMe(NVMe7):${localDCRequiredIndexCapacityOnNVMe7IncludingWAL}`)  
                  }
                }
                else {
                  // RocksDB is on NVMe1 - if no dedicated WAL, index is on NVMe1
                    if (workloadsArrayLocal[workloadItem].selectorNVMe1DedicatedNVMeForWAL === true) {
                      localDCRequiredIndexCapacityOnNVMe1DedicatedWAL += localDCObjectIndexCapacity * workloadsArrayLocal[workloadItem].reqFlashPercent / 100
                      console.log(`dcConfigDetermineNumberOfMediaRequired() 178: [chassisID=${actualChassisID},workloadID=${workloadItem},DC=${dcItem}] rgw workload in DC#${dcItem} - no dedicated NVMe for RocksDB but WAL - needs index capacity on NVMe1:${localDCRequiredIndexCapacityOnNVMe1DedicatedWAL}`)
                    }
                    else {
                      localDCRequiredIndexCapacityOnNVMe1NorWAL += localDCObjectIndexCapacity * workloadsArrayLocal[workloadItem].reqFlashPercent / 100
                      console.log(`dcConfigDetermineNumberOfMediaRequired() 179: [chassisID=${actualChassisID},workloadID=${workloadItem},DC=${dcItem}] rgw workload in DC#${dcItem} - no dedicated NVMe for RocksDB nor WAL - needs index capacity on NVMe1:${localDCRequiredIndexCapacityOnNVMe1NorWAL}`)
                    }
                }
              }
              else {
                // SSD
                if (workloadsArrayLocal[workloadItem].selectorSSDDedicatedNVMe === true) {
                    // RocksDB is on NVMe5
                  localDCRequiredIndexCapacityOnNVMe5 += localDCObjectIndexCapacity * workloadsArrayLocal[workloadItem].reqFlashPercent / 100
                  console.log(`dcConfigDetermineNumberOfMediaRequired() 186: [chassisID=${actualChassisID},workloadID=${workloadItem},DC=${dcItem}] rgw workload in DC#${dcItem} needs index pool on dedicated NVMe for SSD(NVMe5):${localDCRequiredIndexCapacityOnNVMe5}`)
                }
                else {
                  // RocksDB is on SSD1
                  localSSDAddCapacityWithOutDedicatedRocksDB += localDCObjectIndexCapacity * workloadsArrayLocal[workloadItem].reqFlashPercent / 100
                  console.log(`dcConfigDetermineNumberOfMediaRequired() 191: [chassisID=${actualChassisID},workloadID=${workloadItem},DC=${dcItem}] rgw workload in DC#${dcItem} - no dedicated NVMe for RocksDB - needs index capacity on SSD1:${localSSDAddCapacityWithOutDedicatedRocksDB}`)
                }
              }
            }

            // Determine the need of RGW dedicated cache and sum up a dedicated media per workload and minNumber of instances for RGW per workload
            if (workloadsArrayLocal[workloadItem].selectorRGWCache === true) {
              if (chassisArrayLocal[actualChassisID].useRGWCaching == 1) {
                localDCNumberOfRGWCacheMedia += sizingConstraints.minNumberOfInstancesRoleRGW
                console.log(`dcConfigDetermineNumberOfMediaRequired() 200: [chassisID=${actualChassisID},workloadID=${workloadItem},DC=${dcItem}] RGW cache media needed=${localDCNumberOfRGWCacheMedia}`)
              }
              else {
                displayMsg(document, "dcConfigDetermineNumberOfMediaRequired", 203, "error", `[chassisID=${actualChassisID},workloadID=${workloadItem},DC=${dcItem}] RGW cache media selected but chassis doesn't support it`,0,0,0)
              }
              
            }

            // Apply corrections to RGW use cases based on avg object size   ===> This might need to go prior to calculating the HDD and assigning it in top of the function
            // Both values in TB. Since the value of gross capacity for the workload is not reflecting the capacity distribution across DCs, the number of DCs in use for the workload needs to be 
            //   taken into account, since this here is reflecting the actual needed capacity on the media inside a specific DC - for all individual workloads.
            localWorkloadCorrectionForUnalignedObjectsHDD = (((workloadsArrayLocal[workloadItem].sizeAvgObj*1024) % sizingConstraints.fixedMinAllocSizeOnMediaHDD) / (workloadsArrayLocal[workloadItem].sizeAvgObj*1024)) * workloadsArrayLocal[workloadItem].reqCapacityGrossHDD / workloadsArrayLocal[workloadItem].sumNumberDC
            console.log(`dcConfigDetermineNumberOfMediaRequired 212: [chassisID=${actualChassisID},workloadID=${workloadItem},DC=${dcItem}] (workloadsArrayLocal[workloadItem].sizeAvgObj*1024) % sizingConstraints.fixedMinAllocSizeOnMediaHDD=${(workloadsArrayLocal[workloadItem].sizeAvgObj*1024) % sizingConstraints.fixedMinAllocSizeOnMediaHDD} `)
            console.log(`dcConfigDetermineNumberOfMediaRequired 213: [chassisID=${actualChassisID},workloadID=${workloadItem},DC=${dcItem}] workloadsArrayLocal[workloadItem].sizeAvgObj*1024=${workloadsArrayLocal[workloadItem].sizeAvgObj*1024}`)
            console.log(`dcConfigDetermineNumberOfMediaRequired 214: [chassisID=${actualChassisID},workloadID=${workloadItem},DC=${dcItem}] (((workloadsArrayLocal[workloadItem].sizeAvgObj*1024) % sizingConstraints.fixedMinAllocSizeOnMediaHDD) / (workloadsArrayLocal[workloadItem].sizeAvgObj*1024))=${(((workloadsArrayLocal[workloadItem].sizeAvgObj*1024) % sizingConstraints.fixedMinAllocSizeOnMediaHDD) / (workloadsArrayLocal[workloadItem].sizeAvgObj*1024))}`)
            console.log(`dcConfigDetermineNumberOfMediaRequired 215: [chassisID=${actualChassisID},workloadID=${workloadItem},DC=${dcItem}] localWorkloadCorrectionForUnalignedObjectsHDD = (((workloadsArrayLocal[workloadItem].sizeAvgObj*1024) % sizingConstraints.fixedMinAllocSizeOnMediaHDD) / (workloadsArrayLocal[workloadItem].sizeAvgObj*1024)) * workloadsArrayLocal[workloadItem].reqCapacityGrossHDD / workloadsArrayLocal[workloadItem].sumNumberDC = ${(((workloadsArrayLocal[workloadItem].sizeAvgObj*1024) % sizingConstraints.fixedMinAllocSizeOnMediaHDD) /(workloadsArrayLocal[workloadItem].sizeAvgObj*1024)) * workloadsArrayLocal[workloadItem].reqCapacityGrossHDD / workloadsArrayLocal[workloadItem].sumNumberDC}`)
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
            console.log(`dcConfigDetermineNumberOfMediaRequired() 262: [chassisID=${actualChassisID},workloadID=${workloadItem},DC=${dcItem}] local capacity correction unaligned RGW object parts - for HDD=${localWorkloadCorrectionForUnalignedObjectsHDD}`)
            console.log(`dcConfigDetermineNumberOfMediaRequired() 263: [chassisID=${actualChassisID},workloadID=${workloadItem},DC=${dcItem}] local capacity correction unaligned RGW object parts - for SSD w/ =${localDCCorrectionForUnalignedObjectsSSD1WithDedicatedRocksDBIncludingWAL}, for SSD w/o dedicated=${localDCCorrectionForUnalignedObjectsSSD1WithoutDedicatedRocksDBNorWAL}`)
            console.log(`dcConfigDetermineNumberOfMediaRequired() 264: [chassisID=${actualChassisID},workloadID=${workloadItem},DC=${dcItem}] local capacity correction unaligned RGW object parts - for NVMe w/ = not applicable,  for NVMe w/o dedicated=${localDCCorrectionForUnalignedObjectsNVMe1WithoutDedicatedRocksDBNorWAL}`)
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
              if (workloadsArrayLocal[workloadItem].selectorDedicatedNVMe === true) {  
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
              if (workloadsArrayLocal[workloadItem].selectorDedicatedNVMe === true) {
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
            
            console.log(`dcConfigDetermineNumberOfMediaRequired() 315: [chassisID=${actualChassisID},workloadID=${workloadItem},DC=${dcItem}] local capacity correction unaligned file parts - for HDD=${localDCCorrectionForUnalignedObjectsHDD}`)
            console.log(`dcConfigDetermineNumberOfMediaRequired() 316: [chassisID=${actualChassisID},workloadID=${workloadItem},DC=${dcItem}] local capacity correction unaligned file parts - for SSD w/o=${localDCCorrectionForUnalignedObjectsSSD1WithoutDedicatedRocksDBNorWAL}, for SSD w/dedicated=${localDCCorrectionForUnalignedObjectsSSD1WithDedicatedRocksDBIncludingWAL}`)
            console.log(`dcConfigDetermineNumberOfMediaRequired() 317: [chassisID=${actualChassisID},workloadID=${workloadItem},DC=${dcItem}] local capacity correction unaligned file parts - for NVMe w/o=${localDCCorrectionForUnalignedObjectsNVMe1WithoutDedicatedRocksDBNorWAL}, for NVMe w/dedicated=${localDCCorrectionForUnalignedObjectsNVMe1WithDedicatedRocksDBIncludingWAL}`)
          }
          
          // For all capacity related calculation for real data placement
          if (workloadsArrayLocal[workloadItem].selectorArrayDC[dcItem] === true) {
            // RocksDB size must be calculated for any case: based on raw capacity needed per for the workload in the DC plus the correction for unaligned data or data portions - then decide where this additional
            //   capacity should go to: either dedicated media or the block device (for flash storage)
            localWorkloadRocksDBSizeHDD = workloadsArrayLocal[workloadItem].reqCapacityGrossHDD / workloadsArrayLocal[workloadItem].sumNumberDC * workloadsArrayLocal[workloadItem].rocksDBSpaceInPercent / 100 + localWorkloadCorrectionForUnalignedObjectsHDD
            console.log(`dcConfigDetermineNumberOfMediaRequired() 325: [chassisID=${actualChassisID},workloadID=${workloadItem},DC=${dcItem}] CHECK HDD: ${workloadsArrayLocal[workloadItem].reqCapacityGrossHDD} / ${workloadsArrayLocal[workloadItem].sumNumberDC} * ${workloadsArrayLocal[workloadItem].rocksDBSpaceInPercent} / 100 + ${localWorkloadCorrectionForUnalignedObjectsHDD}`)
            localDCRocksDBSizeHDD += localWorkloadRocksDBSizeHDD
            // for flash: distinguish between normal and dedicated RocksDB media - also assign here the required SSD capacity to one of the two groups
            // of dedicated vs non-dedicated media for RocksDB
            if (workloadsArrayLocal[workloadItem].selectorNVMe === true ) {
              if (workloadsArrayLocal[workloadItem].selectorNVMe1DedicatedNVMe === true) {
                if (workloadsArrayLocal[workloadItem].selectorNVMe1DedicatedNVMeForWAL === true) {
                  localWorkloadRocksDBSizeNVMe1WithDedicatedNVMeDedicatedWAL = workloadsArrayLocal[workloadItem].reqCapacityGrossNVMe / workloadsArrayLocal[workloadItem].sumNumberDC * workloadsArrayLocal[workloadItem].rocksDBSpaceInPercent / 100 + localWorkloadCorrectionForUnalignedObjectsNVMe1
                  console.log(`dcConfigDetermineNumberOfMediaRequired() 333: [chassisID=${actualChassisID},workloadID=${workloadItem},DC=${dcItem}] CHECK RocksDB dedicated NVMe: ${workloadsArrayLocal[workloadItem].reqCapacityGrossNVMe } / ${workloadsArrayLocal[workloadItem].sumNumberDC} * ${workloadsArrayLocal[workloadItem].rocksDBSpaceInPercent} / 100 + ${localWorkloadCorrectionForUnalignedObjectsNVMe1}`)
                  localDCRocksDBSizeNVMe1WithDedicatedNVMeDedicatedWAL += localWorkloadRocksDBSizeNVMe1WithDedicatedNVMeDedicatedWAL
                  localNVMe1CapacityWithDedicatedRocksDBDedicatedWAL += workloadsArrayLocal[workloadItem].reqCapacityGrossNVMe / workloadsArrayLocal[workloadItem].sumNumberDC
                }
                else {
                  localWorkloadRocksDBSizeNVMe1WithDedicatedNVMeIncludingWAL = workloadsArrayLocal[workloadItem].reqCapacityGrossNVMe / workloadsArrayLocal[workloadItem].sumNumberDC * workloadsArrayLocal[workloadItem].rocksDBSpaceInPercent / 100 + localWorkloadCorrectionForUnalignedObjectsNVMe1
                  console.log(`dcConfigDetermineNumberOfMediaRequired() 339: [chassisID=${actualChassisID},workloadID=${workloadItem},DC=${dcItem}] CHECK RocksDB dedicated NVMe: ${workloadsArrayLocal[workloadItem].reqCapacityGrossNVMe } / ${workloadsArrayLocal[workloadItem].sumNumberDC} * ${workloadsArrayLocal[workloadItem].rocksDBSpaceInPercent} / 100 + ${localWorkloadCorrectionForUnalignedObjectsNVMe1}`)
                  localDCRocksDBSizeNVMe1WithDedicatedNVMeIncludingWAL += localWorkloadRocksDBSizeNVMe1WithDedicatedNVMeIncludingWAL
                  localNVMe1CapacityWithDedicatedRocksDBIncludingWAL += workloadsArrayLocal[workloadItem].reqCapacityGrossNVMe / workloadsArrayLocal[workloadItem].sumNumberDC
                }
              }
              else {
                if (workloadsArrayLocal[workloadItem].selectorNVMe1DedicatedNVMeForWAL === true) {
                  localWorkloadRocksDBSizeNVMe1WithoutDedicatedNVMeDedicatedWAL = workloadsArrayLocal[workloadItem].reqCapacityGrossNVMe / workloadsArrayLocal[workloadItem].sumNumberDC * workloadsArrayLocal[workloadItem].rocksDBSpaceInPercent / 100 + localWorkloadCorrectionForUnalignedObjectsNVMe1
                  console.log(`dcConfigDetermineNumberOfMediaRequired() 347: [chassisID=${actualChassisID},workloadID=${workloadItem},DC=${dcItem}] CHECK RocksDB nonDedicated NVMe: ${workloadsArrayLocal[workloadItem].reqCapacityGrossNVMe } / ${workloadsArrayLocal[workloadItem].sumNumberDC} * ${workloadsArrayLocal[workloadItem].rocksDBSpaceInPercent} / 100 + ${localWorkloadCorrectionForUnalignedObjectsNVMe1}`)
                  localDCRocksDBSizeNVMe1WithoutDedicatedNVMeDedicatedWAL += localWorkloadRocksDBSizeNVMe1WithoutDedicatedNVMeDedicatedWAL
                  localNVMe1CapacityWithoutDedicatedRocksDBDedicatedWAL += workloadsArrayLocal[workloadItem].reqCapacityGrossNVMe / workloadsArrayLocal[workloadItem].sumNumberDC  
                }
                else {
                  localWorkloadRocksDBSizeNVMe1WithoutDedicatedNVMeNorWAL = workloadsArrayLocal[workloadItem].reqCapacityGrossNVMe / workloadsArrayLocal[workloadItem].sumNumberDC * workloadsArrayLocal[workloadItem].rocksDBSpaceInPercent / 100 + localWorkloadCorrectionForUnalignedObjectsNVMe1
                  console.log(`dcConfigDetermineNumberOfMediaRequired() 353: [chassisID=${actualChassisID},workloadID=${workloadItem},DC=${dcItem}] CHECK RocksDB nonDedicated NVMe: ${workloadsArrayLocal[workloadItem].reqCapacityGrossNVMe } / ${workloadsArrayLocal[workloadItem].sumNumberDC} * ${workloadsArrayLocal[workloadItem].rocksDBSpaceInPercent} / 100 + ${localWorkloadCorrectionForUnalignedObjectsNVMe1}`)
                  localDCRocksDBSizeNVMe1WithoutDedicatedNVMeNorWAL += localWorkloadRocksDBSizeNVMe1WithoutDedicatedNVMeNorWAL
                  localNVMe1CapacityWithoutDedicatedRocksDBNorWAL += workloadsArrayLocal[workloadItem].reqCapacityGrossNVMe / workloadsArrayLocal[workloadItem].sumNumberDC
                
                }
              }
            }
            else {
              if (workloadsArrayLocal[workloadItem].selectorSSDDedicatedNVMe === true) {
                if (workloadsArrayLocal[workloadItem].selectorSSDDedicatedNVMeForWAL === true) {
                  localWorkloadRocksDBSizeSSDWithDedicatedNVMeDedicatedWAL = workloadsArrayLocal[workloadItem].reqCapacityGrossSSD / workloadsArrayLocal[workloadItem].sumNumberDC * workloadsArrayLocal[workloadItem].rocksDBSpaceInPercent / 100 + localWorkloadCorrectionForUnalignedObjectsSSD
                  console.log(`dcConfigDetermineNumberOfMediaRequired() 364: [chassisID=${actualChassisID},workloadID=${workloadItem},DC=${dcItem}] CHECK RocksDB dedicated NVMe: ${workloadsArrayLocal[workloadItem].reqCapacityGrossSSD } / ${workloadsArrayLocal[workloadItem].sumNumberDC} * ${workloadsArrayLocal[workloadItem].rocksDBSpaceInPercent} / 100 + ${localWorkloadCorrectionForUnalignedObjectsSSD}`)
                  localDCRocksDBSizeSSDWithDedicatedNVMeDedicatedWAL += localWorkloadRocksDBSizeSSDWithDedicatedNVMeDedicatedWAL
                  localSSDCapacityWithDedicatedRocksDBDedicatedWAL += workloadsArrayLocal[workloadItem].reqCapacityGrossSSD / workloadsArrayLocal[workloadItem].sumNumberDC
                }
                else {
                  localWorkloadRocksDBSizeSSDWithDedicatedNVMeIncludingWAL = workloadsArrayLocal[workloadItem].reqCapacityGrossSSD / workloadsArrayLocal[workloadItem].sumNumberDC * workloadsArrayLocal[workloadItem].rocksDBSpaceInPercent / 100 + localWorkloadCorrectionForUnalignedObjectsSSD
                  console.log(`dcConfigDetermineNumberOfMediaRequired() 370: [chassisID=${actualChassisID},workloadID=${workloadItem},DC=${dcItem}] CHECK RocksDB dedicated NVMe: ${workloadsArrayLocal[workloadItem].reqCapacityGrossSSD } / ${workloadsArrayLocal[workloadItem].sumNumberDC} * ${workloadsArrayLocal[workloadItem].rocksDBSpaceInPercent} / 100 + ${localWorkloadCorrectionForUnalignedObjectsSSD}`)
                  localDCRocksDBSizeSSDWithDedicatedNVMeIncludingWAL += localWorkloadRocksDBSizeSSDWithDedicatedNVMeIncludingWAL
                  localSSDCapacityWithDedicatedRocksDBIncludingWAL += workloadsArrayLocal[workloadItem].reqCapacityGrossSSD / workloadsArrayLocal[workloadItem].sumNumberDC  
                }
              }
              else {
                if (workloadsArrayLocal[workloadItem].selectorSSDDedicatedNVMeForWAL === true) {

                  localWorkloadRocksDBSizeSSDWithoutDedicatedNVMeDedicatedWAL = workloadsArrayLocal[workloadItem].reqCapacityGrossSSD / workloadsArrayLocal[workloadItem].sumNumberDC * workloadsArrayLocal[workloadItem].rocksDBSpaceInPercent / 100 + localWorkloadCorrectionForUnalignedObjectsSSD
                  console.log(`dcConfigDetermineNumberOfMediaRequired() 379: [chassisID=${actualChassisID},workloadID=${workloadItem},DC=${dcItem}] CHECK nonDED NVMe: ${workloadsArrayLocal[workloadItem].reqCapacityGrossSSD } / ${workloadsArrayLocal[workloadItem].sumNumberDC} * ${workloadsArrayLocal[workloadItem].rocksDBSpaceInPercent} / 100 + ${localWorkloadCorrectionForUnalignedObjectsSSD}`)
                  localDCRocksDBSizeSSDWithoutDedicatedNVMeDedicatedWAL += localWorkloadRocksDBSizeSSDWithoutDedicatedNVMeDedicatedWAL + localSSDAddCapacityWithOutDedicatedRocksDB
                  localSSDCapacityWithoutDedicatedRocksDBDedicatedWAL += workloadsArrayLocal[workloadItem].reqCapacityGrossSSD / workloadsArrayLocal[workloadItem].sumNumberDC
                }
                else{
                  localWorkloadRocksDBSizeSSDWithoutDedicatedNVMeNorWAL = workloadsArrayLocal[workloadItem].reqCapacityGrossSSD / workloadsArrayLocal[workloadItem].sumNumberDC * workloadsArrayLocal[workloadItem].rocksDBSpaceInPercent / 100 + localWorkloadCorrectionForUnalignedObjectsSSD
                  console.log(`dcConfigDetermineNumberOfMediaRequired() 385: [chassisID=${actualChassisID},workloadID=${workloadItem},DC=${dcItem}] CHECK nonDED NVMe: ${workloadsArrayLocal[workloadItem].reqCapacityGrossSSD } / ${workloadsArrayLocal[workloadItem].sumNumberDC} * ${workloadsArrayLocal[workloadItem].rocksDBSpaceInPercent} / 100 + ${localWorkloadCorrectionForUnalignedObjectsSSD}`)
                  localDCRocksDBSizeSSDWithoutDedicatedNVMeNorWAL += localWorkloadRocksDBSizeSSDWithoutDedicatedNVMeNorWAL + localSSDAddCapacityWithOutDedicatedRocksDB
                  localSSDCapacityWithoutDedicatedRocksDBNorWAL += workloadsArrayLocal[workloadItem].reqCapacityGrossSSD / workloadsArrayLocal[workloadItem].sumNumberDC  
                }
              }
            }
            console.log(`dcConfigDetermineNumberOfMediaRequired() 391: [chassisID=${actualChassisID},workloadID=${workloadItem},DC=${dcItem}] local DC SSD capacity localSSDCapacityWithDedicatedRocksDBDedicatedWAL=${localSSDCapacityWithDedicatedRocksDBDedicatedWAL}`)
            console.log(`dcConfigDetermineNumberOfMediaRequired() 392: [chassisID=${actualChassisID},workloadID=${workloadItem},DC=${dcItem}] local DC SSD capacity localSSDCapacityWithDedicatedRocksDBIncludingWAL=${localSSDCapacityWithDedicatedRocksDBIncludingWAL}`)
            console.log(`dcConfigDetermineNumberOfMediaRequired() 393: [chassisID=${actualChassisID},workloadID=${workloadItem},DC=${dcItem}] local DC SSD capacity localSSDCapacityWithoutDedicatedRocksDBDedicatedWAL=${localSSDCapacityWithoutDedicatedRocksDBDedicatedWAL}`)
            console.log(`dcConfigDetermineNumberOfMediaRequired() 394: [chassisID=${actualChassisID},workloadID=${workloadItem},DC=${dcItem}] local DC SSD capacity localSSDCapacityWithoutDedicatedRocksDBNorWAL=${localSSDCapacityWithoutDedicatedRocksDBNorWAL}`)

            console.log(`dcConfigDetermineNumberOfMediaRequired() 396: [chassisID=${actualChassisID},workloadID=${workloadItem},DC=${dcItem}] local capacity corrected of RocksDB space for unaligned data parts - for HDD=${localWorkloadRocksDBSizeHDD}`)
            console.log(`dcConfigDetermineNumberOfMediaRequired() 397: [chassisID=${actualChassisID},workloadID=${workloadItem},DC=${dcItem}] local capacity corrected of RocksDB space for unaligned data parts - for SSD w/ dedicated RocksDB w/ dedicated WAL=${localDCRocksDBSizeSSDWithDedicatedNVMeDedicatedWAL}`)
            console.log(`dcConfigDetermineNumberOfMediaRequired() 398: [chassisID=${actualChassisID},workloadID=${workloadItem},DC=${dcItem}] local capacity corrected of RocksDB space for unaligned data parts - for SSD w/ dedicated RocksDB w/o dedicated WAL=${localDCRocksDBSizeSSDWithDedicatedNVMeIncludingWAL}`)
            console.log(`dcConfigDetermineNumberOfMediaRequired() 399: [chassisID=${actualChassisID},workloadID=${workloadItem},DC=${dcItem}] local capacity corrected of RocksDB space for unaligned data parts - for SSD w/o dedicated RocksDB w/ dedicated WAL=${localDCRocksDBSizeSSDWithoutDedicatedNVMeDedicatedWAL}`)
            console.log(`dcConfigDetermineNumberOfMediaRequired() 400: [chassisID=${actualChassisID},workloadID=${workloadItem},DC=${dcItem}] local capacity corrected of RocksDB space for unaligned data parts - for SSD w/o dedicated RocksDB w/o dedicated WAL=${localDCRocksDBSizeSSDWithoutDedicatedNVMeNorWAL}`)
            console.log(`dcConfigDetermineNumberOfMediaRequired() 401: [chassisID=${actualChassisID},workloadID=${workloadItem},DC=${dcItem}] local capacity corrected of RocksDB space for unaligned data parts - for NVMe w/ dedicated RocksDB w/ dedicated WAL=${localDCRocksDBSizeNVMe1WithDedicatedNVMeDedicatedWAL}`)
            console.log(`dcConfigDetermineNumberOfMediaRequired() 402: [chassisID=${actualChassisID},workloadID=${workloadItem},DC=${dcItem}] local capacity corrected of RocksDB space for unaligned data parts - for NVMe w/ dedicated RocksDB w/o dedicated WAL=${localDCRocksDBSizeNVMe1WithDedicatedNVMeIncludingWAL}`)
            console.log(`dcConfigDetermineNumberOfMediaRequired() 403: [chassisID=${actualChassisID},workloadID=${workloadItem},DC=${dcItem}] local capacity corrected of RocksDB space for unaligned data parts - for NVMe w/o dedicated RocksDB w/ dedicated WAL=${localDCRocksDBSizeNVMe1WithoutDedicatedNVMeDedicatedWAL}`)
            console.log(`dcConfigDetermineNumberOfMediaRequired() 404: [chassisID=${actualChassisID},workloadID=${workloadItem},DC=${dcItem}] local capacity corrected of RocksDB space for unaligned data parts - for NVMe w/o dedicated RocksDB w/o dedicated WAL=${localDCRocksDBSizeNVMe1WithoutDedicatedNVMeNorWAL}`)
          }
        }
      }
      // End of processing the workloads and calculating the capacity needed for each config case
    

      /// The specific size of media should come from a specific chassisConfig.
      // Media for dedicated index pool in DC
      console.log(`dcConfigDetermineNumberOfMediaRequired() 413: [chassisID=${actualChassisID},DC=${dcItem}] actualChassisID=${actualChassisID}, chassisArrayLocal[actualChassisID].chassisID=${chassisArrayLocal[actualChassisID].chassisID}, maxHDDSlots=${chassisArrayLocal[actualChassisID].maxHDDSlots}`)
      dcConfigArrayLocal[dcItem].numberOfNVMe6Needed = Math.ceil(localDCDedicatedObjectIndexCapacity / chassisArrayLocal[actualChassisID].sizeNVMe6)
      console.log(`dcConfigDetermineNumberOfMediaRequired() 415: [chassisID=${actualChassisID},DC=${dcItem}] localDCDedicatedObjectIndexCapacity=${localDCDedicatedObjectIndexCapacity} / chassisArrayLocal[actualChassisID].sizeNVMe6 ${chassisArrayLocal[actualChassisID].sizeNVMe6}`)
      console.log(`dcConfigDetermineNumberOfMediaRequired() 416: [chassisID=${actualChassisID},DC=${dcItem}] #NVMe6 needed=${dcConfigArrayLocal[dcItem].numberOfNVMe6Needed}`)

      // HDD: Media for dedicated RocksDB media for HDD
      if (chassisArrayLocal[actualChassisID].sizeSSD4 === 0) {
        console.log(`dcConfigDetermineNumberOfMediaRequired() 420: [chassisID=${actualChassisID},DC=${dcItem}] using SSD4`)
        // don't use SSD type 4 for fronting HDD - then use NVMe type 4
        // Check also the number of NVMe would be sufficient for the number of HDD allowed to cover Chassis.hddToSSD4
        dcConfigArrayLocal[dcItem].numberOfNVMe4Needed = Math.ceil((localDCRocksDBSizeHDD + localDCRequiredIndexCapacityOnNVMe4) / chassisArrayLocal[actualChassisID].sizeNVMe4)
        if (dcConfigArrayLocal[dcItem].numberOfNVMe4Needed < dcConfigArrayLocal[dcItem].numberOfHDDNeeded / chassisArrayLocal[actualChassisID].hddToSSD4) {
          // The number of media required based on capacity is not sufficient - would need to add more NVMe for the actual required number of HDD to front.
          dcConfigArrayLocal[dcItem].numberOfNVMe4Needed = Math.ceil(dcConfigArrayLocal[dcItem].numberOfHDDNeeded / chassisArrayLocal[actualChassisID].hddToSSD4)
        }
        console.log(`dcConfigDetermineNumberOfMediaRequired() 428: [chassisID=${actualChassisID},DC=${dcItem}] #NVMe4 needed=${dcConfigArrayLocal[dcItem].numberOfNVMe4Needed}`)
      }
      else {
        // use SSD type 4 for hosting the RocksDB+WAL and also add the index capacity for HDD based RGW use cases hosted here on this SSD type 4 as well
        dcConfigArrayLocal[dcItem].numberOfSSD4Needed = Math.ceil((localDCRocksDBSizeHDD + localDCRequiredIndexCapacityOnNVMe4) / chassisArrayLocal[actualChassisID].sizeSSD4)
        console.log(`dcConfigDetermineNumberOfMediaRequired() 433: [chassisID=${actualChassisID},DC=${dcItem}] (localDCRocksDBSizeHDD=${localDCRocksDBSizeHDD} + localDCRequiredIndexCapacityOnNVMe4=${localDCRequiredIndexCapacityOnNVMe4}) / chassisArrayLocal[actualChassisID].sizeSSD4=${chassisArrayLocal[actualChassisID].sizeSSD4})`)
        console.log(`dcConfigDetermineNumberOfMediaRequired() 434: [chassisID=${actualChassisID},DC=${dcItem}] #SSD4 needed=${dcConfigArrayLocal[dcItem].numberOfSSD4Needed}`)
      }
      
      // SSD as pool media: 

      // Two different kinds of RocksDB capacity: with and without dedicated - with dedicated, there must be a different kind of media
      // for hosting the dedicated RocksDB: NVMe5 (RocksDB+WAL all-in-one); NVMe3 (WAL dedicated and separated from NVMe5)
      // Note: the capacity of localDCCorrectionForUnalignedObjectsSSD1WithDedicatedRocksDBIncludingWAL is not changing the RocksDB capacity. Similar for NMVe1.
      // Check also the number of NVMe would be sufficient for the number of SSD allowed to cover Chassis.ssdToNVMe5
      
      // SSD:
      dcConfigArrayLocal[dcItem].numberOfSSD1NeededWithoutDedicatedRocksDBDedicatedWAL = Math.ceil(localSSDCapacityWithoutDedicatedRocksDBDedicatedWAL / chassisArrayLocal[actualChassisID].sizeNVMe1)
      dcConfigArrayLocal[dcItem].numberOfSSD1NeededWithDedicatedRocksDBDedicatedWAL = Math.ceil(localSSDCapacityWithDedicatedRocksDBDedicatedWAL / chassisArrayLocal[actualChassisID].sizeNVMe1)
      // SSD - RocksDB size on dedicated flash media fronting the SSD1 => NVMe5 (dedicated WAL means this lands on NVMe3 instead of landing on the NVMe5)
      dcConfigArrayLocal[dcItem].numberOfNVMe5Needed = Math.ceil(((sizingConstraints.defaultSizeOfWALOnNVMeInGB  / 1000) * dcConfigArrayLocal[dcItem].numberOfSSD1NeededWithoutDedicatedRocksDBDedicatedWAL + localDCRequiredIndexCapacityOnNVMe5) / chassisArrayLocal[actualChassisID].sizeNVMe5) + Math.ceil((sizingConstraints.defaultSizeOfWALOnNVMeInGB / 1000) * dcConfigArrayLocal[dcItem].numberOfSSD1NeededWithDedicatedRocksDBDedicatedWAL / chassisArrayLocal[actualChassisID].sizeNVMe5)
      dcConfigArrayLocal[dcItem].numberOfNVMe5Needed = Math.ceil(
                                                          ((sizingConstraints.defaultSizeOfWALOnNVMeInGB  / 1000) * dcConfigArrayLocal[dcItem].numberOfSSD1NeededWithoutDedicatedRocksDBDedicatedWAL + localDCRequiredIndexCapacityOnNVMe5) / chassisArrayLocal[actualChassisID].sizeNVMe5
                                                       ) 
                                                     + Math.ceil(
                                                          (sizingConstraints.defaultSizeOfWALOnNVMeInGB / 1000) * dcConfigArrayLocal[dcItem].numberOfSSD1NeededWithDedicatedRocksDBDedicatedWAL / chassisArrayLocal[actualChassisID].sizeNVMe5
                                                       )
      if (dcConfigArrayLocal[dcItem].numberOfNVMe5Needed < ((dcConfigArrayLocal[dcItem].numberOfSSD1NeededWithoutDedicatedRocksDBDedicatedWAL / chassisArrayLocal[actualChassisID].ssdToNVMe5) + (dcConfigArrayLocal[dcItem].numberOfSSD1NeededWithDedicatedRocksDBDedicatedWAL / chassisArrayLocal[actualChassisID].sizeNVMe5)) ){
        // The number of media required based on capacity is not sufficient - would need to add more NVMe for the actual required number of SSD to front.
        dcConfigArrayLocal[dcItem].numberOfNVMe5Needed = Math.ceil((dcConfigArrayLocal[dcItem].numberOfSSD1NeededWithoutDedicatedRocksDBDedicatedWAL / chassisArrayLocal[actualChassisID].ssdToNVMe5) + (dcConfigArrayLocal[dcItem].numberOfSSD1NeededWithDedicatedRocksDBDedicatedWAL / chassisArrayLocal[actualChassisID].sizeNVMe5))
      }
      console.log(`dcConfigDetermineNumberOfMediaRequired() 448: [chassisID=${actualChassisID},DC=${dcItem}] #NVMe5 needed=${dcConfigArrayLocal[dcItem].numberOfNVMe5Needed}`)
    
      // NVMe1:
      console.log(`dcConfigDetermineNumberOfMediaRequired() 451: [chassisID=${actualChassisID},DC=${dcItem}] localDCRocksDBSizeNVMe1WithDedicatedNVMeIncludingWAL=${localDCRocksDBSizeNVMe1WithDedicatedNVMeIncludingWAL}`)
      console.log(`dcConfigDetermineNumberOfMediaRequired() 452a: [chassisID=${actualChassisID},DC=${dcItem}] localDCRequiredIndexCapacityOnNVMe1NorWAL=${localDCRequiredIndexCapacityOnNVMe1NorWAL}`)
      console.log(`dcConfigDetermineNumberOfMediaRequired() 452a: [chassisID=${actualChassisID},DC=${dcItem}] localDCRequiredIndexCapacityOnNVMe1DedicatedWAL=${localDCRequiredIndexCapacityOnNVMe1DedicatedWAL}`)
      console.log(`dcConfigDetermineNumberOfMediaRequired() 452b: [chassisID=${actualChassisID},DC=${dcItem}] localDCRequiredIndexCapacityOnNVMe7DedicatedWAL=${localDCRequiredIndexCapacityOnNVMe7DedicatedWAL}`)
      console.log(`dcConfigDetermineNumberOfMediaRequired() 452b: [chassisID=${actualChassisID},DC=${dcItem}] localDCRequiredIndexCapacityOnNVMe7IncludingWAL=${localDCRequiredIndexCapacityOnNVMe7IncludingWAL}`)
      console.log(`dcConfigDetermineNumberOfMediaRequired() 453: [chassisID=${actualChassisID},DC=${dcItem}] localDCRocksDBSizeNVMe1WithDedicatedNVMeDedicatedWAL=${localDCRocksDBSizeNVMe1WithDedicatedNVMeDedicatedWAL}`)
      
      // NVMe1 - no additional data from RGW index to be placed on NVMe1
      dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithoutDedicatedRocksDBDedicatedWAL = Math.ceil(localNVMe1CapacityWithoutDedicatedRocksDBDedicatedWAL / chassisArrayLocal[actualChassisID].sizeNVMe1)
      dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithDedicatedRocksDBDedicatedWAL = Math.ceil(localNVMe1CapacityWithDedicatedRocksDBDedicatedWAL / chassisArrayLocal[actualChassisID].sizeNVMe1)
      console.log(`dcConfigDetermineNumberOfMediaRequired() 454: [chassisID=${actualChassisID},DC=${dcItem}] dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithoutDedicatedRocksDBDedicatedWAL=${dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithoutDedicatedRocksDBDedicatedWAL}`)
      console.log(`dcConfigDetermineNumberOfMediaRequired() 455: [chassisID=${actualChassisID},DC=${dcItem}] dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithDedicatedRocksDBDedicatedWAL=${dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithDedicatedRocksDBDedicatedWAL}`)
      // NVMe8 for NVMe1
      dcConfigArrayLocal[dcItem].numberOfNVMe8Needed = Math.ceil((dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithoutDedicatedRocksDBDedicatedWAL * (sizingConstraints.defaultSizeOfWALOnNVMeInGB / 1000)) / chassisArrayLocal[actualChassisID].sizeNVMe8) + Math.ceil(dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithDedicatedRocksDBDedicatedWAL* (sizingConstraints.defaultSizeOfWALOnNVMeInGB / 1000) / chassisArrayLocal[actualChassisID].sizeNVMe8)
      console.log(`dcConfigDetermineNumberOfMediaRequired() 458: [chassisID=${actualChassisID},DC=${dcItem}] #NVMe8 needed=${dcConfigArrayLocal[dcItem].numberOfNVMe8Needed}`)
      if (dcConfigArrayLocal[dcItem].numberOfNVMe8Needed < (Math.ceil(dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithoutDedicatedRocksDBDedicatedWAL / chassisArrayLocal[actualChassisID].nvmeToNVMe8) + Math.ceil(dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithDedicatedRocksDBDedicatedWAL / chassisArrayLocal[actualChassisID].nvmeToNVMe8) )){
        // The number of media required based on capacity is not sufficient - would need to add more NVMe for the actual required number of NVMe1 to front.
        console.log(`dcConfigDetermineNumberOfMediaRequired() 461: [chassisID=${actualChassisID},DC=${dcItem}] #NVMe8 needed=${dcConfigArrayLocal[dcItem].numberOfNVMe8Needed} < Math.ceil(dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithoutDedicatedRocksDBDedicatedWAL=${dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithoutDedicatedRocksDBDedicatedWAL} / chassisArrayLocal[actualChassisID].nvmeToNVMe8=${chassisArrayLocal[actualChassisID].nvmeToNVMe8}) + Math.ceil(dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithDedicatedRocksDBDedicatedWAL=${dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithDedicatedRocksDBDedicatedWAL} / chassisArrayLocal[actualChassisID].nvmeToNVMe8=${chassisArrayLocal[actualChassisID].nvmeToNVMe8})`)
        dcConfigArrayLocal[dcItem].numberOfNVMe8Needed = Math.ceil(dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithoutDedicatedRocksDBDedicatedWAL / chassisArrayLocal[actualChassisID].nvmeToNVMe8) + Math.ceil(dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithDedicatedRocksDBDedicatedWAL / chassisArrayLocal[actualChassisID].nvmeToNVMe8)
        console.log(`dcConfigDetermineNumberOfMediaRequired() 462: [chassisID=${actualChassisID},DC=${dcItem}] #NVMe8 needed=${dcConfigArrayLocal[dcItem].numberOfNVMe8Needed}`)
      }
      console.log(`dcConfigDetermineNumberOfMediaRequired() 464: [chassisID=${actualChassisID},DC=${dcItem}] #NVMe8 needed=${dcConfigArrayLocal[dcItem].numberOfNVMe8Needed}`)

      // RGW cache media are dedicated and counted as they are
      dcConfigArrayLocal[dcItem].numberOfNVMe2Needed = localDCNumberOfRGWCacheMedia
      console.log(`dcConfigDetermineNumberOfMediaRequired() 470: [chassisID=${actualChassisID},DC=${dcItem}] #NVMe2 needed=${dcConfigArrayLocal[dcItem].numberOfNVMe2Needed}`)

      //// NOTE NOTE: we'll need to adjust the raw device capacity for any configuration by the correction factor of wasted space for objects and files if the avg object 
      ////            or file size is way off the min_alloc_size for the media. This should be done for replica and EC specifically !!!!
      ////            Way off means nothing specific but would be everything not aligning with min_alloc_size - even for small deviations, we can simply take it and don't need to 
      ////            distinguish between 'way off' and 'nearly matching'.

      // HDD:
      dcConfigArrayLocal[dcItem].numberOfHDDNeeded =  Math.ceil((dcConfigArrayLocal[dcItem].capacityNeededForHDD + localDCCorrectionForUnalignedObjectsHDD) / chassisArrayLocal[actualChassisID].sizeHDD1)
      console.log(`dcConfigDetermineNumberOfMediaRequired() 476: [chassisID=${actualChassisID},DC=${dcItem}] #HDD needed=${dcConfigArrayLocal[dcItem].numberOfHDDNeeded}`)
      ////  In addition, the additional capacity for placing the RocksDB on any media used for block must be added to the number of media required - for kinds of flash.         
      
      // SSD1:
      dcConfigArrayLocal[dcItem].numberOfSSD1NeededWithDedicatedRocksDBIncludingWAL =  localNumberOfSSDNeededDedicatedRocksDBIncludingWAL = Math.ceil((localSSDCapacityWithDedicatedRocksDBIncludingWAL + localDCCorrectionForUnalignedObjectsSSD1WithDedicatedRocksDBIncludingWAL) / chassisArrayLocal[actualChassisID].sizeSSD1)
      console.log(`dcConfigDetermineNumberOfMediaRequired() 480: [chassisID=${actualChassisID},DC=${dcItem}] dcConfigArrayLocal[dcItem].numberOfSSD1NeededWithDedicatedRocksDBIncludingWAL=${dcConfigArrayLocal[dcItem].numberOfSSD1NeededWithDedicatedRocksDBIncludingWAL} =  localNumberOfSSDNeededDedicatedRocksDBIncludingWAL=${localNumberOfSSDNeededDedicatedRocksDBIncludingWAL} = Math.ceil((localSSDCapacityWithDedicatedRocksDBIncludingWAL=${localSSDCapacityWithDedicatedRocksDBIncludingWAL} + localDCCorrectionForUnalignedObjectsSSD1WithDedicatedRocksDBIncludingWAL=${localDCCorrectionForUnalignedObjectsSSD1WithDedicatedRocksDBIncludingWAL}) / chassisArrayLocal[actualChassisID].sizeSSD1=${chassisArrayLocal[actualChassisID].sizeSSD1})`)
      dcConfigArrayLocal[dcItem].numberOfSSDNeeded = dcConfigArrayLocal[dcItem].numberOfSSD1NeededWithDedicatedRocksDBIncludingWAL
      console.log(`dcConfigDetermineNumberOfMediaRequired() 482: [chassisID=${actualChassisID},DC=${dcItem}]#SSD(sum) needed=${dcConfigArrayLocal[dcItem].numberOfSSDNeeded}`)
      
      dcConfigArrayLocal[dcItem].numberOfSSD1NeededWithDedicatedRocksDBDedicatedWAL =  localNumberOfSSDNeededDedicatedRocksDBDedicatedWAL = Math.ceil((localSSDCapacityWithDedicatedRocksDBDedicatedWAL + localDCCorrectionForUnalignedObjectsSSD1WithDedicatedRocksDBDedicatedWAL) / chassisArrayLocal[actualChassisID].sizeSSD1)
      console.log(`dcConfigDetermineNumberOfMediaRequired() 485: [chassisID=${actualChassisID},DC=${dcItem}] dcConfigArrayLocal[dcItem].numberOfSSD1NeededWithDedicatedRocksDBDedicatedWAL=${dcConfigArrayLocal[dcItem].numberOfSSD1NeededWithDedicatedRocksDBDedicatedWAL} =  localNumberOfSSDNeededDedicatedRocksDBDedicatedWAL=${localNumberOfSSDNeededDedicatedRocksDBDedicatedWAL} = Math.ceil((localSSDCapacityWithDedicatedRocksDBDedicatedWAL=${localSSDCapacityWithDedicatedRocksDBDedicatedWAL} + localDCCorrectionForUnalignedObjectsSSD1WithDedicatedRocksDBIncludingWAL=${localDCCorrectionForUnalignedObjectsSSD1WithDedicatedRocksDBIncludingWAL}) / chassisArrayLocal[actualChassisID].sizeSSD1=${chassisArrayLocal[actualChassisID].sizeSSD1})`)
      dcConfigArrayLocal[dcItem].numberOfSSDNeeded += dcConfigArrayLocal[dcItem].numberOfSSD1NeededWithDedicatedRocksDBDedicatedWAL
      console.log(`dcConfigDetermineNumberOfMediaRequired() 487: [chassisID=${actualChassisID},DC=${dcItem}]#SSD(sum) needed=${dcConfigArrayLocal[dcItem].numberOfSSDNeeded}`)
      
      dcConfigArrayLocal[dcItem].numberOfSSD1NeededWithoutDedicatedRocksDBDedicatedWAL = localNumberOfSSDNeededNonDedicatedRocksDBDedicatedWAL = Math.ceil((localSSDCapacityWithoutDedicatedRocksDBDedicatedWAL + localDCRocksDBSizeSSDWithoutDedicatedNVMeDedicatedWAL + localDCCorrectionForUnalignedObjectsSSD1WithoutDedicatedRocksDBDedicatedWAL) / chassisArrayLocal[actualChassisID].sizeSSD1)
      dcConfigArrayLocal[dcItem].numberOfSSDNeeded += dcConfigArrayLocal[dcItem].numberOfSSD1NeededWithoutDedicatedRocksDBDedicatedWAL
      console.log(`dcConfigDetermineNumberOfMediaRequired() 491: [chassisID=${actualChassisID},DC=${dcItem}]#SSD(sum) needed=${dcConfigArrayLocal[dcItem].numberOfSSDNeeded}`)

      dcConfigArrayLocal[dcItem].numberOfSSD1NeededWithoutDedicatedRocksDBNorWAL = localNumberOfSSDNeededNonDedicatedRocksDBNorWAL = Math.ceil((localSSDCapacityWithoutDedicatedRocksDBNorWAL + localDCRocksDBSizeSSDWithoutDedicatedNVMeNorWAL + localDCCorrectionForUnalignedObjectsSSD1WithoutDedicatedRocksDBNorWAL) / chassisArrayLocal[actualChassisID].sizeSSD1)
      dcConfigArrayLocal[dcItem].numberOfSSDNeeded += dcConfigArrayLocal[dcItem].numberOfSSD1NeededWithoutDedicatedRocksDBNorWAL
      console.log(`dcConfigDetermineNumberOfMediaRequired() 495: [chassisID=${actualChassisID},DC=${dcItem}]#SSD(sum) needed=${dcConfigArrayLocal[dcItem].numberOfSSDNeeded}`)

      console.log(`dcConfigDetermineNumberOfMediaRequired() 497: [chassisID=${actualChassisID},DC=${dcItem}] #SSD w/o NVMe nor dedicated WAL needed=${dcConfigArrayLocal[dcItem].numberOfSSD1NeededWithoutDedicatedRocksDBNorWAL}`)
      console.log(`dcConfigDetermineNumberOfMediaRequired() 498: [chassisID=${actualChassisID},DC=${dcItem}] #SSD w/o NVMe w/ dedicated WAL needed=${dcConfigArrayLocal[dcItem].numberOfSSD1NeededWithoutDedicatedRocksDBDedicatedWAL}`)
      console.log(`dcConfigDetermineNumberOfMediaRequired() 499: [chassisID=${actualChassisID},DC=${dcItem}] #SSD w/ NVMe dedicated w/o separate WAL needed=${dcConfigArrayLocal[dcItem].numberOfSSD1NeededWithDedicatedRocksDBIncludingWAL}`)
      console.log(`dcConfigDetermineNumberOfMediaRequired() 500: [chassisID=${actualChassisID},DC=${dcItem}] #SSD w/ NVMe dedicated w/ separate WAL needed=${dcConfigArrayLocal[dcItem].numberOfSSD1NeededWithDedicatedRocksDBDedicatedWAL}`)
      console.log(`dcConfigDetermineNumberOfMediaRequired() 501: [chassisID=${actualChassisID},DC=${dcItem}] #SSD(sum)) needed=${dcConfigArrayLocal[dcItem].numberOfSSDNeeded}`)

      // NVMe1
      dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithDedicatedRocksDBIncludingWAL =  localNumberOfNVMe1NeededDedicatedRocksDBIncludingWAL = Math.ceil((localNVMe1CapacityWithDedicatedRocksDBIncludingWAL + localDCCorrectionForUnalignedObjectsNVMe1WithDedicatedRocksDBIncludingWAL) / chassisArrayLocal[actualChassisID].sizeNVMe1)
      console.log(`dcConfigDetermineNumberOfMediaRequired() 505: [chassisID=${actualChassisID},DC=${dcItem}] dcConfigArrayLocal[dcItem].numberOfNMVe1NeededWithDedicatedRocksDBIncludingWAL=${dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithDedicatedRocksDBIncludingWAL} =  localNumberOfNVMe1NeededDedicatedRocksDBIncludingWAL=${localNumberOfNVMe1NeededDedicatedRocksDBIncludingWAL} = Math.ceil((localNVMe1CapacityWithDedicatedRocksDBIncludingWAL=${localNVMe1CapacityWithDedicatedRocksDBIncludingWAL} + localDCCorrectionForUnalignedObjectsNVMe1WithDedicatedRocksDBIncludingWAL=${localDCCorrectionForUnalignedObjectsNVMe1WithDedicatedRocksDBIncludingWAL}) / chassisArrayLocal[actualChassisID].sizeNVMe7=${chassisArrayLocal[actualChassisID].sizeNVMe1})`)
      dcConfigArrayLocal[dcItem].numberOfNVMe1Needed = dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithDedicatedRocksDBIncludingWAL

      dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithDedicatedRocksDBDedicatedWAL =  localNumberOfNVMe1NeededDedicatedRocksDBDedicatedWAL = Math.ceil((localNVMe1CapacityWithDedicatedRocksDBDedicatedWAL + localDCCorrectionForUnalignedObjectsNVMe1WithDedicatedRocksDBDedicatedWAL) / chassisArrayLocal[actualChassisID].sizeNVMe1)
      console.log(`dcConfigDetermineNumberOfMediaRequired() 509: [chassisID=${actualChassisID},DC=${dcItem}] dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithDedicatedRocksDBDedicatedWAL=${dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithDedicatedRocksDBDedicatedWAL} =  localNumberOfNVMe1NeededDedicatedRocksDBDedicatedWAL=${localNumberOfNVMe1NeededDedicatedRocksDBDedicatedWAL} = Math.ceil((localNVMe1CapacityWithDedicatedRocksDBDedicatedWAL=${localNVMe1CapacityWithDedicatedRocksDBDedicatedWAL} + localDCCorrectionForUnalignedObjectsNVMe1WithDedicatedRocksDBIncludingWAL=${localDCCorrectionForUnalignedObjectsNVMe1WithDedicatedRocksDBIncludingWAL}) / chassisArrayLocal[actualChassisID].sizeSSD1=${chassisArrayLocal[actualChassisID].sizeNVMe1})`)
      dcConfigArrayLocal[dcItem].numberOfNVMe1Needed += dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithDedicatedRocksDBDedicatedWAL
      
      dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithoutDedicatedRocksDBDedicatedWAL = localNumberOfNVMe1NeededNonDedicatedRocksDBDedicatedWAL = Math.ceil((localNVMe1CapacityWithoutDedicatedRocksDBDedicatedWAL + localDCRocksDBSizeNVMe1WithoutDedicatedNVMeDedicatedWAL + localDCCorrectionForUnalignedObjectsNVMe1WithoutDedicatedRocksDBDedicatedWAL + localDCRequiredIndexCapacityOnNVMe1DedicatedWAL) / chassisArrayLocal[actualChassisID].sizeNVMe1)
      dcConfigArrayLocal[dcItem].numberOfNVMe1Needed += dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithoutDedicatedRocksDBNorWAL

      dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithoutDedicatedRocksDBNorWAL = localNumberOfNVMe1NeededNonDedicatedRocksDBNorWAL = Math.ceil((localNVMe1CapacityWithoutDedicatedRocksDBNorWAL + localDCRocksDBSizeNVMe1WithoutDedicatedNVMeNorWAL + localDCCorrectionForUnalignedObjectsNVMe1WithoutDedicatedRocksDBNorWAL + localDCRequiredIndexCapacityOnNVMe1NorWAL) / chassisArrayLocal[actualChassisID].sizeNVMe1)
      dcConfigArrayLocal[dcItem].numberOfNVMe1Needed += dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithoutDedicatedRocksDBNorWAL

      console.log(`dcConfigDetermineNumberOfMediaRequired() 518: [chassisID=${actualChassisID},DC=${dcItem}] #NVMe1 w/o NVMe nor dedicated WAL needed=${dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithoutDedicatedRocksDBNorWAL}`)
      console.log(`dcConfigDetermineNumberOfMediaRequired() 519: [chassisID=${actualChassisID},DC=${dcItem}] #NVMe1 w/o NVMe w/ dedicated WAL needed=${dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithoutDedicatedRocksDBDedicatedWAL}`)
      console.log(`dcConfigDetermineNumberOfMediaRequired() 520: [chassisID=${actualChassisID},DC=${dcItem}] #NVMe1 w/ NVMe dedicated w/o separate WAL needed=${dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithDedicatedRocksDBIncludingWAL}`)
      console.log(`dcConfigDetermineNumberOfMediaRequired() 521: [chassisID=${actualChassisID},DC=${dcItem}] #NVMe1 w/ NVMe dedicated w/ separate WAL needed=${dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithDedicatedRocksDBDedicatedWAL}`)
      console.log(`dcConfigDetermineNumberOfMediaRequired() 522: [chassisID=${actualChassisID},DC=${dcItem}] #NVMe1(sum)) needed=${dcConfigArrayLocal[dcItem].numberOfNVMe1Needed}`)
    
      // determine the number of dedicated WAL devices for SSD (aka previously known as Optanes)
      if (chassisArrayLocal[actualChassisID].useOptane1 === true) {
        console.log(`dcConfigDetermineNumberOfMediaRequired() 526: [chassisID=${actualChassisID},DC=${dcItem}] NVMe3 needed`)
        let interrimOptaneNumberPerRatioDedicated = 0
        let interrimOptaneNumberPerCapacityDedicated = 0
        let interrimOptaneNumberPerRatioNonDedicatedRocksDB = 0
        let interrimOptaneNumberPerCapacityNonDedicatedRocksDB = 0
        // WAL device could be shared also between SSD with and without separate RocksDB (for economical reasons not be split further) - this might become selectable in the future but 
        // actually it's split
        interrimOptaneNumberPerRatioDedicated = Math.ceil(localNumberOfSSDNeededDedicatedRocksDBDedicatedWAL / chassisArrayLocal[actualChassisID].ssdToOptane)
        interrimOptaneNumberPerCapacityDedicated = Math.ceil(localNumberOfSSDNeededDedicatedRocksDBDedicatedWAL * sizingConstraints.sizeOfWALOnNVMeInGB / chassisArrayLocal[actualChassisID].sizeOptane1)
        interrimOptaneNumberPerRatioNonDedicatedRocksDB = Math.ceil(localNumberOfSSDNeededNonDedicatedRocksDBDedicatedWAL / chassisArrayLocal[actualChassisID].ssdToOptane)
        interrimOptaneNumberPerCapacityNonDedicatedRocksDB = Math.ceil(localNumberOfSSDNeededNonDedicatedRocksDBDedicatedWAL * sizingConstraints.sizeOfWALOnNVMeInGB / chassisArrayLocal[actualChassisID].sizeOptane1)
        // The higher number of devices as per either the matching number of devices per fronted flash device
        // or per capacity provided per device - first for flash devices with dedicated RocksDB
        if (interrimOptaneNumberPerRatioDedicated >= interrimOptaneNumberPerCapacityDedicated) {
          dcConfigArrayLocal[dcItem].numberOfNVMe3Needed = interrimOptaneNumberPerRatioDedicated
        }
        else {
          dcConfigArrayLocal[dcItem].numberOfNVMe3Needed = interrimOptaneNumberPerCapacityDedicated
        }
        // ... and then add the number needed for flash devices without dedicated RocksDB
        if (interrimOptaneNumberPerRatioNonDedicatedRocksDB >= interrimOptaneNumberPerCapacityNonDedicatedRocksDB) {
          dcConfigArrayLocal[dcItem].numberOfNVMe3Needed += interrimOptaneNumberPerRatioNonDedicatedRocksDB
        }
        else {
          dcConfigArrayLocal[dcItem].numberOfNVMe3Needed += interrimOptaneNumberPerCapacityNonDedicatedRocksDB
        }
        console.log(`dcConfigDetermineNumberOfMediaRequired() 552: [chassisID=${actualChassisID},DC=${dcItem}] NVMe3 needed=${dcConfigArrayLocal[dcItem].numberOfNVMe3Needed}`)
      }

      // NVMe7 for NVMe1
      dcConfigArrayLocal[dcItem].numberOfNVMe7Needed = Math.ceil((dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithDedicatedRocksDBDedicatedWAL * (sizingConstraints.defaultSizeOfWALOnNVMeInGB / 1000) +  localDCRequiredIndexCapacityOnNVMe7DedicatedWAL) / chassisArrayLocal[actualChassisID].sizeNVMe7) + Math.ceil((dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithDedicatedRocksDBIncludingWAL* (sizingConstraints.defaultSizeOfWALOnNVMeInGB / 1000) + localDCRequiredIndexCapacityOnNVMe7IncludingWAL) / chassisArrayLocal[actualChassisID].sizeNVMe7)
      console.log(`dcConfigDetermineNumberOfMediaRequired() 589: [chassisID=${actualChassisID},DC=${dcItem}] #NVMe7 needed=${dcConfigArrayLocal[dcItem].numberOfNVMe7Needed}`)
      if (dcConfigArrayLocal[dcItem].numberOfNVMe7Needed < (Math.ceil(dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithDedicatedRocksDBDedicatedWAL / chassisArrayLocal[actualChassisID].nvmeToNVMe7) + Math.ceil(dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithDedicatedRocksDBIncludingWAL / chassisArrayLocal[actualChassisID].nvmeToNVMe7) )){
        // The number of media required based on capacity is not sufficient - would need to add more NVMe for the actual required number of NVMe1 to front.
        console.log(`dcConfigDetermineNumberOfMediaRequired() 592: [chassisID=${actualChassisID},DC=${dcItem}] #NVMe7 needed=${dcConfigArrayLocal[dcItem].numberOfNVMe7Needed} < Math.ceil(dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithDedicatedRocksDBDedicatedWAL=${dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithDedicatedRocksDBDedicatedWAL} / chassisArrayLocal[actualChassisID].nvmeToNVMe7=${chassisArrayLocal[actualChassisID].nvmeToNVMe7}) + Math.ceil(dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithDedicatedRocksDBIncludingWAL=${dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithDedicatedRocksDBIncludingWAL} / chassisArrayLocal[actualChassisID].nvmeToNVMe7=${chassisArrayLocal[actualChassisID].nvmeToNVMe7})`)
        dcConfigArrayLocal[dcItem].numberOfNVMe7Needed = Math.ceil(dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithDedicatedRocksDBDedicatedWAL / chassisArrayLocal[actualChassisID].nvmeToNVMe7) + Math.ceil(dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithDedicatedRocksDBIncludingWAL / chassisArrayLocal[actualChassisID].nvmeToNVMe7)
        console.log(`dcConfigDetermineNumberOfMediaRequired() 594: [chassisID=${actualChassisID},DC=${dcItem}] #NVMe7 needed=${dcConfigArrayLocal[dcItem].numberOfNVMe7Needed}`)
      }
      console.log(`dcConfigDetermineNumberOfMediaRequired() 596: [chassisID=${actualChassisID},DC=${dcItem}] #NVMe7 needed=${dcConfigArrayLocal[dcItem].numberOfNVMe7Needed}`)

      
      // We'll use actuallty somewhere numberOfSSDNeeded - so collect all SSD
      //= localNumberOfSSDNeededDedicatedRocksDBDedicatedWAL + localNumberOfSSDNeededDedicatedRocksDBDedicatedWAL + localNumberOfSSDNeededNonDedicatedRocksDBDedicatedWAL + localNumberOfSSDNeededNonDedicatedRocksDBDedicatedWAL + dcConfigArrayLocal[dcItem].numberOfSSD4Needed

      // This should now have all media covered for this DC.
      if (generalValuesLocal.globalDebug == true || localDebug == true) {
        console.log(`dcConfigDetermineNumberOfMediaRequired() 604: [chassisID=${actualChassisID},DC=${dcItem}] DC=${dcItem} => #media HDD=${dcConfigArrayLocal[dcItem].numberOfHDDNeeded}, SSDw/dedicated=${dcConfigArrayLocal[dcItem].numberOfSSD1NeededWithDedicatedRocksDBIncludingWAL}, SSDw/oDedicated=${dcConfigArrayLocal[dcItem].numberOfSSD1NeededWithoutDedicatedRocksDBNorWAL}, #SSD for data =${dcConfigArrayLocal[dcItem].numberOfSSDNeeded}, #SSD4=${dcConfigArrayLocal[dcItem].numberOfSSD4Needed}`)
        console.log(`dcConfigDetermineNumberOfMediaRequired() 605: [chassisID=${actualChassisID},DC=${dcItem}] DC=${dcItem} => #media NVMe1=${dcConfigArrayLocal[dcItem].numberOfNVMe1Needed}, NVMe2=${dcConfigArrayLocal[dcItem].numberOfNVMe2Needed}, NVMe3=${dcConfigArrayLocal[dcItem].numberOfNVMe3Needed}, NVMe4=${dcConfigArrayLocal[dcItem].numberOfNVMe4Needed}, NVMe5=${dcConfigArrayLocal[dcItem].numberOfNVMe5Needed}, NVMe6=${dcConfigArrayLocal[dcItem].numberOfNVMe6Needed}, NVMe7=${dcConfigArrayLocal[dcItem].numberOfNVMe7Needed}, NVMe8=${dcConfigArrayLocal[dcItem].numberOfNVMe8Needed}`)
      }
    }
  }
}

export default dcConfigDetermineNumberOfMediaRequired