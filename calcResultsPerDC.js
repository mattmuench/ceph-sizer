import displayMsg from "../common/displayMsg.js"
import {debugMsg} from "../common/debug.js";

const calcResultsPerDC = function (generalValues, configsArrayLocal, chassisArrayLocal, resultsPerDCArray) {
  let localDebugOn = false

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
        // check if workload is running in this DC 
        debugMsg(generalValues, localDebugOn, 5, "calcResultsPerDC", 21, `dcItem=${dcItem}, actualChassisID=${actualChassisID},configsArrayLocal[actualChassisID][dcItem].numberOfWorkloadsInDC=${configsArrayLocal[actualChassisID][dcItem].numberOfWorkloadsInDC}`,0,0,0)
        if (configsArrayLocal[actualChassisID][dcItem].numberOfWorkloadsInDC > 0){
          // do the calculation for the overview
          debugMsg(generalValues, localDebugOn, 5, "calcResultsPerDC", 24, `dcItem=${dcItem}, actualChassisID=${actualChassisID}, value from configs=${configsArrayLocal[actualChassisID][dcItem].resultingNumberOfServersAsPerChassis}`,0,0,0)
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
          if (generalValues.globalDebug == true || localDebugOn == true) {
            debugMsg(generalValues, localDebugOn, 5, "calcResultsPerDC", 57, `configsArrayLocal[actualChassisID][dcItem].resultingNumberOfNVMe1=${configsArrayLocal[actualChassisID][dcItem].resultingNumberOfNVMe1}`,0,0,0)
            debugMsg(generalValues, localDebugOn, 5, "calcResultsPerDC", 58, `configsArrayLocal[actualChassisID][dcItem].resultingNumberOfNVMe2=${configsArrayLocal[actualChassisID][dcItem].resultingNumberOfNVMe2}`,0,0,0)
            debugMsg(generalValues, localDebugOn, 5, "calcResultsPerDC", 59, `configsArrayLocal[actualChassisID][dcItem].resultingNumberOfNVMe3=${configsArrayLocal[actualChassisID][dcItem].resultingNumberOfNVMe3}`,0,0,0)
            debugMsg(generalValues, localDebugOn, 5, "calcResultsPerDC", 60, `configsArrayLocal[actualChassisID][dcItem].resultingNumberOfNVMe4=${configsArrayLocal[actualChassisID][dcItem].resultingNumberOfNVMe4}`,0,0,0)
            debugMsg(generalValues, localDebugOn, 5, "calcResultsPerDC", 61, `configsArrayLocal[actualChassisID][dcItem].resultingNumberOfNVMe5=${configsArrayLocal[actualChassisID][dcItem].resultingNumberOfNVMe5}`,0,0,0)
            debugMsg(generalValues, localDebugOn, 5, "calcResultsPerDC", 62, `configsArrayLocal[actualChassisID][dcItem].resultingNumberOfNVMe6=${configsArrayLocal[actualChassisID][dcItem].resultingNumberOfNVMe6}`,0,0,0)
            debugMsg(generalValues, localDebugOn, 5, "calcResultsPerDC", 63, `configsArrayLocal[actualChassisID][dcItem].resultingNumberOfNVMe7=${configsArrayLocal[actualChassisID][dcItem].resultingNumberOfNVMe7}`,0,0,0)
            debugMsg(generalValues, localDebugOn, 5, "calcResultsPerDC", 64, `configsArrayLocal[actualChassisID][dcItem].resultingNumberOfNVMe8=${configsArrayLocal[actualChassisID][dcItem].resultingNumberOfNVMe8}`,0,0,0)
          }

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

        
          debugMsg(generalValues, localDebugOn, 5, "calcResultsPerDC", 80, `resultsPerDCArray[${actualChassisID}][dcItem=${dcItem}].numServers=${resultsPerDCArray[actualChassisID][dcItem].numServers}`,0,0,0)
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
                                                                             + resultsPerDCArray[actualChassisID][dcItem].numNVMe3 * chassisArrayLocal[actualChassisID].sizeNVMe3
                                                                             + resultsPerDCArray[actualChassisID][dcItem].numNVMe4 * chassisArrayLocal[actualChassisID].sizeNVMe4
                                                                             + resultsPerDCArray[actualChassisID][dcItem].numNVMe5 * chassisArrayLocal[actualChassisID].sizeNVMe5
                                                                             + resultsPerDCArray[actualChassisID][dcItem].numNVMe6 * chassisArrayLocal[actualChassisID].sizeNVMe6
                                                                             + resultsPerDCArray[actualChassisID][dcItem].numNVMe7 * chassisArrayLocal[actualChassisID].sizeNVMe7
                                                                             + resultsPerDCArray[actualChassisID][dcItem].numNVMe8 * chassisArrayLocal[actualChassisID].sizeNVMe8
                                                                             + resultsPerDCArray[actualChassisID][dcItem].numSSD4 * chassisArrayLocal[actualChassisID].sizeSSD4
          if (generalValues.globalDebug == true || localDebugOn == true) {
            debugMsg(generalValues, localDebugOn, 5, "calcResultsPerDC", 103, `resultsPerDCArray[${actualChassisID}][dcItem=${dcItem}].numNVMe2=${resultsPerDCArray[actualChassisID][dcItem].numNVMe2} * chassisArrayLocal[actualChassisID].sizeNVMe2=${chassisArrayLocal[actualChassisID].sizeNVMe2}`,0,0,0)
            debugMsg(generalValues, localDebugOn, 5, "calcResultsPerDC", 104, `resultsPerDCArray[${actualChassisID}][dcItem=${dcItem}].numNVMe3=${resultsPerDCArray[actualChassisID][dcItem].numNVMe3} * chassisArrayLocal[actualChassisID].sizeNVMe3=${chassisArrayLocal[actualChassisID].sizeNVMe3}`,0,0,0)
            debugMsg(generalValues, localDebugOn, 5, "calcResultsPerDC", 105, `resultsPerDCArray[${actualChassisID}][dcItem=${dcItem}].numNVMe4=${resultsPerDCArray[actualChassisID][dcItem].numNVMe4} * chassisArrayLocal[actualChassisID].sizeNVMe4=${chassisArrayLocal[actualChassisID].sizeNVMe4}`,0,0,0)
            debugMsg(generalValues, localDebugOn, 5, "calcResultsPerDC", 106, `resultsPerDCArray[${actualChassisID}][dcItem=${dcItem}].numNVMe5=${resultsPerDCArray[actualChassisID][dcItem].numNVMe5} * chassisArrayLocal[actualChassisID].sizeNVMe5=${chassisArrayLocal[actualChassisID].sizeNVMe5}`,0,0,0)
            debugMsg(generalValues, localDebugOn, 5, "calcResultsPerDC", 107, `resultsPerDCArray[${actualChassisID}][dcItem=${dcItem}].numNVMe6=${resultsPerDCArray[actualChassisID][dcItem].numNVMe6} * chassisArrayLocal[actualChassisID].sizeNVMe6=${chassisArrayLocal[actualChassisID].sizeNVMe6}`,0,0,0)
            debugMsg(generalValues, localDebugOn, 5, "calcResultsPerDC", 108, `resultsPerDCArray[${actualChassisID}][dcItem=${dcItem}].numNVMe7=${resultsPerDCArray[actualChassisID][dcItem].numNVMe7} * chassisArrayLocal[actualChassisID].sizeNVMe7=${chassisArrayLocal[actualChassisID].sizeNVMe7}`,0,0,0)
            debugMsg(generalValues, localDebugOn, 5, "calcResultsPerDC", 109, `resultsPerDCArray[${actualChassisID}][dcItem=${dcItem}].numNVMe8=${resultsPerDCArray[actualChassisID][dcItem].numNVMe8} * chassisArrayLocal[actualChassisID].sizeNVMe8=${chassisArrayLocal[actualChassisID].sizeNVMe8}`,0,0,0)
            debugMsg(generalValues, localDebugOn, 5, "calcResultsPerDC", 110, `resultsPerDCArray[${actualChassisID}][dcItem=${dcItem}].numSSD4=${resultsPerDCArray[actualChassisID][dcItem].numSSD4} * chassisArrayLocal[actualChassisID].sizeSSD4=${chassisArrayLocal[actualChassisID].sizeSSD4}`,0,0,0)
          }

          // The sums should be rounded up for displaying
          resultsPerDCArray[actualChassisID][dcItem].rawCapacityDataDevices = Math.ceil(resultsPerDCArray[actualChassisID][dcItem].rawCapacityDataDevices)
          resultsPerDCArray[actualChassisID][dcItem].netCapacityDataDevices = Math.ceil(resultsPerDCArray[actualChassisID][dcItem].netCapacityDataDevices)
          resultsPerDCArray[actualChassisID][dcItem].rawCapacityAllDevices = Math.ceil(resultsPerDCArray[actualChassisID][dcItem].rawCapacityAllDevices)

          if (generalValues.globalDebug == true || localDebugOn == true) {
            debugMsg(generalValues, localDebugOn, 5, "calcResultsPerDC", 119, `resultsPerDCArray[${actualChassisID}][dcItem=${dcItem}].rawCapacityDataDevices=${resultsPerDCArray[actualChassisID][dcItem].rawCapacityDataDevices}`,0,0,0)
            debugMsg(generalValues, localDebugOn, 5, "calcResultsPerDC", 120, `resultsPerDCArray[${actualChassisID}][dcItem=${dcItem}].netCapacityDataDevices=${resultsPerDCArray[actualChassisID][dcItem].netCapacityDataDevices}`,0,0,0)
            debugMsg(generalValues, localDebugOn, 5, "calcResultsPerDC", 121, `resultsPerDCArray[${actualChassisID}][dcItem=${dcItem}].rawCapacityAllDevices=${resultsPerDCArray[actualChassisID][dcItem].rawCapacityAllDevices}`,0,0,0)
          }
        }
        else {
          // ignore, no workload is using this DC
          debugMsg(generalValues, localDebugOn, 5, "calcResultsPerDC", 126, `dcItem=${dcItem}, actualChassisID=${actualChassisID}, => no workloads in DC = ignoring DC`,0,0,0)
          // .... but update the resultsPerDCArray for this config and resetting the number of servers in order to prevent displaying old (previous) values with more DCs involved than actually in use
          resultsPerDCArray[actualChassisID][dcItem].numServers = 0
        }
      }
  }
  
}

export default calcResultsPerDC