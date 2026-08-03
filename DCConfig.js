class DCConfig {
    constructor (
        DCID,
        capacityNeededForSSD,   // H41
        capacityNeededForHDD,   // H42
        capacityNeededForNVMe,  // no yet there
        numberOfLocalScaleoutInstances, // C41
        numberOfLocalSpecialInstances, // E41
        
        numberOfServersNeededAllInstances, // T41 (with all scale-out and iSCSI)
        numberOfNeededMonInstances, //S41
        numberOfServersNeededForReplicaInSameDC, // R41
        numberOfServersNeededBasedOnChassisConfig, // Q41 (based on media and config selection)
        numberOfWorkloadsInDC, // D41

        numberOfHDDNeeded, // J41
        numberOfSSDNeeded, // J42

        numberOfHDD1NeededWithoutDedicatedRocksDBNorWAL, // // WAL is included here together with block device - no use of NVMe4, SSD4, NVMe9, SSD9
        numberOfHDD1NeededWithoutDedicatedRocksDBDedicatedWALonNVMe9, // WAL is not included here (separate) but RocksDB is not separate - for slower archive use - no use of NVMe4/SSD4 but use of NVMe9 (WAL)
        numberOfHDD1NeededWithoutDedicatedRocksDBDedicatedWALonSSD9, // WAL is not included here (separate) but RocksDB is not separate - for slower archive use - no use of NVMe4/SSD4 but use of SSD9 (WAL)
        numberOfHDD1NeededWithDedicatedSSD4DedicatedWALonNVMe9, // WAL is not included here (separate) and RocksDB is definitely separate - for slower HDD based interactive workloads ? - use of SSD4 and NVMe9 (WAL)
        numberOfHDD1NeededWithDedicatedSSD4DedicatedWALonSSD9, // WAL is not included here (separate) and RocksDB is definitely separate - for slower HDD based interactive workloads ? - use of SSD4 and SSD9 (WAL)
        numberOfHDD1NeededWithDedicatedSSD4IncludingWAL, // WAL is included here with RocksDB and RocksDB is separate - use of SSD4
        numberOfHDD1NeededWithDedicatedNVMe4DedicatedWALonNVMe9, // WAL is not included here (separate) and RocksDB is definitely separate - for slower HDD based interactive workloads ? - use of NVMe4 and NVMe9 (WAL)
        numberOfHDD1NeededWithDedicatedNVMe4DedicatedWALonSSD9, // WAL is not included here (separate) and RocksDB is definitely separate - for slower HDD based interactive workloads ? - use of NVMe4 and SSD9 (WAL)
        numberOfHDD1NeededWithDedicatedNVMe4IncludingWAL, // WAL is included here with RocksDB and RocksDB is separate - use of NVMe4


        numberOfSSD1NeededWithoutDedicatedRocksDBNorWAL, // // WAL is included here together with RocksDB - for SSD1 - no use of NVMe5 nor NVMe3
        numberOfSSD1NeededWithoutDedicatedRocksDBDedicatedWAL, // WAL is not included here (separate) but RocksDB is not separate - for slower Read-Intensive SSD1 - no use of NVMe5 but use of NVMe3 (WAL)
        numberOfSSD1NeededWithDedicatedRocksDBDedicatedWAL, // WAL is not included here (separate) and RocksDB is definitely separate - for slower Read-Intensive SSD1 - use of NVMe5 and NVMe3 (WAL)
        numberOfSSD1NeededWithDedicatedRocksDBIncludingWAL, // WAL is included here with RocksDB and RocksDB is separate - for NVMe1 - use of NVMe5

        numberOfNVMe1NeededWithoutDedicatedRocksDBNorWAL, // // WAL is included here together with RocksDB -  for NVMe1 - no use of NVMe8 nor NVMe7
        numberOfNVMe1NeededWithoutDedicatedRocksDBDedicatedWAL, // WAL is not included here (separate) but RocksDB is not separate - for slower Read-Intensive NVMe1 - no use of NMVe8 (RocksDB) but use of NVMe7 (WAL)
        numberOfNVMe1NeededWithDedicatedRocksDBDedicatedWAL, // WAL is not included here (separate) and RocksDB is definitely separate - for slower Read-Intensive NVMe1 - use of NVMe8 (RocksDB) and use of NVMe7 (WAL)
        numberOfNVMe1NeededWithDedicatedRocksDBIncludingWAL, // WAL is included here with RocksDB and RocksDB is separate -  for NVMe1 - use of NVMe8 (RocksDB+WAL)
        
        numberOfSSD4Needed, // RocksDB for HDD on SSD
        numberOfSSD9Needed, // RocksDB for HDD on SSD
        numberOfNVMe1Needed, 
        numberOfNVMe2Needed, // N41 - for RGW dedicated cache (distinct per use case)
        numberOfNVMe3Needed, // => WAL on NVMe for SSD1
        numberOfNVMe4Needed, // => RocksDB+WAL HDD on NVMe
        numberOfNVMe5Needed, // => RocksDB SSD
        numberOfNVMe6Needed, // => RGW index data
        numberOfNVMe7Needed, // => WAL on NVMe for NVMe1
        numberOfNVMe8Needed, // => RocksDB on NVMe for NVMe1
        numberOfNVMe9Needed, // => RocksDB on NVMe for NVMe1
        
        numberOfCoresNeeded, // V41
        memNeededPerServer, // W41

        prelimPerServerNumberOfHDDNeeded, // HDD per server
        prelimPerServerNumberOfHDDWithoutDedicatedRocksDBNeeded, // SSD1 without NVMe5 
        prelimPerServerNumberOfHDDWithDedicatedRockSDBonSSD4Needed,
        prelimPerServerNumberOfHDDWithDedicatedRockSDBonNVMe4Needed,
        prelimPerServerNumberOfSSDNeeded, // SSD per server
        prelimPerServerNumberOfSSDWithoutDedicatedNVMeNeeded, // SSD1 without NVMe5 
        prelimPerServerNumberOfSSDWithDedicatedNVMeNeeded,
        prelimPerServerNumberOfNVMe1NeededWithoutDedicatedWAL, // NVMe1 per server
        prelimPerServerNumberOfNVMe1NeededWithDedicatedWAL,
        
        prelimPerServerNumberOfSSD4Needed,  // SSD4 per server 
        prelimPerServerNumberOfSSD9Needed,  // SSD9 per server 
        prelimPerServerNumberOfNVMe1Needed, // NVMe1 per server - not needed anymore because of separation into prelimPerServerNumberOfSSDWithoutDedicatedNVMeNeeded and prelimPerServerNumberOfSSDWithDedicatedNVMeNeeded
        prelimPerServerNumberOfNVMe2Needed, // NVMe2 per server
        prelimPerServerNumberOfNVMe3Needed, // NVMe3 per server
        prelimPerServerNumberOfNVMe4Needed, // NVMe4 per server
        prelimPerServerNumberOfNVMe5Needed, // NVMe5 per server
        prelimPerServerNumberOfNVMe6Needed, // NVMe6 per server
        prelimPerServerNumberOfNVMe7Needed, // NVMe7 per server
        prelimPerServerNumberOfNVMe8Needed, // NVMe8 per server
        prelimPerServerNumberOfNVMe9Needed, // NVMe9 per server
        prelimPerServerNumberOfCoresNeeded, // cores per server
        prelimPerServerMemNeededPerServer,  // memory per server
        prelimNumberOfServers,              // instead of resultingNumberOfServers that was used differently before
        

        constraintsBasedOnCores, // X41
        constraintsBasedOnMem, // X41
        constraintsBasedOnNothing, // X41
        constraintsBasedOnAll, // X41

        resultingNumberOfServers, // somehow equal to Y41
        resultingNumberOfCores, // Z41
        resultingMem, // AA41
        resultingNumberOfSSD, // AC41
        resultingNumberOfSSD4,
        resultingNumberOfSSD9,
        resultingNumberOfHDD, // AD41
        resultingNumberOfNVMe1, // AB41 (unused yet)
        resultingNumberOfNVMe2, // AE41
        resultingNumberOfNVMe3, 
        resultingNumberOfNVMe4,
        resultingNumberOfNVMe5,
        resultingNumberOfNVMe6,
        resultingNumberOfNVMe7,
        resultingNumberOfNVMe8,
        resultingNumberOfNVMe9,
        resultingNumberOfServersAsPerChassis, // Y41
        resultingNumberOfServersForiSCSILocalAsPerChassis, // Y42
        resultingNumberOfPublicNetNICs,
        resultingNumberOfClusterNetNICs
    ) {
        this.DCID = 0
        this.capacityNeededForSSD = 0   // H41
        this.capacityNeededForHDD = 0   // H42
        this.capacityNeededForNVMe = 0  // no yet there
        this.numberOfLocalScaleoutInstances = 0 // C41
        this.numberOfLocalSpecialInstances = 0 // E41
        
        this.numberOfServersNeededAllInstances = 0 // T41
        this.numberOfNeededMonInstances = 0 //S41
        this.numberOfServersNeededForReplicaInSameDC = 0 // R41
        this.numberOfServersNeededBasedOnChassisConfig = 0 // Q41
        this.numberOfWorkloadsInDC = 0 // D41

        this.numberOfHDDNeeded = 0 // J41
        this.numberOfSSDNeeded = 0 // J42

        this.numberOfHDD1NeededWithoutDedicatedRocksDBNorWAL = 0
        this.numberOfHDD1NeededWithoutDedicatedRocksDBDedicatedWALonNVMe9 = 0
        this.numberOfHDD1NeededWithoutDedicatedRocksDBDedicatedWALonSSD9 = 0
        this.numberOfHDD1NeededWithDedicatedSSD4DedicatedWALonNVMe9 = 0
        this.numberOfHDD1NeededWithDedicatedSSD4DedicatedWALonSSD9 = 0
        this.numberOfHDD1NeededWithDedicatedSSD4IncludingWAL = 0
        this.numberOfHDD1NeededWithDedicatedNVMe4DedicatedWALonNVMe9 = 0
        this.numberOfHDD1NeededWithDedicatedNVMe4DedicatedWALonSSD9 = 0
        this.numberOfHDD1NeededWithDedicatedNVMe4IncludingWAL = 0


        this.numberOfSSD1NeededWithoutDedicatedRocksDBNorWAL = 0
        this.numberOfSSD1NeededWithoutDedicatedRocksDBDedicatedWAL = 0
        this.numberOfSSD1NeededWithDedicatedRocksDBDedicatedWAL = 0
        this.numberOfSSD1NeededWithDedicatedRocksDBIncludingWAL = 0

        this.numberOfNVMe1NeededWithoutDedicatedRocksDBNorWAL = 0 // // WAL is included here together with RocksDB 
        this.numberOfNVMe1NeededWithoutDedicatedRocksDBDedicatedWAL = 0 // WAL is not included here (separate) but RocksDB is not separate - for slower Read-Intensive NVMe1
        this.numberOfNVMe1NeededWithDedicatedRocksDBDedicatedWAL = 0 // WAL is not included here (separate) and RocksDB is definitely separate - for slower Read-Intensive NVMe1
        this.numberOfNVMe1NeededWithDedicatedRocksDBIncludingWAL = 0 // WAL is included here with RocksDB and RocksDB is separate 
        
        
        this.numberOfSSD4Needed = 0 // RocksDB for HDD on SSD
        this.numberOfSSD9Needed = 0 // WAL for HDD on SSD
        this.numberOfNVMe1Needed = 0 
        this.numberOfNVMe2Needed = 0 // for RGW dedicated cache (distinct per use case)
        this.numberOfNVMe3Needed = 0 // 
        this.numberOfNVMe4Needed = 0 //  => RocksDB+WAL HDD on NVMe
        this.numberOfNVMe5Needed = 0 // => RocksDB SSD
        this.numberOfNVMe6Needed = 0 // => RGW index data
        this.numberOfNVMe7Needed = 0 // => WAL on NVMe for NVMe1
        this.numberOfNVMe8Needed = 0 // => RocksDB on NVMe for NVMe1
        this.numberOfNVMe9Needed = 0 // => WAL on NVMe for HDD1
        
        this.numberOfCoresNeeded = 4 // V41
        this.memNeededPerServer = 0 // W41

        this.constraintsBasedOnCores = 0 // X41
        this.constraintsBasedOnMem = 0 // X41
        this.constraintsBasedOnNothing = 0 // X41
        this.constraintsBasedOnAll = 0 // X41

        this.resultingNumberOfServers = 0 // Y41
        this.resultingNumberOfCores = 0 // Z41
        this.resultingMem = 0 // AA41
        this.resultingNumberOfSSD = 0 // AC41
        this.resultingNumberOfSSD4 = 0
        this.resultingNumberOfSSD9 = 0
        this.resultingNumberOfHDD = 0 // AD41
        this.resultingNumberOfNVMe1 = 0 // AB41 
        this.resultingNumberOfNVMe2 = 0 // AE41
        this.resultingNumberOfNVMe3 = 0 //AF41
        this.resultingNumberOfNVMe4 = 0
        this.resultingNumberOfNVMe5 = 0
        this.resultingNumberOfNVMe6 = 0
        this.resultingNumberOfNVMe7 = 0
        this.resultingNumberOfNVMe8 = 0
        this.resultingNumberOfNVMe9 = 0

        this.resultingNumberOfServersAsPerChassis = 0
        this.resultingNumberOfServersForiSCSILocalAsPerChassis = 0 // Y42
        this.resultingNumberOfPublicNetNICs = 0
        this.resultingNumberOfClusterNetNICs = 0
    }
}


export default DCConfig;