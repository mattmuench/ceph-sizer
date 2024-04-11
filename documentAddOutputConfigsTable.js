const documentAddOutputConfigsTable = function (documentMain, generalValuesLocal, rowBaseLabel, idLabel, columnsDictArray, rows) {
    
  const documentTable = documentMain.createElement("table")
  documentTable.setAttribute("id",`table-${idLabel}`)
  const documentTableBody = documentMain.createElement("tbody");

  //console.log(`list the columnDictArray object: ${columnsDictArray}`)
  const dataColumns = columnsDictArray.header.length
  //console.log(dataColumns)

  // creating all cells
  for (let i = 0; i <= rows; i++) {
    // creates a table row
    const row = documentMain.createElement("tr");
    if (i === 0) {
      for (let j = 0; j < dataColumns; j++) {
          // Create a <th> element and a text node, make the text
          // node the contents of the <th>, and put the <th> at
          // the end of the table row
          const cell = documentMain.createElement("th");
          const actualCell = columnsDictArray.header[j][0]
          //console.log(`check row ${j}: ${columnsDictArray.header[j][0]}`)
          //console.log(`check row ${j}: ${columnsDictArray.header[j][1]}`)
          
          cell.setAttribute("id",columnsDictArray.header[j][0])
          const cellText = documentMain.createTextNode(columnsDictArray.header[j][0]);

          cell.appendChild(cellText);
          row.appendChild(cell);
        }
    }
    else {  
      // Heads-up on row numbers: to allow for using 0...n for  IDs, the ID for
      //  the cell ID is derived from the row number but reduced by 1 => the first row
      //  is row=0 but the first entry is ID=0.
      for (let j = 0; j < dataColumns; j++) {
          // Die erste Spalte muss die ID nur haben und den Namen anzeigen.
          // Die weiteren Spalten muessen input fields werden.
        // Create a <td> element and a text node, make the text
        // node the contents of the <td>, and put the <td> at
        // the end of the table row
        const cell = documentMain.createElement("td");
        // cell.setAttribute("id",columnsDictArray.header[j][1])
        if (j === 0) {
          const cellText = documentMain.createTextNode(`${rowBaseLabel} ${i}`);
          cell.appendChild(cellText);
          row.appendChild(cell);
        }
        else {
          const cellElement = documentMain.createElement("td")
          cellElement.setAttribute("type","text")
          //cellElement.setAttribute("style","borderStyle: hidden")
          cellElement.setAttribute("style","border-style: hidden")
          //cellElement.setAttribute("style","border-left-style: hidden")
          //cellElement.setAttribute("style","border-right-style: hidden")
          cellElement.setAttribute("id",`${idLabel}-${i-1}-${columnsDictArray.header[j][1]}`)
          
          ///let spanElement = documentMain.createElement('span')
          ///spanElement.setAttribute("class","value")
          ///cellElement.appendChild(spanElement)
          // const cellText = documentMain.createTextNode(`cell in row ${i}, column ${j}`);
          
           cell.appendChild(cellElement);
          
        }
        // for debugging, show id of cell
        if (generalValuesLocal.globalDebug === true) {
          const cellLabel = documentMain.createElement("label")
          cellLabel.setAttribute("for",`${idLabel}-${i-1}-${columnsDictArray.header[j][1]}`)
          cellLabel.innerHTML = `[${idLabel}-${i-1}-${columnsDictArray.header[j][1]}]`
          cell.appendChild(cellLabel);
        }
        row.appendChild(cell);
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

export default documentAddOutputConfigsTable