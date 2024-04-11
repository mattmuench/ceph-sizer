

// trying to implement AB41, AE41, AF41, etc.
const dcConfigFinalNVMePerServer   = function (dcConfigArrayLocal, actualChassisID, dcItem, chassisArrayLocal) {
  if (dcConfigArrayLocal[dcItem].resultingNumberOfServersAsPerChassis > 0) {
    dcConfigArrayLocal[dcItem].resultingNumberOfNVMe1 = Math.ceil((dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithoutDedicatedWAL + dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithoutDedicatedWAL) / dcConfigArrayLocal[dcItem].resultingNumberOfServersAsPerChassis)
    dcConfigArrayLocal[dcItem].resultingNumberOfNVMe2 = Math.ceil(dcConfigArrayLocal[dcItem].numberOfNVMe2Needed / dcConfigArrayLocal[dcItem].resultingNumberOfServersAsPerChassis)
    dcConfigArrayLocal[dcItem].resultingNumberOfNVMe3 = Math.ceil(dcConfigArrayLocal[dcItem].numberOfNVMe3Needed / dcConfigArrayLocal[dcItem].resultingNumberOfServersAsPerChassis)
    dcConfigArrayLocal[dcItem].resultingNumberOfNVMe4 = Math.ceil(dcConfigArrayLocal[dcItem].numberOfNVMe4Needed / dcConfigArrayLocal[dcItem].resultingNumberOfServersAsPerChassis)
    if (Math.ceil(dcConfigArrayLocal[dcItem].numberOfNVMe5Needed / dcConfigArrayLocal[dcItem].resultingNumberOfServersAsPerChassis) > Math.ceil(dcConfigArrayLocal[dcItem].numberOfSSDWithDedicatedNVMeNeeded/chassisArrayLocal[actualChassisID].ssdToNVMe5/ dcConfigArrayLocal[dcItem].resultingNumberOfServersAsPerChassis)) {
      dcConfigArrayLocal[dcItem].resultingNumberOfNVMe5 = Math.ceil(dcConfigArrayLocal[dcItem].numberOfNVMe5Needed / dcConfigArrayLocal[dcItem].resultingNumberOfServersAsPerChassis)
      console.log(`dcConfigFinalNVMePerServer() 12: [chassisID=${actualChassisID},DC=${dcItem}] dcConfigArrayLocal[dcItem].resultingNumberOfNVMe5 = Math.ceil(dcConfigArrayLocal[dcItem].numberOfNVMe5Needed=${dcConfigArrayLocal[dcItem].numberOfNVMe5Needed} / dcConfigArrayLocal[dcItem].resultingNumberOfServersAsPerChassis=${dcConfigArrayLocal[dcItem].resultingNumberOfServersAsPerChassis})`)
    }
    else {
      dcConfigArrayLocal[dcItem].resultingNumberOfNVMe5 = Math.ceil(dcConfigArrayLocal[dcItem].numberOfSSDWithDedicatedNVMeNeeded/chassisArrayLocal[actualChassisID].ssdToNVMe5/ dcConfigArrayLocal[dcItem].resultingNumberOfServersAsPerChassis)
      console.log(`dcConfigFinalNVMePerServer() 16: [chassisID=${actualChassisID},DC=${dcItem}] dcConfigArrayLocal[dcItem].resultingNumberOfNVMe5 = Math.ceil(dcConfigArrayLocal[dcItem].numberOfSSDWithDedicatedNVMeNeeded=${dcConfigArrayLocal[dcItem].numberOfSSDWithDedicatedNVMeNeeded}/dcConfigArrayLocal[dcItem].ssdToNVMe5=${dcConfigArrayLocal[dcItem].ssdToNVMe5}/ dcConfigArrayLocal[dcItem].resultingNumberOfServersAsPerChassis=${dcConfigArrayLocal[dcItem].resultingNumberOfServersAsPerChassis})`)
    }
    dcConfigArrayLocal[dcItem].resultingNumberOfNVMe6 = Math.ceil(dcConfigArrayLocal[dcItem].numberOfNVMe6Needed / dcConfigArrayLocal[dcItem].resultingNumberOfServersAsPerChassis)
    dcConfigArrayLocal[dcItem].resultingNumberOfNVMe7 = Math.ceil(dcConfigArrayLocal[dcItem].numberOfNVMe7Needed / dcConfigArrayLocal[dcItem].resultingNumberOfServersAsPerChassis)
  }
  else {
    dcConfigArrayLocal[dcItem].resultingNumberOfNVMe1 = 0
    dcConfigArrayLocal[dcItem].resultingNumberOfNVMe2 = 0
    dcConfigArrayLocal[dcItem].resultingNumberOfNVMe3 = 0
    dcConfigArrayLocal[dcItem].resultingNumberOfNVMe4 = 0
    dcConfigArrayLocal[dcItem].resultingNumberOfNVMe5 = 0
    dcConfigArrayLocal[dcItem].resultingNumberOfNVMe6 = 0
    dcConfigArrayLocal[dcItem].resultingNumberOfNVMe7 = 0
  }

  console.log(`dcConfigFinalNVMePerServer() 31: [chassisID=${actualChassisID}] dcConfigArrayLocal[dcItem=${dcItem}].resultingNumberOfNVMe1=${dcConfigArrayLocal[dcItem].resultingNumberOfNVMe1}`)
  console.log(`dcConfigFinalNVMePerServer() 32: [chassisID=${actualChassisID}] dcConfigArrayLocal[dcItem=${dcItem}].resultingNumberOfNVMe2=${dcConfigArrayLocal[dcItem].resultingNumberOfNVMe2}`)
  console.log(`dcConfigFinalNVMePerServer() 33: [chassisID=${actualChassisID}] dcConfigArrayLocal[dcItem=${dcItem}].resultingNumberOfNVMe3=${dcConfigArrayLocal[dcItem].resultingNumberOfNVMe3}`)
  console.log(`dcConfigFinalNVMePerServer() 34: [chassisID=${actualChassisID}] dcConfigArrayLocal[dcItem=${dcItem}].resultingNumberOfNVMe4=${dcConfigArrayLocal[dcItem].resultingNumberOfNVMe4}`)
  console.log(`dcConfigFinalNVMePerServer() 35: [chassisID=${actualChassisID}] dcConfigArrayLocal[dcItem=${dcItem}].resultingNumberOfNVMe5=${dcConfigArrayLocal[dcItem].resultingNumberOfNVMe5}`)
  console.log(`dcConfigFinalNVMePerServer() 36: [chassisID=${actualChassisID}] dcConfigArrayLocal[dcItem=${dcItem}].resultingNumberOfNVMe6=${dcConfigArrayLocal[dcItem].resultingNumberOfNVMe6}`)
  console.log(`dcConfigFinalNVMePerServer() 37: [chassisID=${actualChassisID}] dcConfigArrayLocal[dcItem=${dcItem}].resultingNumberOfNVMe7=${dcConfigArrayLocal[dcItem].resultingNumberOfNVMe7}`)
}

export default dcConfigFinalNVMePerServer