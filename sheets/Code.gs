function onOpen() {
  let ui = SpreadsheetApp.getUi();

  ui.createAddonMenu()
    .addItem('Utilities', 'showPublishWeb')
    .addToUi();
}

function refreshOAuth() {
  ScriptApp.invalidateAuth();
  PropertiesService.getDocumentProperties().setProperty("accessToken", ScriptApp.getOAuthToken());
  return;
}

function showPublishWeb() {
  refreshOAuth();
  var html = HtmlService.createHtmlOutputFromFile('publish')
    .setTitle('Catalog Utilities')
  SpreadsheetApp.getUi().showSidebar(html);
}

function initializeConfiguration() {
  let activeSpreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  let publishConfig = activeSpreadsheet.getSheetByName("PublishConfig");

  if (publishConfig == null) {
    publishConfig = activeSpreadsheet.insertSheet();
    publishConfig.setName("PublishConfig");
    publishConfig.getRange('A1').setValue('displaylist');
    publishConfig.getRange('A2').setValue('PublishList');
    publishConfig.getRange('B1').setValue('startat');
    publishConfig.getRange('C1').setValue('endat');
    publishConfig.getRange('D1').setValue('assetbookid');
    publishConfig.getRange('A1:G1').setFontWeight("bold");
  }


  let publishList = activeSpreadsheet.getSheetByName("PublishList");
  if (publishList == null) {
    publishList = activeSpreadsheet.insertSheet();
    publishList.setName("PublishList");
    publishList.getRange('A1').setValue('name');
    publishList.getRange('B1').setValue('assetranges');
    publishList.getRange('C1').setValue('circuitranges');
    publishList.getRange('D1').setValue('catalogsheet');
    publishList.getRange('E1').setValue('flags');
    publishList.getRange('A1:G1').setFontWeight("bold");
  }


  let assetRanges = activeSpreadsheet.getSheetByName('Asset Ranges');
  if (assetRanges == null) {
    assetRanges = activeSpreadsheet.insertSheet();
    assetRanges.setName("Asset Ranges");
    assetRanges.getRange("D3").setValue('Ranges Str').setFontWeight("bold");
    assetRanges.getRange("D5").setValue('Sheet CSV Formula').setFontWeight("bold");

    assetRanges.getRange("B7").setValue('workbookid').setFontWeight("bold");
    assetRanges.getRange("C7").setValue('Sheet Name').setFontWeight("bold");
    assetRanges.getRange("D7").setValue('Range').setFontWeight("bold");
    assetRanges.getRange("E7").setValue('Description').setFontWeight("bold");
    assetRanges.getRange("F7").setValue('Raw Range').setFontWeight("bold");
    assetRanges.getRange("G7").setValue('comma').setFontWeight("bold");
    assetRanges.getRange("H7").setValue('Import Range').setFontWeight("bold");
    assetRanges.getRange("I7").setValue('Remote Range').setFontWeight("bold");

    assetRanges.getRange("B8").setValue('12hWlqcT9jfhIZ9rKUcTpBDDI68KW1UNq6dWK8uk7foE');
    assetRanges.getRange("B9").setValue('12hWlqcT9jfhIZ9rKUcTpBDDI68KW1UNq6dWK8uk7foE');
    assetRanges.getRange("B10").setValue('12hWlqcT9jfhIZ9rKUcTpBDDI68KW1UNq6dWK8uk7foE');
    assetRanges.getRange("B11").setValue('12hWlqcT9jfhIZ9rKUcTpBDDI68KW1UNq6dWK8uk7foE');
    assetRanges.getRange("B12").setValue('12hWlqcT9jfhIZ9rKUcTpBDDI68KW1UNq6dWK8uk7foE');

    assetRanges.getRange("C8").setFormula('importrange(B8, "\'Asset Inventory\'!B3:D5")');
    assetRanges.getRange("F8").setFormula("\"'\" & C8 & \"'!\" & D8");
    assetRanges.getRange("G8").setFormula('F8 & ","');
    assetRanges.getRange("H8").setFormula('IF(B8 <> "","ImportRange(""" & B8 & """,""" & F8 & """),", D8)');
    assetRanges.getRange("I8").setFormula('IF(B8 <> "", B8 & "||||", "") & G8');
    assetRanges.getRange("F9").setFormula("\"'\" & C9 & \"'!\" & D9");
    assetRanges.getRange("G9").setFormula('F9 & ","');
    assetRanges.getRange("H9").setFormula('IF(B9 <> "","ImportRange(""" & B9 & """,""" & F9 & """),", D9)');
    assetRanges.getRange("I9").setFormula('IF(B9 <> "", B9 & "||||", "") & G9');
    assetRanges.getRange("F10").setFormula("\"'\" & C10 & \"'!\" & D10");
    assetRanges.getRange("G10").setFormula('F10 & ","');
    assetRanges.getRange("H10").setFormula('IF(B10 <> "","ImportRange(""" & B10 & """,""" & F10 & """),", D10)');
    assetRanges.getRange("I10").setFormula('IF(B10 <> "", B10 & "||||", "") & G10');

    assetRanges.getRange("C11").setFormula('importrange(B11, "\'Asset Inventory\'!B22:D23")');
    assetRanges.getRange("F11").setFormula("\"'\" & C11 & \"'!\" & D11");
    assetRanges.getRange("G11").setFormula('F11 & ","');
    assetRanges.getRange("H11").setFormula('IF(B11 <> "","ImportRange(""" & B11 & """,""" & F11 & """),", D11)');
    assetRanges.getRange("I11").setFormula('IF(B11 <> "", B11 & "||||", "") & G11');
    assetRanges.getRange("F12").setFormula("\"'\" & C12 & \"'!\" & D12");
    assetRanges.getRange("G12").setFormula('F12 & ","');
    assetRanges.getRange("H12").setFormula('IF(B12 <> "","ImportRange(""" & B12 & """,""" & F12 & """),", D12)');
    assetRanges.getRange("I12").setFormula('IF(B12 <> "", B12 & "||||", "") & G12');

    assetRanges.getRange("F4").setFormula('CONCATENATE(I8:I12)');
    assetRanges.getRange("E3").setFormula('left(F4, len(F4) - 1)');

    assetRanges.getRange("F6").setFormula('CONCATENATE(H8:H12)');
    assetRanges.getRange("E5").setFormula('"mergeCSVRanges(" & left(F6, len(F6) - 1) & ")"');

  }

  return 'success';
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
    rows = [rows];
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
  let rangeCleanName = rangeName.replace(/\$/g, "");
  var accessToken = PropertiesService.getDocumentProperties().getProperty("accessToken");
  var url = "https://sheets.googleapis.com/v4/spreadsheets/" + spreadsheetId + "/values/" + rangeCleanName;
  var res = UrlFetchApp.fetch(url, {
    headers: {
      "Authorization": "Bearer " + accessToken
    }
  });
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

  let resultRows = [cellHeaders];

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
  let re = new RegExp(".+getStringForRange\\s*\\((.*?)\\)", "i");
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
