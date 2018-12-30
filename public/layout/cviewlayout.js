class cViewLayout extends bView {
  constructor() {
    super();
    this.canvasHelper.cameraShownCallback = () => {
      this._animReady();
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
      gutterSize: 8,
      direction: 'horizontal',
      onDragEnd: () => gAPPP.resize(),
      onDrag: () => gAPPP.resize()
    });

    this.fieldsDom = document.getElementById('record_field_list');
    this.productListDiv = document.querySelector('.product-list-panel');
    this.innerSplitTop = document.querySelector('.inner-split-view-top');
    this.splitInstanceInner = window.Split([this.innerSplitTop, this.fieldsDom], {
      sizes: [50, 50],
      gutterSize: 9,
      direction: 'vertical'
    });

    this.download_asset_csv = document.getElementById('download_asset_csv');
    this.download_asset_csv.addEventListener('click', e => this.downloadCSV('asset'));
    this.download_product_csv = document.getElementById('download_product_csv');
    this.download_product_csv.addEventListener('click', e => this.downloadCSV('product'));
    this.download_scene_csv = document.getElementById('download_scene_csv');
    this.download_scene_csv.addEventListener('click', e => this.downloadCSV('scene'));

    this.fieldList = [
      'name', 'asset', 'displayindex', 'childtype', 'parent',
      'camerafov', 'cameraheightoffset', 'cameraradius',
      'cameraacceleration', 'maxcameraspeed', 'camerarotationoffset',

      'texturetext', 'texturepath', 'basketblock',
      'itemtitle', 'itemprice', 'itemid', 'itemdesc', 'itemcount',

      'height', 'width', 'depth',
      'x', 'y', 'z', 'rx', 'ry', 'rz', 'startx', 'starty', 'startz',
      'startrx', 'startry', 'startrz'
    ];
    this.initFieldEdit();

    this.textEditFieldsHide = ['basketblock', 'texturepath', 'itemtitle', 'itemprice', 'itemid', 'itemdesc', 'itemcount',
      'cameraacceleration', 'camerafov', 'cameraheightoffset', 'cameramovetime', 'cameraradius', 'maxcameraspeed',
      'camerarotationoffset', 'runlength', 'introtime', 'finishdelay', 'startx', 'starty', 'startz', 'startrx', 'startry',
      'startrz', 'childtype'
    ];
    this.productEditFieldsHide = ['texturetext',
      'cameraacceleration', 'camerafov', 'cameraheightoffset', 'cameramovetime', 'cameraradius', 'maxcameraspeed',
      'camerarotationoffset', 'runlength', 'introtime', 'finishdelay', 'startx', 'starty', 'startz', 'startrx', 'startry',
      'startrz', 'childtype'
    ];
    this.cameraEditFieldsHide = ['displayindex', 'texturepath', 'texturetext', 'basketblock', 'height', 'width', 'depth',
      'itemid', 'itemdesc', 'itemcount', 'itemtitle', 'itemprice'
    ];

    this.productBySKU = {};
    this.skuOrder = [];
    this.basketSKUs = {};

    this.importFileDom = document.querySelector('.csv-import-file');
    this.importFileDom.addEventListener('change', e => this.importCSV());
    this.importAssetsCSVBtn = document.getElementById('import_assets_csv_btn');
    this.importSceneCSVBtn = document.getElementById('import_scene_csv_btn');
    this.importProductsCSVBtn = document.getElementById('import_products_csv_btn');
    this.importAssetsCSVBtn.addEventListener('click', e => {
      this.saveCSVType = 'asset';
      this.importFileDom.click();
    });
    this.importSceneCSVBtn.addEventListener('click', e => {
      this.saveCSVType = 'scene';
      this.importFileDom.click();
    });
    this.importProductsCSVBtn.addEventListener('click', e => {
      this.saveCSVType = 'product';
      this.importFileDom.click();
    });

    this.canvasActionsDom = document.querySelector('.canvas-actions');
    this.canvasActionsDom.classList.add('canvas-actions-shown');
  }
  _animReady() {
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
  reloadScene(clear) {
    if (!gAPPP.a.profile.selectedWorkspace)
      return;

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

      Papa.parse(this.importFileDom.files[0], {
        header: true,
        complete: results => {
          if (results.data) {
            if (this.saveCSVType === 'asset') {
              gAPPP.a.writeProjectRawData(gAPPP.a.profile.selectedWorkspace, 'assetRows', results.data)
                .then(r => this.reloadScene());
            }
            if (this.saveCSVType === 'product') {
              gAPPP.a.writeProjectRawData(gAPPP.a.profile.selectedWorkspace, 'productRows', results.data)
                .then(r => this.reloadScene());
            }
            if (this.saveCSVType === 'scene') {
              gAPPP.a.writeProjectRawData(gAPPP.a.profile.selectedWorkspace, 'sceneRows', results.data)
                .then(r => this.reloadScene());
            }
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
    btn.setAttribute('class', 'mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect mdl-button--primary');
    btn.style.float = 'right';
    btn.innerHTML = '<i class="material-icons">publish</i> Upsert';
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
        select.style.top = '0';
        select.style.right = '5px';
        select.style.width = 'auto';
        select.setAttribute('id', 'select_position_preset');
        select.setAttribute('class', 'mdl-textfield__input');
        componentHandler.upgradeElement(select);
        this.fieldDivByName[title].appendChild(select);
        this.fieldDivByName[title].style.position = 'relative;'
      }
      if (title === 'texturepath') {
        let btn = document.createElement('button');
        btn.style.position = 'absolute';
        btn.style.top = '0';
        btn.style.right = '0';
        btn.innerHTML = '<i class="material-icons">cloud_upload</i>';
        btn.setAttribute('class', 'mdl-button mdl-js-button mdl-button--fab mdl-button--mini-fab mdl-button--colored texturepathupload');
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

    this.heightHR = document.createElement('hr');
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

    this.afterParentHR = document.createElement('hr');
    fDom.insertBefore(this.afterParentHR, this.fieldDivByName['camerafov']);
  }
  updateVisibleEditFields() {
    let rowsToHide = [];
    this.xBR.style.display = '';
    if (this.assetEditField.value === 'displayproduct')
      rowsToHide = this.productEditFieldsHide;
    if (this.assetEditField.value === 'displaymessage')
      rowsToHide = this.textEditFieldsHide;
    if (this.assetEditField.value === 'productfollowcamera') {
      this.xBR.style.display = 'none';
      rowsToHide = this.cameraEditFieldsHide;
    }

    for (let i in this.fieldDivByName)
      if (rowsToHide.indexOf(i) !== -1)
        this.fieldDivByName[i].style.display = 'none';
      else
        this.fieldDivByName[i].style.display = '';

  }
  __uploadImageFile() {
    let fileBlob = this.uploadImageFile.files[0];

    if (!fileBlob)
      return;

    this.uploadImageEditField.value = 'uploading...';

    let fireSet = gAPPP.a.modelSets['block'];
    let key = this.productData.sceneId + '/productfiles';
    fireSet.setBlob(key, fileBlob, fileBlob.name).then(uploadResult => {
      this.uploadImageEditField.value = uploadResult.downloadURL
    });


    //    console.log(field, file);
  }
  updatePositionList() {
    let positionInfo = gAPPP.a.modelSets['block'].getValuesByFieldLookup('blockFlag', 'displaypositions');
    let sel = document.getElementById('select_position_preset');
    if (positionInfo) {
      let arr = positionInfo.genericBlockData.split('|');
      let positionHTML = '<option>preset positions</option>';

      for (let c = 0, l = arr.length; c < l - 2; c += 3)
        positionHTML += '<option>' + arr[c] + ',' + arr[c + 1] + ',' + arr[c + 2] + '</option>';

      sel.innerHTML = positionHTML;
      sel.addEventListener('input', e => {
        let vals = sel.value.split(',');

        if (vals.length === 3) {
          this.fieldsDom.querySelector('.xedit').value = vals[0];
          this.fieldsDom.querySelector('.yedit').value = vals[1];
          this.fieldsDom.querySelector('.zedit').value = vals[2];

        }
      })
    }
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
      let xyz = `${row.x},${row.y},${row.z}`;

      if (c === l)
        itemType = 'camera';
      else if (row.asset === 'block') {
        itemType = 'product';
        desc = row.itemtitle;
      }

      let rowH = `<td class="mdl-data-table__cell--non-numeric">${row.name}</td>`;
      rowH += `<td class="mdl-data-table__cell--non-numeric">${itemType}</td>`;
      rowH += `<td>${displayIndex}</td>`;
      rowH += `<td class="mdl-data-table__cell--non-numeric">${desc}</td>`;
      rowH += `<td>${xyz}</td>`;
      rowH += `<td class="mdl-data-table__cell--non-numeric"><button class="fetch mdl-button mdl-js-button mdl-button--icon mdl-button--primary" data-id="${row.name}"><i class="material-icons">edit</i></button>`;
      if (itemType !== 'camera')
        rowH += ` <button class="remove mdl-button mdl-js-button mdl-button--icon" data-id="${row.name}"><i class="material-icons">delete</i></button>`;
      rowH += `</td>`;

      productListHTML += `<tr>${rowH}</tr>`;
    }

    this.productListDiv.innerHTML = `<table class="mdl-data-table mdl-js-data-table products-table" style="width:100%">` +
      `<tr><th class="mdl-data-table__cell--non-numeric">Name</th><th class="mdl-data-table__cell--non-numeric">Type</th><th>Index</th>` +
      `<th class="mdl-data-table__cell--non-numeric">Desc</th><th>x,y,z</th><th class="mdl-data-table__cell--non-numeric"></th></tr>` +
      `${productListHTML}</table>`;

    let fetchBtns = this.productListDiv.querySelectorAll('.fetch');
    for (let c = 0, l = fetchBtns.length; c < l; c++)
      fetchBtns[c].addEventListener('click', e => {
        return this.fetchProductByName(e.currentTarget.dataset.id);
      });

    let removeBtns = this.productListDiv.querySelectorAll('.remove');
    for (let c2 = 0, l2 = removeBtns.length; c2 < l2; c2++)
      removeBtns[c2].addEventListener('click', e => {
        return this.removeProductByName(e.currentTarget.dataset.id);
      });
  }
  removeProductByName(name) {
    gAPPP.a.readProjectRawData(gAPPP.a.profile.selectedWorkspace, 'productRows')
      .then(products => {
        let outProducts = []
        for (let c = 0, l = products.length; c < l; c++)
          if (products[c].name !== name)
            outProducts.push(products[c]);

        gAPPP.a.writeProjectRawData(gAPPP.a.profile.selectedWorkspace, 'productRows', outProducts)
          .then(() => this.reloadScene())
      });
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
  }
  upsertProduct() {
    let fDom = document.getElementById('record_field_list');
    let fields = fDom.querySelectorAll('.fieldinput');

    let name = fields[0].value;
    if (!name) {
      alert('name required');
      return;
    }

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

  }
  addProject() {
    let newTitle = this.addProjectName.value.trim();
    if (newTitle.length === 0) {
      alert('need a name for scene');
      return;
    }
    this._addProject(newTitle, newTitle);
  }
}
