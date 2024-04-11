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
        numberOfSSDWithoutDedicatedNVMeNeeded,
        numberOfSSDWithDedicatedNVMeNeeded,
        numberOfNVMe1NeededWithoutDedicatedWAL, // M41 - for data
        numberOfNVMe1NeededWithDedicatedWAL,
        
        numberOfSSD4Needed, // none yet - RocksDB+WAL HDD on SSD
        numberOfNVMe2Needed, // N41 - for RGW dedicated cache (distinct per use case)
        numberOfNVMe3Needed, // U41 - "Optanes"
        numberOfNVMe4Needed, // none yet => RocksDB+WAL HDD on NVMe
        numberOfNVMe5Needed, // none yet => RocksDB SSD
        numberOfNVMe6Needed, // none yet => RGW index data
        numberOfNVMe7Needed, // none yet =? WAL for NVMe
        
        numberOfCoresNeeded, // V41
        memNeededPerServer, // W41

        prelimPerServerNumberOfHDDNeeded, // HDD per server
        prelimPerServerNumberOfSSDNeeded, // SSD per server
        prelimPerServerNumberOfSSDWithoutDedicatedNVMeNeeded,
        prelimPerServerNumberOfSSDWithDedicatedNVMeNeeded,
        prelimPerServerNumberOfNVMe1NeededWithoutDedicatedWAL, // NVMe1 per server
        prelimPerServerNumberOfNVMe1NeededWithDedicatedWAL,
        
        prelimPerServerNumberOfSSD4Needed,  // SSD4 per server
        prelimPerServerNumberOfNVMe2Needed, // NVMe2 per server
        prelimPerServerNumberOfNVMe3Needed, // NVMe3 per server
        prelimPerServerNumberOfNVMe4Needed, // NVMe4 per server
        prelimPerServerNumberOfNVMe5Needed, // NVMe5 per server
        prelimPerServerNumberOfNVMe6Needed, // NVMe6 per server
        prelimPerServerNumberOfNVMe7Needed, // NVMe7 per server
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
        resultingNumberOfNVMe1, // AB41 (unused yet)
        resultingNumberOfSSD, // AC41
        resultingNumberOfHDD, // AD41
        resultingNumberOfNVMe2, // AE41
        resultingNumberOfNVMe3, //AF41
        resultingNumberOfNVMe4,
        resultingNumberOfNVMe5,
        resultingNumberOfNVMe6,
        resultingNumberOfNVMe7,
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
        this.numberOfSSDWithoutDedicatedNVMeNeeded = 0
        this.numberOfSSDWithDedicatedNVMeNeeded = 0
        this.numberOfNVMe1NeededWithoutDedicatedWAL = 0 // M41 - for data
        this.numberOfNVMe1NeededWithDedicatedWAL = 0
        
        this.numberOfSSD4Needed = 0 // none yet - RocksDB+WAL HDD on SSD
        this.numberOfNVMe2Needed = 0 // N41 - for RGW dedicated cache (distinct per use case)
        this.numberOfNVMe3Needed = 0 // U41 - "Optanes"
        this.numberOfNVMe4Needed = 0 // none yet => RocksDB+WAL HDD on NVMe
        this.numberOfNVMe5Needed = 0 // none yet => RocksDB SSD
        this.numberOfNVMe6Needed = 0 // none yet => RGW index data
        this.numberOfNVMe7Needed = 0 // none yet =? WAL for NVMe
        
        this.numberOfCoresNeeded = 4 // V41
        this.memNeededPerServer = 0 // W41

        this.constraintsBasedOnCores = 0 // X41
        this.constraintsBasedOnMem = 0 // X41
        this.constraintsBasedOnNothing = 0 // X41
        this.constraintsBasedOnAll = 0 // X41

        this.resultingNumberOfServers = 0 // Y41
        this.resultingNumberOfCores = 0 // Z41
        this.resultingMem = 0 // AA41
        this.resultingNumberOfNVMe1 = 0 // AB41 (unused yet)
        this.resultingNumberOfSSD = 0 // AC41
        this.resultingNumberOfHDD = 0 // AD41
        this.resultingNumberOfNVMe2 = 0 // AE41
        this.resultingNumberOfNVMe3 = 0 //AF41
        this.resultingNumberOfNVMe4 = 0
        this.resultingNumberOfNVMe5 = 0
        this.resultingNumberOfNVMe6 = 0
        this.resultingNumberOfNVMe7 = 0

        this.resultingNumberOfServersAsPerChassis = 0
        this.resultingNumberOfServersForiSCSILocalAsPerChassis = 0 // Y42
        this.resultingNumberOfPublicNetNICs = 0
        this.resultingNumberOfClusterNetNICs = 0
    }
}


export default DCConfig;