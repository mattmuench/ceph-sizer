//import loadChassisConfigs from "./loadChassisConfigs.js";
import displayMsg from "../common/displayMsg.js";
import Chassis from "../Chassis.js";

const installEventHandlerLoadChassisConfig = function (documentMain, chassisArrayLocal, generalValues, loadedConfigsLocal) {

  // recognize button for loading presaved chassis config definition file
  const clickedLoadChassisConfig = documentMain.getElementById("input-filename-chassis-config")
  clickedLoadChassisConfig.addEventListener("change", (event) => {
      event.preventDefault()
      
      console.log("installEventHandlerLoadChassisConfig 10: Recalculation after loading new chassis config should start now")
      const selectedFile = clickedLoadChassisConfig.files[0];
      console.log(`installEventHandlerLoadChassisConfig() 12 for input-filename-chassis-config: changed filename to selectedFile=${selectedFile.name}`)
      
      const textFile = new Response(selectedFile).text()
      console.log(`installEventHandlerLoadChassisConfig() 15: textFile=${textFile}`)
      
      // LAST known good approach - all others didn't work to get the reading of the file content done and the following processing then in sync *after* the file contents is read
      const myret = logIngredients(selectedFile,loadedConfigsLocal)

      const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
      wait(1000).then(() => {
          console.log(`installEventHandlerLoadChassisConfig() 22: entry of loadedConfigsLocal.chassisConfigFile=${loadedConfigsLocal.chassisConfigFile}`)
          readChassisConfig(documentMain, generalValues, loadedConfigsLocal, chassisArrayLocal)          
        }
      );
    })
}

async function logIngredients(selectedFile,loadedConfigsLocal) {
  const res = await new Response(selectedFile).text();
  console.log(`logIngredients() 58: res=${res}`);
  loadedConfigsLocal.chassisConfigFile=res;
  console.log(`logIngredients() 60: loadedConfigsLocal.chassisConfigFile=${loadedConfigsLocal.chassisConfigFile}`);
}

const readChassisConfig = function (documentMain, generalValues, loadedConfigsLocal, chassisArrayLocal){
  console.log(`readChassisConfig() 39: loadedConfigsLocal.chassisConfigFile=${loadedConfigsLocal.chassisConfigFile}`)
  var loadedJsonChassisObject;
  try {
    loadedJsonChassisObject = JSON.parse(loadedConfigsLocal.chassisConfigFile); 
  } catch (e) {
    console.log("Error:", e.message)
    displayMsg(documentMain, "readChassisConfig", 44, "error", e.message,0,0,0)
  }
  loadedJsonChassisObject.chassisConfig.forEach(element => {
    if (element.chassisID >= generalValues.numberOfConfigsPossible) {
      console.log(`readChassisConfig() 48: ERROR - max number of configs possible is generalValues.numberOfConfigsPossible - check input file for chassisID`)
      displayMsg(documentMain, "readChassisConfig", 48, "error", "max number of configs possible is generalValues.numberOfConfigsPossible - check input file for chassisID",0,0,0)
    }
    else {
      const dataColumns = chassisArrayLocal[element.chassisID].ChassisItemsDict.length;
      console.log(`readChassisConfig() 48: dataColumns = ${dataColumns}`)
      
      for (let j = 0; j < dataColumns; j++) {
        const item = chassisArrayLocal[element.chassisID].ChassisItemsDict[j][1]
        if (item == "chassisID") {
          console.log(`readChassisConfig() 52: ignoring since got it for processing already`)
        }
        else {
          //for (let j = 0; j < dataColumns; j++) {
            //const item = chassisArrayLocal[element.chassisID].ChassisItemsDict[j][1]
            //if (item == "chassisID") {
              //console.log(`readChassisConfig() 52: ignoring since got it for processing already`)
            //}
            //else {/** */
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
                case "sizeSSD1":
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
          
                case "useNVMe8": 
                case "useNVMe7":
                case "useOptane1":
                case "useRGWCaching":
                case "useSSD4overNVMe4":
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
                  console.log(`no valid statement found for ${item}`)
                  displayMsg(documentMain, "readChassisConfig", 129, "error", `no valid statement found for ${item}`,0,0,0)
                }
              }
            //}/** */
          //}/** */
          
          
          
          
          
          
          
          
          
          
          /**
          let val5 = eval('element'+'.'+'members'+'.'+item)
          console.log(`readChassisConfig() 56: item=${item} = item value=${val5}`)

          // constructing the id string for the cell to read from
          let idStringToFind =  `chassis-${element.chassisID}-${chassisArrayLocal[element.chassisID].ChassisItemsDict[j][0]}`

          console.log(`readChassisConfig() 99: [chassis detail=${item}] looking up the DOM element id ${idStringToFind}`)
          const inputElement = documentMain.getElementById(idStringToFind)
          inputElement.value=val5
          
          console.log(`readChassisConfig() 60: actual chassisID=${element.chassisID} item=${item} set to:${val5}`)  
           */
        }
        
      }
    }
        
  });

  console.log(`readChassisConfig() 63: loading chassis config file finished`)
}

export {installEventHandlerLoadChassisConfig,readChassisConfig}