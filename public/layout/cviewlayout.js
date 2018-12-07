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

    let t = document.querySelector('#demo-layout-panel');
    let b = document.querySelector('.main-canvas-wrapper');
    this.splitInstance = window.Split([b, t], {
      sizes: [40, 60],
      gutterSize: 12,
      direction: 'horizontal',
      onDragEnd: () => gAPPP.resize(),
      onDrag: () => gAPPP.resize()
    });

    this.download_asset_csv = document.getElementById('download_asset_csv');
    this.download_asset_csv.addEventListener('click', e => this.downloadCSV('asset'));
    this.download_product_csv = document.getElementById('download_product_csv');
    this.download_product_csv.addEventListener('click', e => this.downloadCSV('product'));

    this.clearSceneBtn = document.getElementById('clear_scene_btn');
    this.clearSceneBtn.addEventListener('click', e => this.clearScene());

    this.upsertBtn = document.getElementById('update_product_fields_post');
    this.upsertBtn.addEventListener('click', e => this.upsertProduct());

    this.productListDiv = document.querySelector('.product-list-panel');
    this.fieldList = [
      'name', 'asset', 'displayindex', 'texturepath', 'texturetext', 'basketblock',
      'height', 'width', 'depth',
      'x', 'y', 'z', 'parent', 'itemtitle', 'itemprice', 'itemid', 'itemdesc', 'itemcount',
      'cameraacceleration', 'camerafov', 'cameraheightoffset', 'cameramovetime', 'cameraradius', 'maxcameraspeed',
      'camerarotationoffset', 'runlength', 'introtime', 'finishdelay', 'rx', 'ry', 'rz', 'startx', 'starty', 'startz',
      'startrx', 'startry', 'startrz', 'cameraname', 'childtype'
    ];
    this.initFieldEdit();
    this.productBySKU = {};
    this.skuOrder = [];
    this.basketSKUs = {};

    this.importFileDom = document.querySelector('.csv-import-file');
    this.importFileDom.addEventListener('change', e => this.importCSV());
    this.importAssetsCSVBtn = document.getElementById('import_assets_csv_btn');
    this.importProductsCSVBtn = document.getElementById('import_products_csv_btn');
    this.importAssetsCSVBtn.addEventListener('click', e => {
      this.saveCSVType = 'asset';
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
        .then(() => this.reloadScene(true))
    }
  }
  initFieldEdit() {
    let fDom = document.getElementById('record_field_list');

    let domHTML = '';
    for (let c = 0, l = this.fieldList.length; c < l; c++) {
      let title = this.fieldList[c];
      let extraText = '';
      if (title === 'texturepath')
        extraText += `<button class="texturepathupload">Upload</button><input type="file" class="texturepathuploadfile" style="display:none;" />&nbsp;`

      domHTML += `<div><label>${this.fieldList[c]}: <input class="fieldinput ${title}edit" list="${this.fieldList[c]}list" />${extraText}</label></div>&nbsp;`;
    }

    fDom.innerHTML = domHTML;

    this.uploadImageButton = fDom.querySelector('.texturepathupload');
    this.uploadImageEditField = fDom.querySelector('.texturepathedit');
    this.uploadImageFile = fDom.querySelector('.texturepathuploadfile');
    this.uploadImageFile.addEventListener('change', e => this.__uploadImageFile());
    this.uploadImageButton.addEventListener('click', e => this.uploadImageFile.click());
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

      let rowH = `<td>${row.name}</td>`;
      rowH += `<td>${itemType}</td>`;
      rowH += `<td>${displayIndex}</td>`;
      rowH += `<td>${desc}</td>`;
      rowH += `<td>${row.basketblock}</td>`;
      rowH += `<td>${xyz}</td>`;
      rowH += `<td><button class="fetch" data-id="${row.name}">Fetch</button>`;
      if (itemType !== 'camera')
        rowH += ` <button class="remove" data-id="${row.name}">Remove</button>`;
      rowH += `</td>`;

      productListHTML += `<tr>${rowH}</tr>`;
    }

    this.productListDiv.innerHTML = `<table style="width:100%">` +
      `<tr><th>Name</th><th>Type</th><th>Index</th><th>Desc</th><th>basketblock</th><th>x,y,z</th><th></th></tr>` +
      `${productListHTML}</table>`;

    let fetchBtns = this.productListDiv.querySelectorAll('.fetch');
    for (let c = 0, l = fetchBtns.length; c < l; c++)
      fetchBtns[c].addEventListener('click', e => {
        return this.fetchProductByName(e.target.dataset.id);
      });

    let removeBtns = this.productListDiv.querySelectorAll('.remove');
    for (let c2 = 0, l2 = removeBtns.length; c2 < l2; c2++)
      removeBtns[c2].addEventListener('click', e => {
        return this.removeProductByName(e.target.dataset.id);
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
      f.value = (v !== undefined) ? v : '';
    }
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
  sceneToggleView() {
    if (this.viewCollapsed) {
      this.receiptDisplayPanel.style.right = '';
      this.collapseButton.innerHTML = '<i class="material-icons">unfold_less</i>';
      this.displayButtonPanel.style.width = '';
      this.viewCollapsed = false;
      //this._setButtonLabels();
    } else {
      this.viewCollapsed = true;
      this.collapseButton.innerHTML = '<i class="material-icons">unfold_more</i>';
      this.displayButtonPanel.style.width = '6em';
      this.receiptDisplayPanel.style.right = '-50%';
      this.basketClearButtons();
    }
  }
  sceneToggleControls() {
    if (!this.controlsShown) {
      this.controlsShown = true;
      document.querySelector('.canvas-actions').style.display = 'block';
    } else {
      this.controlsShown = false;
      document.querySelector('.canvas-actions').style.display = 'none';
    }
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
