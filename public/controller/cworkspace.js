class cWorkspace {
  constructor(domPanel, subKey, bView) {
    this.domPanel = domPanel;
    this.bView = bView;

    if (subKey === 'Details') {
      let html = this.workspaceDetailsTemplate();
      let blockCount = Object.keys(gAPPP.a.modelSets['block'].fireDataValuesByKey).length;
      let shapeCount = Object.keys(gAPPP.a.modelSets['shape'].fireDataValuesByKey).length;
      let frameCount = Object.keys(gAPPP.a.modelSets['frame'].fireDataValuesByKey).length;
      let meshCount = Object.keys(gAPPP.a.modelSets['mesh'].fireDataValuesByKey).length;
      let textureCount = Object.keys(gAPPP.a.modelSets['texture'].fireDataValuesByKey).length;
      let materialCount = Object.keys(gAPPP.a.modelSets['material'].fireDataValuesByKey).length;
      let blockchildCount = Object.keys(gAPPP.a.modelSets['blockchild'].fireDataValuesByKey).length;
      html += `<hr>
      Block Count: ${blockCount}<br>
      Shape Count: ${shapeCount}<br>
      Frame Count: ${frameCount}<br>
      Mesh Count: ${meshCount}<br>
      Texture Count: ${textureCount}<br>
      Material Count: ${materialCount}<br>
      Block Link Count: ${blockchildCount}<br>`;
      this.domPanel.innerHTML = html;
      this.workspaceDetailsRegister();
      return;
    }
    if (subKey === 'Add / Generate') {
      this.domPanel.innerHTML = this.workspaceNewTemplate();
      this.workspaceNewRegister();
      return;
    }
    if (subKey === 'Layout') {
      this.domPanel.innerHTML = this.workspaceLayoutTemplate();
      this.workspaceLayoutRegister();
      return;
    }
    this.domPanel.innerHTML = 'View';
  }
  workspaceDetailsTemplate() {
    return `<label><span>Name</span><input id="edit-workspace-name" /></label>
      <button id="remove-workspace-button" class="btn-sb-icon"><i class="material-icons">delete</i></button>
      <br>
      <label><span> Z Code </span><input id="edit-workspace-code" style="width:5em;" /></label>
      <br>
      <input type="file" style="display:none;" class="import_csv_file">
      <button class="import_csv_records">Import CSV Records</button>
      &nbsp;
      <input type="file" style="display:none;" class="import_asset_json_file">
      <button class="import_asset_json_button">Import Asset JSON</button>`;
  }
  workspaceDetailsRegister() {
    this.bView.workplacesSelectEditName = this.domPanel.querySelector('#edit-workspace-name');
    if (gAPPP.lastWorkspaceName)
      this.bView.workplacesSelectEditName.value = gAPPP.lastWorkspaceName;
    this.bView.workplacesSelectEditCode = this.domPanel.querySelector('#edit-workspace-code');
    if (gAPPP.lastWorkspaceCode)
      this.bView.workplacesSelectEditCode.value = gAPPP.lastWorkspaceCode;
    this.workplacesRemoveButton = this.domPanel.querySelector('#remove-workspace-button');
    this.bView.workplacesSelectEditName.addEventListener('input', e => this.updateWorkspaceNameCode());
    this.bView.workplacesSelectEditCode.addEventListener('input', e => this.updateWorkspaceNameCode());
    this.workplacesRemoveButton.addEventListener('click', e => this.bView.deleteProject());

    this.import_csv_file = this.domPanel.querySelector('.import_csv_file');
    this.import_csv_file.addEventListener('change', e => this.importAssetCSV());
    this.import_csv_records = this.domPanel.querySelector('.import_csv_records');
    this.import_csv_records.addEventListener('click', e => this.import_csv_file.click());

    this.import_asset_json_file = this.domPanel.querySelector('.import_asset_json_file');
    this.import_asset_json_file.addEventListener('change', e => this.importAssetJSON());
    this.import_asset_json_button = this.domPanel.querySelector('.import_asset_json_button');
    this.import_asset_json_button.addEventListener('click', e => this.import_asset_json_file.click());
  }
  workspaceNewTemplate() {
    return `<label>New Workspace <input id="new-workspace-name" /></label>
    &nbsp;
    <button id="add-workspace-button" class="btn-sb-icon"><i class="material-icons">add</i></button>
    <hr>
    <b>Animation Templates</b>
    <div class="workspace-csv-panel-item">
      <div>ASSETS</div>
      <select id="add_animation_asset_choice">
        <option>Current</option>
        <option>Animation</option>
        <option>Template</option>
        <option>Empty</option>
      </select>
      <select id="add_animation_asset_animation" style="display:none;"></select>
      <select id="add_animation_asset_template" style="display:none;">
        <option>select template</option>
      </select>
      <input type="file" id="add_animation_asset_download_file" style="display:none">
      <button id="add_animation_asset_download_btn" class="btn-sb-icon"><i class="material-icons">file_download</i></button>
      <button id="add_animation_asset_upload_btn" class="btn-sb-icon"><i class="material-icons">cloud_upload</i></button>
    </div>
    <div class="workspace-csv-panel-item">
      <div>LAYOUT</div>
      <select id="add_animation_scene_choice">
        <option>Current</option>
        <option>Animation</option>
        <option>Template</option>
        <option>Empty</option>
      </select>
      <select id="add_animation_scene_animation" style="display:none;"></select>
      <select id="add_animation_scene_template" style="display:none;">
        <option>select template</option>
      </select>
      <input type="file" id="add_animation_scene_download_file" style="display:none">
      <button id="add_animation_scene_download_btn" class="btn-sb-icon"><i class="material-icons">file_download</i></button>
      <button id="add_animation_scene_upload_btn" class="btn-sb-icon"><i class="material-icons">cloud_upload</i></button>
    </div>
    <div class="workspace-csv-panel-item">
      <div>PRODUCTS</div>
      <select id="add_animation_product_choice">
        <option>Current</option>
        <option>Animation</option>
        <option>Template</option>
        <option>Empty</option>
      </select>
      <select id="add_animation_product_animation" style="display:none;"></select>
      <select id="add_animation_product_template" style="display:none;">
        <option>select template</option>
      </select>
      <input type="file" id="add_animation_product_download_file" style="display:none">
      <button id="add_animation_product_download_btn" class="btn-sb-icon"><i class="material-icons">file_download</i></button>
      <button id="add_animation_product_upload_btn" class="btn-sb-icon"><i class="material-icons">cloud_upload</i></button>
    </div>
    <label><input type="checkbox" id="add_animation_current_workspace" /> Use Current Workspace</label>
    <label><input type="checkbox" id="add_animation_clear_scene" checked /> Clear Scene</label>
    <br>
    <button id="generate_animation_workspace_button">Generate Animation</button>`;
  }
  workspaceNewRegister() {
    this.retailRegister();

    this.addProjectButton = document.querySelector('#add-workspace-button');
    this.addProjectButton.addEventListener('click', e => this.addProject());
  }
  updateWorkspaceNameCode() {
    let name = this.bView.workplacesSelectEditName.value.trim();
    let code = this.bView.workplacesSelectEditCode.value.trim();

    if (name.length < 1)
      return;

    gAPPP.a.modelSets['projectTitles'].commitUpdateList([{
      field: 'title',
      newValue: name
    }, {
      field: 'code',
      newValue: code
    }], this.bView.workplacesSelect.value);
  }
  addProject() {
    let name = this.domPanel.querySelector('#new-workspace-name').value.trim();
    if (!name) {
      alert('please enter a name for the new workspace');
      return;
    }
    this.bView._addProject(name).then(() => {});
  }
  importAssetCSV() {
    if (this.import_csv_file.files.length > 0) {
      Papa.parse(this.import_csv_file.files[0], {
        header: true,
        complete: results => {
          if (results.data) {
            for (let c = 0, l = results.data.length; c < l; c++) {
              new gCSVImport(gAPPP.a.profile.selectedWorkspace).addCSVRow(results.data[c]).then(() => {});
            }
          }
        }
      });
    }
  }
  openAsset(tag, key) {
    let url = this.bView.genQueryString(null, tag, key);
    let a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('target', '_blank');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
  importAssetJSON() {
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

        if (!gAPPP.a.modelSets[eleType]) {
          alert('no supported assetExportTag found');
          return;
        }

        delete json.assetExportTag;
        delete json.assetExportKey;
        if (eleType !== 'block') {
          json.sortKey = new Date().getTime();
          gAPPP.a.modelSets[eleType].createWithBlobString(json).then(results => {
            this.openAsset(eleType, results.key);
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

            this.openAsset(eleType, blockResults.key);
          });
        }
      };
    }
  }

  async retailRegister() {
    this.templates = {
      "assetTemplates": {
        "All Assets": "asset.csv"
      },
      "sceneTemplates": {
        "Produce": "layout.csv"
      },
      "productTemplates": {
        "Produce Sales Week 1": "product.csv"
      }
    };

    this.add_animation_asset_animation = this.domPanel.querySelector('#add_animation_asset_animation');
    this.add_animation_asset_template = this.domPanel.querySelector('#add_animation_asset_template');
    this.add_animation_asset_choice = this.domPanel.querySelector('#add_animation_asset_choice');
    this.add_animation_asset_download_btn = this.domPanel.querySelector('#add_animation_asset_download_btn');
    this.import_asset_templates_select = this.domPanel.querySelector('#import_asset_templates_select');
    this.add_animation_asset_upload_btn = this.domPanel.querySelector('#add_animation_asset_upload_btn');
    this.add_animation_asset_download_file = this.domPanel.querySelector('#add_animation_asset_download_file');
    this.add_animation_asset_upload_btn.addEventListener('click', e => this.add_animation_asset_download_file.click());
    this.add_animation_asset_download_file.addEventListener('change', e => this.templateUploadCSV('asset'));
    this.add_animation_asset_download_btn.addEventListener('click', e => this.downloadCSV('asset'));

    this.add_animation_scene_animation = this.domPanel.querySelector('#add_animation_scene_animation');
    this.add_animation_scene_template = this.domPanel.querySelector('#add_animation_scene_template');
    this.add_animation_scene_choice = this.domPanel.querySelector('#add_animation_scene_choice');
    this.add_animation_scene_download_btn = this.domPanel.querySelector('#add_animation_scene_download_btn');
    this.add_animation_scene_upload_btn = this.domPanel.querySelector('#add_animation_scene_upload_btn');
    this.import_scene_templates_select = this.domPanel.querySelector('#import_scene_templates_select');
    this.add_animation_scene_download_file = this.domPanel.querySelector('#add_animation_scene_download_file');
    this.add_animation_scene_upload_btn.addEventListener('click', e => this.add_animation_scene_download_file.click());
    this.add_animation_scene_download_file.addEventListener('change', e => this.templateUploadCSV('scene'));
    this.add_animation_scene_download_btn.addEventListener('click', e => this.downloadCSV('scene'));

    this.add_animation_product_animation = this.domPanel.querySelector('#add_animation_product_animation');
    this.add_animation_product_template = this.domPanel.querySelector('#add_animation_product_template');
    this.add_animation_product_choice = this.domPanel.querySelector('#add_animation_product_choice');
    this.add_animation_product_download_btn = this.domPanel.querySelector('#add_animation_product_download_btn');
    this.add_animation_product_upload_btn = this.domPanel.querySelector('#add_animation_product_upload_btn');
    this.import_product_templates_select = this.domPanel.querySelector('#import_product_templates_select');
    this.add_animation_product_download_file = this.domPanel.querySelector('#add_animation_product_download_file');
    this.add_animation_product_upload_btn.addEventListener('click', e => this.add_animation_product_download_file.click());
    this.add_animation_product_download_file.addEventListener('change', e => this.templateUploadCSV('product'));
    this.add_animation_product_download_btn.addEventListener('click', e => this.downloadCSV('product'));

    this.add_animation_asset_choice.addEventListener('input', e => this.__updateAddTemplate('asset'));
    this.add_animation_scene_choice.addEventListener('input', e => this.__updateAddTemplate('scene'));
    this.add_animation_product_choice.addEventListener('input', e => this.__updateAddTemplate('product'));

    this.import_asset_workspaces_select = this.domPanel.querySelector('#import_asset_workspaces_select');
    this.import_scene_workspaces_select = this.domPanel.querySelector('#import_scene_workspaces_select');
    this.import_product_workspaces_select = this.domPanel.querySelector('#import_product_workspaces_select');

    this.add_animation_clear_scene = this.domPanel.querySelector('#add_animation_clear_scene');
    this.add_animation_current_workspace = this.domPanel.querySelector('#add_animation_current_workspace');
    this.generate_animation_workspace_button = this.domPanel.querySelector('#generate_animation_workspace_button');
    this.generate_animation_workspace_button.addEventListener('click', e => this.generateAnimation());
    await this.retailInitLists();

    return Promise.resolve();
  }
  async retailInitLists() {
    this.__loadList(this.add_animation_asset_template, Object.keys(this.templates.assetTemplates));
    this.__loadList(this.add_animation_scene_template, Object.keys(this.templates.sceneTemplates));
    this.__loadList(this.add_animation_product_template, Object.keys(this.templates.productTemplates));

    return Promise.resolve();
  }
  async reloadScene(clear, animationKey = false) {
    if (!animationKey)
      animationKey = gAPPP.a.profile.selectedWorkspace;
    if (!animationKey)
      return;

    this.bView.canvasHelper.hide();

    if (clear) {

      /*
       from clearScene() event handler
            gAPPP.a.writeProjectRawData(gAPPP.a.profile.selectedWorkspace, 'assetRows', null)
              .then(() => gAPPP.a.writeProjectRawData(gAPPP.a.profile.selectedWorkspace, 'productRows', null))
              .then(() => gAPPP.a.writeProjectRawData(gAPPP.a.profile.selectedWorkspace, 'sceneRows', null))
              .then(() => this.reloadScene(true))
              .then(() => {});
              */

      gAPPP.a.clearProjectData(animationKey)
        .then(() => setTimeout(() => location.reload(), 1));
    }

    let csvImport = new gCSVImport(animationKey);
    await gAPPP.a.clearProjectData(animationKey);
    let assets = await gAPPP.a.readProjectRawData(animationKey, 'assetRows');
    await csvImport.importRows(assets);
    let scene = await gAPPP.a.readProjectRawData(animationKey, 'sceneRows');
    await csvImport.importRows(scene);
    let products = await gAPPP.a.readProjectRawData(animationKey, 'productRows');
    await csvImport.importRows(products);
    await csvImport.addCSVDisplayFinalize();

    await gAPPP.a.modelSets['userProfile'].commitUpdateList([{
      field: 'selectedWorkspace',
      newValue: animationKey
    }]);

    setTimeout(() => location.reload(), 1);

    return Promise.resolve();
  }
  async __addAnimationTemplate(type, targetProjectId) {
    let sourceProjectId = gAPPP.a.profile.selectedWorkspace;
    let choice = document.getElementById(`add_animation_${type}_choice`).value;
    let data = null;
    if (choice === 'Current') {
      data = await gAPPP.a.readProjectRawData(sourceProjectId, type + 'Rows');
    }
    if (choice === 'Animation') {
      let id = document.getElementById(`add_animation_${type}_animation`);
      data = await gAPPP.a.readProjectRawData(id, type + 'Rows');
    }
    if (choice === 'Template') {
      let title = this[`add_animation_${type}_template`].value;
      let filename = this.templates[`${type}Templates`][title];
      let response = await fetch(this.bView.templateBasePath + filename);
      let csv = await response.text();
      let csvJSON = await this.papaParse(csv);
      if (csvJSON.data) data = csvJSON.data;
    }

    if (data) {
      await gAPPP.a.writeProjectRawData(targetProjectId, type + 'Rows', data);
    }

    return Promise.resolve();
  }
  generateAnimation() {
    this._generateAnimation().then(() => {});
  }
  async _generateAnimation() {
    let useCurrent = this.add_animation_current_workspace.checked;
    let clearScene = this.add_animation_clear_scene.checked;
    let newTitle = this.domPanel.querySelector('#new-workspace-name').value.trim();

    if (newTitle.length === 0 && !useCurrent) {
      alert('need a name for animation');
      return;
    }
    this.bView.canvasHelper.hide();

    let wId = gAPPP.a.profile.selectedWorkspace;
    if (!useCurrent) {
      wId = gAPPP.a.modelSets['projectTitles'].getKey();
      await this.bView._addProject(newTitle, wId, false);
    }

    await Promise.all([
      this.__addAnimationTemplate('asset', wId),
      this.__addAnimationTemplate('scene', wId)
    ]);

    await this.__addAnimationTemplate('product', wId);

    return this.reloadScene(clearScene, wId);
  }

  __loadList(sel, list, htmlPrefix = '') {
    let html = '';
    for (let c = 0; c < list.length; c++)
      html += `<option>${list[c]}</option>`;
    sel.innerHTML = htmlPrefix + html;
  }
  _refreshProjectList(thisid, optionHTML, prefixOptionHTML = '') {
    if (!this[thisid])
      return;
    let curIndex = this[thisid].selectedIndex;
    this[thisid].innerHTML = prefixOptionHTML + optionHTML;
    this[thisid].selectedIndex = (curIndex > 0) ? curIndex : 0;
  }
  refreshProjectLists(optionHTML) {
    this._refreshProjectList(`add_animation_asset_animation`, optionHTML);
    this._refreshProjectList('add_animation_scene_animation', optionHTML);
    this._refreshProjectList('add_animation_product_animation', optionHTML);
  }

  workspaceLayoutTemplate() {
    return `<div><select class="workspace_layout_view_select">
      <option>Products</option>
      <option>Layout</option>
      <option>Assets</option>
      <option>Layout Data</option>
    </select>
    </div>
    <div class="data_table_panel"></div>
    <div class="layout_data_panel" >
      <select id="scene_options_list" size="3"></select>
      <div id="scene_options_edit_fields"></div>
    </div>`;
  }
  workspaceLayoutRegister() {
    this.editTable = null;
    this.fieldList = [
      'index', 'name', 'asset',
      'text1', 'text2', 'image', 'block',
      'sku', 'price', 'count', 'pricetext',
      'height', 'width',
      'x', 'y', 'z',
      'rx', 'ry', 'rz'
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

    this.workspace_layout_view_select = this.domPanel.querySelector('.workspace_layout_view_select');
    this.workspace_layout_view_select.addEventListener('change', e=> this.workspaceLayoutShowView());
    this.layout_data_panel = this.domPanel.querySelector('.layout_data_panel');
    this.data_table_panel = this.domPanel.querySelector('.data_table_panel');

    this.initSceneEditFields().then(() => {});
    this.workspaceLayoutShowView();
  }
  workspaceLayoutShowView() {
    let sel = this.workspace_layout_view_select.value;
    this.layout_data_panel.style.display = (sel === 'Layout Data') ? 'flex' : 'none';

    if (this.editTable) {
      this.editTable.destroy();
      this.editTable = null;
    }
    if (sel === 'Assets' || sel === 'Products' || sel === 'Layout'){
      this.data_table_panel.style.display = 'flex';
      this.data_table_panel.innerHTML = 'Loading...';
    } else {
      this.data_table_panel.innerHTML = '';
      this.data_table_panel.style.display = 'none';
    }

    if (sel === 'Assets') {
      this.loadDataTable('asset');
    }
    if (sel === 'Layout') {
      this.loadDataTable('scene');
    }
    if (sel === 'Products') {
      this.loadDataTable('product');
    }

  }
  async initSceneEditFields() {
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
    this.productCSVData = this._sortCSVProductRows(this.productCSVData);

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

    this.scene_options_edit_fields = this.domPanel.querySelector('#scene_options_edit_fields');
    this.scene_options_list = this.domPanel.querySelector('#scene_options_list');
    this.scene_options_list.innerHTML = listHTML;
    this.scene_options_list.addEventListener('input', e => this.sceneOptionsBlockListChange());

    this._sceneOptionsBlockListChange();
  }
  _sortCSVProductRows(p) {
    return p.sort((a, b) => {
      let aIndex = GLOBALUTIL.getNumberOrDefault(a.index, 0);
      let bIndex = GLOBALUTIL.getNumberOrDefault(b.index, 0);
      if (aIndex > bIndex)
        return 1;
      if (aIndex < bIndex)
        return -1;
      return 0;
    });
  }
  sceneOptionsBlockListChange() {
    this._sceneOptionsBlockListChange().then(() => {});
  }
  async _sceneOptionsBlockListChange() {
    let index = this.scene_options_list.selectedIndex;
    if (index < 0)
      return Promise.resolve();
    let fieldData = this.sceneFieldEditBlocks[index];

    let fieldHtml = '<input type="file" class="sotexturepathuploadfile" style="display:none;" />';
    let name = fieldData.name;
    let asset = fieldData.asset;

    for (let c = 0, l = fieldData.fieldList.length; c < l; c++) {
      let type = fieldData.fieldList[c].type;
      let field = fieldData.fieldList[c].field;

      if (type === 'num') {
        let v = await this.__getSceneOptionsValue(fieldData.tab, name, asset, field);
        fieldHtml += `<label class="csv_scene_field_text_wrapper">
            ${field}<input data-field="${field}" class="mdl-textfield__input" type="text" value="${v}" data-tab="${fieldData.tab}"
            data-type="${type}" data-name="${name}" data-asset="${asset}" />
          </label>`;
      }

      if (type === 'image') {
        let v = await this.__getSceneOptionsValue(fieldData.tab, name, asset, field);
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
    this.soUploadImageFile.addEventListener('change', e => {
      this.__sceneUploadImageFile(e).then(() => {});
    });
    let inputs = this.scene_options_edit_fields.querySelectorAll('input');
    inputs.forEach(i => i.addEventListener('input', e => this.__sceneOptionsValueChange(i, e)));
    let uploadButtons = this.scene_options_edit_fields.querySelectorAll('button.sceneoptionsupload');
    uploadButtons.forEach(i => i.addEventListener('click', e => {
      this.soUploadImageFile.btnCTL = i;
      this.soUploadImageFile.editCTL = this.scene_options_edit_fields.querySelector('#' + i.dataset.fieldid);
      this.soUploadImageFile.click();
    }));

    return Promise.resolve();
  }
  async __getSceneOptionsValue(tab, name, asset, field) {
    if (tab === 'layout')
      tab = 'scene';
    if (!this[tab + 'CSVData'])
      return '';
    let rows = this[tab + 'CSVData'];
    for (let c = 0, l = rows.length; c < l; c++)
      if (rows[c]['name'] === name && rows[c]['asset'] === asset)
        return rows[c][field];

    return Promise.resolve('');
  }
  __sceneOptionsValueChange(ctl, e) {
    let data = ctl.dataset;
    this.__setSceneOptionsValue(data.tab, data.name, data.asset, data.field, ctl.value)
      .then(() => {});
  }
  async __setSceneOptionsValue(tab, name, asset, field, value) {
    if (tab === 'layout')
      tab = 'scene';
    if (!this[tab + 'CSVData'])
      return Promise.resolve();

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
    }

    return Promise.resolve();
  }
  async __sceneUploadImageFile() {
    let fileBlob = this.soUploadImageFile.files[0];

    if (!fileBlob)
      return Promise.resolve();

    let fireSet = gAPPP.a.modelSets['block'];
    let key = gAPPP.a.profile.selectedWorkspace + '/scenedatafiles';
    let uploadResult = await fireSet.setBlob(key, fileBlob, fileBlob.name);
    this.soUploadImageFile.editCTL.value = uploadResult.downloadURL;
    this.__sceneOptionsValueChange(this.soUploadImageFile.editCTL);
    return Promise.resolve();
  }
  templateUploadCSV(csvType) {
    if (this[`add_animation_${csvType}_download_file`].files.length > 0) {
      Papa.parse(this[`add_animation_${csvType}_download_file`].files[0], {
        header: true,
        complete: results => {
          if (results.data) {
            gAPPP.a.writeProjectRawData(gAPPP.a.profile.selectedWorkspace, csvType + 'Rows', results.data)
              .then(() => {});
          }
        }
      });
    }
  }
  downloadCSV(name) {
    gAPPP.a.readProjectRawData(gAPPP.a.profile.selectedWorkspace, name + 'Rows')
      .then(rows => {
        let csvResult = Papa.unparse(rows);
        var element = document.createElement('a');
        element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(csvResult));
        element.setAttribute('download', name + '.csv');

        element.style.display = 'none';
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
      });
  }
  __updateAddTemplate(type) {
    let value = this['add_animation_' + type + '_choice'].value;

    this['add_animation_' + type + '_template'].style.display = 'none';
    this['add_animation_' + type + '_animation'].style.display = 'none';
    this['add_animation_' + type + '_upload_btn'].style.display = (value === 'Current') ? 'inline-block' : 'none';
    this['add_animation_' + type + '_download_btn'].style.display = (value === 'Current') ? 'inline-block' : 'none';

    if (value === 'Template') {
      this['add_animation_' + type + '_template'].style.display = 'inline-block';
    }
    if (value === 'Animation') {
      this['add_animation_' + type + '_animation'].style.display = 'inline-block';
    }
  }
  async papaParse(csvData) {
    return new Promise((resolve) => {
      Papa.parse(csvData, {
        header: true,
        complete: results => resolve(results)
      });
    });
  }
  async loadDataTable(tableName) {
    let results = await gAPPP.a.readProjectRawData(gAPPP.a.profile.selectedWorkspace, tableName + 'Rows')
    let data = [];
    if (results) data = results;

    if (tableName === 'product')
      data = this.__sortProductRows(data);

    let columns = [];
    let topLeftTitle = (tableName === 'product') ? '<i class="material-icons">add_to_queue</i>' : '';
    columns.push({
      rowHandle: true,
      formatter: "handle",
      headerSort: false,
      cssClass: 'row-handle-table-cell',
      frozen: true,
      width: 45,
      minWidth: 45,
      title: topLeftTitle
    });
    if (tableName !== 'product')
      columns.push({
        rowHandle: true,
        formatter: "rownum",
        headerSort: false,
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
      tag: 'delete',
      cellClick: (e, cell) => {
        cell.getRow().delete();
        this.__reformatTable(tableName);
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
      cssClass: 'add-table-cell',
      cellClick: (e, cell) => {
        cell.getTable().addData([{
            name: ''
          }], false, cell.getRow())
          .then(rows => {
            this.__reformatTable(tableName);
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

      columns.push({
        title: field,
        field,
        editor: true,
        headerSort: false,
        align,
        formatter: rightColumn ? 'money' : undefined,
        layoutColumnsOnNewData: true,
        columnResizing: 'headerOnly',
        cssClass,
        headerVertical: longLabel,
        minWidth
      });
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
      columns[0].headerClick = (e, col) => this.toggleProductAddView(col);
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
      dataEdited: data => this.__tableChangedHandler(true),
      rowMoved: (row) => this._rowMoved(tableName, row)
    });

  //  document.getElementById(`import_${tableName}_csv_btn`).addEventListener('click', e => {
  //    this.saveCSVType = tableName;
  //    this.importFileDom.click();
  //  });
  //  document.getElementById('download_' + tableName + '_csv').addEventListener('click', e => this.downloadCSV(tableName));

    this.editTable.cacheData = JSON.stringify(this.editTable.getData());
/*
    document.getElementById(`ui-${tableName}-tab`).addEventListener('click', e => {
      this.__reformatTable(tableName);
      //    this.editTable.redraw(true);
      this.editTable.setColumnLayout();
    });
    */
  }
  __sortProductRows(p) {
    return p.sort((a, b) => {
      let aIndex = GLOBALUTIL.getNumberOrDefault(a.index, 0);
      let bIndex = GLOBALUTIL.getNumberOrDefault(b.index, 0);
      if (aIndex > bIndex)
        return 1;
      if (aIndex < bIndex)
        return -1;
      return 0;
    });
  }
  _rowMoved(tableName, row) {
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
    this.__tableChangedHandler();
  }
  async __saveChanges() {
    this.canvasHelper.hide();

    await Promise.all([
      this.__saveTable('asset'),
      this.__saveTable('product'),
      this.__saveTable('scene')
    ]);

    return this.reloadScene();
  }
  __reformatTable(tableName) {
    let tbl = this.editTable;
    let rows = tbl.getRows();
    for (let c = 0, l = rows.length; c < l; c++)
      rows[c].reformat();

    this.__tableChangedHandler();
  }
  ___testTableDirty(tableName) {
    let tbl = this.editTable;
    let setDirty = false;
    let newCache = JSON.stringify(this.editTable.getData());
    if (this.editTable.cacheData !== newCache)
      setDirty = true;

    return setDirty;
  }
  async __saveTable(tableName) {
    if (!this.___testTableDirty(tableName))
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

    return Promise.resolve();
  }
  __tableChangedHandler(reloadSceneOptions) {
    let dirty = this.___testTableDirty('asset');
    if (!dirty)
      dirty = this.___testTableDirty('scene');
    if (!dirty)
      dirty = this.___testTableDirty('product');

    if (dirty) {
      document.getElementById('changes_commit_header').style.display = 'inline-block';
    } else {
      document.getElementById('changes_commit_header').style.display = 'none';
    }

    if (reloadSceneOptions) {
      this.sceneOptionsBlockListChange();
    }
  }





  initFieldEdit() {
    this.fieldDivByName = {};
    this.record_field_list_form.innerHTML = '<input type="file" class="texturepathuploadfile" style="display:none;" />';

    for (let c = 0, l = this.fieldList.length; c < l; c++) {
      let title = this.fieldList[c];
      let id = 'fieldid' + c.toString();
      this.fieldDivByName[title] = document.createElement('div');
      this.fieldDivByName[title].setAttribute('class', 'mdl-textfield mdl-js-textfield mdl-textfield--floating-label');
      this.fieldDivByName[title].innerHTML = `<input id="${id}" type="text" class="mdl-textfield__input fieldinput ${title}edit" list="${this.fieldList[c]}list" />` +
        `<label class="mdl-textfield__label" for="${id}">${this.fieldList[c]}</label>`;

      if (title === 'x') {
        let select = document.createElement('select');
        select.style.position = 'absolute';
        select.style.top = '-.75em';
        select.style.right = '5px';
        select.style.width = '1.5em';
        select.setAttribute('id', 'select-position-preset');
        select.setAttribute('class', 'mdl-textfield__input');
        componentHandler.upgradeElement(select);
        this.fieldDivByName[title].appendChild(select);
        this.fieldDivByName[title].style.position = 'relative';
      }
      if (title === 'image') {
        let btn = document.createElement('button');
        btn.style.position = 'absolute';
        btn.style.top = '-2.5em';
        btn.style.left = '75%';
        btn.innerHTML = '<i class="material-icons">cloud_upload</i>';
        btn.setAttribute('class', 'mdl-button mdl-js-button mdl-button--fab mdl-button--mini-fab mdl-button--primary texturepathupload');
        componentHandler.upgradeElement(btn);
        this.fieldDivByName[title].appendChild(btn);
        this.fieldDivByName[title].style.position = 'relative;'
      }

      componentHandler.upgradeElement(this.fieldDivByName[title]);
      this.record_field_list_form.appendChild(this.fieldDivByName[title]);
    }

    this.uploadImageButton = this.record_field_list_form.querySelector('.texturepathupload');
    this.uploadImageEditField = this.record_field_list_form.querySelector('.imageedit');
    this.uploadImageFile = this.record_field_list_form.querySelector('.texturepathuploadfile');
    this.uploadImageFile.addEventListener('change', e => this.__uploadImageFile());
    this.uploadImageButton.addEventListener('click', e => this.uploadImageFile.click());

    let btn = document.createElement('button');
    btn.setAttribute('id', 'update_product_fields_post');
    btn.setAttribute('class', 'mdl-button mdl-js-button mdl-button--fab mdl-button--colored');
    btn.innerHTML = '<i class="material-icons">add</i>';
    componentHandler.upgradeElement(btn);
    this.record_field_list_form.appendChild(btn);
    this.addNewBtn = document.getElementById('update_product_fields_post');
    this.addNewBtn.addEventListener('click', e => this.addNewProduct(e));

    this.assetEditField = this.record_field_list_form.querySelector('.assetedit');
    this.assetEditField.addEventListener('input', e => this.updateVisibleEditFields());

    this.updateVisibleEditFields();
  }
  updateVisibleEditFields() {
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
  updateProductList() {


    /*
          rowH += ` &nbsp;<button class="remove mdl-button mdl-js-button mdl-button--icon mdl-button--primary" data-id="${row.name}"><i class="material-icons">delete</i></button>`;
          let x = GLOBALUTIL.getNumberOrDefault(row.x, 0).toFixed(1);
          let y = GLOBALUTIL.getNumberOrDefault(row.y, 0).toFixed(1);
          let z = GLOBALUTIL.getNumberOrDefault(row.z, 0).toFixed(1);
          let pos = this.__checkForPosition(row.x, row.y, row.z);
          */


    /*
        let tRows = this.productListDiv.querySelectorAll('.table-row-product-list');
        for (let c = 0, l = tRows.length; c < l; c++)
          tRows[c].addEventListener('click', e => {
            return this.showSelectedProduct(e.currentTarget.dataset.id);
          });

        let removeBtns = this.productListDiv.querySelectorAll('.remove');
        for (let c2 = 0, l2 = removeBtns.length; c2 < l2; c2++)
          removeBtns[c2].addEventListener('click', e => {
            return this.removeProductByName(e.currentTarget.dataset.id, e);
          });
          */
  }
  removeProductByName(name, e) {
    gAPPP.a.readProjectRawData(gAPPP.a.profile.selectedWorkspace, 'productRows')
      .then(products => {
        let outProducts = []
        for (let c = 0, l = products.length; c < l; c++)
          if (products[c].name !== name)
            outProducts.push(products[c]);

        gAPPP.a.writeProjectRawData(gAPPP.a.profile.selectedWorkspace, 'productRows', outProducts)
          .then(() => this.reloadScene())
          .then(() => {});
      });

    if (e) {
      e.preventDefault();
    }
  }
  __productByName(name) {
    for (let c = 0, l = this.productData.products.length; c < l; c++)
      if (this.productData.products[c].origRow.name === name)
        return this.productData.products[c];

    if (name === 'FollowCamera')
      return {
        origRow: this.productData.cameraOrigRow
      };

    return null;
  }
  showSelectedProduct(name) {
    let fields = this.record_field_list_form.querySelectorAll('.fieldinput');
    let p = this.__productByName(name);
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
      f.parentElement.MaterialTextfield.change(v);
    }

    this.updateVisibleEditFields();
  }
  addNewProduct(e) {
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
    this.__tableChangedHandler();

    e.preventDefault();
    return true;
  }
}
