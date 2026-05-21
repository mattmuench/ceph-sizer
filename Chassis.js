class Chassis {
    constructor (
        ChassisItemsDict = [],
        chassisID,
        maxHDDSlots,
        maxSSDSlots,
        maxNVMeSlots,
        maxAllSlots,
        maxDedicatedNVMeSlots,
        maxAllMediaSum,
        maxCpuSockets,
        maxCpuCores,
        
        maxMemGb,
        maxPciSlots,
        
        sizeHDD1,
        sizeSSD1,
        sizeNVMe1,

        sizeNVMe2,
        sizeNVMe6,

        sizeSSD3,
        hddToSSD3,
        useSSD3,

        sizeNVMe3,
        ssdToNVMe3,
        useNVMe3,

        sizeSSD4,
        hddToSSD4,
        useSSD4overNVMe4,
        useSSD4,


        sizeNVMe4,
        hddToNVMe4,
        
        sizeNVMe5,
        ssdToNVMe5,
        useNVMe5,

        sizeNVMe7,
        nvmeToNVMe7,
        useNVMe7,

        sizeNVMe8,
        nvmeToNVMe8,
        useNVMe8,

        sizeNVMe9,
        hddToNVMe9,
        useNVMe9,

        speedNicPublic,
        speedNicCluster,
        useRGWCaching,
    ) {

            /// For debugging purposes, this translates the cell names into the 
            /// elements to use. (Not sure I'll need it really)
            // [slotid,elementName]
            this.ChassisItemsDict = [
            ["chassisID","chassisID"],
            ["max-hdd-slots","maxHDDSlots"],
            ["max-ssd-slots","maxSSDSlots"],
            ["max-nvme-slots","maxNVMeSlots"],
            ["max-all-slots","maxAllSlots"],
            ["max-dedicated-nvme-slots","maxDedicatedNVMeSlots"],
            ["max-all-media-sum","maxAllMediaSum"],
            ["max-cpu-sockets","maxCpuSockets"],
            ["max-cpu-cores","maxCpuCores"],
            
            ["max-mem-gb","maxMemGb"],
            ["max-pci-slots","maxPciSlots"],
            ["size-hdd-1","sizeHDD1"],
            ["speed-nic-public","speedNicPublic"],

            ["size-nvme-1","sizeNVMe1"], // for data
            ["size-nvme-2","sizeNVMe2"], // for RGW cache etc.
            ["size-nvme-5","sizeNVMe5"], // for dedicated RocksDB SSD
            ["size-nvme-6","sizeNVMe6"], // for RGW index data
            ["size-nvme-7","sizeNVMe7"], // for NVMe1 dedicated WAL
            ["size-nvme-8","sizeNVMe8"], // for NVMe1 dedicated RocksDB
            ["size-ssd-1","sizeSSD1"],
            ["ssd-to-nvme3","ssdToNVMe3"],
            ["size-nvme-3","sizeNVMe3"], // NVMe type 3
            ["ssd-to-nvme5","ssdToNVMe5"], // #SSD covered for RocksDB/WAL by NVMe type 5 (incl. and excl. WAL)
            ["use-nvme-5","useNVMe5"], // use NVMe5 for dedicated RocksDB for SSD1
            ["speed-nic-cluster","speedNicCluster"],
            ["use-rgw-caching","useRGWCaching"],
            ["use-nvme-3","useNVMe3"],
            ["nvme-to-nvme7","nvmeToNVMe7"],
            ["use-nvme-7","useNVMe7"], // use NVMe7 for dedicated WAL for NVMe1
            ["nvme-to-nvme8","nvmeToNVMe8"], // for NVMe1 dedicated RocksDB
            ["use-nvme-8","useNVMe8"], // use NVMe8 for dedicated RocksDB for NVMe1

            ["use-SSD4-over-NVMe4","useSSD4overNVMe4"], // select SSD fronting instead of NVMe fronting for HDD
            ["hdd-to-ssd4","hddToSSD4"],
            ["use-ssd-4","useSSD4"],
            ["size-ssd-4","sizeSSD4"], // SSD type 4
            ["size-nvme-4","sizeNVMe4"], // for RocksDBcache HDD
            ["hdd-to-nvme4","hddToNVMe4"], // ratio of number of HDD fronted by NVMe type 4 - either SSD or NVMe fronted
            ["size-ssd-3","sizeSSD3"], // SSD type 3 for WAL for HDD
            ["hdd-to-ssd3","hddToSSD3"],
            ["use-ssd-3","useSSD3"],
            ["size-nvme-9","sizeNVMe9"], // NVMe type 9 for WAL for HDD
            ["hdd-to-nvme9","hddToNVMe9"],
            ["use-nvme-9","useNVMe9"]
            
        ]
        
        this.chassisID = 99
        this.maxHDDSlots = 0
        this.maxSSDSlots = 0
        this.maxNVMeSlots = 0
        this.maxAllSlots = 0
        this.maxDedicatedNVMeSlots = 0
        this.maxAllMediaSum = 0 // required for a valid config (unchecked for all other settings, actually)
        this.maxCpuSockets = 0
        this.maxCpuCores = 0

        this.maxMemGb = 0
        this.maxPciSlots = 3
        this.sizeHDD1 = 0
        this.speedNicPublic = 10000
        this.sizeNVMe1 = 0
        this.sizeNVMe2 = 0
        this.sizeNVMe4 = 0
        this.sizeNVMe5 = 0
        this.sizeNVMe6 = 0
        this.sizeSSD1 = 0
        this.ssdToNVMe3 = 5 // default, should be changed by setting it (for now) - should depend on ratio between used SSD vs NVMe performance difference for small IO and RocksDB WAL
        this.sizeNVMe3 = 0
        this.useSSD4overNVMe4 = 1
        this.hddToSSD4 = 5
        this.sizeSSD4 = 0
        this.useSSD4 = 0
        this.hddToNVMe4 = 17
        this.ssdToNVMe5 = 4
        this.speedNicCluster = 0
        this.useRGWCaching = 0
        this.useNVMe3 = 0
        this.useNVMe5 = 0
        this.sizeNVMe7 = 0
        this.nvmeToNVMe7 = 4
        this.useNVMe7 = 0
        this.nvmeToNVMe8 = 4
        this.useNVMe8 = 0
        this.sizeNVMe8 = 0
        this.sizeSSD3 = 0
        this.hddToSSD3 = 12
        this.useSSD3 = 0
        this.sizeNVMe9 = 0
        this.hddToNVMe9 = 17
        this.useNVMe9 = 0
        
        

    }
}


export default Chassis;