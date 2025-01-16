// trying to implement AD41
const dcConfigFinalHDDPerServer   = function (dcConfigArrayLocal, actualChassisID, dcItem) {
  if (dcConfigArrayLocal[dcItem].resultingNumberOfServersAsPerChassis > 0) {
    dcConfigArrayLocal[dcItem].resultingNumberOfHDD = Math.ceil(dcConfigArrayLocal[dcItem].numberOfHDDNeeded / dcConfigArrayLocal[dcItem].resultingNumberOfServersAsPerChassis)
  }
  else {
    dcConfigArrayLocal[dcItem].resultingNumberOfHDD = 0
  }
  console.log(`dcConfigFinalHDDPerServer() 9: [chassisID=${actualChassisID}] dcConfigArrayLocal[dcItem=${dcItem}].resultingNumberOfHDD=${dcConfigArrayLocal[dcItem].resultingNumberOfHDD}`)
}  

export default dcConfigFinalHDDPerServer