import Chassis from "../Workload.js";
import displayMsg from "../common/displayMsg.js";

const installEventHandlerLoadWorkloadConfig = function (documentMain, workloadsArrayLocal, generalValues, loadedConfigsLocal) {

    // clear any previous messages
    const miscMess = documentMain.getElementById("misc-message")
    miscMess.innerText = `messages cleared`
    documentMain.getElementById("misc-message").appendChild(miscMess);
    const errorMess = documentMain.getElementById("error-message")
    errorMess.innerText = `messages cleared`
    documentMain.getElementById("error-message").appendChild(errorMess);

  // recognize button for loading presaved workload config definition file
  const clickedLoadWorkloadConfig = documentMain.getElementById("input-filename-workload-config")
  clickedLoadWorkloadConfig.addEventListener("change", (event) => {
      event.preventDefault()
      
      console.log("installEventHandlerLoadWorkloadConfig 10: Recalculation after loading new workload config should start now")
      const selectedFile = clickedLoadWorkloadConfig.files[0];
      console.log(`installEventHandlerLoadWorkloadConfig() 12 for input-filename-workload-config: changed filename to selectedFile=${selectedFile.name}`)
      
      const textFile = new Response(selectedFile).text()
      console.log(`installEventHandlerLoadWorkloadConfig() 15: textFile=${textFile}`)
      
      // LAST known good approach - all others didn't work to get the reading of the file content done and the following processing then in sync *after* the file contents is read
      const myret = logIngredientsWorkload(selectedFile,loadedConfigsLocal)

      const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
      wait(1000).then(() => {
          console.log(`installEventHandlerLoadWorkloadConfig() 22: entry of loadedConfigsLocal.workloadConfigFile=${loadedConfigsLocal.workloadConfigFile}`)
          readWorkloadConfig(documentMain, generalValues, loadedConfigsLocal, workloadsArrayLocal)          
        }
      );
    })
}

async function logIngredientsWorkload(selectedFile,loadedConfigsLocal) {
  const res = await new Response(selectedFile).text();
  console.log(`logIngredientsWorkload() 58: res=${res}`);
  loadedConfigsLocal.workloadConfigFile=res;
  console.log(`logIngredientsWorkload() 60: loadedConfigsLocal.workloadConfigFile=${loadedConfigsLocal.workloadConfigFile}`);
}

const readWorkloadConfig = function (documentMain, generalValues, loadedConfigsLocal, workloadsArrayLocal){
  console.log(`readWorkloadConfig() 39: loadedConfigsLocal.workloadConfigFile=${loadedConfigsLocal.workloadConfigFile}`)
  var loadedJsonChassisObject;
  try {
    loadedJsonChassisObject = JSON.parse(loadedConfigsLocal.workloadConfigFile); 
  } catch (e) {
    console.log("Error:", e.message)
    displayMsg(documentMain, "readWorkloadConfig", 43, "error", e.message,0,0,0)
  }
  loadedJsonChassisObject.workloadConfig.forEach(element => {
    if (element.workloadID >= generalValues.numberOfConfigsPossible) {
      console.log(`readWorkloadConfig() 46: ERROR - max number of configs possible is generalValues.numberOfConfigsPossible - check input file for workloadID`)
      displayMsg(documentMain, "readWorkloadConfig", 48, "error", "max number of configs possible is generalValues.numberOfConfigsPossible - check input file for workloadID",0,0,0)
    }
    else {
      const workloadsColumns = workloadsArrayLocal[element.workloadID].workloadItemsDict.length;
      console.log(`readWorkloadConfig() 50: dataColumns = ${workloadsColumns}`)
      
      for (let j = 0; j < workloadsColumns; j++) {
        const item = workloadsArrayLocal[element.workloadID].workloadItemsDict[j][1]
        console.log(`readWorkloadConfig() 54: working on item=${item}`)
        if (item == "workloadID") {
          console.log(`readWorkloadConfig() 55: ignoring since got it for processing already`)
        }
        else {
          switch (item){
            case "selectorArrayDC": {
              // this is a list of entries for each DC that will create a selector change
              for (let dc = 0; dc < generalValues.numberOfDCsPossible; dc++) {
                let valTemp = eval('element'+'.'+'members'+'.'+item+'['+dc+']')
                console.log(`readWorkloadConfig() 62: item=${item}, dc=${dc} = item value=${valTemp}`)

                // constructing the id string for the cell to read from
                let idStringToFind =  `workload-${element.workloadID}-${workloadsArrayLocal[element.workloadID].workloadItemsDict[j][0]}${dc}`

                console.log(`readWorkloadConfig() 68: [workload detail=${item}] looking up the DOM element id ${idStringToFind}`)
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
              console.log(`readWorkloadConfig() 84: item=${item} = item value=${valTemp}`)
              // constructing the id string for the cell to read from
              let idStringToFind =  `workload-${element.workloadID}-${workloadsArrayLocal[element.workloadID].workloadItemsDict[j][0]}`

              console.log(`readWorkloadConfig() 90: [workload detail=${item}] looking up the DOM element id ${idStringToFind}`)
              const inputElement = documentMain.getElementById(idStringToFind)
              inputElement.value = valTemp
            }
            break;
            
            case "useCase":
            {
              console.log(`readWorkloadConfig() 98: item=${item} = item - not yet implemented`)
              let valTemp = eval('element'+'.'+'members'+'.'+item)

                console.log(`readWorkloadConfig() 116: item=${item} = item value=${valTemp}`)
                // constructing the id string for the cell to read from
                let idStringToFind =  `workload-${element.workloadID}-${workloadsArrayLocal[element.workloadID].workloadItemsDict[j][0]}-${valTemp}`

                console.log(`readWorkloadConfig() 118: [workload detail=${item}] looking up the DOM element id ${idStringToFind}`)
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
                console.log(`readWorkloadConfig() 112: item=${item} = item value=${valTemp}`)

                // constructing the id string for the cell to read from
                let idStringToFind =  `workload-${element.workloadID}-${workloadsArrayLocal[element.workloadID].workloadItemsDict[j][0]}`

                console.log(`readWorkloadConfig() 118: [workload detail=${item}] looking up the DOM element id ${idStringToFind}`)
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
              console.log(`no valid statement found for ${item}`)
              displayMsg(documentMain, "readWorkloadConfig", 144, "error", `no valid statement found for ${item}`,0,0,0)
            }
                  
          }
        }
        console.log(`readWorkloadConfig() 60: actual workloadID=${element.workloadID} item=${item} set to:${workloadsArrayLocal[element.workloadID].item}`)  
      }
    }
        
  });

  console.log(`readWorkloadConfig() 63: loading workload config file finished`)
}

export {installEventHandlerLoadWorkloadConfig,readWorkloadConfig}