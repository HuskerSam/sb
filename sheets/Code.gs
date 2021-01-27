function onInstall(e) {
  onOpen(e);
}

function onOpen(e) {
  let ui = SpreadsheetApp.getUi();

  ui.createAddonMenu()
    .addItem('Visual Catalog Tools', 'showInitDialog')
    .addToUi();
}

function refreshOAuth() {
  ScriptApp.invalidateAuth();
  PropertiesService.getDocumentProperties().setProperty("accessToken", ScriptApp.getOAuthToken());
  return;
}

function showInitDialog() {
  showDialog('clouddialog');
}

function showDialog(name) {
  refreshOAuth();
  var html = HtmlService.createHtmlOutputFromFile(name)
    .setTitle('Visual Catalog Tools')
  SpreadsheetApp.getUi().showSidebar(html);
}

function createSheetFromTemplate(sheetName, template) {
  let activeSpreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = activeSpreadsheet.getSheetByName(sheetName);

  if (sheet !== null) {
    return "sheet exists";
  }

  sheet = activeSpreadsheet.insertSheet();
  sheet.setName(sheetName);
  sheet.insertColumns(sheet.getLastColumn() + 1, 30)

  if (template) {
    for (let i = 0, l = template.length; i < l; i++) {
      let item = template[i];

      if (item.range) {
        let range = sheet.getRange(item.range);
        if (range) {
          sheet.setActiveRange(range);
          if (item.value)
            range.setValue(item.value);
          if (item.formula)
            range.setFormula(item.formula);
          if (item.fontWeight)
            range.setFontWeight(item.fontWeight);
          if (item.rangeValue)
            range.setValues(item.rangeValue);
          if (item.fontColor)
            range.setFontColor(item.fontColor);
          if (item.backgroundColor)
            range.setBackground(item.backgroundColor);
          if (item.verticalAlignment) // 'top', 'middle', 'bottom'
            range.setVerticalAlignment(item.verticalAlignment);
          if (item.horizontalAlignment) // 'left', 'center', 'normal'
            range.setHorizontalAlignment(item.horizontalAlignment);
          if (item.wrapStrategy) // 'WRAP', 'OVERFLOW', 'CLIP'
            range.setWrapStrategy(SpreadsheetApp.WrapStrategy[item.wrapStrategy]);
        }
      }

      if (item.columnNumber) {
        if (item.width) {
          sheet.setColumnWidth(Number(item.columnNumber), Number(item.width));
        }
      }

    }
  }

  return "success";
}

function SetCSVSheetValue(sheetName, rowIndex, field, value) {
  if (!sheetName || !field || !rowIndex)
    return;
  let sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
  if (!sheet) {
    sheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet();
    sheet.setName(sheetName);
  }

  let sheetCSV = getJSONFromCSVSheet(sheetName);
  let cols = [];
  if (sheetCSV[0])
    cols = Object.keys(sheetCSV[0]);
  let colIndex = cols.length;
  for (let c = 0; c < cols.length; c++)
    if (cols[c] === field) {
      colIndex = c;
      break;
    }
  let colSymbol = '';
  if (colIndex < 27)
    colSymbol = String.fromCharCode('A'.charCodeAt(0) + colIndex);
  else
    colSymbol = 'A' + String.fromCharCode('A'.charCodeAt(0) + (colIndex - 26));

  if (colIndex === cols.length) {
    sheet.getRange(colSymbol + '1').setValue(field).setFontWeight('bold');
  }

  let rowNumber = (rowIndex + 1).toString();
  if (colSymbol && rowNumber)
    sheet.getRange(colSymbol + rowNumber).setValue(value);
}

function AddRowToProjectList(name, circuitranges, assetranges, productssheet, flags) {
  let activeSpreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = activeSpreadsheet.getSheetByName('Projects');
  let row = -1;
  if (!sheet) {
    row = 1;
  } else {
    row = sheet.getLastRow();
  }

  SetCSVSheetValue('Projects', row, 'Project Name', name);
  SetCSVSheetValue('Projects', row, 'Asset Ranges', assetranges);
  SetCSVSheetValue('Projects', row, 'Circuit Ranges', circuitranges);
  SetCSVSheetValue('Projects', row, 'Catalog Ranges', productssheet);
  SetCSVSheetValue('Projects', row, 'Flags', flags);
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
      else {
        outCells.push('');
        row[col] = '';
      }
    }
    outRows.push(outCells);
  }

  if (jsonResults)
    return processedRows;

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

function getCSVRangeForCell() {
  let f = SpreadsheetApp.getActiveRange().getFormula();
  f = f.replace('=getCSVRangeForCell(', '');
  f = f.slice(0, -1);
  let sheetName = getSheetFromRangeString(f);

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var range = ss.getRange(f);

  range = range.getDataRegion(SpreadsheetApp.Dimension.ROWS);
  range = range.getDataRegion(SpreadsheetApp.Dimension.COLUMNS);

  return "'" + sheetName + "'!" + range.getA1Notation();
}

function getTablesForCells() {
  let cellStrings = [];
  let args = [...arguments];
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!args)
    args = '';
  if (!Array.isArray(args))
    args = [args];

  args.forEach(arg => {
    if (arg === undefined)
      arg = '';
    let subArgs = arg.toString().split(',');
    cellStrings = cellStrings.concat(subArgs);
  });
  let list = '';
  cellStrings.forEach((f, i) => {
    let sheetName = getSheetFromRangeString(f);
    if (!sheetName)
      sheetName = SpreadsheetApp.getActiveSheet().getName();
    if (sheetName)
      sheetName = "'" + sheetName + "'!";
    var range = ss.getRange(f);

    range = range.getDataRegion(SpreadsheetApp.Dimension.ROWS);
    range = range.getDataRegion(SpreadsheetApp.Dimension.COLUMNS);

    list += sheetName + range.getA1Notation() + ',';
  });

  list = list.slice(0, -1);
  return list;
}

function getCSVRangesFromSheet(sheetName) {
  let sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
  if (!sheet) return [];
  let lastRow = sheet.getLastRow();
  let lastColumn = sheet.getLastColumn();
  if (lastRow === 0) return [];
  let range = sheet.getRange(1, 1, lastRow, lastColumn).getValues();

  let rowCount = 0;
  let tableCells = [];
  let rangeStart = 0;
  let startValue = '';
  for (let rctr = 0; rctr < range.length; rctr++) {
    let row = range[rctr];
    if (row.length > 0) {
      if (row[0]) {
        if (rowCount === 0) {
          rangeStart = rctr + 1;
          startValue = row[0].toString();
        }
        if (rowCount === 1 && startValue !== '::comment')
          tableCells.push('\'' + sheetName + '\'!A' + rangeStart);
        rowCount++;
      } else {
        if (rowCount > 1) {
          rowCount = 0;
        }
      }
    }
  }

  return tableCells.join(',');
}

function refreshSheetQueries(sheet) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  if (!sheet)
    sheet = ss.getActiveSheet();

  var range = sheet.getDataRange();
  var lastColIndex = range.getLastColumn();
  var lastRowIndex = range.getLastRow();
  var formulas = range.getFormulas();

  for (var rowCounter = 0; rowCounter < lastRowIndex; rowCounter++) {
    var colFormulas = formulas[rowCounter];
    for (var colCounter = 0; colCounter < lastColIndex; colCounter++)
      if (colFormulas[colCounter] != '')
        range.getCell(rowCounter + 1, colCounter + 1).setFormula('');
  }

  SpreadsheetApp.flush();
  for (var rowCounter = 0; rowCounter < lastRowIndex; rowCounter++) {
    var colFormulas = formulas[rowCounter];
    for (var colCounter = 0; colCounter < lastColIndex; colCounter++)
      if (colFormulas[colCounter] != '')
        range.getCell(rowCounter + 1, colCounter + 1).setFormula(colFormulas[colCounter]);
  }
}

function forceEval(sheetName, row, col) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(sheetName);
  var orig = sheet.getRange(row, col).getFormula();
  var temp = orig.replace("=", "?");
  sheet.getRange(row, col).setFormula(temp);
  SpreadsheetApp.flush();
  sheet.getRange(row, col).setFormula(orig);
}

function getJSONFromCSVSheet(sheetName, refreshFormulas = false) {
  let sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
  if (!sheet)
    return [];
  if (refreshFormulas)
    refreshSheetQueries(sheet);
  let lastRow = sheet.getLastRow();
  let lastColumn = sheet.getLastColumn();

  if (lastRow === 0)
    return [];
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
  f = f.replace('=getStringForRange(', '');
  f = f.slice(0, -1);
  return f;
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

function getJSONForSheet(sheetName, block = 1) {
  let sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
  if (!sheet)
    return [];
  let lastRow = sheet.getLastRow();
  let lastColumn = sheet.getLastColumn();

  let jsonCells = [];

  for (let rctr = 0; rctr < lastRow; rctr++) {
    for (let cctr = 0; cctr < lastColumn; cctr++) {
      let range = String.fromCharCode(cctr + "A".charCodeAt(0)) + (rctr + 1).toString();
      if (cctr > 25)
        range = "A" + String.fromCharCode((cctr - 26) + "A".charCodeAt(0)) + (rctr + 1).toString();
      if (cctr > 51)
        range = "B" + String.fromCharCode((cctr - 52) + "A".charCodeAt(0)) + (rctr + 1).toString();

      let r = sheet.getRange(range);
      let formula = r.getFormula();
      let value = r.getValue();
      let cell = null;
      if (formula) {
        cell = {
          range,
          formula
        };
      } else if (value) {
        cell = {
          range,
          value
        };
      }

      if (cell) {
        let fontWeight = r.getFontWeight();
        let fontColor = r.getFontColor();
        let backgroundColor = r.getBackground();
        let wrapStrategy = r.getWrapStrategy().toString();
        let horizontalAlignment = r.getHorizontalAlignment();

        if (fontWeight !== 'normal')
          cell['fontWeight'] = fontWeight;
        if (fontColor !== '#000000')
          cell['fontColor'] = fontColor;
        if (backgroundColor !== '#ffffff')
          cell['backgroundColor'] = backgroundColor;
        if (wrapStrategy !== 'OVERFLOW')
          cell['wrapStrategy'] = wrapStrategy;
        if (horizontalAlignment !== 'general-left')
          cell['horizontalAlignment'] = horizontalAlignment;

        jsonCells.push(cell);
      }
    }
  }

  jsonCells.push({
    range: 'A1'
  });

  let rawString = JSON.stringify(jsonCells);

  return rawString.substr((block - 1) * 50000, 50000);
}

function _processValueForColor(v, sheet) {
  v = v.toLowerCase().replace('decolor:', '');
  v = v.replace('ecolor:', '');
  v = v.replace('color:', '');
  v = v.trim();

  let parts = v.split(',');
  let validColor =  (parts.length > 2);
  let l1color = color(v);
  return {
    color: l1color,
    str: v,
    validColor
  };
}

function onEdit(e) {
  if (e) {
    let sheet = e.source.getActiveSheet();
    let range = e.source.getActiveRange();

    let lastRow = range.getRow();
    let lastCol = range.getLastColumn();
    let cell = sheet.getRange(lastRow - 1, lastCol);
    if (cell.getFormula().indexOf('colorHeader(') !== -1) {
      let v = cell.getFormula().substr(13);
      v = v.slice(0, -1);
      let args = v.split(',');

      let firstCell = args[1].split('\"').join("").trim();
      let cvalue = sheet.getRange(firstCell).getValue();

      cvalue = cvalue.split('\"').join("").trim();

      let pc = _processValueForColor(cvalue, sheet);
      let l1color = pc.color;
      let fc = 'white';
      if (l1color.r + (l1color.g * 1.5) + l1color.b > 1.4)
        fc = 'black';

      let outCells = args.slice(2);
      if (outCells.length === 0)
        outCells = args.slice(1);
      outCells.forEach(outCell => {
        outCell = outCell.split('\"').join("").trim();
        let oC = sheet.getRange(outCell);
        if (pc.validColor) {
          oC.setBackground(colorRGB255(pc.str));
          oC.setFontColor(fc);
        }
        else {
          oC.setFontColor('black');
          oC.setBackground('white');
        }
      });
    }

    let maxRows = 100;
    let min = Math.max(0, lastRow - 100);
    for (let rCtr = lastRow - 1; rCtr > min; rCtr--) {
      let cell = sheet.getRange(rCtr, lastCol);
      let formula = cell.getFormula();
      if (formula.indexOf('colorColumn(') !== -1) {
        cell = sheet.getRange(lastRow, lastCol);
        let pc = _processValueForColor(cell.getValue(), sheet);
        let l1color = pc.color;
        let fc = 'white';
        if (l1color.r + l1color.g + l1color.b > 1.4)
          fc = 'black';

        cell.setFontColor(fc);
        cell.setBackground(colorRGB255(pc.str));
        break;
      }
      let value = cell.getValue();
      if (value === '' && formula === '')
        break;

    }
  }
}

function colorHeader(label) {
  return label;
}

function colorColumn(label) {
  return label;
}

function color(str) {
  if (!str) {
    str = '1,1,1';
  }
  let parts = str.split(',');
  let cA = [];
  let r = Number(parts[0]);
  if (isNaN(r))
    r = 0;
  let g = Number(parts[1]);
  if (isNaN(g))
    g = 0;
  let b = Number(parts[2]);
  if (isNaN(b))
    b = 0;
  if (typeof window !== "undefined" && window.BABYLON)
    return new BABYLON.Color3(r, g, b);

  return {
    r,
    g,
    b
  };
}

function colorRGB255(str) {
  let bC = color(str);
  if (isNaN(bC.r))
    bC.r = 1;
  if (isNaN(bC.g))
    bC.g = 1;
  if (isNaN(bC.b))
    bC.b = 1;

  return 'rgb(' + (bC.r * 255.0).toFixed(0) + ',' + (bC.g * 255.0).toFixed(0) + ',' + (bC.b * 255.0).toFixed(0) + ')'
}

function getDataRangesForSheet(sheet) {
  return getTablesForCells(getCSVRangesFromSheet(sheet))
}

function gridJoin(delimiter, rangeValues) {
  let result = '';

  for (let c = 0, l = rangeValues.length; c < l; c++)
    for (let d = 0, dl = rangeValues[c].length; d < dl; d++) {
      result += rangeValues[c][d] + delimiter;
    }

  result = result.slice(0, -1 * delimiter.length);
  return result;
}
