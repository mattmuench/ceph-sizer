
/**
 * For the effective number of media of a given type based on the dependencies, the resulting number is now based of recalculation of the number with taking dependencies into account.
 * Note that SSD4 generally doesn't need additional resources since this is already accounted for with the resources for the HDD coreing it. Expecting no change for futher code changes.
 */

const dcConfigFinalSSDPerServer   = function (dcConfigArrayLocal, actualChassisID, dcItem) {
console.log(`dcConfigFinalSSDPerServer() 4: dcConfigArrayLocal[dcItem=${dcItem}].resultingNumberOfServersAsPerChassis=${dcConfigArrayLocal[dcItem].resultingNumberOfServersAsPerChassis} > 0 ?`)
// RGW caching uses NVMe2 now

  if (dcConfigArrayLocal[dcItem].resultingNumberOfServersAsPerChassis > 0) {
    dcConfigArrayLocal[dcItem].resultingNumberOfSSD = dcConfigArrayLocal[dcItem].prelimPerServerNumberOfSSDWithoutDedicatedNVMeNeeded
                                                    + dcConfigArrayLocal[dcItem].prelimPerServerNumberOfSSDWithDedicatedNVMeNeeded
  }
  else {
    console.log(`dcConfigFinalSSDPerServer() 9: dcConfigArrayLocal[dcItem=${dcItem}].resultingNumberOfServersAsPerChassis=${dcConfigArrayLocal[dcItem].resultingNumberOfServersAsPerChassis}`)
    dcConfigArrayLocal[dcItem].resultingNumberOfSSD = 0
  }
  console.log(`dcConfigFinalSSDPerServer() 12: [chassisID=${actualChassisID},DC=${dcItem}] dcConfigArrayLocal[dcItem=${dcItem}].resultingNumberOfSSD=${dcConfigArrayLocal[dcItem].resultingNumberOfSSD}`)
}

export default dcConfigFinalSSDPerServer