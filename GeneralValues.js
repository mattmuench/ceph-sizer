class GeneralValues {
    constructor (
        desiredCapacityInTiB,
        desiredCapacityInTB,
        // Enable cell labels by setting globalDebug to true
        globalDebug,
        // All tables will show this number of configs - global setting (might become configurable eventually)
        numberOfConfigsPossible,
        // Number of workloads 
        numberOfWorkloadsPossible,
        // Number of DCs possible (and will be displayed in the detailed configs -- NOT YET: dynamic number of DCs in workloads)
        numberOfDCsPossible,
        // Number of DCs actually in use for all workloads
        numberOfDCsInUse,
        // Similar or different config per DC is desired ?
        desiredSimilarConfig, 
        desiredSimilarMediaConfig,   // servers different using the same capacity media config number but different for special media
        desiredSameMediaConfig,   // servers different using the same capacity media config number and same number of special media
        desiredSeparateHDDConfig,   // servers use either HDD or flash
        desiredSeparateSSDDedicatedNVMeConfig   // servers different using the same capacity media config number but different for special media
        
    )
    {
        this.desiredCapacityInTiB = desiredCapacityInTiB
        this.desiredCapacityInTB = desiredCapacityInTB
        this.globalDebug = false        // false or true
        this.numberOfConfigsPossible = 8  // default: 8 (?)
        this.numberOfWorkloadsPossible = 8  // actually must be set to #workloads + 1
        this.numberOfDCsPossible = 8
        this.desiredSimilarConfig = 0
        this.desiredSimilarMediaConfig = 1
        this.desiredSameMediaConfig = 0
        this.desiredSeparateHDDConfig = 1
        this.desiredSeparateSSDDedicatedNVMeConfig = 0
        this.numberOfDCsInUse = 0
    }
    convertTiBIntoTB(inputCapacityInTiB) {
        this.desiredCapacityInTB = inputCapacityInTiB * 1024/1000 * 1024/1000 * 1024/1000 * 1024/1000
    }
}

export default GeneralValues;