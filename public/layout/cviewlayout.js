class cViewLayout extends bView {
  constructor() {
    super();
    this.canvasHelper.cameraShownCallback = () => {
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
        this.canvasHelper.playAnimation();

        this.updateProductList();
      }, 100);

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

    this.dlProductCSVBtn = document.getElementById('download_product_csv');
    this.dlProductCSVBtn.addEventListener('click', e => this.downloadProductCSV());

    this.clearSceneBtn = document.getElementById('clear_scene_btn');
    this.clearSceneBtn.addEventListener('click', e => this.clearScene());

    this.productListDiv = document.querySelector('.product-list-panel');
    this.fieldList = [
      'name', 'asset', 'displayindex', 'texturepath', 'texturetext', 'basketblock',
      'height', 'width', 'depth',
      'x', 'y', 'z', 'parent', 'itemtitle', 'itemprice', 'itemid', 'itemdesc', 'itemcount',
      'cameraacceleration', 'camerafov', 'cameraheightoffset', 'cameramovetime', 'cameraradius', 'maxcameraspeed',
      'camerarotationoffset', 'runlength', 'introtime', 'finishdelay', 'rx', 'ry', 'rz', 'startx', 'starty', 'startz'
    ];
    this.initFieldEdit();
    this.productBySKU = {};
    this.skuOrder = [];
    this.basketSKUs = {};

    this.importFileDom = document.querySelector('.csv-import-file');
    this.importFileDom.addEventListener('change', e => this.importCSV());
    this.importCSVBtn = document.getElementById('import_csv_btn');
    this.importCSVBtn.addEventListener('click', e => this.importFileDom.click());
  }
  importCSV() {
    if (this.importFileDom.files.length > 0) {
      Papa.parse(this.importFileDom.files[0], {
        header: true,
        complete: results => {
          if (results.data) {
            let promises = [];
            for (let c = 0, l = results.data.length; c < l; c++) {
              promises.push(GUTILImportCSV.addCSVRow(results.data[c]));
            }

            return Promise.all(promises).then(r => setTimeout(() => location.reload(), 100));
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
      if (! gAPPP.a.profile.selectedWorkspace)
        return;
      gAPPP.a.clearProjectData(gAPPP.a.profile.selectedWorkspace)
        .then(r => setTimeout(() => location.reload(), 100));
    }
  }
  initFieldEdit() {
    let fDom = document.getElementById('record_field_list');

    let domHTML = '';
    for (let c = 0, l = this.fieldList.length; c < l; c++) {
      domHTML += `<div><label>${this.fieldList[c]}: <input /></label></div>&nbsp;`;
    }

    fDom.innerHTML = domHTML;
  }
  updateProductList() {
    if ( this.productData.products.length === 0)
      return;
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
    let fields = fDom.querySelectorAll('input');
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
  downloadProductCSV() {
    let productRows = [];
    let masterColumnList = {};
    for (let c = 0, l = this.productData.products.length; c < l; c++) {
      let row = this.productData.products[c].origRow;
      if (row.asset === 'block') {
        row.asset = 'displayproduct';
      }

      for (let i in row)
        masterColumnList[i] = '';

      productRows.push(row);
    }

    //push camera and product signs generation
    productRows.push(this.productData.cameraOrigRow);
    productRows.push({
      asset: 'displayfinalize'
    });

    //get a complete row list for row[0] (header list for export)
    for (let i in this.productData.cameraOrigRow)
      masterColumnList[i] = '';
    let firstRow = productRows[0];
    for (let col in masterColumnList)
      if (firstRow[col] === undefined)
        firstRow[col] = '';

    let csvResult = Papa.unparse(productRows);
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(csvResult));
    element.setAttribute('download', 'products.csv');

    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
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
