class LoadedConfigs {
  constructor (
      chassisConfigFile, // holds the potential content of a chassis configuration file loaded manually by the user in order to load precreated (perhaps, their standard) chassis configurations
      workloadConfigFile
  )
  {
      this.chassisConfigFile = chassisConfigFile
      this.workloadConfigFile = workloadConfigFile
  }
  
}

const updateChassisConfig = function (documentMain, chassisArrayLocal, generalValues){
 
  // from applyAllChanges.js: 
  
    const inputToUpdate = documentMain.getElementById("input-filename-chassis-config")
    //let idStringToFind =  `chassis-${item.chassisID}-${entry[0]}`
    let idStringToFind =  `chassis-1-max-hdd-slots`
                //console.log(`updateChassisConfig() 92: [chassisID=${item}] looking up the DOM element id ${idStringToFind}`)
                //const inputElement = documentMain.getElementById(idStringToFind)
                //let outputSubString = "output-"
                //if (entry[0].includes(outputSubString)) {
                  //console.log(`updateChassisConfig() 96: [chassisID=${item}] skipping entry[0] for input which is output: ${entry[0]}`)
                //}
                //else {
                  //switch (entry[0]) {
                    //case "use-case": {
                      let rbs = document.getElementsByName(idStringToFind);
                      //chassisValues[item.chassisID][entry[1]] = rbs[i].value;
                      rbs.value=24
  }

export default LoadedConfigs;