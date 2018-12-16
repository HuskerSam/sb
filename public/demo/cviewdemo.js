class cViewDemo extends bView {
  constructor() {
    super();
    this.canvasHelper.cameraShownCallback = () => {
      this._cameraShown();
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

    this.canvasActionsDom = document.querySelector('.canvas-actions');
    this.cartItemTotal = document.querySelector('.cart-item-total');
    this.workplacesSelect = document.querySelector('#workspaces-select');
    this.workplacesSelect.addEventListener('input', e => this.sceneSelect());
    this.productBySKU = {};
    this.skuOrder = [];
    this.basketSKUs = {};
    this.sceneIndex = 0;

  }
  _cameraShown() {
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

      let option = document.createElement("option");
      option.text = 'Options';
      option.value = 'Options';
      this.workplacesSelect.add(option);

      option = document.createElement("option");
      option.text = 'About';
      option.value = 'About';
      this.workplacesSelect.add(option);

      this.sceneIndex = this.workplacesSelect.selectedIndex;
      this.productsDisplayUpdate();
    }, 100);
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

    delete this.basketSKUs[sku];

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
        <img src="${product.itemImage}" class="button-list-image">
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

    for (let prodCtr = 0; prodCtr < this.products.length; prodCtr++) {
      let p = this.products[prodCtr];

      if (!p.itemId)
        continue;

      let itemShownIndex = this.skuOrder.indexOf(p.blockRef.blockData.itemId);

      if (itemShownIndex > -1) {
        promises.push(this.basketAddItemBlock(this.skuOrder[itemShownIndex], itemShownIndex));
      } else {
        promises.push(this.basketRemoveItemBlock(p.blockRef.blockData.itemId));
      }
    }

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

      let existingValues = gAPPP.a.modelSets['frame'].fireDataValuesByKey[frameIds[0]];

      if (existingValues) {
        if (existingValues.positionX === pos.x.toString() &&
          existingValues.positionY === pos.y.toString() &&
          existingValues.positionZ === pos.z.toString())
          return Promise.resolve();
      }

      return gAPPP.a.modelSets['frame'].commitUpdateList([{
        field: 'positionX',
        newValue: pos.x.toString()
      }, {
        field: 'positionY',
        newValue: pos.y.toString()
      }, {
        field: 'positionZ',
        newValue: pos.z.toString()
      }], frameIds[0]);
    }

    return Promise.resolve();
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

      let existingValues = gAPPP.a.modelSets['frame'].fireDataValuesByKey[frameIds[0]];
      if (existingValues) {
        if (existingValues.positionY === '-50')
          return Promise.resolve();
      }

      return gAPPP.a.modelSets['frame'].commitUpdateList([{
        field: 'positionY',
        newValue: "-50"
      }], frameIds[0]);
    }

    return Promise.resolve();
  }
  basketRemoveAllItems() {
    for (let c = 0, l = this.products.length; c < l; c++)
      if (this.products[c].itemId)
        this.basketRemoveItemBlock(this.products[c].blockRef.blockData.itemId);
  }

  sceneSelect() {
    let projCode = this.workplacesSelect.value;

    if (projCode === 'About') {
      let anchor = document.createElement('a');
      anchor.setAttribute('href', '/demo/about.html');
      anchor.setAttribute('target', '_blank');
      document.body.appendChild(anchor)
      anchor.click();
      document.body.removeChild(anchor);
      this.workplacesSelect.selectedIndex = this.sceneIndex;
      return;
    }

    if (projCode === 'Options') {
      this.workplacesSelect.selectedIndex = this.sceneIndex;
      if (this.optionsShown) {
        this.optionsShown = false;
        this.canvasActionsDom.classList.remove('canvas-actions-shown');
      } else {
        this.optionsShown = true;
        this.canvasActionsDom.classList.add('canvas-actions-shown');
      }

      return;
    }

    this.sceneIndex = this.workplacesSelect.selectedIndex;
    this.selectProject();
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
    let btnsShown = [
      false, false, false, false
    ];

    for (let c = 0, l = this.productsShown.length; c < l; c++) {
      if (this.productsShown[c]) {
        let product = this.products[c];
        if (!this.products[c].itemId)
          continue;
        let btn = this.itemButtons[product.colorIndex];
        let btnHtml =  `<img src="${product.itemImage}" class="button-list-image">` +
                    '<span class="expanded">' + product.title + '<br></span>' +  product.desc.toString() + '</span>';

        if (btn.innerHTMLStash !== btnHtml) {
          btn.innerHTMLStash = btnHtml;
          btn.innerHTML = btnHtml;
        }
        btn.sku = product.itemId;
        btn.style.display = 'inline-block';
        btnsShown[product.colorIndex] = true;
      }
    }

    for (let d = 0, dl = btnsShown.length; d < dl; d++)
      if (!btnsShown[d]) {
        this.itemButtons[d].style.display = 'none';
        this.itemButtons[d].sku = '';
      }
  }
}
