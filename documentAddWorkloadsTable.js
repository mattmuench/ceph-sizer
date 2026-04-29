import {debugMsg} from "./common/debug.js";

const documentAddWorkloadsTable = function (documentMain, generalValues, rowBaseLabel, idLabel, dataRows, columnsDictArray) {

  let localDebugOn = false
    
  const documentTable = documentMain.createElement("table")
  documentTable.setAttribute("id",`table-${idLabel}`)
  const documentTableBody = documentMain.createElement("tbody");

  const dataColumns = columnsDictArray.header.length

  // creating all cells
  for (let i = 0; i <= dataRows; i++) {
    // creates a table row
    const row = documentMain.createElement("tr");
    if (i === 0) {
      for (let j = 0; j < dataColumns; j++) {
          // Create a <th> element and a text node, make the text
          // node the contents of the <th>, and put the <th> at
          // the end of the table row
          const cell = documentMain.createElement("th");
          const actualCell = columnsDictArray.header[j][0]
          
          cell.setAttribute("id",columnsDictArray.header[j][0])
          const cellText = documentMain.createTextNode(columnsDictArray.header[j][0]);

          cell.appendChild(cellText);
          row.appendChild(cell);
        }
    }
    else {  
      // Heads-up on row numbers: to allow for using 0...n for workload IDs, the ID for
      //  the cell ID is derived from the row number but reduced by 1 => the first row
      //  is row=0 but the first workload is workloadID=0.
      for (let j = 0; j < dataColumns; j++) {
          // The first column must only have the ID and show the name.
          // All other columns will become either input fields (text, radio, check bos)
        // Create a <td> element and a text node, make the text
        // node the contents of the <td>, and put the <td> at
        // the end of the table row
        const cell = documentMain.createElement("td");
        cell.setAttribute("id",columnsDictArray.header[j][1])
        if (j === 0) {
          const cellText = documentMain.createTextNode(`${rowBaseLabel} ${i}`);
          cell.appendChild(cellText);
          row.appendChild(cell);
        }
        else {
          let elementType = columnsDictArray.header[j][2]
          debugMsg(generalValues, localDebugOn, 5, "documentAddWorkloadsTable", 51, `running switch on element: ${elementType}`,0,0,0)
          switch (elementType) {
              case "input": {
                      const cellElement = documentMain.createElement("input")
                      cellElement.setAttribute("type","text")
                      cellElement.setAttribute("id",`${idLabel}-${i-1}-${columnsDictArray.header[j][1]}`)
                      // const cellText = documentMain.createTextNode(`cell in row ${i}, column ${j}`);
                      cell.appendChild(cellElement);
                  }
                  break;
              case "output": {
                      /// Note: the following (perhaps commented) lines uses the real row number - not the data row number
                      //const cellElement = documentMain.createTextNode(`output-${i}-${columnsDictArray.header[j][1]}`);
                      const cellElement = documentMain.createTextNode(`-`);
                      //cellElement.setAttribute("id",`${idLabel}-${i}-${columnsDictArray.header[j][1]}`)
                      cell.appendChild(cellElement);
                  }
                  break;
              case "radio": {
                      let firstEntry = 0
                      columnsDictArray.header[j][3].forEach( (radioSelector) => {
                      // set the first entry to default selection
                       
                        // console
                          debugMsg(generalValues, localDebugOn, 5, "documentAddWorkloadsTable", 76, `radioSelector=${radioSelector}`,0,0,0)
                            
                          const cellElement = documentMain.createElement("input")
                          cellElement.setAttribute("type","radio")
                          cellElement.setAttribute("name",`${idLabel}-${i-1}-${columnsDictArray.header[j][1]}`)
                          cellElement.setAttribute("value",`${radioSelector}`)
                          cellElement.setAttribute("id",`${idLabel}-${i-1}-${columnsDictArray.header[j][1]}-${radioSelector}`)
                          if (firstEntry === 0) {
                            cellElement.setAttribute("checked",true)
                            firstEntry = false
                          }
                            
                          cell.appendChild(cellElement);
                          // finish this one first before continuing with the label
                          const cellLabel = documentMain.createElement("label")
                          cellLabel.setAttribute("for",`${idLabel}-${i-1}-${columnsDictArray.header[j][1]}`)
                          cellLabel.innerHTML = radioSelector + "<br>"
                          cell.appendChild(cellLabel);
                      })
                      //let selectLabel = document.getElementById(`${idLabel}-${i-1}-${columnsDictArray.header[j][1]}`)                            
                        
                  }
                  break;
              case "checkbox": {                                              
                  debugMsg(generalValues, localDebugOn, 5, "documentAddWorkloadsTable", 100, `Working on checkbox: ${idLabel}-${i-1}-${columnsDictArray.header[j][1]}`,0,0,0)
                    
                  const cellElement = documentMain.createElement("input")
                      cellElement.setAttribute("type","checkbox")
                      //cellElement.setAttribute("name",`${idLabel}-${i-1}-${columnsDictArray.header[j][1]}`)
                        
                      cellElement.setAttribute("id",`${idLabel}-${i-1}-${columnsDictArray.header[j][1]}`)
                      cell.appendChild(cellElement); 
                      //let selectLabel = document.getElementById(`${idLabel}-${i-1}-${columnsDictArray.header[j][1]}`)                            
                  }
                  break;
              default:
                  displayMsg(document, "documentAddWorkloadsTable", 112, "error", `no valid statement found for ${elementType}`,0,0,0)
          }

          // for debugging, show id of cell
          if (generalValues.globalDebug === true) {
              const cellLabel = documentMain.createElement("label")
              cellLabel.setAttribute("for",`${idLabel}-${i-1}-${columnsDictArray.header[j][1]}`)
              cellLabel.innerHTML = `[${idLabel}-${i-1}-${columnsDictArray.header[j][1]}]`
              cell.appendChild(cellLabel);
          }
          // apply all document elements
          row.appendChild(cell);  
        }
      }
    }
  
    // add the row to the end of the table body
    documentTableBody.appendChild(row);
  }
  
  // put the <tbody> in the <table>
  documentTable.appendChild(documentTableBody);
  // appends <table> into <body>
  documentMain.body.appendChild(documentTable);
  // sets the border attribute of documentTable to '1'
  documentTable.setAttribute("border", "1");
}

export default documentAddWorkloadsTable