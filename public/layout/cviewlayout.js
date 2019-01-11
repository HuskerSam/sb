class cViewLayout extends bView {
  constructor() {
    super();
    this.canvasHelper.cameraShownCallback = () => {
      this._workspaceLoadedAndInited();
    };

    this.workplacesSelect = document.querySelector('#workspaces-select');
    this.workplacesRemoveButton = document.querySelector('#remove-workspace-button');
    this.workplacesSelect.addEventListener('input', e => this.selectProject());
    this.workplacesRemoveButton.addEventListener('click', e => this.deleteProject());
    this.addProjectButton = document.querySelector('#add-workspace-button');
    this.addProjectButton.addEventListener('click', e => this.addProject());
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

    this.fieldsDom = document.getElementById('record_field_list');
    this.productListDiv = document.querySelector('.product-list-panel');
    this.innerSplitTop = document.querySelector('#product-list-field-splitwrapper');
    this.splitInstanceInner = window.Split([this.productListDiv, this.fieldsDom], {
      sizes: [50, 50],
      gutterSize: 19,
      direction: 'vertical'
    });

    this.download_product_csv = document.getElementById('download_product_csv');
    this.download_product_csv.addEventListener('click', e => this.downloadCSV('product'));

    this.import_products_csv_expand_btn = document.getElementById('import_products_csv_expand_btn');
    this.import_products_csv_expand_btn.addEventListener('click', e => this.toggleImportOptions());
    let closeBtns = document.querySelectorAll('.import-export-inpanel-button');
    for (let c = 0, l = closeBtns.length; c < l; c++)
      closeBtns[c].addEventListener('click', e => this.toggleImportOptions());


    this.fieldList = [
      'name', 'asset', 'displayindex',
      'cameraheightoffset', 'cameraradius', 'cameramovetime',

      'texturetext', 'texturepath', 'basketblock',
      'itemtitle', 'itemprice', 'itemid', 'itemdesc',

      'height', 'width', 'depth',
      'x', 'y', 'z', 'rx', 'ry', 'rz', 'startx', 'starty', 'startz',
      'startrx', 'startry', 'startrz'
    ];
    this.allColumnList = [
      'name', 'asset', 'parent', 'childtype', 'shapetype', 'frametime', 'frameorder', 'height', 'width', 'depth', 'itemtitle', 'itemid', 'itemdesc',
      'itemprice', 'materialname', 'texturepath', 'bmppath', 'color', 'meshpath', 'diffuse', 'ambient', 'emissive', 'scalev', 'scaleu', 'visibility',
      'x', 'y', 'z', 'rx', 'ry', 'rz', 'sx', 'sy', 'sz', 'basketblock', 'cameratargetblock', 'cameraradius', 'cameraheightoffset', 'cameramovetime',
      'blockcode', 'displayindex', 'introtime', 'finishdelay', 'runlength', 'startx', 'starty', 'startz', 'startrx', 'startry', 'startrz', 'blockflag',
      'texturetext', 'texturetextrendersize', 'texture2dfontweight', 'textfontsize', 'textfontfamily', 'textfontcolor', 'genericblockdata'
    ];
    this.initFieldEdit();

    this.textEditFieldsHide = ['basketblock', 'texturepath', 'itemtitle', 'itemprice', 'itemid', 'itemdesc',
      'cameraheightoffset', 'cameramovetime', 'cameraradius',
      'runlength', 'introtime', 'finishdelay', 'startx', 'starty', 'startz', 'startrx', 'startry',
      'startrz'
    ];
    this.productEditFieldsHide = ['texturetext',
      'cameraheightoffset', 'cameramovetime', 'cameraradius',
      'runlength', 'introtime', 'finishdelay', 'startx', 'starty', 'startz', 'startrx', 'startry',
      'startrz'
    ];
    this.cameraEditFieldsHide = ['displayindex', 'texturepath', 'texturetext', 'basketblock', 'height', 'width', 'depth',
      'itemid', 'itemdesc', 'itemtitle', 'itemprice'
    ];

    this.productBySKU = {};
    this.skuOrder = [];
    this.basketSKUs = {};
    this.editTables = {};

    this.importFileDom = document.querySelector('.csv-import-file');
    this.importFileDom.addEventListener('change', e => this.importCSV());
    this.importSceneCSVBtn = document.getElementById('import_scene_csv_btn');
    this.importProductsCSVBtn = document.getElementById('import_products_csv_btn');
    this.importProductsCSVBtn.addEventListener('click', e => {
      this.saveCSVType = 'product';
      this.importFileDom.click();
    });

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

    this.loadDataTable('asset');
    this.loadDataTable('scene');

    this.toggledImportOptions = true;
    this.toggleImportOptions();
  }
  _workspaceLoadedAndInited() {
    if (this.cameraShown)
      return;
    this.cameraShown = true;
    setTimeout(() => {
      this.productData = GUTILImportCSV.initCSVProducts();
      this.products = this.productData.products;
      this.productBySKU = this.productData.productsBySKU;

      this.canvasHelper.cameraSelect.selectedIndex = 2;
      this.canvasHelper.noTestError = true;
      this.canvasHelper.cameraChangeHandler();
      this.updateProductList();
      this.updatePositionList();
      this.import_scene_workspaces_select.innerHTML = '<option>Workspaces</option>' + this.workplacesSelect.innerHTML;
      if (this.workplacesSelect.selectedIndex !== -1) {
        this.import_scene_workspaces_select.options[this.workplacesSelect.selectedIndex + 1].remove();
        this.import_scene_workspaces_select.selectedIndex = 0;
      }
      this.import_asset_workspaces_select.innerHTML = '<option>Workspaces</option>' + this.workplacesSelect.innerHTML;
      if (this.workplacesSelect.selectedIndex !== -1) {
        this.import_asset_workspaces_select.options[this.workplacesSelect.selectedIndex + 1].remove();
        this.import_asset_workspaces_select.selectedIndex = 0;
      }

      try {
        this.canvasHelper.playAnimation();
      } catch (e) {
        console.log('play anim error', e);
      }

      let basketListHTML = '';
      for (let c = 0, l = this.productData.displayBlocks.length; c < l; c++)
        basketListHTML += `<option>${this.productData.displayBlocks[c]}</option>`;
      document.getElementById('basketblocklist').innerHTML = basketListHTML;

    }, 100);
  }
  toggleImportOptions() {
    if (this.toggledImportOptions) {
      this.toggledImportOptions = false;
      document.getElementById('import_product_options').style.display = 'none';
      document.getElementById('import_asset_options').style.display = 'none';
      document.getElementById('import_scene_options').style.display = 'none';
      this.import_products_csv_expand_btn.style.color = '';
      this.import_products_csv_expand_btn.style.backgroundColor = '';
    } else {
      this.toggledImportOptions = true;
      document.getElementById('import_product_options').style.display = 'block';
      document.getElementById('import_scene_options').style.display = 'block';
      document.getElementById('import_asset_options').style.display = 'block';

      this.import_products_csv_expand_btn.style.color = 'black';
      this.import_products_csv_expand_btn.style.backgroundColor = 'rgb(105, 240, 174)';
    }
  }
  loadDataTable(tableName) {
    gAPPP.a.readProjectRawData(gAPPP.a.profile.selectedWorkspace, tableName + 'Rows')
      .then(results => {
        let data = [];
        if (results) data = results;

        let columns = [];
        columns.push({
          rowHandle: true,
          formatter: "handle",
          headerSort: false,
          cssClass: 'row-handle-table-cell',
          frozen: true,
          width: 30,
          minWidth: 30
        });
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

        for (let c = 0, l = this.allColumnList.length; c < l; c++)
          columns.push({
            title: this.allColumnList[c],
            field: this.allColumnList[c],
            editor: true,
            headerSort: false,
            layoutColumnsOnNewData: true,
            columnResizing: 'headerOnly',
            cssClass: this.allColumnList[c].length > 10 ? 'tab-header-cell-large' : '',
            headerVertical: this.allColumnList[c].length > 5 ? true : false
          });

        columns[4].frozen = true;
        let tCol = columns[4];
        columns[4] = columns[3];
        columns[3] = columns[2];
        columns[2] = tCol;

        this.editTables[tableName] = new Tabulator(`#${tableName}_tab_table`, {
          data,
          virtualDom: true,
          height: '100%',
          width: '100%',
          movableRows: true,
          movableColumns: true,
          selectable: false,
          layout: "fitData",
          columns,
          dataEdited: data => this.__updateFooterRow(tableName, true),
          footerElement: '<div class="footer-wrapper">' +
            `<button id="${tableName}_changes_commit" class="mdl-button mdl-js-button mdl-button--fab mdl-button--mini-fab mdl-button--primary"><i class="material-icons">save</i></button><div id="${tableName}_table_footer"></div>` +
            '</div>',
          rowMoved: (row) => this.__reformatTable(tableName)
        });

        document.getElementById(`import_${tableName}_csv_btn`).addEventListener('click', e => {
          this.saveCSVType = tableName;
          this.importFileDom.click();
        });
        document.getElementById('download_' + tableName + '_csv').addEventListener('click', e => this.downloadCSV(tableName));
        document.getElementById(tableName + '_changes_commit').addEventListener('click', e => this.saveEditTable(tableName, e));
        document.getElementById(tableName + '_changes_commit_header').addEventListener('click', e => this.saveEditTable(tableName, e));

        this.editTables[tableName].cacheData = JSON.stringify(this.editTables[tableName].getData());
        this.__updateFooterRow(tableName);
      });

    this.tabFirstVisits = {};
    document.getElementById(`ui-${tableName}-tab`).addEventListener('click', e => {
      if (this.tabFirstVisits[tableName])
        return this.editTables[tableName].redraw();
      this.tabFirstVisits[tableName] = true;
      this.__reformatTable(tableName);
      this.editTables[tableName].redraw(true);
    });
  }
  saveEditTable(tableName, e) {
    this.canvasHelper.hide();

    let tbl = this.editTables[tableName];
    let data = tbl.getData();

    for (let c = 0, l = data.length; c < l; c++)
      delete data[c][undefined];


    gAPPP.a.writeProjectRawData(gAPPP.a.profile.selectedWorkspace, tableName + 'Rows', data)
      .then(r => this.reloadScene());

    if (e)
      e.preventDefault();
  }
  __reformatTable(tableName) {
    let tbl = this.editTables[tableName];
    let rows = tbl.getRows();
    for (let c = 0, l = rows.length; c < l; c++)
      rows[c].reformat();

    this.__updateFooterRow(tableName);
  }
  __updateFooterRow(tableName) {
    let tbl = this.editTables[tableName];
    document.getElementById(tableName + '_table_footer').innerHTML = tbl.getDataCount() + ' rows';

    let setDirty = false;
    let newCache = JSON.stringify(this.editTables[tableName].getData());
    if (this.editTables[tableName].cacheData !== newCache)
      setDirty = true;


    if (setDirty) {
      document.getElementById(tableName + '_changes_commit').classList.add('isDirty');
      document.getElementById(tableName + '_changes_commit_header').style.display = 'inline-block';
    } else {
      document.getElementById(tableName + '_changes_commit').classList.remove('isDirty');
      document.getElementById(tableName + '_changes_commit_header').style.display = 'none';
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
  reloadScene(clear) {
    if (!gAPPP.a.profile.selectedWorkspace)
      return;

    this.canvasHelper.hide();

    if (clear) {
      gAPPP.a.clearProjectData(gAPPP.a.profile.selectedWorkspace)
        .then(() => setTimeout(() => location.reload(), 1));
    }

    gAPPP.a.clearProjectData(gAPPP.a.profile.selectedWorkspace)
      .then(() => gAPPP.a.readProjectRawData(gAPPP.a.profile.selectedWorkspace, 'assetRows'))
      .then(assets => this.__importRows(assets))
      .then(() => gAPPP.a.readProjectRawData(gAPPP.a.profile.selectedWorkspace, 'sceneRows'))
      .then(scene => this.__importRows(scene))
      .then(() => gAPPP.a.readProjectRawData(gAPPP.a.profile.selectedWorkspace, 'productRows'))
      .then(products => this.__importRows(products))
      .then(() => setTimeout(() => location.reload(), 1));
  }
  __importRows(rows) {
    if (!rows)
      return Promise.resolve();

    let promises = [];
    for (let c = 0, l = rows.length; c < l; c++) {
      promises.push(GUTILImportCSV.addCSVRow(rows[c]));
    }

    return Promise.all(promises);
  }
  importCSV() {
    if (this.importFileDom.files.length > 0) {
      this.canvasHelper.hide();

      Papa.parse(this.importFileDom.files[0], {
        header: true,
        complete: results => {
          if (results.data) {
            gAPPP.a.writeProjectRawData(gAPPP.a.profile.selectedWorkspace, this.saveCSVType + 'Rows', results.data)
              .then(r => this.reloadScene());
          }
        }
      });
    }
  }
  deleteProject() {
    if (confirm('Delete scene?')) {
      Promise.all([
        gAPPP.a.modelSets['projectTitles'].removeByKey(this.workplacesSelect.value),
        gAPPP.a.modelSets['userProfile'].commitUpdateList([{
          field: 'selectedWorkspace',
          newValue: 'none'
        }])
      ]).then(r => setTimeout(() => location.reload(), 100))
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
    }
  }
  initFieldEdit() {
    let fDom = this.fieldsDom;

    this.fieldDivByName = {};
    fDom.innerHTML = '<input type="file" class="texturepathuploadfile" style="display:none;" />';
    let btn = document.createElement('button');
    btn.setAttribute('id', 'update_product_fields_post');
    btn.setAttribute('class', 'mdl-button mdl-js-button mdl-button--fab mdl-button--mini-fab mdl-button--primary');
    btn.innerHTML = '<i class="material-icons">publish</i>';
    componentHandler.upgradeElement(btn);
    fDom.appendChild(btn);
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
      if (title === 'texturepath') {
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
      fDom.appendChild(this.fieldDivByName[title]);
    }

    this.uploadImageButton = fDom.querySelector('.texturepathupload');
    this.uploadImageEditField = fDom.querySelector('.texturepathedit');
    this.uploadImageFile = fDom.querySelector('.texturepathuploadfile');
    this.uploadImageFile.addEventListener('change', e => this.__uploadImageFile());
    this.uploadImageButton.addEventListener('click', e => this.uploadImageFile.click());
    this.upsertBtn = document.getElementById('update_product_fields_post');
    this.upsertBtn.addEventListener('click', e => this.upsertProduct());

    this.assetEditField = fDom.querySelector('.assetedit');
    this.assetEditField.addEventListener('input', e => this.updateVisibleEditFields());
    this.nameEditField = fDom.querySelector('.nameedit');
    this.nameEditField.addEventListener('input', e => this.highLightTableRow());

    this.heightHR = document.createElement('br');
    fDom.insertBefore(this.heightHR, this.fieldDivByName['height']);
    this.xBR = document.createElement('br');
    fDom.insertBefore(this.xBR, this.fieldDivByName['x']);
    this.rxBR = document.createElement('br');
    fDom.insertBefore(this.rxBR, this.fieldDivByName['rx']);
    this.startxBR = document.createElement('br');
    fDom.insertBefore(this.startxBR, this.fieldDivByName['startx']);
    this.startrxBR = document.createElement('br');
    fDom.insertBefore(this.startrxBR, this.fieldDivByName['startrx']);
    this.itempriceBR = document.createElement('br');
    fDom.insertBefore(this.itempriceBR, this.fieldDivByName['itemprice']);

    this.afterParentHR = document.createElement('br');
    fDom.insertBefore(this.afterParentHR, this.fieldDivByName['cameraheightoffset']);

    this.updateVisibleEditFields();
  }
  updateVisibleEditFields() {
    let rowsToHide = null;
    this.xBR.style.display = '';
    if (this.assetEditField.value === 'displayproduct')
      rowsToHide = this.productEditFieldsHide;
    if (this.assetEditField.value === 'displaymessage')
      rowsToHide = this.textEditFieldsHide;
    if (this.assetEditField.value === 'productfollowcamera') {
      this.xBR.style.display = 'none';
      rowsToHide = this.cameraEditFieldsHide;
    }

    for (let i in this.fieldDivByName) {
      if (rowsToHide) {
        if (rowsToHide.indexOf(i) !== -1)
          this.fieldDivByName[i].style.display = 'none';
        else
          this.fieldDivByName[i].style.display = '';
      } else {
        if (i !== 'asset' && i !== 'name')
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
          let xd = this.fieldsDom.querySelector('.xedit');
          let yd = this.fieldsDom.querySelector('.yedit');
          let zd = this.fieldsDom.querySelector('.zedit');

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
    if (this.productData.products.length === 0) {
      this.productListDiv.innerHTML = 'No products';
      return;
    }
    let productListHTML = '';
    for (let c = 0, l = this.productData.products.length; c <= l; c++) {
      let row = (c === l) ? this.productData.cameraOrigRow : this.productData.products[c].origRow;

      let displayIndex = row.displayindex;
      let itemType = 'text';
      let desc = row.texturetext;

      if (c === l)
        itemType = 'camera';
      else if (row.asset === 'block') {
        itemType = 'product';
        desc = row.itemtitle;
      }

      let rowH = `<td>`;
      if (itemType !== 'camera')
        rowH += ` &nbsp;<button class="remove mdl-button mdl-js-button mdl-button--icon mdl-button--primary" data-id="${row.name}"><i class="material-icons">delete</i></button>`;
      rowH += `</td>`;
      rowH += `<td>${displayIndex}</td>`;
      rowH += `<td>${row.name}</td>`;
      let x = GLOBALUTIL.getNumberOrDefault(row.x, 0).toFixed(1);
      let y = GLOBALUTIL.getNumberOrDefault(row.y, 0).toFixed(1);
      let z = GLOBALUTIL.getNumberOrDefault(row.z, 0).toFixed(1);
      rowH += `<td>${x}</td>`;
      rowH += `<td>${y}</td>`;
      rowH += `<td>${z}</td>`;
      let pos = this.__checkForPosition(row.x, row.y, row.z);
      rowH += `<td>${ pos > 0 ? '(' + pos + ')' : ''}</td>`;

      productListHTML += `<tr class="table-row-product-list" data-id="${row.name}">${rowH}</tr>`;
    }

    this.productListDiv.innerHTML = `<table class="mdl-data-table mdl-js-data-table products-table" style="width:100%">` +
      `<tr><th></th><th></th><th>name</th>` +
      `<th>x</th><th>y</th><th>z</th><th></th></tr>` +
      `${productListHTML}</table>`;

    let tRows = this.productListDiv.querySelectorAll('.table-row-product-list');
    for (let c = 0, l = tRows.length; c < l; c++)
      tRows[c].addEventListener('click', e => {
        return this.fetchProductByName(e.currentTarget.dataset.id);
      });

    let removeBtns = this.productListDiv.querySelectorAll('.remove');
    for (let c2 = 0, l2 = removeBtns.length; c2 < l2; c2++)
      removeBtns[c2].addEventListener('click', e => {
        return this.removeProductByName(e.currentTarget.dataset.id, e);
      });
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
  fetchProductByName(name) {
    let fDom = document.getElementById('record_field_list');
    let fields = fDom.querySelectorAll('.fieldinput');
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
    this.highLightTableRow();
  }
  upsertProduct() {
    let fDom = document.getElementById('record_field_list');
    let fields = fDom.querySelectorAll('.fieldinput');

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
        let outProducts = [];
        for (let c = 0, l = products.length; c < l; c++)
          if (products[c].name !== name && products[c].asset !== 'displayfinalize')
            outProducts.push(products[c]);

        if (newRow.asset === 'productfollowcamera') {
          outProducts.push(newRow);
          outProducts.push({
            asset: 'displayfinalize'
          });
        } else {
          outProducts.unshift(newRow);
          outProducts.push({
            asset: 'displayfinalize'
          });
        }

        gAPPP.a.writeProjectRawData(gAPPP.a.profile.selectedWorkspace, 'productRows', outProducts)
          .then(() => this.reloadScene())
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
  addProject() {
    let newTitle = this.addProjectName.value.trim();
    if (newTitle.length === 0) {
      alert('need a name for scene');
      return;
    }
    this._addProject(newTitle, newTitle);
  }
  highLightTableRow() {
    let name = this.nameEditField.value;
    let rows = this.productListDiv.querySelectorAll('tr.table-row-product-list');

    this.highlightedRow = false;
    for (let c = 0, l = rows.length; c < l; c++) {
      if (rows[c].dataset.id === name) {
        rows[c].style.background = 'rgb(200, 250, 250)';
        this.highlightedRow = true;
      } else
        rows[c].style.background = '';
    }
  }
}
