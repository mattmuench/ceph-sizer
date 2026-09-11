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

      // RGW index capacity per media configuration
      // HDD without dedicated RocksDB
      let localDCRequiredIndexCapacityOnHDDDedicatedWALonNVMe9 = 0 // RocksDB location for HDD is the HDD itself (no flash fronting for RocksDB), WAL uses NVMe9
      let localDCRequiredIndexCapacityOnHDDDedicatedWALonSSD9 = 0 // // RocksDB location for HDD is the HDD itself (no flash fronting for RocksDB), WAL uses SSD9
      let localDCRequiredIndexCapacityOnHDDIncludingWAL = 0 // RocksDB location for HDD is the HDD itself (no flash fronting for RocksDB)
      // HDD uses NVMe4 fronting - note that there is no SSD based WAL 
      let localDCRequiredIndexCapacityOnNVMe4DedicatedWALonNVMe9 = 0 // RocksDB location for HDD is NVMe4, WAL uses NVMe9
      let localDCRequiredIndexCapacityOnNVMe4DedicatedWALonSSD9 = 0 // RocksDB location for HDD is NVMe4, WAL uses SSD9
      let localDCRequiredIndexCapacityOnNVMe4IncludingWAL = 0 // RocksDB location for HDD is NVMe4 (no flash fronting  for WAL for RocksDB)
      // HDD uses SSD4 fronting - note that WAL dedicated device is on NVMe9 as well (as with NVMe4 fronting above) 
      let localDCRequiredIndexCapacityOnSSD4DedicatedWALonNVMe9 = 0 // RocksDB location for HDD is SSD4, WAL uses NVMe9
      let localDCRequiredIndexCapacityOnSSD4DedicatedWALonSSD9 = 0 // RocksDB location for HDD is SSD4, WAL uses SSD9
      let localDCRequiredIndexCapacityOnSSD4IncludingWAL = 0 // RocksDB location for HDD is SSD4 (no flash fronting  for WAL for RocksDB)

      // SSD1
      let localDCRequiredIndexCapacityOnNVMe5DedicatedWAL = 0  // RocksDB location for SSD if on separate NVMe
      let localDCRequiredIndexCapacityOnNVMe5NorWAL = 0  // RocksDB location for SSD if on separate NVMe
      let localDCRequiredIndexCapacityOnSSD1DedicatedWAL = 0  // RocksDB location for SSD if on separate NVMe
      let localDCRequiredIndexCapacityOnSSD1NorWAL = 0  // RocksDB location for SSD if on separate NVMe
      // NVMe1
      let localDCRequiredIndexCapacityOnNVMe1DedicatedWAL = 0 // index and RocksDB location is NVMe1 if no separate NVMe for neither RocksDB nor WAL
      let localDCRequiredIndexCapacityOnNVMe1NorWAL = 0 // index and RocksDB location is NVMe1 if no separate NVMe for neither RocksDB nor WAL
      let localDCRequiredIndexCapacityOnNVMe7DedicatedWAL = 0 // index goes to RocksDB location for NVMe1 if on separate NVMe7
      let localDCRequiredIndexCapacityOnNVMe7IncludingWAL = 0 // index goes to RocksDB location for NVMe1 if on separate NVMe7
      
      // RocksDB capacity per media configuration
      // HDD without dedicated RocksDB
      let localHDDCapacityWithoutDedicatedRocksDBDedicatedWALonNVMe9 = 0 // HDD workload could be configured using no dedicated RocksDB but dedicated WAL media - would need different number of media => no NVMe4/SSD4 but NVMe9 only
      let localHDDCapacityWithoutDedicatedRocksDBDedicatedWALonSSD9 = 0 // HDD workload could be configured using no dedicated RocksDB but dedicated WAL media - would need different number of media => no NVMe4/SSD4 but SSD4 only
      let localHDDCapacityWithoutDedicatedRocksDBNorWAL = 0 // HDD workload could be configured using neither dedicated RocksDB nor dedicated WAL media - would need different number of media => no NVMe4/SSD4 and no NVMe9/SSD9
      // HDD uses NVMe4 fronting - note that there is no SSD based WAL 
      let localHDDCapacityWithDedicatedRocksDBNVMe4DedicatedWALonNVMe9 = 0 // HDD workload could be configured using dedicated RocksDB and dedicated WAL media - would need different number of media => NVMe4 & NVMe9
      let localHDDCapacityWithDedicatedRocksDBNVMe4DedicatedWALonSSD9 = 0 // HDD workload could be configured using dedicated RocksDB and dedicated WAL media - would need different number of media => NVMe4 & SSD9
      let localHDDCapacityWithDedicatedRocksDBNVMe4IncludingWAL = 0 // HDD workload could be configured using dedicated RocksDB but no dedicated WAL media - would need different number of media => NVMe4 only
      // HDD uses SSD4 fronting - note that WAL dedicated device is on NVMe9 as well (as with NVMe4 fronting above) 
      let localHDDCapacityWithDedicatedRocksDBSSD4DedicatedWALonNVMe9 = 0 // HDD workload could be configured using dedicated RocksDB and dedicated WAL media - would need different number of media => SSD4 & NVMe9
      let localHDDCapacityWithDedicatedRocksDBSSD4DedicatedWALonSSD9 = 0 // HDD workload could be configured using dedicated RocksDB and dedicated WAL media - would need different number of media => SSD4 & SSD9
      let localHDDCapacityWithDedicatedRocksDBSSD4IncludingWAL = 0 // HDD workload could be configured using dedicated RocksDB but no dedicated WAL media - would need different number of media => SSD4 only
      
      
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

      // RocksDB capacity per DC
      // HDD without fronting for RocksDB
      let localDCRocksDBSizeHDDWithoutDedicatedRocksDBDedicatedWALonNVMe9 = 0
      let localDCRocksDBSizeHDDWithoutDedicatedRocksDBDedicatedWALonSSD9 = 0
      let localDCRocksDBSizeHDDWithoutDedicatedRocksDBNorWAL = 0

      // HDD with SSD4 fronting
      let localDCRocksDBSizeHDDWithDedicatedSSD4DedicatedWALonNVMe9 = 0
      let localDCRocksDBSizeHDDWithDedicatedSSD4DedicatedWALonSSD9 = 0
      let localDCRocksDBSizeHDDWithDedicatedSSD4IncludingWAL = 0
      // HDD with NVMe4 fronting
      let localDCRocksDBSizeHDDWithDedicatedNVMe4DedicatedWALonNVMe9 = 0
      let localDCRocksDBSizeHDDWithDedicatedNVMe4DedicatedWALonSSD9 = 0
      let localDCRocksDBSizeHDDWithDedicatedNVMe4IncludingWAL = 0

      // SSD1
      let localDCRocksDBSizeSSDWithDedicatedNVMeDedicatedWAL = 0
      let localDCRocksDBSizeSSDWithDedicatedNVMeIncludingWAL = 0
      let localDCRocksDBSizeSSDWithoutDedicatedNVMeDedicatedWAL = 0
      let localDCRocksDBSizeSSDWithoutDedicatedNVMeNorWAL = 0
      // NVMe1
      let localDCRocksDBSizeNVMe1WithDedicatedNVMeDedicatedWAL = 0 
      let localDCRocksDBSizeNVMe1WithDedicatedNVMeIncludingWAL = 0 
      let localDCRocksDBSizeNVMe1WithoutDedicatedNVMeDedicatedWAL = 0
      let localDCRocksDBSizeNVMe1WithoutDedicatedNVMeNorWAL = 0

      // Correction capacity per DC for unaligned objects
      // HDD without fronting for RocksDB
      let localDCCorrectionForUnalignedObjectsHDD1WithoutDedicatedRocksDBDedicatedWALonNVMe9 = 0
      let localDCCorrectionForUnalignedObjectsHDD1WithoutDedicatedRocksDBDedicatedWALonSSD9 = 0
      let localDCCorrectionForUnalignedObjectsHDD1WithoutDedicatedRocksDBNorWAL = 0
      // HDD with SSD4 fronting
      let localDCCorrectionForUnalignedObjectsHDD1OnSSD4DedicatedWALonNVMe9 = 0
      let localDCCorrectionForUnalignedObjectsHDD1OnSSD4DedicatedWALonSSD9 = 0
      let localDCCorrectionForUnalignedObjectsHDD1OnSSD4IncludingWAL = 0
      // HDD with NVMe4 fronting
      let localDCCorrectionForUnalignedObjectsHDD1OnNVMe4DedicatedWALonNVMe9 = 0
      let localDCCorrectionForUnalignedObjectsHDD1OnNVMe4DedicatedWALonSSD9 = 0
      let localDCCorrectionForUnalignedObjectsHDD1OnNVMe4IncludingWAL = 0
      
      // SSD1
      let localWorkloadCorrectionForUnalignedObjectsSSD = 0
      let localDCCorrectionForUnalignedObjectsSSD1WithDedicatedRocksDBDedicatedWAL = 0 // additional capacity to be taken into account for unaligned object payload data allocation on media 
      let localDCCorrectionForUnalignedObjectsSSD1WithDedicatedRocksDBIncludingWAL = 0 // additional capacity to be taken into account for unaligned object payload data allocation on media 
      let localDCCorrectionForUnalignedObjectsSSD1WithoutDedicatedRocksDBDedicatedWAL = 0 // additional capacity to be taken into account for unaligned object payload data allocation on media 
      let localDCCorrectionForUnalignedObjectsSSD1WithoutDedicatedRocksDBNorWAL = 0 // additional capacity to be taken into account for unaligned object payload data allocation on media 
      // NVMe1
      let localWorkloadCorrectionForUnalignedObjectsNVMe1 = 0
      let localDCCorrectionForUnalignedObjectsNVMe1WithDedicatedRocksDBDedicatedWAL = 0 // additional capacity to be taken into account for unaligned object payload data allocation on media 
      let localDCCorrectionForUnalignedObjectsNVMe1WithDedicatedRocksDBIncludingWAL = 0 // additional capacity to be taken into account for unaligned object payload data allocation on media 
      let localDCCorrectionForUnalignedObjectsNVMe1WithoutDedicatedRocksDBDedicatedWAL = 0 // additional capacity to be taken into account for unaligned object payload data allocation on media 
      let localDCCorrectionForUnalignedObjectsNVMe1WithoutDedicatedRocksDBNorWAL = 0 // additional capacity to be taken into account for unaligned object payload data allocation on media 

      // processing the workloads and calculating the number of capacity needed for each config case
      for (let workloadItem = 0; workloadItem < generalValues.numberOfWorkloadsPossible; workloadItem++) {

        let localDCObjectIndexCapacity = 0 // takes all the actual index capacity required for the workload to be processed into the different locations
        let localWorkloadCorrectionForUnalignedObjectsHDD = 0
        
        // Reset correction capacity per DC for unaligned objects
        // HDD without fronting for RocksDB
        localDCCorrectionForUnalignedObjectsHDD1WithoutDedicatedRocksDBDedicatedWALonNVMe9 = 0
        localDCCorrectionForUnalignedObjectsHDD1WithoutDedicatedRocksDBDedicatedWALonSSD9 = 0
        localDCCorrectionForUnalignedObjectsHDD1WithoutDedicatedRocksDBNorWAL = 0
        // HDD with SSD4 fronting
        localDCCorrectionForUnalignedObjectsHDD1OnSSD4DedicatedWALonNVMe9 = 0
        localDCCorrectionForUnalignedObjectsHDD1OnSSD4DedicatedWALonSSD9 = 0
        localDCCorrectionForUnalignedObjectsHDD1OnSSD4IncludingWAL = 0
        // HDD with NVMe4 fronting
        localDCCorrectionForUnalignedObjectsHDD1OnNVMe4DedicatedWALonNVMe9 = 0
        localDCCorrectionForUnalignedObjectsHDD1OnNVMe4DedicatedWALonSSD9 = 0
        localDCCorrectionForUnalignedObjectsHDD1OnNVMe4IncludingWAL = 0
        
        // SSD1
        localWorkloadCorrectionForUnalignedObjectsSSD = 0
        localDCCorrectionForUnalignedObjectsSSD1WithDedicatedRocksDBDedicatedWAL = 0 // additional capacity to be taken into account for unaligned object payload data allocation on media 
        localDCCorrectionForUnalignedObjectsSSD1WithDedicatedRocksDBIncludingWAL = 0 // additional capacity to be taken into account for unaligned object payload data allocation on media 
        localDCCorrectionForUnalignedObjectsSSD1WithoutDedicatedRocksDBDedicatedWAL = 0 // additional capacity to be taken into account for unaligned object payload data allocation on media 
        localDCCorrectionForUnalignedObjectsSSD1WithoutDedicatedRocksDBNorWAL = 0 // additional capacity to be taken into account for unaligned object payload data allocation on media 
        // NVMe1
        localWorkloadCorrectionForUnalignedObjectsNVMe1 = 0
        localDCCorrectionForUnalignedObjectsNVMe1WithDedicatedRocksDBDedicatedWAL = 0 // additional capacity to be taken into account for unaligned object payload data allocation on media 
        localDCCorrectionForUnalignedObjectsNVMe1WithDedicatedRocksDBIncludingWAL = 0 // additional capacity to be taken into account for unaligned object payload data allocation on media 
        localDCCorrectionForUnalignedObjectsNVMe1WithoutDedicatedRocksDBDedicatedWAL = 0 // additional capacity to be taken into account for unaligned object payload data allocation on media 
        localDCCorrectionForUnalignedObjectsNVMe1WithoutDedicatedRocksDBNorWAL = 0 // additional capacity to be taken into account for unaligned object payload data allocation on media 

        // local only variables for workloads extraction
        let localWorkloadRocksDBSizeHDD = 0
        // HDD without fronting for RocksDB
        let localWorkloadRocksDBSizeHDDWithoutDedicatedRocksDBDedicatedWALonNVMe9 = 0
        let localWorkloadRocksDBSizeHDDWithoutDedicatedRocksDBDedicatedWALonSSD9 = 0
        let localWorkloadRocksDBSizeHDDWithoutDedicatedRocksDBNorWAL = 0 // no NVMe for placing RocksDB+WAL separately
        // HDD with NVMe4 fronting
        let localWorkloadRocksDBSizeHDDWithDedicatedNVMe4DedicatedWALonNVMe9 = 0
        let localWorkloadRocksDBSizeHDDWithDedicatedNVMe4DedicatedWALonSSD9 = 0
        let localWorkloadRocksDBSizeHDDWithDedicatedNVMe4IncludingWAL = 0
        // HDD with SSD4 fronting
        let localWorkloadRocksDBSizeHDDWithDedicatedSSD4DedicatedWALonNVMe9 = 0
        let localWorkloadRocksDBSizeHDDWithDedicatedSSD4DedicatedWALonSSD9 = 0
        let localWorkloadRocksDBSizeHDDWithDedicatedSSD4IncludingWAL = 0

        // SD1
        let localWorkloadRocksDBSizeSSDWithDedicatedNVMeIncludingWAL = 0
        let localWorkloadRocksDBSizeSSDWithDedicatedNVMeDedicatedWAL = 0
        let localWorkloadRocksDBSizeSSDWithoutDedicatedNVMeDedicatedWAL = 0
        let localWorkloadRocksDBSizeSSDWithoutDedicatedNVMeNorWAL = 0 // no NVMe for placing RocksDB+WAL separately
        // NVMe1
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
            // Note: The index for RGW objects is either stored alongside with the pool itself or might use a dedicated pool. In case of the index uses no separate pool, 
            //       the capacity is needed within the RocksDB space. If HDD fronted by flash media then the space is needed there and must be taken into account for sizing
            //       those media for providing appropriate space that doesn't conflict with neither RocksDB nor the raw payload data, in design already.
            //       This additional capacity might go into a dedicated flash pool if configured this way. Otherwise needs to go into the RocksDB flash space.
            //       Flash only portion of a workload will need the capacity on the media for the RocksDB or on the media directly. HDD (hybrid supported only) pools will need
            //       this capacity on RocksDB flash media - or for strictly archiving only on HDD. However, based on design, also the index might use a dedicated pool for it.
            // Per case, calculate the needed capacity for hosting the index. This is first independent of any assignment to a certain DC. Then divide the resulting individual capacity 
            // by the number of actually used DCs and sum it up for all the workloads.

            // calculate the local required index capacity (in this DC) for this workload (in TB) 
            //    => #DC=1 requires that all replica reside in this actual DC and should be the default number, 
            //    => #DC>1 would apply the replica number to the index as well.
            debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 212, `[chassisID=${actualChassisID},workloadID=${workloadItem},DC=${dcItem}] workload in ACTUAL DC #${dcItem} and is type ${workloadsArrayLocal[workloadItem].useCase}`,0,0,0)
            if (workloadsArrayLocal[workloadItem].sumNumberDC === 1) {
              localDCObjectIndexCapacity = workloadsArrayLocal[workloadItem].reqCapacityNet * 1000*1000*1000*1000/(workloadsArrayLocal[workloadItem].sizeAvgObj * 1024) * sizingConstraints.expectedAverageEntrySizeInObjectIndexInBytes / 1024/1024/1024/1024 * workloadsArrayLocal[workloadItem].selectorRGWLifecycleNumVersions * sizingConstraints.requiredNumberOfReplicaForObjectIndex / workloadsArrayLocal[workloadItem].sumNumberDC
              debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 215, `[chassisID=${actualChassisID},workloadID=${workloadItem},DC=${dcItem}] workload ONLY in ACTUAL DC #${dcItem} and needed capacity for object index=${localDCObjectIndexCapacity}`,0,0,0)
            }
            else {
              localDCObjectIndexCapacity = workloadsArrayLocal[workloadItem].reqCapacityNet * 1000*1000*1000*1000/(workloadsArrayLocal[workloadItem].sizeAvgObj * 1024) * sizingConstraints.expectedAverageEntrySizeInObjectIndexInBytes / 1024/1024/1024/1024 * workloadsArrayLocal[workloadItem].selectorRGWLifecycleNumVersions * workloadsArrayLocal[workloadItem].reqNumReplica / workloadsArrayLocal[workloadItem].sumNumberDC
              debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 219, `[chassisID=${actualChassisID},workloadID=${workloadItem},DC=${dcItem}] workloadsArrayLocal[workloadItem].sizeAvgObj=${workloadsArrayLocal[workloadItem].sizeAvgObj}`,0,0,0)
              debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 220, `[chassisID=${actualChassisID},workloadID=${workloadItem},DC=${dcItem}] workload NOT ONLY in ACTUAL DC #${dcItem} and needed capacity for object index=${localDCObjectIndexCapacity}`,0,0,0)

            }

            // Determine desired configuration for object index and add capacity to where needed.
            debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 225, `[chassisID=${actualChassisID},workloadID=${workloadItem},DC=${dcItem}] rgw workload in DC#${dcItem} selected capacity for dedicated object index=${workloadsArrayLocal[workloadItem].selectorRGWIndexDedicatedFlashPool}`,0,0,0)
            if (workloadsArrayLocal[workloadItem].selectorRGWIndexDedicatedFlashPool === true) {
              // if this is set it's for both HDD and flash based portions of the worklod - it's always going to the separate index pool and we need to collect how much capacity is needed
              // for this pool. The amount needed for raw will be already calculated by this because we'll apply the required replication and the number of DCs used for the workload.
              // The media type would be NVMe6 .
              localDCDedicatedObjectIndexCapacity += localDCObjectIndexCapacity
              debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 231, `[chassisID=${actualChassisID},workloadID=${workloadItem},DC=${dcItem}] rgw workload in DC#${dcItem} needs capacity for dedicated object index=${localDCDedicatedObjectIndexCapacity}`,0,0,0)
            }
            else {
              // There is no general desire for the actual workload to use a dedicated index pool. HDD would require a hybrid config (for the default use, anyways) and would need to add the capacity to the RocksDB capacity space.
              // Depending on the SSD/NVMe configuration, a separate space might be needed for the data portion or on a dedicated media for RocksDB.
              debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 236, `[chassisID=${actualChassisID},workloadID=${workloadItem},DC=${dcItem}] rgw workload in DC#${dcItem} no dedicated index pool`,0,0,0)
              
              // For HDD, by default, recommended with fronting flash for RocksDB, it needs to be allocated on NVMe4 / or SSD4
              if (workloadsArrayLocal[workloadItem].selectorHDDDedicatedNVMe === true) {
                // RocksDB is on NVMe4 - so index as well even with dedicated WAL
                if (workloadsArrayLocal[workloadItem].selectorHDDDedicatedNVMeForWAL === true) {
                  localDCRequiredIndexCapacityOnNVMe4DedicatedWALonNVMe9 += localDCObjectIndexCapacity * (100 - workloadsArrayLocal[workloadItem].reqFlashPercent) / 100
                  debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 243, `[chassisID=${actualChassisID},workloadID=${workloadItem},DC=${dcItem}] rgw workload in DC#${dcItem} needs index capacity on dedicated NVMe4 for HDD(NVMe4) + WAL on NVMe9:${localDCRequiredIndexCapacityOnNVMe4DedicatedWALonNVMe9}`,0,0,0)  
                }
                else {
                  // RocksDB is on NVMe4 - so index as well even with dedicated WAL
                  if (workloadsArrayLocal[workloadItem].selectorHDDDedicatedSSDForWAL === true) {
                    localDCRequiredIndexCapacityOnNVMe4DedicatedWALonSSD9 += localDCObjectIndexCapacity * (100 - workloadsArrayLocal[workloadItem].reqFlashPercent) / 100
                    debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 249, `[chassisID=${actualChassisID},workloadID=${workloadItem},DC=${dcItem}] rgw workload in DC#${dcItem} needs index capacity on dedicated NVMe4 for HDD(NVMe4) + WAL on SSD9:${localDCRequiredIndexCapacityOnNVMe4DedicatedWALonSSD9}`,0,0,0)  
                  }
                  else {
                    // RocksDB is on NVMe4 - so index as well
                    localDCRequiredIndexCapacityOnNVMe4IncludingWAL += localDCObjectIndexCapacity * (100 - workloadsArrayLocal[workloadItem].reqFlashPercent) / 100
                    debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 254, `[chassisID=${actualChassisID},workloadID=${workloadItem},DC=${dcItem}] rgw workload in DC#${dcItem} needs index capacity on dedicated NVMe4 for HDD(NVMe4):${localDCRequiredIndexCapacityOnNVMe4IncludingWAL}`,0,0,0)
                  }
                }
              }
              else {
                if (workloadsArrayLocal[workloadItem].selectorHDDDedicatedSSD === true) {
                  // RocksDB is on SSD
                  if (workloadsArrayLocal[workloadItem].selectorHDDDedicatedNVMeForWAL === true) {
                    localDCRequiredIndexCapacityOnSSD4DedicatedWALonNVMe9 += localDCObjectIndexCapacity * (100 - workloadsArrayLocal[workloadItem].reqFlashPercent) / 100
                    debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 263, `[chassisID=${actualChassisID},workloadID=${workloadItem},DC=${dcItem}] rgw workload in DC#${dcItem} - dedicated SSD4 for RocksDB - needs index capacity on SSD4 - w/ extra WAL on NVMe9:${localDCRequiredIndexCapacityOnSSD4DedicatedWALonNVMe9}`,0,0,0)
                  }
                  else {
                    // RocksDB is on SSD
                    if (workloadsArrayLocal[workloadItem].selectorHDDDedicatedSSDForWAL === true) {
                      localDCRequiredIndexCapacityOnSSD4DedicatedWALonSSD9 += localDCObjectIndexCapacity * (100 - workloadsArrayLocal[workloadItem].reqFlashPercent) / 100
                      debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 269, `[chassisID=${actualChassisID},workloadID=${workloadItem},DC=${dcItem}] rgw workload in DC#${dcItem} - dedicated SSD4 for RocksDB - needs index capacity on dedicated SSD4 - /w extra WAL on SSD9:${localDCRequiredIndexCapacityOnSSD4DedicatedWALonSSD9}`,0,0,0)  
                    }
                    else {
                      // RocksDB is on SSD
                      localDCRequiredIndexCapacityOnSSD4IncludingWAL += localDCObjectIndexCapacity * (100 - workloadsArrayLocal[workloadItem].reqFlashPercent) / 100
                      debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 274, `[chassisID=${actualChassisID},workloadID=${workloadItem},DC=${dcItem}] rgw workload in DC#${dcItem} - dedicated SSD4 for RocksDB but no dedicated WAL - needs index capacity on SSD4:${localDCRequiredIndexCapacityOnSSD4IncludingWAL}`,0,0,0)
                    }
                  }
                }
                else {
                  // RocksDB is on HDD
                  if (workloadsArrayLocal[workloadItem].selectorSSDDedicatedNVMeForWAL === true) {
                    localDCRequiredIndexCapacityOnHDDDedicatedWALonNVMe9 += localDCObjectIndexCapacity * (100 - workloadsArrayLocal[workloadItem].reqFlashPercent) / 100
                    debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 282, `[chassisID=${actualChassisID},workloadID=${workloadItem},DC=${dcItem}] rgw workload in DC#${dcItem} - no dedicated NVMe/SSD for RocksDB - needs index capacity on HDD1 - extra WAL on NVMe9:${localDCRequiredIndexCapacityOnHDDDedicatedWALonNVMe9}`,0,0,0)
                  }
                  else {
                    if (workloadsArrayLocal[workloadItem].selectorSSDDedicatedSSDForWAL === true) {
                      localDCRequiredIndexCapacityOnHDDDedicatedWALonSSD9 += localDCObjectIndexCapacity * (100 - workloadsArrayLocal[workloadItem].reqFlashPercent) / 100
                      debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 287, `[chassisID=${actualChassisID},workloadID=${workloadItem},DC=${dcItem}] rgw workload in DC#${dcItem} - no dedicated NVMe/SSD for RocksDB - needs index capacity on HDD1 - w/ extra WAL on SSD9:${localDCRequiredIndexCapacityOnHDDDedicatedWALonSSD9}`,0,0,0)
                    }
                    else {
                      localDCRequiredIndexCapacityOnHDDIncludingWAL += localDCObjectIndexCapacity * (100 - workloadsArrayLocal[workloadItem].reqFlashPercent) / 100
                      debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 291, `[chassisID=${actualChassisID},workloadID=${workloadItem},DC=${dcItem}] rgw workload in DC#${dcItem} - no dedicated NVMe/SSD for RocksDB nor WAL - needs index capacity on HDD1:${localDCRequiredIndexCapacityOnHDDIncludingWAL}`,0,0,0)
                    }
                  }
                }
              }
            
              // and flash: reserve additional space on data device, dedicated NVMe for RocksDB
              if (workloadsArrayLocal[workloadItem].selectorNVMe === true) {
                // NVMe1
                if (workloadsArrayLocal[workloadItem].selectorNVMe1DedicatedNVMe === true) {
                  // RocksDB is on NVMe7 - so index as well
                  if (workloadsArrayLocal[workloadItem].selectorNVMe1DedicatedNVMeForWAL === true) {
                    localDCRequiredIndexCapacityOnNVMe7DedicatedWAL += localDCObjectIndexCapacity * workloadsArrayLocal[workloadItem].reqFlashPercent / 100
                  debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 304, `[chassisID=${actualChassisID},workloadID=${workloadItem},DC=${dcItem}] rgw workload in DC#${dcItem} needs index capacity on dedicated NVMe for NVMe1(NVMe7):${localDCRequiredIndexCapacityOnNVMe7DedicatedWAL}`,0,0,0)  
                  }
                  else {
                    localDCRequiredIndexCapacityOnNVMe7IncludingWAL += localDCObjectIndexCapacity * workloadsArrayLocal[workloadItem].reqFlashPercent / 100
                    debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 308, `[chassisID=${actualChassisID},workloadID=${workloadItem},DC=${dcItem}] rgw workload in DC#${dcItem} needs index capacity on dedicated NVMe for NVMe(NVMe7):${localDCRequiredIndexCapacityOnNVMe7IncludingWAL}`,0,0,0)  
                  }
                }
                else {
                  // RocksDB is on NVMe1 - index is on NVMe1
                    if (workloadsArrayLocal[workloadItem].selectorNVMe1DedicatedNVMeForWAL === true) {
                      localDCRequiredIndexCapacityOnNVMe1DedicatedWAL += localDCObjectIndexCapacity * workloadsArrayLocal[workloadItem].reqFlashPercent / 100
                      debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 315, `[chassisID=${actualChassisID},workloadID=${workloadItem},DC=${dcItem}] rgw workload in DC#${dcItem} - no dedicated NVMe for RocksDB but WAL - needs index capacity on NVMe1:${localDCRequiredIndexCapacityOnNVMe1DedicatedWAL}`,0,0,0)
                    }
                    else {
                      localDCRequiredIndexCapacityOnNVMe1NorWAL += localDCObjectIndexCapacity * workloadsArrayLocal[workloadItem].reqFlashPercent / 100
                      debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 319, `[chassisID=${actualChassisID},workloadID=${workloadItem},DC=${dcItem}] rgw workload in DC#${dcItem} - no dedicated NVMe for RocksDB nor WAL - needs index capacity on NVMe1:${localDCRequiredIndexCapacityOnNVMe1NorWAL}`,0,0,0)
                    }
                }
              }
              else {
                // SSD
                if (workloadsArrayLocal[workloadItem].selectorSSDDedicatedNVMe === true) {
                  // RocksDB is on NVMe5 - so index as well even with dedicated WAL
                  if (workloadsArrayLocal[workloadItem].selectorSSDDedicatedNVMeForWAL === true) {
                    localDCRequiredIndexCapacityOnNVMe5DedicatedWAL += localDCObjectIndexCapacity * workloadsArrayLocal[workloadItem].reqFlashPercent / 100
                    debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 329, `[chassisID=${actualChassisID},workloadID=${workloadItem},DC=${dcItem}] rgw workload in DC#${dcItem} needs index capacity on dedicated NVMe for SSD1(NVMe5):${localDCRequiredIndexCapacityOnNVMe5DedicatedWAL}`,0,0,0)  
                  }
                  else {
                    // RocksDB is on NVMe5
                    localDCRequiredIndexCapacityOnNVMe5NorWAL += localDCObjectIndexCapacity * workloadsArrayLocal[workloadItem].reqFlashPercent / 100
                    debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 334, `[chassisID=${actualChassisID},workloadID=${workloadItem},DC=${dcItem}] rgw workload in DC#${dcItem} needs index pool on dedicated NVMe for SSD1(NVMe5):${localDCRequiredIndexCapacityOnNVMe5NorWAL}`,0,0,0)
                  }
                }
                else {
                  // RocksDB is on SSD1
                  if (workloadsArrayLocal[workloadItem].selectorSSDDedicatedNVMeForWAL === true) {
                    localDCRequiredIndexCapacityOnSSD1DedicatedWAL += localDCObjectIndexCapacity * workloadsArrayLocal[workloadItem].reqFlashPercent / 100
                    debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 341, `[chassisID=${actualChassisID},workloadID=${workloadItem},DC=${dcItem}] rgw workload in DC#${dcItem} - no dedicated NVMe for RocksDB - needs index capacity on SSD1 - w/ extra WAL:${localDCRequiredIndexCapacityOnSSD1DedicatedWAL}`,0,0,0)
                  }
                  else {
                    localDCRequiredIndexCapacityOnSSD1NorWAL += localDCObjectIndexCapacity * workloadsArrayLocal[workloadItem].reqFlashPercent / 100
                    debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 345, `[chassisID=${actualChassisID},workloadID=${workloadItem},DC=${dcItem}] rgw workload in DC#${dcItem} - no dedicated NVMe for RocksDB nor WAL - needs index capacity on SSD1:${localDCRequiredIndexCapacityOnSSD1NorWAL}`,0,0,0)
                  }
                }
              }
            }

            // Determine the need of RGW dedicated cache and sum up a dedicated media per workload and minNumber of instances for RGW per workload
            if (workloadsArrayLocal[workloadItem].selectorRGWCache === true) {
              if (chassisArrayLocal[actualChassisID].useRGWCaching == 1) {
                localDCNumberOfRGWCacheMedia += sizingConstraints.minNumberOfInstancesRoleRGW
                debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 355, `[chassisID=${actualChassisID},workloadID=${workloadItem},DC=${dcItem}] RGW cache media needed=${localDCNumberOfRGWCacheMedia}`,0,0,0)
              }
              else {
                displayMsg(document, "dcConfigDetermineNumberOfMediaRequired", 347, "error", `[chassisID=${actualChassisID},workloadID=${workloadItem},DC=${dcItem}] RGW cache media selected but chassis doesn't support it`,0,0,0)
              }
              
            }

            // Apply corrections to RGW use cases based on avg object size   ===> This might need to go prior to calculating the media and assigning it top of the function
            // Both values in TB. Since the value of gross capacity for the workload is not reflecting the capacity distribution across DCs, the number of DCs in use for the workload needs to be 
            //   taken into account, since this here is reflecting the actual needed capacity on the media inside a specific DC - for all individual workloads.
            localWorkloadCorrectionForUnalignedObjectsHDD = (((workloadsArrayLocal[workloadItem].sizeAvgObj*1024) % sizingConstraints.fixedMinAllocSizeOnMediaHDD) / (workloadsArrayLocal[workloadItem].sizeAvgObj*1024)) * workloadsArrayLocal[workloadItem].reqCapacityGrossHDD / workloadsArrayLocal[workloadItem].sumNumberDC
            debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 367, `[chassisID=${actualChassisID},workloadID=${workloadItem},DC=${dcItem}] (workloadsArrayLocal[workloadItem].sizeAvgObj*1024) % sizingConstraints.fixedMinAllocSizeOnMediaHDD=${(workloadsArrayLocal[workloadItem].sizeAvgObj*1024) % sizingConstraints.fixedMinAllocSizeOnMediaHDD} `,0,0,0)
            debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 368, `[chassisID=${actualChassisID},workloadID=${workloadItem},DC=${dcItem}] workloadsArrayLocal[workloadItem].sizeAvgObj*1024=${workloadsArrayLocal[workloadItem].sizeAvgObj*1024}`,0,0,0)
            debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 369, `[chassisID=${actualChassisID},workloadID=${workloadItem},DC=${dcItem}] (((workloadsArrayLocal[workloadItem].sizeAvgObj*1024) % sizingConstraints.fixedMinAllocSizeOnMediaHDD) / (workloadsArrayLocal[workloadItem].sizeAvgObj*1024))=${(((workloadsArrayLocal[workloadItem].sizeAvgObj*1024) % sizingConstraints.fixedMinAllocSizeOnMediaHDD) / (workloadsArrayLocal[workloadItem].sizeAvgObj*1024))}`,0,0,0)
            debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 370, `[chassisID=${actualChassisID},workloadID=${workloadItem},DC=${dcItem}] localWorkloadCorrectionForUnalignedObjectsHDD = (((workloadsArrayLocal[workloadItem].sizeAvgObj*1024) % sizingConstraints.fixedMinAllocSizeOnMediaHDD) / (workloadsArrayLocal[workloadItem].sizeAvgObj*1024)) * workloadsArrayLocal[workloadItem].reqCapacityGrossHDD / workloadsArrayLocal[workloadItem].sumNumberDC = ${(((workloadsArrayLocal[workloadItem].sizeAvgObj*1024) % sizingConstraints.fixedMinAllocSizeOnMediaHDD) /(workloadsArrayLocal[workloadItem].sizeAvgObj*1024)) * workloadsArrayLocal[workloadItem].reqCapacityGrossHDD / workloadsArrayLocal[workloadItem].sumNumberDC}`,0,0,0)
            if (workloadsArrayLocal[workloadItem].selectorHDDDedicatedNVMe === true) {
              // RocksDB is on NVMe4 - so index as well even with dedicated WAL
              if (workloadsArrayLocal[workloadItem].selectorHDDDedicatedNVMeForWAL === true) {
                localDCCorrectionForUnalignedObjectsHDD1OnNVMe4DedicatedWALonNVMe9 += localWorkloadCorrectionForUnalignedObjectsHDD
              }
              else {
                if (workloadsArrayLocal[workloadItem].selectorHDDDedicatedSSDForWAL === true) {
                  localDCCorrectionForUnalignedObjectsHDD1OnNVMe4DedicatedWALonSSD9 += localWorkloadCorrectionForUnalignedObjectsHDD
                }
                else {
                // RocksDB is on NVMe4
                localDCCorrectionForUnalignedObjectsHDD1OnNVMe4IncludingWAL += localWorkloadCorrectionForUnalignedObjectsHDD
                }
              }
            }
            else {
              if (workloadsArrayLocal[workloadItem].selectorHDDDedicatedSSD === true) {
                // RocksDB is on SSD
                if (workloadsArrayLocal[workloadItem].selectorHDDDedicatedNVMeForWAL === true) {
                  localDCCorrectionForUnalignedObjectsHDD1OnSSD4DedicatedWALonNVMe9 += localWorkloadCorrectionForUnalignedObjectsHDD
                  debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 391, `[chassisID=${actualChassisID},workloadID=${workloadItem},DC=${dcItem}] rgw workload in DC#${dcItem} - no dedicated NVMe for RocksDB - needs index capacity on SSD1 - w/ extra WAL:${localDCRequiredIndexCapacityOnSSD1DedicatedWAL}`,0,0,0)
                }
                else {
                  if (workloadsArrayLocal[workloadItem].selectorHDDDedicatedSSDForWAL === true) {
                    localDCCorrectionForUnalignedObjectsHDD1OnSSD4DedicatedWALonSSD9 += localWorkloadCorrectionForUnalignedObjectsHDD
                    debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 396, `[chassisID=${actualChassisID},workloadID=${workloadItem},DC=${dcItem}] rgw workload in DC#${dcItem} - no dedicated NVMe for RocksDB - needs index capacity on SSD1 - w/ extra WAL:${localDCRequiredIndexCapacityOnSSD1DedicatedWAL}`,0,0,0)
                  }
                  else {
                    localDCCorrectionForUnalignedObjectsHDD1OnSSD4IncludingWAL += localWorkloadCorrectionForUnalignedObjectsHDD
                    debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 400, `[chassisID=${actualChassisID},workloadID=${workloadItem},DC=${dcItem}] rgw workload in DC#${dcItem} - no dedicated NVMe for RocksDB nor WAL - needs index capacity on SSD1:${localDCRequiredIndexCapacityOnSSD1NorWAL}`,0,0,0)
                  }
                }
              }
              else {
                // RocksDB is on HDD
                if (workloadsArrayLocal[workloadItem].selectorHDDDedicatedNVMeForWAL === true) {
                  localDCCorrectionForUnalignedObjectsHDD1WithoutDedicatedRocksDBDedicatedWALonNVMe9 += localWorkloadCorrectionForUnalignedObjectsHDD
                  debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 408, `[chassisID=${actualChassisID},workloadID=${workloadItem},DC=${dcItem}] rgw workload in DC#${dcItem} - no dedicated NVMe for RocksDB - needs index capacity on SSD1 - w/ extra WAL:${localDCRequiredIndexCapacityOnSSD1DedicatedWAL}`,0,0,0)
                }
                else {
                  if (workloadsArrayLocal[workloadItem].selectorHDDDedicatedSSDForWAL === true) {
                    localDCCorrectionForUnalignedObjectsHDD1WithoutDedicatedRocksDBDedicatedWALonSSD9 += localWorkloadCorrectionForUnalignedObjectsHDD
                    debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 413, `[chassisID=${actualChassisID},workloadID=${workloadItem},DC=${dcItem}] rgw workload in DC#${dcItem} - no dedicated NVMe for RocksDB - needs index capacity on SSD1 - w/ extra WAL:${localDCRequiredIndexCapacityOnSSD1DedicatedWAL}`,0,0,0)
                  }
                  else {  
                    localDCCorrectionForUnalignedObjectsHDD1WithoutDedicatedRocksDBNorWAL += localWorkloadCorrectionForUnalignedObjectsHDD
                    debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 417, `[chassisID=${actualChassisID},workloadID=${workloadItem},DC=${dcItem}] rgw workload in DC#${dcItem} - no dedicated NVMe for RocksDB nor WAL - needs index capacity on SSD1:${localDCRequiredIndexCapacityOnSSD1NorWAL}`,0,0,0)
                  }
                }

              }
            }

            // for flash: distinguish between included and dedicated RocksDB media - not for data placement but for picking the right deployment schemes selected for the workloads
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
              // SSD1
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
            debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 469, `[chassisID=${actualChassisID},workloadID=${workloadItem},DC=${dcItem}] local capacity correction unaligned RGW object parts - for HDD=${localWorkloadCorrectionForUnalignedObjectsHDD}`,0,0,0)
            debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 470, `[chassisID=${actualChassisID},workloadID=${workloadItem},DC=${dcItem}] local capacity correction unaligned file parts - for SSD w/ RocksDB w/ WAL =${localDCCorrectionForUnalignedObjectsSSD1WithDedicatedRocksDBDedicatedWAL}, for SSD w/ RocksDB w/o WAL =${localDCCorrectionForUnalignedObjectsSSD1WithDedicatedRocksDBIncludingWAL}`,0,0,0)
            debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 471, `[chassisID=${actualChassisID},workloadID=${workloadItem},DC=${dcItem}] local capacity correction unaligned file parts - for SSD w/o RocksDB w/ WAL =${localDCCorrectionForUnalignedObjectsSSD1WithoutDedicatedRocksDBDedicatedWAL}, for SSD w/o RocksDB w/o WAL =${localDCCorrectionForUnalignedObjectsSSD1WithoutDedicatedRocksDBNorWAL}`,0,0,0)
            debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 472, `[chassisID=${actualChassisID},workloadID=${workloadItem},DC=${dcItem}] local capacity correction unaligned file parts - for NVMe w/ RocksDB w/ WAL =${localDCCorrectionForUnalignedObjectsNVMe1WithDedicatedRocksDBDedicatedWAL}, for NVMe w/ RocksDB w/o WAL =${localDCCorrectionForUnalignedObjectsNVMe1WithDedicatedRocksDBIncludingWAL}`,0,0,0)
            debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 473, `[chassisID=${actualChassisID},workloadID=${workloadItem},DC=${dcItem}] local capacity correction unaligned file parts - for NVMe w/o RocksDB w/ WAL =${localDCCorrectionForUnalignedObjectsNVMe1WithoutDedicatedRocksDBDedicatedWAL}, for NVMe w/o RocksDB w/o WAL =${localDCCorrectionForUnalignedObjectsNVMe1WithoutDedicatedRocksDBNorWAL}`,0,0,0)
          }    

          // CephFS workloads
          if (workloadsArrayLocal[workloadItem].selectorArrayDC[dcItem] === true && workloadsArrayLocal[workloadItem].useCase === "filedata" ) { 
            debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 478, `[chassisID=${actualChassisID},workloadID=${workloadItem},DC=${dcItem}] CephFS workload in DC#${dcItem} - selection: workloadsArrayLocal[workloadItem].selectorHDDDedicatedNVMe=${workloadsArrayLocal[workloadItem].selectorHDDDedicatedNVMe}`,0,0,0)
            debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 479, `[chassisID=${actualChassisID},workloadID=${workloadItem},DC=${dcItem}] CephFS workload in DC#${dcItem} - selection: workloadsArrayLocal[workloadItem].selectorHDDDedicatedNVMeForWAL=${workloadsArrayLocal[workloadItem].selectorHDDDedicatedNVMeForWAL}`,0,0,0)
            debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 480, `[chassisID=${actualChassisID},workloadID=${workloadItem},DC=${dcItem}] CephFS workload in DC#${dcItem} - selection: workloadsArrayLocal[workloadItem].selectorHDDDedicatedSSD=${workloadsArrayLocal[workloadItem].selectorHDDDedicatedSSD}`,0,0,0)
            debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 481, `[chassisID=${actualChassisID},workloadID=${workloadItem},DC=${dcItem}] CephFS workload in DC#${dcItem} - selection: workloadsArrayLocal[workloadItem].selectorHDDDedicatedSSDForWAL=${workloadsArrayLocal[workloadItem].selectorHDDDedicatedSSDForWAL}`,0,0,0)
            debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 482, `[chassisID=${actualChassisID},workloadID=${workloadItem},DC=${dcItem}] CephFS workload in DC#${dcItem} - selection: workloadsArrayLocal[workloadItem].selectorSSDDedicatedNVMe=${workloadsArrayLocal[workloadItem].selectorSSDDedicatedNVMe}`,0,0,0)
            debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 483, `[chassisID=${actualChassisID},workloadID=${workloadItem},DC=${dcItem}] CephFS workload in DC#${dcItem} - selection: workloadsArrayLocal[workloadItem].selectorSSDDedicatedNVMeForWAL=${workloadsArrayLocal[workloadItem].selectorSSDDedicatedNVMeForWAL}`,0,0,0)
            debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 484, `[chassisID=${actualChassisID},workloadID=${workloadItem},DC=${dcItem}] CephFS workload in DC#${dcItem} - selection: workloadsArrayLocal[workloadItem].selectorNVMe1DedicatedNVMe=${workloadsArrayLocal[workloadItem].selectorNVMe1DedicatedNVMe}`,0,0,0)
            debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 485, `[chassisID=${actualChassisID},workloadID=${workloadItem},DC=${dcItem}] CephFS workload in DC#${dcItem} - selection: workloadsArrayLocal[workloadItem].selectorNVMe1DedicatedNVMeForWAL=${workloadsArrayLocal[workloadItem].selectorNVMe1DedicatedNVMeForWAL}`,0,0,0)
            // Apply corrections to cephfs use cases based on avg file size
            // Both values in TB. Since the value of gross capacity for the workload is not reflecting the capacity distribution across DCs, the number of DCs in use for the workload needs to be 
            //   taken into account, since this here is reflecting the actual needed capacity on the media inside a specific DC - for all individual workloads.
            
            // For HDD, by default, recommended with fronting flash for RocksDB, it needs to be allocated on NVMe4 / or SSD4
            localWorkloadCorrectionForUnalignedObjectsHDD = (((workloadsArrayLocal[workloadItem].sizeAvgFile*1024) % sizingConstraints.fixedMinAllocSizeOnMediaHDD) / (workloadsArrayLocal[workloadItem].sizeAvgFile*1024)) * workloadsArrayLocal[workloadItem].reqCapacityGrossHDD / workloadsArrayLocal[workloadItem].sumNumberDC
            if (workloadsArrayLocal[workloadItem].selectorHDDDedicatedNVMe == true) {
              // RocksDB is on NVMe4 - so index as well even with dedicated WAL
              if (workloadsArrayLocal[workloadItem].selectorHDDDedicatedNVMeForWAL == true) {
                localDCCorrectionForUnalignedObjectsHDD1OnNVMe4DedicatedWALonNVMe9 += localWorkloadCorrectionForUnalignedObjectsHDD
                debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 496, `[chassisID=${actualChassisID},workloadID=${workloadItem},DC=${dcItem}] CephFS workload in DC#${dcItem} - dedicated NVMe4 for RocksDB - needs index capacity on NVMe4 - w/ extra WAL on NVMe9:${localDCCorrectionForUnalignedObjectsHDD1OnNVMe4DedicatedWALonNVMe9}`,0,0,0)
              }
              else {
                if (workloadsArrayLocal[workloadItem].selectorHDDDedicatedSSDForWAL == true) {
                  localDCCorrectionForUnalignedObjectsHDD1OnNVMe4DedicatedWALonSSD9 += localWorkloadCorrectionForUnalignedObjectsHDD
                  debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 501, `[chassisID=${actualChassisID},workloadID=${workloadItem},DC=${dcItem}] CephFS workload in DC#${dcItem} - dedicated NVMe4 for RocksDB - needs index capacity on NVMe4 - w/ extra WAL on SSD9:${localDCCorrectionForUnalignedObjectsHDD1OnNVMe4DedicatedWALonSSD9}`,0,0,0)
                }
                else {
                localDCCorrectionForUnalignedObjectsHDD1OnNVMe4IncludingWAL += localWorkloadCorrectionForUnalignedObjectsHDD
                debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 505, `[chassisID=${actualChassisID},workloadID=${workloadItem},DC=${dcItem}] CephFS workload in DC#${dcItem} - dedicated NVMe4 for RocksDB - needs index capacity on NVMe4 - no extra WAL:${localDCCorrectionForUnalignedObjectsHDD1OnNVMe4IncludingWAL}`,0,0,0)
                }
              }
            }
            else {
              if (workloadsArrayLocal[workloadItem].selectorHDDDedicatedSSD == true) {
                // RocksDB is on SSD 
                if (workloadsArrayLocal[workloadItem].selectorHDDDedicatedNVMeForWAL == true) {
                  localDCCorrectionForUnalignedObjectsHDD1OnSSD4DedicatedWALonNVMe9 += localWorkloadCorrectionForUnalignedObjectsHDD
                  debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 514, `[chassisID=${actualChassisID},workloadID=${workloadItem},DC=${dcItem}] CephFS workload in DC#${dcItem} - dedicated SSD for RocksDB - needs index capacity on SSD4 - w/ extra WAL on NVMe9:${localDCCorrectionForUnalignedObjectsHDD1OnSSD4DedicatedWALonNVMe9}`,0,0,0)
                }
                else {
                  if (workloadsArrayLocal[workloadItem].selectorHDDDedicatedSSDForWAL == true) {
                    localDCCorrectionForUnalignedObjectsHDD1OnSSD4DedicatedWALonSSD9 += localWorkloadCorrectionForUnalignedObjectsHDD
                    debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 519, `[chassisID=${actualChassisID},workloadID=${workloadItem},DC=${dcItem}] CephFS workload in DC#${dcItem} - dedicated SSD for RocksDB - needs index capacity on SSD4 - w/ extra WAL on SSD9:${localDCCorrectionForUnalignedObjectsHDD1OnSSD4DedicatedWALonSSD9}`,0,0,0)
                  }
                  else {
                    localDCCorrectionForUnalignedObjectsHDD1OnSSD4IncludingWAL += localWorkloadCorrectionForUnalignedObjectsHDD
                    debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 523, `[chassisID=${actualChassisID},workloadID=${workloadItem},DC=${dcItem}] CephFS workload in DC#${dcItem} - dedicated SSD for RocksDB - needs index capacity on SSD4 - no extra WAL:${localDCCorrectionForUnalignedObjectsHDD1OnSSD4IncludingWAL}`,0,0,0)
                  }
                }
              }
              else {
                // RocksDB is on HDD
                if (workloadsArrayLocal[workloadItem].selectorHDDDedicatedNVMeForWAL == true) {
                  localDCCorrectionForUnalignedObjectsHDD1WithoutDedicatedRocksDBDedicatedWALonNVMe9 += localWorkloadCorrectionForUnalignedObjectsHDD
                  debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 531, `[chassisID=${actualChassisID},workloadID=${workloadItem},DC=${dcItem}] CephFS workload in DC#${dcItem} - no dedicated NVMe nor SSD for RocksDB - needs index capacity on HDD1 - w/ extra WAL on NVMe9:${localDCCorrectionForUnalignedObjectsHDD1WithoutDedicatedRocksDBDedicatedWALonNVMe9}`,0,0,0)
                }
                else {
                  if (workloadsArrayLocal[workloadItem].selectorHDDDedicatedSSDForWAL == true) {
                    localDCCorrectionForUnalignedObjectsHDD1WithoutDedicatedRocksDBDedicatedWALonSSD9 += localWorkloadCorrectionForUnalignedObjectsHDD
                    debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 536, `[chassisID=${actualChassisID},workloadID=${workloadItem},DC=${dcItem}] CephFS workload in DC#${dcItem} - no dedicated NVMe nor SSD for RocksDB - needs index capacity on HDD1 - w/ extra WAL on SSD():${localDCCorrectionForUnalignedObjectsHDD1WithoutDedicatedRocksDBDedicatedWALonSSD9}`,0,0,0)
                  }
                  else {  
                    localDCCorrectionForUnalignedObjectsHDD1WithoutDedicatedRocksDBNorWAL += localWorkloadCorrectionForUnalignedObjectsHDD
                    debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 540, `[chassisID=${actualChassisID},workloadID=${workloadItem},DC=${dcItem}] CephFS workload in DC#${dcItem} - no dedicated NVMe nor SSD for RocksDB nor WAL - needs index capacity on HDD1 - no extra WAL:${localDCCorrectionForUnalignedObjectsHDD1WithoutDedicatedRocksDBNorWAL}`,0,0,0)
                  }
                }

              }
            }

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
              debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 570, `[chassisID=${actualChassisID},workloadID=${workloadItem},DC=${dcItem}] localWorkloadCorrectionForUnalignedObjectsSSD=${localWorkloadCorrectionForUnalignedObjectsSSD} = (((workloadsArrayLocal[workloadItem].sizeAvgFile=${workloadsArrayLocal[workloadItem].sizeAvgFile} * 1024) % sizingConstraints.fixedMinAllocSizeOnMediaSSD=${sizingConstraints.fixedMinAllocSizeOnMediaSSD}) / (workloadsArrayLocal[workloadItem].sizeAvgFile=${workloadsArrayLocal[workloadItem].sizeAvgFile} * 1024)) * workloadsArrayLocal[workloadItem].reqCapacityGrossSSD=${workloadsArrayLocal[workloadItem].reqCapacityGrossSSD} / workloadsArrayLocal[workloadItem].sumNumberDC=${workloadsArrayLocal[workloadItem].sumNumberDC}`,0,0,0)
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
            
            debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 589, `[chassisID=${actualChassisID},workloadID=${workloadItem},DC=${dcItem}] local capacity correction unaligned file parts - for HDD=${localDCCorrectionForUnalignedObjectsHDD1WithoutDedicatedRocksDBDedicatedWALonNVMe9}`,0,0,0)
            debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 590, `[chassisID=${actualChassisID},workloadID=${workloadItem},DC=${dcItem}] local capacity correction unaligned file parts - for HDD=${localDCCorrectionForUnalignedObjectsHDD1WithoutDedicatedRocksDBDedicatedWALonSSD9}`,0,0,0)
            debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 591, `[chassisID=${actualChassisID},workloadID=${workloadItem},DC=${dcItem}] local capacity correction unaligned file parts - for HDD=${localDCCorrectionForUnalignedObjectsHDD1WithoutDedicatedRocksDBNorWAL}`,0,0,0)
            debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 592, `[chassisID=${actualChassisID},workloadID=${workloadItem},DC=${dcItem}] local capacity correction unaligned file parts - for HDD=${localDCCorrectionForUnalignedObjectsHDD1OnSSD4DedicatedWALonNVMe9}`,0,0,0)
            debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 593, `[chassisID=${actualChassisID},workloadID=${workloadItem},DC=${dcItem}] local capacity correction unaligned file parts - for HDD=${localDCCorrectionForUnalignedObjectsHDD1OnSSD4DedicatedWALonSSD9}`,0,0,0)
            debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 594, `[chassisID=${actualChassisID},workloadID=${workloadItem},DC=${dcItem}] local capacity correction unaligned file parts - for HDD=${localDCCorrectionForUnalignedObjectsHDD1OnSSD4IncludingWAL}`,0,0,0)
            debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 595, `[chassisID=${actualChassisID},workloadID=${workloadItem},DC=${dcItem}] local capacity correction unaligned file parts - for HDD=${localDCCorrectionForUnalignedObjectsHDD1OnNVMe4DedicatedWALonNVMe9}`,0,0,0)
            debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 596, `[chassisID=${actualChassisID},workloadID=${workloadItem},DC=${dcItem}] local capacity correction unaligned file parts - for HDD=${localDCCorrectionForUnalignedObjectsHDD1OnNVMe4DedicatedWALonSSD9}`,0,0,0)
            debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 597, `[chassisID=${actualChassisID},workloadID=${workloadItem},DC=${dcItem}] local capacity correction unaligned file parts - for HDD=${localDCCorrectionForUnalignedObjectsHDD1OnNVMe4IncludingWAL}`,0,0,0)
            debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 598, `[chassisID=${actualChassisID},workloadID=${workloadItem},DC=${dcItem}] local capacity correction unaligned file parts - for SSD w/ RocksDB w/ WAL =${localDCCorrectionForUnalignedObjectsSSD1WithDedicatedRocksDBDedicatedWAL}, for SSD w/ RocksDB w/o WAL =${localDCCorrectionForUnalignedObjectsSSD1WithDedicatedRocksDBIncludingWAL}`,0,0,0)
            debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 599, `[chassisID=${actualChassisID},workloadID=${workloadItem},DC=${dcItem}] local capacity correction unaligned file parts - for SSD w/o RocksDB w/ WAL =${localDCCorrectionForUnalignedObjectsSSD1WithoutDedicatedRocksDBDedicatedWAL}, for SSD w/o RocksDB w/o WAL =${localDCCorrectionForUnalignedObjectsSSD1WithoutDedicatedRocksDBNorWAL}`,0,0,0)
            debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 600, `[chassisID=${actualChassisID},workloadID=${workloadItem},DC=${dcItem}] local capacity correction unaligned file parts - for NVMe w/ RocksDB w/ WAL =${localDCCorrectionForUnalignedObjectsNVMe1WithDedicatedRocksDBDedicatedWAL}, for NVMe w/ RocksDB w/o WAL =${localDCCorrectionForUnalignedObjectsNVMe1WithDedicatedRocksDBIncludingWAL}`,0,0,0)
            debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 601, `[chassisID=${actualChassisID},workloadID=${workloadItem},DC=${dcItem}] local capacity correction unaligned file parts - for NVMe w/o RocksDB w/ WAL =${localDCCorrectionForUnalignedObjectsNVMe1WithoutDedicatedRocksDBDedicatedWAL}, for NVMe w/o RocksDB w/o WAL =${localDCCorrectionForUnalignedObjectsNVMe1WithoutDedicatedRocksDBNorWAL}`,0,0,0)
          }
          
          // For all capacity related calculation for real data placement
          if (workloadsArrayLocal[workloadItem].selectorArrayDC[dcItem] === true) {
            // RocksDB size must be calculated for any case: based on raw capacity needed for the workload in the DC plus the correction for unaligned data or data portions or object index - then decide where this additional
            //   capacity should go to: either dedicated media or the block device (for flash storage)
            localWorkloadRocksDBSizeHDD = workloadsArrayLocal[workloadItem].reqCapacityGrossHDD / workloadsArrayLocal[workloadItem].sumNumberDC * workloadsArrayLocal[workloadItem].rocksDBSpaceInPercent / 100 + localWorkloadCorrectionForUnalignedObjectsHDD
            debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 609, `[chassisID=${actualChassisID},workloadID=${workloadItem},DC=${dcItem}] CHECK RocksDB size for HDD1 capacity: localWorkloadRocksDBSizeHDD=${localWorkloadRocksDBSizeHDD} = ${workloadsArrayLocal[workloadItem].reqCapacityGrossHDD} / ${workloadsArrayLocal[workloadItem].sumNumberDC} * ${workloadsArrayLocal[workloadItem].rocksDBSpaceInPercent} / 100 + ${localWorkloadCorrectionForUnalignedObjectsHDD}`,0,0,0)
            
            if (workloadsArrayLocal[workloadItem].selectorHDDDedicatedNVMe === true) {
              // RocksDB is on NVMe4 - so index as well even with dedicated WAL
              if (workloadsArrayLocal[workloadItem].selectorHDDDedicatedNVMeForWAL === true) {
                localWorkloadRocksDBSizeHDDWithDedicatedNVMe4DedicatedWALonNVMe9 = workloadsArrayLocal[workloadItem].reqCapacityGrossHDD / workloadsArrayLocal[workloadItem].sumNumberDC * workloadsArrayLocal[workloadItem].rocksDBSpaceInPercent / 100
                debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 615, `[chassisID=${actualChassisID},workloadID=${workloadItem},DC=${dcItem}] CHECK RocksDB on dedicated NVMe4: localWorkloadRocksDBSizeHDDWithDedicatedNVMe4DedicatedWALonNVMe9=${localWorkloadRocksDBSizeHDDWithDedicatedNVMe4DedicatedWALonNVMe9} = ${workloadsArrayLocal[workloadItem].reqCapacityGrossHDD } / ${workloadsArrayLocal[workloadItem].sumNumberDC} * ${workloadsArrayLocal[workloadItem].rocksDBSpaceInPercent} / 100`,0,0,0)
                localDCRocksDBSizeHDDWithDedicatedNVMe4DedicatedWALonNVMe9 += localWorkloadRocksDBSizeHDDWithDedicatedNVMe4DedicatedWALonNVMe9
                localHDDCapacityWithDedicatedRocksDBNVMe4DedicatedWALonNVMe9 += workloadsArrayLocal[workloadItem].reqCapacityGrossHDD / workloadsArrayLocal[workloadItem].sumNumberDC
              }
              else {
                if (workloadsArrayLocal[workloadItem].selectorHDDDedicatedSSDForWAL === true) {
                  localWorkloadRocksDBSizeHDDWithDedicatedNVMe4DedicatedWALonSSD9 = workloadsArrayLocal[workloadItem].reqCapacityGrossHDD / workloadsArrayLocal[workloadItem].sumNumberDC * workloadsArrayLocal[workloadItem].rocksDBSpaceInPercent / 100
                  debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 622, `[chassisID=${actualChassisID},workloadID=${workloadItem},DC=${dcItem}] CHECK RocksDB on dedicated NVMe4: localWorkloadRocksDBSizeHDDWithDedicatedNVMe4DedicatedWALonSSD9=${localWorkloadRocksDBSizeHDDWithDedicatedNVMe4DedicatedWALonSSD9} = ${workloadsArrayLocal[workloadItem].reqCapacityGrossHDD } / ${workloadsArrayLocal[workloadItem].sumNumberDC} * ${workloadsArrayLocal[workloadItem].rocksDBSpaceInPercent} / 100`,0,0,0)
                  localDCRocksDBSizeHDDWithDedicatedNVMe4DedicatedWALonSSD9 += localWorkloadRocksDBSizeHDDWithDedicatedNVMe4DedicatedWALonSSD9
                  localHDDCapacityWithDedicatedRocksDBNVMe4DedicatedWALonSSD9 += workloadsArrayLocal[workloadItem].reqCapacityGrossHDD / workloadsArrayLocal[workloadItem].sumNumberDC
                }
                else {
                // RocksDB is on NVMe4
                  localWorkloadRocksDBSizeHDDWithDedicatedNVMe4IncludingWAL = workloadsArrayLocal[workloadItem].reqCapacityGrossHDD / workloadsArrayLocal[workloadItem].sumNumberDC * workloadsArrayLocal[workloadItem].rocksDBSpaceInPercent / 100
                  debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 629, `[chassisID=${actualChassisID},workloadID=${workloadItem},DC=${dcItem}] CHECK RocksDB on dedicated NVMe4: localWorkloadRocksDBSizeHDDWithDedicatedNVMe4IncludingWAL=${localWorkloadRocksDBSizeHDDWithDedicatedNVMe4IncludingWAL} = ${workloadsArrayLocal[workloadItem].reqCapacityGrossHDD } / ${workloadsArrayLocal[workloadItem].sumNumberDC} * ${workloadsArrayLocal[workloadItem].rocksDBSpaceInPercent} / 100`,0,0,0)
                  localDCRocksDBSizeHDDWithDedicatedNVMe4IncludingWAL += localWorkloadRocksDBSizeHDDWithDedicatedNVMe4IncludingWAL
                  localHDDCapacityWithDedicatedRocksDBNVMe4IncludingWAL += workloadsArrayLocal[workloadItem].reqCapacityGrossHDD / workloadsArrayLocal[workloadItem].sumNumberDC
                }
              }
            }
            else {
              if (workloadsArrayLocal[workloadItem].selectorHDDDedicatedSSD === true) {
                // RocksDB is on SSD
                if (workloadsArrayLocal[workloadItem].selectorHDDDedicatedNVMeForWAL === true) {
                  localWorkloadRocksDBSizeHDDWithDedicatedSSD4DedicatedWALonNVMe9 = workloadsArrayLocal[workloadItem].reqCapacityGrossHDD / workloadsArrayLocal[workloadItem].sumNumberDC * workloadsArrayLocal[workloadItem].rocksDBSpaceInPercent / 100
                  debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 640, `[chassisID=${actualChassisID},workloadID=${workloadItem},DC=${dcItem}] CHECK RocksDB on dedicated SSD4: localWorkloadRocksDBSizeHDDWithDedicatedSSD4DedicatedWALonNVMe9=${localWorkloadRocksDBSizeHDDWithDedicatedSSD4DedicatedWALonNVMe9} = ${workloadsArrayLocal[workloadItem].reqCapacityGrossHDD } / ${workloadsArrayLocal[workloadItem].sumNumberDC} * ${workloadsArrayLocal[workloadItem].rocksDBSpaceInPercent} / 100`,0,0,0)
                  localDCRocksDBSizeHDDWithDedicatedSSD4DedicatedWALonNVMe9 += localWorkloadRocksDBSizeHDDWithDedicatedSSD4DedicatedWALonNVMe9
                  localHDDCapacityWithDedicatedRocksDBSSD4DedicatedWALonNVMe9 += workloadsArrayLocal[workloadItem].reqCapacityGrossHDD / workloadsArrayLocal[workloadItem].sumNumberDC
                }
                else {
                  if (workloadsArrayLocal[workloadItem].selectorHDDDedicatedSSDForWAL === true) {
                    localWorkloadRocksDBSizeHDDWithDedicatedSSD4DedicatedWALonSSD9 = workloadsArrayLocal[workloadItem].reqCapacityGrossHDD / workloadsArrayLocal[workloadItem].sumNumberDC * workloadsArrayLocal[workloadItem].rocksDBSpaceInPercent / 100
                    debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 647, `[chassisID=${actualChassisID},workloadID=${workloadItem},DC=${dcItem}] CHECK RocksDB on dedicated SSD4:  localWorkloadRocksDBSizeHDDWithDedicatedSSD4DedicatedWALonSSD9=${localWorkloadRocksDBSizeHDDWithDedicatedSSD4DedicatedWALonSSD9} ${workloadsArrayLocal[workloadItem].reqCapacityGrossHDD } / ${workloadsArrayLocal[workloadItem].sumNumberDC} * ${workloadsArrayLocal[workloadItem].rocksDBSpaceInPercent} / 100`,0,0,0)
                    localDCRocksDBSizeHDDWithDedicatedSSD4DedicatedWALonSSD9 += localWorkloadRocksDBSizeHDDWithDedicatedSSD4DedicatedWALonSSD9
                    localHDDCapacityWithDedicatedRocksDBSSD4DedicatedWALonSSD9 += workloadsArrayLocal[workloadItem].reqCapacityGrossHDD / workloadsArrayLocal[workloadItem].sumNumberDC
                  }
                  else {
                    localWorkloadRocksDBSizeHDDWithDedicatedSSD4IncludingWAL = workloadsArrayLocal[workloadItem].reqCapacityGrossHDD / workloadsArrayLocal[workloadItem].sumNumberDC * workloadsArrayLocal[workloadItem].rocksDBSpaceInPercent / 100
                    debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 653, `[chassisID=${actualChassisID},workloadID=${workloadItem},DC=${dcItem}] CHECK RocksDB on dedicated SSD4: localWorkloadRocksDBSizeHDDWithDedicatedSSD4IncludingWAL=${localWorkloadRocksDBSizeHDDWithDedicatedSSD4IncludingWAL} = ${workloadsArrayLocal[workloadItem].reqCapacityGrossHDD } / ${workloadsArrayLocal[workloadItem].sumNumberDC} * ${workloadsArrayLocal[workloadItem].rocksDBSpaceInPercent} / 100`,0,0,0)
                    localDCRocksDBSizeHDDWithDedicatedSSD4IncludingWAL += localWorkloadRocksDBSizeHDDWithDedicatedSSD4IncludingWAL
                    localHDDCapacityWithDedicatedRocksDBSSD4IncludingWAL += workloadsArrayLocal[workloadItem].reqCapacityGrossHDD / workloadsArrayLocal[workloadItem].sumNumberDC
                  }
                }
              }
              else {
                // RocksDB is on HDD
                if (workloadsArrayLocal[workloadItem].selectorHDDDedicatedNVMeForWAL === true) {
                  localWorkloadRocksDBSizeHDDWithoutDedicatedRocksDBDedicatedWALonNVMe9 = workloadsArrayLocal[workloadItem].reqCapacityGrossHDD / workloadsArrayLocal[workloadItem].sumNumberDC * workloadsArrayLocal[workloadItem].rocksDBSpaceInPercent / 100
                  debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 663, `[chassisID=${actualChassisID},workloadID=${workloadItem},DC=${dcItem}] CHECK RocksDB on HDD1:  localWorkloadRocksDBSizeHDDWithoutDedicatedRocksDBDedicatedWALonNVMe9=${localWorkloadRocksDBSizeHDDWithoutDedicatedRocksDBDedicatedWALonNVMe9} ${workloadsArrayLocal[workloadItem].reqCapacityGrossHDD } / ${workloadsArrayLocal[workloadItem].sumNumberDC} * ${workloadsArrayLocal[workloadItem].rocksDBSpaceInPercent} / 100}`,0,0,0)
                  localDCRocksDBSizeHDDWithoutDedicatedRocksDBDedicatedWALonNVMe9 += localWorkloadRocksDBSizeHDDWithoutDedicatedRocksDBDedicatedWALonNVMe9
                  localHDDCapacityWithoutDedicatedRocksDBDedicatedWALonNVMe9 += workloadsArrayLocal[workloadItem].reqCapacityGrossHDD / workloadsArrayLocal[workloadItem].sumNumberDC
                }
                else {
                  if (workloadsArrayLocal[workloadItem].selectorHDDDedicatedSSDForWAL === true) {
                    localWorkloadRocksDBSizeHDDWithoutDedicatedRocksDBDedicatedWALonSSD9 = workloadsArrayLocal[workloadItem].reqCapacityGrossHDD / workloadsArrayLocal[workloadItem].sumNumberDC * workloadsArrayLocal[workloadItem].rocksDBSpaceInPercent / 100
                    debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 670, `[chassisID=${actualChassisID},workloadID=${workloadItem},DC=${dcItem}] CHECK RocksDB on HDD1: localWorkloadRocksDBSizeHDDWithoutDedicatedRocksDBDedicatedWALonSSD9=${localWorkloadRocksDBSizeHDDWithoutDedicatedRocksDBDedicatedWALonSSD9} = ${workloadsArrayLocal[workloadItem].reqCapacityGrossHDD } / ${workloadsArrayLocal[workloadItem].sumNumberDC} * ${workloadsArrayLocal[workloadItem].rocksDBSpaceInPercent} / 100`,0,0,0)
                    localDCRocksDBSizeHDDWithoutDedicatedRocksDBDedicatedWALonSSD9 += localWorkloadRocksDBSizeHDDWithoutDedicatedRocksDBDedicatedWALonSSD9
                    localHDDCapacityWithoutDedicatedRocksDBDedicatedWALonSSD9 += workloadsArrayLocal[workloadItem].reqCapacityGrossHDD / workloadsArrayLocal[workloadItem].sumNumberDC
                  }
                  else {  
                    localWorkloadRocksDBSizeHDDWithoutDedicatedRocksDBNorWAL = workloadsArrayLocal[workloadItem].reqCapacityGrossHDD / workloadsArrayLocal[workloadItem].sumNumberDC * workloadsArrayLocal[workloadItem].rocksDBSpaceInPercent / 100
                    debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 676, `[chassisID=${actualChassisID},workloadID=${workloadItem},DC=${dcItem}] CHECK RocksDB on HDD1: localWorkloadRocksDBSizeHDDWithoutDedicatedRocksDBNorWAL=${localWorkloadRocksDBSizeHDDWithoutDedicatedRocksDBNorWAL} = ${workloadsArrayLocal[workloadItem].reqCapacityGrossHDD } / ${workloadsArrayLocal[workloadItem].sumNumberDC} * ${workloadsArrayLocal[workloadItem].rocksDBSpaceInPercent} / 100`,0,0,0)
                    localDCRocksDBSizeHDDWithoutDedicatedRocksDBNorWAL += localWorkloadRocksDBSizeHDDWithoutDedicatedRocksDBNorWAL
                    localHDDCapacityWithoutDedicatedRocksDBNorWAL += workloadsArrayLocal[workloadItem].reqCapacityGrossHDD / workloadsArrayLocal[workloadItem].sumNumberDC
                  }
                }

              }
            }

            // for flash: distinguish between normal and dedicated RocksDB media - also assign here the required flash capacity to one of the groups
            // of dedicated vs non-dedicated media for RocksDB and dedicated vs non-dedicated WAL
            if (workloadsArrayLocal[workloadItem].selectorNVMe === true ) {
              if (workloadsArrayLocal[workloadItem].selectorNVMe1DedicatedNVMe === true) {
                if (workloadsArrayLocal[workloadItem].selectorNVMe1DedicatedNVMeForWAL === true) {
                  localWorkloadRocksDBSizeNVMe1WithDedicatedNVMeDedicatedWAL = workloadsArrayLocal[workloadItem].reqCapacityGrossNVMe / workloadsArrayLocal[workloadItem].sumNumberDC * workloadsArrayLocal[workloadItem].rocksDBSpaceInPercent / 100
                  debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 691, `[chassisID=${actualChassisID},workloadID=${workloadItem},DC=${dcItem}] CHECK RocksDB on dedicated NVMe7: localWorkloadRocksDBSizeNVMe1WithDedicatedNVMeDedicatedWAL=${localWorkloadRocksDBSizeNVMe1WithDedicatedNVMeDedicatedWAL} = ${workloadsArrayLocal[workloadItem].reqCapacityGrossNVMe } / ${workloadsArrayLocal[workloadItem].sumNumberDC} * ${workloadsArrayLocal[workloadItem].rocksDBSpaceInPercent} / 100`,0,0,0)
                  localDCRocksDBSizeNVMe1WithDedicatedNVMeDedicatedWAL += localWorkloadRocksDBSizeNVMe1WithDedicatedNVMeDedicatedWAL
                  localNVMe1CapacityWithDedicatedRocksDBDedicatedWAL += workloadsArrayLocal[workloadItem].reqCapacityGrossNVMe / workloadsArrayLocal[workloadItem].sumNumberDC
                }
                else {
                  localWorkloadRocksDBSizeNVMe1WithDedicatedNVMeIncludingWAL = workloadsArrayLocal[workloadItem].reqCapacityGrossNVMe / workloadsArrayLocal[workloadItem].sumNumberDC * workloadsArrayLocal[workloadItem].rocksDBSpaceInPercent / 100
                  debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 697, `[chassisID=${actualChassisID},workloadID=${workloadItem},DC=${dcItem}] CHECK RocksDB on dedicated NVMe7: localWorkloadRocksDBSizeNVMe1WithDedicatedNVMeIncludingWAL=${localWorkloadRocksDBSizeNVMe1WithDedicatedNVMeIncludingWAL} = ${workloadsArrayLocal[workloadItem].reqCapacityGrossNVMe } / ${workloadsArrayLocal[workloadItem].sumNumberDC} * ${workloadsArrayLocal[workloadItem].rocksDBSpaceInPercent} / 100`,0,0,0)
                  localDCRocksDBSizeNVMe1WithDedicatedNVMeIncludingWAL += localWorkloadRocksDBSizeNVMe1WithDedicatedNVMeIncludingWAL
                  localNVMe1CapacityWithDedicatedRocksDBIncludingWAL += workloadsArrayLocal[workloadItem].reqCapacityGrossNVMe / workloadsArrayLocal[workloadItem].sumNumberDC
                }
              }
              else {
                if (workloadsArrayLocal[workloadItem].selectorNVMe1DedicatedNVMeForWAL === true) {
                  localWorkloadRocksDBSizeNVMe1WithoutDedicatedNVMeDedicatedWAL = workloadsArrayLocal[workloadItem].reqCapacityGrossNVMe / workloadsArrayLocal[workloadItem].sumNumberDC * workloadsArrayLocal[workloadItem].rocksDBSpaceInPercent / 100
                  debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 705, `[chassisID=${actualChassisID},workloadID=${workloadItem},DC=${dcItem}] CHECK RocksDB on NVMe1: localWorkloadRocksDBSizeNVMe1WithoutDedicatedNVMeDedicatedWAL=${localWorkloadRocksDBSizeNVMe1WithoutDedicatedNVMeDedicatedWAL} = ${workloadsArrayLocal[workloadItem].reqCapacityGrossNVMe } / ${workloadsArrayLocal[workloadItem].sumNumberDC} * ${workloadsArrayLocal[workloadItem].rocksDBSpaceInPercent} / 100`,0,0,0)
                  localDCRocksDBSizeNVMe1WithoutDedicatedNVMeDedicatedWAL += localWorkloadRocksDBSizeNVMe1WithoutDedicatedNVMeDedicatedWAL
                  localNVMe1CapacityWithoutDedicatedRocksDBDedicatedWAL += workloadsArrayLocal[workloadItem].reqCapacityGrossNVMe / workloadsArrayLocal[workloadItem].sumNumberDC  
                }
                else {
                  localWorkloadRocksDBSizeNVMe1WithoutDedicatedNVMeNorWAL = workloadsArrayLocal[workloadItem].reqCapacityGrossNVMe / workloadsArrayLocal[workloadItem].sumNumberDC * workloadsArrayLocal[workloadItem].rocksDBSpaceInPercent / 100
                  debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 711, `[chassisID=${actualChassisID},workloadID=${workloadItem},DC=${dcItem}] CHECK RocksDB on NVMe1: localWorkloadRocksDBSizeNVMe1WithoutDedicatedNVMeNorWAL=${localWorkloadRocksDBSizeNVMe1WithoutDedicatedNVMeNorWAL} = ${workloadsArrayLocal[workloadItem].reqCapacityGrossNVMe } / ${workloadsArrayLocal[workloadItem].sumNumberDC} * ${workloadsArrayLocal[workloadItem].rocksDBSpaceInPercent} / 100`,0,0,0)
                  localDCRocksDBSizeNVMe1WithoutDedicatedNVMeNorWAL += localWorkloadRocksDBSizeNVMe1WithoutDedicatedNVMeNorWAL
                  localNVMe1CapacityWithoutDedicatedRocksDBNorWAL += workloadsArrayLocal[workloadItem].reqCapacityGrossNVMe / workloadsArrayLocal[workloadItem].sumNumberDC
                
                }
              }
            }
            else {
              if (workloadsArrayLocal[workloadItem].selectorSSDDedicatedNVMe === true) {
                if (workloadsArrayLocal[workloadItem].selectorSSDDedicatedNVMeForWAL === true) {
                  localWorkloadRocksDBSizeSSDWithDedicatedNVMeDedicatedWAL = workloadsArrayLocal[workloadItem].reqCapacityGrossSSD / workloadsArrayLocal[workloadItem].sumNumberDC * workloadsArrayLocal[workloadItem].rocksDBSpaceInPercent / 100
                  debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 722, `[chassisID=${actualChassisID},workloadID=${workloadItem},DC=${dcItem}] CHECK RocksDB on dedicated NVMe5: localWorkloadRocksDBSizeSSDWithDedicatedNVMeDedicatedWAL=${localWorkloadRocksDBSizeSSDWithDedicatedNVMeDedicatedWAL} = ${workloadsArrayLocal[workloadItem].reqCapacityGrossSSD } / ${workloadsArrayLocal[workloadItem].sumNumberDC} * ${workloadsArrayLocal[workloadItem].rocksDBSpaceInPercent} / 100`,0,0,0)
                  localDCRocksDBSizeSSDWithDedicatedNVMeDedicatedWAL += localWorkloadRocksDBSizeSSDWithDedicatedNVMeDedicatedWAL
                  localSSDCapacityWithDedicatedRocksDBDedicatedWAL += workloadsArrayLocal[workloadItem].reqCapacityGrossSSD / workloadsArrayLocal[workloadItem].sumNumberDC
                }
                else {
                  localWorkloadRocksDBSizeSSDWithDedicatedNVMeIncludingWAL = workloadsArrayLocal[workloadItem].reqCapacityGrossSSD / workloadsArrayLocal[workloadItem].sumNumberDC * workloadsArrayLocal[workloadItem].rocksDBSpaceInPercent / 100
                  debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 728, `[chassisID=${actualChassisID},workloadID=${workloadItem},DC=${dcItem}] CHECK RocksDB on dedicated NVMe5: localWorkloadRocksDBSizeSSDWithDedicatedNVMeIncludingWAL=${localWorkloadRocksDBSizeSSDWithDedicatedNVMeIncludingWAL}= ${workloadsArrayLocal[workloadItem].reqCapacityGrossSSD } / ${workloadsArrayLocal[workloadItem].sumNumberDC} * ${workloadsArrayLocal[workloadItem].rocksDBSpaceInPercent} / 100`,0,0,0)
                  localDCRocksDBSizeSSDWithDedicatedNVMeIncludingWAL += localWorkloadRocksDBSizeSSDWithDedicatedNVMeIncludingWAL
                  localSSDCapacityWithDedicatedRocksDBIncludingWAL += workloadsArrayLocal[workloadItem].reqCapacityGrossSSD / workloadsArrayLocal[workloadItem].sumNumberDC  
                }
              }
              else {
                if (workloadsArrayLocal[workloadItem].selectorSSDDedicatedNVMeForWAL === true) {

                  localWorkloadRocksDBSizeSSDWithoutDedicatedNVMeDedicatedWAL = workloadsArrayLocal[workloadItem].reqCapacityGrossSSD / workloadsArrayLocal[workloadItem].sumNumberDC * workloadsArrayLocal[workloadItem].rocksDBSpaceInPercent / 100
                  debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 737, `[chassisID=${actualChassisID},workloadID=${workloadItem},DC=${dcItem}] CHECK RocksDB on SSD1: localWorkloadRocksDBSizeSSDWithoutDedicatedNVMeDedicatedWAL=${localWorkloadRocksDBSizeSSDWithoutDedicatedNVMeDedicatedWAL} = ${workloadsArrayLocal[workloadItem].reqCapacityGrossSSD } / ${workloadsArrayLocal[workloadItem].sumNumberDC} * ${workloadsArrayLocal[workloadItem].rocksDBSpaceInPercent} / 100`,0,0,0)
                  localDCRocksDBSizeSSDWithoutDedicatedNVMeDedicatedWAL += localWorkloadRocksDBSizeSSDWithoutDedicatedNVMeDedicatedWAL + localSSDAddCapacityWithOutDedicatedRocksDB
                  localSSDCapacityWithoutDedicatedRocksDBDedicatedWAL += workloadsArrayLocal[workloadItem].reqCapacityGrossSSD / workloadsArrayLocal[workloadItem].sumNumberDC
                }
                else{
                  localWorkloadRocksDBSizeSSDWithoutDedicatedNVMeNorWAL = workloadsArrayLocal[workloadItem].reqCapacityGrossSSD / workloadsArrayLocal[workloadItem].sumNumberDC * workloadsArrayLocal[workloadItem].rocksDBSpaceInPercent / 100
                  debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 743, `[chassisID=${actualChassisID},workloadID=${workloadItem},DC=${dcItem}] CHECK RocksDB on SSD1: localWorkloadRocksDBSizeSSDWithoutDedicatedNVMeNorWAL=${localWorkloadRocksDBSizeSSDWithoutDedicatedNVMeNorWAL} = ${workloadsArrayLocal[workloadItem].reqCapacityGrossSSD } / ${workloadsArrayLocal[workloadItem].sumNumberDC} * ${workloadsArrayLocal[workloadItem].rocksDBSpaceInPercent} / 100`,0,0,0)
                  localDCRocksDBSizeSSDWithoutDedicatedNVMeNorWAL += localWorkloadRocksDBSizeSSDWithoutDedicatedNVMeNorWAL + localSSDAddCapacityWithOutDedicatedRocksDB
                  localSSDCapacityWithoutDedicatedRocksDBNorWAL += workloadsArrayLocal[workloadItem].reqCapacityGrossSSD / workloadsArrayLocal[workloadItem].sumNumberDC  
                }
              }
            }
            if (generalValues.globalDebug == true || localDebugOn == true) {
              debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 750, `[chassisID=${actualChassisID},workloadID=${workloadItem},DC=${dcItem}] local DC HDD1 capacity localHDDCapacityWithDedicatedRocksDBNVMe4DedicatedWALonNVMe9=${localHDDCapacityWithDedicatedRocksDBNVMe4DedicatedWALonNVMe9}`,0,0,0)
              debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 751, `[chassisID=${actualChassisID},workloadID=${workloadItem},DC=${dcItem}] local DC HDD1 capacity localHDDCapacityWithDedicatedRocksDBNVMe4DedicatedWALonSSD9=${localHDDCapacityWithDedicatedRocksDBNVMe4DedicatedWALonSSD9}`,0,0,0)
              debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 752, `[chassisID=${actualChassisID},workloadID=${workloadItem},DC=${dcItem}] local DC HDD1 capacity localHDDCapacityWithDedicatedRocksDBNVMe4IncludingWAL=${localHDDCapacityWithDedicatedRocksDBNVMe4IncludingWAL}`,0,0,0)
              debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 753, `[chassisID=${actualChassisID},workloadID=${workloadItem},DC=${dcItem}] local DC HDD1 capacity localHDDCapacityWithDedicatedRocksDBSSD4DedicatedWALonNVMe9=${localHDDCapacityWithDedicatedRocksDBSSD4DedicatedWALonNVMe9}`,0,0,0)
              debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 754, `[chassisID=${actualChassisID},workloadID=${workloadItem},DC=${dcItem}] local DC HDD1 capacity localHDDCapacityWithDedicatedRocksDBSSD4DedicatedWALonSSD9=${localHDDCapacityWithDedicatedRocksDBSSD4DedicatedWALonSSD9}`,0,0,0)
              debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 755, `[chassisID=${actualChassisID},workloadID=${workloadItem},DC=${dcItem}] local DC HDD1 capacity localHDDCapacityWithDedicatedRocksDBSSD4IncludingWAL=${localHDDCapacityWithDedicatedRocksDBSSD4IncludingWAL}`,0,0,0)
              debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 756, `[chassisID=${actualChassisID},workloadID=${workloadItem},DC=${dcItem}] local DC HDD1 capacity localHDDCapacityWithoutDedicatedRocksDBDedicatedWALonNVMe9=${localHDDCapacityWithoutDedicatedRocksDBDedicatedWALonNVMe9}`,0,0,0)
              debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 757, `[chassisID=${actualChassisID},workloadID=${workloadItem},DC=${dcItem}] local DC HDD1 capacity localHDDCapacityWithoutDedicatedRocksDBDedicatedWALonSSD9=${localHDDCapacityWithoutDedicatedRocksDBDedicatedWALonSSD9}`,0,0,0)
              debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 758, `[chassisID=${actualChassisID},workloadID=${workloadItem},DC=${dcItem}] local DC HDD1 capacity localHDDCapacityWithoutDedicatedRocksDBNorWAL=${localHDDCapacityWithoutDedicatedRocksDBNorWAL}`,0,0,0)

              debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 760, `[chassisID=${actualChassisID},workloadID=${workloadItem},DC=${dcItem}] local DC NVMe1 capacity localNVMe1CapacityWithDedicatedRocksDBDedicatedWAL=${localNVMe1CapacityWithDedicatedRocksDBDedicatedWAL}`,0,0,0)
              debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 761, `[chassisID=${actualChassisID},workloadID=${workloadItem},DC=${dcItem}] local DC NVMe1 capacity localNVMe1CapacityWithDedicatedRocksDBIncludingWAL=${localNVMe1CapacityWithDedicatedRocksDBIncludingWAL}`,0,0,0)
              debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 762, `[chassisID=${actualChassisID},workloadID=${workloadItem},DC=${dcItem}] local DC NVMe1 capacity localNVMe1CapacityWithoutDedicatedRocksDBDedicatedWAL=${localNVMe1CapacityWithoutDedicatedRocksDBDedicatedWAL}`,0,0,0)
              debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 763, `[chassisID=${actualChassisID},workloadID=${workloadItem},DC=${dcItem}] local DC NVMe1 capacity localNVMe1CapacityWithoutDedicatedRocksDBNorWAL=${localNVMe1CapacityWithoutDedicatedRocksDBNorWAL}`,0,0,0)
              
              debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 765, `[chassisID=${actualChassisID},workloadID=${workloadItem},DC=${dcItem}] local DC SSD1 capacity localSSDCapacityWithDedicatedRocksDBDedicatedWAL=${localSSDCapacityWithDedicatedRocksDBDedicatedWAL}`,0,0,0)
              debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 766, `[chassisID=${actualChassisID},workloadID=${workloadItem},DC=${dcItem}] local DC SSD1 capacity localSSDCapacityWithDedicatedRocksDBIncludingWAL=${localSSDCapacityWithDedicatedRocksDBIncludingWAL}`,0,0,0)
              debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 767, `[chassisID=${actualChassisID},workloadID=${workloadItem},DC=${dcItem}] local DC SSD1 capacity localSSDCapacityWithoutDedicatedRocksDBDedicatedWAL=${localSSDCapacityWithoutDedicatedRocksDBDedicatedWAL}`,0,0,0)
              debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 768, `[chassisID=${actualChassisID},workloadID=${workloadItem},DC=${dcItem}] local DC SSD1 capacity localSSDCapacityWithoutDedicatedRocksDBNorWAL=${localSSDCapacityWithoutDedicatedRocksDBNorWAL}`,0,0,0)
              
              debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 770, `[chassisID=${actualChassisID},workloadID=${workloadItem},DC=${dcItem}] local capacity corrected of RocksDB space for unaligned data parts - for SSD w/ dedicated RocksDB w/ dedicated WAL=${localDCRocksDBSizeSSDWithDedicatedNVMeDedicatedWAL}`,0,0,0)
              debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 771, `[chassisID=${actualChassisID},workloadID=${workloadItem},DC=${dcItem}] local capacity corrected of RocksDB space for unaligned data parts - for SSD w/ dedicated RocksDB w/o dedicated WAL=${localDCRocksDBSizeSSDWithDedicatedNVMeIncludingWAL}`,0,0,0)
              debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 772, `[chassisID=${actualChassisID},workloadID=${workloadItem},DC=${dcItem}] local capacity corrected of RocksDB space for unaligned data parts - for SSD w/o dedicated RocksDB w/ dedicated WAL=${localDCRocksDBSizeSSDWithoutDedicatedNVMeDedicatedWAL}`,0,0,0)
              debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 773, `[chassisID=${actualChassisID},workloadID=${workloadItem},DC=${dcItem}] local capacity corrected of RocksDB space for unaligned data parts - for SSD w/o dedicated RocksDB w/o dedicated WAL=${localDCRocksDBSizeSSDWithoutDedicatedNVMeNorWAL}`,0,0,0)
              debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 774, `[chassisID=${actualChassisID},workloadID=${workloadItem},DC=${dcItem}] local capacity corrected of RocksDB space for unaligned data parts - for NVMe w/ dedicated RocksDB w/ dedicated WAL=${localDCRocksDBSizeNVMe1WithDedicatedNVMeDedicatedWAL}`,0,0,0)
              debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 775, `[chassisID=${actualChassisID},workloadID=${workloadItem},DC=${dcItem}] local capacity corrected of RocksDB space for unaligned data parts - for NVMe w/ dedicated RocksDB w/o dedicated WAL=${localDCRocksDBSizeNVMe1WithDedicatedNVMeIncludingWAL}`,0,0,0)
              debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 776, `[chassisID=${actualChassisID},workloadID=${workloadItem},DC=${dcItem}] local capacity corrected of RocksDB space for unaligned data parts - for NVMe w/o dedicated RocksDB w/ dedicated WAL=${localDCRocksDBSizeNVMe1WithoutDedicatedNVMeDedicatedWAL}`,0,0,0)
              debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 777, `[chassisID=${actualChassisID},workloadID=${workloadItem},DC=${dcItem}] local capacity corrected of RocksDB space for unaligned data parts - for NVMe w/o dedicated RocksDB w/o dedicated WAL=${localDCRocksDBSizeNVMe1WithoutDedicatedNVMeNorWAL}`,0,0,0)
            }
          }
        }
      }
      // End of processing the workloads and calculating the capacity needed for each config case
      
      /// The specific size of media should come from a specific chassisConfig.
      // Media for dedicated index pool in DC
      debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 786, `[chassisID=${actualChassisID},DC=${dcItem}] actualChassisID=${actualChassisID}, chassisArrayLocal[actualChassisID].chassisID=${chassisArrayLocal[actualChassisID].chassisID}, maxHDDSlots=${chassisArrayLocal[actualChassisID].maxHDDSlots}`,0,0,0)
      dcConfigArrayLocal[dcItem].numberOfNVMe6Needed = Math.ceil(localDCDedicatedObjectIndexCapacity / chassisArrayLocal[actualChassisID].sizeNVMe6)
      debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 788, `[chassisID=${actualChassisID},DC=${dcItem}] localDCDedicatedObjectIndexCapacity=${localDCDedicatedObjectIndexCapacity} / chassisArrayLocal[actualChassisID].sizeNVMe6 ${chassisArrayLocal[actualChassisID].sizeNVMe6}`,0,0,0)
      debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 789, `[chassisID=${actualChassisID},DC=${dcItem}] #NVMe6 needed=${dcConfigArrayLocal[dcItem].numberOfNVMe6Needed}`,0,0,0)

      // NVMe6: Check for chassis setting to have any size other than 0 and if at all selected
      if (chassisArrayLocal[actualChassisID].sizeNVMe6 == 0){
        if (dcConfigArrayLocal[dcItem].numberOfNVMe6Needed > 0) {
          displayMsg(document, "dcConfigDetermineNumberOfMediaRequired", 794, "error", `[chassisID=${actualChassisID},DC=${dcItem}] ERROR: workloads require NVMe6 but size of NVMe6 is zero`,0,0,0)
        }
        else {
          dcConfigArrayLocal[dcItem].numberOfNVMe6Needed = 0
          debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 798, `[chassisID=${actualChassisID},DC=${dcItem}] size of NVMe6=0 => dcConfigArrayLocal[dcItem].numberOfNVMe6Needed=${dcConfigArrayLocal[dcItem].numberOfNVMe6Needed}`,0,0,0)
        }
      }

      
      ///////////
      // Calculate the number of dediatec WAL devices needed per block device type with respect to dependency on different schemes of dedicated RocksDB and WAL devices
      ///////////
      
      // HDD as pool media: 

      if (generalValues.globalDebug == true || localDebugOn == true) {
        debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 810, `[chassisID=${actualChassisID},DC=${dcItem}] localDCRocksDBSizeHDDWithDedicatedSSD4IncludingWAL=${localDCRocksDBSizeHDDWithDedicatedSSD4IncludingWAL}`,0,0,0)
        debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 811, `[chassisID=${actualChassisID},DC=${dcItem}] localDCRocksDBSizeHDDWithDedicatedNVMe4IncludingWAL=${localDCRocksDBSizeHDDWithDedicatedNVMe4IncludingWAL}`,0,0,0)
        debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 812, `[chassisID=${actualChassisID},DC=${dcItem}] localDCRequiredIndexCapacityOnHDDIncludingWAL=${localDCRequiredIndexCapacityOnHDDIncludingWAL}`,0,0,0)
        debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 813, `[chassisID=${actualChassisID},DC=${dcItem}] localDCRequiredIndexCapacityOnHDDDedicatedWALonSSD9=${localDCRequiredIndexCapacityOnHDDDedicatedWALonSSD9}`,0,0,0)
        debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 814, `[chassisID=${actualChassisID},DC=${dcItem}] localDCRequiredIndexCapacityOnHDDDedicatedWALonNVMe9=${localDCRequiredIndexCapacityOnHDDDedicatedWALonNVMe9}`,0,0,0)
        debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 815, `[chassisID=${actualChassisID},DC=${dcItem}] localDCRequiredIndexCapacityOnNVMe4DedicatedWALonNVMe9=${localDCRequiredIndexCapacityOnNVMe4DedicatedWALonNVMe9}`,0,0,0)
        debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 816, `[chassisID=${actualChassisID},DC=${dcItem}] localDCRequiredIndexCapacityOnNVMe4DedicatedWALonSSD9=${localDCRequiredIndexCapacityOnNVMe4DedicatedWALonSSD9}`,0,0,0)
        debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 817, `[chassisID=${actualChassisID},DC=${dcItem}] localDCRequiredIndexCapacityOnNVMe4IncludingWAL=${localDCRequiredIndexCapacityOnNVMe4IncludingWAL}`,0,0,0)
        debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 818, `[chassisID=${actualChassisID},DC=${dcItem}] localDCRequiredIndexCapacityOnSSD4IncludingWAL=${localDCRequiredIndexCapacityOnSSD4IncludingWAL}`,0,0,0)
        debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 819, `[chassisID=${actualChassisID},DC=${dcItem}] localDCRocksDBSizeHDDWithDedicatedNVMe4DedicatedWALonNVMe9=${localDCRocksDBSizeHDDWithDedicatedNVMe4DedicatedWALonNVMe9}`,0,0,0)
        debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 820, `[chassisID=${actualChassisID},DC=${dcItem}] localDCRocksDBSizeHDDWithDedicatedSSD4DedicatedWALonNVMe9=${localDCRocksDBSizeHDDWithDedicatedSSD4DedicatedWALonNVMe9}`,0,0,0)
        debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 821, `[chassisID=${actualChassisID},DC=${dcItem}] localDCRocksDBSizeHDDWithDedicatedNVMe4DedicatedWALonSSD9=${localDCRocksDBSizeHDDWithDedicatedNVMe4DedicatedWALonSSD9}`,0,0,0)
        debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 822, `[chassisID=${actualChassisID},DC=${dcItem}] localDCRocksDBSizeHDDWithDedicatedSSD4DedicatedWALonSSD9=${localDCRocksDBSizeHDDWithDedicatedSSD4DedicatedWALonSSD9}`,0,0,0)
      }
      
      // HDD - either with dedicated WAL on SSD (SSD9) or on NVMe (NVMe9)
      // RGW index data goes to RocksDB place - if there is a dedicated device this will be used.
      dcConfigArrayLocal[dcItem].numberOfHDD1NeededWithoutDedicatedRocksDBDedicatedWALonNVMe9 = Math.ceil((localHDDCapacityWithoutDedicatedRocksDBDedicatedWALonNVMe9 + localDCRocksDBSizeHDDWithoutDedicatedRocksDBDedicatedWALonNVMe9 + localDCRequiredIndexCapacityOnHDDDedicatedWALonNVMe9) / chassisArrayLocal[actualChassisID].sizeHDD1)
      dcConfigArrayLocal[dcItem].numberOfHDD1NeededWithoutDedicatedRocksDBDedicatedWALonSSD9 = Math.ceil((localHDDCapacityWithoutDedicatedRocksDBDedicatedWALonSSD9 + localDCRocksDBSizeHDDWithoutDedicatedRocksDBDedicatedWALonSSD9 + localDCRequiredIndexCapacityOnHDDDedicatedWALonSSD9) / chassisArrayLocal[actualChassisID].sizeHDD1)
      dcConfigArrayLocal[dcItem].numberOfHDD1NeededWithDedicatedNVMe4DedicatedWALonNVMe9 = Math.ceil((localHDDCapacityWithDedicatedRocksDBNVMe4DedicatedWALonNVMe9) / chassisArrayLocal[actualChassisID].sizeHDD1)
      dcConfigArrayLocal[dcItem].numberOfHDD1NeededWithDedicatedNVMe4DedicatedWALonSSD9 = Math.ceil((localHDDCapacityWithDedicatedRocksDBNVMe4DedicatedWALonSSD9) / chassisArrayLocal[actualChassisID].sizeHDD1)
      dcConfigArrayLocal[dcItem].numberOfHDD1NeededWithDedicatedSSD4DedicatedWALonNVMe9 = Math.ceil((localHDDCapacityWithDedicatedRocksDBSSD4DedicatedWALonNVMe9) / chassisArrayLocal[actualChassisID].sizeHDD1)
      dcConfigArrayLocal[dcItem].numberOfHDD1NeededWithDedicatedSSD4DedicatedWALonSSD9 = Math.ceil((localHDDCapacityWithDedicatedRocksDBSSD4DedicatedWALonSSD9) / chassisArrayLocal[actualChassisID].sizeHDD1)

      debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 834, `[chassisID=${actualChassisID},DC=${dcItem}] dcConfigArrayLocal[dcItem].numberOfHDD1NeededWithoutDedicatedRocksDBDedicatedWALonNVMe9=${dcConfigArrayLocal[dcItem].numberOfHDD1NeededWithoutDedicatedRocksDBDedicatedWALonNVMe9}`,0,0,0)
      debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 835, `[chassisID=${actualChassisID},DC=${dcItem}] dcConfigArrayLocal[dcItem].numberOfHDD1NeededWithoutDedicatedRocksDBDedicatedWALonSSD9=${dcConfigArrayLocal[dcItem].numberOfHDD1NeededWithoutDedicatedRocksDBDedicatedWALonSSD9}`,0,0,0)
      debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 836, `[chassisID=${actualChassisID},DC=${dcItem}] dcConfigArrayLocal[dcItem].numberOfHDD1NeededWithDedicatedNVMe4DedicatedWALonNVMe9=${dcConfigArrayLocal[dcItem].numberOfHDD1NeededWithDedicatedNVMe4DedicatedWALonNVMe9}`,0,0,0)
      debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 837, `[chassisID=${actualChassisID},DC=${dcItem}] dcConfigArrayLocal[dcItem].numberOfHDD1NeededWithDedicatedNVMe4DedicatedWALonSSD9=${dcConfigArrayLocal[dcItem].numberOfHDD1NeededWithDedicatedNVMe4DedicatedWALonSSD9}`,0,0,0)
      debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 838, `[chassisID=${actualChassisID},DC=${dcItem}] dcConfigArrayLocal[dcItem].numberOfHDD1NeededWithDedicatedSSD4DedicatedWALonNVMe9=${dcConfigArrayLocal[dcItem].numberOfHDD1NeededWithDedicatedSSD4DedicatedWALonNVMe9}`,0,0,0)
      debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 839, `[chassisID=${actualChassisID},DC=${dcItem}] dcConfigArrayLocal[dcItem].numberOfHDD1NeededWithDedicatedSSD4DedicatedWALonSSD9=${dcConfigArrayLocal[dcItem].numberOfHDD1NeededWithDedicatedSSD4DedicatedWALonSSD9}`,0,0,0)
      
      // NVMe9 for HDD1
      if (chassisArrayLocal[actualChassisID].sizeNVMe9 == 0){
        if ((dcConfigArrayLocal[dcItem].numberOfHDD1NeededWithoutDedicatedRocksDBDedicatedWALonNVMe9 + dcConfigArrayLocal[dcItem].numberOfHDD1NeededWithDedicatedNVMe4DedicatedWALonNVMe9 + dcConfigArrayLocal[dcItem].numberOfHDD1NeededWithDedicatedSSD4DedicatedWALonNVMe9) > 0) {
          displayMsg(document, "dcConfigDetermineNumberOfMediaRequired", 844, "error", `[chassisID=${actualChassisID},DC=${dcItem}] ERROR: workloads require NVMe9 but size of NVMe9 is zero`,0,0,0)
        }
        else {
          dcConfigArrayLocal[dcItem].numberOfNVMe9Needed = 0
          debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 848, `[chassisID=${actualChassisID},DC=${dcItem}] size of NVMe9=0 => dcConfigArrayLocal[dcItem].numberOfNVMe9Needed=${dcConfigArrayLocal[dcItem].numberOfNVMe9Needed}`,0,0,0)
        }
      }
      else {
        // sizeNVMe9 is > 0
        if (chassisArrayLocal[actualChassisID].useNVMe9 == true){
          dcConfigArrayLocal[dcItem].numberOfNVMe9Needed = Math.ceil((dcConfigArrayLocal[dcItem].numberOfHDD1NeededWithoutDedicatedRocksDBDedicatedWALonNVMe9 * (sizingConstraints.defaultSizeOfWALOnNVMeInGB / 1000)) / chassisArrayLocal[actualChassisID].sizeNVMe9) 
                                                         + Math.ceil((dcConfigArrayLocal[dcItem].numberOfHDD1NeededWithDedicatedNVMe4DedicatedWALonNVMe9 * (sizingConstraints.defaultSizeOfWALOnNVMeInGB / 1000)) / chassisArrayLocal[actualChassisID].sizeNVMe9)
                                                         + Math.ceil((dcConfigArrayLocal[dcItem].numberOfHDD1NeededWithDedicatedSSD4DedicatedWALonNVMe9 * (sizingConstraints.defaultSizeOfWALOnNVMeInGB / 1000)) / chassisArrayLocal[actualChassisID].sizeNVMe9)
          debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 857, `[chassisID=${actualChassisID},DC=${dcItem}] #NVMe9 needed=${dcConfigArrayLocal[dcItem].numberOfNVMe9Needed}`,0,0,0)
          if (dcConfigArrayLocal[dcItem].numberOfNVMe9Needed < (Math.ceil(dcConfigArrayLocal[dcItem].numberOfHDD1NeededWithoutDedicatedRocksDBDedicatedWALonNVMe9 / chassisArrayLocal[actualChassisID].hddToNVMe9) + Math.ceil(dcConfigArrayLocal[dcItem].numberOfHDD1NeededWithDedicatedNVMe4DedicatedWALonNVMe9 / chassisArrayLocal[actualChassisID].hddToNVMe9) + Math.ceil(dcConfigArrayLocal[dcItem].numberOfHDD1NeededWithDedicatedSSD4DedicatedWALonNVMe9 / chassisArrayLocal[actualChassisID].hddToNVMe9) )){
            // The number of media required based on capacity is not sufficient - would need to add more NVMe for the actual required number of HDD1 to front.
            debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 860, `[chassisID=${actualChassisID},DC=${dcItem}] need to correct: #NVMe9 needed=${dcConfigArrayLocal[dcItem].numberOfNVMe9Needed} < Math.ceil(dcConfigArrayLocal[dcItem].numberOfHDD1NeededWithoutDedicatedRocksDBDedicatedWALonNVMe9=${dcConfigArrayLocal[dcItem].numberOfHDD1NeededWithoutDedicatedRocksDBDedicatedWALonNVMe9} / chassisArrayLocal[actualChassisID].hddToNVMe9=${chassisArrayLocal[actualChassisID].hddToNVMe9}) + Math.ceil(dcConfigArrayLocal[dcItem].numberOfHDD1NeededWithDedicatedNVMe4DedicatedWALonNVMe9=${dcConfigArrayLocal[dcItem].numberOfHDD1NeededWithDedicatedNVMe4DedicatedWALonNVMe9} / chassisArrayLocal[actualChassisID].hddToNVMe9=${chassisArrayLocal[actualChassisID].hddToNVMe9}) + Math.ceil(dcConfigArrayLocal[dcItem].numberOfHDD1NeededWithDedicatedSSD4DedicatedWALonNVMe9=${dcConfigArrayLocal[dcItem].numberOfHDD1NeededWithDedicatedSSD4DedicatedWALonNVMe9} / chassisArrayLocal[actualChassisID].hddToNVMe9=${chassisArrayLocal[actualChassisID].hddToNVMe9})`,0,0,0)
            dcConfigArrayLocal[dcItem].numberOfNVMe9Needed = Math.ceil(dcConfigArrayLocal[dcItem].numberOfHDD1NeededWithoutDedicatedRocksDBDedicatedWALonNVMe9 / chassisArrayLocal[actualChassisID].hddToNVMe9) + Math.ceil(dcConfigArrayLocal[dcItem].numberOfHDD1NeededWithDedicatedNVMe4DedicatedWALonNVMe9 / chassisArrayLocal[actualChassisID].hddToNVMe9) + Math.ceil(dcConfigArrayLocal[dcItem].numberOfHDD1NeededWithDedicatedSSD4DedicatedWALonNVMe9 / chassisArrayLocal[actualChassisID].hddToNVMe9)
            debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 862, `[chassisID=${actualChassisID},DC=${dcItem}] #NVMe9 needed=${dcConfigArrayLocal[dcItem].numberOfNVMe9Needed}`,0,0,0)
          }
          debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 864, `[chassisID=${actualChassisID},DC=${dcItem}] #NVMe9 needed=${dcConfigArrayLocal[dcItem].numberOfNVMe9Needed}`,0,0,0)
        }
        else {
          if ((dcConfigArrayLocal[dcItem].numberOfHDD1NeededWithoutDedicatedRocksDBDedicatedWALonNVMe9 + dcConfigArrayLocal[dcItem].numberOfHDD1NeededWithDedicatedNVMe4DedicatedWALonNVMe9 + dcConfigArrayLocal[dcItem].numberOfHDD1NeededWithDedicatedSSD4DedicatedWALonNVMe9) > 0) {
            displayMsg(document, "dcConfigDetermineNumberOfMediaRequired", 868, "error", `[chassisID=${actualChassisID},DC=${dcItem}] ERROR: workloads require NVMe9 but use of NVMe9 is disabled`,0,0,0)
          }
          else {
            dcConfigArrayLocal[dcItem].numberOfNVMe9Needed = 0
            debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 872, `[chassisID=${actualChassisID},DC=${dcItem}] use of NVMe9 is disabled => dcConfigArrayLocal[dcItem].numberOfNVMe9Needed=${dcConfigArrayLocal[dcItem].numberOfNVMe9Needed}`,0,0,0)
          }
        }   
      }

      // SSD9 for HDD1
      if (chassisArrayLocal[actualChassisID].sizeSSD9 == 0){
        if ((dcConfigArrayLocal[dcItem].numberOfHDD1NeededWithoutDedicatedRocksDBDedicatedWALonSSD9 + dcConfigArrayLocal[dcItem].numberOfHDD1NeededWithDedicatedNVMe4DedicatedWALonSSD9 + dcConfigArrayLocal[dcItem].numberOfHDD1NeededWithDedicatedSSD4DedicatedWALonSSD9) > 0) {
          displayMsg(document, "dcConfigDetermineNumberOfMediaRequired", 880, "error", `[chassisID=${actualChassisID},DC=${dcItem}] ERROR: workloads require SSD9 but size of SSD9 is zero`,0,0,0)
        }
        else {
          dcConfigArrayLocal[dcItem].numberOfSSD9Needed = 0
          debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 884, `[chassisID=${actualChassisID},DC=${dcItem}] size of SDD9=0 => dcConfigArrayLocal[dcItem].numberOfSSD9Needed=${dcConfigArrayLocal[dcItem].numberOfSSD9Needed}`,0,0,0)
        }
      }
      else {
        // sizeSSD9 is > 0
        if (chassisArrayLocal[actualChassisID].useSSD9 == true){
          dcConfigArrayLocal[dcItem].numberOfSSD9Needed = Math.ceil((dcConfigArrayLocal[dcItem].numberOfHDD1NeededWithoutDedicatedRocksDBDedicatedWALonSSD9 * (sizingConstraints.defaultSizeOfWALOnNVMeInGB / 1000)) / chassisArrayLocal[actualChassisID].sizeSSD9) 
                                                         + Math.ceil((dcConfigArrayLocal[dcItem].numberOfHDD1NeededWithDedicatedNVMe4DedicatedWALonSSD9 * (sizingConstraints.defaultSizeOfWALOnNVMeInGB / 1000)) / chassisArrayLocal[actualChassisID].sizeSSD9)
                                                         + Math.ceil((dcConfigArrayLocal[dcItem].numberOfHDD1NeededWithDedicatedSSD4DedicatedWALonSSD9 * (sizingConstraints.defaultSizeOfWALOnNVMeInGB / 1000)) / chassisArrayLocal[actualChassisID].sizeSSD9)
          debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 893, `[chassisID=${actualChassisID},DC=${dcItem}] #SSD9 needed parameters: chassisArrayLocal[actualChassisID].sizeSSD9=${chassisArrayLocal[actualChassisID].sizeSSD9}, dcConfigArrayLocal[dcItem].numberOfHDD1NeededWithoutDedicatedRocksDBDedicatedWALonSSD9=${dcConfigArrayLocal[dcItem].numberOfHDD1NeededWithoutDedicatedRocksDBDedicatedWALonSSD9},dcConfigArrayLocal[dcItem].numberOfHDD1NeededWithDedicatedNVMe4DedicatedWALonSSD9=${dcConfigArrayLocal[dcItem].numberOfHDD1NeededWithDedicatedNVMe4DedicatedWALonSSD9}, dcConfigArrayLocal[dcItem].numberOfHDD1NeededWithDedicatedSSD4DedicatedWALonSSD9=${dcConfigArrayLocal[dcItem].numberOfHDD1NeededWithDedicatedSSD4DedicatedWALonSSD9}`,0,0,0)
          debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 894, `[chassisID=${actualChassisID},DC=${dcItem}] #SSD9 needed=${dcConfigArrayLocal[dcItem].numberOfSSD9Needed}`,0,0,0)
          if (dcConfigArrayLocal[dcItem].numberOfNVMe9Needed < (Math.ceil(dcConfigArrayLocal[dcItem].numberOfHDD1NeededWithoutDedicatedRocksDBDedicatedWALonSSD9 / chassisArrayLocal[actualChassisID].hddToSSD9) + Math.ceil(dcConfigArrayLocal[dcItem].numberOfHDD1NeededWithDedicatedNVMe4DedicatedWALonSSD9 / chassisArrayLocal[actualChassisID].hddToSSD9) + Math.ceil(dcConfigArrayLocal[dcItem].numberOfHDD1NeededWithDedicatedSSD4DedicatedWALonSSD9 / chassisArrayLocal[actualChassisID].hddToSSD9) )){
            // The number of media required based on capacity is not sufficient - would need to add more SSD for the actual required number of HDD1 to front.
            debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 897, `[chassisID=${actualChassisID},DC=${dcItem}] #need to correct: #SSD9 needed=${dcConfigArrayLocal[dcItem].numberOfSSD9Needed} < Math.ceil(dcConfigArrayLocal[dcItem].numberOfHDD1NeededWithoutDedicatedRocksDBDedicatedWALonSSD9=${dcConfigArrayLocal[dcItem].numberOfHDD1NeededWithoutDedicatedRocksDBDedicatedWALonSSD9} / chassisArrayLocal[actualChassisID].hddToSSD9=${chassisArrayLocal[actualChassisID].hddToSSD9}) + Math.ceil(dcConfigArrayLocal[dcItem].numberOfHDD1NeededWithDedicatedNVMe4DedicatedWALonSSD9=${dcConfigArrayLocal[dcItem].numberOfHDD1NeededWithDedicatedNVMe4DedicatedWALonSSD9} / chassisArrayLocal[actualChassisID].hddToSSD9=${chassisArrayLocal[actualChassisID].hddToSSD9}) + Math.ceil(dcConfigArrayLocal[dcItem].numberOfHDD1NeededWithDedicatedSSD4DedicatedWALonSSD9=${dcConfigArrayLocal[dcItem].numberOfHDD1NeededWithDedicatedSSD4DedicatedWALonSSD9} / chassisArrayLocal[actualChassisID].hddToSSD9=${chassisArrayLocal[actualChassisID].hddToSSD9})`,0,0,0)
            dcConfigArrayLocal[dcItem].numberOfSSD9Needed = Math.ceil(dcConfigArrayLocal[dcItem].numberOfHDD1NeededWithoutDedicatedRocksDBDedicatedWALonSSD9 / chassisArrayLocal[actualChassisID].hddToSSD9) + Math.ceil(dcConfigArrayLocal[dcItem].numberOfHDD1NeededWithDedicatedNVMe4DedicatedWALonSSD9 / chassisArrayLocal[actualChassisID].hddToSSD9) + Math.ceil(dcConfigArrayLocal[dcItem].numberOfHDD1NeededWithDedicatedSSD4DedicatedWALonSSD9 / chassisArrayLocal[actualChassisID].hddToSSD9)
            debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 899, `[chassisID=${actualChassisID},DC=${dcItem}] #SSD9 needed=${dcConfigArrayLocal[dcItem].numberOfSSD9Needed}`,0,0,0)
          }
          debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 901, `[chassisID=${actualChassisID},DC=${dcItem}] #SSD9 needed=${dcConfigArrayLocal[dcItem].numberOfSSD9Needed}`,0,0,0)
        }
        else {
          if ((dcConfigArrayLocal[dcItem].numberOfHDD1NeededWithoutDedicatedRocksDBDedicatedWALonSSD9 + dcConfigArrayLocal[dcItem].numberOfHDD1NeededWithDedicatedNVMe4DedicatedWALonSSD9 + dcConfigArrayLocal[dcItem].numberOfHDD1NeededWithDedicatedSSD4DedicatedWALonSSD9) > 0) {
            displayMsg(document, "dcConfigDetermineNumberOfMediaRequired", 905, "error", `[chassisID=${actualChassisID},DC=${dcItem}] ERROR: workloads require SSD9 but but use of SSD9 is disabled`,0,0,0)
          }
          else {
            dcConfigArrayLocal[dcItem].numberOfSSD9Needed = 0
            debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 909, `[chassisID=${actualChassisID},DC=${dcItem}] use of SDD9 disabled => dcConfigArrayLocal[dcItem].numberOfSSD9Needed=${dcConfigArrayLocal[dcItem].numberOfSSD9Needed}`,0,0,0)
          }
        }   
      }
      
      // SSD as pool media: 

      // Two different kinds of RocksDB capacity: with and without dedicated - with dedicated, there must be a different kind of media
      // for hosting the dedicated RocksDB: NVMe5 (RocksDB+WAL all-in-one); NVMe3 (WAL dedicated and separated from NVMe5)
      // Note: the capacity of localDCCorrectionForUnalignedObjectsSSD1WithDedicatedRocksDBIncludingWAL is not changing the RocksDB capacity. Similar for NMVe1.
      // Check also the number of NVMe would be sufficient for the number of SSD allowed to cover Chassis.ssdToNVMe5
      
      // SSD: with dedicated WAL => this is used to calculate the number of NVMe3 devices 
      dcConfigArrayLocal[dcItem].numberOfSSD1NeededWithoutDedicatedRocksDBDedicatedWAL = Math.ceil((localSSDCapacityWithoutDedicatedRocksDBDedicatedWAL + localDCRocksDBSizeSSDWithoutDedicatedNVMeDedicatedWAL + localDCRequiredIndexCapacityOnSSD1DedicatedWAL)/ chassisArrayLocal[actualChassisID].sizeSSD1)
      dcConfigArrayLocal[dcItem].numberOfSSD1NeededWithDedicatedRocksDBDedicatedWAL = Math.ceil((localSSDCapacityWithDedicatedRocksDBDedicatedWAL) / chassisArrayLocal[actualChassisID].sizeSSD1)
      debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 924, `[chassisID=${actualChassisID},DC=${dcItem}] dcConfigArrayLocal[dcItem].numberOfSSD1NeededWithoutDedicatedRocksDBDedicatedWAL=${dcConfigArrayLocal[dcItem].numberOfSSD1NeededWithoutDedicatedRocksDBDedicatedWAL}`,0,0,0)
      debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 925, `[chassisID=${actualChassisID},DC=${dcItem}] dcConfigArrayLocal[dcItem].numberOfSSD1NeededWithDedicatedRocksDBDedicatedWAL=${dcConfigArrayLocal[dcItem].numberOfSSD1NeededWithDedicatedRocksDBDedicatedWAL}`,0,0,0)
      // SSD - RocksDB size on dedicated flash media fronting the SSD1 =>  dedicated WAL means this lands on NVMe3 instead of landing on the NVMe5
      dcConfigArrayLocal[dcItem].numberOfNVMe3Needed = Math.ceil((dcConfigArrayLocal[dcItem].numberOfSSD1NeededWithoutDedicatedRocksDBDedicatedWAL * (sizingConstraints.defaultSizeOfWALOnNVMeInGB / 1000)) / chassisArrayLocal[actualChassisID].sizeNVMe3) + Math.ceil((dcConfigArrayLocal[dcItem].numberOfSSD1NeededWithDedicatedRocksDBDedicatedWAL * (sizingConstraints.defaultSizeOfWALOnNVMeInGB / 1000)) / chassisArrayLocal[actualChassisID].sizeNVMe3)
      debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 928, `[chassisID=${actualChassisID},DC=${dcItem}] #NVMe3 needed=${dcConfigArrayLocal[dcItem].numberOfNVMe3Needed}`,0,0,0)
      
      if (dcConfigArrayLocal[dcItem].numberOfNVMe3Needed < (Math.ceil(dcConfigArrayLocal[dcItem].numberOfSSD1NeededWithoutDedicatedRocksDBDedicatedWAL / chassisArrayLocal[actualChassisID].nvmeToNVMe3) + Math.ceil(dcConfigArrayLocal[dcItem].numberOfSSD1NeededWithDedicatedRocksDBDedicatedWAL / chassisArrayLocal[actualChassisID].nvmeToNVMe3) )){
        // The number of media required based on capacity is not sufficient - would need to add more NVMe for the actual required number of SSD1 to front.
        debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 932, `[chassisID=${actualChassisID},DC=${dcItem}] #NVMe3 needed=${dcConfigArrayLocal[dcItem].numberOfNVMe3Needed} < Math.ceil(dcConfigArrayLocal[dcItem].numberOfSSD1NeededWithoutDedicatedRocksDBDedicatedWAL=${dcConfigArrayLocal[dcItem].numberOfSSD1NeededWithoutDedicatedRocksDBDedicatedWAL} / chassisArrayLocal[actualChassisID].nvmeToNVMe3=${chassisArrayLocal[actualChassisID].nvmeToNVMe3}) + Math.ceil(dcConfigArrayLocal[dcItem].numberOfSSD1NeededWithDedicatedRocksDBDedicatedWAL=${dcConfigArrayLocal[dcItem].numberOfSSD1NeededWithDedicatedRocksDBDedicatedWAL} / chassisArrayLocal[actualChassisID].nvmeToNVMe3=${chassisArrayLocal[actualChassisID].nvmeToNVMe3})`,0,0,0)
        dcConfigArrayLocal[dcItem].numberOfNVMe3Needed = Math.ceil(dcConfigArrayLocal[dcItem].numberOfSSD1NeededWithoutDedicatedRocksDBDedicatedWAL / chassisArrayLocal[actualChassisID].nvmeToNVMe3) + Math.ceil(dcConfigArrayLocal[dcItem].numberOfSSD1NeededWithDedicatedRocksDBDedicatedWAL / chassisArrayLocal[actualChassisID].nvmeToNVMe3)
        debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 934, `[chassisID=${actualChassisID},DC=${dcItem}] #NVMe3 needed=${dcConfigArrayLocal[dcItem].numberOfNVMe3Needed}`,0,0,0)
      }
      debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 936, `[chassisID=${actualChassisID},DC=${dcItem}] #NVMe3 needed=${dcConfigArrayLocal[dcItem].numberOfNVMe3Needed}`,0,0,0)

      // NVMe3: Check for chassis setting to have any size other than 0 and if at all selected
      if (chassisArrayLocal[actualChassisID].sizeNVMe3 == 0){
        if (dcConfigArrayLocal[dcItem].numberOfNVMe3Needed > 0) {
          displayMsg(document, "dcConfigDetermineNumberOfMediaRequired", 941, "error", `[chassisID=${actualChassisID},DC=${dcItem}] ERROR: workloads require NVMe3 but size of NVMe3 is zero`,0,0,0)
          dcConfigArrayLocal[dcItem].numberOfNVMe3Needed = 0
        }
        else {
          dcConfigArrayLocal[dcItem].numberOfNVMe3Needed = 0
          debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 946, `[chassisID=${actualChassisID},DC=${dcItem}] size of NVMe3=0 => dcConfigArrayLocal[dcItem].numberOfNVMe3Needed=${dcConfigArrayLocal[dcItem].numberOfNVMe3Needed}`,0,0,0)
        }
      }
      else {
        // sizeNVMe3 is > 0
        if (chassisArrayLocal[actualChassisID].useNVMe3 == true){
          debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 952, `[chassisID=${actualChassisID},DC=${dcItem}] #NVMe3 needed=${dcConfigArrayLocal[dcItem].numberOfNVMe3Needed}`,0,0,0)
        }
        else {
          if (dcConfigArrayLocal[dcItem].numberOfNVMe3Needed > 0) {
            dcConfigArrayLocal[dcItem].numberOfNVMe3Needed = 0
            displayMsg(document, "dcConfigDetermineNumberOfMediaRequired", 957, "error", `[chassisID=${actualChassisID},DC=${dcItem}] ERROR: workloads require NVMe3 but use of NVMe3 is disabled`,0,0,0)
          }
          else {
            dcConfigArrayLocal[dcItem].numberOfNVMe3Needed = 0
            debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 961, `[chassisID=${actualChassisID},DC=${dcItem}] use of NVMe3 is disabled => dcConfigArrayLocal[dcItem].numberOfNVMe3Needed=${dcConfigArrayLocal[dcItem].numberOfNVMe3Needed}`,0,0,0)
          }
        }   
      }

      // NVMe1:
      if (generalValues.globalDebug == true || localDebugOn == true) {
        debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 968, `[chassisID=${actualChassisID},DC=${dcItem}] localDCRocksDBSizeNVMe1WithDedicatedNVMeIncludingWAL=${localDCRocksDBSizeNVMe1WithDedicatedNVMeIncludingWAL}`,0,0,0)
        debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 969, `[chassisID=${actualChassisID},DC=${dcItem}] localDCRequiredIndexCapacityOnNVMe1NorWAL=${localDCRequiredIndexCapacityOnNVMe1NorWAL}`,0,0,0)
        debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 970, `[chassisID=${actualChassisID},DC=${dcItem}] localDCRequiredIndexCapacityOnNVMe1DedicatedWAL=${localDCRequiredIndexCapacityOnNVMe1DedicatedWAL}`,0,0,0)
        debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 971, `[chassisID=${actualChassisID},DC=${dcItem}] localDCRequiredIndexCapacityOnNVMe7DedicatedWAL=${localDCRequiredIndexCapacityOnNVMe7DedicatedWAL}`,0,0,0)
        debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 972, `[chassisID=${actualChassisID},DC=${dcItem}] localDCRequiredIndexCapacityOnNVMe7IncludingWAL=${localDCRequiredIndexCapacityOnNVMe7IncludingWAL}`,0,0,0)
        debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 973, `[chassisID=${actualChassisID},DC=${dcItem}] localDCRocksDBSizeNVMe1WithDedicatedNVMeDedicatedWAL=${localDCRocksDBSizeNVMe1WithDedicatedNVMeDedicatedWAL}`,0,0,0)
      }
      
      // NVMe8:
      // NVMe1 - with dedicated WAL => this is used to calculate the number of NVMe8 devices
      // RGW index data goes to RocksDB place - if there is a dedicated device this will be used.
      dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithoutDedicatedRocksDBDedicatedWAL = Math.ceil((localNVMe1CapacityWithoutDedicatedRocksDBDedicatedWAL + localDCRocksDBSizeNVMe1WithoutDedicatedNVMeDedicatedWAL + localDCRequiredIndexCapacityOnNVMe1DedicatedWAL) / chassisArrayLocal[actualChassisID].sizeNVMe1)
      dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithDedicatedRocksDBDedicatedWAL = Math.ceil((localNVMe1CapacityWithDedicatedRocksDBDedicatedWAL) / chassisArrayLocal[actualChassisID].sizeNVMe1)
      debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 981, `[chassisID=${actualChassisID},DC=${dcItem}] dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithoutDedicatedRocksDBDedicatedWAL=${dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithoutDedicatedRocksDBDedicatedWAL}`,0,0,0)
      debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 982, `[chassisID=${actualChassisID},DC=${dcItem}] dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithDedicatedRocksDBDedicatedWAL=${dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithDedicatedRocksDBDedicatedWAL}`,0,0,0)
      // NVMe8 for NVMe1
      dcConfigArrayLocal[dcItem].numberOfNVMe8Needed = Math.ceil((dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithoutDedicatedRocksDBDedicatedWAL * (sizingConstraints.defaultSizeOfWALOnNVMeInGB / 1000)) / chassisArrayLocal[actualChassisID].sizeNVMe8) + Math.ceil((dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithDedicatedRocksDBDedicatedWAL* (sizingConstraints.defaultSizeOfWALOnNVMeInGB / 1000)) / chassisArrayLocal[actualChassisID].sizeNVMe8)
      debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 985, `[chassisID=${actualChassisID},DC=${dcItem}] #NVMe8 needed=${dcConfigArrayLocal[dcItem].numberOfNVMe8Needed}`,0,0,0)
      if (dcConfigArrayLocal[dcItem].numberOfNVMe8Needed < (Math.ceil(dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithoutDedicatedRocksDBDedicatedWAL / chassisArrayLocal[actualChassisID].nvmeToNVMe8) + Math.ceil(dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithDedicatedRocksDBDedicatedWAL / chassisArrayLocal[actualChassisID].nvmeToNVMe8) )){
        // The number of media required based on capacity is not sufficient - would need to add more NVMe for the actual required number of NVMe1 to front.
        debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 988, `[chassisID=${actualChassisID},DC=${dcItem}] #NVMe8 needed=${dcConfigArrayLocal[dcItem].numberOfNVMe8Needed} < Math.ceil(dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithoutDedicatedRocksDBDedicatedWAL=${dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithoutDedicatedRocksDBDedicatedWAL} / chassisArrayLocal[actualChassisID].nvmeToNVMe8=${chassisArrayLocal[actualChassisID].nvmeToNVMe8}) + Math.ceil(dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithDedicatedRocksDBDedicatedWAL=${dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithDedicatedRocksDBDedicatedWAL} / chassisArrayLocal[actualChassisID].nvmeToNVMe8=${chassisArrayLocal[actualChassisID].nvmeToNVMe8})`,0,0,0)
        dcConfigArrayLocal[dcItem].numberOfNVMe8Needed = Math.ceil(dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithoutDedicatedRocksDBDedicatedWAL / chassisArrayLocal[actualChassisID].nvmeToNVMe8) + Math.ceil(dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithDedicatedRocksDBDedicatedWAL / chassisArrayLocal[actualChassisID].nvmeToNVMe8)
        debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 990, `[chassisID=${actualChassisID},DC=${dcItem}] #NVMe8 needed=${dcConfigArrayLocal[dcItem].numberOfNVMe8Needed}`,0,0,0)
      }
      debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 992, `[chassisID=${actualChassisID},DC=${dcItem}] #NVMe8 needed=${dcConfigArrayLocal[dcItem].numberOfNVMe8Needed}`,0,0,0)

      // NVMe8: Check for chassis setting to have any size other than 0 and if at all selected
      if (chassisArrayLocal[actualChassisID].sizeNVMe8 == 0){
        if (dcConfigArrayLocal[dcItem].numberOfNVMe8Needed > 0) {
          dcConfigArrayLocal[dcItem].numberOfNVMe8Needed = 0
          displayMsg(document, "dcConfigDetermineNumberOfMediaRequired", 998, "error", `[chassisID=${actualChassisID},DC=${dcItem}] ERROR: workloads require NVMe8 but size of NVMe8 is zero`,0,0,0)
        }
        else {
          dcConfigArrayLocal[dcItem].numberOfNVMe8Needed = 0
          debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 1002, `[chassisID=${actualChassisID},DC=${dcItem}] size of NVMe8=0 => dcConfigArrayLocal[dcItem].numberOfNVMe8Needed=${dcConfigArrayLocal[dcItem].numberOfNVMe8Needed}`,0,0,0)
        }
      }
      else {
        // sizeNVMe8 is > 0
        if (chassisArrayLocal[actualChassisID].useNVMe8 == true){
          debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 1008, `[chassisID=${actualChassisID},DC=${dcItem}] #NVMe8 needed=${dcConfigArrayLocal[dcItem].numberOfNVMe8Needed}`,0,0,0)
        }
        else {
          if (dcConfigArrayLocal[dcItem].numberOfNVMe8Needed > 0) {
            dcConfigArrayLocal[dcItem].numberOfNVMe8Needed = 0
            displayMsg(document, "dcConfigDetermineNumberOfMediaRequired", 1013, "error", `[chassisID=${actualChassisID},DC=${dcItem}] ERROR: workloads require NVMe8 but use of NVMe8 is disabled`,0,0,0)
          }
          else {
            dcConfigArrayLocal[dcItem].numberOfNVMe8Needed = 0
            debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 1017, `[chassisID=${actualChassisID},DC=${dcItem}] use of NVMe8 is disabled => dcConfigArrayLocal[dcItem].numberOfNVMe8Needed=${dcConfigArrayLocal[dcItem].numberOfNVMe8Needed}`,0,0,0)
          }
        }   
      }
      

      // NVMe2:
      // RGW cache media are dedicated and counted as they are
      dcConfigArrayLocal[dcItem].numberOfNVMe2Needed = localDCNumberOfRGWCacheMedia
      debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 1026, `[chassisID=${actualChassisID},DC=${dcItem}] #NVMe2 needed=${dcConfigArrayLocal[dcItem].numberOfNVMe2Needed}`,0,0,0)

      // NVMe2: Check for chassis setting to have any size other than 0 and if at all selected
      if (chassisArrayLocal[actualChassisID].sizeNVMe2 == 0){
        if (dcConfigArrayLocal[dcItem].numberOfNVMe2Needed > 0) {
          dcConfigArrayLocal[dcItem].numberOfNVMe2Needed = 0
          displayMsg(document, "dcConfigDetermineNumberOfMediaRequired", 1032, "error", `[chassisID=${actualChassisID},DC=${dcItem}] ERROR: workloads require NVMe2 but size of NVMe2 is zero`,0,0,0)
        }
        else {
          dcConfigArrayLocal[dcItem].numberOfNVMe2Needed = 0
          debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 1036, `[chassisID=${actualChassisID},DC=${dcItem}] size of NVMe2=0 => dcConfigArrayLocal[dcItem].numberOfNVMe2Needed=${dcConfigArrayLocal[dcItem].numberOfNVMe2Needed}`,0,0,0)
        }
      }
      else {
        // sizeNVMe2 is > 0
        if (chassisArrayLocal[actualChassisID].useRGWCaching == true){
          debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 1042, `[chassisID=${actualChassisID},DC=${dcItem}] #NVMe2 needed=${dcConfigArrayLocal[dcItem].numberOfNVMe2Needed}`,0,0,0)
        }
        else {
          if (dcConfigArrayLocal[dcItem].numberOfNVMe2Needed > 0) {
            dcConfigArrayLocal[dcItem].numberOfNVMe2Needed = 0
            displayMsg(document, "dcConfigDetermineNumberOfMediaRequired", 1047, "error", `[chassisID=${actualChassisID},DC=${dcItem}] ERROR: workloads require NVMe2 but use of NVMe2 is disabled`,0,0,0)
          }
          else {
            dcConfigArrayLocal[dcItem].numberOfNVMe2Needed = 0
            debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 1051, `[chassisID=${actualChassisID},DC=${dcItem}] use of NVMe2 is disabled => dcConfigArrayLocal[dcItem].numberOfNVMe2Needed=${dcConfigArrayLocal[dcItem].numberOfNVMe2Needed}`,0,0,0)
          }
        }   
      }      

      
      ///////////
      // Calculate the number of block devices needed per block device type with respect to dependency on different schemes of dedicated RocksDB and WAL devices
      ///////////

      // HDD:
      debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 1062, `[chassisID=${actualChassisID},DC=${dcItem}] #HDD needed=${dcConfigArrayLocal[dcItem].numberOfHDDNeeded}`,0,0,0)
      ////  In addition, the additional capacity for placing the RocksDB on any media used for block must be added to the number of media required - for kinds of flash.
      // HDD1: - number of devices - the capacity for unaligned objects is already included here in the localSSDCapacity*
      dcConfigArrayLocal[dcItem].numberOfHDD1NeededWithDedicatedSSD4IncludingWAL = Math.ceil((localHDDCapacityWithDedicatedRocksDBSSD4IncludingWAL + localDCCorrectionForUnalignedObjectsHDD1OnSSD4IncludingWAL) / chassisArrayLocal[actualChassisID].sizeHDD1)
      debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 1066, `[chassisID=${actualChassisID},DC=${dcItem}] dcConfigArrayLocal[dcItem].numberOfHDD1NeededWithDedicatedSSD4IncludingWAL=${dcConfigArrayLocal[dcItem].numberOfHDD1NeededWithDedicatedSSD4IncludingWAL} = Math.ceil((localHDDCapacityWithDedicatedRocksDBSSD4IncludingWAL=${localHDDCapacityWithDedicatedRocksDBSSD4IncludingWAL}) / chassisArrayLocal[actualChassisID].sizeHDD1=${chassisArrayLocal[actualChassisID].sizeHDD1})`,0,0,0)
      dcConfigArrayLocal[dcItem].numberOfHDD1NeededWithDedicatedNVMe4IncludingWAL = Math.ceil((localHDDCapacityWithDedicatedRocksDBNVMe4IncludingWAL + localDCCorrectionForUnalignedObjectsHDD1OnNVMe4IncludingWAL) / chassisArrayLocal[actualChassisID].sizeHDD1)
      debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 1068, `[chassisID=${actualChassisID},DC=${dcItem}] dcConfigArrayLocal[dcItem].numberOfHDD1NeededWithDedicatedNVMe4IncludingWAL=${dcConfigArrayLocal[dcItem].numberOfHDD1NeededWithDedicatedNVMe4IncludingWAL} = Math.ceil((localHDDCapacityWithDedicatedRocksDBNVMe4IncludingWAL=${localHDDCapacityWithDedicatedRocksDBNVMe4IncludingWAL}) / chassisArrayLocal[actualChassisID].sizeHDD1=${chassisArrayLocal[actualChassisID].sizeHDD1})`,0,0,0)
      dcConfigArrayLocal[dcItem].numberOfHDDNeeded = dcConfigArrayLocal[dcItem].numberOfHDD1NeededWithDedicatedSSD4IncludingWAL + dcConfigArrayLocal[dcItem].numberOfHDD1NeededWithDedicatedNVMe4IncludingWAL
      debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 1070, `[chassisID=${actualChassisID},DC=${dcItem}]#HDD(sum) needed=${dcConfigArrayLocal[dcItem].numberOfHDDNeeded}`,0,0,0)
      
      dcConfigArrayLocal[dcItem].numberOfHDD1NeededWithDedicatedSSD4DedicatedWALonNVMe9 = Math.ceil((localHDDCapacityWithDedicatedRocksDBSSD4DedicatedWALonNVMe9 + localDCCorrectionForUnalignedObjectsHDD1OnSSD4DedicatedWALonNVMe9) / chassisArrayLocal[actualChassisID].sizeHDD1)
      debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 1073, `[chassisID=${actualChassisID},DC=${dcItem}] dcConfigArrayLocal[dcItem].numberOfHDD1NeededWithDedicatedSSD4DedicatedWALonNVMe9=${dcConfigArrayLocal[dcItem].numberOfHDD1NeededWithDedicatedSSD4DedicatedWALonNVMe9} = Math.ceil((localHDDCapacityWithDedicatedRocksDBSSD4DedicatedWALonNVMe9=${localHDDCapacityWithDedicatedRocksDBSSD4DedicatedWALonNVMe9}) / chassisArrayLocal[actualChassisID].sizeHDD1=${chassisArrayLocal[actualChassisID].sizeHDD1})`,0,0,0)
      dcConfigArrayLocal[dcItem].numberOfHDD1NeededWithDedicatedNVMe44DedicatedWALonNVMe9 = Math.ceil((localHDDCapacityWithDedicatedRocksDBNVMe4DedicatedWALonNVMe9 + localDCCorrectionForUnalignedObjectsHDD1OnNVMe4DedicatedWALonNVMe9) / chassisArrayLocal[actualChassisID].sizeHDD1)
      debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 1075, `[chassisID=${actualChassisID},DC=${dcItem}] dcConfigArrayLocal[dcItem].numberOfHDD1NeededWithDedicatedNVMe4DedicatedWALonNVMe9=${dcConfigArrayLocal[dcItem].numberOfHDD1NeededWithDedicatedNVMe4DedicatedWALonNVMe9} = Math.ceil((localHDDCapacityWithDedicatedRocksDBNVMe4DedicatedWALonNVMe9=${localHDDCapacityWithDedicatedRocksDBNVMe4DedicatedWALonNVMe9}) / chassisArrayLocal[actualChassisID].sizeHDD1=${chassisArrayLocal[actualChassisID].sizeHDD1})`,0,0,0)
      dcConfigArrayLocal[dcItem].numberOfHDDNeeded += dcConfigArrayLocal[dcItem].numberOfHDD1NeededWithDedicatedSSD4DedicatedWALonNVMe9 + dcConfigArrayLocal[dcItem].numberOfHDD1NeededWithDedicatedNVMe44DedicatedWALonNVMe9
      debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 1077, `[chassisID=${actualChassisID},DC=${dcItem}]#HDD(sum) needed=${dcConfigArrayLocal[dcItem].numberOfHDDNeeded}`,0,0,0)

      dcConfigArrayLocal[dcItem].numberOfHDD1NeededWithDedicatedSSD4DedicatedWALonSSD9 = Math.ceil((localHDDCapacityWithDedicatedRocksDBSSD4DedicatedWALonSSD9 + localDCCorrectionForUnalignedObjectsHDD1OnSSD4DedicatedWALonSSD9) / chassisArrayLocal[actualChassisID].sizeHDD1)
      debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 1080, `[chassisID=${actualChassisID},DC=${dcItem}] dcConfigArrayLocal[dcItem].numberOfHDD1NeededWithDedicatedSSD4DedicatedWALonSSD9=${dcConfigArrayLocal[dcItem].numberOfHDD1NeededWithDedicatedSSD4DedicatedWALonSSD9} = Math.ceil((localHDDCapacityWithDedicatedRocksDBSSD4DedicatedWALonSSD9=${localHDDCapacityWithDedicatedRocksDBSSD4DedicatedWALonSSD9}) / chassisArrayLocal[actualChassisID].sizeHDD1=${chassisArrayLocal[actualChassisID].sizeHDD1})`,0,0,0)
      dcConfigArrayLocal[dcItem].numberOfHDD1NeededWithDedicatedNVMe44DedicatedWALonSSD9 = Math.ceil((localHDDCapacityWithDedicatedRocksDBNVMe4DedicatedWALonSSD9 + localDCCorrectionForUnalignedObjectsHDD1OnNVMe4DedicatedWALonSSD9) / chassisArrayLocal[actualChassisID].sizeHDD1)
      debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 1082, `[chassisID=${actualChassisID},DC=${dcItem}] dcConfigArrayLocal[dcItem].numberOfHDD1NeededWithDedicatedNVMe4DedicatedWALonSSD9=${dcConfigArrayLocal[dcItem].numberOfHDD1NeededWithDedicatedNVMe4DedicatedWALonSSD9} = Math.ceil((localHDDCapacityWithDedicatedRocksDBNVMe4DedicatedWALonSSD9=${localHDDCapacityWithDedicatedRocksDBNVMe4DedicatedWALonSSD9}) / chassisArrayLocal[actualChassisID].sizeHDD1=${chassisArrayLocal[actualChassisID].sizeHDD1})`,0,0,0)
      dcConfigArrayLocal[dcItem].numberOfHDDNeeded += dcConfigArrayLocal[dcItem].numberOfHDD1NeededWithDedicatedSSD4DedicatedWALonSSD9 + dcConfigArrayLocal[dcItem].numberOfHDD1NeededWithDedicatedNVMe44DedicatedWALonSSD9
      debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 1084, `[chassisID=${actualChassisID},DC=${dcItem}]#HDD(sum) needed=${dcConfigArrayLocal[dcItem].numberOfHDDNeeded}`,0,0,0)
      
      dcConfigArrayLocal[dcItem].numberOfHDD1NeededWithoutDedicatedRocksDBDedicatedWALonNVMe9 = Math.ceil((localHDDCapacityWithoutDedicatedRocksDBDedicatedWALonNVMe9 + localDCRocksDBSizeHDDWithoutDedicatedRocksDBDedicatedWALonNVMe9 + localDCRequiredIndexCapacityOnHDDDedicatedWALonNVMe9 + localDCCorrectionForUnalignedObjectsHDD1WithoutDedicatedRocksDBDedicatedWALonNVMe9) / chassisArrayLocal[actualChassisID].sizeHDD1)
      dcConfigArrayLocal[dcItem].numberOfHDD1NeededWithoutDedicatedRocksDBDedicatedWALonSSD9 = Math.ceil((localHDDCapacityWithoutDedicatedRocksDBDedicatedWALonSSD9 + localDCRocksDBSizeHDDWithoutDedicatedRocksDBDedicatedWALonSSD9 + localDCRequiredIndexCapacityOnHDDDedicatedWALonSSD9 + localDCCorrectionForUnalignedObjectsHDD1WithoutDedicatedRocksDBDedicatedWALonSSD9) / chassisArrayLocal[actualChassisID].sizeHDD1)
      dcConfigArrayLocal[dcItem].numberOfHDDNeeded += dcConfigArrayLocal[dcItem].numberOfHDD1NeededWithoutDedicatedRocksDBDedicatedWALonNVMe9 + dcConfigArrayLocal[dcItem].numberOfHDD1NeededWithoutDedicatedRocksDBDedicatedWALonSSD9
      debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 1089, `[chassisID=${actualChassisID},DC=${dcItem}]#HDD(sum) needed=${dcConfigArrayLocal[dcItem].numberOfHDDNeeded}`,0,0,0)

      dcConfigArrayLocal[dcItem].numberOfHDD1NeededWithoutDedicatedRocksDBNorWAL = Math.ceil((localHDDCapacityWithoutDedicatedRocksDBNorWAL + localDCRocksDBSizeHDDWithoutDedicatedRocksDBNorWAL + localDCRequiredIndexCapacityOnHDDIncludingWAL + localDCCorrectionForUnalignedObjectsHDD1WithoutDedicatedRocksDBNorWAL) / chassisArrayLocal[actualChassisID].sizeHDD1)
      dcConfigArrayLocal[dcItem].numberOfHDDNeeded += dcConfigArrayLocal[dcItem].numberOfHDD1NeededWithoutDedicatedRocksDBNorWAL
      debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 1093, `[chassisID=${actualChassisID},DC=${dcItem}]#HDD(sum) needed=${dcConfigArrayLocal[dcItem].numberOfHDDNeeded}`,0,0,0)

      if (generalValues.globalDebug == true || localDebugOn == true) {
        debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 1096, `[chassisID=${actualChassisID},DC=${dcItem}] #HDD w/o NVMe nor dedicated WAL needed=${dcConfigArrayLocal[dcItem].numberOfHDD1NeededWithoutDedicatedRocksDBNorWAL}`,0,0,0)
        debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 1097, `[chassisID=${actualChassisID},DC=${dcItem}] #HDD w/o NVMe w/ dedicated WAL NVMe9 needed=${dcConfigArrayLocal[dcItem].numberOfHDD1NeededWithoutDedicatedRocksDBDedicatedWALonNVMe9}`,0,0,0)
        debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 1098, `[chassisID=${actualChassisID},DC=${dcItem}] #HDD w/o NVMe w/ dedicated WAL SSD9 needed=${dcConfigArrayLocal[dcItem].numberOfHDD1NeededWithoutDedicatedRocksDBDedicatedWALonSSD9}`,0,0,0)
        debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 1099, `[chassisID=${actualChassisID},DC=${dcItem}] #HDD w/ NVMe dedicated w/o separate WAL needed=${dcConfigArrayLocal[dcItem].numberOfHDD1NeededWithDedicatedNVMe4IncludingWAL}`,0,0,0)
        debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 1100, `[chassisID=${actualChassisID},DC=${dcItem}] #HDD w/ SSD dedicated w/o separate WAL needed=${dcConfigArrayLocal[dcItem].numberOfHDD1NeededWithDedicatedSSD4IncludingWAL}`,0,0,0)
        debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 1101, `[chassisID=${actualChassisID},DC=${dcItem}] #HDD w/ NVMe dedicated w/ separate WAL SSD9 needed=${dcConfigArrayLocal[dcItem].numberOfHDD1NeededWithDedicatedNVMe44DedicatedWALonSSD9}`,0,0,0)
        debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 1102, `[chassisID=${actualChassisID},DC=${dcItem}] #HDD w/ SSD dedicated w/ separate WAL SSD9 needed=${dcConfigArrayLocal[dcItem].numberOfHDD1NeededWithDedicatedSSD4DedicatedWALonSSD9}`,0,0,0)
        debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 1103, `[chassisID=${actualChassisID},DC=${dcItem}] #HDD w/ NVMe dedicated w/ separate WAL NVMe9 needed=${dcConfigArrayLocal[dcItem].numberOfHDD1NeededWithDedicatedNVMe44DedicatedWALonNVMe9}`,0,0,0)
        debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 1104, `[chassisID=${actualChassisID},DC=${dcItem}] #HDD w/ SSD dedicated w/ separate WAL NVMe9 needed=${dcConfigArrayLocal[dcItem].numberOfHDD1NeededWithDedicatedSSD4DedicatedWALonNVMe9}`,0,0,0)
        debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 1105, `[chassisID=${actualChassisID},DC=${dcItem}] #HDD(sum)) needed=${dcConfigArrayLocal[dcItem].numberOfHDDNeeded}`,0,0,0)
      }

      // Check for chassis setting to have any size other than 0
      if (chassisArrayLocal[actualChassisID].sizeHDD1 == 0){
        if ((dcConfigArrayLocal[dcItem].numberOfHDDNeeded) > 0) {
          displayMsg(document, "dcConfigDetermineNumberOfMediaRequired", 1111, "error", `[chassisID=${actualChassisID},DC=${dcItem}] ERROR: workloads require HDD1 but size of HDD1 is zero`,0,0,0)
          dcConfigArrayLocal[dcItem].numberOfHDD1NeededWithoutDedicatedRocksDBNorWAL = 0
          dcConfigArrayLocal[dcItem].numberOfHDD1NeededWithoutDedicatedRocksDBDedicatedWALonNVMe9 = 0 
          dcConfigArrayLocal[dcItem].numberOfHDD1NeededWithoutDedicatedRocksDBDedicatedWALonSSD9 = 0
          dcConfigArrayLocal[dcItem].numberOfHDD1NeededWithDedicatedNVMe4IncludingWAL = 0
          dcConfigArrayLocal[dcItem].numberOfHDD1NeededWithDedicatedSSD4IncludingWAL = 0
          dcConfigArrayLocal[dcItem].numberOfHDD1NeededWithDedicatedNVMe44DedicatedWALonSSD9 = 0
          dcConfigArrayLocal[dcItem].numberOfHDD1NeededWithDedicatedSSD4DedicatedWALonSSD9 = 0
          dcConfigArrayLocal[dcItem].numberOfHDD1NeededWithDedicatedNVMe44DedicatedWALonNVMe9 = 0
          dcConfigArrayLocal[dcItem].numberOfHDD1NeededWithDedicatedSSD4DedicatedWALonNVMe9 = 0
          dcConfigArrayLocal[dcItem].numberOfHDDNeeded = 0
        }
        else {
          debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 1124, `[chassisID=${actualChassisID},DC=${dcItem}] size of HDD1=0 => dcConfigArrayLocal[dcItem].numberOfHDDNeeded=${dcConfigArrayLocal[dcItem].numberOfHDDNeeded}`,0,0,0)
        }
      }

      
      // SSD1: - number of devices - the capacity for unaligned objects is already included here in the localSSDCapacity*
      dcConfigArrayLocal[dcItem].numberOfSSD1NeededWithDedicatedRocksDBIncludingWAL = Math.ceil((localSSDCapacityWithDedicatedRocksDBIncludingWAL + localDCCorrectionForUnalignedObjectsSSD1WithDedicatedRocksDBIncludingWAL) / chassisArrayLocal[actualChassisID].sizeSSD1)
      debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 1131, `[chassisID=${actualChassisID},DC=${dcItem}] dcConfigArrayLocal[dcItem].numberOfSSD1NeededWithDedicatedRocksDBIncludingWAL=${dcConfigArrayLocal[dcItem].numberOfSSD1NeededWithDedicatedRocksDBIncludingWAL} = Math.ceil((localSSDCapacityWithDedicatedRocksDBIncludingWAL=${localSSDCapacityWithDedicatedRocksDBIncludingWAL} + localDCRocksDBSizeSSDWithDedicatedNVMeIncludingWAL=${localDCRocksDBSizeSSDWithDedicatedNVMeIncludingWAL}) / chassisArrayLocal[actualChassisID].sizeSSD1=${chassisArrayLocal[actualChassisID].sizeSSD1})`,0,0,0)
      dcConfigArrayLocal[dcItem].numberOfSSDNeeded = dcConfigArrayLocal[dcItem].numberOfSSD1NeededWithDedicatedRocksDBIncludingWAL
      debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 1133, `[chassisID=${actualChassisID},DC=${dcItem}]#SSD(sum) needed=${dcConfigArrayLocal[dcItem].numberOfSSDNeeded}`,0,0,0)
      
      dcConfigArrayLocal[dcItem].numberOfSSD1NeededWithDedicatedRocksDBDedicatedWAL = Math.ceil((localSSDCapacityWithDedicatedRocksDBDedicatedWAL + localDCCorrectionForUnalignedObjectsSSD1WithDedicatedRocksDBDedicatedWAL) / chassisArrayLocal[actualChassisID].sizeSSD1)
      debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 1136, `[chassisID=${actualChassisID},DC=${dcItem}] dcConfigArrayLocal[dcItem].numberOfSSD1NeededWithDedicatedRocksDBDedicatedWAL=${dcConfigArrayLocal[dcItem].numberOfSSD1NeededWithDedicatedRocksDBDedicatedWAL} = Math.ceil((localSSDCapacityWithDedicatedRocksDBDedicatedWAL=${localSSDCapacityWithDedicatedRocksDBDedicatedWAL} ) / chassisArrayLocal[actualChassisID].sizeSSD1=${chassisArrayLocal[actualChassisID].sizeSSD1})`,0,0,0)
      dcConfigArrayLocal[dcItem].numberOfSSDNeeded += dcConfigArrayLocal[dcItem].numberOfSSD1NeededWithDedicatedRocksDBDedicatedWAL
      debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 1138, `[chassisID=${actualChassisID},DC=${dcItem}]#SSD(sum) needed=${dcConfigArrayLocal[dcItem].numberOfSSDNeeded}`,0,0,0)
      
      dcConfigArrayLocal[dcItem].numberOfSSD1NeededWithoutDedicatedRocksDBDedicatedWAL = Math.ceil((localSSDCapacityWithoutDedicatedRocksDBDedicatedWAL + localDCRocksDBSizeSSDWithoutDedicatedNVMeDedicatedWAL + localDCRequiredIndexCapacityOnSSD1DedicatedWAL + localDCCorrectionForUnalignedObjectsSSD1WithoutDedicatedRocksDBDedicatedWAL) / chassisArrayLocal[actualChassisID].sizeSSD1)
      dcConfigArrayLocal[dcItem].numberOfSSDNeeded += dcConfigArrayLocal[dcItem].numberOfSSD1NeededWithoutDedicatedRocksDBDedicatedWAL
      debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 1142, `[chassisID=${actualChassisID},DC=${dcItem}]#SSD(sum) needed=${dcConfigArrayLocal[dcItem].numberOfSSDNeeded}`,0,0,0)

      dcConfigArrayLocal[dcItem].numberOfSSD1NeededWithoutDedicatedRocksDBNorWAL = Math.ceil((localSSDCapacityWithoutDedicatedRocksDBNorWAL + localDCRocksDBSizeSSDWithoutDedicatedNVMeNorWAL + localDCRequiredIndexCapacityOnSSD1NorWAL + localDCCorrectionForUnalignedObjectsSSD1WithoutDedicatedRocksDBNorWAL) / chassisArrayLocal[actualChassisID].sizeSSD1)
      dcConfigArrayLocal[dcItem].numberOfSSDNeeded += dcConfigArrayLocal[dcItem].numberOfSSD1NeededWithoutDedicatedRocksDBNorWAL
      debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 1146, `[chassisID=${actualChassisID},DC=${dcItem}]#SSD(sum) needed=${dcConfigArrayLocal[dcItem].numberOfSSDNeeded}`,0,0,0)

      if (generalValues.globalDebug == true || localDebugOn == true) {
        debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 1149, `[chassisID=${actualChassisID},DC=${dcItem}] #SSD w/o NVMe nor dedicated WAL needed=${dcConfigArrayLocal[dcItem].numberOfSSD1NeededWithoutDedicatedRocksDBNorWAL}`,0,0,0)
        debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 1150, `[chassisID=${actualChassisID},DC=${dcItem}] #SSD w/o NVMe w/ dedicated WAL needed=${dcConfigArrayLocal[dcItem].numberOfSSD1NeededWithoutDedicatedRocksDBDedicatedWAL}`,0,0,0)
        debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 1151, `[chassisID=${actualChassisID},DC=${dcItem}] #SSD w/ NVMe dedicated w/o separate WAL needed=${dcConfigArrayLocal[dcItem].numberOfSSD1NeededWithDedicatedRocksDBIncludingWAL}`,0,0,0)
        debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 1152, `[chassisID=${actualChassisID},DC=${dcItem}] #SSD w/ NVMe dedicated w/ separate WAL needed=${dcConfigArrayLocal[dcItem].numberOfSSD1NeededWithDedicatedRocksDBDedicatedWAL}`,0,0,0)
        debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 1153, `[chassisID=${actualChassisID},DC=${dcItem}] #SSD(sum)) needed=${dcConfigArrayLocal[dcItem].numberOfSSDNeeded}`,0,0,0)
      }

      // Check for chassis setting to have any size other than 0
      if (chassisArrayLocal[actualChassisID].sizeSSD1 == 0){
        if ((dcConfigArrayLocal[dcItem].numberOfSSDNeeded) > 0) {
          displayMsg(document, "dcConfigDetermineNumberOfMediaRequired", 1159, "error", `[chassisID=${actualChassisID},DC=${dcItem}] ERROR: workloads require HDD1 but size of HDD1 is zero`,0,0,0)
          dcConfigArrayLocal[dcItem].numberOfSSD1NeededWithoutDedicatedRocksDBNorWAL = 0
          dcConfigArrayLocal[dcItem].numberOfSSD1NeededWithoutDedicatedRocksDBDedicatedWAL = 0 
          dcConfigArrayLocal[dcItem].numberOfSSD1NeededWithDedicatedRocksDBIncludingWAL = 0
          dcConfigArrayLocal[dcItem].numberOfSSD1NeededWithDedicatedRocksDBDedicatedWAL = 0
          dcConfigArrayLocal[dcItem].numberOfSSDNeeded = 0
        }
        else {
          debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 1167, `[chassisID=${actualChassisID},DC=${dcItem}] size of SSD1=0 => dcConfigArrayLocal[dcItem].numberOfSSDNeeded=${dcConfigArrayLocal[dcItem].numberOfSSDNeeded}`,0,0,0)
        }
      }
      

      // NVMe1 - number of devices - the capacity for unaligned objects is already included here in the localNVMe1Capacity*
      dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithDedicatedRocksDBIncludingWAL = Math.ceil((localNVMe1CapacityWithDedicatedRocksDBIncludingWAL + localDCCorrectionForUnalignedObjectsNVMe1WithDedicatedRocksDBIncludingWAL) / chassisArrayLocal[actualChassisID].sizeNVMe1)
      debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 1174, `[chassisID=${actualChassisID},DC=${dcItem}] dcConfigArrayLocal[dcItem].numberOfNMVe1NeededWithDedicatedRocksDBIncludingWAL=${dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithDedicatedRocksDBIncludingWAL} = Math.ceil((localNVMe1CapacityWithDedicatedRocksDBIncludingWAL=${localNVMe1CapacityWithDedicatedRocksDBIncludingWAL} + localDCRocksDBSizeNVMe1WithDedicatedNVMeIncludingWAL=${localDCRocksDBSizeNVMe1WithDedicatedNVMeIncludingWAL}) / chassisArrayLocal[actualChassisID].sizeNVMe7=${chassisArrayLocal[actualChassisID].sizeNVMe1})`,0,0,0)
      dcConfigArrayLocal[dcItem].numberOfNVMe1Needed = dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithDedicatedRocksDBIncludingWAL

      dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithDedicatedRocksDBDedicatedWAL = Math.ceil((localNVMe1CapacityWithDedicatedRocksDBDedicatedWAL + localDCCorrectionForUnalignedObjectsNVMe1WithDedicatedRocksDBDedicatedWAL) / chassisArrayLocal[actualChassisID].sizeNVMe1)
      debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 1178, `[chassisID=${actualChassisID},DC=${dcItem}] dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithDedicatedRocksDBDedicatedWAL=${dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithDedicatedRocksDBDedicatedWAL} = Math.ceil((localNVMe1CapacityWithDedicatedRocksDBDedicatedWAL=${localNVMe1CapacityWithDedicatedRocksDBDedicatedWAL} + localDCRocksDBSizeNVMe1WithDedicatedNVMeDedicatedWAL=${localDCRocksDBSizeNVMe1WithDedicatedNVMeDedicatedWAL}) / chassisArrayLocal[actualChassisID].sizeSSD1=${chassisArrayLocal[actualChassisID].sizeNVMe1})`,0,0,0)
      dcConfigArrayLocal[dcItem].numberOfNVMe1Needed += dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithDedicatedRocksDBDedicatedWAL
      
      dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithoutDedicatedRocksDBDedicatedWAL = Math.ceil((localNVMe1CapacityWithoutDedicatedRocksDBDedicatedWAL + localDCRocksDBSizeNVMe1WithoutDedicatedNVMeDedicatedWAL + localDCRequiredIndexCapacityOnNVMe1DedicatedWAL + localDCCorrectionForUnalignedObjectsNVMe1WithoutDedicatedRocksDBDedicatedWAL) / chassisArrayLocal[actualChassisID].sizeNVMe1)
      dcConfigArrayLocal[dcItem].numberOfNVMe1Needed += dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithoutDedicatedRocksDBDedicatedWAL

      dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithoutDedicatedRocksDBNorWAL = Math.ceil((localNVMe1CapacityWithoutDedicatedRocksDBNorWAL + localDCRocksDBSizeNVMe1WithoutDedicatedNVMeNorWAL + localDCRequiredIndexCapacityOnNVMe1NorWAL + localDCCorrectionForUnalignedObjectsNVMe1WithoutDedicatedRocksDBNorWAL) / chassisArrayLocal[actualChassisID].sizeNVMe1)
      dcConfigArrayLocal[dcItem].numberOfNVMe1Needed += dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithoutDedicatedRocksDBNorWAL

      if (generalValues.globalDebug == true || localDebugOn == true) {
        debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 1188, `[chassisID=${actualChassisID},DC=${dcItem}] #NVMe1 w/o NVMe nor dedicated WAL needed=${dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithoutDedicatedRocksDBNorWAL}`,0,0,0)
        debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 1189, `[chassisID=${actualChassisID},DC=${dcItem}] #NVMe1 w/o NVMe w/ dedicated WAL needed=${dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithoutDedicatedRocksDBDedicatedWAL}`,0,0,0)
        debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 1190, `[chassisID=${actualChassisID},DC=${dcItem}] #NVMe1 w/ NVMe dedicated w/o separate WAL needed=${dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithDedicatedRocksDBIncludingWAL}`,0,0,0)
        debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 1191, `[chassisID=${actualChassisID},DC=${dcItem}] #NVMe1 w/ NVMe dedicated w/ separate WAL needed=${dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithDedicatedRocksDBDedicatedWAL}`,0,0,0)
        debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 1192, `[chassisID=${actualChassisID},DC=${dcItem}] #NVMe1(sum)) needed=${dcConfigArrayLocal[dcItem].numberOfNVMe1Needed}`,0,0,0)
      }

      // Check for chassis setting to have any size other than 0
      if (chassisArrayLocal[actualChassisID].sizeNVMe1 == 0){
        if ((dcConfigArrayLocal[dcItem].numberOfNVMe1Needed) > 0) {
          displayMsg(document, "dcConfigDetermineNumberOfMediaRequired", 1198, "error", `[chassisID=${actualChassisID},DC=${dcItem}] ERROR: workloads require NVMe1 but size of NVMe1 is zero`,0,0,0)
          dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithoutDedicatedRocksDBNorWAL = 0
          dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithoutDedicatedRocksDBDedicatedWAL = 0 
          dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithDedicatedRocksDBIncludingWAL = 0
          dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithDedicatedRocksDBDedicatedWAL = 0
          dcConfigArrayLocal[dcItem].numberOfNVMe1Needed = 0
        }
        else {
          debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 1206, `[chassisID=${actualChassisID},DC=${dcItem}] size of NVMe1=0 => dcConfigArrayLocal[dcItem].numberOfNVMe1Needed=${dcConfigArrayLocal[dcItem].numberOfNVMe1Needed}`,0,0,0)
        }
      }
      
    
      ///////////
      // Calculate number of dedicated RocksDB media per block device type with respect to dependency on different schemes of dedicated WAL devices
      ///////////

      // NVMe4 for HDD1
      dcConfigArrayLocal[dcItem].numberOfNVMe4Needed = Math.ceil((localDCRocksDBSizeHDDWithDedicatedNVMe4DedicatedWALonNVMe9 + localDCRequiredIndexCapacityOnNVMe4DedicatedWALonNVMe9) / chassisArrayLocal[actualChassisID].sizeNVMe4)
                                                     + Math.ceil((localDCRocksDBSizeHDDWithDedicatedNVMe4DedicatedWALonSSD9 + localDCRequiredIndexCapacityOnNVMe4DedicatedWALonSSD9) / chassisArrayLocal[actualChassisID].sizeNVMe4) 
                                                     + Math.ceil(((dcConfigArrayLocal[dcItem].numberOfHDD1NeededWithDedicatedNVMe4IncludingWAL * sizingConstraints.defaultSizeOfWALOnNVMeInGB / 1000) + localDCRocksDBSizeHDDWithDedicatedNVMe4IncludingWAL + localDCRequiredIndexCapacityOnNVMe4IncludingWAL)/ chassisArrayLocal[actualChassisID].sizeNVMe4)
                                                     
      
      if (dcConfigArrayLocal[dcItem].numberOfNVMe4Needed < (Math.ceil(dcConfigArrayLocal[dcItem].numberOfHDD1NeededWithDedicatedNVMe4DedicatedWALonNVMe9 / chassisArrayLocal[actualChassisID].ssdToNVMe4) + Math.ceil(dcConfigArrayLocal[dcItem].numberOfHDD1NeededWithDedicatedNVMe4DedicatedWALonSSD9 / chassisArrayLocal[actualChassisID].ssdToNVMe4) + Math.ceil(dcConfigArrayLocal[dcItem].numberOfHDD1NeededWithDedicatedNVMe4IncludingWAL / chassisArrayLocal[actualChassisID].ssdToNVMe4)) ){
        // The number of media required based on capacity is not sufficient - would need to add more NVMe for the actual required number of HDD to front.
        dcConfigArrayLocal[dcItem].numberOfNVMe4Needed = (Math.ceil(dcConfigArrayLocal[dcItem].numberOfHDD1NeededWithDedicatedNVMe4DedicatedWALonNVMe9 / chassisArrayLocal[actualChassisID].ssdToNVMe4) + Math.ceil(dcConfigArrayLocal[dcItem].numberOfHDD1NeededWithDedicatedNVMe4DedicatedWALonSSD9 / chassisArrayLocal[actualChassisID].ssdToNVMe4) + Math.ceil(dcConfigArrayLocal[dcItem].numberOfHDD1NeededWithDedicatedNVMe4IncludingWAL / chassisArrayLocal[actualChassisID].ssdToNVMe4))
        debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 1224, `[chassisID=${actualChassisID},DC=${dcItem}] #NVMe4 needed=${dcConfigArrayLocal[dcItem].numberOfNVMe4Needed}`,0,0,0)
      }
      debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 1226, `[chassisID=${actualChassisID},DC=${dcItem}] final #NVMe4 needed=${dcConfigArrayLocal[dcItem].numberOfNVMe4Needed}`,0,0,0)

      // NVMe4: Check for chassis setting to have any size other than 0 and if at all selected
      if (chassisArrayLocal[actualChassisID].sizeNVMe4 == 0){
        if (dcConfigArrayLocal[dcItem].numberOfNVMe4Needed > 0) {
          dcConfigArrayLocal[dcItem].numberOfNVMe4Needed = 0
          displayMsg(document, "dcConfigDetermineNumberOfMediaRequired", 1232, "error", `[chassisID=${actualChassisID},DC=${dcItem}] ERROR: workloads require NVMe4 but size of NVMe4 is zero`,0,0,0)
        }
        else {
          dcConfigArrayLocal[dcItem].numberOfNVMe4Needed = 0
          debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 1236, `[chassisID=${actualChassisID},DC=${dcItem}] size of NVMe4=0 => dcConfigArrayLocal[dcItem].numberOfNVMe4Needed=${dcConfigArrayLocal[dcItem].numberOfNVMe4Needed}`,0,0,0)
        }
      }
      else {
        // sizeNVMe4 is > 0
        if (chassisArrayLocal[actualChassisID].useNVMe4 == true){
          debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 1242, `[chassisID=${actualChassisID},DC=${dcItem}] #NVMe4 needed=${dcConfigArrayLocal[dcItem].numberOfNVMe4Needed}`,0,0,0)
        }
        else {
          if (dcConfigArrayLocal[dcItem].numberOfNVMe4Needed > 0) {
            dcConfigArrayLocal[dcItem].numberOfNVMe4Needed = 0
            displayMsg(document, "dcConfigDetermineNumberOfMediaRequired", 1247, "error", `[chassisID=${actualChassisID},DC=${dcItem}] ERROR: workloads require NVMe4 but use of NVMe4 is disabled`,0,0,0)
          }
          else {
            dcConfigArrayLocal[dcItem].numberOfNVMe4Needed = 0
            debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 1251, `[chassisID=${actualChassisID},DC=${dcItem}] use of NVMe4 is disabled => dcConfigArrayLocal[dcItem].numberOfNVMe4Needed=${dcConfigArrayLocal[dcItem].numberOfNVMe4Needed}`,0,0,0)
          }
        }   
      }      
      

      // SSD4 for HDD1
      dcConfigArrayLocal[dcItem].numberOfSSD4Needed = Math.ceil((localDCRocksDBSizeHDDWithDedicatedSSD4DedicatedWALonNVMe9 + localDCRequiredIndexCapacityOnSSD4DedicatedWALonNVMe9) / chassisArrayLocal[actualChassisID].sizeSSD4)
                                                     + Math.ceil((localDCRocksDBSizeHDDWithDedicatedSSD4DedicatedWALonSSD9 + localDCRequiredIndexCapacityOnSSD4DedicatedWALonSSD9) / chassisArrayLocal[actualChassisID].sizeSSD4) 
                                                     + Math.ceil(((dcConfigArrayLocal[dcItem].numberOfHDD1NeededWithDedicatedSSD4IncludingWAL * sizingConstraints.defaultSizeOfWALOnNVMeInGB / 1000) + localDCRocksDBSizeHDDWithDedicatedSSD4IncludingWAL + localDCRequiredIndexCapacityOnSSD4IncludingWAL)/ chassisArrayLocal[actualChassisID].sizeSSD4)
                                                     
      
      if (dcConfigArrayLocal[dcItem].numberOfSSD4Needed < (Math.ceil(dcConfigArrayLocal[dcItem].numberOfHDD1NeededWithDedicatedSSD4DedicatedWALonNVMe9 / chassisArrayLocal[actualChassisID].ssdToSSD4) + Math.ceil(dcConfigArrayLocal[dcItem].numberOfHDD1NeededWithDedicatedSSD4DedicatedWALonSSD9 / chassisArrayLocal[actualChassisID].ssdToSSD4) + Math.ceil(dcConfigArrayLocal[dcItem].numberOfHDD1NeededWithDedicatedSSD4IncludingWAL / chassisArrayLocal[actualChassisID].ssdToSSD4)) ){
        // The number of media required based on capacity is not sufficient - would need to add more NVMe for the actual required number of HDD to front.
        dcConfigArrayLocal[dcItem].numberOfSSD4Needed = (Math.ceil(dcConfigArrayLocal[dcItem].numberOfHDD1NeededWithDedicatedSSD4DedicatedWALonNVMe9 / chassisArrayLocal[actualChassisID].ssdToSSD4) + Math.ceil(dcConfigArrayLocal[dcItem].numberOfHDD1NeededWithDedicatedSSD4DedicatedWALonSSD9 / chassisArrayLocal[actualChassisID].ssdToSSD4) + Math.ceil(dcConfigArrayLocal[dcItem].numberOfHDD1NeededWithDedicatedSSD4IncludingWAL / chassisArrayLocal[actualChassisID].ssdToSSD4))
        debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 1266, `[chassisID=${actualChassisID},DC=${dcItem}] #SSD4 needed=${dcConfigArrayLocal[dcItem].numberOfSSD4Needed}`,0,0,0)
      }
      debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 1268, `[chassisID=${actualChassisID},DC=${dcItem}] final #SSD4 needed=${dcConfigArrayLocal[dcItem].numberOfSSD4Needed}`,0,0,0)

      // SSD4: Check for chassis setting to have any size other than 0 and if at all selected
      if (chassisArrayLocal[actualChassisID].sizeSSD4 == 0){
        if (dcConfigArrayLocal[dcItem].numberOfSSD4Needed > 0) {
          dcConfigArrayLocal[dcItem].numberOfSSD4Needed = 0
          displayMsg(document, "dcConfigDetermineNumberOfMediaRequired", 1274, "error", `[chassisID=${actualChassisID},DC=${dcItem}] ERROR: workloads require SSD4 but size of SSD4 is zero`,0,0,0)
        }
        else {
          dcConfigArrayLocal[dcItem].numberOfSSD4Needed = 0
          debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 1278, `[chassisID=${actualChassisID},DC=${dcItem}] size of SSD4=0 => dcConfigArrayLocal[dcItem].numberOfSSD4Needed=${dcConfigArrayLocal[dcItem].numberOfSSD4Needed}`,0,0,0)
        }
      }
      else {
        // sizeSSD4 is > 0
        if (chassisArrayLocal[actualChassisID].useSSD4 == true){
          debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 1284, `[chassisID=${actualChassisID},DC=${dcItem}] #SSD4 needed=${dcConfigArrayLocal[dcItem].numberOfSSD4Needed}`,0,0,0)
        }
        else {
          if (dcConfigArrayLocal[dcItem].numberOfSSD4Needed > 0) {
            dcConfigArrayLocal[dcItem].numberOfSSD4Needed = 0
            displayMsg(document, "dcConfigDetermineNumberOfMediaRequired", 1289, "error", `[chassisID=${actualChassisID},DC=${dcItem}] ERROR: workloads require SSD4 but use of SSD4 is disabled`,0,0,0)
          }
          else {
            dcConfigArrayLocal[dcItem].numberOfSSD4Needed = 0
            debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 1293, `[chassisID=${actualChassisID},DC=${dcItem}] use of SSD4 is disabled => dcConfigArrayLocal[dcItem].numberOfSSD4Needed=${dcConfigArrayLocal[dcItem].numberOfSSD4Needed}`,0,0,0)
          }
        }   
      }      
      

      // NVMe5 for SSD1
      dcConfigArrayLocal[dcItem].numberOfNVMe5Needed = Math.ceil((localDCRocksDBSizeSSDWithDedicatedNVMeDedicatedWAL + localDCRequiredIndexCapacityOnNVMe5DedicatedWAL) / chassisArrayLocal[actualChassisID].sizeNVMe5) + Math.ceil(((dcConfigArrayLocal[dcItem].numberOfSSD1NeededWithDedicatedRocksDBIncludingWAL * sizingConstraints.defaultSizeOfWALOnNVMeInGB / 1000) + localDCRocksDBSizeSSDWithDedicatedNVMeIncludingWAL + localDCRequiredIndexCapacityOnNVMe5NorWAL)/ chassisArrayLocal[actualChassisID].sizeNVMe5)
      debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 1301, `[chassisID=${actualChassisID},DC=${dcItem}] initially #NVMe5 needed=${dcConfigArrayLocal[dcItem].numberOfNVMe5Needed}`,0,0,0)
      if (dcConfigArrayLocal[dcItem].numberOfNVMe5Needed < (Math.ceil(dcConfigArrayLocal[dcItem].numberOfSSD1NeededWithDedicatedRocksDBDedicatedWAL / chassisArrayLocal[actualChassisID].ssdToNVMe5) + Math.ceil(dcConfigArrayLocal[dcItem].numberOfSSD1NeededWithDedicatedRocksDBIncludingWAL / chassisArrayLocal[actualChassisID].ssdToNVMe5)) ){
        // The number of media required based on capacity is not sufficient - would need to add more NVMe for the actual required number of SSD to front.
        dcConfigArrayLocal[dcItem].numberOfNVMe5Needed = Math.ceil((dcConfigArrayLocal[dcItem].numberOfSSD1NeededWithDedicatedRocksDBDedicatedWAL / chassisArrayLocal[actualChassisID].ssdToNVMe5) + (dcConfigArrayLocal[dcItem].numberOfSSD1NeededWithDedicatedRocksDBIncludingWAL / chassisArrayLocal[actualChassisID].ssdToNVMe5))
        debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 1305, `[chassisID=${actualChassisID},DC=${dcItem}] #NVMe5 needed=${dcConfigArrayLocal[dcItem].numberOfNVMe5Needed}`,0,0,0)
      }
      debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 1307, `[chassisID=${actualChassisID},DC=${dcItem}] final #NVMe5 needed=${dcConfigArrayLocal[dcItem].numberOfNVMe5Needed}`,0,0,0)

      // NVMe5: Check for chassis setting to have any size other than 0 and if at all selected
      if (chassisArrayLocal[actualChassisID].sizeNVMe5 == 0){
        if (dcConfigArrayLocal[dcItem].numberOfNVMe5Needed > 0) {
          dcConfigArrayLocal[dcItem].numberOfNVMe5Needed = 0
          displayMsg(document, "dcConfigDetermineNumberOfMediaRequired", 1313, "error", `[chassisID=${actualChassisID},DC=${dcItem}] ERROR: workloads require NVMe5 but size of NVMe5 is zero`,0,0,0)
        }
        else {
          dcConfigArrayLocal[dcItem].numberOfNVMe5Needed = 0
          debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 1317, `[chassisID=${actualChassisID},DC=${dcItem}] size of NVMe5=0 => dcConfigArrayLocal[dcItem].numberOfNVMe5Needed=${dcConfigArrayLocal[dcItem].numberOfNVMe5Needed}`,0,0,0)
        }
      }
      else {
        // sizeNVMe5 is > 0
        if (chassisArrayLocal[actualChassisID].useNVMe5 == true){
          debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 1323, `[chassisID=${actualChassisID},DC=${dcItem}] #NVMe5 needed=${dcConfigArrayLocal[dcItem].numberOfNVMe5Needed}`,0,0,0)
        }
        else {
          if (dcConfigArrayLocal[dcItem].numberOfNVMe5Needed > 0) {
            dcConfigArrayLocal[dcItem].numberOfNVMe5Needed = 0
            displayMsg(document, "dcConfigDetermineNumberOfMediaRequired", 1328, "error", `[chassisID=${actualChassisID},DC=${dcItem}] ERROR: workloads require NVMe5 but use of NVMe5 is disabled`,0,0,0)
          }
          else {
            dcConfigArrayLocal[dcItem].numberOfNVMe5Needed = 0
            debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 1332, `[chassisID=${actualChassisID},DC=${dcItem}] use of NVMe5 is disabled => dcConfigArrayLocal[dcItem].numberOfNVMe5Needed=${dcConfigArrayLocal[dcItem].numberOfNVMe5Needed}`,0,0,0)
          }
        }   
      }


      // NVMe7 for NVMe1
      dcConfigArrayLocal[dcItem].numberOfNVMe7Needed = Math.ceil((localDCRocksDBSizeNVMe1WithDedicatedNVMeDedicatedWAL +  localDCRequiredIndexCapacityOnNVMe7DedicatedWAL) / chassisArrayLocal[actualChassisID].sizeNVMe7) + Math.ceil((dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithDedicatedRocksDBIncludingWAL * (sizingConstraints.defaultSizeOfWALOnNVMeInGB / 1000) + localDCRocksDBSizeNVMe1WithDedicatedNVMeIncludingWAL + localDCRequiredIndexCapacityOnNVMe7IncludingWAL) / chassisArrayLocal[actualChassisID].sizeNVMe7)
      debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 1340, `[chassisID=${actualChassisID},DC=${dcItem}] initial #NVMe7 needed=${dcConfigArrayLocal[dcItem].numberOfNVMe7Needed}`,0,0,0)
      if (dcConfigArrayLocal[dcItem].numberOfNVMe7Needed < (Math.ceil(dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithDedicatedRocksDBDedicatedWAL / chassisArrayLocal[actualChassisID].nvmeToNVMe7) + Math.ceil(dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithDedicatedRocksDBIncludingWAL / chassisArrayLocal[actualChassisID].nvmeToNVMe7) )){
        // The number of media required based on capacity is not sufficient - would need to add more NVMe for the actual required number of NVMe1 to front.
        debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 1343, `[chassisID=${actualChassisID},DC=${dcItem}] #NVMe7 needed=${dcConfigArrayLocal[dcItem].numberOfNVMe7Needed} < Math.ceil(dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithDedicatedRocksDBDedicatedWAL=${dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithDedicatedRocksDBDedicatedWAL} / chassisArrayLocal[actualChassisID].nvmeToNVMe7=${chassisArrayLocal[actualChassisID].nvmeToNVMe7}) + Math.ceil(dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithDedicatedRocksDBIncludingWAL=${dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithDedicatedRocksDBIncludingWAL} / chassisArrayLocal[actualChassisID].nvmeToNVMe7=${chassisArrayLocal[actualChassisID].nvmeToNVMe7})`,0,0,0)
        dcConfigArrayLocal[dcItem].numberOfNVMe7Needed = Math.ceil(dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithDedicatedRocksDBDedicatedWAL / chassisArrayLocal[actualChassisID].nvmeToNVMe7) + Math.ceil(dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithDedicatedRocksDBIncludingWAL / chassisArrayLocal[actualChassisID].nvmeToNVMe7)
        debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 1345, `[chassisID=${actualChassisID},DC=${dcItem}] #NVMe7 needed=${dcConfigArrayLocal[dcItem].numberOfNVMe7Needed}`,0,0,0)
      }
      debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 1347, `[chassisID=${actualChassisID},DC=${dcItem}] final #NVMe7 needed=${dcConfigArrayLocal[dcItem].numberOfNVMe7Needed}`,0,0,0)

      // NVMe7: Check for chassis setting to have any size other than 0 and if at all selected
      if (chassisArrayLocal[actualChassisID].sizeNVMe7 == 0){
        if (dcConfigArrayLocal[dcItem].numberOfNVMe7Needed > 0) {
          dcConfigArrayLocal[dcItem].numberOfNVMe7Needed = 0
          displayMsg(document, "dcConfigDetermineNumberOfMediaRequired", 1353, "error", `[chassisID=${actualChassisID},DC=${dcItem}] ERROR: workloads require NVMe7 but size of NVMe7 is zero`,0,0,0)
        }
        else {
          dcConfigArrayLocal[dcItem].numberOfNVMe7Needed = 0
          debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 1357, `[chassisID=${actualChassisID},DC=${dcItem}] size of NVMe7=0 => dcConfigArrayLocal[dcItem].numberOfNVMe7Needed=${dcConfigArrayLocal[dcItem].numberOfNVMe7Needed}`,0,0,0)
        }
      }
      else {
        // sizeNVMe7 is > 0
        if (chassisArrayLocal[actualChassisID].useNVMe7 == true){
          debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 1363, `[chassisID=${actualChassisID},DC=${dcItem}] #NVMe7 needed=${dcConfigArrayLocal[dcItem].numberOfNVMe7Needed}`,0,0,0)
        }
        else {
          if (dcConfigArrayLocal[dcItem].numberOfNVMe7Needed > 0) {
            dcConfigArrayLocal[dcItem].numberOfNVMe7Needed = 0
            displayMsg(document, "dcConfigDetermineNumberOfMediaRequired", 1368, "error", `[chassisID=${actualChassisID},DC=${dcItem}] ERROR: workloads require NVMe7 but use of NVMe7 is disabled`,0,0,0)
          }
          else {
            dcConfigArrayLocal[dcItem].numberOfNVMe7Needed = 0
            debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 1372, `[chassisID=${actualChassisID},DC=${dcItem}] use of NVMe7 is disabled => dcConfigArrayLocal[dcItem].numberOfNVMe7Needed=${dcConfigArrayLocal[dcItem].numberOfNVMe7Needed}`,0,0,0)
          }
        }   
      }

      // This should now have all media covered for this DC.
      if (generalValues.globalDebug == true || localDebugOn == true) {
        debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 1379, `[chassisID=${actualChassisID},DC=${dcItem}] DC=${dcItem} => #media HDD=${dcConfigArrayLocal[dcItem].numberOfHDDNeeded}, SSDw/dedicated=${dcConfigArrayLocal[dcItem].numberOfSSD1NeededWithDedicatedRocksDBIncludingWAL}, SSDw/oDedicated=${dcConfigArrayLocal[dcItem].numberOfSSD1NeededWithoutDedicatedRocksDBNorWAL}, #SSD for data =${dcConfigArrayLocal[dcItem].numberOfSSDNeeded}, #SSD4=${dcConfigArrayLocal[dcItem].numberOfSSD4Needed}, #SSD9=${dcConfigArrayLocal[dcItem].numberOfSSD9Needed}`,0,0,0)
        debugMsg(generalValues, localDebugOn, 5, "dcConfigDetermineNumberOfMediaRequired", 1380, `[chassisID=${actualChassisID},DC=${dcItem}] DC=${dcItem} => #media NVMe1=${dcConfigArrayLocal[dcItem].numberOfNVMe1Needed}, NVMe2=${dcConfigArrayLocal[dcItem].numberOfNVMe2Needed}, NVMe3=${dcConfigArrayLocal[dcItem].numberOfNVMe3Needed}, NVMe4=${dcConfigArrayLocal[dcItem].numberOfNVMe4Needed}, NVMe5=${dcConfigArrayLocal[dcItem].numberOfNVMe5Needed}, NVMe6=${dcConfigArrayLocal[dcItem].numberOfNVMe6Needed}, NVMe7=${dcConfigArrayLocal[dcItem].numberOfNVMe7Needed}, NVMe8=${dcConfigArrayLocal[dcItem].numberOfNVMe8Needed}, NVMe9=${dcConfigArrayLocal[dcItem].numberOfNVMe9Needed}`,0,0,0)
      }
    }
  }
}

export default dcConfigDetermineNumberOfMediaRequired