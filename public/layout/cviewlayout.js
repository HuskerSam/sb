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

    let t = document.querySelector('#demo-layout-panel');
    let b = document.querySelector('.main-canvas-wrapper');
    this.splitInstance = window.Split([b, t], {
      sizes: [50, 50],
      gutterSize: 12,
      direction: 'horizontal',
      onDragEnd: () => gAPPP.resize(),
      onDrag: () => gAPPP.resize()
    });

    this.dlProductCSVBtn = document.getElementById('download_product_csv');
    this.dlProductCSVBtn.addEventListener('click', e => this.downloadProductCSV());

    this.productListDiv = document.querySelector('.product-list-panel');
    this.fieldList = [
      'name', 'asset', 'displayindex', 'image', 'texturetext'
    ];
    this.initFieldEdit();
    this.productBySKU = {};
    this.skuOrder = [];
    this.basketSKUs = {};
  }
  initFieldEdit() {
    let fDom = document.getElementById('record_field_list');

    let domHTML = '';
    for (let c = 0, l = this.fieldList.length; c < l; c++) {
      domHTML += `<label>${this.fieldList[c]}: <input /></label><br>`;
    }

    fDom.innerHTML = domHTML;
  }
  updateProductList() {
    let productListHTML = '';
    for (let c = 0, l = this.productData.products.length; c < l; c++) {
      let origRow = this.productData.products[c].origRow;
      let blockOrigRow = this.productData.products[c].blockOrigRow;
      let row = origRow;

      if (blockOrigRow)
        row = blockOrigRow;

      let displayIndex = row.displayindex;
      let itemType = 'text';
      let desc = row.texturetext;
      let xyz = `${row.x},${row.y},${row.z}`;

      if (row.asset === 'block') {
        displayIndex = origRow.displayindex;
        itemType = 'product';
        desc = row.itemtitle;
        xyz = `${origRow.x},${origRow.y},${origRow.z}`;
      }

      let rowH = `<td>${row.name}</td>`;
      rowH += `<td>${itemType}</td>`;
      rowH += `<td>${displayIndex}</td>`;
      rowH += `<td>${desc}</td>`;
      rowH += `<td>${row.basketblock}</td>`;
      rowH += `<td>${xyz}</td>`;
      rowH += `<td><button>vv</button><button>x</button></td>`;

      productListHTML += `<tr>${rowH}</tr>`;
    }

    this.productListDiv.innerHTML = `<table style="width:100%">` +
      `<tr><th>Name</th><th>Type</th><th>Index</th><th>Desc</th><th>basketblock</th><th>x,y,z</th><th></th></tr>` +
      `${productListHTML}</table>`;
  }
  downloadProductCSV() {
    let productRows = [];
    let masterColumnList = {};
    for (let c = 0, l = this.productData.products.length; c < l; c++) {
      let blockOrigRow = this.productData.products[c].blockOrigRow;

      let row = this.productData.products[c].origRow;
      if (row.asset === 'blockchild'){
        row = blockOrigRow;
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
}
