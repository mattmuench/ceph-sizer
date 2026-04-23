import dcConfigDetermineCapacityRaw from "./dccalc/dcConfigDetermineCapacityRaw.js"
import dcConfigDetermineNumberOfRoleInstances from "./dccalc/dcConfigDetermineNumberOfRoleInstances.js"
import dcConfigDetermineNumberOfMediaRequired from "./dccalc/dcConfigDetermineNumberOfMediaRequired.js";
import dcConfigDetermineNumberOfServersInitially from "./dccalc/dcConfigDetermineNumberOfServersInitially.js"
import dcConfigCorrectNumberOfServersForMONs from "./dccalc/dcConfigCorrectNumberOfServersForMONs.js"
import dcConfigNumberOfCoresNeededInitial from "./dccalc/dcConfigNumberOfCoresNeededInitial.js"
import dcConfigMemNeededInitial from "./dccalc/dcConfigMemNeededInitial.js"
import dcConfigCheckResourceConstraints from "./dccalc/dcConfigCheckResourceConstraints.js"
import dcConfigMinNumberOfServersNeededWithReducedNumberOfRolesPerServer from "./dccalc/dcConfigMinNumberOfServersNeededWithReducedNumberOfRolesPerServer.js"
import dcConfigAdjustNumberOfServers from "./dccalc/dcConfigAdjustNumberOfServers.js"
import dcConfigFinalNumberOfCoresPerServer from "./dccalc/dcConfigFinalNumberOfCoresPerServer.js"
import dcConfigFinalMemoryPerServer from "./dccalc/dcConfigFinalMemoryPerServer.js"
import dcConfigFinalSSDPerServer from "./dccalc/dcConfigFinalSSDPerServer.js"
import dcConfigFinalHDDPerServer from "./dccalc/dcConfigFinalHDDPerServer.js"
import dcConfigFinalNVMePerServer from "./dccalc/dcConfigFinalNVMePerServer.js"
import dcConfigFinalPublicNetwork from "./dccalc/dcConfigFinalPublicNetwork.js"
import dcConfigFinalClusterNetwork from "./dccalc/dcConfigFinalClusterNetwork.js"
import dcConfigCorrectNumberOfServersForiSCSI from "./dccalc/dcConfigCorrectNumberOfServersForiSCSI.js"
import dcConfigCalcPreliminaryMediaPerServer from "./dccalc/dcConfigCalcPreliminaryMediaPerServer.js"
import {workloadsDetermineRocksDBSpace, dcConfigDetermineNumberOfDCsInUse, dcConfigDetermineNumberOfDCsForWorkload, workloadDetermineCapacityRaw} from "./evalWorkloadsSettings.js"
import dcConfigCleanPreviousResults from "./dccalc/dcConfigCleanPreviousResults.js"

/** This function effectively combines all the (re-)calculation for the configuration influences and constraints for the individual DCs.
 *  It's called every time and update is done (update * button pressed by the user).
 *  It's the base of the results display.
 */
const calcDCConfig = function (generalValuesLocal, workloadsArrayLocal, sizingConstraints, configsArrayLocal, chassisArrayLocal) {

  workloadsDetermineRocksDBSpace(generalValuesLocal, workloadsArrayLocal, sizingConstraints)
  dcConfigDetermineNumberOfDCsInUse(generalValuesLocal, workloadsArrayLocal)
  dcConfigDetermineNumberOfDCsForWorkload(generalValuesLocal, workloadsArrayLocal)
  workloadDetermineCapacityRaw(generalValuesLocal, workloadsArrayLocal, sizingConstraints)

  dcConfigCleanPreviousResults(generalValuesLocal, configsArrayLocal, chassisArrayLocal)

  for (let actualChassisID = 0; actualChassisID < generalValuesLocal.numberOfConfigsPossible; actualChassisID++) {
      if(chassisArrayLocal[actualChassisID].maxAllMediaSum > 0) {
        console.log(`calcDCConfig() 37: working on config ${actualChassisID},chassisArrayLocal[actualChassisID].maxAllMediaSum=${chassisArrayLocal[actualChassisID].maxAllMediaSum} `)
        console.log(`calcDCConfig() 38: the array is ${configsArrayLocal}`)
        console.log(`calcDCConfig() 39: ... and the actual sub-array is the array ${configsArrayLocal[actualChassisID]}`)
        const dcConfigArrayLocal = configsArrayLocal[actualChassisID]
        dcConfigDetermineCapacityRaw(generalValuesLocal, workloadsArrayLocal, dcConfigArrayLocal)
        console.log(`calcDCConfig() 42: checking content of DC0 for capacityNeededForSSD=${dcConfigArrayLocal[0].capacityNeededForSSD}`)
        dcConfigDetermineNumberOfRoleInstances(generalValuesLocal, workloadsArrayLocal, sizingConstraints, dcConfigArrayLocal)
        dcConfigDetermineNumberOfMediaRequired(generalValuesLocal, workloadsArrayLocal, sizingConstraints, dcConfigArrayLocal, chassisArrayLocal, actualChassisID)


        for (let dcItem = 0; dcItem < generalValuesLocal.numberOfDCsPossible; dcItem++) {
          if (dcConfigArrayLocal[dcItem].numberOfWorkloadsInDC > 0) {
            dcConfigCorrectNumberOfServersForMONs(generalValuesLocal, sizingConstraints, dcConfigArrayLocal,dcItem)
            dcConfigDetermineNumberOfServersInitially(generalValuesLocal, dcConfigArrayLocal, chassisArrayLocal, actualChassisID, dcItem)
            //checkForMisconfigReplicaInDC(generalValuesLocal, workloadsArrayLocal, sizingConstraints, dcConfigArrayLocal, dcItem)
            dcConfigCorrectNumberOfServersForiSCSI(generalValuesLocal, workloadsArrayLocal, sizingConstraints, dcConfigArrayLocal, dcItem)
            // calculate the depending number of media as per preliminary number of servers
            dcConfigCalcPreliminaryMediaPerServer(generalValuesLocal, dcConfigArrayLocal, dcItem, chassisArrayLocal, actualChassisID, dcConfigArrayLocal[dcItem].numberOfServersNeededAllInstances)
            dcConfigNumberOfCoresNeededInitial(generalValuesLocal, sizingConstraints, dcConfigArrayLocal, chassisArrayLocal, actualChassisID, dcItem)
            dcConfigMemNeededInitial(generalValuesLocal, sizingConstraints, dcConfigArrayLocal, dcItem)
            dcConfigCheckResourceConstraints(generalValuesLocal, dcConfigArrayLocal, chassisArrayLocal, actualChassisID, dcItem)
            dcConfigMinNumberOfServersNeededWithReducedNumberOfRolesPerServer(generalValuesLocal, workloadsArrayLocal, sizingConstraints, dcConfigArrayLocal, dcItem)
            dcConfigAdjustNumberOfServers(generalValuesLocal, sizingConstraints, dcConfigArrayLocal, chassisArrayLocal, actualChassisID, dcItem)
            // recalculate the depending number of media as per corrected number of servers
            dcConfigCalcPreliminaryMediaPerServer(generalValuesLocal, dcConfigArrayLocal, dcItem, chassisArrayLocal, actualChassisID, dcConfigArrayLocal[dcItem].resultingNumberOfServersAsPerChassis)
            dcConfigFinalNumberOfCoresPerServer(generalValuesLocal, sizingConstraints, dcConfigArrayLocal, actualChassisID,dcItem)
            dcConfigFinalMemoryPerServer(generalValuesLocal, sizingConstraints, dcConfigArrayLocal, actualChassisID, dcItem)
            dcConfigFinalSSDPerServer(generalValuesLocal, dcConfigArrayLocal, actualChassisID, dcItem)
            dcConfigFinalHDDPerServer(generalValuesLocal, dcConfigArrayLocal, actualChassisID, dcItem)
            dcConfigFinalNVMePerServer(generalValuesLocal, dcConfigArrayLocal,actualChassisID, dcItem, chassisArrayLocal)
            dcConfigFinalPublicNetwork(generalValuesLocal, sizingConstraints, dcConfigArrayLocal, chassisArrayLocal, actualChassisID, dcItem)
            dcConfigFinalClusterNetwork(generalValuesLocal, sizingConstraints, dcConfigArrayLocal, chassisArrayLocal, actualChassisID, dcItem)
          }
        }
      }
    
      console.log(`calcDCConfig() 70: actual value for chassis=0 for DC0 numServers=${configsArrayLocal[0][0].numServers}`)
    }
}

export default calcDCConfig