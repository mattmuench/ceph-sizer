import displayMsg from "../common/displayMsg.js"
import {debugMsg} from "../common/debug.js";

const calcResultsOverview = function (generalValues, configsArrayLocal, chassisArrayLocal, resultsOverviewArrayLocal) {
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
            debugMsg(generalValues, localDebugOn, 5, "calcResultsOverview", 18, `resultsOverviewArrayLocal[chassisID=${actualChassisID}].rawCapacityDataDevices=${resultsOverviewArrayLocal[actualChassisID].rawCapacityDataDevices}`,0,0,0)
        
        for (let dcItem = 0; dcItem < generalValues.numberOfDCsPossible; dcItem++) {
            // check if workloads running in this DC
            debugMsg(generalValues, localDebugOn, 5, "calcResultsOverview", 22, `dcItem=${dcItem}, actualChassisID=${actualChassisID},configsArrayLocal[actualChassisID][dcItem].numberOfWorkloadsInDC=${configsArrayLocal[actualChassisID][dcItem].numberOfWorkloadsInDC}`,0,0,0)
            if (configsArrayLocal[actualChassisID][dcItem].numberOfWorkloadsInDC > 0){
                // do the calculation for the overview
                debugMsg(generalValues, localDebugOn, 5, "calcResultsOverview", 25, `dcItem=${dcItem}, actualChassisID=${actualChassisID}, value from configs for resultingNumberOfServersAsPerChassis=${configsArrayLocal[actualChassisID][dcItem].resultingNumberOfServersAsPerChassis}`,0,0,0)
                resultsOverviewArrayLocal[actualChassisID].numServers += configsArrayLocal[actualChassisID][dcItem].resultingNumberOfServersAsPerChassis

                /// As a BOM, one would like to see how many of each needs to be provided/purchased => this gives later an estimation for the costs
                localNICPublicHighestNum += configsArrayLocal[actualChassisID][dcItem].resultingNumberOfPublicNetNICs * configsArrayLocal[actualChassisID][dcItem].resultingNumberOfServersAsPerChassis
                localNICClusterHighestNum += configsArrayLocal[actualChassisID][dcItem].resultingNumberOfClusterNetNICs * configsArrayLocal[actualChassisID][dcItem].resultingNumberOfServersAsPerChassis
                localCoresHighestNum += configsArrayLocal[actualChassisID][dcItem].resultingNumberOfCores * configsArrayLocal[actualChassisID][dcItem].resultingNumberOfServersAsPerChassis
                localMemHighest += configsArrayLocal[actualChassisID][dcItem].resultingMem * configsArrayLocal[actualChassisID][dcItem].resultingNumberOfServersAsPerChassis


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
                resultsOverviewArrayLocal[actualChassisID].numNVMe8 += configsArrayLocal[actualChassisID][dcItem].resultingNumberOfNVMe8 * configsArrayLocal[actualChassisID][dcItem].resultingNumberOfServersAsPerChassis
                debugMsg(generalValues, localDebugOn, 5, "calcResultsOverview", 48, `configsArrayLocal[actualChassisID][dcItem].resultingNumberOfNVMe1=${configsArrayLocal[actualChassisID][dcItem].resultingNumberOfNVMe1}`,0,0,0)
                debugMsg(generalValues, localDebugOn, 5, "calcResultsOverview", 49, `configsArrayLocal[actualChassisID][dcItem].resultingNumberOfNVMe2=${configsArrayLocal[actualChassisID][dcItem].resultingNumberOfNVMe2}`,0,0,0)
                debugMsg(generalValues, localDebugOn, 5, "calcResultsOverview", 50, `configsArrayLocal[actualChassisID][dcItem].resultingNumberOfNVMe3=${configsArrayLocal[actualChassisID][dcItem].resultingNumberOfNVMe3}`,0,0,0)
                debugMsg(generalValues, localDebugOn, 5, "calcResultsOverview", 51, `configsArrayLocal[actualChassisID][dcItem].resultingNumberOfNVMe4=${configsArrayLocal[actualChassisID][dcItem].resultingNumberOfNVMe4}`,0,0,0)
                debugMsg(generalValues, localDebugOn, 5, "calcResultsOverview", 52, `configsArrayLocal[actualChassisID][dcItem].resultingNumberOfNVMe5=${configsArrayLocal[actualChassisID][dcItem].resultingNumberOfNVMe5}`,0,0,0)
                debugMsg(generalValues, localDebugOn, 5, "calcResultsOverview", 53, `configsArrayLocal[actualChassisID][dcItem].resultingNumberOfNVMe6=${configsArrayLocal[actualChassisID][dcItem].resultingNumberOfNVMe6}`,0,0,0)
                debugMsg(generalValues, localDebugOn, 5, "calcResultsOverview", 54, `configsArrayLocal[actualChassisID][dcItem].resultingNumberOfNVMe7=${configsArrayLocal[actualChassisID][dcItem].resultingNumberOfNVMe7}`,0,0,0)
                debugMsg(generalValues, localDebugOn, 5, "calcResultsOverview", 55, `configsArrayLocal[actualChassisID][dcItem].resultingNumberOfNVMe8=${configsArrayLocal[actualChassisID][dcItem].resultingNumberOfNVMe8}`,0,0,0)
                debugMsg(generalValues, localDebugOn, 5, "calcResultsOverview", 56, `resultsOverviewArrayLocal[actualChassisID].numNVMe8=${resultsOverviewArrayLocal[actualChassisID].numNVMe8}`,0,0,0)

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
            } else {
                // ignore, no workload is using this DC
                debugMsg(generalValues, localDebugOn, 5, "calcResultsOverview", 71, `dcItem=${dcItem}, actualChassisID=${actualChassisID}, => no workloads in DC = ignoring DC`,0,0,0)
            }
        }
        debugMsg(generalValues, localDebugOn, 5, "calcResultsOverview", 74, `resultsOverviewArrayLocal[chassisID=${actualChassisID}].numServers=${resultsOverviewArrayLocal[actualChassisID].numServers}`,0,0,0)
        resultsOverviewArrayLocal[actualChassisID].publicNICs  = localNICPublicHighestNum
        resultsOverviewArrayLocal[actualChassisID].clusterNICs = localNICClusterHighestNum
        resultsOverviewArrayLocal[actualChassisID].cpuCores = localCoresHighestNum
        resultsOverviewArrayLocal[actualChassisID].memMin = localMemHighest
        resultsOverviewArrayLocal[actualChassisID].sizeHDD1 = chassisArrayLocal[actualChassisID].sizeHDD1
        resultsOverviewArrayLocal[actualChassisID].sizeSSD1 = chassisArrayLocal[actualChassisID].sizeSSD1
        resultsOverviewArrayLocal[actualChassisID].sizeNVMe1 = chassisArrayLocal[actualChassisID].sizeNVMe1
        
        debugMsg(generalValues, localDebugOn, 5, "calcResultsOverview", 83, `chassisArrayLocal[chassisID=${actualChassisID}].sizeHDD1=${chassisArrayLocal[actualChassisID].sizeHDD1}`,0,0,0)
        debugMsg(generalValues, localDebugOn, 5, "calcResultsOverview", 84, `chassisArrayLocal[chassisID=${actualChassisID}].sizeSSD1=${chassisArrayLocal[actualChassisID].sizeSSD1}`,0,0,0)
        debugMsg(generalValues, localDebugOn, 5, "calcResultsOverview", 85, `chassisArrayLocal[chassisID=${actualChassisID}].sizeNVMe1=${chassisArrayLocal[actualChassisID].sizeNVMe1}`,0,0,0)

        
        resultsOverviewArrayLocal[actualChassisID].rawCapacityDataDevices += resultsOverviewArrayLocal[actualChassisID].numHDD1 * resultsOverviewArrayLocal[actualChassisID].sizeHDD1
                                                                            + resultsOverviewArrayLocal[actualChassisID].numSSD1 * resultsOverviewArrayLocal[actualChassisID].sizeSSD1
                                                                            + resultsOverviewArrayLocal[actualChassisID].numNVMe1 * resultsOverviewArrayLocal[actualChassisID].sizeNVMe1
        resultsOverviewArrayLocal[actualChassisID].netCapacityDataDevices = 0
        debugMsg(generalValues, localDebugOn, 5, "calcResultsOverview", 92, `resultsOverviewArrayLocal[chassisID=${actualChassisID}].rawCapacityDataDevices=${resultsOverviewArrayLocal[actualChassisID].rawCapacityDataDevices}`,0,0,0)
        
        debugMsg(generalValues, localDebugOn, 5, "calcResultsOverview", 94, `resultsOverviewArrayLocal[chassisID=${actualChassisID}].rawCapacityDataDevices=${resultsOverviewArrayLocal[actualChassisID].rawCapacityDataDevices}`,0,0,0)
        debugMsg(generalValues, localDebugOn, 5, "calcResultsOverview", 95, `resultsOverviewArrayLocal[chassisID=${actualChassisID}].numNVMe1=${resultsOverviewArrayLocal[actualChassisID].numNVMe1}; sizeNVMe1=${chassisArrayLocal[actualChassisID].sizeNVMe1}`,0,0,0)
        debugMsg(generalValues, localDebugOn, 5, "calcResultsOverview", 96, `resultsOverviewArrayLocal[chassisID=${actualChassisID}].numNVMe2=${resultsOverviewArrayLocal[actualChassisID].numNVMe2}; sizeNVMe2=${chassisArrayLocal[actualChassisID].sizeNVMe2}`,0,0,0)
        debugMsg(generalValues, localDebugOn, 5, "calcResultsOverview", 97, `resultsOverviewArrayLocal[chassisID=${actualChassisID}].numNVMe3=${resultsOverviewArrayLocal[actualChassisID].numNVMe3}; sizeNVMe3=${chassisArrayLocal[actualChassisID].sizeOptane1}`,0,0,0)
        debugMsg(generalValues, localDebugOn, 5, "calcResultsOverview", 98, `resultsOverviewArrayLocal[chassisID=${actualChassisID}].numNVMe4=${resultsOverviewArrayLocal[actualChassisID].numNVMe4}; sizeNVMe4=${chassisArrayLocal[actualChassisID].sizeNVMe4}`,0,0,0)
        debugMsg(generalValues, localDebugOn, 5, "calcResultsOverview", 99, `resultsOverviewArrayLocal[chassisID=${actualChassisID}].numNVMe5=${resultsOverviewArrayLocal[actualChassisID].numNVMe5}; sizeNVMe5=${chassisArrayLocal[actualChassisID].sizeNVMe5}`,0,0,0)
        debugMsg(generalValues, localDebugOn, 5, "calcResultsOverview", 100, `resultsOverviewArrayLocal[chassisID=${actualChassisID}].numNVMe6=${resultsOverviewArrayLocal[actualChassisID].numNVMe6}; sizeNVMe6=${chassisArrayLocal[actualChassisID].sizeNVMe6}`,0,0,0)
        debugMsg(generalValues, localDebugOn, 5, "calcResultsOverview", 101, `resultsOverviewArrayLocal[chassisID=${actualChassisID}].numNVMe7=${resultsOverviewArrayLocal[actualChassisID].numNVMe7}; sizeNVMe7=${chassisArrayLocal[actualChassisID].sizeNVMe7}`,0,0,0)
        debugMsg(generalValues, localDebugOn, 5, "calcResultsOverview", 102, `resultsOverviewArrayLocal[chassisID=${actualChassisID}].numNVMe8=${resultsOverviewArrayLocal[actualChassisID].numNVMe8}; sizeNVMe8=${chassisArrayLocal[actualChassisID].sizeNVMe8}`,0,0,0)
        debugMsg(generalValues, localDebugOn, 5, "calcResultsOverview", 103, `resultsOverviewArrayLocal[chassisID=${actualChassisID}].numSSD4=${resultsOverviewArrayLocal[actualChassisID].numSSD4}`,0,0,0)
        resultsOverviewArrayLocal[actualChassisID].rawCapacityAllDevices += resultsOverviewArrayLocal[actualChassisID].rawCapacityDataDevices
                                                                           + resultsOverviewArrayLocal[actualChassisID].numNVMe1 * chassisArrayLocal[actualChassisID].sizeNVMe1
                                                                           + resultsOverviewArrayLocal[actualChassisID].numNVMe2 * chassisArrayLocal[actualChassisID].sizeNVMe2
                                                                           + resultsOverviewArrayLocal[actualChassisID].numNVMe3 * chassisArrayLocal[actualChassisID].sizeOptane1
                                                                           + resultsOverviewArrayLocal[actualChassisID].numNVMe4 * chassisArrayLocal[actualChassisID].sizeNVMe4
                                                                           + resultsOverviewArrayLocal[actualChassisID].numNVMe5 * chassisArrayLocal[actualChassisID].sizeNVMe5
                                                                           + resultsOverviewArrayLocal[actualChassisID].numNVMe6 * chassisArrayLocal[actualChassisID].sizeNVMe6
                                                                           + resultsOverviewArrayLocal[actualChassisID].numNVMe7 * chassisArrayLocal[actualChassisID].sizeNVMe7
                                                                           + resultsOverviewArrayLocal[actualChassisID].numNVMe8 * chassisArrayLocal[actualChassisID].sizeNVMe8
                                                                           + resultsOverviewArrayLocal[actualChassisID].numSSD4 * chassisArrayLocal[actualChassisID].sizeSSD4

       // The sums should be rounded up for displaying
       resultsOverviewArrayLocal[actualChassisID].rawCapacityDataDevices = Math.ceil(resultsOverviewArrayLocal[actualChassisID].rawCapacityDataDevices)
       resultsOverviewArrayLocal[actualChassisID].netCapacityDataDevices = Math.ceil(resultsOverviewArrayLocal[actualChassisID].netCapacityDataDevices)
       resultsOverviewArrayLocal[actualChassisID].rawCapacityAllDevices = Math.ceil(resultsOverviewArrayLocal[actualChassisID].rawCapacityAllDevices)
       debugMsg(generalValues, localDebugOn, 5, "calcResultsOverview", 119, `resultsOverviewArrayLocal[chassisID=${actualChassisID}].rawCapacityDataDevices=${resultsOverviewArrayLocal[actualChassisID].rawCapacityDataDevices}`,0,0,0)
       debugMsg(generalValues, localDebugOn, 5, "calcResultsOverview", 120, `resultsOverviewArrayLocal[chassisID=${actualChassisID}].netCapacityDataDevices=${resultsOverviewArrayLocal[actualChassisID].netCapacityDataDevices}`,0,0,0)
       debugMsg(generalValues, localDebugOn, 5, "calcResultsOverview", 121, `resultsOverviewArrayLocal[chassisID=${actualChassisID}].rawCapacityAllDevices=${resultsOverviewArrayLocal[actualChassisID].rawCapacityAllDevices}`,0,0,0)
    }
    
}

export default calcResultsOverview