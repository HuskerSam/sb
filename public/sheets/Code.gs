function onOpen() {
  let ui = SpreadsheetApp.getUi();

  ui.createAddonMenu()
    .addItem('Catalog Utilities', 'showPublishWeb')
    .addToUi();
}

function refreshOAuth() {
  PropertiesService.getScriptProperties().setProperty("accessToken", ScriptApp.getOAuthToken());
  return;
}

function showPublishWeb() {
  refreshOAuth();
  var html = HtmlService.createHtmlOutputFromFile('publish')
    .setTitle('Catalog Utilities')
  SpreadsheetApp.getUi().showSidebar(html);
}

function JSONArrayMax(jsonArray) {
  let arr = JSON.parse(jsonArray);

  let max = 0;
  arr.forEach(item => {
    if (item > max)
      max = item;
  });

  return max;
}

function JSONArraysToCells(jsonArrays) {
  let dataList = JSON.parse(jsonArrays);
  let outList = [];

  dataList.forEach(item => {
    outList.push(JSON.stringify(item));
  });
  return outList;
}

function JSONArrayToPipeData(jsonArray, maxValue) {
  let arr = JSON.parse(jsonArray);

  let outString = '';
  arr.forEach(item => {
    let outValue = item / maxValue * 100.0;
    outString += outValue.toFixed(0) + '|';
  });

  outString = outString.substr(0, outString.length - 1);
  return outString;
}

function mergeCSVRangeStrings(rows, jsonResults = false) {
  var ranges = [];
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  if (!Array.isArray(rows))
    rows =  [rows ];
  for (var rowIndex = 0; rowIndex < rows.length; rowIndex++) {
    let rangeDesc = rows[rowIndex].toString();

    try {
      let wb = rangeDesc.indexOf('||||');

      if (wb === -1) {
        ranges.push(ss.getRange(rangeDesc).getValues());
      } else {
        let parts = rangeDesc.split('||||');

        let r = _fetchRemoteRange(parts[0], parts[1]);
        ranges.push(r.values);
      }
     } catch (e) {
       return 'Error with : ' + rows[rowIndex] + ' ' + e.message;
     }
  }

  return _mergeCSVRanges(ranges, jsonResults);
}

function _fetchRemoteRange(spreadsheetId, rangeName) {
  var accessToken = PropertiesService.getScriptProperties().getProperty("accessToken");
  var url = "https://sheets.googleapis.com/v4/spreadsheets/" + spreadsheetId + "/values/" + rangeName;
  var res = UrlFetchApp.fetch(url, {headers: {"Authorization": "Bearer " + accessToken}});
  var range = JSON.parse(res.getContentText());
  return range;
}

function mergeCSVRanges() {
  return _mergeCSVRanges(arguments);
}

function _mergeCSVRanges(rangeArray, jsonResults = false) {
  var allColumns = {};
  var processedRows = [];
  for (var rangeIndex = 0; rangeIndex < rangeArray.length; rangeIndex++) {
    var rows = rangeArray[rangeIndex];
    var cellHeaders = [];
    for (var rowIndex = 0; rowIndex < rows.length; rowIndex++) {
      var cells = rows[rowIndex];
      var outRow = {};
      for (var cellIndex = 0; cellIndex < cells.length; cellIndex++) {
        var cell = cells[cellIndex];
        if (rowIndex == 0) {
          allColumns[cell] = true;
          cellHeaders.push(cell);
        } else {
          outRow[cellHeaders[cellIndex]] = cell;
        }
      }
      if (rowIndex != 0)
        processedRows.push(outRow);
    }
  }

  if (jsonResults)
    return processedRows;

  var outRows = [];
  var outColumns = [];
  for (var col in allColumns)
    outColumns.push(col);
  outRows.push(outColumns);

  for (var outIndex = 0; outIndex < processedRows.length; outIndex++) {
    var outCells = [];
    var row = processedRows[outIndex];
    for (var col in allColumns) {
      if (row[col] != undefined)
        outCells.push(row[col]);
      else
        outCells.push('');
    }
    outRows.push(outCells);
  }

  return outRows;
}

function truncateEmptyCSVColumns(rows) {
  let processedRows = [];
  let validColumns = {};
  let cellHeaders = [];

  for (let rowIndex = 1; rowIndex < rows.length; rowIndex++) {
    let cells = rows[rowIndex];
    let outRow = {};

    for (let cellIndex = 0; cellIndex < cells.length; cellIndex++) {
      let cell = cells[cellIndex];
      if (cell) {
        let header = rows[0][cellIndex];
        if (validColumns[header] === undefined) {
          validColumns[header] = cellIndex;
          cellHeaders.push(header);
        }
      }
    }
  }

  let resultRows = [ cellHeaders ];

  for (let rowIndex = 1; rowIndex < rows.length; rowIndex++) {
    let cells = rows[rowIndex];
    let outRow = [];

    for (let headerIndex = 0; headerIndex < cellHeaders.length; headerIndex++) {
      let header = cellHeaders[headerIndex];
      let cellIndex = validColumns[header];
      outRow.push(cells[cellIndex]);
    }
    resultRows.push(outRow);
  }

  return resultRows;
}

function getJSONFromCSVSheet(sheetName) {
  let sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
  if (!sheet)
    return [];
  let lastRow = sheet.getLastRow();
  let lastColumn = sheet.getLastColumn();
  let range = sheet.getRange(1, 1, lastRow, lastColumn).getValues();
  let cols = range[0];
  let outData = [];
  for (let rctr = 1; rctr < range.length; rctr++) {
    let row = range[rctr];

    let newRow = {};
    for (let cctr = 0; cctr < cols.length; cctr++) {
      let col = cols[cctr];
      let v = row[cctr];
      newRow[col] = v;
    }
    outData.push(newRow);
  }

  return outData;
}

function getStringForRange() {
  let f = SpreadsheetApp.getActiveRange().getFormula();
  let re = new RegExp(".+getStringForRange\\s*\\((.*?)\\)","i");
  let args = f.match(re)[1].split(/\s*,\s*/);
  return args[0];
}

function getSheetFromRangeString(str) {
  if (str.indexOf('!') === -1)
    return '';
  let parts = str.split('!');
  let sheetName = parts[0].replace(/\'/g, '');
  return sheetName;
}

function getCellRangeFromRangeString(str) {
  if (str.indexOf('!') === -1)
    return '';
  let parts = str.split('!');
  let sheetName = parts[1].replace(/\'/g, '');
  return sheetName;
}
