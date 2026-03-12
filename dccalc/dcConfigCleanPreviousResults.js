const dcConfigCleanPreviousResults = function (generalValuesLocal, configsArrayLocal, chassisArrayLocal) {

  for (let actualChassisID = 0; actualChassisID < generalValuesLocal.numberOfConfigsPossible; actualChassisID++) {
    if(chassisArrayLocal[actualChassisID].maxAllMediaSum > 0) {
      console.log(`calcDCConfig() 37: working on config ${actualChassisID},chassisArrayLocal[actualChassisID].maxAllMediaSum=${chassisArrayLocal[actualChassisID].maxAllMediaSum} `)
      console.log(`calcDCConfig() 38: the array is ${configsArrayLocal}`)
      console.log(`calcDCConfig() 39: ... and the actual sub-array is the array ${configsArrayLocal[actualChassisID]}`)
      const dcConfigArrayLocal = configsArrayLocal[actualChassisID]

      for (let dcItem = 0; dcItem < generalValuesLocal.numberOfDCsPossible; dcItem++) {
        dcConfigArrayLocal[dcItem].numberOfWorkloadsInDC = 0
        dcConfigArrayLocal[dcItem].capacityNeededForSSD = 0
        dcConfigArrayLocal[dcItem].capacityNeededForHDD = 0
        dcConfigArrayLocal[dcItem].capacityNeededForNVMe = 0
        dcConfigArrayLocal[dcItem].numberOfLocalScaleoutInstances = 0
        dcConfigArrayLocal[dcItem].numberOfLocalSpecialInstances = 0
        
        dcConfigArrayLocal[dcItem].numberOfServersNeededAllInstances = 0
        dcConfigArrayLocal[dcItem].numberOfNeededMonInstances = 0
        dcConfigArrayLocal[dcItem].numberOfServersNeededForReplicaInSameDC = 0
        dcConfigArrayLocal[dcItem].numberOfServersNeededBasedOnChassisConfig = 0
        dcConfigArrayLocal[dcItem].numberOfWorkloadsInDC = 0
        dcConfigArrayLocal[dcItem].numberOfHDDNeeded = 0
        dcConfigArrayLocal[dcItem].numberOfSSDNeeded = 0

        dcConfigArrayLocal[dcItem].numberOfSSD1NeededWithoutDedicatedRocksDBNorWAL = 0
        dcConfigArrayLocal[dcItem].numberOfSSD1NeededWithoutDedicatedRocksDBDedicatedWAL = 0
        dcConfigArrayLocal[dcItem].numberOfSSD1NeededWithDedicatedRocksDBDedicatedWAL = 0
        dcConfigArrayLocal[dcItem].numberOfSSD1NeededWithDedicatedRocksDBIncludingWAL = 0
        
        dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithoutDedicatedRocksDBNorWAL = 0
        dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithoutDedicatedRocksDBDedicatedWAL = 0
        dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithDedicatedRocksDBDedicatedWAL = 0
        dcConfigArrayLocal[dcItem].numberOfNVMe1NeededWithDedicatedRocksDBIncludingWAL = 0
        
        dcConfigArrayLocal[dcItem].numberOfSSD4Needed = 0
        dcConfigArrayLocal[dcItem].numberOfNVMe1Needed = 0
        dcConfigArrayLocal[dcItem].numberOfNVMe2Needed = 0
        dcConfigArrayLocal[dcItem].numberOfNVMe3Needed = 0
        dcConfigArrayLocal[dcItem].numberOfNVMe4Needed = 0
        dcConfigArrayLocal[dcItem].numberOfNVMe5Needed = 0
        dcConfigArrayLocal[dcItem].numberOfNVMe6Needed = 0
        dcConfigArrayLocal[dcItem].numberOfNVMe7Needed = 0
        dcConfigArrayLocal[dcItem].numberOfNVMe8Needed = 0
        
        dcConfigArrayLocal[dcItem].numberOfCoresNeeded = 0
        dcConfigArrayLocal[dcItem].memNeededPerServer = 0

        dcConfigArrayLocal[dcItem].prelimPerServerNumberOfHDDNeeded = 0
        dcConfigArrayLocal[dcItem].prelimPerServerNumberOfSSDNeeded = 0
        dcConfigArrayLocal[dcItem].prelimPerServerNumberOfSSDWithoutDedicatedNVMeNeeded = 0
        dcConfigArrayLocal[dcItem].prelimPerServerNumberOfSSDWithDedicatedNVMeNeeded = 0
        dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe1NeededWithoutDedicatedWAL = 0
        dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe1NeededWithDedicatedWAL = 0
        
        dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe1Needed = 0
        dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe2Needed = 0
        dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe3Needed = 0
        dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe4Needed = 0
        dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe5Needed = 0
        dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe6Needed = 0
        dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe7Needed = 0
        dcConfigArrayLocal[dcItem].prelimPerServerNumberOfNVMe8Needed = 0
        dcConfigArrayLocal[dcItem].prelimPerServerNumberOfCoresNeeded = 0
        dcConfigArrayLocal[dcItem].prelimPerServerMemNeededPerServer = 0
        dcConfigArrayLocal[dcItem].prelimNumberOfServers = 0
        
        dcConfigArrayLocal[dcItem].constraintsBasedOnCores = 0
        dcConfigArrayLocal[dcItem].constraintsBasedOnMem = 0
        dcConfigArrayLocal[dcItem].constraintsBasedOnNothing = 0
        dcConfigArrayLocal[dcItem].constraintsBasedOnAll = 0

        dcConfigArrayLocal[dcItem].resultingNumberOfServers = 0
        dcConfigArrayLocal[dcItem].resultingNumberOfCores = 0
        dcConfigArrayLocal[dcItem].resultingMem = 0
        dcConfigArrayLocal[dcItem].resultingNumberOfSSD = 0
        dcConfigArrayLocal[dcItem].resultingNumberOfHDD = 0
        dcConfigArrayLocal[dcItem].resultingNumberOfNVMe1 = 0
        dcConfigArrayLocal[dcItem].resultingNumberOfNVMe2 = 0
        dcConfigArrayLocal[dcItem].resultingNumberOfNVMe3 = 0
        dcConfigArrayLocal[dcItem].resultingNumberOfNVMe4 = 0
        dcConfigArrayLocal[dcItem].resultingNumberOfNVMe5 = 0
        dcConfigArrayLocal[dcItem].resultingNumberOfNVMe6 = 0
        dcConfigArrayLocal[dcItem].resultingNumberOfNVMe7 = 0
        dcConfigArrayLocal[dcItem].resultingNumberOfNVMe8 = 0
        dcConfigArrayLocal[dcItem].resultingNumberOfServersAsPerChassis = 0
        dcConfigArrayLocal[dcItem].resultingNumberOfServersForiSCSILocalAsPerChassis = 0
        dcConfigArrayLocal[dcItem].resultingNumberOfPublicNetNICs = 0
        dcConfigArrayLocal[dcItem].resultingNumberOfClusterNetNICs = 0

        console.log(`dcConfigCleanPreviousResults() 91: actual values for chassis=${actualChassisID} for dcItem=${dcItem} resetted`)  
      }      
    }    
  }
}

export default dcConfigCleanPreviousResults