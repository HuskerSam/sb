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
        if (subKey === 'Generate' || subKey === 'LayoutProducts' || subKey === 'LayoutCustom') {
          this.domPanel.innerHTML = this.workspaceLayoutTemplate();
          this.workspaceLayoutRegister();

          if (this.bView.canvasHelper) {
            this.bView.canvasHelper.loadingScreen.style.display = 'none';
          }
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
      &nbsp;<a href="${this.bView.genQueryString(null, null, null, null, 'LayoutProducts')}" class="tag_key_redirect" data-value="LayoutProducts" data-type="w">Products</a>
      &nbsp;<a href="${this.bView.genQueryString(null, null, null, null, 'LayoutCustom')}" class="tag_key_redirect" data-value="LayoutCustom" data-type="w">Scene Data</a>
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

    let gi = new gCSVImport(gAPPP.loadedWID);
    let sceneRecords = await gi.dbFetchByLookup('block', 'blockFlag', 'scene');
    if (sceneRecords.recordIds.length > 0) {
      let href = this.bView.genQueryString(null, 'block', sceneRecords.recordIds[0]);
      html += `Generated animation block: <b><a href="${href}" class="tag_key_redirect" data-tag="block"
       data-key="${sceneRecords.recordIds[0]}">${sceneRecords.records[0].title}</a></b> <span class="csv_data_date_span">${gAPPP.animationGeneratedDateDisplay}</span>`;
      html += ` &nbsp; <a href="/display?wid=${gAPPP.loadedWID}" target="_blank">/display</a>`;
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
    &nbsp;
    <button class="export_asset_json_button">Export Workspace</button>
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
    this.import_csv_file.addEventListener('change', e => this.workspaceImportCSV());
    this.import_csv_records = this.domPanel.querySelector('.import_csv_records');
    this.import_csv_records.addEventListener('click', e => this.import_csv_file.click());

    this.import_asset_json_file = this.domPanel.querySelector('.import_asset_json_file');
    this.import_asset_json_file.addEventListener('change', e => this.workspaceImportJSON());
    this.import_asset_json_button = this.domPanel.querySelector('.import_asset_json_button');
    this.import_asset_json_button.addEventListener('click', e => this.import_asset_json_file.click());
    this.export_asset_json_button = this.domPanel.querySelector('.export_asset_json_button');
    this.export_asset_json_button.addEventListener('click', e => this.workspaceExportJSON());
  }
  workspaceImportCSV() {
    if (this.import_csv_file.files.length > 0) {
      Papa.parse(this.import_csv_file.files[0], {
        header: true,
        complete: results => {
          if (results.data) {
            for (let c = 0, l = results.data.length; c < l; c++) {
              new gCSVImport(gAPPP.loadedWID).addCSVRow(results.data[c]);
            }
          }
        }
      });
    }
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
  async workspaceExportJSON() {
    let projectData = await firebase.database().ref('/project/' + gAPPP.loadedWID).once('value');
    let json = projectData.val();

    json.assetExportTag = 'workspace';
    json.assetExportKey = gAPPP.loadedWID;
    let jsonStr = JSON.stringify(json, null, 4);

    let element = document.createElement('a');
    let title = json.title;
    if (!title)
      title = 'workspace';
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(jsonStr));
    element.setAttribute('download', title + '.json');

    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }
  async workspaceImportJSON() {
    if (this.import_asset_json_file.files.length > 0) {
      let reader = new FileReader();
      reader.onload = e => onJSONLoad(e);
      reader.readAsText(this.import_asset_json_file.files[0]);
      let onJSONLoad = (e) => {
        let json = e.target.result;
        try {
          json = JSON.parse(json);
        } catch (e) {
          alert('error parsing json check console');
          console.log('error parsing json for import', e);
          return;
        }

        let eleType = json.assetExportTag;

        if (eleType === 'workspace') {
          if (!gAPPP.loadedWID) {
            alert('no loaded workspace');
            return;
          }
          if (confirm(`WORKSPACE IMPORT\n Importing this file will blend (possibly overwrite) ` +
              ` with the current workspace - continue?`)) {
            let updates = {};
            let tagList = ['block', 'blockchild', 'frame', 'material', 'shape', 'texture', 'mesh'];
            tagList.forEach(tag => {
              let coll = json[tag];
              for (let key in coll) {
                updates['/project/' + gAPPP.loadedWID + '/' + tag + '/' + key] = coll[key];
              }
            });
            return firebase.database().ref().update(updates);
          }
          return;
        }

        if (!gAPPP.a.modelSets[eleType]) {
          alert('no supported assetExportTag found');
          return;
        }

        delete json.assetExportTag;
        delete json.assetExportKey;
        if (eleType !== 'block') {
          json.sortKey = new Date().getTime();
          gAPPP.a.modelSets[eleType].createWithBlobString(json).then(results => {
            this.bView.openNewWindow(eleType, results.key);
          });
        } else {
          json.sortKey = new Date().getTime();
          let blockFrames = json.frames;
          let blockChildren = json.children;

          let __importFrames = (frames, parentKey) => {
            for (let c = 0, l = frames.length; c < l; c++) {
              frames[c].parentKey = parentKey;
              gAPPP.a.modelSets['frame'].createWithBlobString(frames[c]).then(frameResult => {});
            }
          };

          json.children = undefined;
          delete json.children;
          json.frames = undefined;
          delete json.frames;
          gAPPP.a.modelSets['block'].createWithBlobString(json).then(blockResults => {
            __importFrames(blockFrames, blockResults.key);

            for (let c = 0, l = blockChildren.length; c < l; c++) {
              let child = blockChildren[c];
              let childFrames = child.frames;
              child.frames = undefined;
              delete child.frames;
              child.parentKey = blockResults.key;

              gAPPP.a.modelSets['blockchild'].createWithBlobString(child).then(
                childResults => __importFrames(childFrames, childResults.key));
            }

            this.bView.openNewWindow(eleType, blockResults.key);
          });
        }
      };
    }
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
      'x', 'y', 'z',
      'rx', 'ry', 'rz',
      'text1', 'text2', 'image', 'block',
      'sku', 'price', 'count', 'pricetext',
      'height', 'width',
       'displaystyle', 'textfontfamily', 'materialname'
    ];
    this.messageOnlyFields = [
      'index', 'name', 'asset', 'text1', 'text2',
      'height', 'width', 'x', 'y', 'z',
      'rx', 'ry', 'rz', 'displaystyle', 'textfontfamily', 'materialname'
    ];
    this.productOnlyFields = [
      'index', 'name', 'asset',
      'text1', 'text2', 'image', 'block',
      'sku', 'price', 'count', 'pricetext',
      'x', 'y', 'z',
      'rx', 'ry', 'rz', 'displaystyle', 'textfontfamily'
    ];

    this.productColumnList = this.fieldList;
    this.rightAlignColumns = [
      'price', 'count', 'height', 'width', 'x', 'y', 'z', 'rx', 'ry', 'rz'
    ];

    this.scene_layout_data_panel = this.domPanel.querySelector('.scene_layout_data_panel');
    this.data_table_panel = this.domPanel.querySelector('.data_table_panel');
    this.scene_options_edit_fields = this.domPanel.querySelector('.scene_options_edit_fields');
    this.layout_product_data_panel = this.domPanel.querySelector('.layout_product_data_panel');

    let wsView = this.bView.dataview_record_key.value;
    this.scene_layout_data_panel.style.display = (wsView === 'LayoutCustom') ? 'flex' : 'none';
    this.layout_product_data_panel.style.display = (wsView === 'LayoutProducts') ? 'block' : 'none';
    this.scene_options_edit_fields.style.display = (wsView === 'LayoutCustom') ? 'block' : 'none';
    if (this.editTable) {
      this.editTable.destroy();
      this.editTable = null;
    }
    if (wsView === 'LayoutProducts') {
      this.data_table_panel.style.display = 'flex';
      this.data_table_panel.innerHTML = 'Loading...';
    } else {
      this.data_table_panel.innerHTML = '';
      this.data_table_panel.style.display = 'none';
    }

    if (wsView === 'LayoutProducts') {
      this.workspaceLayoutCSVLoadTable();
      this.workspaceLayoutCSVProductFieldsInit();
    }
    if (wsView === 'LayoutCustom') {
      this.workspaceLayoutSceneDataInit();
    }
  }

  async workspaceLayoutSceneDataInit() {
    let editInfoBlocks = gAPPP.a.modelSets['block'].queryCache('blockFlag', 'displayfieldedits');

    let csvImport = new gCSVImport(gAPPP.loadedWID);
    let results = await csvImport.readProjectRawData('sceneRows')
    this.sceneCSVData = [];
    if (results) this.sceneCSVData = results;
    results = await csvImport.readProjectRawData('assetRows')
    this.assetCSVData = [];
    if (results) this.assetCSVData = results;
    results = await csvImport.readProjectRawData('productRows')
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

    let __getSceneOptionsValue = (tab, name, asset, field = null) => {
      if (tab === 'layout')
        tab = 'scene';
      if (!this[tab + 'CSVData'])
        return '';
      let rows = this[tab + 'CSVData'];
      for (let c = 0, l = rows.length; c < l; c++)
        if (rows[c]['name'] === name && rows[c]['asset'] === asset)
          if (field) {
            let v = rows[c][field];
            if (v === undefined)
              return '';
            return v;
          }
          else
            return rows[c];
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
            data-type="${type}" data-name="${name}" data-imageid="scene_edit_image_${c}_${field}" data-asset="${asset}" list="sbstoreimageslist" style="width:15em;" />
            <br>
            <img id="scene_edit_image_${c}_${field}" crossorigin="anonymous" src="${this.url(v)}" class="scene_edit_image" />
          </label>
          <button data-fieldid="scene_edit_field_${c}_${field}" class="btn-sb-icon sceneoptionsupload">
            <i class="material-icons">cloud_upload</i></button><br>`;
      }

      if (type === 'childname') {
        let firstChildInfo = gAPPP.a.modelSets['blockchild'].getValuesByFieldLookup('blockFlag', 'basketblockchild');
        let v = firstChildInfo.childName;
        fieldHtml += `<label class="csv_scene_field_text_wrapper">
          ${field}<input data-field="${field}" type="text" value="${v}" data-tab="${fieldData.tab}"
          data-type="${type}" data-name="${name}" data-asset="${asset}" data-list="basketblocktemplatelist" />
        </label>`;
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
      type = data.type,
      imageid = data.imageid,
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
      let csvImport = new gCSVImport(gAPPP.loadedWID);
      await csvImport.writeProjectRawData(tab + 'Rows', rows);
      gAPPP.updateGenerateDataTimes();
    }

    if (type === 'image') {
      document.getElementById(imageid).setAttribute('src', this.url(value));
      let textureName = '';
      if (asset === 'shape') {
        textureName = name + 'material';
      }

      if (textureName) {
        let tid = gAPPP.a.modelSets['texture'].getIdByFieldLookup('title', textureName);
        let csvImport = new gCSVImport(gAPPP.loadedWID);
        await csvImport.dbSetRecordFields('texture', {
          'url': value
        }, tid);
      }
    }

    if (type === 'childname') {
      let bcid = gAPPP.a.modelSets['blockchild'].getIdByFieldLookup('blockFlag', 'basketblockchild');
      let csvImport = new gCSVImport(gAPPP.loadedWID);
      await csvImport.dbSetRecordFields('blockchild', {
        'childName': value
      }, bcid);
    }

    if (field === 'scaleu' || field === 'scalev' || field === 'voffset' || field === 'uoffset') {
      let textureName = '';
      if (asset === 'shape') {
        textureName = name;
      }

      if (textureName) {
        let fieldUpdate = 'uScale';
        if (field === 'scalev')
          fieldUpdate = 'vScale';
        if (field === 'uoffset')
          fieldUpdate = 'uOffset';
        if (field === 'voffset')
          fieldUpdate = 'vOffset';
        let tid = gAPPP.a.modelSets['texture'].getIdByFieldLookup('title', textureName);
        let csvImport = new gCSVImport(gAPPP.loadedWID);
        await csvImport.dbSetRecordFields('texture', {
          [fieldUpdate]: value
        }, tid);
      }
    }

    return;
  }
  url(rawUrl) {
    if (rawUrl.substring(0, 3) === 'sb:') {
      rawUrl = gAPPP.cdnPrefix + 'textures/' + rawUrl.substring(3);
    }
    return rawUrl;
  }
  async workspaceLayoutSceneDataUploadImage() {
    let fileBlob = this.soUploadImageFile.files[0];

    if (!fileBlob)
      return;

    let fireSet = gAPPP.a.modelSets['block'];
    let key = gAPPP.loadedWID + '/scenedatafiles';
    let uploadResult = await fireSet.setBlob(key, fileBlob, fileBlob.name);
    this.soUploadImageFile.editCTL.value = uploadResult.downloadURL;
    this.workspaceLayoutSceneDataValueChange(this.soUploadImageFile.editCTL);
    return;
  }

  async workspaceLayoutCSVLoadTable() {
    let csvImport = new gCSVImport(gAPPP.loadedWID);
    let results = await csvImport.readProjectRawData('productRows')
    let data = [];
    if (results) data = results;

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


    columns.push({
      formatter: (cell, formatterParams) => {
        return "<i class='material-icons'>delete</i>";
      },
      headerSort: false,
      frozen: true,
      align: 'center',
      cssClass: 'delete-table-cell',
      resizable: false,
      cellClick: (e, cell) => {
        cell.getRow().delete();
        this.workspaceLayoutCSVTableReformat();
      },
      width: 30
    });

      columns.push({
        formatter: (cell, formatterParams) => {
          return "<i class='material-icons'>save_alt</i>";
        },
        headerSort: false,
        frozen: true,
        align: 'center',
        resizable: false,
        cssClass: 'clone-table-cell',
        cellClick: (e, cell) => {
          let row = cell.getRow();
          this.workspaceLayoutCSVProductShow(row.getData().name, row);
        },
        width: 30
      });

    let colList = this.productColumnList;
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

      columns[4].frozen = true;
      columns[3].frozen = true;
      let tCol = columns[4];
      let tCol2 = columns[3];
      columns[4] = columns[2];
      columns[3] = columns[1];
      columns[2] = tCol;
      columns[1] = tCol2;
      tCol2.title = '';

    columns[1].align = 'right';
    columns[1].cssClass = 'right-column-data';
    columns[1].minWidth = 45;
    columns[2].minWidth = 200;


    let movableRows = true;

    this.dataTableDom = document.createElement('div');
    this.data_table_panel.innerHTML = '';
    this.data_table_panel.appendChild(this.dataTableDom);
    let height = '100%';
    this.editTable = new Tabulator(this.dataTableDom, {
      data,
      movableRows,
      layout: "fitData",
      columns,
      height,
      virtualDom: true,
      selectable: false,
      dataEdited: (data, a, b, c) => this.workspaceLayoutCSVTableChange(),
      rowMoved: (row) => this.workspaceLayoutCSVRowMoved(row)
    });
    this.editTable.cacheData = JSON.stringify(this.editTable.getData());
  }
  workspaceLayoutCSVRowMoved(row) {
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
    tbl.setData(data);
    this.workspaceLayoutCSVTableChange();
  }
  workspaceLayoutCSVTableReformat() {
    let tbl = this.editTable;
    let rows = tbl.getRows();
    for (let c = 0, l = rows.length; c < l; c++)
      rows[c].reformat();

    this.workspaceLayoutCSVTableChange();
  }
  workspaceLayoutCSVTableTestDirty() {
    let tbl = this.editTable;
    let setDirty = false;
    let newCache = JSON.stringify(this.editTable.getData());
    if (this.editTable.cacheData !== newCache)
      setDirty = true;

    return setDirty;
  }
  async workspaceLayoutCSVTableSave() {
    if (!this.workspaceLayoutCSVTableTestDirty())
      return;

    let tbl = this.editTable;
    let data = tbl.getData();

    for (let c = 0, l = data.length; c < l; c++) {
      delete data[c][undefined];

      for (let i in data[c])
        if (data[c][i] === undefined)
          data[c][i] = '';
    }

    let csvImport = new gCSVImport(gAPPP.loadedWID);
    await csvImport.writeProjectRawData('productRows', data);
    this.editTable.cacheData = JSON.stringify(this.editTable.getData());
    gAPPP.updateGenerateDataTimes();
    return;
  }
  async workspaceLayoutCSVTableChange() {
    let dirty = this.workspaceLayoutCSVTableTestDirty();

    if (!dirty)
      return;

      let newData = this.editTable.getData();
      let oldData = JSON.parse(this.editTable.cacheData);

      let newRows = {};
      newData.forEach(row => {
        let title = row['name'];
        if (title)
          newRows[title] = row;
      });

      let oldRows = {};
      oldData.forEach(row => {
        let title = row['name'];
        if (title)
          oldRows[title] = row;
      });

      for (let title in oldRows) {
        let newRow = newRows[title];
        if (newRow) {
          let oldRow = oldRows[title];

          if (oldRow.text1 !== newRow.text1 ||
            oldRow.text2 !== newRow.text2) {

            if ((oldRow.asset === 'product' || oldRow.asset === 'message') && oldRow.displaystyle !== '3dbasic') {
              let textureName = title + '_pricedesc_textplane';
              if (oldRow.asset === 'message')
                textureName = title + '_textplane';
              let tid = gAPPP.a.modelSets['texture'].getIdByFieldLookup('title', textureName);
              let csvImport = new gCSVImport(gAPPP.loadedWID);
              await csvImport.dbSetRecordFields('texture', {
                textureText: newRow.text1,
                textureText2: newRow.text2
              }, tid);
            }

            if ((oldRow.asset === 'product' || oldRow.asset === 'message') && oldRow.displaystyle === '3dbasic') {
              let shape1Name = title + '_signpost_3dtitle';
              if (oldRow.asset === 'message')
                shape1Name = title + '_3dtitle';
              let sid1 = gAPPP.a.modelSets['shape'].getIdByFieldLookup('title', shape1Name);
              let csvImport = new gCSVImport(gAPPP.loadedWID);
              await csvImport.dbSetRecordFields('shape', {
                textText: newRow.text1
              }, sid1);

              let shape2Name = title + '_signpost_3ddesc';
              if (oldRow.asset === 'message')
                shape2Name = title + '_3dtitle2';
              let sid2 = gAPPP.a.modelSets['shape'].getIdByFieldLookup('title', shape2Name);
              let csvImport2 = new gCSVImport(gAPPP.loadedWID);
              await csvImport2.dbSetRecordFields('shape', {
                textText: newRow.text2
              }, sid2);
            }
          }
        }
      }

    await this.workspaceLayoutCSVTableSave();
    gAPPP.updateGenerateDataTimes();
    return;
  }

  async workspaceLayoutCSVProductFieldsInit() {
    this.record_field_list_form = this.domPanel.querySelector('.layout_product_data_panel form');
    this.record_field_list_form.innerHTML = '';
    this.fieldDivByName = {};

    for (let c = 0, l = this.fieldList.length; c < l; c++) {
      let title = this.fieldList[c];
      let id = 'fieldid' + c.toString();
      let listName = this.fieldList[c] + 'list';
      if (title === 'textfontfamily')
        listName = 'fontfamilydatalist';

      this.fieldDivByName[title] = document.createElement('div');
      this.fieldDivByName[title].innerHTML = `<label>${this.fieldList[c]}
        <input type="text" class="fieldinput ${title}edit" list="${listName}" />
      </label>`;

      if (title === 'x') {
        let select = document.createElement('select');
        select.style.width = '1.5em';
        select.setAttribute('id', 'select-position-preset');
        let xFld = this.fieldDivByName[title];
        xFld.appendChild(select);
      }
      if (title === 'image') {
        let select = document.createElement('select');
        select.style.width = '1.5em';
        select.setAttribute('id', 'select-productimages-preset');
        this.fieldDivByName[title].appendChild(select);
        let btn = document.createElement('button');
        btn.innerHTML = '<i class="material-icons">cloud_upload</i>';
        btn.setAttribute('class', 'texturepathupload');
        this.fieldDivByName[title].appendChild(btn);
      }

      this.record_field_list_form.appendChild(this.fieldDivByName[title]);
      if (title === 'asset') {
        let btn = document.createElement('button');
        btn.setAttribute('id', 'update_product_fields_post');
        btn.innerHTML = '<i class="material-icons">add</i>';
        this.record_field_list_form.appendChild(btn);
        this.addNewBtn = document.getElementById('update_product_fields_post');
        this.addNewBtn.addEventListener('click', e => this.workspaceLayoutCSVProductAdd(e));
      }
      if (title === 'asset' || title === 'z') {
        let br = document.createElement('br');
        this.record_field_list_form.appendChild(br);
      }

    }

    this.uploadImageButton = this.record_field_list_form.querySelector('.texturepathupload');
    this.uploadImageEditField = this.record_field_list_form.querySelector('.imageedit');
    this.uploadImageFile = this.layout_product_data_panel.querySelector('.texturepathuploadfile');
    this.uploadImageFile.addEventListener('change', e => this.__uploadImageFile());
    this.uploadImageButton.addEventListener('click', e => this.uploadImageFile.click());

    this.assetEditField = this.record_field_list_form.querySelector('.assetedit');
    this.assetEditField.addEventListener('input', e => this.workspaceLayoutCSVProductUpdateType());

    this.workspaceLayoutCSVProductUpdateType();

    this.productData = await new gCSVImport(gAPPP.loadedWID).initProducts();
    this.products = this.productData.products;
    this.productBySKU = this.productData.productsBySKU;

    let basketListHTML = '';
    if (this.productData.displayBlocks)
      for (let c = 0, l = this.productData.displayBlocks.length; c < l; c++)
        basketListHTML += `<option>${this.productData.displayBlocks[c]}</option>`;
    document.getElementById('blocklist').innerHTML = basketListHTML;

    let positionInfo = gAPPP.a.modelSets['block'].getValuesByFieldLookup('blockFlag', 'displaypositions');
    let sel = document.getElementById('select-position-preset');
    this.positionFrags = [];
    if (positionInfo) {
      let arr = positionInfo.genericBlockData.split('|');
      let positionHTML = '<option></option>';

      for (let c = 0, l = arr.length; c < l - 5; c += 6) {
        let frag = arr[c] + ',' + arr[c + 1] + ',' + arr[c + 2] + ',' + arr[c + 3] + ',' + arr[c + 4] + ',' + arr[c + 5];
        this.positionFrags.push(frag);
        positionHTML += `<option value="${frag}">${(c / 6) + 1} ${frag}</option>`;
      }

      sel.innerHTML = positionHTML;
      sel.addEventListener('input', e => {
        let vals = sel.value.split(',');

        if (vals.length === 6) {
          let xd = this.record_field_list_form.querySelector('.xedit');
          let yd = this.record_field_list_form.querySelector('.yedit');
          let zd = this.record_field_list_form.querySelector('.zedit');
          let rxd = this.record_field_list_form.querySelector('.rxedit');
          let ryd = this.record_field_list_form.querySelector('.ryedit');
          let rzd = this.record_field_list_form.querySelector('.rzedit');

          xd.value = vals[0];
          yd.value = vals[1];
          zd.value = vals[2];
          rxd.value = vals[3];
          ryd.value = vals[4];
          rzd.value = vals[5];
        }

        sel.selectedIndex = 0;
      });
    }

    let imageInfo = gAPPP.a.modelSets['block'].getValuesByFieldLookup('blockFlag', 'productsignpostimages');
    if (imageInfo) {
      let sel = document.getElementById('select-productimages-preset');
      let arr = imageInfo.genericBlockData.split('|');
      let imageListHTML = '<option></option>';

      for (let c = 0, l = arr.length; c < l - 1; c += 2) {
        let frag = arr[c] + ' : ' + arr[c + 1];
        imageListHTML += `<option value="${arr[c + 1]}">${frag}</option>`;
      }

      sel.innerHTML = imageListHTML;
      sel.addEventListener('input', e => {
        this.record_field_list_form.querySelector('.imageedit').value = sel.value;
      });
    }

  }
  __uploadImageFile() {
    let fileBlob = this.uploadImageFile.files[0];

    if (!fileBlob)
      return;

    this.uploadImageEditField.value = 'Uploading...';

    let fireSet = gAPPP.a.modelSets['block'];
    let key = this.productData.sceneId + '/productfiles';
    fireSet.setBlob(key, fileBlob, fileBlob.name).then(uploadResult => {
      this.uploadImageEditField.value = uploadResult.downloadURL;
    });
  }
  workspaceLayoutCSVProductCheckPosition(x, y, z) {
    let positionInfo = gAPPP.a.modelSets['block'].getValuesByFieldLookup('blockFlag', 'displaypositions');
    let sel = document.getElementById('select-position-preset');
    if (positionInfo) {
      let arr = positionInfo.genericBlockData.split('|');
      let positionHTML = '<option>positions</option>';

      for (let c = 0, l = arr.length; c < l - 5; c += 6) {
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
        let alwaysShow = ['asset', 'name', 'index', 'x', 'y', 'z', 'rx', 'ry', 'rz']
        if (alwaysShow.indexOf(i) === -1)
          this.fieldDivByName[i].style.display = 'none';
        else
          this.fieldDivByName[i].style.display = '';
      }
    }
  }
  workspaceLayoutCSVProductShow(name, tblRow) {
    let fields = this.record_field_list_form.querySelectorAll('.fieldinput');
    let row = tblRow.getData();

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
    for (let c = 0, l = fields.length; c < l; c++) {
      newRow[this.fieldList[c]] = fields[c].value;
      fields[c].value = '';
    }

    let rows = this.editTable.getData();
    let newIndex = GLOBALUTIL.getNumberOrDefault(newRow['index'], 0);
    let rc = 0,
      rl = rows.length;
    for (; rc < rl; rc++) {
      let rowIndex = GLOBALUTIL.getNumberOrDefault(rows[rc]['index'], 0);
      if (newIndex < rowIndex)
        break;
    }
    rows.splice(rc, 0, newRow);
    this.editTable.setData(rows);
    this.workspaceLayoutCSVRowMoved('product', null);

    e.preventDefault();
    return true;
  }
}
