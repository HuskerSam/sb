class cWorkspace {
  constructor(domPanel, subKey, bView) {
    this.domPanel = domPanel;
    this.bView = bView;

    gAPPP.updateGenerateDataTimes()
      .then(() => {
        if (subKey === 'Details') {
          this.workspaceDetailsInit();
        }
        if (subKey === 'Overview') {
          this.workspaceOverviewInit();
        }
        if (subKey === 'Layout') {
          this.domPanel.innerHTML = this.workspaceLayoutTemplate();
          this.workspaceLayoutRegister();
        }
      });
  }
  async workspaceDetailsInit() {
    let html = this.workspaceDetailsTemplate();
    this.domPanel.innerHTML = html;
    this.workspaceDetailsRegister();

    return;
  }
  async workspaceOverviewInit() {
    let html = '';
    let blockCount = Object.keys(gAPPP.a.modelSets['block'].fireDataValuesByKey).length;
    let shapeCount = Object.keys(gAPPP.a.modelSets['shape'].fireDataValuesByKey).length;
    let frameCount = Object.keys(gAPPP.a.modelSets['frame'].fireDataValuesByKey).length;
    let meshCount = Object.keys(gAPPP.a.modelSets['mesh'].fireDataValuesByKey).length;
    let textureCount = Object.keys(gAPPP.a.modelSets['texture'].fireDataValuesByKey).length;
    let materialCount = Object.keys(gAPPP.a.modelSets['material'].fireDataValuesByKey).length;
    let blockchildCount = Object.keys(gAPPP.a.modelSets['blockchild'].fireDataValuesByKey).length;

    html += `<div style="padding:.75em;"><a href="${this.bView.genQueryString(null, null, null, null, 'Details')}" class="tag_key_redirect" data-value="Details" data-type="w">Details</a>
      &nbsp;<a href="${this.bView.genQueryString(null, null, null, null, 'Generate')}" class="tag_key_redirect" data-value="Generate" data-type="w">Generate</a>
      &nbsp;<a href="${this.bView.genQueryString(null, null, null, null, 'Layout')}" class="tag_key_redirect" data-value="Layout" data-type="w">Layout</a>
      </div>`;

    let getAssetLinks = (asset) => {
      let set = gAPPP.a.modelSets[asset];
      set.updateChildOrder();
      let keyOrder = set.childOrderByKey;
      let html = '';
      //keyOrder = keyOrder.slice(0, 5);

      keyOrder.forEach(i => {
        let data = set.fireDataValuesByKey[i];
        let d = new Date(data.sortKey);
        if (data.sortKey === undefined)
          d = new Date('1/1/1970');
        let od = d.toISOString().substring(0, 10);
        od += ' ' + d.toISOString().substring(11, 16);
        let href = this.bView.genQueryString(null, asset, i);

        let url = data.renderImageURL;
        let img = '';
        if (url) {
          img = `style="background-image:url(${url})"`;
        }

        html += `<a class="workspace-asset-link-display tag_key_redirect app-control" data-tag="${asset}" data-key="${i}" href="${href}">
          <span class="img-holder" ${img}></span>${data.title}<br><span>${od}</span></a>`;
      });

      return html;
    }

    html += `<div style="line-height:1.5em;padding:.5em;">
    <div class="workspace_band_wrapper">
      <a href="${this.bView.genQueryString(null, 'block', '')}" class="navigate_tag_select app-control" data-value="block">Blocks<br>${blockCount}</a>
      ${getAssetLinks('block')}
    </div>
    <div class="workspace_band_wrapper">
      <a href="${this.bView.genQueryString(null, 'mesh', '')}" class="navigate_tag_select app-control" data-value="mesh">Meshes<br>${meshCount}</a>
      ${getAssetLinks('mesh')}
    </div>
    <div class="workspace_band_wrapper">
      <a href="${this.bView.genQueryString(null, 'shape', '')}" class="navigate_tag_select app-control" data-value="shape">Shapes<br>${shapeCount}</a>
      ${getAssetLinks('shape')}
    </div>
    <div class="workspace_band_wrapper">
      <a href="${this.bView.genQueryString(null, 'material', '')}" class="navigate_tag_select app-control" data-value="material">Materials<br>${materialCount}</a>
      ${getAssetLinks('material')}
    </div>
    <div class="workspace_band_wrapper">
      <a href="${this.bView.genQueryString(null, 'texture', '')}" class="navigate_tag_select app-control" data-value="texture">Textures<br>${textureCount}</a>
      ${getAssetLinks('texture')}
    </div>`;

    let gi = new gCSVImport(gAPPP.a.profile.selectedWorkspace);
    let sceneRecords = await gi.dbFetchByLookup('block', 'blockFlag', 'scene');
    if (sceneRecords.recordIds.length > 0) {
      let href = this.bView.genQueryString(null, 'block', sceneRecords.recordIds[0]);
      html += `Generated animation block: <b><a href="${href}" class="tag_key_redirect" data-tag="block"
       data-key="${sceneRecords.recordIds[0]}">${sceneRecords.records[0].title}</a></b> <span class="csv_data_date_span">${gAPPP.animationGeneratedDateDisplay}</span>`;
      html += ` &nbsp; <a href="/demo?wid=${gAPPP.a.profile.selectedWorkspace}" target="_blank">/demo</a>`;
      html += '<br>';
    } else {
      html += 'Generated animation block: none<br>';
    }

    let baskets = await gi.dbFetchByLookup('block', 'blockFlag', 'basket');
    if (baskets.recordIds.length > 0) {
      let href = this.bView.genQueryString(null, 'block', baskets.recordIds[0]);
      html += `Basket Block: <a href="${href}" class="tag_key_redirect" data-tag="block" data-key="${baskets.recordIds[0]}">${baskets.records[0].title}</a><br>`;
    } else {
      html += 'Basket Block: none<br>'
    }

    let fontsData = await gi.dbFetchByLookup('block', 'blockFlag', 'googlefont');
    html += `Web Font Blocks (${fontsData.records.length}): `;
    for (let c = 0, l = fontsData.records.length; c < l; c++) {
      let href = this.bView.genQueryString(null, 'block', fontsData.recordIds[c]);
      html += ` &nbsp; <a href="${href}" style="font-family:'${fontsData.records[c].genericBlockData}'" class="tag_key_redirect" data-tag="block" data-key="${fontsData.recordIds[c]}">${fontsData.records[c].title}</a>`;
    }
    html += '<br>';
    html += `Frame Count: ${frameCount}<br>
    Block Link Count: ${blockchildCount}<br>`;

    let result = await firebase.database().ref(gi.path('blockchild'))
      .orderByChild('animationIndex')
      .startAt(-100000)
      .once('value');
    let recordsById = result.val();
    let animationStops = 0;
    if (recordsById)
      animationStops = Object.keys(recordsById).length;
    html += `Animation Stops: ${animationStops}<br>`;
    html += `Mesh [sb:] ${gAPPP.cdnPrefix}meshes/<br>`;
    html += `Texture [sb:] ${gAPPP.cdnPrefix}textures/<br>`;


    let blocksData = await gi.dbFetchByLookup('block', 'blockFlag', 'displayblock');
    html += `Display Blocks (${blocksData.records.length}): `;
    for (let c = 0, l = blocksData.records.length; c < l; c++) {
      let href = this.bView.genQueryString(null, 'block', blocksData.recordIds[c]);
      html += ` &nbsp; <a href="${href}" class="tag_key_redirect" data-tag="block" data-key="${blocksData.recordIds[c]}">${blocksData.records[c].title}</a>`;
    }
    html += '<br>';

    html += '</div>';
    this.domPanel.innerHTML = html;
    this.bView.workspace_show_home_btn.style.visibility = 'hidden';
    this.domPanel.querySelectorAll('.navigate_tag_select').forEach(i => {
      i.addEventListener('click', e => {
        this.bView.dataview_record_tag.value = e.currentTarget.dataset.value;
        this.bView.key = e.currentTarget.dataset.key;
        this.bView.updateRecordList();
        e.preventDefault();
        return false;
      })
    });
    this.domPanel.querySelectorAll('.tag_key_redirect').forEach(i => {
      i.addEventListener('click', e => {
        if (e.currentTarget.dataset.type === 'w') {
          this.bView.dataview_record_key.value = e.currentTarget.dataset.value;
          this.bView.updateSelectedRecord();
        } else {
          this.bView.dataview_record_tag.value = e.currentTarget.dataset.tag;
          this.bView.key = e.currentTarget.dataset.key;
          this.bView.updateRecordList(this.bView.key);
        }
        e.preventDefault();
        return false;
      })
    });

    return;
  }
  workspaceDetailsTemplate() {
    return `<div style="line-height:2.5em;padding: .5em">
    <label><span>Workspace Name </span><input id="edit-workspace-name" type="text" /></label>
    <button id="remove-workspace-button" class="btn-sb-icon"><i class="material-icons">delete</i></button>
    <br>
    <label><span>Workspace Tags (,) </span><input id="edit-workspace-code" type="text" /></label>
    &nbsp;
    <input type="file" style="display:none;" class="import_csv_file">
    <input type="file" style="display:none;" class="import_asset_json_file">
    <br><br>
    <button class="import_csv_records">Import CSV</button>
    &nbsp;
    <button class="import_asset_json_button">Import JSON</button>
    </div>`;
  }
  workspaceDetailsRegister() {
    this.bView.workplacesSelectEditName = this.domPanel.querySelector('#edit-workspace-name');
    if (gAPPP.lastWorkspaceName)
      this.bView.workplacesSelectEditName.value = gAPPP.lastWorkspaceName;
    this.bView.workplacesSelectEditCode = this.domPanel.querySelector('#edit-workspace-code');
    if (gAPPP.lastWorkspaceCode)
      this.bView.workplacesSelectEditCode.value = gAPPP.lastWorkspaceCode;
    this.workplacesRemoveButton = this.domPanel.querySelector('#remove-workspace-button');
    this.bView.workplacesSelectEditName.addEventListener('input', e => this.workspaceUpdateTagsList());
    this.bView.workplacesSelectEditCode.addEventListener('input', e => this.workspaceUpdateTagsList());
    this.workplacesRemoveButton.addEventListener('click', e => this.bView.deleteProject());

    this.import_csv_file = this.domPanel.querySelector('.import_csv_file');
    this.import_csv_file.addEventListener('change', e => this.csvGenerateImportCSV());
    this.import_csv_records = this.domPanel.querySelector('.import_csv_records');
    this.import_csv_records.addEventListener('click', e => this.import_csv_file.click());

    this.import_asset_json_file = this.domPanel.querySelector('.import_asset_json_file');
    this.import_asset_json_file.addEventListener('change', e => this.csvGenerationImportJSON());
    this.import_asset_json_button = this.domPanel.querySelector('.import_asset_json_button');
    this.import_asset_json_button.addEventListener('click', e => this.import_asset_json_file.click());
  }
  workspaceUpdateTagsList() {
    let name = this.bView.workplacesSelectEditName.value.trim();
    let code = this.bView.workplacesSelectEditCode.value.trim();

    if (name.length < 1)
      return;

    gAPPP.a.modelSets['projectTitles'].commitUpdateList([{
      field: 'title',
      newValue: name
    }, {
      field: 'tags',
      newValue: code
    }], this.bView.workplacesSelect.value);
  }

  workspaceLayoutTemplate() {
    return `<div class="data_table_panel"></div>
    <div class="layout_product_data_panel">
      <input type="file" class="texturepathuploadfile" style="display:none;" />
      <form autocomplete="off" onsubmit="return false;"></form>
    </div>
    <div class="scene_layout_data_panel" >
      <select class="scene_options_list" size="3"></select>
      <div class="scene_options_edit_fields"></div>
    </div>
    <datalist id="blocklist"></datalist>
    <datalist id="assetlist">
      <option>product</option>
      <option>message</option>
    </datalist>`;
  }
  workspaceLayoutRegister() {
    this.editTable = null;
    this.fieldList = [
      'index', 'name', 'asset',
      'text1', 'text2', 'image', 'block',
      'sku', 'price', 'count', 'pricetext',
      'height', 'width',
      'x', 'y', 'z',
      'rx', 'ry', 'rz', 'displaystyle', 'materialname'
    ];
    this.messageOnlyFields = [
      'index', 'name', 'asset', 'text1', 'text2',
      'height', 'width', 'x', 'y', 'z'
    ];
    this.productOnlyFields = [
      'index', 'name', 'asset',
      'text1', 'image', 'block',
      'sku', 'price', 'count', 'pricetext',
      'x', 'y', 'z'
    ];

    this.allColumnList = [
      'name', 'asset', 'parent', 'childtype', 'shapetype', 'frametime', 'frameorder', 'height', 'width', 'depth',
      'materialname', 'texturepath', 'bmppath', 'color', 'meshpath', 'diffuse', 'ambient', 'emissive', 'scalev', 'scaleu', 'visibility',
      'x', 'y', 'z', 'rx', 'ry', 'rz', 'sx', 'sy', 'sz', 'cameratargetblock', 'cameraradius', 'cameraheightoffset', 'cameramovetime',
      'blockcode', 'introtime', 'finishdelay', 'runlength', 'startx', 'starty', 'startz', 'startrx', 'startry', 'startrz', 'blockflag',
      'texturetext', 'texturetextrendersize', 'texture2dfontweight', 'textfontsize', 'textfontfamily', 'textfontcolor', 'genericblockdata'
    ];
    this.productColumnList = this.fieldList;
    this.assetColumnList = this.allColumnList;
    this.sceneColumnList = this.allColumnList;
    this.rightAlignColumns = [
      'price', 'count', 'height', 'width', 'x', 'y', 'z', 'rx', 'ry', 'rz'
    ];

    this.workspace_layout_view_select = document.body.querySelector('.workspace_layout_view_select');
    this.workspace_layout_view_select.addEventListener('change', e => this.workspaceLayoutShowView());
    this.scene_layout_data_panel = this.domPanel.querySelector('.scene_layout_data_panel');
    this.data_table_panel = this.domPanel.querySelector('.data_table_panel');
    this.scene_options_edit_fields = this.domPanel.querySelector('.scene_options_edit_fields');
    this.layout_product_data_panel = this.domPanel.querySelector('.layout_product_data_panel');

    this.workspaceLayoutShowView();
  }
  workspaceLayoutShowView() {
    let sel = this.workspace_layout_view_select.value;
    this.scene_layout_data_panel.style.display = (sel === 'Custom Data') ? 'flex' : 'none';
    this.layout_product_data_panel.style.display = (sel === 'Products') ? 'block' : 'none';
    this.scene_options_edit_fields.style.display = (sel === 'Custom Data') ? 'block' : 'none';
    if (this.editTable) {
      this.editTable.destroy();
      this.editTable = null;
    }
    if (sel === 'Assets' || sel === 'Products' || sel === 'Layout') {
      this.data_table_panel.style.display = 'flex';
      this.data_table_panel.innerHTML = 'Loading...';
    } else {
      this.data_table_panel.innerHTML = '';
      this.data_table_panel.style.display = 'none';
    }

    if (sel === 'Assets') {
      this.workspaceLayoutCSVLoadTable('asset');
    }
    if (sel === 'Layout') {
      this.workspaceLayoutCSVLoadTable('scene');
    }
    if (sel === 'Products') {
      this.workspaceLayoutCSVLoadTable('product');
      this.workspaceLayoutCSVProductFieldsInit().then(() => {});
    }
    if (sel === 'Custom Data') {
      this.workspaceLayoutSceneDataInit().then(() => {});
    }
  }

  async workspaceLayoutSceneDataInit() {
    let editInfoBlocks = gAPPP.a.modelSets['block'].queryCache('blockFlag', 'displayfieldedits');

    let results = await gAPPP.a.readProjectRawData(gAPPP.a.profile.selectedWorkspace, 'sceneRows')
    this.sceneCSVData = [];
    if (results) this.sceneCSVData = results;
    results = await gAPPP.a.readProjectRawData(gAPPP.a.profile.selectedWorkspace, 'assetRows')
    this.assetCSVData = [];
    if (results) this.assetCSVData = results;
    results = await gAPPP.a.readProjectRawData(gAPPP.a.profile.selectedWorkspace, 'productRows')
    this.productCSVData = [];
    if (results) this.productCSVData = results;
    this.productCSVData = this.productCSVData.sort((a, b) => {
      let aIndex = GLOBALUTIL.getNumberOrDefault(a.index, 0);
      let bIndex = GLOBALUTIL.getNumberOrDefault(b.index, 0);
      if (aIndex > bIndex)
        return 1;
      if (aIndex < bIndex)
        return -1;
      return 0;
    });

    let listHTML = '';
    this.sceneFieldEditBlocks = [];

    let checked = " selected";
    for (let id in editInfoBlocks) {
      let data = editInfoBlocks[id].genericBlockData;
      let parts = data.split('||');
      let mainLabel = parts[0];
      let tab = parts[1];
      let name = parts[2];
      let asset = parts[3];
      let fieldList = [];
      for (let c = 4, l = parts.length; c < l; c++) {
        let subParts = parts[c].split(':');
        let field = subParts[0];
        let type = subParts[1];

        fieldList.push({
          field,
          type
        });
      }

      this.sceneFieldEditBlocks.push({
        mainLabel,
        tab,
        name,
        asset,
        fieldList
      });

      listHTML += `<option${checked} value="${this.sceneFieldEditBlocks.length - 1}">${mainLabel}</option>`;
      checked = '';
    }

    this.scene_options_list = this.domPanel.querySelector('.scene_options_list');
    this.scene_options_list.innerHTML = listHTML;
    this.scene_options_list.addEventListener('input', e => this.workspaceLayoutSceneDataListChange());

    this.workspaceLayoutSceneDataListChange();
  }
  workspaceLayoutSceneDataListChange() {
    let index = this.scene_options_list.selectedIndex;
    if (index < 0)
      return;
    let fieldData = this.sceneFieldEditBlocks[index];

    let fieldHtml = '<input type="file" class="sotexturepathuploadfile" style="display:none;" />';
    let name = fieldData.name;
    let asset = fieldData.asset;

    let __getSceneOptionsValue = (tab, name, asset, field) => {
      if (tab === 'layout')
        tab = 'scene';
      if (!this[tab + 'CSVData'])
        return '';
      let rows = this[tab + 'CSVData'];
      for (let c = 0, l = rows.length; c < l; c++)
        if (rows[c]['name'] === name && rows[c]['asset'] === asset)
          return rows[c][field];

      return '';
    }

    for (let c = 0, l = fieldData.fieldList.length; c < l; c++) {
      let type = fieldData.fieldList[c].type;
      let field = fieldData.fieldList[c].field;

      if (type === 'num') {
        let v = __getSceneOptionsValue(fieldData.tab, name, asset, field);
        fieldHtml += `<label class="csv_scene_field_text_wrapper">
            ${field}<input data-field="${field}" type="text" value="${v}" data-tab="${fieldData.tab}"
            data-type="${type}" data-name="${name}" data-asset="${asset}" />
          </label>`;
      }

      if (type === 'image') {
        let v = __getSceneOptionsValue(fieldData.tab, name, asset, field);
        fieldHtml += `<label class="csv_scene_field_upload_wrapper">${field}
            <input data-field="${field}" type="text" value="${v}" data-tab="${fieldData.tab}" id="scene_edit_field_${c}_${field}"
            data-type="${type}" data-name="${name}" data-asset="${asset}" style="width:15em;" />
          </label>
          <button data-fieldid="scene_edit_field_${c}_${field}" class="btn-sb-icon sceneoptionsupload">
            <i class="material-icons">cloud_upload</i></button><br>`;
      }
    }

    this.scene_options_edit_fields.innerHTML = fieldHtml;
    this.soUploadImageFile = this.scene_options_edit_fields.querySelector('.sotexturepathuploadfile');
    this.soUploadImageFile.addEventListener('change', e => this.workspaceLayoutSceneDataUploadImage(e));
    let inputs = this.scene_options_edit_fields.querySelectorAll('input');
    inputs.forEach(i => i.addEventListener('input', e => this.workspaceLayoutSceneDataValueChange(i, e)));
    let uploadButtons = this.scene_options_edit_fields.querySelectorAll('button.sceneoptionsupload');
    uploadButtons.forEach(i => i.addEventListener('click', e => {
      this.soUploadImageFile.btnCTL = i;
      this.soUploadImageFile.editCTL = this.scene_options_edit_fields.querySelector('#' + i.dataset.fieldid);
      this.soUploadImageFile.click();
    }));

    return;
  }
  async workspaceLayoutSceneDataValueChange(ctl, e) {
    let data = ctl.dataset;
    let tab = data.tab,
      name = data.name,
      asset = data.asset,
      field = data.field,
      value = ctl.value;
    if (tab === 'layout')
      tab = 'scene';
    if (!this[tab + 'CSVData'])
      return;

    let dataChanged = false;
    let rows = this[tab + 'CSVData'];
    for (let c = 0, l = rows.length; c < l; c++)
      if (rows[c]['name'] === name && rows[c]['asset'] === asset) {
        if (rows[c][field] !== value) {
          dataChanged = true;
          rows[c][field] = value;
        }
      }

    if (dataChanged) {
      await gAPPP.a.writeProjectRawData(gAPPP.a.profile.selectedWorkspace, tab + 'Rows', rows);
      gAPPP.updateGenerateDataTimes();
    }

    return;
  }
  async workspaceLayoutSceneDataUploadImage() {
    let fileBlob = this.soUploadImageFile.files[0];

    if (!fileBlob)
      return;

    let fireSet = gAPPP.a.modelSets['block'];
    let key = gAPPP.a.profile.selectedWorkspace + '/scenedatafiles';
    let uploadResult = await fireSet.setBlob(key, fileBlob, fileBlob.name);
    this.soUploadImageFile.editCTL.value = uploadResult.downloadURL;
    this.workspaceLayoutSceneDataValueChange(this.soUploadImageFile.editCTL);
    return;
  }

  async workspaceLayoutCSVLoadTable(tableName) {
    let results = await gAPPP.a.readProjectRawData(gAPPP.a.profile.selectedWorkspace, tableName + 'Rows')
    let data = [];
    if (results) data = results;

    if (tableName === 'product')
      data = data.sort((a, b) => {
        let aIndex = GLOBALUTIL.getNumberOrDefault(a.index, 0);
        let bIndex = GLOBALUTIL.getNumberOrDefault(b.index, 0);
        if (aIndex > bIndex)
          return 1;
        if (aIndex < bIndex)
          return -1;
        return 0;
      });

    let columns = [];
    columns.push({
      rowHandle: true,
      formatter: "handle",
      headerSort: false,
      cssClass: 'row-handle-table-cell',
      frozen: true,
      resizable: false,
      width: 45,
      minWidth: 45
    });
    if (tableName !== 'product')
      columns.push({
        rowHandle: true,
        formatter: "rownum",
        headerSort: false,
        resizable: false,
        align: 'center',
        frozen: true,
        width: 30
      });
    columns.push({
      formatter: (cell, formatterParams) => {
        return "<i class='material-icons'>delete</i>";
      },
      headerSort: false,
      frozen: true,
      align: 'center',
      cssClass: 'delete-table-cell',
      resizable: false,
      tag: 'delete',
      cellClick: (e, cell) => {
        cell.getRow().delete();
        this.workspaceLayoutCSVTableReformat(tableName);
      },
      width: 30
    });
    columns.push({
      formatter: (cell, formatterParams) => {
        return "<i class='material-icons'>add</i>";
      },
      headerSort: false,
      frozen: true,
      align: 'center',
      tag: 'addBelow',
      resizable: false,
      cssClass: 'add-table-cell',
      cellClick: (e, cell) => {
        cell.getTable().addData([{
            name: ''
          }], false, cell.getRow())
          .then(rows => {
            this.workspaceLayoutCSVTableReformat(tableName);
            rows[0].getCells()[2].edit();
          })
      },
      width: 30
    });

    let colList = this[tableName + 'ColumnList'];
    for (let c = 0, l = colList.length; c < l; c++) {
      let field = colList[c];
      let rightColumn = this.rightAlignColumns.indexOf(field) !== -1;
      let align = rightColumn ? 'right' : 'left';
      let longLabel = colList[c].length > 9;
      let cssClass = rightColumn ? 'right-column-data' : '';
      let minWidth = rightColumn ? 75 : 150;
      if (!rightColumn && longLabel)
        cssClass += 'tab-header-cell-large';

      let col = {
        title: field,
        field,
        editor: true,
        headerSort: false,
        align,
        formatter: rightColumn ? 'money' : undefined,
        layoutColumnsOnNewData: true,
        cssClass,
        resizable: false,
        headerVertical: longLabel,
        minWidth
      };

      if (field === 'image' || field === 'meshpath' || field === 'texturepath' || field === 'bmppath') {
        col.width = '40em';
      }

      columns.push(col);
    }

    if (tableName === 'product') {
      columns[4].frozen = true;
      columns[3].frozen = true;
      let tCol = columns[4];
      let tCol2 = columns[3];
      columns[4] = columns[2];
      columns[3] = columns[1];
      columns[2] = tCol;
      columns[1] = tCol2;
      tCol2.title = '';
    } else {
      columns[4].frozen = true;
      let tCol = columns[4];
      columns[4] = columns[3];
      columns[3] = columns[2];
      columns[2] = tCol;
    }
    columns[1].align = 'right';
    columns[1].cssClass = 'right-column-data';
    columns[1].minWidth = 45;
    columns[2].minWidth = 200;

    this.dataTableDom = document.createElement('div');
    this.data_table_panel.innerHTML = '';
    this.data_table_panel.appendChild(this.dataTableDom);
    this.editTable = new Tabulator(this.dataTableDom, {
      data,
      virtualDom: true,
      height: '100%',
      width: '100%',
      movableRows: true,
      movableColumns: false,
      selectable: false,
      layout: "fitData",
      columns,
      rowClick: (e, row) => this.workspaceLayoutCSVRowClick(e, row, tableName),
      dataEdited: data => this.workspaceLayoutCSVTableChange(true),
      rowMoved: (row) => this.workspaceLayoutCSVRowMoved(tableName, row)
    });
    this.editTable.cacheData = JSON.stringify(this.editTable.getData());
    this.tableName = tableName;
  }
  workspaceLayoutCSVRowClick(e, row, tableName) {
    if (tableName === 'product') {
      return;
      this.workspaceLayoutCSVProductShow(row.getData().name);
    }
  }
  workspaceLayoutCSVRowMoved(tableName, row) {
    let tbl = this.editTable;
    let data = tbl.getData();

    let indexes = [];
    for (let c = 0, l = data.length; c < l; c++)
      indexes.push(data[c].index);

    indexes.sort((a, b) => {
      let aIndex = GLOBALUTIL.getNumberOrDefault(a, 0);
      let bIndex = GLOBALUTIL.getNumberOrDefault(b, 0);
      if (aIndex > bIndex)
        return 1;
      if (aIndex < bIndex)
        return -1;
      return 0;
    });

    for (let c = 0, l = data.length; c < l; c++)
      data[c].index = indexes[c];
    tbl.setData(data).then(() => {});
    this.workspaceLayoutCSVTableChange();
  }
  workspaceLayoutCSVTableReformat(tableName) {
    let tbl = this.editTable;
    let rows = tbl.getRows();
    for (let c = 0, l = rows.length; c < l; c++)
      rows[c].reformat();

    this.workspaceLayoutCSVTableChange();
  }
  workspaceLayoutCSVTableTestDirty(tableName) {
    let tbl = this.editTable;
    let setDirty = false;
    let newCache = JSON.stringify(this.editTable.getData());
    if (this.editTable.cacheData !== newCache)
      setDirty = true;

    return setDirty;
  }
  async workspaceLayoutCSVTableSave(tableName) {
    if (!this.workspaceLayoutCSVTableTestDirty(tableName))
      return Promise.resolve();

    let tbl = this.editTable;
    let data = tbl.getData();

    for (let c = 0, l = data.length; c < l; c++) {
      delete data[c][undefined];

      for (let i in data[c])
        if (data[c][i] === undefined)
          data[c][i] = '';
    }

    await gAPPP.a.writeProjectRawData(gAPPP.a.profile.selectedWorkspace, tableName + 'Rows', data);
    gAPPP.updateGenerateDataTimes();
    return;
  }
  async workspaceLayoutCSVTableChange(generateAnimationOptions) {
    let dirty = this.workspaceLayoutCSVTableTestDirty(this.tableName);

    if (!dirty)
      return;

    await this.workspaceLayoutCSVTableSave(this.tableName);

    return;
  }

  async workspaceLayoutCSVProductFieldsInit() {
    this.record_field_list_form = this.domPanel.querySelector('.layout_product_data_panel form');
    this.record_field_list_form.innerHTML = '';
    this.fieldDivByName = {};

    for (let c = 0, l = this.fieldList.length; c < l; c++) {
      let title = this.fieldList[c];
      let id = 'fieldid' + c.toString();
      this.fieldDivByName[title] = document.createElement('div');
      this.fieldDivByName[title].innerHTML = `<label>${this.fieldList[c]}
        <input type="text" class="fieldinput ${title}edit" list="${this.fieldList[c]}list" />
      </label>`;

      if (title === 'x') {
        let select = document.createElement('select');
        select.style.position = 'absolute';
        select.style.top = '-.75em';
        select.style.right = '5px';
        select.style.width = '1.5em';
        select.setAttribute('id', 'select-position-preset');
        this.fieldDivByName[title].appendChild(select);
        this.fieldDivByName[title].style.position = 'relative';
      }
      if (title === 'image') {
        let btn = document.createElement('button');
        btn.style.position = 'absolute';
        btn.style.top = '-2.5em';
        btn.style.left = '75%';
        btn.innerHTML = '<i class="material-icons">cloud_upload</i>';
        btn.setAttribute('class', 'texturepathupload');
        this.fieldDivByName[title].appendChild(btn);
        this.fieldDivByName[title].style.position = 'relative;'
      }

      this.record_field_list_form.appendChild(this.fieldDivByName[title]);
    }

    this.uploadImageButton = this.record_field_list_form.querySelector('.texturepathupload');
    this.uploadImageEditField = this.record_field_list_form.querySelector('.imageedit');
    this.uploadImageFile = this.layout_product_data_panel.querySelector('.texturepathuploadfile');
    this.uploadImageFile.addEventListener('change', e => this.__uploadImageFile());
    this.uploadImageButton.addEventListener('click', e => this.uploadImageFile.click());

    let btn = document.createElement('button');
    btn.setAttribute('id', 'update_product_fields_post');
    btn.innerHTML = '<i class="material-icons">add</i>';
    this.record_field_list_form.appendChild(btn);
    this.addNewBtn = document.getElementById('update_product_fields_post');
    this.addNewBtn.addEventListener('click', e => this.workspaceLayoutCSVProductAdd(e));

    this.assetEditField = this.record_field_list_form.querySelector('.assetedit');
    this.assetEditField.addEventListener('input', e => this.workspaceLayoutCSVProductUpdateType());

    this.workspaceLayoutCSVProductUpdateType();

    this.productData = await new gCSVImport(gAPPP.a.profile.selectedWorkspace).initProducts();
    this.products = this.productData.products;
    this.productBySKU = this.productData.productsBySKU;

    let basketListHTML = '';
    if (this.productData.displayBlocks)
      for (let c = 0, l = this.productData.displayBlocks.length; c < l; c++)
        basketListHTML += `<option>${this.productData.displayBlocks[c]}</option>`;
    document.getElementById('blocklist').innerHTML = basketListHTML;

    let positionInfo = gAPPP.a.modelSets['block'].getValuesByFieldLookup('blockFlag', 'displaypositions');
    let sel = document.getElementById('select-position-preset');
    if (positionInfo) {
      let arr = positionInfo.genericBlockData.split('|');
      let positionHTML = '<option></option>';

      for (let c = 0, l = arr.length; c < l - 2; c += 3) {
        let frag = arr[c] + ',' + arr[c + 1] + ',' + arr[c + 2];
        positionHTML += `<option value="${frag}">${(c / 3) + 1} ${frag}</option>`;
      }

      sel.innerHTML = positionHTML;
      sel.addEventListener('input', e => {
        let vals = sel.value.split(',');

        if (vals.length === 3) {
          let xd = this.record_field_list_form.querySelector('.xedit');
          let yd = this.record_field_list_form.querySelector('.yedit');
          let zd = this.record_field_list_form.querySelector('.zedit');

          xd.value = vals[0];
          yd.value = vals[1];
          zd.value = vals[2];
        }

        sel.selectedIndex = 0;
      });
    }
  }
  workspaceLayoutCSVProductCheckPosition(x, y, z) {
    let positionInfo = gAPPP.a.modelSets['block'].getValuesByFieldLookup('blockFlag', 'displaypositions');
    let sel = document.getElementById('select-position-preset');
    if (positionInfo) {
      let arr = positionInfo.genericBlockData.split('|');
      let positionHTML = '<option>positions</option>';

      for (let c = 0, l = arr.length; c < l - 2; c += 3) {
        if (arr[c] == x && arr[c + 1] == y && arr[c + 2] == z)
          return c / 3 + 1;
      }
    }

    return -1;
  }
  workspaceLayoutCSVProductUpdateType() {
    let fieldsToShow = null;
    if (this.assetEditField.value === 'message')
      fieldsToShow = this.messageOnlyFields;
    else if (this.assetEditField.value === 'product')
      fieldsToShow = this.productOnlyFields;

    for (let i in this.fieldDivByName) {
      if (fieldsToShow) {
        if (fieldsToShow.indexOf(i) === -1)
          this.fieldDivByName[i].style.display = 'none';
        else
          this.fieldDivByName[i].style.display = '';
      } else {
        if (i !== 'asset' && i !== 'name' && i !== 'index')
          this.fieldDivByName[i].style.display = 'none';
        else
          this.fieldDivByName[i].style.display = '';
      }
    }
  }
  workspaceLayoutCSVProductShow(name) {
    let fields = this.record_field_list_form.querySelectorAll('.fieldinput');
    let p = this.workspaceLayoutCSVProductByName(name);
    let row = {};
    if (p)
      row = p.origRow;

    if (row.asset === 'block') {
      row.asset = 'displayproduct';
    }
    for (let c = 0, l = this.fieldList.length; c < l; c++) {
      let f = fields[c];
      let v = row[this.fieldList[c]];
      v = (v !== undefined) ? v : '';
      f.value = v;
    }

    this.workspaceLayoutCSVProductUpdateType();
  }
  workspaceLayoutCSVProductByName(name) {
    for (let c = 0, l = this.productData.products.length; c < l; c++)
      if (this.productData.products[c].origRow.name === name)
        return this.productData.products[c];

    if (name === 'FollowCamera')
      return {
        origRow: this.productData.cameraOrigRow
      };

    return null;
  }
  workspaceLayoutCSVProductAdd(e) {
    let fields = this.record_field_list_form.querySelectorAll('.fieldinput');

    let name = fields[0].value;
    if (!name) {
      alert('name required');
      return;
    }
    let assetType = fields[1].value;
    if (!assetType) {
      alert('asset type required');
      return;
    }

    let newRow = {};
    for (let c = 0, l = fields.length; c < l; c++)
      newRow[this.fieldList[c]] = fields[c].value;

    let rows = this.editTable.getData();
    rows.push(newRow);
    this.editTable.setData(rows);
    this.workspaceLayoutCSVTableChange();

    e.preventDefault();
    return true;
  }
}
