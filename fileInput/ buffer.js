for (let j = 0; j < dataColumns; j++) {
  const item = chassisArrayLocal[element.chassisID].ChassisItemsDict[j][1]
  if (item == "chassisID") {
    console.log(`readChassisConfig() 52: ignoring since got it for processing already`)
  }
  else {
    switch (item){
      case "maxHDDSlots":
      case "maxSSDSlots":
      case "maxNVMeSlots":
      case "maxAllSlots":
      case "maxDedicatedNVMeSlots":
      case "maxAllMediaSum":
      case "maxCpuSockets":
      case "maxCpuCores":
      case "maxMemGb":
      case "maxPciSlots":
      case "sizeHDD1":
      case "speedNicPublic":
      case "speedNicCluster":
      case "sizeNVMe1":
      case "sizeNVMe2":
      case "sizeNVMe4":
      case "hddToNVMe4":
      case "sizeNVMe5":
      case "sizeNVMe6":
      case "sizeNVMe7":
      case "sizeNVMe8":
      case "ssdToOptane":
      case "sizeOptane1":
      case "useSSD4overNVMe4":
      case "hddToSSD4":
      case "sizeSSD4":
      case "ssdToNVMe5":
      case "nvmeToNVMe7":
      case "nvmeToNVMe8":
      {
        let valTemp = eval('element'+'.'+'members'+'.'+item)
        console.log(`readChassisConfig() 81: item=${item} = item value=${valTemp}`)
        // constructing the id string for the cell to read from
        let idStringToFind =  `chassis-${element.chassisID}-${chassisArrayLocal[element.chassisID].ChassisItemsDict[j][0]}`

        console.log(`readChassisConfig() 95: [workload detail=${item}] looking up the DOM element id ${idStringToFind}`)
        const inputElement = documentMain.getElementById(idStringToFind)
        inputElement.value = valTemp
      }
      break;

      case "selectorNVMe":
      case "selectorHighdense":
      case "selectorRGWCache":
      case "selectorRGWIndexDedicatedFlashPool":
      case "selectorSSDDedicatedNVMe":
      case "selectorSSDDedicatedNVMeForWAL":
      case "selectorNVMe1DedicatedNVMe":
      case "selectorNVMe1DedicatedNVMeForWAL":
        {
          let valTemp = eval('element'+'.'+'members'+'.'+item)
          console.log(`readChassisConfig() 111: item=${item} = item value=${valTemp}`)

          // constructing the id string for the cell to read from
          let idStringToFind =  `chassis-${element.chassisID}-${chassisArrayLocal[element.chassisID].ChassisItemsDict[j][0]}`

          console.log(`readChassisConfig() 116: [workload detail=${item}] looking up the DOM element id ${idStringToFind}`)
          const inputElement = documentMain.getElementById(idStringToFind)
          inputElement.checked = valTemp
        }
      break;

      default: {
        console.log(`no valid statement found for ${elementType}`)
      }
    }
  }
}