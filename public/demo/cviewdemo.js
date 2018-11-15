class cViewDemo extends bView {
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

        this.productsDisplayUpdate();
      }, 100);

    };

    this.itemButtons = [];
    this.itemButtons.push(document.querySelector('.choice-button-one'));
    this.itemButtons.push(document.querySelector('.choice-button-two'));
    this.itemButtons.push(document.querySelector('.choice-button-three'));
    this.itemButtons.push(document.querySelector('.choice-button-four'));

    this.basketClearButtons();

    document.querySelector('.choice-button-clear').addEventListener('click', () => this.basketCheckout());
    document.querySelector('.choice-button-one').addEventListener('click', e => this.basketAddItem(e));
    document.querySelector('.choice-button-two').addEventListener('click', e => this.basketAddItem(e));
    document.querySelector('.choice-button-three').addEventListener('click', e => this.basketAddItem(e));
    document.querySelector('.choice-button-four').addEventListener('click', e => this.basketAddItem(e));

    this.displayButtonPanel = document.querySelector('.user-options-panel');
    this.receiptDisplayPanel = document.querySelector('.cart-contents');
    this.collapseButton = document.querySelector('.collapse-expand');
    this.collapseButton.addEventListener('click', () => this.sceneToggleView());

    this.buttonColors = [
      'rgb(255,0,0)',
      'rgb(0,255,0)',
      'rgb(0,0,255)',
      'rgb(255,255,0)'
    ];
    this.buttonForeColors = [
      'rgb(0,0,0)',
      'rgb(0,0,0)',
      'rgb(255,255,255)',
      'rgb(0,0,0)'
    ];

    this.sceneIndex = 0;
    this.weekPickerSelect = document.getElementById('week-picker-select');
    this.canvasActionsDom = document.querySelector('.canvas-actions');
    this.cartItemTotal = document.querySelector('.cart-item-total');
    this.weekPickerSelect.addEventListener('input', () => this.sceneSelect());
    this.weekPickerSelect.value = gAPPP.workspaceCode;

    this.productBySKU = {};
    this.skuOrder = [];
    this.basketSKUs = {};
  }
  _userProfileChange() {
    super._userProfileChange();

    let basketData = gAPPP.a.profile.basketData;

    if (basketData) {
      this.basketSKUs = basketData.basketSKUs;
      this.skuOrder = basketData.skuOrder;
    } else {
      this.basketSKUs = {};
      this.skuOrder = [];
    }
    this.basketUpdateTotal().then(() => {});
  }

  basketAddItem(event) {
    let btn = event.target;
    let sku = btn.sku;

    if (!sku)
      return;

    if (this.skuOrder.indexOf(sku) === -1)
      this.skuOrder.push(sku);

    if (!this.basketSKUs[sku])
      this.basketSKUs[sku] = 1.0;
    else
      this.basketSKUs[sku] += 1.0;

    let basketData = {
      basketSKUs: this.basketSKUs,
      skuOrder: this.skuOrder
    }

    gAPPP.a.modelSets['userProfile'].commitUpdateList([{
      field: 'basketData',
      newValue: basketData
    }]);
  }
  basketRemoveItem(event) {
    let btn = event.target;
    let sku = btn.sku;
    let skuIndex = this.skuOrder.indexOf(sku);

    if (skuIndex === -1)
      return;

    this.skuOrder.splice(skuIndex, 1);

    delete  this.basketSKUs[sku];

    let basketData = {
      basketSKUs: this.basketSKUs,
      skuOrder: this.skuOrder
    }

    gAPPP.a.modelSets['userProfile'].commitUpdateList([{
      field: 'basketData',
      newValue: basketData
    }]);

    this.basketRemoveItemBlock(sku);
  }
  basketCheckout() {
    gAPPP.a.modelSets['userProfile'].commitUpdateList([{
      field: 'basketData',
      newValue: null
    }]);
  }
  basketUpdateTotal() {
    this.receiptDisplayPanel.innerHTML = '';
    let gTotal = 0.0;
    let promises = [];
    for (let c = 0, l = this.skuOrder.length; c < l; c++) {
      let sku = this.skuOrder[c];
      let count = this.basketSKUs[sku];
      let product = this.productBySKU[sku];

      if (count === 0)
        continue;

      let total = count * product.price;
      let l1 = product.title + ' $' + total.toFixed(2);
      let l2 = count.toString() + ' @ ' + product.desc;
      gTotal += total;
      let template = `<div class="cart-item">
        <button class="cart-item-remove">X</button>
        <div class="cart-item-description">${l1}</div>
        <br>
        <div class="cart-item-detail">${l2}</div>
      </div>`;

      let cartItem = document.createElement('div');
      cartItem.innerHTML = template;
      this.receiptDisplayPanel.appendChild(cartItem);
      let removeDom = cartItem.querySelector('.cart-item-remove');
      removeDom.sku = sku;
      removeDom.addEventListener('click', e => this.basketRemoveItem(e));
    }

    this.cartItemTotal.innerHTML = '$' + gTotal.toFixed(2);


    for (let d = 0, l = this.skuOrder.length; d < l; d++)
      promises.push(this.basketAddItemBlock(this.skuOrder[d], d));

    return Promise.all(promises);
  }
  basketClearButtons() {
    for (let c = 0, l = this.itemButtons.length; c < l; c++) {
      this.itemButtons[c].innerHTML = '&nbsp;';
    }
  }
  basketAddItemBlock(sku, index) {
    let pos = GUTILImportCSV.basketPosition(index);
    let product = this.productBySKU[sku];
    if (!product)
      return;

    let basketBlock = product.blockRef.blockData.basketBlock;

    let basketCart = this.rootBlock._findBestTargetObject(`block:basketcart`);
    let existingItemBlock = basketCart._findBestTargetObject(`block:${basketBlock}`);

    if (existingItemBlock !== null) {
      let frames = existingItemBlock.framesHelper.framesStash;
      let frameIds = [];
      for (let i in frames)
        frameIds.push(i);

      return gAPPP.a.modelSets['frame'].commitUpdateList([{
        field: 'positionX',
        newValue: pos.x.toString()
      },{
        field: 'positionY',
        newValue: pos.y.toString()
      },{
        field: 'positionZ',
        newValue: pos.z.toString()
      }], frameIds[0]);
    }
  }
  basketRemoveItemBlock(sku) {
    let product = this.productBySKU[sku];
    let basketBlock = product.blockRef.blockData.basketBlock;

    let basketCart = this.rootBlock._findBestTargetObject(`block:basketcart`);
    let existingItemBlock = basketCart._findBestTargetObject(`block:${basketBlock}`);
    if (existingItemBlock !== null) {
      let frames = existingItemBlock.framesHelper.framesStash;
      let frameIds = [];
      for (let i in frames)
        frameIds.push(i);

      return gAPPP.a.modelSets['frame'].commitUpdateList([{
        field: 'positionY',
        newValue: "-50"
      }], frameIds[0]);
    }
  }
  basketRemoveAllItems() {
    for (let c = 0, l = this.products.length; c < l; c++)
      this.basketRemoveItemBlock(this.products[c].blockRef.blockData.itemId);
  }

  sceneSelect() {
    let projCode = this.weekPickerSelect.value;

    if (projCode === 'About') {
      let anchor = document.createElement('a');
      anchor.setAttribute('href', '/demo/about.html');
      anchor.setAttribute('target', '_blank');
      document.body.appendChild(anchor)
      anchor.click();
      document.body.removeChild(anchor);
      this.weekPickerSelect.selectedIndex = this.sceneIndex;
      return;
    }

    if (projCode === 'Options') {
      this.weekPickerSelect.selectedIndex = this.sceneIndex;
      if (this.optionsShown) {
        this.optionsShown = false;
        this.canvasActionsDom.classList.remove('canvas-actions-shown');
      } else {
        this.optionsShown = true;
        this.canvasActionsDom.classList.add('canvas-actions-shown');
      }

      return;
    }

    this.sceneIndex = this.weekPickerSelect.selectedIndex;
    let path = location.origin + location.pathname + '?z=' + projCode;
    window.location = path;
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
  productsDisplayUpdate() {
    let productShown = [];
    let currentElapsed = this.canvasHelper.timeE;

    if (this.updateDisplay)
      return;

    this.updateDisplay = true;
    for (let c = 0; c < this.products.length; c++) {
      let product = this.products[c];
      let started = false;
      if (product.startShowTime <= currentElapsed)
        started = true;

      let ended = true;
      if (currentElapsed <= product.endShowTime)
        ended = false;

      productShown.push(started && !ended);
    }
    this.productsShown = productShown;

    this._productsUpdateButtons();

    this.updateDisplay = false;
    clearTimeout(this.updateProductsTimeout);
    this.updateProductsTimeout = setTimeout(() => {
      this.productsDisplayUpdate();
    }, 100);
  }
  _productsUpdateButtons() {
    this.itemButtons[0].style.display = 'none';
    this.itemButtons[0].sku = '';
    this.itemButtons[1].style.display = 'none';
    this.itemButtons[1].sku = '';
    this.itemButtons[2].style.display = 'none';
    this.itemButtons[2].sku = '';
    this.itemButtons[3].style.display = 'none';
    this.itemButtons[3].sku = '';

    for (let c = 0, l = this.productsShown.length; c < l; c++) {
      if (this.productsShown[c]) {
        let product = this.products[c];
        let btn = this.itemButtons[product.colorIndex];
        btn.innerHTML = product.desc + ' ' + product.price.toString();
        btn.sku = product.itemId;
        btn.style.display = 'inline-block';
      }
    }
  }
}
