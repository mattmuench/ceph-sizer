//import loadChassisConfigs from "./loadChassisConfigs.js";
import displayMsg from "../common/displayMsg.js";
import {debugMsg} from "../common/debug.js";

const installEventHandlerLoadChassisConfig = function (documentMain, chassisArrayLocal, generalValues, loadedConfigsLocal) {

  let localDebugOn = true

  // recognize button for loading presaved chassis config definition file
  const clickedLoadChassisConfig = documentMain.getElementById("input-filename-chassis-config")
  clickedLoadChassisConfig.addEventListener("change", (event) => {
    event.preventDefault()
    
    debugMsg(generalValues, localDebugOn, 5, "installEventHandlerLoadChassisConfig", 14, `Recalculation after loading new chassis config should start now`,0,0,0)
    const selectedFile = clickedLoadChassisConfig.files[0];
    debugMsg(generalValues, localDebugOn, 5, "installEventHandlerLoadChassisConfig", 16, `for input-filename-chassis-config: changed filename to selectedFile=${selectedFile.name}`,0,0,0)
    
    const textFile = new Response(selectedFile).text()
    debugMsg(generalValues, localDebugOn, 5, "installEventHandlerLoadChassisConfig", 19, `textFile=${textFile}`,0,0,0)
    
    // LAST known good approach - all others didn't work to get the reading of the file content done and the following processing then in sync *after* the file contents is read
    const myret = logIngredients(generalValues, localDebugOn, selectedFile, loadedConfigsLocal)
    const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    wait(1000).then(() => {
        debugMsg(generalValues, localDebugOn, 5, "installEventHandlerLoadChassisConfig", 25, `entry of loadedConfigsLocal.chassisConfigFile=${loadedConfigsLocal.chassisConfigFile}`,0,0,0)
        readChassisConfig(generalValues, localDebugOn, documentMain, loadedConfigsLocal, chassisArrayLocal)          
      }
    );

    event.target.value = '';
  })
}

async function logIngredients(generalValues, localDebugOn, selectedFile, loadedConfigsLocal) {
  const res = await new Response(selectedFile).text();
  debugMsg(generalValues, localDebugOn, 5, "logIngredients", 34, `res=${res}`,0,0,0)
  loadedConfigsLocal.chassisConfigFile=res;
  debugMsg(generalValues, localDebugOn, 5, "logIngredients", 36, `loadedConfigsLocal.chassisConfigFile=${loadedConfigsLocal.chassisConfigFile}`,0,0,0)
}

const readChassisConfig = function (generalValues, localDebugOn, documentMain, loadedConfigsLocal, chassisArrayLocal){

  localDebugOn = true

  debugMsg(generalValues, localDebugOn, 5, "readChassisConfig", 40, `loadedConfigsLocal.chassisConfigFile=${loadedConfigsLocal.chassisConfigFile}`,0,0,0)
  var loadedJsonChassisObject;
  try {
    loadedJsonChassisObject = JSON.parse(loadedConfigsLocal.chassisConfigFile); 
  } catch (e) {
    debugMsg(generalValues, localDebugOn, 5, "readChassisConfig", 45, `Error: ${e.message}`,0,0,0)
    displayMsg(documentMain, "readChassisConfig", 46, "error", e.message,0,0,0)
  }
  loadedJsonChassisObject.chassisConfig.forEach(element => {
    if (element.chassisID >= generalValues.numberOfConfigsPossible) {
      debugMsg(generalValues, localDebugOn, 5, "readChassisConfig", 50, `ERROR - max number of configs possible is generalValues.numberOfConfigsPossible - check input file for chassisID`,0,0,0)
      displayMsg(documentMain, "readChassisConfig", 51, "error", "max number of configs possible is generalValues.numberOfConfigsPossible - check input file for chassisID",0,0,0)
    }
    else {
      const dataColumns = chassisArrayLocal[element.chassisID].ChassisItemsDict.length;
      debugMsg(generalValues, localDebugOn, 5, "readChassisConfig", 55, `dataColumns = ${dataColumns}`,0,0,0)
      
      for (let j = 0; j < dataColumns; j++) {
        const item = chassisArrayLocal[element.chassisID].ChassisItemsDict[j][1]
        if (item == "chassisID") {
          debugMsg(generalValues, localDebugOn, 5, "readChassisConfig", 60, `ignoring since got it for processing already`,0,0,0)
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
                debugMsg(generalValues, localDebugOn, 5, "readChassisConfig", 96, `item=${item} = item value=${valTemp}`,0,0,0)
                // constructing the id string for the cell to read from
                let idStringToFind =  `chassis-${element.chassisID}-${chassisArrayLocal[element.chassisID].ChassisItemsDict[j][0]}`
                debugMsg(generalValues, localDebugOn, 5, "readChassisConfig", 99, `[workload detail=${item}] looking up the DOM element id ${idStringToFind}`,0,0,0)
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
                debugMsg(generalValues, localDebugOn, 5, "readChassisConfig", 112, `item=${item} = item value=${valTemp}`,0,0,0)

                // constructing the id string for the cell to read from
                let idStringToFind =  `chassis-${element.chassisID}-${chassisArrayLocal[element.chassisID].ChassisItemsDict[j][0]}`
      
                debugMsg(generalValues, localDebugOn, 5, "readChassisConfig", 117, `[workload detail=${item}] looking up the DOM element id ${idStringToFind}`,0,0,0)
                const inputElement = documentMain.getElementById(idStringToFind)
                inputElement.checked = valTemp
              }
              break;

            default: {
              debugMsg(generalValues, localDebugOn, 5, "readChassisConfig", 124, `no valid statement found for ${item}`,0,0,0)
              displayMsg(documentMain, "readChassisConfig", 125, "error", `no valid statement found for ${item}`,0,0,0)
            }
          }
        }
        
      }
    }
        
  });

  console.log(`readChassisConfig() 63: loading chassis config file finished`)
}

export {installEventHandlerLoadChassisConfig,readChassisConfig}