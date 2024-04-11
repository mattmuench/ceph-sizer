// numberOfServersNeededAllInstances
const dcConfigCalcPreliminaryMediaPerServer = function (dcConfigArrayLocal, dcItem, chassisArrayLocal, actualChassisID) {
  // Calculate preliminary number of media per server to avoid constantly calculating something that might be not that obvious at the time of use
  
  if (chassisArrayLocal[actualChassisID].sizeHDD1 > 0) {
    dcConfigArrayLocal[dcItem].prelimPerServerNumberOfHDDNeeded = Math.ceil(dcConfigArrayLocal[dcItem].numberOfHDDNeeded / dcConfigArrayLocal[dcItem].numberOfServersNeededAllInstances)  
  }
  else {
    dcConfigArrayLocal[dcItem].prelimPerServerNumberOfHDDNeeded = 0
  }

  if (chassisArrayLocal[actualChassisID].sizeSSD1 > 0) {
    dcConfigArrayLocal[dcItem].prelimPerServerNumberOfSSDNeeded = Math.ceil(dcConfigArrayLocal[dcItem].numberOfSSDNeeded / dcConfigArrayLocal[dcItem].numberOfServersNeededAllInstances)
  }
  else {
    dcConfigArrayLocal[dcItem].prelimPerServerNumberOfSSDNeeded = 0
  }
  if (chassisArrayLocal[actualChassisID].sizeSSD1 > 0) {
    dcConfigArrayLocal[dcItem].prelimPerServerNumberOfSSDWithoutDedicatedNVMeNeeded = Math.ceil(dcConfigArrayLocal[dcItem].numberOfSSDWithoutDedicatedNVMeNeeded / dcConfigArrayLocal[dcItem].numberOfServersNeededAllInstances)
  }
  else {
    dcConfigArrayLocal[dcItem].prelimPerServerNumberOfSSDWithoutDedicatedNVMeNeeded = 0
  }
  if (chassisArrayLocal[actualChassisID].sizeSSD1 > 0) {
    dcConfigArrayLocal[dcItem].prelimPerServerNumberOfSSDWithDedicatedNVMeNeeded = Math.ceil(dcConfigArrayLocal[dcItem].numberOfSSDWithDedicatedNVMeNeeded / dcConfigArrayLocal[dcItem].numberOfServersNeededAllInstances)
  }
  else {
    dcConfigArrayLocal[dcItem].prelimPerServerNumberOfSSDWithDedicatedNVMeNeeded = 0
  }
  if (chassisArrayLocal[actualChassisID].sizeNVMe1 > 0) {
    dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe1NeededWithoutDedicatedWAL = Math.ceil(dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithoutDedicatedWAL / dcConfigArrayLocal[dcItem].numberOfServersNeededAllInstances)
  }
  else {
    dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe1NeededWithoutDedicatedWAL = 0
  }
  if (chassisArrayLocal[actualChassisID].sizeNVMe1 > 0) {
    dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe1NeededWithDedicatedWAL = Math.ceil(dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithDedicatedWAL / dcConfigArrayLocal[dcItem].numberOfServersNeededAllInstances)
  }
  else {
    dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe1NeededWithDedicatedWAL =0
  }
  if (chassisArrayLocal[actualChassisID].sizeSSD4 > 0) {
    dcConfigArrayLocal[dcItem].prelimPerServerNumberOfSSD4Needed = Math.ceil(dcConfigArrayLocal[dcItem].numberOfSSD4Needed / dcConfigArrayLocal[dcItem].numberOfServersNeededAllInstances)
  }
  else {
    dcConfigArrayLocal[dcItem].prelimPerServerNumberOfSSD4Needed = 0
  }
  if (chassisArrayLocal[actualChassisID].sizeNVMe2 > 0) {
    dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe2Needed = Math.ceil(dcConfigArrayLocal[dcItem].numberOfNVMe2Needed / dcConfigArrayLocal[dcItem].numberOfServersNeededAllInstances)
  }
  else {
    dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe2Needed = 0
  }
  if (chassisArrayLocal[actualChassisID].sizeNVMe3 > 0) {
    dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe3Needed = Math.ceil(dcConfigArrayLocal[dcItem].numberOfNVMe3Needed / dcConfigArrayLocal[dcItem].numberOfServersNeededAllInstances)
  }
  else {
    dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe3Needed = 0
  }
  if (chassisArrayLocal[actualChassisID].sizeNVMe4 > 0) {
    dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe4Needed = Math.ceil(dcConfigArrayLocal[dcItem].numberOfNVMe4Needed / dcConfigArrayLocal[dcItem].numberOfServersNeededAllInstances)
  }
  else {
    dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe4Needed = 0
  }
  if (chassisArrayLocal[actualChassisID].sizeNVMe5 > 0) {
    dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe5Needed = Math.ceil(dcConfigArrayLocal[dcItem].numberOfNVMe5Needed / dcConfigArrayLocal[dcItem].numberOfServersNeededAllInstances)
  }
  else {
    dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe5Needed = 0
  }
  if (chassisArrayLocal[actualChassisID].sizeNVMe6 > 0) {
    dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe6Needed = Math.ceil(dcConfigArrayLocal[dcItem].numberOfNVMe6Needed / dcConfigArrayLocal[dcItem].numberOfServersNeededAllInstances)
  }
  else {
    dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe6Needed = 0
  }
  if (chassisArrayLocal[actualChassisID].sizeNVMe7 > 0) {
    dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe7Needed = Math.ceil(dcConfigArrayLocal[dcItem].numberOfNVMe7Needed / dcConfigArrayLocal[dcItem].numberOfServersNeededAllInstances)
  }
  else {
    dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe7Needed = 0
  }
        
}

export default dcConfigCalcPreliminaryMediaPerServer