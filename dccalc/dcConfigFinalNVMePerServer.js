

// trying to implement AB41, AE41, AF41, etc.
const dcConfigFinalNVMePerServer   = function (dcConfigArrayLocal, actualChassisID, dcItem, chassisArrayLocal) {
  if (dcConfigArrayLocal[dcItem].resultingNumberOfServersAsPerChassis > 0) {
    dcConfigArrayLocal[dcItem].resultingNumberOfNVMe1 = Math.ceil((dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithoutDedicatedRocksDBNorWAL + dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithoutDedicatedRocksDBDedicatedWAL + dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithDedicatedRocksDBDedicatedWAL + dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithDedicatedRocksDBIncludingWAL) / dcConfigArrayLocal[dcItem].resultingNumberOfServersAsPerChassis)
    dcConfigArrayLocal[dcItem].resultingNumberOfNVMe2 = Math.ceil(dcConfigArrayLocal[dcItem].numberOfNVMe2Needed / dcConfigArrayLocal[dcItem].resultingNumberOfServersAsPerChassis)
    dcConfigArrayLocal[dcItem].resultingNumberOfNVMe3 = Math.ceil(dcConfigArrayLocal[dcItem].numberOfNVMe3Needed / dcConfigArrayLocal[dcItem].resultingNumberOfServersAsPerChassis)
    dcConfigArrayLocal[dcItem].resultingNumberOfNVMe4 = Math.ceil(dcConfigArrayLocal[dcItem].numberOfNVMe4Needed / dcConfigArrayLocal[dcItem].resultingNumberOfServersAsPerChassis)
    if (Math.ceil(dcConfigArrayLocal[dcItem].numberOfNVMe5Needed / dcConfigArrayLocal[dcItem].resultingNumberOfServersAsPerChassis) > Math.ceil(Math.ceil((dcConfigArrayLocal[dcItem].numberOfSSD1NeededWithDedicatedRocksDBDedicatedWAL/chassisArrayLocal[actualChassisID].ssdToNVMe5) + Math.ceil(dcConfigArrayLocal[dcItem].numberOfSSD1NeededWithDedicatedRocksDBIncludingWAL/chassisArrayLocal[actualChassisID].ssdToNVMe5))/ dcConfigArrayLocal[dcItem].resultingNumberOfServersAsPerChassis)) {
      dcConfigArrayLocal[dcItem].resultingNumberOfNVMe5 = Math.ceil(dcConfigArrayLocal[dcItem].numberOfNVMe5Needed / dcConfigArrayLocal[dcItem].resultingNumberOfServersAsPerChassis)
      console.log(`dcConfigFinalNVMePerServer() 12: [chassisID=${actualChassisID},DC=${dcItem}] dcConfigArrayLocal[dcItem].resultingNumberOfNVMe5 = Math.ceil(dcConfigArrayLocal[dcItem].numberOfNVMe5Needed=${dcConfigArrayLocal[dcItem].numberOfNVMe5Needed} / dcConfigArrayLocal[dcItem].resultingNumberOfServersAsPerChassis=${dcConfigArrayLocal[dcItem].resultingNumberOfServersAsPerChassis})`)
    }
    else {
      dcConfigArrayLocal[dcItem].resultingNumberOfNVMe5 = Math.ceil((Math.ceil(dcConfigArrayLocal[dcItem].numberOfSSD1NeededWithDedicatedRocksDBDedicatedWAL/chassisArrayLocal[actualChassisID].ssdToNVMe5)+(Math.ceil(dcConfigArrayLocal[dcItem].numberOfSSD1NeededWithDedicatedRocksDBDedicatedWAL/chassisArrayLocal[actualChassisID].ssdToNVMe5)))/ dcConfigArrayLocal[dcItem].resultingNumberOfServersAsPerChassis)
      console.log(`dcConfigFinalNVMePerServer() 16: [chassisID=${actualChassisID},DC=${dcItem}] dcConfigArrayLocal[dcItem].resultingNumberOfNVMe5 = Math.ceil((Math.ceil(dcConfigArrayLocal[dcItem].numberOfSSD1NeededWithDedicatedRocksDBDedicatedWAL=${dcConfigArrayLocal[dcItem].numberOfSSD1NeededWithDedicatedRocksDBDedicatedWAL}/chassisArrayLocal[actualChassisID].ssdToNVMe5=${chassisArrayLocal[actualChassisID].ssdToNVMe5})+(Math.ceil(dcConfigArrayLocal[dcItem].numberOfSSD1NeededWithDedicatedRocksDBDedicatedWAL=${dcConfigArrayLocal[dcItem].numberOfSSD1NeededWithDedicatedRocksDBDedicatedWAL}/chassisArrayLocal[actualChassisID].ssdToNVMe5=${chassisArrayLocal[actualChassisID].ssdToNVMe5})))/ dcConfigArrayLocal[dcItem].resultingNumberOfServersAsPerChassis)`)
    }
    dcConfigArrayLocal[dcItem].resultingNumberOfNVMe6 = Math.ceil(dcConfigArrayLocal[dcItem].numberOfNVMe6Needed / dcConfigArrayLocal[dcItem].resultingNumberOfServersAsPerChassis)
    
    if (Math.ceil(dcConfigArrayLocal[dcItem].numberOfNVMe7Needed / dcConfigArrayLocal[dcItem].resultingNumberOfServersAsPerChassis) > Math.ceil(Math.ceil((dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithDedicatedRocksDBDedicatedWAL/chassisArrayLocal[actualChassisID].nvmeToNVMe7) + Math.ceil(dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithDedicatedRocksDBIncludingWAL/chassisArrayLocal[actualChassisID].nvmeToNVMe7))/ dcConfigArrayLocal[dcItem].resultingNumberOfServersAsPerChassis)) {
      dcConfigArrayLocal[dcItem].resultingNumberOfNVMe7 = Math.ceil(dcConfigArrayLocal[dcItem].numberOfNVMe7Needed / dcConfigArrayLocal[dcItem].resultingNumberOfServersAsPerChassis)
      console.log(`dcConfigFinalNVMePerServer() 22: [chassisID=${actualChassisID},DC=${dcItem}] dcConfigArrayLocal[dcItem].resultingNumberOfNVMe7 = Math.ceil(dcConfigArrayLocal[dcItem].numberOfNVMe7Needed=${dcConfigArrayLocal[dcItem].numberOfNVMe7Needed} / dcConfigArrayLocal[dcItem].resultingNumberOfServersAsPerChassis=${dcConfigArrayLocal[dcItem].resultingNumberOfServersAsPerChassis})`)
    }
    else {
      dcConfigArrayLocal[dcItem].resultingNumberOfNVMe7 = Math.ceil((Math.ceil(dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithDedicatedRocksDBDedicatedWAL/chassisArrayLocal[actualChassisID].nvmeToNVMe7)+(Math.ceil(dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithDedicatedRocksDBIncludingWAL/chassisArrayLocal[actualChassisID].nvmeToNVMe7)))/ dcConfigArrayLocal[dcItem].resultingNumberOfServersAsPerChassis)
      console.log(`dcConfigFinalNVMePerServer() 26: [chassisID=${actualChassisID},DC=${dcItem}] dcConfigArrayLocal[dcItem].resultingNumberOfNVMe7 = Math.ceil((Math.ceil(dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithDedicatedRocksDBDedicatedWAL=${dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithDedicatedRocksDBDedicatedWAL}/chassisArrayLocal[actualChassisID].nvmeToNVMe7=${chassisArrayLocal[actualChassisID].nvmeToNVMe7})+(Math.ceil(dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithDedicatedRocksDBIncludingWAL=${dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithDedicatedRocksDBIncludingWAL}/chassisArrayLocal[actualChassisID].nvmeToNVMe7=${chassisArrayLocal[actualChassisID].nvmeToNVMe7})))/ dcConfigArrayLocal[dcItem].resultingNumberOfServersAsPerChassis)`)
    }

    dcConfigArrayLocal[dcItem].resultingNumberOfNVMe8 = Math.ceil(dcConfigArrayLocal[dcItem].numberOfNVMe8Needed / dcConfigArrayLocal[dcItem].resultingNumberOfServersAsPerChassis)
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

  console.log(`dcConfigFinalNVMePerServer() 42: [chassisID=${actualChassisID}] dcConfigArrayLocal[dcItem=${dcItem}].resultingNumberOfNVMe1=${dcConfigArrayLocal[dcItem].resultingNumberOfNVMe1}`)
  console.log(`dcConfigFinalNVMePerServer() 43: [chassisID=${actualChassisID}] dcConfigArrayLocal[dcItem=${dcItem}].resultingNumberOfNVMe2=${dcConfigArrayLocal[dcItem].resultingNumberOfNVMe2}`)
  console.log(`dcConfigFinalNVMePerServer() 44: [chassisID=${actualChassisID}] dcConfigArrayLocal[dcItem=${dcItem}].resultingNumberOfNVMe3=${dcConfigArrayLocal[dcItem].resultingNumberOfNVMe3}`)
  console.log(`dcConfigFinalNVMePerServer() 45: [chassisID=${actualChassisID}] dcConfigArrayLocal[dcItem=${dcItem}].resultingNumberOfNVMe4=${dcConfigArrayLocal[dcItem].resultingNumberOfNVMe4}`)
  console.log(`dcConfigFinalNVMePerServer() 46: [chassisID=${actualChassisID}] dcConfigArrayLocal[dcItem=${dcItem}].resultingNumberOfNVMe5=${dcConfigArrayLocal[dcItem].resultingNumberOfNVMe5}`)
  console.log(`dcConfigFinalNVMePerServer() 47: [chassisID=${actualChassisID}] dcConfigArrayLocal[dcItem=${dcItem}].resultingNumberOfNVMe6=${dcConfigArrayLocal[dcItem].resultingNumberOfNVMe6}`)
  console.log(`dcConfigFinalNVMePerServer() 48: [chassisID=${actualChassisID}] dcConfigArrayLocal[dcItem=${dcItem}].resultingNumberOfNVMe7=${dcConfigArrayLocal[dcItem].resultingNumberOfNVMe7}`)
  console.log(`dcConfigFinalNVMePerServer() 49: [chassisID=${actualChassisID}] dcConfigArrayLocal[dcItem=${dcItem}].resultingNumberOfNVMe8=${dcConfigArrayLocal[dcItem].resultingNumberOfNVMe8}`)
}

export default dcConfigFinalNVMePerServer