import displayMsg from "../common/displayMsg.js"
import {debugMsg} from "../common/debug.js";
import generalValues from "../GeneralValues.js"

//import loadChassisConfigs from "./loadChassisConfigs.js";
import Chassis from "../Chassis.js";

const installEventHandlerLoadChassisConfig = function (documentMain, chassisArrayLocal, generalValues, loadedConfigsLocal) {
  let localDebugOn = false

  // recognize button for loading presaved chassis config definition file
  const clickedLoadChassisConfig = documentMain.getElementById("input-filename-chassis-config")
  clickedLoadChassisConfig.addEventListener("change", (event) => {
      event.preventDefault()
      
      debugMsg(generalValues, localDebugOn, 5, "installEventHandlerLoadChassisConfig", 16, `Recalculation after loading new chassis config should start now`,0,0,0)
      const selectedFile = clickedLoadChassisConfig.files[0];
      debugMsg(generalValues, localDebugOn, 5, "installEventHandlerLoadChassisConfig", 18, `changed filename to selectedFile=${selectedFile.name}`,0,0,0)
      
      const textFile = new Response(selectedFile).text()
      debugMsg(generalValues, localDebugOn, 5, "installEventHandlerLoadChassisConfig", 21, `textFile=${textFile}`,0,0,0)
      
      // LAST known good approach - all others didn't work to get the reading of the file content done and the following processing then in sync *after* the file contents is read
      const myret = logIngredients(selectedFile,loadedConfigsLocal)

      const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
      wait(1000).then(() => {
          debugMsg(generalValues, localDebugOn, 5, "installEventHandlerLoadChassisConfig", 28, `entry of loadedConfigsLocal.chassisConfigFile=${loadedConfigsLocal.chassisConfigFile}`,0,0,0)
          readChassisConfig(documentMain, generalValues, loadedConfigsLocal, chassisArrayLocal)          
        }
      );
    })
}

async function logIngredients(selectedFile,loadedConfigsLocal) {
  let localDebugOn = false

  const res = await new Response(selectedFile).text();
  debugMsg(generalValues, localDebugOn, 5, "logIngredients", 39, `res=${res}`,0,0,0);
  loadedConfigsLocal.chassisConfigFile=res;
  debugMsg(generalValues, localDebugOn, 5, "logIngredients", 41, `loadedConfigsLocal.chassisConfigFile=${loadedConfigsLocal.chassisConfigFile}`,0,0,0);
}

const readChassisConfig = function (documentMain, generalValues, loadedConfigsLocal, chassisArrayLocal){
  let localDebugOn = false
  
  debugMsg(generalValues, localDebugOn, 5, "readChassisConfig", 47, `loadedConfigsLocal.chassisConfigFile=${loadedConfigsLocal.chassisConfigFile}`,0,0,0)
  var loadedJsonChassisObject;
  try {
    loadedJsonChassisObject = JSON.parse(loadedConfigsLocal.chassisConfigFile); 
  } catch (e) {
    debugMsg(generalValues, localDebugOn, 5, "readChassisConfig", 52, `${e.message}`,0,0,0)
    displayMsg(documentMain, "readChassisConfig", 53, "error", e.message,0,0,0)
  }
  loadedJsonChassisObject.chassisConfig.forEach(element => {
    if (element.chassisID >= generalValues.numberOfConfigsPossible) {
      debugMsg(generalValues, localDebugOn, 5, "readChassisConfig", 57, `ERROR - max number of configs possible is generalValues.numberOfConfigsPossible - check input file for chassisID`,0,0,0)
      displayMsg(documentMain, "readChassisConfig", 58, "error", "max number of configs possible is generalValues.numberOfConfigsPossible - check input file for chassisID",0,0,0)
    }
    else {
      const dataColumns = chassisArrayLocal[element.chassisID].ChassisItemsDict.length;
      debugMsg(generalValues, localDebugOn, 5, "readChassisConfig", 62, `dataColumns = ${dataColumns}`,0,0,0)
      
      for (let j = 0; j < dataColumns; j++) {
        const item = chassisArrayLocal[element.chassisID].ChassisItemsDict[j][1]
        if (item == "chassisID") {
          debugMsg(generalValues, localDebugOn, 5, "readChassisConfig", 67, `ignoring chassisID since got it for processing already`,0,0,0)
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
                case "ssdToNVMe3":
                case "sizeNVMe3":
                case "useSSD4overNVMe4":
                case "hddToSSD4":
                case "sizeSSD4":
                case "ssdToNVMe5":
                case "nvmeToNVMe7":
                case "nvmeToNVMe8":
                {
                  let valTemp = eval('element'+'.'+'members'+'.'+item)
                  debugMsg(generalValues, localDebugOn, 5, "readChassisConfig", 103, `item=${item} = item value=${valTemp}`,0,0,0)
                  // constructing the id string for the cell to read from
                  let idStringToFind =  `chassis-${element.chassisID}-${chassisArrayLocal[element.chassisID].ChassisItemsDict[j][0]}`
          
                  debugMsg(generalValues, localDebugOn, 5, "readChassisConfig", 107, `[workload detail=${item}] looking up the DOM element id ${idStringToFind}`,0,0,0)
                  const inputElement = documentMain.getElementById(idStringToFind)
                  inputElement.value = valTemp
                }
                break;
          
                case "useNVMe8": 
                case "useNVMe7":
                case "useNVMe3":
                case "useRGWCaching":
                case "useSSD4overNVMe4":
                  {
                    let valTemp = eval('element'+'.'+'members'+'.'+item)
                    debugMsg(generalValues, localDebugOn, 5, "readChassisConfig", 120, `item=${item} = item value=${valTemp}`,0,0,0)
          
                    // constructing the id string for the cell to read from
                    let idStringToFind =  `chassis-${element.chassisID}-${chassisArrayLocal[element.chassisID].ChassisItemsDict[j][0]}`
          
                    debugMsg(generalValues, localDebugOn, 5, "readChassisConfig", 125, `[workload detail=${item}] looking up the DOM element id ${idStringToFind}`,0,0,0)
                    const inputElement = documentMain.getElementById(idStringToFind)
                    inputElement.checked = valTemp
                  }
                break;
          
                default: {
                  debugMsg(generalValues, localDebugOn, 5, "readChassisConfig", 132, `no valid statement found for ${item}`,0,0,0)
                  displayMsg(documentMain, "readChassisConfig", 133, "error", `no valid statement found for ${item}`,0,0,0)
                }
              }
        }
      }
    }
  });

  debugMsg(generalValues, localDebugOn, 5, "readChassisConfig", 141, `loading chassis config file finished`,0,0,0)
}

export {installEventHandlerLoadChassisConfig,readChassisConfig}