class SizingConstraints {
    constructor (
        coresPerRGWCacheDevice,
        coresPerNVMeOForWALDevice,
        coresPerHDD,
        coresPerSSDold,
        coresPerSSDnew,
        coresPerNVMe,
        coresPerNVMe1,
        coresPerNVMe2,
        coresPerNVMe3,
        coresPerNVMe4,
        coresPerNVMe5,
        coresPerNVMe6,
        coresPerNVMe7,
        coresPerNVMeForObjectIndexOnNVMe6, // AH5
        coresPerAdditionalRole,
        coresPerNodeBase,  // AR5 w/o the special roles needs (below)
        coresPerMONInstance,
        coresPerMGRInstance,
        coresPerRGWInstance,
        coresPeriSCSIInstance,
        coresPerMDSInstance,
        coresPerRBDMirrorInstance,

        memInGBPerHDD,
        memInGBPerSSD,
        memInGBPerNVMe,
        memInGBPerNVMe2,
        memInGBPerNVMeForObjectIndexOnNVMe6, //AH6 
        memPerNodeBase,
        memPerMONInstance,
        memPerMGRInstance,
        memPerAdditionalRole,
        memPerRGWInstance,
        memPeriSCSIInstance,
        memPerMDSInstance,
        memPerRBDMirrorInstance,

        sizeOfWALOnNVMeInGB,

        defaultCoresPerRGWCacheDevice, // G3
        defaultCoresPerNVMeOForWALDevice, // G4
        defaultCoresPerHDD, // G5
        defaultCoresPerSSDold, // J5
        defaultCoresPerSSDnew,
        defaultCoresPerNVMe, // N5
        defaultCoresPerNVMe1,
        defaultCoresPerNVMe2,
        defaultCoresPerNVMe3,
        defaultCoresPerNVMe4,
        defaultCoresPerNVMe5,
        defaultCoresPerNVMe6,
        defaultCoresPerNVMe7,
        defaultCoresPerNVMeForObjectIndexOnNVMe6,
        defaultCoresPerAdditionalRole,
        defaultCoresPerNodeBase,
        defaultCoresPerMONInstance,
        defaultCoresPerMGRInstance,
        defaultCoresPerRGWInstance,
        defaultCoresPeriSCSIInstance,
        defaultCoresPerMDSInstance,
        defaultCoresPerRBDMirrorInstance,

        defaultMemInGBPerHDD,   // G6
        defaultMemInGBPerSSD,   // J6
        defaultMemInGBPerNVMe, // N6 (2 OSDs)
        defaultMemInGBPerNVMe2,
        defaultMemInGBPerNVMeForObjectIndexOnNVMe6,
        defaultMemPerNodeBase,
        defaultMemPerMONInstance,
        defaultMemPerMGRInstance,
        defaultMemPerAdditionalRole,
        defaultMemPerRGWInstance,
        defaultMemPeriSCSIInstance,
        defaultMemPerMDSInstance,
        defaultMemPerRBDMirrorInstance,

        defaultSizeOfWALOnNVMeInGB,
        
        addCapacityPerPoolUse = [],
        defaultAddCapacityPerPoolUse = [],
        rocksDBWALCoverage = [],
        defaultRocksDBWALCoverage = [],

        minNumberOfServersInHDDConfig,
        minNumberOfServersInFlashConfig,
        minNumberOfServersForSpecialRoles,
        minNumberOfServersForMONRole,
        minNumberOfServersForMONin2plus1DCConfigPerDC,

        defaultMinNumberOfServersInHDDConfig,
        defaultMinNumberOfServersInFlashConfig,
        defaultMinNumberOfServersForSpecialRoles,
        defaultMinNumberOfServersForMONRole,
        defaultMinNumberOfServersForMONin2plus1DCConfigPerDC,

        minNumberOfInstancesRoleMon,
        minNumberOfInstancesRoleMGR,
        minNumberOfInstancesRoleRGW,
        minNumberOfInstancesRoleMDS,
        minNumberOfInstancesRoleiSCSI,

        defaultMinNumberOfInstancesRoleMon,
        defaultMinNumberOfInstancesRoleMGR,
        defaultMinNumberOfInstancesRoleRGW,
        defaultMinNumberOfInstancesRoleMDS,
        defaultMinNumberOfInstancesRoleiSCSI,

        
        networkBandwidthPerHDDinMBsec,
        networkBandwidthPerSSDoldinMBsec,
        networkBandwidthPerNVMeinMBsec,

        defaultNetworkBandwidthPerHDDinMBsec,
        defaultNetworkBandwidthPerSSDinMBsec,
        defaultNetworkBandwidthPerNVMeinMBsec,

        minPercentageOfClusterBandwidthForClientTrafficPerNode,
        expectedAverageEntrySizeInObjectIndexInBytes,

        defaultMinPercentageOfClusterBandwidthForClientTrafficPerNode,
        defaultExpectedAverageEntrySizeInObjectIndexInBytes,

        subsRHCSperTB256Capacity,
        subsRHCSperTB512Capacity,
        subsRHCSperTB1000Capacity,
        subsRHCSperTB2000Capacity,
        subsRHCSperTB3000Capacity,
        subsRHCSperTB4000Capacity,
        subsRHCSperTB5000Capacity,
        subsRHCSperTB10000Capacity,
        subsRHCSperTB256Nodes,
        subsRHCSperTB512Nodes,
        subsRHCSperTB1000Nodes,
        subsRHCSperTB2000Nodes,
        subsRHCSperTB3000Nodes,
        subsRHCSperTB4000Nodes,
        subsRHCSperTB5000Nodes,
        subsRHCSperTB10000Nodes,

        cephClusterNearFull,
        defaultCephClusterNearFull,

        requiredNumberOfReplicaForObjectIndex, // by default should be 3

        // fixed values based on code
        fixedMinAllocSizeOnMediaHDD,    // min_alloc_size for media used: HDD (currently with up to Reef the same as for flash)
        fixedMinAllocSizeOnMediaSSD    // min_alloc_size for media used: flash = 4K

    )
    {
        // pre-sets for defaults
        // Cores = HT cores = vCPU
        this.defaultCoresPerRGWCacheDevice = 4
        this.defaultCoresPerNVMeOForWALDevice = 12
        this.defaultCoresPerHDD = 2
        this.defaultCoresPerSSDold = 4
        this.defaultCoresPerSSDnew = 8
        this.defaultCoresPerNVMe = 16 // logical CPUs seen => for HT #cores/2
        this.defaultCoresPerNVMe1 = 8
        this.defaultCoresPerNVMe2 = 2
        this.defaultCoresPerNVMe3 = 4
        this.defaultCoresPerNVMe4 = 0  // is accounted for in HDD cores
        this.defaultCoresPerNVMe5 = 0  // is accounted for in SSD cores
        this.defaultCoresPerNVMe6 = 4
        this.defaultCoresPerNVMe7 = 4  // is accounted for in ordinary NVMe cores (for block device)
        this.defaultCoresPerNVMeForObjectIndexOnNVMe6 = 4
        this.defaultCoresPerAdditionalRole = 4
        this.defaultCoresPerNodeBase = 8
        this.defaultCoresPerMONInstance = 4
        this.defaultCoresPerMGRInstance = 3
        this.defaultCoresPerRGWInstance = 8
        this.defaultCoresPeriSCSIInstance = 8
        this.defaultCoresPerMDSInstanc = 8
        this.defaultCoresPerRBDMirrorInstance = 4

        this.defaultSizeOfWALOnNVMeInGB = 30

        this.defaultMemInGBPerHDD = 10
        this.defaultMemInGBPerSSD = 15
        // NVMe: 2 OSD per NVMe - this is still for Reef for economical reasons
        // Normally, a full fledged NVMe could be driven out by > 12...16 vCPU (logical cores).
        // However, this would be at cost for higher latency. Because of this, it's more
        // economical still to use 2 OSD per NVMe with the same or higher number of vCPU to 
        // stay below the latency boundary of single used NVMe but deliver at least the same performance.
        this.defaultMemInGBPerNVMe = 30
        this.defaultMemInGBPerNVMe2 = 8
        this.defaultMemInGBPerNVMeForObjectIndexOnNVMe6 = 15
        this.defaultMemPerNodeBase = 16
        this.defaultMemPerMONInstance = 8
        this.defaultMemPerMGRInstance = 8
        this.defaultMemPerAdditionalRole = 8
        this.defaultMemPerRGWInstance = 8
        this.defaultMemPeriSCSIInstance = 8
        this.defaultMemPerMDSInstance = 8
        this.defaultMemPerRBDMirrorInstance = 8
        
        this.addCapacityPerPoolUse = [["rbd",2],["rgwdata",4],["filedata",4],["filemetadata",10],["iscsi",2]]
        this.defaultAddCapacityPerPoolUse = [["rbd",2],["rgwdata",4],["filedata",4],["filemetadata",10],["iscsi",2]]
        // HDD-SSD: #HDD fronted per SSD
        // SSD-NVMe: #SSD fronted by NVMe - type 5
        // HDD-NVMe: #HDD fronted by NVMe - type 4
        // WAL-NVMeO: #NVMe fronted by Optane - typ NVMe type 3
        this.rocksDBWALCoverage = [["HDD-SSD",5],["SSD-NVMe",4],["HDD-NVMe",17],["WAL-NVMeO",6]]
        this.defaultRocksDBWALCoverage = [["HDD-SSD",5],["SSD-NVMe",4],["HDD-NVMe",17],["WAL-NVMeO",6]]

        this.defaultMinNumberOfServersInHDDConfig = 4
        this.defaultMinNumberOfServersInFlashConfig = 3
        this.defaultMinNumberOfServersForSpecialRoles = 2
        this.defaultMinNumberOfServersForMONRole = 3
        this.defaultMinNumberOfServersForMONin2plus1DCConfigPerDC = 2

        

        this.defaultMinNumberOfInstancesRoleMon = 3
        this.defaultMinNumberOfInstancesRoleMGR = 3
        this.defaultMinNumberOfInstancesRoleRGW = 2
        this.defaultMinNumberOfInstancesRoleMDS = 2
        this.defaultMinNumberOfInstancesRoleiSCSI = 2

        this.defaultNetworkBandwidthPerHDDinMBsec = 100
        this.defaultNetworkBandwidthPerSSDinMBsec = 500
        this.defaultNetworkBandwidthPerNVMeinMBsec = 1000

        this.defaultMinPercentageOfClusterBandwidthForClientTrafficPerNode = 10
        this.defaultExpectedAverageEntrySizeInObjectIndexInBytes = 300

        this.defaultCephClusterNearFull = 0.85  // 85%

        this.requiredNumberOfReplicaForObjectIndex = 3

        // pre-sets for subscriptions: capacity and nodes are different per set

        this.subsRHCSperTB256Capacity = 256
        this.subsRHCSperTB512Capacity = 512
        this.subsRHCSperTB1000Capacity = 1000
        this.subsRHCSperTB2000Capacity = 2000
        this.subsRHCSperTB3000Capacity = 3000
        this.subsRHCSperTB4000Capacity = 4000
        this.subsRHCSperTB5000Capacity = 5000
        this.subsRHCSperTB10000Capacity = 10000
        this.subsRHCSperTB256Nodes = 12
        this.subsRHCSperTB512Nodes = 25
        this.subsRHCSperTB1000Nodes = 50
        this.subsRHCSperTB2000Nodes = 100
        this.subsRHCSperTB3000Nodes = 150
        this.subsRHCSperTB4000Nodes = 200
        this.subsRHCSperTB5000Nodes = 200
        this.subsRHCSperTB10000Nodes = 400


        // pre-sets from defaults

        this.coresPerRGWCacheDevice = this.defaultCoresPerRGWCacheDevice
        this.coresPerNVMeOForWALDevice = this.defaultCoresPerNVMeOForWALDevice
        this.coresPerHDD = this.defaultCoresPerHDD
        this.coresPerSSDold = this.defaultCoresPerSSDold
        this.coresPerSSDnew = this.defaultCoresPerSSDnew
        this.coresPerNVMe = this.defaultCoresPerNVMe
        this.coresPerNVMe1 = this.defaultCoresPerNVMe1
        this.coresPerNVMe2 = this.defaultCoresPerNVMe2
        this.coresPerNVMe3 = this.defaultCoresPerNVMe3
        this.coresPerNVMe4 = this.defaultCoresPerNVMe4
        this.coresPerNVMe5 = this.defaultCoresPerNVMe5
        this.coresPerNVMe6 = this.defaultCoresPerNVMe6
        this.coresPerNVMe7 = this.defaultCoresPerNVMe7
        this.coresPerNVMeForObjectIndexOnNVMe6 = this.defaultCoresPerNVMeForObjectIndexOnNVMe6
        this.coresPerAdditionalRole = this.defaultCoresPerAdditionalRole
        this.coresPerNodeBase = this.defaultCoresPerNodeBase
        this.coresPerMONInstance = this.defaultCoresPerMONInstance
        this.coresPerMGRInstance = this.defaultCoresPerMGRInstance
        this.coresPerRGWInstance = this.defaultCoresPerRGWInstance
        this.coresPeriSCSIInstance = this.defaultCoresPeriSCSIInstance
        this.coresPerMDSInstance = this.defaultCoresPerMDSInstance
        this.coresPerRBDMirrorInstance = this.defaultCoresPerRBDMirrorInstance

        this.sizeOfWALOnNVMeInGB = this.defaultSizeOfWALOnNVMeInGB

        this.memInGBPerHDD = this.defaultMemInGBPerHDD
        this.memInGBPerSSD = this.defaultMemInGBPerSSD
        this.memInGBPerNVMe = this.defaultMemInGBPerNVMe
        this.memInGBPerNVMe2 = this.defaultMemInGBPerNVMe2
        this.memInGBPerNVMeForObjectIndexOnNVMe6 = this.defaultMemInGBPerNVMeForObjectIndexOnNVMe6
        this.memPerNodeBase = this.defaultMemPerNodeBase
        this.memPerMONInstance = this.defaultMemPerMONInstance
        this.memPerMGRInstance = this.defaultMemPerMGRInstance
        this.memPerAdditionalRole = this.defaultMemPerAdditionalRole
        this.memPerRGWInstance = this.defaultMemPerRGWInstance
        this.memPeriSCSIInstance = this.defaultMemPeriSCSIInstance
        this.memPerMDSInstance = this.defaultMemPerMDSInstance
        this.memPerRBDMirrorInstance = this.defaultMemPerRBDMirrorInstance

        this.minNumberOfServersInHDDConfig = this.defaultMinNumberOfServersInHDDConfig
        this.minNumberOfServersInFlashConfig = this.defaultMinNumberOfServersInFlashConfig
        this.minNumberOfServersForSpecialRoles = this.defaultMinNumberOfServersForSpecialRoles
        this.minNumberOfServersForMONRole = this.defaultMinNumberOfServersForMONRole
        this.minNumberOfServersForMONin2plus1DCConfigPerDC = this.defaultMinNumberOfServersForMONin2plus1DCConfigPerDC

        this.minNumberOfInstancesRoleMon = this.defaultMinNumberOfInstancesRoleMon
        this.minNumberOfInstancesRoleMGR = this.defaultMinNumberOfInstancesRoleMGR
        this.minNumberOfInstancesRoleRGW = this.defaultMinNumberOfInstancesRoleRGW
        this.minNumberOfInstancesRoleMDS = this.defaultMinNumberOfInstancesRoleMDS
        this.minNumberOfInstancesRoleiSCSI = this.defaultMinNumberOfInstancesRoleiSCSI

        this.networkBandwidthPerHDDinMBsec = this.defaultNetworkBandwidthPerHDDinMBsec
        this.networkBandwidthPerSSDoldinMBsec = this.defaultNetworkBandwidthPerSSDinMBsec
        this.networkBandwidthPerNVMeinMBsec = this.defaultNetworkBandwidthPerNVMeinMBsec

        this.minPercentageOfClusterBandwidthForClientTrafficPerNode = this.defaultMinPercentageOfClusterBandwidthForClientTrafficPerNode
        this.expectedAverageEntrySizeInObjectIndexInBytes = this.defaultExpectedAverageEntrySizeInObjectIndexInBytes


        this.cephClusterNearFull = this.defaultCephClusterNearFull
        
        this.fixedMinAllocSizeOnMediaHDD = 4096
        this.fixedMinAllocSizeOnMediaSSD = 4096
    }
    
}

export default SizingConstraints;