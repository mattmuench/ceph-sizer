/// Trying to implement S41
const dcConfigCorrectNumberOfServersForMONs = function (generalValuesLocal, sizingConstraints, dcConfigArrayLocal, dcItem) {
  // Determine the number of MONs that must be deployed in this actual DC.
  console.log(`dcConfigCorrectNumberOfServersForMONs() 4: [DC=${dcItem}] starting #MONs is ${dcConfigArrayLocal[dcItem].numberOfNeededMonInstances}`)
  /// First, determine the number of DCs used for all workloads.
  //// Probably this is not needed since calcDCconfig() is calling dcConfigDetermineNumberOfDCsInUse() before this function which provides GeneralValues.numberOfDCsInUse
  let localNumberOfDCsInUse = 0
  for (let dcCheck = 0; dcCheck < generalValuesLocal.numberOfDCsPossible; dcCheck++) {
    if (dcConfigArrayLocal[dcCheck].numberOfWorkloadsInDC > 0) {
      localNumberOfDCsInUse++
    }
  }
  console.log(`dcConfigCorrectNumberOfServersForMONs() 12: [DC=${dcItem}] localNumberOfDCsInUse=${localNumberOfDCsInUse}`)
  // If the number of DCs in use is exactly 1 then check for this actual DC to be the one: if yes, the number of MONs should be set for this actual one accordingly
  /// If workload is relevant, and runs in actual DC,
  if (dcConfigArrayLocal[dcItem].numberOfWorkloadsInDC > 0) {
    console.log(`dcConfigCorrectNumberOfServersForMONs() 16: [DC=${dcItem}] DC is in use`)
    /// .... then, If workload is relevant, runs in actual DC, and there is only a single DC (this) in use
    if (localNumberOfDCsInUse === 1) {
      /// .... then set the number of MON roles to correct with to SizingConstraints.minNumberOfServersForMONRole
      dcConfigArrayLocal[dcItem].numberOfNeededMonInstances = sizingConstraints.minNumberOfServersForMONRole
      console.log(`dcConfigCorrectNumberOfServersForMONs() 21: [DC=${dcItem}] only THIS DC is in use`)
    }
    else {
      /// else, If the number of DCs used for the other workloads > (SizingConstraints.minNumberOfServersForMONRole - 2)
      if ((localNumberOfDCsInUse - 1) >  (sizingConstraints.minNumberOfServersForMONRole - 2)) {
        /// .... then set the number of MON roles to correct with to 1
        dcConfigArrayLocal[dcItem].numberOfNeededMonInstances = 1
        console.log(`dcConfigCorrectNumberOfServersForMONs() 28: [DC=${dcItem}] need only one MON because of number of DCs used`)
      }
      else {
        ///  If the number of DCs used for the other workloads == 1,
        if ((localNumberOfDCsInUse - 1) == 1) {
          ///  .... then, If SizingConstraints.minNumberOfServersForMONRole < 5,
          if (sizingConstraints.minNumberOfServersForMONRole < 5) {
            /// .... then set the number of MON roles to correct with to 2
            dcConfigArrayLocal[dcItem].numberOfNeededMonInstances = 2
            console.log(`dcConfigCorrectNumberOfServersForMONs() 37: [DC=${dcItem}] 2 DCs in use and 3 MONs min needed`)
          }
          else {
            /// else, If SizingConstraints.minNumberOfServersForMONRole/2 > Trunc(SizingConstraints.minNumberOfServersForMONRole / 2),
            console.log(`dcConfigCorrectNumberOfServersForMONs() 41: [DC=${dcItem}] 2 DCs in use and 5 MONs+ needed`)
            if ((sizingConstraints.minNumberOfServersForMONRole / 2) > Math.floor(sizingConstraints.minNumberOfServersForMONRole / 2)) {
              /// ..... then set the number of MON roles to correct with to round((SizingConstraints.minNumberOfServersForMONRole-1)/2)
              dcConfigArrayLocal[dcItem].numberOfNeededMonInstances = Math.ceil((sizingConstraints.minNumberOfServersForMONRole-1)/2)
            }
            else {
              /// else, throw an  error message "Error:required number of MONs must be an odd number"
              console.log(`dcConfigCorrectNumberOfServersForMONs() 48: [DC=${dcItem}] Error - required number of MONs must be an odd number`)
            }
          }
        }
        else {
          /// else, set the number of MON roles to correct with to round(SizingConstraints.minNumberOfServersForMONRole /  (number of additional DCs used + 1 ))
          dcConfigArrayLocal[dcItem].numberOfNeededMonInstances = Math.ceil(sizingConstraints.minNumberOfServersForMONRole /  ((localNumberOfDCsInUse - 1) + 1 ))
          console.log(`dcConfigCorrectNumberOfServersForMONs() 55: [DC=${dcItem}] > DCs in use`)
        }
      }
    }
  }
  else {
    // ignore
  }
  console.log(`dcConfigCorrectNumberOfServersForMONs() 63: [DC=${dcItem}] corrected to #MONs to ${dcConfigArrayLocal[dcItem].numberOfNeededMonInstances}`)
}

export default dcConfigCorrectNumberOfServersForMONs