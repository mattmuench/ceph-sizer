

const calcResultsOverview = function (generalValues, configsArrayLocal, chassisArrayLocal, resultsOverviewArrayLocal) {
    /**
     * The results don't need to be calculated for individual configs since those are already available in DCConfig.
     * For the overview, also the calculation for the SKUs must be provided as well as the raw capacity and the net capacity available.
     */
    for (let actualChassisID = 0; actualChassisID < generalValues.numberOfConfigsPossible; actualChassisID++) {
        // local values for summary per chassis config
            // local variables for features that might be different per chassis but doesn't count towards the general configuration used
            let localNICPublicHighestNum = 0
            let localNICClusterHighestNum = 0
            let localCoresHighestNum = 0
            let localMemHighest = 0
            console.log(`calcResultsOverview() 15: resultsOverviewArrayLocal[chassisID=${actualChassisID}].rawCapacityDataDevices=${resultsOverviewArrayLocal[actualChassisID].rawCapacityDataDevices}`)
        
        for (let dcItem = 0; dcItem < generalValues.numberOfDCsPossible; dcItem++) {
            // do the calculation for the overview
            console.log(`calcResultsOverview() 19: dcItem=${dcItem}, actualChassisID=${actualChassisID}, value from configs for resultingNumberOfServersAsPerChassis=${configsArrayLocal[actualChassisID][dcItem].resultingNumberOfServersAsPerChassis}`)
            resultsOverviewArrayLocal[actualChassisID].numServers += configsArrayLocal[actualChassisID][dcItem].resultingNumberOfServersAsPerChassis
            
            // resultsOverviewArrayLocal[actualChassisID].highDensity 
            // resultsOverviewArrayLocal[actualChassisID].fullPerformance
            if (localNICPublicHighestNum < configsArrayLocal[actualChassisID][dcItem].resultingNumberOfPublicNetNICs) {
                localNICPublicHighestNum = configsArrayLocal[actualChassisID][dcItem].resultingNumberOfPublicNetNICs
            }
            if (localNICClusterHighestNum < configsArrayLocal[actualChassisID][dcItem].resultingNumberOfClusterNetNICs) {
                localNICClusterHighestNum = configsArrayLocal[actualChassisID][dcItem].resultingNumberOfClusterNetNICs
            }
            if (localCoresHighestNum < configsArrayLocal[actualChassisID][dcItem].resultingNumberOfCores) {
                localCoresHighestNum = configsArrayLocal[actualChassisID][dcItem].resultingNumberOfCores
            }
            if (localMemHighest < configsArrayLocal[actualChassisID][dcItem].resultingMem) {
                localMemHighest = configsArrayLocal[actualChassisID][dcItem].resultingMem
            }
            
            
            resultsOverviewArrayLocal[actualChassisID].numHDD1 += configsArrayLocal[actualChassisID][dcItem].resultingNumberOfHDD * configsArrayLocal[actualChassisID][dcItem].resultingNumberOfServersAsPerChassis
            
            resultsOverviewArrayLocal[actualChassisID].numSSD1 += configsArrayLocal[actualChassisID][dcItem].resultingNumberOfSSD * configsArrayLocal[actualChassisID][dcItem].resultingNumberOfServersAsPerChassis
            resultsOverviewArrayLocal[actualChassisID].numSSD4 += Math.ceil(configsArrayLocal[actualChassisID][dcItem].resultingNumberOfHDD / chassisArrayLocal[actualChassisID].hddToSSD4) * configsArrayLocal[actualChassisID][dcItem].resultingNumberOfServersAsPerChassis
            
            resultsOverviewArrayLocal[actualChassisID].numNVMe1 += configsArrayLocal[actualChassisID][dcItem].resultingNumberOfNVMe1 * configsArrayLocal[actualChassisID][dcItem].resultingNumberOfServersAsPerChassis
            resultsOverviewArrayLocal[actualChassisID].numNVMe2 += configsArrayLocal[actualChassisID][dcItem].resultingNumberOfNVMe2 * configsArrayLocal[actualChassisID][dcItem].resultingNumberOfServersAsPerChassis
            resultsOverviewArrayLocal[actualChassisID].numNVMe3 += configsArrayLocal[actualChassisID][dcItem].resultingNumberOfNVMe3 * configsArrayLocal[actualChassisID][dcItem].resultingNumberOfServersAsPerChassis
            resultsOverviewArrayLocal[actualChassisID].numNVMe4 += configsArrayLocal[actualChassisID][dcItem].resultingNumberOfNVMe4 * configsArrayLocal[actualChassisID][dcItem].resultingNumberOfServersAsPerChassis
            resultsOverviewArrayLocal[actualChassisID].numNVMe5 += configsArrayLocal[actualChassisID][dcItem].resultingNumberOfNVMe5 * configsArrayLocal[actualChassisID][dcItem].resultingNumberOfServersAsPerChassis
            resultsOverviewArrayLocal[actualChassisID].numNVMe6 += configsArrayLocal[actualChassisID][dcItem].resultingNumberOfNVMe6 * configsArrayLocal[actualChassisID][dcItem].resultingNumberOfServersAsPerChassis
            resultsOverviewArrayLocal[actualChassisID].numNVMe7 += configsArrayLocal[actualChassisID][dcItem].resultingNumberOfNVMe7 * configsArrayLocal[actualChassisID][dcItem].resultingNumberOfServersAsPerChassis
            
            // resultsOverviewArrayLocal[actualChassisID].numSKUwithTB10000
            // resultsOverviewArrayLocal[actualChassisID].numSKUwithTB5000
            // resultsOverviewArrayLocal[actualChassisID].numSKUwithTB1000
            // resultsOverviewArrayLocal[actualChassisID].numSKUwithTB512
            // resultsOverviewArrayLocal[actualChassisID].numSKUwithTB256
            // resultsOverviewArrayLocal[actualChassisID].potMaxConfigSSD
            // resultsOverviewArrayLocal[actualChassisID].potMaxConfigHDD
            // resultsOverviewArrayLocal[actualChassisID].potMaxConfigNVMe1
            // resultsOverviewArrayLocal[actualChassisID].recNetFullSSD
            // resultsOverviewArrayLocal[actualChassisID].recNetFullHDD
            // resultsOverviewArrayLocal[actualChassisID].recNetFullNVMe
            
        }
        console.log(`calcResultsOverview() 64: resultsOverviewArrayLocal[chassisID=${actualChassisID}].numServers=${resultsOverviewArrayLocal[actualChassisID].numServers}`)
        resultsOverviewArrayLocal[actualChassisID].publicNICs  = localNICPublicHighestNum
        resultsOverviewArrayLocal[actualChassisID].clusterNICs = localNICClusterHighestNum
        resultsOverviewArrayLocal[actualChassisID].cpuCores = localCoresHighestNum
        resultsOverviewArrayLocal[actualChassisID].memMin = localMemHighest
        resultsOverviewArrayLocal[actualChassisID].sizeHDD1 = chassisArrayLocal[actualChassisID].sizeHDD1
        resultsOverviewArrayLocal[actualChassisID].sizeSSD1 = chassisArrayLocal[actualChassisID].sizeSSD1
        resultsOverviewArrayLocal[actualChassisID].sizeNVMe1 = chassisArrayLocal[actualChassisID].sizeNVMe1
        
        console.log(`calcResultsOverview() 73: resultsOverviewArrayLocal[chassisID=${actualChassisID}].rawCapacityDataDevices=${resultsOverviewArrayLocal[actualChassisID].rawCapacityDataDevices}`)
        resultsOverviewArrayLocal[actualChassisID].rawCapacityDataDevices += resultsOverviewArrayLocal[actualChassisID].numHDD1 * resultsOverviewArrayLocal[actualChassisID].sizeHDD1
                                                                            + resultsOverviewArrayLocal[actualChassisID].numSSD1 * resultsOverviewArrayLocal[actualChassisID].sizeSSD1
                                                                            + resultsOverviewArrayLocal[actualChassisID].numNVMe1 * resultsOverviewArrayLocal[actualChassisID].sizeNVMe1
        resultsOverviewArrayLocal[actualChassisID].netCapacityDataDevices = 0
        console.log(`calcResultsOverview() 78: resultsOverviewArrayLocal[chassisID=${actualChassisID}].rawCapacityDataDevices=${resultsOverviewArrayLocal[actualChassisID].rawCapacityDataDevices}`)
        console.log(`calcResultsOverview() 79: resultsOverviewArrayLocal[chassisID=${actualChassisID}].numNVMe1=${resultsOverviewArrayLocal[actualChassisID].numNVMe1}`)
        console.log(`calcResultsOverview() 80: resultsOverviewArrayLocal[chassisID=${actualChassisID}].numNVMe2=${resultsOverviewArrayLocal[actualChassisID].numNVMe2}`)
        console.log(`calcResultsOverview() 81: resultsOverviewArrayLocal[chassisID=${actualChassisID}].numNVMe3=${resultsOverviewArrayLocal[actualChassisID].numNVMe3}`)
        console.log(`calcResultsOverview() 82: resultsOverviewArrayLocal[chassisID=${actualChassisID}].numNVMe4=${resultsOverviewArrayLocal[actualChassisID].numNVMe4}`)
        console.log(`calcResultsOverview() 83: resultsOverviewArrayLocal[chassisID=${actualChassisID}].numNVMe5=${resultsOverviewArrayLocal[actualChassisID].numNVMe5}`)
        console.log(`calcResultsOverview() 84: resultsOverviewArrayLocal[chassisID=${actualChassisID}].numNVMe6=${resultsOverviewArrayLocal[actualChassisID].numNVMe6}`)
        console.log(`calcResultsOverview() 85: resultsOverviewArrayLocal[chassisID=${actualChassisID}].numNVMe7=${resultsOverviewArrayLocal[actualChassisID].numNVMe7}`)
        console.log(`calcResultsOverview() 86: resultsOverviewArrayLocal[chassisID=${actualChassisID}].numSSD4=${resultsOverviewArrayLocal[actualChassisID].numSSD4}`)
        resultsOverviewArrayLocal[actualChassisID].rawCapacityAllDevices += resultsOverviewArrayLocal[actualChassisID].rawCapacityDataDevices
                                                                           + resultsOverviewArrayLocal[actualChassisID].numNVMe1 * chassisArrayLocal[actualChassisID].sizeNVMe1
                                                                           + resultsOverviewArrayLocal[actualChassisID].numNVMe2 * chassisArrayLocal[actualChassisID].sizeNVMe2
                                                                           + resultsOverviewArrayLocal[actualChassisID].numNVMe3 * chassisArrayLocal[actualChassisID].sizeNVMe3
                                                                           + resultsOverviewArrayLocal[actualChassisID].numNVMe4 * chassisArrayLocal[actualChassisID].sizeNVMe4
                                                                           + resultsOverviewArrayLocal[actualChassisID].numNVMe5 * chassisArrayLocal[actualChassisID].sizeNVMe5
                                                                           + resultsOverviewArrayLocal[actualChassisID].numNVMe6 * chassisArrayLocal[actualChassisID].sizeNVMe6
                                                                           + resultsOverviewArrayLocal[actualChassisID].numNVMe7 * chassisArrayLocal[actualChassisID].sizeNVMe7
                                                                           + resultsOverviewArrayLocal[actualChassisID].numSSD4 * chassisArrayLocal[actualChassisID].sizeSSD4

       // The sums should be rounded up for displaying
       resultsOverviewArrayLocal[actualChassisID].rawCapacityDataDevices = Math.ceil(resultsOverviewArrayLocal[actualChassisID].rawCapacityDataDevices)
       resultsOverviewArrayLocal[actualChassisID].netCapacityDataDevices = Math.ceil(resultsOverviewArrayLocal[actualChassisID].netCapacityDataDevices)
       resultsOverviewArrayLocal[actualChassisID].rawCapacityAllDevices = Math.ceil(resultsOverviewArrayLocal[actualChassisID].rawCapacityAllDevices)
       console.log(`calcResultsOverview() 101: resultsOverviewArrayLocal[chassisID=${actualChassisID}].rawCapacityDataDevices=${resultsOverviewArrayLocal[actualChassisID].rawCapacityDataDevices}`)
       console.log(`calcResultsOverview() 102: resultsOverviewArrayLocal[chassisID=${actualChassisID}].netCapacityDataDevices=${resultsOverviewArrayLocal[actualChassisID].netCapacityDataDevices}`)
       console.log(`calcResultsOverview() 103: resultsOverviewArrayLocal[chassisID=${actualChassisID}].rawCapacityAllDevices=${resultsOverviewArrayLocal[actualChassisID].rawCapacityAllDevices}`)
    }
    
}

export default calcResultsOverview