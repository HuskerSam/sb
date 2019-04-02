class cView extends bView {
  constructor() {
    super();
    this.canvasHelper.cameraShownCallback = () => {
      this._workspaceLoadedAndInited();
    };

    this.templateBasePath = 'https://s3-us-west-2.amazonaws.com/hcwebflow/templates/';

    this.record_field_list = document.getElementById('record_field_list');
    this.productListDiv = document.querySelector('#product_tab_table');
    this.record_field_list_form = document.querySelector('#record_field_list form');

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

    this.initFieldEdit();

    this.assetTemplates = [
      'All Assets'
    ];
    this.assetTemplateFiles = {
      'All Assets': 'asset.csv',
    }
    this.sceneTemplates = [
      'Produce'
    ];
    this.sceneTemplateFiles = {
      'Produce': 'layout.csv'
    };
    this.productTemplates = [
      'Produce Sales Week 1'
    ];
    this.productTemplateFiles = {
      'Produce Sales Week 1': 'product.csv',
    }

    this.productBySKU = {};
    this.skuOrder = [];
    this.basketSKUs = {};
    this.editTables = {};

    this.importFileDom = document.querySelector('.csv-import-file');
    this.importFileDom.addEventListener('change', e => this.importCSV());

    this.canvasActionsDom = document.querySelector('.canvas-actions');
    this.canvasActionsDom.classList.add('canvas-actions-shown');

    this.lightBarFields = [{
      title: '<i class="material-icons">wb_sunny</i><span id="light_intensity_value">1</span>',
      fireSetField: 'lightIntensity',
      helperType: 'singleSlider',
      rangeMin: '0',
      rangeMax: '2',
      rangeStep: '.01',
      displayType: 'number',
      group: 'group2',
      groupClass: 'light-intensity-user-panel'
    }];
    this.cameraFieldsContainer = this.canvasActionsDom.querySelector('.lightbar-fields-container');

    this.cameraToolsBtn = document.createElement('button');
    this.cameraToolsBtn.style.display = 'none';
    this.cameraTools = new cBandProfileOptions(this.cameraToolsBtn, this.lightBarFields, this.cameraFieldsContainer, this.canvasActionsDom);
    this.cameraTools.fireFields.values = gAPPP.a.profile;
    this.cameraTools.activate();

    this.cameraExtrasArea = document.getElementById('extra-options-camera-area');
    this.cameraExtrasArea.innerHTML =
      `<label class="mdl-switch mdl-js-switch" for="auto-move-camera" id="auto-move-camera-component">
      <input type="checkbox" id="auto-move-camera" class="mdl-switch__input" checked>
      <span class="mdl-switch__label"><i class="material-icons">camera_enchance<i></span>
    </label>`;
    componentHandler.upgradeElement(document.getElementById('auto-move-camera-component'));
    this.autoMoveCameraInput = document.getElementById('auto-move-camera');
    this.autoMoveCameraInput.addEventListener('input', () => this.toggleAutoMoveCamera());

    this.import_asset_workspaces_select = document.getElementById('import_asset_workspaces_select');
    this.import_scene_workspaces_select = document.getElementById('import_scene_workspaces_select');
    this.import_product_workspaces_select = document.getElementById('import_product_workspaces_select');

    document.querySelector('.user-name').innerHTML = gAPPP.a.currentUser.email;

    this.scene_data_expand_btn = document.getElementById('scene_data_expand_btn');
    this.scene_data_expand_btn.addEventListener('click', e => this.toggleSceneDataView());

    this.profile_description_panel_btn = document.getElementById('profile_description_panel_btn');
    this.profile_description_panel_btn.addEventListener('click', e => this.toggleProfilePanel());
  }
  _workspaceLoadedAndInited() {
    if (this.cameraShown)
      return;
    this.cameraShown = true;
    this.__workspaceInitedPostTimeout();
  }
  async __workspaceInitedPostTimeout() {
    document.querySelector('.inner-split-view').style.display = '';
    this.productData = await new gCSVImport(gAPPP.a.profile.selectedWorkspace).initProducts();
    this.products = this.productData.products;
    this.productBySKU = this.productData.productsBySKU;

    this.canvasHelper.cameraSelect.selectedIndex = 2;
    this.canvasHelper.noTestError = true;
    this.canvasHelper.cameraChangeHandler();



    try {
      this.canvasHelper.playAnimation();
    } catch (e) {
      console.log('play anim error', e);
    }

    let basketListHTML = '';
    if (this.productData.displayBlocks)
      for (let c = 0, l = this.productData.displayBlocks.length; c < l; c++)
        basketListHTML += `<option>${this.productData.displayBlocks[c]}</option>`;
    document.getElementById('blocklist').innerHTML = basketListHTML;

    this.changes_commit_header = document.getElementById('changes_commit_header');
    this.changes_commit_header.addEventListener('click', e => this.saveChanges());
    return Promise.resolve();
  }
  toggleProductAddView(col) {
    if (this.productViewAddShown) {
      this.record_field_list.classList.remove('record_field_list_expanded');
      this.productViewAddShown = false;
      col._column.element.classList.remove('button-expanded');
    } else {
      this.record_field_list.classList.add('record_field_list_expanded');
      this.productViewAddShown = true;
      col._column.element.classList.add('button-expanded');
    }
  }
  toggleSceneDataView() {
    if (this.sceneDataShown) {
      this.sceneDataShown = false;
      this.scene_data_expand_btn.classList.remove('button-expanded');
      document.getElementById('scene_options_panel').classList.remove('expanded');
    } else {
      this.sceneDataShown = true;
      this.scene_data_expand_btn.classList.add('button-expanded');
      document.getElementById('scene_options_panel').classList.add('expanded');
    }
  }
  toggleProfilePanel() {
    if (this.profilePanelShown) {
      this.profilePanelShown = false;
      this.profile_description_panel_btn.classList.remove('button-expanded');
      document.getElementById('workspace-header-panel').classList.remove('expanded');
    } else {
      this.profilePanelShown = true;
      this.profile_description_panel_btn.classList.add('button-expanded');
      document.getElementById('workspace-header-panel').classList.add('expanded');
    }
  }
  toggleAutoMoveCamera() {
    if (this.autoMoveCameraInput.checked) {
      this.canvasHelper.cameraSelect.selectedIndex = 2;
      this.canvasHelper.cameraChangeHandler();
    } else {
      this.canvasHelper.cameraSelect.selectedIndex = 0;
      this.canvasHelper.cameraChangeHandler();
    }
  }
  async reloadScene(clear, animationKey = false) {
    if (!animationKey)
      animationKey = gAPPP.a.profile.selectedWorkspace;
    if (!animationKey)
      return;

    this.canvasHelper.hide();

    if (clear) {
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
  clearScene() {
    if (confirm('Clear the scene?')) {
      if (!gAPPP.a.profile.selectedWorkspace)
        return;

      gAPPP.a.writeProjectRawData(gAPPP.a.profile.selectedWorkspace, 'assetRows', null)
        .then(() => gAPPP.a.writeProjectRawData(gAPPP.a.profile.selectedWorkspace, 'productRows', null))
        .then(() => gAPPP.a.writeProjectRawData(gAPPP.a.profile.selectedWorkspace, 'sceneRows', null))
        .then(() => this.reloadScene(true))
        .then(() => {});
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

    let rows = this.editTables['product'].getData();
    rows.push(newRow);
    this.editTables['product'].setData(rows);
    this.__tableChangedHandler();

    e.preventDefault();
    return true;
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
  _userProfileChange() {
    super._userProfileChange();

    document.getElementById('light_intensity_value').innerHTML = GLOBALUTIL.getNumberOrDefault(gAPPP.a.profile.lightIntensity, .66).toFixed(2);
  }
  async removeWorkspace() {
    let sel = this.remove_workspace_select_template;
    if (sel.selectedIndex === 0)
      return;
    if (confirm(`Delete animation ${sel.options[sel.selectedIndex].text}?`)) {
      let changeWorkspace = (sel.value === gAPPP.a.profile.selectedWorkspace);

      let removeResult = await new gCSVImport().dbRemove('project', sel.value);

      if (changeWorkspace) {
        let newIndex = 1;
        let newId = 'none';
        if (sel.options.length > 2) {
          if (sel.selectedIndex === 1)
            newIndex = 2;
          newId = sel.options[newIndex].value;
        }

        await gAPPP.a.modelSets['userProfile'].commitUpdateList([{
          field: 'selectedWorkspace',
          newValue: newId
        }]);

        setTimeout(() => location.reload(), 1);
      }
    }
    return Promise.resolve();
  }
  initSceneEditFields() {
    let editInfoBlocks = gAPPP.a.modelSets['block'].queryCache('blockFlag', 'displayfieldedits');

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

    this.scene_options_edit_fields = document.getElementById('scene_options_edit_fields');
    this.scene_options_list = document.getElementById('scene_options_list');
    this.scene_options_list.innerHTML = listHTML;
    this.scene_options_list.addEventListener('input', e => this.sceneOptionsBlockListChange());
  }
  sceneOptionsBlockListChange() {
    let index = this.scene_options_list.selectedIndex;
    if (index < 0)
      return;
    let fieldData = this.sceneFieldEditBlocks[index];

    let fieldHtml = '<input type="file" class="sotexturepathuploadfile" style="display:none;" />';
    let name = fieldData.name;
    let asset = fieldData.asset;

    for (let c = 0, l = fieldData.fieldList.length; c < l; c++) {
      let type = fieldData.fieldList[c].type;
      let field = fieldData.fieldList[c].field;

      if (type === 'num') {
        let v = this.__getSceneOptionsValue(fieldData.tab, name, asset, field);
        fieldHtml += '<div class="scene_num_field_wrapper mdl-textfield mdl-js-textfield mdl-textfield--floating-label">' +
          `<input data-field="${field}" class="mdl-textfield__input" type="text" value="${v}" data-tab="${fieldData.tab}"` +
          `data-type="${type}" data-name="${name}" data-asset="${asset}" id="scene_edit_field_${c}_${field}" />` +
          `<label class="mdl-textfield__label" for="scene_edit_field_${c}_${field}">${field}</label>` +
          '</div>';
      }

      if (type === 'image') {
        let v = this.__getSceneOptionsValue(fieldData.tab, name, asset, field);
        fieldHtml += '<div><div class="scene_image_field_wrapper mdl-textfield mdl-js-textfield mdl-textfield--floating-label">' +
          `<input data-field="${field}" class="mdl-textfield__input" type="text" value="${v}" data-tab="${fieldData.tab}"` +
          `data-type="${type}" data-name="${name}" data-asset="${asset}" id="scene_edit_field_${c}_${field}" />` +
          `<label class="mdl-textfield__label" for="scene_edit_field_${c}_${field}">${field}</label>` +
          '</div>' +
          `<button data-fieldid="scene_edit_field_${c}_${field}" class="mdl-button mdl-js-button mdl-button--fab mdl-button--mini-fab mdl-button--primary sceneoptionsupload">` +
          `<i class="material-icons">cloud_upload</i></button></div>`;
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
    componentHandler.upgradeDom();
  }
  async __sceneUploadImageFile() {
    let fileBlob = this.soUploadImageFile.files[0];

    if (!fileBlob)
      return Promise.resolve();

    this.soUploadImageFile.editCTL.parentElement.MaterialTextfield.change('Uploading...');

    let fireSet = gAPPP.a.modelSets['block'];
    let key = this.productData.sceneId + '/scenedatafiles';
    let uploadResult = await fireSet.setBlob(key, fileBlob, fileBlob.name);
    this.soUploadImageFile.editCTL.parentElement.MaterialTextfield.change(uploadResult.downloadURL);
    this.__sceneOptionsValueChange(this.soUploadImageFile.editCTL);
    return Promise.resolve();
  }
  __sceneOptionsValueChange(ctl, e) {
    let data = ctl.dataset;
    this.__setSceneOptionsValue(data.tab, data.name, data.asset, data.field, ctl.value)
      .then(() => {});
  }
  async __setSceneOptionsValue(tab, name, asset, field, value) {
    if (tab === 'layout')
      tab = 'scene';
    if (!this.editTables[tab])
      return Promise.resolve();

    let dataChanged = false;
    let rows = this.editTables[tab].getData();
    for (let c = 0, l = rows.length; c < l; c++)
      if (rows[c]['name'] === name && rows[c]['asset'] === asset) {
        if (rows[c][field] !== value) {
          dataChanged = true;
          rows[c][field] = value;
        }
      }

    if (dataChanged) {
      this.editTables[tab].setData(rows);
      this.__tableChangedHandler();
    }

    return Promise.resolve();
  }
  __getSceneOptionsValue(tab, name, asset, field) {
    if (tab === 'layout')
      tab = 'scene';
    if (!this.editTables[tab])
      return '';
    let rows = this.editTables[tab].getData();
    for (let c = 0, l = rows.length; c < l; c++)
      if (rows[c]['name'] === name && rows[c]['asset'] === asset)
        return rows[c][field];

    return '';
  }
}
