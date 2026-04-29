import displayMsg from "../common/displayMsg.js"
import {debugMsg} from "../common/debug.js";

const dcConfigCorrectNumberOfServersForMONs = function (generalValues, sizingConstraints, dcConfigArrayLocal, dcItem) {
  let localDebugOn = false

  // Determine the number of MONs that must be deployed in this actual DC.
  debugMsg(generalValues, localDebugOn, 5, "dcConfigCorrectNumberOfServersForMONs", 354, `[DC=${dcItem}] starting #MONs is ${dcConfigArrayLocal[dcItem].numberOfNeededMonInstances}`,0,0,0)
  /// First, determine the number of DCs used for all workloads.
  //// Probably this is not needed since calcDCconfig() is calling dcConfigDetermineNumberOfDCsInUse() before this function which provides GeneralValues.numberOfDCsInUse
  let localNumberOfDCsInUse = 0
  for (let dcCheck = 0; dcCheck < generalValues.numberOfDCsPossible; dcCheck++) {
    if (dcConfigArrayLocal[dcCheck].numberOfWorkloadsInDC > 0) {
      localNumberOfDCsInUse++
      debugMsg(generalValues, localDebugOn, 5, "dcConfigCorrectNumberOfServersForMONs", 15, `found workload in dc=${dcCheck} and added it`,0,0,0)
    }
  }
  debugMsg(generalValues, localDebugOn, 5, "dcConfigCorrectNumberOfServersForMONs", 18, `[DC=${dcItem}] localNumberOfDCsInUse=${localNumberOfDCsInUse}`,0,0,0)
  // If the number of DCs in use is exactly 1 then check for this actual DC to be the one: if yes, the number of MONs should be set for this actual one accordingly
  /// If workload is relevant, and runs in actual DC,
  if (dcConfigArrayLocal[dcItem].numberOfWorkloadsInDC > 0) {
    debugMsg(generalValues, localDebugOn, 5, "dcConfigCorrectNumberOfServersForMONs", 22, `[DC=${dcItem}] DC is in use`,0,0,0)
    /// .... then, If workload is relevant, runs in actual DC, and there is only a single DC (this) in use
    if (localNumberOfDCsInUse === 1) {
      /// .... then set the number of MON roles to correct with to SizingConstraints.minNumberOfServersForMONRole
      dcConfigArrayLocal[dcItem].numberOfNeededMonInstances = sizingConstraints.minNumberOfServersForMONRole
      debugMsg(generalValues, localDebugOn, 5, "dcConfigCorrectNumberOfServersForMONs", 27, `[DC=${dcItem}] only THIS DC is in use`,0,0,0)
    }
    else {
      /// else, If the number of DCs used for the other workloads > (SizingConstraints.minNumberOfServersForMONRole - 2)
      if ((localNumberOfDCsInUse - 1) >  (sizingConstraints.minNumberOfServersForMONRole - 2)) {
        /// .... then set the number of MON roles to correct with to 1
        dcConfigArrayLocal[dcItem].numberOfNeededMonInstances = 1
        debugMsg(generalValues, localDebugOn, 5, "dcConfigCorrectNumberOfServersForMONs", 34, `[DC=${dcItem}] need only one MON because of number of DCs used`,0,0,0)
      }
      else {
        ///  If the number of DCs used for the other workloads == 1,
        if ((localNumberOfDCsInUse - 1) == 1) {
          ///  .... then, If SizingConstraints.minNumberOfServersForMONRole < 5,
          if (sizingConstraints.minNumberOfServersForMONRole < 5) {
            /// .... then set the number of MON roles to correct with to 2
            dcConfigArrayLocal[dcItem].numberOfNeededMonInstances = 2
            debugMsg(generalValues, localDebugOn, 5, "dcConfigCorrectNumberOfServersForMONs", 43, `[DC=${dcItem}] 2 DCs in use and 3 MONs min needed`,0,0,0)
          }
          else {
            /// else, If SizingConstraints.minNumberOfServersForMONRole/2 > Trunc(SizingConstraints.minNumberOfServersForMONRole / 2),
            debugMsg(generalValues, localDebugOn, 5, "dcConfigCorrectNumberOfServersForMONs", 47, `[DC=${dcItem}] 2 DCs in use and 5 MONs+ needed`,0,0,0)
            if ((sizingConstraints.minNumberOfServersForMONRole / 2) > Math.floor(sizingConstraints.minNumberOfServersForMONRole / 2)) {
              /// ..... then set the number of MON roles to correct with to round((SizingConstraints.minNumberOfServersForMONRole-1)/2)
              dcConfigArrayLocal[dcItem].numberOfNeededMonInstances = Math.ceil((sizingConstraints.minNumberOfServersForMONRole-1)/2)
            }
            else {
              /// else, throw an  error message "Error:required number of MONs must be an odd number"
              displayMsg(document, "dcConfigCorrectNumberOfServersForMONs", 54, "error", `[DC=${dcItem}] Error - required number of MONs must be an odd number`,0,0,0)
            }
          }
        }
        else {
          /// else, set the number of MON roles to correct with to round(SizingConstraints.minNumberOfServersForMONRole /  (number of additional DCs used + 1 ))
          dcConfigArrayLocal[dcItem].numberOfNeededMonInstances = Math.ceil(sizingConstraints.minNumberOfServersForMONRole /  ((localNumberOfDCsInUse - 1) + 1 ))
          debugMsg(generalValues, localDebugOn, 5, "dcConfigCorrectNumberOfServersForMONs", 61, `[DC=${dcItem}] > DCs in use`,0,0,0)
        }
      }
    }
  }
  else {
    // ignore
  }
  debugMsg(generalValues, localDebugOn, 5, "dcConfigCorrectNumberOfServersForMONs", 69, `[DC=${dcItem}] corrected to #MONs to ${dcConfigArrayLocal[dcItem].numberOfNeededMonInstances}`,0,0,0)
}

export default dcConfigCorrectNumberOfServersForMONs