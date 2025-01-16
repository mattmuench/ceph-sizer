class Results {
    constructor (
        ChassisItemsDict = [],
        chassisID,
        numServers,
        highDensity,
        nmvePerformance,
        publicNICs,
        clusterNICs,
        cpuCores,
        memMin,
        sizeHDD1,
        numHDD1,
        sizeSSD1,
        numSSD1,
        numSSD4,
        sizeNVMe1,
        numNVMe1,
        numNVMe2,
        numNVMe3,
        numNVMe4,
        numNVMe5,
        numNVMe6,
        numNVMe7,
        numNVMe8,
        rawCapacityDataDevices,
        netCapacityDataDevices,
        rawCapacityAllDevices,
        numSKUwithTB10000,
        numSKUwithTB5000,
        numSKUwithTB1000,
        numSKUwithTB512,
        numSKUwithTB256,
        potMaxConfigSSD,
        potMaxConfigHDD,
        potMaxConfigNVMe1,
        recNetFullSSD,
        recNetFullHDD,
        recNetFullNVMe

    ) {

        /// For debugging purposes, this translates the cell names into the 
        /// elements to use. (Not sure I'll need it really)
        // [slotid,elementName]
        this.ChassisItemsDict = [
            ["gen","chassisID"],
            ["num-servers","numServers"],
            ["selector-highdense","highDensity"],
            ["selector-nvme","nvmePerformance"],
            ["nic-num-pub","publicNICs"],
            ["nic-num-cluster","clusterNICs"],
            ["num-cpu-cores","cpuCores"],
            ["num-mem-gb","memMin"],
            ["size-hdd-1","sizeHDD1"],
            ["num-hdd-1","numHDD1"],
            ["size-ssd-1","sizeSSD1"],
            ["num-ssd-1","numSSD1"],
            ["size-nvme-1","sizeNVMe1"],
            ["num-nvme-1","numNVMe1"],
            ["num-nvme-2","numNVMe2"],
            ["num-nvme-3","numNVMe3"],
            ["num-nvme-4","numNVMe4"],
            ["num-nvme-5","numNVMe5"],
            ["num-nvme-6","numNVMe6"],
            ["num-nvme-7","numNVMe7"],
            ["num-nvme-8","numNVMe8"],
            ["num-ssd-4","numSSD4"],
            ["capacity-raw-data","rawCapacityDataDevices"],
            ["capacity-net","netCapacityDataDevices"],
            ["capacity-raw","rawCapacityAllDevices"],
            ["sku-10-pb","numSKUwithTB10000"],
            ["sku-5-pb","numSKUwithTB5000"],
            ["sku-1-pb","numSKUwithTB1000"],
            ["sku-512-tb","numSKUwithTB512"],
            ["sku-256-tb","numSKUwithTB256"],
            ["pot-max-cfg-ssd","potMaxConfigSSD"],
            ["pot-max-cgf-hdd","potMaxConfigHDD"],
            ["pot-max-cfg-nvme","potMaxConfigNVMe1"],
            ["rec-net-full-ssd","recNetFullSSD"],
            ["rec-net-full-hdd","recNetFullHDD"],
            ["rec-net-full-nvme","recNetFullNVMe"]
            
        ]
        
        
        this.chassisID = 0
        this.numServers = 0
        this.highDensity = false
        this.nvmePerformance = false
        this.publicNICs = 0
        this.clusterNICs = 0
        this.cpuCores = 0
        this.memMin = 0
        this.sizeHDD1 = 0
        this.numHDD1 = 0
        this.sizeSSD1 = 0
        this.numSSD1 = 0
        this.numSSD4 = 0
        this.sizeNVMe1 = 0
        this.numNVMe1 = 0
        this.numNVMe2 = 0
        this.numNVMe3 = 0
        this.numNVMe4 = 0
        this.numNVMe5 = 0
        this.numNVMe6 = 0
        this.numNVMe7 = 0
        this.numNVMe8 = 0
        this.rawCapacityDataDevices = 0
        this.netCapacityDataDevices = 0
        this.rawCapacityAllDevices = 0
        this.numSKUwithTB10000 = 0
        this.numSKUwithTB5000 = 0
        this.numSKUwithTB1000 = 0
        this.numSKUwithTB512 = 0
        this.numSKUwithTB256 = 0
        this.potMaxConfigSSD = 0
        this.potMaxConfigHDD = 0
        this.potMaxConfigNVMe1 = 0
        this.recNetFullSSD = 0
        this.recNetFullHDD = 0
        this.recNetFullNVMe = 0

    }
}


export default Results;