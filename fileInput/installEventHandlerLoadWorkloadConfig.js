import Chassis from "../Workload.js";
import displayMsg from "../common/displayMsg.js";
import {debugMsg} from "../common/debug.js";

const installEventHandlerLoadWorkloadConfig = function (documentMain, workloadsArrayLocal, generalValues, loadedConfigsLocal) {

  let localDebugOn = true

  // recognize button for loading presaved workload config definition file
  const clickedLoadWorkloadConfig = documentMain.getElementById("input-filename-workload-config")
  clickedLoadWorkloadConfig.addEventListener("change", (event) => {
      event.preventDefault()
      
      debugMsg(generalValues, localDebugOn, 5, "installEventHandlerLoadWorkloadConfig", 14, `Recalculation after loading new workload config should start now`,0,0,0)
      const selectedFile = clickedLoadWorkloadConfig.files[0];
      debugMsg(generalValues, localDebugOn, 5, "installEventHandlerLoadWorkloadConfig", 16, `for input-filename-workload-config: changed filename to selectedFile=${selectedFile.name}`,0,0,0)
      
      const textFile = new Response(selectedFile).text()
      debugMsg(generalValues, localDebugOn, 5, "installEventHandlerLoadWorkloadConfig", 19, `textFile=${textFile}`,0,0,0)
      
      // LAST known good approach - all others didn't work to get the reading of the file content done and the following processing then in sync *after* the file contents is read
      const myret = logIngredientsWorkload(generalValues, localDebugOn, selectedFile,loadedConfigsLocal)

      const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
      wait(1000).then(() => {
          debugMsg(generalValues, localDebugOn, 5, "installEventHandlerLoadWorkloadConfig", 26, `entry of loadedConfigsLocal.workloadConfigFile=${loadedConfigsLocal.workloadConfigFile}`,0,0,0)
          readWorkloadConfig(generalValues, localDebugOn, documentMain, loadedConfigsLocal, workloadsArrayLocal)          
        }
      );

      event.target.value = '';
      
    })
}

async function logIngredientsWorkload(generalValues, localDebugOn, selectedFile,loadedConfigsLocal) {

  localDebugOn = true

  const res = await new Response(selectedFile).text();
  debugMsg(generalValues, localDebugOn, 5, "logIngredientsWorkload", 35, `res=${res}`,0,0,0)
  loadedConfigsLocal.workloadConfigFile=res;
  debugMsg(generalValues, localDebugOn, 5, "logIngredientsWorkload", 38, `loadedConfigsLocal.workloadConfigFile=${loadedConfigsLocal.workloadConfigFile}`,0,0,0)
}

const readWorkloadConfig = function (generalValues, localDebugOn, documentMain, loadedConfigsLocal, workloadsArrayLocal){

  localDebugOn = true

  debugMsg(generalValues, localDebugOn, 5, "readWorkloadConfig", 41, `loadedConfigsLocal.workloadConfigFile=${loadedConfigsLocal.workloadConfigFile}`,0,0,0)
  var loadedJsonChassisObject;
  try {
    loadedJsonChassisObject = JSON.parse(loadedConfigsLocal.workloadConfigFile); 
  } catch (e) {
    debugMsg(generalValues, localDebugOn, 5, "readWorkloadConfig", 46, `Error:, e.message=${e.message}`,0,0,0)
    displayMsg(documentMain, "readWorkloadConfig", 47, "error", e.message,0,0,0)
  }
  loadedJsonChassisObject.workloadConfig.forEach(element => {
    if (element.workloadID >= generalValues.numberOfConfigsPossible) {
      debugMsg(generalValues, localDebugOn, 5, "readWorkloadConfig", 51, `ERROR - max number of configs possible is generalValues.numberOfConfigsPossible - check input file for workloadID`,0,0,0)
      displayMsg(documentMain, "readWorkloadConfig", 52, "error", "max number of configs possible is generalValues.numberOfConfigsPossible - check input file for workloadID",0,0,0)
    }
    else {
      const workloadsColumns = workloadsArrayLocal[element.workloadID].workloadItemsDict.length;
      debugMsg(generalValues, localDebugOn, 5, "readWorkloadConfig", 56, `dataColumns = ${workloadsColumns}`,0,0,0)
      
      for (let j = 0; j < workloadsColumns; j++) {
        const item = workloadsArrayLocal[element.workloadID].workloadItemsDict[j][1]
        debugMsg(generalValues, localDebugOn, 5, "readWorkloadConfig", 60, `working on item=${item}`,0,0,0)
        if (item == "workloadID") {
          debugMsg(generalValues, localDebugOn, 5, "readWorkloadConfig", 62, `ignoring since got it for processing already`,0,0,0)
        }
        else {
          switch (item){
            case "selectorArrayDC": {
              // this is a list of entries for each DC that will create a selector change
              for (let dc = 0; dc < generalValues.numberOfDCsPossible; dc++) {
                let valTemp = eval('element'+'.'+'members'+'.'+item+'['+dc+']')
                debugMsg(generalValues, localDebugOn, 5, "readWorkloadConfig", 70, `item=${item}, dc=${dc} = item value=${valTemp}`,0,0,0)

                // constructing the id string for the cell to read from
                let idStringToFind =  `workload-${element.workloadID}-${workloadsArrayLocal[element.workloadID].workloadItemsDict[j][0]}${dc}`

                debugMsg(generalValues, localDebugOn, 5, "readWorkloadConfig", 75, `[workload detail=${item}] looking up the DOM element id ${idStringToFind}`,0,0,0)
                const inputElement = documentMain.getElementById(idStringToFind)
                inputElement.checked=valTemp
              }
            }
            break;

            case "reqCapacityNet":
            case "reqFlashPercent":
            case "reqNumReplica":
            case "reqNumberFd":
            case "sizeAvgObj":
            case "sizeAvgFile":
            case "RGWLifecycleNumVersions":
            {
              let valTemp = eval('element'+'.'+'members'+'.'+item)
              debugMsg(generalValues, localDebugOn, 5, "readWorkloadConfig", 91, `item=${item} = item value=${valTemp}`,0,0,0)
              // constructing the id string for the cell to read from
              let idStringToFind =  `workload-${element.workloadID}-${workloadsArrayLocal[element.workloadID].workloadItemsDict[j][0]}`

              debugMsg(generalValues, localDebugOn, 5, "readWorkloadConfig", 95, `[workload detail=${item}] looking up the DOM element id ${idStringToFind}`,0,0,0)
              const inputElement = documentMain.getElementById(idStringToFind)
              inputElement.value = valTemp
            }
            break;
            
            case "useCase":
            {
              debugMsg(generalValues, localDebugOn, 5, "readWorkloadConfig", 103, `item=${item} = item - not yet implemented`,0,0,0)
              let valTemp = eval('element'+'.'+'members'+'.'+item)

                debugMsg(generalValues, localDebugOn, 5, "readWorkloadConfig", 106, `item=${item} = item value=${valTemp}`,0,0,0)
                // constructing the id string for the cell to read from
                let idStringToFind =  `workload-${element.workloadID}-${workloadsArrayLocal[element.workloadID].workloadItemsDict[j][0]}-${valTemp}`

                debugMsg(generalValues, localDebugOn, 5, "readWorkloadConfig", 110, `[workload detail=${item}] looking up the DOM element id ${idStringToFind}`,0,0,0)
                const inputElement = documentMain.getElementById(idStringToFind)
                inputElement.checked=true
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
                debugMsg(generalValues, localDebugOn, 5, "readWorkloadConfig", 127, `item=${item} = item value=${valTemp}`,0,0,0)

                // constructing the id string for the cell to read from
                let idStringToFind =  `workload-${element.workloadID}-${workloadsArrayLocal[element.workloadID].workloadItemsDict[j][0]}`

                debugMsg(generalValues, localDebugOn, 5, "readWorkloadConfig", 131, `[workload detail=${item}] looking up the DOM element id ${idStringToFind}`,0,0,0)
                const inputElement = documentMain.getElementById(idStringToFind)
                inputElement.checked = valTemp
              }
            break;

            case "sumNumberDC":
            case "checkNumDC":
            case "checkInputDC":
            case "checkArrayMinServersDC":
              {
                // value ignored - output only
              }
            break;

            default: {
              debugMsg(generalValues, localDebugOn, 5, "readWorkloadConfig", 47, `no valid statement found for ${item}`,0,0,0)
              displayMsg(documentMain, "readWorkloadConfig", 148, "error", `no valid statement found for ${item}`,0,0,0)
            }
                  
          }
        }
        debugMsg(generalValues, localDebugOn, 5, "readWorkloadConfig", 153, `actual workloadID=${element.workloadID} item=${item} set to:${workloadsArrayLocal[element.workloadID].item}`,0,0,0)
      }
    }
        
  });

  debugMsg(generalValues, localDebugOn, 5, "readWorkloadConfig", 159, `loading workload config file finished`,0,0,0)
}

export {installEventHandlerLoadWorkloadConfig,readWorkloadConfig}