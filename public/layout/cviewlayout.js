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
      }, 100);

    };

    this.dlProductCSVBtn = document.getElementById('download_product_csv');
    this.dlProductCSVBtn.addEventListener('click', e => this.downloadProductCSV());

    this.productBySKU = {};
    this.skuOrder = [];
    this.basketSKUs = {};
  }
  downloadProductCSV() {
    let productRows = [];
    let masterColumnList = {};
    for (let c = 0, l = this.productData.products.length; c < l; c++) {
      let blockOrigRow = this.productData.products[c].blockOrigRow;

      //if product, push product info rows first
      if (blockOrigRow) {
        for (let i in blockOrigRow)
          masterColumnList[i] = '';

        productRows.push(blockOrigRow);
        productRows.push({
          asset: 'blockchild',
          name: blockOrigRow.basketblock,
          childtype: 'block',
          parent: blockOrigRow.name
        });
      }

      let row = this.productData.products[c].origRow;
      for (let i in row)
        masterColumnList[i] = '';

      productRows.push(row);
    }

    //push camera and product signs generation
    productRows.push(this.productData.cameraOrigRow);
    productRows.push({ asset: 'productsigns'});

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
