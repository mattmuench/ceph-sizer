

// trying to implement AB41, AE41, AF41, etc.
const dcConfigFinalNVMePerServer   = function (dcConfigArrayLocal, actualChassisID, dcItem, chassisArrayLocal) {
  if (dcConfigArrayLocal[dcItem].resultingNumberOfServersAsPerChassis > 0) {
    dcConfigArrayLocal[dcItem].resultingNumberOfNVMe1 = dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe1NeededWithoutDedicatedWAL + dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe1NeededWithDedicatedWAL
    dcConfigArrayLocal[dcItem].resultingNumberOfNVMe2 = dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe2Needed
    dcConfigArrayLocal[dcItem].resultingNumberOfNVMe3 = dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe3Needed
    dcConfigArrayLocal[dcItem].resultingNumberOfNVMe4 = dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe4Needed
    dcConfigArrayLocal[dcItem].resultingNumberOfNVMe5 = dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe5Needed
    dcConfigArrayLocal[dcItem].resultingNumberOfNVMe6 = dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe6Needed
    dcConfigArrayLocal[dcItem].resultingNumberOfNVMe7 = dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe7Needed
    dcConfigArrayLocal[dcItem].resultingNumberOfNVMe8 = dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe8Needed
  }
  else {
    dcConfigArrayLocal[dcItem].resultingNumberOfNVMe1 = 0
    dcConfigArrayLocal[dcItem].resultingNumberOfNVMe2 = 0
    dcConfigArrayLocal[dcItem].resultingNumberOfNVMe3 = 0
    dcConfigArrayLocal[dcItem].resultingNumberOfNVMe4 = 0
    dcConfigArrayLocal[dcItem].resultingNumberOfNVMe5 = 0
    dcConfigArrayLocal[dcItem].resultingNumberOfNVMe6 = 0
    dcConfigArrayLocal[dcItem].resultingNumberOfNVMe7 = 0
    dcConfigArrayLocal[dcItem].resultingNumberOfNVMe8 = 0
  }

  console.log(`dcConfigFinalNVMePerServer() 26: [chassisID=${actualChassisID}] dcConfigArrayLocal[dcItem=${dcItem}].resultingNumberOfNVMe1=${dcConfigArrayLocal[dcItem].resultingNumberOfNVMe1}`)
  console.log(`dcConfigFinalNVMePerServer() 27: [chassisID=${actualChassisID}] dcConfigArrayLocal[dcItem=${dcItem}].resultingNumberOfNVMe2=${dcConfigArrayLocal[dcItem].resultingNumberOfNVMe2}`)
  console.log(`dcConfigFinalNVMePerServer() 28: [chassisID=${actualChassisID}] dcConfigArrayLocal[dcItem=${dcItem}].resultingNumberOfNVMe3=${dcConfigArrayLocal[dcItem].resultingNumberOfNVMe3}`)
  console.log(`dcConfigFinalNVMePerServer() 29: [chassisID=${actualChassisID}] dcConfigArrayLocal[dcItem=${dcItem}].resultingNumberOfNVMe4=${dcConfigArrayLocal[dcItem].resultingNumberOfNVMe4}`)
  console.log(`dcConfigFinalNVMePerServer() 30: [chassisID=${actualChassisID}] dcConfigArrayLocal[dcItem=${dcItem}].resultingNumberOfNVMe5=${dcConfigArrayLocal[dcItem].resultingNumberOfNVMe5}`)
  console.log(`dcConfigFinalNVMePerServer() 31: [chassisID=${actualChassisID}] dcConfigArrayLocal[dcItem=${dcItem}].resultingNumberOfNVMe6=${dcConfigArrayLocal[dcItem].resultingNumberOfNVMe6}`)
  console.log(`dcConfigFinalNVMePerServer() 32: [chassisID=${actualChassisID}] dcConfigArrayLocal[dcItem=${dcItem}].resultingNumberOfNVMe7=${dcConfigArrayLocal[dcItem].resultingNumberOfNVMe7}`)
  console.log(`dcConfigFinalNVMePerServer() 33: [chassisID=${actualChassisID}] dcConfigArrayLocal[dcItem=${dcItem}].resultingNumberOfNVMe8=${dcConfigArrayLocal[dcItem].resultingNumberOfNVMe8}`)
}

export default dcConfigFinalNVMePerServer