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

function CreateLayout() {
  let activeSpreadsheet = SpreadsheetApp.getActiveSpreadsheet();

  let circuitRanges = activeSpreadsheet.getSheetByName('Circuit Ranges');
  if (circuitRanges == null) {
    circuitRanges = activeSpreadsheet.insertSheet();
    circuitRanges.setName('Circuit Ranges');
  }

  let circuit = activeSpreadsheet.getSheetByName('Circuit');
  if (circuit == null) {
    circuit = activeSpreadsheet.insertSheet();
    circuit.setName('Circuit');
    let cols = ['result csv:', 'asset', 'name', 'skyboxtype', 'skyboxsize', 'groundimage', 'skyboxgroundscaleu', 'skyboxgroundscalev', 'skybox', 'width', 'height', 'depth', 'floormaterial', 'backwallmaterial', 'frontwallmaterial', 'leftwallmaterial', 'rightwallmaterial', 'ceilingmaterial', 'leftwallscalev', 'leftwallscaleu', 'leftwallimage', 'rightwallscalev', 'rightwallscaleu', 'rightwallimage', 'backwallscalev', 'backwallscaleu', 'backwallimage', 'frontwallscalev', 'frontwallscaleu', 'frontwallimage', 'floorscalev', 'floorscaleu', 'floorimage', 'ceilingwallscalev', 'ceilingwallscaleu', 'ceilingwallimage', 'blockflag', 'blockcode', 'frametime', 'audiourl', 'displaycamera', 'musicparams', 'genericblockdata'];
    let row1 = ['', 'sceneblock', 'SceneRecipe', 'building', '400', '', '1', '1', 'skybox33', '100', '40', '75', '', '', '', '', '', '', '3', '3', 'sb:display/goldishstonewall.jpg', '3', '3', 'sb:display/goldishstonewall.jpg', '3', '3', 'sb:display/goldishstonewall.jpg', '', '', '', '3', '3', 'sb:display/indoorwood44_1024.jpg', '1', '1', 'sb:display/stuccopink.jpg', 'scene', 'demo', '60s', '', 'demo', '', 'signyoffset:0|datascalefactor:1'];
    let data = [cols, row1];
    circuit.getRange('C3:AS4').setValues(data);
    circuit.getRange('C3').setFontWeight('bold');

    let cols2 = ['result csv:', 'asset', 'name', 'parent', 'childtype', 'shapetype', 'materialname', 'width', 'height', 'depth', 'x', 'y', 'z', 'rx', 'ry', 'rz', 'sx', 'sy', 'sz'];
    let row2_1 = ['', 'blockchild', 'fixture_fruitstand', '::scene::_fixturesWrapper', 'block', '', '', '', '', '', '-13', '0', '-5', '', '', '', '3', '3', '3'];
    let row2_2 = ['', 'blockchild', 'fixture_fruitstand', '::scene::_fixturesWrapper', 'block', '', '', '', '', '', '11', '0', '-5', '', '', '', '3', '3', '3'];
    let row2_3 = ['', 'blockchild', 'fixture_fruitstand', '::scene::_fixturesWrapper', 'block', '', '', '', '', '', '-13', '0', '5', '', '', '', '3', '3', '3'];
    let row2_4 = ['', 'blockchild', 'fixture_fruitstand', '::scene::_fixturesWrapper', 'block', '', '', '', '', '', '11', '0', '5', '', '', '', '3', '3', '3'];
    let row2_5 = ['', 'blockchild', 'register', '::scene::_fixturesWrapper', 'mesh', '', '', '', '', '', '40', '0', '-20', '-90deg', '225deg', '-90deg', '0.065', '0.065', '0.065'];
    let row2_6 = ['', 'blockchild', 'fixture_flowerstand', '::scene::_fixturesWrapper', 'block', '', '', '', '', '', '30', '0', '32', '', '90deg', '', '9', '9', '9'];
    let row2_7 = ['', 'blockchild', 'fixture_flowerstand', '::scene::_fixturesWrapper', 'block', '', '', '', '', '', '10', '0', '32', '', '90deg', '', '9', '9', '9'];
    let row2_8 = ['', 'blockchild', 'fixture_flowerstand', '::scene::_fixturesWrapper', 'block', '', '', '', '', '', '-10', '0', '32', '', '90deg', '', '9', '9', '9'];
    let row2_9 = ['', 'blockchild', 'fixture_flowerstand', '::scene::_fixturesWrapper', 'block', '', '', '', '', '', '-30', '0', '32', '', '90deg', '', '9', '9', '9'];
    let row2_10 = ['', 'blockchild', 'metalmeshstand', '::scene::_fixturesWrapper', 'mesh', '', '', '', '', '', '-15', '5', '-31', '', '', '', '12', '12', '15'];
    let row2_11 = ['', 'blockchild', 'metalmeshstand', '::scene::_fixturesWrapper', 'mesh', '', '', '', '', '', '10', '5', '-31', '', '', '', '12', '12', '15'];
    let row2_12 = ['', 'blockchild', 'fixture_cratebottom', '::scene::_fixturesWrapper', 'block', '', '', '', '', '', '45', '', '14', '', '90deg', '', '7', '7', '7'];
    let row2_13 = ['', 'blockchild', 'fixture_standard', '::scene::_fixturesWrapper', 'block', '', '', '', '', '', '-44', '', '16', '', '-90deg', '', '8', '8', '8'];
    let row2_14 = ['', 'blockchild', 'fixture_deliwall', '::scene::_fixturesWrapper', 'block', '', '', '', '', '', '60', '', '15', '', '180deg', '', '10', '10', '10'];
    let row2_15 = ['', 'blockchild', 'fixture_pegstand', '::scene::_fixturesWrapper', 'block', '', '', '', '', '', '-44', '', '-5', '', '-90deg', '', '8', '8', '8'];

    let data2 = [cols2, row2_1, row2_2, row2_3, row2_4, row2_5, row2_6, row2_7, row2_8, row2_9, row2_10, row2_11, row2_12, row2_13, row2_14, row2_15];
    circuit.getRange('C10:U25').setValues(data2);
    circuit.getRange('C10').setFontWeight('bold');

    let cols3 = ['result csv:', 'asset', 'name', 'cameraheightoffset', 'cameramovetime', 'cameraname', 'cameraradius', 'finishdelay', 'introtime', 'runlength', 'startx', 'starty', 'startz', 'startry', 'x', 'y', 'z', 'genericblockdata'];
    let row3 = ['', 'diplaycamera', 'FollowCamera', '25', '500', '', '25', '2', '1', '60', '-40', '6', '9.5', '-90deg', '-50', '5', '0', 'signyoffset|0'];
    let data3 = [cols3, row3];
    circuit.getRange('C27:T28').setValues(data3);
    circuit.getRange('C27').setFontWeight('bold');

    let cols4 = ['result csv:', 'asset', 'childtype', 'name', 'cameraname', 'cameraaimtarget', 'startx', 'starty', 'startz', 'cameraradius', 'cameraheightoffset', 'parent'];
    let row4_1 = ['', 'blockchild', 'camera', 'ArcRotate', 'arcRotateCamera', '0,0,0', '-40', '30', '0', '30', '35', '::scene::'];
    let row4_2 = ['', 'blockchild', 'camera', 'DeviceOrientationCamera', 'deviceOrientation', '0,5,0', '-30', '10', '0', '30', '10', '::scene::'];
    let data4 = [cols4, row4_1, row4_2];
    circuit.getRange('C31:N33').setValues(data4);
    circuit.getRange('C31').setFontWeight('bold');

    let cols5 = ['result csv:', 'asset', 'name', 'width', 'height', 'depth', 'blockflag', 'parent', 'x', 'y', 'z', 'rx', 'ry', 'rz'];
    let row5 = ['', 'block', 'basketcart', '5', '3', '5', 'basket', '::scene::', '-28', '5', '20', '', '-90deg', ''];
    let data5 = [cols5, row5];
    circuit.getRange('C35:P36').setValues(data5);
    circuit.getRange('C35').setFontWeight('bold');

    let cols6 = ['', 'asset', 'name', 'materialname', 'parent', 'meshpath', 'texturepath', 'bmppath', 'x', 'y', 'z', 'sx', 'sy', 'sz', 'rx', 'ry', 'rz', 'ambient', 'diffuse', 'emissive', 'blockflag'];
    let row6 = ['', 'meshtexture', 'fruitboxmesh', 'fruitboxmesh_material', 'basketcart', 'sb:demoadds/trolley.babylon', 'sb:demoadds/trolley_diff.jpg', '', '0', '-5', '0', '0.1', '0.1', '0.1', '-90deg', '180deg', '0deg', 'x', 'x', 'x', 'static'];
    let data6 = [cols6, row6];
    circuit.getRange('C38:W39').setValues(data6);

    let cols7 = ['', 'asset', 'childtype', 'frameorder', 'frametime', 'name', 'parent', 'x', 'y', 'z', 'rx', 'ry', 'rz'];
    let row7_1 = ['', 'blockchildframe', 'block', '20', '35%', 'basketcart', '::scene::', '28', '', '', '', '-90deg', ''];
    let row7_2 = ['', 'blockchildframe', 'block', '21', '38%', 'basketcart', '::scene::', '30', '', '', '', '0deg', ''];
    let row7_3 = ['', 'blockchildframe', 'block', '30', '50%', 'basketcart', '::scene::', '28', '', '-15', '', '0deg', ''];
    let row7_4 = ['', 'blockchildframe', 'block', '31', '52%', 'basketcart', '::scene::', '28', '', '-20', '', '90deg', ''];
    let row7_5 = ['', 'blockchildframe', 'block', '40', '85%', 'basketcart', '::scene::', '-28', '', '-20', '', '90deg', ''];
    let row7_6 = ['', 'blockchildframe', 'block', '41', '87%', 'basketcart', '::scene::', '-30', '', '-20', '', '180deg', ''];
    let row7_7 = ['', 'blockchildframe', 'block', '50', '98%', 'basketcart', '::scene::', '-28', '', '20', '', '180deg', ''];
    let row7_8 = ['', 'blockchildframe', 'block', '70', '100%', 'basketcart', '::scene::', '-28', '', '20', '', '270deg', ''];
    let data7 = [cols7, row7_1, row7_2, row7_3, row7_4, row7_5, row7_6, row7_7, row7_8];
    circuit.getRange('C41:O49').setValues(data7);


    let cols8 = ['result csv:', 'asset', 'name', 'blockflag', 'genericblockdata'];
    let row8 = ['', 'block', 'displaypositionsblock', 'displaypositions', '']
    circuit.getRange('C51:G52').setValues([cols8, row8]);
    circuit.getRange('C51').setFontWeight('bold');
    circuit.getRange('G52').setFormula('M53');
    circuit.getRange('M53').setFormula('CONCATENATE(K53:K79)');
    let positionRows = [
      ['positions', '-33.5', '11', '30', '', '', ''],
      ['', '-26', '8', '26', '', '', ''],
      ['', '-16', '7', '5', '', '', '20deg'],
      ['', '-16', '7', '-5', '', '', '20deg'],
      ['', '-19', '11', '-32.5', '', '', ''],
      ['', '-18.5', '11', '30', '', '', ''],
      ['', '-11', '8', '26', '', '', ''],
      ['', '-8.5', '7', '5', '', '', '-20deg'],
      ['', '-8.5', '7', '-5', '', '', '-20deg'],
      ['', '-11', '11', '-32.5', '', '', ''],
      ['', '-3.5', '11', '30', '', '', ''],
      ['', '7', '7', '5', '', '', '20deg'],
      ['', '7', '7', '-5', '', '', '20deg'],
      ['', '5.5', '11', '-32.5', '', '', ''],
      ['', '4', '8', '26', '', '', ''],
      ['', '11.5', '11', '30', '', '', ''],
      ['', '13.25', '7', '5', '', '', '-20deg'],
      ['', '13.25', '7', '-5', '', '', '-20deg'],
      ['', '13.5', '11', '-32.5', '', '', ''],
      ['', '19', '8', '26', '', '', ''],
      ['', '26.5', '11', '30', '', '', ''],
      ['', '34', '8', '26', '', '', ''],
      ['', '46', '11', '27', '', '', ''],
      ['', '43', '2', '21', '', '', ''],
      ['', '46', '11', '15', '', '', ''],
      ['', '43', '2', '9', '', '', ''],
      ['', '46', '11', '3', '', '', '']
    ];

    circuit.getRange('C53:I79').setValues(positionRows);

    for (let c = 53; c <= 79; c++) {
      let ctr = c.toString();
      circuit.getRange('K' + ctr).setFormula('D' + ctr + ' & "|" & E' + ctr + ' & "|" & F' + ctr + ' & "|" & G' + ctr + ' & "|" & H' + ctr + ' & "|" & I' + ctr + ' & "|"');
    }

    let edit_fields = [
      ['result csv:', 'asset', 'name', 'blockflag', 'genericblockdata'],
      ['', 'block', 'Camera Start Position Edit', 'displayfieldedits', 'Camera Start Position||layout||FollowCamera||displaycamera||x:num||y:num||z:num||startx:num||starty:num||startz:num||startrx:num||startry:num||startrz:num'],
      ['', 'block', 'Camera Range Edit', 'displayfieldedits', 'Camera Range||layout||FollowCamera||displaycamera||cameraradius:num||cameraheightoffset:num'],
      ['', 'block', 'Camera Timing Edit', 'displayfieldedits', 'Camera Timing||layout||FollowCamera||displaycamera||cameramovetime:num||introtime:num||finishdelay:num||runlength:num'],
      ['', 'block', 'Divider Image Edit', 'displayfieldedits', 'Divider Image||layout||dividerpanel||shape||texturepath:image||scaleu:num||scalev:num||uoffset:num||voffset:num'],
      ['', 'block', 'Table Top Image Edit', 'displayfieldedits', 'Table Top Image||layout||tabletop||shape||texturepath:image||scaleu:num||scalev:num||uoffset:num||voffset:num'],
      ['', 'block', 'Table Leg Image Edit', 'displayfieldedits', 'Table Leg Image||layout||tableleg||shape||texturepath:image||scaleu:num||scalev:num||uoffset:num||voffset:num'],
      ['', 'block', 'Floor Image Edit', 'displayfieldedits', 'Floor Image||layout||SceneRecipe||sceneblock||floorimage:image||floorscaleu:num||floorscalev:num'],
      ['', 'block', 'Left Wall Edit', 'displayfieldedits', 'Left Wall||layout||SceneRecipe||sceneblock||leftwallimage:image||leftwallscaleu:num||leftwallscalev:num'],
      ['', 'block', 'Right Wall Edit', 'displayfieldedits', 'Right Wall||layout||SceneRecipe||sceneblock||rightwallimage:image||rightwallscaleu:num||rightwallscalev:num'],
      ['', 'block', 'Back Wall Edit', 'displayfieldedits', 'Back Wall||layout||SceneRecipe||sceneblock||backwallimage:image||backwallscaleu:num||backwallscalev:num'],
      ['', 'block', 'Fore Wall Edit', 'displayfieldedits', 'Front Wall||layout||SceneRecipe||sceneblock||frontwallimage:image||frontwallscaleu:num||frontwallscalev:num'],
      ['', 'block', 'Skybox', 'displayfieldedits', 'Skybox||layout||SceneRecipe||sceneblock||skybox:listskybox'],
      ['', 'block', 'Edge Cooler Image Edit', 'displayfieldedits', 'Edge Cooler Image||assets||edgecooler||mesh||texturepath:image||scaleu:num||scalev:num||uoffset:num||voffset:num']
    ];

    circuit.getRange('C81:G94').setValues(edit_fields);
    circuit.getRange('C81').setFontWeight('bold');

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
