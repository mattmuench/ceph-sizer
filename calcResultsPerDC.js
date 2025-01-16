

const calcResultsPerDC = function (generalValues, configsArrayLocal, chassisArrayLocal, resultsPerDCArray) {
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
      
      for (let dcItem = 0; dcItem < generalValues.numberOfDCsPossible; dcItem++) {
        // do the calculation for the overview
        console.log(`calcResultsPerDC() 18: dcItem=${dcItem}, actualChassisID=${actualChassisID}, value from configs=${configsArrayLocal[actualChassisID][dcItem].resultingNumberOfServersAsPerChassis}`)
        resultsPerDCArray[actualChassisID][dcItem].numServers += configsArrayLocal[actualChassisID][dcItem].resultingNumberOfServersAsPerChassis
        
        // resultsPerDCArray[actualChassisID][dcItem].highDensity 
        // resultsPerDCArray[actualChassisID][dcItem].nvmePerformance
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
          
          
        resultsPerDCArray[actualChassisID][dcItem].numHDD1 += configsArrayLocal[actualChassisID][dcItem].resultingNumberOfHDD
        
        resultsPerDCArray[actualChassisID][dcItem].numSSD1 += configsArrayLocal[actualChassisID][dcItem].resultingNumberOfSSD
        resultsPerDCArray[actualChassisID][dcItem].numSSD4 += Math.ceil(configsArrayLocal[actualChassisID][dcItem].resultingNumberOfHDD / chassisArrayLocal[actualChassisID].hddToSSD4)
        
        resultsPerDCArray[actualChassisID][dcItem].numNVMe1 += configsArrayLocal[actualChassisID][dcItem].resultingNumberOfNVMe1
        resultsPerDCArray[actualChassisID][dcItem].numNVMe2 += configsArrayLocal[actualChassisID][dcItem].resultingNumberOfNVMe2
        resultsPerDCArray[actualChassisID][dcItem].numNVMe3 += configsArrayLocal[actualChassisID][dcItem].resultingNumberOfNVMe3
        resultsPerDCArray[actualChassisID][dcItem].numNVMe4 += configsArrayLocal[actualChassisID][dcItem].resultingNumberOfNVMe4
        resultsPerDCArray[actualChassisID][dcItem].numNVMe5 += configsArrayLocal[actualChassisID][dcItem].resultingNumberOfNVMe5
        resultsPerDCArray[actualChassisID][dcItem].numNVMe6 += configsArrayLocal[actualChassisID][dcItem].resultingNumberOfNVMe6
        resultsPerDCArray[actualChassisID][dcItem].numNVMe7 += configsArrayLocal[actualChassisID][dcItem].resultingNumberOfNVMe7
        resultsPerDCArray[actualChassisID][dcItem].numNVMe8 += configsArrayLocal[actualChassisID][dcItem].resultingNumberOfNVMe8
        console.log(`calcResultsPerDC() 49:  configsArrayLocal[actualChassisID][dcItem].resultingNumberOfNVMe1=${configsArrayLocal[actualChassisID][dcItem].resultingNumberOfNVMe1}`)
        console.log(`calcResultsPerDC() 50:  configsArrayLocal[actualChassisID][dcItem].resultingNumberOfNVMe2=${configsArrayLocal[actualChassisID][dcItem].resultingNumberOfNVMe2}`)
        console.log(`calcResultsPerDC() 51:  configsArrayLocal[actualChassisID][dcItem].resultingNumberOfNVMe3=${configsArrayLocal[actualChassisID][dcItem].resultingNumberOfNVMe3}`)
        console.log(`calcResultsPerDC() 52:  configsArrayLocal[actualChassisID][dcItem].resultingNumberOfNVMe4=${configsArrayLocal[actualChassisID][dcItem].resultingNumberOfNVMe4}`)
        console.log(`calcResultsPerDC() 53:  configsArrayLocal[actualChassisID][dcItem].resultingNumberOfNVMe5=${configsArrayLocal[actualChassisID][dcItem].resultingNumberOfNVMe5}`)
        console.log(`calcResultsPerDC() 54:  configsArrayLocal[actualChassisID][dcItem].resultingNumberOfNVMe6=${configsArrayLocal[actualChassisID][dcItem].resultingNumberOfNVMe6}`)
        console.log(`calcResultsPerDC() 55:  configsArrayLocal[actualChassisID][dcItem].resultingNumberOfNVMe7=${configsArrayLocal[actualChassisID][dcItem].resultingNumberOfNVMe7}`)
        console.log(`calcResultsPerDC() 56:  configsArrayLocal[actualChassisID][dcItem].resultingNumberOfNVMe8=${configsArrayLocal[actualChassisID][dcItem].resultingNumberOfNVMe8}`)
          
        // resultsPerDCArray[actualChassisID][dcItem].numSKUwithTB10000
        // resultsPerDCArray[actualChassisID][dcItem].numSKUwithTB5000
        // resultsPerDCArray[actualChassisID][dcItem].numSKUwithTB1000
        // resultsPerDCArray[actualChassisID][dcItem].numSKUwithTB512
        // resultsPerDCArray[actualChassisID][dcItem].numSKUwithTB256
        // resultsPerDCArray[actualChassisID][dcItem].potMaxConfigSSD
        // resultsPerDCArray[actualChassisID][dcItem].potMaxConfigHDD
        // resultsPerDCArray[actualChassisID][dcItem].potMaxConfigNVMe1
        // resultsPerDCArray[actualChassisID][dcItem].recNetFullSSD
        // resultsPerDCArray[actualChassisID][dcItem].recNetFullHDD
        // resultsPerDCArray[actualChassisID][dcItem].recNetFullNVMe
          
      
        console.log(`calcResultsPerDC() 63: resultsPerDCArray[${actualChassisID}][dcItem=${dcItem}].numServers=${resultsPerDCArray[actualChassisID][dcItem].numServers}`)
        resultsPerDCArray[actualChassisID][dcItem].publicNICs  = localNICPublicHighestNum
        resultsPerDCArray[actualChassisID][dcItem].clusterNICs = localNICClusterHighestNum
        resultsPerDCArray[actualChassisID][dcItem].cpuCores = localCoresHighestNum
        resultsPerDCArray[actualChassisID][dcItem].memMin = localMemHighest
        resultsPerDCArray[actualChassisID][dcItem].sizeHDD1 = chassisArrayLocal[actualChassisID].sizeHDD1
        resultsPerDCArray[actualChassisID][dcItem].sizeSSD1 = chassisArrayLocal[actualChassisID].sizeSSD1
        resultsPerDCArray[actualChassisID][dcItem].sizeNVMe1 = chassisArrayLocal[actualChassisID].sizeNVMe1

        resultsPerDCArray[actualChassisID][dcItem].rawCapacityDataDevices = resultsPerDCArray[actualChassisID][dcItem].numHDD1 * resultsPerDCArray[actualChassisID][dcItem].sizeHDD1
                                                                            + resultsPerDCArray[actualChassisID][dcItem].numSSD1 * resultsPerDCArray[actualChassisID][dcItem].sizeSSD1
                                                                            + resultsPerDCArray[actualChassisID][dcItem].numNVMe1 * resultsPerDCArray[actualChassisID][dcItem].sizeNVMe1
        resultsPerDCArray[actualChassisID][dcItem].netCapacityDataDevices = 0
        resultsPerDCArray[actualChassisID][dcItem].rawCapacityAllDevices = resultsPerDCArray[actualChassisID][dcItem].rawCapacityDataDevices
                                                                           + resultsPerDCArray[actualChassisID][dcItem].numNVMe2 * chassisArrayLocal[actualChassisID].sizeNVMe2
                                                                           + resultsPerDCArray[actualChassisID][dcItem].numNVMe3 * chassisArrayLocal[actualChassisID].sizeOptane1
                                                                           + resultsPerDCArray[actualChassisID][dcItem].numNVMe4 * chassisArrayLocal[actualChassisID].sizeNVMe4
                                                                           + resultsPerDCArray[actualChassisID][dcItem].numNVMe5 * chassisArrayLocal[actualChassisID].sizeNVMe5
                                                                           + resultsPerDCArray[actualChassisID][dcItem].numNVMe6 * chassisArrayLocal[actualChassisID].sizeNVMe6
                                                                           + resultsPerDCArray[actualChassisID][dcItem].numNVMe7 * chassisArrayLocal[actualChassisID].sizeNVMe7
                                                                           + resultsPerDCArray[actualChassisID][dcItem].numNVMe8 * chassisArrayLocal[actualChassisID].sizeNVMe8
                                                                           + resultsPerDCArray[actualChassisID][dcItem].numSSD4 * chassisArrayLocal[actualChassisID].sizeSSD4
        console.log(`calcResultsPerDC() 85:  resultsPerDCArray[${actualChassisID}][dcItem=${dcItem}].numNVMe2=${resultsPerDCArray[actualChassisID][dcItem].numNVMe2} * chassisArrayLocal[actualChassisID].sizeNVMe2=${chassisArrayLocal[actualChassisID].sizeNVMe2}`)
        console.log(`calcResultsPerDC() 86:  resultsPerDCArray[${actualChassisID}][dcItem=${dcItem}].numNVMe3=${resultsPerDCArray[actualChassisID][dcItem].numNVMe3} * chassisArrayLocal[actualChassisID].sizeNVMe3=${chassisArrayLocal[actualChassisID].sizeOptane1}`)
        console.log(`calcResultsPerDC() 87:  resultsPerDCArray[${actualChassisID}][dcItem=${dcItem}].numNVMe4=${resultsPerDCArray[actualChassisID][dcItem].numNVMe4} * chassisArrayLocal[actualChassisID].sizeNVMe4=${chassisArrayLocal[actualChassisID].sizeNVMe4}`)
        console.log(`calcResultsPerDC() 88:  resultsPerDCArray[${actualChassisID}][dcItem=${dcItem}].numNVMe5=${resultsPerDCArray[actualChassisID][dcItem].numNVMe5} * chassisArrayLocal[actualChassisID].sizeNVMe5=${chassisArrayLocal[actualChassisID].sizeNVMe5}`)
        console.log(`calcResultsPerDC() 89:  resultsPerDCArray[${actualChassisID}][dcItem=${dcItem}].numNVMe6=${resultsPerDCArray[actualChassisID][dcItem].numNVMe6} * chassisArrayLocal[actualChassisID].sizeNVMe6=${chassisArrayLocal[actualChassisID].sizeNVMe6}`)
        console.log(`calcResultsPerDC() 90:  resultsPerDCArray[${actualChassisID}][dcItem=${dcItem}].numNVMe7=${resultsPerDCArray[actualChassisID][dcItem].numNVMe7} * chassisArrayLocal[actualChassisID].sizeNVMe7=${chassisArrayLocal[actualChassisID].sizeNVMe7}`)
        console.log(`calcResultsPerDC() 91:  resultsPerDCArray[${actualChassisID}][dcItem=${dcItem}].numNVMe8=${resultsPerDCArray[actualChassisID][dcItem].numNVMe8} * chassisArrayLocal[actualChassisID].sizeNVMe8=${chassisArrayLocal[actualChassisID].sizeNVMe8}`)
        console.log(`calcResultsPerDC() 92:  resultsPerDCArray[${actualChassisID}][dcItem=${dcItem}].numSSD4=${resultsPerDCArray[actualChassisID][dcItem].numSSD4} * chassisArrayLocal[actualChassisID].sizeSSD4=${chassisArrayLocal[actualChassisID].sizeSSD4}`)

        // The sums should be rounded up for displaying
        resultsPerDCArray[actualChassisID][dcItem].rawCapacityDataDevices = Math.ceil(resultsPerDCArray[actualChassisID][dcItem].rawCapacityDataDevices)
        resultsPerDCArray[actualChassisID][dcItem].netCapacityDataDevices = Math.ceil(resultsPerDCArray[actualChassisID][dcItem].netCapacityDataDevices)
        resultsPerDCArray[actualChassisID][dcItem].rawCapacityAllDevices = Math.ceil(resultsPerDCArray[actualChassisID][dcItem].rawCapacityAllDevices)

        console.log(`calcResultsPerDC() 99: resultsPerDCArray[${actualChassisID}][dcItem=${dcItem}].rawCapacityDataDevices=${resultsPerDCArray[actualChassisID][dcItem].rawCapacityDataDevices}`)
        console.log(`calcResultsPerDC() 100: resultsPerDCArray[${actualChassisID}][dcItem=${dcItem}].netCapacityDataDevices=${resultsPerDCArray[actualChassisID][dcItem].netCapacityDataDevices}`)
        console.log(`calcResultsPerDC() 102: resultsPerDCArray[${actualChassisID}][dcItem=${dcItem}].rawCapacityAllDevices=${resultsPerDCArray[actualChassisID][dcItem].rawCapacityAllDevices}`)
      }
  }
  
}

export default calcResultsPerDC