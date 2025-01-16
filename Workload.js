class Workload {
    constructor (
        workloadItemsDict = [],
        workloadID,
        reqCapacityNet,
        reqFlashPercent,
        useCase,
        reqNumReplica,
        reqNumberFd,
        selectorNVMe, // Indicates the use of NVMe for flash
        selectorHighdense,
        sizeAvgObj,
        sizeAvgFile,
        selectorArrayDC = [],
        sumNumberDC,
        checkNumDC,
        checkInputDC,
        selectorRGWCache,
        checkMinServersAll,
        checkArrayMinServersDC = [],
        RGWLifecycleNumVersions,
        selectorRGWIndexDedicatedFlashPool,
        selectorSSDDedicatedNVMe, // SSD: for separating RocksDB placement 
        selectorSSDDedicatedNVMeForWAL, // SSD: for WAL separation from media and RocksDB - w/ or w/o RocksDB dedicated 
        selectorNVMe1DedicatedNVMe, // NVMe1: for separating RocksDB placement 
        selectorNVMe1DedicatedNVMeForWAL, // NVMe1: for WAL separation from media - w/ or w/o RocksDB dedicated 
        reqIndexCapacityHDD,   // capacity needed for any kind of flash to host the object index for HDD portion
        reqIndexCapacityFlash, // capacity needed for index on flash only part of workload

        // For calculation onwards: determine workload specific constraints for different dependencies from
        //   actually desired configuration.
        //   
        // How much percent of desired capacity should be accounted for the RocksDB/WAL
        rocksDBSpaceInPercent,
        // gross capacity with headroom in TB
        reqCapacityGrossHDD,
        reqCapacityGrossSSD,
        // not used yet: 
        reqCapacityGrossNVMe,
        // all the additional NVMe and flash types for various use types - calculated per DC for selected DCs
        reqCapacityGrossNVMe2PerDC, // for RGW cache etc.
        reqCapacityGrossNVMe4PerDC, // for RocksDBcache HDD - overall, but granularity based on #media vs flash device (capacity and performance)
        reqCapacityGrossNVMe5PerDC, // for RocksDBcache SSD
        reqCapacityGrossNVMe6PerDC  // for RGW index data
        
    ) {

            /// For debugging purposes, this translates the cell names into the 
            /// elements to use. (Not sure I'll need it really)
            // [slotid,elementName]
            const dcSelectorList = []
            const dcMinServerList = []

            this.workloadItemsDict = [
            ["workloadID","workloadID"],
            ["req-capacity-net","reqCapacityNet"],
            ["req-flash-percent","reqFlashPercent"],
            ["use-case","useCase"],
            ["req-num-replica","reqNumReplica"],
            ["req-number-fd","reqNumberFd"],
            ["selector-nvme","selectorNVMe"],
            ["selector-highdense","selectorHighdense"], // this could be used to pick from reduced h/w requriements for CPU/mem/network (instead of full perf SizingConstraints)
            ["size-avg-obj","sizeAvgObj"],
            ["size-avg-file","sizeAvgFile"],
            ["selector-dc","selectorArrayDC",dcSelectorList],
            //["selector-dc1",true],
            //["selector-dc2",true],
            //["selector-dc3",true],
            //["selector-dc4",true],
            //["selector-dc5",true],
            //["selector-dc6",true],
            //["selector-dc7",true],
            ["output-sum-number-dc","sumNumberDC"],
            ["output-check-num-dc","checkNumDC"],
            ["output-check-input-dc","checkInputDC"],
            ["selector-rgw-cache","selectorRGWCache"],
            ["output-check-min-servers-dc","checkArrayMinServersDC",dcMinServerList],
            // ["check-min-servers-all",0],
            // ["check-min-servers-dc1",0],
            // ["check-min-servers-dc2",0],
            // ["check-min-servers-dc3",0],
            // ["check-min-servers-dc4",0],
            // ["check-min-servers-dc5",0],
            // ["check-min-servers-dc6",0],
            // ["check-min-servers-dc7",0],
            // number of versions in life cycle is 1 without versioning enabled
            ["rgw-lifecycle-num-versions","RGWLifecycleNumVersions"],
            ["selector-rgw-index-flash","selectorRGWIndexDedicatedFlashPool"],
            ["selector-SSDdedicatedNVMe","selectorSSDDedicatedNVMe"],
            ["selector-SSDdedicatedNVMeForWAL","selectorSSDDedicatedNVMeForWAL"],
            ["selector-NVMe1dedicatedNVMe","selectorNVMe1DedicatedNVMe"],
            ["selector-NVMe1dedicatedNVMeForWAL","selectorNVMe1DedicatedNVMeForWAL"]
        ]
        
        this.workloadID = 99
        this.reqCapacityNet = 0
        this.reqFlashPercent = 0
        this.useCase = "rbd"
        this.reqNumReplica = 3
        this.reqNumberFd = 1
        this.selectorNVMe = 0  // by default, still use SSD instead of NVMe for capacity
        this.selectorHighdense = 0
        this.sizeAvgObj = 100
        this.sizeAvgFile = 4
        /// Selector DC array to assign the seletions must be filled during creation of the object
        /// by evaluating the allowed number of DCs => currently, it is 7 DCs but might be different 
        /// in the future for some reason, e.g. with many more EC k+m distributions
        // this.selector-dc1 = true
        // this.selector-dc2 = true
        // this.selector-dc3 = true
        // this.selector-dc4 = true
        // this.selector-dc5 = true
        // this.selector-dc6 = true
        // this.selector-dc7 = true
        this.selectorArrayDC = []

        this.sumNumberDC = 1
        this.checkNumDC = "ok"
        this.checkInputDC = "CONDITIONALLY OK - number of DCs = 1"
        this.selectorRGWCache = 0
        this.checkMinServersAll = 0
        /// Check servers per DC array to assign the seletions must be filled during creation of the object
        /// by evaluating the allowed number of DCs => currently, it is 7 DCs but might be different 
        /// in the future for some reason, e.g. with many more EC k+m distributions
        // this.check-min-servers-dc1 = 0
        // this.check-min-servers-dc2 = 0
        // this.check-min-servers-dc3 = 0
        // this.check-min-servers-dc4 = 0
        // this.check-min-servers-dc5 = 0
        // this.check-min-servers-dc6 = 0
        // this.check-min-servers-dc7 = 0
        this.checkArrayMinServersDC = []

        this.selectorRGWLifecycleNumVersions = 1
        this.selectorRGWIndexDedicatedFlashPool = 0
        this.selectorSSDDedicatedNVMe = 0
        this.selectorSSDDedicatedNVMeForWAL = 0
        this.selectorNVMe1DedicatedNVMe = 0
        this.selectorNVMe1DedicatedNVMeForWAL = 0

        this.reqIndexCapacityHDD = 0
        this.reqIndexCapacityFlash = 0

        this.reqCapacityGrossHDD = 0
        this.reqCapacityGrossSSD = 0
        this.reqCapacityGrossNVMe = 0
    }
}


export default Workload;