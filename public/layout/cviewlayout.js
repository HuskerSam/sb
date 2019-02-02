class cViewLayout extends bView {
  constructor() {
    super();
    this.canvasHelper.cameraShownCallback = () => {
      this._workspaceLoadedAndInited();
    };

    this.templateBasePath = 'https://s3-us-west-2.amazonaws.com/hcwebflow/templates/';
    this.workplacesSelect = document.querySelector('#workspaces-select');
    this.workplacesSelect.addEventListener('input', e => this.selectProject());
    this.addProjectName = document.querySelector('#new-workspace-name');

    let t = document.querySelector('.inner-split-view');
    let b = document.querySelector('.main-canvas-wrapper');
    this.splitInstance = window.Split([b, t], {
      sizes: [40, 60],
      gutterSize: 20,
      direction: 'horizontal',
      onDragEnd: () => gAPPP.resize(),
      onDrag: () => gAPPP.resize()
    });

    this.record_field_list = document.getElementById('record_field_list');
    this.productListDiv = document.querySelector('#product_tab_table');
    this.record_field_list_form = document.querySelector('#record_field_list form');

    this.import_products_csv_expand_btn = document.getElementById('import_products_csv_expand_btn');
    this.import_products_csv_expand_btn.addEventListener('click', e => this.toggleImportOptions());
    let closeBtns = document.querySelectorAll('.import-export-inpanel-button');
    for (let c = 0, l = closeBtns.length; c < l; c++)
      closeBtns[c].addEventListener('click', e => this.toggleImportOptions());

    this.fieldList = [
      'index', 'name', 'asset',
      'text1', 'text2', 'image', 'block',
      'sku', 'price', 'count', 'pricetext',
      'height', 'width',
      'x', 'y', 'z',
      'rx', 'ry', 'rz'
    ];
    this.productAddList = [
      'index', 'name', 'asset',
      'text1', 'text2', 'image', 'block',
      'sku', 'price', 'count', 'pricetext',
      'height', 'width',
      'xyz', 'rotatexyz'
    ];
    this.messageOnlyFields = [
      'index', 'name', 'asset', 'text1', 'text2',
      'height', 'width', 'xyz', 'rotatexyz'
    ];
    this.productOnlyFields = [
      'index', 'name', 'asset',
      'text1', 'image', 'block',
      'sku', 'price', 'count', 'pricetext',
      'xyz', 'rotatexyz'
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
      'All Assets',
      'Produce Assets'
    ];
    this.assetTemplateFiles = {
      'All Assets': 'allassets.csv',
      'Produce Assets': 'produceassets.csv',
      'Baskery and Deli Assets': 'bakeryanddeliassets.csv'
    }
    this.sceneTemplates = [
      'Produce',
      'Bakery and Deli'
    ];
    this.sceneTemplateFiles = {
      'Produce': 'producescene.csv',
      'Bakery and Deli': 'bakeryanddeliscene.csv'
    };
    this.productTemplates = [
      'Produce Sales Week 1',
      'Produce Sales Week 2',
      'Bakery and Deli Sales Week 1'
    ];
    this.productTemplateFiles = {
      'Bakery and Deli Sales Week 1': 'bakeryanddelisales1.csv',
      'Produce Sales Week 1': 'producesalesweek1.csv',
      'Produce Sales Week 2': 'producesalesweek2.csv'
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

    this.toggledImportOptions = true;
    this.toggleImportOptions();

    this.addViewToggleButton = document.getElementById('add-workspace-button-expand');
    this.addViewToggleButton.addEventListener('click', e => this.toggleAddView());
    document.querySelector('#workspace-add-panel-close-button').addEventListener('click', e => this.toggleAddView());

    this.addViewShown = false;
    this.toggleAddView();
    this.toggleAddView();

    this.add_animation_asset_animation = document.getElementById('add_animation_asset_animation');
    this.add_animation_asset_template = document.getElementById('add_animation_asset_template');
    this.add_animation_asset_choice = document.getElementById('add_animation_asset_choice');
    this.import_asset_templates_select = document.getElementById('import_asset_templates_select');

    this.add_animation_scene_animation = document.getElementById('add_animation_scene_animation');
    this.add_animation_scene_template = document.getElementById('add_animation_scene_template');
    this.add_animation_scene_choice = document.getElementById('add_animation_scene_choice');
    this.import_scene_templates_select = document.getElementById('import_scene_templates_select');

    this.add_animation_product_animation = document.getElementById('add_animation_product_animation');
    this.add_animation_product_template = document.getElementById('add_animation_product_template');
    this.add_animation_product_choice = document.getElementById('add_animation_product_choice');
    this.import_product_templates_select = document.getElementById('import_product_templates_select');

    this.add_animation_asset_choice.addEventListener('input', e => this.__updateAddTemplate('asset'));
    this.add_animation_scene_choice.addEventListener('input', e => this.__updateAddTemplate('scene'));
    this.add_animation_product_choice.addEventListener('input', e => this.__updateAddTemplate('product'));

    this.scene_data_expand_btn = document.getElementById('scene_data_expand_btn');
    this.scene_data_expand_btn.addEventListener('click', e => this.toggleSceneDataView());
    this.scene_data_expand_btn.click();
  }
  _workspaceLoadedAndInited() {
    if (this.cameraShown)
      return;
    this.cameraShown = true;
    this.__workspaceInitedPostTimeout();

    this.add_workspace_button_template = document.getElementById('add_workspace_button_template');
    this.add_workspace_button_template.addEventListener('click', e => this._addAnimation());
  }
  async __workspaceInitedPostTimeout() {
    document.querySelector('.inner-split-view').style.display = '';
    this.productData = await new gCSVImport(gAPPP.a.profile.selectedWorkspace).initProducts();
    this.products = this.productData.products;
    this.productBySKU = this.productData.productsBySKU;

    this.canvasHelper.cameraSelect.selectedIndex = 2;
    this.canvasHelper.noTestError = true;
    this.canvasHelper.cameraChangeHandler();
    this.remove_workspace_select_template = document.querySelector('#remove_workspace_select_template');
    this.remove_workspace_select_template.addEventListener('input', e => {
      this.removeWorkspace().then(() => {});
    });

    this.updateProductList();
    this.updatePositionList();
    this.loadTemplateLists();

    this._loadDataTables().then(() => {});

    try {
      this.canvasHelper.playAnimation();
    } catch (e) {
      console.log('play anim error', e);
    }

    let basketListHTML = '';
    if (this.productData.displayBlocks)
      for (let c = 0, l = this.productData.displayBlocks.length; c < l; c++)
        basketListHTML += `<option>${this.productData.displayBlocks[c]}</option>`;
    document.getElementById('basketblocklist').innerHTML = basketListHTML;

    return Promise.resolve();
  }
  async _loadDataTables() {
    await Promise.all([
      this.loadDataTable('asset'),
      this.loadDataTable('scene'),
      this.loadDataTable('product'),
    ]);

    this.__tableChangedHandler();
    this.initSceneEditFields();
    this.sceneOptionsBlockListChange();
  }
  async loadTemplateLists() {
    let projectListData = await firebase.database().ref('projectTitles').once('value');
    let projectList = projectListData.val();

    this.updateProjectList(projectList, gAPPP.a.profile.selectedWorkspace);
    this.__initAddTemplates(this.add_animation_asset_template, this.assetTemplates);
    this.__initAddTemplates(this.import_asset_templates_select, this.assetTemplates, '<option>Template</option>');
    this.__initAddTemplates(this.add_animation_scene_template, this.sceneTemplates);
    this.__initAddTemplates(this.import_scene_templates_select, this.sceneTemplates, '<option>Template</option>');
    this.__initAddTemplates(this.add_animation_product_template, this.productTemplates);
    this.__initAddTemplates(this.import_product_templates_select, this.productTemplates, '<option>Template</option>');
    this.import_scene_workspaces_select.innerHTML = '<option>Animations</option>' + this.workplacesSelect.innerHTML;
    if (this.workplacesSelect.selectedIndex !== -1) {
      this.import_scene_workspaces_select.options[this.workplacesSelect.selectedIndex + 1].remove();
      this.import_scene_workspaces_select.selectedIndex = 0;
    }
    this.import_asset_workspaces_select.innerHTML = '<option>Animations</option>' + this.workplacesSelect.innerHTML;
    if (this.workplacesSelect.selectedIndex !== -1) {
      this.import_asset_workspaces_select.options[this.workplacesSelect.selectedIndex + 1].remove();
      this.import_asset_workspaces_select.selectedIndex = 0;
    }
    this.import_product_workspaces_select.innerHTML = '<option>Animations</option>' + this.workplacesSelect.innerHTML;
    if (this.workplacesSelect.selectedIndex !== -1) {
      this.import_product_workspaces_select.options[this.workplacesSelect.selectedIndex + 1].remove();
      this.import_product_workspaces_select.selectedIndex = 0;
    }
    this.__initAddAnimations(`add_animation_asset_animation`);
    this.__initAddAnimations('add_animation_scene_animation');
    this.__initAddAnimations('add_animation_product_animation');
    this.__initAddAnimations('remove_workspace_select_template', '<option>Delete Animation</option>');
  }
  async __addAnimationTemplate(type, targetProjectId, sourceProjectId) {
    if (!sourceProjectId)
      sourceProjectId = gAPPP.a.profile.selectedWorkspace;
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
      let filename = this[`${type}TemplateFiles`][title];
      let response = await fetch(this.templateBasePath + filename);
      let csv = await response.text();
      let csvJSON = await this.papaParse(csv);
      if (csvJSON.data) data = csvJSON.data;
    }

    if (data) {
      await gAPPP.a.writeProjectRawData(targetProjectId, type + 'Rows', data);
    }

    return Promise.resolve();
  }
  async _addAnimation() {
    let newTitle = this.addProjectName.value.trim();
    if (newTitle.length === 0) {
      alert('need a name for animation');
      return;
    }
    this.canvasHelper.hide();

    let newAnimationKey = gAPPP.a.modelSets['projectTitles'].getKey();

    await this._addProject(newTitle, newTitle, newAnimationKey, false);

    await Promise.all([
      this.__addAnimationTemplate('asset', newAnimationKey),
      this.__addAnimationTemplate('scene', newAnimationKey)
    ]);

    await this.__addAnimationTemplate('product', newAnimationKey);

    return this.reloadScene(false, newAnimationKey);
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
  __initAddAnimations(thisid, prefixOptionHTML = '') {
    this[thisid].innerHTML = prefixOptionHTML + this.workplacesSelect.innerHTML;
    if (this.workplacesSelect.selectedIndex !== -1)
      this[thisid].selectedIndex = 0;
  }
  __initAddTemplates(sel, list, htmlPrefix = '') {
    let html = '';
    for (let c = 0; c < list.length; c++)
      html += `<option>${list[c]}</option>`;
    sel.innerHTML = htmlPrefix + html;
  }
  __updateAddTemplate(type) {
    let value = this['add_animation_' + type + '_choice'].value;

    this['add_animation_' + type + '_template'].style.display = 'none';
    this['add_animation_' + type + '_animation'].style.display = 'none';

    if (value === 'Template') {
      this['add_animation_' + type + '_template'].style.display = 'inline-block';
    }
    if (value === 'Animation') {
      this['add_animation_' + type + '_animation'].style.display = 'inline-block';
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
  toggleAddView() {
    if (this.addViewShown) {
      this.addViewShown = false;
      this.addViewToggleButton.classList.remove('button-expanded');
      document.getElementById('workspace-add-panel').classList.remove('expanded');
    } else {
      this.addViewShown = true;
      this.addViewToggleButton.classList.add('button-expanded');
      document.getElementById('workspace-add-panel').classList.add('expanded');
    }
  }
  toggleImportOptions() {
    if (this.toggledImportOptions) {
      this.toggledImportOptions = false;
      document.getElementById('import_product_options').classList.remove('expanded');
      document.getElementById('import_asset_options').classList.remove('expanded');
      document.getElementById('import_scene_options').classList.remove('expanded');
      this.import_products_csv_expand_btn.classList.remove('button-expanded');
    } else {
      this.toggledImportOptions = true;
      document.getElementById('import_product_options').classList.add('expanded');
      document.getElementById('import_scene_options').classList.add('expanded');
      document.getElementById('import_asset_options').classList.add('expanded');
      this.import_products_csv_expand_btn.classList.add('button-expanded');
    }
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

    this.editTables[tableName] = new Tabulator(`#${tableName}_tab_table`, {
      data,
      virtualDom: true,
      height: '100%',
      width: '100%',
      movableRows: true,
      movableColumns: false,
      selectable: false,
      layout: "fitData",
      columns,
      dataEdited: data => this.__tableChangedHandler(),
      rowMoved: (row) => this._rowMoved(tableName, row)
    });

    document.getElementById(`import_${tableName}_csv_btn`).addEventListener('click', e => {
      this.saveCSVType = tableName;
      this.importFileDom.click();
    });
    document.getElementById('download_' + tableName + '_csv').addEventListener('click', e => this.downloadCSV(tableName));

    this.editTables[tableName].cacheData = JSON.stringify(this.editTables[tableName].getData());

    document.getElementById(`ui-${tableName}-tab`).addEventListener('click', e => {
      this.__reformatTable(tableName);
      //    this.editTables[tableName].redraw(true);
      this.editTables[tableName].setColumnLayout();
    });
  }
  _rowMoved(tableName, row) {
    let tbl = this.editTables[tableName];
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
  saveEditTable(tableName, e) {
    this.canvasHelper.hide();

    let tbl = this.editTables[tableName];
    let data = tbl.getData();

    for (let c = 0, l = data.length; c < l; c++) {
      delete data[c][undefined];

      for (let i in data[c])
        if (data[c][i] === undefined)
          data[c][i] = '';
    }


    gAPPP.a.writeProjectRawData(gAPPP.a.profile.selectedWorkspace, tableName + 'Rows', data)
      .then(r => this.reloadScene())
      .then(() => {});

    if (e)
      e.preventDefault();
  }
  __reformatTable(tableName) {
    let tbl = this.editTables[tableName];
    let rows = tbl.getRows();
    for (let c = 0, l = rows.length; c < l; c++)
      rows[c].reformat();

    this.__tableChangedHandler();
  }
  ___testTableDirty(tableName) {
    let tbl = this.editTables[tableName];
    let setDirty = false;
    let newCache = JSON.stringify(this.editTables[tableName].getData());
    if (this.editTables[tableName].cacheData !== newCache)
      setDirty = true;

    return setDirty;
  }
  __tableChangedHandler() {
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
  }
  importCSV() {
    if (this.importFileDom.files.length > 0) {
      this.canvasHelper.hide();

      Papa.parse(this.importFileDom.files[0], {
        header: true,
        complete: results => {
          if (results.data) {
            gAPPP.a.writeProjectRawData(gAPPP.a.profile.selectedWorkspace, this.saveCSVType + 'Rows', results.data)
              .then(r => this.reloadScene())
              .then(() => {});
          }
        }
      });
    }
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
    this.addNewBtn.addEventListener('click', e => this.addNewProduct());

    this.assetEditField = this.record_field_list_form.querySelector('.assetedit');
    this.assetEditField.addEventListener('input', e => this.updateVisibleEditFields());

    this.updateVisibleEditFields();
  }
  updateVisibleEditFields() {
    let fieldsToShow = null;
    if (this.assetEditField.value === 'product')
      fieldsToShow = this.messageOnlyFields;
    else if (this.assetEditField.value === 'message')
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
  __uploadImageFile() {
    let fileBlob = this.uploadImageFile.files[0];

    if (!fileBlob)
      return;

    this.uploadImageEditField.parentElement.MaterialTextfield.change('Uploading...');

    let fireSet = gAPPP.a.modelSets['block'];
    let key = this.productData.sceneId + '/productfiles';
    fireSet.setBlob(key, fileBlob, fileBlob.name).then(uploadResult => {
      this.uploadImageEditField.parentElement.MaterialTextfield.change(uploadResult.downloadURL);
    });
  }
  updatePositionList() {
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
          let xd = this.record_field_list.querySelector('.xedit');
          let yd = this.record_field_list.querySelector('.yedit');
          let zd = this.record_field_list.querySelector('.zedit');

          xd.parentElement.MaterialTextfield.change(vals[0]);
          yd.parentElement.MaterialTextfield.change(vals[1]);
          zd.parentElement.MaterialTextfield.change(vals[2]);
        }

        sel.selectedIndex = 0;
      });
    }
  }
  __checkForPosition(x, y, z) {
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
  addNewProduct() {
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

    if (this.highlightedRow) {
      if (!confirm('Overwrite ' + name + '?'))
        return;
    }

    this.canvasHelper.hide();
    let newRow = {};
    for (let c = 0, l = fields.length; c < l; c++)
      newRow[this.fieldList[c]] = fields[c].value;

    gAPPP.a.readProjectRawData(gAPPP.a.profile.selectedWorkspace, 'productRows')
      .then(products => {
        products.push(newRow);

        p = this.__sortProductRows(p);
        gAPPP.a.writeProjectRawData(gAPPP.a.profile.selectedWorkspace, 'productRows', products)
          .then(() => this.reloadScene())
          .then(() => {});
      });
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
      if (!changeWorkspace) this.loadTemplateLists();

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
  async papaParse(csvData) {
    return new Promise((resolve) => {
      Papa.parse(csvData, {
        header: true,
        complete: results => resolve(results)
      });
    });
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
    let fieldData = this.sceneFieldEditBlocks[index];

    let fieldHtml = '';
    let name = fieldData.name;
    let asset = fieldData.asset;

    for (let c = 0, l = fieldData.fieldList.length; c < l; c++) {
      let type = fieldData.fieldList[c].type;
      let field = fieldData.fieldList[c].field;

      if (type === 'num') {
        let v = this.__getSceneOptionsValue(fieldData.tab, name, asset, field);
        fieldHtml += '<div class="scene_num_field_wrapper mdl-textfield mdl-js-textfield mdl-textfield--floating-label">' +
          `<input data-field="${field}" class="mdl-textfield__input" type="text" value="${v}"` +
          `data-type="${type}" data=name="${name}" data-asset="${asset}" id="scene_edit_field_${c}_${field}" />` +
          `<label class="mdl-textfield__label" for="scene_edit_field_${c}_${field}">${field}</label>` +
          '</div>';
      }
    }

    this.scene_options_edit_fields.innerHTML = fieldHtml;
    componentHandler.upgradeDom();
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
