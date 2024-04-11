const userCalcConvertTiB = function (documentMain, generalValues) {
  // console.log("Inside convertTib")
  const documentElement = documentMain.getElementById("button-capacity-tib")
  
  documentElement.addEventListener("click", (event) => {
      event.preventDefault()
      //console.log("userCalcConvertTiB: got it")
      const eventTarget = event.target.getAttribute("data-target")
      const inputElement = documentMain.getElementById(`global-capacity-${eventTarget}-input`)
      generalValues.desiredCapacityInTiB = inputElement.value
      generalValues.convertTiBIntoTB(generalValues.desiredCapacityInTiB)
      const targetElement = documentMain.getElementById(eventTarget).querySelector(".value")
      targetElement.textContent = generalValues.desiredCapacityInTB
      // console.log(`userCalcConvertTiB(): input value ${generalSettings.desiredCapacityInTB}`)
  })
  return 0
}

export default userCalcConvertTiB