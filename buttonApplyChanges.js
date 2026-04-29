import displayMsg from "../common/displayMsg.js"
import {debugMsg} from "../common/debug.js";

import applyAllChanges from "./applyAllChanges.js";
//
// install EventListeners for Apply Changes buttons
const buttonApplyChanges = function (documentMain, generalValues, workloadsArrayLocal, chassisArrayLocal, sizingConstraints, configsArrayLocal, tableHeaderResultingConfigsArray, resultsOverviewArrayLocal) {
  let localDebugOn = false

    const clickedApplyChassisChanges = documentMain.getElementById("button-apply-chassis-changes")
    clickedApplyChassisChanges.addEventListener("click", (event) => {
        event.preventDefault()
        //console.log("got it")
        //const eventTarget = event.target.getAttribute("data-target")
        
        // Here, all the magic needs to be started with recalculation of any of the things.
        //const inputElement = documentMain.getElementById(`capacity-${eventTarget}-input`)
        debugMsg(generalValues, localDebugOn, 5, "buttonApplyChanges", 18, `Recalculation after changes to chasis config should start now`,0,0,0)
        applyAllChanges(documentMain, generalValues, workloadsArrayLocal,chassisArrayLocal, sizingConstraints, configsArrayLocal, tableHeaderResultingConfigsArray, resultsOverviewArrayLocal)
    })
    const clickedApplyCapacityChanges = documentMain.getElementById("button-apply-workloads-changes")
    clickedApplyCapacityChanges.addEventListener("click", (event) => {
        event.preventDefault()
        //console.log("got it")
        //const eventTarget = event.target.getAttribute("data-target")
        
        // Here, all the magic needs to be started with recalculation of any of the things.
        //const inputElement = documentMain.getElementById(`capacity-${eventTarget}-input`)
        debugMsg(generalValues, localDebugOn, 5, "buttonApplyChanges", 29, `Recalculation after changes to workloads should start now`,0,0,0)
        applyAllChanges(documentMain, generalValues, workloadsArrayLocal,chassisArrayLocal, sizingConstraints, configsArrayLocal, tableHeaderResultingConfigsArray, resultsOverviewArrayLocal)
    })
    const clickedApplyChanges = documentMain.getElementById("button-apply-changes")
    clickedApplyChanges.addEventListener("click", (event) => {
        event.preventDefault()
        //console.log("got it")
        //const eventTarget = event.target.getAttribute("data-target")
        
        // Here, all the magic needs to be started with recalculation of any of the things.
        //const inputElement = documentMain.getElementById(`capacity-${eventTarget}-input`)
        debugMsg(generalValues, localDebugOn, 5, "buttonApplyChanges", 40, `Recalculation after changes should start now`,0,0,0)
        applyAllChanges(documentMain, generalValues, workloadsArrayLocal,chassisArrayLocal, sizingConstraints, configsArrayLocal, tableHeaderResultingConfigsArray, resultsOverviewArrayLocal)
    })
    
    debugMsg(generalValues, localDebugOn, 5, "buttonApplyChanges", 44, `workloadsArray passed contains: ${workloadsArrayLocal}`,0,0,0)
    
    return 0
  }

  export default buttonApplyChanges