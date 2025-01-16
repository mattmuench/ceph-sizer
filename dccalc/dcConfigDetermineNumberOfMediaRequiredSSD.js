const dcConfigDetermineNumberOfMediaRequired = function (generalValuesLocal, workloadsArrayLocal, sizingConstraints, dcConfigArrayLocal, chassisArrayLocal, actualChassisID, mediaType, mediaName) {
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
      let localDCCorrectionForUnalignedObjectsHDD = 0  // additional capacity to be taken into account for unaligned object payload data allocation on media
      
      
      
      let localDCCorrectionForUnalignedObjectsSSD1WithDedicatedRocksDBIncludingWAL = 0  // additional capacity to be taken into account for unaligned object payload data allocation on media 
      let localDCCorrectionForUnalignedObjectsSSD1WithDedicatedRocksDBDedicatedWAL = 0  // additional capacity to be taken into account for unaligned object payload data allocation on media 
      let localDCCorrectionForUnalignedObjectsSSD1WithoutDedicatedRocksDBNorWAL = 0  // additional capacity to be take into account for unaligned object payload data allocation on media
      let localDCCorrectionForUnalignedObjectsSSD1WithoutDedicatedRocksDBDedicatedWAL = 0  // additional capacity to be take into account for unaligned object payload data allocation on media
      
      let localDCCorrectionForUnalignedObjectsNVMe1WithDedicatedRocksDBIncludingWAL = 0  // additional capacity to be taken into account for unaligned object payload data allocation on media
      let localDCCorrectionForUnalignedObjectsNVMe1WithDedicatedRocksDBDedicatedWAL = 0  // additional capacity to be taken into account for unaligned object payload data allocation on media
      let localDCCorrectionForUnalignedObjectsNVMe1WithoutDedicatedRocksDBNorWAL = 0  // additional capacity to be take into account for unaligned object payload data allocation on media
      let localDCCorrectionForUnalignedObjectsNVMe1WithoutDedicatedRocksDBDedicatedWAL = 0  // additional capacity to be take into account for unaligned object payload data allocation on media
      
      let localDCCorrectionForUnalignedObjectsNVMe1 = 0  // UNUSED yet: additional capacity to be taken into account for unaligned object payload data allocation on media
                                                       // => need to apply further config options for selecting type of flash for the workload
      let localSSDCapacityWithDedicatedRocksDB = 0 // Any flash (portion of the) workload could be configured using the same media or using dedicated RocksDB media - would need different number of media 
      let localSSDCapacityWithoutDedicatedRocksDB = 0 // Any flash (portion of the) workload could be configured using the same media or using dedicated RocksDB media - would need different number of media 
      let localSSDAddCapacityWithOutDedicatedRocksDB = 0 // Any flash (portion of the) workload could be configured using the same media or using dedicated RocksDB media - would need this capacity on separate media
      //  The following is (might be now) used since the NVMe can have a dedicated NVMe type 7 as location for WAL and the NVMe might not always use the same media for placing the RocksDB
      let localNVMe1CapacityWithDedicatedRocksDB = 0 // Any flash (portion of the) workload could be configured using the same media or using dedicated RocksDB media - would need different number of media 
      let localNVMe1CapacityWithoutDedicatedRocksDB = 0 // Any flash (portion of the) workload could be configured using the same media or using dedicated RocksDB media - would need different number of media 
      let localNVMe1AddCapacityWithDedicatedRocksDB = 0 // Any flash (portion of the) workload could be configured using the same media or using dedicated RocksDB media - would need this capacity on separate media
      let localNVMe1AddCapacityWithOutDedicatedRocksDB = 0 // Any flash (portion of the) workload could be configured using the same media or using dedicated RocksDB media - would need this capacity on separate media

      let localDCRocksDBSizeHDD = 0
      let localDCRocksDBSizeSSDWithDedicatedNVMe = 0  // RocksDB goes to separate media
      let localDCRocksDBSizeSSDWithoutDedicatedNVMe = 0 // RocksDB is on block media
      let localDCRocksDBSizeNVMe1WithDedicatedNVMe = 0 
      let localDCRocksDBSizeNVMe1WithoutDedicatedNVMe = 0
      
      // all the following don't use a dedicated device for WAL
      let localNumberOfSSDNeededDedicatedRocksDBIncludingWAL = 0
      let localNumberOfSSDNeededDedicatedRocksDBDedicatedWAL = 0
      let localNumberOfSSDNeededNonDedicatedRocksDBNorWAL = 0
      let localNumberOfSSDNeededNonDedicatedRocksDBDedicatedWAL = 0

      let localNumberOfNVMe1NeededDedicatedRocksDB = 0
      let localNumberOfNVMe1NeededNonDedicatedRocksDB = 0
      // all these use a dedicated device for WAL, independent of the actual separation of RocksDB onto another dedicated media
      let localNumberOfSSDNeededDedicatedRocksDBSepWAL = 0
      let localNumberOfSSDNeededNonDedicatedRocksDBSepWAL = 0
      let localNumberOfNVMe1NeededDedicatedRocksDBSepWAL = 0
      let localNumberOfNVMe1NeededNonDedicatedRocksDBSepWAL = 0

      // processing the workloads and calculating the number of capacity needed for each config case
      for (let workloadItem = 0; workloadItem < generalValuesLocal.numberOfWorkloadsPossible; workloadItem++) {

        let localDCObjectIndexCapacity = 0 // takes all the actual index capacity required for the workload to be processed into the different locations
        let localWorkloadCorrectionForUnalignedObjectsHDD = 0
        let localWorkloadCorrectionForUnalignedObjectsSSD = 0
        let localWorkloadCorrectionForUnalignedObjectsNVMe1 = 0

        let localWorkloadRocksDBSizeHDD = 0
        let localWorkloadRocksDBSizeSSDWithDedicatedNVMeIncludingWAL = 0 // NVMe for placing RocksDB but no separate WAL
        let localWorkloadRocksDBSizeSSDWithDedicatedNVMeDedicatedWAL = 0 // NVMe for placing RocksDB+WAL
        let localWorkloadRocksDBSizeSSDWithoutDedicatedNVMeNorWAL = 0 // NVMe for no separate RocksDB and no separated WAL
        let localWorkloadRocksDBSizeSSDWithoutDedicatedNVMeDedicatedWAL = 0 // NVMe for for no separate RocksDB but separated WAL

        let localWorkloadRocksDBSizeNVMe1WithDedicatedNVMe = 0 // see above, not used for NVMe type 1 - NVMe for placing RocksDB+WAL
        let localWorkloadRocksDBSizeNVMe1WithoutDedicatedNVMe = 0 // no additional NVMe for placing RocksDB - WAL might go to NVMe type 7
        

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
            console.log(`dcConfigDetermineNumberOfMediaRequired() 100: [chassisID=${actualChassisID},workloadID=${workloadItem},DC=${dcItem}] workload in ACTUAL DC #${dcItem} and is type ${workloadsArrayLocal[workloadItem].useCase}`)
            if (workloadsArrayLocal[workloadItem].sumNumberDC === 1) {
              localDCObjectIndexCapacity = workloadsArrayLocal[workloadItem].reqCapacityNet * 1000*1000*1000*1000/(workloadsArrayLocal[workloadItem].sizeAvgObj * 1024) * sizingConstraints.expectedAverageEntrySizeInObjectIndexInBytes / 1024/1024/1024/1024 * workloadsArrayLocal[workloadItem].selectorRGWLifecycleNumVersions * sizingConstraints.requiredNumberOfReplicaForObjectIndex / workloadsArrayLocal[workloadItem].sumNumberDC
              console.log(`dcConfigDetermineNumberOfMediaRequired() 103: [chassisID=${actualChassisID},workloadID=${workloadItem},DC=${dcItem}] workload ONLY in ACTUAL DC #${dcItem} and needed capacity for object index=${localDCObjectIndexCapacity}`)
            }
            else {
              localDCObjectIndexCapacity = workloadsArrayLocal[workloadItem].reqCapacityNet * 1000*1000*1000*1000/(workloadsArrayLocal[workloadItem].sizeAvgObj * 1024) * sizingConstraints.expectedAverageEntrySizeInObjectIndexInBytes / 1024/1024/1024/1024 * workloadsArrayLocal[workloadItem].selectorRGWLifecycleNumVersions * workloadsArrayLocal[workloadItem].reqNumReplica / workloadsArrayLocal[workloadItem].sumNumberDC
              console.log(`dcConfigDetermineNumberOfMediaRequired() 107: [chassisID=${actualChassisID},workloadID=${workloadItem},DC=${dcItem}] workloadsArrayLocal[workloadItem].sizeAvgObj=${workloadsArrayLocal[workloadItem].sizeAvgObj}`)
              console.log(`dcConfigDetermineNumberOfMediaRequired() 108: [chassisID=${actualChassisID},workloadID=${workloadItem},DC=${dcItem}] workload NOT ONLY in ACTUAL DC #${dcItem} and needed capacity for object index=${localDCObjectIndexCapacity}`)

            }

            // Determine desired configuration for object index and add capacity to where needed.
            console.log(`dcConfigDetermineNumberOfMediaRequired() 113: [chassisID=${actualChassisID},workloadID=${workloadItem},DC=${dcItem}] rgw workload in DC#${dcItem} selected capacity for dedicated object index=${workloadsArrayLocal[workloadItem].selectorRGWIndexDedicatedFlashPool}`)
            if (workloadsArrayLocal[workloadItem].selectorRGWIndexDedicatedFlashPool === true) {
              // if this is set it's for both HDD and flash based portions of the worklod - it's always going to the separate index pool and we need to collect how much capacity is needed
              // for this pool. The amount needed for raw will be already calculated by this because we'll apply the required replication and the number of DCs used for the workload.
              // The media type would be NVMe6 .
              localDCDedicatedObjectIndexCapacity += localDCObjectIndexCapacity
              console.log(`dcConfigDetermineNumberOfMediaRequired() 119: [chassisID=${actualChassisID},workloadID=${workloadItem},DC=${dcItem}] rgw workload in DC#${dcItem} needs capacity for dedicated object index=${localDCDedicatedObjectIndexCapacity}`)
            }
            else {
              // There is no general desire for the actual workload to use a dedicated index pool. HDD would require a hybrid config (for the default use, anyways) and would need to add the capacity to the RocksDB capacity space.
              // Depending on the SSD/NVMe configuration, a separate space might be needed for the data portion or on a dedicated media for RocksDB.
              console.log(`dcConfigDetermineNumberOfMediaRequired() 124: [chassisID=${actualChassisID},workloadID=${workloadItem},DC=${dcItem}] rgw workload in DC#${dcItem} no dedicated index pool`)
              if (workloadsArrayLocal[workloadItem].SSDdedicatedNVMe == true) {
                // Reserve additional space on RocksDB dedicated NVMe (type 5)
                localDCRequiredIndexCapacityOnNVMe5 += localDCObjectIndexCapacity * workloadsArrayLocal[workloadItem].reqFlashPercent / 100
                console.log(`dcConfigDetermineNumberOfMediaRequired() 129: [chassisID=${actualChassisID},workloadID=${workloadItem},DC=${dcItem}] rgw workload in DC#${dcItem} needs index pool on dedicated NVMe for HDD(NVMe4):${localDCRequiredIndexCapacityOnNVMe4}, SSD(NVMe5):${localDCRequiredIndexCapacityOnNVMe5}`)
              }
              else {
                
                
                  if (workloadsArrayLocal[workloadItem].selectorSSDDedicatedNVMe == true) {
                    localSSDAddCapacityWithOutDedicatedRocksDB += localDCObjectIndexCapacity * workloadsArrayLocal[workloadItem].reqFlashPercent / 100
                  }
                  else {
                    localSSDAddCapacityWithOutDedicatedRocksDB += localDCObjectIndexCapacity * workloadsArrayLocal[workloadItem].reqFlashPercent / 100
                  }
                
                console.log(`dcConfigDetermineNumberOfMediaRequired() 140: [chassisID=${actualChassisID},workloadID=${workloadItem},DC=${dcItem}] rgw workload in DC#${dcItem} - no dedicated index NVMe - needs additional capacity on RocksDB(NVMe5):${localDCRequiredIndexCapacityOnNVMe5}, SSD(same media):${localSSDAddCapacityWithOutDedicatedRocksDB}`)
              }
            }

            // Determine the need of RGW dedicated cache and sum up a dedicated media per workload and minNumber of instances for RGW per workload
            if (workloadsArrayLocal[workloadItem].selectorRGWCache === true) {
              localDCNumberOfRGWCacheMedia += minNumberOfInstancesRoleRGW
              console.log(`dcConfigDetermineNumberOfMediaRequired() 147: [chassisID=${actualChassisID},workloadID=${workloadItem},DC=${dcItem}] RGW cache media needed=${localDCNumberOfRGWCacheMedia}`)
            }

            // distinguish between normal and dedicated RocksDB media - 
            // SSD
            localWorkloadCorrectionForUnalignedObjectsSSD = (((workloadsArrayLocal[workloadItem].sizeAvgObj*1024) % sizingConstraints.fixedMinAllocSizeOnMediaSSD) / (workloadsArrayLocal[workloadItem].sizeAvgObj*1024)) * workloadsArrayLocal[workloadItem].reqCapacityGrossSSD / workloadsArrayLocal[workloadItem].sumNumberDC
            if (workloadsArrayLocal[workloadItem].selectorSSDDedicatedNVMe === true) {
              if (workloadsArrayLocal[workloadItem].selectorSSDDedicatedNVMeForWAL === ture ) {
                localDCCorrectionForUnalignedObjectsNVMe1WithDedicatedRocksDBDedicatedWAL += localWorkloadCorrectionForUnalignedObjectsSSD
              }
              else {
                localDCCorrectionForUnalignedObjectsSSD1WithDedicatedRocksDBIncludingWAL += localWorkloadCorrectionForUnalignedObjectsSSD
              }
              
            }
            else {
              if (workloadsArrayLocal[workloadItem].selectorSSDDedicatedNVMeForWAL === ture ) {
                localDCCorrectionForUnalignedObjectsNVMe1WithoutDedicatedRocksDBDedicatedWAL += localWorkloadCorrectionForUnalignedObjectsSSD
              }
              else {
                localDCCorrectionForUnalignedObjectsSSD1WithoutDedicatedRocksDBNorWAL += localWorkloadCorrectionForUnalignedObjectsSSD
              }
              
            }
            
            
            /// All should be done here for specifics of RGW workloads.
            console.log(`dcConfigDetermineNumberOfMediaRequired() 172: [chassisID=${actualChassisID},workloadID=${workloadItem},DC=${dcItem}] local capacity correction unaligned RGW object parts - for SSD w/ =${localDCCorrectionForUnalignedObjectsSSD1WithDedicatedRocksDBIncludingWAL}, for SSD w/o dedicated=${localDCCorrectionForUnalignedObjectsSSD1WithoutDedicatedRocksDBNorWAL}`)
          }    

          // CephFS workloads
          if (workloadsArrayLocal[workloadItem].selectorArrayDC[dcItem] === true && workloadsArrayLocal[workloadItem].useCase === "filedata" ) { 
            // Apply corrections to cephfs use cases based on avg object size
            // Both values in TB. Since the value of gross capacity for the workload is not reflecting the capacity distribution across DCs, the number of DCs in use for the workload needs to be 
            //   taken into account, since this here is reflecting the actual needed capacity on the media inside a specific DC - for all individual workloads.

            // SSD
            localWorkloadCorrectionForUnalignedObjectsSSD = (((workloadsArrayLocal[workloadItem].sizeAvgFile*1024) % sizingConstraints.fixedMinAllocSizeOnMediaSSD) / (workloadsArrayLocal[workloadItem].sizeAvgFile*1024)) * workloadsArrayLocal[workloadItem].reqCapacityGrossSSD / workloadsArrayLocal[workloadItem].sumNumberDC
            if (workloadsArrayLocal[workloadItem].selectorDedicatedNVMe === true) {
              localDCCorrectionForUnalignedObjectsSSD1WithDedicatedRocksDBIncludingWAL += localWorkloadCorrectionForUnalignedObjectsSSD
            }
            else {
              localDCCorrectionForUnalignedObjectsSSD1WithoutDedicatedRocksDBNorWAL += localWorkloadCorrectionForUnalignedObjectsSSD
            }
            
            console.log(`dcConfigDetermineNumberOfMediaRequired() 197: [chassisID=${actualChassisID},workloadID=${workloadItem},DC=${dcItem}] local capacity correction unaligned file parts - for SSD w/o=${localDCCorrectionForUnalignedObjectsSSD1WithoutDedicatedRocksDBNorWAL}, for SSDw/dedicated=${localDCCorrectionForUnalignedObjectsSSD1WithDedicatedRocksDBIncludingWAL}`)
          }

          // RocksDB size must be calculated for any case: based on raw capacity needed per for the workload in the DC plus the correction for unaligned data or data portions - then decide where this additional
          //   capacity should go to: either dedicated media or the block device (for flash storage)
          // for flash: distinguish between normal and dedicated RocksDB media - also assign here the required SSD capacity to one of the two groups
          // of dedicated vs non-dedicated media for RocksDB
          if (workloadsArrayLocal[workloadItem].selectorSSDDedicatedNVMe === true) {
            if (workloadsArrayLocal[workloadItem].selectorSSDDedicatedNVMeForWAL === true) {
              localNumberOfSSDNeededDedicatedRocksDBDedicatedWAL = workloadsArrayLocal[workloadItem].reqCapacityGrossSSD / workloadsArrayLocal[workloadItem].sumNumberDC * workloadsArrayLocal[workloadItem].rocksDBSpaceInPercent / 100 + localWorkloadCorrectionForUnalignedObjectsSSD
              localDCRocksDBSizeSSDWithDedicatedNVMe += localNumberOfSSDNeededDedicatedRocksDBDedicatedWAL
              console.log(`dcConfigDetermineNumberOfMediaRequired() 227: [chassisID=${actualChassisID},workloadID=${workloadItem},DC=${dcItem}] CHECK RocksDB dedicated NVMe with separate WAL: ${workloadsArrayLocal[workloadItem].reqCapacityGrossSSD } / ${workloadsArrayLocal[workloadItem].sumNumberDC} * ${workloadsArrayLocal[workloadItem].rocksDBSpaceInPercent} / 100 + ${localWorkloadCorrectionForUnalignedObjectsSSD}`)
            }
            else {
              localNumberOfSSDNeededDedicatedRocksDBIncludingWAL = workloadsArrayLocal[workloadItem].reqCapacityGrossSSD / workloadsArrayLocal[workloadItem].sumNumberDC * workloadsArrayLocal[workloadItem].rocksDBSpaceInPercent / 100 + localWorkloadCorrectionForUnalignedObjectsSSD
              localDCRocksDBSizeSSDWithDedicatedNVMe += localWorkloadRocksDBSizeSSDWithDedicatedNVMeIncludingWAL
              console.log(`dcConfigDetermineNumberOfMediaRequired() 227: [chassisID=${actualChassisID},workloadID=${workloadItem},DC=${dcItem}] CHECK RocksDB dedicated NVMe without separate WAL: ${workloadsArrayLocal[workloadItem].reqCapacityGrossSSD } / ${workloadsArrayLocal[workloadItem].sumNumberDC} * ${workloadsArrayLocal[workloadItem].rocksDBSpaceInPercent} / 100 + ${localWorkloadCorrectionForUnalignedObjectsSSD}`)
            }
            localSSDCapacityWithDedicatedRocksDB += workloadsArrayLocal[workloadItem].reqCapacityGrossSSD / workloadsArrayLocal[workloadItem].sumNumberDC
          }
          else {
            if (workloadsArrayLocal[workloadItem].selectorSSDDedicatedNVMeForWAL === true) {
              localNumberOfSSDNeededNonDedicatedRocksDBDedicatedWAL = workloadsArrayLocal[workloadItem].reqCapacityGrossSSD / workloadsArrayLocal[workloadItem].sumNumberDC * workloadsArrayLocal[workloadItem].rocksDBSpaceInPercent / 100 + localWorkloadCorrectionForUnalignedObjectsSSD
              localDCRocksDBSizeSSDWithoutDedicatedNVMe += localNumberOfSSDNeededDedicatedRocksDBDedicatedWAL
              console.log(`dcConfigDetermineNumberOfMediaRequired() 227: [chassisID=${actualChassisID},workloadID=${workloadItem},DC=${dcItem}] CHECK RocksDB no dedicated NVMe with separate WAL: ${workloadsArrayLocal[workloadItem].reqCapacityGrossSSD } / ${workloadsArrayLocal[workloadItem].sumNumberDC} * ${workloadsArrayLocal[workloadItem].rocksDBSpaceInPercent} / 100 + ${localWorkloadCorrectionForUnalignedObjectsSSD}`)
            }
            else {
              localNumberOfSSDNeededNonDedicatedRocksDBNorWAL = workloadsArrayLocal[workloadItem].reqCapacityGrossSSD / workloadsArrayLocal[workloadItem].sumNumberDC * workloadsArrayLocal[workloadItem].rocksDBSpaceInPercent / 100 + localWorkloadCorrectionForUnalignedObjectsSSD
              localDCRocksDBSizeSSDWithoutDedicatedNVMe += localWorkloadRocksDBSizeSSDWithDedicatedNVMeIncludingWAL
              console.log(`dcConfigDetermineNumberOfMediaRequired() 227: [chassisID=${actualChassisID},workloadID=${workloadItem},DC=${dcItem}] CHECK RocksDB no dedicated NVMe without separate WAL: ${workloadsArrayLocal[workloadItem].reqCapacityGrossSSD } / ${workloadsArrayLocal[workloadItem].sumNumberDC} * ${workloadsArrayLocal[workloadItem].rocksDBSpaceInPercent} / 100 + ${localWorkloadCorrectionForUnalignedObjectsSSD}`)
            }
            localSSDCapacityWithoutDedicatedRocksDB += workloadsArrayLocal[workloadItem].reqCapacityGrossSSD / workloadsArrayLocal[workloadItem].sumNumberDC
          }
          console.log(`dcConfigDetermineNumberOfMediaRequired() 240: [chassisID=${actualChassisID},workloadID=${workloadItem},DC=${dcItem}] local capacity corrected of RocksDB space for unaligned data parts - for SSD w/dedicated=${localDCRocksDBSizeSSDWithDedicatedNVMe}`)
          console.log(`dcConfigDetermineNumberOfMediaRequired() 241: [chassisID=${actualChassisID},workloadID=${workloadItem},DC=${dcItem}] local capacity corrected of RocksDB space for unaligned data parts - for SSD w/o=${localDCRocksDBSizeSSDWithoutDedicatedNVMe}`)
        } 
        // End of DC with capacity assigned - ingoring DCs without capacity asigned
      }
      // End of processing the workloads and calculating the number of capacity needed for each config case


      ///////// TODO - continue on removing HDD and NVMe1 from this file. 
      ///////// TODO - check whether an assignment of any value to an external array would overwrite prvious value without adding it
      /// The specific size of media should come from a specific chassisConfig.
      // Media for dedicated index pool in DC
      console.log(`dcConfigDetermineNumberOfMediaRequired() 250: [chassisID=${actualChassisID},DC=${dcItem}] actualChassisID=${actualChassisID}, chassisArrayLocal[actualChassisID].chassisID=${chassisArrayLocal[actualChassisID].chassisID}, maxHDDSlots=${chassisArrayLocal[actualChassisID].maxHDDSlots}`)
      dcConfigArrayLocal[dcItem].numberOfNVMe6Needed = Math.ceil(localDCDedicatedObjectIndexCapacity / chassisArrayLocal[actualChassisID].sizeNVMe6)
      console.log(`dcConfigDetermineNumberOfMediaRequired() 252: [chassisID=${actualChassisID},DC=${dcItem}] localDCDedicatedObjectIndexCapacity=${localDCDedicatedObjectIndexCapacity} / chassisArrayLocal[actualChassisID].sizeNVMe6 ${chassisArrayLocal[actualChassisID].sizeNVMe6}`)
      console.log(`dcConfigDetermineNumberOfMediaRequired() 253: [chassisID=${actualChassisID},DC=${dcItem}] #NVMe6 needed=${dcConfigArrayLocal[dcItem].numberOfNVMe6Needed}`)

      // Media for dedicated RocksDB media for HDD
      if (chassisArrayLocal[actualChassisID].sizeSSD4 === 0) {
        console.log(`dcConfigDetermineNumberOfMediaRequired() 257: [chassisID=${actualChassisID},DC=${dcItem}] using SSD4`)
        // don't use SSD type 4 for fronting HDD - then use NVMe type 4
        // Check also the number of NVMe would be sufficient for the number of HDD allowed to cover Chassis.hddToSSD4
        dcConfigArrayLocal[dcItem].numberOfNVMe4Needed = Math.ceil((localDCRocksDBSizeHDD + localDCRequiredIndexCapacityOnNVMe4) / chassisArrayLocal[actualChassisID].sizeNVMe4)
        if (dcConfigArrayLocal[dcItem].numberOfNVMe4Needed < dcConfigArrayLocal[dcItem].numberOfHDDNeeded / chassisArrayLocal[actualChassisID].hddToSSD4) {
          // The number of media required based on capacity is not sufficient - would need to add more NVMe for the actual required number of HDD to front.
          dcConfigArrayLocal[dcItem].numberOfNVMe4Needed = Math.ceil(dcConfigArrayLocal[dcItem].numberOfHDDNeeded / chassisArrayLocal[actualChassisID].hddToSSD4)
        }
        console.log(`dcConfigDetermineNumberOfMediaRequired() 265: [chassisID=${actualChassisID},DC=${dcItem}] #NVMe4 needed=${dcConfigArrayLocal[dcItem].numberOfNVMe4Needed}`)
      }
      else {
        // use SSD type 4 for hosting the RocksDB+WAL and also add the index capacity for HDD based RGW use cases hosted here on this SSD type 4 as well
        dcConfigArrayLocal[dcItem].numberOfSSD4Needed = Math.ceil((localDCRocksDBSizeHDD + localDCRequiredIndexCapacityOnNVMe4) / chassisArrayLocal[actualChassisID].sizeSSD4)
        console.log(`dcConfigDetermineNumberOfMediaRequired() 270: [chassisID=${actualChassisID},DC=${dcItem}] (localDCRocksDBSizeHDD=${localDCRocksDBSizeHDD} + localDCRequiredIndexCapacityOnNVMe4=${localDCRequiredIndexCapacityOnNVMe4}) / chassisArrayLocal[actualChassisID].sizeSSD4=${chassisArrayLocal[actualChassisID].sizeSSD4})`)
        console.log(`dcConfigDetermineNumberOfMediaRequired() 271: [chassisID=${actualChassisID},DC=${dcItem}] #SSD4 needed=${dcConfigArrayLocal[dcItem].numberOfSSD4Needed}`)
      }

      // Two different kinds of RocksDB capacity: with and without dedicated - with dedicated, there must be a different kind of media
      // for hosting the dedicated RocksDB: NVMe5; 
      // Note: the capacity of localDCCorrectionForUnalignedObjectsSSD1WithDedicatedRocksDBIncludingWAL is not changing the RocksDB capacity.
      // Check also the number of NVMe would be sufficient for the number of SSD allowed to cover Chassis.ssdToNVMe5
      // NVMe: for coverage of NVMe type 1, only WAL is separated.
      dcConfigArrayLocal[dcItem].numberOfNVMe5Needed = Math.ceil((localDCRocksDBSizeSSDWithDedicatedNVMe +  localDCRequiredIndexCapacityOnNVMe5) / chassisArrayLocal[actualChassisID].sizeNVMe5)
      if (dcConfigArrayLocal[dcItem].numberOfNVMe5Needed < dcConfigArrayLocal[dcItem].numberOfSSD1NeededWithDedicatedRocksDBIncludingWAL / chassisArrayLocal[actualChassisID].ssdToNVMe5) {
      // The number of media required based on capacity is not sufficient - would need to add more NVMe for the actual required number of SSD to front.
      dcConfigArrayLocal[dcItem].numberOfNVMe5Needed = Math.ceil(dcConfigArrayLocal[dcItem].numberOfSSD1NeededWithDedicatedRocksDBIncludingWAL / chassisArrayLocal[actualChassisID].ssdToNVMe5)      }
      console.log(`dcConfigDetermineNumberOfMediaRequired() 283: [chassisID=${actualChassisID},DC=${dcItem}] #NVMe5 needed=${dcConfigArrayLocal[dcItem].numberOfNVMe5Needed}`)
      
      // RGW cache media are dedicated and counted as they are
      dcConfigArrayLocal[dcItem].numberOfNVMe2Needed = localDCNumberOfRGWCacheMedia
      console.log(`dcConfigDetermineNumberOfMediaRequired() 287: [chassisID=${actualChassisID},DC=${dcItem}] #NVMe2 needed=${dcConfigArrayLocal[dcItem].numberOfNVMe2Needed}`)

      //// NOTE NOTE: we'll need to adjust the raw device capacity for any configuration by the correction factor of wasted space for objects and files if the avg object 
      ////            or file size is way off the min_alloc_size for the media. This should be done for replica and EC specifically !!!!
      ////            Way off means nothing specific but would be everything not aligning with min_alloc_size - even for small deviations, we can simply take it and don't need to 
      ////            distinguish between 'way off' and 'nearly matching'.

      dcConfigArrayLocal[dcItem].numberOfHDDNeeded =  Math.ceil((dcConfigArrayLocal[dcItem].capacityNeededForHDD + localDCCorrectionForUnalignedObjectsHDD) / chassisArrayLocal[actualChassisID].sizeHDD1)
      console.log(`dcConfigDetermineNumberOfMediaRequired() 295: [chassisID=${actualChassisID},DC=${dcItem}] #HDD needed=${dcConfigArrayLocal[dcItem].numberOfHDDNeeded}`)
      ////  In addition, the additional capacity for placing the RocksDB on any media used for block must be added to the number of media required - for kinds of flash.
      
      dcConfigArrayLocal[dcItem].numberOfSSD1NeededWithDedicatedRocksDBIncludingWAL =  localNumberOfSSDNeededDedicatedRocksDB = Math.ceil((localSSDCapacityWithDedicatedRocksDB + localDCCorrectionForUnalignedObjectsSSD1WithDedicatedRocksDBIncludingWAL) / chassisArrayLocal[actualChassisID].sizeSSD1)
      console.log(`dcConfigDetermineNumberOfMediaRequired() 299: [chassisID=${actualChassisID},DC=${dcItem}] dcConfigArrayLocal[dcItem].numberOfSSD1NeededWithDedicatedRocksDBIncludingWAL=${dcConfigArrayLocal[dcItem].numberOfSSD1NeededWithDedicatedRocksDBIncludingWAL} =  localNumberOfSSDNeededDedicatedRocksDB=${localNumberOfSSDNeededDedicatedRocksDB} = Math.ceil((localSSDCapacityWithDedicatedRocksDB=${localSSDCapacityWithDedicatedRocksDB} + localDCCorrectionForUnalignedObjectsSSD1WithDedicatedRocksDBIncludingWAL=${localDCCorrectionForUnalignedObjectsSSD1WithDedicatedRocksDBIncludingWAL}) / chassisArrayLocal[actualChassisID].sizeSSD1=${chassisArrayLocal[actualChassisID].sizeSSD1})`)
      dcConfigArrayLocal[dcItem].numberOfSSDNeeded = dcConfigArrayLocal[dcItem].numberOfSSD1NeededWithDedicatedRocksDBIncludingWAL
      dcConfigArrayLocal[dcItem].numberOfSSD1NeededWithoutDedicatedRocksDBNorWAL = localNumberOfSSDNeededNonDedicatedRocksDB = Math.ceil((localSSDCapacityWithoutDedicatedRocksDB + localDCRocksDBSizeSSDWithoutDedicatedNVMe + localDCCorrectionForUnalignedObjectsSSD1WithoutDedicatedRocksDBNorWAL) / chassisArrayLocal[actualChassisID].sizeSSD1)
      dcConfigArrayLocal[dcItem].numberOfSSDNeeded += dcConfigArrayLocal[dcItem].numberOfSSD1NeededWithoutDedicatedRocksDBNorWAL
      console.log(`dcConfigDetermineNumberOfMediaRequired() 303: [chassisID=${actualChassisID},DC=${dcItem}] #SSDw/o needed=${dcConfigArrayLocal[dcItem].numberOfSSD1NeededWithoutDedicatedRocksDBNorWAL}`)
      console.log(`dcConfigDetermineNumberOfMediaRequired() 304: [chassisID=${actualChassisID},DC=${dcItem}] #SSDw/dedicated needed=${dcConfigArrayLocal[dcItem].numberOfSSD1NeededWithDedicatedRocksDBIncludingWAL}`)
      console.log(`dcConfigDetermineNumberOfMediaRequired() 305: [chassisID=${actualChassisID},DC=${dcItem}] #SSD(sum)) needed=${dcConfigArrayLocal[dcItem].numberOfSSDNeeded}`)
      
      // NVMe1
      /** actual issue: HERE HERE - below, the use of workloadsArrayLocal would provide the information whether the workload needs dedicated NVMe in front of NVMe1. However, workloadItem is not actually used since
       * it's outside of the workload evaluation. 
       * - option A: again, check here separately for the individual workloads
       * - option B: perhaps process this before and deliver the sum of media/capacity through a local variable
       *    - this should be collected in the workload evaluation: we only evaluate the needs for the different chassis configurations in the different DCs
       *      => check the proper evaluation in the workloads step
       *      => check the proper calculation of the values for the different h/w combinations - dedicated WAL, RocksDB, RocksDB/WAL combined - all those must be clear after the workloads evaluation
       *      => additional, the selection of those above combinations should be directly asked for in the workloads section and eval but also checked against the possible configurations of the chassis provided (error if not available)
       *    added to workloads selection: selectorDedicatedNVMeForWAL
       * - option C: ??
      */
     /** 
     //// HERE HERE NVMe1 - add separation for dedicated RocksDB, dedicated WAL only, and dedicated combined RocksDB+WAL
      dcConfigArrayLocal[dcItem].numberOfSSD1NeededWithDedicatedRocksDBIncludingWAL =  localNumberOfSSDNeededDedicatedRocksDB = Math.ceil((localSSDCapacityWithDedicatedRocksDB + localDCCorrectionForUnalignedObjectsSSD1WithDedicatedRocksDBIncludingWAL) / chassisArrayLocal[actualChassisID].sizeSSD1)
      console.log(`dcConfigDetermineNumberOfMediaRequired() 299: [chassisID=${actualChassisID},DC=${dcItem}] dcConfigArrayLocal[dcItem].numberOfSSD1NeededWithDedicatedRocksDBIncludingWAL=${dcConfigArrayLocal[dcItem].numberOfSSD1NeededWithDedicatedRocksDBIncludingWAL} =  localNumberOfSSDNeededDedicatedRocksDB=${localNumberOfSSDNeededDedicatedRocksDB} = Math.ceil((localSSDCapacityWithDedicatedRocksDB=${localSSDCapacityWithDedicatedRocksDB} + localDCCorrectionForUnalignedObjectsSSD1WithDedicatedRocksDBIncludingWAL=${localDCCorrectionForUnalignedObjectsSSD1WithDedicatedRocksDBIncludingWAL}) / chassisArrayLocal[actualChassisID].sizeSSD1=${chassisArrayLocal[actualChassisID].sizeSSD1})`)
      dcConfigArrayLocal[dcItem].numberOfSSDNeeded = dcConfigArrayLocal[dcItem].numberOfSSD1NeededWithDedicatedRocksDBIncludingWAL
      dcConfigArrayLocal[dcItem].numberOfSSD1NeededWithoutDedicatedRocksDBNorWAL = localNumberOfSSDNeededNonDedicatedRocksDB = Math.ceil((localSSDCapacityWithoutDedicatedRocksDB + localDCRocksDBSizeSSDWithoutDedicatedNVMe + localDCCorrectionForUnalignedObjectsSSD1WithoutDedicatedRocksDBNorWAL) / chassisArrayLocal[actualChassisID].sizeSSD1)
      dcConfigArrayLocal[dcItem].numberOfSSDNeeded += dcConfigArrayLocal[dcItem].numberOfSSD1NeededWithoutDedicatedRocksDBNorWAL
      
      // HERE HERE - CHECK: Although NVMe1 can have a dedicated WAL, the capacity for all objects and the RocksDB land on the NVMe1. (THis might be not true anymore, at least not here in the code)
      dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithDedicatedWAL  = Math.ceil((localNVMe1CapacityWithDedicatedRocksDB + localDCRocksDBSizeNVMe1WithDedicatedNVMe + localDCCorrectionForUnalignedObjectsNVMe1WithDedicatedRocksDBIncludingWAL) / chassisArrayLocal[actualChassisID].sizeNVMe1)
      dcConfigArrayLocal[dcItem].numberOfNVMe1Needed = dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithDedicatedWAL
      
      dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithoutDedicatedWAL = Math.ceil((localNVMe1CapacityWithoutDedicatedRocksDB + localDCRocksDBSizeNVMe1WithoutDedicatedNVMe + localDCCorrectionForUnalignedObjectsNVMe1WithoutDedicatedRocksDBNorWAL) / chassisArrayLocal[actualChassisID].sizeNVMe1)
      dcConfigArrayLocal[dcItem].numberOfNVMe1Needed += dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithoutDedicatedWAL
      
      console.log(`dcConfigDetermineNumberOfMediaRequired() 317: [chassisID=${actualChassisID},DC=${dcItem}] #SSDw/o needed=${dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithoutDedicatedWAL}`)
      console.log(`dcConfigDetermineNumberOfMediaRequired() 318: [chassisID=${actualChassisID},DC=${dcItem}] #SSDw/dedicated needed=${dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithDedicatedWAL}`)
      console.log(`dcConfigDetermineNumberOfMediaRequired() 319: [chassisID=${actualChassisID},DC=${dcItem}] #SSD(sum)) needed=${dcConfigArrayLocal[dcItem].numberOfNVMe1Needed}`)
      */

      // determine the number of dedicated WAL devices for SSD (aka previously known as Optanes)
      if (chassisArrayLocal[actualChassisID].useOptane1 === true) {
        console.log(`dcConfigDetermineNumberOfMediaRequired() 323: [chassisID=${actualChassisID},DC=${dcItem}] Optane aka NVMe3 needed`)
        let interrimOptaneNumberPerRatioDedicated = 0
        let interrimOptaneNumberPerCapacityDedicated = 0
        let interrimOptaneNumberPerRatioNonDedicatedRocksDB = 0
        let interrimOptaneNumberPerCapacityNonDedicatedRocksDB = 0
        interrimOptaneNumberPerRatioDedicated = Math.ceil(localNumberOfSSDNeededDedicatedRocksDB / chassisArrayLocal[actualChassisID].ssdToOptane)
        interrimOptaneNumberPerCapacityDedicated = Math.ceil(localNumberOfSSDNeededDedicatedRocksDB * sizingConstraints.sizeOfWALOnNVMeInGB / chassisArrayLocal[actualChassisID].sizeOptane1)
        interrimOptaneNumberPerRatioNonDedicatedRocksDB = Math.ceil(localNumberOfSSDNeededNonDedicatedRocksDB / chassisArrayLocal[actualChassisID].ssdToOptane)
        interrimOptaneNumberPerCapacityNonDedicatedRocksDB = Math.ceil(localNumberOfSSDNeededNonDedicatedRocksDB * sizingConstraints.sizeOfWALOnNVMeInGB / chassisArrayLocal[actualChassisID].sizeOptane1)
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
        console.log(`dcConfigDetermineNumberOfMediaRequired() 347: [chassisID=${actualChassisID},DC=${dcItem}] Optane aka NVMe3 needed=${dcConfigArrayLocal[dcItem].numberOfNVMe3Needed}`)
      }

      // determine the number of dedicated WAL devices for NVMe (NVMe type 7)
      /**
       * //// HERE HERE NVMe1 - add separation for dedicated RocksDB, dedicated WAL only, and dedicated combined RocksDB+WAL
       * ///// THIS can be done without consulting the workloads - if there is capacity assigned to NVMe1 use, we can simply check against the settings ---- ok, well this must be done in workloads since we have a dedicated selector for using separate WAL or not with and without separated WAL
       */
      /**
      if (workloadsArrayLocal[workloadItem].selectorNVMe == true ) {
        if (workloadsArrayLocal[workloadItem].selectorDedicatedNVMe === true) {

          if (chassisArrayLocal[actualChassisID].useNVMe7 === true) {
            console.log(`dcConfigDetermineNumberOfMediaRequired() 355: [chassisID=${actualChassisID},DC=${dcItem}] Fronting NVMe7 needed`)
            // CHECK for further integration: not yet used - no dedicated device for separate NVMe for RocksDB for NVMe1 - check - changed
            let interrimNVMe7NumberPerRatioDedicated = 0
            let interrimNVMe7NumberPerCapacityDedicated = 0
            let interrimNVMe7NumberPerRatioNonDedicatedRocksDB = 0
            let interrimNVMe7NumberPerCapacityNonDedicatedRocksDB = 0
            // CHECK for further integration: not yet used - no dedicated device for separate NVMe for RocksDB for NVMe1 - check - changed
            interrimNVMe7NumberPerRatioDedicated = Math.ceil(localNumberOfNVMe1NeededDedicatedRocksDB / chassisArrayLocal[actualChassisID].nvmeToNVMe7)
            interrimNVMe7NumberPerCapacityDedicated = Math.ceil(localNumberOfNVMe1NeededDedicatedRocksDB * sizingConstraints.sizeOfWALOnNVMeInGB / chassisArrayLocal[actualChassisID].sizeNVMe7)
            interrimNVMe7NumberPerRatioNonDedicatedRocksDB = Math.ceil(localNumberOfNVMe1NeededNonDedicatedRocksDB / chassisArrayLocal[actualChassisID].nvmeToNVMe7)
            interrimNVMe7NumberPerCapacityNonDedicatedRocksDB = Math.ceil(localNumberOfNVMe1NeededNonDedicatedRocksDB * sizingConstraints.sizeOfWALOnNVMeInGB / chassisArrayLocal[actualChassisID].sizeNVMe7)
            // The higher number of devices as per either the matching number of devices per fronted flash device
            // or per capacity provided per device - first for flash devices with dedicated RocksDB
            if (interrimNVMe7NumberPerRatioDedicated >= interrimNVMe7NumberPerCapacityDedicated) {
              dcConfigArrayLocal[dcItem].numberOfNVMe7Needed = interrimNVMe7NumberPerRatioDedicated
            }
            else {
              dcConfigArrayLocal[dcItem].numberOfNVMe7Needed = interrimNVMe7NumberPerCapacityDedicated
            }
            // ... and then add the number needed for flash devices without dedicated RocksDB
            if (interrimNVMe7NumberPerRatioNonDedicatedRocksDB >= interrimNVMe7NumberPerCapacityNonDedicatedRocksDB) {
              dcConfigArrayLocal[dcItem].numberOfNVMe7Needed += interrimNVMe7NumberPerRatioNonDedicatedRocksDB
            }
            else {
              dcConfigArrayLocal[dcItem].numberOfNVMe7Needed += interrimNVMe7NumberPerCapacityNonDedicatedRocksDB
            }
            console.log(`dcConfigDetermineNumberOfMediaRequired() 381: [chassisID=${actualChassisID},DC=${dcItem}] Optane aka NVMe7 needed=${dcConfigArrayLocal[dcItem].numberOfNVMe7Needed}`)
          }
        }
      }
       */

      // This should now have all media covered for this DC.
      if (generalValuesLocal.globalDebug == true || localDebug == true) {
        console.log(`dcConfigDetermineNumberOfMediaRequired() 388: [chassisID=${actualChassisID},DC=${dcItem}] DC=${dcItem} => #media HDD=${dcConfigArrayLocal[dcItem].numberOfHDDNeeded}, SSDw/dedicated=${dcConfigArrayLocal[dcItem].numberOfSSD1NeededWithDedicatedRocksDBIncludingWAL}, SSDw/oDedicated=${dcConfigArrayLocal[dcItem].numberOfSSD1NeededWithoutDedicatedRocksDBNorWAL}, #SSD for data =${dcConfigArrayLocal[dcItem].numberOfSSDNeeded}, #SSD4=${dcConfigArrayLocal[dcItem].numberOfSSD4Needed}`)
        console.log(`dcConfigDetermineNumberOfMediaRequired() 389: [chassisID=${actualChassisID},DC=${dcItem}] DC=${dcItem} => #media NVMe1=${dcConfigArrayLocal[dcItem].numberOfNVMe1Needed}, NVMe2=${dcConfigArrayLocal[dcItem].numberOfNVMe2Needed}, NVMe3=${dcConfigArrayLocal[dcItem].numberOfNVMe3Needed}, NVMe4=${dcConfigArrayLocal[dcItem].numberOfNVMe4Needed}, NVMe5=${dcConfigArrayLocal[dcItem].numberOfNVMe5Needed}, NVMe6=${dcConfigArrayLocal[dcItem].numberOfNVMe6Needed}, NVMe7=${dcConfigArrayLocal[dcItem].numberOfNVMe7Needed}`)
      }
    }
  }
}

export default dcConfigDetermineNumberOfMediaRequired