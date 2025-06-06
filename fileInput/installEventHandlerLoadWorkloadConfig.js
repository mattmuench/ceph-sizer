import Chassis from "../Workload.js";

const installEventHandlerLoadWorkloadConfig = function (documentMain, workloadsArrayLocal, generalValues, loadedConfigsLocal) {

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
      const myret = logIngredients(selectedFile,loadedConfigsLocal)

      const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
      wait(1000).then(() => {
          console.log(`installEventHandlerLoadWorkloadConfig() 22: entry of loadedConfigsLocal.workloadConfigFile=${loadedConfigsLocal.workloadConfigFile}`)
          readWorkloadConfig(documentMain, generalValues, loadedConfigsLocal, workloadsArrayLocal)          
        }
      );
    })
}

async function logIngredients(selectedFile,loadedConfigsLocal) {
  const res = await new Response(selectedFile).text();
  console.log(`logIngredients() 58: res=${res}`);
  loadedConfigsLocal.workloadConfigFile=res;
  console.log(`logIngredients() 60: loadedConfigsLocal.workloadConfigFile=${loadedConfigsLocal.workloadConfigFile}`);
}

const readWorkloadConfig = function (documentMain, generalValues, loadedConfigsLocal, workloadsArrayLocal){
  console.log(`readWorkloadConfig() 39: loadedConfigsLocal.workloadConfigFile=${loadedConfigsLocal.workloadConfigFile}`)
  var loadedJsonChassisObject;
  try {
    loadedJsonChassisObject = JSON.parse(loadedConfigsLocal.workloadConfigFile); 
  } catch (e) {
    console.log("Error:", e.message)
  }
  loadedJsonChassisObject.workloadConfig.forEach(element => {
    if (element.workloadID >= generalValues.numberOfConfigsPossible) {
      console.log(`readWorkloadConfig() 46: ERROR - max number of configs possible is generalValues.numberOfConfigsPossible - check input file for workloadID`)
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
                let val6 = eval('element'+'.'+'members'+'.'+item+'['+dc+']')
                if (val6 == true){
                console.log(`readWorkloadConfig() 62: item=${item}, dc=${dc} = item value=${val6}`)
                ////workloadsArrayLocal[element.workloadID].item = val6;
                // constructing the id string for the cell to read from
                let idStringToFind =  `workload-${element.workloadID}-${workloadsArrayLocal[element.workloadID].workloadItemsDict[j][0]}${dc}`

                console.log(`readWorkloadConfig() 68: [workload detail=${item}] looking up the DOM element id ${idStringToFind}`)
                const inputElement = documentMain.getElementById(idStringToFind)
                inputElement.checked=true
              }
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
              let val5 = eval('element'+'.'+'members'+'.'+item)
              console.log(`readWorkloadConfig() 84: item=${item} = item value=${val5}`)
              //workloadArrayTemp[element.workloadID].item = val5;
              workloadsArrayLocal[element.workloadID].item = val5;
              // constructing the id string for the cell to read from
              let idStringToFind =  `workload-${element.workloadID}-${workloadsArrayLocal[element.workloadID].workloadItemsDict[j][0]}`

              console.log(`readWorkloadConfig() 90: [workload detail=${item}] looking up the DOM element id ${idStringToFind}`)
              const inputElement = documentMain.getElementById(idStringToFind)
              inputElement.setAttribute('value',workloadsArrayLocal[element.workloadID].item)
            }
            break;
            
            case "useCase":
            {
              console.log(`readWorkloadConfig() 98: item=${item} = item - not yet implemented`)
              let val5 = eval('element'+'.'+'members'+'.'+item)
              let selectorPosition = 0;
              /**
              switch (workloadsArrayLocal[element.workloadID].item) {
                case "rbd":           selectorPosition=0; break;
                case "rgwdata":       selectorPosition=1; break;
                case "filedata":      selectorPosition=2; break;
                case "filemetadata":  selectorPosition=3; break;
                case "iscsi":         selectorPosition=4; break;
              }
               */
                console.log(`readWorkloadConfig() 112: item=${item} = item value=${val5}`)
                //workloadArrayTemp[element.workloadID].item = val5;
                workloadsArrayLocal[element.workloadID].item = val5;
                console.log(`readWorkloadConfig() 116: item=${item} = item value=${workloadsArrayLocal[element.workloadID].item}`)
                // constructing the id string for the cell to read from
                let idStringToFind =  `workload-${element.workloadID}-${workloadsArrayLocal[element.workloadID].workloadItemsDict[j][0]}-${val5}`

                console.log(`readWorkloadConfig() 118: [workload detail=${item}] looking up the DOM element id ${idStringToFind}`)
                const inputElement = documentMain.getElementById(idStringToFind)
                //inputElement.setAttribute('value',workloadsArrayLocal[element.workloadID].item)
                //inputElement.setAttribute("id",`${idLabel}-${i-1}-${columnsDictArray.header[j][1]}-${radioSelector}`)
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
                let val5 = eval('element'+'.'+'members'+'.'+item)
                console.log(`readWorkloadConfig() 112: item=${item} = item value=${val5}`)
                //workloadArrayTemp[element.workloadID].item = val5;
                workloadsArrayLocal[element.workloadID].item = val5;
                // constructing the id string for the cell to read from
                let idStringToFind =  `workload-${element.workloadID}-${workloadsArrayLocal[element.workloadID].workloadItemsDict[j][0]}`

                console.log(`readWorkloadConfig() 118: [workload detail=${item}] looking up the DOM element id ${idStringToFind}`)
                const inputElement = documentMain.getElementById(idStringToFind)
                inputElement.setAttribute('value',workloadsArrayLocal[element.workloadID].item)
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
              console.log(`no valid statement found for ${elementType}`)
            }
                  
          }
          /**
          if (item == "selectorArrayDC") {
            // this is a list of entries for each DC that will create a selector change
            for (let dc = 0; dc < generalValues.numberOfDCsPossible; dc++) {
              let val6 = eval('element'+'.'+'members'+'.'+item+'.'+dc)
              console.log(`readWorkloadConfig() 56: item=${item}, dc=${dc} = item value=${val6}`)
              ////workloadsArrayLocal[element.workloadID].item = val6;
              // constructing the id string for the cell to read from
              let idStringToFind =  `workload-${element.workloadID}-${workloadsArrayLocal[element.workloadID].workloadItemsDict[j][0]}${dc}`

              console.log(`readWorkloadConfig() 99: [workload detail=${item}] looking up the DOM element id ${idStringToFind}`)
              const inputElement = documentMain.getElementById(idStringToFind)
              inputElement.setAttribute('value',val6)
            }
          }
          else {
            let val5 = eval('element'+'.'+'members'+'.'+item)
            console.log(`readWorkloadConfig() 56: item=${item} = item value=${val5}`)
            //workloadArrayTemp[element.workloadID].item = val5;
            workloadsArrayLocal[element.workloadID].item = val5;
            // constructing the id string for the cell to read from
            let idStringToFind =  `workload-${element.workloadID}-${workloadsArrayLocal[element.workloadID].workloadItemsDict[j][0]}`

            console.log(`readWorkloadConfig() 99: [workload detail=${item}] looking up the DOM element id ${idStringToFind}`)
            const inputElement = documentMain.getElementById(idStringToFind)
            inputElement.setAttribute('value',workloadsArrayLocal[element.workloadID].item)
          }
           */
        }
        console.log(`readWorkloadConfig() 60: actual workloadID=${element.workloadID} item=${item} set to:${workloadsArrayLocal[element.workloadID].item}`)  
      }
    }
        
  });

  console.log(`readWorkloadConfig() 63: loading workload config file finished`)
}

export {installEventHandlerLoadWorkloadConfig,readWorkloadConfig}