/**
 * Read config for chassis array from local file.
 * 
 * In order to avoid manual uploading configurations every time the browser reloads the page, a local file can be specified.
 * 
 * The file can be created manually as per example file.
 * 
 * The file can be created based on manual input exported to a local file. This can be reused as it is - or could be the base for 
 * changed chassis configurations.
 * 
 * EPIC: 
 * 1) As a user, I want to read a file containing prepared configuration for chassis types to 
 *    be used in the chassis config table as input to the calculation.
 * 
 * 2) As a user, I want to save my changed chassis configuration to a local file.
 * 
 * 3) As a user, I want to pick a file from a URL containing prepared configuration for 
 *    chassis types to be used in the chassis config table as input to the calculation.
 * 
 * 4) As a user, I want to select which inputs will be actually replaced in the table(s) when 
 *    I read a file containing prepared configuration for chassis types, price tags for h/w 
 *    elements referenced, etc., to be used in the chassis config table as input to the 
 *    calculation.
 */

/**
 * Implementation idea (for now):
 * - provide a button for file read selection (https://developer.mozilla.org/en-US/docs/Web/API/File_API/Using_files_from_web_applications; https://www.freecodecamp.org/news/upload-files-with-javascript/)
 * - read the file into memory as an array (https://developer.mozilla.org/en-US/docs/Web/API/FileReader/readAsArrayBuffer)
 * - the file must have a matching format to be able to read it as an array
 * 
 */