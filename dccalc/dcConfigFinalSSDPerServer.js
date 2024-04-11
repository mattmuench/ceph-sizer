// trying to implement AC41
const dcConfigFinalSSDPerServer   = function (dcConfigArrayLocal, actualChassisID, dcItem) {
  // =if($Y41>0,roundup($J42/$Y41,0),0)
  console.log(`dcConfigFinalSSDPerServer() 4: dcConfigArrayLocal[dcItem=${dcItem}].resultingNumberOfServersAsPerChassis=${dcConfigArrayLocal[dcItem].resultingNumberOfServersAsPerChassis} > 0 ?`)
  if (dcConfigArrayLocal[dcItem].resultingNumberOfServersAsPerChassis > 0) {
    dcConfigArrayLocal[dcItem].resultingNumberOfSSD = Math.round(dcConfigArrayLocal[dcItem].numberOfSSDNeeded / dcConfigArrayLocal[dcItem].resultingNumberOfServersAsPerChassis)
  }
  else {
    console.log(`dcConfigFinalSSDPerServer() 9: dcConfigArrayLocal[dcItem=${dcItem}].resultingNumberOfServersAsPerChassis=${dcConfigArrayLocal[dcItem].resultingNumberOfServersAsPerChassis}`)
    dcConfigArrayLocal[dcItem].resultingNumberOfSSD = 0
  }
  console.log(`dcConfigFinalSSDPerServer() 12: [chassisID=${actualChassisID},DC=${dcItem}] dcConfigArrayLocal[dcItem=${dcItem}].resultingNumberOfSSD=${dcConfigArrayLocal[dcItem].resultingNumberOfSSD}`)
}

export default dcConfigFinalSSDPerServer