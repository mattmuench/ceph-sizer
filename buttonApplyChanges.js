import applyAllChanges from "./applyAllChanges.js";
import dcConfigDetermineNumberOfServersInitially from "./dccalc/dcConfigDetermineNumberOfServersInitially.js";
import loadChassisConfigs from "./fileInput/loadChassisConfigs.js";
//
// install EventListeners for Apply Changes buttons
const buttonApplyChanges = function (documentMain, generalValues, workloadsArrayLocal, chassisArrayLocal, sizingConstraints, configsArrayLocal, tableHeaderResultingConfigsArray, resultsOverviewArrayLocal) {
   
    const clickedApplyChassisChanges = documentMain.getElementById("button-apply-chassis-changes")
    clickedApplyChassisChanges.addEventListener("click", (event) => {
        event.preventDefault()
        //console.log("got it")
        //const eventTarget = event.target.getAttribute("data-target")
        
        // Here, all the magic needs to be started with recalculation of any of the things.
        //const inputElement = documentMain.getElementById(`capacity-${eventTarget}-input`)
        console.log("buttonApplyChanges() 14: Recalculation after changes to chasis config should start now")
        applyAllChanges(documentMain, generalValues, workloadsArrayLocal,chassisArrayLocal, sizingConstraints, configsArrayLocal, tableHeaderResultingConfigsArray, resultsOverviewArrayLocal)
    })
    const clickedApplyCapacityChanges = documentMain.getElementById("button-apply-workloads-changes")
    clickedApplyCapacityChanges.addEventListener("click", (event) => {
        event.preventDefault()
        //console.log("got it")
        //const eventTarget = event.target.getAttribute("data-target")
        
        // Here, all the magic needs to be started with recalculation of any of the things.
        //const inputElement = documentMain.getElementById(`capacity-${eventTarget}-input`)
        console.log("buttonApplyChanges 25: Recalculation after changes to workloads should start now")
        applyAllChanges(documentMain, generalValues, workloadsArrayLocal,chassisArrayLocal, sizingConstraints, configsArrayLocal, tableHeaderResultingConfigsArray, resultsOverviewArrayLocal)
    })
    const clickedApplyChanges = documentMain.getElementById("button-apply-changes")
    clickedApplyChanges.addEventListener("click", (event) => {
        event.preventDefault()
        //console.log("got it")
        //const eventTarget = event.target.getAttribute("data-target")
        
        // Here, all the magic needs to be started with recalculation of any of the things.
        //const inputElement = documentMain.getElementById(`capacity-${eventTarget}-input`)
        console.log("buttonApplyChanges 36: Recalculation after changes should start now")
        applyAllChanges(documentMain, generalValues, workloadsArrayLocal,chassisArrayLocal, sizingConstraints, configsArrayLocal, tableHeaderResultingConfigsArray, resultsOverviewArrayLocal)
    })
    
    console.log(`buttonApplyChanges() 39: workloadsArray passed contains: ${workloadsArrayLocal}`)
    
    return 0
  }

  export default buttonApplyChanges